/*jshint strict: false */
/*jshint browser: true */
/*jshint devel: true */
/* emported enums */
/* global test, enums, ygoMODEL */

function SendCommunication(message, CTOS) {

    this.buffer_content = new ArrayBuffer((2 + (message.length * 2) + ( !! CTOS)));
    this.buffer_view = new Uint8Array(this.buffer_content);


    //The system is setup to take binary with an accuracy of manipulation at the byte level for message constuction.
    //Due to this we have to send ArrayBuffers and recive Blobs.
    //ArrayBuffers can only be defined as memory blocks and then moved around they can not be manipulated by JavaScript
    //"Views" of the ArrayBuffers map the memory into 'buckets' in an array and allow you to work on segments or wholes of it.

    var write_position = 0;
    if (CTOS) {
        this.buffer_view[0] = message.length * 2 + 1;
        this.buffer_view[2] = CTOS;
        write_position = 3;
    }
    var i, strLen, c, arrLen;
    if (typeof message === 'string') {
        for (i = 0, strLen = message.length, c = 0; i < strLen; i++, c = c + 2) {
            this.buffer_view[(c + write_position)] = message.charCodeAt(i);
        }
    }
    if (message instanceof Array) {
        for (i = 0, arrLen = message.length; i < arrLen; i++) {
            this.buffer_view[(i + write_position)] = message[i];
        }
    }
    return this;
}

function RecieveCommunication(packet) {
    switch (packet.STOC) {
    case ('STOC_GAME_MSG'):
        {
            parseGAME_MSG(packet);
        }
        break;
    case ('STOC_CHAT'):
        {
            var message_utf = [];
            for (var i = 0; packet.message.length > i; i++) {
                message_utf[i] = String.fromCharCode(packet.message[i]);
            }
            packet.message_string = message_utf.join('');
        }
    }
    console.log(packet);
    if (!debug[packet.STOC]){ debug[packet.STOC] = 0;}
    debug[packet.STOC]++;
}



var ws;
var debug = {};
ws = new WebSocket('ws://192.99.11.19:9001', 'binary');
ws.binaryType = 'arraybuffer';
ws.onopen = function (e) {
    console.log(debug.Socket = e, 'Socket Established!');

    wsjoinserver();
};
ws.onmessage = function (communication) {
    var converstionbuffer = new Uint8Array(communication.data);
    var message = Array.apply([], converstionbuffer);
    parsePackets(message);
};

function wsjoinserver() {
    var sendoff = new SendCommunication(test);
    ws.send(sendoff.buffer_content);
}

function parsePackets(message) {
    var buffer_read_position = 0;
    //console.log(message)
    //The message is stripped and turned into a normal packet so we can understand it as:
    //{length, +length, type of message, the message itself }
    //the server may send more than one at a time so lets take it one at a time.
    while (buffer_read_position < message.length) {
        var read = message[buffer_read_position] + message[(buffer_read_position + 1)];
        var packet = {
            LENGTH: read,
            STOC: enums[message[(buffer_read_position + 2)]] || message[(buffer_read_position + 2)],
            message: message.slice((buffer_read_position + 3), (buffer_read_position + 1 + read)),
            readposition: 0
        };
        packet = RecieveCommunication(packet);
        buffer_read_position = buffer_read_position + 2 + read;
    }
    //console.log(buffer_read_position, message.length, "Equal means nothing bad happened");
}

function parseGAME_MSG(packet) {
    var player, location, i, type, phase;
    packet.MSG_type = enums.STOC_GAME_MSG[packet.message[0]];
    switch (packet.MSG_type) {
    case ('MSG_RETRY'):
        {
            console.log('Something Bad Happened!!!');
            break;
        }
    case ('MSG_HINT'):
        {
            type = enums.STOC_GAME_MSG.MSG_HINT[packet.message[1]];
            break;
        }
    case (''):
        {
            break;
        }
    case (''):
        {
            break;
        }
    case (''):
        {
            break;
        }
    case ('MSG_UPDATE_DATA'):
        {
            player = packet.message[1];
            location = packet.message[2] + packet.message[3];


            console.log('Player:', player, 'Location: ', location);
            UpdateFieldCard(player, location, packet.message);

            break;
        }
    case ('MSG_NEW_TURN'):
        {
            player = packet.message[0];
            ygoMODEL.activeplayer = !player;
            ygoMODEL.activephase = 0;
            console.log('Player:', ygoMODEL.activeplayer, "'s turn");
            break;
        }
    case ('MSG_NEW_PHASE'):
        {
            phase = packet.message[0];
            ygoMODEL.activephase++;
            console.log('Phase:', ygoMODEL.activephase);
            break;
        }
    }
    return packet;
}

function UpdateFieldCard(player, location, message) {
    var list;
    var cards;
    switch (location) {
    case 'DECK':
        {
            cards = ygoMODEL[player][location];
            break;
        }
    case 'HAND':
        {
            cards = ygoMODEL[player][location];
            break;
        }
    case 'MZONE':
        {
            cards = ygoMODEL[player][location];

            break;
        }
    case 'SZONE':
        {
            cards = ygoMODEL[player][location];
            break;
        }
    case 'GRAVE':
        {
            cards = ygoMODEL[player][location];

            break;
        }
    case 'REMOVED':
        {
            cards = ygoMODEL[player][location];
            break;
        }
    case 'EXTRA':
        {
            cards = ygoMODEL[player][location];
            break;
        }

    }
    if (!list) {
        console.log('Overlay information?');
        return;
    }

//    var length = instanceCounter(list);
//    for (var i = 0; length > i; i++) {
//        length = message[(message.readposition + i)] + message[(message.readposition + 1 + i)];
//        if (card.hasOwnProperty) {
//            message.readposition = message.readposition + 2;
//            if (length > 8) {
//                message = UpdateInfo(message, length, i);
//            }
//        }
//    }
    console.log(ygoMODEL[player][location]);
}

function UpdateInfo(message, flag, readlocation) {
    return message;
}

function speak(message) {

    var sendoff = new SendCommunication(message, 0x16);
    ws.send(sendoff.buffer_content);
    console.log(sendoff.buffer_view);
}

function instanceCounter(instance) {
    var count = 0;
    for (var k in instance) {
        if (instance.hasOwnProperty(k)) {
            ++count;
        }
    }
    return count;
}