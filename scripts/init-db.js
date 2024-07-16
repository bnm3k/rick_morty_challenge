import fs from "fs";

import { program } from "commander";
import pino from "pino";
import pretty from "pino-pretty";

import version from "../src/version.js";
import { getDB } from "../src/db.js";

const parseCLIArgs = () => {
  program
    .version(version)
    .option("--db-path <path>", "Path to db file")
    .option("--quiet", "Quiet mode: disable all logging", false)
    .parse(process.argv);
  const { dbPath, quiet } = program.opts();
  return { dbPath, quiet };
};

const main = async () => {
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

  if (fs.existsSync(dbPath)) {
    log.fatal(
      `Script used to initialize a new database, path at ${dbPath} exists`
    );
  }

  // for init db, we don't skip any db checks
  try {
    await getDB({ dbPath, skipDbChecks: false, logger: log });
    log.info("Init DB done");
  } catch (err) {
    // db file
    if (fs.existsSync(dbPath)) {
      fs.unlink(dbPath);
      log.info("Error occured, delete db file");
    }
    // wal file
    const walPath = `${dbPath}.wal`;
    if (fs.existsSync(walPath)) {
      fs.unlink(walPath);
      log.info("Error occured, delete db wal file");
    }
    throw err;
  }
};
main();
