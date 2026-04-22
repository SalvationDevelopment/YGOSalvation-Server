const assert = require("node:assert/strict");
const http = require("node:http");
const net = require("node:net");
const { EventEmitter } = require("node:events");
const test = require("node:test");
const { loginAdmin, requestJson, resolveCmsContext } = require("./test-utils");

function createJsonServer(routes) {
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const bodyText = Buffer.concat(chunks).toString("utf8");
    const body = bodyText ? JSON.parse(bodyText) : undefined;
    const key = `${req.method} ${req.url}`;
    const handler = routes[key];

    if (!handler) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "not found" }));
      return;
    }

    const result = await handler({ req, body });
    res.writeHead(result.status ?? 200, {
      "Content-Type": "application/json",
      ...(result.headers || {})
    });
    res.end(result.body === undefined ? "" : JSON.stringify(result.body));
  });

  return {
    server,
    async listen(port = 0) {
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, "127.0.0.1", resolve);
      });

      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Failed to resolve test server address");
      }

      return `http://127.0.0.1:${address.port}`;
    },
    async close() {
      await new Promise((resolve) => server.close(resolve));
    }
  };
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

function createMockChild() {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.killSignals = [];
  child.kill = (signal) => {
    child.killSignals.push(signal);
    process.nextTick(() => {
      child.emit("exit", 0, signal);
    });
    return true;
  };

  return child;
}

function loadTestUtilsWithSpawn(spawnImpl) {
  const childProcess = require("node:child_process");
  const testUtilsPath = require.resolve("./test-utils");
  const originalSpawn = childProcess.spawn;
  childProcess.spawn = spawnImpl;

  delete require.cache[testUtilsPath];
  const freshModule = require("./test-utils");

  return {
    ...freshModule,
    restore() {
      childProcess.spawn = originalSpawn;
      delete require.cache[testUtilsPath];
    }
  };
}

test("requestJson sends JSON bodies and parses JSON responses", async (t) => {
  const requests = [];
  const fixture = createJsonServer({
    "POST /api/example": ({ req, body }) => {
      requests.push({
        contentType: req.headers["content-type"],
        body
      });
      return {
        status: 201,
        body: {
          ok: true,
          echo: body
        }
      };
    }
  });

  const baseUrl = await fixture.listen();
  t.after(() => fixture.close());

  const { response, data } = await requestJson(baseUrl, "/api/example", {
    method: "POST",
    body: { slug: "burning-abyss" }
  });

  assert.equal(response.status, 201);
  assert.deepEqual(data, {
    ok: true,
    echo: { slug: "burning-abyss" }
  });
  assert.equal(requests[0].contentType, "application/json");
  assert.deepEqual(requests[0].body, { slug: "burning-abyss" });
});

test("loginAdmin returns the JWT from a successful auth response", async (t) => {
  const fixture = createJsonServer({
    "POST /api/auth/local": ({ body }) => {
      assert.equal(typeof body.identifier, "string");
      assert.equal(typeof body.password, "string");
      return {
        body: {
          jwt: "jwt-token",
          user: { username: "admin" }
        }
      };
    }
  });

  const baseUrl = await fixture.listen();
  t.after(() => fixture.close());

  const jwt = await loginAdmin(baseUrl);
  assert.equal(jwt, "jwt-token");
});

test("loginAdmin throws when auth does not return a JWT", async (t) => {
  const fixture = createJsonServer({
    "POST /api/auth/local": () => ({
      status: 401,
      body: { error: "invalid credentials" }
    })
  });

  const baseUrl = await fixture.listen();
  t.after(() => fixture.close());

  await assert.rejects(
    () => loginAdmin(baseUrl),
    /Admin login failed: 401/
  );
});

test("resolveCmsContext reuses an already healthy CMS base URL", async (t) => {
  const fixture = createJsonServer({
    "GET /api/rankings": () => ({
      body: []
    })
  });

  const baseUrl = await fixture.listen();
  t.after(() => fixture.close());

  const originalBaseUrl = process.env.CMS_BASE_URL;
  process.env.CMS_BASE_URL = baseUrl;

  t.after(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.CMS_BASE_URL;
      return;
    }
    process.env.CMS_BASE_URL = originalBaseUrl;
  });

  const context = await resolveCmsContext();
  t.after(() => context.cleanup());

  assert.equal(context.baseUrl, baseUrl);
  assert.equal(context.child, null);
});

