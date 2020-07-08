var ygoEngine = require('../src/core'),
    testDecks = require('./testDecks.js'),
    assert = require('chai').assert;
   

describe('Salvation Duel Core', function () {

    it('Should create a game state', function (done) {
        const game = ygoEngine(function (view, stack) {});
        done();
    });

    it('Should start a game state', function (done) {
        var game = ygoEngine(); // start a game with two decks.
      
        done();
    });
});