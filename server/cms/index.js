import http from "http";
import path from "path";
import dotenv from "dotenv";
import next from "next";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(REPO_ROOT, "configuration", ".env"), override: false });
dotenv.config({ path: path.join(REPO_ROOT, "configuration", ".env.local"), override: true });

const isProdFlag = process.argv.includes("--prod");
const isDevFlag = process.argv.includes("--dev");
const dev = isDevFlag || (!isProdFlag && process.env.NODE_ENV !== "production");
const port = Number(process.env.CMS_PORT || process.env.PORT || 3000);

/**
 * Executes the log helper used by the cms module.
 * @param {Object} message The message value provides an input used by the cms module.
 * @returns {void} Does not return a value.
 */
function log(message) {
  console.log(`[cms] ${message}`);
}

/**
 * Executes the main helper used by the cms module.
 * @returns {Promise<void>} Resolves when the cms operation completes.
 */
async function main() {
  const app = next({
    dev,
    dir: __dirname,
    turbopack: false,
    webpack: true
  });
  const handler = app.getRequestHandler();
  await app.prepare();

  const server = http.createServer((req, res) => handler(req, res));
  server.listen(port, () => {
    log(`Next app listening on ${port} (dev=${dev})`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
