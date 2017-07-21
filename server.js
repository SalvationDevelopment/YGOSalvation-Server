/*jslint  node: true, plusplus: true*/
'use strict';
require('dotenv').config();
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
    },
    gamelistChildParams = (process.env.DEBUGGER === 'true') ? ['--debug-brk=5859'] : [],
    dbChildParams = (process.env.DEBUGGER === 'true') ? ['--debug-brk=5860'] : [];

var dependencies = require('./package.json').dependencies,
    modules,
    safe = true,
    moduleIsAvaliable = true;


var colors = require('colors'), // oo pretty colors!
    request = require('request'), //talking HTTP here
    needHTTPMicroService = false, //if there is an HTTPD then dont do anything.
    net = require('net'); // ping!;;


function deckstorageBoot() {
    console.log('    DeckStorage Online');
    processManager.fork('./deckstorage.js', [], {
        cwd: 'libs',
        execArgv: dbChildParams
    }).on('exit', deckstorageBoot);
}


function bootGameList() {
    console.log('    Primus Server Game Manager @ port 80/443'.bold.yellow);
    processManager.fork('./gamelist.js', [], {
        cwd: 'libs',
        execArgv: gamelistChildParams
    }).on('exit', bootGameList);
}




function main() {
    var mainStack = domain.create();

    mainStack.on('error', function(err) {
        console.error((new Date()).toUTCString(), ' mainStackException:', err.message);
    });

    mainStack.run(function() {

        //segfaultHandler.registerHandler("crash.log"); // With no argument, SegfaultHandler will generate a generic log file name
        process.title = 'YGOPro Salvation Server ' + new Date();
        console.log('YGO Salvation Server - Saving Yu-Gi-Oh!'.bold.yellow);
        bootGameList();
        setTimeout(function() {
            deckstorageBoot();
        }, 500);



    });
}
main();