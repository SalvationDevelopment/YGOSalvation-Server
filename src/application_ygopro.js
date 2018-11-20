/**
 * OCGCore, the YGOPro game engine, is very unstable. Its a C++ libary that will cause
 * a crash if it sees improper logic in the Lua scripts it dynamically loads in that
 * represent the game logic of indidual cards. For that reason the room system wrapping
 * it runs in a sperate child process. 
 * 
 * Configuration is passed via enviromental variables.
 */

/**
 * @typedef {Object} Message
 * @property {String} action game model manipulation or general action to take place. 
 * @property {Deck} deck deck for validation and use
 * @property {String} [username] clients username.
 * @property {String} [validationKey] clients validation key from authentication server. 
 */

/**
 * @typedef {Object} Deck
 * @property {Number[]} main Passcode/YGOPRO_ID of cards in the main deck
 * @property {Number[]} extra Passcode/YGOPRO_ID cards in the extra deck
 * @property {Number[]} side Passcode/YGOPRO_ID cards in the side deck
 */

/**
 * @typedef {Deck} PlayerAbstraction
 * @property {Function} write Send data to clients
 */

const banlist = './http/manifest/banlist.json',
    database = require('../http/manifest/manifest_0-en-OCGTCG.json'),
    EventEmitter = require('events'),
    http = require('http'),
    ocgcore = require('./engine_ocgcore'),
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    sanitize = require('./lib_html_sanitizer.js'),
    static = require('node-static'),
    uuid = require('uuid/v4'),
    validateDeck = require('./validate_deck.js'),
    verificationSystem = new EventEmitter();


/**
 * Start a static HTTP web server.
 * @param {Object} request incoming http request
 * @param {Object} response outgoing response handler
 * @returns {undefined}
 */
function staticWebServer(request, response) {
    const file = new static.Server('../http', { cache: 0 });
    request.addListener('end', function() {
        file.serve(request, response);
    }).resume();
}


/**
 * Broadcast current game lobby status to connected clients and management system.
 * @param {Primus} server Primus instance.
 * @returns {undefined}
 */
function broadcast(server) {
    server.write({
        action: 'lobby',
        game: server.game
    });
    process.send({
        action: 'lobby',
        game: server.game
    });
}

/**
 * Report back to the client that they are registered.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Message} message JSON communication sent from client.
 * @returns {undefined}
 */
function enableClient(client, message) {
    client.username = message.username;
    client.write({
        action: 'registered'
    });
}

/**
 * Register the user with the server via external authentication, if avaliable.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Message} message JSON communication sent from client.
 * @returns {undefined}
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
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Message} message JSON communication sent from client.
 * @param {Date} date built in date object, used for timestamping.
 * @returns {Object} formated chat message.
 */
function chat(server, client, message, date) {
    date = date || new Date();
    const chatMessage = {
        message: sanitize(message.message),
        username: client.username,
        date: date.toISOString()
    };
    client.room('chat').write(chatMessage);
    server.game.chat.push(chatMessage);
    return chatMessage;
}

/**
 * If authorized reconnect a client to an active duel.
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Message} message JSON communication sent from client.
 * @returns {undefined}
 */
function reconnect(server, client, message) {
    if (!server.game.reconnection[message.room]) {
        return;
    }
    if (server.game.reconnection[message.room]) {
        return;
    }
    if (server.game.reconnection[message.room] = client.username) {
        client.join(message.room);
    }
    if (message.room !== 'spectator') {
        server.duel.getField();
    }

}

/**
 * Join the user to a room
 * @param {Error|Null} error unlikely websocket Adapter error.
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @return {undefined}
 */
function join(error, server, client) {
    function findAvaliableSlot(player, index) {
        if (player) {
            return false;
        }
        client.slot = index;
        server.game.player[index] = client;
        broadcast(server);
        return true;
    }

    if (error) {
        throw error;
    }

    const isPlayer = server.game.players.some(findAvaliableSlot);
    if (!isPlayer) {
        client.join('spectator', function() {
            broadcast(server);
        });
    }
}

/**
 * Join the user to a room
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @return {undefined}
 */
function attemptJoin(server, client) {
    client.slot = undefined;
    client.leave('spectators', function(error) {
        join(error, server, client);
    });
    client.join('chat');
}

/**
 * Remove the user from a specificed splot.
 * @param {Primus} server Primus instance.
 * @param {Message} message JSON communication sent from client. 
 * @param {String} user user that requested that slot leave.
 * @returns {undefined}
 */
