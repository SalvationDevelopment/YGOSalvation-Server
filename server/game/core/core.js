/**
 * OCGCore, the YGOPro game engine, is very unstable. Its a C++ library that will cause
 * a crash if it sees improper logic in the Lua scripts it dynamically loads  in that
 * represent the game logic of individual cards. For that reason the room system wrapping
 * it runs in is a sperate child process.
 *
 * Configuration is passed as a canonical host config object.
 */

const { match } = require("assert"),
  logger = require("../logger"),
  { log } = logger.create(logger.config.main, "[CORE/INDEX]");

/**
 * @typedef {Object} ClientMessage
 * @property {String} action game model manipulation or general action to take place.
 * @property {String} [chat] chat message
 * @property {Deck} [deck] deck for validation and use
 * @property {Number} [turn_player]
 * @property {String} [room] room reconnection request
 * @property {String} [username] clients username.
 * @property {Number[]} [response] message to the ocgcore.
 * @property {String} [session] uuid session identifier.
 * @property {Number} [slot] slot to do actions on.
 * @property {String} [verification] clients validation key from authentication server.
 */

/**
 * @typedef {Object} ServerMessage
 */

/**
 * @typedef {Object} Deck
 * @property {Number[]} main Passcode/YGOPRO_ID of cards in the main deck.
 * @property {Number[]} extra Passcode/YGOPRO_ID cards in the extra deck.
 * @property {Number[]} side Passcode/YGOPRO_ID cards in the side deck.
 */

/**
 * @typedef {Object} DeckValidation
 * @property {Error} error deck validation failure information
 * @property {Boolean} valid if the deck is valid
 */

/**
 * @typedef {Deck} PlayerAbstraction
 * @method write Send data to clients
 */

/**
 * @typedef ChatMessage
 * @property {String} message text string sent from client asa chat message.
 */

/**
 * @typedef {Object} ApplicationState
 * @property {Object[]}         clients player socket connections.
 * @property {ChatMessage[]}    chat duel chat message history.
 * @property {NodeJS.Timeout}   [lifeCycle] duel process expiration timeout pointer
 * @property {String}           [password] duel password as set by host
 * @property {Object}           reconnection reconnection codes
 * @property {String}           verification duel turn player pick validation code
 */

/**
 * @typedef  {Object} GameState
 */

/**
 * @typedef {Object} Duel
 * @method getField get full field information
 * @method load start duel
 * @method respond respond to a ocgcore question
 * @method surrender allow a player to surrender to the opponent
 */

const path = require("path"),
  MANIFEST_DIR = path.resolve(__dirname, "../../ui/public/manifest"),
  WARNING_COUNTDOWN = 3000000,
  CLEANUP_LATENCY = 100000,
  MAX_GAME_TIME = 33000000,
  banlist = require(path.join(MANIFEST_DIR, "banlist.json")),
  database = require(path.join(MANIFEST_DIR, "manifest_0-en-OCGTCG.json")),
  dotenv = require("dotenv"),
  { randomUUID } = require("crypto"),
  defaultPlayer = require("./defaults"),
  EventEmitter = require("events"),
  express = require("express"),
  fs = require("fs"),
  http = require("http"),
  https = require("https"),
  field = require("./model_manual_field.js"),
  automaticControlEngine = require("./controller_core.js"),
  manualControlEngine = require("./controller_manual.js"),
  { WebSocketServer, WebSocket } = require("ws"),
  sanitize = require("./lib_html_sanitizer.js"),
  shuffle = require("./lib_shuffle.js"),
  validateDeck = require("./lib_validate_deck.js"),
  verificationSystem = new EventEmitter(),
  choice = require("./lib_choice"),
  {
    cloneDeck,
    getPuzzleConfig,
    normalizeStartingPlayerSlot,
  } = require("../../puzzle-catalog"),
  {
    parseHostConfig,
    resolveAllowedCardsLabel,
    resolveMasterRule,
    resolveModeLabel
  } = require("../../host-config");

let lastInteraction = new Date();

/**
 * Executes the static web server helper used by the core module.
 * @param {Object} request The request request provides the incoming data used by the core route.
 * @param {Object} response The response response provides the outgoing channel used by the core route.
 * @returns {void} Does not return a value.
 */
function staticWebServer(request, response) {}

/**
 * Executes the broadcast helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game value provides an input used by the core module.
 * @returns {void} Does not return a value.
 */
function broadcast(server, game) {
  server.write({
    action: "lobby",
    game,
  });
  process.send({
    action: "lobby",
    game,
  });
}

/**
 * Clears field used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {number} player The player value provides an input used by the core module.
 * @returns {void} Does not return a value.
 */
function clearField(server, player) {
  server.write({
    action: "clear",
  });
}

/**
 * Executes the enable client helper used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `avatar`, `elo`, `id`, `points`, and `username` properties.
 * @param {string} client.avatar The `avatar` property supplies structured input used by the core module.
 * @param {number} client.elo The `elo` property supplies structured input used by the core module.
 * @param {string} client.id The `id` property supplies structured input used by the core module.
 * @param {number} client.points The `points` property supplies structured input used by the core module.
 * @param {string} client.username The `username` property supplies structured input used by the core module.
 * @param {Object} person The person object supplies the structured input used by the core module, including the `_id`, `avatar`, `decks`, `elo`, `points`, and `username` properties.
 * @param {string} person._id The `_id` property supplies structured input used by the core module.
 * @param {string} person.avatar The `avatar` property supplies structured input used by the core module.
 * @param {Array} person.decks The `decks` property supplies structured input used by the core module.
 * @param {number} person.elo The `elo` property supplies structured input used by the core module.
 * @param {number} person.points The `points` property supplies structured input used by the core module.
 * @param {string} person.username The `username` property supplies structured input used by the core module.
 * @returns {void} Does not return a value.
 */
function enableClient(client, person) {
  client.username = person.username;
  client.avatar = person.avatar;
  client.points = person.points || 0;
  client.elo = person.elo || 1200;
  // eslint-disable-next-line no-underscore-dangle
  client.id = person._id;
  client.write({
    action: "registered",
  });

  if (person.decks) {
    client.write({
      action: "decks",
      decks: person.decks,
    });
  }
}

/**
 * Executes the register helper used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `session` property.
 * @param {Object} client.session The `session` property supplies structured input used by the core module.
 * @param {Object} message The message object supplies the structured input used by the core module, including the `session` and `username` properties.
 * @param {(string|Object)} message.session The `session` property supplies structured input used by the core module.
 * @param {string} message.username The `username` property supplies structured input used by the core module.
 * @returns {void} Does not return a value.
 */
function register(client, message) {
  if (!process.child) {
    enableClient(client, Object.assign(message, defaultPlayer));
    return;
  }

  if (typeof message.session !== "string") {
    throw Error("Session information required to proceed");
  }

  client.session = message.session;
  verificationSystem.once(message.session, function (error, valid, person) {
    if (error) {
      throw error;
    }
    if (valid) {
      enableClient(client, person);
      return;
    }
  });
  process.send({
    action: "register",
    username: message.username,
    session: message.session,
  });
}

/**
 * Executes the chat helper used by the core module.
 * @param {Object} server The server object supplies the structured input used by the core module, including the `room` property.
 * @param {Function} server.room The `room` property supplies structured input used by the core module.
 * @param {Object} state The state value provides an input used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `username` property.
 * @param {string} client.username The `username` property supplies structured input used by the core module.
 * @param {Object} message The message value provides an input used by the core module.
 * @param {Object} date The date object supplies the structured input used by the core module, including the `toISOString` property.
 * @param {Function} date.toISOString The `toISOString` property supplies structured input used by the core module.
 * @returns {(string|Object)} Returns the value produced by the core module.
 */
