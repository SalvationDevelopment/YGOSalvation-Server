/* jshint node : true */
/* jshint mocha : true */

var ws = require('ws');
var net = require('net');
var assert = require('assert');
var request = require('request');

var coreRequest = new Buffer(require('./playerconnect1'));

require('../server/server.js');
require('../client/interface/js/offline-server.js');
require('../server/libs/carddb-update.js');
describe('Update System', function () {
    it('Runs Properly', function () {
        require('../server/libs/update.js');
    });
});
describe('Main Server', function () {
    it('Accepts TCP Connections', function (complete) {
        var connection = net.connect(8911, '127.0.0.1', function () {
            connection.write(coreRequest);
            setTimeout(function () {
                connection.write(coreRequest);
            }, 250);
            setTimeout(function () {
                complete();
            }, 450);
        });
    });
    it('Accepts Multiple TCP Connections', function (complete) {
        function instance(target, timeout, callback) {
            target = net.connect(8911, '127.0.0.1', function () {
                target.write(coreRequest);
                setTimeout(function () {}, timeout);
            });
            if (callback) {
                setTimeout(callback, timeout);
            }
            return target;
        }
        var player1 = instance(player1, 150, everyoneElseConnects);

        function everyoneElseConnects() {
            var player2 = setTimeout(function () {
                instance(player2, 200);
            }, 50);
            var player3 = setTimeout(function () {
                instance(player3, 400);
            }, 100);
            var player4 = setTimeout(function () {
                instance(player4, 450);
            }, 125);
            var spectator = setTimeout(function () {
                instance(spectator, 490, complete);
            }, 150);
        }
    });
});
describe('Offline Server', function () {
    it('YGOPro No Parameters', function (complete) {
        request('http://127.0.0.1:9467/', complete);
    });
    it('YGOPro Replay', function (complete) {
        request('http://127.0.0.1:9467/r', complete);
    });
    it('YGOPro Deck Edit', function (complete) {
        request('http://127.0.0.1:9467/d', complete);
    });
    it('YGOPro Join', function (complete) {
        request('http://127.0.0.1:9467/j', complete);
    });

});