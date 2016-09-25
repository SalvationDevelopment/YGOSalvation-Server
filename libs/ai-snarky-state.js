/*jslint node:true, plusplus:true, bitwise : true*/
'use strict';



/* This is the state engine for SnarkyChild, it keeps track of the update information from YGOPro
 * and maintains a repressentation of the game state, I know this looks kinda odd but the code is
 * based off of HTML/DOM manipulations  that allow for animations.I wanted to make the logic easy
 * to write by just copying and refactoring.Need to refactor this out. In the mean time need to
 * know what some numbers mean in YGOPro land.
 */
var enums = require('./enums.js');
var fs = require('fs');


/**
 * Constructor for card objects.
 * @param   {string} movelocation 'DECK'/'EXTRA' etc, in caps. 
 * @param   {number} player       [[Description]]
 * @param   {number} index        [[Description]]
 * @param   {number} unique       [[Description]]
 * @returns {object}   a card
 */
function Card(movelocation, player, index, unique) {
    return {
        type: 'card',
        player: player,
        location: movelocation,
        id: 0,
        index: index,
        position: 'FaceDown',
        overlayindex: 0,
        uid: unique
    };
}


/**
 * various query filters for doing various things.
 * @param   {array} array a stack of cards which may have overlay units attached to them.
 * @returns {array} a stack of cards, devoid of overlay units.
 */
function filterIsCard(array) {
    return array.filter(function (item) {
        return item.type === 'card';
    });
}

/**
 * various query filters for doing various things.
 * @param   {[[Type]]} array [[Description]]
 * @returns {[[Type]]} [[Description]]
 */
function filterPlayer(array, player) {
    return array.filter(function (item) {
        return item.player === player;
    });
}

/**
 * various query filters for doing various things.
 * @param   {[[Type]]} array [[Description]]
 * @returns {[[Type]]} [[Description]]
 */
function filterlocation(array, location) {
    return array.filter(function (item) {
        return item.location === location;
    });
}

function filterIndex(array, index) {
    return array.filter(function (item) {
        return item.index === index;
    });
}

function filterOverlyIndex(array, overlayindex) {
    return array.filter(function (item) {
        return item.overlayindex === overlayindex;
    });
}

/**
 * initiation of a single independent state intance... I guess this is a class of sorts.
 * @returns {object} State instance
 */
