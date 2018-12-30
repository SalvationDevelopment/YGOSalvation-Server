/**
 * OCGCore, the YGOPro game engine, is very unstable. Its a C++ library that will cause
 * a crash if it sees improper logic in the Lua scripts it dynamically loads  in that
 * represent the game logic of individual cards. For that reason the room system wrapping
 * it runs in is a sperate child process. 
 * 
 * Configuration is passed via enviromental variables.
 */


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
 */

const WARNING_COUNTDOWN = 300000,
    CLEANUP_LATENCY = 10000,
    MAX_GAME_TIME = 3300000,
    banlist = './http/manifest/banlist.json',
    database = require('../http/manifest/manifest_0-en-OCGTCG.json'),
    dotenv = require('dotenv'),
    EventEmitter = require('events'),
    fileStream = require('node-static'),
    http = require('http'),
    ocgcore = require('./engine_ocgcore'),
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    sanitize = require('./lib_html_sanitizer.js'),
    uuid = require('uuid/v4'),
    validateDeck = require('./validate_deck.js'),
    verificationSystem = new EventEmitter();

let lastInteraction = new Date();


/**
 * Start a static HTTP web server.
 * @param {Object} request incoming http request
 * @param {Object} response outgoing response handler
 * @returns {void}
 */
function staticWebServer(request, response) {
    const server = new fileStream.Server('../http', { cache: 0 });
    request.addListener('end', function() {
        server.serve(request, response);
    }).resume();
}


/**
 * Broadcast current game lobby status to connected clients and management system.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @returns {void}
 */
function broadcast(server, game) {
    server.write({
        action: 'lobby',
        game
    });
    process.send({
        action: 'lobby',
        game
    });
}

/**
 * Report back to the client that they are registered.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {User} person User definition and details.
 * @returns {void}
 */
function enableClient(client, person) {
    client.username = person.username;
    client.avatar = person.avatar;
    client.ranking = person.ranking;
    client.write({
        action: 'registered'
    });

    if (person.decks) {
        client.write({
            action: 'decks',
            decks: person.decks
        });
    }
}

/**
 * Register the user with the server via external authentication, if avaliable.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void}
 */
function register(client, message) {

    if (!process.child) {
        enableClient(client, message);
        return;
    }

    if (typeof message.session !== 'string') {
        throw Error('Session information required to proceed');
    }

    client.session = message.session;
    verificationSystem.once(message.session, function(error, valid, person) {
        if (error) {
            throw error;
        }
        if (valid) {
            enableClient(client, person);
            return;
        }
    });
    process.send({
        action: 'register',
        username: message.username,
        session: message.session
    });
}

/**
 * Chat with other users.
 * @param {Object} server Primus instance.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {String} message JSON communication sent from client.
 * @param {Date} date built in date object, used for timestamping.
 * @returns {Object} formated chat message.
 */
function chat(server, state, client, message, date) {
    date = date || new Date();
    const chatMessage = {
        action: 'chat',
        message: sanitize(message),
        username: client.username,
        date: date.toISOString()
    };
    server.room('chat').write(chatMessage);
    state.chat.push(chatMessage);
    return chatMessage;
}

/**
 * If authorized reconnect a client to an active duel.
 * @param {Duel} duel OCGCore Instance
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void}
 */
function reconnect(duel, state, client, message) {
    if (!state.reconnection[message.room]) {
        return;
    }
    if (state.reconnection[message.room] = client.username) {
        client.join(message.room);
    }
    if (message.room !== 'spectator') {
        duel.getField();
    }

}

/**
 * Join the user to a room
 * @param {Error|Null} error unlikely websocket Adapter error.  "haha, unlikely."
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Function} callback trigger after spectator add is complete
 * @returns {void}
 */
function join(error, game, state, client, callback) {
    if (error) {
        throw error;
    }

    if (game.player.length < 2) {
        client.slot = game.player.length;
        game.player.push({
            ready: Boolean(client.ready),
            ranking: client.ranking,
            slot: client.slot,
            settings: client.settings,
            username: client.username
        });
        state.clients[client.slot] = client;
        callback();
        return;
    }


    client.join('spectator', callback);

}

/**
 * Join the user to a room
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Function} callback trigger after spectator add is complete
 * @returns {void}
 */
