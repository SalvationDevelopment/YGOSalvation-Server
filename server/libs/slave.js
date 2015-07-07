/*jslint  node: true, plusplus: true*/
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var httpsServer;
try {
    var fs = require('fs'),
        ssloptions = {
            ca: fs.readFileSync(process.env.SSL + 'sub.class1.server.ca.pem'),
            key: fs.readFileSync(process.env.SSL + 'ssl.key.unsecure'),
            cert: fs.readFileSync(process.env.SSL + 'ssl.crt')
        },
        http = require('https');
    var httpsServer = http.createServer(ssloptions);
    httpsServer.listen(8082);
} catch (e) {
    console.log('not using SSL')
    var http = require('http');
    var httpsServer = http.createServer();
    httpsServer.listen(8082);
}


var ygoserver, //port 8911 ygopro Server
    net = require('net'), //tcp connections
    WebSocket = require('ws').Server,
    Framemaker = require('./parseframes.js'), //understand YGOPro API.
    processIncomingTrasmission = require('./processCTOS.js'); // gamelist and start games

function initiateSlave() {
    'use strict';
    // When a user connects, create an instance and allow the to duel, clean up after.
    var parsePackets = require('./parsepackets.js'),
        ws;

    function handleTCP(socket) {
        var framer = new Framemaker();
        socket.setNoDelay(true);
        socket.active_ygocore = false;
        socket.active = false;
        socket.on('data', function listener(data) {
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
        socket.setTimeout(300000, function () {
            socket.end(); //Security precaution
        });
        socket.on('error', function (error) {
            //console.log('::CLIENT', error);
            if (socket.active_ygocore) {
                try {
                    socket.active_ygocore.end();
                } catch (e) {
                    console.log('::CLIENT ERROR Before connect', e);
                }
            }
        });
    }
    ygoserver = net.createServer(handleTCP);
    ygoserver.listen(8911);

    ws = new WebSocket({
        server: httpsServer
    });
    ws.on('connection', function connection(socket) {
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