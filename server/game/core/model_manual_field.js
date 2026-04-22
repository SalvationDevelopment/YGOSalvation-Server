'use strict';

// You should be drinking scotch and listening to german electronica while reading this.

/**
 * @file Creates instances of game state, and methods of manipulating them.
 */

/**
 * @typedef {Object} Card
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
 * @typedef  {Object} FieldView
 * @property {Card[]} DECK Cards in the deck of one player.
 * @property {Card[]} HAND Cards in the hand of one player.
 * @property {Card[]} GRAVE Cards in the graveyard "GY" of one player.
 * @property {Card[]} EXTRA Cards in the extra deck of one player.
 * @property {Card[]} BANISHED Cards removed from play,"Banished" of one player.
 * @property {Card[]} SPELLZONE Cards in the spell and pendulum zones of one player.
 * @property {Card[]} MONSTERZONE Cards in the Main Monster zones and Extra Monster zone of one player.
 * @property {Card[]} EXCAVATED Cards Excavated by one player atm, or held.
 * @property {Card[]} INMATERIAL Tokens removed from the board after being created.
 */

/**
 * @typedef {Object} GameState
 * @property {Number} turn Current total turn count
 * @property {Number} turnOfPlayer player int, 0, 1, etc that is currently making moves
 * @property {Array.<Number>} lifepoints LP count of all players
 * @property {String} duelChat Chat and action log of all players
 * @property {String} spectatorChat Chat log of people not playing
 */

/**
 * @typedef  {Object} UIPayloadUnit
 * @property {String} action Action the UI cases off of when it gets this message
 * @property {GameState} state State of the game for the UI to update itself with
 * @property {FieldView} view view of the field
 */

/**
 * @typedef  {Object} UIPayload
 * @property {Array.<String>} name Names of each player
 * @property {UIPayloadUnit} p0 State of the game for the UI to update itself with
 * @property {UIPayloadUnit} p1 view of the field
 * @property {Number} player slot of the player, shifts view angle.
 * @property {UIPayloadUnit} spectator
 */

/**
 * @typedef {Function} UICallback callback of initiation module, shoots directly to UI.
 * @param {UIPayload} view view of the field
 * @param {Card[]} payload updated cards
 * @param {Function(Card[]))} }
 */


/**
 * @typedef  {Object} ChangeRequest
 * @property {Number} uid   Unique card identifier in this game
 * @property {Number} player current player int 0,1, etc of controlling player
 * @property {String} location current location of the target card 'DECK'/'EXTRA' etc, in caps. 
 * @property {Number} index  current sequence of the card in the stack group. Example, nth card of DECK. in the current location
 * @property {Number} overlayindex  current overlay slot
 * @property {Number} moveplayer Requested end player int 0,1, etc of controlling player
 * @property {String} movelocation Requested end location of the target card 'DECK'/'EXTRA' etc, in caps. 
 * @property {Number} moveindex  Requested end sequence of the card in the stack group. Example, nth card of DECK. in the current location
 * @property {String} moveposition Requested Faceup, Facedown, etc
 */

const EventEmitter = require('events'), // a way to "notice" things occuring
    { randomUUID } = require("crypto"),
    path = require("path"),
    uniqueIdenifier = randomUUID, // stable native identifier generator
    database = require(path.resolve(__dirname, "../../ui/public/manifest/manifest_0-en-OCGTCG.json")); // Complete card database

/**
 * Makes card used by the model manual field module.
 * @param {string} location The location value provides an input used by the model manual field module.
 * @param {number} player The player value provides an input used by the model manual field module.
 * @param {number} index The index value provides an input used by the model manual field module.
 * @param {string} unique The unique value provides an input used by the model manual field module.
 * @param {string} code The code value provides an input used by the model manual field module.
 * @returns {Object} Returns the value produced by the model manual field module.
 */
function makeCard(location, player, index, unique, code) {
    const databaseEntry = database.find(function (entry) {
        return entry.id === code;
    }) || {}, baseCard = {
        type: 'card',
        player: player,
        location: location,
        id: code,
        index: index,
        position: 'FaceDown',
        overlayindex: 0,
        uid: unique,
        originalcontroller: player,
        counters: 0
    };
    Object.assign(baseCard, databaseEntry);
    delete baseCard.ocg;
    delete baseCard.tcg;
    return baseCard;
}



/**
 * Filters player used by the model manual field module.
 * @param {Array} stack The stack array supplies the ordered values used by the model manual field module, each item uses the `player` property.
 * @param {number} stack[].player The `[].player` property describes data read from each item used by the model manual field module.
 * @param {number} player The player value provides an input used by the model manual field module.
 * @returns {Array} Returns the value produced by the model manual field module.
 */
function filterPlayer(stack, player) {
    return stack.filter(function (item) {
        return item.player === player;
    });
}

