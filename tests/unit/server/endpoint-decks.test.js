const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const runtimeRequire = eval("require");

const endpointModulePath = path.resolve(process.cwd(), "server", "routes", "endpoint_decks.js");
const httpModulePath = path.resolve(process.cwd(), "server", "lib", "http.js");
const loadSharedEnvPath = path.resolve(process.cwd(), "server", "lib", "load-shared-env.js");

function setMockModule(modulePath, exports) {
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports
  };
}

function resetServerModuleCache() {
  delete require.cache[endpointModulePath];
  delete require.cache[httpModulePath];
  delete require.cache[loadSharedEnvPath];
}

function loadEndpointDecks(requestImpl) {
  resetServerModuleCache();
  setMockModule(httpModulePath, { request: requestImpl });
  return runtimeRequire(endpointModulePath);
}

test("saveDeck creates a deck when no matching deck exists", async () => {
  const calls = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith("/decks?owner=alice&_sort=name:ASC")) {
      if (calls.length === 1) {
        return { data: [] };
      }
      return { data: [{ id: "deck-1", _id: "deck-1", owner: "alice", name: "Starter" }] };
    }

    if (url.endsWith("/decks")) {
      assert.equal(options.method, "POST");
      assert.equal(options.headers.Authorization, "Bearer jwt-123");
      assert.deepEqual(options.body, {
        name: "Starter",
        owner: "alice",
        main: [10, 11],
        extra: [12],
        side: [13],
        notes: ""
      });
      return { data: { ok: true } };
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const { saveDeck } = loadEndpointDecks(requestImpl);
    const callbackArgs = [];

    await saveDeck(
      "jwt-123",
      {
        name: "Starter",
        owner: "alice",
        main: [{ id: "10" }, 11],
        extra: ["12"],
        side: [{ id: "13" }]
      },
      "alice",
      (error, decks) => {
        callbackArgs.push({ error, decks });
      }
    );

    assert.equal(calls.length, 3);
    assert.deepEqual(callbackArgs, [{
      error: null,
      decks: [{ id: "deck-1", _id: "deck-1", owner: "alice", name: "Starter" }]
    }]);
  } finally {
    resetServerModuleCache();
  }
});

test("deleteDeck removes a deck and refreshes the deck list", async () => {
  const calls = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (options.method === "DELETE") {
      assert.match(url, /\/decks\/42$/);
      assert.equal(options.headers.Authorization, "Bearer jwt-456");
      return { data: { deleted: true } };
    }

    if (url.endsWith("/decks?owner=alice&_sort=name:ASC")) {
      return { data: [{ id: "deck-2", owner: "alice", name: "After Delete" }] };
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const { deleteDeck } = loadEndpointDecks(requestImpl);
    const callbackArgs = [];

    await deleteDeck("jwt-456", 42, "alice", (error, decks) => {
      callbackArgs.push({ error, decks });
    });

    assert.equal(calls.length, 2);
    assert.deepEqual(callbackArgs, [{
      error: null,
      decks: [{ id: "deck-2", owner: "alice", name: "After Delete" }]
    }]);
  } finally {
    resetServerModuleCache();
  }
});
// Run with: npm run test:unit
