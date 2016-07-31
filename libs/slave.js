/*jslint  node: true, plusplus: true*/
'use strict';
var ygoserver, //port 8911 ygopro Server
    net = require('net'), //tcp connections
    Framemaker = require('./parseframes.js'), //understand YGOPro API.
    processIncomingTrasmission = require('./processCTOS.js'), // gamelist and start games
    Socket = require('primus').createSocket({
        iknowclusterwillbreakconnections: true
    }),
    client = new Socket('127.0.0.1:24555'); //Internal server communications.

function initiateSlave() {
    // When a user connects, create an instance and allow the to duel, clean up after.
    var parsePackets = require('./parsepackets.js'),
        ws;

    function handleTCP(socket) {
        var framer = new Framemaker();
        socket.heartbeat = 0;
        socket.setNoDelay(true);
        socket.active_ygocore = false;
        socket.active = false;
        socket.on('data', function listener(data) {
            //console.log(data); //used during automatic mode debuging and study.
            var frame,
                task,
                newframes = 0;
            socket.heartbeat++;
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
    return ygoserver;
}

initiateSlave();

function internalUpdate(data) {
    if (data.action === 'internalRestart') {
        if (data.password !== process.env.OPERPASS) {
            return;
        }
        ygoserver.close();
        setTimeout(function () {
            process.exit(0);
        }, 600000);
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