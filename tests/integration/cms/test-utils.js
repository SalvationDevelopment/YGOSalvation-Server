const net = require("node:net");
const path = require("node:path");
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

async function isHealthy(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/rankings`, { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForCms(baseUrl, timeoutMs = 30000) {
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

async function requestJson(baseUrl, pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(options.body ? { "Content-Type": "application/json" } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  return { response, data };
}

async function loginAdmin(baseUrl) {
  const identifier = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || "admin";
  const password = process.env.ADMIN_PASSWORD || "Admin123!ChangeMe";
  const { response, data } = await requestJson(baseUrl, "/api/auth/local", {
    method: "POST",
    body: { identifier, password }
  });

  if (!response.ok || !data?.jwt) {
    throw new Error(`Admin login failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data.jwt;
}

async function resolveCmsContext() {
  const fallbackBaseUrl = process.env.CMS_BASE_URL || "http://127.0.0.1:3000";
  const port = await getFreePort();
  const spawnedBaseUrl = `http://127.0.0.1:${port}`;
  const repoRoot = path.resolve(__dirname, "../../..");

  if (await isHealthy(fallbackBaseUrl)) {
    return {
      baseUrl: fallbackBaseUrl,
      child: null,
      async cleanup() {}
    };
  }

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

  try {
    await waitForCms(spawnedBaseUrl);
    return {
      baseUrl: spawnedBaseUrl,
      child,
      async cleanup() {
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
      }
    };
  } catch (error) {
    if (exitInfo && /Unable to acquire lock/i.test(stderr) && await isHealthy(fallbackBaseUrl)) {
      return {
        baseUrl: fallbackBaseUrl,
        child: null,
        async cleanup() {}
      };
    }

    if (child && !exitInfo) {
      child.kill("SIGTERM");
      await wait(500);
    }

    throw error;
  }
}

module.exports = {
  loginAdmin,
  requestJson,
  resolveCmsContext
};
// Run with: npm run test:integration
