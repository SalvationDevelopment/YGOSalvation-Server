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

async function waitForRankings(baseUrl, timeoutMs = 30000) {
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

  throw new Error(`CMS rankings endpoint was not reachable at ${baseUrl}: ${lastError?.message || "unknown error"}`);
}

async function isHealthy(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/rankings`, { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}

test("cms rankings endpoint responds with a JSON rankings array", async (t) => {
  const repoRoot = path.resolve(__dirname, "../../..");
  const fallbackBaseUrl = process.env.CMS_BASE_URL || "http://127.0.0.1:3000";
  const port = await getFreePort();
  const spawnedBaseUrl = `http://127.0.0.1:${port}`;

  let child = null;
  let stdout = "";
  let stderr = "";
  let exitInfo = null;
  let baseUrl = null;

  if (await isHealthy(fallbackBaseUrl)) {
    baseUrl = fallbackBaseUrl;
  } else {
    child = spawn(
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
      if (!child || exitInfo) {
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
      await waitForRankings(spawnedBaseUrl);
      baseUrl = spawnedBaseUrl;
    } catch (error) {
      if (exitInfo && /Unable to acquire lock/i.test(stderr) && await isHealthy(fallbackBaseUrl)) {
        baseUrl = fallbackBaseUrl;
      } else {
        throw error;
      }
    }
  }

  const response = await waitForRankings(baseUrl);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type")?.includes("application/json"), true);

  const rankings = await response.json();
  assert.equal(Array.isArray(rankings), true);

  for (const entry of rankings) {
    assert.equal(typeof entry.username, "string");
    assert.equal(typeof entry.points, "number");
    assert.equal(typeof entry.elo, "number");
  }

  if (child) {
    if (!exitInfo) {
      child.kill("SIGTERM");
      await wait(1000);
    }
    if (stderr.trim()) {
      void stdout;
    }
  }
});
// Run with: npm run test:integration
