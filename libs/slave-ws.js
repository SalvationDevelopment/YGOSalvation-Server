/*jslint  node: true, plusplus: true*/

'use strict';
var ygoserver, //port 8911 ygopro Server
    WebSocketServer = require('ws').Server,
    Framemaker = require('./parseframes.js'), //understand YGOPro API.
    processIncomingTrasmission = require('./processCTOS.js'), // gamelist and start games
    Socket = require('primus').createSocket({
        iknowclusterwillbreakconnections: true
    }),
    client = new Socket('127.0.0.1:24555'), //Internal server communications.
    lock = false;

function initiateSlave() {
    // When a user connects, create an instance and allow the to duel, clean up after.
    var parsePackets = require('./parsepackets.js'),
        ws;

    ws = new WebSocketServer({
        port: 8082
    });
    ws.on('connection', function connection(socket) {
        if (lock) {
            socket.terminate();
        }
        var framer = new Framemaker();
        socket.heartbeat = 0;
        socket.active_ygocore = false;
        socket.active = false;
        socket.write = function (message) {
            socket.send(message, {
                binary: true,
                mask: false
            });
        };
        socket.end = function () {
            socket.terminate();
        };
        socket.on('message', function incoming(data) {
            console.log('ws:', data);
            socket.heartbeat++;
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
            console.log('socket, disconnected');
        });
        socket.on('error', function close(error) {
            console.log(error);
        });
    });

    return ygoserver;
}
initiateSlave();


function internalUpdate(data) {
    if (data.action === 'internalRestart') {
        if (data.password !== process.env.OPERPASS) {
            return;
        }
        process.exit(0);
    }
}

function onConnectGamelist() {
    client.write({
        action: 'internalServerLogin',
        password: process.env.OPERPASS,
        gamelist: false,
        registry: false
    });
}


function onCloseGamelist() {

}

client.on('data', internalUpdate);
client.on('open', onConnectGamelist);
client.on('close', onCloseGamelist);