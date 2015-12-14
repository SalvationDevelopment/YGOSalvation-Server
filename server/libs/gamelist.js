/*jslint  node: true, plusplus: true, white: false*/
// Gamelist object acts similar to a Redis server, could be replaced with on but its the gamelist state.
'use strict';
var http = require('http');
var primus,
    gamelist = {},
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
    domain = require('domain'),
    path = require('path'),
    ps = require('ps-node'),
    forumValidate = require('./forum-validator.js'),
    currentGlobalMessage = '';

setTimeout(function () {
    //give the system ten seconds to figure itself out.
    booting = false;
}, 10000);


function internalMessage(announcement) {
    process.nextTick(function () {
        primus.room('internalservers').write(announcement);
    });
}

function logger(announcement) {
    internalMessage({
        messagetype: 'log',
        log: announcement
    });
}

function handleCoreMessage(core_message_raw, port, pid, game) {

    var chat,
        join_slot,
        leave_slot,
        lock_slot,
        core_message,
        handleCoreMessageWatcher = domain.create();
    handleCoreMessageWatcher.on('error', function (error) {
        console.log('[Gamelist]:Error-CoreMessage', core_message_raw, error);
    });
    handleCoreMessageWatcher.enter();

    if (core_message_raw.toString().indexOf("::::") < 0) {
        return gamelist; //means its not a message pertaining to the gamelist API.
    }

    core_message = core_message_raw.toString().split('|');
    console.log(core_message, core_message_raw);
    core_message[0] = core_message[0].trim();
    if (core_message[0] === '::::network-ready') {
        return;
    }
    if (gamelist[game] === undefined) {
        gamelist[game] = {
            players: [],
            locked: [false, false, false, false],
            spectators: 0,
            started: false,
            time: new Date().getTime(),
            pid: pid || undefined
        };
        //if the room its talking about isnt on the gamelist, put it on the gamelist.
    }

    switch (core_message[0]) {
    case ('::::network-end'):
        console.log('--');
        break;
    case ('::::join-slot'):
        join_slot = parseInt(core_message[1], 10);
        if (join_slot === -1) {
            return;
        }
        gamelist[game].players[join_slot] = core_message[2].trim();
        gamelist[game].time = new Date().getTime();
        gamelist[game].port = port;
        break;

    case ('::::left-slot'):
        leave_slot = parseInt(core_message[1], 10);
        if (leave_slot === -1) {
            return;
        }
        gamelist[game].players[leave_slot] = null;
        break;

    case ('::::spectator'):
        gamelist[game].spectators = parseInt(core_message[1], 10);
        break;

    case ('::::lock-slot'):
        lock_slot = parseInt(core_message[1], 10);
        gamelist[game].locked[lock_slot] = Boolean(core_message[1]);
        break;
    case ('::::end-duel'):
        console.log('[Results]', core_message, game);
        break;
    case ('::::endduel'):
        //ps.kill(gamelist[game].pid, function (error) {});
        delete gamelist[game];
        //process.kill(pid);
        break;
    case ('::::end-game'):
        //ps.kill(gamelist[game].pid, function (error) {});
        delete gamelist[game];
        //process.kill(pid);
        break;
    case ('::::chat'):
        chat = core_message.join(' ');
        process.nextTick(function () {
            logger(pid + '|' + core_message[1] + ': ' + core_message[2]);
        });
        process.nextTick(function () {
            //duelserv.bot.say('#public', gamelist[game].pid + '|' + core_message[2] + ': ' + core_message[3]);
        });
        break;
    case ('::::start-game'):
        gamelist[game].started = true;
        gamelist[game].time = new Date().getTime();
        //duelserv.bot.say('#public', gamelist[game].pid + '|Duel starting|' + JSON.stringify(gamelist[game].players));
        console.log('real start-game', game);
        break;


    default:
        console.log('unknown command', game, core_message, core_message[1].length);
    }
    handleCoreMessageWatcher.exit();
}

