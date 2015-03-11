// load network understanding


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

bot.addListener("message", function (from, to, message) {});
    
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
