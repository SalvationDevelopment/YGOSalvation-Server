'use strict';

// You should be drinking scotch and listening to german electronica while reading this.

/**
 * @file Creates instances of game state, and methods of manipulating them.
 */



/**
 * @typedef Card
 * @type {Object}
 * @property {String} type Card/Token/Etc
 * @property {String} movelocation 'DECK'/'EXTRA' etc, in caps. 
 * @property {Number} player player int 0,1, etc of controlling player
 * @property {Number} originalController  player int 0,1, etc of owner
 * @property {Number} index  sequence of the card in the stack group. Example, nth card of DECK.
 * @property {Number} unique unique ID of the card
 * @property {Number} id   passcode of the card
 * @property {Number} counters  counters on the card
 * @property {Number} overlayIndex  counters on the card
 * @property {String} position Faceup, Facedown, etc
 */

/**
 * @typedef FieldView
 * @type {Object}
 * @property {Card[]} DECK Cards in the deck of one player.
 * @property {Card[]} HAND Cards in the hand of one player.
 * @property {Card[]} GRAVE Cards in the graveyard "GY" of one player.
 * @property {Card[]} EXTRA Cards in the extra deck of one player.
 * @property {Card[]} REMOVED Cards removed from play,"Banished" of one player.
 * @property {Card[]} SPELLZONE Cards in the spell and pendulum zones of one player.
 * @property {Card[]} MONSTERZONE Cards in the Main Monster zones and Extra Monster zone of one player.
 * @property {Card[]} EXCAVATED Cards Excavated by one player atm, or held.
 * @property {Card[]} INMATERIAL Tokens removed from the board after being created.
 */

/**
 * @typedef GameState
 * @type {Object}
 * @property {Number} turn Current total turn count
 * @property {Number} turnOfPlayer player int, 0, 1, etc that is currently making moves
 * @property {Array.<Number>} lifepoints LP count of all players
 * @property {String} duelChat Chat and action log of all players
 * @property {String} spectatorChat Chat log of people not playing
 */

/**
 * @typedef UIPayloadUnit
 * @type {Object}
 * @property {String} action Action the UI cases off of when it gets this message
 * @property {GameState} state State of the game for the UI to update itself with
 * @property {FieldView} view view of the field
 */

/**
 * @typedef UIPayload
 * @type {Object}
 * @property {Array.<String>} name Names of each player
 * @property {UIPayloadUnit} p0 State of the game for the UI to update itself with
 * @property {UIPayloadUnit} p1 view of the field
 * @property {UIPayloadUnit} spectators
 */

/**
 * @typedef {function(UIPayload, Card[], function(Card[]))} UICallback callback of initiation module, shoots directly to UI.
 */

/**
 * @typedef ChangeRequest
 * @type {Object}
 * @property {Number} uid   Unique card identifier in this game
 * @property {Number} player current player int 0,1, etc of controlling player
 * @property {String} clocation current location of the target card 'DECK'/'EXTRA' etc, in caps. 
 * @property {Number} index  current sequence of the card in the stack group. Example, nth card of DECK. in the current location
 * @property {Number} overlayindex  current overlay slot
 * @property {Number} moveplayer Requested end player int 0,1, etc of controlling player
 * @property {String} movelocation Requested end location of the target card 'DECK'/'EXTRA' etc, in caps. 
 * @property {Number} moveindex  Requested end sequence of the card in the stack group. Example, nth card of DECK. in the current location
 * @property {String} moveposition Requested Faceup, Facedown, etc
 */




const EventEmitter = require('events'), // a way to "notice" things occuring
    uniqueIdenifier = require('uuid/v1'); // time based unique identifier, RFC4122 version 1

/**
 * Constructor for card Objects.
 * @param   {Number} movelocation 'DECK'/'EXTRA' etc, in caps. 
 * @param   {Number} player player int 0,1, etcplayerID
 * @param   {Number} index  sequence of the card in the stack group. Example, nth card of DECK.
 * @param   {Number} unique unique ID of the card
 * @param   {Number} code   passcode of the card
 * @returns {Card} a card
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
 * @param   {Card[]} stack a stack of cards which may have overlay units attached to them.
 * @returns {Card[]} a stack of cards, devoid of overlay units.
 */
function filterIsCard(stack) {
    return stack.filter(function(item) {
        return item.type === 'card';
    });
}

/**
 * Filters out cards based on player.
 * @param {Card[]} stack Array a stack of cards.
 * @param {Number} player player int 0,1, etc0 or 1
 * @returns {Card[]} a stack of cards that belong to only one specified player. 
 */
function filterPlayer(stack, player) {
    return stack.filter(function(item) {
        return item.player === player;
    });
}

/**
 * Filters out cards based on zone.
 * @param {Card[]} stack a stack of cards.
 * @param {String} location zone the card is in.
 * @returns {Card[]} a stack of cards that are in only one location/zone.
 */
function filterlocation(stack, location) {
    return stack.filter(function(item) {
        return item.location === location;
    });
}

/**
 * Filters out cards based on index.
 * @param {Card[]}  stack a stack of cards.
 * @param {Number} index index of the card being searched for. Example, nth card of DECK.
 * @returns {Card[]} a stack of cards that are in only one index
 */
