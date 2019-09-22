// You should be drinking scotch and listening to german electronica while reading this.

/**
 * @file Creates instances of game state, and methods of manipulating them.
 */

/**
 * @typedef {Object} Pile
 * @property {String} type Card/Token/Etc
 * @property {String} movelocation 'DECK'/'EXTRA' etc, in caps. 
 * @property {Number} player player int 0,1, etc of controlling player
 * @property {Number} originalController  player int 0,1, etc of owner
 * @property {Number} index  sequence of the card in the stack group. Example, nth card of DECK.
 * @property {Number} unique unique ID of the card
 * @property {Number} id   passcode of the card
 * @property {Object} counters  counters on the card
 * @property {Number} overlayIndex  counters on the card
 * @property {String} position Faceup, Facedown, etc
 */

/**
 * @typedef  {Object} FieldView
 * @property {Pile[]} DECK Cards in the deck of one player.
 * @property {Pile[]} HAND Cards in the hand of one player.
 * @property {Pile[]} GRAVE Cards in the graveyard "GY" of one player.
 * @property {Pile[]} EXTRA Cards in the extra deck of one player.
 * @property {Pile[]} BANISHED Cards BANISHED from play,"Banished" of one player.
 * @property {Pile[]} SPELLZONE Cards in the spell and pendulum zones of one player.
 * @property {Pile[]} MONSTERZONE Cards in the Main Monster zones and Extra Monster zone of one player.
 * @property {Pile[]} EXCAVATED Cards Excavated by one player atm, or held.
 * @property {Pile[]} INMATERIAL Tokens removed from the board after being created.
 */

/**
 * @typedef {Object} GameState
 * @property {Number} turn Current total turn count
 * @property {Number} turnOfPlayer player int, 0, 1, etc that is currently making moves
 * @property {Array.<Number>} lifepoints LP count of all players
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
 * @property {UIPayloadUnit} spectators
 */

/**
 * @typedef {Function} UICallback callback of initiation module, shoots directly to UI.
 * @param {UIPayload} view view of the field
 * @param {Pile[]} payload updated cards
 * @param {Function(Card[]))} }
 */


/**
 * @typedef  {Object} FieldCoordinate
 * @property {Number} uid   Unique card identifier in this game
 * @property {Number} player current player int 0,1, etc of controlling player
 * @property {String} location current location of the target card 'DECK'/'EXTRA' etc, in caps. 
 * @property {Number} index  current sequence of the card in the stack group. Example, nth card of DECK. in the current location
 * @property {Number} code passcode of the card
 */

const EventEmitter = require('events'), // a way to "notice" things occuring
    uniqueIdenifier = require('uuid/v1'); // time based unique identifier, RFC4122 version 1


/**
* Sort function, sorts by card index
* @param   {Pile}   first  card Object
* @param   {Pile}   second card Object
* @returns {Number}  if it comes before or after
*/
function sortByIndex(first, second) {
    return first.index - second.index;
}

/**
 * Filters out cards based on if they are a specific UID
 * @param {Pile[]} stack a stack of cards attached to a single monster as overlay units.
 * @param {Number} uid unique identifier
 * @returns {Boolean} if a card is that UID
 */
function getByUID(stack, uid) {
    const list = stack.render;
    return list.filter(function (item) {
        return item.uid === uid;
    });
}

class Pile {
    constructor(movelocation, player, index, uuid, code) {
        this.player = player;
        this.location = movelocation;
        this.index = index;
        this.position = 'FaceDown';
        this.uid = uuid;
        this.originalcontroller = player;
        this.counters = 0;
        this.list = [{ code, uuid }];
    }

    get render() {
        return this.list.map((card) => {
            const copy = Object.assign({}, this);
            delete copy.list;
            return Object.assign({}, copy, card);
        });
    }

    attach(card, sequence) {
        this.list.splice(sequence, 0, card);
    }

    detach(sequence) {
        const card = this.splice(sequence, 1)[0];

        return card;
    }
}

class Field {
    constructor() {
        this.stack = [];
    }