function spectate(server, message, user) {
    if (server.game.player[message.slot]) {
        server.game.player[message.slot].write(({
            action: 'leave',
            user: user
        }));
        server.game.player[message.slot].join('spectators', function(error) {
            if (error) {
                throw error;
            }
            broadcast(server);
        });
        return;
    }
    server.game.player[message.slot].join('spectators', function(error) {
        if (error) {
            throw error;
        }
        broadcast(server);
    });
}

/**
 * Kick the user in a specific slot if authorized to do so.
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Message} message JSON communication sent from client.
 * @returns {Boolean} if the kick was valid and attempted to be executed.
 */
function kick(server, client, message) {
    if (client.slot !== 0 && !client.admin) {
        return false;
    }
    spectate(server, message, client.username);
    return true;
}

/**
 * Surrender in active duel.
 * @param {Primus} server Primus instance.
 * @param {Message} message JSON communication sent from client.
 * @returns {undefined}
 */
function surrender(server, message) {
    if (!server.duel) {
        return;
    }
    server.duel.surrender(message.slot);
    server.game.started = false;
}

/**
 * Validate a requested deck.
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Message} message JSON communication sent from client.
 * @returns {Boolean} If the deck is valid or not.
 */
function deckCheck(server, client, message) {

    message.validate = validateDeck(message.deck,
        banlist[server.game.banlist],
        database,
        server.game.cardpool,
        server.game.prerelease);

    if (message.validate) {
        if (message.validate.error) {
            client.write(({
                errorType: 'validation',
                action: 'error',
                error: message.validate.error,
                msg: message.validate.msg
            }));
            return false;
        }
    }
    client.write(({
        action: 'lock',
        result: 'success'
    }));
    return true;
}

/**
 * Validate a requested deck and if valid lock in the player as ready, otherwise toggle it off.
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Message} message JSON communication sent from client.
 * @returns {undefined} 
 */
function lock(server, client, message) {
    if (client.ready) {
        client.ready = false;
        return;
    }
    try {
        client.ready = deckCheck(client, message, banlist);
    } catch (error) {
        server.game.player[client.slot].ready = false;
        throw error;
    }
    client.deck = message.deck;
}

/**
 * Create reconnection service for a client.
 * @param {Primus} server Primus instance.
 * @param {String} room room to act as player abstraction.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @returns {PlayerAbstraction} Representation of a player or group of players a client can reconnect to if disconnected.
 */
function PlayerAbstraction(server, room, client) {
    if (client.username) {
        client.join(room);
        server.game.reconnection[room] = client.username;
    }
    server.room('room').write({
        action: 'reconnection',
        room: room
    });
    return {
        write: function(data) {
            server.room('room').write(data);
        },
        main: client.main,
        extra: client.extra,
        side: client.side
    };
}

/**
 * Determine who goes first via a coin toss.
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @returns {undefined}
 */
function determine(server, client) {
    if (client.slot !== 0) {
        return;
    }
    if (!server.game.player[0] && !server.game.player[1]) {
        return;
    }
    if (!server.game.player[0].ready && !server.game.player[1].ready) {
        return;
    }
    server.game.verification = uuid();
    ocgcore.shuffle(server.game.player);
    server.game.player[0].write({
        action: 'cointoss',
        result: 'heads'
    });
    server.game.player[1].write({
        action: 'cointoss',
        result: 'tails'
    });
    server.game.player[0].write({
        action: 'turn_player',
        verification: server.game.verification
    });
    server.game.started = true;
}

/**
 * Start the duel
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Message} message JSON communication sent from client.
 * @returns {undefined}
 */
function start(server, client, message) {
    if (message.verification !== server.game.verification) {
        return;
    }
    if (message.turn_player) {
        server.game.players = server.game.player.reverse();
    }

    const players = [
            new PlayerAbstraction(server, 'player1', server.game.players[0]),
            new PlayerAbstraction(server, 'player2', server.game.players[1])
        ],
        spectators = [new PlayerAbstraction(server, 'spectators', {})];


    ocgcore.duel(server.game, players, spectators);
}

/**
 * Respond to a question from the OCGCore game engine.
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Message} message JSON communication sent from client.
 * @returns {undefined}
 */
function respond(server, client, message) {
    if (!server.duel) {
        return;
    }
    server.duel.respond(client.slot, message.response);
}

/**
 * Process incoming messages from clients.
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Message} message JSON communication sent from client.
 * @returns {Boolean} If the deck is valid or not.
 */
