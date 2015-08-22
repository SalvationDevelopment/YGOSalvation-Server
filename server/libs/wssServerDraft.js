/*
 ************************************
 *
 * Salvation WSS
 *
 * Listen to data from client_ws.js
 *
 *************************************
 **/
 
 process.on('uncaughtException', function (error) {
    console.log('Error not caught: ', error);
});
 
var wss_config = {
        host: 'ygopro.us',
        port: 55542,
        verifyClient: function (info) {
            var ACCEPT_HANDSHAKE = (info.origin.indexOf(ACCEPT_ORIGIN) > -1 && info.req.headers.host.indexOf(ACCEPT_ORIGIN) > -1);
            console.log("Handshake requested by " + info.req.socket.server._connectionKey + " (" + info.req.headers['sec-websocket-key'] + "); handshake " + (ACCEPT_HANDSHAKE ? "accepted" : "rejected due to false origin"));
            return ACCEPT_HANDSHAKE;
        }
    },
    ACCEPT_ORIGIN = "ygopro.us";
    
var ws = require("ws"),
    WebSocketServer = new ws.Server(wss_config);
    
WebSocketServer.on('connection', function (WebSocket) {
    console.log('New WebSocket connected: ', WebSocket);
    console.log('Clients connected: ', WebSocketServer.clients);
});

WebSocketServer.on('error', function (error) {
    console.log('Server encountered an error: ', error);
});