/* jslint node : true */
try {
    require('httpsys').slipStream();
} catch (error) {
    console.log('Windows 8+ spefic enhancements not enabled.');
}
var gamelist = Object.create(null);

var enums = require('./enums.js');
var parsePackets= require('./parsepackets.js');
var net = require('net');
var childProcess = require('child_process');
var Primus = require('primus');
var Rooms = require('primus-rooms');
var http = require('http');
var server = http.createServer().listen(5000);
var primus = new Primus(server, {
    parser: 'JSON'
});

var RecieveSTOC = require('./recieveSTOC.js');
primus.use('rooms', Rooms);

primus.on('connection', function (client) {
    client.on('data', function (data) {

        data = data || {};
        //console.log(data);
        var action = data.action;

        switch (action) {

        case ('join'):
            {
                client.join('activegames', function () {

                    // send message to this client
                    client.write('you joined room activegames');
                    client.write(JSON.stringify(gamelist));

                });
                break;
            }

        case ('leave'):
            {
                client.leave('activegames');
                break;
            }

        }
    });
});
primus.on('disconnection', function (socket) {
    console.log('Duel Room Disconnection');
    // the spark that disconnected
});
function PortFinder() {
    this.getPort = function (callback) {
        var activerooms = [];
        for (var rooms in gamelist) {
            activerooms.push(gamelist[rooms].port);
        }
        for (var i = 7000; 9001 > i; i++) {
            if (activerooms.indexOf(i) === -1) {
                callback(null, i);
                return;
            }
        }
    };
    return this;
}
var portfinder = new PortFinder();
var server = net.createServer(function (socket) {
    var active_ygocore;
    var active;
    socket.on('data', function (data) {
        processIncomingTrasmission(data);
    });
    socket.on('close', function () {
        //console.log('socket closed');
        if (active_ygocore) {
            active_ygocore.end();
        }
        if (socket.core) {
            socket.core.kill();
            delete socket.core;
            delete gamelist[socket.hostString];
            primus.room('activegames').write(JSON.stringify(gamelist));
        }
    });
    socket.on('error', function () {
        //console.log('CLIENT ERROR', error);
        if (active_ygocore) {
            active_ygocore.end();
        }
        if (socket.core) {
            socket.core.kill();
            delete socket.core;
            delete gamelist[socket.hostString];
            primus.room('activegames').write(JSON.stringify(gamelist));
        }
    });
    active = false;

    function connectToCore(port, data) {
        active_ygocore = net.connect(port, '127.0.0.1', function () {
            ////console.log('connected on', port);
            active_ygocore.write(data);
            primus.room('activegames').write(JSON.stringify(gamelist));
            active = false;
            active_ygocore.on('data', function (core_data) {
                var task = parsePackets('STOC', data);
                task = (function () {
                    var output = [];
                    for (var i = 0; task.length > i; i++) {
                        output.push(RecieveSTOC(task[i], socket.hostString));
                    }
                    return output;
                })();
                for (var i = 0; task.length > i; i++) {
                    // //console.log('task', i, task[i]);
                }
                socket.write(core_data);

            });
            active_ygocore.on('error', function (error) {
                if (socket.core) {
                    socket.core.kill();
                    delete socket.core;
                    delete gamelist[socket.hostString];
                    primus.room('activegames').write(JSON.stringify(gamelist));
                }
            });
            active_ygocore.on('close', function () {
                if (socket.core) {
                    socket.core.kill();
                    delete socket.core;
                    delete gamelist[socket.hostString];
                    primus.room('activegames').write(JSON.stringify(gamelist));
                }
                socket.end();
            });
        });
    }

    function processIncomingTrasmission(data) {
        //console.log(socket.hostString);
        if (active_ygocore) {
            active_ygocore.write(data);
        }


        // eventing shifted server wont overload due to constant dueling.
        var task = parsePackets('CTOS', data);
        task = (function () {
            var output = [];
            for (var i = 0; task.length > i; i++) {
                output.push(RecieveCTOS(task[i], socket.username, socket.hostString));
            }
            return output;
        })();

        for (var i = 0; task.length > i; i++) {
            if (task[i].CTOS_JOIN_GAME !== false) {
                active = true;
                //console.log('I am changing the hostString!!!');
                //console.log('because it =', task[i].CTOS_JOIN_GAME, typeof (task[i].CTOS_JOIN_GAME));
                socket.hostString = task[i].CTOS_JOIN_GAME;
                //console.log(task);
            }
            if (task[i].CTOS_PLAYER_INFO !== false) {
                socket.username = task[i].CTOS_PLAYER_INFO;
            }
        }
        //console.log(socket.hostString);
        if (active) {
            if (gamelist[socket.hostString] && !active_ygocore) {
                connectToCore(gamelist[socket.hostString].port, data);
                console.log(socket.username + ' connecting to existing core');
                gamelist[socket.hostString].players.push(socket.username);
            } else if (!gamelist[socket.hostString] && !active_ygocore) {

                console.log(socket.username + ' connecting to new core');
                portfinder.getPort(function (err, port) {
                    //console.log('connecting to new core @', port);
                    //console.log('found port ', port);
                    socket.core = childProcess.spawn('ygocoreSD3.exe ', [port], {
                        cwd: 'public/ygopro/'
                    }, function (error, stdout, stderr) {
                        //console.log('CORE Terminated', stderr, stdout);

                        if (error !== null) {
                            //console.log('exec error: ' + error);
                        }
                    });
                    socket.core.stdout.on('error', function () {
                        delete socket.core;
                        delete gamelist[socket.hostString];
                        primus.room('activegames').write(JSON.stringify(gamelist));
                        console.log('core error');
                    });
                    socket.core.stdout.on('data', function (core_message) {
                        core_message = core_message.toString();
                        console.log(port + ': Core Message: ', core_message);
                        if (core_message[0] === 'S') {

                            connectToCore(port, data);
                            gamelist[socket.hostString] = {
                                port: port,
                                players: [socket.username],
                                started: false
                            };
                            primus.room('activegames').write(JSON.stringify(gamelist));

                            //console.log(gamelist);
                        } else {
                            socket.core.kill();
                            console.log('attempting to kill game hosted by', gamelist[socket.hostString].players[0]);
                            delete socket.core;
                            delete gamelist[socket.hostString];
                            primus.room('activegames').write(JSON.stringify(gamelist));

                        }

                    });
                });


            }
        }
        active = false;


    }

});

