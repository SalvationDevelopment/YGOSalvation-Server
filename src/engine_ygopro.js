/**
 * @typedef Packet
 * @type {Object}
 * @property {Buffer} message 
 * @property {Number} readposition
 * @property {String} STOC 
 */

/**
 * @typedef DataStream
 * @type {Object}
 * @property {Function} input
 */

/**
 * @typedef YGOProDeck
 * @type {Object}
 * @property {Number[]} main
 * @property {Number[]} extra
 * @property {Number[]} side
 */

const child_process = require('child_process'),
    EventEmitter = require('events'),
    net = require('net'),
    enums = require('./translate_ygopro_enums.js'),
    translateYGOProAPI = require('./translate_ygopro_messages.js'),
    manualControlEngine = require('./engine_manual.js'),
    boardController = require('./controller_ygopro.js'),
    gameResponse = require('./translate_ygopro_reply.js'),
    YGOSharp = './ygosharp.exe',
    ip = '127.0.0.1',
    scripts = {
        0: '../ygopro-scripts',
        1: '../ygopro-scripts',
        2: '../ygopro-scripts',
        3: '../ygopro-scripts',
        4: '../ygopro-scripts',
        5: '../ygopro-scripts'
    };


/**
 * Create a single players view of the game that is reflected down to the UI.
 * @param {Object} webSockectConnection A players connection to the server.
 * @returns {Object} A game instance with manual controls.
 */
