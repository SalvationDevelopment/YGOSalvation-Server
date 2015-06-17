/*jslint  node: true, plusplus: true, white: false*/
// Gamelist object acts similar to a Redis server, could be replaced with on but its the gamelist state.
try {
    var fs = require('fs'),
        ssloptions = {
            ca:   fs.readFileSync(process.env.SSL + 'sub.class1.server.ca.pem'),
            key:  fs.readFileSync(process.env.SSL + 'ssl.key.unsecure'),
            cert: fs.readFileSync(process.env.SSL + 'ssl.crt')
        },
        http = require('https');
} catch (e) {
    var http = require('http');
}
var primus,
    gamelist = {},
    userdata = {},
    hunter = {},
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    primusServer = http.createServer(ssloptions).listen(24555),
    duelserv = require('./duelserv.js'),
    cluster = require('cluster'),
    previousAnnouncement = "",
    winston = require('winston'),
    path = require('path'),
    request = require('request');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.DailyRotateFile)({
            filename: ".\\http\\logs\\chat.log"
        })
    ]
});

function announce(announcement) {
    'use strict';
    if (previousAnnouncement === announcement) {
        return;
    } else {
        primus.room('activegames').write(announcement);
        previousAnnouncement = announcement;
    }
}

function handleCoreMessage(core_message_raw, port, pid) {
    'use strict';
    if (core_message_raw.toString().indexOf("::::") < 0) {
        return gamelist;
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
    try {

        if (gamelist[core_message[1]] === undefined) {
            gamelist[core_message[1]] = {
                players: [],
                locked: [false, false, false, false],
                spectators: 0,
                started: false,
                time: new Date(),
                pid: pid || null
            };

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
            duelserv.bot.say('#public', gamelist[core_message[1]].pid + '|' + core_message[2] + ': ' + core_message[3]);
            logger.info(gamelist[core_message[1]].pid + '|' + core_message[2] + ': ' + core_message[3]);
            break;

        }
    } catch (error_message) {
        console.log(error_message, core_message_raw, port);
        console.log('ISSUE!');
    }
}

function messageListener(message) {
    'use strict';
    if (message.core_message_raw === 'passwordQuery') {
        announce({
            clientEvent: 'passwordQuery',
            target: message.username
        });
        hunter[message.username] = setTimeout(function () {
            //send kill command for that username
        }, 10000);
    }
    var brokenup = message.core_message_raw.toString().split('\r\n'),
        game,
        i = 0;
    for (i; brokenup.length > i; i++) {
        handleCoreMessage(brokenup[i], message.port, message.pid);
    }
    for (game in gamelist) {
        if (gamelist.hasOwnProperty(game)) {
            if (gamelist[game].players.length === 0 && gamelist[game].spectators === 0) {
                delete gamelist[game];
            }
            if (gamelist[game] && game.length !== 24) {
                delete gamelist[game];
            }
        }
    }
    announce(JSON.stringify(gamelist));
    return gamelist;
}

primus = new Primus(primusServer, {
    parser: 'JSON'
});
primus.use('rooms', Rooms);
primus.on('connection', function (socket) {
    'use strict';
    socket.on('data', function (data) {
        
        data = data || {};
        var action = data.action,
            url,
            post;
        socket.join(socket.address.ip + data.uniqueID, function () {});
        switch (action) {
        case ('securityServer'):
            if (data.password !== process.env.OPERPASS) {
                return;
            }
            socket.join('securityServer', function () {
                
            });
            break;
        case ('gamelistEvent'):
            if (data.password === process.env.OPERPASS) {
                messageListener(data.coreMessage);
            }
            break;
        case ('join'):
            socket.join(socket.address.ip + data.uniqueID, function () {
                socket.write({
                    clientEvent : 'privateServer',
                    serverUpdate : userdata[socket.address.ip + data.uniqueID],
                    ip : socket.address.ip + data.uniqueID
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
            socket.nickname = data.nickname;
            break;
        
        case ('privateServerRequest'):
            primus.room(socket.address.ip + data.uniqueID).write({
                clientEvent : 'privateServerRequest',
                parameter : data.parameter,
                local : data.local
            });
            break;
                
        case ('privateServer'):
            break;

        case ('joinTournament'):
            socket.join('tournament', function () {
                socket.write(JSON.stringify(gamelist));
            });
            break;
        case ('passwordQuery'):
            url = 'http://forum.ygopro.us/log.php';
            post = {
                ips_username : data.username,
                ips_password : data.password
            };
            request.post(url, {form : post}, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var info = JSON.parse(body);
                    if (info.success) {
                        clearTimeout(hunter[data.username]);
                    }
                }
            });
            break;
        case ('privateUpdate'):
            primus.room(socket.address.ip + data.uniqueID).write({
                clientEvent : 'privateServer',
                serverUpdate : data.serverUpdate
            });
            userdata[socket.address.ip + data.uniqueID] = data.serverUpdate;
            break;
        default:
            console.log(data);

        }
    });
});
primus.on('disconnection', function (socket) {
    'use strict';
    socket.leaveAll();
    //nothing required
});

primus.on('error', function () {
    'use strict';
    //nothing required
});

function primusListener(message) {
    'use strict';
    //other stuff here maybe?
    announce(message);
}

duelserv.on('announce', function (message) {
    'use strict';
    announce(message);
});

duelserv.on('del', function (pid) {
    'use strict';
    var game;
    for (game in gamelist) {
        if (gamelist.hasOwnProperty(game)) {
            if (String() + gamelist[game].pid === pid) {
                delete gamelist[game];
                announce(JSON.stringify(gamelist));
            }
        }
    }
});

module.exports = {
    messageListener: messageListener,
    primusListener: primusListener,
    announce: announce
};