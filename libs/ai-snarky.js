/*jslint node:true, plusplus: true, nomen:true*/
// blah blah load dependencies

/* Ths is the network shell of the AI, provides UX interface similar to DevBot.
    It connects to the IRC server to act as a user target for the DuelServ
    Duelserv then issues a command on game request to the AI as if it was a normal user
    via the Primus Gamelist connection. The AI can recieve all the same network
    updates via the Gamelist as a normal user and act on them. Upon recieving a 
    duel request via the Gamelist it creates a 'Duel Instance', the AI can easily
    handle multiple game instances.
    
*/

var Primus = require('primus'), //Primus, our Sepiroth-Qliphopth Creator God. Websocket connections.
    internalGames = [], // internal list of all games the bot is playing
    //enums = require('./libs/enums.js'),
    http = require('http'), // SQCG Primus requires http parsing/tcp-handling
    server = http.createServer(), //throne of the God
    primus = new Primus(server), // instance of the God
    Socket = require('primus').createSocket(),
    client = new Socket('http://ygopro.us:24555'), //Connect the God to the tree;
    WebSocket = require('ws'),
    events = require('events');


var enums = require('./enums.js');
var transformer = require('./ai-snarky-transformer.js');
var recieveSTOC = transformer.recieveSTOC;
var makeCTOS = require('./ai-snarky-reply.js');

/* READ THE FOLLOWING : https://github.com/SalvationDevelopment/YGOPro-Salvation-Server/issues/274 */
function Framemaker() {
    "use strict";
    var memory = new Buffer([]);

    this.input = function (buffer) {
        var x = true,
            output = [],
            recordOfBuffer,
            frame_length;
        //console.log('before', memory.length, 'bytes in memory');
        memory = Buffer.concat([memory, buffer]);
        //console.log('concated', memory.length);
        while (x === true && memory.length > 2) {
            frame_length = memory.readUInt16LE(0);
            //console.log('read', frame_length, '(+2) of', memory.length, 'bytes');
            if ((memory.length - 2) < frame_length) {
                //console.log('not enough');
                x = false;
            } else {
                recordOfBuffer = memory.slice(2).toJSON();
                output.push(recordOfBuffer);
                if (memory.length === (frame_length + 2)) {
                    memory = new Buffer([]);
                    x = false;
                } else {
                    memory = memory.slice((frame_length + 2));
                }
                //console.log('after', memory.length);
            }
        }
        //console.log('----',output);
        return output;
    };
    return this;
}


function CommandParser() {
    'use strict';
    var output = {};
    output = events.EventEmitter();
    output.input = function (input) {
        output.emit(input.command, input);
    };
    return output;
}

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

function duel(data) {
    'use strict';
    var framer = new Framemaker(),
        ws = new WebSocket("ws://127.0.0.1:8082", "duel"),
        network = new CommandParser(),
        dInfo = {};

    ws.on('data', function (data) {
        var q = new Buffer(data.data),
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
    });
    ws.on('open', function () {
        console.log('Send Game request for', data.roompass);
        var CTOS_PlayerInfo = makeCTOS('CTOS_PlayerInfo', localStorage.nickname),
            CTOS_JoinGame = makeCTOS('CTOS_JoinGame', data.roompass),
            toduelist = makeCTOS('CTOS_HS_TODUELIST'),
            tosend = Buffer.concat([CTOS_PlayerInfo, CTOS_JoinGame]);
        window.activeReplayRecorde.push({
            type: 'output',
            action: tosend
        });
        window.ws.send(tosend);
    });

}


function gamelistUpdate(data) {
    'use strict';

    if (data.clientEvent) {
        if (data.clientEvent === 'duelrequest' && data.target === 'SnarkyChild') {
            duel(data);

        }
    }
}

function onConnectGamelist() {
    'use strict';
}

function onCloseGamelist() {
    'use strict';
    require('fs').watch(__filename, process.exit);
}

client.on('data', gamelistUpdate);
client.on('connected', onConnectGamelist);
client.on('close', onCloseGamelist);
client.write({
    action: 'join'
});

module.exports = {
    gamelistUpdate: gamelistUpdate,
    onConnectGamelist: onConnectGamelist,
    onCloseGamelist: onCloseGamelist
};


require('fs').watch(__filename, process.exit);