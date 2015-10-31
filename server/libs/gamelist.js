/*jslint  node: true, plusplus: true, white: false*/
// Gamelist object acts similar to a Redis server, could be replaced with on but its the gamelist state.
'use strict';
var http = require('http');
var primus,
    gamelist = {},
    userdata = {},
    registry = {
        //People that have read this source code.
        SnarkyChild: '::ffff:127.0.0.1',
        AccessDenied: '::ffff:127.0.0.1',
        Irate: '::ffff:127.0.0.1',
        Chibi: '::ffff:127.0.0.1',
        OmniMage: '::ffff:127.0.0.1'
    },
    online = 0,
    activeDuels = 0,
    logins = 0,
    booting = true,
    lockStatus = false,
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    primusServer = http.createServer().listen(24555),
    duelserv = require('./duelserv.js'),
    cluster = require('cluster'),
    previousAnnouncement = "",
    domain = require('domain'),
    path = require('path'),

    ps = require('ps-node'),
    forumValidate = require('./forum-validator.js'),
    currentGlobalMessage = '';

var logger = require('./logger.js');

setTimeout(function () {
    //give the system ten seconds to figure itself out.
    booting = false;
}, 10000);



function handleCoreMessage(core_message_raw, port, pid) {

    var handleCoreMessageWatcher = domain.create();
    handleCoreMessageWatcher.on('error', function (err) {});
    handleCoreMessageWatcher.run(function () {

        if (core_message_raw.toString().indexOf("::::") < 0) {
            return gamelist; //means its not a message pertaining to the gamelist API.
        }

        var chat,
            join_slot,
            leave_slot,
            lock_slot,
            core_message = core_message_raw.toString().split('|');
        core_message[0] = core_message[0].trim();
        if (core_message[1] === undefined) {
            return gamelist;
        }
        if (gamelist[core_message[1]] === undefined) {
            gamelist[core_message[1]] = {
                players: [],
                locked: [false, false, false, false],
                spectators: 0,
                started: false,
                time: new Date(),
                pid: pid || undefined
            };
            //if the room its talking about isnt on the gamelist, put it on the gamelist.
        }
        switch (core_message[0]) {

        case ('::::join-slot'):
            join_slot = parseInt(core_message[2], 10);
            if (join_slot === -1) {
                return;
            }
            gamelist[core_message[1]].players[join_slot] = core_message[3].trim();
            gamelist[core_message[1]].time = new Date();
            gamelist[core_message[1]].port = port;
            break;

        case ('::::left-slot'):
            leave_slot = parseInt(core_message[2], 10);
            if (leave_slot === -1) {
                return;
            }
            gamelist[core_message[1]].players[leave_slot] = null;
            break;

        case ('::::spectator'):
            gamelist[core_message[1]].spectators = parseInt(core_message[2], 10);
            break;

        case ('::::lock-slot'):
            lock_slot = parseInt(core_message[2], 10);
            gamelist[core_message[1]].locked[lock_slot] = Boolean(core_message[2]);
            break;

        case ('::::endduel'):
            //ps.kill(gamelist[core_message[1]].pid, function (error) {});
            delete gamelist[core_message[1]];
            //process.kill(pid);
            break;

        case ('::::startduel'):
            gamelist[core_message[1]].started = true;
            gamelist[core_message[1]].time = new Date();
            duelserv.bot.say('#public', gamelist[core_message[1]].pid + '|Duel starting|' + JSON.stringify(gamelist[core_message[1]].players));
            break;

        case ('::::chat'):
            chat = core_message.join(' ');

            process.nextTick(function () {
                logger.info(gamelist[core_message[1]].pid + '|' + core_message[2] + ': ' + core_message[3]);
            });
            process.nextTick(function () {
                duelserv.bot.say('#public', gamelist[core_message[1]].pid + '|' + core_message[2] + ': ' + core_message[3]);
            });
            break;
        }
    });
}

