/**
 * Parsed YGOro/YGOSharp Message
 * @typedef Message
 * @type {Object}
 * @property {String} command 
 */

/**
 * Memory Buffer
 * @typedef DataStream
 * @type {Object}
 * @property {Function} input
 */

/**
 * A deck a player created and uploaded to the server via the lobby
 * @typedef YGOProDeck
 * @type {Object}
 * @property {Number[]} main
 * @property {Number[]} extra
 * @property {Number[]} side
 */

const child_process = require('child_process'),
    EventEmitter = require('events'),
    net = require('net'),
    http = require('http'),
    queue = require('function-queue'),
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



/**
 * Takes streamed broken up incoming data, stores it in a buffer, and as completed, returns complete messages.
 * @returns {DataStream} data stream with input method.
 */
function DataStream() {
    'use strict';
    var memory = new Buffer([]);

    /**
     * Take in new information, see if new messages can be generated.
     * @param {Buffer} buffer new information
     * @returns {Packet[]} new information in packet form
     */
    function input(buffer) {
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
    }
    return {
        input
    };
}


/**
 * Proxy a TCP YGOPro connection to a TCP connection, which connects to YGOSharp.
 * @param {Number} roomInstance Rules used for connecting and understanding YGOSharp
 * @param {Object} clientConnection Players connection to the server.
 * @param {Function} callback Function to run once player is connected.
 * @returns {Object} TCP Client Connection Instance
 */
function linkYGOProToYGOSharp(roomInstance, clientConnection, callback) {
    var port = roomInstance.port,
        tcpConnection;


    /**
     * Drop connection to YGOSharp, this "should" cause YGOSharp to terminate immediately.
     * @returns {undefined}
     */
    function cutConnections() {
        if (tcpConnection) {
            tcpConnection.end();
        }
    }

    tcpConnection = net.connect(port, ip, function() {
        tcpConnection.on('data', function(data) {
            clientConnection.write(data);
            console.log(data);
        });
        clientConnection.on('error', cutConnections);
        clientConnection.on('close', cutConnections);
        console.log(clientConnection.externalClient);
        tcpConnection.write(clientConnection.externalClient);
        callback();
    });
    tcpConnection.setNoDelay(true);
    tcpConnection.on('error', cutConnections);
    tcpConnection.on('close', cutConnections);

    return tcpConnection;
}

/**
 * Proxy a web socket connection for a Browser to a TCP connection, which connects to YGOSharp.
 * @param {Number} roomInstance Rules used for connecting and understanding YGOSharp
 * @param {Object} playerConnection Players connection to the server.
 * @param {String} slot Player callback identifier, slot they are in the duel lobby.
 * @param {Function} callback Function to run once player is connected.
 * @returns {Object} TCP Client Connection Instance
 */
function linkBrowserToYGOSharp(roomInstance, playerConnection, slot, callback) {
    var port = roomInstance.port,
        dataStream = new DataStream(),
        gameBoard = new GameBoard(playerConnection, slot, roomInstance.masterRule),
        gameQueue = queue(),
        tcpConnection;

    /**
     * Disect a message header from YGOPro.
     * @param {Buffer} data YGOPro Protocol Message.
     * @returns {Message[]} Disected message in an array.
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

    /**
     * Take a game action, edit the game board based on it, then send it to the player.
     * @param {Message} gameAction informatiion to act on.
     * @returns {undefined}
     */
    function preformGameAction(gameAction) {
        var output = boardController(gameBoard, slot, gameAction, tcpConnection, playerConnection);
        if (!playerConnection.externalClient) {
            playerConnection.write(output);
        }
    }

    /**
     * Take a list of game actions, queues them for action.
     * @param {Message[]} gameActions informatiion to act on.
     * @returns {undefined}
     */
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

    /**
     * Drop connection to YGOSharp, this "should" cause YGOSharp to terminate immediately.
     * @returns {undefined}
     */
    function cutConnections() {
        if (tcpConnection) {
            tcpConnection.end();
        }
    }

    tcpConnection = net.connect(port, ip, function() {
        playerConnection.active_ygocore = tcpConnection;
        tcpConnection.on('data', function(data) {
            try {
                dataStream.input(data)
                    .map(parsePackets)
                    .map(queueGameActions);
            } catch (error) {
                console.log(error);
            }
            if (playerConnection.externalClient) {
                playerConnection.write(data);
            }
        });
        playerConnection.on('error', cutConnections);
        playerConnection.on('close', cutConnections);

        console.log('Send Game request for', playerConnection.activeduel);
        if (!playerConnection.externalClient) {
            const CTOS_PlayerInfo = gameResponse('CTOS_PlayerInfo', 'Player'),
                CTOS_JoinGame = gameResponse('CTOS_JoinGame', playerConnection.activeduel),
                toDuelist = gameResponse('CTOS_HS_TODUELIST');

            tcpConnection.write(Buffer.concat([CTOS_PlayerInfo, CTOS_JoinGame]));
        } else {
            tcpConnection.write(playerConnection.externalClient);
        }
        callback();
    });
    tcpConnection.setNoDelay(true);
    tcpConnection.on('error', cutConnections);
    tcpConnection.on('close', cutConnections);
    tcpConnection.answerListener = gameBoard.answerListener;

    gameQueue.autostart = true;
    return tcpConnection;
}