/**
 * Filters location used by the model manual field module.
 * @param {Array} stack The stack array supplies the ordered values used by the model manual field module, each item uses the `location` property.
 * @param {string} stack[].location The `[].location` property describes data read from each item used by the model manual field module.
 * @param {string} location The location value provides an input used by the model manual field module.
 * @returns {Array} Returns the value produced by the model manual field module.
 */
function filterlocation(stack, location) {
    return stack.filter(function (item) {
        return item.location === location;
    });
}

/**
 * Filters index used by the model manual field module.
 * @param {Array} stack The stack array supplies the ordered values used by the model manual field module, each item uses the `index` property.
 * @param {number} stack[].index The `[].index` property describes data read from each item used by the model manual field module.
 * @param {number} index The index value provides an input used by the model manual field module.
 * @returns {Array} Returns the value produced by the model manual field module.
 */
function filterIndex(stack, index) {
    return stack.filter(function (item) {
        return item.index === index;
    });
}
/**
 * Filters overly index used by the model manual field module.
 * @param {Array} stack The stack array supplies the ordered values used by the model manual field module, each item uses the `overlayindex` property.
 * @param {number} stack[].overlayindex The `[].overlayindex` property describes data read from each item used by the model manual field module.
 * @param {number} overlayindex The overlayindex value provides an input used by the model manual field module.
 * @returns {Array} Returns the value produced by the model manual field module.
 */
function filterOverlyIndex(stack, overlayindex) {
    return stack.filter(function (item) {
        return item.overlayindex === overlayindex;
    });
}

/**
 * Filters uid used by the model manual field module.
 * @param {Array} stack The stack array supplies the ordered values used by the model manual field module, each item uses the `uid` property.
 * @param {string} stack[].uid The `[].uid` property describes data read from each item used by the model manual field module.
 * @param {string} uid The uid value provides an input used by the model manual field module.
 * @returns {Array} Returns the value produced by the model manual field module.
 */
function filterUID(stack, uid) {
    return stack.filter(function (item) {
        return item.uid === uid;
    });
}

/**
 * Sorts by index used by the model manual field module.
 * @param {Object} first The first object supplies the structured input used by the model manual field module, including the `index` property.
 * @param {number} first.index The `index` property supplies structured input used by the model manual field module.
 * @param {Object} second The second object supplies the structured input used by the model manual field module, including the `index` property.
 * @param {number} second.index The `index` property supplies structured input used by the model manual field module.
 * @returns {number} Returns the value produced by the model manual field module.
 */
function sortByIndex(first, second) {
    return first.index - second.index;
}

/**
 * Executes the shuffle helper used by the model manual field module.
 * @param {Object} deck The deck value provides an input used by the model manual field module.
 * @returns {void} Does not return a value.
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
 * Hides view of zone used by the model manual field module.
 * @param {Array} view The view value provides an input used by the model manual field module.
 * @returns {Array} Returns the value produced by the model manual field module.
 */