function announce(announcement) {

    if (previousAnnouncement === announcement) {
        return;
    } else {
        primus.room('activegames').write(announcement);
        previousAnnouncement = announcement;
    }
}

function internalMessage(announcement) {
    process.nextTick(function () {
        primus.room('internalservers').write(announcement);
    });
}

function del(pid) {
    var game;
    for (game in gamelist) {
        if (gamelist.hasOwnProperty(game)) {
            if (String() + gamelist[game].pid === pid) {
                delete gamelist[game];
                announce(JSON.stringify(gamelist));
            }
        }
    }
    setTimeout(function () {
        ps.kill(pid, function (error) {});
    }, 5000);
}

function messageListener(message) {

    var messageListenerWatcher = domain.create();
    messageListenerWatcher.on('error', function (err) {
        console.log(err);
    });
    messageListenerWatcher.run(function () {
        activeDuels = 0;
        var brokenup = message.core_message_raw.toString().split('\r\n'),
            game,
            users,
            i = 0;
        for (i; brokenup.length > i; i++) {
            handleCoreMessage(brokenup[i], message.port, message.pid);
        }
        for (game in gamelist) {
            if (gamelist.hasOwnProperty(game)) {
                if (gamelist[game].players.length === 0 && gamelist[game].spectators === 0) {
                    //delete if no one is using the game.
                    del(gamelist[game].pid);
                }
            }
        }
        for (game in gamelist) {
            if (gamelist.hasOwnProperty(game)) {
                if (gamelist[game] && game.length !== 24) {
                    //delete if some wierd game makes it into the list somehow. Unlikely.
                    del(gamelist[game].pid);
                }
            }
        }
        for (game in gamelist) {
            if (gamelist.hasOwnProperty(game)) {
                if (new Date().getTime() - gamelist[game].time.getTime() > 2700000) {
                    //delete if the game is older than 45mins.
                    del(gamelist[game].pid);
                }
            }
        }
        activeDuels = 0;
        for (game in gamelist) {
            if (gamelist.hasOwnProperty(game)) {
                activeDuels++;
            }
        }
        logins = 0;
        for (users in registry) {
            if (registry.hasOwnProperty(users)) {
                logins++;
            }
        }
        announce(JSON.stringify(gamelist));
    });
    return gamelist;
}

function sendRegistry() {
    internalMessage({
        messagetype: 'registry',
        registry: registry
    });
}

function sendGamelist() {
    internalMessage({
        messagetype: 'gamelist',
        gamelist: gamelist
    });
}

function registrationCall(data, socket) {
    forumValidate(data, function (error, info) {
        if (error) {
            return;
        }
        if (info.success) {
            registry[info.displayname] = socket.address.ip;
            socket.username = data.username;
            sendRegistry();
            socket.write({
                clientEvent: 'global',
                message: currentGlobalMessage
            });
        } else {
            socket.write({
                clientEvent: 'servererror',
                message: currentGlobalMessage
            });
        }
    });
}

function globalCall(data) {
    forumValidate(data, function (error, info) {
        if (info.success && info.data.g_access_cp === "1") {
            announce({
                clientEvent: 'global',
                message: data.message
            });
            currentGlobalMessage = data.message;
        }
    });
}

function restartAnnouncement() {
    console.log('RESTART INITIATED');
    announce({
        clientEvent: 'global',
        message: 'Please finish your current game in the next 10 mins, server is auto updating.'
    });
    // no need to cache this, only effects people actively dueling.
    setTimeout(function () {
        announce({
            clientEvent: 'global',
            message: 'Recent Server Auto Update Complete, Rebooting Server in 10 seconds.'
        });
        setTimeout(function () {
            process.exit(0);
        }, 10000);
    }, 10000);

}

function restartCall(data) {
    forumValidate(data, function (error, info) {
        if (info.success && info.data.g_access_cp === "1") {
            restartAnnouncement();
        }
    });
}