function filterIndex(stack, index) {
    return stack.filter(function(item) {
        return item.index === index;
    });
}
/**
 * Filters out cards based on if they are overlay units or not.
 * @param {Card[]} stack a stack of cards attached to a single monster as overlay units.
 * @param {Number} overlayindex sequence in an XYZ stack
 * @returns {Card[]} a single card
 */
function filterOverlyIndex(stack, overlayindex) {
    return stack.filter(function(item) {
        return item.overlayindex === overlayindex;
    });
}

/**
 * Filters out cards based on if they are a specific UID
 * @param {Card[]} stack a stack of cards attached to a single monster as overlay units.
 * @param {Number} uid unique identifier
 * @returns {Boolean} if a card is that UID
 */
function filterUID(stack, uid) {
    return stack.filter(function(item) {
        return item.uid === uid;
    });
}

/**
 * Sort function, sorts by card index
 * @param   {Card}   first  card Object
 * @param   {Card}   second card Object
 * @returns {Number}  if it comes before or after
 */
function sortByIndex(first, second) {
    return first.index - second.index;
}

/**
 * Shuffles array in place.
 * @param {Card[]} deck a items The array containing the items This function is in no way optimized.
 * @returns {undefined}
 */
function shuffle(deck) {
    var j, x, index;
    for (index = deck.length; index; index -= 1) {
        j = Math.floor(Math.random() * index);
        x = deck[index - 1];
        deck[index - 1] = deck[j];
        deck[j] = x;
    }
}


/**
 * Changes a view of cards so the opponent can not see what they are.
 * @param   {Card[]} view a collection of cards
 * @returns {Card[]} a collection of cards
 */
function hideViewOfZone(view) {
    var output = [];
    view.forEach(function(card, index) {
        output[index] = {};
        Object.assign(output[index], card);
        if (output[index].position === 'FaceDown' || output[index].position === 'FaceDownDefence' || output[index].position === 'FaceDownDefense') {
            output[index].id = 0;
            output[index].counters = 0;
            delete output[index].originalcontroller;
        }
    });

    return output;
}

/**
 * Clean counters from the stack.
 * @param   {Card[]} stack a collection of cards
 * @returns {Card[]} a collection of cards
 */
function cleanCounters(stack) {

    stack.forEach(function(card, index) {
        if (card.position === 'FaceDown' || card.position === 'FaceDownDefense') {
            card.counters = 0;
        }
    });
    return stack;
}

/**
 * Changes a view of cards in the hand so the opponent can not see what they are.
 * @param   {Card[]} view a collection of cards
 * @returns {Card[]} a collection of cards
 */
function hideHand(view) {
    var output = [];
    view.forEach(function(card, index) {
        output[index] = {};
        Object.assign(output[index], card);
        output[index].id = 0;
        output[index].position = 'FaceDown';
    });

    return output;
}

/**
 * Initiation of a single independent state intance.
 * @class
 * @param {UICallback} callback function(view, internalState){}; called each time the stack is updated. 
 * @returns {Object} Interface to the created game instance
 */
