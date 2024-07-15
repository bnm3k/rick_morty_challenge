import Fastify from "fastify";

import { getDB } from "./db.js";
import routes from "./routes.js";
import { getConfig } from "./config.js";
import { setupAPIDocs } from "./docs.js";

const main = async () => {
  // config
  let config = getConfig();

  const db = await getDB(config);

  const app = Fastify({ logger: config.logger });
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
