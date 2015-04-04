/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
/*mocha globals*/
/*global describe, it*/
var assert = require("assert");

//global.__base = __dirname + '/server/';
var join = new Buffer([0x15, 0x00, 0x10, 0x5b, 0x00, 0x41, 0x00, 0x49, 0x00, 0x5d, 0x00, 0x53, 0x00, 0x6e, 0x00, 0x61, 0x00, 0x72, 0x00, 0x6b, 0x00, 0x79, 0x00, 0x69, 0x00, 0x12, 0x13, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x32, 0x00, 0x31, 0x00, 0x30, 0x00, 0x4f, 0x00, 0x4f, 0x00, 0x4f, 0x00, 0x38, 0x00, 0x30, 0x00, 0x30, 0x00, 0x30, 0x00, 0x2c, 0x00, 0x31, 0x00, 0x2c, 0x00, 0x35, 0x00, 0x2c, 0x00, 0x31, 0x00, 0x2c, 0x00, 0x55, 0x00, 0x2c, 0x00, 0x37]);

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
        core.initiateSlave();
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
    it('Should start the AI', function () {
        require('../server/server.js');
        var ai = require('../server/ai.js');
        ai.ircInterface('', '', '');
        ai.gamelistUpdate({
            clientEvent: 'duelrequest',
            target: '[AI]SnarkyChild',
            from: 'TravisCI',
            roompass: '2008000,1,5,1,U,xxxxx'
        });
        ai.onConnectGamelist();
        ai.onCloseGamelist();
    });

});
describe('Boot Test', function () {
    'use strict';
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
    it('Should test processIncomingTrasmission.js', function () {
        var processIncomingTrasmission = require('../server/libs/processIncomingTrasmission.js'),
            parsePackets = require('../server/libs/parseframes.js');

        processIncomingTrasmission(join, {}, [{
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
        for (i in loop) {
            recieveSTOC({
                STOC: i,
                message: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            });
        }
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