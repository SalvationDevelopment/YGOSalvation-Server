/*globals Buffer*/
function rpsCalc(ishost, button) {
    'use strict';
    ishost = (ishost) ? 1 : 0;
    var buttons = {
        rock: 0,
        paper: 0,
        scissors: 0

    };
    return (ishost + buttons[button] + 1);
}

var COMMAND_SUMMON = 0,
    COMMAND_SPECIAL_SUMMON = 1,
    COMMAND_CHANGE_POS = 2,
    COMMAND_SET_MONSTER = 3,
    COMMAND_SET_ST = 4,
    COMMAND_ACTIVATE = 5,
    COMMAND_TO_NEXT_PHASE = 6,
    COMMAND_TO_END_PHASE = 7;

function makeCTOS(command, message) {
    'use strict';
    //https://github.com/Fluorohydride/ygopro/blob/25bdab4c6d0000f841aee80c11cbf2e95ee54047/gframe/network.h
    // [len, len, CTOS_PLAYER_INFO, U, S ,E, R, N, A, M, E]
    // [len, len] is two bytes... read backwards totaled. 
    //[0, 2] = 2 "", [ 3, 2] = 26 "8 * 8 + 2"
    var say = {};

    say.CTOS_LEAVE_GAME = function() {
        var ctos = new Buffer([0x13]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_PlayerInfo = function(message) {
        var ctos = new Buffer([0x10]),
            name = Array.apply(null, new Array(40)).map(Number.prototype.valueOf, 0),
            username = new Buffer(message, 'utf16le'),
            usernamef = new Buffer(name),
            x = username.copy(usernamef),
            len = usernamef.length + 1,
            proto = new Buffer(2);
        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, usernamef]);
        //console.log(proto);
        return proto;
    };
    say.CTOS_JoinGame = function(roompass) {
        var ctos = new Buffer([0x12]),
            name = Array.apply(null, new Array(60)).map(Number.prototype.valueOf, 0),
            version = new Buffer([0x38, 0x13]),
            gameid = new Buffer([75, 144, 0, 0, 0, 0]),
            pass = new Buffer(roompass, 'utf16le'),
            rpass = new Buffer(name),
            x = pass.copy(rpass),
            len = ctos.length + version.length + gameid.length + 60,
            proto = new Buffer(2);
        //unknownDataStructure = new Buffer([0,0,0,0,254,255,255,255,230,110,238,118]);
        proto.writeUInt16LE(len, 0);

        proto = Buffer.concat([proto, ctos, version, gameid, rpass]);
        //console.log(proto);
        //console.log(rpass.toString('utf16le'));
        return proto;

    };
    say.CTOS_UPDATE_DECK = function(suggestedDeck) {
        suggestedDeck = suggestedDeck || {
            main: [],
            extra: [],
            side: []
        };
        //         GamePacketWriter deck = new GamePacketWriter(CtosMessage.UpdateDeck);
        //            deck.Write(Deck.Cards.Count + Deck.ExtraCards.Count);
        //            deck.Write(Deck.SideCards.Count);
        //            foreach (NamedCard card in Deck.Cards)
        //                deck.Write(card.Id);
        //            foreach (NamedCard card in Deck.ExtraCards)
        //                deck.Write(card.Id);
        //            foreach (NamedCard card in Deck.SideCards)
        //                deck.Write(card.Id);
        //            Connection.Send(deck);
        var deck = new Buffer([0x2]),
            proto = new Buffer(2),
            r;
        r = new Buffer(4);
        r.writeUInt32LE((suggestedDeck.main.length + suggestedDeck.side.length));
        deck = Buffer.concat([deck, r]);
        r = new Buffer(4);
        r.writeUInt32LE(suggestedDeck.extra.length);
        deck = Buffer.concat([deck, r]);
        suggestedDeck.main.forEach(function(item) {
            r = new Buffer(4);
            r.writeUInt32LE(item);
            deck = Buffer.concat([deck, r]);
        });
        suggestedDeck.extra.forEach(function(item) {
            r = new Buffer(4);
            r.writeUInt32LE(item);
            deck = Buffer.concat([deck, r]);
        });
        suggestedDeck.side.forEach(function(item) {
            r = new Buffer(4);
            r.writeUInt32LE(item);
            deck = Buffer.concat([deck, r]);
        });

        proto.writeUInt16LE(deck.length, 0);
        proto = Buffer.concat([proto, deck]);
        console.log(proto, deck.length);
        return proto;

    };

    say.CTOS_HS_READY = function() {
        var ctos = new Buffer([0x22]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_HS_TODUELIST = function() {
        var ctos = new Buffer([0x20]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_HS_NOTREADY = function() {
        var ctos = new Buffer([0x23]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_SURRENDER = function() {
        var ctos = new Buffer([0x14]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_START = function() {
        var ctos = new Buffer([0x25]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_HS_KICK = function(id) {
        var ctos = new Buffer([0x24]),
            csk = new Buffer([id]),
            len = ctos.length + csk.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, csk]);
        return proto;
    };

    say.CTOS_HAND_RESULT = function(id) {
        var ctos = new Buffer([0x3]),
            cshr = new Buffer([id]),
            len = 2,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, cshr]);
        //console.log('sending result', proto);
        return proto;
    };

    say.CTOS_TP_RESULT = function(id) {
        var ctos = new Buffer([0x04]),
            cstr = new Buffer([id]),
            len = ctos.length + cstr.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, cstr]);
        return proto;
    };

    say.CTOS_RESPONSE = function(response) {
        // response should already be a buffer.
        var ctos = new Buffer([0x01]),
            len = ctos.length + response.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, response]);
        return proto;
    };

    say.CTOS_HS_TOOBSERVER = function() {
        var ctos = new Buffer([0x21]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_CHAT = function(message) {
        // be sure to add \0 at the end.
        message = message + '\u0000';
        var ctos = new Buffer([0x16]),
            chat = new Buffer(message, 'utf16le'),
            len = chat.length + 1,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, chat]);
        console.log(proto);
        return proto;
    };
    say.scissors = new Buffer([0x2, 0x0, 0x3, 0x1]);
    say.rock = new Buffer([0x2, 0x0, 0x3, 0x2]);
    say.paper = new Buffer([0x2, 0x0, 0x3, 0x3]);
    say.gofirst = new Buffer([0x1, 0x0, 0x15]);
    say.gosecond = new Buffer([0x2, 0x0, 0x4, 0x0]);


    return say[command](message);
}