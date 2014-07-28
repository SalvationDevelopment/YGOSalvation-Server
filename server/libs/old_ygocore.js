/* we are using JSLint to annoy us so here are some globals */
/* jslint node : true*/
var fs = require('fs');
var WebSocket = require('ws'); /* websockets, need better option */
var ffi = require('ffi'); /* allows dynamic linking of the ocgapi.dll, critical; */
var ref = require('ref'); /* allows use of C++ pointers for C++ JS interactions, critical */
var struct = require('ref-struct'); /* allows use of C++ structures for C++ JS interactions, critical */
var MersenneTwister = require('mersennetwister'); /* seed number generator to give the shuffler, makes a random number.*/
var cardDatabase;
// load DB

var db = new sqlite3.Database('cards.cdb');
var sqlcommands = {};
sqlcommands.getdb = "SELECT * FROM 'datas'";

db.each(stmt, function (err, row) {
    console.log(row);
});

//Constances
if (process.argv) {
    console.log(process.argv);
}
var launchpostion = 0;

var configuration = {
    'version': (1),
    'port': (1337),
    'banlist': (0),
    'cardpool': (2),
    'gamemode': (2),
    'priority': (0),
    'deckcheck': (0),
    'shuffle': (0),
    'startLP': (8000),
    'starthand': (5),
    'draw': (1),
    'timer': (180),
    'production': (0)
};
var gamestate = {
    started: false,
    player0: null,
    player1: null,
    player2: null,
    player3: null,
    spectators: 0,
    gamerules: '',
    ranked: false,
    start_time: null,
    url: 'ws://angelofcode.com:' + configuration.port + '/ygocorejs' /* websocket/port this instance of the core is running on */
};
//console.log('Configuration Loaded');

var player1 = 0;
var player2 = 1;

/* object definition for a card*/
var card_data =


    function script_reader(request) {
        console.log(request);
        return fs.fsReadSynch('c' + request.script_name);
    };

