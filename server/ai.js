// load network understanding

// IRC connection

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
