/*jslint node:true*/
var bot,
    irc = require("irc"),
    config = {
        channels: ["#server"],
        server: "ygopro.us",
        botName: "Director"
    };

bot = new irc.Client(config.server, config.botName, {
    channels: config.channels
});

function communicateToPrimus(message) {
    'use strict';
    var output = {
        messagetype: 'draft',
        message: message
    };
    process.send(output);
}

module.exports = function incomingMsg(message) {
    'use strict';
};