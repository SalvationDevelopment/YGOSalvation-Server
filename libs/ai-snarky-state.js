/*jslint node:true, plusplus:true*/
'use strict';



/* This is the state engine for SnarkyChild, it keeps track of the update information from YGOPro
and maintains a repressentation of the game state*/

//I know this looks kinda odd but the code is based off of HTML/DOM manipulations that allow for animations.
//I wanted to make the logic easy to write by just copying and refactoring.

// Need to refactor this out. In the mean time need to know what some numbers mean in YGOPro land.
var enums = require('./enums.js');


//Constructor for card objects.
function Card(movelocation, player, index, unique) {
    return {
        type: 'card',
        player: player,
        location: movelocation,
        id: 0,
        index: 0,
        position: 'FaceDown',
        overlayindex: 0,
        uid: unique
    };
}


//various query filters for doing various things.
function filterIsCard(array) {
    return array.filter(function (item) {
        return item.type === 'card';
    });
}

function filterPlayer(array, player) {
    return array.filter(function (item) {
        return item.player === player;
    });
}

function filterlocation(array, location) {
    return array.filter(function (item) {
        return item.location === location;
    });
}

function filterIndex(array, index) {
    return array.filter(function (item) {
        return item.index === location;
    });
}

function filterOverlyIndex(array, overlayindex) {
    return array.filter(function (item) {
        return item.overlayindex === overlayindex;
    });
}

//initiation of a single independent state intance... I guess this is a class of sorts.
function init() {
    //the field is represented as a bunch of cards with metadata in an array, <div>card/card/card/card</div>
    //numberOfCards is used like a memory address. It must be increased by 1 when creating a new card.
    var stack = [],
        numberOfCards = 0;

    //exposed method to initialize the field;
    function startDuel(player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra) {
        var i;
        for (i = 0; OneDeck > i; i++) {
            stack.push(new Card('DECK', 0, i, numberOfCards));
            numberOfCards++;
        }
        for (i = 0; TwoDeck > i; i++) {
            stack.push(new Card('DECK', 0, i, numberOfCards));
            numberOfCards++;
        }
        for (i = 0; OneExtra > i; i++) {
            stack.push(new Card('EXTRA', 0, i, numberOfCards));
            numberOfCards++;
        }
        for (i = 0; TwoExtra > i; i++) {
            stack.push(new Card('EXTRA', 0, i, numberOfCards));
            numberOfCards++;
        }
    }

    //the way the stack of cards is setup it requires a pointer to edit it.
    function uidLookup(uid) {
        var i;
        for (i = 0; stack.length > i; i++) {
            if (stack[i].uid === uid) {
                return i;
            }
        }
    }

    //returns info on a card.
    function queryCard(player, clocation, index, overlayindex) {
        return filterOverlyIndex(filterIndex(filterlocation(filterPlayer(stack, player), clocation), index), overlayindex);
    }

    /*The YGOPro messages have a design flaw in them where they dont tell the number of cards
    that you have to itterate over in order to get a proper message, this function resolves that problem,
    this flaw has caused me all types of grief.*/
    function cardCollections(player) {
        return {
            DECK: filterlocation(filterPlayer(stack, player), 'DECK').length,
            HAND: filterlocation(filterPlayer(stack, player), 'HAND').length,
            EXTRA: filterOverlyIndex(filterlocation(filterPlayer(stack, player), 'EXTA')).length,
            GRAVE: filterlocation(filterPlayer(stack, player), 'GRAVE').length,
            REMOVED: filterlocation(filterPlayer(stack, player), 'REMOVED').length,
            SPELLZONE: 8,
            MONSTERZONE: 5
        };
    }

    //finds a card, then moves it elsewhere.
    function setState(player, clocation, index, moveplayer, movelocation, moveindex, moveposition, overlayindex, isBecomingCard) {
        var target = queryCard(player, clocation, index, overlayindex),
            pointer = uidLookup(target[0].uid);

        stack[pointer].player = moveplayer;
        stack[pointer].location = movelocation;
        stack[pointer].index = moveindex;
        stack[pointer].position = moveposition;
        stack[pointer].overlayindex = overlayindex;

    }

    //update state of A GROUP OF CARDS based on info from YGOPro
    function updateData(player, clocation, arrayOfCards) {
        var target,
            pointer,
            i;

        for (i = 0; arrayOfCards.length > i; i++) {
            if (arrayOfCards[i].Code !== 'nocard') {
                target = queryCard(player, enums.locations[clocation], i, 0);
                pointer = uidLookup(target[0].uid);
                stack[pointer].position = arrayOfCards[i].Position;
                stack[pointer].id = arrayOfCards[i].Code;
            }
        }
    }

    //update state of A SINGLE CARD based on info from YGOPro
    function updateCard(player, clocation, index, card) {
        var target,
            pointer;

        target = queryCard(player, enums.locations[clocation], index, 0);
        pointer = uidLookup(target[0].uid);
        stack[pointer].position = card.Position;
        stack[pointer].id = card.Code;
    }

    function changeCardPosition(code, cc, cl, cs, cp) {

        var target = queryCard(cc, cl, cs, 0),
            pointer = uidLookup(target[0].uid);

        stack[pointer].id = code;
        setState(cc, cl, cs, cc, cl, cs, cp, 0, false);
    }

    //expose public functions.
    return {
        startDuel: startDuel,
        updateData: updateData,
        updateCard: updateCard,
        cardCollections: cardCollections,
        changeCardPosition: changeCardPosition
    };
}