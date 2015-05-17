/*jslint node:true, plusplus: true, bitwise: true*/
//taken from server.js, just done in reverse.
// represnts a single duel connection.
var Framemaker = require('./libs/parseframes.js'), //queue generator
    net = require('net'), //gain TCP access
    fs = require('fs'), // gain file system access
    parsePackets = require('./libs/parsepackets.js'), // unfuck Flurohydrides network optimizations that make everything unreadable.
    recieveSTOC = require('./libs/recieveSTOC.js'), // turn network data into a COMMAND and list of PARAMETERS,
    events = require('events'),
    makeCTOS = require('./responseGenerator');




function convertDeck(file, filename) {
    'use strict';
    var tempdeck = file.toString().split('!side'),
        side = tempdeck[1],
        main = tempdeck[0].split('#extra')[0],
        extra = tempdeck[0].split('#extra')[1];
    main = main.split('\r\n').map(function (item) {
        return parseInt(item, 10);
    });
    main = main.filter(function (i) {
        return (i);
    });
    extra = extra.split('\r\n').map(function (item) {
        return parseInt(item, 10);
    });
    extra = extra.filter(function (i) {
        return (i);
    });
    side = side.split('\r\n').map(function (item) {
        return parseInt(item, 10);
    });
    side = side.filter(function (i) {
        return (i > 0);
    });
    return {
        main: main,
        side: side,
        extra: extra
    };
}

//Load all decks
function getDecks() {
    'use strict';
    var folder = fs.readdirSync('../client/ygopro/deck'),
        decks = [],

        i = 0;

    for (i; folder.length > i; i++) {
        if (folder[i].indexOf('.ydk') !== -1) {
            decks.push(convertDeck(fs.readFileSync('../client/ygopro/deck/' + folder[i])));
        }
    }
    return decks;
}

var decks = getDecks();
console.log(decks[5].main.length);
console.log(decks[5].side.length);
console.log(decks[5].extra.length);
//AI calls
// actual AI decision making itself,
// network calls pair up as these functions and data to act as thier parameters
function OnSelectOption(options) {
    'use strict';
    return 0; //index od option
}

function OnSelectEffectYesNo(id, triggeringCard) {
    'use strict';
    return 1; //or 0;

}

function OnSelectYesNo(description_id) {
    'use strict';
    return 1; // or no 0;

}

function OnSelectPosition(id, available) {
    'use strict';
    return 0x1; // return from constant.lua
}

function OnSelectTribute(cards, minTributes, maxTributes) {
    'use strict';
    return []; // table of indexies
}

function OnDeclareMonsterType(count, choices) {
    'use strict';
    return 0;
    //https://github.com/Snarkie/YGOProAIScript/blob/master/AI/mod/DeclareMonsterType.lua
}

function OnDeclareAttribute(count, choices) {
    'use strict';
    return 0;

}

function OnDeclareCard() {
    'use strict';
    return; //random card id

}

function OnSelectNumber(choices) {
    'use strict';
    return 0; //index of choice
}

function OnSelectChain(cards, only_chains_by_player, forced) {
    'use strict';
    return 0; //return index of chain;
}

function OnSelectSum(cards, sum, triggeringCard) {
    'use strict';

}

function OnSelectCard(cards, minTargets, maxTargets, triggeringID, triggeringCard) {
    'use strict';
    return []; //return table of choices
}

function OnSelectBattleCommand(cards, attacker) {
    'use strict';
    return 0; //return index
}

function OnSelectInitCommand(cards, to_bp_allowed, to_ep_allowed) {
    'use strict';
    var Index = 0,
        Action = 7;
    return ((Index << 16) + Action); //return index
}

