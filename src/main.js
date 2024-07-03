import { getDB } from "./db.js";
const main = async () => {
  // config
  const config = {
    skipDBChecks: false,
    dbPath: "app.db",
  };
  await getDB(config);
};

main();
