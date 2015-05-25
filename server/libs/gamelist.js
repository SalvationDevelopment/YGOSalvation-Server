/*jslint  node: true, plusplus: true, white: false*/
// Gamelist object acts similar to a Redis server, could be replaced with on but its the gamelist state.
var primus,
    gamelist = {},
    http = require('http'),
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    primusServer = http.createServer().listen(24555),
    duelserv = require('./duelserv.js'),
    ps = require('ps-node'),
    previousAnnouncement = "";

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
            break;

        case ('::::chat'):
            chat = core_message.join(' ');
            duelserv.bot.say('#public', core_message.join(' '));
            break;

        }
    } catch (error_message) {
        console.log(error_message, core_message_raw, port);
        console.log('ISSUE!');
    }
}

function messageListener(message) {
    'use strict';
    var brokenup = message.core_message_raw.toString().split('\r\n'),
        game,
        i = 0;
    for (i; brokenup.length > i; i++) {
        handleCoreMessage(brokenup[i], message.port, message.pid);
    }
    for (game in gamelist) {
        if (gamelist.hasOwnProperty(game)) {
            if (gamelist[game].players.length === 0 && gamelist[game].spectators.length === 0) {
                delete gamelist[game];
            }
            if ((((new Date()) - (gamelist[game].time)) > 600000) && !gamelist.started) {
                delete gamelist[game];
            }
        }
    }
    //primus.room('activegames').write(JSON.stringify(gamelist));
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
        var action = data.action;
        switch (action) {
        case ('join'):
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

        case ('joinTournament'):
            socket.join('tournament', function () {
                socket.write(JSON.stringify(gamelist));
            });
            break;

        default:
            console.log(data);

        }
    });
});
primus.on('disconnection', function () {
    'use strict';
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

module.exports = {
    messageListener: messageListener,
    primusListener: primusListener,
    announce: announce
};

function pscheck(game) {
    'use strict';

    if (gamelist[game].players.length === 0 && gamelist[game].spectators.length === 0) {
        delete gamelist[game];
    }
    
    if ((((new Date()) - (gamelist[game].time)) > 600000) && !gamelist.started) {
        delete gamelist[game];
    }
    
    ps.lookup({pid: gamelist[game].pid}, function pscheck(err, resultList) {
        var process = resultList[0];
        if (process) {
            return;
        } else {
            duelserv.bot.say('#public', 'murdering' + game + ' @not ' + gamelist[game].pid);
            delete gamelist[game];
        }

    });
}

setInterval(function () {
    'use strict';
    var game;

    for (game in gamelist) {
        if (gamelist.hasOwnProperty(game)) {
            pscheck(game);
        }
    }
}, 60000);