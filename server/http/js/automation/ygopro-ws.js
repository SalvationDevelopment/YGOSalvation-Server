/*jslint browser:true, plusplus : true, bitwise : true*/
/*globals WebSocket, Buffer, Uint8Array, enums, makeCard, recieveSTOC, CommandParser, Framemaker, makeCTOS*/
// buffer.js
// card.js
// gui.js

var duel = {
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
                name: ''
            },
            1: {
                name: ''
            },
            2: {
                name: ''
            },
            3: {
                name: ''
            }
        },
        spectators: 0,
        turn: 0,
        turnOfPlayer: 0,
        phase: 0
    },
    field = {
        0: {},
        1: {}
    };

function parsePackets(command, message) {
    "use strict";

    var task = [],
        packet = {
            message: message.slice(1),
            readposition: 0
        };
    packet[command] = enums[command][message[0]];
    task.push(packet);
    return task;
}

function processTask(task, socket) {
    'use strict';
    var i = 0,
        l = 0,
        output = [],
        RESPONSE = false;
    for (i; task.length > i; i++) {
        output.push(recieveSTOC(task[i]));
    }

    return output;
}


/*globals console*/

function initiateNetwork(network) {
    'use strict';
    network.on('STOC_JOIN_GAME', function (data) {
        //copy the object over into the model
        duel.deckcheck = data.deckcheck;
        duel.draw_count = data.draw_count;
        duel.banlistHashCode = data.banlistHashCode;
        duel.mode = data.mode;
        duel.noshuffle = data.noshuffle;
        duel.prio = data.prio;
        duel.startlp = data.startlp;
        duel.starthand = data.startlp;
        //fire handbars to render the view.
    });
    network.on('STOC_TYPE_CHANGE', function (data) {
        duel.ishost = data.ishost;
    });
    network.on('STOC_HS_PLAYER_ENTER', function (data) {
        var i;
        for (i = 0; 3 > i; i++) {
            if (!duel.player[i].name) {
                duel.player[i].name = data.person;
                return;
            }
        }
    });
    network.on('STOC_HS_PLAYER_CHANGE', function (data) {
        var state = data.state,
            stateText = data.stateText,
            pos = data.changepos,
            previousName;
        if (data.pos > 3) {
            return;
        }
        if (data.state < 8) {
            previousName = String(duel.player[pos]); //copy then delete...
            duel.player[state].name = previousName;
            duel.player[pos].name = '';
            duel.player[pos].ready = false;
            console.log('???');
        } else if (stateText === 'PLAYERCHANGE_READY') {
            duel.player[pos].ready = true;
        } else if (stateText === 'PLAYERCHANGE_NOTREADY') {
            duel.player[pos].ready = false;
        } else if (stateText === 'PLAYERCHANGE_LEAVE') {
            duel.player[pos].name = '';
            duel.player[pos].ready = false;
        } else if (stateText === 'PLAYERCHANGE_OBSERVE') {
            duel.player[pos].name = '';
            duel.player[pos].ready = false;
            duel.spectators++;
        }
    });
    network.on('STOC_HS_WATCH_CHANGE', function (data) {
        data.spectators = duel.spectators;
    });
    network.on('STOC_DUEL_START', function (STOC_DUEL_START) {
        //switch view from duel to duel field.
    });
    network.on('MSG_START', function (data) {
        //set the LP.
        duel.player[0].lifepoints = data.lifepoints1;
        duel.player[1].lifepoints = data.lifepoints2;
        //set the size of each deck
    });
    network.on('MSG_NEW_TURN', function (data) {
        duel.turn++;
        duel.turnOfPlayer = data.player;
    });
    network.on('MSG_RELOAD_FIELD', function (data) {
        duel.turn++;
        duel.turnOfPlayer = data.player;
    });
    network.on('MSG_UPDATE_DATA', function (data) {
        //field[data.player][data.fieldmodel] = ???;
        //reimage field;
    });
    network.on('MSG_MOVE', function (data) {
        //use animation system in gui.js

    });
    network.on('MSG_UPDATE_CARD', function (data) {
        field[data.player][data.fieldmodel][data.index] = data.card;
        //redraw field;
    });
    network.on('MSG_CHAIN_END', function (data) {
        //???
    });
    network.on('MSG_WAITING', function (data) {
        //waiting animation/flag set to true.
    });
    network.on('MSG_SUMMONING', function (data) {
        //attempting to summon animation
        //data.code give the id of the card
    });
    network.on('MSG_SUMMONED', function (data) {
        //???
    });
    network.on('MSG_CHAINING', function (data) {
        //gives a card location and card
    });
    network.on('MSG_CHAINED', function (data) {
        //???
    });
    network.on('MSG_EQUIP', function (data) {
        //???
    });
    network.on('MSG_POS_CHANGE', function (data) {
        //??? might be extention of move command?
    });
    network.on('MSG_SHUFFLE_DECK', function (data) {
        //use gui to shuffle deck of data.player
    });
    network.on('MSG_CHAIN_SOLVED', function (data) {
        //???
    });
    network.on('MSG_NEW_PHASE', function (data) {
        duel.phase = data.phase;
    });
    network.on('MSG_DRAW', function (data) {
        var i = 0;
        for (i; data.count > i; i++) {
            field[data.player].DECK[(field.DECK.length - i)] = data.cardslist[i];
        }
        //due draw animation/update
    });
    network.on('MSG_SPSUMMONING', function (data) {
        //special summoning animation with data
    });
    network.on('MSG_SPSUMMONED', function (data) {
        //???
    });



}

