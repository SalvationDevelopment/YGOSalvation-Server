var child_process = require('child_process'),
    EventEmitter = require('events'),
    net = require('net'),
    enums = require('./enums.js'),
    receiver = require('./receiver.js'),
    manual = require('./engine_manual.js');


function makeUICallback(socket) {
    return function gameResponse(view, stack, callback) {
        try {
            socket.write((view.p0));
        } catch (error) {
            console.log('failed messaging socket', error);
        } finally {
            if (callback) {
                return callback(stack);
            }
        }
    };
}

function parsePackets(message) {
    'use strict';

    var task = [],
        packet = {
            message: message.slice(1),
            readposition: 0
        };
    packet.STOC = enums.STOC[message[0]];
    task.push(packet);
    return task;
}


function Framemaker() {
    'use strict';
    var memory = new Buffer([]);

    this.input = function(buffer) {
        var x = true,
            output = [],
            recordOfBuffer,
            frame_length;
        memory = Buffer.concat([memory, buffer]);
        while (x === true && memory.length > 2) {
            frame_length = memory[0] + memory[1];
            if ((memory.length - 2) < frame_length) {
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
            }
        }
        return output;
    };
    return this;
}

module.exports = function(instance, sockets) {
    instance.ygopro = child_process.spawn('./ygosharp/ygosharp.exe', function(error, stdout, stderr) {

    });

    var ygopro = instance.ygopro;

    function connectToCore(port, socket, callback) {
        var framer = new Framemaker(),
            network = new EventEmitter(),
            ui = manual(makeUICallback(socket)),
            tcpConnection;

        network.input = function(input) {
            network.emit(input.command, input);
        };

        tcpConnection = net.connect(port, '127.0.0.1', function() {
            tcpConnection.setNoDelay(true);

            tcpConnection.on('data', function(data) {
                framer.input(data)
                    .map(parsePackets)
                    .map(receiver)
                    .map(network.input);

            });

            socket.on('close', function() {
                if (tcpConnection) {
                    tcpConnection.end();
                }
            });
            socket.on('error', function(error) {
                tcpConnection.end();
            });

            /*artificial connection initiation*/
            // tcpConnection.write(data);
            callback();
        });
        tcpConnection.on('error', function(error) {
            socket.end();
        });
        tcpConnection.on('close', function() {
            socket.end();
        });

        return tcpConnection;

    }

    ygopro.stdout.on('error', function(error) {
        ygopro.kill();
        console.log('game ended with issues', error);
    });
    ygopro.stdout.on('data', function(core_message_raw) {
        if (core_message_raw.toString().indexOf('::::') < 0) {
            return;
        }
        var core_message = core_message_raw.toString().split('|');

        if (core_message[0].trim() === '::::network-ready') {
            ygopro.sockets[0] = connectToCore(instance.port, sockets[0], function() {
                ygopro.sockets[1] = connectToCore(instance.port, sockets[1], function() {});
            });

        }
    });

    instance.relay = function(socket, message) {
        ygopro.sockets[socket].send(message);
    };
};