    get cards() {
        return this.stack.reduce((output, pile) => {
            output.concat(pile.render);
            return output;
        }, []);
    }

    get length() {
        return this.cards.length;
    }

    find(query) {
        return this.stack.find((pile) => {
            return (
                pile.player === query.player
                && pile.location === query.location
                && pile.index === query.index);
        });
    }

    add(movelocation, player, index, code = 0) {
        const uuid = uniqueIdenifier();
        this.stack.push(new Pile(movelocation, player, index, uuid, code));
    }

    remove(query) {
        const card = this.find(query);
        card.location = 'INMATERIAL';
    }

    move(previous, current) {

        const pile = this.find(previous);

        if (current.location === 'GRAVE' || current.location === 'BANISHED') {
            current.player = pile.originalcontroller;
        }


        pile.player = current.player;
        pile.location = current.location;
        pile.index = current.index;
        pile.position = current.position;

        if (current.code !== undefined) {
            pile.cards[0].code = current.code;
        }

        if (pile.location === 'HAND') {
            pile.position = 'FaceUp';
        }

        this.reIndex(current.player, 'GRAVE');
        this.reIndex(current.player, 'HAND');
        this.reIndex(current.player, 'EXTRA');
        this.reIndex(current.player, 'EXCAVATED');

        this.cleanCounters();
    }

    detach(previous, sequence, current) {
        const parent = this.find(previous),
            card = parent.detach(sequence),
            original = getByUID(this.stack.render, card.uid);

        original.attach(card);
        this.move(original, current);
    }

    attach(previous, current) {
        const parent = this.find(previous),
            card = parent.detach(0);

        current.attach(card);
    }

    take(previous, sequence, current) {
        const donor = this.find(previous),
            card = donor.detach(sequence),
            recipient = this.find(current);

        recipient.attach(card);
    }

    rankUp(previous, current) {
        const target = this.find(current),
            materials = this.find(previous);

        target.cards = target.cards.concat(materials.cards);
        materials.cards = [];
    }

    addCounter(query, type, amount) {
        const card = this.find(query);
        if (!card.counters[type]) {
            card.counters[type] = 0;
        }
        card.counters[type] += amount;
    }

    cleanCounters() {
        const list = this.stack.find((pile) => {
            return (
                pile.location === 'DECK'
                || pile.location === 'HAND'
                || pile.location === 'EXTRA'
                || pile.location === 'GRAVE'
                || pile.location === 'BANISHED'
            );
        });
        list.forEach((pile) => {
            pile.counters = {};
        });
    }
}

/**
 * Filters out cards based on player.
 * @param {Pile[]} stack Array a stack of cards.
 * @param {Number} player player int 0,1, etc0 or 1
 * @returns {Pile[]} a stack of cards that belong to only one specified player. 
 */
function filterPlayer(stack, player) {
    return stack.filter(function (item) {
        return item.player === player;
    });
}

/**
 * Filters out cards based on zone.
 * @param {Pile[]} stack a stack of cards.
 * @param {String} location zone the card is in.
 * @returns {Pile[]} a stack of cards that are in only one location/zone.
 */
function filterlocation(stack, location) {
    return stack.filter(function (item) {
        return item.location === location;
    });
}

/**
 * Changes a view of cards so the opponent can not see what they are.
 * @param   {Pile[]} view a collection of cards
 * @returns {Pile[]} a collection of cards
 */
function hideViewOfZone(view) {
    var output = [];
    view.forEach(function (card, index) {
        output[index] = {};
        Object.assign(output[index], card);
        if (output[index].position === 'FaceDown' || output[index].position === 'FaceDownDefence' || output[index].position === 'FaceDownDefense') {
            output[index].id = 0;
            output[index].counters = {};
            delete output[index].originalcontroller;
        }
    });

    return output;
}

/**
 * Changes a view of cards so the opponent can not see what they are.
 * @param   {Pile[]} view a collection of cards
 * @param   {Boolean} allowed is the player allowed to see the card?
 * @returns {Pile[]} a collection of cards
 */