function GameBoard(webSockectConnection, slot, masterRule) {
    const board = manualControlEngine(function(view, stack, callback) {
        try {
            webSockectConnection.write((view[slot]));
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
 * Takes streamed broken up incoming data, stores it in a buffer, and as completed, returns complete messages.
 * @returns {DataStream} data stream with input method.
 */
function DataStream() {
    'use strict';
    var memory = new Buffer([]);

    this.input = function(buffer) {
        var incomplete = true,
            output = [],
            recordOfBuffer,
            frameLength;
        memory = Buffer.concat([memory, buffer]);
        while (incomplete === true && memory.length > 2) {
            frameLength = memory.readUInt16LE(0);
            if ((memory.length - 2) < frameLength) {
                incomplete = false;
            } else {
                recordOfBuffer = memory.slice(2).toJSON();
                output.push(recordOfBuffer);
                if (memory.length === (frameLength + 2)) {
                    memory = new Buffer([]);
                    incomplete = false;
                } else {
                    memory = memory.slice((frameLength + 2));
                }
            }
        }
        return output;
    };
    return this;
}

/**
 * Proxy a web socket connection to a TCP connection, which connects to YGOSharp.
 * @param {Number} port Port Number requested instance of YGOSharp is running on
 * @param {Object} webSockectConnection Players connection to the server.
 * @param {Function} callback Function to run once player is connected.
 * @returns {Object} TCP Client Connection Instance
 */
function connectToYGOSharp(roomInstance, webSockectConnection, slot, callback) {
    var port = roomInstance.port,
        dataStream = new DataStream(),
        gameBoard = new GameBoard(webSockectConnection, slot, roomInstance.masterRule),
        tcpConnection;

    /**
     * Disect a message header from YGOPro.
     * @param {Buffer} data YGOPro Protocol Message.
     * @returns {Packet[]} Disected message in an array.
     */
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

    function gameStateUpdater(gameActions) {
        gameActions.forEach(function(gameAction) {
            webSockectConnection.write(boardController(gameBoard, slot, gameAction, tcpConnection));
        });

    }

    function cutConnections() {
        if (tcpConnection) {
            tcpConnection.end();
        }
    }

    tcpConnection = net.connect(port, ip, function() {
        tcpConnection.on('data', function(data) {
            dataStream.input(data)
                .map(parsePackets)
                .map(gameStateUpdater);
        });
        webSockectConnection.on('error', cutConnections);
        webSockectConnection.on('close', cutConnections);

        console.log('Send Game request for', webSockectConnection.activeduel);
        var CTOS_PlayerInfo = gameResponse('CTOS_PlayerInfo', 'Player'),
            CTOS_JoinGame = gameResponse('CTOS_JoinGame', webSockectConnection.activeduel),
            toDuelist = gameResponse('CTOS_HS_TODUELIST');

        tcpConnection.write(Buffer.concat([CTOS_PlayerInfo, CTOS_JoinGame]));
        callback();
    });
    tcpConnection.setNoDelay(true);
    tcpConnection.on('error', cutConnections);
    tcpConnection.on('close', cutConnections);
    tcpConnection.answerListener = gameBoard.answerListener;
    return tcpConnection;
}

/**
 * Takes a deck, sends it to YGOSharp, then locks in the deck.
 * @param {Object} tcpConnection Connection to YGOSharp
 * @param {YGOProDeck} deck a deck in the proper format
 * @returns {undefined}
 */
function lockInDeck(tcpConnection, deck) {
    tcpConnection.write(gameResponse('CTOS_UPDATE_DECK', deck));
    tcpConnection.write(gameResponse('CTOS_HS_READY'));
}

/*
 {
            automatic: settings.info.automatic,
            roompass: settings.roompass,
            started: false,
            deckcheck: 0,
            draw_count: 0,
            ot: parseInt(settings.info.ot, 10),
            banlist: settings.info.banlist,
            banlistid: settings.info.banlistid,
            mode: settings.info.mode,
            cardpool: settings.info.cardpool,
            noshuffle: settings.info.shuf,
            prerelease: settings.info.prerelease,
            legacyfield: (banlist[settings.info.banlist].masterRule !== 4),
            rule: 0,
            startLP: settings.info.startLP,
            starthand: 0,
            timelimit: 0,
            player: {
                0: {
                    name: '',
                    ready: false
                },
                1: {
                    name: '',
                    ready: false
                }
            },
            spectators: [],
            delCount: 0
        };
        */

/**
 * Start a YGOSharp instance, and connect users to it.
 * @param {Object} instance game state object
 * @param {Object[]} sockets connections to the server.
 * @returns {Object} augmented game state object
 */
function startYGOSharp(instance, sockets) {
    var parametersList = ['StandardStreamProtocol=true',
        'Port=' + instance.port,
        'ClientVersion=0x1338',
        'BanlistFile=./lflist.conf',
        'ScriptDirectory=' + './../../ygopro-scripts',
        'DatabaseFile=./cards.cdb',
        'Rule=' + 0,
        'Mode=' + 0,
        'Banlist=' + 0,
        'StartLp=' + instance.startLP,
        'GameTimer=300',
        'NoCheckDeck=true',
        'NoShuffleDeck=' + Boolean(instance.shuf),
        'EnablePriority=false'
    ];
    console.log(YGOSharp + ' ' + parametersList.join(' '));
    instance.ygopro = child_process.spawn(YGOSharp, parametersList, {
        cwd: './bin/'
    });

    var ygopro = instance.ygopro;
    ygopro.sockets = [];
    ygopro.on('close', function(error) {
        console.log(error);
    });
    ygopro.stderr.on('error', function(error) {
        console.log(error);
        ygopro.kill();
        console.log('Game ended with issues', error);
    });
    ygopro.stdout.on('error', function(error) {
        console.log(error);
        ygopro.kill();
        console.log('Game ended with issues', error);
    });
    ygopro.stdout.on('data', function(core_message_raw) {

        if (core_message_raw.toString().indexOf('::::') < 0) {
            return;
        }
        var core_message = core_message_raw.toString().split('|');
        console.log(core_message);
        if (core_message[0].trim() === '::::network-ready') {
            ygopro.sockets[0] = connectToYGOSharp(instance, sockets[0], 'p0', function() {
                lockInDeck(ygopro.sockets[0], sockets[0].deck);
                ygopro.sockets[1] = connectToYGOSharp(instance, sockets[1], 'p1', function() {
                    lockInDeck(ygopro.sockets[1], sockets[1].deck);
                    setTimeout(function() {
                        ygopro.sockets[0].write(gameResponse('CTOS_START'));
                    }, 500);

                });
            });
        }
    });

    instance.newConnection = function(socket, slot) {
        ygopro.sockets.push(connectToYGOSharp(instance, socket, slot, function() {

        }));
    };

    instance.answerListener = function(player, uid, answer) {
        ygopro.sockets[player].answerListener.emit(uid, answer);
    };

    return instance;
}

module.exports = startYGOSharp;