function chat(server, state, client, message, date) {
  date = date || new Date();
  const chatMessage = {
    action: "chat",
    message: sanitize(message),
    username: client.username,
    date: date.toISOString(),
  };
  server.room("chat").write(chatMessage);
  //state.chat.push(chatMessage);
  return chatMessage;
}

/**
 * Executes the reconnect helper used by the core module.
 * @param {Object} duel The duel object supplies the structured input used by the core module, including the `getField` property.
 * @param {Function} duel.getField The `getField` property supplies structured input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `reconnection` property.
 * @param {Object} state.reconnection The `reconnection` property supplies structured input used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `username` property.
 * @param {string} client.username The `username` property supplies structured input used by the core module.
 * @param {Object} message The message object supplies the structured input used by the core module, including the `room` property.
 * @param {(string|Object)} message.room The `room` property supplies structured input used by the core module.
 * @returns {void} Does not return a value.
 */
function reconnect(duel, state, client, message) {
  if (!state.reconnection[message.room]) {
    return;
  }
  if ((state.reconnection[message.room] = client.username)) {
    client.join(message.room);
  }
  if (message.room !== "spectator") {
    duel.getField();
  }
}

/**
 * Executes the join helper used by the core module.
 * @param {Object} duel The duel object supplies the structured input used by the core module, including the `getField` property.
 * @param {Function} duel.getField The `getField` property supplies structured input used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `player`, `started`, and `usernames` properties.
 * @param {(number|Array)} game.player The `player` property supplies structured input used by the core module.
 * @param {number} game.player.length The `player.length` property supplies structured input used by the core module.
 * @param {boolean} game.started The `started` property supplies structured input used by the core module.
 * @param {Object} game.usernames The `usernames` property supplies structured input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `clients` property.
 * @param {Array} state.clients The `clients` property supplies structured input used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `avatar`, `elo`, `id`, `points`, `ready`, `session`, `settings`, `slot`, and `username` properties.
 * @param {Object} client.avatar The `avatar` property supplies structured input used by the core module.
 * @param {string} client.avatar.url The `avatar.url` property supplies structured input used by the core module.
 * @param {number} client.elo The `elo` property supplies structured input used by the core module.
 * @param {string} client.id The `id` property supplies structured input used by the core module.
 * @param {number} client.points The `points` property supplies structured input used by the core module.
 * @param {boolean} client.ready The `ready` property supplies structured input used by the core module.
 * @param {Object} client.session The `session` property supplies structured input used by the core module.
 * @param {Object} client.settings The `settings` property supplies structured input used by the core module.
 * @param {number} client.slot The `slot` property supplies structured input used by the core module.
 * @param {string} client.username The `username` property supplies structured input used by the core module.
 * @param {Function} callback The callback value provides an input used by the core module.
 * @returns {void} Does not return a value.
 */
function join(duel, game, state, client, callback) {
  if (game.player.length < 2) {
    client.slot = game.player.length;
    game.player.push({
      id: client.id,
      wins: 0,
      ready: Boolean(client.ready),
      points: client.points,
      elo: client.elo,
      slot: client.slot,
      settings: client.settings,
      username: client.username,
      session: client.session,
      avatar: client.avatar ? client.avatar.url : "",
    });
    state.clients[client.slot] = client;
    game.usernames[client.slot] = client.username;
    callback();
    return;
  }

  client.slot = "spectator";
  client.join("spectator", function () {
    if (game.started) {
      duel.getField(client);
    }
    callback();
  });
}

/**
 * Executes the attempt join helper used by the core module.
 * @param {Object} duel The duel object supplies the structured input used by the core module, including the `getField` property.
 * @param {Function} duel.getField The `getField` property supplies structured input used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `started` property.
 * @param {boolean} game.started The `started` property supplies structured input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `clients` property.
 * @param {Array} state.clients The `clients` property supplies structured input used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `leave` and `slot` properties.
 * @param {Function} client.leave The `leave` property supplies structured input used by the core module.
 * @param {number} client.slot The `slot` property supplies structured input used by the core module.
 * @param {Function} callback The callback value provides an input used by the core module.
 * @returns {void} Does not return a value.
 */
function attemptJoin(duel, game, state, client, callback) {
  delete state.clients[client.slot];
  client.slot = undefined;
  client.leave("spectator", function (error) {
    if (error) {
      throw error;
    }
    join(duel, game, state, client, callback);
    if (game.started) {
      duel.getField(client);
    }
  });
  client.join("chat");
}

function createPuzzleClient(deck, slot) {
  const clonedDeck = cloneDeck(deck);

  function safetyCall(room, callback){
    if (typeof callback === "function") {
        callback(null);
      }
  }
  
  return {
    deck,
    ready: true,
    slot,
    join:safetyCall,
    leave:safetyCall,
    write() {},
    emit() {},
  };
}

function ensurePuzzleParticipants(game, state) {
  const puzzle = game.puzzle;
  if (!puzzle || !game.player[0] || !state.clients[0]) {
    return false;
  }

  const puzzleDeck = cloneDeck(puzzle.deck);
  state.clients[0].deck = cloneDeck(puzzleDeck);
  state.clients[0].ready = true;
  state.decks[0] = cloneDeck(puzzleDeck);
  game.decks = [cloneDeck(puzzleDeck)];
  game.aiName = puzzle.opponentName || "";
  game.opponentName = puzzle.opponentName || "";
  game.player[0].ready = true;

  if (game.player[1] && state.clients[1]) {
    return true;
  }

  const opponentName = puzzle.opponentName || "Puzzle Opponent";
  state.clients[1] = createPuzzleClient({}, 1);
  game.player[1] = {
    id: `puzzle:${game.puzzleId}:opponent`,
    wins: 0,
    ready: true,
    points: 0,
    elo: 1200,
    slot: 1,
    settings: {},
    username: opponentName,
    session: "",
    avatar: "",
  };
  game.usernames[1] = opponentName;

  return true;
}

/**
 * Executes the spectate helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `player` and `player[]` properties.
 * @param {(number|Array)} game.player The `player` property supplies structured input used by the core module.
 * @param {(number|Object)} game.player[] The `player[]` property supplies structured input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `clients` and `clients[]` properties.
 * @param {Array} state.clients The `clients` property supplies structured input used by the core module.
 * @param {number} state.clients.slot The `clients.slot` property supplies structured input used by the core module.
 * @param {Array} state.clients[] The `clients[]` property supplies structured input used by the core module.
 * @param {number} state.clients[].slot The `clients[].slot` property supplies structured input used by the core module.
 * @param {Object} message The message object supplies the structured input used by the core module, including the `slot` property.
 * @param {number} message.slot The `slot` property supplies structured input used by the core module.
 * @param {Object} user The user value provides an input used by the core module.
 * @returns {void} Does not return a value.
 */
function spectate(server, game, state, message, user) {
  const slot = message.slot;
  if (!game.player[slot]) {
    return;
  }
  state.clients[slot].slot = undefined;
  state.clients[slot].write({
    action: "leave",
    user: user,
  });
  state.clients[slot].join("spectator", function (error) {
    if (error) {
      throw error;
    }
  });
  game.player.splice(slot, 1);
  state.clients.splice(slot, 1);
  game.player.forEach(function (client, index) {
    state.clients.slot = index;
  });
  return;
}