function init() {
    //the field is represented as a bunch of cards with metadata in an array, <div>card/card/card/card</div>
    //numberOfCards is used like a memory address. It must be increased by 1 when creating a new card.
    var stack = [],
        numberOfCards = 0;

    /**
     * Exposed method to initialize the field; You only run this once.
     * @param {number} player1StartLP Player 1 starting Lifepoint count
     * @param {number} player2StartLP Player 2 starting Lifepoint count
     * @param {number} OneDeck        Number of cards in Player 1s main deck
     * @param {number} TwoDeck        Number of cards in Player 2s main deck
     * @param {number} OneExtra       Number of cards in Player 1s extra deck
     * @param {number} TwoExtra       Number of cards in Player 2s extra deck
     */
    function startDuel(player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra) {
        var i;

        // Rare instance you'll see me use a for loop.
        for (i = 0; OneExtra > i; i++) {
            stack.push(new Card('EXTRA', 0, i, numberOfCards));
            numberOfCards++;
        }
        for (i = 0; TwoExtra > i; i++) {
            stack.push(new Card('EXTRA', 1, i, numberOfCards));
            numberOfCards++;
        }
        for (i = 0; OneDeck > i; i++) {
            stack.push(new Card('DECK', 0, i, numberOfCards));
            numberOfCards++;
        }
        for (i = 0; TwoDeck > i; i++) {
            stack.push(new Card('DECK', 1, i, numberOfCards));
            numberOfCards++;
        }

    }

    /**
     * the way the stack of cards is setup it requires a pointer to edit it.
     */
    function uidLookup(uid) {
        var i;
        for (i = 0; stack.length > i; i++) {
            if (stack[i].uid === uid) {
                return i;
            }
        }
    }

    /**
     * returns info on a card.
     * @param   {number} player       Player Interger
     * @param   {number} clocation    Location enumeral
     * @param   {number} index        Index
     * @param   {number} overlayindex Index of where a card is in an XYZ stack starting at 1
     * @returns {array} [[Description]]
     */
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

    function generateSinglePlayerView(player) {
        return {
            DECK: filterlocation(filterPlayer(stack, player), 'DECK'),
            HAND: filterlocation(filterPlayer(stack, player), 'HAND'),
            GRAVE: filterlocation(filterPlayer(stack, player, 'GRAVE')),
            EXTRA: filterOverlyIndex(filterlocation(filterPlayer(stack, player), 'EXTA')),
            REMOVED: filterlocation(filterPlayer(stack, player), 'REMOVED'),
            SPELLZONE: filterlocation(filterPlayer(stack, player), 'SPELLZONE'),
            MONSTERZONE: filterlocation(filterPlayer(stack, player), 'MONSTERZONE')
        };
    }

    function generateSinglePlayerSpectatorView(player) {
        return {
            DECK: filterlocation(filterPlayer(stack, player), 'DECK').length,
            HAND: filterlocation(filterPlayer(stack, player), 'HAND').length,
            GRAVE: filterlocation(filterPlayer(stack, player, 'GRAVE')),
            EXTRA: filterOverlyIndex(filterlocation(filterPlayer(stack, player), 'EXTA')).length,
            REMOVED: filterlocation(filterPlayer(stack, player), 'REMOVED'),
            SPELLZONE: filterlocation(filterPlayer(stack, player), 'SPELLZONE'),
            MONSTERZONE: filterlocation(filterPlayer(stack, player), 'MONSTERZONE')
        };
    }

    function generateSpectatorView() {
        return [generateSinglePlayerSpectatorView(0), generateSinglePlayerSpectatorView(1)];
    }

    function generatePlayer1View() {
        return [generateSinglePlayerView(0), generateSinglePlayerSpectatorView(1)];
    }

    function generatePlayer2View() {
        return [generateSinglePlayerSpectatorView(0), generateSinglePlayerView(1)];
    }

    function generateView() {
        return {
            player1: generatePlayer1View(),
            player2: generatePlayer2View(),
            spectators: generateSpectatorView()
        };
    }

    function reIndex(player, location) {
        //again YGOPro doesnt manage data properly... and doesnt send the index update for the movement command.
        //that or Im somehow missing it in moveCard().
        var zone = filterlocation(filterPlayer(stack, player), location),
            pointer;

        zone.forEach(function (card, index) {
            pointer = uidLookup(card.uid);
            stack[pointer].index = index;
        });
    }
    //finds a card, then moves it elsewhere.
    function setState(player, clocation, index, moveplayer, movelocation, moveindex, moveposition, overlayindex, isBecomingCard) {
        console.log('set:', player, clocation, index, moveplayer, movelocation, moveindex, moveposition, overlayindex, isBecomingCard);
        var target = queryCard(player, clocation, index, 0),
            pointer = uidLookup(target[0].uid),
            zone;

        stack[pointer].player = moveplayer;
        stack[pointer].location = movelocation;
        stack[pointer].index = moveindex;
        stack[pointer].position = moveposition;
        stack[pointer].overlayindex = overlayindex;
        reIndex(player, 'GRAVE');
        reIndex(player, 'HAND');
        reIndex(player, 'EXTRA');


        fs.writeFileSync('output.json', JSON.stringify(stack, null, 4));

    }

    //update state of A GROUP OF CARDS based on info from YGOPro
    function updateData(player, clocation, arrayOfCards) {
        var target,
            pointer;

        arrayOfCards.forEach(function (card, index) {
            if (card.Code !== 'nocard') {
                target = queryCard(player, enums.locations[clocation], index, 0);
                pointer = uidLookup(target[0].uid);
                stack[pointer].position = card.Position;
                stack[pointer].id = card.Code;
            }
        });

        fs.writeFileSync('output.json', JSON.stringify(stack, null, 4));
    }

    //update state of A SINGLE CARD based on info from YGOPro
    function updateCard(player, clocation, index, card) {
        var target,
            pointer;

        target = queryCard(player, enums.locations[clocation], index, 0);
        pointer = uidLookup(target[0].uid);
        stack[pointer].position = card.Position;
        stack[pointer].id = card.Code;
        fs.writeFileSync('output.json', JSON.stringify(stack, null, 4));
    }

    //Flip summon, change to attack mode, change to defense mode, and similar movements.
    function changeCardPosition(code, cc, cl, cs, cp) {
        var target = queryCard(cc, cl, cs, 0),
            pointer = uidLookup(target[0].uid);

        stack[pointer].id = code;
        setState(cc, cl, cs, cc, cl, cs, cp, 0, false);
        fs.writeFileSync('output.json', JSON.stringify(stack, null, 4));
    }

    function moveCard(code, pc, pl, ps, pp, cc, cl, cs, cp) {
        //this is ugly, needs labling.
        var target,
            pointer,
            zone,
            i;
        if (pl === 0) {
            stack.push(new Card(enums.locations[cl], cc, cs, numberOfCards));
            numberOfCards++;
            return;
        } else if (cl === 0) {
            target = queryCard(pc, enums.locations[pl], ps, 0);
            pointer = uidLookup(target[0].uid);
            delete stack[pointer];
            numberOfCards--;
            return;
        } else {
            if (!(pl & 0x80) && !(cl & 0x80)) { //duelclient line 1885
                setState(pc, enums.locations[pl], ps, cc, enums.locations[cl], cs, cp, 0, false);
            } else if (!(pl & 0x80)) {
                //targeting a card to become a xyz unit....
                setState(pc, enums.locations[pl], ps, cc, enums.locations[(cl & 0x7f)], cs, cp, 0, true);


            } else if (!(cl & 0x80)) {
                //turning an xyz unit into a normal card....
                setState(pc, enums.locations[(pl & 0x7f)], ps, cc, enums.locations[cl], cs, cp, pp);
            } else {
                //move one xyz unit to become the xyz unit of something else....');
                //                $('.overlayunit.p' + cc + '.i' + cs).each(function (i) {
                //                    $(this).attr('data-overlayunit', (i));
                //                });
                setState(pc, enums.locations[(pl & 0x7f)], ps, cc, enums.locations[(cl & 0x7f)], cs, cp, pp, true);
                zone = filterIndex(filterlocation(filterPlayer(stack, cc), enums.locations[(cl & 0x7f)]), cs);
                for (i = 1; zone.length > i; i++) {
                    pointer = uidLookup(zone[i].uid);
                    stack[pointer].overlayindex = i;
                }

            }
        }
    }

    /**
     * Draws a card, updates state.
     * @param {number} player        [[Description]]
     * @param {number} numberOfCards [[Description]]
     * @param {array} cards         [[Description]]
     */
    function drawCard(player, numberOfCards, cards) {
        var currenthand = filterlocation(filterPlayer(stack, player), 'HAND').length,
            topcard,
            target,
            i,
            pointer;

        for (i = 0; i < numberOfCards; i++) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState(player, 'DECK', topcard, player, 'HAND', currenthand + i, 'FaceUp', 0, false);
            target = queryCard(player, 'HAND', (currenthand + i), 0);
            pointer = uidLookup(target[0].uid);
            stack[pointer].id = cards[i].Code;
        }
        fs.writeFileSync('output.json', JSON.stringify(stack, null, 4));
    }

    //expose public functions.
    return {
        startDuel: startDuel,
        updateData: updateData,
        updateCard: updateCard,
        cardCollections: cardCollections,
        changeCardPosition: changeCardPosition,
        moveCard: moveCard,
        drawCard: drawCard
    };


}

module.exports = init;