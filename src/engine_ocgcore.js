/*jslint node:true, plusplus:true, bitwise:true */

'use strict';

/* allows dynamic linking of the ocgapi.dll, critical; */
/* allows use of C++ pointers for C++ JS interactions, critical */
/* allows use of C++ structures for C++ JS interactions, critical */
const sql = require('sql.js'),
    fs = require('fs'),
    os = require('os'),
    ffi = require('ffi'),
    ref = require('ref'),
    struct = require('ref-struct'),
    arrayBuf = require('ref-array'),
    POS_FACEDOWN = 0x1,
    POS_FACEDOWN_DEFENSE = 0x8,
    LOCATION_DECK = 0x01,
    LOCATION_MZONE = 0x04,
    LOCATION_SZONE = 0x08,
    LOCATION_EXTRA = 0x40,
    LOCATION_GRAVE = 0x10,
    LOCATION_HAND = 0x02,
    charArray = arrayBuf(ref.types.char),
    bytePointer = ref.refType(ref.types.byte),
    charPointer = ref.refType(ref.types.char),
    intPointer = ref.refType(ref.types.int),
    uint32Pointer = ref.refType(ref.types.uint32),
    voidPointer = ref.refType(ref.types.void),
    btyeArray = arrayBuf(ref.types.byte),
    cardData = struct({
        code: ref.types.uint32,
        alias: ref.types.uint32,
        setcode: ref.types.uint64,
        type: ref.types.uint32,
        level: ref.types.uint32,
        attribute: ref.types.uint32,
        race: ref.types.uint32,
        attack: ref.types.int32,
        defense: ref.types.int32,
        lscale: ref.types.uint32,
        rscale: ref.types.uint32,
        link: ref.types.uint32
    }),
    cardDataPointer = ref.refType(cardData),

    card_reader_function = ffi.Function('uint32', ['uint32', cardDataPointer]),
    responsei_function = ffi.Function('int32', [voidPointer, 'uint32']),
    script_reader_function = ffi.Function('byte*', ['string', 'uint32*']),
    message_handler_function = ffi.Function('uint32', [voidPointer, 'uint32']),
    queue = require('function-queue'),
    enums = require('./translate_ygopro_enums.js'),
    analyze = require('./translate_ygopro_analyzer.js'),
    boardController = require('./controller_ygopro.js'),
    translateYGOProAPI = require('./translate_ygopro_messages.js'),
    manualControlEngine = require('./engine_manual.js'),
    DataStream = require('./model_data_stream.js');



var scripts = {},
    scriptsFolder = '../../ygopro-scripts',
    prescriptsFolder = '../../ygopro-scripts';


function extention(filename) {
    return filename.split('.').pop();

}
console.log('Loading Scripts...');
var filelist = fs.readdirSync(scriptsFolder);
filelist.forEach(function(filename) {
    if (extention(filename) === 'lua') {
        //scripts['./expansions/script/' + filename] = fs.readFileSync(scriptsFolder + '/' + filename);
    }

});
console.log('Loaded Scripts');

function scriptReader(scriptname, length) {
    var file = scriptsFolder + '/' + scriptname.substr(20);
    if (fs.existsSync(file)) {
        var script = fs.readFileSync(file);

        ref.set(length, 0, script.byteLength);
        return script;
    } else {
        return Buffer.alloc(0);

    }
}

var database,
    cards = {},
    filebuffer = fs.readFileSync('../bin/mr4/cards.cdb');


function hasType(card, type) {
    return ((card.type & type) !== 0);
}



database = new sql.Database(filebuffer);

function card_reader(code, buffer) {
    //function used by the core to process DB
    var stmt = database.prepare('SELECT * FROM datas WHERE id =' + code);
    var dbEntry = stmt.getAsObject({ id: 1 });
    var card = {
        code: dbEntry.id,
        alias: dbEntry.alias,
        setcode: dbEntry.setcode,
        type: dbEntry.type,
        level: dbEntry.level & 0xff,
        attribute: dbEntry.attribute,
        race: dbEntry.race,
        attack: dbEntry.atk,
        defence: (hasType(dbEntry, 0x4000000)) ? 0 : dbEntry.def,
        lscale: (dbEntry.level >> 24) & 0xff,
        rscale: (dbEntry.level >> 16) & 0xff,
        link: (hasType(dbEntry, 0x4000000)) ? dbEntry.defense : 0
    };
    ref.set(buffer, 0, (cardData(card)));
    return code;
}



