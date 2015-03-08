/*jslint  node: true, plusplus: true, white: false*/
(function () {
    'use strict';
    var bot,
        irc = require("irc"),
        spawn = require('child_process').spawn,
        config = {
            channels: ["#server", "lobby"],
            server: "ygopro.us",
            botName: "EXODIUS_" + require('os').hostname()
        };
    bot = new irc.Client(config.server, config.botName, {
        channels: config.channels
    });
    
    function ircSayPublic(message) {
        bot.say("#lobby", message);
    }

    function ircSayPrivate(message) {
        bot.say("#server", message);
    }


    module.exports = {
        notify: ircSayPrivate
    };
}());