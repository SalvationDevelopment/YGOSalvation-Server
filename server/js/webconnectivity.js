/* jshint node: true */
/* globals $, primus */
var net = require('net');

var server = net.createServer(function (socket) {
    socket.active_ygocore = false;
    socket.active = false;
    socket.on('data', function (data) {
        primus.write({
            action: 'core',
            transmission: data
        });
        console.log(data);
    });
    socket.on('close', function () {

    });
    socket.on('error', function () {
        //console.log('CLIENT ERROR', error);

    });
});
server.listen('127.0.0.1', 8911);