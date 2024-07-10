// default config
export const defaultConfig = {
  skipDBChecks: false, // before skipping, check that file is present
  dbPath: "app.db",
  port: 3000,
  host: "localhost",
  logger: true,
};

export function withDevOptions(config) {
  let devConfig = Object.assign({}, config);

  // use pretty printing of logs while in dev mode
  const devLevel = "debug";
  devConfig.logger = {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        minimumLevel: "info",
      },
    },
  };

  // skip DB checks on startup while in dev mode, assume the DB is already
  // populated and configured
  devConfig.skipDBChecks = true;

  return devConfig;
}
