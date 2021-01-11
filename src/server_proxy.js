const http = require('http'),
    Primus = require('primus'),
    logger = require('./logger'),
    { log } = logger.create(logger.config.main, '[INDEX]'),
    { log: debug } = logger.create(logger.config.debug, '[DEBUG]'),
    { log: logError } = logger.create(logger.config.error, '[ERROR]');


function wireProxyConnection(Socket, outbound, inbound, room) {
    outbound = new Socket(`ws://localhost:${room}`);
    inbound.write({ action: 'proxy', status: 'connecting' });

    outbound.on('open', function open() {
        inbound.write({ action: 'proxy', status: 'up' });
    });

    outbound.on('data', function (data) {
        inbound.write(data);
    });

    outbound.on('disconnection',function () {
        inbound.disconnect();
    });

    inbound.on('disconnection',function () {
        outbound.disconnect();
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
            if (client) {
                client.write(message);
                return;
            }
            if (!client && message.room) {
                wireProxyConnection(server.Socket, client, socket, message.room);
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