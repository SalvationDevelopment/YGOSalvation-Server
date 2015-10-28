/*
Start various sub-servers.
--------------------------
- Game List on port 24555
- YGOPro listener on port 8911, YGOPro applications connect to this port
- YGOPro Web listener on port 8913, browser version connects to this port, 
  and is stripped and routed to the same place as the application. *disabled
- HTTP server running static files out of port 80
- IRC bot connects to #lobby, is named DuelServ
- Update Server is running on port 12000
- Ports 8911, 8913, *80, 12000 need to be free for the server to run.

Installation
------------
Run `npm install` in the directory above.
*/

/*jslint  node: true, plusplus: true*/
'use strict';
var colors = require('colors'), // oo pretty colors!
    domain = require('domain'), // yay error handling
    processManager = require('child_process'),
    request = require('request'),
    needHTTPMicroService = false;


function bootGameList() {
    console.log('    Primus Server Game Manager @ port 24555'.bold.yellow);
    processManager.fork('./gamelist.js', [], {
        cwd: 'libs'
    }).on('exit', bootGameList);
}

function bootManager() {
    console.log('    YGOSharp Service @ port 8911'.bold.yellow);
    processManager.fork('./game-manager.js', [], {
        cwd: 'libs'
    }).on('exit', bootManager);
}

function bootUpdateSystem() {
    console.log('    Update System @ port 12000'.bold.yellow);
    processManager.fork('../libs/update.js', [], {
        cwd: 'http'
    }).on('exit', bootUpdateSystem);
}

function bootAISystem() {
    console.log('    AI[SnarkyChild] connecting to port 127.0.0.1:24555 '.bold.yellow);
    processManager.fork('./ai.js', [], {
        cwd: 'libs'
    }).on('exit', bootAISystem);
}

function bootFlashPolicyServer() {
    console.log('    Flash Policy @ Port 843'.bold.yellow);
    processManager.fork('./policyserver.js', [], {
        cwd: 'libs'
    }).on('exit', bootFlashPolicyServer);
}

(function main() {
    var mainStack = domain.create();
    mainStack.on('error', function (err) {
        console.error((new Date()).toUTCString() + ' mainStackException:', err.message);
    });
    mainStack.run(function () {
        process.title = 'YGOPro Salvation Server ' + new Date();
        console.log('YGOPro Salvation Server - Saving Yu-Gi-Oh!'.bold.yellow);

        //boot the microservices
        bootGameList();
        bootManager();
        bootUpdateSystem();
        bootAISystem();
        bootFlashPolicyServer();
    });

}());
//
//
///* This is bad code */
//process.on('uncaughtException', function (err) {
//    console.error((new Date()).toUTCString() + ' uncaughtException:', err.message);
//    console.error(err.stack);
//});