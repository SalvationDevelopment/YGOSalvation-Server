const http = require('http'),
    port = process.env.PORT || 8891,
    server = http.createServer().listen(port),
    domain = require('domain'),
    validateDeck = require('./validate_deck'),
    stateSystem = {},
    database = require('../http/manifest/manifest-ygopro'),
    banlist = {},
    games = {},
    uuid = require('uuid'),
    Rooms = require('primus-rooms'),
    Primus = require('primus'),
    primus = new Primus(server, {
        parser: 'JSON'
    });

primus.use('rooms', Rooms);



function rps(question, resolver, revealCallback, callback) {
    var player1,
        player2,
        previous1,
        previous2,
        cardMap = {
            0: 'rock',
            1: 'paper',
            2: 'scissors'
        };


    function determineResult(player, answer) {
        if (player === 0) {
            player1 = answer;
        }
        if (player === 1) {
            player2 = answer;
        }
        if (player1 === undefined || player2 === undefined) {
            return undefined;
        }
        previous1 = player1;
        previous2 = player2;
        if (player1 === player2) {
            player1 = undefined;
            player2 = undefined;
            return false;
        }
        return ((3 + player1 - player2) % 3) - 1; // returns 0 or 1, the winner;
    }

    function notify(reAsk) {
        revealCallback([{
            id: cardMap[previous1],
            value: previous1,
            note: 'specialCards'
        }, {
            id: 'vs',
            note: 'specialCards'
        }, {
            id: cardMap[previous2],
            value: previous2,
            note: 'specialCards'
        }], 0, callback);
        revealCallback([{
            id: cardMap[previous1],
            value: previous1,
            note: 'specialCards'
        }, {
            id: 'vs',
            note: 'specialCards'
        }, {
            id: cardMap[previous2],
            value: previous2,
            note: 'specialCards'
        }], 1, callback);
        if (reAsk) {
            setTimeout(reAsk, 2500);
        }
    }


    function ask() {
        var time = (previous1 !== undefined) ? 3000 : 0;

        question('p0', 'specialCards', [{
            id: 'rock',
            value: 0
        }, {
            id: 'paper',
            value: 1
        }, {
            id: 'scissors',
            value: 2
        }], {
            max: 1,
            min: 1
        }, function(answer) {
            var result = determineResult(0, answer[0]);
            if (result === false) {
                notify(ask);
                return;
            }
            if (result !== undefined) {
                notify(resolver(result));
            }
        });
        question('p1', 'specialCards', [{
            id: 'rock',
            value: 0
        }, {
            id: 'paper',
            value: 1
        }, {
            id: 'scissors',
            value: 2
        }], {
            max: 1,
            min: 1
        }, function(answer) {
            var result = determineResult(1, answer[0]);
            if (result === false) {
                notify(ask);
                return;
            }
            if (result !== undefined) {
                notify(resolver(result));
            }
        });
    }
    ask();
}

function newGame(settings) {
    return {
        automatic: settings.info.automatic,
        roompass: settings.roompass,
        started: false,
        deckcheck: 0,
        draw_count: 0,
        ot: parseInt(settings.info.ot, 10),
        banlist: settings.info.banlist,
        banlistid: settings.info.banlistid,
        mode: settings.info.mode,
        cardpool: settings.info.cardpool,
        noshuffle: settings.info.shuf,
        prerelease: settings.info.prerelease,
        masterRule: banlist[settings.info.banlist].masterRule,
        legacyfield: (banlist[settings.info.banlist].masterRule !== 4),
        rule: 0,
        startLP: settings.info.startLP,
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
        },
        spectators: [],
        delCount: 0
    };
}

function onData(message, socket) {
    let generated;
    message = message || {};
    const action = message.action;

    switch (action) {
        case 'CTOS_CREATE_GAME':
            generated = uuid(12);
            stateSystem[generated] = newGame(message);
            stateSystem[generated] = stateSystem(socketBinding(generated));
            stateSystem[generated].player[0].name = message.name;
            stateSystem[generated].players[0] = socket;
            stateSystem[generated].setNames(socket.username, 0);
            socket.activeduel = generated;
            primus.duelBroadcast(stateSystem);
            socket.write(({
                duelAction: 'lobby',
                game: generated
            }));
            socket.slot = 0;
            setTimeout(function() {
                stateSystem[generated].duelistChat('Gamelist', '90min Time limit reached. Ending the duel');
                delete stateSystem[generated];
                delete stateSystem[generated];
            }, 10800000); // 180 mins.
            break;
        case 'CTOS_JOIN_GAME':
            socket.slot = undefined;
            Object.keys(games[message.game].player).some(function(playerNo, index) {
                var player = games[message.game].player[playerNo];
                if (player.name !== '') {
                    return false;
                }
                joined = true;
                player.name = message.name;
                stateSystem[message.game].players[index] = socket;
                stateSystem[message.game].setNames(socket.username, index);
                socket.slot = index;

                return true;
            });
            if (!joined && stateSystem[message.game]) {
                stateSystem[message.game].spectators[message.name] = socket;
                if (games[message.game].started) {
                    socket.write((stateSystem[message.game].generateView('start').spectators));
                    socket.activeduel = message.game;
                }
            }
            games[message.game].delCount = 0;
            primus.duelBroadcast(games);
            socket.write(({
                duelAction: 'lobby',
                game: message.game
            }));
            socket.activeduel = message.game;
            break;
    }

    if (!socket.game) {
        return;
    }

    switch (action) {
        case 'CTOS_RESPONSE':
            stateSystem[socket.game].game.respond(message.buffer);
            break;
        case 'CTOS_UPDATE_DECK':
            if (!socket.game) {
                return;
            }
            stateSystem[socket.game].players[socket.slot].deck = message.deck;
            break;
        case 'CTOS_HAND_RESULT':
            break;
        case 'CTOS_TP_RESULT':
            break;
        case 'CTOS_PLAYER_INFO':
            break;
        case 'CTOS_LEAVE_GAME':
            socket.leave(message.game);
            break;
        case 'CTOS_SURRENDER':
            stateSystem[socket.game].game.respond(socket.slot);
            break;
        case 'CTOS_TIME_COMFIRM':
            stateSystem[socket.game].game.timeComfirm(socket.slot, message.buffer);
            break;
        case 'CTOS_CHAT':
            break;
        case 'CTOS_HS_TODUELIST':
            break;
        case 'CTOS_HS_TOOBSERVER':
            break;
        case 'CTOS_HS_READY':
            break;
        case 'CTOS_HS_NOTREADY':
            break;
        case 'CTOS_HS_KICK':
            break;
        case 'CTOS_HS_START':
            break;
        default:
            break;
    }
}


primus.on('connection', function(socket) {
    var connectionwatcher = domain.create();
    connectionwatcher.on('error', function(err) {
        console.log(err);
    });
    connectionwatcher.enter();
    socket.on('error', function(error) {
        console.log(error);
    });

    socket.on('data', function(data) {
        if (socket.readyState !== primus.Spark.CLOSED) {
            return;
        }
        onData(data, socket);
    });
    connectionwatcher.exit();
});