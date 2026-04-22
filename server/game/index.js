// Gamelist object acts similar to a Redis server, could be replaced with on but its the gamelist state.
'use strict';

/**
 * @typedef CardRecord
 * @type {Object}
 * @property {Number} id passcode of the card.
 */

// Mostly just stuff so that Express runs
const child_process = require('child_process'),
    { randomUUID } = require("crypto"),
    logger = require('./logger'),
    { WebSocketServer, WebSocket } = require('ws'),
    cardIDMap = require('../http/public/cardidmap.js'),
    userController = require('../api/routes/endpoint_users.js'),
    decks = require('../api/routes/endpoint_decks.js'),
    adminlist = {},
    connectionServer = require('./server_http')(),
    services = require('../api/routes/endpoint_services'),
    sanitize = require('./lib_html_sanitizer.js'),
    { log } = logger.create(logger.config.main, '[INDEX]'),
    { log: debug } = logger.create(logger.config.debug, '[DEBUG]'),
    { log: logError } = logger.create(logger.config.error, '[ERROR]'),
    gamelist = {},
    gamePorts = {};

let chatbox = [],
    userlist = [],
    connection,
    socketRooms = new Map(),
    roomSockets = new Map(),
    acklevel = 0,
    currentGlobalMessage = '';


/**
 * Maps cards used by the tcgcore module.
 * @param {Array} deck The deck array supplies the ordered values used by the tcgcore module, each item uses the `id` property.
 * @param {string} deck[].id The `[].id` property describes data read from each item used by the tcgcore module.
 * @returns {Array} Returns the value produced by the tcgcore module.
 */
function mapCards(deck) {
    return deck.map(function (cardInDeck) {
        return (cardIDMap[cardInDeck.id])
            ? {
                id: cardIDMap[cardInDeck.id]
            }
            : cardInDeck;

    });
}

/**
 * Executes the announce helper used by the tcgcore module.
 * @param {Object} announcement The announcement value provides an input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function announce(announcement) {
    connection.write(announcement);
}

/**
 * Joins room used by the tcgcore module.
 * @param {Object} socket The socket value provides an input used by the tcgcore module.
 * @param {string} roomName The roomName value provides an input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function joinRoom(socket, roomName) {
    if (!socketRooms.has(socket)) {
        socketRooms.set(socket, new Set());
    }
    const rooms = socketRooms.get(socket);
    rooms.add(roomName);

    if (!roomSockets.has(roomName)) {
        roomSockets.set(roomName, new Set());
    }
    roomSockets.get(roomName).add(socket);
}

/**
 * Executes the leave all rooms helper used by the tcgcore module.
 * @param {Object} socket The socket value provides an input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function leaveAllRooms(socket) {
    const rooms = socketRooms.get(socket);
    if (!rooms) {
        return;
    }
    rooms.forEach((roomName) => {
        const sockets = roomSockets.get(roomName);
        if (!sockets) {
            return;
        }
        sockets.delete(socket);
        if (sockets.size === 0) {
            roomSockets.delete(roomName);
        }
    });
    socketRooms.delete(socket);
}

/**
 * Creates native connection used by the tcgcore module.
 * @param {Object} server The server value provides an input used by the tcgcore module.
 * @returns {Object} Returns the value produced by the tcgcore module.
 */
