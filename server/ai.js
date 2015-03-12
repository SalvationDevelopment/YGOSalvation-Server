// load network understanding
/*jslint node:true, plusplus: true*/
var net = require('net'),
    Primus = require('Primus'),
    Framemaker = require('libs/parseframes.js'),
    internalGames = [],
    recieveSTOC = require('libs/recieveSTOC.js');

function DuelConnection(roompass) {
    //console.log('attempting link up');
    'use strict';
    var data = new Buffer(), // needs to be constructed here
        socket = {},
        duelConnections;

    duelConnections = net.connect('8891', '127.0.0.1', function () {
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
    'use strict';
    if (message === 'duel [AI]SnarkyChild') {
        bot.say('DuelServ', '!duel ' + from);
    }
    // goes to duelserv
    // goes to gamelist tree system
    // Primus takes over.
});

// AI constructor
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

//  network constructor + AI calls
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
        output = [];
    for (i; task.length > i; i++) {
        output.push(recieveSTOC(task[i], socket.username, socket.hostString));
    }

    for (l; output.length > l; l++) {
        if (output[l].STOC_UNKNOWN) {
        
        }
        if (output[l].STOC_GAME_MSG) {
        
        }
        if (output[l].STOC_SELECT_HAND) {
        
        }
        if (output[l].STOC_SELECT_TP) {
        
        }
        if (output[l].STOC_HAND_RESULT) {
        
        }
        if (output[l].STOC_TP_RESULT) {
        
        }
        if (output[l].STOC_CHANGE_SIDE) {
        
        }
        if (output[l].STOC_WAITING_SIDE) {
        
        }
        if (output[l].STOC_CREATE_GAME) {
        
        }
        if (output[l].STOC_TYPE_CHANGE) {
        
        }
        if (output[l].STOC_LEAVE_GAME) {
        
        }
        if (output[l].STOC_DUEL_START) {
        
        }
        if (output[l].STOC_DUEL_END) {
        
        }
        if (output[l].STOC_REPLAY) {
        
        }
        if (output[l].STOC_TIME_LIMIT) {
        
        }
        if (output[l].STOC_CHAT) {
        
        }
        if (output[l].STOC_HS_PLAYER_ENTER) {
        
        }
        if (output[l].STOC_HS_PLAYER_CHANGE) {
        
        }
        if (output[l].STOC_HS_WATCH_CHANGE) {
        
        }
    }
}

// duel constructor
function Duel(roompass) {
    'use strict';
    var duel = {},
        framer = new Framemaker(),
        parsePackets = require('libs/parsepackets.js');

    duel.server = new DuelConnection(roompass);
    duel.gameState = new GameState();
    duel.server.on('data', function (data) {
        var frame,
            task,
            newframes = 0;
        
        frame = framer.input(data);
        for (newframes; frame.length > newframes; newframes++) {
            task = parsePackets('STOC', new Buffer(frame[newframes]));
            processTask(task);
            // process AI
            //processIncomingTrasmission(task);
        }
        frame = [];
    });
    // create join game messages
    // send join gain messages
}

//

var http = require('http'),
    server = http.createServer(),
    primus = new Primus(server),
    Socket = primus.Socket,
    client = new Socket('http://ygopro.us:24555');


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