function hideViewOfZone(view) {
    var output = [];
    view.forEach(function (card, index) {
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
 * Executes the clean counters helper used by the model manual field module.
 * @param {Array} stack The stack array supplies the ordered values used by the model manual field module, each item uses the `counters` and `position` properties.
 * @param {Array} stack[].counters The `[].counters` property describes data read from each item used by the model manual field module.
 * @param {string} stack[].position The `[].position` property describes data read from each item used by the model manual field module.
 * @returns {Array} Returns the value produced by the model manual field module.
 */
function cleanCounters(stack) {

    stack.forEach(function (card) {
        if (card.position === 'FaceDown' || card.position === 'FaceDownDefense') {
            card.counters = 0;
        }
    });
    return stack;
}

/**
 * Hides hand used by the model manual field module.
 * @param {Array} view The view value provides an input used by the model manual field module.
 * @returns {Array} Returns the value produced by the model manual field module.
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
 * Executes the init helper used by the model manual field module.
 * @param {Function} callback The callback value provides an input used by the model manual field module.
 * @class
 * @returns {Object} Returns the value produced by the model manual field module.
 */
function init(callback) {
    //the field is represented as a bunch of cards with metadata in an Array, <div>card/card/card/card</div>
    //numberOfCards is used like a memory address. It must be increased by 1 when creating a makeCard.

    if (typeof callback !== 'function') {
        callback = function () { };
    }

    var answerListener = new EventEmitter(),
        lastQuestion = {},
        stack = [],
        previousStack = [],
        names = ['', ''],
        round = [],
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


            /**
     * Gets state used by the model manual field module.
     * @returns {Object} Returns the value produced by the model manual field module.
     */
    function getState() {
        var info = {
            names: names,
            stack: stack
        };
        return Object.assign(info, state);
    }

        /**
     * Executes the duelist chat helper used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @param {Object} message The message value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function duelistChat(username, message) {
        username = username || 'Server';
        const view = {
            names: names,
            p0: {
                duelAction: 'chat',
                username,
                message,
                date: new Date()
            },
            p1: {
                duelAction: 'chat',
                username,
                message,
                date: new Date()
            },
            spectator: {
                duelAction: 'chat',
                username,
                message,
                date: new Date()
            }
        };
        callback(view, stack);
    }

        /**
     * Sets names used by the model manual field module.
     * @param {number} slot The slot value provides an input used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @public
     * @returns {void} Does not return a value.
     */
    function setNames(slot, username) {
        names[slot] = username;
    }

        /**
     * Executes the uid lookup helper used by the model manual field module.
     * @param {string} uid The uid value provides an input used by the model manual field module.
     * @returns {(Object|null)} Returns the value produced by the model manual field module.
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
     * Executes the query card helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {string} location The location value provides an input used by the model manual field module.
     * @param {number} index The index value provides an input used by the model manual field module.
     * @param {number} overlayindex The overlayindex value provides an input used by the model manual field module.
     * @param {string} uid The uid value provides an input used by the model manual field module.
     * @returns {Array} Returns the value produced by the model manual field module.
     */
    function queryCard(player, location, index, overlayindex, uid) {
        if (uid) {
            return filterUID(stack, uid)[0];
        }
        return filterOverlyIndex(filterIndex(filterlocation(filterPlayer(stack, player), location), index), overlayindex)[0];
    }

            /**
     * Finds uidcollection used by the model manual field module.
     * @param {string} uid The uid value provides an input used by the model manual field module.
     * @returns {Object} Returns the value produced by the model manual field module.
     */
    function findUIDCollection(uid) {
        return filterUID(stack, uid);
    }

            /**
     * Finds uidcollection previous used by the model manual field module.
     * @param {string} uid The uid value provides an input used by the model manual field module.
     * @returns {Object} Returns the value produced by the model manual field module.
     */
    function findUIDCollectionPrevious(uid) {
        return filterUID(previousStack, uid);
    }

            /**
     * Filters edited used by the model manual field module.
     * @param {Array} cards The cards array supplies the ordered values used by the model manual field module, each item uses the `uid` property.
     * @param {string} cards[].uid The `[].uid` property describes data read from each item used by the model manual field module.
     * @returns {Array} Returns the value produced by the model manual field module.
     */
    function filterEdited(cards) {
        return cards.filter(function (card) {
            var newCards = findUIDCollection(card.uid)[0],
                oldCards = findUIDCollectionPrevious(card.uid)[0] || {};
            return !Object.keys(newCards).every(function (key) {
                return newCards[key] === oldCards[key];
            });
        });
    }

        /**
     * Executes the generate view count helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {Object} Returns the value produced by the model manual field module.
     */
    function generateViewCount(player) {
        var playersCards = filterPlayer(stack, player),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA'), 0),
            removed = filterlocation(playersCards, 'BANISHED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE');
        return {
            DECK: deck.length,
            HAND: hand.length,
            GRAVE: grave.length,
            EXTRA: extra.length,
            BANISHED: removed.length,
            SPELLZONE: spellzone.length,
            MONSTERZONE: monsterzone.length
        };
    }
        /**
     * Executes the generate update view helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {Object} Returns the value produced by the model manual field module.
     */
    function generateUpdateView(player) {
        var playersCards = filterPlayer(stack, player),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA'), 0),
            removed = filterlocation(playersCards, 'BANISHED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE');
        return {
            DECK: deck.sort(sortByIndex),
            HAND: hand.sort(sortByIndex),
            GRAVE: grave.sort(sortByIndex),
            EXTRA: extra.sort(sortByIndex),
            BANISHED: removed.sort(sortByIndex),
            SPELLZONE: spellzone.sort(sortByIndex),
            MONSTERZONE: monsterzone.sort(sortByIndex)
        };
    }

        /**
     * Executes the generate single player view helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {Object} Returns the value produced by the model manual field module.
     */
    function generateSinglePlayerView(player) {
        var playersCards = filterEdited(filterPlayer(stack, player)),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA'), 0),
            removed = filterlocation(playersCards, 'BANISHED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE'),
            excavated = filterlocation(playersCards, 'EXCAVATED'),
            inmaterial = filterlocation(playersCards, 'INMATERIAL');

        return {
            DECK: hideViewOfZone(deck),
            HAND: hand,
            GRAVE: grave,
            EXTRA: hideViewOfZone(extra),
            BANISHED: removed,
            SPELLZONE: spellzone,
            MONSTERZONE: monsterzone,
            EXCAVATED: excavated,
            INMATERIAL: inmaterial
        };
    }

        /**
     * Executes the generate single player spectator view helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {Object} Returns the value produced by the model manual field module.
     */
    function generateSinglePlayerSpectatorView(player) {
        var playersCards = filterEdited(filterPlayer(stack, player)),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterOverlyIndex(filterlocation(playersCards, 'EXTRA'), 0),
            removed = filterlocation(playersCards, 'BANISHED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE'),
            excavated = filterlocation(playersCards, 'EXCAVATED'),
            inmaterial = filterlocation(playersCards, 'INMATERIAL');

        return {
            DECK: hideViewOfZone(deck),
            HAND: hideHand(hand),
            GRAVE: grave,
            EXTRA: hideViewOfZone(extra),
            BANISHED: hideViewOfZone(removed),
            SPELLZONE: hideViewOfZone(spellzone),
            MONSTERZONE: hideViewOfZone(monsterzone),
            EXCAVATED: hideViewOfZone(excavated),
            INMATERIAL: inmaterial
        };
    }

        /**
     * Executes the generate spectator view helper used by the model manual field module.
     * @returns {Array} Returns the value produced by the model manual field module.
     */
    function generateSpectatorView() {
        return [generateSinglePlayerSpectatorView(0), generateSinglePlayerSpectatorView(1)];
    }

        /**
     * Executes the generate player1 view helper used by the model manual field module.
     * @returns {Array} Returns the value produced by the model manual field module.
     */
    function generatePlayer1View() {
        return [generateSinglePlayerView(0), generateSinglePlayerSpectatorView(1)];
    }

        /**
     * Executes the generate player2 view helper used by the model manual field module.
     * @returns {Array} Returns the value produced by the model manual field module.
     */
    function generatePlayer2View() {
        return [generateSinglePlayerSpectatorView(0), generateSinglePlayerView(1)];
    }

        /**
     * Executes the generate view helper used by the model manual field module.
     * @param {string} action The action value provides an input used by the model manual field module.
     * @returns {Object} Returns the value produced by the model manual field module.
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
                field: generatePlayer1View(),
                player: 0
            },
            p1: {
                duelAction: action || 'duel',
                info: state,
                field: generatePlayer2View(),
                player: 1
            },
            spectator: {
                duelAction: action || 'duel',
                info: state,
                field: generateSpectatorView()
            }
        };
        previousStack = JSON.parse(JSON.stringify(stack));
        return output;
    }

            /**
     * Executes the re index helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {string} location The location value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
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

        zone.sort(sortByIndex);

        zone.forEach(function (card, index) {
            pointer = uidLookup(card.uid);
            stack[pointer].index = index;
        });

        stack.sort(sortByIndex);
    }

        /**
     * Sets state used by the model manual field module.
     * @param {Object} changeRequest The changeRequest object supplies the structured input used by the model manual field module, including the `id`, `index`, `location`, `moveindex`, `movelocation`, `moveplayer`, `moveposition`, `overlayindex`, `player`, and `uid` properties.
     * @param {string} changeRequest.id The `id` property supplies structured input used by the model manual field module.
     * @param {number} changeRequest.index The `index` property supplies structured input used by the model manual field module.
     * @param {string} changeRequest.location The `location` property supplies structured input used by the model manual field module.
     * @param {number} changeRequest.moveindex The `moveindex` property supplies structured input used by the model manual field module.
     * @param {string} changeRequest.movelocation The `movelocation` property supplies structured input used by the model manual field module.
     * @param {number} changeRequest.moveplayer The `moveplayer` property supplies structured input used by the model manual field module.
     * @param {string} changeRequest.moveposition The `moveposition` property supplies structured input used by the model manual field module.
     * @param {number} changeRequest.overlayindex The `overlayindex` property supplies structured input used by the model manual field module.
     * @param {number} changeRequest.player The `player` property supplies structured input used by the model manual field module.
     * @param {string} changeRequest.uid The `uid` property supplies structured input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function setState(changeRequest) {
        var player = changeRequest.player,
            location = changeRequest.location,
            index = changeRequest.index,
            moveplayer = changeRequest.moveplayer,
            movelocation = changeRequest.movelocation,
            moveindex = changeRequest.moveindex,
            moveposition = changeRequest.moveposition,
            overlayindex = changeRequest.overlayindex,
            uid = changeRequest.uid,
            target = queryCard(player, location, index, overlayindex, uid),
            pointer = uidLookup(target.uid);

        if (movelocation === 'GRAVE' || movelocation === 'BANISHED') {
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


            /**
     * Executes the ygopro update helper used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function ygoproUpdate() {
        callback(generateView(), stack);
    }

        /**
     * Makes new card used by the model manual field module.
     * @param {string} currentLocation The currentLocation value provides an input used by the model manual field module.
     * @param {number} currentController The currentController value provides an input used by the model manual field module.
     * @param {number} currentSequence The currentSequence value provides an input used by the model manual field module.
     * @param {string} position The position value provides an input used by the model manual field module.
     * @param {string} code The code value provides an input used by the model manual field module.
     * @param {number} index The index value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function makeNewCard(currentLocation, currentController, currentSequence, position, code, index) {
        stack.push(makeCard(currentLocation, currentController, currentSequence, stack.length, code));
        stack[stack.length - 1].position = position;
        stack[stack.length - 1].index = index;
        state.added = stack[stack.length - 1];
        callback(generateView('newCard'), stack);
    }


        /**
     * Removes card used by the model manual field module.
     * @param {string} uid The uid value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function removeCard(uid) {
        var target = queryCard(undefined, undefined, undefined, 0, uid),
            pointer = uidLookup(target.uid);

        stack[pointer].location = 'INMATERIAL';
        //state.removed = uid;
        callback(generateView(), stack);
    }

        /**
     * Executes the add counter helper used by the model manual field module.
     * @param {string} uid The uid value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function addCounter(uid) {
        var target = queryCard(undefined, undefined, undefined, 0, uid),
            pointer = uidLookup(target.uid);

        stack[pointer].counters += 1;
        callback(generateView(), stack);
    }

        /**
     * Removes counter used by the model manual field module.
     * @param {string} uid The uid value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function removeCounter(uid) {
        var target = queryCard(undefined, undefined, undefined, 0, uid),
            pointer = uidLookup(target.uid);

        stack[pointer].counters -= 1;
        callback(generateView(), stack);
    }


        /**
     * Executes the draw card helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {(number|Array)} numberOfCards The numberOfCards value provides an input used by the model manual field module.
     * @param {Array} cards The cards array supplies the ordered values used by the model manual field module, each item uses the `id` property.
     * @param {string} cards[].id The `[].id` property describes data read from each item used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @param {Function} drawCallback The drawCallback value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function drawCard(player, numberOfCards, cards, username, drawCallback) {
        var currenthand = filterlocation(filterPlayer(stack, player), 'HAND').length,
            topcard,
            i,
            deck;

        for (i = 0; i < numberOfCards; i += 1) {
            deck = filterlocation(filterPlayer(stack, player), 'DECK');
            topcard = deck[deck.length - 1];
            setState({
                player: topcard.player,
                location: 'DECK',
                index: topcard.index,
                moveplayer: player,
                movelocation: 'HAND',
                moveindex: currenthand + i,
                moveposition: 'FaceUp',
                overlayindex: 0,
                uid: topcard.uid,
                id: cards[i].id || topcard.id
            });
        }
        if (username) {
            duelistChat('Server', username + ' drew a card.');
        }
        callback(generateView(), stack);
        if (typeof drawCallback === 'function') {
            drawCallback();
        }
    }

            /**
     * Executes the excavate card helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {(number|Array)} numberOfCards The numberOfCards value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function excavateCard(player, numberOfCards) {
        var currenthand = filterlocation(filterPlayer(stack, player), 'EXCAVATED').length,
            topcard,
            i;

        for (i = 0; i < numberOfCards; i += 1) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState({
                player: player,
                location: 'DECK',
                index: topcard,
                moveplayer: player,
                movelocation: 'EXCAVATED',
                moveindex: currenthand + i,
                moveposition: 'FaceDown',
                overlayindex: 0,
                uid: undefined
            });
        }
        callback(generateView(), stack);
    }

        /**
     * Executes the mill card helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {(number|Array)} numberOfCards The numberOfCards value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function millCard(player, numberOfCards) {
        var currentgrave = filterlocation(filterPlayer(stack, player), 'GRAVE').length,
            topcard,
            i;

        for (i = 0; i < numberOfCards; i += 1) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState({
                player: player,
                location: 'DECK',
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
     * Executes the mill removed card helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {(number|Array)} numberOfCards The numberOfCards value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function millRemovedCard(player, numberOfCards) {
        var currentgrave = filterlocation(filterPlayer(stack, player), 'BANISHED').length,
            topcard,
            i;

        for (i = 0; i < numberOfCards; i += 1) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState({
                player: player,
                location: 'DECK',
                index: topcard,
                moveplayer: player,
                movelocation: 'BANISHED',
                moveindex: currentgrave,
                moveposition: 'FaceUp',
                overlayindex: 0,
                uid: undefined
            });
        }
        callback(generateView(), stack);
    }

        /**
     * Executes the mill removed card face down helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {(number|Array)} numberOfCards The numberOfCards value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function millRemovedCardFaceDown(player, numberOfCards) {
        var currentgrave = filterlocation(filterPlayer(stack, player), 'BANISHED').length,
            topcard,
            i;

        for (i = 0; i < numberOfCards; i += 1) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState({
                player: player,
                location: 'DECK',
                index: topcard,
                moveplayer: player,
                movelocation: 'BANISHED',
                moveindex: currentgrave,
                moveposition: 'FaceDown',
                overlayindex: 0,
                uid: undefined
            });
        }
        callback(generateView(), stack);
    }

        /**
     * Executes the reveal callback helper used by the model manual field module.
     * @param {Array} reference The reference value provides an input used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {string} call The call value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function revealCallback(reference, player, call) {
        var reveal = [];
        reference.forEach(function (card, index) {
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
     * Executes the reveal top helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function revealTop(player) {
        var deck = filterlocation(filterPlayer(stack, player), 'DECK'),
            reveal = deck[deck.length - 1];

        revealCallback([reveal], player, 'top');

    }

        /**
     * Executes the reveal bottom helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function revealBottom(player) {
        var deck = filterlocation(filterPlayer(stack, player), 'DECK'),
            reveal = deck[0];

        revealCallback([reveal], player, 'bottom');
    }

        /**
     * Executes the reveal deck helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function revealDeck(player) {
        revealCallback(filterlocation(filterPlayer(stack, player), 'DECK').reverse(), player, 'deck');
    }

        /**
     * Executes the reveal extra helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function revealExtra(player) {
        revealCallback(filterlocation(filterPlayer(stack, player), 'EXTRA'), player, 'extra');
    }

        /**
     * Executes the reveal excavated helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function revealExcavated(player) {
        revealCallback(filterlocation(filterPlayer(stack, player), 'EXCAVATED'), player, 'excavated');
    }

        /**
     * Executes the reveal hand helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function revealHand(player) {
        revealCallback(filterlocation(filterPlayer(stack, player), 'HAND'), player, 'hand');
    }

        /**
     * Executes the view grave helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @param {string} requester The requester value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function viewGrave(player, username, requester) {
        if (player === requester) {
            duelistChat('Server', username + ' is viewing their graveyard.');
        } else {
            duelistChat('Server', username + ' is viewing your graveyard.');
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
     * Executes the view banished helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @param {string} requester The requester value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function viewBanished(player, username, requester) {
        if (player === requester) {
            duelistChat('Server', username + ' is viewing their banished pile.');
        } else {
            duelistChat('Server', username + ' is viewing your banished pile.');
        }
        var deck = filterlocation(filterPlayer(stack, player), 'BANISHED').reverse(), // its face up so its reversed.
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


            /**
     * Executes the view deck helper used by the model manual field module.
     * @param {(string|number)} player The player value provides an input used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function viewDeck(player, username) {
        var deck = filterlocation(filterPlayer(stack, player), 'DECK').reverse(),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };
        duelistChat('Server', username + ' is viewing their deck.');
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
     * Executes the view extra helper used by the model manual field module.
     * @param {(string|number)} player The player value provides an input used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function viewExtra(player, username) {
        var deck = filterlocation(filterPlayer(stack, player), 'EXTRA'),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };
        duelistChat('Server', username + ' is viewing their extra deck.');

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
     * Executes the view excavated helper used by the model manual field module.
     * @param {(string|number)} player The player value provides an input used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function viewExcavated(player, username) {
        var deck = filterlocation(filterPlayer(stack, player), 'EXCAVATED'),
            result = {
                0: {},
                1: {},
                sepectators: {}
            };
        duelistChat('Server', username + ' is viewing their excavated pile.');

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
     * Executes the view xyz helper used by the model manual field module.
     * @param {(string|number)} slot The slot value provides an input used by the model manual field module.
     * @param {number} index The index value provides an input used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
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
     * Starts side used by the model manual field module.
     * @returns {void} Does not return a value.
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
     * Validates deck against previous used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {Object} deck The deck object supplies the structured input used by the model manual field module, including the `extra`, `main`, and `side` properties.
     * @param {Array} deck.extra The `extra` property supplies structured input used by the model manual field module.
     * @param {Array} deck.main The `main` property supplies structured input used by the model manual field module.
     * @param {number} deck.side The `side` property supplies structured input used by the model manual field module.
     * @returns {boolean} Returns the value produced by the model manual field module.
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
     * Executes the announcement helper used by the model manual field module.
     * @param {(string|number)} player The player value provides an input used by the model manual field module.
     * @param {Object} message The message value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function announcement(player, message) {
        const slot = 'p' + player,
            output = {
                names: names,
                p0: {},
                p1: {},
                spectator: {}
            };
        output[slot] = {
            duelAction: 'announcement',
            message
        };
        callback(output, stack);
    }


        /**
     * Starts duel used by the model manual field module.
     * @param {Object} player1 The player1 object supplies the structured input used by the model manual field module, including the `extra` and `main` properties.
     * @param {Array} player1.extra The `extra` property supplies structured input used by the model manual field module.
     * @param {Array} player1.main The `main` property supplies structured input used by the model manual field module.
     * @param {Object} player2 The player2 object supplies the structured input used by the model manual field module, including the `extra` and `main` properties.
     * @param {Array} player2.extra The `extra` property supplies structured input used by the model manual field module.
     * @param {Array} player2.main The `main` property supplies structured input used by the model manual field module.
     * @param {boolean} manual The manual value provides an input used by the model manual field module.
     * @param {Object} settings The settings object supplies the structured input used by the model manual field module, including the `noShuffleDeck` and `startingLP` properties.
     * @param {boolean} settings.noShuffleDeck The `noShuffleDeck` property supplies structured input used by the model manual field module.
     * @param {number} settings.startingLP The `startingLP` property supplies structured input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function startDuel(player1, player2, manual, settings) {
        stack = [];


        round.push(player1, player2);

        if (!settings.noShuffleDeck || !manual) {
            shuffle(player1.main);
            shuffle(player2.main);
        }

        state.lifepoints = {
            0: parseInt(settings.startingLP),
            1: parseInt(settings.startingLP)
        };

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

        duelistChat('Server', `!!! READ BELOW FOR GAME COMMANDS\n
        --Commands--\n
        Draw Cards:  /draw [amount]\n
        Mill Cards:  /mill [amount]\n
        Banish Mill Cards:  /banish [amount]\n
        Banish Mill Cards Face-down:  /banishfd [amount]\n
        Reduce LP:   /sub [amount]\n
        Increase LP: /add [amount]\n
        RPS:         /rps\n
        Flip Coin:   /flip\n
        Roll Dice:   /roll\n
        Make Token:  /token\n
        Surrender:   /surrender`);

        announcement(0, { command: 'MSG_ORIENTATION', slot: 0 });
        announcement(1, { command: 'MSG_ORIENTATION', slot: 1 });
        callback(generateView('start'), stack);
    }

        /**
     * Gets stack used by the model manual field module.
     * @returns {Object} Returns the value produced by the model manual field module.
     */
    function getStack() {
        return JSON.parse(JSON.stringify(stack));
    }

            /**
     * Gets field used by the model manual field module.
     * @param {string} view The view value provides an input used by the model manual field module.
     * @returns {Object} Returns the value produced by the model manual field module.
     */
    function getField(view) {
        return generateView('start')[view];
    }

        /**
     * Gets group used by the model manual field module.
     * @param {Array} requirement The requirement value provides an input used by the model manual field module.
     * @returns {Array} Returns the value produced by the model manual field module.
     */
    function getGroup(requirement) {
        return stack.filter(function (card) {
            return Object.keys(requirement).filter(function (property) {
                return (requirement[property] === card[property]);
            }).length > 0;
        });
    }

        /**
     * Executes the rematch helper used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function rematch() {
        stack = [];
        duelistChat('Server: Rematch started');
        startDuel(round[0][0], round[0][1], true);
    }

        /**
     * Executes the next phase helper used by the model manual field module.
     * @param {(number|string)} phase The phase value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function nextPhase(phase) {
        state.phase = phase;
        callback(generateView(), stack);
    }

        /**
     * Executes the next turn helper used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function nextTurn() {
        state.turn += 1;
        state.phase = 0;
        state.turnOfPlayer = (state.turnOfPlayer === 0) ? 1 : 0;
        callback(generateView(), stack);
    }

        /**
     * Sets turn player used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function setTurnPlayer() {
        state.turnOfPlayer = (state.turnOfPlayer === 0) ? 1 : 0;
    }

        /**
     * Executes the change lifepoints helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {number} amount The amount value provides an input used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function changeLifepoints(player, amount, username) {
        if (username) {
            if (amount > 0) {
                duelistChat('Server', username + ' gained ' + amount + ' Lifepoints.');
            } else {
                duelistChat('Server', username + ' lost ' + Math.abs(amount) + ' Lifepoints.');
            }
        }
        state.lifepoints[player] = state.lifepoints[player] + amount;
        callback(generateView(), stack);
    }



        /**
     * Executes the spectator chat helper used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @param {(number|Object)} message The message value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function spectatorChat(username, message) {
        state.spectatorChat.push(username + ': ' + message);
        callback(generateView('chat'), stack);
    }

        /**
     * Shuffles deck used by the model manual field module.
     * @param {(string|number)} player The player value provides an input used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function shuffleDeck(player, username) {
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
        duelistChat('Server', username + ' shuffled their deck.');
        callback(generateView('shuffleDeck' + player), stack); // alert UI of the shuffle.
    }
        /**
     * Shuffles hand used by the model manual field module.
     * @param {(string|number)} player The player value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
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
        callback(generateView('shuffleHand' + player), stack); // alert UI of the shuffle.
    }



        /**
     * Executes the flip deck helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
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
        callback(generateView(), stack); // alert UI of the shuffle.
    }


            /**
     * Executes the offset zone helper used by the model manual field module.
     * @param {number} player The player value provides an input used by the model manual field module.
     * @param {string} zone The zone value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function offsetZone(player, zone) {
        stack.forEach(function (card) {
            if (card.player === player && card.location === zone) {
                card.index += 1;
            }
        });
    }

            /**
     * Executes the roll die helper used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @returns {number} Returns the value produced by the model manual field module.
     */
    function rollDie(username) {
        var result = Math.floor(Math.random() * ((6 - 1) + 1) + 1);
        duelistChat('Server', username + ' rolled a ' + result);
        return result;

    }

            /**
     * Executes the flip coin helper used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @returns {string} Returns the value produced by the model manual field module.
     */
    function flipCoin(username) {

        var result = (Math.random() < 0.5) ? 'Heads' : 'Tails';
        duelistChat('Server', username + ' flipped ' + result);
        return result;
    }

            /**
     * Executes the surrender helper used by the model manual field module.
     * @param {string} username The username value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function surrender(username) {
        duelistChat('Server', username + ' surrendered.');
    }



        /**
     * Executes the question helper used by the model manual field module.
     * @param {number} slot The slot value provides an input used by the model manual field module.
     * @param {string} type The type value provides an input used by the model manual field module.
     * @param {Object} options The options value provides an input used by the model manual field module.
     * @param {number} answerLength The answerLength value provides an input used by the model manual field module.
     * @param {Function} onAnswerFromUser The onAnswerFromUser value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function question(slot, type, options, answerLength, onAnswerFromUser) {

        // Create a mock view to populate with information so it gets sent to the right place.

        var uuid = uniqueIdenifier(),
            output = {
                names: names,
                p0: {},
                p1: {},
                spectator: {}
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


        // So when the user answers this question we can fire `onAnswerFromUser` and pass the data to it.
        // https://nodejs.org/api/events.html#events_emitter_once_eventname_listener
        answerListener.on(uuid, function (data) {
            onAnswerFromUser(data);
        });
        console.log('need answer from', uuid);
        callback(output, stack);
    }

        /**
     * Executes the respond helper used by the model manual field module.
     * @param {Object} message The message object supplies the structured input used by the model manual field module, including the `answer` and `uuid` properties.
     * @param {Object} message.answer The `answer` property supplies structured input used by the model manual field module.
     * @param {string} message.uuid The `uuid` property supplies structured input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function respond(message) {
        console.log('seeing answer from', message.uuid);
        answerListener.emit(message.uuid, message.answer);
    }

            /**
     * Retries last question used by the model manual field module.
     * @returns {void} Does not return a value.
     */
    function retryLastQuestion() {
        question(lastQuestion.slot, lastQuestion.type, lastQuestion.options, lastQuestion.answerLength, lastQuestion.onAnswerFromUser);
    }

            /**
     * Executes the rps helper used by the model manual field module.
     * @param {Function} resolver The resolver value provides an input used by the model manual field module.
     * @returns {void} Does not return a value.
     */
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


                        /**
         * Executes the determine result helper used by the model manual field module.
         * @param {number} player The player value provides an input used by the model manual field module.
         * @param {Object} answer The answer value provides an input used by the model manual field module.
         * @returns {(number|boolean)} Returns the value produced by the model manual field module.
         */
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

                        /**
         * Executes the notify helper used by the model manual field module.
         * @param {Function} reAsk The reAsk value provides an input used by the model manual field module.
         * @returns {void} Does not return a value.
         */
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


                        /**
         * Executes the ask helper used by the model manual field module.
         * @returns {void} Does not return a value.
         */
        function ask() {

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
            }, function (answer) {
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
            }, function (answer) {
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
        viewDeck,
        viewExtra,
        viewBanished,
        viewXYZ,
        nextPhase,
        nextTurn,
        changeLifepoints,
        findUIDCollection,
        callback,
        shuffleDeck,
        shuffleHand,
        revealCallback,
        addCounter,
        removeCounter,
        duelistChat,
        spectatorChat,
        makeNewCard,
        removeCard,
        rollDie,
        flipCoin,
        offsetZone,
        surrender,
        generateSinglePlayerView,
        generateViewCount,
        generateView,
        getGroup,
        getState,
        players: {}, // holds socket references
        spectator: {}, // holds socket references
        rematch,
        rematchAccept: 0,
        sideAccept: 0,
        setNames,
        getStack,
        setTurnPlayer,
        answerListener,
        question,
        retryLastQuestion,
        respond,
        rps: rps,
        generateUpdateView,
        ygoproUpdate,
        getField
    };
}

module.exports = init;

/** Usage

makegameState = require('./state.js');

state = makegameState(function(view, stack){
    updateplayer1(view.player1);
    updateplayer2(view.player1);
    updatespectator(view.specators);
    savegameforlater(stack;)
});


state.startDuel(player1, player2, );

**/
