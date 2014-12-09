var cardlocations = {
    
    'p0' : { 
        Deck : {
            x_origin :735, // player 1
            y_origin : 43
        },
        Hand : {
            x_origin : 124,
            y_origin : -10
        },
        Extra : {
            x_origin :22,
            y_origin :43
        },
        Field :{
            x_origin :22,
            y_origin :181
        },
        Spells : {
            zone1: {
                x_origin : 144,
                y_origin : 188
            },
            zone2: {
                x_origin : 261,
                y_origin : 188
            },
            zone3: {
                x_origin : 379,
                y_oirgin : 188
            },
            zone4: {
                x_origin : 497,
                y_origin : 188
            },
            zone5: {
                x_origin : 614,
                y_origin : 188
            }
        },
        MonsterZone : {
            zone1: {
                x_origin : 144,
                y_origin : 250
            },
            zone2: {
                x_origin : 261,
                y_origin : 250
            },
            zone3: {
                x_origin : 379,
                y_oirgin : 250
            },
            zone4: {
                x_origin : 497,
                y_origin : 250
            },
            zone5: {
                x_origin : 614,
                y_origin : 250
            }
        }
    
    
    },
    'p1' : { 
        Deck : {
            x_origin :744, // player 1
            y_origin : 43
        },
        Hand : {
            x_origin : 124,
            y_origin : -10
        },
        Extra : {
            x_origin :32,
            y_origin :43
        },
        Field :{
            x_origin :22,
            y_origin :181
        },
        Spells : {
            zone1: {
                x_origin : 144,
                y_origin : 188
            },
            zone2: {
                x_origin : 261,
                y_origin : 188
            },
            zone3: {
                x_origin : 379,
                y_oirgin : 188
            },
            zone4: {
                x_origin : 497,
                y_origin : 188
            },
            zone5: {
                x_origin : 614,
                y_origin : 188
            }
        },
        MonsterZone : {
            zone1: {
                x_origin : 144,
                y_origin : 250
            },
            zone2: {
                x_origin : 261,
                y_origin : 250
            },
            zone3: {
                x_origin : 379,
                y_oirgin : 250
            },
            zone4: {
                x_origin : 497,
                y_origin : 250
            },
            zone5: {
                x_origin : 614,
                y_origin : 250
            }
        }
    
    
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

/*
[1:46:57 PM]  (Buttys): you need to send me josn data to me
[1:47:06 PM]  (Buttys): with int Action and int Index
*/