/**
 * Takes a deck, sends it to YGOSharp, then locks in the deck.
 * @param {Object} tcpConnection Connection to YGOSharp
 * @param {YGOProDeck} deck a deck in the proper format
 * @returns {undefined}
 */
function lockInDeck(tcpConnection, deck) {
    if (deck) {
        tcpConnection.write(gameResponse('CTOS_UPDATE_DECK', deck));
        tcpConnection.write(gameResponse('CTOS_HS_READY'));
    }
}

/**
 * Start a YGOSharp instance, and connect users to it.
 * @param {Object} instance game state object
 * @param {Object[]} sockets connections to the server.
 * @returns {Object} augmented game state object
 */
function startYGOSharp(instance, sockets) {
    var ygosharp;
    const parametersList = ['StandardStreamProtocol=true',
            'Port=' + instance.port,
            'ClientVersion=0x1343',
            'BanlistFile=./lflist.conf',
            'ScriptDirectory=' + './../../../ygopro-scripts',
            'DatabaseFile=./cards.cdb',
            'Rule=' + 0,
            'Mode=' + 0,
            'Banlist=' + 0,
            'MasterRule=' + instance.masterRule,
            'StartLp=' + instance.startLP,
            'GameTimer=300',
            'NoCheckDeck=true',
            'NoShuffleDeck=' + Boolean(instance.shuf),
            'EnablePriority=false'
        ],
        aiURL = `http://127.0.0.1:8899/?name=Grandpa&host=127.0.0.1&port=${instance.port}`;
    console.log(YGOSharp, parametersList, {
        cwd: './bin/mr' + instance.masterRule
    });
    instance.ygopro = child_process.spawn(YGOSharp, parametersList, {
        cwd: './bin/mr' + instance.masterRule
    });


    function connectParties() {
        ygosharp.sockets[0] = linkBrowserToYGOSharp(instance, sockets[0], 'p0', function() {
            lockInDeck(ygosharp.sockets[0], sockets[0].deck);
            if (sockets[1]) {
                ygosharp.sockets[1] = linkBrowserToYGOSharp(instance, sockets[1], 'p1', function() {
                    lockInDeck(ygosharp.sockets[1], sockets[1].deck);
                    setTimeout(function() {
                        ygosharp.sockets[0].write(gameResponse('CTOS_START'));
                    }, 500);
                });
            }
        });
    }

    ygosharp = instance.ygopro;
    ygosharp.sockets = [];
    ygosharp.on('close', function(error) {
        console.log('error,', error);
    });
    ygosharp.stderr.on('error', function(error) {
        ygosharp.kill();
        console.log('Game ended with issues', error);
    });
    ygosharp.stdout.on('error', function(error) {
        ygosharp.kill();
        console.log('Game ended with issues', error);
    });
    ygosharp.stdout.on('data', function(core_message_raw) {
        if (core_message_raw.toString().indexOf('::::') < 0) {
            return;
        }
        var core_message = core_message_raw.toString().split('|');
        console.log('core_message', core_message);
        if (core_message[0].trim() === '::::network-ready') {
            if (instance.external) {
                ygosharp.sockets[0] = linkYGOProToYGOSharp(instance, sockets[0], function() {});
            } else {
                connectParties();
            }
            http.get(aiURL);

        }

    });


    /**
     * Connect a spectator joining the game later on.
     * @param {Object} webSockectConnection Players connection to the server.
     * @param {String} slot Player callback identifier, slot they are in the duel lobby.
     * @param {Function} callback what to do after the player has connected.
     * @returns {Number} number of players ever connected.
     */
    instance.newConnection = function(webSockectConnection, slot, callback) {
        ygosharp.sockets.push(linkBrowserToYGOSharp(instance, webSockectConnection, slot, callback));
        return ygosharp.sockets.length;
    };

    instance.answerListener = function(player, uid, answer) {
        ygosharp.sockets[player].answerListener.emit(uid, answer);
    };

    return instance;
}


module.exports = startYGOSharp;