function attemptJoin(game, state, client, callback) {
    delete state.clients[client.slot];
    client.slot = undefined;
    client.leave('spectators', function(error) {
        join(error, game, state, client, callback);
    });
    client.join('chat');
}

/**
 * Remove the user from a specificed slot.
 * @param {GameState} game public gamelist state information.
 * @param {ClientMessage} message JSON communication sent from client. 
 * @param {String} user user that requested that slot leave.
 * @returns {void}
 */
function spectate(game, message, user) {
    const slot = message.slot;
    if (game.player[slot]) {
        game.player[slot].write(({
            action: 'leave',
            user: user
        }));
        game.player[slot].join('spectators', function(error) {
            if (error) {
                throw error;
            }
        });
        return;
    }
    game.player[slot].join('spectators', function(error) {
        if (error) {
            throw error;
        }
    });
}

/**
 * Kick the user in a specific slot if authorized to do so.
 * @param {GameState} game public gamelist state information.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {Boolean} if the kick was valid and attempted to be executed.
 */
function kick(game, client, message) {
    if (client.slot !== 0 && !client.admin) {
        return false;
    }
    spectate(game, message, client.username);
    return true;
}

/**
 * Surrender in active duel.
 * @param {GameState} game public gamelist state information.
 * @param {Duel} duel OCGCore Instance
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void}
 */
function surrender(game, duel, message) {
    game.started = false;
    duel.surrender(message.slot);
}

/**
 * Validate a requested deck.
 * @param {GameState} game public gamelist state information.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {Boolean} If the deck is valid or not.
 */
function deckCheck(game, client, message) {

    const validation = validateDeck(message.deck,
        banlist,
        database,
        game.cardpool,
        game.prerelease);


    if (validation.error) {
        client.write(({
            errorType: 'validation',
            action: 'error',
            error: validation.error,
            msg: validation.msg
        }));
        return false;
    }

    client.write(({
        action: 'lock',
        result: 'success'
    }));
    return true;
}

/**
 * Determine ifa specific player has locked in their deck.
 * @param {Object[]} player list of players.
 * @param {Number} slot queried slot number.
 * @returns {Boolean} status of queried player
 */
function isReady(player, slot) {
    return player[slot].ready;
}


/**
 * Determine ifa specific player has locked in their deck.
 * @param {Object[]} player list of players.
 * @param {Number} target queried slot number.
 * @param {Boolean} status new deck lock status.
 * @returns {void}
 */
function updatePlayer(player, target, status) {
    player[target].ready = status;
}


/**
 * Validate a requested deck and if valid lock in the player as ready, otherwise toggle it off.
 * @param {GameState} game public gamelist state information.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void} 
 */
