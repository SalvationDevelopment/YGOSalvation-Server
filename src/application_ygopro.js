const http = require('http'),
    port = process.env.PORT || 8891,
    server = http.createServer().listen(port),
    domain = require('domain'),
    validateDeck = require('./validate_deck'),
    games = {},
    database = require('../http/manifest/manifest-ygopro'),
    uuid = require('uuid'),
    Rooms = require('primus-rooms'),
    Primus = require('primus'),
    primus = new Primus(server, {
        parser: 'JSON'
    });

primus.use('rooms', Rooms);


function rps(resolver, callback) {
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

function Game(data) {
    return {
        password: data.password,
        players: [null, null, null, null],
        observers: []
    };
}

function onData(data, socket) {
    data = data || {};
    const action = data.action;

    switch (action) {
        case 'CTOS_CREATE_GAME':
            if (!games[data.game]) {
                games[data.game] = new Game(data);
                return;
            }
            break;
        case 'CTOS_JOIN_GAME':
            if (!games[data.game]) {
                games[data.game] = new Game(data);
                return;
            }
            socket.join(data.game);
            socket.game = data.game;
            break;
    }

    if (!socket.game) {
        return;
    }

    switch (action) {
        case 'CTOS_RESPONSE':
            games[socket.game].game.respond(data.buffer);
            break;
        case 'CTOS_UPDATE_DECK':
            if (!socket.game) {
                return;
            }
            games[socket.game].players[socket.slot].deck = data.deck;
            break;
        case 'CTOS_HAND_RESULT':
            break;
        case 'CTOS_TP_RESULT':
            break;
        case 'CTOS_PLAYER_INFO':
            break;
        case 'CTOS_LEAVE_GAME':
            socket.leave(data.game);
            break;
        case 'CTOS_SURRENDER':
            break;
        case 'CTOS_TIME_COMFIRM':
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