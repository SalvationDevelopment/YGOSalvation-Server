/*jslint browser:true, plusplus : true, bitwise : true*/
/*globals WebSocket, Buffer, Uint8Array, enums, makeCard, recieveSTOC, gui*/
// buffer.js
// card.js
// gui.js

function gui(input) {
    console.log(input);
}

function CommandParser() {
    'use strict';

    // OK!!!! HARD PART!!!!
    // recieveSTOC.js should have created obejects with all the parameters as properites, fire the functions.
    // Dont try to pull data out of a packet here, should have been done already.
    // its done here because we might need to pass in STATE to the functions also.
    // again if you are fiddling with a packet you are doing it wrong!!!
    // data decode and command execution are different conserns.
    // if a COMMAND results in a response, save it as RESPONSE, else return the function false.

    var protoResponse = [],
        responseRequired = false,
        output = {};

    output.event = new events.EventEmitter();

    output.input = function (input) {
        console.log(input);
        if (input.STOC_GAME_MSG) {
            output.event.emit(input.command, input);
        }
        if (input.STOC_UNKNOWN) {
            output.event.emit('STOC_UNKNOWN', input);
        }
        if (input.STOC_SELECT_HAND) {
            output.event.emit('STOC_SELECT_HAND', input);
        }
        if (input.STOC_JOIN_GAME) {
            output.event.emit('STOC_JOIN_GAME', input);
        }
        if (input.STOC_SELECT_TP) {
            output.event.emit('STOC_SELECT_TP', input);
        }
        if (input.STOC_HAND_RESULT) {
            output.event.emit('STOC_HAND_RESULT', input);
        }
        if (input.STOC_TP_RESULT) {
            output.event.emit('STOC_TP_RESULT', input);
        }
        if (input.STOC_CHANGE_SIDE) {
            output.event.emit('STOC_CHANGE_SIDE', input);
        }
        if (input.STOC_WAITING_SIDE) {
            output.event.emit('STOC_WAITING_SIDE', input);
        }
        if (input.STOC_CREATE_GAME) {
            output.event.emit('STOC_CREATE_GAME', input);
        }
        if (input.STOC_TYPE_CHANGE) {
            output.event.emit('STOC_TYPE_CHANGE', input);
        }
        if (input.STOC_LEAVE_GAME) {
            output.event.emit('STOC_LEAVE_GAME', input);
        }
        if (input.STOC_DUEL_START) {
            output.event.emit('STOC_DUEL_START', input);
        }
        if (input.STOC_DUEL_END) {
            output.event.emit('STOC_DUEL_END', input);
        }
        if (input.STOC_REPLAY) {
            output.event.emit('STOC_REPLAY', input);
        }
        if (input.STOC_TIME_LIMIT) {
            output.event.emit('STOC_TIME_LIMIT', input);
        }
        if (input.STOC_CHAT) {
            output.event.emit('STOC_CHAT', input);
        }
        if (input.STOC_HS_PLAYER_ENTER) {
            output.event.emit('STOC_HS_PLAYER_ENTER', input);
        }

        if (input.STOC_HS_PLAYER_CHANGE) {
            output.event.emit('STOC_HS_PLAYER_CHANGE', input);
        }
        if (input.STOC_HS_WATCH_CHANGE) {
            output.event.emit('STOC_HS_WATCH_CHANGE', input);
        }
    };
    return output;
}


function Framemaker() {
    "use strict";
    var memory = new Buffer([]);

    this.input = function (buffer) {
        var x = true,
            output = [],
            recordOfBuffer,
            frame_length;
        //console.log('before', memory.length, 'bytes in memory');
        memory = Buffer.concat([memory, buffer]);
        //console.log('concated', memory.length);
        while (x === true && memory.length > 2) {
            frame_length = memory[0] + memory[1];
            //console.log('read', frame_length, '(+2) of', memory.length, 'bytes');
            if ((memory.length - 2) < frame_length) {
                //console.log('not enough');
                x = false;
            } else {
                recordOfBuffer = memory.slice(2).toJSON();
                output.push(recordOfBuffer);
                if (memory.length === (frame_length + 2)) {
                    memory = new Buffer([]);
                    x = false;
                } else {
                    memory = memory.slice((frame_length + 2));
                }
                //console.log('after', memory.length);
            }
        }
        //console.log('----',output);
        return output;
    };
    return this;
}

function BufferStreamReader(packet) {
    'use strict';
    /* FH, Buttys, and Tenkei have very annoying code to replicate
    in JavaScript of and around the reading of streammed network
    buffers, this should make it easier. */
    var readposition = 0;
    this.packet = packet; // maybe this should be read only.
    this.readposition = function () {
        return readposition;
    };
    this.setReadposition = function (value) {
        readposition = Number(value);
        return readposition;
    };
    this.ReadInt8 = function () {
        // read 1 byte
        var output = packet[readposition];
        readposition++;
        return output;
    };
    this.ReadUInt8 = this.ReadInt8;
    this.ReadInt16 = function () {
        var output = packet.readUInt16LE(readposition);
        readposition += 2;
        return output;
    };
    this.ReadInt32 = function () {
        var output = packet.readUInt32LELE(readposition);
        readposition += 4;
        return output;
    };
    return this;
    // I should later comeback and make this completely array based.
}

function parsePackets(command, message) {
    "use strict";

    var task = [],
        packet = {
            message: message.slice(1),
            readposition: 0
        };
    packet[command] = enums[command][message[0]];
    task.push(packet);
    return task;
}

function makeCTOS(command, message) {
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
        console.log(message);
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
            version = new Buffer([0x34, 0x13]),
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
        //console.log('sending result', proto);
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


/*globals console*/
//"ws://192.99.11.19:8082"
function startgame(roompass) {
    'use strict';
    try {
        window.ws.close();
    } catch (noWebSocket) {
        //no previous websocket dont worry about it.
    }
    if (localStorage.nickname === undefined) {
        console.log('localStorage.nickname is undefined, required!');
        return;
    }
    var framer = new Framemaker(),
        ws = new WebSocket("ws://127.0.0.1:8082", "duel");
    ws.binaryType = 'arraybuffer';

    ws.onconnect = function () {


    };
    ws.onerror = function () {
        console.log('There was an error with the websocket');
        ws.close();
    };
    ws.onclose = function () {
        console.log('Websocket died');
    };
    ws.onmessage = function (data) {
        var q = new Buffer(new Uint8Array(data.data)),
            frame,
            task,
            newframes = 0,
            commands,
            l = 0,
            reply;


        frame = framer.input(q);
        for (newframes; frame.length > newframes; newframes++) {
            task = parsePackets('STOC', new Buffer(frame[newframes]));
            //console.log('!', task);
            commands = processTask(task);
            // process AI
            //console.log(task);
            l = 0;
            for (l; commands.length > l; l++) {
                gui(commands[l]);
            }


        }
        frame = [];
    };
    ws.onopen = function () {
        console.log('Send Game request for', roompass);
        var name = makeCTOS('CTOS_PlayerInfo', localStorage.nickname),
            join = makeCTOS('CTOS_JoinGame', roompass),
            toduelist = makeCTOS('CTOS_HS_TODUELIST'),
            tosend = Buffer.concat([name, join, toduelist]);
        window.ws.send(tosend);
    };
    window.ws = ws;

}