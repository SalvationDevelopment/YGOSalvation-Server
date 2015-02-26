/*jslint node: true */

var primus,
    manualgamelist = {},
    manualgamelistSecret = {},
    fs = require('fs'),
    http = require('http'),
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    primusServer = http.createServer().listen(24556), // +1 from gamelist
    message_irc = require('./custom_error.js'),
    banlist = fs.readFileSync('../http/ygopro/lflist.conf');


primus = new Primus(primusServer, {
    parser: 'JSON'
});

function coinFlip() {
    'use strict';
    return Math.floor(Math.random() * 2);
}

function join(socket, id) {
    'use strict';
    if (manualgamelist[id].gamestate !== 'started') {
        if (!manualgamelist[id].lobby.player1) {
            manualgamelist[id].lobby.player1 = socket.identity;
            socket.instance = 'player1';
        } else if (!manualgamelist[id].lobby.player2) {
            manualgamelist[id].lobby.player2 = socket.identity;
            socket.instance = 'player2';
        } else if (!manualgamelist[id].lobby.player3 && manualgamelist[id].mode === 'tag') {
            manualgamelist[id].lobby.player3 = socket.identity;
            socket.instance = 'player3';
        } else if (!manualgamelist[id].lobby.player4 && manualgamelist[id].mode === 'tag') {
            manualgamelist[id].lobby.player4 = socket.identity;
            socket.instance = 'player4';
        } else {
            manualgamelist[id].lobby.spectators.push(socket.identity);
            socket.instance = 'spectator';
        }
    } else {
        manualgamelist[id].lobby.spectators.push(socket.identity);
        socket.instance = 'spectator';
    }
}

function leave(socket, id) {
    'use strict';
    manualgamelist[id].lobby[socket.instance] = false;
    socket.instance = '';
}

function Room(id) {
    'use strict';
    return {
        id: id,
        gamestate: 'off',
        mode: 'single',
        lobby: {
            player1: false,
            player2: false,
            player3: false,
            player4: false,
            spectators: 0
        },
        player1_rps_choice: undefined,
        player2_rps_choice: undefined,
        activePlayer: 0,
        phase: 0,
        player1_lifepoints: 8000,
        player2_lifepoints: 8000,
        player1_cards: {
            deck: [],
            extra: [],
            side: [],
            hand: [],
            monsters: [null, null, null, null, null],
            spells: [null, null, null, null, null, null, null, null]
        },
        player2_cards: {
            deck: [],
            extra: [],
            side: [],
            hand: [],
            monsters: [null, null, null, null, null],
            spells: [null, null, null, null, null, null, null, null]
        },
        wincondition: 'none',
        replaysave: false,
        replayfile: '',
        gamelog: []
    };
}


function RoomSecret(id) {
    'use strict';
    return {
        id: id,
        player1: null,
        player2: null,
        player1LP: 8000,
        player2LP: 8000,
        player1Deck: [],
        player2Deck: [],
        player1Exta: [],
        player2Extra: [],
        state: 'lobby'

    };
}


/*function processCommunication(data, socket) {
    if (!socket.instance) {
        assignSlot(socket);
    }
    if (data.task === 'username') {
        socket.name = data.username;
    }
    if (data.task === 'chat') {
        publicPublication(data);
    }
    if (data.task === 'leave') {
        instance[socket.instance] = null;
    }
    if (data.task === 'kick') {
        if (instance[socket.instance] === 'player1') {
            instance[data.target] = null;
        }
    }
    if (data.task === 'duel') {
        assignSlot(socket);
    }
    if (data.task === 'start') {
        game.gamestate = 'dieroll';
        publicPublication({
            game: game
        });
        var choices = (game.mode === 'single') ? ['player1', 'player2'] : ['player1', 'player3'];
        game.choosingPlayer = choices[coinFlip()];
        instance[game.choosingPlayer].write({
            task: 'pickStart'
        });
    }
    if (data.task === 'pickStart') {
        if (socket.instance === game.choosingPlayer) {
            game.activePlayer = data.choice;
            publicPublication({
                game: game
            });
        }
    }
}
*/
function updateSubsGamelist(socket) {
    'use strict';
    socket.write(JSON.stringify(manualgamelist));
}

primus.use('rooms', Rooms);
primus.on('connection', function (socket) {
    'use strict';
    socket.join('activegames', function () {
        socket.write(JSON.stringify(manualgamelist));
    });

    socket.on('data', function (data) {
        data = data || {};
        var action = data.command;
        //startLen = manualgamelist.length;
        switch (action) {
        case ('join'):
            if (!manualgamelist[data.room]) {
                manualgamelist[data.room] = new Room(data.room);
                manualgamelistSecret[data.room] = new RoomSecret(data.room);
                primus.room('activegames').write(JSON.stringify(manualgamelist));
            }
            manualgamelist[data.room].join(data.identity);
            socket.join(data.room, function () {
                updateSubsGamelist(socket);
            });
            break;

        case ('leave'):
            socket.leave(data.room);
            leave(data.room, socket);
            break;

        default:
            console.log(data);

        }

    });
});
primus.on('disconnection', function (socket) {
    'use strict';
    //nothing required
});

primus.on('error', function (socket) {
    'use strict';
    //nothing required
});