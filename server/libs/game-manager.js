/*jslint  node: true, plusplus: true*/
/* This is bad code */

'use strict';
var notification = '', // its a string, make memory.
    gamelistManager, // primus and gamelist
    clusterIterator = 0, // its a number make memory,
    activegames = 0, // its a number make memory,
    cluster = require('cluster'), // multithreading!
    colors = require('colors'), // oo pretty colors!
    domain = require('domain'), // yay error handling
    processManager = require('child_process'),
    numCPUs = 1;

function initiateMaster(numCPUs) {
    console.log('    Starting Master');


    function setupWorker(x) {
        //'use strict';
        console.log(('        Starting Slave ' + x).grey);
        var worker = cluster.fork({
            PORTRANGE: x,
            SLAVE: true
        });

    }
    setTimeout(function () {
        for (clusterIterator; clusterIterator < numCPUs; clusterIterator++) {
            setupWorker(clusterIterator);
        }
    }, 5000);

    cluster.on('exit', function (worker, code, signal) {
        notification = 'worker ' + clusterIterator + ' died ' + code + ' ' + signal;
        setupWorker(clusterIterator++);
        if (clusterIterator > 20) {
            clusterIterator = 0;
        }
    });


}


(function main() {
    if (process.env.SLAVE) {
        require('./slave.js');
        require('./slave-ws.js');
        return;
    } else {
        if (require('os').cpus().length > 1) {
            numCPUs = require('os').cpus().length;
            numCPUs = (numCPUs > 8) ? 8 : numCPUs;
        }
        initiateMaster(numCPUs);
    }
}()); // end main var numCPUs = 1; // atleast 1 slave and 1 master.