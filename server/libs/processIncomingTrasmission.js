/* jshint node : true */

module.exports = processIncomingTrasmission;
var fs = require('fs');
var childProcess = require('child_process');
var net = require('net');
var parsePackets = require('./parsepackets.js');
var recieveCTOS = require('./recieveCTOS');
var recieveSTOC = require('./recieveSTOC.js');
var gamelist = {};

process.on('message',function(message){
    if (message.messagetype === 'gamelist'){
        gamelist = message.gamelist;
    }
});

var portmin = 23500;

function processIncomingTrasmission(data, socket) {
    if (socket.active_ygocore) {
        //console.log('-->');
        socket.active_ygocore.write(data);
        // eventing shifted server wont overload due to constant dueling.
        return true;
    }
    var task = parsePackets('CTOS', data);
    processTask(task, socket);

    //console.log(socket.hostString);
    if (!socket.active_ygocore) {
        try {
            console.log('[' + new Date().getHours() + ':' + new Date().getMinutes() + ']', socket.username, socket.hostString);
        } catch (error) {
            console.log(new Date(), socket.username, socket.hostString, 'not on gamelist');
        }
        if (gamelist[socket.hostString] && !socket.active_ygocore) {
            socket.alpha = false;
            connectToCore(gamelist[socket.hostString].port, data, socket);
            //console.log(socket.username + ' connecting to existing core');

        } else if (!gamelist[socket.hostString] && !socket.active_ygocore) {
            //console.log(socket.username + ' connecting to new core');
            portfinder(++portmin, 27000, function (error, port) {
                socket.alpha = true;
                startCore(port, socket, data);
            });
        }
    }
    //console.log('process complete', gamelist);
    if (portmin === 27000) {
        portmin = 23500;
    }
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
    //console.log(socket.hostString);
    fs.exists(__dirname + '/../ygocore/YGOServer.exe', function (exist) {
        if (!exist) {
            //console.log('core not found at ' + __dirname + '/' + '../ygocore');
            return;
        }
        //console.log('connecting to new core @', port);
        //console.log('found port ', port);
        var configfile = pickCoreConfig(socket);
        var params = port + ' ' + configfile;
        var currentDate = new Date();
        //console.log(createDateString(currentDate) +
        // ' initiating core for ' + socket.username + ' on port:' + port + ' with: ' + configfile);
        socket.core = childProcess.spawn(__dirname + '/../ygocore/YGOServer.exe', [port, configfile], {
            cwd: __dirname + '/../ygocore'
        }, function (error, stdout, stderr) {
            //console.log(createDateString(currentDate) + ' CORE Terminated', error, stderr, stdout);
        });
        socket.core.stdout.on('error', function (error) {
            
        });
        socket.core.stdout.on('data', function (core_message_raw) {
            handleCoreMessage(core_message_raw, port, socket, data);
        });

    });
}

function handleCoreMessage(core_message_raw, port, data, socket) {
    var core_message_txt = core_message_raw.toString();
    //console.log(core_message_txt);
    if (core_message_txt.indexOf("::::") < 0) {
        return;
    }
    var core_message = core_message_txt.split('|');
    //console.log(core_message);
    core_message[0] = core_message[0].trim();
    if (core_message[0] === '::::network-ready') {
        connectToCore(port, data, socket);
    } else {
        process.send(core_message_raw);
    }
}


function pickCoreConfig(socket) {
    if (socket.hostString[0] === '0' || //OCG
        socket.hostString[0] === '1' || //TCG
        socket.hostString[0] === '2' || //TCG/OCG : Sim format
        socket.hostString[0] === 'c') { //Chibimode : Sim format
        return '' + socket.hostString[0] + '-config.txt';
    } else {
        /*load default configuration */
        return 'config.txt';
    }
}

function connectToCore(port, data, socket) {
    //console.log('attempting link up');
    socket.active_ygocore = net.connect(port, '127.0.0.1', function () {
        socket.active_ygocore.setNoDelay(true);
        //console.log('linkup established');
        socket.active_ygocore.write(data);
        //console.log('-->');
        socket.active = false;
        socket.active_ygocore.on('data', function (core_data) {
            socket.write(core_data);
            //console.log('<--',core_data.toString());
        });
        socket.active_ygocore.on('error', function (error) {
           
        });
        socket.active_ygocore.on('close', function () {
            
        });
    });
    socket.on('close', function () {
        socket.active_ygocore.destroy();
    });
    socket.on('error', function () {
        socket.active_ygocore.destroy();
    });
}

function portfinder(min, max, callback) {
    //console.log(gamelist);
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