/**
 * Executes the kick helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game value provides an input used by the core module.
 * @param {Object} state The state value provides an input used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `admin`, `slot`, and `username` properties.
 * @param {number} client.admin The `admin` property supplies structured input used by the core module.
 * @param {number} client.slot The `slot` property supplies structured input used by the core module.
 * @param {string} client.username The `username` property supplies structured input used by the core module.
 * @param {Object} message The message value provides an input used by the core module.
 * @returns {boolean} Returns the value produced by the core module.
 */
function kick(server, game, state, client, message) {
  if (client.slot !== 0 && !client.admin) {
    return false;
  }
  spectate(server, game, state, message, client.username);
  return true;
}

/**
 * Updates player used by the core module.
 * @param {(number|Object)} player The player value provides an input used by the core module.
 * @param {string} target The target value provides an input used by the core module.
 * @param {string} status The status value provides an input used by the core module.
 * @returns {void} Does not return a value.
 */
function updatePlayer(player, target, status) {
  player[target].ready = status;
}

/**
 * Executes the duel helper used by the core module.
 * @returns {Object} Returns the value produced by the core module.
 */
function Duel() {
  const duel = {};

      /**
   * Executes the failure helper used by the core module.
   * @returns {void} Does not return a value.
   */
  function failure() {
    throw new Error("Duel has not started");
  }

      /**
   * Executes the load helper used by the core module.
   * @param {Object} game The game object supplies the structured input used by the core module, including the `automatic`, `player`, `ranked`, and `shuffle` properties.
   * @param {(string|boolean)} game.automatic The `automatic` property supplies structured input used by the core module.
   * @param {(number|Object)} game.player The `player` property supplies structured input used by the core module.
   * @param {(string|boolean)} game.ranked The `ranked` property supplies structured input used by the core module.
 * @param {boolean} game.shuffle The `shuffle` property supplies structured input used by the core module.
   * @param {Object} state The state value provides an input used by the core module.
   * @param {Function} errorHandler The errorHandler value provides an input used by the core module.
   * @param {Array} players The players array supplies the ordered values used by the core module, each item uses the `main` property.
   * @param {Array} players[].main The `[].main` property describes data read from each item used by the core module.
 * @param {Array} spectators The spectators value provides an input used by the core module.
   * @returns {void} Does not return a value.
   */
  function load(game, state, errorHandler, players, spectators) {
    process.recordOutcome = new EventEmitter();
    process.matchKill = null;
    process.recordOutcome.once("win", function (command) {
      const traceId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const winnerSlot =
          typeof command === "number"
            ? command
            : Number.isFinite(Number(command?.winner))
              ? Number(command.winner)
              : Number(command?.player),
        loserSlot = Number.isFinite(winnerSlot)
          ? Math.abs(winnerSlot - 1)
          : null,
        winner = Number.isFinite(winnerSlot) ? game.player[winnerSlot] : null,
        loser = Number.isFinite(loserSlot) ? game.player[loserSlot] : null;

      // process.replay requires filtering.
      log(game.player, command);

      if (!winner || !loser) {
        log("Unable to resolve win payload", command);
        return;
      }

      process.send({
        action: "win",
        traceId,
        command,
        matchKill: process.matchKill,
        recentOcgMessages: process.lastOcgMessages,
        replay: process.replay,
        ranked: Boolean(game.ranked === "Ranked"),
        loserID: loser.id,
        loserSession: loser.session,
        winnerID: winner.id,
        winnerSession: winner.session,
      });
    });

    if (game.shuffle) {
      shuffle(players[0].main);
      shuffle(players[1].main);
    }

    if (game.automatic === "Automatic") {
      console.log("Starting Duel");
      const instance = automaticControlEngine.duel(
        game,
        state,
        errorHandler,
        players,
        spectators,
      );
      duel.respond = instance.respond;
      duel.getField = function (client) {
        client.write(instance.getField(client));
      };
      return;
    }

    const clientBinding = manualControlEngine.clientBinding(
        players,
        spectators,
      ),
      engine = field(clientBinding);

    engine.startDuel(players[0], players[1], true, game);
    duel.engine = engine;
    duel.surrender = manualControlEngine.surrender;
    duel.getField = function (client) {
      client.write({
        action: "ygopro",
        message: engine.getField(client.slot),
      });
    };
  }

  duel.getField = failure;
  duel.respond = failure;
  duel.load = load;

  return duel;
}

/**
 * Starts siding used by the core module.
 * @param {Array} players The players value provides an input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `clients` and `clients[]` properties.
 * @param {Array} state.clients The `clients` property supplies structured input used by the core module.
 * @param {Object} state.clients[].deck The `clients[].deck` property supplies structured input used by the core module.
 * @param {Function} state.clients[].leave The `clients[].leave` property supplies structured input used by the core module.
 * @param {Object} duel The duel value provides an input used by the core module.
 * @returns {void} Does not return a value.
 */
function startSiding(players, state, duel) {
  players.forEach(function (player, slot) {
    updatePlayer(players, slot, false);
  });
  state.clients.forEach(function (client) {
    client.leave("");
    client.write({
      action: "side",
      deck: client.deck,
    });
  });
  duel = new Duel();
}

/**
 * Executes the quit helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `port`, `roompass`, and `started` properties.
 * @param {number} game.port The `port` property supplies structured input used by the core module.
 * @param {string} game.roompass The `roompass` property supplies structured input used by the core module.
 * @param {boolean} game.started The `started` property supplies structured input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `ownerClient` property.
 * @param {Object} state.ownerClient The `ownerClient` property supplies structured input used by the core module.
 * @param {string} state.ownerClient.id The `ownerClient.id` property supplies structured input used by the core module.
 * @param {number} state.ownerClient.slot The `ownerClient.slot` property supplies structured input used by the core module.
 * @param {string} state.ownerClient.username The `ownerClient.username` property supplies structured input used by the core module.
 * @returns {(number|undefined)} Returns the value produced by the core module.
 */
function quit(server, game, state) {
  const reason = {
    action: "quit_notice",
    reason: "quit_called",
    game: {
      port: game?.port,
      roompass: game?.roompass,
      started: game?.started,
    },
    ownerClient: {
      username: state?.ownerClient?.username,
      slot: state?.ownerClient?.slot,
      id: state?.ownerClient?.id,
    },
  };
  
  process.send(reason);
  chat(
    server,
    state,
    {
      username: "[SYSTEM]",
    },
    "Game has expired!",
    undefined,
  );
  process.send({
    action: "quit",
    game: game,
  });
  return;
  return setTimeout(process.exit, CLEANUP_LATENCY);
}

/**
 * Executes the surrender helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `MODE`, `player`, `player[]`, and `started` properties.
 * @param {string} game.MODE The `MODE` property supplies structured input used by the core module.
 * @param {(number|Array)} game.player The `player` property supplies structured input used by the core module.
 * @param {(number|Object)} game.player[] The `player[]` property supplies structured input used by the core module.
 * @param {number} game.player[].wins The `player[].wins` property supplies structured input used by the core module.
 * @param {boolean} game.started The `started` property supplies structured input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `predetermined` property.
 * @param {Object} state.predetermined The `predetermined` property supplies structured input used by the core module.
 * @param {Object} duel The duel value provides an input used by the core module.
 * @param {number} slot The slot value provides an input used by the core module.
 * @returns {void} Does not return a value.
 */
function surrender(server, game, state, duel, slot) {
  const winner = Math.abs(slot - 1),
    winsNeeded = Math.max(1, Math.ceil(Number(game.bestOfLimit || 1) / 2));

  game.player[winner].wins = game.player[winner].wins + 1;
  game.started = false;

  if (game.player[winner].wins >= winsNeeded) {

    process.recordOutcome.emit("win", winner);
    chat(
      server,
      state,
      {
        username: "[SYSTEM]",
      },
      `${game.player[winner].username} has won!`,
      undefined,
    );
    quit(server, game, state);
    return;
  }

  startSiding(game.player, state, duel);

  state.predetermined = { slot };
}

