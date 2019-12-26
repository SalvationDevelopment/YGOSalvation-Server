/* eslint-disable new-cap */
/* eslint-disable one-var */
/* eslint-disable no-sync */
/*eslint no-plusplus: 0*/

/**
 * @type DuelSettings
 * @property {Boolean} priority
 * @property {Number} draw_count
 * @property {Number} start_hand_count
 * @property {Number`} time Timelimit per turn in seconds
 * @property {Boolean} shuffle
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
const ffi = require('ffi'),
    ref = require('ref'),
    bytePointer = ref.refType(ref.types.byte),
    voidPointer = ref.refType(ref.types.void),
    StructType = require('ref-struct'),
    fs = require('fs'),
    BufferStreamReader = require('./model_stream_reader'),
    POS_FACEDOWN_DEFENSE = 0x8,
    LOCATION_DECK = 0x01,
    LOCATION_MZONE = 0x04,
    LOCATION_SZONE = 0x08,
    LOCATION_EXTRA = 0x40,
    LOCATION_GRAVE = 0x10,
    LOCATION_HAND = 0x02,
    makeCard = require('./lib_card'),
    cardData = new StructType({
        code: 'uint',
        alias: 'uint',
        setcode: 'ulonglong',
        type: 'uint',
        level: 'uint',
        attribute: 'uint',
        race: 'uint',
        attack: 'int',
        defense: 'int',
        lscale: 'uint',
        rscale: 'uint',
        link_marker: 'uint'
    }),
    size_t = new StructType({
        size: 'uint'
    }),
    queue = require('function-queue'),
    enums = require('./enums'),
    analyze = require('./lib_analyzer'),
    boardController = require('./controller_automatic'),
    ManualControlEngine = require('./model_field'),
    DataStream = require('./model_stream'),
    ocgapi = require('./lib_core'),
    database = require('../../http/manifest/manifest_0-en-OCGTCG.json'),
    scriptsFolder = '../../ygopro-scripts';

global.gc_protected = [];

/**
 * Read a card from file.
 * @param {String} scriptname filename of the script
 * @param {IntPointer} sizePointer Pointer to an int that is the size of the script.
 * @returns {Pointer} script
 */
function scriptReader(scriptname, sizePointer) {
    let file = scriptsFolder + '/' + scriptname.substr(9, 13);
    const size = ref.reinterpret(sizePointer.deref()['ref.buffer'], 32);

    if (scriptname === './expansions/script/constant.lua') {
        file = scriptsFolder + '/constant.lua';
    }
    if (scriptname === './expansions/script/utility.lua') {
        file = scriptsFolder + '/utility.lua';
    }
    if (fs.existsSync(file)) {
        try {
            const script = fs.readFileSync(file);
            size.writeUInt32LE(script.length);
            global.gc_protected.push(script);
            return ref.readCString(script, 0);
        } catch (e) {
            return ref.alloc('pointer');
        }
    }

    console.log(scriptname, 'at', file, 'does not exist');
    return ref.alloc('pointer');

}

/**
 * Determine if a card has a certain type. Effect/Fusion/Sychro etc
 * @param {Card} card Card in question
 * @param {Number} type Enum of the type in question
 * @returns {Boolean} result
 */
function hasType(card, type) {
    return ((card.type & type) !== 0);
}

/**
 * Callback function used by the core to get database information on a card
 * @param {Number} code unique card, usually 8 digit, passcode.
 * @param {CardStructurePointer} pData pointer provided ocgcore
 * @returns {CardStructurePointer} pData pointer to ocgcore copy of the card.
 */
function card_reader(code, pData) {
    const data = pData.deref(),
        dbEntry = database.find(function (cardEntry) {
            return cardEntry.id === code;
        });
    if (!dbEntry) {
        return 0;
    }

    const card = {
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
        link_marker: (hasType(dbEntry, 0x4000000)) ? dbEntry.defense : 0
    };

    Object.keys(card).forEach((field) => {
        data[field] = card[field];
    });
    return 0;
}

/**
 * Generate a random number for ygopro-core to use as a seed.
 * Ideally this would be pulling from a random number service.
 * @returns {Number} Seed number
 */
function seed() {
    var max = 4294967295,
        min = 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffles an array in place, once.
 * @param {Array} array to shuffle
 * @returns {void}
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)),
            temp = array[i];

        array[i] = array[j];
        array[j] = temp;
    }
}

/**
 * Shuffles an array in place, multiple times.
 * @param {Array} array to shuffle
 * @returns {void}
 */
function deepShuffle(array) {
    for (var i = 0; i < array.length; i++) {
        shuffle(array);
    }
}

/**
 * When the duel ends, send the replay, notify the users, etc...
 * @param {Player[]} players connected player list.
 * @returns {void}
 */
function duelEndProcedure(players) {
    console.log('game ended');
}


/**
 * Create a single players view of the game that is reflected down to the UI.
 * @param {Object} playerConnection A players connection to the server.
 * @param {String} slot Player callback identifier, slot they are in the duel lobby. This function is its ultimate usage.
 * @param {Number} masterRule Ruling variable to construct the board correctly.
 * @returns {Object} A game instance with manual controls.
 */
