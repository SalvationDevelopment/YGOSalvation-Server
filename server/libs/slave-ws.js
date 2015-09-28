/*jslint  node: true, plusplus: true*/


var ygoserver, //port 8911 ygopro Server
    WebSocketServer = require('ws').Server,
    Framemaker = require('./parseframes.js'), //understand YGOPro API.
    processIncomingTrasmission = require('./processCTOS.js'); // gamelist and start games

function initiateSlave() {
    'use strict';
    console.log('Websocket initializing');
    // When a user connects, create an instance and allow the to duel, clean up after.
    var parsePackets = require('./parsepackets.js'),
        ws;

    ws = new WebSocketServer({
        port: 8082
    });
    ws.on('connection', function connection(socket) {
        console.log('!!! --- connection to Websocket');
        var framer = new Framemaker();
        socket.active_ygocore = false;
        socket.active = false;
        socket.write = function (message) {
            socket.send(message, {
                binary: true,
                mask: false
            });
        };
        socket.end = function () {

        };
        socket.on('message', function incoming(data) {
            var frame,
                task,
                newframes = 0;

            if (socket.active_ygocore) {
                socket.active_ygocore.write(data);
            }
            frame = framer.input(data);
            for (newframes; frame.length > newframes; newframes++) {
                task = parsePackets('CTOS', new Buffer(frame[newframes]));
                processIncomingTrasmission(data, socket, task);
            }
            frame = [];

        });
        socket.on('close', function close() {
            console.log('WS, disconnected');
        });
        socket.on('error', function close(error) {
            console.log(error);
        });
    });

    return ygoserver;
}
initiateSlave();