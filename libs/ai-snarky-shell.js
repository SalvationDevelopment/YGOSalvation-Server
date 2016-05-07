/*jslint node:true, plusplus:true*/

var WebSocket = require('ws'),
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
    output = new events.EventEmitter();
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
        network = new CommandParser(),
        dInfo = {};

    network.ws = new WebSocket("ws://127.0.0.1:8082", "duel");
    network.ws.on('data', function (data) {
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

                console.log(commands[l]);

                network.input(commands[l]);
            }
        }
        frame = [];
    });
    network.ws.on('open', function () {
        console.log('Send Game request for', data.roompass);
        var CTOS_PlayerInfo = makeCTOS('CTOS_PlayerInfo', localStorage.nickname),
            CTOS_JoinGame = makeCTOS('CTOS_JoinGame', data.roompass),
            toduelist = makeCTOS('CTOS_HS_TODUELIST'),
            tosend = Buffer.concat([CTOS_PlayerInfo, CTOS_JoinGame]);
        network.ws.send(tosend);
    });

}

module.exports = duel;
var args = process.argv.slice(2);

if (args.length > 0) {
    console.log(args);
    var data = {
        roompass: args[0]
    };
    duel(data);
}