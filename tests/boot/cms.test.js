const assert = require("node:assert/strict");
const net = require("node:net");
const path = require("node:path");
const test = require("node:test");
const { spawn } = require("node:child_process");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Failed to reserve a free port.")));
        return;
      }

      const { port } = address;
      server.close(() => resolve(port));
    });
  });
}

async function waitForHealth(baseUrl, timeoutMs = 120000) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/rankings`, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        return response;
      }

      lastError = new Error(`Unexpected status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await wait(1000);
  }

  throw new Error(`CMS did not become healthy at ${baseUrl}: ${lastError?.message || "unknown error"}`);
}

test("cms boots in dev mode and serves a health endpoint", async (t) => {
  const repoRoot = path.resolve(__dirname, "../..");
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const fallbackBaseUrl = process.env.CMS_BASE_URL || "http://127.0.0.1:3000";
  const child = spawn(
    process.execPath,
    [path.join(repoRoot, "server", "cms", "index.js"), "--dev"],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        PORT: String(port),
        CMS_PORT: String(port),
        NODE_ENV: "development"
      },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  let stdout = "";
  let stderr = "";
  let exitInfo = null;

  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  child.once("exit", (code, signal) => {
    exitInfo = { code, signal };
  });

  t.after(async () => {
    if (exitInfo) {
      return;
    }

    child.kill("SIGTERM");
    await new Promise((resolve) => {
      const timeoutId = setTimeout(resolve, 5000);
      child.once("exit", () => {
        clearTimeout(timeoutId);
        resolve();
      });
    });
  });

  try {
    let response;
    try {
      response = await waitForHealth(baseUrl, 30000);
    } catch (error) {
      if (exitInfo && /Unable to acquire lock/i.test(stderr)) {
        response = await waitForHealth(fallbackBaseUrl, 30000);
      } else {
        throw error;
      }
    }

    assert.equal(response.status, 200);
    assert.match(await response.text(), /./);
  } finally {
    if (!exitInfo) {
      child.kill("SIGTERM");
      await wait(1000);
    }
  }
});
// Run with: npm run test:boot