function announce(announcement) {
    primus.room('activegames').write(announcement);
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
        if (err) {
            console.log(err);
        }
    });
    messageListenerWatcher.run(function () {
        activeDuels = 0;
        var brokenup = message.core_message_raw.toString().split('\r\n'),
            game,
            users,
            i = 0;
        for (i; brokenup.length > i; i++) {
            handleCoreMessage(brokenup[i], message.port, message.pid, message.game);
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

var pidList = [];

function fullManualPIDCheck() {
    var id = pidList.pop();
    if (id === undefined) {
        return;
    }
    ps.lookup({
        pid: id.pid
    }, function (err, resultList) {
        if (err) {
            console.log('lookup failed');
            throw new Error(err);
        }

        var process = resultList[0];

        if (process) {
            setTimeout(fullManualPIDCheck, 100);
        } else {
            console.log('No such process found!');
            delete gamelist[id.name];
            ps.kill(id.pid);
            setTimeout(fullManualPIDCheck, 100);
        }
    });
}

function cleanGamelist() {
    var game;
    for (game in gamelist) {
        if (gamelist.hasOwnProperty(game)) {
            pidList.push({
                pid: gamelist[game].pid,
                name: game
            });
            if (gamelist[game].players.length === 0 && gamelist[game].spectators === 0) {
                //delete if no one is using the game.
                //del(gamelist[game].pid);
                delete gamelist[game];
                cleanGamelist();
                return;
            }
            if (gamelist[game] && game.length !== 24) {
                //delete if some wierd game makes it into the list somehow. Unlikely.
                del(gamelist[game].pid);
                cleanGamelist();
                return;
            }
            if (new Date().getTime() - gamelist[game].time > 2700000) {
                //delete if the game is older than 45mins.
                del(gamelist[game].pid);
                cleanGamelist();
                return;
            }
        }
    }
    fullManualPIDCheck();
}



setInterval(cleanGamelist, 60000);

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
    forumValidate(data, function (error, info, body) {
        if (error) {
            //console.log(error);
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
    forumValidate(data, function (error, info, body) {
        if (error) {
            console.log('[Gamelist]', error);
            return;
        }
        if (info.success && info.data.g_access_cp === "1") {
            announce({
                clientEvent: 'global',
                message: data.message
            });
            currentGlobalMessage = data.message;
        }
    });
}


function genocideCall(data) {
    forumValidate(data, function (error, info, body) {
        if (error) {
            return;
        }
        if (info.success && info.data.g_access_cp === "1") {
            announce({
                clientEvent: 'genocide',
                message: data.message
            });
        }
    });
}

function murderCall(data) {
    forumValidate(data, function (error, info, body) {
        if (error) {
            return;
        }
        if (info.success && info.data.g_access_cp === "1") {
            announce({
                clientEvent: 'kill',
                target: data.target
            });
        }
    });
}

function killgameCall(data) {
    forumValidate(data, function (error, info, body) {
        if (error) {
            return;
        }
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
    console.log('[Gamelist]:', error);
});

function onData(data, socket) {
    var socketwatcher = domain.create(),
        action,
        save;
    socketwatcher.on('error', function (err) {
        if (err.message === "TypeError: Cannot read property 'forwarded' of undefined") {
            // not sure how to handle this yet.
            return;
        }
        console.log('[Gamelist]Error-Critical:', err);
    });
    socketwatcher.enter();
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
    case ('internalServerLogin'):
        if (data.password !== process.env.OPERPASS) {
            return;
        }
        socket.join('internalservers');
        if (booting && data.gamelist && data.registry) {
            gamelist = data.gamelist;
            registry = data.registry;
            booting = false;
            console.log('[Gamelist]:', data.gamelist, data.registry);
        }
        break;

    case ('gamelistEvent'):

        if (data.password === process.env.OPERPASS) {
            messageListener(data.coreMessage);
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
        socket.join(socket.address.ip + data.uniqueID);
        socket.write({
            clientEvent: 'registrationRequest'
        });


        socket.join('activegames');
        socket.write(JSON.stringify(gamelist));

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
        //restartAnnouncement();
        break;
    case ('restart'):
        //restartCall(data);
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
        socket.join('tournament');
        socket.write(JSON.stringify(gamelist));
        break;
    case ('privateUpdate'):
        primus.room(socket.address.ip + data.uniqueID).write({
            clientEvent: 'privateServer',
            serverUpdate: data.serverUpdate
        });

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
    socketwatcher.exit();
}

primus.on('connection', function (socket) {
    var connectionwatcher = domain.create();
    connectionwatcher.on('error', function (err) {
        console.log('[Gamelist]Error Critical User-Connection:', err);
    });
    connectionwatcher.enter();
    socket.on('error', function (error) {
        console.log('[Gamelist]:Generic Socket Error:', error);
    });
    socket.on('data', function (data) {
        var save = false;
        if (socket.readyState !== primus.Spark.CLOSED) {
            save = true;
        }
        if (save === false) {
            return;
        }
        onData(data, socket);
    });
    connectionwatcher.exit();
});
require('fs').watch(__filename, process.exit);