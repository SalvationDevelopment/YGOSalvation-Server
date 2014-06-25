/* jslint node : true */
try {
    require('httpsys').slipStream();
} catch (error) {
    console.log('Windows 8+ spefic enhancements not enabled.');
}
var gamelist = Object.create(null);

var enums = require('./enums.js');
var net = require('net');
var childProcess = require('child_process');
var Primus = require('primus');
var Rooms = require('primus-rooms');
var http = require('http');

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
        }
    });
    socket.on('error', function (error) {
        //console.log('CLIENT ERROR', error);
        if (active_ygocore) {
            active_ygocore.end();
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
                //console.log('CORE ERROR', error);
            });
            active_ygocore.on('close', function () {
                //console.log('CORE conenction closed');
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
                console.log('connecting to existing core');
                gamelist[socket.hostString].players.push(socket.username);
            } else if (!gamelist[socket.hostString] && !active_ygocore) {

                //console.log('locking for port');
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
                        console.log('core error');
                    });
                    socket.core.stdout.on('data', function (core_message) {
                        core_message = core_message.toString();
                        console.log('Core Message: ', core_message);
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
                            delete socket.core;
                            delete gamelist[socket.hostString];

                        }

                    });
                });


            }
        }
        active = false;


    }

});

server.listen(8911);

function SendCommunication(message, commandEnum) {

    var communication = [];

    communication[0] = message.length * 2 + 1;
    communication[2] = commandEnum;
    var write_position = 3;

    var i, strLen, c, arrLen;
    if (typeof message === 'string') {
        for (i = 0, strLen = message.length, c = 0; i < strLen; i++, c = c + 2) {
            communication[(c + write_position)] = message.charCodeAt(i);
        }
    }
    if (message instanceof Array) {
        for (i = 0, arrLen = message.length; i < arrLen; i++) {
            communication[(i + write_position)] = message[i];
        }
    }
    return new Buffer(communication);
}

function parsePackets(command, message) {
    var task = [];
    var buffer_read_position = 0;
    //The message is stripped and turned into a normal packet so we can understand it as:
    //{length, +length, type of message, the message itself }
    //the server may send more than one at a time so lets take it one at a time.
    while (buffer_read_position < message.length) {
        var read = message[buffer_read_position] + message[(buffer_read_position + 1)];
        var packet = {
            LENGTH: read,
            message: message.slice((buffer_read_position + 3), (buffer_read_position + 1 + read)),
            readposition: 0
        };
        packet[command] = enums[command][message[(buffer_read_position + 2)]] || message[(buffer_read_position + 2)];


        task.push(packet);

        buffer_read_position = buffer_read_position + 2 + read;
    }
    return task;
}

function RecieveCTOS(packet, usernameOfC, room) {
    if (packet.CTOS) {
        var stc = parseInt(packet.CTOS, 16) || '--';
        //console.log('0x' + stc, packet.CTOS);
    }
    var todo = Object.create(enums.CTOSCheck);

    var intro;
    switch (packet.CTOS) {
    case ('CTOS_PLAYER_INFO'):
        {
            var username = packet.message.toString('utf16le');
            console.log(username);
            username = username.split('\u0000');
            username = username[0];
            console.log(username);
            todo.CTOS_PLAYER_INFO = username;
            break;
        }
    case ('CTOS_JOIN_GAME'):
        {
            //Player joined the game/server
            var version = packet.message[0] + packet.message[1];
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

function RecieveSTOC(packet, tempData) {
    var todo = Object.create(enums.STOCCheck);

    ////console.log(packet.STOC);
    var intro;
    switch (packet.STOC) {

    case ('STOC_GAME_MSG'):
        {
            //game data dont need to process

        }
        break;
    case ('STOC_ERROR_MSG'):
        {
            //game died, recover it!
        }
        break;
    case ('STOC_SELECT_HAND'):
        {
            //play rps
        }
        break;
    case ('STOC_HAND_RESULT'):
        {
            //rps result
        }
        break;
    case ('STOC_CHANGE_SIDE'):
        {
            //side decking
        }
        break;
    case ('STOC_WAITING_SIDE'):
        {
            //waiting on side decking.
        }
        break;
    case ('STOC_CREATE_GAME'):
        {

        }
        break;
    case ('STOC_TYPE_CHANGE'):
        {

        }
        break;
    case ('STOC_JOIN_GAME'):
        {
            //Player requesting to join room.
            //var version = packet.message[0] + packet.message[1];
            //var roomname = packet.message.toString('utf16le', 8, 52);
            ////console.log(packet.message.toString('utf16le'));
            ////console.log('version:', '0x' + parseInt(version, 16), 'roomname:', roomname);
            ////console.log('gamestring',hostString, '')




        }
        break;
    case ('STOC_LEAVE_GAME'):
        {
            //name of player that just left the duel.
            intro = packet.message.toString('utf16le');
            //console.log(intro, intro.length);
        }
        break;
    case ('STOC_DUEL_START'):
        {
            //Game started
            todo.STOC_DUEL_START = true;
        }
        break;

    case ('STOC_REPLAY'):
        {
            // catch this packet and do ranking on it.
            todo.STOC_REPLAY = true;
        }
        break;
    case ('STOC_TIME_LIMIT'):
        {
            // User went over time.
            return false;
        }
        break;
    case ('STOC_CHAT'):
        {
            // A user said something, we should record this.
            return 'chat';
        }
        break;
    case ('STOC_HS_PLAYER_ENTER'):
        {
            //name of player that just entered the duel.
            intro = packet.message.toString('utf16le');
            //console.log('player enter', intro, intro.length);

        }
        break;
    case ('STOC_HS_PLAYER_CHANGE'):
        {
            //A player swaped places
            //gamelist is done here
            //console.log('packet length %l', packet.LENGTH);
            //console.log('packet message %l', packet.message);
            //console.log('packet message', parseInt(packet.message[0]), packet.message[0]);
            //console.log('packet message', parseInt(packet.message[1]), packet.message[1]);
            return 'player swap';
        }
        break;
    case ('STOC_HS_WATCH_CHANGE'):
        {
            //A player is no longer dueling and is instead watching.
            //console.log('packet length %l', packet.LENGTH);
            //console.log('packet message %l', packet.message);
            //console.log('packet message', parseInt(packet.message[0]), packet.message[0]);
            //console.log('packet message', parseInt(packet.message[1]), packet.message[1]);
        }
        break;
    case ('STOC_TYPE_CHANGE'):
        {
            //A player is no longer dueling and is instead watching.
            //console.log('packet length %l', packet.LENGTH);
            //console.log('packet message %l', packet.message);
            //console.log('packet message', parseInt(packet.message[0]), packet.message[0]);
            //console.log('packet message', parseInt(packet.message[1]), packet.message[1]);

        }
        break;
    }

}

var server = http.createServer().listen(5000);
var primus = new Primus(server, {
    parser: 'JSON'
});
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
primus.on('disconnection', function (spark) {
    // the spark that disconnected
});