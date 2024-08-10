import fs from "fs";

import { program } from "commander";
import pino from "pino";
import pretty from "pino-pretty";

import version from "../src/version.js";
import { getDB } from "../src/db.js";
import ky from "ky";

import { readChunk } from "read-chunk";
import imageType, { minimumBytes } from "image-type";

const parseCLIArgs = () => {
  program
    .version(version)
    .option("--db-path <path>", "Path to db file")
    .option("--quiet", "Quiet mode: disable all logging", false)
    .parse(process.argv);
  const { dbPath, quiet } = program.opts();
  return { dbPath, quiet };
};

async function main() {
  // get config
  const { dbPath, quiet } = parseCLIArgs();

  // set up logging
  let stream = undefined;
  if (quiet === true) {
    stream = fs.createWriteStream("/dev/null");
  } else {
    stream = pretty({
      colorize: true,
      ignore: "hostname,pid",
    });
  }
  const logLevel = "debug";
  const log = pino({ level: logLevel }, stream);

  if (!dbPath) {
    log.fatal("DB path empty. Provide db path via `--db-path` cli arg");
  } else {
    log.info(`DB path: ${dbPath}`);
  }

  // for init db, we don't skip any db checks
  const db = await getDB({ dbPath, skipDbChecks: true, logger: log });
  const conn = await db.connect();

  const writeToFile = (res, filePath) => {
    const f = fs.createWriteStream(filePath);
    res.body.pipe(f);
    return new Promise((resolve, reject) => {
      res.body.on("error", reject);
      f.on("end", resolve);
    });
  };

  // set up schema
  let cs = await conn.all("select id, image, image_filename from character");
  for (let { id, image: imageURL, image_filename } of cs) {
    try {
      if (image_filename) {
        log.info(
          `Already downloaded image for character ${id}: ${image_filename}`
        );
      } else {
        const blob = await ky.get(imageURL).then((res) => res.blob());
        const buf = await blob.arrayBuffer();
        const { ext } = await imageType(buf);
        const filename = `${id}.${ext}`;
        const filePath = `images/${filename}`;
        fs.writeFileSync(filePath, Buffer.from(buf));
        conn.exec(
          `update character set image_filename = '${filename}' where id = ${id}`
        );
        log.info(`Download image for character ${id}: ${filename}`);
      }
    } catch (err) {
      log.error(err);
    }
  }
}

main();