function genocideCall(data) {
    forumValidate(data, function (error, info) {
        if (info.success && info.data.g_access_cp === "1") {
            announce({
                clientEvent: 'genocide',
                message: data.message
            });
        }
    });
}

function murderCall(data) {
    forumValidate(data, function (error, info) {
        if (info.success && info.data.g_access_cp === "1") {
            announce({
                clientEvent: 'kill',
                target: data.target
            });
        }
    });
}

function killgameCall(data) {
    forumValidate(data, function (error, info) {
        if (info.success && info.data.g_access_cp === "1") {
            ps.kill(data.killTarget, function (err) {
                if (err) {
                    del(data.killTarget);
                }
            });
        }
    });
}

primus = new Primus(primusServer, {
    parser: 'JSON'
});
primus.use('rooms', Rooms);

primus.on('error', function (error) {
    console.log(error);
});

primus.on('connection', function (socket) {
    socket.on('data', function (data) {

        data = data || {};
        var action = data.action;

        socket.join(socket.address.ip + data.uniqueID);
        switch (action) {
        case ('internalServerLogin'):
            if (data.password !== process.env.OPERPASS) {
                return;
            }
            socket.join('internalservers', function () {

            });
            if (booting && data.gamelist && data.registry) {
                gamelist = data.gamelist;
                registry = data.registry;
                booting = false;
                console.log(data.gamelist, data.registry);
            }
            break;

        case ('gamelistEvent'):
            if (data.password === process.env.OPERPASS) {
                messageListener(data.coreMessage);
                console.log(data.coreMessage.raw);
                sendGamelist();
            } else {
                console.log('bad insternal request');
            }
            break;
        case ('ai'):
            if (socket.username) {
                announce({
                    clientEvent: 'duelrequest',
                    target: 'SnarkyChild',
                    from: socket.username,
                    roompass: data.roompass
                });
            }
            break;
        case ('join'):
            socket.join(socket.address.ip + data.uniqueID, function () {
                socket.write({
                    clientEvent: 'privateServer',
                    serverUpdate: userdata[socket.address.ip + data.uniqueID],
                    ip: socket.address.ip + data.uniqueID
                });

                socket.write({
                    clientEvent: 'registrationRequest'
                });

            });

            socket.join('activegames', function () {
                socket.write(JSON.stringify(gamelist));
            });

            break;
        case ('leave'):
            socket.leave('activegames');
            break;
        case ('register'):
            registrationCall(data, socket);
            break;
        case ('global'):
            globalCall(data);
            break;
        case ('genocide'):
            genocideCall(data);
            break;
        case ('murder'):
            murderCall(data);
            break;
        case ('internalRestart'):
            if (data.password !== process.env.OPERPASS) {
                return;
            }
            restartAnnouncement();
            break;
        case ('restart'):
            restartCall(data);
            break;
        case ('killgame'):
            killgameCall(data);
            break;
        case ('privateServerRequest'):
            primus.room(socket.address.ip + data.uniqueID).write({
                clientEvent: 'privateServerRequest',
                parameter: data.parameter,
                local: data.local
            });
            break;
        case ('privateServer'):
            break;
        case ('joinTournament'):
            socket.join('tournament', function () {
                socket.write(JSON.stringify(gamelist));
            });
            break;
        case ('privateUpdate'):
            primus.room(socket.address.ip + data.uniqueID).write({
                clientEvent: 'privateServer',
                serverUpdate: data.serverUpdate
            });
            userdata[socket.address.ip + data.uniqueID] = data.serverUpdate;
            break;
        case ('saveDeckRequest'):
            primus.room(socket.address.ip + data.uniqueID).write({
                clientEvent: 'saveDeck',
                deckList: data.deckList,
                deckName: data.deckName
            });
            break;
        case ('unlinkDeckRequest'):
            primus.room(socket.address.ip + data.uniqueID).write({
                clientEvent: 'unlinkDeck',
                deckName: data.deckName
            });
            break;
        default:
            console.log(data);
        }
    });
});