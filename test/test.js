const ygoEngine = require('../libs/ygojs-core.js'),
    testDecks = require('./testDecks.js'),
    assert = require('chai').assert;

/**
 * `describe` is output sugar, it helps with the listing.
 * `it` is output sugar, it helps with the listing.
 * `done` is a function passed into it by Mocha itself,
 * run it when the test is fully completed. If you dont call
 * done the test will fail.
 */

describe('Salvation Duel Core', function () {

    it('Should create a game state', function (done) {
        let game = ygoEngine(function (view, stack) {});
        done();
    });

    it('Should start a game state', function (done) {
        let game = ygoEngine(function (view, stack) {
            // console.log(view, stack);
            // you can test the view (what it sends users) and the stack (all the cards in the system) here.
        });
        var player1Deck = testDecks.modernYugiDeck,
            player2Deck = testDecks.modernYugiDeck;

        assert.equal(game.getStack().length, 0) // check the stack is emptry
        game.lock[0] = true; // lock in player 1
        game.lock[1] = true; // lock in player 2
        game.startDuel(player1Deck, player2Deck, true); // start the duel with manual enabled.
        console.log(game.getStack().length);
        assert.equal(game.getStack().length, 110, 'should contain 110 cards');
        done();
    });
});