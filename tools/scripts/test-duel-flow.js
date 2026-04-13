const { spawn } = require("child_process");
const path = require("path");
const WebSocket = require("ws");
const { request } = require("../../server/lib/http");

const CMS_BASE_URL = process.env.CMS_BASE_URL || "http://127.0.0.1:3000";
const SERVER_HOST = process.env.TEST_SERVER_HOST || "127.0.0.1";
const HTTP_PORT = Number(process.env.TEST_HTTP_PORT || 3100);
const WS_PORT = Number(process.env.TEST_WS_PORT || 3101);
const TCP_PORT = Number(process.env.TEST_TCP_PORT || 3102);
const EXISTING_SERVER_BASE_URL = process.env.EXISTING_SERVER_BASE_URL || "http://127.0.0.1:3000";
const SERVER_BASE_URL = `http://${SERVER_HOST}:${HTTP_PORT}`;
const LOBBY_WS_URL = `ws://${SERVER_HOST}:${WS_PORT}`;

/**
 * Executes the wait helper used by the test duel flow module.
 * @param {number} ms The ms value provides an input used by the test duel flow module.
 * @returns {Promise<*>} Returns the value produced by the test duel flow module.
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes the expect helper used by the test duel flow module.
 * @param {*} condition The condition value provides an input used by the test duel flow module.
 * @param {Object} message The message value provides an input used by the test duel flow module.
 * @returns {void} Does not return a value.
 */
function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Executes the wait for cms helper used by the test duel flow module.
 * @param {string} baseUrl The baseUrl value provides an input used by the test duel flow module.
 * @returns {Promise<void>} Resolves when the test duel flow operation completes.
 */
async function waitForCms(baseUrl) {
  for (let i = 0; i < 90; i += 1) {
    try {
      await request(`${baseUrl}/api/rankings`, { timeout: 1000 });
      return;
    } catch {
      await wait(1000);
    }
  }

  throw new Error(`CMS did not start at ${baseUrl}`);
}

/**
 * Executes the wait for server helper used by the test duel flow module.
 * @param {string} baseUrl The baseUrl value provides an input used by the test duel flow module.
 * @returns {Promise<void>} Resolves when the test duel flow operation completes.
 */
async function waitForServer(baseUrl) {
  for (let i = 0; i < 120; i += 1) {
    try {
      await request(`${baseUrl}/api/websocket-port`, { timeout: 1000 });
      return;
    } catch {
      await wait(1000);
    }
  }

  throw new Error(`Server did not start at ${baseUrl}`);
}

/**
 * Determines whether endpoint reachable should be treated as valid in the test duel flow module.
 * @param {string} url The url value provides an input used by the test duel flow module.
 * @returns {Promise<boolean>} Resolves to `true` when endpoint reachable is valid in the test duel flow module and `false` otherwise.
 */
