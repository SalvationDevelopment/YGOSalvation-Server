/*jslint node:true, plusplus:true*/
'use strict';

var WebSocket = require('ws'),
    events = require('events'),
    fs = require('fs');

var enums = require('./enums.js');
var transformer = require('./ai-snarky-transformer.js');
var recieveSTOC = transformer.recieveSTOC;
var makeCTOS = require('./ai-snarky-reply.js'),
    initiateNetwork = require('./ai-snarky-processor.js'),
    Field = require('./ai-snarky-state.js');

/* READ THE FOLLOWING : https://github.com/SalvationDevelopment/YGOPro-Salvation-Server/issues/274 */

function parseYDK(ydkFileContents) {
    var lineSplit = ydkFileContents.split("\r\n"),
        originalValues = {
            "main": [],
            "side": [],
            "extra": []
        },
        current = "";
    lineSplit.forEach(function (value) {
        if (value === "") {
            return;
        }
        if (value[0] === "#" || value[0] === "!") {
            if (originalValues.hasOwnProperty(value.substr(1))) {
                current = value.substr(1);
            } else {
                return;
            }
        } else {
            originalValues[current].push(value);
        }


    });
    return originalValues;
}

function readFiles(dirname, onFileContent, onError) {

    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function (filename) {
            fs.readFile(dirname + filename, 'utf-8', function (err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });
}

var decks = {};

(function getDecks(callback) {
    readFiles('../client/ygopro/deck/', function (filename, content) {
        decks[filename] = parseYDK(content);
    }, function (error) {
        console.log(error);
    });
}());


function Framemaker() {
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

    var output = new events.EventEmitter();
    output.input = function (input) {
        output.emit(input.command, input);
    };
    return output;
}

function parsePackets(command, message) {
    var task = [],
        packet = {
            message: message.slice(1),
            readposition: 0
        };
    packet[command] = enums[command][message[0]];
    task.push(packet);
    return task;
}


function processTask(task, fieldState) {

    var i = 0,
        l = 0,
        output = [],
        RESPONSE = false;
    for (i; task.length > i; i++) {
        output.push(recieveSTOC(task[i], fieldState));
    }

    return output;
}

function duel(data) {

    var framer = new Framemaker(),
        network = new CommandParser(),
        dInfo = {};

    initiateNetwork(network);
    network.fieldState = new Field();
    network.ws = new WebSocket("ws://127.0.0.1:8082", "duel");
    network.ws.on('message', function (data) {
        var q = data,
            frame,
            task,
            newframes = 0,
            commands,
            l = 0,
            reply;
        frame = framer.input(q);
        for (newframes; frame.length > newframes; newframes++) {
            task = parsePackets('STOC', new Buffer(frame[newframes]));
            commands = processTask(task, network.fieldState);
            l = 0;
            for (l; commands.length > l; l++) {
                /*binary code goes in and comes out as events*/

                console.log('YGOPro:', commands[l]);

                network.input(commands[l]);
            }
        }
        frame = [];
    });
    network.ws.on('open', function () {
        console.log('Send Game request for', data.roompass);
        var CTOS_PlayerInfo = makeCTOS('CTOS_PlayerInfo', 'SnarkyChild'),
            CTOS_JoinGame = makeCTOS('CTOS_JoinGame', data.roompass),
            toduelist = makeCTOS('CTOS_HS_TODUELIST'),
            tosend = Buffer.concat([CTOS_PlayerInfo, CTOS_JoinGame]);

        network.ws.send(tosend);
        network.decks = decks;


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