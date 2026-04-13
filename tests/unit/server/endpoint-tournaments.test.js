const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const runtimeRequire = eval("require");

const endpointModulePath = path.resolve(process.cwd(), "server", "api", "routes", "endpoint_tournaments.js");
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

function resetModuleCache() {
  delete require.cache[endpointModulePath];
  delete require.cache[httpModulePath];
  delete require.cache[loadSharedEnvPath];
}

function loadEndpointTournaments(requestImpl) {
  resetModuleCache();
  setMockModule(loadSharedEnvPath, {});
  setMockModule(httpModulePath, { request: requestImpl });
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
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };
}

test("tournament rankings route forwards the encoded leagueId query and auth header", async () => {
  const calls = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });
    return { data: [{ username: "alice", elo: 1250 }] };
  };

  try {
    const { setupEndpoints } = loadEndpointTournaments(requestImpl);
    const app = createAppRecorder();
    setupEndpoints(app);
    const handler = app.routes.get.get("/api/tournament-rankings");
    const res = createResponseRecorder();

    await handler({
      query: { leagueId: "league 1" },
      headers: { authorization: "Bearer token-1" }
    }, res);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "http://localhost:3000/api/tournament-rankings?leagueId=league%201");
    assert.deepEqual(calls[0].options.headers, { Authorization: "Bearer token-1" });
    assert.deepEqual(res.payload, [{ username: "alice", elo: 1250 }]);
  } finally {
    resetModuleCache();
  }
});

test("join tournament match reuses an already assigned room", async () => {
  const calls = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });
    return {
      data: {
        tournament: {
          id: "tour-1",
          slug: "burning-abyss-cup",
          pairings: [
            {
              pairingId: "match-1",
              playerA: "alice",
              playerB: "bob",
              roomPort: 4321,
              roomPass: "tour-1-match-1"
            }
          ]
        }
      }
    };
  };

  try {
    const { setupEndpoints } = loadEndpointTournaments(requestImpl);
    const app = createAppRecorder();
    setupEndpoints(app);
    const handler = app.routes.post.get("/api/tournaments/:id/matches/:matchId/join");
    const res = createResponseRecorder();

    await handler({
      params: { id: "tour-1", matchId: "match-1" },
      headers: { authorization: "Bearer token-2" },
      body: { spectator: false }
    }, res);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "http://localhost:3000/api/tournaments/tour-1/matches/match-1/join");
    assert.deepEqual(res.payload, {
      success: true,
      tournament: {
        id: "tour-1",
        slug: "burning-abyss-cup",
        pairings: [
          {
            pairingId: "match-1",
            playerA: "alice",
            playerB: "bob",
            roomPort: 4321,
            roomPass: "tour-1-match-1"
          }
        ]
      },
      matchAccess: {
        matchId: "match-1",
        roomAssigned: true,
        roomPort: 4321,
        roomPass: "tour-1-match-1",
        joinPath: "/ygopro?room=4321",
        message: "Match access validated. Duel room assigned."
      }
    });
  } finally {
    resetModuleCache();
  }
});

