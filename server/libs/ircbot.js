/*jslint  node: true, plusplus: true, white: false*/
(function () {
    'use strict';
    var bot,
        irc = require("irc"),
        spawn = require('child_process').spawn,
        config = {
            channels: ["#lobby", "#server"],
            server: "irc.freenode.net",
            botName: "MagiMagiGal"
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

    function runUpdate() {
        var updateinstance = spawn('git', ['pull']);
        updateinstance.on('close', function preformupdate() {
            spawn('node', ['update.js'], {
                cwd: './http'
            });
        });
    }
    module.exports = {
        notify: ircSayPrivate
    };
}());