async function isEndpointReachable(url) {
  try {
    await request(url, { timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets websocket url used by the test duel flow module.
 * @param {string} baseUrl The baseUrl value provides an input used by the test duel flow module.
 * @returns {Promise<string>} Resolves with the value produced by the test duel flow module.
 */
async function getWebSocketUrl(baseUrl) {
  const response = await request(`${baseUrl}/api/websocket-port`, { timeout: 1000, expectOk: false });
  expectStatus(response, 200, `Unable to read websocket port from ${baseUrl}`);
  return `ws://${SERVER_HOST}:${response.data.port}`;
}

/**
 * Executes the expect status helper used by the test duel flow module.
 * @param {Object} response The response response object provides the outgoing channel used by the test duel flow route, including the `data` property.
 * @param {Object} response.data The `data` property supplies structured input used by the test duel flow module.
 * @param {string} status The status value provides an input used by the test duel flow module.
 * @param {Object} message The message value provides an input used by the test duel flow module.
 * @returns {void} Does not return a value.
 */
function expectStatus(response, status, message) {
  if (response.status !== status) {
    throw new Error(
      `${message} (expected ${status}, got ${response.status}): ${JSON.stringify(response.data)}`
    );
  }
}

/**
 * Creates deck used by the test duel flow module.
 * @returns {Object} Returns the value produced by the test duel flow module.
 */
function createDeck() {
  const main = [];
  const extra = [];
  for (let i = 0; i < 20; i += 1) {
    main.push(89631139, 46986414);
  }
  for (let i = 0; i < 15; i += 1) {
    extra.push(23995346);
  }
  return { main, extra, side: [] };
}

/**
 * Registers user used by the test duel flow module.
 * @param {Object} param0 The param0 object supplies the structured input used by the test duel flow module, including the `email`, `password`, and `username` properties.
 * @param {string} param0.email The `email` property supplies structured input used by the test duel flow module.
 * @param {string} param0.password The `password` property supplies structured input used by the test duel flow module.
 * @param {string} param0.username The `username` property supplies structured input used by the test duel flow module.
 * @returns {Promise<Object>} Resolves with the value produced by the test duel flow module.
 */
async function registerUser({ username, email, password }) {
  const response = await request(`${CMS_BASE_URL}/api/auth/local/register`, {
    method: "POST",
    body: { username, email, password },
    expectOk: false
  });
  expectStatus(response, 200, `Registration failed for ${username}`);
  expect(response.data?.jwt, `Registration did not return a JWT for ${username}`);
  return response.data;
}

/**
 * Executes the login user helper used by the test duel flow module.
 * @param {Object} param0 The param0 object supplies the structured input used by the test duel flow module, including the `identifier` and `password` properties.
 * @param {string} param0.identifier The `identifier` property supplies structured input used by the test duel flow module.
 * @param {string} param0.password The `password` property supplies structured input used by the test duel flow module.
 * @returns {Promise<Object>} Resolves with the value produced by the test duel flow module.
 */
async function loginUser({ identifier, password }) {
  const response = await request(`${CMS_BASE_URL}/api/auth/local`, {
    method: "POST",
    body: { identifier, password },
    expectOk: false
  });
  expectStatus(response, 200, `Login failed for ${identifier}`);
  expect(response.data?.jwt, `Login did not return a JWT for ${identifier}`);
  return response.data;
}

/**
 * Creates deck for user used by the test duel flow module.
 * @param {string} jwt The jwt value provides an input used by the test duel flow module.
 * @param {string} owner The owner value provides an input used by the test duel flow module.
 * @param {string} name The name value provides an input used by the test duel flow module.
 * @param {Object} deck The deck object supplies the structured input used by the test duel flow module, including the `extra`, `main`, and `side` properties.
 * @param {Array} deck.extra The `extra` property supplies structured input used by the test duel flow module.
 * @param {Array} deck.main The `main` property supplies structured input used by the test duel flow module.
 * @param {number} deck.side The `side` property supplies structured input used by the test duel flow module.
 * @returns {Promise<Object>} Resolves with the value produced by the test duel flow module.
 */
async function createDeckForUser(jwt, owner, name, deck) {
  const response = await request(`${CMS_BASE_URL}/api/decks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`
    },
    body: {
      name,
      owner,
      main: deck.main,
      extra: deck.extra,
      side: deck.side
    },
    expectOk: false
  });
  expectStatus(response, 200, `Deck creation failed for ${owner}`);
  expect(response.data?.deck?.id, `Deck creation did not return a deck id for ${owner}`);
  return response.data.deck;
}

class JsonSocketClient {
      /**
   * Initializes a new Test duel flow instance and prepares its internal state.
   * @param {string} url The url value provides an input used by the test duel flow module.
   * @param {string} label The label value provides an input used by the test duel flow module.
   * @returns {void} Does not return a value.
   */
  constructor(url, label) {
    this.url = url;
    this.label = label;
    this.messages = [];
    this.waiters = [];
    this.closed = false;
    this.socket = null;
  }

      /**
   * Executes the connect helper used by the test duel flow module.
   * @returns {Promise<void>} Resolves when the test duel flow operation completes.
   */
  async connect() {
    await new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url);
      this.socket = socket;

                  /**
       * Handles error events for the test duel flow module.
       * @param {Object} error The error object supplies the structured input used by the test duel flow module, including the `message` property.
       * @param {Object} error.message The `message` property supplies structured input used by the test duel flow module.
       * @returns {void} Does not return a value.
       */
      const onError = (error) => {
        reject(new Error(`${this.label} connection failed: ${error.message}`));
      };

      socket.once("open", () => {
        socket.off("error", onError);
        resolve();
      });
      socket.once("error", onError);
      socket.on("message", (raw) => {
        let parsed;
        try {
          parsed = JSON.parse(raw.toString("utf8"));
        } catch {
          return;
        }
        this.messages.push(parsed);
        this.flushWaiters();
      });
      socket.on("close", () => {
        this.closed = true;
        this.flushWaiters();
      });
    });
  }

      /**
   * Executes the flush waiters helper used by the test duel flow module.
   * @returns {void} Does not return a value.
   */
  flushWaiters() {
    const pending = [];
    for (const waiter of this.waiters) {
      if (this.closed) {
        waiter.reject(new Error(`${this.label} socket closed before receiving ${waiter.description}`));
        continue;
      }

      const index = this.messages.findIndex(waiter.predicate);
      if (index >= 0) {
        const [message] = this.messages.splice(index, 1);
        waiter.resolve(message);
        continue;
      }

      const fatal = this.messages.find((message) => waiter.rejectOnError && message && message.error);
      if (fatal) {
        waiter.reject(new Error(`${this.label} received error: ${fatal.error}`));
        continue;
      }

      pending.push(waiter);
    }
    this.waiters = pending;
  }

      /**
   * Executes the send helper used by the test duel flow module.
   * @param {Object} payload The payload value provides an input used by the test duel flow module.
   * @returns {void} Does not return a value.
   */
  send(payload) {
    expect(this.socket && this.socket.readyState === WebSocket.OPEN, `${this.label} socket is not open`);
    this.socket.send(JSON.stringify(payload));
  }

      /**
   * Executes the wait for helper used by the test duel flow module.
   * @param {Function} predicate The predicate value provides an input used by the test duel flow module.
   * @param {string} description The description value provides an input used by the test duel flow module.
   * @param {number} timeout The timeout value provides an input used by the test duel flow module.
   * @param {boolean} rejectOnError The rejectOnError value provides an input used by the test duel flow module.
   * @returns {Promise<Object>} Returns the value produced by the test duel flow module.
   */
  waitFor(predicate, description, timeout = 15000, rejectOnError = true) {
    return new Promise((resolve, reject) => {
      const waiter = {
        predicate,
        description,
        rejectOnError,
        resolve: (message) => {
          clearTimeout(timeoutId);
          resolve(message);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      };
      const timeoutId = setTimeout(() => {
        this.waiters = this.waiters.filter((entry) => entry !== waiter);
        reject(new Error(`Timed out waiting for ${description} on ${this.label}`));
      }, timeout);
      this.waiters.push(waiter);
      this.flushWaiters();
    });
  }

      /**
   * Executes the close helper used by the test duel flow module.
   * @returns {void} Does not return a value.
   */
  close() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }
}

