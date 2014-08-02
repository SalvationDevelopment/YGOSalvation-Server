/* jshint node : true */
/* jshint mocha : true */

var ws = require('ws');
var net = require('net');
var assert = require('assert');
var request = require('request');

var coreRequest = new Buffer(require('./playerconnect1'));

require('../server/server.js');
require('../server/http/js/proxy.js');
require('../client/interface/js/offline-server.js');

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
            var player2 = instance(player2, 200);
            var player3 = instance(player3, 400);
            var player4 = instance(player4, 450);
            var spectator = instance(spectator, 490, complete);
        }
    });
    it('Accepts local TCP Connections proxy them to WS connection', function (complete) {
        var connection = net.connect(8912, '127.0.0.1', function () {
            connection.write(coreRequest);
            setTimeout(complete, 350);
        });
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