/**
 * Executes the deck check helper used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `banlist`, `cardpool`, `deckcheck`, and `prerelease` properties.
 * @param {Array} game.banlist The `banlist` property supplies structured input used by the core module.
 * @param {string} game.cardpool The `cardpool` property supplies structured input used by the core module.
 * @param {boolean} game.deckcheck The `deckcheck` property supplies structured input used by the core module.
 * @param {boolean} game.prerelease The `prerelease` property supplies structured input used by the core module.
 * @param {Object} client The client value provides an input used by the core module.
 * @param {Object} message The message object supplies the structured input used by the core module, including the `deck` property.
 * @param {Object} message.deck The `deck` property supplies structured input used by the core module.
 * @returns {boolean} Returns the value produced by the core module.
 */
function deckCheck(game, client, message) {
  const validation = validateDeck(
    message.deck,
    banlist[game.banlist],
    database,
    game.cardpool,
    game.prerelease,
  );

  if (!game.deckcheck) {
    client.write({
      action: "lock",
      result: "success",
    });
    return true;
  }

  if (validation.error) {
    client.write({
      errorType: "validation",
      action: "error",
      error: validation.error,
      msg: validation,
    });
    return false;
  }

  client.write({
    action: "lock",
    result: "success",
  });
  return true;
}

/**
 * Determines whether ready should be treated as valid in the core module.
 * @param {Array} player The player array supplies the ordered values used by the core module, each item uses the `ready` property.
 * @param {boolean} player[].ready The `[].ready` property describes data read from each item used by the core module.
 * @param {number} slot The slot value provides an input used by the core module.
 * @returns {boolean} Returns `true` when ready is valid in the core module and `false` otherwise.
 */
function isReady(player, slot) {
  if (!Number.isInteger(slot)) {
    return false;
  }

  return Boolean(player?.[slot]?.ready);
}

/**
 * Checks side deck used by the core module.
 * @param {Object} oldDeck The oldDeck object supplies the structured input used by the core module, including the `extra`, `main`, and `side` properties.
 * @param {Array} oldDeck.extra The `extra` property supplies structured input used by the core module.
 * @param {number} oldDeck.extra.length The `extra.length` property supplies structured input used by the core module.
 * @param {Array} oldDeck.main The `main` property supplies structured input used by the core module.
 * @param {number} oldDeck.main.length The `main.length` property supplies structured input used by the core module.
 * @param {number} oldDeck.side The `side` property supplies structured input used by the core module.
 * @param {number} oldDeck.side.length The `side.length` property supplies structured input used by the core module.
 * @param {Object} newDeck The newDeck object supplies the structured input used by the core module, including the `extra`, `main`, and `side` properties.
 * @param {Array} newDeck.extra The `extra` property supplies structured input used by the core module.
 * @param {number} newDeck.extra.length The `extra.length` property supplies structured input used by the core module.
 * @param {Array} newDeck.main The `main` property supplies structured input used by the core module.
 * @param {number} newDeck.main.length The `main.length` property supplies structured input used by the core module.
 * @param {number} newDeck.side The `side` property supplies structured input used by the core module.
 * @param {number} newDeck.side.length The `side.length` property supplies structured input used by the core module.
 * @returns {boolean} Returns the value produced by the core module.
 */
function checkSideDeck(oldDeck, newDeck) {
  if (oldDeck.main.length !== newDeck.main.length) {
    return false;
  }
  if (oldDeck.extra.length !== newDeck.extra.length) {
    return false;
  }
  if (oldDeck.side.length !== newDeck.side.length) {
    return false;
  }

  const oldStack = [].concat(oldDeck.main, oldDeck.extra, oldDeck.side),
    newStack = [].concat(newDeck.main, newDeck.extra, newDeck.side);

  oldStack.sort();
  newStack.sort();

  return JSON.stringify(oldStack) === JSON.stringify(newStack);
}

/**
 * Executes the side helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `player` property.
 * @param {(number|Object)} game.player The `player` property supplies structured input used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `deck` and `slot` properties.
 * @param {Object} client.deck The `deck` property supplies structured input used by the core module.
 * @param {number} client.slot The `slot` property supplies structured input used by the core module.
 * @param {Object} message The message object supplies the structured input used by the core module, including the `deck` property.
 * @param {Object} message.deck The `deck` property supplies structured input used by the core module.
 * @returns {void} Does not return a value.
 */
function side(server, game, client, message) {
  if (!Number.isInteger(client.slot) || !game.player[client.slot]) {
    return;
  }

  if (isReady(game.player, client.slot)) {
    updatePlayer(game.player, client.slot, false);
    return;
  }

  const validSideOption = checkSideDeck(client.deck, message.deck);

  if (validSideOption) {
    client.deck = message.deck;
    updatePlayer(game.player, client.slot, true);
  }

  if (isReady(game.player, 0) && isReady(game.player, 1)) {
    clearField(server, game.player);
  }
}

/**
 * Executes the lock helper used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `player` and `started` properties.
 * @param {(number|Object)} game.player The `player` property supplies structured input used by the core module.
 * @param {boolean} game.started The `started` property supplies structured input used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `deck` and `slot` properties.
 * @param {Object} client.deck The `deck` property supplies structured input used by the core module.
 * @param {number} client.slot The `slot` property supplies structured input used by the core module.
 * @param {Object} message The message object supplies the structured input used by the core module, including the `deck` property.
 * @param {Object} message.deck The `deck` property supplies structured input used by the core module.
 * @returns {void} Does not return a value.
 */
function lock(game, client, message) {
  if (game.started) {
    return;
  }
  if (!Number.isInteger(client.slot) || !game.player[client.slot]) {
    return;
  }
  if (isReady(game.player, client.slot)) {
    updatePlayer(game.player, client.slot, false);
    delete client.deck;
    return;
  }
  try {
    updatePlayer(game.player, client.slot, deckCheck(game, client, message));
    client.deck = message.deck;
  } catch (error) {
    updatePlayer(game.player, client.slot, false);
    delete client.deck;
    throw error;
  }
}

/**
 * Executes the player abstraction helper used by the core module.
 * @param {Object} server The server object supplies the structured input used by the core module, including the `room` property.
 * @param {Function} server.room The `room` property supplies structured input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `reconnection` property.
 * @param {Object} state.reconnection The `reconnection` property supplies structured input used by the core module.
 * @param {Object} room The room value provides an input used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `deck` and `username` properties.
 * @param {Object} client.deck The `deck` property supplies structured input used by the core module.
 * @param {string} client.username The `username` property supplies structured input used by the core module.
 * @returns {Object} Returns the value produced by the core module.
 */
function PlayerAbstraction(server, state, room, client) {
  if (client.username) {
    client.join(room);
    state.reconnection[room] = client.username;
  }
  server.room(room).write({
    action: "reconnection",
    room: room,
  });

  return Object.assign({}, client.deck, {
    write: function (data) {
      server.room(room).write({
        action: "ygopro",
        message: data,
      });
    },
  });
}

