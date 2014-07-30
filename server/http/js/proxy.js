/* jshint node: true */
var viewModel = viewModel || {};
var net = require('net');

var WebSocket = require('ws');
var parsePackets = require('../../../../server/libs/parsepackets.js');
//var recieveCTOS = require('../../recieveCTOS');
var recieveSTOC = require('../../libs/recieveSTOC.js');
var ws = new WebSocket('ws://127.0.0.1:8913/path');
var proxy = net.createServer(function () {});
proxy.on('connection', function (socket) {
    console.log('new client starting a proxy.');
    socket.on('data', function (data) {
        console.log('sending data');
        ws.send(data);

    });
    ws.on('message', function (data) {
        socket.write(data);
        var task = parsePackets('STOC', data);
        processTask(task, socket);
    });
});

function processTask(task, socket) {
    task = (function () {
        var output = [];
        for (var i = 0; task.length > i; i++) {
            output.push(recieveSTOC(task[i]));
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
            console.log('Replay Information', task[i].STOC_TIME_LIMIT);
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
        if (task[i].STOC_SELECT_TP) {
            console.log('Chat', task[i].STOC_TYPE_CHANGE);
        }
        if (task[i].STOC_JOIN_GAME) {
            console.log('Join Game', task[i].STOC_TYPE_CHANGE);
        }
        if (task[i].UNKONW) {
            console.log('????', task[i].UNKNOWN);
        }
    }
}
proxy.listen(8912);