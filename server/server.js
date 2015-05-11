/*
Start various sub-servers.
--------------------------
- Gamelist on port 24555
- YGOPro listener on port 8911, YGOPro applications connect to this port
- YGOPro Web listener on port 8913, browser version connects to this port, 
  and is stripped and routed to the same place as the application. *disabled
- HTTP server running static files out of port 80
- IRC bot connects to #lobby, is named DuelServ

Installation
------------
Run `npm install` in the directory above.
*/

/*jslint  node: true, plusplus: true*/

var ygoserver, //port 8911 ygopro Server
    ircManager, // magimagigal
    numCPUs = 1, // atleast 1 slave and 1 master.
    notification = '', // its a string, make memory.
    gamelistManager, // primus and gamelist
    clusterIterator = 0, // its a number make memory,
    activegames = 0,
    net = require('net'), //tcp connections
    cluster = require('cluster'), // multithreading
    colors = require('colors'), // oo pretty colors!

    WebSocketServer = require('ws').Server,
    Framemaker = require('./libs/parseframes.js'), //understand YGOPro API.
    processIncomingTrasmission = require('./libs/processIncomingTrasmission.js'); // gamelist and start games


function gamelistMessage(message) {
    'use strict';
    var rooms,
        gamelist = gamelistManager.messageListener(message.coreMessage);
    activegames = 0;
    Object.keys(cluster.workers).forEach(function (id) {
        cluster.workers[id].send({
            messagetype: 'gamelist',
            gamelist: gamelist
        });
    });
    for (rooms in gamelist) {
        if (gamelist.hasOwnProperty(rooms)) {
            activegames++;
        }
    }
    process.title = 'YGOPro Salvation Server [' + activegames + ']';
}

function initiateMaster() {
    'use strict';


    console.log('YGOPro Salvation Server - Saving Yu-Gi-Oh!'.bold.yellow);
    console.log('    Starting Master');
    process.title = 'YGOPro Salvation Server [' + activegames + '] ' + new Date();
    ircManager = require('./libs/ircbot.js');
    gamelistManager = require('./libs/gamelist.js');

    function setupWorker(x) {
        //'use strict';
        console.log(('        Starting Slave ' + x).grey);
        var worker = cluster.fork({
            PORTRANGE: x
        });
        require('./libs/policyserver.js');
        require('./libs/ldapserver.js'); //LDAP endpoint; //Flash policy server for LightIRC;
        worker.on('message', gamelistMessage);
    }
    for (clusterIterator; clusterIterator < numCPUs; clusterIterator++) {
        setupWorker(clusterIterator);
    }
    cluster.on('exit', function (worker, code, signal) {
        notification = 'worker ' + clusterIterator + ' died ' + code + ' ' + signal;
        ircManager.notify(notification);
        console.log(notification);
        setupWorker(clusterIterator++);
        if (clusterIterator > 20) {
            clusterIterator = 0;
        }
    });
}

function initiateSlave() {
    'use strict';
    // When a user connects, create an instance and allow the to duel, clean up after.
    var parsePackets = require('./libs/parsepackets.js');
    function handleDuel(socket) {
        var framer = new Framemaker();
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
        socket.setTimeout(300000, function () {
            socket.end(); //Security precaution
        });
        socket.on('error', function (error) {
            console.log('::CLIENT', error);
            if (socket.active_ygocore) {
                try {
                    socket.active_ygocore.end();
                } catch (e) {
                    console.log('::CLIENT ERROR Before connect', e);
                }
            }
        });
    }
    ygoserver = net.createServer(handleDuel);
    ygoserver.listen(8911);
    return ygoserver;
}

(function main() {
    'use strict';
    if (require('os').cpus().length > 1) {
        numCPUs = require('os').cpus().length;
        numCPUs = (numCPUs > 8) ? 8 : numCPUs;
    }

    if (cluster.isMaster) {
        // if doing a build test on Travis running with istanbul coverage
        if (process.env.running_under_istanbul) {
            // use coverage for forked process
            // disabled reporting and output for child process
            // enable pid in child process coverage filename
            cluster.setupMaster({
                exec: './node_modules/.bin/istanbul',
                args: [
                    'cover', '--report', 'none', '--print', 'none', '--include-pid',
                    process.argv[1], '--'].concat(process.argv.slice(2))
            });
        }
        initiateMaster();
    } else {
        initiateSlave();
    }

}()); // end main

module.exports = {
    initiateMaster: initiateMaster,
    initiateSlave: initiateSlave,
    gamelistMessage: gamelistMessage
};