function card_reader(request) {
    var code = request.code;
    var data = request.data;
    return struct({
        code: 'uint32',
        alias: 'uint32',
        setcode: 'uint64',
        type: 'uint32',
        level: 'uint32',
        attribute: 'uint32',
        race: 'uint32',
        attack: 'int32',
        defence: 'int32'
    });
}
var pduel = ref.refType('uint32');
var message_handler = struct({
    pduel: pduel,
    message_type: 'uint32'
});
var get_message_pointer = ref.refType('byte');
var ocgapi = ffi.Library(__dirname + '/ocgcore.dll', {
    //    'set_script_reader'  : ['void',  [script_reader] ],
    //    'set_card_reader'    : ['void',  [card_reader] ],
    //    'set_message_handler': ['void',  [message_handler] ],
    'create_duel': ['pointer', ['uint32']],
    'start_duel': ['void', ['pointer', 'int']],
    'end_duel': ['void', ['pointer']],
    'set_player_info': ['void', ['pointer', 'int32', 'int32', 'int32', 'int32']],
    'get_log_message': ['void', ['pointer', 'byte*']],
    'get_message': ['int32', ['pointer', get_message_pointer]],
    'process': ['int32', ['pointer']],
    'new_card': ['void', ['pointer', 'uint32', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8']],
    'new_tag_card': ['void', ['pointer', 'uint32', 'uint8', 'uint8']],
    'query_card': ['int32', ['pointer', 'uint8', 'uint8', 'int32', 'byte*', 'int32']],
    'query_field_count': ['int32', ['pointer', 'uint8', 'uint8']],
    'query_field_card': ['int32', ['pointer', 'uint8', 'uint8', 'int32', 'byte*', 'int32']],
    'query_field_info': ['int32', ['pointer', 'byte*']],
    'set_responsei': ['void', ['pointer', 'int32']],
    'set_responseb': ['void', ['pointer', 'byte*']],
    'preload_script': ['int32', ['pointer', 'char*', 'int32']]
});
/* 'function_name' : ['type', ['typeforParam1', 'typeforParam2']]
function_name(typeforParam1, typeforParam2, etc,..){
 dllprocessing...
 return type;
}
*/
console.log('OCGCore Engine Loaded');
var player1deck = require('./sample.deck.json');
var player2deck = require('./sample.deck.json');

function loaddeck(deck, playerid) {
    for (var m = 0; m < deck.main.length; m++) {
        ocgapi.new_card(pduel, deck.main[m], playerid, playerid, 0x2, m, 0x01);
    }
    for (var e = 0; e < deck.extra.length; e++) {
        ocgapi.new_card(pduel, deck.extra[e], playerid, playerid, 0x40, e, 0x01);
    }

}

var mt = new MersenneTwister();
console.log('Parsing banlist');
var lflist = fs.readFileSync('lflist.conf').toString().split("\r\n");
var banlist = (function (lflist) {
    var banlistcount = 0;
    var toreturn = [];
    for (var i = 0; lflist.length > 0; i++) {
        if (lflist[i] !== undefined) {
            if (lflist[i] !== '') {

                if (lflist[i][0] !== '#') {
                    if (lflist[i][0] === '!') {
                        banlistcount++;
                        if (!toreturn[banlistcount]) {
                            toreturn[banlistcount] = [];
                        }

                    } else {

                        if (lflist[i].indexOf(' ') > -1) {
                            var toArray = lflist[i].split(' ');


                            var topush = {
                                cardId: toArray[0],
                                quantity: toArray[1]
                            };

                            toreturn[banlistcount].push(topush);
                        }
                    }
                }
            }
        }
        console.log('done');
    }
    return toreturn;
});
var seed = mt.int();
console.log('Virtualizing Duel :', seed);

var pduel = ocgapi.create_duel(seed);
//ocgapi.set_script_reader(script_reader);
//ocgapi.set_card_reader(card_reader);
//ocgapi.set_message_handler(message_handler);
ocgapi.set_player_info(pduel, player1, configuration.startLP, configuration.starthand, configuration.draw);
ocgapi.set_player_info(pduel, player2, configuration.startLP, configuration.starthand, configuration.draw);
loaddeck(player1deck, player1);
loaddeck(player2deck, player2);
ocgapi.start_duel(pduel, 0);
process();

function process() {
    var engineBuffer = new Buffer(0x1000);
    var engFlag = 0,
        engLen = 0;
    var stop = 0;
    while (!stop) {
        if (engFlag === 2) {
            break;
        }
        var result = ocgapi.process(pduel);
        engLen = result & 0xffff;
        engFlag = result >> 16;
        if (engLen > 0) {
            ocgapi.get_message(pduel, engineBuffer);
            console.log(engFlag, engLen, stop);
            stop = Analyze(engineBuffer, engLen);
        }
    }
    if (stop == 2) {
        console.log('duel ended');
    }
}

function Analyze(msgbuffer, len) {

    var offset, pbufw, pbuf = msgbuffer;
    var player, count, type;
    console.log(pbuf - msgbuffer < len);
    while (1) {
        console.log(pbuf - msgbuffer);
        //offset = pbuf;

        var engType = pbuf.readUInt8(0);
        console.log('Enumals', engType);
        switch (engType) {
        case MSG_RETRY:
            {
                return 1; /*MSG_RETRY*/
            }
            break;
        case MSG_HINT:
            {
                return 2; /*MSG_HINT*/
            }
            break;
        case MSG_WIN:
            {
                return 2; /*MSG_WIN*/
            }
            break;
        case MSG_SELECT_BATTLECMD:
            {
                return 1; /*MSG_SELECT_BATTLECMD*/
            }
            break;
        case MSG_SELECT_IDLECMD:
            {
                return 1; /*MSG_SELECT_IDLECMD*/
            }
            break;
        case MSG_SELECT_EFFECTYN:
            {
                return 1; /*MSG_SELECT_EFFECTYN*/
            }
            break;
        case MSG_SELECT_YESNO:
            {
                return 1; /*MSG_SELECT_YESNO*/
            }
            break;
        case MSG_SELECT_OPTION:
            {
                return 1;
            }
            break;
        case MSG_SELECT_CARD:
            { /*falls through to tribute in single_player*/ }
            break;
        case MSG_SELECT_TRIBUTE:
            {
                return 1;
            }
            break;
        case MSG_SELECT_CHAIN:
            {
                return 1; /*MSG_SELECT_CHAIN*/
            }
            break;
        case MSG_SELECT_PLACE:
            { /*Falls through to MSG_SELECT_DISFIELD*/ }
            break;
        case MSG_SELECT_DISFIELD:
            {
                return 1;
            }
            break;
        case MSG_SELECT_POSITION:
            {
                return 1;
            }
            break;
        case MSG_SELECT_COUNTER:
            {
                return 1;
            }
            break;
        case MSG_SELECT_SUM:
            {
                return 1;
            }
            break;
        case MSG_SORT_CARD:
            { /* falls through to MSG_SORT_CHAIN */ }
            break;
        case MSG_SORT_CHAIN:
            {
                return 1;
            }
            break;
        case MSG_CONFIRM_DECKTOP:
            { /*no return*/ }
            break;
        case MSG_CONFIRM_CARDS:
            { /*no return*/ }
            break;
        case MSG_SHUFFLE_DECK:
            { /*no return*/ }
            break;
        case MSG_SHUFFLE_HAND:
            { /*no return until end*/ }
            break;
        case MSG_REFRESH_DECK:
            {}
            break;
        case MSG_SWAP_GRAVE_DECK:
            {}
            break;
        case MSG_REVERSE_DECK:
            {}
            break;
        case MSG_DECK_TOP:
            {}
            break;
        case MSG_SHUFFLE_SET_CARD:
            {}
            break;
        case MSG_NEW_TURN:
            {}
            break;
        case MSG_NEW_PHASE:
            {}
            break;
        case MSG_MOVE:
            {}
            break;
        case MSG_POS_CHANGE:
            {}
            break;
        case MSG_SET:
            {}
            break;
        case MSG_SWAP:
            {}
            break;
        case MSG_FIELD_DISABLED:
            {}
            break;
        case MSG_SUMMONING:
            {}
            break;
        case MSG_SUMMONED:
            {}
            break;
        case MSG_SPSUMMONING:
            {}
            break;
        case MSG_SPSUMMONED:
            {}
            break;
        case MSG_FLIPSUMMONING:
            {}
            break;
        case MSG_FLIPSUMMONED:
            {}
            break;
        case MSG_CHAINING:
            {}
            break;
        case MSG_CHAINED:
            {}
            break;
        case MSG_CHAIN_SOLVING:
            {}
            break;
        case MSG_CHAIN_SOLVED:
            {}
            break;
        case MSG_CHAIN_END:
            {}
            break;
        case MSG_CHAIN_NEGATED:
            {}
            break;
        case MSG_CHAIN_DISABLED:
            {}
            break;
        case MSG_CARD_SELECTED:
            {}
            break;
        case MSG_RANDOM_SELECTED:
            {}
            break;
        case MSG_BECOME_TARGET:
            {}
            break;
        case MSG_DRAW:
            {}
            break;
        case MSG_DAMAGE:
            {}
            break;
        case MSG_RECOVER:
            {}
            break;
        case MSG_EQUIP:
            {}
            break;
        case MSG_LPUPDATE:
            {}
            break;
        case MSG_UNEQUIP:
            {}
            break;
        case MSG_CARD_TARGET:
            {}
            break;
        case MSG_CANCEL_TARGET:
            {}
            break;
        case MSG_PAY_LPCOST:
            {}
            break;
        case MSG_ADD_COUNTER:
            {}
            break;
        case MSG_REMOVE_COUNTER:
            {}
            break;
        case MSG_ATTACK:
            {}
            break;
        case MSG_BATTLE:
            {}
            break;
        case MSG_ATTACK_DISABLED:
            {}
            break;
        case MSG_DAMAGE_STEP_START:
            {}
            break;
        case MSG_DAMAGE_STEP_END:
            {}
            break;
        case MSG_MISSED_EFFECT:
            {}
            break;
        case MSG_TOSS_COIN:
            {}
            break;
        case MSG_TOSS_DICE:
            {}
            break;
        case MSG_ANNOUNCE_RACE:
            {}
            break;
        case MSG_ANNOUNCE_ATTRIB:
            {}
            break;
        case MSG_ANNOUNCE_CARD:
            {}
            break;
        case MSG_ANNOUNCE_NUMBER:
            {}
            break;
        case MSG_CARD_HINT:
            {}
            break;
        case MSG_MATCH_KILL:
            {}
            break;


        }
    }
    return 0;


}


/* checks if we started from node(true), or started from the command prompt(false) */





//console.log('Listening at :', gamestate.url);
//var clientlistener = new WebSocket(gamestate.url);
//
//clientlistener.on('message', function(){
//    
//});




console.log('moving along');