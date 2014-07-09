/* jshint node: true */

var viewModel = viewModel || {};
var Primus = require('primus');
var net = require('net');
var http = require('http');
var server = http.createServer().listen(5010);
var primus = new Primus(server, {
    parser: 'JSON'
});
var Socket = primus.Socket;
var parsePackets = require('../../parsepackets.js');
var RecieveCTOS = require('../../recieveCTOS');
var RecieveSTOC = require('../../recieveSTOC.js');

var proxy = net.createServer(function (socket) {
    var client = new Socket('http://localhost:5000');
    client.on('data', function (data) {
        proxy.write(data.transmission);
        var task = parsePackets('STOC', data);
        task = (function () {
            var output = [];
            for (var i = 0; task.length > i; i++) {
                output.push(RecieveSTOC(task[i]), viewModel);
            }
            return output;
        })();
    });
    socket.active_ygocore = false;
    socket.active = false;
    socket.on('data', function (data) {
        client.write({
            action: 'core',
            transmission: data
        });
        console.log(data);
        var task = parsePackets('CTOS', data);
        console.log(task);
    });
    socket.on('close', function () {

    });
    socket.on('error', function () {
        //console.log('CLIENT ERROR', error);

    });
});
proxy.listen(8911);