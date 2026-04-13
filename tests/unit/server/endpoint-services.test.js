const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const runtimeRequire = eval("require");

const endpointModulePath = path.resolve(process.cwd(), "server", "routes", "endpoint_services.js");
const httpModulePath = path.resolve(process.cwd(), "server", "lib", "http.js");
const loadSharedEnvPath = path.resolve(process.cwd(), "server", "lib", "load-shared-env.js");
const usersModulePath = path.resolve(process.cwd(), "server", "routes", "endpoint_users.js");

function setMockModule(modulePath, exports) {
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports
  };
}

function resetModuleCache() {
  delete require.cache[endpointModulePath];
  delete require.cache[httpModulePath];
  delete require.cache[loadSharedEnvPath];
  delete require.cache[usersModulePath];
}

function createAppRecorder() {
  const routes = {
    get: new Map(),
    post: new Map()
  };

  return {
    routes,
    get(pathname, handler) {
      routes.get.set(pathname, handler);
    },
    post(pathname, handler) {
      routes.post.set(pathname, handler);
    }
  };
}

function createResponseRecorder() {
  return {
    statusCode: 200,
    payload: undefined,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.payload = body;
      return this;
    },
    set(name, value) {
      this.headers[name] = value;
      return this;
    }
  };
}

function loadEndpointServices({
  requestImpl,
  validateImpl = (_attempt, _data, callback) => callback(null, true, { jwt: "admin-jwt" })
}) {
  resetModuleCache();
  setMockModule(loadSharedEnvPath, {});
  setMockModule(httpModulePath, { request: requestImpl });
  setMockModule(usersModulePath, { validate: validateImpl });

  const originalSetTimeout = global.setTimeout;
  const originalSetInterval = global.setInterval;
  const originalAdminUsername = process.env.ADMIN_SERVER_USERNAME;
  const originalAdminPassword = process.env.ADMIN_SERVER_PASSWORD;
  const originalAdminUsernameFallback = process.env.ADMIN_USERNAME;
  const originalAdminPasswordFallback = process.env.ADMIN_PASSWORD;

  global.setTimeout = () => 1;
  global.setInterval = () => 1;
  process.env.ADMIN_SERVER_USERNAME = "service-admin";
  process.env.ADMIN_SERVER_PASSWORD = "service-password";
  delete process.env.ADMIN_USERNAME;
  delete process.env.ADMIN_PASSWORD;

  try {
    const moduleExports = runtimeRequire(endpointModulePath);
    return {
      ...moduleExports,
      restore() {
        global.setTimeout = originalSetTimeout;
        global.setInterval = originalSetInterval;
        if (originalAdminUsername === undefined) {
          delete process.env.ADMIN_SERVER_USERNAME;
        } else {
          process.env.ADMIN_SERVER_USERNAME = originalAdminUsername;
        }
        if (originalAdminPassword === undefined) {
          delete process.env.ADMIN_SERVER_PASSWORD;
        } else {
          process.env.ADMIN_SERVER_PASSWORD = originalAdminPassword;
        }
        if (originalAdminUsernameFallback === undefined) {
          delete process.env.ADMIN_USERNAME;
        } else {
          process.env.ADMIN_USERNAME = originalAdminUsernameFallback;
        }
        if (originalAdminPasswordFallback === undefined) {
          delete process.env.ADMIN_PASSWORD;
        } else {
          process.env.ADMIN_PASSWORD = originalAdminPasswordFallback;
        }
        resetModuleCache();
      }
    };
  } catch (error) {
    global.setTimeout = originalSetTimeout;
    global.setInterval = originalSetInterval;
    if (originalAdminUsername === undefined) {
      delete process.env.ADMIN_SERVER_USERNAME;
    } else {
      process.env.ADMIN_SERVER_USERNAME = originalAdminUsername;
    }
    if (originalAdminPassword === undefined) {
      delete process.env.ADMIN_SERVER_PASSWORD;
    } else {
      process.env.ADMIN_SERVER_PASSWORD = originalAdminPassword;
    }
    if (originalAdminUsernameFallback === undefined) {
      delete process.env.ADMIN_USERNAME;
    } else {
      process.env.ADMIN_USERNAME = originalAdminUsernameFallback;
    }
    if (originalAdminPasswordFallback === undefined) {
      delete process.env.ADMIN_PASSWORD;
    } else {
      process.env.ADMIN_PASSWORD = originalAdminPasswordFallback;
    }
    resetModuleCache();
    throw error;
  }
}

test("logDuel skips admin requests for non-ranked matches", async () => {
  const calls = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });
    return { data: {} };
  };

  const { logDuel, restore } = loadEndpointServices({ requestImpl });

  try {
    let callbackCount = 0;
    await logDuel({
      ranked: false,
      winnerID: "winner-1",
      loserID: "loser-1"
    }, () => {
      callbackCount += 1;
    });

    assert.equal(callbackCount, 1);
    assert.equal(calls.length, 0);
  } finally {
    restore();
  }
});

