/*jslint node:true, plusplus: true*/
// blah blah load dependencies
var net = require('net'), //ablity to use TCP
    Primus = require('primus'), //Primus, our Sepiroth-Qliphopth Creator God. Websocket connections.
    Framemaker = require('libs/parseframes.js'), // unfuck Flurohydrides expensive'net culture based network optimizations that make everything unreadable.
    internalGames = [], // internal list of all games the bot is playing
    recieveSTOC = require('libs/recieveSTOC.js'), // turn network data into a COMMAND and list of PARAMETERS
    http = require('http'), // SQCG Primus requires http parsing/tcp-handling
    server = http.createServer(), //throne of the God
    primus = new Primus(server), // instance of the God
    Socket = primus.Socket(), //initiation of the God
    client = new Socket('http://ygopro.us:24555'); //Connect the God to the tree.

// load network understanding

function DuelConnection(roompass, port, ip) {
    //taken from /libs/processincomingtransmission.js
    //conenct to the main server like a user via tcp
    'use strict';
    var data = new Buffer(), // needs to be constructed here
        socket = {},
        duelConnections;

    duelConnections = net.connect(port, ip, function () {
        duelConnections.setNoDelay(true);
    });
    duelConnections.on('error', function (error) {
        socket.end();
    });
    duelConnections.on('close', function () {
        socket.end();
    });
    return duelConnections;
}


// utility functions

// IRC connection
var bot,
    irc = require("irc"), // IRC Client/bot dependency
    config = {
        channels: ["#server", "#lobby"],
        server: "ygopro.us",
        botName: "[AI]SnarkyChild"
    };

//connect the bot
bot = new irc.Client(config.server, config.botName, {
    channels: config.channels
});

// connect a stupid simple bot to the IRC and have it listen for a specific command, then do stuff
bot.addListener("message", function (from, to, message) {
    'use strict';

    //said specific command
    if (message === 'duel [AI]SnarkyChild') {
        bot.say('DuelServ', '!duel ' + from);
        //ok the bot heard a duel request,
        //it is now messaging duelserv to reissue the duel request to both the bot and itself with more details.
    }

});

// AI constructor
// The AI needs these state variables to make decisions.
// STOC (server TO client) commands update this state holder.
function GameState() {
    'use strict';
    var state = {
        OppMonsterZones: [],
        AIMonsterZones: [],
        OppSpellTrapZones: [],
        AISpellTrapZones: [],
        OppGraveyard: [],
        AIGraveyard: [],
        OppBanished: [],
        AIBanished: [],
        OppHand: [],
        AIHand: [],
        OppExtraDeck: [],
        AIExtraDeck: [],
        OppMainDeck: [],
        AIMainDeck: []
    };

    function move() {

    }

    function loadDeck(player, deck, cardList) {

    }
    return {
        move: move,
        GetOppMonsterZones: function () {
            return state.OppMonsterZones;
        },
        GetAIMonsterZones: function () {
            return state.AIMonsterZones;
        },
        GetOppSpellTrapZones: function () {
            return state.OppSpellTrapZones;
        },

        GetAISpellTrapZones: function () {
            return state.AISpellTrapZones;
        },
        GetOppGraveyard: function () {
            return state.OppGraveyard;
        },
        GetAIGraveyard: function () {
            return state.AIGraveyard;
        },
        GetOppBanished: function () {
            return state.OppBanished;
        },
        GetAIBanished: function () {
            return state.AIBanished;
        },
        GetOppHand: function () {
            return state.OppHand;
        },
        GetAIHand: function () {
            return state.AIHand;
        },
        GetOppExtraDeck: function () {
            return state.OppExtraDeck;
        },
        GetAIExtraDeck: function () {
            return state.AIExtraDeck;
        },
        GetOppMainDeck: function () {
            return state.OppMainDeck;
        },
        GetAIMainDeck: function () {
            return state.AIMainDeck;
        },
        loadDeck: loadDeck
    };

}

// response constructor

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
    return 0; //return index
}

function processTask(task, socket) {
    'use strict';
    var i = 0,
        l = 0,
        output = [],
        RESPONSE = false;
    for (i; task.length > i; i++) {
        output.push(recieveSTOC(task[i]));
    }

    return output;
}