function init(callback) {
    //the field is represented as a bunch of cards with metadata in an Array, <div>card/card/card/card</div>
    //numberOfCards is used like a memory address. It must be increased by 1 when creating a makeCard.



    if (typeof callback !== 'function') {
        callback = function(view, internalState) {};
    }

    var answerListener = new EventEmitter(),
        lastQuestion = {},
        stack = [],
        previousStack = [],
        outstack = [],
        names = ['', ''],
        lock = [false, false],
        round = [],
        instance,
        state = {
            turn: 0,
            turnOfPlayer: 0,
            phase: 0,
            lifepoints: [
                8000,
                8000
            ],
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


    function getState() {
        var info = {
            names: names,
            stack: stack
        };
        return Object.assign(info, state);
    }
    /**
     * Set a username to a specific slot on lock in.
     * @public
     * @param {any} slot Index in names
     * @param {any} username name of the player
     * @returns {undefined}
     */
    function setNames(slot, username) {
        names[slot] = username;
    }

    /**
     * The way the stack of cards is setup it requires a pointer to edit it.
     * @param {Number} uid provide a unique idenifier
     * @returns {Number} index sequence of the card in the stack group. Example, nth card of DECK.
     */
    function uidLookup(uid) {
        var result;
        stack.some(function(card, index) {
            if (card.uid === uid) {
                result = index;
                return true;
            }
        });
        return result;
    }

    /**
     * Returns info on a card, or rather a single card.
     * @param   {Number} player player int 0,1, etc      Player Interger
     * @param   {Number} clocation    Location enumeral
     * @param   {Number} index        sequence of the card in the stack group. Example, nth card of DECK.
     * @param   {Number} overlayindex Index of where a card is in an XYZ stack starting at 1
     * @param   {Number} uid          Unique identifier, optional.
     * @returns {Object} The card you where looking for.
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

    function findUIDCollectionPrevious(uid) {
        return filterUID(previousStack, uid);
    }

    function filterEdited(cards) {
        return cards.filter(function(card) {
            var newCards = findUIDCollection(card.uid)[0],
                oldCards = findUIDCollectionPrevious(card.uid)[0] || {};
            return !Object.keys(newCards).every(function(key) {
                return newCards[key] === oldCards[key];
            });
        });
    }

    /**
     * Generate the view of the field, for use by YGOPro MSG_UPDATE_DATA to get counts.
     * @param   {Number} player player int 0,1, etcthe given player
     * @returns {Object} all the cards the given player can see on their side of the field.
     */
    function generateViewCount(player) {
        var playersCards = filterPlayer(stack, player),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA'), 0),
            removed = filterlocation(playersCards, 'REMOVED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE');
        return {
            DECK: deck.length,
            HAND: hand.length,
            GRAVE: grave.length,
            EXTRA: extra.length,
            REMOVED: removed.length,
            SPELLZONE: spellzone.length,
            MONSTERZONE: monsterzone.length
        };
    }
    /**
     * Generate the view of the field, for use by YGOPro MSG_UPDATE_DATA to update data.
     * @param   {Number} player player int 0,1, etcthe given player
     * @returns {Object} all the cards the given player can see on their side of the field.
     */
    function generateUpdateView(player) {
        var playersCards = filterPlayer(stack, player),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA'), 0),
            removed = filterlocation(playersCards, 'REMOVED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE');
        return {
            DECK: deck.sort(sortByIndex),
            HAND: hand.sort(sortByIndex),
            GRAVE: grave.sort(sortByIndex),
            EXTRA: extra.sort(sortByIndex),
            REMOVED: removed.sort(sortByIndex),
            SPELLZONE: spellzone.sort(sortByIndex),
            MONSTERZONE: monsterzone.sort(sortByIndex)
        };
    }

    /**
     * Generate the view for a specific given player
     * @param   {Number} player player int 0,1, etcthe given player
     * @returns {Object} all the cards the given player can see on their side of the field.
     */
    function generateSinglePlayerView(player) {
        var playersCards = filterEdited(filterPlayer(stack, player)),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA'), 0),
            removed = filterlocation(playersCards, 'REMOVED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE'),
            excavated = filterlocation(playersCards, 'EXCAVATED'),
            inmaterial = filterlocation(playersCards, 'INMATERIAL');

        return {
            DECK: hideViewOfZone(deck),
            HAND: hand,
            GRAVE: grave,
            EXTRA: hideViewOfZone(extra),
            REMOVED: removed,
            SPELLZONE: spellzone,
            MONSTERZONE: monsterzone,
            EXCAVATED: excavated,
            INMATERIAL: inmaterial
        };
    }

    /**
     * Generate the view for a spectator or opponent
     * @param   {Number} player player int 0,1, etcthe given player
     * @returns {Object} all the cards the given spectator/opponent can see on that side of the field.
     */
    function generateSinglePlayerSpectatorView(player) {
        var playersCards = filterEdited(filterPlayer(stack, player)),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA'), 0),
            removed = filterlocation(playersCards, 'REMOVED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE'),
            excavated = filterlocation(playersCards, 'EXCAVATED'),
            inmaterial = filterlocation(playersCards, 'INMATERIAL');

        return {
            DECK: hideViewOfZone(deck),
            HAND: hideHand(hand),
            GRAVE: grave,
            EXTRA: hideViewOfZone(extra),
            REMOVED: hideViewOfZone(removed),
            SPELLZONE: hideViewOfZone(spellzone),
            MONSTERZONE: hideViewOfZone(monsterzone),
            EXCAVATED: hideViewOfZone(excavated),
            INMATERIAL: inmaterial
        };
    }

    /**
     * Generate a full view of the field for a spectator.
     * @returns {Card[]} complete view of the current field based on the stack.
     */
    function generateSpectatorView() {
        return [generateSinglePlayerSpectatorView(0), generateSinglePlayerSpectatorView(1)];
    }

    /**
     * Generate a full view of the field for a Player 1.
     * @returns {Card[]} complete view of the current field based on the stack.
     */
    function generatePlayer1View() {
        return [generateSinglePlayerView(0), generateSinglePlayerSpectatorView(1)];
    }

    /**
     * Generate a full view of the field for a Player 2.
     * @returns {Card[]} complete view of the current field based on the stack.
     */
    function generatePlayer2View() {
        return [generateSinglePlayerSpectatorView(0), generateSinglePlayerView(1)];
    }

    /**
     * Generate a full view of the field for all view types.
     * @param {string} action callback case statement this should trigger, defaults to 'duel'.
     * @returns {Object} complete view of the current field based on the stack for every view type.
     */
    function generateView(action) {
        if (action === 'start') {
            previousStack = [];
        }
        var output = {
            names: names,
            p0: {
                duelAction: action || 'duel',
                info: state,
                field: generatePlayer1View()
            },
            p1: {
                duelAction: action || 'duel',
                info: state,
                field: generatePlayer2View()
            },
            spectators: {
                duelAction: action || 'duel',
                info: state,
                field: generateSpectatorView()
            }
        };
        previousStack = JSON.parse(JSON.stringify(stack));
        return output;
    }

    function reIndex(player, location) {
        //again YGOPro doesnt manage data properly... and doesnt send the index update for the movement command.
        //that or Im somehow missing it in moveCard().
        var zone = filterlocation(filterPlayer(stack, player), location),
            pointer;

        if (location === 'EXTRA') {
            zone.sort(function(primary, secondary) {
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

        zone.sort(sortByIndex);

        zone.forEach(function(card, index) {
            pointer = uidLookup(card.uid);
            stack[pointer].index = index;
        });

        stack.sort(sortByIndex);
    }

    /**
     * Finds a card, then moves it elsewhere. Crux of the engine.
     * @param {ChangeRequest} changeRequest Payload describing a query to find a card, and what to change it to.
     * @returns {undefined}
     */
    function setState(changeRequest) {
        console.log(changeRequest);
        var player = changeRequest.player,
            clocation = changeRequest.clocation,
            index = changeRequest.index,
            moveplayer = changeRequest.moveplayer,
            movelocation = changeRequest.movelocation,
            moveindex = changeRequest.moveindex,
            moveposition = changeRequest.moveposition,
            overlayindex = changeRequest.overlayindex,
            uid = changeRequest.uid,
            target = queryCard(player, clocation, index, overlayindex, uid),
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
        if (changeRequest.id !== undefined) {
            stack[pointer].id = changeRequest.id;
        }
        if (stack[pointer].position === 'HAND') {
            stack[pointer].position = 'FaceUp';
        }
        reIndex(player, 'GRAVE');
        reIndex(player, 'HAND');
        reIndex(player, 'EXTRA');
        reIndex(player, 'EXCAVATED');
        cleanCounters(stack);
        callback(generateView(), stack);
    }


    function ygoproUpdate() {
        callback(generateView(), stack);
    }

    /**
     * Creates a new card outside of initial start
     * @param {String} currentLocation   zone the card can be found in.
     * @param {Number} currentController player the card can be found under
     * @param {Number} currentSequence   exact index of card in the zone
     * @param {Number} position          position the card needs to be in   
     * @param {Number} code              passcode
     * @param {Number} index             index/sequence in the zone the card needs to become.
     * @returns {undefined}            
     */
    function makeNewCard(currentLocation, currentController, currentSequence, position, code, index) {
        stack.push(makeCard(currentLocation, currentController, currentSequence, stack.length, code));
        stack[stack.length - 1].position = position;
        stack[stack.length - 1].index = index;
        state.added = stack[stack.length - 1];
        callback(generateView('newCard'), stack);
    }


    /**
     * Deletes a specific card from the stack.
     * @param {Number} uid The unique identifier of the card, to quickly find it.
     * @returns {undefined}
     */
    function removeCard(uid) {
        var target = queryCard(undefined, undefined, undefined, 0, uid),
            pointer = uidLookup(target.uid);

        stack[pointer].location = 'INMATERIAL';
        //state.removed = uid;
        callback(generateView(), stack);
    }

    /**
     * Finds a specific card and puts a counter on it.
     * @param {Number} uid The unique identifier of the card, to quickly find it.
     * @returns {undefined}
     */
    function addCounter(uid) {
        var target = queryCard(undefined, undefined, undefined, 0, uid),
            pointer = uidLookup(target.uid);

        stack[pointer].counters += 1;
        callback(generateView(), stack);
    }

    /**
     * Finds a specific card and remove a counter from it.
     * @param {Number} uid The unique identifier of the card, to quickly find it.
     * @return {undefined}
     */
    function removeCounter(uid) {
        var target = queryCard(undefined, undefined, undefined, 0, uid),
            pointer = uidLookup(target.uid);

        stack[pointer].counters -= 1;
        callback(generateView(), stack);
    }


    /**
     * Draws a card, updates state.
     * @param {Number} player player int 0,1, etc       Player drawing the cards
     * @param {Number} numberOfCards number of cards drawn
     * @param {String} username      name of player drawing cards
     * @param {Function} drawCallback callback used by automatic
     * @returns {undefined}
     */
    function drawCard(player, numberOfCards, cards, username, drawCallback) {
        var currenthand = filterlocation(filterPlayer(stack, player), 'HAND').length,
            topcard,
            target,
            i,
            pointer,
            deck;

        for (i = 0; i < numberOfCards; i += 1) {
            deck = filterlocation(filterPlayer(stack, player), 'DECK');
            topcard = deck[deck.length - 1];
            setState({
                player: topcard.player,
                clocation: 'DECK',
                index: topcard.index,
                moveplayer: player,
                movelocation: 'HAND',
                moveindex: currenthand + i,
                moveposition: 'FaceUp',
                overlayindex: 0,
                uid: topcard.uid,
                id: cards[i].id || topcard.id
            });
            target = queryCard(player, 'HAND', (currenthand + i), 0);
            pointer = uidLookup(target.uid);
            //stack[pointer].id = cards[i].Code;
        }
        if (username) {
            state.duelistChat.push('<pre>' + username + ' drew a card.</pre>');
        }
        callback(generateView(), stack);
        if (typeof drawCallback === 'function') {
            drawCallback();
        }
    }

    function excavateCard(player, numberOfCards, cards) {
        var currenthand = filterlocation(filterPlayer(stack, player), 'EXCAVATED').length,
            topcard,
            target,
            i,
            pointer;

        for (i = 0; i < numberOfCards; i += 1) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState({
                player: player,
                clocation: 'DECK',
                index: topcard,
                moveplayer: player,
                movelocation: 'EXCAVATED',
                moveindex: currenthand + i,
                moveposition: 'FaceDown',
                overlayindex: 0,
                uid: undefined
            });
            target = queryCard(player, 'EXCAVATED', (currenthand + i), 0);
            pointer = uidLookup(target.uid);
            //stack[pointer].id = cards[i].Code;
        }
        callback(generateView(), stack);
    }

    /**
     * Mills a card, updates state.
     * @param {Number} player player int 0,1, etc       Player milling the cards
     * @param {Number} numberOfCards number of cards milled
     * @returns {undefined}
     */
    function millCard(player, numberOfCards) {
        var currentgrave = filterlocation(filterPlayer(stack, player), 'GRAVE').length,
            topcard,
            target,
            i,
            pointer;

        for (i = 0; i < numberOfCards; i += 1) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState({
                player: player,
                clocation: 'DECK',
                index: topcard,
                moveplayer: player,
                movelocation: 'GRAVE',
                moveindex: currentgrave,
                moveposition: 'FaceUp',
                overlayindex: 0,
                uid: undefined
            });
        }
        callback(generateView(), stack);
    }

    /**
     * Mills a card to banished zone, updates state.
     * @param {Number} player player int 0,1, etc       Player milling the cards
     * @param {Number} numberOfCards number of cards milled
     * @returns {undefined}
     */
    function millRemovedCard(player, numberOfCards) {
        var currentgrave = filterlocation(filterPlayer(stack, player), 'REMOVED').length,
            topcard,
            target,
            i,
            pointer;

        for (i = 0; i < numberOfCards; i += 1) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState({
                player: player,
                clocation: 'DECK',
                index: topcard,
                moveplayer: player,
                movelocation: 'REMOVED',
                moveindex: currentgrave,
                moveposition: 'FaceUp',
                overlayindex: 0,
                uid: undefined
            });
        }
        callback(generateView(), stack);
    }

    /**
     * Mills a card to banished zone face down, updates state.
     * @param {Number} player player int 0,1, etc       Player milling the cards
     * @param {Number} numberOfCards number of cards milled
     * @returns {undefined}
     */
    function millRemovedCardFaceDown(player, numberOfCards) {
        var currentgrave = filterlocation(filterPlayer(stack, player), 'REMOVED').length,
            topcard,
            target,
            i,
            pointer;

        for (i = 0; i < numberOfCards; i += 1) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState({
                player: player,
                clocation: 'DECK',
                index: topcard,
                moveplayer: player,
                movelocation: 'REMOVED',
                moveindex: currentgrave,
                moveposition: 'FaceDown',
                overlayindex: 0,
                uid: undefined
            });
        }
        callback(generateView(), stack);
    }

    /**
     * Triggers a callback that reveals the given array of cards to end users.
     * @param {Card[]} reference reveal array of cards
     * @param {Number} player player int 0,1, etc
     * @param {function} call second callback
     * @returns {undefined}
     */
    function revealCallback(reference, player, call) {
        var reveal = [];
        reference.forEach(function(card, index) {
            reveal.push(Object.assign({}, card));
            reveal[index].position = 'FaceUp'; // make sure they can see the card and all data on it.
        });
        callback({
            p0: {
                duelAction: 'reveal',
                info: state,
                reveal: reveal,
                call: call,
                player: player
            },
            p1: {
                duelAction: 'reveal',
                info: state,
                reveal: reveal,
                call: call,
                player: player
            },
            sepectators: {
                duelAction: 'reveal',
                info: state,
                reveal: reveal,
                call: call,
                player: player
            }
        }, stack);
    }



    /**
     * Reveal the top card of the players deck.
     * @param {Number} player player int 0,1, etc
     * @returns {undefined}
     */
    function revealTop(player) {
        var deck = filterlocation(filterPlayer(stack, player), 'DECK'),
            reveal = deck[deck.length - 1];

        revealCallback([reveal], player, 'top');

    }

    /**
     * Reveal the bottom card of the players deck.
     * @param {Number} player player int 0,1, etc
     * @returns {undefined}
     */
    function revealBottom(player) {
        var deck = filterlocation(filterPlayer(stack, player), 'DECK'),
            reveal = deck[0];

        revealCallback([reveal], player, 'bottom');
    }

    /**
     * Reveal the players deck.
     * @param {Number} player player int 0,1, etc
     * @returns {undefined}
     */
    function revealDeck(player) {
        revealCallback(filterlocation(filterPlayer(stack, player), 'DECK').reverse(), player, 'deck');
    }

    /**
     * Reveal the players extra deck.
     * @param {Number} player player int 0,1, etc
     * @returns {undefined}
     */
    function revealExtra(player) {
        revealCallback(filterlocation(filterPlayer(stack, player), 'EXTRA'), player, 'extra');
    }

    /**
     * Reveal the players Excavated pile.
     * @param {Number} player player int 0,1, etc
     * @returns {undefined}
     */
    function revealExcavated(player) {
        revealCallback(filterlocation(filterPlayer(stack, player), 'EXCAVATED'), player, 'excavated');
    }

    /**
     * Reveal the players hand.
     * @param {Number} player player int 0,1, etc
     * @returns {undefined}
     */
    function revealHand(player) {
        revealCallback(filterlocation(filterPlayer(stack, player), 'HAND'), player, 'hand');
    }

    /**
     * Reveal the players graveyard.
     * @param {Number} player player int 0,1, etc
     * @param {String} username name of player being viewed.
     * @param {Number} requester name of player requesting the view call
     * @returns {undefined}
     */
    function viewGrave(player, username, requester) {
        if (player === requester) {
            state.duelistChat.push('<pre>' + username + ' is viewing their graveyard.</pre>');
        } else {
            state.duelistChat.push('<pre>' + username + ' is viewing your graveyard.</pre>');
        }
        var deck = filterlocation(filterPlayer(stack, player), 'GRAVE').sort(sortByIndex).reverse(),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };

        result['p' + requester] = {
            duelAction: 'reveal',
            info: state,
            reveal: deck,
            call: 'view',
            player: player
        };

        callback(result, stack);
    }

    /**
     * Reveal the players removed zone.
     * @param {Number} player player int 0,1, etc
     * @param {String} username name of player being viewed.
     * @param {Number} requester name of player requesting the view call
     * @returns {undefined}
     */
    function viewBanished(player, username, requester) {
        if (player === requester) {
            state.duelistChat.push('<pre>' + username + ' is viewing their banished pile.</pre>');
        } else {
            state.duelistChat.push('<pre>' + username + ' is viewing your banished pile.</pre>');
        }
        var deck = filterlocation(filterPlayer(stack, player), 'REMOVED').reverse(), // its face up so its reversed.
            result = {
                0: {},
                1: {},
                sepectators: {}
            };
        if (requester !== player) {
            deck = hideViewOfZone(deck);
        }
        result['p' + requester] = {
            duelAction: 'reveal',
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
        result['p' + player] = {
            duelAction: 'reveal',
            info: state,
            reveal: deck,
            call: 'view',
            player: player
        };
        callback(result, stack);
    }

    /**
     * Player views their own Extra deck
     * @param {Number} player player int 0,1, etc
     * @param {String} username name of player being viewed.
     * @returns {undefined}
     */
    function viewExtra(player, username) {
        var deck = filterlocation(filterPlayer(stack, player), 'EXTRA'),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };
        state.duelistChat.push('<pre>' + username + ' is viewing their extra deck.</pre>');

        result['p' + player] = {
            duelAction: 'reveal',
            info: state,
            reveal: deck,
            call: 'view',
            player: player
        };

        callback(result, stack);

    }

    /**
     * Show player their own deck, allow interaction with it.
     * @param {Number} player player int 0,1, etc
     * @param {String} username name of player being viewed.
     * @return {undefined}
     */
    function viewExcavated(player, username) {
        var deck = filterlocation(filterPlayer(stack, player), 'EXCAVATED'),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };
        state.duelistChat.push('<pre>' + username + ' is viewing their excavated pile.</pre>');

        result['p' + player] = {
            duelAction: 'reveal',
            info: state,
            reveal: deck,
            call: 'view',
            player: player
        };

        callback(result, stack);

    }



    /**
     * Show player their own deck, allow interaction with it.
     * @param {Number} slot   player info
     * @param {Number} index  sequence/index of the Monster zone.
     * @param {Number} player player int 0, 1, etc
     * @return {undefined}
     */
    function viewXYZ(slot, index, player) {
        var pile = filterIndex(filterlocation(filterPlayer(stack, player), 'MONSTERZONE'), index),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };


        result['p' + slot] = {
            duelAction: 'reveal',
            info: state,
            reveal: pile,
            call: 'view',
            player: slot
        };

        callback(result, stack);

    }



    /**
     * Start side decking.
     * @return {undefined}
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
     * @param   {Number} player player int 0, 1, etc
     * @param   {Object}   deck stack of cards
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
     * @param   {Number} player player int 0,1, etc
     * @param   {Object} deck  stack of cards
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
     * @param {Object} player1 player instance
     * @param {Object} player2 player instance
     * @param {Boolean} manual if using manual, or automatic
     * @returns {undefined}
     */
    function startDuel(player1, player2, manual, settings) {
        stack = [];
        if (manual && !lock[0] && !lock[1]) {
            return;
        }

        round.push(player1, player2);
        lock[0] = false;
        lock[1] = false;
        if (!settings.noshuffle || !manual) {
            shuffle(player1.main);
            shuffle(player2.main);
        }

        state.lifepoints = {
            0: parseInt(settings.startLP),
            1: parseInt(settings.startLP)
        };

        player1.main.forEach(function(card, index) {
            stack.push(makeCard('DECK', 0, index, stack.length, card));
        });
        player2.main.forEach(function(card, index) {
            stack.push(makeCard('DECK', 1, index, stack.length, card));
        });

        player1.extra.forEach(function(card, index) {
            stack.push(makeCard('EXTRA', 0, index, stack.length, card));
        });
        player2.extra.forEach(function(card, index) {
            stack.push(makeCard('EXTRA', 1, index, stack.length, card));
        });
        if (manual) {
            state.duelistChat.push('<pre>!!! READ BELOW FOR GAME COMMANDS</pre>');
            state.duelistChat.push('<pre>--Commands--</pre>');
            state.duelistChat.push('<pre>Draw Cards:  /draw [amount]</pre>');
            state.duelistChat.push('<pre>Mill Cards:  /mill [amount]</pre>');
            state.duelistChat.push('<pre>Banish Mill Cards:  /banish [amount]</pre>');
            state.duelistChat.push('<pre>Banish Mill Cards Face-down:  /banishfd [amount]</pre>');
            state.duelistChat.push('<pre>Reduce LP:   /sub [amount]</pre>');
            state.duelistChat.push('<pre>Increase LP: /add [amount]</pre>');
            state.duelistChat.push('<pre>RPS:         /rps</pre>');
            state.duelistChat.push('<pre>Flip Coin:   /flip</pre>');
            state.duelistChat.push('<pre>Roll Dice:   /roll</pre>');
            state.duelistChat.push('<pre>Make Token:  /token</pre>');
            state.duelistChat.push('<pre>Surrender:   /surrender</pre>');
        }
        callback(generateView('start'), stack);
    }

    /**
     * Returns a COPY of all the cards in the game.
     * @returns {Card[]} collection of cards
     */
    function getStack() {
        return JSON.parse(JSON.stringify(stack));
    }

    /**
     * Query a card based on more than one of its properties.
     * @param {Object} requirement values to look for as a hashmap
     * @returns {Card[]} colllection of cards
     */
    function getGroup(requirement) {
        return stack.filter(function(card) {
            return Object.keys(requirement).filter(function(property) {
                return (requirement[property] === card[property]);
            }).length > 0;
        });
    }

    /**
     * Restarts the game for a rematch.
     * @returns {undefined}
     */
    function rematch() {
        stack = [];
        state.duelistChat.push('<pre>Server: Rematch started</pre>');
        startDuel(round[0][0], round[0][1], true);
    }

    /**
     * moves game to next phase.
     * @param {Number} phase enumeral
     * @returns {undefined}
     */
    function nextPhase(phase) {
        state.phase = phase;
        console.log(phase);
        callback(generateView(), stack);
    }

    /**
     * Shifts the game to the start of the next turn and shifts the active player.
     * @returns {undefined}
     */
    function nextTurn() {
        state.turn += 1;
        state.phase = 0;
        state.turnOfPlayer = (state.turnOfPlayer === 0) ? 1 : 0;
        callback(generateView(), stack);
    }

    /**
     * Sets the current turn player.
     * @returns {undefined}
     */
    function setTurnPlayer() {
        state.turnOfPlayer = (state.turnOfPlayer === 0) ? 1 : 0;
    }

    /**
     * Change lifepoints of a player
     * @param {Number} player player int 0,1, etcplayer to edit
     * @param {Number} amount amount of lifepoints to take or remove.
     * @param {String} username name of player being viewed.
     * @return {undefined}
     */
    function changeLifepoints(player, amount, username) {
        if (username) {
            if (amount > 0) {
                state.duelistChat.push('<pre>' + username + ' gained ' + amount + ' Lifepoints.</pre>');
            } else {
                state.duelistChat.push('<pre>' + username + ' lost ' + Math.abs(amount) + ' Lifepoints.</pre>');
            }
        }
        state.lifepoints[player] = state.lifepoints[player] + amount;
        callback(generateView(), stack);
    }

    /**
     * Record what a duelist said to another duelist.
     * @param {Number} username  player saying the message.
     * @param {String} message message to other spectators
     * @returns {undefined}
     */
    function duelistChat(username, message) {
        if (username) {
            state.duelistChat.push(username + ': ' + message);
        } else {
            state.duelistChat.push(message);
        }

        callback(generateView('chat'), stack);
    }

    /**
     * Record what a spectator said to another spectator.
     * @param {Number} username  player saying the message.
     * @param {String} message message to other spectators
     * @returns {undefined}
     */
    function spectatorChat(username, message) {
        state.spectatorChat.push(username + ': ' + message);
        callback(generateView('chat'), stack);
    }

    /**
     * After game start, shuffle a players deck.
     * @param {Number} player player int 0,1, etcplayer int
     * @param {String} username users name in the current game.
     * @returns {undefined}
     */
    function shuffleDeck(player, username) {
        // Ids are reassigned to new GUIs 

        var playersCards = filterPlayer(stack, player),
            deck = filterlocation(playersCards, 'DECK'),
            idCollection = [];

        deck.forEach(function(card) {
            idCollection.push(card.id);
        });

        shuffle(idCollection); // shuffle the "deck".
        deck.forEach(function(card, index) {
            card.id = idCollection[index]; // finalize the shuffle
        });
        state.duelistChat.push('<pre>' + username + ' shuffled their deck.</pre>');
        callback(generateView('shuffleDeck' + player), stack); // alert UI of the shuffle.
    }
    /**
     *   shuffle a players hand.
     * @param {Number} player player int 0,1, etc
     * @returns {undefined}
     */
    function shuffleHand(player) {
        // Ids are reassigned to new GUIs 

        var playersCards = filterPlayer(stack, player),
            hand = filterlocation(playersCards, 'HAND'),
            idCollection = [];

        hand.forEach(function(card) {
            idCollection.push(card.id);
        });

        shuffle(idCollection); // shuffle the "deck".
        hand.forEach(function(card, index) {
            card.id = idCollection[index]; // finalize the shuffle
        });
        callback(generateView('shuffleHand' + player), stack); // alert UI of the shuffle.
    }



    /**
     * Convulstion of Nature
     * @param {Number} player player int 0, 1, etc
     * @returns {undefined}
     */
    function flipDeck(player) {
        var playersCards = filterPlayer(stack, player),
            deck = filterlocation(playersCards, 'DECK'),
            idCollection = [];

        // copy the ids to a sperate place
        deck.forEach(function(card) {
            idCollection.push(card.id);
        });

        // reverse the ids.
        idCollection.reverse();

        // reassign them.
        deck.forEach(function(card, index) {
            card.id = idCollection[index];

            // flip the card over.
            card.position = (card.position === 'FaceDown') ? 'FaceUp' : 'FaceDown';
        });
        callback(generateView('flipDeckOver'), stack); // alert UI of the shuffle.
    }


    function offsetZone(player, zone) {
        stack.forEach(function(card, index) {
            if (card.player === player && card.location === zone) {
                card.index += 1;
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

    /**
     * Send a question to the player
     * @param {Number} slot 
     * @param {String} type 
     * @param {Object[]} options 
     * @param {Number} answerLength 
     * @param {Function} onAnswerFromUser 
     * @return {undefined}
     */
    function question(slot, type, options, answerLength, onAnswerFromUser) {

        // Create a mock view to populate with information so it gets sent to the right place.

        var uuid = uniqueIdenifier(),
            output = {
                names: names,
                p0: {},
                p1: {},
                spectators: {}
            };
        lastQuestion = {
            slot,
            type,
            options,
            answerLength,
            onAnswerFromUser
        };

        output[slot] = {
            duelAction: 'question',
            type: type,
            options: options,
            answerLength: answerLength,
            uuid: uuid
        };

        // Here we set an event listener. `answerListener` is exposed to the controller.
        // So when the user answers this question we can fire `onAnswerFromUser` and pass the data to it.
        // https://nodejs.org/api/events.html#events_emitter_once_eventname_listener
        answerListener.once(uuid, function(data) {
            onAnswerFromUser(data);
        });
        callback(output, stack);
    }

    function retryLastQuestion() {
        question(lastQuestion.slot, lastQuestion.type, lastQuestion.options, lastQuestion.answerLength, lastQuestion.onAnswerFromUser);
    }

    function rps(resolver) {
        var player1,
            player2,
            previous1,
            previous2,
            cardMap = {
                0: 'rock',
                1: 'paper',
                2: 'scissors'
            };


        function determineResult(player, answer) {
            if (player === 0) {
                player1 = answer;
            }
            if (player === 1) {
                player2 = answer;
            }
            if (player1 === undefined || player2 === undefined) {
                return undefined;
            }
            previous1 = player1;
            previous2 = player2;
            if (player1 === player2) {
                player1 = undefined;
                player2 = undefined;
                return false;
            }
            return ((3 + player1 - player2) % 3) - 1; // returns 0 or 1, the winner;
        }

        function notify(reAsk) {
            revealCallback([{
                id: cardMap[previous1],
                value: previous1,
                note: 'specialCards'
            }, {
                id: 'vs',
                note: 'specialCards'
            }, {
                id: cardMap[previous2],
                value: previous2,
                note: 'specialCards'
            }], 0, callback);
            revealCallback([{
                id: cardMap[previous1],
                value: previous1,
                note: 'specialCards'
            }, {
                id: 'vs',
                note: 'specialCards'
            }, {
                id: cardMap[previous2],
                value: previous2,
                note: 'specialCards'
            }], 1, callback);
            if (reAsk) {
                setTimeout(reAsk, 2500);
            }
        }


        function ask() {
            var time = (previous1 !== undefined) ? 3000 : 0;

            question('p0', 'specialCards', [{
                id: 'rock',
                value: 0
            }, {
                id: 'paper',
                value: 1
            }, {
                id: 'scissors',
                value: 2
            }], {
                max: 1,
                min: 1
            }, function(answer) {
                var result = determineResult(0, answer[0]);
                if (result === false) {
                    notify(ask);
                    return;
                }
                if (result !== undefined) {
                    notify(resolver(result));
                }
            });
            question('p1', 'specialCards', [{
                id: 'rock',
                value: 0
            }, {
                id: 'paper',
                value: 1
            }, {
                id: 'scissors',
                value: 2
            }], {
                max: 1,
                min: 1
            }, function(answer) {
                var result = determineResult(1, answer[0]);
                if (result === false) {
                    notify(ask);
                    return;
                }
                if (result !== undefined) {
                    notify(resolver(result));
                }
            });
        }
        ask();
    }

    //expose public functions.
    /**
     * @const
     * @name Core
     */
    return {
        stack,
        startSide,
        startDuel,
        setState,
        drawCard,
        excavateCard,
        flipDeck,
        millCard,
        millRemovedCard,
        millRemovedCardFaceDown,
        revealTop,
        revealBottom,
        revealDeck,
        revealExtra,
        revealExcavated,
        revealHand,
        viewExcavated,
        viewGrave,
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
        generateSinglePlayerView: generateSinglePlayerView,
        generateViewCount: generateViewCount,
        generateView: generateView,
        getGroup: getGroup,
        getState: getState,
        players: {}, // holds socket references
        spectators: {}, // holds socket references
        decks: decks,
        lock: lock,
        lockInDeck,
        rematch,
        rematchAccept: 0,
        sideAccept: 0,
        setNames,
        getStack,
        setTurnPlayer,
        answerListener,
        question,
        retryLastQuestion,
        rps: rps,
        generateUpdateView,
        ygoproUpdate
    };
}

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