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
    it('Loaded YGOCore Management System', function () {
        var target = require('../manager.js');
    });

});

describe('Proxy Server', function () {
    it('Loaded Development/Stage/Production Markers', function () {
        var target = require('../server/js/webconnectivity.js');
    });
});

describe('TOS & Licences are Included', function () {
    it('Terms of Service', function () {
        assert((fs.existsSync('../server/licence/sdlauncher-tos.text')), true);
    });
    it('YGOPro', function () {
        assert((fs.existsSync('../server/licence/ygopro.txt')), true);
    });
    it('Node-Webkit', function () {
        assert((fs.existsSync('../server/licence/node-webkit.text')), true);
    });
    it('Machinima Sound', function () {
        assert((fs.existsSync('../server/licence/machinimasound.text')), true);
    });

});