/**
 * Executes the determine helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `player`, `player[]`, `predetermined`, `start_game`, and `started` properties.
 * @param {(number|Array)} game.player The `player` property supplies structured input used by the core module.
 * @param {(number|Object)} game.player[] The `player[]` property supplies structured input used by the core module.
 * @param {boolean} game.player[].ready The `player[].ready` property supplies structured input used by the core module.
 * @param {Object} game.predetermined The `predetermined` property supplies structured input used by the core module.
 * @param {string} game.start_game The `start_game` property supplies structured input used by the core module.
 * @param {boolean} game.started The `started` property supplies structured input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `clients`, `clients[]`, `predetermined`, and `verification` properties.
 * @param {Array} state.clients The `clients` property supplies structured input used by the core module.
 * @param {Array} state.clients[] The `clients[]` property supplies structured input used by the core module.
 * @param {Object} state.predetermined The `predetermined` property supplies structured input used by the core module.
 * @param {number} state.predetermined.slot The `predetermined.slot` property supplies structured input used by the core module.
 * @param {string} state.verification The `verification` property supplies structured input used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `slot` property.
 * @param {number} client.slot The `slot` property supplies structured input used by the core module.
 * @returns {void} Does not return a value.
 */
function determine(server, game, state, client) {
  if (!game.player[0] || !game.player[1]) {
    return;
  }

  if (client.slot !== 0 && !game.predetermined) {
    return;
  }

  if (!game.player[0].ready && !game.player[1].ready) {
    return;
  }

  game.started = true;
  state.verification = randomUUID();

  if (state.predetermined) {
    const oppossingPlayer = Math.abs(state.predetermined.slot - 1),
      defeatedPlayer = state.predetermined.slot;

    server.write({
      action: "start",
    });
    state.clients[defeatedPlayer].write({
      action: "turn_player",
      verification: state.verification,
    });
    state.clients[oppossingPlayer].write({
      action: "choice",
      type: "waiting",
    });
    return;
  }

  choice(state.clients, game.start_game).then(function () {
    server.write({
      action: "start",
    });
    state.clients[0].write({
      action: "turn_player",
      verification: state.verification,
    });
    state.clients[1].write({
      action: "choice",
      type: "waiting",
    });
  });
}

/**
 * Executes the start helper used by the core module.
 * @param {Object} server The server object supplies the structured input used by the core module, including the `empty` property.
 * @param {Function} server.empty The `empty` property supplies structured input used by the core module.
 * @param {Object} duel The duel object supplies the structured input used by the core module, including the `load` property.
 * @param {Function} duel.load The `load` property supplies structured input used by the core module.
 * @param {Object} game The game value provides an input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `clients`, `clients[]`, and `verification` properties.
 * @param {Array} state.clients The `clients` property supplies structured input used by the core module.
 * @param {Array} state.clients[] The `clients[]` property supplies structured input used by the core module.
 * @param {number} state.clients[].slot The `clients[].slot` property supplies structured input used by the core module.
 * @param {string} state.verification The `verification` property supplies structured input used by the core module.
 * @param {Object} message The message object supplies the structured input used by the core module, including the `turn_player` and `verification` properties.
 * @param {number} message.turn_player The `turn_player` property supplies structured input used by the core module.
 * @param {string} message.verification The `verification` property supplies structured input used by the core module.
 * @returns {void} Does not return a value.
 */
function start(server, duel, game, state, message) {
  if (message.verification !== state.verification) {
    throw "Incorrect Validation Code";
  }
  if (message.turn_player) {
    state.clients = state.clients.reverse();
    state.clients[0].slot = 0;
    state.clients[1].slot = 1;
  }

  server.empty("player1");
  server.empty("player2");

  const players = [
      new PlayerAbstraction(server, state, "player1", state.clients[0]),
      new PlayerAbstraction(server, state, "player2", state.clients[1]),
    ],
    spectators = new PlayerAbstraction(server, state, "spectator", {});

  duel.load(
    game,
    state,
    function (error, type) {
      chat(
        server,
        state,
        {
          username: "[SYSTEM]",
        },
        error,
        undefined,
      );
    },
    players,
    spectators,
  );
}

function autoStartPuzzle(server, duel, game, state) {
  if (game.started || !ensurePuzzleParticipants(game, state)) {
    return false;
  }

  game.started = true;
  state.verification = randomUUID();
  server.write({
    action: "start",
  });
  start(server, duel, game, state, {
    verification: state.verification,
    turn_player: normalizeStartingPlayerSlot(game.puzzleStartingPlayerSlot),
  });
  return true;
}

/**
 * Executes the question helper used by the core module.
 * @param {Object} duel The duel object supplies the structured input used by the core module, including the `respond` property.
 * @param {Function} duel.respond The `respond` property supplies structured input used by the core module.
 * @param {Object} client The client value provides an input used by the core module.
 * @param {Object} message The message value provides an input used by the core module.
 * @returns {void} Does not return a value.
 */
function question(duel, client, message) {
  duel.respond(message);
}

/**
 * Executes the requires manual engine helper used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `automatic` and `started` properties.
 * @param {(string|boolean)} game.automatic The `automatic` property supplies structured input used by the core module.
 * @param {boolean} game.started The `started` property supplies structured input used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `slot` property.
 * @param {number} client.slot The `slot` property supplies structured input used by the core module.
 * @returns {(boolean|undefined)} Returns the value produced by the core module.
 */
function requiresManualEngine(game, client) {
  if (game.automatic !== "Manual") {
    return;
  }
  if (!game.started) {
    return;
  }
  if (client.slot === undefined) {
    return;
  }
  return true;
}

/**
 * Executes the process message helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} duel The duel object supplies the structured input used by the core module, including the `engine` property.
 * @param {Object} duel.engine The `engine` property supplies structured input used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `usernames` property.
 * @param {Object} game.usernames The `usernames` property supplies structured input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `clients` and `decks` properties.
 * @param {Array} state.clients The `clients` property supplies structured input used by the core module.
 * @param {Array} state.decks The `decks` property supplies structured input used by the core module.
 * @param {Object} client The client object supplies the structured input used by the core module, including the `slot` and `username` properties.
 * @param {number} client.slot The `slot` property supplies structured input used by the core module.
 * @param {string} client.username The `username` property supplies structured input used by the core module.
 * @param {Object} message The message object supplies the structured input used by the core module, including the `action`, `answer`, `deck`, and `message` properties.
 * @param {string} message.action The `action` property supplies structured input used by the core module.
 * @param {Object} message.answer The `answer` property supplies structured input used by the core module.
 * @param {Object} message.deck The `deck` property supplies structured input used by the core module.
 * @param {Object} message.message The `message` property supplies structured input used by the core module.
 * @returns {void} Does not return a value.
 */
function processMessage(server, duel, game, state, client, message) {
  if (!message.action) {
    console.log("Malformed message received");
    return;
  }
  if (!client.username) {
    console.log("Unauthenticated message received");
    register(client, message);
    return;
  }

  switch (message.action) {
    case "chat":
      chat(server, state, client, message.message, undefined);
      break;
    case "determine":
      determine(server, game, state, client);
      broadcast(server, game);
      break;
    case "join":
      attemptJoin(duel, game, state, client, function () {
        if (game.puzzle && !game.started) {
          ensurePuzzleParticipants(game, state);
        }
        broadcast(server, game);
        client.write({
          action: "slot",
          slot: client.slot,
        });
        if (autoStartPuzzle(server, duel, game, state)) {
          broadcast(server, game);
        }
      });
      break;
    case "kick":
      if (client.slot === undefined) {
        attemptJoin(duel, game, state, client, function () {
          broadcast(server, game);
        });
        return;
      }
      kick(server, game, state, client, message);
      broadcast(server, game);
      break;
    case "lock":
      lock(game, client, message);
      broadcast(server, game);
      if (Number.isInteger(client.slot)) {
        state.decks[client.slot] = message.deck;
      }
      break;
    case "reconnect":
      reconnect(duel, state, client, message);
      break;
    case "question":
        console.log("Question received from engine", message);
      question(duel, client, message);
      break;
    case "spectate":
      spectate(server, game, state, message, client.username);
      broadcast(server, game);
      break;
    case "start":
      start(server, duel, game, state, message);
      broadcast(server, game);
      break;
    case "surrender":
      chat(
        server,
        state,
        {
          username: "[SYSTEM]",
        },
        `${game.usernames[client.slot]} surrendered`,
      );
      surrender(server, game, state, duel, client.slot);
      broadcast(server, game);
      break;
    case "side":
      side(server, game, client, message);
      broadcast(server, game);
      break;
    case "choice":
      client.emit("choice", message.answer);
      break;
    case "restart":
      break;
    default:
      break;
  }
  if (!requiresManualEngine(game, client)) {
    return;
  }
  if (!duel.engine) {
    return;
  }
  manualControlEngine.responseHandler(
    duel.engine,
    state.clients,
    client,
    message,
  );
}

