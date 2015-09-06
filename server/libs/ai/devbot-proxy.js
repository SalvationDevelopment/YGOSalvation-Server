/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
var net = require('net'),
    fauxDevpro, //fake devpro server
    loginString = [], //string devbot will send
    loginReplyString = [], //replay server will send devbot
    startDuelString; //string to send to devbot to make it duel


// up Set devpro emulator server
// when the bot tries to login auto reply with info
// lock it to local host

fauxDevpro = net.createServer(function (socket) {
    'use strict';
    socket.on('data', function (data) {
    
    });
}).listen(8933);

function bot_interface() {
    'use strict';
    return {
        join : function (game) {
            fauxDevpro.write(new Buffer(game));
        }
    };
}