/*jslint  node: true, plusplus: true, white: false*/
// Gamelist object acts similar to a Redis server, could be replaced with on but its the gamelist state.
(function () {
    'use strict';
    var primus,
        gamelist = {},
        http = require('http'),
        Primus = require('primus'),
        Rooms = require('primus-rooms'),
        primusServer = http.createServer().listen(24555);

    function handleCoreMessage(core_message_raw, port, data) {
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
                    locked: [],
                    spectators: 0,
                    started: false
                };
            }
            switch (core_message[0]) {

            case ('::::join-slot'):
                join_slot = parseInt(core_message[2], 10);
                if (join_slot === -1) {
                    return;
                }
                gamelist[core_message[1]].players[join_slot] = core_message[3];
                gamelist[core_message[1]].port = port;
                break;

            case ('::::leave-slot'):
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
                break;

            case ('::::startduel'):
                gamelist[core_message[1]].started = true;
                break;

            case ('::::chat'):
                chat = core_message[1] + '|' + core_message[2];
                break;

            }
            if (gamelist[core_message[1]]) {
                if (gamelist[core_message[1]].players.join() === '') {
                    delete gamelist[core_message[1]].players[0];
                }
            }
            primus.room('activegames').write(JSON.stringify(gamelist));
            return gamelist;
        } catch (error_message) {
            console.log(error_message);
            console.log('ISSUE!');
            return gamelist;
        }
    }

    module.exports = function messageListener(message) {
        return handleCoreMessage(message.core_message_raw, message.port, message.data);
    };

    primus = new Primus(primusServer, {
        parser: 'JSON'
    });
    primus.use('rooms', Rooms);
    primus.on('connection', function (socket) {
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

            default:
                console.log(data);

            }
        });
    });
    primus.on('disconnection', function (socket) {
        //nothing required
    });

    primus.on('error', function (socket) {
        //nothing required
    });


}());