/**
 * Executes the message handler helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} duel The duel value provides an input used by the core module.
 * @param {Object} game The game value provides an input used by the core module.
 * @param {Object} state The state value provides an input used by the core module.
 * @param {Object} client The client value provides an input used by the core module.
 * @param {Object} message The message value provides an input used by the core module.
 * @returns {void} Does not return a value.
 */
function messageHandler(server, duel, game, state, client, message) {
  try {
    processMessage(server, duel, game, state, client, message);
  } catch (error) {
    if (!process.child) {
      // while using a direct debugger, kill the process and investigate.
      throw error;
    }
    log(error);
    client.write({
      error: error.message,
      stack: error.stack,
      input: message,
    });
  }
}

/**
 * Counts clients used by the core module.
 * @param {Array} server The server value provides an input used by the core module.
 * @param {Object} game The game value provides an input used by the core module.
 * @param {Object} state The state value provides an input used by the core module.
 * @returns {number} Returns the value produced by the core module.
 */
function countClients(server, game, state) {
  const total = [];
  // WebSocket does not have an reduce method, or length property.
  server.forEach((spark, id) => {
    total.push(id);
  });
  return total.length;
}

/**
 * Disconnects ion handler used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} duel The duel value provides an input used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `port` and `roompass` properties.
 * @param {number} game.port The `port` property supplies structured input used by the core module.
 * @param {string} game.roompass The `roompass` property supplies structured input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `ownerClient` property.
 * @param {Object} state.ownerClient The `ownerClient` property supplies structured input used by the core module.
 * @param {Object} deadSpark The deadSpark object supplies the structured input used by the core module, including the `session` and `slot` properties.
 * @param {Object} deadSpark.session The `session` property supplies structured input used by the core module.
 * @param {number} deadSpark.slot The `slot` property supplies structured input used by the core module.
 * @returns {void} Does not return a value.
 */
function disconnectionHandler(server, duel, game, state, deadSpark) {

  const message = {
    action: "spectate",
    slot: deadSpark.slot,
  };
  if (deadSpark.session) {
    verificationSystem.removeListener("client.session", function () {});
  }
  if (state.ownerClient === deadSpark) {

    quit(server, game, state);
    return;
  }
  if (!countClients(server)) {
    console.log("[tcgcore/lifecycle] no connected clients remain, quitting process", {
      port: game?.port,
      roompass: game?.roompass,
    });
    quit(server, game, state);
    return;
  }
  try {
    messageHandler(server, duel, game, state, deadSpark, message);
  } catch (error) {
    log(error);
    process.send({
      action: "error",
      error: error,
    });
  }
}

/**
 * Executes the admin message handler helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game value provides an input used by the core module.
 * @param {Object} message The message object supplies the structured input used by the core module, including the `action`, `error`, `person`, `session`, and `valid` properties.
 * @param {string} message.action The `action` property supplies structured input used by the core module.
 * @param {string} message.error The `error` property supplies structured input used by the core module.
 * @param {Object} message.person The `person` property supplies structured input used by the core module.
 * @param {Object} message.session The `session` property supplies structured input used by the core module.
 * @param {boolean} message.valid The `valid` property supplies structured input used by the core module.
 * @returns {Function} Returns the value produced by the core module.
 */
function adminMessageHandler(server, game, message) {
  switch (message.action) {
    case "kill":
      console.log("[tcgcore/lifecycle] kill command received, quitting process", message);
      //process.exit(0);
      break;
    case "shutdown_after_win":
      console.log("[tcgcore/lifecycle] shutdown_after_win command received, quitting process", message);
      //process.exit(0);
      break;
    case "kick":
      kick(game, { admin: true }, message);
      break;
    case "lobby":
      broadcast(server, game);
      break;
    case "register":
      verificationSystem.emit(
        message.session,
        message.error,
        message.valid,
        message.person,
      );
      break;
    default:
      break;
  }
  return undefined;
}

/**
 * Executes the notify helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game value provides an input used by the core module.
 * @param {Object} state The state value provides an input used by the core module.
 * @returns {number} Returns the value produced by the core module.
 */
function notify(server, game, state) {
  chat(
    server,
    state,
    {
      username: "[SYSTEM]",
    },
    "Game will expire soon!",
    undefined,
  );
  return setTimeout(quit, WARNING_COUNTDOWN, server, game, state);
}

/**
 * Executes the interaction check helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game value provides an input used by the core module.
 * @param {Object} state The state value provides an input used by the core module.
 * @returns {void} Does not return a value.
 */
function interactionCheck(server, game, state) {
  if (new Date().getTime() - lastInteraction.getTime() > WARNING_COUNTDOWN) {
    quit(server, game, state);
  }
}

/**
 * Executes the life cycle helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game value provides an input used by the core module.
 * @param {Object} state The state value provides an input used by the core module.
 * @returns {number} Returns the value produced by the core module.
 */
function LifeCycle(server, game, state) {
  setInterval(interactionCheck, CLEANUP_LATENCY, server, game, state);
  return setTimeout(notify, MAX_GAME_TIME, server, game, state);
}

/**
 * Executes the boot helper used by the core module.
 * @param {Object} httpserver The httpserver object supplies the structured input used by the core module, including the `listen` property.
 * @param {Function} httpserver.listen The `listen` property supplies structured input used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game object supplies the structured input used by the core module, including the `port` and `roompass` properties.
 * @param {number} game.port The `port` property supplies structured input used by the core module.
 * @param {string} game.roompass The `roompass` property supplies structured input used by the core module.
 * @param {Object} state The state object supplies the structured input used by the core module, including the `lifeCycle` and `password` properties.
 * @param {string} state.lifeCycle The `lifeCycle` property supplies structured input used by the core module.
 * @param {string} state.password The `password` property supplies structured input used by the core module.
 * @returns {void} Does not return a value.
 */
function boot(httpserver, server, game, state) {
  state.lifeCycle = new LifeCycle(server, game, state);

  httpserver.listen(game.port, function () {
    process.on("message", function (message) {
      lastInteraction = new Date();
      try {
        adminMessageHandler(server, game, message);
      } catch (error) {
        log(error);
        process.send({
          action: "error",
          error: error,
        });
      }
    });

    broadcast(server, game);

    process.send({
      action: "ready",
      roompass: game.roompass,
      password: state.password,
      port: game.port,
      game,
    });
  });
}

/**
 * Executes the game helper used by the core module.
 * @param {Object} configuration The configuration value provides an input used by the core module.
 * @returns {Object} Returns the value produced by the core module.
 */
