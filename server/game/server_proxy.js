const http = require('http'),
    { WebSocketServer, WebSocket } = require('ws'),
    logger = require('./logger'),
    { log: debug } = logger.create(logger.config.debug, '[DEBUG]'),
    { log: logError } = logger.create(logger.config.error, '[ERROR]');

/**
 * Sends packet used by the server proxy module.
 * @param {Object} socket The socket object supplies the structured input used by the server proxy module, including the `readyState` property.
 * @param {number} socket.readyState The `readyState` property supplies structured input used by the server proxy module.
 * @param {Object} packet The packet value provides an input used by the server proxy module.
 * @returns {void} Does not return a value.
 */
function sendPacket(socket, packet) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
    }
    socket.send(JSON.stringify(packet));
}

/**
 * Executes the wire proxy connection helper used by the server proxy module.
 * @param {Object} outboundClient The outboundClient object supplies the structured input used by the server proxy module, including the `readyState` property.
 * @param {number} outboundClient.readyState The `readyState` property supplies structured input used by the server proxy module.
 * @param {Object} inboundClient The inboundClient object supplies the structured input used by the server proxy module, including the `readyState` property.
 * @param {number} inboundClient.readyState The `readyState` property supplies structured input used by the server proxy module.
 * @param {Object} room The room value provides an input used by the server proxy module.
 * @returns {WebSocket} Returns the value produced by the server proxy module.
 */
function wireProxyConnection(outboundClient, inboundClient, room) {
    outboundClient = new WebSocket(`ws://localhost:${room}`);
    sendPacket(inboundClient, { action: 'proxy', status: 'connecting' });

    outboundClient.on('open', function open() {
        sendPacket(inboundClient, { action: 'proxy', status: 'up' });
    });

    outboundClient.on('message', function onMessage(raw) {
        let data;
        try {
            data = JSON.parse(raw.toString());
        } catch (_error) {
            return;
        }
        sendPacket(inboundClient, data);
    });

    outboundClient.on('close', function () {
        if (inboundClient.readyState === WebSocket.OPEN) {
            inboundClient.close();
        }
    });

    outboundClient.on('error', function (error) {
        logError(error);
        if (inboundClient.readyState === WebSocket.OPEN) {
            inboundClient.close();
        }
    });

    inboundClient.on('close', function () {
        if (outboundClient.readyState === WebSocket.OPEN || outboundClient.readyState === WebSocket.CONNECTING) {
            outboundClient.close();
        }
    });

    return outboundClient;
}

/**
 * Creates proxy server used by the server proxy module.
 * @param {number} port The port value provides an input used by the server proxy module.
 * @returns {void} Does not return a value.
 */
function createProxyServer(port) {
    const httpServer = http.createServer(function (_req, res) {
            res.writeHead(500);
            res.end('Not Implemented\n');
        }),
        server = new WebSocketServer({ server: httpServer });

    server.on('error', function (error) {
        logError(error);
    });

    server.on('connection', function (socket) {
        let outboundClient;
        debug('connection event');
        sendPacket(socket, { action: 'proxy', status: 'down' });

        socket.on('message', function (raw) {
            let message;
            try {
                message = JSON.parse(raw.toString());
            } catch (_error) {
                return;
            }
            try {
                if (outboundClient && outboundClient.readyState === WebSocket.OPEN) {
                    sendPacket(outboundClient, message);
                    return;
                }

                if (typeof message.room !== 'number') {
                    sendPacket(socket, {
                        error: 'Proxy Connection not establismed provide internal port number.'
                    });
                    return;
                }

                outboundClient = wireProxyConnection(outboundClient, socket, message.room);
            } catch (error) {
                logError(error);
            }
        });

        socket.on('close', function () {
            debug('disconnection event');
            if (outboundClient &&
                (outboundClient.readyState === WebSocket.OPEN || outboundClient.readyState === WebSocket.CONNECTING)) {
                outboundClient.close();
            }
        });
    });

    httpServer.listen(port);
}

createProxyServer(process.env.PROXY_PORT);

module.exports = createProxyServer;
