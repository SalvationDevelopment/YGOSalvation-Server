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

const child_process = require('child_process'),
    EventEmitter = require('events'),
    net = require('net'),
    enums = require('./enums.js'),
    translateYGOProAPI = require('./receiver.js'),
    manualControlEngine = require('./engine_manual.js'),
    boardController = require('./controller_ygopro.js'),
    YGOSharp = './bin/ygosharp.exe',
    ip = '127.0.0.1';

/**
 * Create a single players view of the game that is reflected down to the UI.
 * @param {Object} webSockectConnection A players connection to the server.
 * @returns {Object} A game instance with manual controls.
 */
function GameBoard(webSockectConnection) {
    return manualControlEngine(function gameResponse(view, stack, callback) {
        try {
            webSockectConnection.write((view.p0));
        } catch (error) {
            console.log('failed messaging socket', error);
        } finally {
            if (callback) {
                return callback(stack);
            }
        }
    });
}

/**
 * Disect a message header from YGOPro.
 * @param {Buffer} message YGOPro Protocol Message.
 * @returns {Packet[]} Disected message in an array.
 */
function parsePackets(message) {
    'use strict';

    var task = [],
        packet = {
            message: message.slice(1),
            readposition: 0
        };
    packet.STOC = enums.STOC[message[0]];
    task.push(packet);
    return task;
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
            frameLength = memory[0] + memory[1];
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
function connectToYGOSharp(port, webSockectConnection, callback) {
    var dataStream = new DataStream(),
        gameBoard = new GameBoard(webSockectConnection),
        tcpConnection;

    function gameStateUpdater(gameAction) {
        webSockectConnection.send(boardController(gameBoard, gameAction));
    }

    function cutConnections() {
        if (tcpConnection) {
            tcpConnection.end();
        }
        if (webSockectConnection) {
            webSockectConnection.end();
        }
    }

    tcpConnection = net.connect(port, ip, function() {
        tcpConnection.on('data', function(data) {
            dataStream.input(data)
                .map(parsePackets)
                .map(translateYGOProAPI)
                .map(gameStateUpdater);
        });
        webSockectConnection.on('error', cutConnections);
        webSockectConnection.on('close', cutConnections);

        /*artificial connection initiation*/
        // tcpConnection.write(data);
        callback();
    });
    tcpConnection.setNoDelay(true);
    tcpConnection.on('error', cutConnections);
    tcpConnection.on('close', cutConnections);
    return tcpConnection;

}

/**
 * Start a YGOSharp instance, and connect users to it.
 * @param {Object} instance game state object
 * @param {Object[]} sockets connections to the server.
 * @returns {Object} augmented game state object
 */
function startYGOSharp(instance, sockets) {
    instance.ygopro = child_process.spawn(YGOSharp, function(error, stdout, stderr) {

    });

    var ygopro = instance.ygopro;

    ygopro.stdout.on('error', function(error) {
        ygopro.kill();
        console.log('Game ended with issues', error);
    });
    ygopro.stdout.on('data', function(core_message_raw) {
        if (core_message_raw.toString().indexOf('::::') < 0) {
            return;
        }
        var core_message = core_message_raw.toString().split('|');

        if (core_message[0].trim() === '::::network-ready') {
            ygopro.sockets[0] = connectToYGOSharp(instance.port, sockets[0], function() {
                ygopro.sockets[1] = connectToYGOSharp(instance.port, sockets[1], function() {});
            });

        }
    });

    instance.relay = function(socket, message) {
        ygopro.sockets[socket].send(message);
    };

    instance.newConnection = function(socket) {
        ygopro.sockets.push(connectToYGOSharp(instance.port, socket, function() {

        }));
    };

    return instance;
}

module.exports = startYGOSharp;