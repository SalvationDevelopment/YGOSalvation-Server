/*eslint no-plusplus: 0*/

/**
 * @type DuelSettings
 * @property {Boolean} priority
 * @property {Number} draw_count
 * @property {Number} start_hand_count
 * @property {Number`} time Timelimit per turn in seconds
 * @property {Boolean} shuffleDeck
 * @property {Number} start_lp
 * @property {String} roompass
 * @property {Boolean} started
 * @property {Boolean} deckcheck
 * @property {Number} ot
 * @property {String} banlist
 * @property {Number} banlistid
 * @property {Number} mode
 * @property {Number} cardpool
 * @property {Boolean} prerelease
 * @property {Number} masterRule
 * @property {Boolean} legacyfield
 * @property {Number} rule
 * @property {Number} startLP
 * @property {Object} player
 */
const fs = require('fs'),
    ref = require('ref'),
    struct = require('ref-struct'),
    BufferStreamReader = require('./model_stream_reader'),
    POS_FACEDOWN_DEFENSE = 0x8,
    LOCATION_DECK = 0x01,
    LOCATION_MZONE = 0x04,
    LOCATION_SZONE = 0x08,
    LOCATION_EXTRA = 0x40,
    LOCATION_GRAVE = 0x10,
    LOCATION_HAND = 0x02,
    makeCard = require('./model_ygopro_card.js'),
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
    queue = require('function-queue'),
    enums = require('./translate_ygopro_enums.js'),
    analyze = require('./translate_ygopro_analyzer.js'),
    boardController = require('./controller_ygopro.js'),
    manualControlEngine = require('./engine_manual.js'),
    DataStream = require('./model_data_stream.js'),
    ocgapi = require('./engine_ocgcore_interface'),
    database = require('../http/manifest/manifest_0-en-OCGTCG.json'),
    scriptsFolder = '../../ygopro-scripts';


function extention(filename) {
    return filename.split('.').pop();

}


function scriptReader(scriptname, length) {
    scriptname = ref.readCString(scriptname, 0);
    var file = scriptsFolder + '/' + scriptname.substr(20);
    if (fs.existsSync(file)) {
        try {
            var script = fs.readFileSync(file);
            return script;
        } catch (e) {
            console.log(e);
            return Buffer.alloc(0);
        }
    } else {
        return Buffer.alloc(0);

    }
}


function hasType(card, type) {
    return ((card.type & type) !== 0);
}


function card_reader(code, buffer) {
    //function used by the core to process DB
    var baseCard = {
        id: code,
        alias: 0,
        setcode: 0,
        type: 0,
        level: 0,
        attribute: 0,
        race: 0,
        atk: 0,
        def: 0,
        defense: 0
    };

    var dbEntry = database.find(function(cardEntry) {
        cardEntry.id === code;
    }) || baseCard;
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
    cardData(card);
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

function seed() {
    var max = 4294967295,
        min = 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function deepShuffle(array) {
    for (var i = 0; i < array.length; i++) {
        shuffle(array);
    }
}

function duelEndProcedure(players) {
    console.log('game ended');
    process.exit();
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
            console.log('p' + slot);
            playerConnection.write((view['p' + slot]));

        } catch (error) {
            console.log('failed messaging socket', error);
        } finally {
            if (callback) {
                return callback(stack);
            }
        }
    });
    board.masterRule = masterRule;

    return board;
}

function Responser(game, player) {

    function write(data) {
        console.log(data);
        const resb = Buffer.alloc(64);
        data.copy(resb);
        player.lock = false;
        console.log('setting response', resb);
        ocgapi.set_responseb(game.pduel, resb);
        mainProcess(game.pduel, game);
    }

    return {
        write: write
    };
}

