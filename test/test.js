/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
/*mocha globals*/
/*global describe, it*/
var assert = require("assert");

//global.__base = __dirname + '/server/';
var join = new Buffer([41, 0, 16, 91, 0, 65, 0, 73, 0, 93, 0, 83, 0, 110, 0, 97, 0, 114, 0, 107, 0, 121, 0, 67, 0, 104, 0, 105, 0, 108, 0, 100, 0, 0, 0, 254, 255, 255, 255, 230, 110, 238, 118, 69, 0, 18, 50, 19, 75, 114, 0, 0, 0, 0, 50, 0, 48, 0, 48, 0, 79, 0, 79, 0, 79, 0, 56, 0, 48, 0, 48, 0, 48, 0, 44, 0, 48, 0, 44, 0, 53, 0, 44, 0, 49, 0, 44, 0, 85, 0, 44, 0, 102, 0, 48, 0, 77, 0, 85, 0, 103, 0, 0, 0, 0, 0, 254, 255, 255, 255, 230, 110, 238, 118]);

describe('System', function () {
    'use strict';
    it('Should start the server', function () {
        var core = require('../server/server.js'),
            i = 0,
            commands = [
                '::::join-slot|2008000,1,5,1,U,xxxxx|1',
                '::::left-slot|2008000,1,5,1,U,xxxxx|1',
                '::::join-slot|2008000,1,5,1,U,xxxxx|-1',
                '::::chat|2008000,1,5,1,U,xxxxx|1',
                '::::lock-slot|2008000,1,5,1,U,xxxxx|1',
                '::::spectator|2008000,1,5,1,U,xxxxx|1',
                '::::startduel|2008000,1,5,1,U,xxxxx',
                '::::endduel|2008000,1,5,1,U,xxxxx'];
        for (i; commands.length > i; i++) {
            core.gamelistMessage({
                messagetype: 'coreMessage',
                coreMessage: {
                    core_message_raw: commands[i],
                    port: 100
                }
            });
        }

    });
});
describe('Boot Test', function () {
    'use strict';
    it('Should test parseframes.js', function () {
        require('../server/libs/slave.js');
    });
    it('Should test  CDBUpdate', function () {
        require('../server/libs/carddb-update.js');
    });
    it('Should test  datetimestamp.js', function () {
        var datestamp = require('../server/libs/datetimestamp.js');
        datestamp();
    });
    it('Should test  draft.jsjs', function () {
        require('../server/libs/draft.js');
    });
    it('Should test duelserv.js', function () {
        require('../server/libs/duelserv.js');
    });
    it('Should test enums.js', function () {
        require('../server/libs/enums.js');
    });
    it('Should test gamelist.js', function () {
        require('../server/libs/gamelist.js');
    });
    it('Should test ircbot.js', function () {
        require('../server/libs/ircbot.js');
    });
    // it('Should test ldapclient.js', function () {
    //     require('../server/libs/ldapclient.js');
    // });
    it('Should test parseframes.js', function () {
        require('../server/libs/parseframes.js');
    });
    it('Should test parsepackets.js', function () {
        var pack = require('../server/libs/parsepackets.js');
        pack('CTOS', join);
    });
    it('Should test policyserver.js', function () {
        require('../server/libs/policyserver.js');
    });
    it('Should test processCTOS.js', function () {
        var processCTOS = require('../server/libs/processCTOS.js'),
            parsePackets = require('../server/libs/parseframes.js');

        processCTOS(join, {}, [{
            message: join.slice(1),
            readposition: 0,
            CTOS: 'CTOS_JOIN_GAME'
        }]);
    });
    it('Should test recieveCTOS.js', function () {
        var recieveCTOS = require('../server/libs/recieveCTOS.js'),
            enums = require('../server/libs/enums.js'),
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
        var recieveSTOC = require('../server/libs/recieveSTOC.js'),
            enums = require('../server/libs/enums.js'),
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
    it('Should test servercontrol.json', function () {
        require('../server/libs/servercontrol.json');
    });
    it('Should test ldapserver.js', function () {
        require('../server/libs/ldapserver.js');
    });
    // it('Should test ygocore-network-interface.js', function () {
    //     require('../server/libs/ygocore-network-interface.js');
    // });
});

describe('Client Boot', function () {
    'use strict';
    it('Should start the client', function () {
        require('../client/interface/js/configuration.js');
        var runYGOPro = require('../client/interface/js/offline-server.js');
        // require('../client/interface/js/offline.js');
        //requires refactor before testable.
        runYGOPro('-j');

    });
    it('Test battlepack3.js', function () {
        require('../server/http/js/battlepack3.js');
    });
    it('Test cardmake.js', function () {
        require('../server/http/js/card.js');
    });
    // it('Test http-gamelist.js', function () {
    //     require('../server/http/js/http-gamelist.js');    
    // });
    // it('Test updatesystem.js', function () {
    //     require('../server/http/js/updatesystem.js');    
    // });

});
//check all JSON files are JSON
//do JSLint on everything