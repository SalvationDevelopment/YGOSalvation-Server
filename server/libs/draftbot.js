/*jslint node:true, plusplus: true*/
var bot,
    irc = require("irc"),
    events = require('events'),
    eventEmitter = new events.EventEmitter(),
    config = {
        channels: ["#server", "#lobby"],
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


function duelrequest(challenger, challengedParty, roompass) {
    'use strict';
    eventEmitter.emit('announce', {
        clientEvent : 'duelrequest',
        target : challengedParty,
        from : challenger,
        roompass : roompass
    });
}

bot.addListener("message", function (from, to, message) {
    'use strict';
    var command = message.split(' '),
        pass = randomString(5);
    if (command[0] !== '!duel' || command.length !== 2) {
        return;
    }
    if (command === '!tag' && command.length === 5) {
        duelrequest(from, command[1], codes[command[0]] + pass);
        duelrequest(command[1], from, codes[command[0]] + pass);
        duelrequest(command[2], from, codes[command[0]] + pass);
        duelrequest(command[3], from, codes[command[0]] + pass);
    }
    duelrequest(from, command[1], codes[command[0]] + pass);
    duelrequest(command[1], from, codes[command[0]] + pass);
});

bot.addListener("message", function (from, to, message) {
    'use strict';
    var command = message.split(' ');
    if (command[0] !== '!startDraft' && from !== "#oper") {
        return;
    }
    //start tournament
});


module.exports = eventEmitter;