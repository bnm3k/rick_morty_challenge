import Fastify from "fastify";

import { getDB } from "./db.js";
import routes from "./routes.js";
import { defaultConfig, withDevOptions } from "./config.js";

const main = async () => {
  // config
  const dev = true; // TODO, set option from CLI
  let config = defaultConfig;
  if (dev) {
    config = withDevOptions(config);
  }

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
