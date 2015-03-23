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
    'use strict';
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
    it('Should test policyserver.js', function () {
        require('../server/libs/policyserver.js');
    });
    it('Should test processIncomingTrasmission.js', function () {
        require('../server/libs/processIncomingTrasmission.js');
    });
    it('Should test recieveCTOS.js', function () {
        var recieveCTOS = require('../server/libs/recieveCTOS.js');
        for (var i = 0; 255 > i; i++) {
            recieveCTOS([i,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        }
    });
    it('Should test recieveSTOC.js', function () {
        recieveSTOC = require('../server/libs/recieveSTOC.js');
        for (var i = 0; 255 > i; i++) {
            recieveSTOC([i,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        }
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

describe('Client Boot', function () {
    'use strict';
    it('Should start the client', function () {
        require('../client/interface/js/configuration.js');
        require('../client/interface/js/offline-server.js');
        require('../client/interface/js/offline.js');
        //requires refactor before testable.
        
    });
    it('Test battlepack3.js', function () {
        require('../server/http/js/battlepack3.js');    
    });
    it('Test cardmake.js', function () {
        require('../server/http/js/card.js');    
    });
    it('Test http-gamelist.js', function () {
        require('../server/http/js/http-gamelist.js');    
    });
    it('Test updatesystem.js', function () {
        require('../server/http/js/updatesystem.js');    
    });
    
    
    it('Should start the AI', function () {
        require('../server/server.js');
        require('../server/ai.js');

    });

});
//check all JSON files are JSON
//do JSLint on everything
