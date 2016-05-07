/*jslint node:true, plusplus:true*/
'use strict';

//I know this looks kinda odd but the code is based off of HTML/DOM manipulations that allow for animations.
//I wanted to make the logic easy to write by just copying and refactoring.

function Card(movelocation, player, index) {
    return {
        type: 'card',
        player: player,
        location: movelocation,
        id: 0,
        index: 0,
        position: 'FaceDown'
    };
}

function field(size) {
    var stack = [];

    function startDuel(player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra) {
        var i;
        for (i = 0; OneDeck > i; i++) {
            stack.push(new Card('DECK', 0, i));
        }
        for (i = 0; TwoDeck > i; i++) {
            stack.push(new Card('DECK', 0, i));
        }
        for (i = 0; OneExtra > i; i++) {
            stack.push(new Card('EXTRA', 0, i));
        }
        for (i = 0; TwoExtra > i; i++) {
            stack.push(new Card('EXTRA', 0, i));
        }
    }
    return {
        startDuel: startDuel
    };
}