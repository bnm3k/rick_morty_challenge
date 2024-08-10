import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

const version = JSON.parse(
  fs.readFileSync(join(projectRoot, "package.json"))
).version;
export default version;
