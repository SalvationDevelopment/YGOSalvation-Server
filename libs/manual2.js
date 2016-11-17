/*jslint node:true, plusplus:true, bitwise : true, nomen:true*/
'use strict';

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


var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: 8080
    }),
    stateSystem = require('./ygojs-core.js'),
    deckvalidator = require('./deckvalidator.js'),
    configParser = require('./configparser.js'),
    games = {},
    states = {},
    log = {};

function socketBinding(game) {
    return function gameResponse(view, stack) {
        if (stateSystem[game].players[0].slot === 0) {
            stateSystem[game].players[0].send(JSON.stringify(view[stateSystem[game].players[0].slot]));
        }
        if (stateSystem[game].players[1].slot === 1) {
            stateSystem[game].players[1].send(JSON.stringify(view[stateSystem[game].players[1].slot]));
        }

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



wss.broadcast = function broadcast() {
    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify({
            action: 'broadcast',
            data: games
        }));
    });
};

function duelBroadcast(duel, message) {
    stateSystem[duel].players[0].send(JSON.stringify(message));
    stateSystem[duel].players[1].send(JSON.stringify(message));
}

function responseHandler(socket, message) {
    console.log(message);
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
        log[generated] = [];
        stateSystem[generated] = stateSystem(socketBinding(generated));
        games[generated].player[0].name = message.name;
        stateSystem[generated].players[0] = socket;
        socket.activeduel = generated;
        wss.broadcast(games);
        socket.send(JSON.stringify({
            action: 'lobby',
            game: generated
        }));
        socket.slot = 0;

        setTimeout(function () {
            delete games[generated];
            delete stateSystem[generated];
        }, 5400000); // 90 mins.
        break;

    case "join":

        Object.keys(games[message.game].player).some(function (playerNo, index) {
            var player = games[message.game].player[playerNo];
            if (player.name !== '') {
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
    case "surrender":
        if (socket.slot !== undefined) {
            socket.send(JSON.stringify({
                action: 'surrender',
                by: socket.slot
            }));
        }
        delete games[socket.activeduel];
        delete stateSystem[socket.activeduel];
        break;
    case "lock":
        if (socket.slot !== undefined) {
            //ready = deckvalidator(message.deck);
            games[socket.activeduel].player[socket.slot].ready = true;
            stateSystem[socket.activeduel].decks[socket.slot] = message.deck;

            socket.send(JSON.stringify({
                action: 'lock',
                result: 'success',
                deck: stateSystem[socket.activeduel].decks[socket.slot]
            }));

        }
        socket.send(JSON.stringify({
            action: 'slot',
            slot: socket.slot
        }));
        wss.broadcast(games);
        break;
    case "start":
        player1 = stateSystem[socket.activeduel].decks[0];
        player2 = stateSystem[socket.activeduel].decks[1];
        stateSystem[socket.activeduel].startDuel(player1, player2, true);
        wss.broadcast(games);
        break;
    case "moveCard":
        stateSystem[socket.activeduel].setState(message.player, message.clocation, message.index, message.moveplayer, message.movelocation, message.moveindex, message.moveposition, message.overlayindex, message.uid);
        break;
    case "revealTop":
        stateSystem[socket.activeduel].revealTop(socket.slot);
        break;
    case "revealBottom":
        stateSystem[socket.activeduel].revealBottom(socket.slot);
        break;
    case "offsetDeck":
        stateSystem[socket.activeduel].offsetZone(socket.slot, 'DECK');
        break;
    case "makeToken":
        stateSystem[socket.activeduel].makeNewCard(message.location, message.player, message.index, message.position, message.id);
        break;
    case "removeToken":
        stateSystem[socket.activeduel].removeCard(message.uid);
        break;
    case "revealDeck":
        stateSystem[socket.activeduel].revealDeck(socket.slot);
        break;
    case "revealExtra":
        stateSystem[socket.activeduel].revealExtra(socket.slot);
        break;
    case "revealHand":
        stateSystem[socket.activeduel].revealHand(socket.slot);
        break;
    case "viewDeck":
        stateSystem[socket.activeduel].viewDeck(socket.slot, games[socket.activeduel].player[socket.slot].name);
        break;
    case "viewExtra":
        stateSystem[socket.activeduel].viewExtra(socket.slot, games[socket.activeduel].player[socket.slot].name);
        break;
    case "viewGrave":
        stateSystem[socket.activeduel].viewGrave(socket.slot, games[socket.activeduel].player[socket.slot].name);
        break;
    case "viewBanished":
        stateSystem[socket.activeduel].viewBanished(socket.slot, games[socket.activeduel].player[socket.slot].name);
        break;
    case "viewXYZ":
        stateSystem[socket.activeduel].viewXYZ(socket.slot, message.index, message.player);
        break;
    case "shuffleDeck":
        stateSystem[socket.activeduel].shuffleDeck(socket.slot);
        break;
    case "shuffleHand":
        stateSystem[socket.activeduel].shuffleHand(socket.slot);
        break;
    case "draw":
        stateSystem[socket.activeduel].drawCard(socket.slot, 1);
        break;
    case "mill":
        stateSystem[socket.activeduel].millCard(socket.slot, 1);
        break;
    case "millRemovedCard":
        stateSystem[socket.activeduel].millRemovedCard(socket.slot, 1);
        break;
    case "millRemovedCardFaceDown":
        stateSystem[socket.activeduel].millRemovedCardFaceDown(socket.slot, 1);
        break;
    case "addCounter":
        stateSystem[socket.activeduel].addCounter(message.uid);
        break;
    case "removeCounter":
        stateSystem[socket.activeduel].removeCounter(message.uid);
        break;
    case "rollDie":
        if (socket.slot !== undefined) {
            stateSystem[socket.activeduel].rollDie(games[socket.activeduel].player[socket.slot].name);
        } else {
            stateSystem[socket.activeduel].rollDie(message.name);
        }
        break;
    case "flipCoin":
        if (socket.slot !== undefined) {
            stateSystem[socket.activeduel].flipCoin(games[socket.activeduel].player[socket.slot].name);
        } else {
            stateSystem[socket.activeduel].flipCoin(message.name);
        }
        break;
    case "chat":
        if (socket.slot !== undefined) {
            stateSystem[socket.activeduel].duelistChat(games[socket.activeduel].player[socket.slot].name, message.chat);
        } else {
            stateSystem[socket.activeduel].spectatorChat(message.name, message.chat);
        }
        break;
    case "nextPhase":
        if (socket.slot !== undefined) {
            stateSystem[socket.activeduel].nextPhase(message.phase);
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
    case "revealHandSingle":
        stateSystem[socket.activeduel].revealCallback([message.card], socket.slot, 'revealHandSingle');
        break;
    case "getLog":
        if (stateSystem[socket.activeduel]) {
            socket.send(JSON.stringify({
                action: 'log',
                log: log[socket.activeduel]
            }));
        }
        break;
    case "attack":
        if (socket.slot !== undefined) {
            duelBroadcast(socket.activeduel, {
                action: 'attack',
                attacker: message.uid
            });
        }
        break;

    default:
        break;
    }
    if (stateSystem[socket.activeduel]) {
        log[socket.activeduel].push(message);
    }
    if (socket.slot !== undefined && message.sound) {
        stateSystem[socket.activeduel].players[0].send(JSON.stringify({
            action: 'sound',
            sound: message.sound
        }));
        stateSystem[socket.activeduel].players[1].send(JSON.stringify({
            action: 'sound',
            sound: message.sound
        }));
    }

}


wss.on('connection', function (socket) {
    socket.send(JSON.stringify({
        action: 'broadcast',
        data: games
    }));
    socket.on('message', function (message) {
        try {
            responseHandler(socket, JSON.parse(message));
        } catch (error) {
            console.log(error);
            socket.send(JSON.stringify({
                error: error.message,
                stack: error.stack,
                input: JSON.parse(message)
            }));
        }
    });
});

var fs = require('fs');
fs.watch(__filename, process.exit);