function playerInstance(playerConnection, slot, game, settings) {
    const dataStream = new DataStream(),
        gameBoard = new GameBoard(playerConnection, slot, settings.masterRule),
        gameQueue = queue(),
        responder = new Responser(game, playerConnection);


    function preformGameAction(gameAction) {
        var output = boardController(gameBoard, slot, gameAction, responder, playerConnection);
        //playerConnection.write(output);
    }

    function queueGameActions(gameActions) {
        gameActions.forEach(function(gameAction) {
            console.log(gameAction);
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

    return {
        write: function(data) {
            queueGameActions([data]);
        },
        read: function(message) {
            gameBoard.respond(message);
        }
    };
}




function makeGame(pduel, settings) {
    let lastMessage = new Buffer(''),
        last_response = -1,
        time_limit = settings.time_limit,
        players = [],
        observers = {};

    function setPlayers(clients, additionalClients) {
        players = clients;
        observers = additionalClients;
    }


    function gameTick() {
        time_limit -= 1;
        if (time_limit > 0) {
            setTimeout(gameTick, 1000);
        }
    }

    function sendBufferToPlayer(player, message) {
        lastMessage = message;
        players[player].write(message);
    }

    function reSendToPlayer(player) {
        players[Math.abs(player)].write(lastMessage);
    }

    function respond(message) {
        players.forEach(function(player) {
            player.read(message);
        });
    }

    function waitforResponse(player) {
        last_response = player;
        const message = {
            command: 'MSG_WAITING',
            time: time_limit
        };

        sendBufferToPlayer(0, message);
        sendBufferToPlayer(1, message);
    }

    function sendToObservers() {
        observers.forEach(function(observer) {
            observer.write(lastMessage);
        });
    }

    function sendStartInfo(player) {
        const message = {
            command: 'MSG_START',
            playertype: player,
            lifepoints1: settings.start_lp,
            lifepoints2: settings.start_lp,
            player1decksize: ocgapi.query_field_count(pduel, 0, 0x1),
            player1extrasize: ocgapi.query_field_count(pduel, 0, 0x40),
            player2decksize: ocgapi.query_field_count(pduel, 1, 0x1),
            player2extrasize: ocgapi.query_field_count(pduel, 1, 0x40)
        };
        sendBufferToPlayer(player, message);
    }

    function queryFieldCount(player) {
        return {
            DECK: ocgapi.query_field_count(pduel, player, 0x1),
            HAND: ocgapi.query_field_count(pduel, player, 0x2),
            GRAVE: ocgapi.query_field_count(pduel, player, 0x10),
            EXTRA: ocgapi.query_field_count(pduel, player, 0x40),
            REMOVED: ocgapi.query_field_count(pduel, player, 0x20),
            SPELLZONE: ocgapi.query_field_count(pduel, player, 0x8),
            MONSTERZONE: ocgapi.query_field_count(pduel, player, 0x4)
        };
    }

    function getFieldCards(player, location, pbuf) {
        'use strict';
        const cards = [],
            values = queryFieldCount(player),
            requiredIterations = values[location];

        for (let i = 0; requiredIterations > i; ++i) {
            const len = pbuf.readInt32();
            if (len > 8) {
                const card = makeCard(pbuf, undefined, true);
                cards.push(card);
            }
        }
        return cards;
    }

    function msg_update_data(message, pbuf) {
        message.command = 'MSG_UPDATE_DATA';
        message.location = enums.locations[pbuf.readInt8()];
        message.cards = getFieldCards(message.player, message.location, pbuf);
        return message;
    }

    function msg_update_card(message, pbuf, game, gameBoard) {
        message.command = 'MSG_UPDATE_CARD';
        message.location = enums.locations[pbuf.readInt8()];
        message.index = pbuf.readInt8();
        message.card = makeCard(pbuf, undefined, true);
        return message;
    }

    function refreshExtra(player, flag, use_cache) {
        flag = flag || 0;
        use_cache = use_cache || 0;
        const qbuf = Buffer.alloc(0x2000);
        qbuf.type = ref.types.byte;
        ocgapi.query_field_card(pduel, player, LOCATION_EXTRA, flag, qbuf, use_cache);
        var message = msg_update_data({}, new BufferStreamReader(qbuf));
        sendBufferToPlayer(player, message);
    }

    function refreshMzone(player, flag, use_cache) {
        const qbuf = Buffer.alloc(0x2000);
        qbuf.type = ref.types.byte;
        ocgapi.query_field_card(pduel, player, LOCATION_MZONE, flag, qbuf, use_cache);
        var message = msg_update_data({}, new BufferStreamReader(qbuf));
        sendBufferToPlayer(player, message);
        reSendToPlayer(1 - player);
        sendToObservers();
    }

    function refreshSzone(player, flag, use_cache) {
        const qbuf = Buffer.alloc(0x2000);
        qbuf.type = ref.types.byte;
        ocgapi.query_field_card(pduel, player, LOCATION_SZONE, flag, qbuf, use_cache);
        var message = msg_update_data({}, new BufferStreamReader(qbuf));
        sendBufferToPlayer(player, message);
        reSendToPlayer(1 - player);
        sendToObservers();
    }

    function refreshHand(player, flag, use_cache) {

        const qbuf = Buffer.alloc(0x2000);
        qbuf.type = ref.types.byte;
        ocgapi.query_field_card(pduel, player, LOCATION_HAND, flag, qbuf, use_cache);
        var message = msg_update_data({}, new BufferStreamReader(qbuf));
        sendBufferToPlayer(player, message);
        reSendToPlayer(1 - player);
        sendToObservers();
    }


    function refreshGrave(player, flag, use_cache) {
        const qbuf = Buffer.alloc(0x2000),
            header = Buffer.alloc(3),
            proto = enums.STOC.enums.STOC_GAME_MSG;
        qbuf.type = ref.types.byte;
        ocgapi.query_field_card(pduel, player, LOCATION_GRAVE, flag, qbuf, use_cache);
        var message = msg_update_data({}, new BufferStreamReader(qbuf));
        sendBufferToPlayer(player, message);
        reSendToPlayer(1 - player);
        sendToObservers();
    }

    function refreshSingle(player, location, sequence, flag) {
        flag = flag || 0;
        const qbuf = Buffer.alloc(0x2000),
            header = Buffer.alloc(3),
            proto = enums.STOC.enums.STOC_GAME_MSG;
        qbuf.type = ref.types.byte;
        ocgapi.query_field_card(pduel, player, location, sequence, flag, qbuf);

        var message = msg_update_card({
            player
        }, new BufferStreamReader(qbuf));
        sendBufferToPlayer(player, message);
        reSendToPlayer(1 - player);
        sendToObservers();

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
        respond,
        setPlayers,
        waitforResponse,
        sendBufferToPlayer,
        reSendToPlayer,
        sendToObservers,
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

/**
 * Start a duel
 * @param {DuelSettings} settings parameters for starting the duel
 * @param players {Socket[]}
 * @param observers {} 1-4 players for the duel
 * @returns {undefined}
 */
function duel(settings, errorHandler, players, observers) {
    var pduel,
        game = {};

    if (settings.shuffleDeck) {
        deepShuffle(players[0].main);
        deepShuffle(players[1].main);
    }

    function messageHandler(external_pduel, type) {
        var messageBuffer = Buffer.alloc(1024);
        ocgapi.get_log_message(external_pduel, messageBuffer);
        ///errorHandler(messageBuffer.toString(), type);
    }

    pduel = ocgapi.create_duel(seed());
    ocgapi.set_script_reader(scriptReader); // good
    ocgapi.set_card_reader(card_reader); //bad
    ocgapi.set_message_handler(messageHandler); //bad
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
        ocgapi.new_card(pduel, cardID, 1, 1, LOCATION_DECK, 0, POS_FACEDOWN_DEFENSE);
    });
    console.log(4);
    players[1].extra.forEach(function(cardID, sequence) {
        ocgapi.new_card(pduel, cardID, 1, 1, LOCATION_EXTRA, 0, POS_FACEDOWN_DEFENSE);
    });
    //send start msg
    console.log('all cards loaded');
    game = makeGame(pduel, settings);
    const playerConnections = players.map(function(playerConnection, slot) {
            return playerInstance(playerConnection, slot, game, settings);
        }),
        observerConnections = players.map(function(playerConnection, slot) {
            return playerInstance(playerConnection, slot, game, settings);
        });


    game.setPlayers(playerConnections, observerConnections);
    game.refer = ref.deref(pduel);
    setTimeout(function() {
        game.sendStartInfo(0);
        game.sendStartInfo(1);
        setTimeout(function() {
            // game.refreshExtra(0);
            // game.refreshExtra(1);
            // game.refreshMzone(0);
            // game.refreshMzone(1);
            ocgapi.start_duel(pduel, settings.priority);
            mainProcess(pduel, game);
        }, 1000);

    }, 1000);
    return game;

}

module.exports = {
    duel: duel,
    shuffle: shuffle
};