test("logDuel updates ranked players with adjusted Elo and points", async () => {
  const calls = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });

    if (url.endsWith("/users/winner-1") && !options.method) {
      return { data: { username: "alice", points: 5, elo: 1200 } };
    }
    if (url.endsWith("/users/loser-1") && !options.method) {
      return { data: { username: "bob", points: 2, elo: 1200 } };
    }
    if (url.endsWith("/users/winner-1") && options.method === "PUT") {
      return { data: options.body };
    }
    if (url.endsWith("/users/loser-1") && options.method === "PUT") {
      return { data: options.body };
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  const { logDuel, restore } = loadEndpointServices({ requestImpl });

  try {
    let callbackCount = 0;
    await logDuel({
      ranked: true,
      winnerID: "winner-1",
      loserID: "loser-1",
      replay: []
    }, () => {
      callbackCount += 1;
    });

    assert.equal(callbackCount, 1);
    assert.equal(calls.length, 4);
    assert.deepEqual(calls[2].options.body, { elo: 1208, points: 15 });
    assert.deepEqual(calls[3].options.body, { elo: 1193, points: 3 });
    assert.deepEqual(calls[2].options.headers, {
      Authorization: "Bearer admin-jwt",
      "Content-Type": "application/json",
      Accept: "*/*"
    });
  } finally {
    restore();
  }
});

test("logDuel still calls back when the ranking update fails", async () => {
  const requestImpl = async () => {
    throw new Error("admin server offline");
  };

  const { logDuel, restore } = loadEndpointServices({ requestImpl });

  try {
    let callbackCount = 0;
    await logDuel({
      ranked: true,
      winnerID: "winner-2",
      loserID: "loser-2"
    }, () => {
      callbackCount += 1;
    });

    assert.equal(callbackCount, 1);
  } finally {
    restore();
  }
});

test("service routes proxy news, media, contact, ranking fallback, and uploads", async () => {
  const calls = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });

    if (url.endsWith("/news?page=1&pageSize=20")) {
      return { data: { posts: [{ slug: "burning-abyss" }] } };
    }
    if (url.endsWith("/news/slug/missing-post")) {
      const error = new Error("missing");
      error.status = 404;
      error.data = { error: "Post not found" };
      throw error;
    }
    if (url.endsWith("/backgrounds?_sort=createdAt:ASC")) {
      return { data: [{ id: "bg-1" }] };
    }
    if (url.endsWith("/covers?_sort=createdAt:ASC")) {
      return { data: [{ id: "cover-1" }] };
    }
    if (url.endsWith("/contact-messages")) {
      return { data: { success: true } };
    }
    if (url.endsWith("/rankings")) {
      throw new Error("rankings unavailable");
    }
    if (url.endsWith("/users?_sort=elo:desc")) {
      return {
        data: [
          { username: "service-account", service: true, elo: 9999 },
          { username: "bob", points: 4, elo: 1300 },
          { username: "alice", points: 9, elo: 1450 }
        ]
      };
    }
    if (url.endsWith("/uploads/avatar.png")) {
      return { data: Buffer.from("png-data") };
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  const { setupEndpoints, restore } = loadEndpointServices({ requestImpl });

  try {
    const app = createAppRecorder();
    setupEndpoints(app);

    const newsRes = createResponseRecorder();
    const newsPostRes = createResponseRecorder();
    const backgroundsRes = createResponseRecorder();
    const coversRes = createResponseRecorder();
    const contactRes = createResponseRecorder();
    const rankingRes = createResponseRecorder();
    const uploadRes = createResponseRecorder();

    await app.routes.get.get("/api/news")({
      query: { page: "0", pageSize: "50" }
    }, newsRes);
    await app.routes.get.get("/api/news/:slug")({
      params: { slug: "missing-post" }
    }, newsPostRes);
    await app.routes.get.get("/backgrounds")({}, backgroundsRes);
    await app.routes.get.get("/covers")({}, coversRes);
    await app.routes.post.get("/api/contact")({
      headers: { authorization: "Bearer user-token" },
      body: { message: "hello" }
    }, contactRes);
    await app.routes.get.get("/ranking")({}, rankingRes);
    await app.routes.get.get("/uploads/*path")({
      path: "/uploads/avatar.png"
    }, uploadRes);

    assert.deepEqual(newsRes.payload, { posts: [{ slug: "burning-abyss" }] });
    assert.equal(newsPostRes.statusCode, 404);
    assert.deepEqual(newsPostRes.payload, { error: "Post not found" });
    assert.deepEqual(backgroundsRes.payload, [{ id: "bg-1" }]);
    assert.deepEqual(coversRes.payload, [{ id: "cover-1" }]);
    assert.deepEqual(contactRes.payload, { success: true });
    assert.deepEqual(rankingRes.payload, [
      { username: "alice", points: 9, elo: 1450 },
      { username: "bob", points: 4, elo: 1300 }
    ]);
    assert.deepEqual(uploadRes.payload, Buffer.from("png-data"));
    assert.equal(uploadRes.headers["Content-Type"], "image/png");
    assert.deepEqual(calls[0].options.headers, {
      Authorization: "Bearer admin-jwt"
    });
    assert.deepEqual(calls[4].options.headers, {
      Authorization: "Bearer user-token"
    });
  } finally {
    restore();
  }
});
// Run with: npm run test:unit