function GameBoard(playerConnection, slot, masterRule) {
    const board = new ManualControlEngine(function (view, stack, callback) {
        try {
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


/**
 * Contious Game Ticker and ygopro-core output interpreter.
 * @param {Duel} game Duel instance with controls setup
 * @returns {void}
 */
function mainProcess(game) {
    const coreMessage = Buffer.alloc(0x1000);
    let flag = 0,
        message = 0;

    while (!message) {

        if (flag === 2) {
            break;
        }
        const result = ocgapi.process(game.pduel),
            length = result & 0xffff;

        flag = result >> 16;
        if (length) {
            ocgapi.get_message(game.pduel, coreMessage);
        }
        message = analyze(coreMessage, length, game);

    }

    if (message === 2) {
        duelEndProcedure(game);
    }
}

/**
 * Create a new abstraction for the player to set the response to questions ygopro-core ask.
 * @class
 * @param {Duel} game duel in question
 * @param {Player} player Player inputer will be linked to
 * @returns {Requester} Player-Core connection
 */
function Responser(game, player, slot) {

    function write(data) {
        game.last(slot);

        const result = (typeof data === 'number')
            ? ocgapi.set_responsei(game.pduel, data)
            : ocgapi.set_responseb(game.pduel, Buffer(data));

        mainProcess(game);
        return result;
    }

    return {
        write: write
    };
}

function playerInstance(playerConnection, slot, game, settings) {
    const dataStream = new DataStream(),
        gameBoard = new GameBoard(playerConnection, slot, settings.masterRule),
        gameQueue = queue(),
        responder = new Responser(game, playerConnection, slot);


    function preformGameAction(gameAction) {
        var output = boardController(gameBoard, slot, gameAction, responder, playerConnection);
        //playerConnection.write(output);
    }

    function queueGameActions(gameActions) {
        gameActions.forEach(function (gameAction) {
            try {
                preformGameAction(gameAction);
            } catch (e) {
                console.log(e);
            }
        });
    }

    return {
        write: function (data) {
            queueGameActions([data]);
        },
        read: function (message) {
            gameBoard.respond(message);
        }
    };
}

/**
 * Setup duel control functions
 * @param {Buffer} pduel pointer representing the duel inside ygopro-core
 * @param {*} settings game settings
 * @returns {Duel} Game instance with controls.
 */
function makeGame(pduel, settings) {
    let lastMessage = new Buffer(''),
        last_response = -1,
        time_limit = settings.time_limit,
        players = [],
        observers = {};

    function setPlayers(clients, additionalClients) {
        players = clients;
        //observers = additionalClients;
    }


    function gameTick() {
        time_limit -= 1;
        if (time_limit > 0) {
            setTimeout(gameTick, 1000);
        }
    }

    /**
     * Sends a message to a specific player
     * @param {Player} player Player to send a message
     * @param {Object} message Message to send
     * @returns {void}
     */
    function sendBufferToPlayer(player, message) {
        lastMessage = message;
        if (!players[player]) {
            console.log('unknown player', player, message);
            return;
        }
        players[player].write(message);
    }

    /**
     * Send the last send message from the system, to a specific player.
     * @param {Player} player Player to send to.
     * @returns {void}
     */
    function reSendToPlayer(player) {
        players[Math.abs(Boolean(player))].write(lastMessage);
    }

    /**
     * Send the last send message from the system, to the last responding player.
     * @param {Player} player Player to send to.
     * @returns {void}
     */
    function retry() {
        players[last_response].write({
            command: 'MSG_RETRY'
        });
    }

    function last(player) {
        last_response = player;
    }

    function respond(message) {
        players.forEach(function (player) {
            player.read(message);
        });
    }

    /**
     * Tell both players that ygopro-core is waiting on a message.
     * @param {Player} player player waiting on.
     * @returns {void}
     */
    function waitforResponse(player) {
        last_response = player;
        const message = {
            command: 'MSG_WAITING',
            time: time_limit
        };

        sendBufferToPlayer(0, message);
        sendBufferToPlayer(1, message);
    }

    /**
     * Send message to observers
     * @returns {void}
     */
    function sendToObservers() {
        return;
        observers.forEach(function (observer) {
            observer.write(lastMessage);
        });
    }

    /**
     * Send start information to a specific player.
     * @param {Player} player Player to send to.
     * @returns {void}
     */
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



    function msg_update_card(card, message, pbuf) {
        message.command = 'MSG_UPDATE_CARD';
        pbuf.readInt32();
        message.card = makeCard(pbuf, undefined, true);
        Object.assign(message.card, card);
        return message;
    }

    function msg_update_data(player, location) {
        const count = ocgapi.query_field_count(pduel, player, location),
            cards = [],
            message = {};
        for (let index = 0; count > index; ++index) {
            const qbuf = Buffer.alloc(0x40000);
            qbuf.type = ref.types.byte;
            ocgapi.query_card(pduel, player, location, index, 0xf81fff, qbuf, 0);
            const pack = msg_update_card({ player, location: enums.locations[location], index }, {}, new BufferStreamReader(qbuf));
            cards.push(pack.card);
        }
        message.command = 'MSG_UPDATE_DATA';
        message.location = enums.locations[location];
        message.cards = cards;
        sendBufferToPlayer(0, message);
        sendBufferToPlayer(1, message);
        sendToObservers();
    }

    function refreshExtra(player, flag, use_cache) {
        msg_update_data(player, LOCATION_EXTRA);

    }

    function refreshMzone(player, flag, use_cache) {
        msg_update_data(player, LOCATION_MZONE);
    }

    function refreshSzone(player, flag, use_cache) {
        msg_update_data(player, LOCATION_SZONE);
    }

    function refreshHand(player, flag, use_cache) {
        msg_update_data(player, LOCATION_HAND);
    }


    function refreshGrave(player, flag, use_cache) {
        msg_update_data(player, LOCATION_GRAVE);
    }

    function refreshSingle(player, location, index, flag = 0xfffffff) {
        const qbuf = Buffer.alloc(0x40000);
        qbuf.type = ref.types.byte;
        ocgapi.query_card(pduel, player, location, index, flag, qbuf, 0);
        var message = msg_update_card({ player, location: enums.locations[location], index }, {}, new BufferStreamReader(qbuf));
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
        last,
        retry,
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

/**
 * Start a duel
 * @param {DuelSettings} settings parameters for starting the duel
 * @param {Function} errorHandler error reporting function, sends to UI.
 * @param {Socket[]} players  1-4 players for the duel
 * @param {Socket} observers  observer abstraction
 * @returns {void}
 */
function duel(settings, errorHandler, players, observers) {
    var pduel,
        game = {};
        
    if (settings.shuffle) {
        deepShuffle(players[0].main);
        deepShuffle(players[1].main);
    }

    function messageHandler(external_pduel, type) {
        var messageBuffer = Buffer.alloc(1024);
        ocgapi.get_log_message(external_pduel, messageBuffer);
        ///errorHandler(messageBuffer.toString(), type);
    }

    const card_reader_function = ffi.Callback('uint32', ['uint32', ref.refType(cardData)], card_reader),
        responsei_function = ffi.Callback('int32', ['pointer', 'uint32'], messageHandler),
        script_reader_function = ffi.Callback('string', ['string', ref.refType(size_t)], scriptReader),
        message_handler_function = ffi.Callback('uint32', ['pointer', 'uint32'], console.log);

    global.gc_protected.push({
        card_reader_function,
        responsei_function,
        script_reader_function,
        message_handler_function
    });

    pduel = ocgapi.create_duel(seed());
    ocgapi.set_script_reader(script_reader_function); // good
    ocgapi.set_card_reader(card_reader_function); //bad
    ocgapi.set_message_handler(responsei_function); //bad
    ocgapi.preload_script(pduel, './expansions/script/constant.lua', 0x10000000);
    ocgapi.preload_script(pduel, './expansions/script/utility.lua', 0x10000000);
    ocgapi.set_responsei(pduel, message_handler_function);

    ocgapi.set_player_info(pduel, 0, settings.start_lp, settings.start_hand_count, settings.draw_count);
    ocgapi.set_player_info(pduel, 1, settings.start_lp, settings.start_hand_count, settings.draw_count);
    players[0].main.forEach(function (cardID, sequence) {
        ocgapi.new_card(pduel, cardID, 0, 0, LOCATION_DECK, 0, POS_FACEDOWN_DEFENSE);
    });
    players[0].extra.forEach(function (cardID, sequence) {
        ocgapi.new_card(pduel, cardID, 0, 0, LOCATION_EXTRA, 0, POS_FACEDOWN_DEFENSE);
    });
    players[1].main.forEach(function (cardID, sequence) {
        ocgapi.new_card(pduel, cardID, 1, 1, LOCATION_DECK, 0, POS_FACEDOWN_DEFENSE);
    });
    players[1].extra.forEach(function (cardID, sequence) {
        ocgapi.new_card(pduel, cardID, 1, 1, LOCATION_EXTRA, 0, POS_FACEDOWN_DEFENSE);
    });
    //send start msg
    game = makeGame(pduel, settings);
    const playerConnections = players.map(function (playerConnection, slot) {
        return playerInstance(playerConnection, slot, game, settings);
    }), rule = (settings.masterRule === 4) ? 0x040000 : 0;  //0xfffff (mr4 + tag)
    game.setPlayers(playerConnections);
    game.refer = ref.deref(pduel);
    game.sendStartInfo(0);
    game.sendStartInfo(1);
    game.refreshExtra(0);
    game.refreshExtra(1);
    ocgapi.start_duel(pduel, rule);
    mainProcess(game);


    process.game = game;
    return game;

}

module.exports = {
    duel: duel,
    shuffle: shuffle
};

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