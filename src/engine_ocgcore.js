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
    POS_FACEDOWN_DEFENSE = 0x8,
    LOCATION_DECK = 0x01,
    LOCATION_EXTRA = 0x40,
    bytePointer = ref.refType(ref.types.byte),
    charPointer = ref.refType(ref.types.char),
    intPointer = ref.refType(ref.types.int),
    uint32Pointer = ref.refType(ref.types.uint32),
    voidPointer = ref.refType(ref.types.void),
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
    queue = require('function-queue'),
    enums = require('./translate_ygopro_enums.js'),
    analyze = require('./translate_ygopro_analyzer.js'),
    boardController = require('./controller_ygopro.js'),
    translateYGOProAPI = require('./translate_ygopro_messages.js'),
    manualControlEngine = require('./engine_manual.js'),
    DataStream = require('./model_data_stream.js');


function constructDatabase(targetDB, targetFolder) {
    // create instance of card database in memory 2MB, prevents sychronous read request and server lag.
    var database,
        cards = {},
        filebuffer = fs.readFileSync(targetDB);

    function hasType(card, type) {
        return ((card.type & type) !== 0);
    }



    database = new sql.Database(filebuffer);

    return function(code, buffer) {
        //function used by the core to process DB
        console.log(code, 'xxx', buffer);
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
            attack: dbEntry.attack,
            defence: (hasType(dbEntry, 0x4000000)) ? 0 : dbEntry.defense,
            lscale: (dbEntry.level >> 24) & 0xff,
            rscale: (dbEntry.level >> 16) & 0xff,
            link: (hasType(dbEntry, 0x4000000)) ? dbEntry.defense : 0
        };
        console.log('card data:', cardData(card)['ref.buffer']);
        buffer = cardData(card)['ref.buffer'];
        return code;
    };
}

function constructScripts(targetFolder) {
    //create instance of all scripts in memory 14MB, prevents sychronous read request and server lag.
    var filelist = [],
        scripts = {};

    function readFile(filename) {
        // loop through a list of filename asynchronously and put the data into memory.
        fs.readfile(targetFolder + '/' + filename, function(error, data) {
            scripts[filename] = data;
            filelist.shift();
            if (filelist.length > 0) {
                readFile(filelist[0]);
            } else {
                return;
            }
        });
    }

    fs.readdir(targetFolder, function(error, list) {
        // get list of script filenames in the folder.
        if (error) {
            throw console.log(error);
        }
        filelist = list;
    });

    return function(id, length) {
        id = id.toString('utf-8');
        console.log('SCRIPT ID REQUEST:', id, 'Length:', length);
        if (id === '.') {
            return Buffer.alloc(4);
        }
        var filename = id,
            output;

        //function used by the core to process scripts

        console.log('OUTPUT:', output);
        return output;
    };
}

module.exports.configurations = {
    normal: {
        card_reader: constructDatabase('../bin/mr4/cards.cdb'),
        script_reader: constructScripts('../../ygopro-scripts'),
        priority: false,
        draw_count: 1,
        start_hand_count: 5,
        time: 300,
        shuffleDeck: true,
        start_lp: 8000
    }
};

function messagHandler(input) {
    console.log('NEW MESSAGE', input);
}

function makeAPI(settings) {
    // create new instance of flourohydride/ygopro/ocgcore

    var pduelPointer = (ref.refType('string')), ///really need to figure out the dimensions of this pointer. "pointer" isnt gonna cut it.
        ocgapi = ffi.Library('C://salvation//ygopro//bin//debug/ocgcore.dll', {
            'set_script_reader': ['void', [bytePointer]],
            'set_card_reader': ['void', ['uint32']],
            'set_message_handler': ['void', ['uint32']],
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
            'query_field_card': ['int32', [pduelPointer, 'uint8', 'uint8', 'int32', bytePointer, 'int32']],
            'query_field_info': ['int32', [pduelPointer, bytePointer]],
            'set_responsei': ['void', [pduelPointer, 'int32']],
            'set_responseb': ['void', [pduelPointer, bytePointer]],
            'preload_script': ['int32', [pduelPointer, charPointer, 'int32']]
        });



    return ocgapi;
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
            if (!playerConnection.externalClient) {
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
        game.set_responseb(game.pduel, resb);
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
        task.push(translateYGOProAPI(gameBoard, packet));
        return task;
    }

    function preformGameAction(gameAction) {
        var output = boardController(gameBoard, slot, gameAction, tcpConnection, playerConnection);
        if (!playerConnection.externalClient) {
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




function mainProcess(game, players) {
    var engineBuffer = Buffer.alloc(0x1000),
        engFlag = 0,
        engLen = 0,
        stop = 0,
        result;
    while (!stop) {

        if (engFlag === 2) {
            break;
        }
        result = game.process(game.pduel);
        engLen = result & 0xffff;
        engFlag = result >> 16;
        if (engLen > 0) {
            game.get_message(game.pduel, engineBuffer);
        }
        stop = analyze(engineBuffer, engLen, players, game);
    }
    if (stop === 2) {
        duelEndProcedure(players);
    }
}

function duel(settings, players) {

    var pduel,
        game = makeAPI(settings),
        responsei = ffi.Callback('int32', [voidPointer, 'uint32'], messagHandler),
        script_reader = ffi.Callback(bytePointer, [charPointer, intPointer], settings.script_reader),
        card_reader = ffi.Callback('uint32', ['uint32', cardDataPointer], settings.card_reader),
        message_handler = ffi.Callback('uint32', [voidPointer, 'uint32'], messagHandler);
    if (settings.shuffleDeck) {
        shuffle(players[0].main);
        shuffle(players[0].extra);
        shuffle(players[1].main);
        shuffle(players[1].extra);
    }
    process.on('exit', function() {
        pduel;
        responsei;
        script_reader;
        card_reader;
        message_handler;
    });
    pduel = game.create_duel(seed());
    game.new_card(pduel, 88888888, 0, 0, LOCATION_EXTRA, 0, POS_FACEDOWN_DEFENSE);
    console.log(pduel.hexAddress(), pduel.ref());
    game.set_script_reader(script_reader); // good
    //game.set_card_reader(card_reader); //bad
    //game.set_message_handler(message_handler); //bad
    game.set_responsei(pduel, responsei);

    game.set_player_info(pduel, 0, settings.start_lp, settings.start_hand_count, settings.draw_count);
    game.set_player_info(pduel, 1, settings.start_lp, settings.start_hand_count, settings.draw_count);

    console.log(1);
    players[0].main.forEach(function(cardID, sequence) {
        game.new_card(pduel, cardID, 0, 0, LOCATION_EXTRA, 0, POS_FACEDOWN_DEFENSE);
    });
    console.log(2);
    players[0].extra.forEach(function(cardID, sequence) {
        game.new_card(pduel.address(), cardID, 0, 0, LOCATION_EXTRA, sequence, POS_FACEDOWN_DEFENSE);
    });
    console.log(3);
    players[1].main.forEach(function(cardID, sequence) {
        game.new_card(pduel.address(), cardID, 1, 1, LOCATION_DECK, 0, POS_FACEDOWN_DEFENSE);
    });
    console.log(4);
    players[1].extra.forEach(function(cardID, sequence) {
        game.new_card(pduel.address(), cardID, 1, 1, LOCATION_EXTRA, 0, POS_FACEDOWN_DEFENSE);
    });
    //send start msg
    game.start_duel(pduel, settings.priority);
    game.pduel = pduel;
    mainProcess(game, players.map(function(playerConnection, slot) {
        return playerInstance(playerConnection, slot, game, settings);
    }));
}

module.exports.duel = duel;