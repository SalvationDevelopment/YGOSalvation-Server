require('dotenv').config();

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

const database = require('../http/manifest/manifest_0-en-OCGTCG.json'),
    fs = require('fs'),
    http = require('http'),
    ocgcore = require('./engine_ocgcore'),
    Primus = require('primus'),
    Rooms = require('server-rooms'),
    static = require('node-static'),
    validateDeck = require('./validate_deck.js'),
    banlist = './http/manifest/banlist.json',
    game = {
        priority: false,
        draw_count: process.env.DRAW_COUNT || 1,
        start_hand_count: process.env.STARTING_HAND || 5,
        time: process.env.TIME_LIMIT || 3000,
        shuffleDeck: process.env.SHUFFLE || false,
        startLP: process.env.LIFEPOINTS || 8000,
        roompass: process.env.ROOMPASS || 'default',
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
        reconnection: {}
    };

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
 * Broadcast current game lobby status to connected clients.
 * @param {Primus} server Primus instance.
 * @returns {undefined}
 */
function broadcast(server) {
    server.write({
        action: 'lobby',
        game: game,
        port: process.env.PORT || 8083
    });
}

/**
 * Register the user with the server via external authentication.
 * @param {Spark} spark connected websocket and Primus user.
 * @param {Message} message JSON communication sent from client.
 * @returns {undefined}
 */
function register(spark, message) {
    // Expand later
    spark.username = message.username;
    spark.write({
        action: 'registered'
    });
}


/**
 * Chat with other users.
 * @param {Spark} spark connected websocket and Primus user.
 * @param {Message} message JSON communication sent from client.
 * @param {Date} date built in date object, used for timestamping.
 * @returns {Object} formated chat message.
 */
function chat(spark, message, date) {
    date = date || new Date();
    const chatMessage = {
        message: message.message,
        username: spark.username,
        date: date.toISOString()
    };
    spark.room('chat').write(chatMessage);
    game.chat.push(chatMessage);
    return chatMessage;
}

/**
 * If authorized reconnect a client to an active duel.
 * @param {Spark} spark connected websocket and Primus user.
 * @param {Message} message JSON communication sent from client.
 * @returns {undefined}
 */
function reconnect(spark, message) {
    if (!game.reconnection[message.room]) {
        return;
    }
    if (game.reconnection[message.room]) {
        return;
    }
    if (game.reconnection[message.room] = spark.username) {
        spark.join(message.room);
    }
    if (message.room !== 'spectator') {
        game.duel.getField();
    }

}

/**
 * Join the user to a room
 * @param {Error|Null} error unlikely websocket Adapter error.
 * @param {Primus} server Primus instance.
 * @param {Spark} spark connected websocket and Primus user.
 * @return {undefined}
 */
function join(error, server, spark) {
    function findAvaliableSlot(player, index) {
        if (player) {
            return false;
        }
        spark.slot = index;
        game.player[index] = spark;
        broadcast(server);
        return true;
    }

    if (error) {
        throw error;
    }

    const isPlayer = game.players.some(findAvaliableSlot);
    if (!isPlayer) {
        spark.join('spectator', function() {
            broadcast(server);
        });
    }
}

/**
 * Join the user to a room
 * @param {Primus} server Primus instance.
 * @param {Spark} spark connected websocket and Primus user.
 * @return {undefined}
 */
function attemptJoin(server, spark) {
    spark.slot = undefined;
    spark.leave('spectators', function(error) {
        join(error, server, spark);
    });
    spark.join('chat');
}

/**
 * Remove the user from a specificed splot.
 * @param {Primus} server Primus instance.
 * @param {Message} message JSON communication sent from client. 
 * @param {String} user user that requested that slot leave.
 * @returns {undefined}
 */
function spectate(server, message, user) {
    if (game.player[message.slot]) {
        game.player[message.slot].write(({
            action: 'leave',
            user: user
        }));
        game.player[message.slot].join('spectators', function(error) {
            if (error) {
                throw error;
            }
            broadcast(server);
        });
        return;
    }
    game.player[message.slot].join('spectators', function(error) {
        if (error) {
            throw error;
        }
        broadcast(server);
    });
}

/**
 * Kick the user in a specific slot if authorized to do so.
 * @param {Primus} server Primus instance.
 * @param {Spark} spark connected websocket and Primus user.
 * @param {Message} message JSON communication sent from client.
 * @returns {Boolean} if the kick was valid and attempted to be executed.
 */
function kick(server, spark, message) {
    if (spark.slot !== 0 && !spark.admin) {
        return false;
    }
    spectate(server, message, spark.username);
    return true;
}

/**
 * Surrender in active duel.
 * @param {Message} message JSON communication sent from client.
 * @returns {undefined}
 */
function surrender(message) {
    if (!game.duel) {
        return;
    }
    game.duel.surrender(message.slot);
    game.started = false;
}

