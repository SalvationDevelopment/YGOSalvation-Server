/*jslint node:true, plusplus: true*/
// blah blah load dependencies

/* Ths is the network shell of the AI, provides UX interface similar to DevBot.
    It connects to the IRC server to act as a user target for the DuelServ
    Duelserv then issues a command on game request to the AI as if it was a normal user
    via the Primus Gamelist connection. The AI can recieve all the same network
    updates via the Gamelist as a normal user and act on them. Upon recieving a 
    duel request via the Gamelist it creates a 'Duel Instance', the AI can easily
    handle multiple game instances.
    
*/

var Primus = require('primus'), //Primus, our Sepiroth-Qliphopth Creator God. Websocket connections.
    internalGames = [], // internal list of all games the bot is playing
    //enums = require('./libs/enums.js'),
    http = require('http'), // SQCG Primus requires http parsing/tcp-handling
    server = http.createServer(), //throne of the God
    primus = new Primus(server), // instance of the God
    Socket = require('primus').createSocket(),
    Duel = require('./ai-instance'),
    client = new Socket('http://ygopro.us:24555'), //Connect the God to the tree;
    irc = require("irc"), // IRC Client/bot dependency
    config = { // IRC configuration
        channels: ["#server"],
        server: "ygopro.us",
        botName: "[AI]SnarkyChild"
    }, // initate the bot
    bot = new irc.Client(config.server, config.botName, {
        channels: config.channels
    }),
    childProcess = require('child_process');




// have bot listen for a specific command, then do stuff
function ircInterface(from, to, message) {
    'use strict';

    //said specific command
    if (message === 'duel AI') {
        bot.say('DuelServ', '!duel ' + from);
        //ok the bot heard a duel request,
        //it is now messaging duelserv to reissue the duel request to both the bot and itself with more details.
    }
}

bot.addListener("message", ircInterface);


function gamelistUpdate(data) {
    'use strict';
    var join = false;
    if (data.clientEvent) {
        if (data.clientEvent === 'duelrequest' && data.target === '[AI]SnarkyChild') {
            console.log(data);
            console.log('duel Request Recieved');
            childProcess.spawn('windbot.exe', ['[AI]SnarkieChild', 'Hours', '127.0.0.1', '8911', data.roompass], {
                cwd: '../server/http/ygopro'
            }, function () {});
        }
        return;
    }
}

function onConnectGamelist() {
    'use strict';
    console.log('Connected to Gamelist');
}

function onCloseGamelist() {
    'use strict';
    console.log('Lost Connection to Gamelist');
}

client.on('data', gamelistUpdate);
client.on('connected', onConnectGamelist);
client.on('close', onCloseGamelist);
client.write({
    action: 'join'
});

module.exports = {
    ircInterface: ircInterface,
    gamelistUpdate: gamelistUpdate,
    onConnectGamelist: onConnectGamelist,
    onCloseGamelist: onCloseGamelist
};