module.exports.configurations = {
    normal: {
        priority: false,
        draw_count: 1,
        start_hand_count: 5,
        time: 300,
        shuffleDeck: true,
        start_lp: 8000
    }
};



var pduelPointer = (ref.refType('string')), ///really need to figure out the dimensions of this pointer. "pointer" isnt gonna cut it.
    ocgapi = ffi.Library('C:/salvation/ygopro/bin/release/ocgcore.dll', {
        'set_script_reader': ['void', [script_reader_function]],
        'set_card_reader': ['void', [card_reader_function]],
        'set_message_handler': ['void', [message_handler_function]],
        'create_duel': [pduelPointer, ['uint32']],
        'start_duel': ['void', [pduelPointer, 'int']],
        'end_duel': ['void', [pduelPointer]],
        'set_player_info': ['void', [pduelPointer, 'int32', 'int32', 'int32', 'int32']],
        'get_log_message': ['void', [pduelPointer, bytePointer]],
        'get_message': ['int32', [pduelPointer, bytePointer]],
        'process': ['int32', [pduelPointer]],
        'new_card': ['void', [pduelPointer, 'uint32', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8']],
        'new_tag_card': ['void', [pduelPointer, 'uint32', 'uint8', 'uint8']],
        'query_card': ['int32', [pduelPointer, 'uint8', 'uint8', 'int32', bytePointer, 'int32']],
        'query_field_count': ['int32', [pduelPointer, 'uint8', 'uint8']],
        'query_field_card': ['int32', [pduelPointer, 'uint8', 'uint8', 'int32', (charArray), 'int32']],
        'query_field_info': ['int32', [pduelPointer, bytePointer]],
        'set_responsei': ['void', [pduelPointer, 'int32']],
        'set_responseb': ['void', [pduelPointer, bytePointer]],
        'preload_script': ['int32', [pduelPointer, 'string', 'int32']]
    });
process.on('exit', function() {
    let x;
    x = card_reader_function;
    x = responsei_function;
    x = script_reader_function;
    x = message_handler_function;
});


function messagHandler(pduel, type) {
    var messageBuffer = Buffer.alloc(1024);
    ocgapi.get_log_message(pduel, messageBuffer);
    console.log(messageBuffer.toString());
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function duelEndProcedure(players) {

}

function seed() {
    return Math.floor(Math.random() * (4294967295));
}


/**
 * Create a single players view of the game that is reflected down to the UI.
 * @param {Object} playerConnection A players connection to the server.
 * @param {String} slot Player callback identifier, slot they are in the duel lobby. This function is its ultimate usage.
 * @param {Number} masterRule Ruling variable to construct the board correctly.
 * @returns {Object} A game instance with manual controls.
 */
function GameBoard(playerConnection, slot, masterRule) {
    const board = manualControlEngine(function(view, stack, callback) {
        try {
            if (playerConnection.externalClient) {
                playerConnection.write((view[slot]));
            }
        } catch (error) {
            console.log('failed messaging socket', error);
        } finally {
            if (callback) {
                return callback(stack);
            }
        }
    });
    board.masterRule = masterRule;
    if (playerConnection.externalClient) {
        board.question = function() {};
    }
    return board;
}

function Responser(game, player) {

    function write(data) {
        const resb = Buffer.alloc(64);
        resb.copy(data);
        player.lock = false;
        ocgapi.set_responseb(game.pduel, resb);
    }

    return {
        write: write
    };
}

function playerInstance(playerConnection, slot, game, settings) {
    const dataStream = new DataStream(),
        gameBoard = new GameBoard(playerConnection, slot, settings.masterRule),
        gameQueue = queue(),
        tcpConnection = new Responser(game, playerConnection);

    function parsePackets(data) {
        'use strict';
        var message = new Buffer(data),
            task = [],
            packet = {
                message: message.slice(1),
                readposition: 0
            };
        packet.command = enums.STOC[message[0]];
        console.log(packet.command, message);
        task.push(translateYGOProAPI(gameBoard, packet));
        return task;
    }

    function preformGameAction(gameAction) {
        var output = boardController(gameBoard, slot, gameAction, tcpConnection, playerConnection);
        if (playerConnection.externalClient) {
            playerConnection.write(output);
        }
    }

    function queueGameActions(gameActions) {
        gameActions.forEach(function(gameAction) {
            const pause = enums.timeout[gameAction.command] || 0;
            gameQueue.push(function(next) {
                setTimeout(function() {
                    try {
                        preformGameAction(gameAction);
                    } catch (e) {
                        console.log(e);
                    }
                    next();
                }, pause);
            });

        });
    }

    return function(data) {
        try {
            dataStream.input(data)
                .map(parsePackets)
                .map(queueGameActions);
        } catch (error) {
            console.log(error);
        }

    };
}




function makeGame(pduel, settings, players) {
    let lastMessage = new Buffer(''),
        last_response = -1,
        time_limit = settings.time_limit;



    function gameTick() {
        time_limit -= 1;
        if (time_limit > 0) {
            setTimeout(gameTick, 1000);
        }
    }

    function sendBufferToPlayer(player, proto, buffer, length) {
        buffer = buffer.packet || buffer;
        player = Math.abs(player);
        const stoc = new Buffer([proto]),
            frameSize = new Buffer(2);
        length = length || buffer.length;
        frameSize.writeUInt16LE(length + 1, 0);
        var message = Buffer.concat([frameSize, stoc, Buffer.from(buffer, 0, length + 1)]);
        lastMessage = message;
        players[player](message);
    }

    function reSendToPlayer(player) {
        players[Math.abs(player)](lastMessage);
    }

    function waitforResponse(player) {
        const STOC_TimeLimit = struct({
                player: ref.types.char,
                left_time: ref.types.short
            }),
            sctl = new STOC_TimeLimit(),
            MSG_WAITING = 3,
            msg = new Buffer([MSG_WAITING]);

        last_response = player;
        sendBufferToPlayer((1 - player), enums.STOC.enums.STOC_GAME_MSG, msg);
        sctl.player = player;
        sctl.left_time = time_limit;
        sendBufferToPlayer(0, enums.STOC.enums.STOC_TIME_LIMIT, sctl.ref());
        sendBufferToPlayer(1, enums.STOC.enums.STOC_TIME_LIMIT, sctl.ref());


    }

    function sendStartInfo(player) {
        const startbuf = Buffer.alloc(18);
        startbuf[0] = 4;
        startbuf[1] = 0;
        startbuf.writeUInt32LE(settings.start_lp, 2);
        startbuf.writeUInt32LE(settings.start_lp, 6);
        startbuf.writeUInt16LE(ocgapi.query_field_count(pduel, 0, 0x1), 10);
        startbuf.writeUInt16LE(ocgapi.query_field_count(pduel, 0, 0x40), 12);
        startbuf.writeUInt16LE(ocgapi.query_field_count(pduel, 1, 0x1), 14);
        startbuf.writeUInt16LE(ocgapi.query_field_count(pduel, 1, 0x40), 16);
        sendBufferToPlayer(player, enums.STOC.enums.STOC_GAME_MSG, startbuf, 18);
    }

    function refreshExtra(player, flag, use_cache) {
        const qbuf = Buffer.alloc(0x2000),
            header = Buffer.alloc(3),
            proto = enums.STOC.enums.STOC_GAME_MSG,
            len = ocgapi.query_field_card(pduel, player, LOCATION_EXTRA, flag, qbuf, use_cache);
        flag = flag || 0;
        use_cache = use_cache || 0;
        header[0] = 0x6;
        header[1] = player;
        header[2] = LOCATION_EXTRA;
        sendBufferToPlayer(player, proto, Buffer.concat([header, qbuf], len + 3), len + 3);
        return len;
    }

    function refreshMzone(player, flag, use_cache) {
        const qbuf = Buffer.alloc(0x2000),
            header = Buffer.alloc(3),
            proto = enums.STOC.enums.STOC_GAME_MSG,
            len = ocgapi.query_field_card(pduel, player, LOCATION_MZONE, flag, qbuf, use_cache);
        flag = flag || 0;
        use_cache = use_cache || 0;
        header[0] = 0x6;
        header[1] = player;
        header[2] = LOCATION_MZONE;
        var qlen = 0;
        while (qlen < len) {
            const clen = qbuf.readUInt32LE(qlen);
            qlen += clen;
            if (clen === 4) {
                continue;
            }
            if (qbuf[11] & POS_FACEDOWN) {
                qbuf[clen - 4] = 0;
            }
            qbuf += clen - 4;
        }
        sendBufferToPlayer(player, proto, Buffer.concat([header, qbuf], len + 3), len + 3);
        reSendToPlayer(1 - player);
        return len;
    }

    function refreshSzone(player, flag, use_cache) {
        const qbuf = Buffer.alloc(0x2000),
            header = Buffer.alloc(3),
            proto = enums.STOC.enums.STOC_GAME_MSG,
            len = ocgapi.query_field_card(pduel, player, LOCATION_SZONE, flag, qbuf, use_cache);
        flag = flag || 0;
        use_cache = use_cache || 0;
        header[0] = 0x6;
        header[1] = player;
        header[2] = LOCATION_SZONE;
        var qlen = 0;
        while (qlen < len) {
            const clen = qbuf.readUInt32LE(qlen);
            qlen += clen;
            if (clen === 4) {
                continue;
            }
            if (qbuf[11] & POS_FACEDOWN) {
                qbuf[clen - 4] = 0;
            }
            qbuf += clen - 4;
        }
        sendBufferToPlayer(player, proto, Buffer.concat([header, qbuf], len + 3), len + 3);
        reSendToPlayer(1 - player);
        return len;
    }

    function refreshHand(player, flag, use_cache) {
        let qbuf = Buffer.alloc(0x2000),
            header = Buffer.alloc(3),
            proto = enums.STOC.enums.STOC_GAME_MSG,
            len = ocgapi.query_field_card(pduel, player, LOCATION_HAND, flag, qbuf, use_cache);
        flag = flag || 0;
        use_cache = use_cache || 0;
        header[0] = 0x6;
        header[1] = player;
        header[2] = LOCATION_HAND;
        var qlen = 0;
        // while (qlen < len) {
        //     let clen = qbuf.readUInt32LE(qlen);
        //     qlen += clen;
        //     if (clen === 4) {
        //         continue;
        //     }
        //     if (qbuf[11] & POS_FACEDOWN) {
        //         qbuf[clen - 4] = 0;
        //     }
        //     qbuf += clen - 4;
        // }
        sendBufferToPlayer(player, proto, Buffer.concat([header, qbuf], len + 3), len + 3);
        reSendToPlayer(1 - player);
        return len;
    }


    function refreshGrave(player, flag, use_cache) {
        const qbuf = Buffer.alloc(0x2000),
            header = Buffer.alloc(3),
            proto = enums.STOC.enums.STOC_GAME_MSG,
            len = ocgapi.query_field_card(pduel, player, LOCATION_GRAVE, flag, qbuf, use_cache);
        flag = flag || 0;
        use_cache = use_cache || 0;
        header[0] = 0x6;
        header[1] = player;
        header[2] = LOCATION_GRAVE;
        sendBufferToPlayer(player, proto, Buffer.concat([header, qbuf], len + 3), len + 3);
        return len;
    }

    function refreshSingle(player, location, sequence, flag) {
        flag = flag || 0;
        const qbuf = Buffer.alloc(0x2000),
            header = Buffer.alloc(3),
            proto = enums.STOC.enums.STOC_GAME_MSG,
            len = ocgapi.query_field_card(pduel, player, location, sequence, flag, qbuf);

        header[0] = 0x7;
        header[1] = player;
        header[2] = location;
        header[3] = sequence;
        sendBufferToPlayer(player, proto, Buffer.concat([header, qbuf], len + 4), len + 4);
        if ((location & 0x90) || ((location & 0x2c) && (qbuf[15] & 0x5))) {
            reSendToPlayer(1 - player);
        }
        return len;
    }

    gameTick();

    return {
        sendStartInfo,
        refreshMzone,
        refreshSzone,
        refreshExtra,
        refreshHand,
        refreshSingle,
        refreshGrave,
        waitforResponse,
        sendBufferToPlayer,
        reSendToPlayer,
        duel_count: 0,
        match_result: [],
        pduel
    };
}


function mainProcess(pduel, game) {



    var engineBuffer = Buffer.alloc(0x1000),
        engFlag = 0,
        engLen = 0,
        stop = 0,
        result;

    while (!stop) {

        if (engFlag === 2) {
            break;
        }
        result = ocgapi.process(game.pduel);
        engLen = result & 0xffff;
        engFlag = result >> 16;
        if (engLen > 0) {
            ocgapi.get_message(game.pduel, engineBuffer);
        }
        stop = analyze(engineBuffer, engLen, game);

    }
    if (stop === 2) {
        duelEndProcedure(game);
    }
}


function duel(settings, players) {
    var pduel;

    if (settings.shuffleDeck) {
        shuffle(players[0].main);
        shuffle(players[0].extra);
        shuffle(players[1].main);
        shuffle(players[1].extra);
    }
    process.on('exit', function() {

    });
    pduel = ocgapi.create_duel(seed());
    ocgapi.set_script_reader(scriptReader); // good
    ocgapi.set_card_reader(card_reader); //bad
    ocgapi.set_message_handler(messagHandler); //bad
    ocgapi.preload_script(pduel, './expansions/script/constant.lua', 0x10000000);
    ocgapi.preload_script(pduel, './expansions/script/utility.lua', 0x10000000);
    ocgapi.set_responsei(pduel, console.log);

    ocgapi.set_player_info(pduel, 0, settings.start_lp, settings.start_hand_count, settings.draw_count);
    ocgapi.set_player_info(pduel, 1, settings.start_lp, settings.start_hand_count, settings.draw_count);

    console.log(1);
    players[0].main.forEach(function(cardID, sequence) {
        ocgapi.new_card(pduel, cardID, 0, 0, LOCATION_DECK, 0, POS_FACEDOWN_DEFENSE);
    });
    console.log(2);
    players[0].extra.forEach(function(cardID, sequence) {
        ocgapi.new_card(pduel, cardID, 0, 0, LOCATION_EXTRA, 0, POS_FACEDOWN_DEFENSE);
    });
    console.log(3);
    players[1].main.forEach(function(cardID, sequence) {
        console.log(cardID, sequence);
        ocgapi.new_card(pduel, cardID, 1, 1, LOCATION_DECK, 0, POS_FACEDOWN_DEFENSE);
    });
    console.log(4);
    players[1].extra.forEach(function(cardID, sequence) {
        ocgapi.new_card(pduel, cardID, 1, 1, LOCATION_EXTRA, 0, POS_FACEDOWN_DEFENSE);
    });
    //send start msg
    console.log('all cards loaded');

    setTimeout(function() {
        var connections = players.map(function(playerConnection, slot) {
            return playerInstance(playerConnection, slot, { pduel }, settings);
        });
        var game = makeGame(pduel, settings, connections);
        game.sendStartInfo(0);
        game.sendStartInfo(1);
        setTimeout(function() {
            game.refreshExtra(0);
            game.refreshExtra(1);
            game.refreshMzone(0);
            game.refreshMzone(1);
            ocgapi.start_duel(pduel, settings.priority);
            mainProcess(pduel, game);
        }, 1000);

    }, 1000);

}

module.exports.duel = duel;