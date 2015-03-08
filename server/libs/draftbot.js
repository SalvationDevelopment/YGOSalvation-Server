/*jslint node:true*/
var bot,
    irc = require("irc"),
    config = {
        channels: ["#server"],
        server: "ygopro.us",
        botName: "DuelServ"
    };

function randomString(len, charSet) {
    'use strict';
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomPoz,
        i = 0,
        randomstring = '';
    for (i; i < len; i++) {
        randomPoz = Math.floor(Math.random() * charSet.length);
        randomstring += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomstring;
}

bot = new irc.Client(config.server, config.botName, {
    channels: config.channels
});

function communicateToPrimus(message, action) {
    'use strict';
    var output = {
        messagetype: 'draft',
        message : message
    };
    process.send(output);
}

function duelrequest(challenger, challengedParty, roompass) {
    'use strict';
    communicateToPrimus({
        clientEvent : 'duelrequest',
        target : challengedParty,
        from : challenger,
        roompass : roompass
    }, 'duelrequest');

}
bot.addListener("message", function (from, to, message) {
    'use strict';
    var command = message.split(' ');
    if (command[0] !== '!duel' && command.length !== 2){
        return;
    }
    duelrequest(from, )
});

module.exports = function incomingMsg(message) {
    'use strict';
};