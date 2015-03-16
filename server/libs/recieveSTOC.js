/*jslint node: true, bitwise: true*/
var enums = require('./enums.js');

module.exports = function recieveSTOC(packet) {
    'use strict';
    var task = Object.create(enums.STOCCheck),
        makeCard = require('server/http/js/makeCard.js'),
        command;

    task[packet.STOC] = true;
    switch (packet.STOC) {
    case ("STOC_UNKNOWN"):
        break;

    case ("STOC_GAME_MSG"):
        command = enums.STOC.STOC_GAME_MSG[task.STOC_GAME_MSG.message[0]];
        task.STOC_GAME_MSG.command = command;
        switch (command) {
        case ('MSG_START'):
            task.playertype = packet[1];
            task.lifepoints1 = packet.readUInt16LE(2);
            task.lifepoints2 = packet.readUInt16LE(6);
            task.player1decksize = packet.readUInt8(10);
            task.player1extrasize = packet.readUInt8(12);
            task.player2decksize = packet.readUInt8(14);
            task.player2extrasize = packet.readUInt8(16);
            break;

        case ('MSG_HINT'):
            console.log('MSG_HINT', packet);
            task.hintplayer = packet[1];
            task.hintcont = packet[2];
            task.hintspeccount = packet[3];
            task.hintforce = packet[4];
                //whole case system that goes here....
                //todo...
            break;

        case ('MSG_NEW_TURN'):
            task.player = packet[1];
            break;

        case ('MSG_WIN'):
            task.win = packet[1];
            //need to double check for more variables
            break;

        case ('MSG_NEW_PHASE'):
            task.phase = packet[1];
            break;

        case ('MSG_DRAW'):
            task.drawplayer = packet[1];
            task.draw = packet[2];
            task.cardslist = [];
            task.drawReadposition = 3;
            break;
                
        case ('MSG_SHUFFLE_DECK'):
            task.shuffle = packet[1];
            break;

        case ('MSG_SHUFFLE_HAND'):
            task.layout = packet[1];
            break;
                
        case ('MSG_CHAINING'):
            break; //
        case ('MSG_CHAINED'):
            task.ct = packet[1];
            break;
                
        case ('MSG_CHAIN_SOLVING'):
            task.ct = packet[1];
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
            /*  player = packet[1];*/
            task.count = packet[2];
            break;

        case ('MSG_PAY_LPCOST'):
            task.player = packet[1];
            task.lpcost = packet.readUInt16LE(2);
            break;

        case ('MSG_DAMAGE'):
            task.player = packet[1];
            task.damage = packet.readUInt16LE(2);
            break;
                
        case ('MSG_SUMMONING '):
            //ignoring
            break;
                
        case ('MSG_SELECT_IDLECMD'):
            task.STOC_GAME_MSG.idleplayer = packet[1];
            break;

        case ('MSG_MOVE'):
            task.code = packet.readUInt16LE(1);
            task.pc = packet[5]; // original controller
            task.pl = packet[6]; // original cLocation
            task.ps = packet[7]; // original sequence (index)
            task.pp = packet[8]; // padding??
            task.cc = packet[9]; // current controller
            task.cl = packet[10]; // current cLocation
            task.cs = packet[11]; // current sequence (index)
            task.cp = packet[12]; // current position
            task.reason = packet.readUInt16LE[12]; //debug data??
            break;

        case ('MSG_POS_CHANGE'):
            task.code = packet.readUInt16LE(1);
            task.cc = packet[5]; // current controller
            task.cl = packet[6]; // current cLocation
            task.cs = packet[7]; // current sequence (index)
            task.pp = packet[8]; // padding??
            task.cp = packet[9]; // current position
            break;

        case ('MSG_SET'):
            //check for variables
            break;
                
        case ('MSG_SWAP'):
            //check for variables
            break;
                
            
        case ('MSG_SUMMONING'):
            task.code = packet.readUInt16LE(1);
            //check for variables
            break;
                
        case ('MSG_SPSUMMONING'):
            task.code = packet.readUInt16LE(1);
            break;
                
        case ('MSG_SUMMONED'):
            break; //graphical only
                
        case ('MSG_SPSUMMONED'):
            break; //graphical only
                
        case ('MSG_FLIPSUMMONED'):
            break; //graphical only
                
        case ('MSG_FLIPSUMMONING'):
            // notice pp is missing, and everything is upshifted; not repeating code.
            task.code = packet.readUInt16LE(1);
            task.cc = packet[5]; // current controller
            task.cl = packet[6]; // current cLocation
            task.cs = packet[7]; // current sequence (index)
            task.cp = packet[8]; // current position
            break;

        case ('MSG_UPDATE_DATA'):
            task.player = packet[1];
            task.fieldlocation = packet[2];
            task.fieldmodel = enums.locations[task.fieldlocation];
            break;

        case ('MSG_UPDATE_CARD'):
            task.udplayer = packet[1];
            task.udfieldlocation = packet[2];
            task.udindex = packet[3];
            task.udcard = makeCard(packet, 8, task.udplayer).card;
            break;
        
        default:
            console.log(command, packet);
            break;
        }
        break;
            
    case ("STOC_ERROR_MSG"):
        break;

    case ("STOC_SELECT_HAND"):
        break;

    case ("STOC_SELECT_TP"):
        break;

    case ("STOC_HAND_RESULT"):
        task.rpschoice = packet[0];
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
        break;

    case ("STOC_TYPE_CHANGE"):
        task.typec = packet[0];
        task.pos = task.typec & 0xF;
        task.ishost = ((task.typec >> 4) & 0xF) !== 0;
        break;

    case ("STOC_LEAVE_GAME"):
        break;

    case ("STOC_DUEL_START"):
        break;

    case ("STOC_DUEL_END"):
        break;

    case ("STOC_REPLAY"):
        break;

    case ("STOC_TIME_LIMIT"):
        task.player = packet[0];
        task.time = packet[1] + packet[2];
        break;

    case ("STOC_CHAT"):
        task.from = packet[0] + packet[1];
        task.chat = packet.toString('utf16le', 2);
        break;

    case ("STOC_HS_PLAYER_ENTER"):
        task.person = packet.toString('utf16le', 0, 40);
        task.position = packet[41];
        break;

    case ("STOC_HS_PLAYER_CHANGE"):
        task.change = packet[0];
        task.changepos = (task.change >> 4) & 0xF;
        task.state = task.change & 0xF;
            
        break;

    case ("STOC_HS_WATCH_CHANGE"):
        task.spectators = packet[0];
        break;

    }
    return task;
};