//"ws://192.99.11.19:8082"
function startgame(roompass) {
    'use strict';
    try {
        window.ws.close();
        window.ws = undefined;
    } catch (noWebSocket) {
        //no previous websocket so dont worry about it.
    }
    if (localStorage.nickname === undefined) {
        console.log('localStorage.nickname is undefined, required!');
        return;
    }
    var framer = new Framemaker(),
        ws = new WebSocket("ws://127.0.0.1:8082", "duel"),
        network = new CommandParser(),
        dInfo = {};
    window.activeReplayRecorde = [];
    ws.binaryType = 'arraybuffer';

    ws.onopen = function () {
        console.log('connected');

    };
    ws.onerror = function (errormessage) {
        console.log('There was an error with the websocket', errormessage);
        ws.close();
    };
    ws.onclose = function () {
        console.log('Websocket died');
    };
    ws.onmessage = function (data) {
        var q = new Buffer(new Uint8Array(data.data)),
            frame,
            task,
            newframes = 0,
            commands,
            l = 0,
            reply;

        console.log('.');
        frame = framer.input(q);
        for (newframes; frame.length > newframes; newframes++) {
            task = parsePackets('STOC', new Buffer(frame[newframes]));
            commands = processTask(task);
            l = 0;
            for (l; commands.length > l; l++) {
                /*binary code goes in and comes out as events*/
                window.activeReplayRecorde.push({
                    type: 'input',
                    action: commands[l]
                });
                console.log(commands[l]);
                network.input(commands[l]);
            }
        }
        frame = [];
    };
    ws.onopen = function () {
        console.log('Send Game request for', roompass);
        var CTOS_PlayerInfo = makeCTOS('CTOS_PlayerInfo', localStorage.nickname),
            CTOS_JoinGame = makeCTOS('CTOS_JoinGame', roompass),
            toduelist = makeCTOS('CTOS_HS_TODUELIST'),
            tosend = Buffer.concat([CTOS_PlayerInfo, CTOS_JoinGame]);
        window.activeReplayRecorde.push({
            type: 'output',
            action: tosend
        });
        window.ws.send(tosend);
    };
    window.ws = ws;
    window.onunload = window.ws.close;
    initiateNetwork(network);
}

function sendDeckListToServer(deck) {
    'use strict';
    window.ws.send(makeCTOS('CTOS_UPDATE_DECK', deck));
    //window.ws.send(makeCTOS('CTOS_HS_READY'));
}

function movetoSpectator() {
    'use strict';
    var servermessage = makeCTOS('CTOS_HS_TOOBSERVER');
    console.log(servermessage);
    window.ws.send(servermessage);
}