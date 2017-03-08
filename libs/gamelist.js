/*jslint  node: true, plusplus: true, white: false, nomen  : true*/
// Gamelist object acts similar to a Redis server, could be replaced with on but its the gamelist state.
'use strict';

var express = require('express'),
    fs = require('fs'),
    spdy = require('spdy'),
    http = require('http'),
    url = require('url'),
    path = require("path"),
    toobusy = require('toobusy-js'),
    app = express(),
    hsts = require('hsts'),
    Ddos = require('ddos'),
    helmet = require('helmet'),
    ddos = new Ddos({
        maxcount: 200,
        burst: 50,
        limit: 50 * 4,
        maxexpiry: 120,
        checkinterval: 1,
        trustProxy: true,
        includeUserAgent: true,
        whitelist: [],
        errormessage: 'Error',
        testmode: false,
        silent: true,
        silentStart: true,
        responseStatus: 429
    });


var primus,
    gamelist = {},
    userlist = [],
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
    //primusServer = http.createServer().listen(24555),
    primusServer,
    domain = require('domain'),
    path = require('path'),
    ps = require('ps-node'),
    forumValidate = require('./forum-validator.js'),
    currentGlobalMessage = '',
    adminlist = require('../package.json').admins,
    banlist = require('./bansystem.js'),
    chatbox = [],
    sayCount = 0;

require('fs').watch(__filename, process.exit);

app.use(ddos.express);
app.use(express['static'](path.join(__dirname, '../http')));
app.use(function (req, res, next) {
    if (toobusy()) {
        res.send(503, "I'm busy right now, sorry.");
    } else {
        next();
    }
});



try {
    var privateKey = fs.readFileSync(path.resolve(process.env.SSL + '\\ssl.key')).toString();
    var certificate = fs.readFileSync(path.resolve(process.env.SSL + '\\ssl.crt')).toString();
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'", 'ygopro.us', 'forum.ygopro.us'],
                styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
                imgSrc: ['rawgit.com', 'data:', 'forum.ygopro.us'],
                sandbox: ['allow-forms', 'allow-scripts'],
                reportUri: '/report-violation',
                objectSrc: ["'none'"]
            }
        }
    }));


    primusServer = spdy.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(443);
    var openserver = express();
    // set up a route to redirect http to spdy
    openserver.use(helmet());
    openserver.use(ddos.express);
    openserver.get('*', function (req, res) {
        res.redirect(301, 'https://' + req.get('host') + req.url);
    });
    openserver.listen(80);
} catch (nossl) {
    console.log('Failed to apply SSL to HTTP server', nossl);
    primusServer = http.createServer(app);
    primusServer.listen(80);
}

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        noServer: true
    });
var manualServer = require('./manual.js')(wss);
primusServer.on('upgrade', function (req, socket, head) {
    wss.handleUpgrade(req, socket, head, function (websocket) {
        manualServer(websocket);
    });
});


primus = new Primus(primusServer, {
    parser: 'JSON'
});
primus.use('rooms', Rooms);
if (process.env.SSL !== undefined) {
    try {
        require('fs').watch(process.env.SSL, process.exit);
    } catch (error) {}
}


setTimeout(function () {
    //give the system five seconds to figure itself out.
    booting = false;
}, 5000);

var Datastore = require('nedb'),
    deckStorage = new Datastore({
        filename: '../databases/deckStorage.nedb',
        autoload: true
    });


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
    //console.log(core_message, core_message_raw);
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
        //console.log('--');
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
        gamelist[game].players.splice(leave_slot, 1);
        cleanGamelist();
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
        cleanGamelist();
        break;
    case ('::::endduel'):
        //ps.kill(gamelist[game].pid, function (error) {});
        delete gamelist[game];
        cleanGamelist();
        //process.kill(pid);
        break;
    case ('::::end-game'):
        //ps.kill(gamelist[game].pid, function (error) {});
        delete gamelist[game];
        cleanGamelist();
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
        //console.log('real start-game', game);
        internalMessage({
            record: true,
            port: port,
            roompass: game
        });
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

var acklevel = 0;

function massAck() {
    acklevel = 0;
    userlist = [];
    announce({
        clientEvent: 'ack'
    });

}

function cleanGamelist() {
    var game,
        update = false;
    for (game in gamelist) {
        if (gamelist.hasOwnProperty(game)) {
            if (gamelist[game].players.length === 0 && gamelist[game].spectators === 0) {
                //delete if no one is using the game.
                //del(gamelist[game].pid);
                delete gamelist[game];
                update = true;
            }
        }
    }
    for (game in gamelist) {
        if (gamelist.hasOwnProperty(game)) {
            if (gamelist[game] && game.length !== 24) {
                //delete if some wierd game makes it into the list somehow. Unlikely.
                delete gamelist[game];
                update = true;
            }
        }
    }
    for (game in gamelist) {
        if (gamelist.hasOwnProperty(game)) {
            if (new Date().getTime() - gamelist[game].time > 2700000) {
                //delete if the game is older than 45mins.
                delete gamelist[game];
                update = true;
            }
        }
    }
    if (update) {
        announce(JSON.stringify(gamelist));
    }

}


