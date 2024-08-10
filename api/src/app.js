import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";

import { getDB } from "./db.js";
import routes from "./routes.js";
import { getConfig } from "./config.js";
import { setupAPIDocs } from "./docs.js";

import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

const main = async () => {
  // config
  let config = getConfig();

  const app = Fastify({ logger: config.logger });
  await app.register(cors, { origin: true });
  await app.register(fastifyStatic, {
    root: join(projectRoot, "public"),
    prefix: "/public/",
  });

  const { dbPath, skipDbChecks } = config;
  const db = await getDB({ dbPath, skipDbChecks, log: app.log });
  app.decorate("db", db);
  app.decorate("config", config);

  await setupAPIDocs(app);

  app.register(routes);

  await app.ready();

  const { port, host } = config;
  app.listen({ port, host }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.debug(`Dev mode: ${config.dev}`);
  });
};

main();