function GameState() {
    'use strict';
    var AIPlayerID = 0,
        OppPlayerID = 1,
        turnPlayer = 0,
        phase = 0,
        state = {
            0: {
                Lifepoints: 8000,
                MonsterZones: [],
                SpellTrapZones: [],
                Graveyard: [],
                Banished: [],
                Hand: [],
                ExtraDeck: [],
                MainDeck: []
            },
            1: {
                LifePoints: 8000,
                MonsterZones: [],
                SpellTrapZones: [],
                Graveyard: [],
                Banished: [],
                Hand: [],
                ExtraDeck: [],
                MainDeck: []
            }
        };

    function start(lp1, lp2, OneDeck, TwoDeck, OneExtra, TwoExtra) {
        //            game.DOMWriter(OneDeck, 'DECK', 0);
        //            game.DOMWriter(TwoDeck, 'DECK', 1);
        //            game.DOMWriter(OneExtra, 'EXTRA', 0);
        //            game.DOMWriter(TwoExtra, 'EXTRA', 1);

        state[0].LifePoints = lp1;
        state[1].LifePoints = lp2;
    }

    function update(player, clocation, index, data) {
        if (index !== 'mass') {
            state[player][clocation] = data;
        } else {
            state[player][clocation][index] = data;
        }
    }

    function updateLifepoints(player, multiplier, lp) {
        var lifepoints = +state[player].Lifepoints + (lp * multiplier);
        if (lifepoints < 0) {
            lifepoints = 0;
        }
        state[player].Lifepoints = lifepoints;
    }

    function move(player, clocation, index, moveplayer, movelocation, movezone, moveposition, overlayindex, isBecomingCard) {

        //enums.locations[clocation] === 'DECK/EXTRA/REMOVED
        state[moveplayer][movelocation][moveposition] = state[player][clocation][index];
        state[player][clocation][index] = undefined;
        //if grave
        //if banished
        //if hand
        //if extraDeck
        //if maindeck
        //if above, reshuffle;
        state[player][clocation] = state[player][clocation].filter(function (element) {
            return element !== undefined;
        });


        return;
    }

    function newphase(turnx) {
        turnx = +state.phase;
    }

    function setAI_Opp(newID) {
        AIPlayerID = newID;
        OppPlayerID = (AIPlayerID === 0) ? 1 : 0;
    }

    function loadDeck(player, deck, cardList) {

    }
    return {
        move: move,
        update: update,
        loadDeck: loadDeck,
        setAI_Opp: setAI_Opp,
        GetOppMonsterZones: function () {
            return state[OppPlayerID].MonsterZones;
        },
        GetAIMonsterZones: function () {
            return state[AIPlayerID].MonsterZones;
        },
        GetOppSpellTrapZones: function () {
            return state[OppPlayerID].SpellTrapZones;
        },

        GetAISpellTrapZones: function () {
            return state[AIPlayerID].SpellTrapZones;
        },
        GetOppGraveyard: function () {
            return state[OppPlayerID].Graveyard;
        },
        GetAIGraveyard: function () {
            return state[AIPlayerID].Graveyard;
        },
        GetOppBanished: function () {
            return state[OppPlayerID].Banished;
        },
        GetAIBanished: function () {
            return state[AIPlayerID].Banished;
        },
        GetOppHand: function () {
            return state[OppPlayerID].Hand;
        },
        GetAIHand: function () {
            return state[AIPlayerID].Hand;
        },
        GetOppExtraDeck: function () {
            return state[OppPlayerID].ExtraDeck;
        },
        GetAIExtraDeck: function () {
            return state[AIPlayerID].ExtraDeck;
        },
        GetOppMainDeck: function () {
            return state[OppPlayerID].MainDeck;
        },
        GetAIMainDeck: function () {
            return state[AIPlayerID].MainDeck;
        },
        lobby: {
            ready : [0, 0],
            duelist : [],
            totalplayers: 0
        },
        time : [0, 0]
    };

}


