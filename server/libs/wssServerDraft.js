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
        host: 'ws://ygopro.us/',
        port: 24555,
        verifyClient: function (info) {
            console.log("WebSocket origin: " + info.origin);
            console.log("WebSocket headers: ", info.req);
            console.log("WebSocket connection is " + (info.secure ? "secure" : "not secure"));
            return true; // return true anyway because we're testing out the protocols
        }
    };
    
var ws = require("ws"),
    WebSocketServer = new ws.Server(wss_config);
    
WebSocketServer.on('connection', function (WebSocket) {
    console.log("Headers set: ", WebSocket.headers);
    WebSocket.on('message', function (data) {
        handleServerMessage(data);
    });
});

WebSocketServer.on('error', function (error) {
    console.log('Server encountered an error: ', error);
});