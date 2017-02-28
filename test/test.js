var ygoEngine = require('../libs/ygojs-core.js'),
    testDecks = require('./testDecks.js'),
    assert = require('chai').assert,
    query = require('./query.js');

function setupDuel(player1Deck, player2Deck) {
    let game = ygoEngine(function (view, stack) {
        // console.log(view, stack);
        // you can test the view (what it sends users) and the stack (all the cards in the system) here.
    });
    var currentGameState;
    game.lock[0] = true; // lock in player 1
    game.lock[1] = true; // lock in player 2

    // game has a number of methods on it, we can use them to manipulate the duel.
    game.startDuel(player1Deck, player2Deck, true); // start the duel with manual enabled.
    return game; // return a started game.
}

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
        var game = setupDuel(testDecks.modernYugiDeck, testDecks.modernYugiDeck); // start a game with two decks.
        var currentGameState = game.getStack(); // now we have a COPY of the current gamestate, we can run test on it!
        var wholefield = query.field(currentGameState); // lets format it a bit so its easier to work with.

        assert.equal(currentGameState.length, 110, 'should contain 110 cards');
        assert.equal(wholefield.player1.DECK.length, 40, 'Player 1\'s deck should contain 40 cards');
        assert.equal(wholefield.player2.DECK.length, 40, 'Player 2\'s deck should contain 40 cards');
        done();
    });
});