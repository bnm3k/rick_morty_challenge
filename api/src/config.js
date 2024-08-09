import fs from "fs";

import pino from "pino";
import { program } from "commander";
import version from "./version.js";

// default config
export const defaultConfig = {
  skipDbChecks: false, // before skipping, check that file is present
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
  devConfig.skipDbChecks = true;

  return devConfig;
}

export function applyCLIConfig(config) {
  program
    .version(version)
    .option("--dev", "Sets dev mode to true, NOT for live production")
    .option("-p, --port <port>", "Port for server address")
    .option("-h, --host <host>", "Host for server address")
    .option("--db-path <path>", "Path to db file")
    .option("--skip-db-checks", "Skip check for updates on Rick & Morty API")
    .option("--quiet", "Quiet mode: disable all logging", false)
    .parse(process.argv);
  const cli = program.opts();
  let newConfig = Object.assign({}, config);
  if (cli.dev) {
    newConfig = applyDevConfig(newConfig);
  }
  // keys shared by both config obj and cli
  const directKeys = ["port", "host", "dbPath", "skipDbChecks"];
  for (const key of directKeys) {
    if (cli[key]) {
      newConfig[key] = cli[key];
    }
  }

  // if logger hasn't been set to pretty print (for dev mode), we set a boolean
  // value and fastify will handle initializing either the null logger (if false)
  // or the prod logger (if true). By defaullt, is true
  if (cli.quiet) {
    newConfig.logger = false;
  }

  return newConfig;
}

export function getConfig() {
  let config = defaultConfig;
  config = applyCLIConfig(config);
  return config;
}