function DuelConnection(roompass) {
    //taken from /libs/processincomingtransmission.js
    //conenct to the main server like a user via tcp
    'use strict';
    var socket = {},
        duelConnections;
    //'192.99.11.19'
    duelConnections = net.connect(8911, '192.99.11.19', function () {
        duelConnections.setNoDelay(true);
        console.log('Send Game request for', roompass);
        var name = makeCTOS('CTOS_PlayerInfo', '[AI]SnarkyChild'),
            join = makeCTOS('CTOS_JoinGame', roompass),
            
            tosend = Buffer.concat([name, join]);
            


        setTimeout(function () {
            duelConnections.write(tosend);
        }, 500);
    });
    duelConnections.on('error', function (error) {
        console.log(error);
        duelConnections.end();
    });
    duelConnections.on('close', function () {
        console.log(roompass, 'closed');
        duelConnections.write(makeCTOS('CTOS_LEAVE_GAME'));
        duelConnections.end();
    });
    duelConnections.on('data', function (data) {
        //console.log('data');

    });
    return duelConnections;
}

function rps() {
    'use strict';
    return Math.floor(Math.random() * (4 - 1)) + 1;
}

function CommandParser() {
    'use strict';

    // OK!!!! HARD PART!!!!
    // recieveSTOC.js should have created obejects with all the parameters as properites, fire the functions.
    // Dont try to pull data out of a packet here, should have been done already.
    // its done here because we might need to pass in STATE to the functions also.
    // again if you are fiddling with a packet you are doing it wrong!!!
    // data decode and command execution are different conserns.
    // if a COMMAND results in a response, save it as RESPONSE, else return the function false.

    var protoResponse = [],
        responseRequired = false,
        output = {};

    output.event = new events.EventEmitter();

    output.input = function (input) {
        console.log(input);
        if (input.STOC_GAME_MSG) {
            output.event.emit(input.command, input);
        }
        if (input.STOC_UNKNOWN) {
            output.event.emit('STOC_UNKNOWN', input);
        }
        if (input.STOC_SELECT_HAND) {
            output.event.emit('STOC_SELECT_HAND', input);
        }
        if (input.STOC_JOIN_GAME) {
            output.event.emit('STOC_JOIN_GAME', input);
        }
        if (input.STOC_SELECT_TP) {
            output.event.emit('STOC_SELECT_TP', input);
        }
        if (input.STOC_HAND_RESULT) {
            output.event.emit('STOC_HAND_RESULT', input);
        }
        if (input.STOC_TP_RESULT) {
            output.event.emit('STOC_TP_RESULT', input);
        }
        if (input.STOC_CHANGE_SIDE) {
            output.event.emit('STOC_CHANGE_SIDE', input);
        }
        if (input.STOC_WAITING_SIDE) {
            output.event.emit('STOC_WAITING_SIDE', input);
        }
        if (input.STOC_CREATE_GAME) {
            output.event.emit('STOC_CREATE_GAME', input);
        }
        if (input.STOC_TYPE_CHANGE) {
            output.event.emit('STOC_TYPE_CHANGE', input);
        }
        if (input.STOC_LEAVE_GAME) {
            output.event.emit('STOC_LEAVE_GAME', input);
        }
        if (input.STOC_DUEL_START) {
            output.event.emit('STOC_DUEL_START', input);
        }
        if (input.STOC_DUEL_END) {
            output.event.emit('STOC_DUEL_END', input);
        }
        if (input.STOC_REPLAY) {
            output.event.emit('STOC_REPLAY', input);
        }
        if (input.STOC_TIME_LIMIT) {
            output.event.emit('STOC_TIME_LIMIT', input);
        }
        if (input.STOC_CHAT) {
            output.event.emit('STOC_CHAT', input);
        }
        if (input.STOC_HS_PLAYER_ENTER) {
            output.event.emit('STOC_HS_PLAYER_ENTER', input);
        }

        if (input.STOC_HS_PLAYER_CHANGE) {
            output.event.emit('STOC_HS_PLAYER_CHANGE', input);
        }
        if (input.STOC_HS_WATCH_CHANGE) {
            output.event.emit('STOC_HS_WATCH_CHANGE', input);
        }
    };
    return output;
}

function processTask(task, socket) {
    'use strict';
    var i = 0,
        l = 0,
        output = [],
        RESPONSE = false;
    for (i; task.length > i; i++) {
        output.push(recieveSTOC(task[i]));
        console.log(output[i].command);
    }

    return output;
}



