import { program } from "commander";

// default config
export const defaultConfig = {
  skipDBChecks: false, // before skipping, check that file is present
  dbPath: "app.db",
  port: 3000,
  host: "localhost",
  logger: true,
  dev: false,
};

export function applyDevConfig(config) {
  let devConfig = Object.assign({}, config);
  devConfig.dev = true;

  // use pretty printing of logs while in dev mode
  const devLevel = "debug";
  devConfig.logger = {
    level: devLevel,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        minimumLevel: devLevel,
      },
    },
  };

  // skip DB checks on startup while in dev mode, assume the DB is already
  // populated and configured
  devConfig.skipDBChecks = true;

  return devConfig;
}

export function applyCLIConfig(config) {
  program
    .option("--dev", "Sets dev mode to true, NOT for live production")
    .option("-p, --port <port>", "Port for server address")
    .parse(process.argv);
  const cli = program.opts();
  let newConfig = Object.assign({}, config);
  if (cli.dev) {
    newConfig = applyDevConfig(newConfig);
  }
  if (cli.port) {
    newConfig.port = cli.port;
  }
  return newConfig;
}

export function getConfig() {
  let config = defaultConfig;
  config = applyCLIConfig(config);
  return config;
}
