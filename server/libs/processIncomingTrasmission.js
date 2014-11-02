/* jshint node : true */

module.exports = processIncomingTrasmission;
var fs = require('fs');
var childProcess = require('child_process');
var net = require('net');
var parsePackets = require('./parsepackets.js');
var recieveCTOS = require('./recieveCTOS');
var recieveSTOC = require('./recieveSTOC.js');
var killCore = require('./killcore.js');

var gamelist = {};
var servercallback;

function processIncomingTrasmission(data, socket, input, callback) {
    gamelist = input;
    servercallback = callback;

    //console.log(socket.hostString);
    if (socket.active_ygocore) {
        socket.active_ygocore.write(data);
        // eventing shifted server wont overload due to constant dueling.
    }
    var task = parsePackets('CTOS', data);
    processTask(task, socket);

    //console.log(socket.hostString);
    if (socket.active) {
        if (gamelist[socket.hostString] && !socket.active_ygocore) {
            connectToCore(gamelist[socket.hostString].port, data, socket);
            console.log(socket.username + ' connecting to existing core');
            gamelist[socket.hostString].players.push(socket.username);
        } else if (!gamelist[socket.hostString] && !socket.active_ygocore) {
            //console.log(socket.username + ' connecting to new core');
            portfinder(7000, 9001, function (error, port) {
                startCore(port, socket, data);
            });
        }
    }
    console.log('process complete', gamelist);
    return gamelist;
}

function processTask(task, socket) {
    task = (function () {
        var output = [];
        for (var i = 0; task.length > i; i++) {
            output.push(recieveCTOS(task[i], socket.username, socket.hostString));
        }
        return output;
    })();
    for (var i = 0; task.length > i; i++) {
        if (task[i].CTOS_JOIN_GAME) {
            socket.active = true;
            socket.hostString = task[i].CTOS_JOIN_GAME;
            //console.log(task);
        }
        if (task[i].CTOS_PLAYER_INFO) {
            socket.username = task[i].CTOS_PLAYER_INFO;
        }
    }
}


function createDateString(dateObject) {
    return "[" + dateObject.getHours() + ":" + dateObject.getMinutes() + "]";
}

function startCore(port, socket, data, callback) {
    console.log(socket.hostString);
    fs.exists(__dirname + '/../ygocore/YGOServer.exe', function (exist) {
        if (!exist) {
            console.log('core not found at ' + __dirname + '/' + '../ygocore');
            return;
        }
        //console.log('connecting to new core @', port);
        //console.log('found port ', port);
        var configfile = pickCoreConfig(socket);
        var params = port + ' ' + configfile;
        var currentDate = new Date();
        console.log(createDateString(currentDate) +
            ' initiating core for ' + socket.username + ' on port:' + port + ' with: ' + configfile);
        socket.core = childProcess.spawn(__dirname + '/../ygocore/YGOServer.exe', [port, configfile], {
            cwd: __dirname + '/../ygocore'
        }, function (error, stdout, stderr) {
            console.log(createDateString(currentDate) + ' CORE Terminated', error, stderr, stdout);
        });
        socket.core.stdout.on('error', function (error) {
            servercallback('kill', gamelist);
            console.log(createDateString(currentDate) + ' core error', error);
        });
        socket.core.stdout.on('data', function (core_message_raw) {
            handleCoreMessage(core_message_raw, port, socket, data);
        });

    });
}

function handleCoreMessage(core_message_raw, port, socket, data) {
    var core_message_txt = core_message_raw.toString();
    console.log(core_message_txt);
    if (core_message_txt.substring(0, 4) !== '::::') {
        return;
    }
    var core_message = core_message_txt.split('|');
    switch (core_message[0]) {
    case ('::::network-ready'):
        {
            connectToCore(port, data, socket);
            gamelist[socket.hostString] = {
                port: port,
                players: [null, null, null, null],
                locked: [false, false, false, false],
                started: false,
                spectators: 0
            };
            console.log(gamelist, 'activepoint');
        }
        break;
    case ('::::network-end'):
        {
            servercallback('kill', gamelist);
        }
        break;
    case ('::::join-slot'):
        {
            var join_slot = parseInt(core_message[2], 10);
            if (join_slot === -1) {
                return;
            }
            gamelist[core_message[1]].players[join_slot] = core_message[3];
            servercallback('update', gamelist);
        }
        break;
    case ('::::leave-slot'):
        {
            var leave_slot = parseInt(core_message[2], 10);
            if (leave_slot === -1) {
                return;
            }
            gamelist[core_message[1]].players[leave_slot] = null;
            servercallback('update', gamelist);
        }
        break;
    case ('::::spectator'):
        {
            gamelist[core_message[1]].spectators = parseInt(core_message[2], 10);
            servercallback('update', gamelist);

        }
        break;
    case ('::::lock-slot'):
        {
            var lock_slot = parseInt(core_message[2], 10);
            gamelist[core_message[1]].lock[lock_slot] = Boolean(core_message[2]);
            servercallback('update', gamelist);
        }
        break;
    case ('::::endduel'):
        {
            //do ranking here
            servercallback('kill', gamelist);
        }
        break;
    case ('::::startduel'):
        {
            gamelist[socket.hostString].started = true;
            servercallback('update', gamelist);
        }
        break;
    case ('::::chat'):
        {
            var msg = socket.hostString + ':' + core_message_raw.toString();
            //fs.appendFile(socket.hostString'-message.txt', msg, function (error) {

            //});         
        }
        break;
    }
}

function pickCoreConfig(socket) {
    if (socket.hostString[0] === '0' || //OCG
        socket.hostString[0] === '1' || //TCG
        socket.hostString[0] === '2') { //TCG/OCG : Sim format
        return '' + socket.hostString[0] + '-config.txt';
    } else {
        /*load default configuration */
        return 'config.txt';
    }
}

function connectToCore(port, data, socket, callback) {
    socket.active_ygocore = net.connect(port, '127.0.0.1', function () {
        socket.active_ygocore.write(data);
        servercallback('update', gamelist);
        socket.active = false;
        socket.active_ygocore.on('data', function (core_data) {
            var task = parsePackets('STOC', data);
            task = (function () {
                var output = [];
                for (var i = 0; task.length > i; i++) {
                    output.push(recieveSTOC(task[i], socket.hostString));
                }
                return output;
            })();
            socket.write(core_data);
            if (callback) {
                callback(true);
            }
        });
        socket.active_ygocore.on('error', function (error) {
            servercallback('kill', gamelist);
            console.log(error);
        });
        socket.active_ygocore.on('close', function () {
            servercallback('kill', gamelist);
        });
    });
}

function portfinder(min, max, callback) {
    console.log(gamelist);
    var activerooms = [];
    for (var rooms in gamelist) {
        if (gamelist.hasOwnProperty(rooms)) {
            activerooms.push(gamelist[rooms].port);
        }
    }
    for (var i = min; max > i; i++) {
        if (activerooms.indexOf(i) === -1) {
            callback(null, i);
            return;
        }
    }
}