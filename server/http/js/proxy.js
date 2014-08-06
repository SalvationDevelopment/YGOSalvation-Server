/* jshint node: true */
console.log('Runing DevPro Packet Sniffing Proxy');

var net = require('net');

var WebSocket = require('ws');
var parsePackets = require('../../libs/parsepackets.js');
var enums = require('../../libs/enums.js');
var Model = require(__dirname + '/../../../client/interface/js/game-model.js');
//var recieveCTOS = require('../../recieveCTOS');
var recieveSTOC = require('../../libs/recieveSTOC.js');
var ws = new WebSocket('ws://192.99.11.19:8913/path');
var wsproxy = net.createServer(function () {});
wsproxy.listen(8912);
wsproxy.on('connection', function (socket) {
    console.log('new client starting a proxy.');
    socket.on('data', function (data) {
        console.log('sending data');
        ws.send(data);

    });
    ws.on('message', function (data) {
        console.log('recieving data');
        socket.write(data);
        var task = parsePackets('STOC', data);
        console.log(task)
        processTask(task, socket);
    });
});