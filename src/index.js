// Gamelist object acts similar to a Redis server, could be replaced with on but its the gamelist state.
'use strict';

/**
 * @typedef CardRecord
 * @type {Object}
 * @property {Number} id passcode of the card.
 */

// Mostly just stuff so that Express runs
const child_process = require('child_process'),
    logger = require('./logger'),
    cardIDMap = require('../http/public/cardidmap.js'),
    userController = require('./endpoint_users.js'),
    decks = require('./endpoint_decks.js'),
    adminlist = {},
    primusServer = require('./server_http')(),
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    services = require('./endpoint_services'),
    uuid = require('uuid').uuid4,
    sanitize = require('./lib_html_sanitizer.js'),
    { log } = logger.create(logger.config.main, '[INDEX]'),
    { log: debug } = logger.create(logger.config.debug, '[DEBUG]'),
    { log: logError } = logger.create(logger.config.error, '[ERROR]'),
    gamelist = {},
    gamePorts = {};

let chatbox = [],
    userlist = [],
    primus,
    acklevel = 0,
    currentGlobalMessage = '';


/**
 * Maps a deck to updated IDs.
 * @param   {CardRecord[]} deck A deck of cards from the user possibly containing old cards.
 * @returns {CardRecord[]} A deck of cards from the user.
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
 * Server wide client onmessage Event
 * @param {Object} announcement structured message for the client
 * @returns {undefined}
 */
function announce(announcement) {
    primus.write(announcement);
}


/**
 * Request that ever client respond and say it is connected.
 * @returns {undefined}
 */
function massAck() {
    acklevel = 0;
    userlist = [];
    announce({
        clientEvent: 'ack',
        serverEvent: 'ack'
    });
}


function unsafePort() {
    const minPort = process.env.PORT_RANGE_MIN
        ? Number(process.env.PORT_RANGE_MIN)
        : 2000,
        maxPort = process.env.PORT_RANGE_MAX
            ? Number(process.env.PORT_RANGE_MAX)
            : 9000;

    return Math.floor(Math.random() * (maxPort - minPort) + minPort);
}

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
            log(`${socket.username} has logged in`.bold);
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

function globalRequested(socket) {
    socket.write({
        clientEvent: 'global',
        message: currentGlobalMessage
    });

}


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

function onData(data, socket) {
    var action,
        save;
    data = data || {};
    action = data.action;
    save = false;
    if (socket.readyState !== primus.Spark.CLOSED) {
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
                log(`${socket.username} has rejoined session!`.bold);
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
                const chatUUID = uuid();
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
            primus.room(socket.address.ip + data.uniqueID).write({
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
                primus.room(data.to).write(data);
            }
            break;
        case 'save':
            if (!socket.username) {
                log('no user cant save');
                return;
            }
            delete data.action;
            data.deck.main = mapCards(data.deck.main);
            data.deck.side = mapCards(data.deck.side);
            data.deck.extra = mapCards(data.deck.extra);
            data.deck.owner = socket.username;
            data.username = socket.username;
            log(data);
            decks.saveDeck(socket.session, data.deck, socket.username, function (error, savedDecks) {
                primus.room(socket.address.ip + data.uniqueID).write({
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
            decks.deleteDeck(socket.session, data.deck.id, socket.username, function (error, savedDecks) {
                primus.room(socket.address.ip + data.uniqueID).write({
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


function onPrimusData(socket, data) {
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


function onPrimusConnection(socket) {
    socket.on('data', function (data) {
        onPrimusData(socket, data);
    });
}

function start() {
    require('json');
    primus = new Primus(primusServer, {
        parser: 'JSON'
    });

    primus.plugin('rooms', Rooms);
    primus.on('connection', onPrimusConnection);

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