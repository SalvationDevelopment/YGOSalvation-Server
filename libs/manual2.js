/*jslint node:true*/
'use strict';

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 8080
    }),
    stateSystem = require('./ai-snarky-state.js'),
    deckvalidator = require('.deckvalidator'),
    games = {},
    states = {};

function randomString(len) {
    var i,
        text = "",
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (i = 0; i < len; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

function newGame() {
    return {
        deckcheck: 0,
        draw_count: 0,
        lflist: 0,
        mode: 0,
        noshuffle: 0,
        prio: 0,
        rule: 0,
        startlp: 0,
        starthand: 0,
        timelimit: 0,
        player: {
            0: {
                name: '',
                ready: false
            },
            1: {
                name: '',
                ready: false
            },
            2: {
                name: '',
                ready: false
            },
            3: {
                name: '',
                ready: false
            }
        },
        spectators: [],
        turn: 0,
        turnOfPlayer: 0,
        phase: 0
    };
}


function responseHandler(socket, message) {
    var generated,
        joined = false;
    if (!message.action) {
        return;
    }
    switch (message) {
    case "host":
        generated = [randomString(12)];
        games[generated] = newGame();
        stateSystem[generated] = stateSystem();
        games[generated].player[0].name = message.name;
        stateSystem[generated].player[0] = socket;
        socket.activeduel = generated;
        break;

    case "join":

        Object.keys(message.game.player).some(function (playerNo, index) {
            var player = games[socket.activeduel].player[playerNo];
            if (player.name === '') {
                return false;
            }
            joined = true;
            player.name = message.name;
            socket.slot = index;
            //moar stuff
            return true;
        });
        if (!joined) {
            message.game.spectators++;
            stateSystem[generated].spectators[message.name] = socket;

        }
        break;
    case "leave":
        if (socket.slot !== undefined) {
            games[socket.activeduel].player[socket.slot] = '';
        } else {
            message.game.spectators--;
            delete stateSystem[generated].spectators[message.name];
        }
        break;
    default:
        break;
    }


}

wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log('received: %s', message);
        responseHandler(ws, message);
    });
    //ws.send('something');
});