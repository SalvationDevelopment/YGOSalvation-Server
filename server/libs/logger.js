/*jslint node: true*/
'use strict';

var winston = require('winston'),
    InstaQueue = require('instaqueue'),
    Primus = require('primus'),
    logger = new(winston.Logger)({
        transports: [
            new(winston.transports.DailyRotateFile)({
                filename: ".\\http\\logs\\chat.log"
            })
        ]
    }),
    Socket = require('primus').createSocket({
        iknowclusterwillbreakconnections: true
    }),
    client = {
        write: function () {
            console.log('system not ready yet');
        }
    },
    myQueue = new InstaQueue(3000, 5, function (input) {
        logger.info(input);
    });




function onlog(message) {
    if (message.log) {
        myQueue.push(message.log);
    }

}

function onConnectGamelist() {
    client.write({
        action: 'internalServerLogin',
        password: process.env.OPERPASS
    });
    console.log('        [Logger System] ' + 'Connected'.grey);
}

function onCloseGamelist() {

}
setTimeout(function () {
    client = new Socket('ws://127.0.0.1:24555'); //Connect the God to the tree;

    client.on('data', onlog);
    client.on('open', onConnectGamelist);
    client.on('close', onCloseGamelist);

}, 5000);

module.exports = logger;