function Game(configuration) {
  const hostConfig = parseHostConfig(configuration || {});
  const mode = resolveModeLabel(hostConfig);
  const puzzle = hostConfig.puzzleId ? getPuzzleConfig(hostConfig.puzzleId) : null;
  const game = {
    automatic: "Automatic",
    banlist: puzzle ? "Puzzle" : hostConfig.banlist,
    allowedCards: hostConfig.allowedCards,
    allowedCardsLabel: resolveAllowedCardsLabel(hostConfig.allowedCards),
    cardpool: resolveAllowedCardsLabel(hostConfig.allowedCards),
    deckcheck: !hostConfig.noCheckDeckContents,
    decks: puzzle ? [cloneDeck(puzzle.deck)] : [],
    drawCountPerTurn: hostConfig.team1.drawCountPerTurn,
    locked: Boolean(hostConfig.password),
    masterRule: resolveMasterRule(hostConfig.rulePreset),
    mode,
    MODE: mode,
    port: hostConfig.hostPort || 8082,
    hostPort: hostConfig.hostPort || 8082,
    player: [],
    bestOf: hostConfig.bestOf,
    bestOfLimit: hostConfig.bestOf,
    priority: false,
    prerelease: hostConfig.allowedCards === "prerelease",
    roompass: hostConfig.roompass || randomUUID(),
    roomName: hostConfig.roomName || puzzle?.roomName || "Hosted Duel",
    password: hostConfig.password,
    ranked: puzzle ? "Puzzle" : "Exhibition",
    rule: 0,
    relay: hostConfig.relay,
    shuffle: !hostConfig.noShuffleDeck,
    started: false,
    startingLP: hostConfig.team1.startingLP,
    startingDrawCount: hostConfig.team1.startingDrawCount,
    timeLimitSeconds: hostConfig.timeLimitSeconds,
    team1Count: hostConfig.team1Count,
    team2Count: hostConfig.team2Count,
    team1: hostConfig.team1,
    team2: hostConfig.team2,
    deckLimits: hostConfig.deckLimits,
    customRules: hostConfig.customRules,
    forbiddenTypes: hostConfig.forbiddenTypes,
    extraRules: hostConfig.extraRules,
    notes: hostConfig.notes,
    noShuffleDeck: hostConfig.noShuffleDeck,
    noCheckDeckContents: hostConfig.noCheckDeckContents,
    noCheckDeckSize: hostConfig.noCheckDeckSize,
    tcgSegocRulings: hostConfig.tcgSegocRulings,
    rulePreset: hostConfig.rulePreset,
    tournamentId: hostConfig.tournamentId,
    tournamentSlug: hostConfig.tournamentSlug,
    tournamentMatchId: hostConfig.tournamentMatchId,
    puzzleId: puzzle?.id || "",
    puzzleName: puzzle?.name || "",
    puzzleDescription: puzzle?.description || "",
    puzzleStartingPlayerSlot: normalizeStartingPlayerSlot(
      puzzle?.startingPlayerSlot
    ),
    aiName: puzzle?.opponentName || "",
    opponentName: puzzle?.opponentName || "",
    usernames: [],
    start_game: puzzle ? "puzzle" : "rps"
  };

  if (puzzle) {
    Object.defineProperty(game, "puzzle", {
      value: puzzle,
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }

  return game;
}

/**
 * Executes the state helper used by the core module.
 * @param {Object} server The server value provides an input used by the core module.
 * @param {Object} game The game value provides an input used by the core module.
 * @returns {Object} Returns the value produced by the core module.
 */
function State(server, game) {
  return {
    clients: [],
    chat: [],
    decks: [],
    ownerClient: null,
    password: game?.password || "",
    reconnection: {},
    verification: randomUUID(),
  };
}

/* eslint-disable no-sync */
/**
 * Executes the httpserver helper used by the core module.
 * @returns {Object} Returns the value produced by the core module.
 */
function HTTPServer() {
  const keyFile = path.resolve(process.env.SSL + "\\private.key"),
    certFile = path.resolve(process.env.SSL + "\\certificate.crt"),
    app = express();

  try {
    const privateKey = fs.readFileSync(keyFile).toString(),
      certificate = fs.readFileSync(certFile).toString();

    return https.createServer(
      {
        key: privateKey,
        cert: certificate,
      },
      app,
    );
  } catch (nossl) {
    return http.createServer(app);
  }
}

/**
 * Creates native web socket used by the core module.
 * @param {Object} httpserver The httpserver value provides an input used by the core module.
 * @returns {Object} Returns the value produced by the core module.
 */
function createNativeWebSocket(httpserver) {
  const wss = new WebSocketServer({ server: httpserver }),
    sockets = new Set(),
    socketRooms = new Map(),
    roomSockets = new Map(),
    disconnectionHandlers = [],
    errorHandlers = [];
  let connectionHandler = null;

      /**
   * Sends packet used by the core module.
   * @param {Object} socket The socket object supplies the structured input used by the core module, including the `readyState` property.
   * @param {Object} socket.readyState The `readyState` property supplies structured input used by the core module.
   * @param {Object} packet The packet value provides an input used by the core module.
   * @returns {void} Does not return a value.
   */
  function sendPacket(socket, packet) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(
      JSON.stringify(packet, function (_key, value) {
        return typeof value === "bigint" ? Number(value) : value;
      }),
    );
  }

      /**
   * Joins room used by the core module.
   * @param {Object} socket The socket value provides an input used by the core module.
   * @param {Object} room The room value provides an input used by the core module.
   * @returns {void} Does not return a value.
   */
  function joinRoom(socket, room) {
    if (!socketRooms.has(socket)) {
      socketRooms.set(socket, new Set());
    }
    socketRooms.get(socket).add(room);

    if (!roomSockets.has(room)) {
      roomSockets.set(room, new Set());
    }
    roomSockets.get(room).add(socket);
  }

      /**
   * Executes the leave room helper used by the core module.
   * @param {Object} socket The socket value provides an input used by the core module.
   * @param {Object} room The room value provides an input used by the core module.
   * @returns {void} Does not return a value.
   */
  function leaveRoom(socket, room) {
    if (!room) {
      const rooms = socketRooms.get(socket);
      if (!rooms) {
        return;
      }
      rooms.forEach((roomName) => leaveRoom(socket, roomName));
      return;
    }

    const rooms = socketRooms.get(socket);
    if (rooms) {
      rooms.delete(room);
      if (rooms.size === 0) {
        socketRooms.delete(socket);
      }
    }
    const socketsInRoom = roomSockets.get(room);
    if (socketsInRoom) {
      socketsInRoom.delete(socket);
      if (socketsInRoom.size === 0) {
        roomSockets.delete(room);
      }
    }
  }

      /**
   * Executes the decorate socket helper used by the core module.
   * @param {Object} socket The socket object supplies the structured input used by the core module, including the `address`, `disconnect`, `leave`, and `readyState` properties.
   * @param {Object} socket.address The `address` property supplies structured input used by the core module.
   * @param {Function} socket.disconnect The `disconnect` property supplies structured input used by the core module.
   * @param {Function} socket.leave The `leave` property supplies structured input used by the core module.
   * @param {Object} socket.readyState The `readyState` property supplies structured input used by the core module.
   * @param {Object} request The request request object provides the incoming data used by the core route, including the `socket` property.
   * @param {Object} request.socket The `socket` property supplies structured input used by the core module.
   * @param {string} request.socket.remoteAddress The `socket.remoteAddress` property supplies structured input used by the core module.
   * @returns {void} Does not return a value.
   */
  function decorateSocket(socket, request) {
    const nativeOn = socket.on.bind(socket),
      dataHandlers = [];

    socket.address = {
      ip: request?.socket?.remoteAddress || "",
    };
    socket.write = function (packet) {
      sendPacket(socket, packet);
    };
    socket.disconnect = function () {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };
    socket.join = function (room, callback) {
      joinRoom(socket, room);
      if (typeof callback === "function") {
        callback(null);
      }
    };
    socket.leave = function (room, callback) {
      leaveRoom(socket, room);
      if (typeof callback === "function") {
        callback(null);
      }
    };

    socket.on = function (event, handler) {
      if (event === "data") {
        dataHandlers.push(handler);
        return socket;
      }
      nativeOn(event, handler);
      return socket;
    };

    nativeOn("message", function (raw) {
      let parsed;
      try {
        parsed = JSON.parse(raw.toString());
      } catch (_error) {
        return;
      }
      dataHandlers.forEach((handler) => handler(parsed));
    });

    nativeOn("close", function () {
      leaveRoom(socket);
      sockets.delete(socket);
      disconnectionHandlers.forEach((handler) => handler(socket));
    });

    nativeOn("error", function (error) {
      errorHandlers.forEach((handler) => handler(error));
    });
  }

  wss.on("connection", function (socket, request) {
    sockets.add(socket);
    decorateSocket(socket, request);
    if (typeof connectionHandler === "function") {
      connectionHandler(socket);
    }
  });

  wss.on("error", function (error) {
    errorHandlers.forEach((handler) => handler(error));
  });

  return {
    Spark: {
      CLOSED: WebSocket.CLOSED,
    },
            /**
     * Executes the plugin helper used by the core module.
     * @returns {Object} Returns the value produced by the core module.
     */
    plugin() {
      return undefined;
    },
            /**
     * Executes the on helper used by the core module.
     * @param {Object} event The event event provides the browser event data used by the core module.
     * @param {Function} handler The handler value provides an input used by the core module.
     * @returns {void} Does not return a value.
     */
    on(event, handler) {
      if (event === "connection") {
        connectionHandler = handler;
        return;
      }
      if (event === "disconnection") {
        disconnectionHandlers.push(handler);
        return;
      }
      if (event === "error") {
        errorHandlers.push(handler);
      }
    },
            /**
     * Executes the write helper used by the core module.
     * @param {Object} packet The packet value provides an input used by the core module.
     * @returns {void} Does not return a value.
     */
    write(packet) {
      sockets.forEach((socket) => {
        sendPacket(socket, packet);
      });
    },
            /**
     * Executes the for each helper used by the core module.
     * @param {Function} handler The handler value provides an input used by the core module.
     * @returns {void} Does not return a value.
     */
    forEach(handler) {
      sockets.forEach((socket) => {
        handler(socket, socket.id);
      });
    },
            /**
     * Executes the empty helper used by the core module.
     * @param {string} roomName The roomName value provides an input used by the core module.
     * @returns {void} Does not return a value.
     */
    empty(roomName) {
      const socketsInRoom = roomSockets.get(roomName);
      if (!socketsInRoom) {
        return;
      }

      Array.from(socketsInRoom).forEach((socket) => {
        leaveRoom(socket, roomName);
      });
    },
            /**
     * Executes the room helper used by the core module.
     * @param {string} roomName The roomName value provides an input used by the core module.
     * @returns {Object} Returns the value produced by the core module.
     */
    room(roomName) {
      return {
                        /**
         * Executes the write helper used by the core module.
         * @param {Object} packet The packet value provides an input used by the core module.
         * @returns {void} Does not return a value.
         */
        write(packet) {
          const socketsInRoom = roomSockets.get(roomName);
          if (!socketsInRoom) {
            return;
          }
          socketsInRoom.forEach((socket) => {
            sendPacket(socket, packet);
          });
        },
      };
    },
  };
}

/**
 * Executes the web socket instance helper used by the core module.
 * @param {Object} httpserver The httpserver value provides an input used by the core module.
 * @returns {Object} Returns the value produced by the core module.
 */
function WebSocketInstance(httpserver) {
  return createNativeWebSocket(httpserver);
}

/**
 * Executes the main helper used by the core module.
 * @param {Object} configuration The configuration object supplies the structured input used by the core module, including the `production` property.
 * @param {boolean} configuration.production The `production` property supplies structured input used by the core module.
 * @param {Function} callback The callback value provides an input used by the core module.
 * @returns {Object} Returns the value produced by the core module.
 */
function main(configuration, callback) {
  // If the callback is given, use the callback,
  // otherwise report to parent process if it exist,
  // if it does not, print to the console.

  process.on("unhandledException", function (fatal) {
    console.log("[tcgcore/process] unhandledException", {
      message: fatal?.message,
      stack: fatal?.stack,
    });
    log(fatal);
    process.send({
      action: "process_error",
      type: "unhandledException",
      error: {
        message: fatal?.message,
        stack: fatal?.stack,
      },
    });
  });

  process.on("uncaughtException", function (fatal) {
    console.log("[tcgcore/process] uncaughtException", {
      message: fatal?.message,
      stack: fatal?.stack,
    });
    log(fatal);
    process.send({
      action: "process_error",
      type: "uncaughtException",
      error: {
        message: fatal?.message,
        stack: fatal?.stack,
      },
    });
  });

  process.on("unhandledRejection", function (reason) {
    console.log("[tcgcore/process] unhandledRejection", reason);
    log(reason);
    process.send({
      action: "process_error",
      type: "unhandledRejection",
      error: {
        message: reason?.message || String(reason),
        stack: reason?.stack,
      },
    });
  });

  configuration = parseHostConfig(
    typeof configuration === "object" ? configuration : {},
  );
  process.child = process.send ? true : false;
  process.send = callback ? callback : process.send;
  process.send = process.send ? process.send : log;
  process.hostConfiguration = configuration;

  const duel = new Duel(),
    game = new Game(configuration),
    httpserver = new HTTPServer(),
    server = new WebSocketInstance(httpserver),
    state = new State(server, game),
    title = `YGOSalvation Core on port: ${game.port} pid: ${process.pid}`;

  process.title = title;
  if (configuration.production) {
    // server.save(__dirname + '/../../http/js/vendor/server.js');
  }
  process.on("exit", function (code) {
    console.log("[tcgcore/process] exit", {
      code,
      port: game?.port,
      roompass: game?.roompass,
      started: game?.started,
    });
    process.send({
      action: "process_exit",
      code,
      game: {
        port: game?.port,
        roompass: game?.roompass,
        started: game?.started,
      },
    });
  });
  server.on("connection", function (client) {
    if (!state.ownerClient) {
      state.ownerClient = client;
    }
    client.on("data", function (message) {
      console.log("[tcgcore/ws] received packet from proxy/browser", {
        clientId: client.id,
        username: client.username,
        action: message?.action,
        message,
      });
      log("Message", message);
      messageHandler(server, duel, game, state, client, message);
    });
    broadcast(server, game);
  });
  server.on("disconnection", function (deadSpark) {
    disconnectionHandler(server, duel, game, state, deadSpark);
  });
  server.on("error", function (error) {
    console.log("[tcgcore/ws] server error", {
      message: error?.message,
      stack: error?.stack,
      port: game?.port,
    });
    process.send({
      action: "process_error",
      type: "websocket_server_error",
      error: {
        message: error?.message,
        stack: error?.stack,
      },
      game: {
        port: game?.port,
        roompass: game?.roompass,
      },
    });
  });

  boot(httpserver, server, game, state);

  log(title);

  return {
    duel,
    game,
    httpserver,
    server,
    state,
  };
}

module.exports = {
  main,
  State,
  Game,
  processMessage,
};


