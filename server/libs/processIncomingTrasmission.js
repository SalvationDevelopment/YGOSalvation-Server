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
var primus;

function processIncomingTrasmission(data, socket, input, instance) {
    gamelist = input;
    instance = primus;
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
            portfinder(7000, 9001, gamelist, function (error, port) {
                startCore(port, socket, data);
            });
        }
    }
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
        if (task[i].CTOS_HS_TODUELIST) {
            gamelist[socket.hostString].players.push(socket.username);
            primus.room('activegames').write(JSON.stringify(gamelist));
        }
        if (task[i].CTOS_HS_TOOBSERVER || task[i].CTOS_LEAVE_GAME) {
            gamelist[socket.hostString].players.splice(gamelist[socket.hostString].players.indexOf(socket.username), 1);
            primus.room('activegames').write(JSON.stringify(gamelist));
        }
        if (task[i].CTOS_HS_START) {
            gamelist[socket.hostString].started = true;
            primus.room('activegames').write(JSON.stringify(gamelist));
        }
    }
}


function createDateString(dateObject) {
    return "[" + dateObject.getHours() + ":" + dateObject.getMinutes() + "]";
}

function startCore(port, socket, data, callback) {
    console.log(__dirname)
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
        console.log(createDateString(currentDate) + ' initiating core for ' + socket.username + ' on port:' + port + ' with: ' + configfile);
        socket.core = childProcess.spawn(__dirname + '/../ygocore/YGOServer.exe', [port, configfile], {
            cwd: __dirname + '/../ygocore'
        }, function (error, stdout, stderr) {
            console.log(createDateString(currentDate) + ' CORE Terminated', error, stderr, stdout);
        });
        socket.core.stdout.on('error', function (error) {
            killCore(socket, gamelist, primus);
            console.log(createDateString(currentDate) + ' core error', error);
        });
        socket.core.stdout.on('data', function (core_message) {
            core_message = core_message.toString();
            console.log(createDateString(currentDate) + ' ' + port + ': Core Message: ', core_message);
            if (core_message.indexOf('Start') > -1) {
                connectToCore(port, data, socket);
                gamelist[socket.hostString] = {
                    port: port,
                    players: [socket.username],
                    started: false
                };
                primus.room('activegames').write(JSON.stringify(gamelist));
                if (callback) {
                    callback(true);
                }
            } else if (core_message.indexOf('End') > -1) {
                killCore(socket, gamelist, primus);
            }
        });

    });
}

function pickCoreConfig(socket) {
    if (socket.hostString[0] === '0' || //OCG
        socket.hostString[0] === '1' || //TCG
        socket.hostString[0] === '2') { //TCG/OCG
        return '' + socket.hostString[0] + '-config.txt';
    } else {
        /*load default configuration */
        return 'config.txt';
    }
}

function connectToCore(port, data, socket, callback) {
    socket.active_ygocore = net.connect(port, '127.0.0.1', function () {
        socket.active_ygocore.write(data);
        primus.room('activegames').write(JSON.stringify(gamelist));
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
            killCore(socket, gamelist, primus);
            console.log(error);
        });
        socket.active_ygocore.on('close', function () {
            killCore(socket, gamelist, primus);
        });
    });
}

function portfinder(min, max, gamelist, callback) {
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