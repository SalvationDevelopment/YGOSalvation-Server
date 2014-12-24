/*
Start various sub-servers.
--------------------------
- Gamelist on port 24555
- YGOPro listener on port 8911, YGOPro applications connect to this port
- YGOPro Web listener on port 8913, browser version connects to this port, 
  and is stripped and routed to the same place as the application. *disabled
- HTTP server running static files out of port 80
- IRC bot connects to #lobby, is named MagiMagiGal

Installation
------------
Run `npm install` in the directory above.
*/

/*jslint  node: true, plusplus: true, white: false*/
(function main() {
    'use strict';
    console.log('YGOPro Salvation Server - Saving Yu-Gi-Oh!');
    process.title = 'YGOPro Salvation Server';
    var ygoserver, //port 8911 ygopro Server
        httpServer, // http://ygopro.us
        ircManager, // magimagigal
        numCPUs = 1, // atleast 1 slave and 1 master.
        notification = '', // its a string, make memory.
        clusterIterator = 0, // its a number make memory
        net = require('net'),
        http = require('http'),
        cluster = require('cluster'),
        staticserv = require('node-static'),
        //WebSocketServer = require('ws').Server,
        gamelistManager = require('./libs/gamelist.js'),
        processIncomingTrasmission = require('./libs/processIncomingTrasmission.js');

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
    if (require('os').cpus().length > 1) {
        numCPUs = require('os').cpus().length;
    }
    if (cluster.isMaster) {
        ircManager = require('./libs/ircbot.js');
        for (clusterIterator; clusterIterator < numCPUs; clusterIterator++) {
            setupWorker();
        }
        cluster.on('exit', function (worker, code, signal) {
            notification = 'worker ' + worker.process.pid + ' died ' + code + ' ' + signal;
            ircManager.notify(notification);
            console.log(notification);
            setupWorker();
        });
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
                socket.end(); //Security precaution
            });
        });
        ygoserver.listen(8911);
    } // end cluster split
}()); // end main