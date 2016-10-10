/*jslint node:true*/
'use strict';



var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 8080
    }),
    stateSystem = require('./ai-snarky-state.js'),
    deckvalidator = require('./deckvalidator.js'),
    games = {},
    states = {};

function socketBinding(game) {
    return function gameResponse(view, stack) {
        stateSystem[game].players[0].send(JSON.stringify(view.player1));
        stateSystem[game].players[1].send(JSON.stringify(view.player2));
        Object.keys(stateSystem[game].spectators).forEach(function (username) {
            var spectator = stateSystem[game].spectators[username];
            spectator.send(JSON.stringify(view.spectators));
        });
    };
}

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
            }
            //            ,
            //            2: {
            //                name: '',
            //                ready: false
            //            },
            //            3: {
            //                name: '',
            //                ready: false
            //            }
        },
        spectators: []
    };
}

wss.broadcast = function broadcast(data) {
    console.log('broadcasting');
    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify({
            action: 'broadcast',
            data: data
        }));
    });
};

function responseHandler(socket, message) {
    console.log(message, typeof message);
    var generated,
        joined = false,
        player1,
        player2,
        ready;
    if (!message.action) {
        return;
    }
    switch (message.action) {
    case "host":
        generated = randomString(12);
        games[generated] = newGame();
        stateSystem[generated] = stateSystem(socketBinding(generated));
        games[generated].player[0].name = message.name;
        stateSystem[generated].players[0] = socket;
        socket.activeduel = generated;
        wss.broadcast(games);
        socket.send(JSON.stringify({
            action: 'lobby',
            game: generated
        }));
        break;

    case "join":

        Object.keys(games[message.game].player).some(function (playerNo, index) {
            var player = games[message.game].player[playerNo];
            if (player.name === '') {
                return false;
            }
            joined = true;
            player.name = message.name;
            stateSystem[message.game].players[index] = socket;
            socket.slot = index;
            socket.activeDuel = message.game;
            return true;
        });
        if (!joined) {
            message.game.spectators++;
            stateSystem[message.game].spectators[message.name] = socket;
        }
        wss.broadcast(games);
        socket.send(JSON.stringify({
            action: 'lobby',
            game: message.game
        }));
        socket.activeduel = message.game;
        break;
    case "leave":
        if (socket.slot !== undefined) {
            games[socket.activeduel].player[socket.slot].name = '';
            games[socket.activeduel].player[socket.slot].ready = false;
        } else {
            message.game.spectators--;
            delete stateSystem[socket.activeduel].spectators[message.name];
        }
        wss.broadcast(games);
        socket.send(JSON.stringify({
            action: 'leave'
        }));
        break;
    case "lock":
        if (socket.slot !== undefined) {
            ready = deckvalidator(message.deck);
            games[socket.activeduel].player[socket.slot].ready = deckvalidator(message.deck);
            games[socket.activeduel].player[socket.slot].deck = message.deck;
        }
        wss.broadcast(games);
        break;
    case "start":
        player1 = stateSystem[socket.activeduel].players[0].deck;
        player2 = stateSystem[socket.activeduel].players[1].deck;
        stateSystem[socket.activeduel].startDuel(player1, player2);
        wss.broadcast(games);
        break;
    case "moveCard":
        stateSystem[socket.activeduel].setState(message.player, message.clocation, message.index, message.moveplayer, message.movelocation, message.moveindex, message.moveposition, message.overlayindex, message.isBecomingCard);
        break;
    case "chat":
        if (socket.slot !== undefined) {
            stateSystem[socket.activeduel].duelistChat(socket.slot);
        } else {
            stateSystem[socket.activeduel].spectatorChat(socket.slot);
        }
        break;
    case "nextPhase":
        if (socket.slot !== undefined) {
            stateSystem[socket.activeduel].nextPhase();
        }
        break;
    case "nextTurn":
        if (socket.slot !== undefined) {
            stateSystem[socket.activeduel].nextTurn();
        }
        break;
    case "changeLifepoints":
        if (socket.slot !== undefined) {
            stateSystem[socket.activeduel].changeLifepoints(socket.slot, message.amount);
        }
        break;

    default:
        break;
    }
}

wss.on('connection', function (socket) {
    socket.on('message', function (message) {
        try {
            responseHandler(socket, JSON.parse(message));
        } catch (error) {
            console.log(error);
            socket.send(JSON.stringify({
                error: error
            }));
        }
    });
});

require('fs').watch(__filename, process.exit);