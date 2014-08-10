/* jshint node: true */
var net = require('net');
var WebSocket = require('ws');


var ws = new WebSocket('ws://192.99.11.19:8913/path');
var wsproxy = net.createServer(function () {

}).listen(8912);

wsproxy.on('connection', function (socket) {
    socket.on('data', function (data) {
        ws.send(data);

    });
    ws.on('message', function (data) {
        socket.write(data);
    });
});