test("resolveCmsContext returns the spawned CMS when it becomes healthy", async (t) => {
  const repoRoot = require("node:path").resolve(__dirname, "../../..");
  const fallbackPort = await getFreePort();
  const fallbackBaseUrl = `http://127.0.0.1:${fallbackPort}`;
  let rankingsRequests = 0;
  const fallbackFixture = createJsonServer({
    "GET /api/rankings": () => {
      rankingsRequests += 1;
      return rankingsRequests === 1
        ? {
            status: 503,
            body: { error: "warming up" }
          }
        : {
            body: []
          };
    }
  });

  const originalBaseUrl = process.env.CMS_BASE_URL;
  process.env.CMS_BASE_URL = fallbackBaseUrl;

  const spawnedFixture = createJsonServer({
    "GET /api/rankings": () => ({
      body: [{ id: 1 }]
    })
  });

  const spawnCalls = [];
  const { resolveCmsContext: mockedResolveCmsContext, restore } = loadTestUtilsWithSpawn(
    (command, args, options) => {
      spawnCalls.push({ command, args, options });

      const port = Number(options.env.PORT);
      const child = createMockChild();
      spawnedFixture.listen(port).catch((error) => {
        process.nextTick(() => child.stderr.emit("data", Buffer.from(String(error.message))));
      });

      return child;
    }
  );

  t.after(() => {
    restore();
    if (originalBaseUrl === undefined) {
      delete process.env.CMS_BASE_URL;
    } else {
      process.env.CMS_BASE_URL = originalBaseUrl;
    }
    return spawnedFixture.close();
  });
  t.after(() => fallbackFixture.close());

  const context = await mockedResolveCmsContext();
  assert.equal(context.baseUrl, `http://127.0.0.1:${spawnCalls[0].options.env.PORT}`);
  assert.equal(context.child.killSignals.length, 0);
  assert.deepEqual(spawnCalls[0].args, [require("node:path").join(repoRoot, "server", "cms", "index.js"), "--dev"]);
  assert.equal(spawnCalls[0].options.cwd, repoRoot);
  assert.equal(spawnCalls[0].options.env.NODE_ENV, "development");
  assert.equal(spawnCalls[0].options.env.PORT, spawnCalls[0].options.env.CMS_PORT);

  await context.cleanup();
  assert.deepEqual(context.child.killSignals, ["SIGTERM"]);
});

test("resolveCmsContext falls back to the healthy CMS when spawn exits with a lock error", async (t) => {
  const fallbackPort = await getFreePort();
  const fallbackBaseUrl = `http://127.0.0.1:${fallbackPort}`;
  let rankingsRequests = 0;
  const fallbackFixture = createJsonServer({
    "GET /api/rankings": () => {
      rankingsRequests += 1;
      return rankingsRequests === 1
        ? {
            status: 503,
            body: { error: "warming up" }
          }
        : {
            body: []
          };
    }
  });
  await fallbackFixture.listen(fallbackPort);

  const originalBaseUrl = process.env.CMS_BASE_URL;
  process.env.CMS_BASE_URL = fallbackBaseUrl;

  const originalDateNow = Date.now;
  const originalSetTimeout = global.setTimeout;
  const startedAt = originalDateNow();
  let dateNowCalls = 0;

  Date.now = () => {
    dateNowCalls += 1;
    return dateNowCalls <= 2 ? startedAt : startedAt + 31001;
  };
  global.setTimeout = (callback, delay, ...args) => {
    if (delay === 1000) {
      callback(...args);
      return { ref() {}, unref() {}, hasRef() { return false; } };
    }

    return originalSetTimeout(callback, delay, ...args);
  };

  t.after(() => {
    Date.now = originalDateNow;
    global.setTimeout = originalSetTimeout;
    if (originalBaseUrl === undefined) {
      delete process.env.CMS_BASE_URL;
    } else {
      process.env.CMS_BASE_URL = originalBaseUrl;
    }
    return fallbackFixture.close();
  });

  const { resolveCmsContext: mockedResolveCmsContext, restore } = loadTestUtilsWithSpawn(() => {
    const child = createMockChild();
    process.nextTick(() => {
      child.stderr.emit("data", Buffer.from("Unable to acquire lock"));
      child.emit("exit", 1, null);
    });
    return child;
  });

  t.after(() => restore());

  const context = await mockedResolveCmsContext();

  assert.equal(context.baseUrl, fallbackBaseUrl);
  assert.equal(context.child, null);
});
// Run with: npm run test:integration
