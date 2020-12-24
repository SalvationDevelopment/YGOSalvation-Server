const { expect } = require('chai');
var coreWrapper = require('../src/core'),
    assert = require('chai').assert;
   

describe('Salvation Duel Core', function () {

    it('Should create a game state', function (done) {
        coreWrapper.main(function (update) {
            done();
        });
        
    });
});