// AI constructor
// The AI needs these state variables to make decisions.
// STOC (server TO client) commands update this state holder.
function Duel(roompass, botUsername) {

    'use strict';
    var duel = {},
        framer = new Framemaker();

    duel.server = new DuelConnection(roompass);
    duel.gameState = new GameState();
    duel.commandParser = new CommandParser();
    duel.server.on('data', function (data) {
        var frame,
            task,
            newframes = 0,
            commands,
            l = 0,
            reply;

        frame = framer.input(data);
        for (newframes; frame.length > newframes; newframes++) {
            task = parsePackets('STOC', new Buffer(frame[newframes]));
            //console.log('!', task);
            commands = processTask(task);
            // process AI
            //console.log(task);
            l = 0;
            for (l; commands.length > l; l++) {
                duel.commandParser.input(commands[l]);
            }
            

        }
        frame = [];
    });
    duel.commandParser.event.on('STOC_JOIN_GAME', function (input) {
        duel.gameState.lobby.duelist.push(input.person);
        var updateDeck = makeCTOS('CTOS_UPDATE_DECK', decks[0]),
            check = makeCTOS('CTOS_HS_READY'),
            surejoined = makeCTOS('CTOS_HS_TODUELIST'),
            decksend = Buffer.concat([surejoined, updateDeck, check]);
       
        duel.server.write(decksend);
    });
    duel.commandParser.event.on('STOC_HS_PLAYER_CHANGE', function (input) {
        if (input.pos > 3) {
            return;
        }
        if (input.state > 8) {
            duel.gameState.lobby.ready[input.changepos] = input.state;
        }
        console.log(duel.gameState.lobby.ready[0], duel.gameState.lobby.ready[1]);
        if ((duel.gameState.lobby.ready[0] + duel.gameState.lobby.ready[0]) === 18) {
            duel.server.write(makeCTOS('CTOS_START'));
        }
    });
    duel.commandParser.event.on('STOC_HS_PLAYER_CHANGE', function (input) {
        duel.server.write(makeCTOS('CTOS_HAND_RESULT', rps()));
    });
    duel.commandParser.event.on('STOC_SELECT_TP', function (input) {
        duel.server.write(makeCTOS('CTOS_TP_RESULT', 0));
    });
    duel.commandParser.event.on('MSG_START', function (input) {
        duel.gameState.fieldside =  input.playertype;
        duel.gameState.lifepoints1 = input.lifepoints1;
        duel.gameState.lifepoints2 = input.lifepoints2;
        duel.gameState.player1decksize = input.player1decksize;
        duel.gameState.player1extrasize = input.player1extrasize;
        duel.gameState.player2decksize = input.player2decksize;
        duel.gameState.player2extrasize = input.player2extrasize;
    });
    duel.commandParser.event.on('MSG_UPDATE_DATA', function (input) {
        var field = duel.gameState.field[input.player],
            output = [],
            readposition = 3,
            failed = false,
            player = input.player,
            clocation = input.clocation,
            buffer = input.message,
            i = 0,
            count,
            len;

        if (field[enums.locations[clocation]] !== undefined) {
            for (i, count = field[enums.locations[clocation]]; count > i; i++) {
                try {
                    len = buffer.readUInt8(readposition);
                    readposition = readposition + 4;
                    if (len > 8) {
                        var result = makeCard(buffer, readposition, player);
                        output.push(result.card);
                        readposition = readposition + len - 4;

                    } else {
                        output.push({
                            Code: 'nocard'
                        });
                    }
                } catch (e) {
                    console.log('overshot', e);
                    failed = true;
                    game.additional = {
                        player: player,
                        clocation: clocation,
                        buffer: buffer
                    };
                }
            }
            if (!failed) {
                game.additional = false;
            }
            //console.log(output);

            game.UpdateCards(player, clocation, output);
        }
        
    });
    duel.commandParser.event.on('STOC_TIME_LIMIT', function (input) {
       
    });

}
module.exports = Duel;
//
var a = new Duel('200OOO8000,0,5,1,U,f0MUg');