/*jslint node:true, plusplus:true, bitwise : true*/
'use strict';



/* This is the state engine for SnarkyChild, it keeps track of the update information from YGOPro
 * and maintains a repressentation of the game state, I know this looks kinda odd but the code is
 * based off of HTML/DOM manipulations  that allow for animations.I wanted to make the logic easy
 * to write by just copying and refactoring.Need to refactor this out. In the mean time need to
 * know what some numbers mean in YGOPro land.
 */
var enums = require('./enums.js');



/**
 * Constructor for card objects.
 * @param    movelocation 'DECK'/'EXTRA' etc, in caps. 
 * @param   {Number} player       [[Description]]
 * @param   {Number} index        [[Description]]
 * @param   {Number} unique       [[Description]]
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
 * Filters non cards from a collection of possible cards.
 * @param   {Array} a stack of cards which may have overlay units attached to them.
 * @returns {Array} a stack of cards, devoid of overlay units.
 */
function filterIsCard(Array) {
    return Array.filter(function (item) {
        return item.type === 'card';
    });
}

/**
 * Filters out cards based on player.
 * @param   {Array} Array a stack of cards.
 * @param {Number} player 0 or 1
 * @returns {Array} a stack of cards that belong to only one specified player. 
 */
function filterPlayer(Array, player) {
    return Array.filter(function (item) {
        return item.player === player;
    });
}

/**
 * Filters out cards based on zone.
 * @param   {Array} Array a stack of cards.
 * @param {String} location
 * @returns {Array} a stack of cards that are in only one location/zone.
 */
function filterlocation(Array, location) {
    return Array.filter(function (item) {
        return item.location === location;
    });
}

/**
 * Filters out cards based on index.
 * @param   {Array}  a stack of cards.
 * @param {Number} index
 * @returns {Array} a stack of cards that are in only one index
 */
function filterIndex(Array, index) {
    return Array.filter(function (item) {
        return item.index === index;
    });
}
/**
 * Filters out cards based on if they are overlay units or not.
 * @param {Array} Array a stack of cards attached to a single monster as overlay units.
 * @param {Number} overlayindex
 * @returns {Array} a single card
 */
function filterOverlyIndex(Array, overlayindex) {
    return Array.filter(function (item) {
        return item.overlayindex === overlayindex;
    });
}

/**
 * initiation of a single independent state intance... I guess this is a class of sorts.
 * @returns {object} State instance
 */
function init(callback) {
    //the field is represented as a bunch of cards with metadata in an Array, <div>card/card/card/card</div>
    //numberOfCards is used like a memory address. It must be increased by 1 when creating a new card.
    var stack = [],
        numberOfCards = 0;

    if (typeof callback !== 'function') {
        callback = function (view, internalState) {};
    }

    /**
     * Exposed method to initialize the field; You only run this once.
     * @param {Number} player1StartLP Player 1 starting Lifepoint count
     * @param {Number} player2StartLP Player 2 starting Lifepoint count
     * @param {Number} OneDeck        Number of cards in Player 1s main deck
     * @param {Number} TwoDeck        Number of cards in Player 2s main deck
     * @param {Number} OneExtra       Number of cards in Player 1s extra deck
     * @param {Number} TwoExtra       Number of cards in Player 2s extra deck
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
     * The way the stack of cards is setup it requires a pointer to edit it.
     * @param {Number} provide a unique idenifier
     * @returns {Number} index of that unique identifier in the stack.
     */
    function uidLookup(uid) {
        var result;
        stack.some(function (card, index) {
            if (card.uid === uid) {
                result = index;
                return true;
            }
        });
        return result;
    }

    /**
     * Returns info on a card.
     * @param   {Number} player       Player Interger
     * @param   {Number} clocation    Location enumeral
     * @param   {Number} index        Index
     * @param   {Number} overlayindex Index of where a card is in an XYZ stack starting at 1
     * @returns {Array} [[Description]]
     */
    function queryCard(player, clocation, index, overlayindex) {
        return filterOverlyIndex(filterIndex(filterlocation(filterPlayer(stack, player), clocation), index), overlayindex);
    }

    /*The YGOPro messages have a design flaw in them where they dont tell the number of cards
    that you have to itterate over in order to get a proper message, this function resolves that problem,
    this flaw has caused me all types of grief.*/

    /**
     * Returns the number of cards in each zone.
     * @param   {Number} player index
     * @returns {object}   information on number of slots on each zone.
     */
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

    /**
     * Generate the view for a specific given player
     * @param   {Number} the given player
     * @returns {object} all the cards the given player can see on thier side of the field.
     */
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

    /**
     * Generate the view for a spectator or opponent
     * @param   {Number} the given player
     * @returns {object} all the cards the given spectator/opponent can see on that side of the field.
     */
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

    /**
     * Generate a full view of the field for a spectator.
     * @returns {Array} complete view of the current field based on the stack.
     */
    function generateSpectatorView() {
        return [generateSinglePlayerSpectatorView(0), generateSinglePlayerSpectatorView(1)];
    }

    /**
     * Generate a full view of the field for a Player 1.
     * @returns {Array} complete view of the current field based on the stack.
     */
    function generatePlayer1View() {
        return [generateSinglePlayerView(0), generateSinglePlayerSpectatorView(1)];
    }

    /**
     * Generate a full view of the field for a Player 2.
     * @returns {Array} complete view of the current field based on the stack.
     */
    function generatePlayer2View() {
        return [generateSinglePlayerSpectatorView(0), generateSinglePlayerView(1)];
    }

    /**
     * Generate a full view of the field for all view types.
     * @returns {Array} complete view of the current field based on the stack for every view type.
     */
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
        callback(generateView(), stack);

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

        callback(generateView(), stack);
    }

    //update state of A SINGLE CARD based on info from YGOPro
    function updateCard(player, clocation, index, card) {
        var target,
            pointer;

        target = queryCard(player, enums.locations[clocation], index, 0);
        pointer = uidLookup(target[0].uid);
        stack[pointer].position = card.Position;
        stack[pointer].id = card.Code;
        callback(generateView(), stack);
    }

    //Flip summon, change to attack mode, change to defense mode, and similar movements.
    function changeCardPosition(code, cc, cl, cs, cp) {
        var target = queryCard(cc, cl, cs, 0),
            pointer = uidLookup(target[0].uid);

        stack[pointer].id = code;
        setState(cc, cl, cs, cc, cl, cs, cp, 0, false);
        callback(generateView(), stack);
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
     * @param {Number} player        [[Description]]
     * @param {Number} numberOfCards [[Description]]
     * @param {Array} cards         [[Description]]
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
        callback(generateView(), stack);
    }

    //expose public functions.
    return {
        startDuel: startDuel,
        updateData: updateData,
        updateCard: updateCard,
        cardCollections: cardCollections,
        changeCardPosition: changeCardPosition,
        moveCard: moveCard,
        drawCard: drawCard,
        callback: callback
    };


}

module.exports = init;