/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
/*mocha globals*/
/*global describe, it*/
var assert = require("assert");

//global.__base = __dirname + '/';
var join = new Buffer([41, 0, 16, 91, 0, 65, 0, 73, 0, 93, 0, 83, 0, 110, 0, 97, 0, 114, 0, 107, 0, 121, 0, 67, 0, 104, 0, 105, 0, 108, 0, 100, 0, 0, 0, 254, 255, 255, 255, 230, 110, 238, 118, 69, 0, 18, 50, 19, 75, 114, 0, 0, 0, 0, 50, 0, 48, 0, 48, 0, 79, 0, 79, 0, 79, 0, 56, 0, 48, 0, 48, 0, 48, 0, 44, 0, 48, 0, 44, 0, 53, 0, 44, 0, 49, 0, 44, 0, 85, 0, 44, 0, 102, 0, 48, 0, 77, 0, 85, 0, 103, 0, 0, 0, 0, 0, 254, 255, 255, 255, 230, 110, 238, 118]);

describe('Boot Test', function () {
    'use strict';;



    it('Should test duelserv.js', function () {
        require('../libs/duelserv.js');
    });
    it('Should test enums.js', function () {
        require('../libs/enums.js');
    });

    it('Should test processCTOS.js', function () {
        var processCTOS = require('../libs/processCTOS.js'),
            parsePackets = require('../libs/parseframes.js');

        processCTOS(join, {}, [{
            message: join.slice(1),
            readposition: 0,
            CTOS: 'CTOS_JOIN_GAME'
        }]);
    });
    it('Should test recieveCTOS.js', function () {
        var recieveCTOS = require('../libs/recieveCTOS.js'),
            enums = require('../libs/enums.js'),
            loop = Object.create(enums.CTOS),
            i;
        for (i in loop) {
            recieveCTOS({
                CTOS: i,
                message: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            });
        }
    });
    it('Should test recieveSTOC.js', function () {
        var recieveSTOC = require('../libs/recieveSTOC.js'),
            enums = require('../libs/enums.js'),
            loop = Object.create(enums.STOC),
            i;
        //        for (i in loop) {
        //            recieveSTOC({
        //                STOC: i,
        //                message: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        //            });
        //}
        //        for (i in loop.STOC_GAME_MSG) {
        //            recieveSTOC({
        //                STOC: 0x1,
        //                message: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        //            });
        //        }

    });

});

describe('Client Boot', function () {
    'use strict';
    // it('Should start the client', function () {
    //     require('../client/interface/js/configuration.js');
    //     var runYGOPro = require('../client/interface/js/offline-server.js');
    //     // require('../client/interface/js/offline.js');
    //     //requires refactor before testable.
    //     runYGOPro('-j');

    // });
    it('Test battlepack3.js', function () {
        require('../http/js/battlepack3.js');
    });
    // it('Test cardmake.js', function () {
    //     require('../http/js/card.js');
    // });
    // it('Test http-gamelist.js', function () {
    //     require('../http/js/http-gamelist.js');    
    // });
    // it('Test updatesystem.js', function () {
    //     require('../http/js/updatesystem.js');    
    // });

});
//check all JSON files are JSON
//do JSLint on everything