/**
 * Executes the wait for any client message helper used by the test duel flow module.
 * @param {Array} clients The clients value provides an input used by the test duel flow module.
 * @param {Function} predicate The predicate value provides an input used by the test duel flow module.
 * @param {string} description The description value provides an input used by the test duel flow module.
 * @param {number} timeout The timeout value provides an input used by the test duel flow module.
 * @param {boolean} rejectOnError The rejectOnError value provides an input used by the test duel flow module.
 * @returns {Promise<Object>} Resolves with the value produced by the test duel flow module.
 */
async function waitForAnyClientMessage(clients, predicate, description, timeout = 15000, rejectOnError = true) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    for (const client of clients) {
      const matchIndex = client.messages.findIndex(predicate);
      if (matchIndex >= 0) {
        const [packet] = client.messages.splice(matchIndex, 1);
        return { client, packet };
      }

      if (rejectOnError) {
        const errorPacket = client.messages.find((packet) => packet && packet.error);
        if (errorPacket) {
          throw new Error(`${client.label} received error: ${errorPacket.error}`);
        }
      }
    }

    await wait(50);
  }

  throw new Error(`Timed out waiting for ${description}`);
}

/**
 * Executes the login to lobby helper used by the test duel flow module.
 * @param {Object} client The client object supplies the structured input used by the test duel flow module, including the `waitFor` property.
 * @param {Function} client.waitFor The `waitFor` property supplies structured input used by the test duel flow module.
 * @param {string} username The username value provides an input used by the test duel flow module.
 * @param {string} password The password value provides an input used by the test duel flow module.
 * @returns {Promise<Object>} Resolves with the value produced by the test duel flow module.
 */
