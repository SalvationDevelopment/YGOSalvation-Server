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
//var recieveCTOS = require('../../recieveCTOS');
var recieveSTOC = require('../../recieveSTOC.js');

var proxy = net.createServer(function (socket) {
    var client = new Socket('http://localhost:5000');
    client.on('data', function (data) {
        proxy.write(data.transmission);
        var task = parsePackets('STOC', data);
        task = (function () {
            var output = [];
            for (var i = 0; task.length > i; i++) {
                output.push(recieveSTOC(task[i]), viewModel);
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

function processTask(task, socket) {
    task = (function () {
        var output = [];
        for (var i = 0; task.length > i; i++) {
            output.push(recieveSTOC(task[i], socket.username, socket.hostString));
        }
        return output;
    })();
    for (var i = 0; task.length > i; i++) {
        if (task[i].CTOS_JOIN_GAME) {
            socket.active = true;
            socket.hostString = task[i].CTOS_JOIN_GAME;
            //console.log(task);
        }
        if (task[i].STOC_REPLAY) {
            //save replay file
        }
        if (task[i].STOC_TIME_LIMIT) {
            console.log('Time Limit', task[i].STOC_TIME_LIMIT);
        }
        if (task[i].STOC_CHAT) {
            console.log('Chat', task[i].STOC_CHAT);
        }
        if (task[i].STOC_HS_PLAYER_ENTER) {
            console.log('Player Entered', task[i].STOC_HS_PLAYER_ENTER);
        }
        if (task[i].STOC_HS_PLAYER_CHANGE) {
            console.log('Player Change', task[i].STOC_HS_PLAYER_CHANGE);
        }
        if (task[i].STOC_HS_WATCH_CHANGE) {
            console.log('Change in the number of watchers', task[i].STOC_HS_WATCH_CHANGE);
        }
        if (task[i].STOC_TYPE_CHANGE) {
            console.log('Chat', task[i].STOC_TYPE_CHANGE);
        }
        if (task[i].UNKONW) {
            console.log('????', task[i].UNKNOWN);
        }
    }
}
proxy.listen(8911);