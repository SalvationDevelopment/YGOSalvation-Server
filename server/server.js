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
    var ygoserver, //port 8911 ygopro Server
        staticserv, // static http processor
        httpServer, // http://ygopro.us
        ircManager, // magimagigal
        numCPUs = 1, // atleast 1 slave and 1 master.
        notification = '', // its a string, make memory.
        gamelistManager, // primus and gamelist
        clusterIterator = 0, // its a number make memory
        net = require('net'),
        http = require('http'),
        cluster = require('cluster'),

        //WebSocketServer = require('ws').Server,
        processIncomingTrasmission = require('./libs/processIncomingTrasmission.js');

    function setupWorker(x) {
        console.log('        Starting Slave ' + x);
        var worker = cluster.fork();
        worker.on('message', function (message) {
            if (message.messagetype === 'coreMessage') {
                var gamelist = gamelistManager(message.coreMessage);
                worker.send({
                    messagetype: 'gamelist',
                    gamelist: gamelist
                });
            }
        });
    }
    if (require('os').cpus().length > 1) {
        numCPUs = require('os').cpus().length;
        numCPUs = (numCPUs > 4) ? 4 : numCPUs;
    }

    if (cluster.isMaster) {
        console.log('YGOPro Salvation Server - Saving Yu-Gi-Oh!');
        console.log('    Starting Master');
        process.title = 'YGOPro Salvation Server';
        ircManager = require('./libs/ircbot.js');
        gamelistManager = require('./libs/gamelist.js');
        for (clusterIterator; clusterIterator < numCPUs; clusterIterator++) {
            setupWorker(clusterIterator);
        }
        cluster.on('exit', function (worker, code, signal) {
            notification = 'worker ' + worker.process.pid + ' died ' + code + ' ' + signal;
            ircManager.notify(notification);
            console.log(notification);
            setupWorker(clusterIterator++);
        });
    } else {
        staticserv = require('node-static');
        //listen on 80, main http server is clustered.
        httpServer = new staticserv.Server('./http');
        http.createServer(function (request, response) {
            request.addListener('end', function () {
                httpServer.serve(request, response);
            }).resume();
        }).listen(8098);


        // When a user connects, create an instance and allow the to duel, clean up after.
        ygoserver = net.createServer(function (socket) {
            socket.setNoDelay(true);
            socket.active_ygocore = false;
            socket.active = false;
            socket.on('data', function (data) {
                if (socket.active_ygocore) {
                    socket.active_ygocore.write(data);
                } else {
                    processIncomingTrasmission(data, socket, data);
                }

            });
            socket.on('close', function () {
                socket.active_ygocore.close();
            });
            socket.on('error', function () {
                socket.active_ygocore.close();
            });
            socket.setTimeout(300000, function () {
                socket.end(); //Security precaution
            });
        });
        ygoserver.listen(8911);
    } // end cluster split
}()); // end main