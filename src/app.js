import Fastify from "fastify";

import { getDB } from "./db.js";
import routes from "./routes.js";

const main = async () => {
  // config
  const config = {
    skipDBChecks: true, // before skipping, check that file is present
    dbPath: "app.db",
    port: 3000,
    host: "localhost",
    logger: false,
  };

  const db = await getDB(config);

  const app = Fastify({ logger: config.logger });
  app.decorate("db", db);
  app.decorate("config", config);

  app.register(routes);

  const { port, host } = config;
  app.listen({ port, host }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
};

main();
