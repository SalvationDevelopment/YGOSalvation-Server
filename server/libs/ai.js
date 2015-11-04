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
    client = new Socket('http://ygopro.us:24555'), //Connect the God to the tree;
    childProcess = require('child_process'),
    startDirectory = __dirname,
    path = process.cwd() + '/../ai';



function gamelistUpdate(data) {
    'use strict';
    var needsKill = true,
        windbot;
    if (data.clientEvent) {
        console.log('[AI]:Event: Client Event');
        if (data.clientEvent === 'duelrequest' && data.target === 'SnarkyChild') {
            console.log('[AI]:Event: Duel Request for SnarkyChild');
            console.log(path.resolve(__dirname + '/..ai/'));
            windbot = childProcess.spawn('windbot.exe', ['SnarkyChild', 'Hours', '127.0.0.1', '8911', data.roompass], {
                cwd: path
            });
            windbot.on('error', function (error) {
                console.log('[AI]:Error:', error);
            });
            windbot.on('exit', function (extra) {
                console.log('[AI]:Exit:', extra);
            });
        }
        return;
    }
}

function onConnectGamelist() {
    'use strict';
}

function onCloseGamelist() {
    'use strict';
}

client.on('data', gamelistUpdate);
client.on('connected', onConnectGamelist);
client.on('close', onCloseGamelist);
client.write({
    action: 'join'
});

module.exports = {
    gamelistUpdate: gamelistUpdate,
    onConnectGamelist: onConnectGamelist,
    onCloseGamelist: onCloseGamelist
};


require('fs').watch(__filename, process.exit);