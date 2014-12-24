/*jslint  node: true, plusplus: true, white: false*/
/*
Start various sub-servers.
--------------------------
- Gamelist on port 24555
- YGOPro listener on port 8911, YGOPro applications connect to this port
- YGOPro Web listener on port 8913, browser version connects to this port,
  and is stripped and routed to the same place as the application.
- HTTP server running static files out of port 80
*/

//Title
console.log('YGOPro Salvation Server - Saving Yu-Gi-Oh!');
process.title = 'Salvation';

(function () {
    /* Salvation Server Main Process
- This script starts the main server side program and maintains all subprocesses.
*/
    'use strict';

    //buit ins
    var net = require('net'),
        http = require('http'),
        cluster = require('cluster'),
        numCPUs = require('os').cpus().length,


        //from npm, run 'npm install', and keep project.json upto date.
        staticserv = require('node-static'),
        WebSocketServer = require('ws').Server,

        //from the project itself.
        ircManager = require('./libs/ircbot.js'),
        gamelistManager = require('./libs/gamelist.js'),
        processIncomingTrasmission = require('./libs/processIncomingTrasmission.js');


    (function establishCluster() {
        var ygoserver,
            httpServer,
            clusterIterator = 0;

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
            for (clusterIterator; clusterIterator < numCPUs; clusterIterator = clusterIterator++) {
                setupWorker();
            }
            cluster.on('exit', function (worker, code, signal) {
                console.log('worker ' + worker.process.pid + ' died/r/n' +
                    code, signal);
                cluster.fork();
            });
            //exiting master process
        } else {
            //listen on 80, main http server is clustered.
            httpServer = new staticserv.Server('./http');

            http.createServer(function (request, response) {
                request.addListener('end', function () {
                    httpServer.serve(request, response);
                }).resume();
            }).listen(80);


            // When a user connects, create an instance and allow the to duel, clean up after.
            ygoserver = net.createServer(function (socket) {
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
        } // end cluster split
    }()); // end cluster setup
}()); // end main