setInterval(function () {
    cleanGamelist();
    announce({
        clientEvent: 'ackresult',
        ackresult: acklevel,
        userlist: userlist
    });
    massAck();
}, 15000);

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
        if (info === undefined) {
            console.log(data, error, info, body);
        }
        if (info.success) {
            registry[info.displayname] = socket.address.ip;
            socket.username = info.displayname;
            sendRegistry();
            socket.write({
                clientEvent: 'global',
                message: currentGlobalMessage,
                admin: adminlist[data.username]
            });
            socket.speak = true;
            socket.write({
                clientEvent: 'login',
                info: info,
                chatbox: chatbox
            });
            Object.keys(banlist).some(function (bannedUser) {
                if (bannedUser.toUpperCase() === data.username.toUpperCase()) {
                    socket.write({
                        clientEvent: 'banned',
                        reason: banlist[data.username]
                    });
                    return true;
                }
                return false;
            });
            socket.join(socket.username);

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
    forumValidate(data, function (error, info, body) {
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


function genocideCall(data) {
    forumValidate(data, function (error, info, body) {
        if (error) {
            return;
        }
        if (info.data) {
            if (info.success && info.data.g_access_cp === "1") {
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
    forumValidate(data, function (error, info, body) {
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
    forumValidate(data, function (error, info, body) {
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
    forumValidate(data, function (error, info, body) {
        if (error) {
            return;
        }

        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'censor',
                messageID: data.messageID
            });
            chatbox = chatbox.filter(function (message) {
                return message.uid !== Number(data.messageID);
            });

        } else {
            console.log(data, 'asked for censor');
        }

    });
}

function mindcrushCall(data) {
    forumValidate(data, function (error, info, body) {
        if (error) {
            return;
        }

        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'mindcrush',
                target: data.target
            });

        } else {
            console.log(data, 'asked for mind crush');
        }

    });
}

function aiRestartCall(data) {
    forumValidate(data, function (error, info, body) {
        if (error) {
            return;
        }

        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'airestart'
            });

        } else {
            console.log(data, 'asked for murder');
        }

    });
}

function killgameCall(data) {
    forumValidate(data, function (error, info, body) {
        if (error) {
            return;
        }
        if (info.success && adminlist[data.username]) {
            ps.kill(data.killTarget, function (err) {
                if (err) {
                    del(data.killTarget);
                }
            });

        } else {
            console.log(data, 'tried to kill');
        }
    });
}






var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

var tagOrComment = new RegExp(
    '<(?:' + '!--(?:(?:-*[^->])*--+|-?)|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*' + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*' + '|/?[a-z]' + tagBody + ')>',
    'gi'
);

function removeTags(html) {
    var oldHtml;
    do {
        oldHtml = html;
        html = html.replace(tagOrComment, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
}

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
            //console.log('[Gamelist]:', data.gamelist, data.registry);
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
            setTimeout(function () {
                socket.aiReady = true;
            }, 10000);
        }
        break;
    case ('join'):
        socket.join(socket.address.ip + data.uniqueID);
        socket.join('activegames');
        socket.write(JSON.stringify(gamelist));

        break;
    case ('leave'):
        socket.leave('activegames');
        break;
    case ('ack'):
        acklevel++;
        if (data.name) {
            userlist.push(data.name);
        }
        break;
    case ('register'):
        registrationCall(data, socket);
        break;
    case ('chatline'):
        if (socket.username && socket.speak) {
            socket.speak = false;
            if (chatbox.length > 100) {
                chatbox.shift();
            }
            announce({
                clientEvent: 'chatline',
                from: socket.username,
                msg: removeTags(data.msg),
                uid: sayCount,
                date: new Date(),
                timezone: data.timezone
            });
            chatbox.push({
                from: socket.username,
                msg: removeTags(data.msg),
                uid: sayCount,
                date: new Date(),
                timezone: data.timezone
            });
            sayCount++;
            setTimeout(function () {
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
    case ('airestart'):
        aiRestartCall(data);
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
    case ('privateMessage'):
        if (socket.username) {
            data.date = new Date();
            console.log(data);
            primus.room(data.to).write(data);
        }
        break;
    case 'save':

        deckStorage.update({
            username: data.username
        }, data, {
            upsert: true
        }, function (error, docs) {
            primus.room(socket.address.ip + data.uniqueID).write({
                clientEvent: 'deckSaved',
                error: error
            });
            deckStorage.persistence.compactDatafile();
        });

        break;
    case 'load':
        console.log(data);
        deckStorage.find({
            username: data.username
        }, function (error, docs) {
            console.log(error, docs);
            if (docs.length) {
                primus.room(socket.address.ip + data.uniqueID).write({
                    clientEvent: 'deckLoad',
                    decks: docs[0].decks,
                    friends: docs[0].friends
                });
            }

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
    socket.aiReady = true;
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