function hideViewOfExtra(view, allowed) {
    var output = [];
    view.forEach(function (card, index) {
        output[index] = {};
        Object.assign(output[index], card);
        if (output[index].position === 'FaceUpAttack') {
            output[index].id = (allowed) ? output[index].id : 0;
        }
    });

    return output;
}


/**
 * Changes a view of cards in the hand so the opponent can not see what they are.
 * @param   {Pile[]} view a collection of cards
 * @returns {Pile[]} a collection of cards
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


class Game {

    constructor(callback) {
        if (typeof callback !== 'function') {
            throw new Error('UI Output Callback required');
        }

        this.callback = callback;
        this.answerListener = new EventEmitter();
        this.lastQuestion = {};
        this.stack = new Field();
        this.addCard = this.stack.add;
        this.removeCard = this.stack.remove;
        this.moveCard = this.stack.move;
        this.attach = this.stack.attach;
        this.detach = this.stack.detach;
        this.take = this.stack.take;
        this.rankUp = this.stack.rankUp;
        this.previousStack = [];
        this.outstack = [];
        this.names = ['', ''];
        this.lock = [false, false];
        this.round = [];
        this.state = {
            turn: 0,
            turnOfPlayer: 0,
            phase: 0,
            lifepoints: [
                8000,
                8000
            ]
        };
        this.decks = {
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
    }

    getState() {
        return Object.assign(this.info, {
            names: this.names,
            stack: this.stack
        });
    }

    /**
     * Set a username to a specific slot on lock in.
     * @public
     * @param {any} slot Index in names
     * @param {any} username name of the player
     * @returns {undefined}
     */
    setNames(slot, username) {
        this.names[slot] = username;
    }

    findUIDCollection(uid) {
        return getByUID(this.stack.cards, uid);
    }

    findUIDCollectionPrevious(uid) {
        return getByUID(this.previousStack, uid);
    }

    filterEdited(cards) {
        return cards.filter(function (card) {
            var newCards = this.findUIDCollection(card.uid)[0],
                oldCards = this.findUIDCollectionPrevious(card.uid)[0] || {};
            return !Object.keys(newCards).every(function (key) {
                return newCards[key] === oldCards[key];
            });
        });
    }

    /**
     * Generate the view of the field, for use by YGOPro MSG_UPDATE_DATA to get counts.
     * @param   {Number} player player int 0,1, etcthe given player
     * @returns {Object} all the cards the given player can see on their side of the field.
     */
    generateViewCount(player) {
        var playersCards = filterPlayer(this.stack.cards, player),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterlocation(playersCards, 'EXTRA'),
            banished = filterlocation(playersCards, 'BANISHED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE'),
            onfield = filterlocation(playersCards, 'ONFIELD');
        return {
            DECK: deck.length,
            HAND: hand.length,
            GRAVE: grave.length,
            EXTRA: extra.length,
            BANISHED: banished.length,
            SPELLZONE: spellzone.length,
            MONSTERZONE: monsterzone.length,
            ONFIELD: onfield.length
        };
    }
    /**
     * Generate the view of the field, for use by YGOPro MSG_UPDATE_DATA to update data.
     * @param   {Number} player player int 0,1, etcthe given player
     * @returns {Object} all the cards the given player can see on their side of the field.
     */
    generateUpdateView(player) {
        var playersCards = filterPlayer(this.stack.cards, player),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterlocation(playersCards, 'EXTRA'),
            BANISHED = filterlocation(playersCards, 'BANISHED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE'),
            onfield = filterlocation(playersCards, 'ONFIELD');

        return {
            DECK: deck.sort(sortByIndex),
            HAND: hand.sort(sortByIndex),
            GRAVE: grave.sort(sortByIndex),
            EXTRA: extra.sort(sortByIndex),
            BANISHED: BANISHED.sort(sortByIndex),
            SPELLZONE: spellzone.sort(sortByIndex),
            MONSTERZONE: monsterzone.sort(sortByIndex),
            ONFIELD: onfield.sort(sortByIndex)
        };
    }

    /**
     * Generate the view for a specific given player
     * @param   {Number} player player int 0,1, etcthe given player
     * @returns {Object} all the cards the given player can see on their side of the field.
     */
    generateSinglePlayerView(player) {
        var playersCards = this.filterEdited(filterPlayer(this.stack.cards, player)),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterlocation(playersCards, 'EXTRA'),
            banished = filterlocation(playersCards, 'BANISHED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE'),
            excavated = filterlocation(playersCards, 'EXCAVATED'),
            inmaterial = filterlocation(playersCards, 'INMATERIAL'),
            onfield = filterlocation(playersCards, 'ONFIELD');

        return {
            DECK: hideViewOfZone(deck),
            HAND: hand,
            GRAVE: grave,
            EXTRA: hideViewOfExtra(extra, true),
            BANISHED: banished,
            SPELLZONE: spellzone,
            MONSTERZONE: monsterzone,
            EXCAVATED: excavated,
            INMATERIAL: inmaterial,
            ONFIELD: onfield
        };
    }

    /**
     * Generate the view for a spectator or opponent
     * @param   {Number} player player int 0,1, etcthe given player
     * @returns {Object} all the cards the given spectator/opponent can see on that side of the field.
     */
    generateSinglePlayerSpectatorView(player) {
        var playersCards = this.filterEdited(filterPlayer(this.stack.cards, player)),
            deck = filterlocation(playersCards, 'DECK'),
            hand = filterlocation(playersCards, 'HAND'),
            grave = filterlocation(playersCards, 'GRAVE'),
            extra = filterlocation(playersCards, 'EXTRA'),
            banished = filterlocation(playersCards, 'BANISHED'),
            spellzone = filterlocation(playersCards, 'SPELLZONE'),
            monsterzone = filterlocation(playersCards, 'MONSTERZONE'),
            excavated = filterlocation(playersCards, 'EXCAVATED'),
            inmaterial = filterlocation(playersCards, 'INMATERIAL'),
            onfield = filterlocation(playersCards, 'ONFIELD');

        return {
            DECK: hideViewOfZone(deck),
            HAND: hideHand(hand),
            GRAVE: grave,
            EXTRA: hideViewOfExtra(extra, false),
            BANISHED: hideViewOfZone(banished),
            SPELLZONE: hideViewOfZone(spellzone),
            MONSTERZONE: hideViewOfZone(monsterzone),
            EXCAVATED: hideViewOfZone(excavated),
            INMATERIAL: inmaterial,
            onfield: onfield
        };
    }

    /**
     * Generate a full view of the field for a spectator.
     * @returns {Pile[]} complete view of the current field based on the stack.
     */
    generateSpectatorView() {
        return [
            this.generateSinglePlayerSpectatorView(0),
            this.generateSinglePlayerSpectatorView(1)
        ];
    }

    /**
     * Generate a full view of the field for a Player 1.
     * @returns {Pile[]} complete view of the current field based on the stack.
     */
    generatePlayer1View() {
        return [
            this.generateSinglePlayerView(0),
            this.generateSinglePlayerSpectatorView(1)
        ];
    }

    /**
     * Generate a full view of the field for a Player 2.
     * @returns {Pile[]} complete view of the current field based on the stack.
     */
    generatePlayer2View() {
        return [
            this.generateSinglePlayerSpectatorView(0),
            this.generateSinglePlayerView(1)
        ];
    }

    /**
     * Generate a full view of the field for all view types.
     * @param {string} action callback case statement this should trigger, defaults to 'duel'.
     * @returns {Object} complete view of the current field based on the stack for every view type.
     */
    generateView(action) {
        if (action === 'start') {
            this.previousStack = [];
        }
        var output = {
            names: this.names,
            p0: {
                duelAction: action || 'duel',
                info: this.state,
                field: this.generatePlayer1View(),
                player: 0
            },
            p1: {
                duelAction: action || 'duel',
                info: this.state,
                field: this.generatePlayer2View(),
                player: 1
            },
            spectators: {
                duelAction: action || 'duel',
                info: this.state,
                field: this.generateSpectatorView()
            }
        };
        this.previousStack = JSON.parse(JSON.stringify(this.stack.cards));
        return output;
    }

    ygoproUpdate() {
        this.callback(this.generateView(), this.stack.cards);
    }

    /**
     * Creates a new card outside of initial start
     * @param {String} location     zone the card can be found in.
     * @param {Number} controller   player the card can be found under
     * @param {Number} sequence     exact index of card in the zone
     * @param {Number} position     position the card needs to be in   
     * @param {Number} code         passcode
     * @param {Number} index        index/sequence in the zone the card needs to become.
     * @returns {undefined}            
     */
    makeNewCard(location, controller, sequence, position, code, index) {
        this.stack.add({
            player: controller,
            location,
            controller,
            position,
            code,
            index
        });
        this.callback(this.generateView('newCard'), this.stack.cards);
    }


    /**
     * Finds a specific card and puts a counter on it.
     * @param {FieldCoordinate} query info to find the card
     * @param {String} type name of the counter
     * @param {Number} amount how many counters to add
     * @returns {undefined}
     */
    addCounter(query, type, amount) {
        this.field.addCounter(query, type, amount);
    }

    /**
     * Finds a specific card and remove a counter from it.
     * @param {FieldCoordinate} query info to find the card
     * @param {String} type name of the counter
     * @param {Number} amount how many counters to add
     * @return {undefined}
     */
    removeCounter(query, type, amount) {
        this.field.addCounter(query, type, (-1 * amount));
    }

    /**
     * Draws a card, updates state.
     * @param {Number} player           player indicator 0,1, etc       Player drawing the cards
     * @param {Number} numberOfCards    number of cards drawn
     * @param {Number[]} cards          passcodes of drawn cards
     * @param {Function} drawCallback   callback used by automatic
     * @returns {undefined}
     */
    drawCard(player, numberOfCards, cards, drawCallback) {
        var currenthand = filterlocation(filterPlayer(this.stack.cards, player), 'HAND').length,
            topcard,
            deck;

        for (let i = 0; i < numberOfCards; i += 1) {
            deck = filterlocation(filterPlayer(this.stack.cards, player), 'DECK');
            topcard = deck[deck.length - 1];
            this.stack.move({
                player: topcard.player,
                clocation: 'DECK',
                index: topcard.index
            }, {
                    player,
                    location: 'HAND',
                    index: currenthand + i,
                    position: 'FaceUp',
                    id: cards[i].id || topcard.id
                });
        }

        this.callback(this.generateView(), this.stack.cards);
        if (typeof drawCallback === 'function') {
            drawCallback();
        }
    }


    /**
     * Triggers a callback that reveals the given array of cards to end users.
     * @param {Pile[]} reference reveal array of cards
     * @param {Number} player player int 0,1, etc
     * @param {function} call second callback
     * @returns {undefined}
     */
    revealCallback(reference, player, call) {
        var reveal = [];
        reference.forEach(function (card, index) {
            reveal.push(Object.assign({}, card));
            reveal[index].position = 'FaceUp'; // make sure they can see the card and all data on it.
        });
        this.callback({
            p0: {
                duelAction: 'reveal',
                info: this.state,
                reveal: reveal,
                call: call,
                player: player
            },
            p1: {
                duelAction: 'reveal',
                info: this.state,
                reveal: reveal,
                call: call,
                player: player
            },
            sepectators: {
                duelAction: 'reveal',
                info: this.state,
                reveal: reveal,
                call: call,
                player: player
            }
        }, this.stack.cards);
    }

    /**
     * Start side decking.
     * @return {undefined}
     */
    startSide() {
        this.stack = [];
        this.decks = {
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
    validateDeckAgainstPrevious(player, deck) {
        var previous = [],
            current = [];


        // If there is no deck, then this deck is ok to use, because we will need it.
        if (this.decks[player].main.length === 0) {
            return true;
        }

        previous.concat(
            this.round[0][player].main,
            this.round[0][player].extra,
            this.round[0][player].side
        );
        current.concat(deck.main, deck.extra, deck.side);

        previous.sort();
        current.sort();

        return (JSON.stringify(current) === JSON.stringify(previous));
    }

    /**
     * Exposed method to initialize the field; You only run this once.
     * @param {Object} player1 player instance
     * @param {Object} player2 player instance
     * @param {Boolean} manual if using manual, or automatic
     * @returns {undefined}
     */
    startDuel(player1, player2, manual) {
        this.stack = [];
        if (manual && !this.lock[0] && !this.lock[1]) {
            return;
        }

        this.round.push(player1, player2);
        this.lock[0] = false;
        this.lock[1] = false;

        this.state.lifepoints = {
            0: 8000,
            1: 8000
        };

        player1.main.forEach(function (card, index) {
            this.stack.add('DECK', 0, index, this.stack.length, card);
        });
        player2.main.forEach(function (card, index) {
            this.stack.add('DECK', 1, index, this.stack.length, card);
        });

        player1.extra.forEach(function (card, index) {
            this.stack.add('EXTRA', 0, index, this.stack.length, card);
        });
        player2.extra.forEach(function (card, index) {
            this.stack.add('EXTRA', 1, index, this.stack.length, card);
        });

        this.callback(this.generateView('start'), this.stack.cards);
    }

    /**
     * Returns a COPY of all the cards in the game.
     * @returns {Pile[]} collection of cards
     */
    getStack() {
        return JSON.parse(JSON.stringify(this.stack.cards));
    }


    /**
     * moves game to next phase.
     * @param {Number} phase enumeral
     * @returns {undefined}
     */
    nextPhase(phase) {
        this.state.phase = phase;
        this.callback(this.generateView(), this.stack.cards);
    }

    /**
     * Shifts the game to the start of the next turn and shifts the active player.
     * @returns {undefined}
     */
    nextTurn() {
        this.state.turn += 1;
        this.state.phase = 0;
        this.state.turnOfPlayer = (this.state.turnOfPlayer === 0) ? 1 : 0;
        this.callback(this.generateView(), this.stack.cards);
    }

    announcement(player, message) {
        const slot = 'p' + player,
            output = {
                names: this.names,
                p0: {},
                p1: {},
                spectators: {}
            };
        output[slot] = {
            duelAction: 'announcement',
            message
        };
        this.callback(output, this.stack.cards);
    }

    /**
     * Change lifepoints of a player
     * @param {Number} player player int 0,1, etcplayer to edit
     * @param {Number} amount amount of lifepoints to take or remove.
     * @param {String} username name of player being viewed.
     * @return {undefined}
     */
    changeLifepoints(player, amount) {
        this.state.lifepoints[player] = this.state.lifepoints[player] + amount;
        this.callback(this.generateView(), this.stack.cards);
    }

    /**
     * Send a question to the player
     * @param {Number} slot player
     * @param {String} type question typing
     * @param {Object[]} options information about the question
     * @param {Number} answerLength how many answers 
     * @param {Function} onAnswerFromUser callback function
     * @return {undefined}
     */
    question(slot, type, options, answerLength, onAnswerFromUser) {

        // Create a mock view to populate with information so it gets sent to the right place.

        var uuid = uniqueIdenifier(),
            output = {
                names: this.names,
                p0: {},
                p1: {},
                spectators: {}
            };
        this.lastQuestion = {
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
        this.answerListener.once(uuid, function (data) {
            onAnswerFromUser(data);
        });
        this.callback(output, this.stack.cards);
    }

    /**
     * Answer a queued up question
     * @param {Object} message response message
     * @returns {undefined}
     */
    respond(message) {
        this.answerListener.emit(message.uuid, message.answer);
    }

    retrylastQuestion() {
        console.log('retrying', this.lastQuestion.slot, this.lastQuestion.type, this.lastQuestion.options, this.lastQuestion.answerLength, this.lastQuestion.onAnswerFromUser);
        this.question(this.lastQuestion.slot, this.lastQuestion.type, this.lastQuestion.options, this.lastQuestion.answerLength, this.lastQuestion.onAnswerFromUser);
    }

}

module.exports = Game;