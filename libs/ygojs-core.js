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
        uid: unique,
        originalcontroller: player,
        counters: 0
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
 * @param {Array} stack a stack of cards attached to a single monster as overlay units.
 * @param {Number} overlayindex
 * @returns {Array} a single card
 */
function filterOverlyIndex(stack, overlayindex) {
    return stack.filter(function (item) {
        return item.overlayindex === overlayindex;
    });
}

/**
 * Filters out cards based on if they are a specific UID
 * @param {Array} stack a stack of cards attached to a single monster as overlay units.
 * @param {Number} uid
 * @returns {boolean} if a card is that UID
 */
function filterUID(stack, uid) {
    return stack.filter(function (item) {
        return item.uid === uid;
    });
}


function byIndex(card, index) {

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
        if (output[index].position === 'FaceDown' || output[index].position === 'FaceDownDefense') {
            output[index].id = 0;
            output[index].counters = 0;
            delete output[index].originalcontroller;
        }
    });

    return output;
}

/**
 * Clean counters from the stack.
 * @param   {Array} stack a collection of cards
 * @returns {Array} a collection of cards
 */
function cleanCounters(stack) {

    stack.forEach(function (card, index) {
        if (card.position === 'FaceDown' || card.position === 'FaceDownDefense') {
            card.counters = 0;
        }
    });
    return stack;
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
        lock = [false, false],
        round = [],
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
        },
        decks = {
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
        }; // holds decks



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
    function queryCard(player, clocation, index, overlayindex, uid) {
        if (uid) {
            return filterUID(stack, uid)[0];
        }
        return filterOverlyIndex(filterIndex(filterlocation(filterPlayer(stack, player), clocation), index), overlayindex)[0];
    }

    function findUIDCollection(uid) {
        return filterUID(stack, uid);
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
            EXTRA: filterOverlyIndex(filterlocation(filterPlayer(stack, player), 'EXTRA'), 0).length,
            GRAVE: filterlocation(filterPlayer(stack, player), 'GRAVE').length,
            REMOVED: filterlocation(filterPlayer(stack, player), 'REMOVED').length,
            SPELLZONE: 8,
            MONSTERZONE: 5
        };
    }

    /**
     * Generate the view for a specific given player
     * @param   {Number} the given player
     * @returns {object} all the cards the given player can see on their side of the field.
     */
    function generateSinglePlayerView(player) {
        var playersCards = filterPlayer(stack, player),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA'), 0),
            removed = filterlocation(playersCards, 'REMOVED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE');

        return {
            DECK: hideViewOfZone(deck),
            HAND: hand,
            GRAVE: grave,
            EXTRA: hideViewOfZone(extra),
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
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA'), 0),
            removed = filterlocation(playersCards, 'REMOVED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE');

        return {
            DECK: hideViewOfZone(deck),
            HAND: hideHand(hand),
            GRAVE: grave,
            EXTRA: hideViewOfZone(extra),
            REMOVED: hideViewOfZone(removed),
            SPELLZONE: hideViewOfZone(spellzone),
            MONSTERZONE: hideViewOfZone(monsterzone)
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

        if (location === 'EXTRA') {
            zone.sort(function (primary, secondary) {
                if (primary.position === secondary.position) {
                    return 0;
                }
                if (primary.position === 'FaceUp' && secondary.position !== 'FaceUp') {
                    return 1;
                }
                if (secondary.position === 'FaceUp' && primary.position !== 'FaceUp') {
                    return -1;
                }
            });
        }

        zone.forEach(function (card, index) {
            pointer = uidLookup(card.uid);
            stack[pointer].index = index;
        });


        stack.sort(function (primary, b) {
            return primary.index - b.index;
        });



    }
    //finds a card, then moves it elsewhere.
    function setState(player, clocation, index, moveplayer, movelocation, moveindex, moveposition, overlayindex, uid) {
        console.log('set:', player, clocation, index, moveplayer, movelocation, moveindex, moveposition, overlayindex, uid);
        var target = queryCard(player, clocation, index, 0, uid),
            pointer = uidLookup(target.uid),
            zone;

        if (movelocation === 'GRAVE' || movelocation === 'REMOVED') {
            moveplayer = stack[pointer].originalcontroller;
        }

        stack[pointer].player = moveplayer;
        stack[pointer].location = movelocation;
        stack[pointer].index = moveindex;
        stack[pointer].position = moveposition;
        stack[pointer].overlayindex = overlayindex;
        reIndex(player, 'GRAVE');
        reIndex(player, 'HAND');
        reIndex(player, 'EXTRA');
        cleanCounters(stack);
        callback(generateView(), stack);

    }



    /**
     * Creates a new card outside of initial start
     * @param {String} currentLocation   
     * @param {Number} currentController 
     * @param {Number} currentSequence   
     * @param {Number} position          
     * @param {NUmber code              
     */
    function makeNewCard(currentLocation, currentController, currentSequence, position, code) {
        stack.push(makeCard(currentLocation, currentController, currentSequence, stack.length, code));
        stack[stack.length - 1].position = position;
        state.added = stack[stack.length - 1];
        callback(generateView('newCard'), stack);
    }


    /**
     * Deletes a specific card from the stack.
     * @param {Number} uid The unique identifier of the card, to quickly find it.
     */
    function removeCard(uid) {
        var target = queryCard(undefined, undefined, undefined, 0, uid),
            pointer = uidLookup(target.uid);

        delete stack[pointer];
        state.removed = uid;
        callback(generateView('removeCard'), stack);
    }

    /**
     * Finds a specific card and puts a counter on it.
     * @param {Number} uid The unique identifier of the card, to quickly find it.
     */
    function addCounter(uid) {
        var target = queryCard(undefined, undefined, undefined, 0, uid),
            pointer = uidLookup(target.uid);

        stack[pointer].counters++;
        callback(generateView(), stack);
    }

    /**
     * Finds a specific card and remove a counter from it.
     * @param {Number} uid The unique identifier of the card, to quickly find it.
     */
    function removeCounter(uid) {
        var target = queryCard(undefined, undefined, undefined, 0, uid),
            pointer = uidLookup(target.uid);

        stack[pointer].counters--;
        callback(generateView(), stack);
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
        var currentbanished = filterlocation(filterPlayer(stack, player), 'REMOVED').length,
            topcard,
            target,
            i,
            pointer;

        for (i = 0; i < numberOfCards; i++) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState(player, 'DECK', topcard, player, 'REMOVED', currentbanished, 'FaceUp', 0, false);
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
     * Triggers a callback that reveals the given array of cards to end users.
     * @param {Array} reveal array of cards
     */
    function revealCallback(reveal, player, call) {
        reveal.forEach(function (card) {
            card.position = 'FaceUp';
        });
        callback({
            0: {
                action: 'reveal',
                info: state,
                reveal: reveal,
                call: call,
                player: player
            },
            1: {
                action: 'reveal',
                info: state,
                reveal: reveal,
                call: call,
                player: player
            },
            sepectators: {
                action: 'reveal',
                info: state,
                reveal: reveal,
                call: call,
                player: player
            }
        }, stack);
    }



    /**
     * Reveal the top card of the players deck.
     * @param {number} player 
     */
    function revealTop(player) {
        var deck = filterlocation(filterPlayer(stack, player), 'DECK'),
            reveal = deck[deck.length - 1];

        revealCallback([reveal], player, 'top');

    }

    /**
     * Reveal the bottom card of the players deck.
     * @param {number} player 
     */
    function revealBottom(player) {
        var deck = filterlocation(filterPlayer(stack, player), 'DECK'),
            reveal = deck[0];

        revealCallback([reveal], player, 'bottom');
    }

    /**
     * Reveal the players deck.
     * @param {number} player 
     */
    function revealDeck(player) {
        revealCallback(filterlocation(filterPlayer(stack, player), 'DECK').reverse(), player, 'deck');
    }

    /**
     * Reveal the players extra deck.
     * @param {number} player 
     */
    function revealExtra(player) {
        revealCallback(filterlocation(filterPlayer(stack, player), 'EXTRA'), player, 'extra');
    }

    /**
     * Reveal the players hand.
     * @param {number} player 
     */
    function revealHand(player) {
        revealCallback(filterlocation(filterPlayer(stack, player), 'HAND'), player, 'hand');
    }

    /**
     * Reveal the players graveyard.
     * @param {number} player 
     */
    function viewGrave(player, username, requester) {
        if (player === requester) {
            state.duelistChat.push('<pre>' + username + ' is viewing their gaveyard.</pre>');
        } else {
            state.duelistChat.push('<pre>' + username + ' is viewing your gaveyard.</pre>');
        }
        var deck = filterlocation(filterPlayer(stack, player), 'GRAVE'),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };
        state.duelistChat.push('<pre>' + username + ' is viewing their deck.</pre>');
        result[requester] = {
            action: 'reveal',
            info: state,
            reveal: deck,
            call: 'view',
            player: player
        };

        callback(result, stack);
    }

    /**
     * Reveal the players removed zone.
     * @param {number} player 
     */
    function viewBanished(player, username, requester) {
        if (player === requester) {
            state.duelistChat.push('<pre>' + username + ' is viewing their banished pile.</pre>');
        } else {
            state.duelistChat.push('<pre>' + username + ' is viewing your banished pile.</pre>');
        }
        var deck = filterlocation(filterPlayer(stack, player), 'REMOVED'),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };

        result[requester] = {
            action: 'reveal',
            info: state,
            reveal: deck,
            call: 'view',
            player: player
        };

        callback(result, stack);
    }


    function viewDeck(player, username) {
        var deck = filterlocation(filterPlayer(stack, player), 'DECK').reverse(),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };
        state.duelistChat.push('<pre>' + username + ' is viewing their deck.</pre>');
        result[player] = {
            action: 'reveal',
            info: state,
            reveal: deck,
            call: 'view',
            player: player
        };

        callback(result, stack);

    }

    function viewExtra(player, username) {
        var deck = filterlocation(filterPlayer(stack, player), 'EXTRA'),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };
        state.duelistChat.push('<pre>' + username + ' is viewing their extra deck..</pre>');

        result[player] = {
            action: 'reveal',
            info: state,
            reveal: deck,
            call: 'view',
            player: player
        };

        callback(result, stack);

    }



    /**
     * Show player their own deck, allow interaction with it.
     * @param {Number} slot   
     * @param {Number} index  
     * @param {Number} player
     */
    function viewXYZ(slot, index, player) {
        var pile = filterIndex(filterlocation(filterPlayer(stack, player), 'MONSTERZONE'), index),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };


        result[slot] = {
            action: 'reveal',
            info: state,
            reveal: pile,
            call: 'view',
            player: slot
        };

        callback(result, stack);

    }

    /**
     * Show player their own deck, allow interaction with it.
     * @param {Number} slot   
     * @param {Number} index  
     * @param {Number} player
     */
    function viewExcavated(player) {
        var pile = filterlocation(filterPlayer(stack, player), 'EXCAVATED'),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };


        result[player] = {
            action: 'reveal',
            info: state,
            reveal: pile,
            call: 'view',
            player: player
        };

        callback(result, stack);

    }

    /**
     * Start side decking.
     */
    function startSide() {
        stack = [];
        decks = {
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
        };
    }

    /**
     * Validate that an incoming deck matches the existing deck based on the rules of siding.
     * @param   {number} player
     * @param   {object}   deck
     * @returns {boolean}  if the deck is valid.
     */
    function validateDeckAgainstPrevious(player, deck) {
        var previous = [],
            current = [];


        // If there is no deck, then this deck is ok to use, because we will need it.
        if (decks[player].main.length === 0) {
            return true;
        }

        previous.concat(round[0][player].main, round[0][player].extra, round[0][player].side);
        current.concat(deck.main, deck.extra, deck.side);

        previous.sort();
        current.sort();

        return (JSON.stringify(current) === JSON.stringify(previous));
    }


    /**
     * Take a given deck, if it can, lock it in, return if it locked in.
     * @param   {number} player 
     * @param   {object} deck  
     * @returns {boolean}  if it managed to lock in the deck.
     */
    function lockInDeck(player, deck) {
        if (validateDeckAgainstPrevious(player, deck)) {
            decks[player] = deck;
            lock[player] = true;
            return true;
        } else {
            return false;
        }
    }


    /**
     * Exposed method to initialize the field; You only run this once.
     */
    function startDuel(player1, player2, manual) {
        stack = [];
        if (!lock[0] && !lock[1]) {
            return;
        }

        round.push(player1, player2);
        lock[0] = false;
        lock[1] = false;
        shuffle(player1.main);
        shuffle(player2.main);

        player1.main.forEach(function (card, index) {
            stack.push(makeCard('DECK', 0, index, stack.length, card));
        });
        player2.main.forEach(function (card, index) {
            stack.push(makeCard('DECK', 1, index, stack.length, card));
        });

        player1.extra.forEach(function (card, index) {
            stack.push(makeCard('EXTRA', 0, index, stack.length, card));
        });
        player2.extra.forEach(function (card, index) {
            stack.push(makeCard('EXTRA', 1, index, stack.length, card));
        });
        if (manual) {
            state.duelistChat.push('<pre>Commands:</pre>');
            state.duelistChat.push('<pre>Draw Cards:  /draw [amount]</pre>');
            state.duelistChat.push('<pre>Mill Cards:  /mill [amount]</pre>');
            state.duelistChat.push('<pre>Reduce LP:   /sub [amount]</pre>');
            state.duelistChat.push('<pre>Increase LP: /add [amount]</pre>');
            state.duelistChat.push('<pre>Flip Coin:   /flip</pre>');
            state.duelistChat.push('<pre>Roll Dice:   /roll</pre>');
            state.duelistChat.push('<pre>Make Token:  /token</pre>');
            state.duelistChat.push('<pre>Surrender:   /surrender</pre>');
        }
        callback(generateView('start'), stack);
    }

    /**
     * Restarts the game for a rematch.
     */
    function rematch() {
        stack = [];
        state.duelistChat.push('<pre>Server: Rematch started</pre>');
        startDuel(round[0][0], round[0][1], true);
    }

    /**
     * moves game to next phase.
     * @param {number} phase enumeral
     */
    function nextPhase(phase) {
        state.phase = phase;
        callback(generateView(), stack);
    }

    /**
     * Shifts the game to the start of the next turn and shifts the active player.
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
     * Record what a duelist said to another duelist.
     * @param {Number} player  player saying the message.
     * @param {String} message message to other spectators
     */
    function duelistChat(username, message) {
        state.duelistChat.push(username + ': ' + message);
        callback(generateView('chat'), stack);
    }

    /**
     * Record what a spectator said to another spectator.
     * @param {Number} player  player saying the message.
     * @param {String} message message to other spectators
     */
    function spectatorChat(username, message) {
        state.spectatorChat.push(username + ': ' + message);
        callback(generateView('chat'), stack);
    }

    /**
     * After game start, shuffle a players deck.
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
        callback(generateView('shuffleDeck' + player), stack); // alert UI of the shuffle.
    }
    /**
     *   shuffle a players hand.
     * @param {number} player 
     */
    function shuffleHand(player) {
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
        callback(generateView('shuffleHand' + player), stack); // alert UI of the shuffle.
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


    function offsetZone(player, zone) {
        stack.forEach(function (card, index) {
            if (card.player === player && card.location === zone) {
                card.index++;
            }
        });
    }

    function rollDie(username) {
        var result = Math.floor(Math.random() * ((6 - 1) + 1) + 1);
        duelistChat('Server', username + ' rolled a ' + result);
        return result;

    }

    function flipCoin(username) {

        var result = (Math.random() < 0.5) ? 'Heads' : 'Tails';
        duelistChat('Server', username + ' flipped ' + result);
        return result;
    }

    function surrender(username) {
        duelistChat('Server', username + ' surrendered.');
    }

    //expose public functions.
    return {
        startSide: startSide,
        startDuel: startDuel,
        setState: setState,
        cardCollections: cardCollections,
        drawCard: drawCard,
        flipDeck: flipDeck,
        millCard: millCard,
        millRemovedCard: millRemovedCard,
        millRemovedCardFaceDown: millRemovedCardFaceDown,
        revealTop: revealTop,
        revealBottom: revealBottom,
        revealDeck: revealDeck,
        revealExtra: revealExtra,
        viewGrave: viewGrave,
        viewDeck: viewDeck,
        viewExtra: viewExtra,
        viewBanished: viewBanished,
        viewXYZ: viewXYZ,
        nextPhase: nextPhase,
        nextTurn: nextTurn,
        changeLifepoints: changeLifepoints,
        findUIDCollection: findUIDCollection,
        callback: callback,
        shuffleDeck: shuffleDeck,
        shuffleHand: shuffleHand,
        revealCallback: revealCallback,
        addCounter: addCounter,
        removeCounter: removeCounter,
        duelistChat: duelistChat,
        spectatorChat: spectatorChat,
        makeNewCard: makeNewCard,
        removeCard: removeCard,
        rollDie: rollDie,
        flipCoin: flipCoin,
        offsetZone: offsetZone,
        surrender: surrender,
        generateView: generateView,
        players: {}, // holds socket references
        spectators: {}, // holds socket references
        decks: decks,
        lock: lock,
        lockInDeck: lockInDeck,
        rematch: rematch,
        rematchAccept: 0,
        sideAccept: 0
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