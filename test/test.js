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

describe('Test TCP Network Server Connection', function () {
    var target = require('../manager.js');

    it('Loaded YGOCore Management System', function () {
        var socket = net.createConnection(8911);
        socket.on('connect', function (connect) {
            var playerconnect1 = require('./playerconnect1.json');
            var message = new Buffer(playerconnect1);
            socket.write(message);
        });
        it('Loaded YGOCore Management System', function () {
            var http = require('http');
            var server = http.createServer().listen(5000);
            var Primus = require('primus');
            var primus = new Primus(server),
                Socket = primus.Socket;

            var client = new Socket('http://localhost:5000');
            client.write({
                action: 'join'
            });
            client.write({
                action: 'leave'
            });
        });
    });
});

describe('Structures Test', function () {
    var structureDefinition = require('../objectifier.js');


    it('strut creation', function () {
        var strut = new structureDefinition({
            test: 'int',
            long: "long"
        });
        var out = strut.write({
            test: 1,
            long: 34
        });
        console.log(out);
    });
});