async function loginToLobby(client, username, password) {
  client.send({
    action: "listen",
    username,
    password
  });

  const message = await client.waitFor(
    (packet) => packet.clientEvent === "login",
    `legacy login for ${username}`
  );

  if (message.error) {
    throw new Error(`Legacy lobby login failed for ${username}: ${message.info?.message || message.error}`);
  }

  expect(message.info?.session, `Legacy lobby login did not return a session for ${username}`);
  return message;
}

/**
 * Opens room client used by the test duel flow module.
 * @param {string} url The url value provides an input used by the test duel flow module.
 * @param {string} label The label value provides an input used by the test duel flow module.
 * @returns {Promise<Object>} Resolves with the value produced by the test duel flow module.
 */
async function openRoomClient(url, label) {
  const client = new JsonSocketClient(url, label);
  await client.connect();
  const roomListPacket = await client.waitFor(
    (packet) => packet.type === "room_list" && Array.isArray(packet.payload?.rooms),
    `${label} initial room list`
  );
  return { client, rooms: roomListPacket.payload.rooms };
}

/**
 * Executes the main helper used by the test duel flow module.
 * @returns {Promise<void>} Resolves when the test duel flow operation completes.
 */
async function main() {
  const suffix = Date.now();
  const password = "DuelFlow123!Strong";
  const deckName = `duel_flow_${suffix}`;
  const hostUser = {
    username: `duel_host_${suffix}`,
    email: `duel_host_${suffix}@example.com`,
    password
  };
  const guestUser = {
    username: `duel_guest_${suffix}`,
    email: `duel_guest_${suffix}@example.com`,
    password
  };
  const deck = createDeck();
  const cmsWasRunning = await isEndpointReachable(`${CMS_BASE_URL}/api/rankings`);
  const preferredServerWasRunning = await isEndpointReachable(`${SERVER_BASE_URL}/api/websocket-port`);
  const existingServerWasRunning = await isEndpointReachable(`${EXISTING_SERVER_BASE_URL}/api/websocket-port`);
  const serverWasRunning = preferredServerWasRunning || existingServerWasRunning;
  const rootDir = path.resolve(__dirname, "..", "..");
  const processes = [];
  const logs = new Map();
  const sockets = [];
  let resolvedServerBaseUrl = preferredServerWasRunning
    ? SERVER_BASE_URL
    : (existingServerWasRunning ? EXISTING_SERVER_BASE_URL : SERVER_BASE_URL);
  let resolvedLobbyWsUrl = preferredServerWasRunning
    ? await getWebSocketUrl(SERVER_BASE_URL)
    : (existingServerWasRunning ? await getWebSocketUrl(EXISTING_SERVER_BASE_URL) : LOBBY_WS_URL);

      /**
   * Tracks process used by the test duel flow module.
   * @param {string} name The name value provides an input used by the test duel flow module.
   * @param {Object} child The child object supplies the structured input used by the test duel flow module, including the `stderr` and `stdout` properties.
   * @param {Object} child.stderr The `stderr` property supplies structured input used by the test duel flow module.
   * @param {Object} child.stdout The `stdout` property supplies structured input used by the test duel flow module.
   * @returns {void} Does not return a value.
   */
  function trackProcess(name, child) {
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    logs.set(name, () => ({ stdout, stderr }));
    processes.push(child);
  }

  try {
    if (!cmsWasRunning) {
      const cms = spawn(process.execPath, [path.join(rootDir, "server", "cms", "index.js"), "--dev"], {
        cwd: rootDir,
        env: { ...process.env },
        stdio: ["ignore", "pipe", "pipe"]
      });
      trackProcess("cms", cms);
    }

    console.log("STEP: waiting for cms");
    await waitForCms(CMS_BASE_URL);
    console.log("STEP: cms ready");

    if (!serverWasRunning) {
      const server = spawn(process.execPath, [path.join(rootDir, "server", "index.js")], {
        cwd: rootDir,
        env: {
          ...process.env,
          NODE_ENV: "production",
          HTTP_PORT: String(HTTP_PORT),
          WS_PORT: String(WS_PORT),
          TCP_PORT: String(TCP_PORT),
          ROOM_TRACE: "0",
          ROOM_TRACE_COLOR: "0"
        },
        stdio: ["ignore", "pipe", "pipe"]
      });
      trackProcess("server", server);
    }

    console.log("STEP: waiting for server");
    try {
      await waitForServer(SERVER_BASE_URL);
      resolvedServerBaseUrl = SERVER_BASE_URL;
      resolvedLobbyWsUrl = await getWebSocketUrl(SERVER_BASE_URL);
    } catch (error) {
      const getLog = logs.get("server");
      const stderr = getLog ? getLog().stderr : "";
      if (/Unable to acquire lock/i.test(stderr) && await isEndpointReachable(`${EXISTING_SERVER_BASE_URL}/api/websocket-port`)) {
        resolvedServerBaseUrl = EXISTING_SERVER_BASE_URL;
        resolvedLobbyWsUrl = await getWebSocketUrl(EXISTING_SERVER_BASE_URL);
      } else {
        throw error;
      }
    }
    console.log("STEP: server ready");

    console.log("STEP: register users");
    await registerUser(hostUser);
    await registerUser(guestUser);

    console.log("STEP: login users");
    const hostLogin = await loginUser({ identifier: hostUser.username, password });
    const guestLogin = await loginUser({ identifier: guestUser.username, password });

    console.log("STEP: create decks");
    const hostDeck = await createDeckForUser(hostLogin.jwt, hostUser.username, `${deckName}_host`, deck);
    const guestDeck = await createDeckForUser(guestLogin.jwt, guestUser.username, `${deckName}_guest`, deck);

    expect(hostDeck.main.length === 40, `Host deck main count should be 40, got ${hostDeck.main.length}`);
    expect(hostDeck.extra.length === 15, `Host deck extra count should be 15, got ${hostDeck.extra.length}`);
    expect(guestDeck.main.length === 40, `Guest deck main count should be 40, got ${guestDeck.main.length}`);
    expect(guestDeck.extra.length === 15, `Guest deck extra count should be 15, got ${guestDeck.extra.length}`);

    console.log("STEP: load deck edit page");
    const deckEditPage = await request(`${resolvedServerBaseUrl}/deckedit`, {
      responseType: "text",
      expectOk: false,
      timeout: 120000
    });
    expectStatus(deckEditPage, 200, "Deck edit page did not load");

    console.log("STEP: load host page");
    const hostPage = await request(`${resolvedServerBaseUrl}/host`, {
      responseType: "text",
      expectOk: false,
      timeout: 120000
    });
    expectStatus(hostPage, 200, "Host page did not load");

    console.log("STEP: legacy lobby login and deck review");
    const hostLobby = new JsonSocketClient(resolvedLobbyWsUrl, "lobby:host");
    const guestLobby = new JsonSocketClient(resolvedLobbyWsUrl, "lobby:guest");
    sockets.push(hostLobby, guestLobby);
    await hostLobby.connect();
    await guestLobby.connect();

    const hostLobbyLogin = await loginToLobby(hostLobby, hostUser.username, password);
    const guestLobbyLogin = await loginToLobby(guestLobby, guestUser.username, password);

    const reviewedDeck = hostLobbyLogin.info.decks.find((entry) => entry.id === hostDeck.id);
    expect(reviewedDeck, "Logged-in host user did not receive the created deck");
    expect(reviewedDeck.main.length === 40, `Deck edit review expected 40 main cards, got ${reviewedDeck.main.length}`);
    expect(reviewedDeck.extra.length === 15, `Deck edit review expected 15 extra cards, got ${reviewedDeck.extra.length}`);

    console.log("STEP: create and join duel room");
    const hostRoom = await openRoomClient(resolvedLobbyWsUrl, "room:host");
    const guestRoom = await openRoomClient(resolvedLobbyWsUrl, "room:guest");
    sockets.push(hostRoom.client, guestRoom.client);

    const targetRoom = hostRoom.rooms.find((room) => room.id) || hostRoom.rooms[0];
    expect(targetRoom?.id, "No room was available from the room protocol");

    hostRoom.client.send({
      type: "join_room",
      payload: {
        roomId: targetRoom.id
      }
    });
    guestRoom.client.send({
      type: "join_room",
      payload: {
        roomId: targetRoom.id
      }
    });

    await hostRoom.client.waitFor(
      (packet) => packet.type === "room_joined" && packet.payload?.roomId === targetRoom.id,
      "host joined room"
    );
    await guestRoom.client.waitFor(
      (packet) => packet.type === "room_joined" && packet.payload?.roomId === targetRoom.id,
      "guest joined room"
    );

    await waitForAnyClientMessage(
      [hostRoom.client, guestRoom.client],
      (packet) =>
        packet.type === "room_event" &&
        packet.payload?.roomId === targetRoom.id &&
        packet.payload?.event === "request_decks",
      "room deck request event",
      20000
    );

    console.log("STEP: both players ready with 40/15 deck");
    hostRoom.client.send({
      type: "submit_deck",
      payload: {
        deck
      }
    });
    guestRoom.client.send({
      type: "submit_deck",
      payload: {
        deck
      }
    });

    await waitForAnyClientMessage(
      [hostRoom.client, guestRoom.client],
      (packet) =>
        packet.type === "room_state" &&
        packet.payload?.roomId === targetRoom.id &&
        packet.payload?.state === "waiting_for_ready" &&
        Array.isArray(packet.payload?.players) &&
        packet.payload.players.filter((player) => player.hasDeck).length === 2,
      "room state with both decks submitted",
      20000
    );

    hostRoom.client.send({
      type: "ready",
      payload: {
        ready: true
      }
    });
    guestRoom.client.send({
      type: "ready",
      payload: {
        ready: true
      }
    });

    await waitForAnyClientMessage(
      [hostRoom.client, guestRoom.client],
      (packet) =>
        packet.type === "room_state" &&
        packet.payload?.roomId === targetRoom.id &&
        packet.payload?.state === "waiting_for_ready" &&
        Array.isArray(packet.payload?.players) &&
        packet.payload.players.filter((player) => player.isReady).length === 2,
      "room state with both players ready",
      20000
    );

    console.log("STEP: start game");
    hostRoom.client.send({
      type: "start_duel",
      payload: {}
    });

    const { packet: duelStart } = await waitForAnyClientMessage(
      [hostRoom.client, guestRoom.client],
      (packet) =>
        (packet.type === "room_event" &&
          packet.payload?.roomId === targetRoom.id &&
          packet.payload?.event === "duel_started") ||
        (packet.type === "room_state" &&
          packet.payload?.roomId === targetRoom.id &&
          packet.payload?.state === "in_duel"),
      "either client to receive the duel start event",
      30000
    );

    expect(duelStart, "The duel never transitioned into an active game");

    console.log(`DECK_REVIEW_OK:${reviewedDeck.id}`);
    console.log(`HOST_PAGE_OK:${hostPage.status}`);
    console.log(`DUEL_ROOM_OK:${targetRoom.id}`);
    console.log("PLAYERS_READY_OK:true");
    console.log("DUEL_START_OK:true");
  } finally {
    for (const socket of sockets.reverse()) {
      try {
        socket.close();
      } catch {}
    }

    for (const child of processes.reverse()) {
      child.kill("SIGTERM");
      await wait(500);
    }

    for (const [name, getLog] of logs.entries()) {
      const { stdout, stderr } = getLog();
      if (stderr.trim()) {
        console.log(`${name.toUpperCase()}_STDERR_START`);
        console.log(stderr.trim());
        console.log(`${name.toUpperCase()}_STDERR_END`);
      }
      if (stdout.trim()) {
        console.log(`${name.toUpperCase()}_STDOUT_START`);
        console.log(stdout.trim());
        console.log(`${name.toUpperCase()}_STDOUT_END`);
      }
    }
  }
}

main().catch((error) => {
  console.error(`TEST_FAILED:${error.stack || error.message}`);
  process.exit(1);
});