function createNativeConnection(server) {
    const wss = new WebSocketServer({ server }),
        sockets = new Set();
    let connectionHandler = null;

            /**
     * Sends packet used by the tcgcore module.
     * @param {Object} socket The socket object supplies the structured input used by the tcgcore module, including the `readyState` property.
     * @param {Object} socket.readyState The `readyState` property supplies structured input used by the tcgcore module.
     * @param {Object} packet The packet value provides an input used by the tcgcore module.
     * @returns {void} Does not return a value.
     */
    function sendPacket(socket, packet) {
        if (socket.readyState !== WebSocket.OPEN) {
            return;
        }
        socket.send(JSON.stringify(packet));
    }

    wss.on('connection', (socket, request) => {
        sockets.add(socket);
        socket.address = {
            ip: request?.socket?.remoteAddress || ''
        };

        const nativeOn = socket.on.bind(socket),
            dataHandlers = [];
        socket.on = function (event, handler) {
            if (event === 'data') {
                dataHandlers.push(handler);
                return socket;
            }
            nativeOn(event, handler);
            return socket;
        };

        socket.write = function (packet) {
            sendPacket(socket, packet);
        };

        socket.join = function (roomName) {
            joinRoom(socket, roomName);
        };

        nativeOn('message', (raw) => {
            let data;
            try {
                data = JSON.parse(raw.toString());
            } catch (error) {
                return;
            }
            dataHandlers.forEach((handler) => {
                handler(data);
            });
        });

        nativeOn('close', () => {
            leaveAllRooms(socket);
            sockets.delete(socket);
        });

        if (typeof connectionHandler === 'function') {
            connectionHandler(socket);
        }
    });

    return {
        Spark: {
            CLOSED: WebSocket.CLOSED
        },
                        /**
         * Executes the on helper used by the tcgcore module.
         * @param {Object} event The event event provides the browser event data used by the tcgcore module.
         * @param {Function} handler The handler value provides an input used by the tcgcore module.
         * @returns {void} Does not return a value.
         */
        on(event, handler) {
            if (event === 'connection') {
                connectionHandler = handler;
            }
        },
                        /**
         * Executes the write helper used by the tcgcore module.
         * @param {Object} packet The packet value provides an input used by the tcgcore module.
         * @returns {void} Does not return a value.
         */
        write(packet) {
            sockets.forEach((socket) => {
                sendPacket(socket, packet);
            });
        },
                        /**
         * Executes the room helper used by the tcgcore module.
         * @param {string} roomName The roomName value provides an input used by the tcgcore module.
         * @returns {Object} Returns the value produced by the tcgcore module.
         */
        room(roomName) {
            return {
                                                /**
                 * Executes the write helper used by the tcgcore module.
                 * @param {Object} packet The packet value provides an input used by the tcgcore module.
                 * @returns {void} Does not return a value.
                 */
                write(packet) {
                    const sockets = roomSockets.get(roomName);
                    if (!sockets) {
                        return;
                    }
                    sockets.forEach((socket) => {
                        sendPacket(socket, packet);
                    });
                }
            };
        }
    };
}


/**
 * Executes the mass ack helper used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function massAck() {
    acklevel = 0;
    userlist = [];
    announce({
        clientEvent: 'ack',
        serverEvent: 'ack'
    });
}


/**
 * Executes the unsafe port helper used by the tcgcore module.
 * @returns {number} Returns the value produced by the tcgcore module.
 */
function unsafePort() {
    const minPort = process.env.PORT_RANGE_MIN
        ? Number(process.env.PORT_RANGE_MIN)
        : 2000,
        maxPort = process.env.PORT_RANGE_MAX
            ? Number(process.env.PORT_RANGE_MAX)
            : 9000;

    return Math.floor(Math.random() * (maxPort - minPort) + minPort);
}

