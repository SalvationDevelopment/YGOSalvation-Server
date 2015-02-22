/*jslint node: true */

var primus,
    manualgamelist = {},
    http = require('http'),
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    primusServer = http.createServer().listen(24556), // +1 from gamelist
    message_irc = require('./custom_error.js');


function Room() {
    'use strict';
    return {
        gamestate: 'off',
        gametype: 'single',
        lobby: {
            player1_username: '',
            player2_username: '',
            player3_username: '',
            player4_username: '',
            player1_loaded: false,
            player2_loaded: false,
            player3_loaded: false,
            player4_loaded: false,
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

function InstanceConstructor() {
    return {
        player1: false,
        player2: false,
        player3: false,
        player4: false,
        spectators: []
    };
}

function NetworkInstanceConstructor() {
    var game = new GameConstructor();
    var instance = new InstanceConstructor();
    var network = net.createServer(function (socket) {
        /* socket is the concept of a single connection,
        look at it as a person and we are doing 'work' on that person. */
        socket.on('data', function (data) {
            processCommunication(data, socket);
        });
        socket.on('close', function () {

        });
        socket.on('error', function () {

        });
    });


    function assignSlot(socket) {
        if (!instance.player1) {
            instance.player1 = socket;
            socket.instance = 'player1';
        } else if (!game.player2) {
            instance.player2 = socket;
            socket.instance = 'player2';
        } else if (!game.player3 && game.mode === 'tag') {
            instance.player3 = socket;
            socket.instance = 'player3';
        } else if (!game.player4 && game.mode === 'tag') {
            instance.player4 = socket;
            socket.instance = 'player4';
        } else {
            var place = instance.spectators;
            instance.spectators.push(socket);
            socket.instance = 'spectator';
        }
    }

    function publicPublication(data) {
        for (var players in instance) {
            if (players !== 'spectators' && instance[players] !== null && instance.hasOwnProperty(players)) {
                players.write(JSON.stringify(data));
            }
        }
        instance.forEach(function (spectator) {
            spectator.write(JSON.stringify(data));
        });
    }

    function coinFlip() {
        return Math.floor(Math.random() * 2);
    }

    function processCommunication(data, socket) {
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
    return this;
}
function Room(id) {
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
primus = new Primus(primusServer, {
    parser: 'JSON'
});

primus.use('rooms', Rooms);
primus.on('connection', function (socket) {
    'use strict';
    socket.join('activegames', function () {
        socket.write(JSON.stringify(manualgamelist));
    });
    
    socket.on('data', function (data) {
        data = data || {};
        var action = data.command;
        switch (action) {
        case ('join'):
            if (!manualgamelist[data.room]) {
                manualgamelist[data.room] = new Room(data.room);
            }
            socket.join(data.room, function () {
                socket.write(JSON.stringify(manualgamelist[data.room]));
            });
            break;

        case ('leave'):
            socket.leave('data.room');
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