/* jshint node : true */
/* jshint mocha : true */

var assert = require('assert');
var net = require('net');
var fs = require('fs');

console.log('Running test');

describe('Testing that Dependencies Load', function () {
    it('Loaded Objectifier', function () {
        var target = require('../objectifier.js');
    });
    it('Loaded Packet Decoder', function () {
        var target = require('../parsepackets.js');
    });
    it('Loaded Recieve Client to Server Message Marker', function () {
        var target = require('../recieveCTOS.js');
    });
    it('Loaded Recieve Server to Client Message Marker', function () {
        var target = require('../recieveSTOC.js');
    });
    it('Loaded Development/Stage/Production Markers', function () {
        var target = require('../servercontrol.json');
        assert((target.production === 'http://salvationdevelopment.com/launcher/'), true);
    });
    it('Loaded Development/Stage/Production Markers', function () {
        var target = require('../servercontrol.json');
        assert((target.production === 'http://salvationdevelopment.com/launcher/'), true);
    });
    it('Loaded Update System', function () {
        var target = require('../server/update.js');
        var manifest = require('../server/manifest/ygopro.json');
    });
});

describe('Proxy Server', function () {
    it('Loaded Development/Stage/Production Markers', function () {
        var target = require('../server/js/webconnectivity.js');
    });
});

describe('TOS & Licences are Included', function () {
    it('Terms of Service', function () {
        assert((fs.existsSync('../server/licence/sdlauncher-tos.text') !== null), true);
    });
    it('YGOPro', function () {
        assert((fs.existsSync('../server/licence/ygopro.txt') !== null), true);
    });
    it('Node-Webkit', function () {
        assert((fs.existsSync('../server/licence/node-webkit.text') !== null), true);
    });
    it('Machinima Sound', function () {
        assert((fs.existsSync('../server/licence/machinimasound.text') !== null), true);
    });
    it('Fake Detection', function () {
        assert((fs.existsSync('../server/licence/sdlauncher-tos.text') !== null), false);
    });

});
describe('Structures Test', function () {
    var structureDefinition = require('../objectifier.js');
    it('Structure Creation', function () {
        var strut = null;
        strut = structureDefinition({
            test: 'int',
            long: "long"
        });
        assert((strut !== null), true);
    });
    it('Structure Read', function () {
        var strut = structureDefinition({
            test: 'int',
            long: "long"
        });
        var out = strut.write({
            test: 1,
            long: 34
        });
    });
    it('Structure Write', function () {
        var strut = structureDefinition({
            test: 'int',
            long: "long"
        });
        var out = strut.write({
            test: 1,
            long: 34
        });
    });
});
describe('Test Network Connection Methods', function () {
    var target = require('../manager.js');

    it('TCP Native', function () {
        var socket = net.createConnection(8911);
        socket.on('connect', function (connect) {
            var playerconnect1 = require('./playerconnect1.js');
            var message = new Buffer(playerconnect1);
            socket.write(message);
            socket.end();
        });
    });
    it('Primus Websocket Connects', function () {
        var http = require('net');
        var server = http.createServer().listen(5001);
        var Primus = require('primus');
        var primus = new Primus(server);
        var Socket = primus.Socket;

        var client = new Socket('http://localhost:5000');
        client.write({

        });

    });
    it('Primus Websocket Connects and Joins', function () {
        var http = require('net');
        var server = http.createServer().listen(5002);
        var Primus = require('primus');
        var primus = new Primus(server);
        var Socket = primus.Socket;

        var client = new Socket('http://localhost:5000');
        var playerconnect1 = require('./playerconnect1.js');
        var message = new Buffer(playerconnect1);
        client.write({
            action: 'join'
        });
        primus.destroy({
            timeout: 300
        });
    });
    it('Primus Websocket Connects, Joins, and Leaves', function () {
        var http = require('net');
        var server = http.createServer().listen(5003);
        var Primus = require('primus');
        var primus = new Primus(server);
        var Socket = primus.Socket;

        var client = new Socket('http://localhost:5000');
        var playerconnect1 = require('./playerconnect1.js');
        var message = new Buffer(playerconnect1);
        client.write({
            action: 'join'
        });
        client.write({
            action: 'leave'
        });
        primus.destroy({
            timeout: 300
        });
    });
    it('Primus Websocket Connects and Request Duel', function () {
        var http = require('net');
        var server = http.createServer().listen(5004);
        var Primus = require('primus');
        var primus = new Primus(server);
        var Socket = primus.Socket;

        var client = new Socket('http://localhost:5000');
        var playerconnect1 = require('./playerconnect1.js');
        var message = new Buffer(playerconnect1);
        client.write({
            action: 'core',
            transmission: message
        });
        primus.destroy({
            timeout: 300
        });
    });
});