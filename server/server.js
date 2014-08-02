/* jslint node : true */
//process.on('uncaughtException', function (error) {
//    console.log('Caught exception: ' + error);
//});
console.log('Salvation Development YGOPro Server');
try {
    require('httpsys').slipStream();
} catch (error) {
    console.log('Windows 8+ spefic enhancements not enabled.');
}

var gamelist = {};
var net = require('net');
var processIncomingTrasmission = require('./libs/processIncomingTrasmission.js');
var killCore = require('./libs/killcore.js');
var Primus = require('primus');
var Rooms = require('primus-rooms');
var http = require('http');
var server = http.createServer().listen(5000);
var primus = new Primus(server, {
    parser: 'JSON'
});


primus.use('rooms', Rooms);
primus.on('connection', function (socket) {
    socket.on('data', function (data) {
        data = data || {};
        var action = data.action;
        switch (action) {
        case ('join'):
            {
                socket.join('activegames', function () {
                    socket.write(JSON.stringify(gamelist));
                });
            }
            break;
        case ('leave'):
            {
                socket.leave('activegames');
            }
            break;
        default:
            {
                console.log(data);
            }
        }
    });
});
primus.on('disconnection', function (socket) {
    killCore(socket, gamelist, primus); // allow reconnection?
});
primus.on('error', function (socket) {
    killCore(socket, gamelist, primus); // allow reconncetion?
});

var ygoserver = net.createServer(function (socket) {
    socket.active_ygocore = false;
    socket.active = false;
    socket.on('data', function (data) {
        gamelist = processIncomingTrasmission(data, socket, gamelist, function (command, newlist) {
            if (command === 'update') {
                primus.room('activegames').write(JSON.stringify(newlist));
            }
            if (command === 'kill') {
                killCore(socket, newlist, primus);
            }
        });
    });
    socket.on('close', function () {
        killCore(socket, gamelist, primus);
    });
    socket.on('error', function () {
        killCore(socket, gamelist, primus);
    });
});
ygoserver.listen(8911);

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
    port: 8913
});

wss.on('connection', function (socket) {
    socket.active_ygocore = false;
    socket.active = false;
    socket.write = function (data) {
        socket.send(data, {
            binary: true,
            mask: true
        });
    };
    socket.on('message', function (data) {
        gamelist = processIncomingTrasmission(data, socket, gamelist, primus);
    });
    socket.on('close', function () {
        killCore(socket, gamelist, primus);
    });
    socket.on('error', function () {
        killCore(socket, gamelist, primus);
    });
});