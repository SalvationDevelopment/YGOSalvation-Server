var child_process = require('child_process'),
    net = require('net');

module.exports = function(instance, sockets) {
    instance.ygopro = child_process.spawn('./ygosharp/ygosharp.exe', function(error, stdout, stderr) {

    });

    var ygopro = instance.ygopro;

    function connectToCore(port, socket) {


        socket.active_ygocore = net.connect(port, '127.0.0.1', function() {
            var framer = new Framemaker();
            /* Unlimit the speed of the connection
            by not doing processing on the data
            to incease up network optimization */
            socket.active_ygocore.setNoDelay(true);

            /*proxy the data*/
            socket.active_ygocore.write(data);


            socket.active = false;
            socket.active_ygocore.on('data', function(core_data) {
                // need to send to reciver here.
                var q = new Buffer(new Uint8Array(data.data)),
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
                        window.activeReplayRecorde.push({
                            type: 'input',
                            action: commands[l]
                        });
                        console.log(commands[l]);
                        network.input(commands[l]);
                    }
                }
                frame = [];
                socket.write(core_data);
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
        if (core_message_raw.toString().indexOf("::::") < 0) {
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