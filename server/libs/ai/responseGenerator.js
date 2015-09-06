/*jslint node:true*/
module.exports = function makeCTOS(command, message) {
    'use strict';
    //https://github.com/Fluorohydride/ygopro/blob/25bdab4c6d0000f841aee80c11cbf2e95ee54047/gframe/network.h
    // [len, len, CTOS_PLAYER_INFO, U, S ,E, R, N, A, M, E]
    // [len, len] is two bytes... read backwards totaled. 
    //[0, 2] = 2 "", [ 3, 2] = 26 "8 * 8 + 2"
    var say = {};

    say.CTOS_LEAVE_GAME = function () {
        var ctos = new Buffer([0x13]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_PlayerInfo = function (message) {
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
    say.CTOS_JoinGame = function (roompass) {
        var ctos = new Buffer([0x12]),
            name = Array.apply(null, new Array(60)).map(Number.prototype.valueOf, 0),
            version = new Buffer([0x32, 0x13]),
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
    say.CTOS_UPDATE_DECK = function (message) {
        //total len (excluding this)
        //ctos
        //extradeck count
        //side count
        //deck cards
        //edtra cards
        //side cards

        // (toduelist)
        // this message
        // ready message
        var ctos = new Buffer([0x2]),
            emptydeck,
            deck = new Buffer(0),
            decklist = [].concat(message.main).concat(message.extra).concat(message.side),
            decksize = new Buffer(8),
            len,
            proto = new Buffer(2),
            readposition = 0,
            card,
            x,
            q;


        for (readposition; decklist.length > 1; readposition = readposition + 2) {
            card = new Buffer(4);
            card.writeUInt32LE(decklist[0], 0);
            //console.log(decklist[0], (JSON.stringify(card)));
            deck = Buffer.concat([deck, card]);
            decklist.shift();
        }

        decksize.writeUInt16LE((message.main.length + message.extra.length), 0);
        decksize.writeUInt16LE(message.side.length, 4);
        q = new Array(1024 - 8 - deck.length);
        emptydeck = Array.apply(null, q.map(Number.prototype.valueOf, 0));
        x = new Buffer(emptydeck);
        len = ctos.length + decksize.length + deck.length;
        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, decksize, deck]);


        //console.log(proto.length, len);
        //console.log(proto, JSON.stringify(proto));
        return proto;
    };

    say.CTOS_HS_READY = function () {
        var ctos = new Buffer([0x22]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_HS_TODUELIST = function () {
        var ctos = new Buffer([0x20]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_HS_NOTREADY = function () {
        var ctos = new Buffer([0x23]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_SURRENDER = function () {
        var ctos = new Buffer([0x14]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_START = function () {
        var ctos = new Buffer([0x25]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_HS_KICK = function (id) {
        var ctos = new Buffer([0x21]),
            csk = new Buffer(id),
            len = ctos.length + csk.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, csk]);
        return proto;
    };

    say.CTOS_HAND_RESULT = function (id) {
        var ctos = new Buffer([0x3]),
            cshr = new Buffer([id]),
            len = 2,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, cshr]);
        console.log('sending result', proto);
        return proto;
    };

    say.CTOS_TP_RESULT = function (id) {
        var ctos = new Buffer([0x04]),
            cstr = new Buffer([id]),
            len = ctos.length + cstr.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, cstr]);
        return proto;
    };

    say.CTOS_RESPONSE = function (response) {
        // response should already be a buffer.
        var ctos = new Buffer([0x01]),
            len = ctos.length + response.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, response]);
        return proto;
    };

    say.CTOS_HS_TOOBSERVER = function () {
        var ctos = new Buffer([0x25]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_CHAT = function (message) {
        // be sure to add \0 at the end.
        var ctos = new Buffer([0x16]),
            chat = new Buffer(message, 'utf16le'),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, chat]);
        return proto;
    };

    return say[command](message);
};
