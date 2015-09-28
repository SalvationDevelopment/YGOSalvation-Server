/*jslint  node: true, plusplus: true*/

var ygoserver, //port 8911 ygopro Server
    net = require('net'), //tcp connections
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
    return ygoserver;
}

initiateSlave();