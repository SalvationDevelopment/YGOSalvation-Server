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
      const response = await fetch(`${baseUrl}/api/websocket-port`, {
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        return response;
      }

      lastError = new Error(`Unexpected status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await wait(1000);
  }

  throw new Error(`Server did not become healthy at ${baseUrl}: ${lastError?.message || "unknown error"}`);
}

test("server boots and serves the websocket port endpoint", async (t) => {
  const repoRoot = path.resolve(__dirname, "../..");
  const httpPort = await getFreePort();
  const tcpPort = await getFreePort();
  const wsPort = await getFreePort();
  const ircPort = await getFreePort();
  const baseUrl = `http://127.0.0.1:${httpPort}`;
  const child = spawn(
    process.execPath,
    [path.join(repoRoot, "server", "index.js")],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        NODE_ENV: "production",
        HTTP_PORT: String(httpPort),
        IRC_PORT: String(ircPort),
        TCP_PORT: String(tcpPort),
        WS_PORT: String(wsPort)
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
    const response = await waitForHealth(baseUrl, 30000);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(typeof payload.port, "number");
    assert.ok(payload.port > 0);
    assert.equal(payload.port, wsPort);
  } catch (error) {
    if (exitInfo) {
      throw new Error(
        `Server exited before it became healthy. code=${exitInfo.code} signal=${exitInfo.signal}\nSTDERR:\n${stderr.trim()}\nSTDOUT:\n${stdout.trim()}`,
        { cause: error }
      );
    }

    throw error;
  } finally {
    if (!exitInfo) {
      child.kill("SIGTERM");
      await wait(1000);
    }
  }
});
// Run with: npm run test:boot
