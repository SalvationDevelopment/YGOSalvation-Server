/*jslint node: true*/
var enums = require('./enums.js');

module.exports = function recieveSTOC(packet) {
    'use strict';
    var task = Object.create(enums.STOCCheck),
        makeCard = require('server/http/js/makeCard.js'),
        command,
        game_message;

    task[packet.STOC] = {};
    task[packet.STOC].message = packet;
    switch (packet.STOC) {
    case ("STOC_UNKNOWN"):
        break;

    case ("STOC_GAME_MSG"):
        command = enums.STOC.STOC_GAME_MSG[task.STOC_GAME_MSG.message[0]];
        task.STOC_GAME_MSG.command = command;
        game_message = task.STOC_GAME_MSG.message;
        if (command === undefined) {
            console.log('figure out STOC', task.STOC_GAME_MSG);
        }
        console.log(command);
        if (command === 'MSG_START') {
            task.STOC_GAME_MSG.type = game_message[1];
            task.STOC_GAME_MSG.lifepoints1 = game_message.readUInt16LE(2);
            task.STOC_GAME_MSG.lifepoints2 = game_message.readUInt16LE(6);
            task.STOC_GAME_MSG.player1decksize = game_message.readUInt8(10);
            task.STOC_GAME_MSG.player1extrasize = game_message.readUInt8(12);
            task.STOC_GAME_MSG.player2decksize = game_message.readUInt8(14);
            task.STOC_GAME_MSG.player2extrasize = game_message.readUInt8(16);

        } else if (command === 'MSG_HINT') {
            console.log('MSG_HINT', game_message);
            task.STOC_GAME_MSG.hintplayer = game_message[1];
            task.STOC_GAME_MSG.hintcont = game_message[2];
            task.STOC_GAME_MSG.hintspeccount = game_message[3];
            task.STOC_GAME_MSG.hintforce = game_message[4];

        } else if (command === 'MSG_NEW_TURN') {
            break;
        } else if (command === 'MSG_WIN') {
            break; //console.log('Win', game_message[1]);
        } else if (command === 'MSG_NEW_PHASE') {
            break; //
        } else if (command === 'MSG_DRAW') {
            task.STOC_GAME_MSG.drawplayer = game_message[1];
            task.STOC_GAME_MSG.draw = game_message[2];
            task.STOC_GAME_MSG.cardslist = [];
            task.STOC_GAME_MSG.drawReadposition = 3;
        } else if (command === 'MSG_SHUFFLE_DECK') {
            task.STOC_GAME_MSG.shuffle = game_message[1];

        } else if (command === 'MSG_SHUFFLE_HAND') {
            task.STOC_GAME_MSG.layout = game_message[1];
        } else if (command === 'MSG_CHAINING') {
            break; //
        } else if (command === 'MSG_CHAINED') {
            task.STOC_GAME_MSG.ct = game_message[1];

        } else if (command === 'MSG_CHAIN_SOLVING') {
            task.STOC_GAME_MSG.ct = game_message[1];

        } else if (command === 'MSG_CHAIN_SOLVED') {
            break;
        } else if (command === 'MSG_CHAIN_END') {
            break; // remove any liggering chain parts
        } else if (command === 'MSG_CHAIN_NEGATED' || command === 'MSG_CHAIN_DISABLED') {
            break; //graphical and trigger only for replay
        } else if (command === 'MSG_CARD_SELECTED') {
            break; // trigger
        } else if (command === 'MSG_CARD_SELECTED') {
            /*  player = game_message[1];*/
            task.STOC_GAME_MSG.count = game_message[2];

        } else if (command === 'MSG_PAY_LPCOST') {
            task.STOC_GAME_MSG.player = game_message[1];
            task.STOC_GAME_MSG.lpcost = game_message.readUInt16LE(2);

        } else if (command === 'MSG_DAMAGE') {
            task.STOC_GAME_MSG.player = game_message[1];
            task.STOC_GAME_MSG.damage = game_message.readUInt16LE(2);
        } else if (command === 'MSG_SUMMONING ') {
            //ignoring
            break;
        } else if (command === 'MSG_SELECT_IDLECMD') {
            task.STOC_GAME_MSG.idleplayer = game_message[1];

        } else if (command === 'MSG_MOVE') {
            task.STOC_GAME_MSG.code = game_message.readUInt16LE(1);
            task.STOC_GAME_MSG.pc = game_message[5]; // original controller
            task.STOC_GAME_MSG.pl = game_message[6]; // original cLocation
            task.STOC_GAME_MSG.ps = game_message[7]; // original sequence (index)
            task.STOC_GAME_MSG.pp = game_message[8]; // padding??
            task.STOC_GAME_MSG.cc = game_message[9]; // current controller
            task.STOC_GAME_MSG.cl = game_message[10]; // current cLocation
            task.STOC_GAME_MSG.cs = game_message[11]; // current sequence (index)
            task.STOC_GAME_MSG.cp = game_message[12]; // current position
            task.STOC_GAME_MSG.reason = game_message.readUInt16LE[12]; //debug data??

        } else if (command === 'MSG_POS_CHANGE') {
            task.STOC_GAME_MSG.code = game_message.readUInt16LE(1);
            task.STOC_GAME_MSG.cc = game_message[5]; // current controller
            task.STOC_GAME_MSG.cl = game_message[6]; // current cLocation
            task.STOC_GAME_MSG.cs = game_message[7]; // current sequence (index)
            task.STOC_GAME_MSG.pp = game_message[8]; // padding??
            task.STOC_GAME_MSG.cp = game_message[9]; // current position

        } else if (command === 'MSG_SET') {
            // All the vars are commented out in the source.
            break;
        } else if (command === 'MSG_SWAP') {
            break;
            // code vars are commented out in the source, assuming graphical only.
        } else if (command === 'MSG_SUMMONING' || command === 'MSG_SPSUMMONING') {
            task.STOC_GAME_MSG.code = game_message.readUInt16LE(1);
        } else if (command === 'MSG_SUMMONED' || command === 'MSG_SPSUMMONED' || command === 'MSG_FLIPSUMMONED') {
            break; //graphical only
        } else if (command === 'MSG_FLIPSUMMONING') {
            // notice pp is missing, and everything is upshifted; not repeating code.
            task.STOC_GAME_MSG.code = game_message.readUInt16LE(1);
            task.STOC_GAME_MSG.cc = game_message[5]; // current controller
            task.STOC_GAME_MSG.cl = game_message[6]; // current cLocation
            task.STOC_GAME_MSG.cs = game_message[7]; // current sequence (index)
            task.STOC_GAME_MSG.cp = game_message[8]; // current position
            
        } else if (command === 'MSG_UPDATE_DATA') {
            task.STOC_GAME_MSG.player = game_message[1];
            task.STOC_GAME_MSG.fieldlocation = game_message[2];
            task.STOC_GAME_MSG.fieldmodel = enums.locations[task.STOC_GAME_MSG.fieldlocation];

        } else if (command === 'MSG_UPDATE_CARD') {
            task.STOC_GAME_MSG.udplayer = game_message[1];
            task.STOC_GAME_MSG.udfieldlocation = game_message[2];
            task.STOC_GAME_MSG.udindex = game_message[3];

            task.STOC_GAME_MSG.udcard = makeCard(game_message, 8, task.STOC_GAME_MSG.udplayer).card;
        } else {
            console.log(command, game_message);
        }
        break;

    case ("STOC_ERROR_MSG"):
        break;

    case ("STOC_SELECT_HAND"):
        break;

    case ("STOC_SELECT_TP"):
        break;

    case ("STOC_HAND_RESULT"):
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
        break;

    case ("STOC_CHAT"):
        break;

    case ("STOC_HS_PLAYER_ENTER"):
        break;

    case ("STOC_HS_PLAYER_CHANGE"):
        break;

    case ("STOC_HS_WATCH_CHANGE"):
        break;

    }
    task.reference = packet.message;
    return task;
};