/*eslint no-plusplus: 0*/
'use strict';

/**
 * @typedef {Object} YGOProMessage
 * @property {String} command given action command
 * @property {String} duelAction UI component being effected
 */

/**
 * @typedef {Buffer} Packet
 */

const enums = require('./translate_ygopro_enums.js'),
    stoc_game_msg = require('./translate_ygopro_game'),
    BufferStreamReader = require('./model_stream_reader');

/**
 * A command was sent and there was no logic for it.
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_unknown(packet, translationError) {
    process.exit();
    return {
        duelAction: 'ygopro',
        command: 'STOC_UNKNOWN',
        attempted_command: packet.command,
        packet: packet,
        translationError
    };
}

/**
 * YGOPro Error Event
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_error_msg(packet) {
    const BufferIO = new BufferStreamReader(packet),
        message = {
            duelAction: 'ygopro',
            command: packet.command
        };

    message.command = enums.STOC.STOC_ERROR_MSG[BufferIO.readInt8()];
    // set the screen back to the join screen.
    switch (message.command) {

        case ('ERRMSG_JOINERROR'):
            break;
        case ('ERRMSG_DECKERROR'):
            message.errorCode = packet.message[1];
            message.cardID = packet.message.readUInt32LE(1);
            // complain about deck error. Invalid Deck.
            message.error = enums.STOC.STOC_ERROR_MSG.ERRMSG_DECKERROR[message.errorCode];
            break;

        case ('ERRMSG_SIDEERROR'):
            // complain about side deck error.
            break;
        case ('ERRMSG_VERERROR'):
            //wierd math to get the version number, displays and complains about it then resets.
            break;
        default:
    }
    return message;
}

/**
 * Trigger RPS hand selection screen
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_select_hand(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command
    };
}

/**
 * Trigger Turn Player select screen
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_select_tp(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command
    };
}

/**
 * Display RPS Turn results "SHOOT"
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_hand_result(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command,
        showcardcode: (packet.message[0] - 1) + ((packet.message[1] - 1) << 16),
        showcarddif: 50,
        showcardp: 0,
        showcard: 100,
        res1: packet.message[0],
        res2: packet.message[1]
    };

}

/**
 * Display turn player selection result
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_tp_result(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command
    };
}

/**
 * Trigger Side decking/boarding
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_change_side(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command
    };
}

/**
 * Trigger waiting on opponent notification
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_waiting_side(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command
    };
}

/**
 * Trigger new game room
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_create_game(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command
    };
}

/**
 * Display new user information of a user that just joined the room
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_join_game(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command,
        banlistHashCode: packet.message.readUInt16LE(0),
        rule: packet.message[4],
        mode: packet.message[5],
        prio: packet.message[8],
        deckcheck: packet.message[7],
        noshuffle: packet.message[8],
        startLP: packet.message.readUInt16LE(12),
        start_hand: packet.message[16],
        draw_count: packet.message[17],
        time_limit: packet.message.readUInt16LE(18)
    };
}

/**
 * Trigger removal of a player
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_leave_game(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command
    };
}

/**
 * Trigger player room status update [dueling vs watching vs locked in]
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_type_change(packet) {
    const typec = packet.message[0];
    return {
        duelAction: 'ygopro',
        command: packet.command,
        pos: (typec & 0xF),
        ishost: ((typec >> 4) & 0xF) !== 0
    };
}

/**
 * Trigger duel start
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_start_duel(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command
    };
}

/**
 * Trigger duel end
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_start_end(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command
    };
}

/**
 * Process Replay
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_replay(packet) {
    // logic incomplete
    return {
        duelAction: 'ygopro',
        command: packet.command
    };

}

/**
 * Display new time remaining
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_time_limit(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command,
        player: packet.message[0],
        time: packet.message[1] + packet.message[2]
    };
}

/**
 * Display chat message
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_chat(packet) {
    const chat = packet.message.toString('utf16le', 2).replace(/\0/g, '');
    return {
        duelAction: 'ygopro',
        command: packet.command,
        from: (packet.message[0] + packet.message[1]),
        chat,
        len: chat.length
    };
}

/**
 * Display new player that has entered as a duelist
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_hs_player_enter(packet) {
    const person = packet.message.toString('utf16le', 0, 39).replace(/\0/g, '').replace('\u0000', '');
    return {
        duelAction: 'ygopro',
        command: packet.command,
        person
    };
}

/**
 * Display the new lock status of a player
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_hs_player_change(packet) {
    const change = packet.message[0],
        state = change & 0xF;
    return {
        duelAction: 'ygopro',
        command: packet.command,
        change,
        changepos: (change >> 4) & 0xF,
        state,
        stateText: enums.lobbyStates[state]
    };
}

/**
 * Display the new updated spectator count
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_hs_watch_change(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command,
        spectators: packet.message[0]
    };
}

/**
 * Trigger duel start
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_duel_start(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command
    };
}

/**
 * Trigger duel end
 * @param {Buffer} packet message data stream
 * @returns {YGOProMessage} augmented YGOProMessage
 */
function stoc_duel_end(packet) {
    return {
        duelAction: 'ygopro',
        command: packet.command
    };

}

/**
 * Take a delimited packet and turn it into a JavaScript Object.
 * @param {Object} gameBoard instance of the manual engine the player is using.
 * @param {Packet} packet delimited buffer of information containing a YGOProMessage.
 * @returns {YGOProMessage} Object with various types of information stored in it.
 */
function recieveSTOC(gameBoard, packet) {
    const translator = {
        STOC_UNKNOWN: stoc_unknown,
        STOC_GAME_MSG: stoc_game_msg,
        STOC_ERROR_MSG: stoc_error_msg,
        STOC_SELECT_HAND: stoc_select_hand,
        STOC_SELECT_TP: stoc_select_tp,
        STOC_HAND_RESULT: stoc_hand_result,
        STOC_TP_RESULT: stoc_tp_result,
        STOC_CHANGE_SIDE: stoc_change_side,
        STOC_WAITING_SIDE: stoc_waiting_side,
        STOC_CREATE_GAME: stoc_create_game,
        STOC_JOIN_GAME: stoc_join_game,
        STOC_TYPE_CHANGE: stoc_type_change,
        STOC_LEAVE_GAME: stoc_leave_game,
        STOC_DUEL_START: stoc_duel_start,
        STOC_DUEL_END: stoc_duel_end,
        STOC_REPLAY: stoc_replay,
        STOC_TIME_LIMIT: stoc_time_limit,
        STOC_CHAT: stoc_chat,
        STOC_HS_PLAYER_ENTER: stoc_hs_player_enter,
        STOC_HS_PLAYER_CHANGE: stoc_hs_player_change,
        STOC_HS_WATCH_CHANGE: stoc_hs_watch_change
    };
    try {
        return translator[packet.command](packet, {}, gameBoard);
    } catch (error) {
        console.log(`${packet.command} is not routed`, error);
        return stoc_unknown(packet);
    }
}

module.exports = Object.assign(recieveSTOC, {
    stoc_unknown,
    stoc_game_msg,
    stoc_error_msg,
    stoc_select_hand,
    stoc_select_tp,
    stoc_hand_result,
    stoc_tp_result,
    stoc_change_side,
    stoc_waiting_side,
    stoc_create_game,
    stoc_join_game,
    stoc_type_change,
    stoc_leave_game,
    stoc_duel_start,
    stoc_duel_end,
    stoc_replay,
    stoc_time_limit,
    stoc_chat,
    stoc_hs_player_enter,
    stoc_hs_player_change,
    stoc_hs_watch_change
});