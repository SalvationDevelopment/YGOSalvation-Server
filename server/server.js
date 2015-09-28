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

var notification = '', // its a string, make memory.
    gamelistManager, // primus and gamelist
    clusterIterator = 0, // its a number make memory,
    activegames = 0,
    cluster = require('cluster'), // multithreading
    colors = require('colors'), // oo pretty colors!
    domain = require('domain'), // yay error handling
    processManager = require('child_process');


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

function initiateMaster(numCPUs) {
    'use strict';
    console.log('YGOPro Salvation Server - Saving Yu-Gi-Oh!'.bold.yellow);
    console.log('    Starting Master');
    process.title = 'YGOPro Salvation Server [' + activegames + '] ' + new Date();
    gamelistManager = require('./libs/gamelist.js');
    require('./libs/policyserver.js');
    //require('./libs/ldapserver.js'); //LDAP endpoint; //Flash policy server for LightIRC;
    processManager.fork('../libs/update.js', [], {
        cwd: 'http'
    });

    function setupWorker(x) {
        //'use strict';
        console.log(('        Starting Slave ' + x).grey);
        var worker = cluster.fork({
            PORTRANGE: x,
            SLAVE: true
        });

        worker.on('message', gamelistMessage);
    }
    for (clusterIterator; clusterIterator < numCPUs; clusterIterator++) {
        setupWorker(clusterIterator);
    }
    cluster.on('exit', function (worker, code, signal) {
        notification = 'worker ' + clusterIterator + ' died ' + code + ' ' + signal;
        setupWorker(clusterIterator++);
        if (clusterIterator > 20) {
            clusterIterator = 0;
        }
    });


}



(function main() {
    'use strict';
    if (process.env.SLAVE) {
        require('./libs/slave.js');
        require('./libs/slave-ws.js');
        return;
    } else if (process.env.SERVICE) {
        return;
    } else {
        var numCPUs = 1; // atleast 1 slave and 1 master.
        if (require('os').cpus().length > 1) {
            numCPUs = require('os').cpus().length;
            numCPUs = (numCPUs > 8) ? 8 : numCPUs;
        }
        initiateMaster(numCPUs);
    }
}()); // end main

module.exports = {
    initiateMaster: initiateMaster,
    gamelistMessage: gamelistMessage
};

/* This is bad code */
process.on('uncaughtException', function (err) {
    'use strict';
    console.error((new Date()).toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);
});