// duel constructor
function CommandParser(state, network) {
    'use strict';
    
     // OK!!!! HARD PART!!!!
    // recieveSTOC.js should have created obejects with all the parameters as properites, fire the functions.
    // Dont try to pull data out of a packet here, should have been done already.
    // its done here because we might need to pass in STATE to the functions also.
    // again if you are fiddling with a packet you are doing it wrong!!!
    // data decode and command execution are different conserns.
    // if a COMMAND results in a response, save it as RESPONSE, else return the function false.
    
    var protoResponse = [],
        responseRequired = false;
    return function (input) {
        if (input.STOC_UNKNOWN) {
            responseRequired = false;
            //bug this command is never to be hit.
        }
        if (input.STOC_GAME_MSG) {
            //case deeper, actuall gameplay
            switch (input.STOC_GAME_MSG.command) {
            case ('MSG_HINT'):
                break;

            case ('MSG_NEW_TURN'):
                break;

            case ('MSG_WIN'):
                break;

            case ('MSG_NEW_PHASE'):
                break;

            case ('MSG_DRAW'):
                break;

            case ('MSG_SHUFFLE_DECK'):
                break;

            case ('MSG_SHUFFLE_HAND'):
                break;

            case ('MSG_CHAINING'):
                break;

            case ('MSG_CHAINED'):
                break;

            case ('MSG_CHAINING_SOLVING'):
                break;

            case ('MSG_CHAIN_SOLVED'):
                break;

            case ('MSG_CHIAIN_END'):
                break;

            case ('MSG_CHAIN_NEGATED'):
                break;

            case ('MSG_CHAIN_DISABLED'):
                break;

            case ('MSG_SELECTED'):
                break;

            case ('MSG_PAY_LPCOST'):
                break;

            case ('MSG_DAMAGE'):
                break;

            case ('MSG_SELECT_IDLECMD'):
                break;

            case ('MSG_MOVE'):
                break;

            case ('MSG_POS_CHANGE'):
                break;

            case ('MSG_SET'):
                break;

            case ('MSG_SWAP'):
                break;

            case ('MSG_SUMMONING'):
                break;

            case ('MSG_SPSUMMONING'):
                break;

            case ('MSG_SUMMNED'):
                break;

            case ('MSG_FLIPSUMMONED'):
                break;

            case ('MSG_FLIPSUMMONING'):
                break;

            case ('MSG_UPDATE_DATA'):
                break;

            case ('MSG_UPDATE_CARD'):
                break;

            default:
                break;


            }
        }
        if (input.STOC_SELECT_HAND) {
            responseRequired = true;
            protoResponse.push(0x3);
            //select random
            
        }
        if (input.STOC_SELECT_TP) {
            responseRequired = true;
            protoResponse.push(0x4);
            //pick who goes first
        }
        if (input.STOC_HAND_RESULT) {
            responseRequired = false;
            //get hand result
        }
        if (input.STOC_TP_RESULT) {
            responseRequired = false;
            //who is going first after picking
        }
        if (input.STOC_CHANGE_SIDE) {
            responseRequired = false;
            //adjust side deck now
        }
        if (input.STOC_WAITING_SIDE) {
            responseRequired = false;
            //waiting on opponent to side
        }
        if (input.STOC_CREATE_GAME) {
            responseRequired = false;
        }
        if (input.STOC_TYPE_CHANGE) {
            responseRequired = false;
        }
        if (input.STOC_LEAVE_GAME) {
            responseRequired = false;
            //lobby opponent left
        }
        if (input.STOC_DUEL_START) {
            responseRequired = false;
            //duel is starting
        }
        if (input.STOC_DUEL_END) {
            responseRequired = false;
            //duel ended
        }
        if (input.STOC_REPLAY) {
            responseRequired = false;
            //replayfile
        }
        if (input.STOC_TIME_LIMIT) {
            responseRequired = true; // its a blank array on purpose because it doesnt send anything.
            //seconds left
        }
        if (input.STOC_CHAT) {
            //chat message, from
            state.log.push([input.player, input.message]);
        }
        if (input.STOC_HS_PLAYER_ENTER) {
            //player name enterd in slot
            state.lobby[input.loc] = input.player;
        }
        if (input.STOC_HS_PLAYER_CHANGE) {
            //player slot update
            state.lobby[input.loc] = input.player;
        }
        if (input.STOC_HS_WATCH_CHANGE) {
            //NUMBER OF WTACHERS changes
            state.lobby.observers = input.count;
        }
        if (responseRequired) {
            return protoResponse;
        }
    };

}

//taken from server.js, just done in reverse.
// represnts a single duel connection.
function Duel(roompass, botUsername) {
    'use strict';
    var duel = {},
        framer = new Framemaker(),
        parsePackets = require('libs/parsepackets.js');

    duel.server = new DuelConnection(roompass);
    duel.gameState = new GameState();
    duel.commandParser = new CommandParser(duel.gameState, duel.server);
    duel.server.on('connection', function () {
        //send game request
    });
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
            commands = processTask(task);
            
            // process AI
            for (l; commands.length > l; l++) {
                duel.commandParser(commands);
            }

        }
        frame = [];
    });

}

//



function joinGamelist() {
    'use strict';
    primus.write({
        action: 'join'
    });
}

primus.on('data', function (data) {
    'use strict';
    var join = false;
    console.log(data);
    if (data.clientEvent) {
        if (data.clientEvent === 'duelrequest') {
            internalGames.push(new Duel(data.roompass));
        }
        return;
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
