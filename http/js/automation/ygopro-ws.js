/*jslint browser:true, plusplus : true, bitwise : true*/
/*globals WebSocket, Buffer, Uint8Array, enums, makeCard, recieveSTOC, CommandParser, Framemaker, makeCTOS, initiateNetwork*/
// buffer.js
// card.js
// gui.js


function parsePackets(command, message) {
    'use strict';

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
        ws = new WebSocket('ws://127.0.0.1:8082', 'duel'),
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
    window.ws.send(makeCTOS('CTOS_HS_READY'));
}

function movetoSpectator() {
    'use strict';
    var servermessage = makeCTOS('CTOS_HS_TOOBSERVER');
    console.log(servermessage);
    window.ws.send(servermessage);
}

function startDuel() {
    'use strict';
    var servermessage = makeCTOS('CTOS_START');
    window.ws.send(servermessage);
}

function leaveDuel() {
    'use strict';
    var servermessage = makeCTOS('CTOS_LEAVE_GAME');
    window.ws.send(servermessage);
}

function kickDuelist(playerIndex) {
    'use strict';
    var servermessage = makeCTOS('CTOS_HS_KICK', playerIndex);
    window.ws.send(servermessage);
}