const http = require('http'),
    Primus = require('primus'),
    logger = require('./logger'),
    { log } = logger.create(logger.config.main, '[INDEX]'),
    { log: debug } = logger.create(logger.config.debug, '[DEBUG]'),
    { log: logError } = logger.create(logger.config.error, '[ERROR]');


function wireProxyConnection(Socket, outboundClient, inboundClient, room) {
    outboundClient = new Socket(`ws://localhost:${room}`);
    inboundClient.write({ action: 'proxy', status: 'connecting' });

    outboundClient.on('open', function open() {
        inboundClient.write({ action: 'proxy', status: 'up' });
        inboundClient.on('data', function (data) {
            outboundClient.write(data);
        });
    });

    outboundClient.on('data', function (data) {
        inboundClient.write(data);
    });

    outboundClient.on('disconnection', function () {
        inboundClient.disconnect();
    });

    inboundClient.on('disconnection', function () {
        outboundClient.disconnect();
    });
}

function createProxyServer(port) {
    const httpServer = http.createServer(function (req, res) {
        res.writeHead(500);
        res.end('Not Implemented\n');
    }), server = new Primus(httpServer);



    server.on('error', function (error) {
        logError(error);
    });

    server.on('connection', function (socket) {
        let client;
        debug('connection event');
        socket.write({ action: 'proxy', status: 'down' });
        socket.on('data', function (message) {
            try {
                if (client) {
                    client.write(message);
                    return;
                }

                if (typeof message.room !== 'number') {
                    socket.write({
                        error: 'Proxy Connection not establismed provide internal port number.'
                    });
                    return;
                }

                if (!client && message.room) {
                    wireProxyConnection(server.Socket, client, socket, message.room);
                }
            } catch (error) {
                logError(error);
            }
        });
    });

    server.on('disconnection', function (spark) {
        debug('disconnection event');
    });

    httpServer.listen(port);
}


createProxyServer(process.env.PROXY_PORT);

module.exports = createProxyServer;