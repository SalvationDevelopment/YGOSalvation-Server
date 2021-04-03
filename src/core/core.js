
/**
 * OCGCore, the YGOPro game engine, is very unstable. Its a C++ library that will cause
 * a crash if it sees improper logic in the Lua scripts it dynamically loads  in that
 * represent the game logic of individual cards. For that reason the room system wrapping
 * it runs in is a sperate child process. 
 * 
 * Configuration is passed via enviromental variables.
 */

const { match } = require('assert'),
    logger = require('../logger'),
    { log } = logger.create(logger.config.main, '[CORE/INDEX]');

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

const WARNING_COUNTDOWN = 3000000,
    CLEANUP_LATENCY = 100000,
    MAX_GAME_TIME = 33000000,
    banlist = require('../../http/manifest/banlist.json'),
    database = require('../../http/manifest/manifest_0-en-OCGTCG.json'),
    dotenv = require('dotenv'),
    defaultPlayer = require('./defaults'),
    EventEmitter = require('events'),
    express = require('express'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    field = require('./model_manual_field.js'),
    automaticControlEngine = require('./controller_core.js'),
    manualControlEngine = require('./controller_manual.js'),
    path = require('path'),
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    sanitize = require('./lib_html_sanitizer.js'),
    shuffle = require('./lib_shuffle.js'),
    uuid = require('uuid/v4'),
    validateDeck = require('./lib_validate_deck.js'),
    verificationSystem = new EventEmitter(),
    choice = require('./lib_choice');

let lastInteraction = new Date();


/**
 * Start a static HTTP web server.
 * @param {Object} request incoming http request
 * @param {Object} response outgoing response handler
 * @returns {void}
 */
function staticWebServer(request, response) {

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
 * Broadcast current game lobby status to connected clients and management system.
 * @param {Object} server Primus instance.
 * @param {Boolean[]} player Player 1 and Player 2 lock status.
 * @returns {void}
 */
function clearField(server, player) {
    server.write({
        action: 'clear'
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
    client.points = person.points || 0;
    client.elo = person.elo || 1200;
    // eslint-disable-next-line no-underscore-dangle
    client.id = person._id;
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
        enableClient(client, Object.assign(message, defaultPlayer));
        return;
    }

    if (typeof message.session !== 'string') {
        throw Error('Session information required to proceed');
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
    //state.chat.push(chatMessage);
    return chatMessage;
}

/**
 * If authorized reconnect a client to an active duel.
 * @param {Duel} duel Duel Field Instance
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
 * @param {Duel} duel Duel Field Instance
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Function} callback trigger after spectator add is complete
 * @returns {void}
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
            avatar: (client.avatar) ? client.avatar.url : ''
        });
        state.clients[client.slot] = client;
        game.usernames[client.slot] = client.username;
        callback();
        return;
    }

    client.slot = 'spectator';
    client.join('spectator', function () {
        if (game.started) {
            duel.getField(client);
        }
        callback();
    });


}

/**
 * Join the user to a room
 * @param {Duel} duel Duel Field Instance
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Function} callback trigger after spectator add is complete
 * @returns {void}
 */
function attemptJoin(duel, game, state, client, callback) {
    delete state.clients[client.slot];
    client.slot = undefined;
    client.leave('spectator', function (error) {
        if (error) {
            throw error;
        }
        join(duel, game, state, client, callback);
        if (game.started) {
            duel.getField(client);
        }
    });
    client.join('chat');
}

/**
 * Remove the user from a specificed slot.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {ClientMessage} message JSON communication sent from client. 
 * @param {String} user user that requested that slot leave.
 * @returns {void}
 */
function spectate(server, game, state, message, user) {
    const slot = message.slot;
    if (!game.player[slot]) {
        return;
    }
    state.clients[slot].slot = undefined;
    state.clients[slot].write(({
        action: 'leave',
        user: user
    }));
    state.clients[slot].join('spectator', function (error) {
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
 * Kick the user in a specific slot if authorized to do so.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {Boolean} if the kick was valid and attempted to be executed.
 */
function kick(server, game, state, client, message) {
    if (client.slot !== 0 && !client.admin) {
        return false;
    }
    spectate(server, game, state, message, client.username);
    return true;
}


/**
 * Determine if a specific player has locked in their deck.
 * @param {Object[]} player list of players.
 * @param {Number} target queried slot number.
 * @param {Boolean} status new deck lock status.
 * @returns {void}
 */
function updatePlayer(player, target, status) {
    player[target].ready = status;
}

/**
 * Create a new ocgcore duel instance with constructor, getter, and setter mechanisms.
 * @returns {Duel} OCGCore Instance
 */
function Duel() {

    const duel = {};

    function failure() {
        throw new Error('Duel has not started');
    }

    function load(game, state, errorHandler, players, spectators) {
        process.recordOutcome = new EventEmitter();
        process.recordOutcome.once('win', function (command) {

            // process.replay requires filtering.
            log(game.player, command);
            process.send({
                action: 'win',
                replay: process.replay,
                ranked: Boolean(game.ranked === 'Ranked'),
                loserID: game.player[Math.abs(command - 1)].id,
                loserSession: game.player[Math.abs(command - 1)].session,
                winnerID: game.player[command].id,
                winnerSession: game.player[command].session
            });
        });

        if (game.shuffle) {
            shuffle(players[0].main);
            shuffle(players[1].main);
        }

        if (game.automatic === 'Automatic') {
            const instance = automaticControlEngine.duel(game, state, errorHandler, players, spectators);
            duel.respond = instance.respond;
            duel.getField = function (client) {
                client.write(instance.getField(client));
            };
            return;
        }

        const clientBinding = manualControlEngine.clientBinding(players, spectators),
            engine = field(clientBinding);

        engine.startDuel(players[0], players[1], true, game);
        duel.engine = engine;
        duel.surrender = manualControlEngine.surrender;
        duel.getField = function (client) {
            client.write({
                action: 'ygopro',
                message: engine.getField(client.slot)
            });
        };
    }


    duel.getField = failure;
    duel.respond = failure;
    duel.load = load;

    return duel;
}

function startSiding(players, state, duel) {
    players.forEach(function (player, slot) {
        updatePlayer(players, slot, false);
    });
    state.clients.forEach(function (client) {
        client.leave('');
        client.write({
            action: 'side',
            deck: client.deck
        });
    });
    duel = new Duel();
}

/**
 * Notify connected users and parent process that the game has ended.
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
 * Surrender in active duel.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Duel} duel Duel Field Instance
 * @param {Number} slot surrendering player identifier.
 * @returns {void}
 */
function surrender(server, game, state, duel, slot) {

    const winner = Math.abs(slot - 1),
        bestOfXGames = (game.MODE === 'Single' || game.MODE === 'Tag') ? 0 : 1,
        aheadBy = Math.abs(game.player[0].wins - game.player[1].wins);

    game.player[winner].wins = game.player[winner].wins + 1;
    game.started = false;

    if (aheadBy >= bestOfXGames) {
        process.recordOutcome.emit('win', winner);
        chat(server, state, {
            username: '[SYSTEM]'
        }, `${game.player[winner].username} has won!`, undefined);
        quit(server, game, state);
        return;
    }


    startSiding(game.player, state, duel);

    state.predetermined = { slot };
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
        banlist[game.banlist],
        database,
        game.cardpool,
        game.prerelease);

    if (!game.deckcheck) {
        client.write(({
            action: 'lock',
            result: 'success'
        }));
        return true;
    }

    if (validation.error) {
        client.write(({
            errorType: 'validation',
            action: 'error',
            error: validation.error,
            msg: validation
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
 * Determine if a specific player has locked in their deck.
 * @param {Object[]} player list of players.
 * @param {Number} slot queried slot number.
 * @returns {Boolean} status of queried player
 */
function isReady(player, slot) {
    return player[slot].ready;
}




/**
 * Check if a new deck is a legal side
 * @param {Deck} oldDeck previous deck used for a duel
 * @param {Deck} newDeck deck being inspected against
 * @returns {Boolean} if the deck is valid
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

    return (JSON.stringify(oldStack) === JSON.stringify(newStack));
}

/**
 * Add additional error handling and then, process incoming messages from clients.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void}
 */
function side(server, game, client, message) {
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
 * Validate a requested deck and if valid lock in the player as ready, otherwise toggle it off.
 * @param {GameState} game public gamelist state information.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void} 
 */
function lock(game, client, message) {
    if (game.started) {
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
    server.room(room).write({
        action: 'reconnection',
        room: room
    });

    return Object.assign({}, client.deck, {
        write: function (data) {
            server.room(room).write({
                action: 'ygopro',
                message: data
            });
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
    state.verification = uuid();


    if (state.predetermined) {
        const oppossingPlayer = Math.abs(state.predetermined.slot - 1),
            defeatedPlayer = state.predetermined.slot;

        server.write({
            action: 'start'
        });
        state.clients[defeatedPlayer].write({
            action: 'turn_player',
            verification: state.verification
        });
        state.clients[oppossingPlayer].write({
            action: 'choice',
            type: 'waiting'
        });
        return;
    }

    choice(state.clients, game.start_game)
        .then(function () {
            server.write({
                action: 'start'
            });
            state.clients[0].write({
                action: 'turn_player',
                verification: state.verification
            });
            state.clients[1].write({
                action: 'choice',
                type: 'waiting'
            });
        });
}

/**
 * Start the duel
 * @param {Object} server Primus instance.
 * @param {Duel} duel Duel Field Instance
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
        state.clients[0].slot = 0;
        state.clients[1].slot = 1;
    }

    server.empty('player1');
    server.empty('player2');

    const players = [
        new PlayerAbstraction(server, state, 'player1', state.clients[0]),
        new PlayerAbstraction(server, state, 'player2', state.clients[1])
    ],
        spectators = new PlayerAbstraction(server, state, 'spectator', {});

    duel.load(game, state, function (error, type) {
        chat(server, state, {
            username: '[SYSTEM]'
        }, error, undefined);
    }, players, spectators);
}

/**
 * Respond to a question from the OCGCore game engine.
 * @param {Duel} duel Duel Field Instance
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void}
 */
function question(duel, client, message) {
    duel.respond(message);
}

/**
 * Check if a message requires the manual engine or the automatic one.
 * @param {GameState} game public gamelist state information.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @returns {void} 
 */
function requiresManualEngine(game, client) {

    if (game.automatic !== 'Manual') {
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
 * Process incoming messages from clients.
 * @param {Object} server Primus instance.
 * @param {Duel} duel Duel Field Instance
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {ClientMessage} message JSON communication sent from client.
 * @returns {void}
 */
function processMessage(server, duel, game, state, client, message) {
    if (!message.action) {
        return;
    }
    if (!client.username) {
        register(client, message);
        return;
    }

    switch (message.action) {
        case 'chat':
            chat(server, state, client, message.message, undefined);
            break;
        case 'determine':
            determine(server, game, state, client);
            broadcast(server, game);
            break;
        case 'join':
            attemptJoin(duel, game, state, client, function () {
                broadcast(server, game);
                client.write({
                    action: 'slot',
                    slot: client.slot
                });
            });
            break;
        case 'kick':
            if (client.slot === undefined) {
                attemptJoin(game, state, client, function () {
                    broadcast(server, game);
                });
                return;
            }
            kick(server, game, state, client, message);
            broadcast(server, game);
            break;
        case 'lock':
            lock(game, client, message);
            broadcast(server, game);
            state.decks[client.slot] = message.deck;
            break;
        case 'reconnect':
            reconnect(duel, state, client, message);
            break;
        case 'question':
            question(duel, client, message);
            break;
        case 'spectate':
            spectate(server, game, state, message, client.username);
            broadcast(server, game);
            break;
        case 'start':
            start(server, duel, game, state, message);
            broadcast(server, game);
            break;
        case 'surrender':
            chat(server, state, {
                username: '[SYSTEM]'
            }, `${game.usernames[client.slot]} surrendered`);
            surrender(server, game, state, duel, client.slot);
            broadcast(server, game);
            break;
        case 'side':
            side(server, game, client, message);
            broadcast(server, game);
            break;
        case 'choice':
            client.emit('choice', message.answer);
            break;
        case 'restart':
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
    manualControlEngine.responseHandler(duel.engine, state.clients, client, message);
}

/**
 * Add additional error handling and then, process incoming messages from clients.
 * @param {Object} server Primus instance.
 * @param {Duel} duel Duel Field Instance
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
        if (!process.child) {
            // while using a direct debugger, kill the process and investigate.
            throw error;
        }
        log(error);
        client.write({
            error: error.message,
            stack: error.stack,
            input: (message)
        });
    }
}


/**
 * Culmulative connected clients on a server.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @returns {Number} Number of connected clients
 */
function countClients(server, game, state) {
    const total = [];
    // Primus does not have an reduce method, or length property.
    server.forEach((spark, id) => {
        total.push(id);
    });
    return total.length;
}

/**
 * Add additional error handling and then, process incoming messages from clients.
 * @param {Object} server Primus instance.
 * @param {Duel} duel Duel Field Instance
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @param {Spark} deadSpark DEAD DISCONNECTED websocket and Primus user (spark in documentation).
 * @returns {void} If the deck is valid or not.
 */
function disconnectionHandler(server, duel, game, state, deadSpark) {
    const message = {
        action: 'spectate',
        slot: deadSpark.slot
    };
    if (deadSpark.session) {
        verificationSystem.removeListener('client.session', function () { });
    }
    if (!countClients(server)) {
        quit(server, game, state);
        return;
    }
    try {
        messageHandler(server, duel, game, state, deadSpark, message);
    } catch (error) {
        log(error);
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
 * Kick off new application lifecycle, countdown to application close.
 * @param {Object} server Primus instance.
 * @param {GameState} game public gamelist state information.
 * @param {ApplicationState} state internal private state information not shown on the game list.
 * @returns {NodeJS.Timeout} setTimeout reference number for lifetime cycle.
 */
function LifeCycle(server, game, state) {
    setInterval(interactionCheck, CLEANUP_LATENCY, server, game, state);
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

    httpserver.listen(game.port, function () {

        process.on('message', function (message) {
            lastInteraction = new Date();
            try {
                adminMessageHandler(server, game, message);
            } catch (error) {
                log(error);
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
 * Create a game object based on given and enviromental settings
 * @param {Object} configuration enviromental variables.
 * @returns {GameState} public gamelist state information.
 */
function Game(configuration) {
    const settings = {};

    Object.assign(settings, process.env, configuration);

    return {
        automatic: (settings.AUTOMATIC === 'true') ? 'Automatic' : 'Manual',
        banlist: settings.BANLIST || 'No Banlist',
        cardpool: settings.CARD_POOL || 'OCG/TCG',
        deckcheck: (settings.DECK_CHECK === 'true'),
        draw_count: settings.DRAW_COUNT || 1,
        legacyfield: (settings.LEGACY === 'true'),
        locked: Boolean(settings.ROOM_PASS),
        masterRule: settings.MASTER_RULE || 4,
        mode: settings.MODE || 0,
        port: settings.PORT || 8082,
        player: [],
        bestOf: [0, 0],
        priority: false,
        prerelease: settings.PRERELEASE || true,
        roompass: settings.ROOM_PASS || uuid(),
        ranked: (settings.RANKED === 'true') ? 'Ranked' : 'Exhibition',
        rule: settings.RULE || 0,
        shuffle: (settings.SHUFFLE === 'true'),
        started: false,
        startLP: settings.LIFE_POINTS || 8000,
        start_hand_count: settings.STARTING_HAND || 5,
        time: settings.TIME_LIMIT || 3000,
        usernames: [],
        start_game: settings.START_GAME || 'rps'
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
        decks: [],
        reconnection: {},
        verification: uuid()
    };
}

/* eslint-disable no-sync */
/**
 * Construct server instance
 * @returns {Object} server instance
 */
function HTTPServer() {
    const keyFile = path.resolve(process.env.SSL + '\\private.key'),
        certFile = path.resolve(process.env.SSL + '\\certificate.crt'),
        app = express();

    try {
        const privateKey = fs.readFileSync(keyFile).toString(),
            certificate = fs.readFileSync(certFile).toString();

        return https.createServer({
            key: privateKey,
            cert: certificate
        }, app);
    } catch (nossl) {
        return http.createServer(app);
    }
}


function PrimusInstance(httpserver) {
    return new Primus(
        httpserver, {
        parser: 'JSON'
    });
}

/**
 * Start the server.
 * @param {Object} configuration enviromental variables.
 * @param {Function} callback replacement for process.send
 * @returns {void}
 */
function main(configuration, callback) {


    // If the callback is given, use the callback,
    // otherwise report to parent process if it exist,
    // if it does not, print to the console.

    process.on('unhandledException', function (fatal) {
        log(fatal);
    });

    configuration = (typeof configuration === 'object') ? configuration : {};
    process.child = (process.send) ? true : false;
    process.send = (callback) ? callback : process.send;
    process.send = (process.send) ? process.send : log;

    const duel = new Duel(),
        game = new Game(configuration),
        httpserver = new HTTPServer(),
        server = new PrimusInstance(httpserver),
        state = new State(server, game),
        title = `YGOSalvation Core on port: ${game.port} pid: ${process.pid}`;


    process.title = title;
    server.plugin('rooms', Rooms);
    if (configuration.production) {
        // server.save(__dirname + '/../../http/js/vendor/server.js');
    }
    server.on('connection', function (client) {
        client.on('data', function (message) {
            log('Message', message);
            messageHandler(server, duel, game, state, client, message);
        });
        broadcast(server, game);

    });
    server.on('disconnection', function (deadSpark) {
        disconnectionHandler(server, duel, game, state, deadSpark);
    });


    boot(httpserver, server, game, state);


    log(title);

    return {
        duel,
        game,
        httpserver,
        server,
        state
    };
}


module.exports = {
    main,
    State,
    Game,
    processMessage
};