function controller(server, client, message) {
    //console.log(message);
    if (!message.action) {
        return;
    }
    if (!client.username) {
        register(client, message);
        return;
    }
    switch (message.action) {
        case 'ping':
            broadcast(server);
            break;
        case 'chat':
            chat(server, client, message);
            break;
        case 'join':
            attemptJoin(server, client);
            break;
        case 'kick':
            kick(server, client, message);
            break;
        case 'spectate':
            spectate(server, message, client.username);
            break;
        case 'surrender':
            surrender(server, message);
            broadcast(server);
            break;
        case 'lock':
            lock(server, client, message, banlist);
            broadcast(server);
            break;
        case 'determine':
            determine(server, client);
            broadcast(server);
            break;
        case 'start':
            start(server, client, message);
            broadcast(server);
            break;
        case 'ocgcore':
            respond(server, client, message);
            break;
        default:
            break;
    }
}

/**
 * Add additional error handling and then, process incoming messages from clients.
 * @param {Primus} server Primus instance.
 * @param {Spark} client connected websocket and Primus user (spark in documentation).
 * @param {Message} message JSON communication sent from client.
 * @returns {Boolean} If the deck is valid or not.
 */
function messageHandler(server, client, message) {
    try {
        controller(server, client, message, banlist);
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
 * @param {Primus} server Primus instance.
 * @param {Spark} client DEAD DISCONNECTED websocket and Primus user (spark in documentation).
 * @returns {Boolean} If the deck is valid or not.
 */
function disconnectionHandler(server, client) {
    const message = {
        action: 'spectate',
        slot: client.slot
    };
    if (client.session) {
        verificationSystem.removeListener('client.session');
    }
    try {
        messageHandler(server, client, message, banlist);
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
 * @param {Primus} server Primus instance.
 * @param {Message} message JSON communication sent from client.
 * @returns {Boolean} If the deck is valid or not.
 */
function adminMessageHandler(server, message) {
    switch (message.action) {
        case 'kill':
            process.exit(0);
            break;
        case 'kick':
            kick(server, { admin: true }, message);
            break;
        case 'lobby':
            broadcast(server);
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
}

/**
 * Process incoming messages from clients.
 * @param {Object} httpserver HTTP Server instance from `net.createServer()`
 * @param {Primus} server Primus instance.
 * @param {Number} port port to listen on
 * @returns {undefined}
 */
function boot(httpserver, server, port) {
    httpserver.listen(port, function() {

        process.on('message', function(message) {
            try {
                adminMessageHandler(server, message);
            } catch (error) {
                console.log(error);
                process.send({
                    action: 'error',
                    error: error
                });
            }
        });

        broadcast(server);

        process.send({
            action: 'ready',
            port: port
        });
    });
}

/**
 * Start the server.
 * @param {Function} callback replacement for process.send
 * @returns {undefined}
 */
function main(callback) {
    require('dotenv').config();
    const port = process.env.PORT || 8082,
        httpserver = http.createServer(staticWebServer),
        server = new Primus(httpserver, {
            parser: 'JSON'
        });

    server.game = {
        priority: false,
        draw_count: process.env.DRAW_COUNT || 1,
        start_hand_count: process.env.STARTING_HAND || 5,
        time: process.env.TIME_LIMIT || 3000,
        shuffleDeck: process.env.SHUFFLE || false,
        startLP: process.env.LIFEPOINTS || 8000,
        roompass: process.env.ROOMPASS || uuid(),
        verification: uuid(),
        started: false,
        deckcheck: process.env.DECK_CHECK || false,
        ot: process.env.OT || 0,
        banlist: process.env.BANLIST || 'No Banlist',
        banlistid: process.env.BANLIST_ID,
        mode: process.env.MODE || 0,
        cardpool: process.env.CARD_POOL || 0,
        prerelease: process.env.PRERELEASE || true,
        masterRule: process.env.MASTER_RULE || 4,
        legacyfield: process.env.LEGACY || false,
        rule: process.env.RULE || 0,
        player: [],
        chat: [],
        reconnection: {},
        port: port
    };

    server.plugin('rooms', Rooms);
    server.save(__dirname + '/../http/js/vendor/server.js');
    server.on('connection', function(client) {
        client.on('data', function(data) {
            messageHandler(server, client, data, banlist);
        });
    });
    server.on('disconnection', function(deadSpark) {
        disconnectionHandler(server, deadSpark);
    });


    // If the callback is given, use the callback,
    // otherwise report to parent process if it exist,
    // if it does not, print to the console.

    process.child = (process.send) ? true : false;
    process.send = (callback) ? callback : process.send;
    process.send = (process.send) ? process.send : console.log;

    boot(httpserver, server, port);

}

main();

module.exports = {
    main
};