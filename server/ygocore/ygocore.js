/* jshint node:true */
/* global module */
/* jslint browser : true */
var fs = require('fs');
var net = require('net');
var banlist = require('./banlist.json');
var sqlite3 = require('sqlite3').verbose();
var scripts = {};
var ffi = require('ffi'); /* allows dynamic linking of the ocgapi.dll, critical; */
var ref = require('ref'); /* allows use of C++ pointers for C++ JS interactions, critical */
var struct = require('ref-struct'); /* allows use of C++ structures for C++ JS interactions, critical */
var MersenneTwister = require('mersennetwister'); /* seed number generator to give the shuffler, makes a random number.*/
var mt = new MersenneTwister();

var cardDatabase = new sqlite3.Database('cards.cbd', function () {
    updateScripts();

});

function getScript(identificationNumber) {
    return new Buffer(scripts['c' + identificationNumber]);
}

function updateScripts() {
    console.log('Loading Scripts, please wait');
    var scriptfilenames = fs.lstatSync('../http/ygopro/scripts');
    scriptfilenames.forEach(function (iteration) {
        scripts[scriptfilenames[iteration]] = fs.readFileSync('../http/ygopro/scripts/' + scriptfilenames);
    });
    console.log('Scripts loaded');
}

function card_reader(request) {
    var code = request.code;
    var data = request.data;
    var query = cardDatabase.query = "SELECT id, ot, alias, setcode, type, level, race, attribute, atk, def FROM datas";
    return struct({
        code: request.code,
        alias: 'uint32',
        setcode: 'uint64',
        type: 'uint32',
        level: 'uint32',
        attribute: 'uint32',
        race: 'uint32',
        attack: 'int32',
        defence: 'int32'
    });
}

function GameConstructor() {
    "use strict";
    var seed = mt.int();
    this.ocgapi = ffi.Library(__dirname + '/ocgcore.dll', {
        'set_script_reader': ['void', getScript],
        'set_card_reader': ['void', card_reader],
        'set_message_handler': ['void', console.log],
        'create_duel': ['pointer', ['uint32']],
        'start_duel': ['void', ['pointer', 'int']],
        'end_duel': ['void', ['pointer']],
        'set_player_info': ['void', ['pointer', 'int32', 'int32', 'int32', 'int32']],
        'get_log_message': ['void', ['pointer', 'byte*']],
        'get_message': ['int32', ['pointer' /*, get_message_pointer*/ ]],
        'process': ['int32', ['pointer']],
        'new_card': ['void', ['pointer', 'uint32', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8']],
        'new_tag_card': ['void', ['pointer', 'uint32', 'uint8', 'uint8']],
        'query_card': ['int32', ['pointer', 'uint8', 'uint8', 'int32', 'byte*', 'int32']],
        'query_field_count': ['int32', ['pointer', 'uint8', 'uint8']],
        'query_field_card': ['int32', ['pointer', 'uint8', 'uint8', 'int32', 'byte*', 'int32']],
        'query_field_info': ['int32', ['pointer', 'byte*']],
        'set_responsei': ['void', ['pointer', 'int32']],
        'set_responseb': ['void', ['pointer', 'byte*']],
        'preload_script': ['int32', ['pointer', 'char*', 'int32']]
    });
    var pduel = this.ocgapi.create_duel(seed);
    var model = {
        username: localStorage.username,
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
        gamelog: [],
        cardunderexamine: 0,
    };
    return this;
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