/* jshint node : true */

var irc = require("irc");
var config = {
    channels: ["#lobby", "#server"],
    server: "irc.freenode.net",
    botName: "MagiMagiGal"
};


var bot = new irc.Client(config.server, config.botName, {
    channels: config.channels
});

var output = {
    ircSayPublic: function ircSayPublic(message) {
        bot.say("#lobby", message);
    },
    ircSayPrivate: function ircSayPrivate(message) {
        bot.say("#lobby", message);
    }
};