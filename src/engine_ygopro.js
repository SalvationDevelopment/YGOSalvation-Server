var child_process = require('child_process'),
    EventEmitter = require('events'),
    net = require('net'),
    enums = require('./enums.js'),
    receiver = require('./receiver.js')

function parsePackets(command, message) {
    'use strict';

    var task = [],
        packet = {
            message: message.slice(1),
            readposition: 0
        };
    packet[command] = enums[command][message[0]];
    task.push(packet);
    return task;
}


function CommandParser() {
    'use strict';

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

    function connectToCore(port, socket) {


        socket.active_ygocore = net.connect(port, '127.0.0.1', function() {
            var framer = new Framemaker(),
                network = new EventEmitter();

            network.input = function(input) {
                network.emit(input.command, input);
            };

            /* Unlimit the speed of the connection
            by not doing processing on the data
            to incease up network optimization */
            socket.active_ygocore.setNoDelay(true);

            /*artificial connection initiation*/
            // socket.active_ygocore.write(data);


            socket.active = false;
            socket.active_ygocore.on('data', function(data) {
                // need to send to reciver here.
                framer.input(data).forEach(function(frame) {
                    parsePackets('STOC', new Buffer(frame))
                        .map(receiver)
                        .map(network.input);
                });
            });

            socket.on('close', function() {
                if (socket.active_ygocore) {
                    socket.active_ygocore.end();
                }
            });
            socket.on('error', function(error) {
                socket.active_ygocore.end();
            });
        });
        socket.active_ygocore.on('error', function(error) {
            socket.end();
        });
        socket.active_ygocore.on('close', function() {
            socket.end();
        });

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
            connectToCore(port, data, sockets[0], function() {
                connectToCore(port, data, sockets[1], function() {});
            });

        }
    });

    instance.relay = function(socket, message) {
        ygopro.sockets[socket].send(message);
    };



};