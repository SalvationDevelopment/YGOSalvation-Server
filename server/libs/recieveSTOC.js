/*jslint node: true*/
var enums = require('./enums.js');

module.exports = function recieveSTOC(packet) {
    'use strict';
    var task = Object.create(enums.STOCCheck),
        player,
        clocation,
        index,
        data,
        code,
        pc,
        pl,
        ps,
        pp,
        cc,
        cl,
        cs,
        cp,
        reason,
        ct;

    task[packet.STOC] = {};
    task[packet.STOC].message = packet;
    switch (packet.STOC) {
    case ("STOC_UNKNOWN"):
        break;

    case ("STOC_GAME_MSG"):
            var command = enums.STOC.STOC_GAME_MSG[task[i].STOC_GAME_MSG.message[0]];
            var game_message = task[i].STOC_GAME_MSG.message;
           
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
