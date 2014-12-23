/* jslint node : true */
/* Salvation Server Main Process
- This script starts the main server side program and maintains all subprocesses.
*/
(function () {;
    console.log('YGOPro Salvation Server - Saving Yu-Gi-Oh!'); //Title
    process.title = 'Salvation';

    // load modules built into Node.js
    var net = require('net');
    var http = require('http');
    var cluster = require('cluster');
    var numCPUs = require('os').cpus().length;
    var spawn = require('child_process').spawn;
    var fs = require('fs');

    /*
Load modules pulled down from NPM, externals
if you dont run `npm install` these requires will fail.
Everything here, and more should be in the package.json one directory
level above this one.
*/
    var gith = require('gith');

    var static = require('node-static');
    var WebSocketServer = require('ws').Server;

    //load modules that are an internal part of the application
    var ircManager = require('./libs/ircbot.js');
    var gamelistManager = require('./libs/gamelist.js');
    var processIncomingTrasmission = require('./libs/processIncomingTrasmission.js');



    // error handling and cleanup function. Makes sure the server doesnt crash like the way DevPro does.

    /*
Start various sub-servers.
--------------------------
- Gamelist on port 24555
- YGOPro listener on port 8911, YGOPro applications connect to this port
- YGOPro Web listener on port 8913, browser version connects to this port,
  and is stripped and routed to the same place as the application.
- HTTP server running static files out of port 80
- Githooks listener on port 4901. Self updating system.
*/

    function setupWorker() {
        var worker = cluster.fork();
        worker.on('message', function () {
            var gamelist = gamelistManager();
            worker.send({
                messagetype: gamelist,
                gamelist: gamelist
            });
        });
    }

    if (cluster.isMaster) {
        for (var i = 0; i < numCPUs; i++) {
            setupWorker();
        }
        cluster.on('exit', function (worker, code, signal) {
            console.log('worker ' + worker.process.pid + ' died');
            cluster.fork();
        });
        //process is suppose to do.
        var githubServer = gith.create(4901);


        //When http://gitub.com/salvationdevelopment contacts you, update the current git.
        //We want to limit this to just the master cluster.
        githubServer({
            owner: 'SalvationDevelopment'
        }).on('all', function (payload) {
            var updateinstance = spawn('git', ['pull']);
            updateinstance.on('close', function preformupdate() {
                spawn('node', ['update.js'], {
                    cwd: './http'
                });
            });
        });

        //deal with gamelist updates


    } else {
        var ygoserver; //listen(8911);

        /*
    Static file server:
    Via nginx /server/http/ is routed to http://ygopro.us/
    */
        var httpServer = new static.Server('./http'); //main http server is clustered.
        http.createServer(function (request, response) {
            request.addListener('end', function () {
                httpServer.serve(request, response);
            }).resume();
        }).listen(80);


        // When a user connects, create an instance and allow the to duel, clean up after.
        var ygoserver = net.createServer(function (socket) {
            socket.setNoDelay(true);
            socket.active_ygocore = false;
            socket.active = false;
            socket.on('data', function (data) {
                processIncomingTrasmission(data, socket, data);

            });
            socket.on('close', function () {
                //nothing needed.
            });
            socket.on('error', function () {
                //nothing needed
            });
            socket.setTimeout(300000, function () {
                socket.end();
            });
        });
        ygoserver.listen(8911);


    }
}());