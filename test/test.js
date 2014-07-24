/* jshint node : true */
/* jshint mocha : true */

var Browser = require("zombie");
var assert = require('assert');
var net = require('net');
var fs = require('fs');
var net = require('net');

console.log('Running test');
describe('YGOCore is assembled correctly', function () {
    it('YGOCore built', function () {
        assert((fs.existsSync('server/http/ygopro/YGOServer.exe')), true);
    });
    it('Card Database included', function () {
        assert((fs.existsSync('server/http/ygopro/cards.cdb')), true);
    });
    it('Ban List included', function () {
        assert((fs.existsSync('server/http/ygopro/lflist.conf')), true);
    });
    it('SQLite.dll included', function () {
        assert((fs.existsSync('server/http/ygopro/System.Data.SQLite.dll')), true);
    });
    it('OCGCOre built', function () {
        assert((fs.existsSync('server/http/ygopro/libocgcore.so') ||
            (fs.existsSync('server/http/ygopro/ocgcore.dll')), true));
    });
});
describe('Testing that Dependencies Load', function () {
    it('Loaded Objectifier', function () {
        var target = require('../server/libs/objectifier.js');
    });
    it('Loaded Packet Decoder', function () {
        var target = require('../server/libs/parsepackets.js');
    });
    it('Loaded Recieve Client to Server Message Marker', function () {
        var target = require('../server/libs/recieveCTOS.js');
    });
    it('Loaded Recieve Server to Client Message Marker', function () {
        var target = require('../server/libs/recieveSTOC.js');
    });
    it('Loaded Development/Stage/Production Markers', function () {
        var target = require('../server/libs/servercontrol.json');
        assert((target.production === 'http://salvationdevelopment.com/launcher/'), true);
    });
    it('Loaded Update System', function () {
        var target = require('../server/libs/update.js');
    });
});

describe('TOS & Licences are Included', function () {
    it('Terms of Service', function () {
        assert((fs.existsSync('../server/http/licence/sdlauncher-tos.text') !== null), true);
    });
    it('YGOPro', function () {
        assert((fs.existsSync('../server/http/licence/ygopro.txt') !== null), true);
    });
    it('Node-Webkit', function () {
        assert((fs.existsSync('../server/http/licence/node-webkit.txt') !== null), true);
    });
    it('Machinima Sound', function () {
        assert((fs.existsSync('../server/http/licence/machinimasound.text') !== null), true);
    });
    it('Fake Detection', function () {
        assert((fs.existsSync('../server/http/licence/sdlauncher-tos.text') !== null), false);
    });

});
describe('Structures Test', function () {
    var structureDefinition = require('../server/libs/objectifier.js');
    it('Structure Creation', function () {
        var header = {
            test: 'char',
            long: 'long'
        };
        var strut = structureDefinition(header);
        var out = strut.write({
            test: 'a',
            long: "abcd    "
        });
        var validate = strut.read(out);
        assert((validate.test === "a"), true);
        assert((validate.long === "abcd    "), true);
    });
});
describe('Test Network Connection Methods', function () {
    var target = require('../server/server.js');
    var proxy = require('../server/http/js/proxy.js');
    it('TCP Native', function () {
        var socket = net.createConnection(8911);
        socket.on('connect', function (connect) {
            var playerconnect1 = require('./playerconnect1.js');
            var message = new Buffer(playerconnect1);
            socket.write(message);

        });
    });
    it('TCP To Websocket Proxy', function () {
        var socket = net.createConnection(8912);
        socket.on('connect', function (connect) {
            var playerconnect1 = require('./playerconnect1.js');
            var message = new Buffer(playerconnect1);
            socket.write(message);
        });
    });
    it('Primus Websocket Connects, Starts Receieving Gamelist, and Request Duel', function () {
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
    });
});
describe('Test Offline Server', function () {
    var server = require('../client/interface/js/offline-server.js');
    var browser = new Browser();

    it('Offline Mode Loads', function () {
        browser.visit("http://localhost:3000/index.html").
        then(function () {
            assert.equal(browser.text("H1"), "Deferred zombies");
        }).
        fail(function (error) {
            console.log("Oops", error);
        });
    });
});
/*
var structureDefinition = require('../objectifier.js');

var structureDefinition = require('../objectifier.js');
var header = {
    test: ['char', 10],
    long: 'long'
};
var strut = structureDefinition(header);
var out = strut.write({
    test: 'a123456789',
    long: "abcd    "
});
var validate = strut.read(out);
console.log(validate)
//console.log(validate.test.length, "a123456789".length, true);
//console.log(validate.long.length, "abcd    ".length, true);
console.log(validate.test, "a", true);
console.log(validate.long, "abcd    ", true);*/