server.listen(8911);





function RecieveCTOS(packet, usernameOfC, room) {
    var todo = Object.create(enums.CTOSCheck);

   
    switch (packet.CTOS) {
    case ('CTOS_PLAYER_INFO'):
        {
            var username = packet.message.toString('utf16le');
            username = username.split('\u0000');
            console.log(username[0]);
            todo.CTOS_PLAYER_INFO = username[0];
            break;
        }
    case ('CTOS_JOIN_GAME'):
        {
            //Player joined the game/server
            //var version = packet.message[0] + packet.message[1];
            var roomname = packet.message.toString('utf16le', 8, 56);
            //console.log('version:', '0x' + parseInt(version, 16), 'roomname:', roomname);

            if (gamelist[roomname]) {

                todo.CTOS_JOIN_GAME = roomname;

            } else {

                //requesting to host a new game.


                todo.CTOS_JOIN_GAME = roomname;

            }
            primus.room('activegames').write(JSON.stringify(gamelist));
            break;
        }
    case ('CTOS_HS_READY'):
        {
            break;
        }
    case ('CTOS_HS_NOTREADY'):
        {
            break;
        }
    case ('CTOS_HS_TODUELIST'):
        {
            ////console.log(packet.message.toString('binary'), packet);
            //            var type = packet.message.readUInt8(0);
            //            var selftype = type & 0xF;

            //console.log(usernameOfC, room);
            gamelist[room].players.push(usernameOfC);
            console.log(gamelist[room]);
            primus.room('activegames').write(JSON.stringify(gamelist));
            break;
        }
    case ('CTOS_HS_TOOBSERVER'):
        {
            ////console.log(packet.message.toString('binary'), packet);
            //            var type = packet.message.readUInt8(0);
            //            var selftype = type & 0xF;

            //console.log(usernameOfC, room);
            gamelist[room].players.splice(gamelist[room].players.indexOf(usernameOfC), 1);
            primus.room('activegames').write(JSON.stringify(gamelist));
            break;
        }
    case ('CTOS_LEAVE_GAME'):
        {
            gamelist[room].players.splice(gamelist[room].players.indexOf(usernameOfC), 1);
            primus.room('activegames').write(JSON.stringify(gamelist));
            break;
        }
    case ('CTOS_HS_START'):
        {
            gamelist[room].started = true;
            primus.room('activegames').write(JSON.stringify(gamelist));
            break;
        }
    }
    return todo;
}