test("join tournament match allocates a room and reports the assigned access path", async () => {
  const calls = [];
  const hostedGames = [];
  const requestImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith("/join")) {
      return {
        data: {
          tournament: {
            id: "tour-2",
            slug: "ranked-cup",
            roomRules: {
              automation: "Manual",
              banlist: "April 2026",
              ruleset: "TCG",
              duelMode: "Single"
            },
            pairings: [
              {
                pairingId: "match-2",
                table: 4,
                playerA: "charlie",
                playerB: "dana"
              }
            ]
          }
        }
      };
    }

    if (url.endsWith("/assign-room")) {
      assert.equal(options.method, "POST");
      assert.deepEqual(options.body, {
        roomPort: 9001,
        roomPass: "secret"
      });

      return {
        data: {
          tournament: {
            id: "tour-2",
            slug: "ranked-cup",
            pairings: [
              {
                pairingId: "match-2",
                table: 4,
                playerA: "charlie",
                playerB: "dana",
                roomPort: 9001,
                roomPass: "secret"
              }
            ]
          }
        }
      };
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const { setupEndpoints } = loadEndpointTournaments(requestImpl);
    const hostGameAllocator = async (hostConfig) => {
      hostedGames.push(hostConfig);
      return {
        port: 9001,
        roompass: "secret"
      };
    };
    const app = createAppRecorder();
    setupEndpoints(app, { hostGameAllocator });
    const handler = app.routes.post.get("/api/tournaments/:id/matches/:matchId/join");
    const res = createResponseRecorder();

    await handler({
      params: { id: "tour-2", matchId: "match-2" },
      headers: { Authorization: "Bearer token-3" },
      body: {}
    }, res);

    assert.equal(calls.length, 2);
    assert.deepEqual(hostedGames, [{
      roomName: "ranked-cup Table 4",
      password: "tour-2-match-2",
      hostPort: null,
      notes: "",
      banlist: "April 2026",
      allowedCards: "tcg",
      team1Count: 1,
      team2Count: 1,
      bestOf: 1,
      relay: false,
      rulePreset: "mr5",
      timeLimitSeconds: 1800,
      noShuffleDeck: false,
      noCheckDeckContents: false,
      noCheckDeckSize: false,
      tcgSegocRulings: false,
      team1: {
        startingLP: 8000,
        startingDrawCount: 5,
        drawCountPerTurn: 1,
      },
      team2: {
        startingLP: 8000,
        startingDrawCount: 5,
        drawCountPerTurn: 1,
      },
      deckLimits: {
        main: { min: 40, max: 60 },
        extra: { min: 0, max: 15 },
        side: { min: 0, max: 15 },
      },
      customRules: [],
      forbiddenTypes: [],
      extraRules: [],
      roompass: "tour-2-match-2",
      tournamentId: "tour-2",
      tournamentSlug: "ranked-cup",
      tournamentMatchId: "match-2",
    }]);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.matchAccess.roomAssigned, true);
    assert.equal(res.payload.matchAccess.joinPath, "/ygopro?room=9001");
  } finally {
    resetModuleCache();
  }
});

test("tournament action handlers surface request failures", async () => {
  const requestImpl = async () => {
    const error = new Error("forbidden");
    error.status = 403;
    error.data = {
      error: "Registration closed",
      errors: [{ field: "status" }]
    };
    throw error;
  };

  try {
    const { setupEndpoints } = loadEndpointTournaments(requestImpl);
    const app = createAppRecorder();
    setupEndpoints(app);
    const handler = app.routes.post.get("/api/tournaments/:id/register");
    const res = createResponseRecorder();

    await handler({
      params: { id: "tour-3" },
      headers: {},
      body: { deckId: "deck-1" }
    }, res);

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.payload, {
      success: false,
      error: "Registration closed",
      errors: [{ field: "status" }]
    });
  } finally {
    resetModuleCache();
  }
});

test("join tournament match returns an error when no room allocator is injected", async () => {
  const requestImpl = async (url) => {
    if (url.endsWith("/join")) {
      return {
        data: {
          tournament: {
            id: "tour-4",
            slug: "allocatorless-cup",
            pairings: [
              {
                pairingId: "match-4",
                table: 7
              }
            ]
          }
        }
      };
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const { setupEndpoints } = loadEndpointTournaments(requestImpl);
    const app = createAppRecorder();
    setupEndpoints(app);
    const handler = app.routes.post.get("/api/tournaments/:id/matches/:matchId/join");
    const res = createResponseRecorder();

    await handler({
      params: { id: "tour-4", matchId: "match-4" },
      headers: {},
      body: {}
    }, res);

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.payload, {
      success: false,
      error: "Tournament room allocator is unavailable on the main server.",
      errors: null
    });
  } finally {
    resetModuleCache();
  }
});
// Run with: npm run test:unit
