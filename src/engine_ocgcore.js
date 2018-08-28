/*jslint node:true, plusplus:true, bitwise:true */

'use strict';

/* allows dynamic linking of the ocgapi.dll, critical; */
/* allows use of C++ pointers for C++ JS interactions, critical */
/* allows use of C++ structures for C++ JS interactions, critical */
var sqlite3 = require('sqlite3').verbose(),
    fs = require('fs'),
    os = require('os'),
    ffi = require('ffi'),
    ref = require('ref'),
    struct = require('ref-struct'),
    arrayBuf = require('ref-array')



var POS_FACEDOWN_DEFENSE = 0x8,
    LOCATION_DECK = 0x01,
    LOCATION_EXTRA = 0x40;

var bytePointer = ref.refType(ref.types.byte),
    charPointer = ref.refType(ref.types.char),
    intPointer = ref.refType(ref.types.int),
    uint32Pointer = ref.refType(ref.types.uint32),
    voidPointer = ref.refType(ref.types['void']),
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
        rscale: ref.types.uint32
    }),
    cardDataPointer = ref.refType(cardData),
    charArray = arrayBuf(ref.types.char);


function constructDatabase(targetDB, targetFolder) {
    // create instance of card database in memory 2MB, prevents sychronous read request and server lag.
    var database,
        cards = {};

    function handleQueryRow(error, row) {
        if (error) {
            //throw error;
            console.log(error); //fuck it keep moving.
        }
        cards[row.id] = row;
    }

    database = new sqlite3.Database(targetDB);
    database.on("open", function () {
        console.log("database was opened successfully");
    });
    database.on("close", function () {
        console.log("database was closed successfully");
    });
    //database.each(queryfor.statistics, {}, handleQueryRow, function () {}); // get all cards and load into memory.
    //database.end();

    return function (request) {
        //function used by the core to process DB
        var code = request.code;

        return struct({
            code: code,
            alias: cards[code].alias || 0,
            setcode: cards[code].setcode || 0,
            type: cards[code].type || 0,
            level: cards[code].level || 1,
            attribute: cards[code].attribute || 0,
            race: cards[code].race || 0,
            attack: cards[code].attack || 0,
            defence: cards[code].defense || 0
        });
    };
}

function constructScripts(targetFolder) {
    //create instance of all scripts in memory 14MB, prevents sychronous read request and server lag.
    var filelist = [],
        scripts = {};

    function readFile(filename) {
        // loop through a list of filename asynchronously and put the data into memory.
        fs.readfile(targetFolder + '/' + filename, function (error, data) {
            scripts[filename] = data;
            filelist.shift();
            if (filelist.length > 0) {
                readFile(filelist[0]);
            } else {
                return;
            }
        });
    }

    fs.readdir(targetFolder, function (error, list) {
        // get list of script filenames in the folder.
        if (error) {
            throw console.log(error);
        }
        filelist = list;
    });

    return function (id, length) {
        id = id.toString('utf-8');
        console.log('SCRIPT ID REQUEST:', id, 'Length:', length);
        if (id === '.') {
            return new Buffer([0]);
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
        card_reader: constructDatabase('./cards.cdb'),
        script_reader: constructScripts('../YGOPro-Salvation-Server/http/ygopro/script'),
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

    var pduelPointer = 'pointer', ///really need to figure out the dimensions of this pointer. "pointer" isnt gonna cut it.
        script_reader = ffi.Callback(bytePointer, [charPointer, intPointer], settings.script_reader),
        card_reader = ffi.Callback('uint32', [cardDataPointer], settings.card_reader),
        message_handler = ffi.Callback('uint32', [voidPointer, 'uint32'], messagHandler),
        ocgapi = ffi.Library(__dirname + '/ocgcorex64.dll', {
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

    ocgapi.set_script_reader(script_reader);
    ocgapi.set_card_reader(card_reader);
    ocgapi.set_message_handler(message_handler);
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

function Analyze() {

}

function mainProcess(game, players) {
    //    char engineBuffer[0x1000];
    //	unsigned int engFlag = 0, engLen = 0;
    //	int stop = 0;
    //	while (!stop) {
    //		if (engFlag == 2)
    //			break;
    //		int result = process(pduel);
    //		engLen = result & 0xffff;
    //		engFlag = result >> 16;
    //		if (engLen > 0) {
    //			get_message(pduel, (byte*)&engineBuffer);
    //			stop = Analyze(engineBuffer, engLen);
    //		}
    //	}
    //	if(stop == 2)
    //		DuelEndProc();

    var engineBuffer = charArray(0x1000),
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
        stop = Analyze(engineBuffer, engLen);
    }
    if (stop === 2) {
        duelEndProcedure(players);
    }
}

function duel(settings, players) {
    /*
    1.) who is going first?

    3.) set time limit

    11.) send start message over message with LP and sizes (fuck that do it in JSON)

    13.) "Process();"
    */
    var pduel,
        game = makeAPI(settings);
    if (settings.shuffleDeck) {
        shuffle(players[0].main);
        shuffle(players[0].extra);
        shuffle(players[1].main);
        shuffle(players[1].extra);
    }
    pduel = game.create_duel(seed());
    game.set_player_info(pduel, 0, settings.start_lp, settings.start_hand_count, settings.draw_count);
    game.set_player_info(pduel, 1, settings.start_lp, settings.start_hand_count, settings.draw_count);
    players[0].main.forEach(function (cardID, sequence) {
        game.new_card(pduel, cardID, 0, 0, LOCATION_DECK, 0, POS_FACEDOWN_DEFENSE);
    });
    players[0].extra.forEach(function (cardID, sequence) {
        game.new_card(pduel, cardID, 0, 0, LOCATION_EXTRA, 0, POS_FACEDOWN_DEFENSE);
    });
    players[1].main.forEach(function (cardID, sequence) {
        game.new_card(pduel, cardID, 0, 0, LOCATION_DECK, 0, POS_FACEDOWN_DEFENSE);
    });
    players[1].extra.forEach(function (cardID, sequence) {
        game.new_card(pduel, cardID, 0, 0, LOCATION_EXTRA, 0, POS_FACEDOWN_DEFENSE);
    });
    //send start msg
    game.start_duel(pduel, settings.priority);
}

module.exports.duel = duel;