function lock(game, client, message) {
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
 * Create reconnection service for a client.
 * @param {Object} server Primus instance.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {String} room room to act as player abstraction.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @returns {PlayerAbstraction} Representation of a player or group of players a client can reconnect to if disconnected.
 */
function PlayerAbstraction(server, state, room, client) {
    if (client.username) {
        client.join(room);
        state.reconnection[room] = client.username;
    }
    server.room('room').write({
        action: 'reconnection',
        room: room
    });

    return Object.assign({}, client.deck, {
        write: function(data) {
            server.room('room').write(data);
        }
    });
}


/**
 * Determine who goes first via a coin toss.
 * Its stupid but humans like feeling in control.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @returns {void}
 */
function determine(server, game, state, client) {
    if (client.slot !== 0) {
        return;
    }
    if (!game.player[0] && !game.player[1]) {
        return;
    }
    if (!game.player[0].ready && !game.player[1].ready) {
        return;
    }
    ocgcore.shuffle(state.clients);

    server.write({
        action: 'start'
    });
    state.clients[0].write({
        action: 'cointoss',
        result: 'heads'
    });
    state.clients[1].write({
        action: 'cointoss',
        result: 'tails'
    });
    state.clients[0].write({
        action: 'turn_player',
        verification: state.verification
    });
    game.started = true;
}

/**
 * Start the duel
 * @param {Object} server Primus instance.
 * @param {Duel} duel OCGCore Instance
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void}
 */
function start(server, duel, game, state, message) {
    if (message.verification !== state.verification) {
        throw 'Incorrect Validation Code';
    }
    if (message.turn_player) {
        state.clients = state.clients.reverse();
    }

    const players = [
            new PlayerAbstraction(server, state, 'player1', state.clients[0]),
            new PlayerAbstraction(server, state, 'player2', state.clients[1])
        ],
        spectators = [new PlayerAbstraction(server, state, 'spectators', {})];

    duel.load(game, players, spectators);
}

/**
 * Respond to a question from the OCGCore game engine.
 * @param {Duel} duel OCGCore Instance
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void}
 */
function respond(duel, client, message) {
    duel.respond(client.slot, message.response);
}

/**
 * Process incoming messages from clients.
 * @param {Object} server Primus instance.
 * @param {Duel} duel OCGCore Instance
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void}
 */
function processMessage(server, duel, game, state, client, message) {
    console.log(message);
    if (!message.action) {
        return;
    }
    if (!client.username) {
        register(client, message);
        return;
    }
    switch (message.action) {
        case 'chat':
            chat(server, state, client, message.chat, undefined);
            break;
        case 'determine':
            determine(server, game, state, client);
            broadcast(server, game);
            break;
        case 'join':
            attemptJoin(game, state, client, function() {
                broadcast(server, game);
            });
            break;
        case 'kick':
            kick(game, client, message);
            broadcast(server, game);
            break;
        case 'lock':
            lock(game, client, message);
            broadcast(server, game);
            break;
        case 'reconnect':
            reconnect(duel, state, client, message);
            break;
        case 'respond':
            respond(duel, client, message);
            break;
        case 'spectate':
            spectate(game, message, client.username);
            broadcast(server, game);
            break;
        case 'start':
            start(server, duel, game, state, message);
            broadcast(server, game);
            break;
        case 'surrender':
            surrender(game, duel, message);
            broadcast(server, game);
            break;
        default:
            break;
    }
}

/**
 * Add additional error handling and then, process incoming messages from clients.
 * @param {Object} server Primus instance.
 * @param {Duel} duel OCGCore Instance
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void} If the deck is valid or not.
 */
function messageHandler(server, duel, game, state, client, message) {
    try {
        processMessage(server, duel, game, state, client, message);
    } catch (error) {
        console.log(error);
        client.write({
            error: error.message,
            stack: error.stack,
            input: (message)
        });
    }
}


/**
 * Add additional error handling and then, process incoming messages from clients.
 * @param {Object} server Primus instance.
 * @param {Duel} duel OCGCore Instance
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} deadSpark DEAD DISCONNECTED websocket and Primus user (spark in documentation).
 * @returns {void} If the deck is valid or not.
 */
function disconnectionHandler(server, duel, game, state, deadSpark) {
    console.log(deadSpark.slot, deadSpark.username, deadSpark.session);
    const message = {
        action: 'spectate',
        slot: deadSpark.slot
    };
    if (deadSpark.session) {
        verificationSystem.removeListener('client.session', function() {});
    }
    try {
        messageHandler(server, duel, game, state, deadSpark, message);
    } catch (error) {
        console.log(error);
        process.send({
            action: 'error',
            error: error
        });
    }
}


/**
 * Process incoming messages from master process.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ServerMessage} message JSON communication sent from client.
 * @returns {void} If the deck is valid or not.
 */
function adminMessageHandler(server, game, message) {
    switch (message.action) {
        case 'kill':
            process.exit(0);
            break;
        case 'kick':
            kick(game, { admin: true }, message);
            break;
        case 'lobby':
            broadcast(server, game);
            break;
        case 'register':
            verificationSystem.emit(message.session,
                message.error,
                message.valid,
                message.person);
            break;
        default:
            break;
    }
    return undefined;
}


/**
 * Notify connected users and middleware that the game has ended.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @returns {NodeJS.Timeout} setTimeout reference number for lifetime cycle.
 */
function quit(server, game, state) {
    chat(server, state, {
        username: '[SYSTEM]'
    }, 'Game has expired!', undefined);
    process.send({
        action: 'quit',
        game: game
    });
    return setTimeout(process.exit, CLEANUP_LATENCY);
}

/**
 * Notify connected users that the game will momentarily.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @returns {NodeJS.Timeout} setTimeout reference number for lifetime cycle.
 */
function notify(server, game, state) {
    chat(server, state, {
        username: '[SYSTEM]'
    }, 'Game will expire soon!', undefined);
    return setTimeout(quit, WARNING_COUNTDOWN, server, game, state);
}

/**
 * Check if the game is not being interacted with.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @returns {void}
 */
function interactionCheck(server, game, state) {
    if (new Date().getTime() - lastInteraction.getTime() > WARNING_COUNTDOWN) {
        quit(server, game, state);
    }
}

/**
 * Kick off new Lifecycle
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @returns {NodeJS.Timeout} setTimeout reference number for lifetime cycle.
 */
function LifeCycle(server, game, state) {
    setInterval(interactionCheck, CLEANUP_LATENCY, server);
    return setTimeout(notify, MAX_GAME_TIME, server, game, state);
}

/**
 * Process incoming messages from clients.
 * @param {Object} httpserver HTTP Server instance from `net.createServer()`
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @returns {void}
 */
function boot(httpserver, server, game, state) {
    state.lifeCycle = new LifeCycle(server, game, state);

    httpserver.listen(game.port, function() {

        process.on('message', function(message) {
            lastInteraction = new Date();
            try {
                adminMessageHandler(server, game, message);
            } catch (error) {
                console.log(error);
                process.send({
                    action: 'error',
                    error: error
                });
            }
        });

        broadcast(server, game);

        process.send({
            action: 'ready',
            roompass: game.roompass,
            password: state.password,
            port: game.port
        });
    });
}

/**
 * Create a game object
 * @param {Object} settings enviromental variables.
 * @returns {GameState} public gamelist state information.
 */
function Game(settings) {
    return {
        banlist: settings.BANLIST || 'No Banlist',
        banlistid: settings.BANLIST_ID,
        cardpool: settings.CARD_POOL || 0,
        deckcheck: settings.DECK_CHECK,
        draw_count: settings.DRAW_COUNT || 1,
        legacyfield: settings.LEGACY || false,
        locked: Boolean(settings.ROOMPASS),
        masterRule: settings.MASTER_RULE || 4,
        mode: settings.MODE || 0,
        ot: settings.OT || 0,
        port: settings.PORT || 8082,
        player: [],
        priority: false,
        prerelease: settings.PRERELEASE || true,
        roompass: settings.ROOMPASS || uuid(),
        rule: settings.RULE || 0,
        shuffleDeck: settings.SHUFFLE || false,
        started: false,
        startLP: settings.LIFEPOINTS || 8000,
        start_hand_count: settings.STARTING_HAND || 5,
        time: settings.TIME_LIMIT || 3000
    };
}

/**
 * Create a server state instance. States life cycle. Holds private information.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @returns {ApplicationState} internal private state information not shown on the game list.
 */
function State(server, game) {
    return {
        clients: [],
        chat: [],
        reconnection: {},
        verification: uuid()
    };
}

/**
 * Create a new ocgcore duel instance with constructor, getter, and setter mechanisms.
 * @returns {Duel} OCGCore Instance
 */
function Duel() {

    const duel = {};

    function failure() {
        throw ('Duel has not started');
    }

    function load(game, players, spectators) {
        const instance = ocgcore.duel(game, players, spectators);
        duel.getField = instance.getField;
        duel.respond = instance.respond;
    }

    duel.getField = failure;
    duel.respond = failure;
    duel.load = load;

    return duel;
}

function primusInstance(httpserver) {
    return new Primus(
        httpserver, {
            parser: 'JSON'
        });
}

/**
 * Start the server.
 * @param {Function} callback replacement for process.send
 * @returns {void}
 */
function main(callback) {

    // If the callback is given, use the callback,
    // otherwise report to parent process if it exist,
    // if it does not, print to the console.

    process.child = (process.send) ? true : false;
    process.send = (callback) ? callback : process.send;
    process.send = (process.send) ? process.send : console.log;

    const duel = new Duel(),
        game = new Game(process.env),
        httpserver = http.createServer(staticWebServer),
        server = primusInstance(httpserver),
        state = new State(server, game);

    server.plugin('rooms', Rooms);
    server.save(__dirname + '/../http/js/vendor/server.js');
    server.on('connection', function(client) {
        client.on('data', function(message) {
            messageHandler(server, duel, game, state, client, message);
        });
        broadcast(server, game);
    });
    server.on('disconnection', function(deadSpark) {
        disconnectionHandler(server, duel, game, state, deadSpark);
    });

    boot(httpserver, server, game, state);
}

main(undefined);

module.exports = {
    main
};