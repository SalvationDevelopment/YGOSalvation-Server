/*jslint node:true, plusplus:true, bitwise : true, nomen:true*/
'use strict';



/* This is the state engine for a Yu-Gi-Oh game, it keeps track of the update information from YGOPro
 * or manual mode and maintains a repressentation of the game state, I know this looks kinda odd but the code is
 * based off of HTML/DOM manipulations  that allow for animations.I wanted to make the logic easy
 * to write by just copying and refactoring. In the mean time need to
 * know what some numbers mean in YGOPro land.
 */
var enums = require('./enums.js'),
    fs = require('fs');



/**
 * Constructor for card objects.
 * @param    movelocation 'DECK'/'EXTRA' etc, in caps. 
 * @param   {Number} player       [[Description]]
 * @param   {Number} index        [[Description]]
 * @param   {Number} unique       [[Description]]
 * @returns {object}   a card
 */
function makeCard(movelocation, player, index, unique, code) {
    return {
        type: 'card',
        player: player,
        location: movelocation,
        id: code,
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
function filterIsCard(stack) {
    return stack.filter(function (item) {
        return item.type === 'card';
    });
}

/**
 * Filters out cards based on player.
 * @param   {Array} Array a stack of cards.
 * @param {Number} player 0 or 1
 * @returns {Array} a stack of cards that belong to only one specified player. 
 */
function filterPlayer(stack, player) {
    return stack.filter(function (item) {
        return item.player === player;
    });
}

/**
 * Filters out cards based on zone.
 * @param   {Array} stack a stack of cards.
 * @param {String} location
 * @returns {Array} a stack of cards that are in only one location/zone.
 */
function filterlocation(stack, location) {
    return stack.filter(function (item) {
        return item.location === location;
    });
}

/**
 * Filters out cards based on index.
 * @param   {Array}  a stack of cards.
 * @param {Number} index
 * @returns {Array} a stack of cards that are in only one index
 */
function filterIndex(stack, index) {
    return stack.filter(function (item) {
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
 * Shuffles array in place.
 * @param {Array} a items The array containing the items This function is in no way optimized.
 */
function shuffle(deck) {
    var j, x, index;
    for (index = deck.length; index; index--) {
        j = Math.floor(Math.random() * index);
        x = deck[index - 1];
        deck[index - 1] = deck[j];
        deck[j] = x;
    }
}

/**
 * Changes a view of cards so the opponent can not see what they are.
 * @param   {Array} view a collection of cards
 * @returns {Array} a collection of cards
 */
function hideViewOfZone(view) {
    var output = [];
    view.forEach(function (card, index) {
        output[index] = {};
        Object.assign(output[index], card);
        if (output[index].position !== 'FaceUp' || output[index].position !== 'FaceUpDefense') {
            output[index].id = 0;
        }

    });

    return output;
}

/**
 * Changes a view of cards in the hand so the opponent can not see what they are.
 * @param   {Array} view a collection of cards
 * @returns {Array} a collection of cards
 */
function hideHand(view) {
    var output = [];
    view.forEach(function (card, index) {
        output[index] = {};
        Object.assign(output[index], card);
        output[index].id = 0;
        output[index].position = 'FaceDown';
    });

    return output;
}

/**
 * Initiation of a single independent state intance... I guess this is a class of sorts.
 * @param {function} callback function(view, internalState){}; called each time the stack is updated. 
 * @returns {object} State instance
 */
function init(callback) {
    //the field is represented as a bunch of cards with metadata in an Array, <div>card/card/card/card</div>
    //numberOfCards is used like a memory address. It must be increased by 1 when creating a makeCard.

    if (typeof callback !== 'function') {
        callback = function (view, internalState) {};
    }

    var stack = [],
        numberOfCards = 0,
        state = {
            turn: 0,
            turnOfPlayer: 0,
            phase: 0,
            lifepoints: {
                0: 8000,
                1: 8000
            },
            duelistChat: [],
            spectatorChat: []
        };



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
     * Returns info on a card, or rather a single card.
     * @param   {Number} player       Player Interger
     * @param   {Number} clocation    Location enumeral
     * @param   {Number} index        Index
     * @param   {Number} overlayindex Index of where a card is in an XYZ stack starting at 1
     * @returns {object} The card you where looking for.
     */
    function queryCard(player, clocation, index, overlayindex) {
        return filterOverlyIndex(filterIndex(filterlocation(filterPlayer(stack, player), clocation), index), overlayindex)[0];
    }

    /**
     * Returns the number of cards in each zone.
     * @param   {Number} player index
     * @returns {object}   information on number of slots on each zone.
     */
    function cardCollections(player) {
        /*The YGOPro messages have a design flaw in them where they dont tell the number of cards
          that you have to itterate over in order to get a proper message, this function resolves that problem,
          this flaw has caused me all types of grief.
        */

        return {
            DECK: filterlocation(filterPlayer(stack, player), 'DECK').length,
            HAND: filterlocation(filterPlayer(stack, player), 'HAND').length,
            EXTRA: filterOverlyIndex(filterlocation(filterPlayer(stack, player), 'EXTRA')).length,
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
        var playersCards = filterPlayer(stack, player),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA')),
            removed = filterlocation(playersCards, 'REMOVED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE');

        return {
            DECK: deck,
            HAND: hand,
            GRAVE: grave,
            EXTRA: extra,
            REMOVED: removed,
            SPELLZONE: spellzone,
            MONSTERZONE: monsterzone
        };
    }

    /**
     * Generate the view for a spectator or opponent
     * @param   {Number} the given player
     * @returns {object} all the cards the given spectator/opponent can see on that side of the field.
     */
    function generateSinglePlayerSpectatorView(player) {
        var playersCards = filterPlayer(stack, player),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA')),
            removed = filterlocation(playersCards, 'REMOVED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE');

        return {
            DECK: deck,
            HAND: hand,
            GRAVE: grave,
            EXTRA: extra,
            REMOVED: removed,
            SPELLZONE: spellzone,
            MONSTERZONE: monsterzone
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
     * @param {string} action callback case statement this should trigger, defaults to 'duel'.
     * @returns {Array} complete view of the current field based on the stack for every view type.
     */
    function generateView(action) {
        return {
            0: {
                action: action || 'duel',
                info: state,
                field: generatePlayer1View()
            },
            1: {
                action: action || 'duel',
                info: state,
                field: generatePlayer2View()
            },
            spectators: {
                action: action || 'duel',
                info: state,
                field: generateSpectatorView()
            }
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
            pointer = uidLookup(target.uid),
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

    //update state of A SINGLE CARD based on info from YGOPro
    function updateCard(player, clocation, index, card) {
        var target,
            pointer;

        target = queryCard(player, enums.locations[clocation], index, 0);
        pointer = uidLookup(target.uid);
        Object.assign(stack[pointer], card);
        callback(generateView(), stack);
    }

    //update state of A GROUP OF CARDS based on info from YGOPro
    function updateData(player, clocation, arrayOfCards) {
        var target,
            pointer;

        arrayOfCards.forEach(function (card, index) {
            updateCard(player, clocation, index, card);
        });

        callback(generateView(), stack);
    }

    //Flip summon, change to attack mode, change to defense mode, and similar movements.
    function changeCardPosition(code, currentController, cl, currentSequence, currentPosition) {
        var target = queryCard(currentController, cl, currentSequence, 0),
            pointer = uidLookup(target.uid);

        stack[pointer].id = code;
        setState(currentController, cl, currentSequence, currentController, cl, currentSequence, currentPosition, 0, false);
        callback(generateView(), stack);
    }

    function moveCard(code, previousController, previousLocation, previousSequence, previousPosition, currentController, currentLocation, currentSequence, currentPosition) {

        var target,
            pointer,
            zone;

        if (previousLocation === 0) {
            stack.push(makeCard(enums.locations[currentLocation], currentController, currentSequence, numberOfCards, code));
            numberOfCards++;
            return;
        } else if (currentLocation === 0) {
            target = queryCard(previousController, enums.locations[previousLocation], previousSequence, 0);
            pointer = uidLookup(target.uid);
            delete stack[pointer];
            numberOfCards--;
            return;
        } else {
            if (!(previousLocation & 0x80) && !(currentLocation & 0x80)) { // see ygopro/gframe/duelclient.cpp line 1885
                setState(previousController, enums.locations[previousLocation], previousSequence, currentController, enums.locations[currentLocation], currentSequence, currentPosition, 0, false);
            } else if (!(previousLocation & 0x80)) {
                //targeting a card to become a xyz unit....
                setState(previousController, enums.locations[previousLocation], previousSequence, currentController, enums.locations[(currentLocation & 0x7f)], currentSequence, currentPosition, 0, true);


            } else if (!(currentLocation & 0x80)) {
                //turning an xyz unit into a normal card....
                setState(previousController, enums.locations[(previousLocation & 0x7f)], previousSequence, currentController, enums.locations[currentLocation], currentSequence, currentPosition, previousPosition);
            } else {
                setState(previousController, enums.locations[(previousLocation & 0x7f)], previousSequence, currentController, enums.locations[(currentLocation & 0x7f)], currentSequence, currentPosition, previousPosition, true);
                zone = filterIndex(filterlocation(filterPlayer(stack, currentController), enums.locations[(currentLocation & 0x7f)]), currentSequence);
                zone.forEach(function (card, index) {
                    pointer = uidLookup(card.uid);
                    stack[pointer].overlayindex = index;
                });

            }
        }
    }

    /**
     * Draws a card, updates state.
     * @param {Number} player        Player drawing the cards
     * @param {Number} numberOfCards number of cards drawn
     * @param {Array} cards         array of objects representing each of those drawn cards.
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
            pointer = uidLookup(target.uid);
            //stack[pointer].id = cards[i].Code;
        }
        callback(generateView(), stack);
    }

    /**
     * Mills a card, updates state.
     * @param {Number} player        Player milling the cards
     * @param {Number} numberOfCards number of cards milled
     */
    function millCard(player, numberOfCards) {
        var currentgrave = filterlocation(filterPlayer(stack, player), 'GRAVE').length,
            topcard,
            target,
            i,
            pointer;

        for (i = 0; i < numberOfCards; i++) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState(player, 'DECK', topcard, player, 'GRAVE', currentgrave, 'FaceUp', 0, false);
        }
        callback(generateView(), stack);
    }

    /**
     * Mills a card to banished zone, updates state.
     * @param {Number} player        Player milling the cards
     * @param {Number} numberOfCards number of cards milled
     */
    function millRemovedCard(player, numberOfCards) {
        var currentgrave = filterlocation(filterPlayer(stack, player), 'REMOVED').length,
            topcard,
            target,
            i,
            pointer;

        for (i = 0; i < numberOfCards; i++) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState(player, 'DECK', topcard, player, 'REMOVED', currentgrave, 'FaceUp', 0, false);
        }
        callback(generateView(), stack);
    }

    /**
     * Mills a card to banished zone face down, updates state.
     * @param {Number} player        Player milling the cards
     * @param {Number} numberOfCards number of cards milled
     */
    function millRemovedCardFaceDown(player, numberOfCards) {
        var currentgrave = filterlocation(filterPlayer(stack, player), 'REMOVED').length,
            topcard,
            target,
            i,
            pointer;

        for (i = 0; i < numberOfCards; i++) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState(player, 'DECK', topcard, player, 'REMOVED', currentgrave, 'FaceDown', 0, false);
        }
        callback(generateView(), stack);
    }

    /**
     * Exposed method to initialize the field; You only run this once.
     */
    function startDuel(player1, player2) {


        shuffle(player1.main);
        shuffle(player2.main);

        player1.main.forEach(function (card, index) {
            stack.push(makeCard('DECK', 0, index, numberOfCards, card));
            numberOfCards++;
        });
        player2.main.forEach(function (card, index) {
            stack.push(makeCard('DECK', 1, index, numberOfCards, card));
            numberOfCards++;
        });

        player1.extra.forEach(function (card, index) {
            stack.push(makeCard('EXTRA', 0, index, numberOfCards, card));
            numberOfCards++;
        });
        player2.extra.forEach(function (card, index) {
            stack.push(makeCard('EXTRA', 1, index, numberOfCards, card));
            numberOfCards++;
        });
        callback(generateView('start'), stack);
    }


    /**
     * Mutation Fuction, moves game to next phase.
     */
    function nextPhase() {
        state.phase++;
        callback(generateView(), stack);
    }

    /**
     * Mutation Function, shifts the game to the start of the next turn and shifts the active player.
     */
    function nextTurn() {
        state.turn++;
        state.phase = 0;
        state.turnOfPlayer = (state.turnOfPlayer === 0) ? 1 : 0;
        callback(generateView(), stack);
    }

    /**
     * Change lifepoints of a player
     * @param {Number} player player to edit
     * @param {Number} amount amount of lifepoints to take or remove.
     */
    function changeLifepoints(player, amount) {
        state.lifepoints[player] = state.lifepoints[player] + amount;
        callback(generateView(), stack);
    }

    /**
     * Mutation Function, record what a duelist said to another duelist.
     * @param {Number} player  player saying the message.
     * @param {String} message message to other spectators
     */
    function duelistChat(username, message) {
        state.duelistChat.push(username + ': ' + message);
        callback(generateView(), stack);
    }

    /**
     * Mutation Function, record what a spectator said to another spectator.
     * @param {Number} player  player saying the message.
     * @param {String} message message to other spectators
     */
    function spectatorChat(username, message) {
        state.spectatorChat.push(username + ': ' + message);
        callback(generateView(), stack);
    }

    /**
     * Mutation Function, after game start, shuffle a players deck.
     * @param {number} player 
     */
    function shuffleDeck(player) {
        // Ids are reassigned to new GUIs 

        var playersCards = filterPlayer(stack, player),
            deck = filterlocation(playersCards, 'DECK'),
            idCollection = [];

        deck.forEach(function (card) {
            idCollection.push(card.id);
        });

        shuffle(idCollection); // shuffle the "deck".
        deck.forEach(function (card, index) {
            card.id = idCollection[index]; // finalize the shuffle
        });
        callback(generateView('shuffleDeck'), stack); // alert UI of the shuffle.
    }

    /**
     * Mutation Function, after game start, shuffle a players deck.
     * @param {number} player 
     */
    function shuffleHand(player) {
        // Ids are reassigned to new GUIs 

        var playersCards = filterPlayer(stack, player),
            hand = filterlocation(playersCards, 'HAND'),
            idCollection = [];

        hand.forEach(function (card) {
            idCollection.push(card.id);
        });

        shuffle(idCollection); // shuffle the "deck".
        hand.forEach(function (card, index) {
            card.id = idCollection[index]; // finalize the shuffle
        });
        callback(generateView('shuffleHand'), stack); // alert UI of the shuffle.
    }

    /**
     * Convulstion of Nature
     * @param {number} player
     */
    function flipDeck(player) {
        var playersCards = filterPlayer(stack, player),
            deck = filterlocation(playersCards, 'DECK'),
            idCollection = [];

        // copy the ids to a sperate place
        deck.forEach(function (card) {
            idCollection.push(card.id);
        });

        // reverse the ids.
        idCollection.reverse();

        // reassign them.
        deck.forEach(function (card, index) {
            card.id = idCollection[index];

            // flip the card over.
            card.position = (card.position === 'FaceDown') ? 'FaceUp' : 'FaceDown';
        });
        callback(generateView('flipDeckOver'), stack); // alert UI of the shuffle.
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
        flipDeck: flipDeck,
        millCard: millCard,
        millRemovedCard: millRemovedCard,
        millRemovedCardFaceDown: millRemovedCardFaceDown,
        nextPhase: nextPhase,
        nextTurn: nextTurn,
        changeLifepoints: changeLifepoints,
        callback: callback,
        shuffleDeck: shuffleDeck,
        players: {}, // holds socket references
        spectators: {}, // holds socket references
        decks: {
            0: {
                main: [],
                extra: [],
                side: []
            },
            1: {
                main: [],
                extra: [],
                side: []
            }
        } // holds decks
    };


}

fs.watch(__filename, process.exit);
module.exports = init;


/** Usage

makegameState = require('./state.js');

state = makegameState(function(view, stack){
    updateplayer1(view.player1);
    updateplayer2(view.player1);
    updatespectators(view.specators);
    savegameforlater(stack;)
});


state.startDuel(player1, player2, );

**/