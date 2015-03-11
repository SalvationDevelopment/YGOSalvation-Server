// load network understanding
function DuelConnection(roompass) {
    //console.log('attempting link up');
    'use strict';
    var data = new Buffer(), // needs to be constructed here
        socket = {};
        
    duelConnections = net.connect('8891', '127.0.0.1', function () {
        duelConnections.setNoDelay(true);
        duelConnections.write(data);
        duelConnections.on('data', function (core_data) {
            //make emitter
        });
    });
    duelConnections.on('error', function (error) {
        socket.end();
    });
    duelConnections.on('close', function () {
        socket.end();
    });
    return duelConnections;
}

//var primus = Primus.connect(window.location.origin + ':24555');
//repalce with server version
function joinGamelist() {
    'use strict';
    primus.write({
        action: 'join'
    });
primus.on('data', function (data) {
    'use strict';
    var join = false;
    console.log(data);
    if (data.clientEvent) {
        if (data.clientEvent === 'duelrequest') {
            //connect to game data.roompass
        }
    }
});

primus.on('connect', function () {
    'use strict';
    console.log('!!!!!! connect');
});
primus.on('close', function () {
    'use strict';
    console.log('!!!!!! close');
});

// utility functions

// IRC connection
var bot,
    irc = require("irc"),
    config = {
        channels: ["#server", "#lobby"],
        server: "ygopro.us",
        botName: "[AI]SnarkyChild"
    };
bot = new irc.Client(config.server, config.botName, {
    channels: config.channels
});

bot.addListener("message", function (from, to, message) {
    if (message === 'duel [AI]SnarkyChild'){
        bot.say('DuelServ','!duel ' + from);
    }
    // goes to duelserv
    // goes to gamelist tree system
    // Primus takes over.
});
    
// AI constructor
function createGameState() {
  var state = {
    OppMonsterZones : [],
    AIMonsterZones : [],
    OppSpellTrapZones : [],,
    AISpellTrapZones : [],
    OppGraveyard : [],
    AIGraveyard : [],
    OppBanished : [],
    AIBanished : [],
    OppHand : [],
    AIHand : [],
    OppExtraDeck : [],
    AIExtraDeck : [],
    OppMainDeck : [],
    AIMainDeck : [],
  };
  function move(){
    
  }
  function loadDeck(player, deck, cardList) {
    
  }
  return {
    move : move,
    GetOppMonsterZones : GetOppMonsterZones,
    GetAIMonsterZones : GetAIMonsterZones,
    GetOppSpellTrapZones : GetOppSpellTrapZones,,
    GetAISpellTrapZones : GetAISpellTrapZones,
    GetOppGraveyard : GetOppGraveyard,
    GetAIGraveyard : GetAIGraveyard,
    GetOppBanished : GetOppBanished,
    GetAIBanished : GetAIBanished,
    GetOppHand : GetOppHand,
    GetAIHand : GetAIHand,
    GetOppExtraDeck : GetOppExtraDeck,
    GetAIExtraDeck : GetAIExtraDeck,
    GetOppMainDeck : GetOppMainDeck,
    GetAIMainDeck : GetAIMainDeck,
    loadDeck : loadDeck
  }
  
}

// duel constructor

// response constructor

//  network constructor + AI calls
