/*jslint node:true, plusplus:true*/
'use strict';
/* todo
- start ygopro with known game id
- add game id to file
- start server when ready to start recording
- see if it works

to check
- error handling
- routing for recalling the file
- failing properly when the file doesnt exist
- commas in room names might be dangerous
- pull names of duelist off data
- change recording and playback to use streams, flawed otherwise
*/

var net = require('net'),
    fs = require('fs'),
    recieveCTOS = require('./recieveCTOS'),
    Framemaker = require('./parseframes.js'),
    Socket = require('primus').createSocket({
        iknowclusterwillbreakconnections: true
    }),
    client;

function ctos_PlayerInfo(message) {
    var ctos = new Buffer([0x10]),
        name = Array.apply(null, new Array(40)).map(Number.prototype.valueOf, 0),
        username = new Buffer(message, 'utf16le'),
        usernamef = new Buffer(name),
        x = username.copy(usernamef),
        len = usernamef.length + 1,
        proto = new Buffer(2);
    proto.writeUInt16LE(len, 0);
    proto = Buffer.concat([proto, ctos, usernamef]);
    //console.log(proto);
    return proto;
}

function ctos_JoinGame(roompass) {
    var ctos = new Buffer([0x12]),
        name = Array.apply(null, new Array(60)).map(Number.prototype.valueOf, 0),
        version = new Buffer([0x38, 0x13]),
        gameid = new Buffer([75, 144, 0, 0, 0, 0]),
        pass = new Buffer(roompass, 'utf16le'),
        rpass = new Buffer(name),
        x = pass.copy(rpass),
        len = ctos.length + version.length + gameid.length + 60,
        proto = new Buffer(2);
    //unknownDataStructure = new Buffer([0,0,0,0,254,255,255,255,230,110,238,118]);
    proto.writeUInt16LE(len, 0);

    proto = Buffer.concat([proto, ctos, version, gameid, rpass]);
    //console.log(proto);
    //console.log(rpass.toString('utf16le'));
    return proto;

}

function record(subject) {
    if (!subject.record) {
        return;
    }
    var port = subject.port,
        roompass = subject.roompass,
        toSend = Buffer.concat([ctos_PlayerInfo('Recorder'), ctos_JoinGame(roompass)]),
        duel = new Buffer(),
        socket = net.createConnection(port, '127.0.0.1');

    console.log('Socket created.');
    socket.on('data', function (data) {
        duel = Buffer.concat(duel, data);
    }).on('connect', function () {
        socket.write(toSend);
    }).on('end', function () {
        fs.write(roompass, duel, function () {

        });
    });
}

function processTask(task, socket) {

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
        }
        if (output[l].CTOS_PLAYER_INFO) {
            socket.username = output[l].CTOS_PLAYER_INFO;
        }
    }
}


function processIncomingTrasmission(data, socket, task) {
    processTask(task, socket);
    if (socket.hostString) {
        if (fs.exist(socket.hostString)) {
            fs.readFile(socket.hostString, function callback(errorMSG, data) {
                if (errorMSG) {
                    return;
                } else {
                    socket.write(data);
                    socket.close();
                }

            });
        }
    }
    return data;
}
net.createServer(function (socket) {
    var parsePackets = require('./parsepackets.js'),
        framer = new Framemaker();

    socket.setNoDelay(true);
    socket.active_ygocore = false;
    socket.active = false;
    socket.on('data', function listener(data) {
        var frame,
            task,
            newframes = 0;
        if (socket.active_ygocore) {
            socket.active_ygocore.write(data);
        }
        frame = framer.input(data);
        for (newframes; frame.length > newframes; newframes++) {
            task = parsePackets('CTOS', new Buffer(frame[newframes]));
            processIncomingTrasmission(data, socket, task);
        }
        frame = [];

    });
}).listen(1198, '127.0.0.1');


function onConnectGamelist() {
    console.log('    Updater connected to internals');
    client.write({
        action: 'internalServerLogin',
        password: process.env.OPERPASS,
        gamelist: false,
        registry: false
    });
}


function onCloseGamelist() {

}

setTimeout(function () {
    client = new Socket('ws://127.0.0.1:24555'); //Internal server communications.
    client.on('data', record);
    client.on('open', onConnectGamelist);
    client.on('close', onCloseGamelist);
}, 5000);


require('fs').watch(__filename, process.exit);

//record('known game id')