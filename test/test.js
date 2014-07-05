/* jshint node : true */
/* jshint mocha : true */

var assert = require('assert');

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

describe('Licences are Included', function () {

});

describe('Licences are Included', function () {

});