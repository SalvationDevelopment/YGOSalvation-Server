/*jslint node: true*/
'use strict';

var winston = require('winston'),
    logger = new(winston.Logger)({
        transports: [
            new(winston.transports.DailyRotateFile)({
                filename: ".\\http\\logs\\chat.log"
            })
        ]
    });
module.exports = logger;


function onlog(message) {

}

function onConnectGamelist() {
    client.write({
        action: 'internalServerLogin',
        password: process.env.OPERPASS,
    });
    console.log('        [Slave ' + process.env.PORTRANGE + '] ' + 'Connected'.grey);
}

function onCloseGamelist() {

}
setTimeout(function () {
    client = new Socket('ws://127.0.0.1:24555'); //Connect the God to the tree;

    client.on('data', onlog);
    client.on('open', onConnectGamelist);
    client.on('close', onCloseGamelist);

}, 5000);