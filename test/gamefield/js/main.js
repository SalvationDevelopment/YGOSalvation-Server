/* 
 * Im Mainscript werden die globalen Variablen deklariert.
 */
// In der Duelphase wird die momentane Spielphase gespeichert.
// 0: dp
// 1: sp
// 2: mp1
// 3: bp
// 4: mp2
// 5: ep
var duelphase;

// aktuelle Karten der Spieler
duel = {
    'p0': {
        'Deck': [],
        'Hand': [],
        'MonsterZone': [],
        'SpellZone': [],
        'Grave': [],
        'Removed': [],
        'Extra': [],
        'Overlay': [],
        'Onfield': []
    },
    'p1': {
        'Deck': [],
        'Hand': [],
        'MonsterZone': [],
        'SpellZone': [],
        'Grave': [],
        'Removed': [],
        'Extra': [],
        'Overlay': [],
        'Onfield': []
    }
};

var cardplace =  {
        1 :  'Deck' ,
        2 :  'Hand',
        4 :  'MonsterZone',
        8 :  'SpellZone',
        16:  'Grave',
        32:  'Removed',
        64:  'Extra',
        128: 'Overlay',
        12:  'Onfield'        
    };
var enumPhase =
    {
        1:  'Draw Phase',
        2:  'Standby Phase',
        4:  'Main Phase 1',
        8:  'Battle Phase',
        16: 'Battle Calculation',
        32: 'Main Phase 2',
        64: 'End Phase',
       128: 'End of Turn'
    };
var cardPositions =
    {
        0:  'FaceUpAttack',
        1:  'FaceDownAttack',
        2:  'FaceUpDefence',
        3:  'FaceDownDefence',
        4: 'FaceUp',
        5: 'FaceDown',
        6: 'Attack',
        7: 'Defence'
    };
var MainAction =
        {
            0 : 'Summon' ,
            1 : 'SpSummon',
            2 : 'Repos',
            3 : 'SetMonster',
            4 : 'SetSpell',
            5 : 'Activate',
            6 : 'ToBattlePhase',
            7 : 'ToEndPhase'
        };
function updateCardsOnField() {
    // if send updateCards from unity save new cards in "duel" and activate this function
    // Update all displayed cards on field here
    
    // 1. empty all duelfield divs
    $( "#hzone1" ).empty();
    $( "#hzone2" ).empty();
    $( "#dzone1" ).empty();
                
    // 2. append all cards on the duelfield
        // p0 
            // Deck
            var i = (duel.p0.Deck.length);
                for(a = 0; a < i; a++){
                    console.log(card[a].Id);
                    $( "#dzone2" ).append( '<img id="'+card[a].Id+'." src="http://ygopro.de/img/cardpics/'+card[a].Id+'.jpg" width="90"> ' );
                }
            
           // Hand
           var i = (duel.p0.Hand.length);
                for(a = 0; a < i; a++){
                    console.log(card[a].Id);
                    $( "#hzone2" ).append( '<img id="'+card[a].Id+'." src="http://ygopro.de/img/cardpics/'+card[a].Id+'.jpg" width="90"> ' );
                }    
}

function goThisPhase(isphase, duelphase){
    
}

// sende chain an unity wenn Kette aktiviert wird
function sendOnChain(selectedCard){
    u.getUnity().SendMessage("GameClient", 'SendOnChain', selectedCard);
}
