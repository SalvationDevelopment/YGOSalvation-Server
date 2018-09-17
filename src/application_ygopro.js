const net = require('net'),
    enums = require('./translate_ygopro_enums.js'),
    translateYGOProAPI = require('./translate_ygopro_messages.js'),
    DataStream = require('./model_data_stream.js'),
    rooms = {};

function onConnection(socket) {
    const dataStream = new DataStream(),
        tcpConnection = socket;

    function parsePackets(data) {
        'use strict';
        var message = new Buffer(data),
            task = [],
            packet = {
                message: message.slice(1),
                readposition: 0
            };
        packet.command = enums.STOC[message[0]];
        if (packet.command !== "STOC_UNKNOWN") {
            task.push(translateYGOProAPI(gameBoard, packet));
        }

        return task;
    }
    socket.on('data', function(data) {
        try {
            dataStream.input(data)
                .map(parsePackets)
                .map(applyAction);
        } catch (error) {
            console.log(error);
        }
    });
}

var server = net
    .createServer(onConnection)
    .listen(8815);