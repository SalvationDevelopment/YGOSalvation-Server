/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
/*mocha globals*/
/*global describe, it*/
var assert = require("assert");

//global.__base = __dirname + '/server/';

describe('System', function () {
    'use strict';
    it('Should start the server', function () {
        require('../server/server.js');
    });
    it('Should start the AI', function () {
        require('../server/server.js');
        require('../server/ai.js');

    });
    
});
describe('Boot Test', function () {
    it('Should test  CDBUpdate', function () {
        require('../server/libs/carddb-update.js');
    });
    it('Should test  custom_error.js', function () {
        require('../server/libs/custom_error.js');
    });
     it('Should test  datetimestamp.js', function () {
        require('../server/libs/datetimestamp.js');
    });
     it('Should test  draft.jsjs', function () {
        require('../server/libs/draft.js');
    });
     it('Should test draftbot.js', function () {
        require('../server/libs/draftbot.js');
    });
     it('Should test emergency.js', function () {
        require('../server/libs/emergency.js');
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
     it('Should test killcore.js', function () {
        require('../server/libs/killcore.js');
    });
     it('Should test ldapclient.js', function () {
        require('../server/libs/ldapclient.js');
    });
     it('Should test manualmode.js', function () {
        require('../server/libs/manualmode.js');
    });
     it('Should test parseframes.js', function () {
        require('../server/libs/parseframes.js');
    });
     it('Should test parsepackets.js', function () {
        require('../server/libs/parsepackets.js');
    });
     it('Should test policyserver.js, function () {
        require('../server/libs/policyserver.js');
    });
     it('Should test processIncomingTrasmission.js', function () {
        require('../server/libs/processIncomingTrasmission.js');
    });
     it('Should test recieveCTOS.js', function () {
        require('../server/libs/recieveCTOS.js');
    });
     it('Should test recieveSTOC.js', function () {
        require('../server/libs/recieveSTOC.js');
    });
     it('Should test servercontrol.json', function () {
        require('../server/libs/servercontrol.json');
    });
     it('Should test ldapserver.js', function () {
        require('../server/libs/ldapserver.js');
    });
     it('Should test ygocore-network-interface.js', function () {
        require('../server/libs/ygocore-network-interface.js');
    });
});
//check all JSON files are JSON
//do JSLint on everything
