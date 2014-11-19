/* jslint node : true */
console.log('YGOPro US Server (Salvation) - Saving Yu-Gi-Oh!'); //Title
process.title = 'Salvation';

// load modules built into Node.js
var net = require('net');
var http = require('http');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var spawn = require('child_process').spawn;

//load modules pulled down from NPM, externals
//if you dont run `npm install` these requires will fail.
var gith = require('gith');
var Primus = require('primus');
var Rooms = require('primus-rooms');
var static = require('node-static');
var WebSocketServer = require('ws').Server;

//load modules that are an internal part of the application
var processIncomingTrasmission = require('./libs/processIncomingTrasmission.js');
var killCore = require('./libs/killcore.js');
var gamelist = {};

/*
Start various sub-servers.
--------------------------
- Gamelist on port 5000
- YGOPro listener on port 8911, YGOPro applications connect to this port
- YGOPro Web listener on port 8913, browser version connects to this port,
  and is stripped and routed to the same place as the application.
- HTTP server running static files out of port 8080
- Githooks listener on port 4901. Self updating system.
*/

var ygoserver; //listen(8911);
var serverGITHUB = gith.create(4901);
var serverWS = http.createServer().listen(5000);
var serverHTTP = new static.Server('./http',{ gzip: true });

var serverWSProxy = new WebSocketServer({
    port: 8913
});



var primus = new Primus(serverWS, {
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

// When a user connects, create an instance and allow the to duel, clean up after.
var ygoserver = net.createServer(function (socket) {
    socket.active_ygocore = false;
    socket.active = false;
    socket.on('data', function (data) {
        gamelist = processIncomingTrasmission(data, socket, gamelist, function (command, newlist) {
            if (command === 'update') {
                primus.room('activegames').write(JSON.stringify(newlist));
                gamelist = newlist;
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

// When a user connects via websockets, create an instance and allow the to duel, clean up after.
serverWSProxy.on('connection', function (socket) {
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

if (cluster.isMaster) {
    //When http://gitub.com/salvationdevelopment contacts you, update the current git.
    //We want to limit this to just the master cluster.
    serverGITHUB({
        owner: 'salvationdevelopment'
    }).on('all', function (payload) {
        var updateinstance = spawn('git', ['pull']);
        updateinstance.on('close', function preformupdate() {
            spawn('node', ['update.js'], {
                cwd: './http'
            });
        });
    });
    
    /*
    Static file server:
    Via nginx /server/http/ is routed to http://ygopro.us/
    */
    http.createServer(function (request, response) {
        request.addListener('end', function () {
            serverHTTP.serve(request, response);
        }).resume();
    }).listen(8080);
}