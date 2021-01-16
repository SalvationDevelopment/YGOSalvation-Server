const { expect } = require('chai');
var coreWrapper = require('../src/core/core'),
    assert = require('chai').assert;
   

describe('Salvation Duel Core', function () {

    it('Should create a game state', function (done) {
        const best = coreWrapper.main({}, function (update) {
            done();
        });
        
        
    });
});