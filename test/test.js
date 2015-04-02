/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
/*mocha globals*/
/*global describe, it*/
var assert = require("assert");

//global.__base = __dirname + '/server/';

describe('System', function () {
    'use strict';
    it('Should start the server', function () {
        var core = require('../server/server.js'),
            i = 0,
            commands = [
                '::::join-slot|2008000,1,5,1,U,xxxxx|1',
                '::::leave-slot|2008000,1,5,1,U,xxxxx|1',
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
        ai('2008000,1,5,1,U,0000');
    });

});
describe('Boot Test', function () {
    'use strict';
    it('Should test  CDBUpdate', function () {
        require('../server/libs/carddb-update.js');
    });
    it('Should test  custom_error.js', function () {
        require('../server/libs/custom_error.js');
    });
    it('Should test  datetimestamp.js', function () {
        var datestamp = require('../server/libs/datetimestamp.js');
        datestamp();
    });
    it('Should test  draft.jsjs', function () {
        require('../server/libs/draft.js');
    });
    it('Should test draftbot.js', function () {
        require('../server/libs/draftbot.js');
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
        require('../server/libs/parsepackets.js');
    });
    it('Should test policyserver.js', function () {
        require('../server/libs/policyserver.js');
    });
    it('Should test processIncomingTrasmission.js', function () {
        require('../server/libs/processIncomingTrasmission.js');
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
            loop = Object.create(enums.CTOS),
            i;
        for (i in loop) {
            recieveSTOC({
                STOC: i,
                message: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            });
        }
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
        require('../client/interface/js/offline-server.js');
        // require('../client/interface/js/offline.js');
        //requires refactor before testable.

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