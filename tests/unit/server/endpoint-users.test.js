const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const runtimeRequire = eval("require");

const endpointModulePath = path.resolve(process.cwd(), "server", "routes", "endpoint_users.js");
const httpModulePath = path.resolve(process.cwd(), "server", "lib", "http.js");
const loadSharedEnvPath = path.resolve(process.cwd(), "server", "lib", "load-shared-env.js");
const zxcvbnPath = require.resolve("zxcvbn");

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
  delete require.cache[zxcvbnPath];
}

function loadEndpointUsers({ requestImpl, zxcvbnImpl = () => ({ score: 4 }) }) {
  resetModuleCache();
  setMockModule(loadSharedEnvPath, {});
  setMockModule(httpModulePath, { request: requestImpl });
  setMockModule(zxcvbnPath, zxcvbnImpl);
  return runtimeRequire(endpointModulePath);
}

function createAppRecorder() {
  const routes = {
    get: new Map(),
    post: new Map(),
    patch: new Map()
  };

  return {
    routes,
    get(pathname, handler) {
      routes.get.set(pathname, handler);
    },
    post(pathname, handler) {
      routes.post.set(pathname, handler);
    },
    patch(pathname, handler) {
      routes.patch.set(pathname, handler);
    }
  };
}

function createResponseRecorder() {
  return {
    statusCode: 200,
    payload: undefined,
    ended: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.payload = body;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    }
  };
}

test("validateSession loads the user profile and deck list", async () => {
  const calls = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith("/users/me")) {
      return { data: { username: "alice", elo: 1300 } };
    }
    if (url.endsWith("/decks?owner=alice&_sort=name:ASC")) {
      return { data: [{ id: "deck-1", name: "Control" }] };
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const { validateSession } = loadEndpointUsers({ requestImpl });

    await new Promise((resolve, reject) => {
      validateSession({ username: "alice", session: "jwt-1" }, (error, valid, user) => {
        try {
          assert.equal(error, null);
          assert.equal(valid, true);
          assert.equal(user.username, "alice");
          assert.deepEqual(user.decks, [{ id: "deck-1", name: "Control" }]);
          assert.equal(calls.length, 2);
          resolve();
        } catch (assertionError) {
          reject(assertionError);
        }
      });
    });
  } finally {
    resetModuleCache();
  }
});

test("register rejects weak passwords before making a request", async () => {
  const requestImpl = async () => {
    throw new Error("request should not be called");
  };

  try {
    const { setupEndpoints } = loadEndpointUsers({
      requestImpl,
      zxcvbnImpl: () => ({ score: 2 })
    });
    const app = createAppRecorder();
    setupEndpoints(app);
    const handler = app.routes.post.get("/register");
    const res = createResponseRecorder();

    await handler({
      body: {
        username: "Alice",
        email: "alice@example.com",
        password: "weak"
      }
    }, res);

    assert.deepEqual(res.payload, {
      error: "Password is to weak"
    });
    assert.equal(res.ended, true);
  } finally {
    resetModuleCache();
  }
});

test("register normalizes username and email before sending to the admin server", async () => {
  const calls = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });
    return {
      data: {
        jwt: "jwt-2"
      }
    };
  };

  try {
    const { setupEndpoints } = loadEndpointUsers({ requestImpl });
    const app = createAppRecorder();
    setupEndpoints(app);
    const handler = app.routes.post.get("/register");
    const res = createResponseRecorder();

    await handler({
      body: {
        username: "  ali$ce.test ",
        email: " ALICE@EXAMPLE.COM ",
        password: "StrongPass123!"
      }
    }, res);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "http://localhost:3000/api/auth/local/register");
    assert.deepEqual(calls[0].options.body, {
      username: "alicetest",
      email: "alice@example.com",
      password: "StrongPass123!"
    });
    assert.deepEqual(res.payload, {
      info: { jwt: "jwt-2" },
      success: true,
      error: null
    });
  } finally {
    resetModuleCache();
  }
});

test("session and profile routes proxy the authenticated user payloads", async () => {
  const calls = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith("/users/me")) {
      return { data: { username: "alice", points: 20 } };
    }
    if (url.endsWith("/decks?owner=alice&_sort=name:ASC")) {
      return { data: { decks: [{ id: "deck-2", name: "Midrange" }] } };
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const { setupEndpoints } = loadEndpointUsers({ requestImpl });
    const app = createAppRecorder();
    setupEndpoints(app);
    const getSession = app.routes.get.get("/api/session/:session");
    const getProfile = app.routes.get.get("/api/profile");
    const sessionRes = createResponseRecorder();
    const profileRes = createResponseRecorder();

    await getSession({
      params: { session: "jwt-3" }
    }, sessionRes);
    await getProfile({
      headers: { authorization: "Bearer jwt-3" }
    }, profileRes);

    assert.equal(calls.length, 3);
    assert.deepEqual(sessionRes.payload, {
      success: true,
      user: {
        username: "alice",
        points: 20,
        decks: [{ id: "deck-2", name: "Midrange" }]
      }
    });
    assert.deepEqual(profileRes.payload, {
      username: "alice",
      points: 20
    });
  } finally {
    resetModuleCache();
  }
});

test("profile update and friendship routes forward auth, body, and errors", async () => {
  const calls = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith("/users/me") && options.method === "PATCH") {
      return { data: { username: "alice", avatar: "new.png" } };
    }
    if (url.endsWith("/users/me/friends") && options.method === "POST") {
      const error = new Error("blocked");
      error.status = 409;
      error.data = { error: "Friend request already exists" };
      throw error;
    }
    if (url.endsWith("/users/me/friends") && options.method === "PATCH") {
      return { data: { success: true } };
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const { setupEndpoints } = loadEndpointUsers({ requestImpl });
    const app = createAppRecorder();
    setupEndpoints(app);
    const updateProfile = app.routes.patch.get("/api/profile");
    const createFriendRequest = app.routes.post.get("/api/profile/friends");
    const updateFriendship = app.routes.patch.get("/api/profile/friends");
    const profileRes = createResponseRecorder();
    const friendCreateRes = createResponseRecorder();
    const friendUpdateRes = createResponseRecorder();

    await updateProfile({
      headers: { Authorization: "Bearer jwt-4" },
      body: { avatar: "new.png" }
    }, profileRes);
    await createFriendRequest({
      headers: { authorization: "Bearer jwt-4" },
      body: { username: "bob" }
    }, friendCreateRes);
    await updateFriendship({
      headers: { authorization: "Bearer jwt-4" },
      body: { username: "bob", status: "accepted" }
    }, friendUpdateRes);

    assert.equal(calls.length, 3);
    assert.deepEqual(profileRes.payload, { username: "alice", avatar: "new.png" });
    assert.equal(friendCreateRes.statusCode, 409);
    assert.deepEqual(friendCreateRes.payload, {
      success: false,
      error: "Friend request already exists"
    });
    assert.deepEqual(friendUpdateRes.payload, { success: true });
  } finally {
    resetModuleCache();
  }
});
// Run with: npm run test:unit
