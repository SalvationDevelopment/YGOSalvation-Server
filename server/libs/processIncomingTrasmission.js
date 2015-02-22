/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
var portmin = 30000 + process.env.PORTRANGE * 100,
    portmax = (30000 + process.env.PORTRANGE * 100) + 100,
    handleCoreMessage,
    startDirectory = __dirname,
    fs = require('fs'),
    childProcess = require('child_process'),
    net = require('net'),
    cluster = require('cluster'),
    parsePackets = require('./parsepackets.js'),
    recieveCTOS = require('./recieveCTOS'),
    recieveSTOC = require('./recieveSTOC.js'),
    createDateString = require('./datetimestamp.js'),
    custom_error = require('./custom_error.js'),
    gamelist = {};

if (cluster.isWorker) {
    process.on('message', function (message) {
        'use strict';
        if (message.gamelist) {
            gamelist = message.gamelist;
        }
    });
}

function processTask(task, socket) {
    'use strict';
    var i = 0,
        l = 0,
        output = [];
    for (i; task.length > i; i++) {
        output.push(recieveCTOS(task[i], socket.username, socket.hostString));
    }

    for (l; output.length > l; l++) {
        if (output[l].CTOS_JOIN_GAME) {
            socket.active = true;
            socket.hostString = output[l].CTOS_JOIN_GAME;
            //console.log(task);
        }
        if (output[l].CTOS_PLAYER_INFO) {
            socket.username = output[l].CTOS_PLAYER_INFO;
            //console.log(task);
        }
    }
}

function connectToCore(port, data, socket) {
    //console.log('attempting link up');
    'use strict';

    socket.active_ygocore = net.connect(port, '127.0.0.1', function () {
        socket.active_ygocore.setNoDelay(true);
        //console.log('linkup established');
        socket.active_ygocore.write(data);
        //console.log('-->', data.toString());
        socket.active = false;
        socket.active_ygocore.on('data', function (core_data) {
            socket.write(core_data);
            //console.log('<--',core_data.toString());
        });

        socket.on('close', function () {
            if (socket.active_ygocore) {
                socket.active_ygocore.end();
            }
        });
        socket.on('error', function (error) {
            console.log('::CLIENT', error);
            socket.active_ygocore.end();
        });
    });
    socket.active_ygocore.on('error', function (error) {
        console.log('::CORE', error);
        if (socket.alpha) {
            handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data);
        }
        socket.end();
    });
    socket.active_ygocore.on('close', function () {
        if (socket.alpha) {
            handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data);
        }
        socket.end();
    });

}

function portfinder(min, max, callback) {
    'use strict';
    //console.log(gamelist);
    var rooms,
        activerooms = [],
        i = min;
    for (rooms in gamelist) {
        if (gamelist.hasOwnProperty(rooms)) {
            activerooms.push(gamelist[rooms].port);
        }
    }
    for (i; max > i; i++) {
        if (activerooms.indexOf(i) === -1) {
            callback(null, i);
            return;
        }
    }
}

function pickCoreConfig(socket) {
    'use strict';
    var output = '';
    if (socket.hostString[0] > '2') {
        return output + socket.hostString[0] + '-config.txt';
    } else {
        /*load default configuration */
        return 'config.txt';
    }
}

function handleCoreMessage(core_message_raw, port, socket, data) {
    'use strict';
    if (core_message_raw.toString().indexOf("::::") < 0) {
        return;
    }
    var core_message = core_message_raw.toString().split('|'),
        gamelistmessage = {
            messagetype: 'coreMessage',
            coreMessage: {
                core_message_raw: core_message_raw.toString(),
                port: port
            }
        };
    if (core_message[0].trim() === '::::network-ready') {
        connectToCore(port, data, socket);
    }
    if (core_message[0].trim() === '::::end-duel') {
        socket.core.kill();
    }
    console.log(socket.remoteAddress, core_message.toString());
    process.send(gamelistmessage);
}




function startCore(port, socket, data, callback) {
    //console.log(socket.hostString);
    'use strict';
    fs.exists(startDirectory + '../../ygocore/YGOServer.exe', function (exist) {
        if (!exist) {
            console.log('core not found at ' + __dirname + '/../ygocore/YGOServer.exe');
            return;
        }

        var configfile = pickCoreConfig(socket),
            params = port + ' ' + configfile;
        custom_error(console.log(' initiating core for ' + socket.username + ' on port:' + port + ' with: ' + configfile));
        socket.core = childProcess.spawn(startDirectory + '/../ygocore/YGOServer.exe', [port, configfile], {
            cwd: startDirectory + '/../ygocore'
        }, function (error, stdout, stderr) {
            console.log(error, stdout, stderr);
            handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data);
        });
        socket.core.stdout.on('error', function (error) {
            console.log(error);
            handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data);
            socket.core.kill();
        });
        socket.core.stdout.on('data', function (core_message_raw) {
            handleCoreMessage(core_message_raw, port, socket, data);
        });

    });
}



function processIncomingTrasmission(data, socket, task) {
    'use strict';
    processTask(task, socket);
    if (!socket.active_ygocore && socket.hostString) {
        if (gamelist[socket.hostString]) {
            socket.alpha = false;
            connectToCore(gamelist[socket.hostString].port, data, socket);
            console.log(socket.username + ' connecting to existing core');
        } else {
            console.log(socket.username + ' connecting to new core');

            portfinder(++portmin, portmax, function (error, port) {
                socket.alpha = true;
                startCore(port, socket, data);
            });
        }
    }
    //console.log('process complete', gamelist);
    if (portmin === portmax) {
        portmin = 30000 + process.env.PORTRANGE * 100;
    }
}

module.exports = processIncomingTrasmission;