/**
 * Executes the registration call helper used by the tcgcore module.
 * @param {Object} data The data value provides an input used by the tcgcore module.
 * @param {Object} socket The socket object supplies the structured input used by the tcgcore module, including the `admin`, `session`, `speak`, and `username` properties.
 * @param {number} socket.admin The `admin` property supplies structured input used by the tcgcore module.
 * @param {string} socket.session The `session` property supplies structured input used by the tcgcore module.
 * @param {Function} socket.speak The `speak` property supplies structured input used by the tcgcore module.
 * @param {string} socket.username The `username` property supplies structured input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function registrationCall(data, socket) {
    userController.validate(true, data, function (error, valid, responseData) {

        if (error) {
            logError(error);
            socket.write({
                clientEvent: 'servererror',
                message: currentGlobalMessage
            });
            socket.write({
                clientEvent: 'login',
                info: {
                    message: error.message
                },
                error: error
            });
            return;
        }
        const info = responseData.user;
        info.session = responseData.jwt;
        info.decks = responseData.decks;
        if (valid) {
            socket.username = info.username;

            socket.session = info.session;
            socket.admin = (info.role.name === 'Administrator');
            log(`${socket.username} has logged in`);
            socket.write({
                clientEvent: 'global',
                message: currentGlobalMessage,
                admin: (info.role.name === 'Administrator')
            });
            socket.write({
                clientEvent: 'ackresult',
                ackresult: acklevel,
                userlist: userlist
            });

            socket.speak = true;
            socket.write({
                clientEvent: 'login',
                info: {
                    username: info.username,
                    decks: info.decks,
                    friends: info.friends,
                    session: info.session,
                    sessionExpiration: info.sessionExpiration,
                    ranking: info.ranking,
                    admin: info.admin,
                    rewards: info.rewards,
                    settings: info.settings,
                    bans: info.bans
                },
                chatbox: chatbox
            });
            socket.join(socket.username);
            announce({
                clientEvent: 'gamelist',
                gamelist,
                ackresult: acklevel,
                userlist: userlist
            });
            return;
        }

        socket.write({
            clientEvent: 'servererror',
            message: currentGlobalMessage
        });

        socket.write({
            clientEvent: 'login',
            info: info
        });


    });
}

/**
 * Executes the global call helper used by the tcgcore module.
 * @param {Object} data The data object supplies the structured input used by the tcgcore module, including the `message` and `username` properties.
 * @param {string} data.message The `message` property supplies structured input used by the tcgcore module.
 * @param {string} data.username The `username` property supplies structured input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function globalCall(data) {
    userController.validate(false, data, function (error, info, body) {
        if (error) {
            log('[Gamelist]', error);
            return;
        }
        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'global',
                message: data.message
            });
            currentGlobalMessage = data.message;
            return;
        }

        log(data, 'asked for global', 'Info Was', info.success, 'Is Admin was', adminlist[data.username]);
    });
}

/**
 * Executes the global requested helper used by the tcgcore module.
 * @param {Object} socket The socket value provides an input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function globalRequested(socket) {
    socket.write({
        clientEvent: 'global',
        message: currentGlobalMessage
    });

}


/**
 * Executes the genocide call helper used by the tcgcore module.
 * @param {Object} data The data object supplies the structured input used by the tcgcore module, including the `message` property.
 * @param {string} data.message The `message` property supplies structured input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function genocideCall(data) {
    userController.validate(false, data, function (error, info, body) {
        if (error) {
            return;
        }
        if (info.data && info.success && info.data.g_access_cp === '1') {
            announce({
                clientEvent: 'genocide',
                message: data.message
            });
            return;
        }

        log(data, 'asked for genocide');
    });
}

/**
 * Executes the revive call helper used by the tcgcore module.
 * @param {Object} data The data object supplies the structured input used by the tcgcore module, including the `target` and `username` properties.
 * @param {Array} data.target The `target` property supplies structured input used by the tcgcore module.
 * @param {string} data.username The `username` property supplies structured input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function reviveCall(data) {
    userController.validate(false, data, function (error, info, body) {
        if (error) {
            return;
        }
        log(data, 'asked for murder');
        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'revive',
                target: data.target
            });
            return;
        }
    });
}


/**
 * Executes the murder call helper used by the tcgcore module.
 * @param {Object} data The data object supplies the structured input used by the tcgcore module, including the `target` and `username` properties.
 * @param {Array} data.target The `target` property supplies structured input used by the tcgcore module.
 * @param {string} data.username The `username` property supplies structured input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function murderCall(data) {
    userController.validate(false, data, function (error, info, body) {
        if (error) {
            return;
        }
        log(data, 'asked for murder');
        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'murder',
                target: data.target
            });
            return;
        }


    });
}

/**
 * Executes the censor call helper used by the tcgcore module.
 * @param {Object} data The data object supplies the structured input used by the tcgcore module, including the `messageID` and `username` properties.
 * @param {(string|number)} data.messageID The `messageID` property supplies structured input used by the tcgcore module.
 * @param {string} data.username The `username` property supplies structured input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function censorCall(data) {
    userController.validate(false, data, function (error, info, body) {
        if (error) {
            return;
        }

        log(data, 'asked for censor');
        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'censor',
                messageID: data.messageID
            });
            chatbox = chatbox.filter(function (message) {
                return message.uid !== Number(data.messageID);
            });

        }
    });
}

/**
 * Executes the mind crush call helper used by the tcgcore module.
 * @param {Object} data The data object supplies the structured input used by the tcgcore module, including the `target` and `username` properties.
 * @param {Array} data.target The `target` property supplies structured input used by the tcgcore module.
 * @param {string} data.username The `username` property supplies structured input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function mindCrushCall(data) {
    userController.validate(false, data, function (error, info, body) {
        if (error) {
            return;
        }
        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'mindcrush',
                target: data.target
            });
            return;
        }
        log(data, 'asked for mind crush');
    });
}

/**
 * Executes the child handler helper used by the tcgcore module.
 * @param {Object} child The child value provides an input used by the tcgcore module.
 * @param {Object} socket The socket value provides an input used by the tcgcore module.
 * @param {Object} message The message object supplies the structured input used by the tcgcore module, including the `action`, `game`, `port`, `roompass`, `session`, and `username` properties.
 * @param {string} message.action The `action` property supplies structured input used by the tcgcore module.
 * @param {Object} message.game The `game` property supplies structured input used by the tcgcore module.
 * @param {number} message.game.port The `game.port` property supplies structured input used by the tcgcore module.
 * @param {string} message.game.roompass The `game.roompass` property supplies structured input used by the tcgcore module.
 * @param {number} message.port The `port` property supplies structured input used by the tcgcore module.
 * @param {string} message.roompass The `roompass` property supplies structured input used by the tcgcore module.
 * @param {string} message.session The `session` property supplies structured input used by the tcgcore module.
 * @param {string} message.username The `username` property supplies structured input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function childHandler(child, socket, message) {
    switch (message.action) {
        case 'lobby':
            gamelist[message.game.roompass] = message.game;
            announce({
                clientEvent: 'gamelist',
                gamelist,
                ackresult: acklevel,
                userlist: userlist
            });
            break;
        case 'stop':
            delete gamelist[message.game.roompass];
            announce({
                clientEvent: 'gamelist',
                gamelist,
                ackresult: acklevel,
                userlist: userlist
            });
            break;
        case 'ready':
            announce({
                clientEvent: 'gamelist',
                gamelist,
                ackresult: acklevel,
                userlist: userlist
            });
            socket.write({
                clientEvent: 'lobby',
                roompass: message.roompass,
                port: message.port
            });
            break;
        case 'register':
            userController.validateSession({
                session: message.session,
                username: message.username
            }, function (error, valid, person) {
                child.send({
                    action: 'register',
                    error,
                    person,
                    session: message.session,
                    valid

                });
            });
            break;

        case 'quit':
            delete gamelist[message.game.roompass];
            delete gamePorts[message.game.port];
            announce({
                clientEvent: 'gamelist',
                gamelist,
                ackresult: acklevel,
                userlist: userlist
            });
            break;
        case 'win':
            services.logDuel(message, function () {
                child.send({
                    action: 'kill'
                });
            });
            break;
    }
}

/**
 * Handles data events for the tcgcore module.
 * @param {Object} data The data object supplies the structured input used by the tcgcore module, including the `action`, `date`, `deck`, `from`, `info`, `msg`, `name`, `roompass`, `session`, `target`, `timezone`, `to`, `uniqueID`, and `username` properties.
 * @param {string} data.action The `action` property supplies structured input used by the tcgcore module.
 * @param {Date} data.date The `date` property supplies structured input used by the tcgcore module.
 * @param {Object} data.deck The `deck` property supplies structured input used by the tcgcore module.
 * @param {Array} data.deck.extra The `deck.extra` property supplies structured input used by the tcgcore module.
 * @param {string} data.deck.id The `deck.id` property supplies structured input used by the tcgcore module.
 * @param {Array} data.deck.main The `deck.main` property supplies structured input used by the tcgcore module.
 * @param {string} data.deck.owner The `deck.owner` property supplies structured input used by the tcgcore module.
 * @param {Array} data.deck.side The `deck.side` property supplies structured input used by the tcgcore module.
 * @param {string} data.from The `from` property supplies structured input used by the tcgcore module.
 * @param {Object} data.info The `info` property supplies structured input used by the tcgcore module.
 * @param {string} data.msg The `msg` property supplies structured input used by the tcgcore module.
 * @param {string} data.name The `name` property supplies structured input used by the tcgcore module.
 * @param {string} data.roompass The `roompass` property supplies structured input used by the tcgcore module.
 * @param {string} data.session The `session` property supplies structured input used by the tcgcore module.
 * @param {Array} data.target The `target` property supplies structured input used by the tcgcore module.
 * @param {string} data.timezone The `timezone` property supplies structured input used by the tcgcore module.
 * @param {string} data.to The `to` property supplies structured input used by the tcgcore module.
 * @param {string} data.uniqueID The `uniqueID` property supplies structured input used by the tcgcore module.
 * @param {string} data.username The `username` property supplies structured input used by the tcgcore module.
 * @param {Object} socket The socket object supplies the structured input used by the tcgcore module, including the `address`, `aiReady`, `readyState`, `session`, `speak`, and `username` properties.
 * @param {Object} socket.address The `address` property supplies structured input used by the tcgcore module.
 * @param {string} socket.address.ip The `address.ip` property supplies structured input used by the tcgcore module.
 * @param {boolean} socket.aiReady The `aiReady` property supplies structured input used by the tcgcore module.
 * @param {number} socket.readyState The `readyState` property supplies structured input used by the tcgcore module.
 * @param {string} socket.session The `session` property supplies structured input used by the tcgcore module.
 * @param {Function} socket.speak The `speak` property supplies structured input used by the tcgcore module.
 * @param {string} socket.username The `username` property supplies structured input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function onData(data, socket) {
    var action,
        save;
    data = data || {};
    action = data.action;
    save = false;
    if (socket.readyState !== WebSocket.CLOSED) {
        save = true;
    }
    if (save === false) {
        return;
    }


    socket.join(socket.address.ip + data.uniqueID);
    switch (action) {
        case ('duelrequest'):
            announce({
                clientEvent: 'duelrequest',
                target: data.target,
                from: data.from,
                roompass: data.roompass
            });

            break;
        case ('ai'):
            if (socket.username && socket.aiReady) {
                log(socket.username, 'requested AI Duel');
                announce({
                    clientEvent: 'duelrequest',
                    target: 'SnarkyChild',
                    from: socket.username,
                    roompass: data.roompass,
                    deck: data.deck
                });
                socket.aiReady = false;
                setTimeout(function () {
                    socket.aiReady = true;
                }, 10000);
            }
            break;

        case ('ack'):
            acklevel += 1;
            if (data.name) {
                userlist.push(data.name);
            }
            break;
        case ('register'):
            registrationCall(data, socket);
            break;
        case 'loadSession':
            userController.validateSession({
                session: data.session,
                username: data.username
            }, function (error, valid, info) {
                if (error || !valid) {
                    return;
                }
                socket.username = info.username;
                log(`${socket.username} has rejoined session!`);
                socket.session = data.session;
                socket.write({
                    clientEvent: 'global',
                    message: currentGlobalMessage,
                    admin: adminlist[data.username]
                });
                socket.write({
                    clientEvent: 'ackresult',
                    ackresult: acklevel,
                    userlist: userlist
                });
                socket.speak = true;
                socket.write({
                    clientEvent: 'login',
                    info: {
                        username: info.username,
                        decks: info.decks,
                        friends: info.friends,
                        session: data.session,
                        admin: info.admin,
                        rewards: info.rewards,
                        settings: info.settings,
                        bans: info.bans
                    },
                    chatbox: chatbox
                });
                socket.join(socket.username);
            });
            break;
        case ('chatline'):
            if (socket.username && socket.speak) {
                const chatUUID = randomUUID();
                socket.speak = false;
                if (chatbox.length > 100) {
                    chatbox.shift();
                }
                announce({
                    clientEvent: 'chatline',
                    from: socket.username,
                    msg: sanitize(data.msg),
                    uid: chatUUID,
                    date: new Date(),
                    timezone: data.timezone
                });
                chatbox.push({
                    from: socket.username,
                    msg: sanitize(data.msg),
                    uid: chatUUID,
                    date: new Date(),
                    timezone: data.timezone
                });
                setTimeout(function () {
                    socket.speak = true;
                }, 500);
                break;
            }
            connection.room(socket.address.ip + data.uniqueID).write({
                clientEvent: 'slowchat',
                error: 'Exceeded 500ms chat timeout'
            });

            break;
        case ('global'):
            globalCall(data);
            break;
        case ('globalrequest'):
            globalRequested(socket);
            break;
        case ('genocide'):
            genocideCall(data);
            break;
        case ('murder'):
            murderCall(data);
            break;
        case ('censor'):
            censorCall(data);
            break;
        case ('revive'):
            reviveCall(data);
            break;
        case ('mindcrush'):
            mindCrushCall(data);
            break;
        case ('host'):
            const port = unsafePort(),
                execArgv = (process.env.CORE_DEBUG)
                    ? [`--inspect=${unsafePort()}`]
                    : undefined,
                child = child_process.fork(
                    './core/index.js', process.argv, {
                    cwd: __dirname,
                    env: Object.assign({}, process.env, data.info, { PORT: port }),
                    execArgv
                }
                );
            child.on('message', function (message) {
                childHandler(child, socket, message);
            });
            gamePorts[port] = child;
            break;
        case ('privateMessage'):
            if (socket.username) {
                data.date = new Date();
                connection.room(data.to).write(data);
            }
            break;
        case 'save':
            if (!socket.username) {
                log('no user cant save');
                return;
            }
            delete data.action;
            data.session = data.session || socket.session;
            data.deck.main = mapCards(data.deck.main);
            data.deck.side = mapCards(data.deck.side);
            data.deck.extra = mapCards(data.deck.extra);
            data.deck.owner = socket.username;
            data.username = socket.username;
            log(data);
            decks.saveDeck(data.session, data.deck, socket.username, function (error, savedDecks) {
                connection.room(socket.address.ip + data.uniqueID).write({
                    clientEvent: 'savedDeck',
                    error,
                    savedDecks
                });
            });

            break;
        case 'delete':
            if (!socket.username) {
                return;
            }
            data.session = data.session || socket.session;
            decks.deleteDeck(data.session, data.deck.id, socket.username, function (error, savedDecks) {
                connection.room(socket.address.ip + data.uniqueID).write({
                    clientEvent: 'deletedDeck',
                    error,
                    savedDecks,
                    id: data.deck.id
                });
            });
            break;
        default:
            return;
    }
}


/**
 * Handles connection data events for the tcgcore module.
 * @param {Object} socket The socket value provides an input used by the tcgcore module.
 * @param {Object} data The data value provides an input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function onConnectionData(socket, data) {
    try {
        socket.write({
            clientEvent: 'gamelist',
            gamelist,
            ackresult: acklevel,
            userlist: userlist
        });
        onData(data, socket);

    } catch (error) {
        logError(error);
    }
}


/**
 * Handles connection events for the tcgcore module.
 * @param {Object} socket The socket value provides an input used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function onConnection(socket) {
    socket.on('data', function (data) {
        onConnectionData(socket, data);
    });
}

/**
 * Executes the start helper used by the tcgcore module.
 * @returns {void} Does not return a value.
 */
function start() {
    connection = createNativeConnection(connectionServer);
    connection.on('connection', onConnection);

    setInterval(function () {
        announce({
            clientEvent: 'ackresult',
            ackresult: acklevel,
            userlist: userlist
        });
        announce({
            clientEvent: 'gamelist',
            gamelist,
            ackresult: acklevel,
            userlist: userlist
        });
        massAck();
    }, 15000);

}

module.exports = start;
