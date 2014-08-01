/* jshint node : true */
/* jshint mocha : true */

var assert = require('assert');
var net = require('net');
var coreRequest = new Buffer(require('./playerconnect1'));

require('../server/server.js');

describe('Main Server', function () {
    it('Accepts TCP Connections', function (complete) {
        var connection = net.connect(8911, '127.0.0.1', function () {
            connection.write(coreRequest);
            setTimeout(complete, 350);
        });
    });
    it('Accepts Multiple TCP Connections', function (complete) {
        function instance(target, timeout, callback) {
            target = net.connect(8911, '127.0.0.1', function () {
                target.write(coreRequest);
                setTimeout(callback, timeout);
            });
            return target;
        }
        var player1 = instance(player1, 150, everyoneElseConnects);

        function everyoneElseConnects() {
            var player2 = instance(player2, 200, player2.close);
            var player3 = instance(player3, 400, player3.close);
            var player4 = instance(player4, 450, player4.close);
            var spectator = instance(spectator, 490, complete);
            player1.close();
        }
    });
});