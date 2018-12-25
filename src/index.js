// Gamelist object acts similar to a Redis server, could be replaced with on but its the gamelist state.
'use strict';

/**
 * @typedef CardRecord
 * @type {Object}
 * @property {Number} id passcode of the card.
 */

// Mostly just stuff so that Express runs
const child_process = require('child_process'),
    hotload = require('hotload'),
    cardidmap = hotload('../http/cardidmap.js'),
    userController = require('./controller_users.js'),
    adminlist = hotload('./record_admins.js'),
    primusServer = require('./controller_http')(),
    Primus = require('primus'),
    Rooms = require('primus-rooms');

var userlist = [],
    chatbox = [],
    games = [],
    gamelist = {},
    primus,
    acklevel = 0,
    currentGlobalMessage = '',
    uuid = require('uuid').uuid4,
    sanitize = require('./lib_html_sanitizer.js');


/**
 * Maps a deck to updated IDs.
 * @param   {CardRecord[]} deck A deck of cards from the user possibly containing old cards.
 * @returns {CardRecord[]} A deck of cards from the user.
 */
function mapCards(deck) {
    return deck.map(function(cardInDeck) {
        if (cardidmap[cardInDeck.id]) {
            return {
                id: cardidmap[cardInDeck.id]
            };
        } else {
            // else we just return out the old card object
            return cardInDeck;
        }
    });
}

function announce(announcement) {
    primus.write(announcement);
}

function massAck() {
    acklevel = 0;
    userlist = [];
    announce({
        clientEvent: 'ack',
        serverEvent: 'ack'
    });
}

function unsafePort() {
    return Math.floor(Math.random() * (9000 - 2000) + 2000);
}

function registrationCall(data, socket) {
    userController.validate(true, data, function(error, valid, info) {

        if (error) {
            console.log(error);
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
        if (valid) {
            socket.username = info.username;

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
            announce(gamelist);
        } else {
            socket.write({
                clientEvent: 'servererror',
                message: currentGlobalMessage
            });
            socket.write({
                clientEvent: 'login',
                info: info
            });
        }

    });
}

function globalCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            console.log('[Gamelist]', error);
            return;
        }
        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'global',
                message: data.message
            });
            currentGlobalMessage = data.message;
        } else {
            console.log(data, 'asked for global', 'Info Was', info.success, 'Is Admin was', adminlist[data.username]);
        }
    });
}

function globalRequested(socket) {
    socket.write({
        clientEvent: 'global',
        message: currentGlobalMessage
    });
    socket.write(gamelist);
}


function genocideCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            return;
        }
        if (info.data) {
            if (info.success && info.data.g_access_cp === '1') {
                announce({
                    clientEvent: 'genocide',
                    message: data.message
                });
            } else {
                console.log(data, 'asked for genocide');
            }
        } else {
            console.log(data, 'asked for genocide');
        }
    });
}

function reviveCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            return;
        }

        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'revive',
                target: data.target
            });

        } else {
            console.log(data, 'asked for murder');
        }

    });
}


function murderCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            return;
        }

        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'murder',
                target: data.target
            });
        } else {
            console.log(data, 'asked for murder');
        }

    });
}

function censorCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            return;
        }

        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'censor',
                messageID: data.messageID
            });
            chatbox = chatbox.filter(function(message) {
                return message.uid !== Number(data.messageID);
            });

        } else {
            console.log(data, 'asked for censor');
        }

    });
}

function mindcrushCall(data) {
    userController.validate(false, data, function(error, info, body) {
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
        console.log(data, 'asked for mind crush');
    });
}

function childHandler(child, socket, message) {
    switch (message.action) {
        case 'lobby':
            gamelist[message.game.roompass] = message.game;
            gamelist[message.game.roompass].port = message.port;
            announce(gamelist);
            break;
        case 'stop':
            delete gamelist[message.game.roompass];
            announce(gamelist);
            break;
        case 'ready':
            announce(gamelist);
            socket.write({
                clientEvent: 'lobby',
                roompass: message.roompass,
                port: message.port
            });
            break;
        case 'register':
            userController.validateSession({
                session: message.session
            }, function(error, valid, person) {
                child.send({
                    action: 'register',
                    error,
                    person,
                    session: message.session,
                    valid

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
                console.log(socket.username, 'requested AI Duel');
                announce({
                    clientEvent: 'duelrequest',
                    target: 'SnarkyChild',
                    from: socket.username,
                    roompass: data.roompass,
                    deck: data.deck
                });
                socket.aiReady = false;
                setTimeout(function() {
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
        case ('chatline'):
            if (socket.username && socket.speak) {
                const chatuuid = uuid();
                socket.speak = false;
                if (chatbox.length > 100) {
                    chatbox.shift();
                }
                announce({
                    clientEvent: 'chatline',
                    from: socket.username,
                    msg: sanitize(data.msg),
                    uid: chatuuid,
                    date: new Date(),
                    timezone: data.timezone
                });
                chatbox.push({
                    from: socket.username,
                    msg: sanitize(data.msg),
                    uid: chatuuid,
                    date: new Date(),
                    timezone: data.timezone
                });
                setTimeout(function() {
                    socket.speak = true;
                }, 500);
            } else {
                primus.room(socket.address.ip + data.uniqueID).write({
                    clientEvent: 'slowchat',
                    error: 'Exceeded 500ms chat timeout'
                });
            }
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
            mindcrushCall(data);
            break;
        case ('host'):
            const child = child_process.fork(
                './application_ygopro.js', process.argv, {
                    cwd: __dirname,
                    env: Object.assign({}, process.env, data.info, { PORT: unsafePort() })
                }
            );
            child.on('message', function(message) {
                console.log('...', message);
                childHandler(child, socket, message);
            });
            games.push(child);
            break;
        case ('privateMessage'):
            if (socket.username) {
                data.date = new Date();
                console.log(data);
                primus.room(data.to).write(data);
            }
            break;
        case 'save':
            delete data.action;
            data.decks.forEach(function(deck, i) { //cycles through the decks
                data.decks[i].main = mapCards(data.decks[i].main); //This cannot be simplified 
                data.decks[i].side = mapCards(data.decks[i].side); //further due to the abstract
                data.decks[i].extra = mapCards(data.decks[i].extra); //of data.decks, afaik
            }); //unsure if loop should run through all decks for a single save; might be resource intensive
            userController.saveDeck(data, function(error, docs) {
                primus.room(socket.address.ip + data.uniqueID).write({
                    clientEvent: 'deckSaved',
                    error: error
                });
            });

            break;
        default:
            return;
    }
}




primus = new Primus(primusServer, {
    parser: 'JSON'
});

primus.plugin('rooms', Rooms);


primus.on('connection', function(socket) {
    socket.on('data', function(data) {
        console.log(data);
        try {
            onData(data, socket);
        } catch (error) {
            console.log(error);
        }
    });
});

setInterval(function() {
    announce({
        clientEvent: 'ackresult',
        ackresult: acklevel,
        userlist: userlist
    });
    announce(gamelist);
    massAck();
}, 15000);