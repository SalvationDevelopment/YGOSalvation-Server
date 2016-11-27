/*jslint node:true, plusplus:true, bitwise : true, nomen:true*/
'use strict';

function newGame() {
    return {
        started: false,
        deckcheck: 0,
        draw_count: 0,
        lflist: 0,
        mode: 1,
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
        ready,
        activeduel = socket.activeduel;
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
            stateSystem[generated].duelistChat('Gamelist', 'Ending Duel');
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
            socket.activeduel = message.game;
            return true;
        });
        if (!joined) {
            message.game.spectators++;
            stateSystem[message.game].spectators[message.name] = socket;
            if (games[message.game].started) {
                socket.send(JSON.stringify(stateSystem[message.game].generateView('start')));
            }
        }
        wss.broadcast(games);
        socket.send(JSON.stringify({
            action: 'lobby',
            game: message.game
        }));
        activeduel = message.game;
        stateSystem[activeduel].callback();
        break;
    case "leave":
        if (socket.slot !== undefined) {
            games[activeduel].player[socket.slot].name = '';
            games[activeduel].player[socket.slot].ready = false;
        } else {
            message.game.spectators--;
            delete stateSystem[activeduel].spectators[message.name];
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
            stateSystem[activeduel].surrender(games[activeduel].player[socket.slot].name);
            if (games[activeduel].mode === 1) {

                stateSystem[activeduel].players[0].send(JSON.stringify({
                    action: 'side',
                    deck: stateSystem[activeduel].decks[0]
                }));
                games[activeduel].player[0].ready = false;
                stateSystem[activeduel].players[1].send(JSON.stringify({
                    action: 'side',
                    deck: stateSystem[activeduel].decks[1]
                }));
                games[activeduel].player[1].ready = false;
            }

        }

        break;
    case "lock":
        if (socket.slot !== undefined) {
            //ready = deckvalidator(message.deck);

            games[activeduel].player[socket.slot].ready = true;
            stateSystem[activeduel].lock[socket.slot] = true;
            stateSystem[activeduel].decks[socket.slot] = message.deck;
            socket.send(JSON.stringify({
                action: 'lock',
                result: 'success'
            }));
            if (games[activeduel].player[socket.slot].ready) {
                stateSystem[activeduel].duelistChat('Server', '<pre>' + games[activeduel].player[socket.slot].name + ' locked in deck.</pre>');
            }

        }
        socket.send(JSON.stringify({
            action: 'slot',
            slot: socket.slot
        }));
        wss.broadcast(games);
        break;
    case "start":
        player1 = stateSystem[activeduel].decks[0];
        player2 = stateSystem[activeduel].decks[1];
        stateSystem[activeduel].startDuel(player1, player2, true);
        games[activeduel].started = true;
        wss.broadcast(games);
        break;
    case "moveCard":
        stateSystem[activeduel].setState(message.player, message.clocation, message.index, message.moveplayer, message.movelocation, message.moveindex, message.moveposition, message.overlayindex, message.uid);
        break;
    case "revealTop":
        stateSystem[activeduel].revealTop(socket.slot);
        break;
    case "revealBottom":
        stateSystem[activeduel].revealBottom(socket.slot);
        break;
    case "offsetDeck":
        stateSystem[activeduel].offsetZone(socket.slot, 'DECK');
        break;
    case "makeToken":
        stateSystem[activeduel].makeNewCard(message.location, message.player, message.index, message.position, message.id);
        break;
    case "removeToken":
        stateSystem[activeduel].removeCard(message.uid);
        break;
    case "revealDeck":
        stateSystem[activeduel].revealDeck(socket.slot);
        break;
    case "revealExtra":
        stateSystem[activeduel].revealExtra(socket.slot);
        break;
    case "revealHand":
        stateSystem[activeduel].revealHand(socket.slot);
        break;
    case "viewDeck":
        stateSystem[activeduel].viewDeck(socket.slot, games[activeduel].player[socket.slot].name, socket.slot);
        break;
    case "viewExtra":
        stateSystem[activeduel].viewExtra(message.player, games[activeduel].player[socket.slot].name, socket.slot);
        break;
    case "viewGrave":
        stateSystem[activeduel].viewGrave(message.player, games[activeduel].player[socket.slot].name, socket.slot);
        break;
    case "viewBanished":
        stateSystem[activeduel].viewBanished(socket.slot, games[activeduel].player[socket.slot].name, socket.slot);
        break;
    case "viewXYZ":
        stateSystem[activeduel].viewXYZ(socket.slot, message.index, message.player);
        break;
    case "shuffleDeck":
        stateSystem[activeduel].shuffleDeck(socket.slot);
        break;
    case "shuffleHand":
        stateSystem[activeduel].shuffleHand(socket.slot);
        break;
    case "draw":
        stateSystem[activeduel].drawCard(socket.slot, 1);
        break;
    case "mill":
        stateSystem[activeduel].millCard(socket.slot, 1);
        break;
    case "millRemovedCard":
        stateSystem[activeduel].millRemovedCard(socket.slot, 1);
        break;
    case "millRemovedCardFaceDown":
        stateSystem[activeduel].millRemovedCardFaceDown(socket.slot, 1);
        break;
    case "addCounter":
        stateSystem[activeduel].addCounter(message.uid);
        break;
    case "flipDeck":
        stateSystem[activeduel].flipDeck(socket.slot);
        break;
    case "removeCounter":
        stateSystem[activeduel].removeCounter(message.uid);
        break;
    case "rollDie":
        if (socket.slot !== undefined) {
            stateSystem[activeduel].rollDie(games[activeduel].player[socket.slot].name);
        } else {
            stateSystem[activeduel].rollDie(message.name);
        }
        break;
    case "flipCoin":
        if (socket.slot !== undefined) {
            stateSystem[activeduel].flipCoin(games[activeduel].player[socket.slot].name);
        } else {
            stateSystem[activeduel].flipCoin(message.name);
        }
        break;
    case "chat":
        if (socket.slot !== undefined) {
            stateSystem[activeduel].duelistChat(games[activeduel].player[socket.slot].name, message.chat);
        } else {
            stateSystem[activeduel].spectatorChat(message.name, message.chat);
        }
        break;
    case "nextPhase":
        if (socket.slot !== undefined) {
            stateSystem[activeduel].nextPhase(message.phase);
        }
        break;
    case "nextTurn":
        if (socket.slot !== undefined) {
            stateSystem[activeduel].nextTurn();
        }
        break;
    case "changeLifepoints":
        if (socket.slot !== undefined) {
            stateSystem[activeduel].changeLifepoints(socket.slot, message.amount);
        }
        break;
    case "revealHandSingle":
        stateSystem[activeduel].revealCallback([message.card], socket.slot, 'revealHandSingle');
        break;
    case "getLog":
        if (stateSystem[activeduel]) {
            socket.send(JSON.stringify({
                action: 'log',
                log: log[activeduel]
            }));
        }
        break;
    case "attack":
        if (socket.slot !== undefined) {
            duelBroadcast(activeduel, {
                action: 'attack',
                source: message.source,
                target: message.target
            });
        }
        break;

    default:
        break;
    }
    if (stateSystem[activeduel]) {
        log[activeduel].push(message);
    }
    if (socket.slot !== undefined && message.sound) {
        stateSystem[activeduel].players[0].send(JSON.stringify({
            action: 'sound',
            sound: message.sound
        }));
        stateSystem[activeduel].players[1].send(JSON.stringify({
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
fs.watch(__filename, function () {
    Object.keys(stateSystem).forEach(function (activeduel) {
        stateSystem[activeduel].duelistChat('Server', 'New Source Code detected, restarting server. Duel has ended.');
    });

    setTimeout(process.exit, 3000);
});