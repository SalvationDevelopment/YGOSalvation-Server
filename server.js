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

*/

/*jslint  node: true, plusplus: true*/
'use strict';
var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    processManager = require('child_process'),
    domain = require('domain'), // yay error handling,
    CONFIGURATION = {
        FORUM: 'localforum',
        SITE: 'localhost',
        SSL: process.env.SSL,
        ProductionFORUM: 'forum.ygopro.us',
        ProductionSITE: 'ygopro.us'
    };

var dependencies = require('./package.json').dependencies,
    modules,
    safe = true,
    moduleIsAvaliable = true;


var colors = require('colors'), // oo pretty colors!
    request = require('request'), //talking HTTP here
    needHTTPMicroService = false, //if there is an HTTPD then dont do anything.
    net = require('net'); // ping!;;






//var ygopro_core = processManager.exec('./premake4 vs2012', {
//    cwd: path.resolve('../../ygopro-core')
//}, function () {
//    makeYGOProCore();
//});




function deckstorageBoot() {
    console.log('    DeckStorage Online');
    processManager.fork('./deckstorage.js', [], {
        cwd: 'libs'
    }).on('exit', deckstorageBoot);
}


function bootGameList() {
    console.log('    Primus Server Game Manager @ port 80/443'.bold.yellow);
    processManager.fork('./gamelist.js', [], {
        cwd: 'libs'
    }).on('exit', bootGameList);
}




function main() {
    var mainStack = domain.create();

    mainStack.on('error', function (err) {
        console.error((new Date()).toUTCString(), ' mainStackException:', err.message);
    });
    mainStack.run(function () {

        //segfaultHandler.registerHandler("crash.log"); // With no argument, SegfaultHandler will generate a generic log file name
        process.title = 'YGOPro Salvation Server ' + new Date();
        console.log('YGOPro Salvation Server - Saving Yu-Gi-Oh!'.bold.yellow);


        bootGameList();

        
        setTimeout(function () {
            deckstorageBoot();
        }, 500);



    });
    delete process.send; // in case we're a child process
}





// segfaultHandler = require('segfault-handler'); //http://imgs.xkcd.com/comics/compiler_complaint.png
//https://www.npmjs.com/package/segfault-handler
main();