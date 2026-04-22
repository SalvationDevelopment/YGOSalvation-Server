import fs from "fs";
import path from "path";
import dotenv from "dotenv";

/**
 * Loads shared env from the repo configuration directory.
 * @returns {void} Does not return a value.
 */
export function loadRootEnv() {
  const cwd = process.cwd();
  const candidateRoots = [
    cwd,
    path.resolve(cwd, ".."),
    path.resolve(cwd, "..", ".."),
    path.resolve(cwd, "server", "cms"),
  ];

  const envPaths = [];
  for (const root of candidateRoots) {
    envPaths.push(path.join(root, "configuration", ".env"));
    envPaths.push(path.join(root, "configuration", ".env.local"));
  }

  const seen = new Set();
  for (const envPath of envPaths) {
    if (seen.has(envPath) || !fs.existsSync(envPath)) {
      continue;
    }
    seen.add(envPath);
    dotenv.config({
      path: envPath,
      override: envPath.endsWith(".env.local"),
    });
  }
}

loadRootEnv();
