/*jslint node: true, bitwise: true, plusplus:true*/
var enums = require('./enums.js');

module.exports = function recieveSTOC(packet) {
    'use strict';
    var task = Object.create(enums.STOCCheck),
        makeCard = require('../http/js/card.js'),
        command,
        bitreader = 0,
        iter = 0;

    task[packet.STOC] = true;
    task.command = '';
    //console.log(packet);
    switch (packet.STOC) {
    case ("STOC_UNKNOWN"):
        break;

    case ("STOC_GAME_MSG"):
        command = enums.STOC.STOC_GAME_MSG[packet.message[0]];
        task.command = command;
        bitreader++;
        switch (command) {
        case ('MSG_RETRY'):
            break;
                
        case ('MSG_START'):
            task.playertype = packet.message[1];
            task.lifepoints1 = packet.message.readUInt16LE(2);
            task.lifepoints2 = packet.message.readUInt16LE(6);
            task.player1decksize = packet.message.readUInt8(10);
            task.player1extrasize = packet.message.readUInt8(12);
            task.player2decksize = packet.message.readUInt8(14);
            task.player2extrasize = packet.message.readUInt8(16);
            break;

        case ('MSG_HINT'):
            //console.log('MSG_HINT', packet);
            task.hintplayer = packet.message[1];
            task.hintcont = packet.message[2];
            task.hintspeccount = packet.message[3];
            task.hintforce = packet.message[4];
                //whole case system that goes here....
                //todo...
            break;

        case ('MSG_NEW_TURN'):
            task.player = packet.message[1];
            break;

        case ('MSG_WIN'):
            task.win = packet.message[1];
            //need to double check for more variables
            break;

        case ('MSG_NEW_PHASE'):
            task.phase = packet.message[1];
            break;

        case ('MSG_DRAW'):
            task.player = packet.message[1];
            task.draw = packet.message[2];
            task.cardslist = [];
            task.drawReadposition = 3;
            break;
                
        case ('MSG_SHUFFLE_DECK'):
            task.shuffle = packet.message[1];
            break;

        case ('MSG_SHUFFLE_HAND'):
            task.layout = packet.message[1];
            break;
                
        case ('MSG_CHAINING'):
            break; //
        case ('MSG_CHAINED'):
            task.ct = packet.message[1];
            break;
                
        case ('MSG_CHAIN_SOLVING'):
            task.ct = packet.message[1];
            break;

        case ('MSG_CHAIN_SOLVED'):
            break;
                
        case ('MSG_CHAIN_END'):
            break; // remove any liggering chain parts
                
        case ('MSG_CHAIN_NEGATED'):
            break; //graphical and trigger only for replay
                
        case ('MSG_CHAIN_DISABLED'):
            break; //graphical and trigger only for replay

        case ('MSG_CARD_SELECTED'):
            /*  player = packet.message[1];*/
            task.count = packet.message[2];
            break;

        case ('MSG_PAY_LPCOST'):
            task.player = packet.message[1];
            task.lp = packet.message.readUInt16LE(2);
            task.multiplier = -1;
            break;

        case ('MSG_DAMAGE'):
            task.player = packet.message[1];
            task.lp = packet.message.readUInt16LE(2);
            task.multiplier = -1;
            break;
            
        case ('MSG_RECOVER'):
            task.player = packet.message[1];
            task.lp = packet.message.readUInt16LE(2);
            task.multiplier = 1;
            break;
                
        case ('MSG_SUMMONING '):
            //ignoring
            break;
                
        case ('MSG_SELECT_IDLECMD'):
            task.command = 'MSG_SELECT_IDLECMD';
            //https://github.com/Fluorohydride/ygopro/blob/d9450dbb35676db3d5b7c2a5241a54d7f2c21e98/ocgcore/playerop.cpp#L69
            task.idleplayer = packet.message[1];
            iter = 0;
            bitreader++;
            task.summonable_cards = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.summonable_cards.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.spsummonable_cards = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.spsummonable_cards.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.repositionable_cards = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.repositionable_cards.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.msetable_cards = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.msetable_cards.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.select_chains = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.select_chains.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.ssetable_cards = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.ssetable_cards.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.select_chains = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.select_chains.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            task.bp = packet.message[bitreader];
            task.ep = packet.message[bitreader + 1];
            task.shufflecount = packet.message[bitreader + 2];
            //https://github.com/Fluorohydride/ygopro/blob/d9450dbb35676db3d5b7c2a5241a54d7f2c21e98/ocgcore/playerop.cpp#L147
            //something is gonna go wrong;
            break;

        case ('MSG_MOVE'):
            task.code = packet.message.readUInt16LE(1);
            task.pc = packet.message[5]; // original controller
            task.pl = packet.message[6]; // original cLocation
            task.ps = packet.message[7]; // original sequence (index)
            task.pp = packet.message[8]; // padding??
            task.cc = packet.message[9]; // current controller
            task.cl = packet.message[10]; // current cLocation
            task.cs = packet.message[11]; // current sequence (index)
            task.cp = packet.message[12]; // current position
            task.reason = packet.message.readUInt16LE[12]; //debug data??
            break;

        case ('MSG_POS_CHANGE'):
            task.code = packet.message.readUInt16LE(1);
            task.cc = packet.message[5]; // current controller
            task.cl = packet.message[6]; // current cLocation
            task.cs = packet.message[7]; // current sequence (index)
            task.pp = packet.message[8]; // padding??
            task.cp = packet.message[9]; // current position
            break;

        case ('MSG_SET'):
            //check for variables
            break;
                
        case ('MSG_SWAP'):
            //check for variables
            break;
                
            
        case ('MSG_SUMMONING'):
            task.code = packet.message.readUInt16LE(1);
            //check for variables
            break;
                
        case ('MSG_SPSUMMONING'):
            task.code = packet.message.readUInt16LE(1);
            break;
                
        case ('MSG_SUMMONED'):
            break; //graphical only
                
        case ('MSG_SPSUMMONED'):
            break; //graphical only
                
        case ('MSG_FLIPSUMMONED'):
            break; //graphical only
                
        case ('MSG_FLIPSUMMONING'):
            // notice pp is missing, and everything is upshifted; not repeating code.
            task.code = packet.message.readUInt16LE(1);
            task.cc = packet.message[5]; // current controller
            task.cl = packet.message[6]; // current cLocation
            task.cs = packet.message[7]; // current sequence (index)
            task.cp = packet.message[8]; // current position
            break;

        case ('MSG_REQUEST_DECK'):
                
            break;
        case ('MSG_SELECT_BATTLECMD'):
                
            break;
        case ('MSG_SELECT_EFFECTYN'):
                
            break;
                
        case ('MSG_SELECT_YESNO'):
                
            break;
        case ('MSG_SELECT_OPTION'):
                
            break;
        case ('MSG_SELECT_CARD'):
                
            break;
        case ('MSG_SELECT_CHAIN'):
                
            break;
        case ('MSG_SELECT_PLACE'):
                
            break;
        case ('MSG_SELECT_POSITION'):
                
            break;
        case ('MSG_SELECT_TRIBUTE'):
                
            break;
                
        case ('MSG_SORT_CHAIN'):
                
            break;
        case ('MSG_SELECT_COUNTER'):
                
            break;
        case ('MSG_SELECT_SUM'):
                
            break;
        case ('MSG_SELECT_DISFIELD'):
                
            break;
        case ('MSG_SORT_CARD'):
                
            break;
        case ('MSG_CONFIRM_DECKTOP'):
                
            break;
        case ('MSG_CONFIRM_CARDS'):
                
            break;
        

        case ('MSG_UPDATE_DATA'):
        
            task.player = packet.message[1];
            task.fieldlocation = packet.message[2];
            task.fieldmodel = enums.locations[task.fieldlocation];
            task.message = packet.message;
            break;

        case ('MSG_UPDATE_CARD'):
            task.udplayer = packet.message[1];
            task.udfieldlocation = packet.message[2];
            task.udindex = packet.message[3];
            task.udcard = makeCard(packet.message, 8, task.udplayer).card;
            break;
        
        case ('MSG_WAITING'):
            break;
        
        default:
            console.log('bad', command, packet, task);
            break;
        }
        return task;
    
            
    case ("STOC_ERROR_MSG"):
        command = enums.STOC.STOC_ERROR_MSG[packet.message[0]];
        switch (command) {
        case (null):
            break;
        default:
        
        }
        break;

    case ("STOC_SELECT_HAND"):
        //visual only trigger
        break;

    case ("STOC_SELECT_TP"):
        //prompt turn player trigger
        break;

    case ("STOC_HAND_RESULT"):
        task.showcardcode = (packet.message[0] - 1) + ((packet.message[1] - 1) << 16);
		task.showcarddif = 50;
		task.showcardp = 0;
		task.showcard = 100;
        task.res1 = packet.message[0];
        task.res2 = packet.message[1];
        break;

    case ("STOC_TP_RESULT"):
        break;

    case ("STOC_CHANGE_SIDE"):
        break;

    case ("STOC_WAITING_SIDE"):
        break;

    case ("STOC_CREATE_GAME"):
        break;

    case ("STOC_JOIN_GAME"):
        task.lflist = packet.message.readUInt16LE(0);
        task.rule = packet.message[2];
        task.mode = packet.message[3];
        task.prio = packet.message[4];
        task.deckcheck = packet.message[5];
        task.noshuffle = packet.message[6];
        task.startLP = packet.message.readUInt16LE(12);
        task.start_hand = packet.message.readUInt16LE(9);
        task.draw_count = packet.message[11];
        task.time_limit = packet.message.readUInt16LE(7);
        task.message = packet.message;
        break;
    case ("STOC_TYPE_CHANGE"):
        task.typec = packet.message[0];
        task.pos = task.typec & 0xF;
        task.ishost = ((task.typec >> 4) & 0xF) !== 0;
        break;

    case ("STOC_LEAVE_GAME"):
        break;

    case ("STOC_DUEL_START"):
        //trigger to start duel, nothing more.
        break;

    case ("STOC_DUEL_END"):
        //trigger to close the duel, nothing more.
        break;

    case ("STOC_REPLAY"):
        break;

    case ("STOC_TIME_LIMIT"):
        task.player = packet.message[0];
        task.time = packet.message[1] + packet.message[2];
        break;

    case ("STOC_CHAT"):
        task.from = packet.message[0] + packet.message[1];
        task.chat = packet.message.toString('utf16le', 2).replace(/\0/g, '');
        task.len = task.chat.length;
        break;

    case ("STOC_HS_PLAYER_ENTER"):
        task.person = packet.message.toString('utf16le', 0, 39).replace(/\0/g, '');
        task.messagelen = task.person.length;
        task.person = task.person.replace("\u0000", "");
        break;

    case ("STOC_HS_PLAYER_CHANGE"):
        task.change = packet.message[0];
        task.changepos = (task.change >> 4) & 0xF;
        task.state = task.change & 0xF;
            
        break;

    case ("STOC_HS_WATCH_CHANGE"):
        task.spectators = packet.message[0];
        break;

    }
    //console.log(task.command);
    return task;
};