/**
 * Validate a requested deck.
 * @param {Spark} spark connected websocket and Primus user.
 * @param {Message} message JSON communication sent from client.
 * @returns {Boolean} If the deck is valid or not.
 */
function deckCheck(spark, message) {
    message.validate = validateDeck(message.deck, banlist[game.banlist], database, game.cardpool, game.prerelease);
    if (message.validate) {
        if (message.validate.error) {
            spark.write(({
                errorType: 'validation',
                action: 'error',
                error: message.validate.error,
                msg: message.validate.msg
            }));
            return false;
        }
    }
    spark.write(({
        action: 'lock',
        result: 'success'
    }));
    return true;
}

/**
 * Validate a requested deck and if valid lock in the player as ready.
 * @param {Spark} spark connected websocket and Primus user.
 * @param {Message} message JSON communication sent from client.
 * @returns {undefined} 
 */
function lock(spark, message) {
    if (spark.slot === undefined) {
        return;
    }
    if (game.player[spark.slot].ready) {
        game.player[spark.slot].ready = false;
        return;
    }
    try {
        game.player[spark.slot].ready = deckCheck(spark, message, banlist);
    } catch (error) {
        game.player[spark.slot].ready = false;
        throw error;
    }
    game.player[spark.slot].deck = message.deck;
}

/**
 * Create reconnection service for a client.
 * @param {Primus} server Primus instance.
 * @param {String} room room to act as player abstraction.
 * @param {Spark} spark connected websocket and Primus user.
 * @returns {PlayerAbstraction} Representation of a player or group of players a client can reconnect to if disconnected.
 */
function PlayerAbstraction(server, room, spark) {
    if (spark.username) {
        spark.join(room);
        game.reconnection[room] = spark.username;
    }
    server.room('room').write({
        action: 'reconnection',
        room: room
    });
    return {
        write: function(data) {
            server.room('room').write(data);
        },
        main: spark.main,
        extra: spark.extra,
        side: spark.side
    };
}

/**
 * Start the duel
 * @param {Primus} server Primus instance.
 * @param {Spark} spark connected websocket and Primus user.
 * @returns {undefined}
 */
function start(server, spark) {
    if (spark.slot !== 0) {
        return;
    }
    if (!game.player[0] && !game.player[1]) {
        return;
    }
    if (!game.player[0].ready && !game.player[1].ready) {
        return;
    }

    const players = [
            new PlayerAbstraction(server, 'player1', game.player[0]),
            new PlayerAbstraction(server, 'player2', game.player[1])
        ],
        spectators = [new PlayerAbstraction(server, 'spectators', {})];


    ocgcore(game, players, spectators);
    game.started = true;
}

/**
 * Process incoming messages from clients.
 * @param {Primus} server Primus instance.
 * @param {Spark} spark connected websocket and Primus user.
 * @param {Message} message JSON communication sent from client.
 * @returns {Boolean} If the deck is valid or not.
 */
function controller(server, spark, message) {
    //console.log(message);
    if (!message.action) {
        return;
    }
    if (!spark.username) {
        register(spark, message);
        return;
    }
    switch (message.action) {
        case 'ping':
            broadcast(server);
            break;
        case 'chat':
            chat(spark, message);
            break;
        case 'join':
            attemptJoin(server, spark);
            break;
        case 'kick':
            kick(server, spark, message);
            break;
        case 'spectate':
            spectate(server, message, spark.username);
            break;
        case 'surrender':
            surrender(message);
            broadcast(server);
            break;
        case 'lock':
            lock(spark, message, banlist);
            broadcast(server);
            break;
        case 'start':
            start(spark);
            broadcast(server);
            break;
        default:
            broadcast(server);
            break;
    }
}

/**
 * Add additional error handling and then, process incoming messages from clients.
 * @param {Primus} server Primus instance.
 * @param {Spark} spark connected websocket and Primus user.
 * @param {Message} message JSON communication sent from client.
 * @returns {Boolean} If the deck is valid or not.
 */
function messageHandler(server, spark, message) {
    try {
        controller(server, spark, message, banlist);
    } catch (error) {
        console.log(error);
        spark.write({
            error: error.message,
            stack: error.stack,
            input: (message)
        });
    }

}

/**
 * Start the server.
 * @returns {undefined}
 */
function main() {
    const port = process.env.PORT || 8082,
        server = new Primus(http.createServer(staticWebServer), {
            parser: 'JSON'
        }).listen(port);

    server.plugin('rooms', Rooms);

    server.save(__dirname + '/../http/js/vendor/server.js');
    server.on('connection', function(spark) {
        spark.on('data', function(data) {
            messageHandler(server, spark, data, banlist);
        });
    });
}

main();

module.exports = {
    getGame: function() {
        return game;
    },
    main: main
};