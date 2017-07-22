/*jslint  node: true, plusplus: true*/
'use strict';
require('dotenv').config();
const fs = require('fs'),
    os = require('os'),
    path = require('path'),
    domain = require('domain'), // yay error handling,
    CONFIGURATION = {
        FORUM: 'localforum',
        SITE: 'localhost',
        SSL: process.env.SSL,
        ProductionFORUM: 'forum.ygopro.us',
        ProductionSITE: 'ygopro.us'
    },
    gamelistChildParams = (process.env.DEBUGGER === 'true') ? ['--debug-brk=5859'] : [],
    colors = require('colors'),
    hotload = require('hotload');

function main() {
    var mainStack = domain.create();

    mainStack.on('error', function(err) {
        throw err;
    });

    mainStack.run(function() {
        process.title = 'YGOPro Salvation Server ' + new Date();
        console.log('YGO Salvation Server - Saving Yu-Gi-Oh!'.bold.yellow);
        require('./src/controller_main.js');
    });
}
main();