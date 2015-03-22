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

//check all JSON files are JSON
//do JSLint on everything