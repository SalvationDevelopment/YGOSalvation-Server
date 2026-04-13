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
 * @property {UIPayloadUnit} spectator
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

const deckPiles = ['DECK', 'HAND', 'EXTRA', 'BANISHED'],
    EventEmitter = require('events'), // a way to "notice" things occuring
    { randomUUID } = require("crypto"),
    uniqueIdenifier = randomUUID;


/**
 * Sorts by index used by the model automatic field module.
 * @param {Object} first The first object supplies the structured input used by the model automatic field module, including the `state` property.
 * @param {Object} first.state The `state` property supplies structured input used by the model automatic field module.
 * @param {number} first.state.index The `state.index` property supplies structured input used by the model automatic field module.
 * @param {Object} second The second object supplies the structured input used by the model automatic field module, including the `state` property.
 * @param {Object} second.state The `state` property supplies structured input used by the model automatic field module.
 * @param {number} second.state.index The `state.index` property supplies structured input used by the model automatic field module.
 * @returns {number} Returns the value produced by the model automatic field module.
 */
function sortByIndex(first, second) {
    return first.state.index - second.state.index;
}

/**
 * Gets by uid used by the model automatic field module.
 * @param {Array} stack The stack array supplies the ordered values used by the model automatic field module, each item uses the `uid` property.
 * @param {string} stack[].uid The `[].uid` property describes data read from each item used by the model automatic field module.
 * @param {string} uid The uid value provides an input used by the model automatic field module.
 * @returns {Array} Returns the value produced by the model automatic field module.
 */
function getByUID(stack, uid) {
    return stack.find(function (item) {
        return item.uid === uid;
    });
}

/**
 * Gets by origin used by the model automatic field module.
 * @param {Array} stack The stack array supplies the ordered values used by the model automatic field module, each item uses the `state` property.
 * @param {Object} stack[].state The `[].state` property describes data read from each item used by the model automatic field module.
 * @param {string} stack[].state.origin The `[].state.origin` property describes data read from each item used by the model automatic field module.
 * @param {string} uid The uid value provides an input used by the model automatic field module.
 * @returns {Array} Returns the value produced by the model automatic field module.
 */
function getByOrigin(stack, uid) {
    return stack.find(function (item) {
        return item.state.origin === uid;
    });
}

/**
 * Executes the pile helper used by the model automatic field module.
 * @param {string} movelocation The movelocation value provides an input used by the model automatic field module.
 * @param {number} player The player value provides an input used by the model automatic field module.
 * @param {number} index The index value provides an input used by the model automatic field module.
 * @param {string} uid The uid value provides an input used by the model automatic field module.
 * @param {string} id The id value provides an input used by the model automatic field module.
 * @returns {Object} Returns the value produced by the model automatic field module.
 */
function Pile(movelocation, player, index, uid, id) {
    const state = {
        player: player,
        location: movelocation,
        index: index,
        position: 'FaceDown',
        counters: 0,
        cardTarget: undefined,
        equipCard: undefined,
        origin: uid,
        list: [{ id, uid, list: [], originalcontroller: player }]
    };

            /**
     * Executes the render helper used by the model automatic field module.
     * @returns {Array} Returns the value produced by the model automatic field module.
     */
    function render() {
        const { list, ...sharedState } = state;

        return state.list.reduce((output, card, overlayindex) => {
            output.push(Object.assign({ overlayindex }, sharedState, card));
            return output;
        }, []);
    }

            /**
     * Executes the attach helper used by the model automatic field module.
     * @param {Object} card The card value provides an input used by the model automatic field module.
     * @param {number} sequence The sequence value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function attach(card, sequence) {
        state.list.splice(sequence, 0, card);
    }

            /**
     * Executes the detach helper used by the model automatic field module.
     * @param {number} sequence The sequence value provides an input used by the model automatic field module.
     * @returns {Array} Returns the value produced by the model automatic field module.
     */
    function detach(sequence) {
        const card = state.list.splice(sequence, 1)[0];
        return card;
    }

            /**
     * Executes the update helper used by the model automatic field module.
     * @param {Object} data The data value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function update(data) {
        if (!data) {
            return;
        }
        Object.assign(state, data);
    }

    return {
        attach,
        detach,
        render,
        update,
        state
    };
}

/**
 * Executes the field helper used by the model automatic field module.
 * @returns {Object} Returns the value produced by the model automatic field module.
 */
function Field() {
    const stack = [],
        lookup = {},
        pendingOverlayHosts = new Map();

            /**
     * Executes the cards helper used by the model automatic field module.
     * @returns {Array} Returns the value produced by the model automatic field module.
     */
    function cards() {
        return stack.reduce((output, pile) => {
            output = output.concat(pile.render());
            return output;
        }, []);
    }

            /**
     * Executes the length helper used by the model automatic field module.
     * @returns {number} Returns the value produced by the model automatic field module.
     */
    function length() {
        return stack.length;
    }

            /**
     * Executes the search helper used by the model automatic field module.
     * @param {Object} query The query object supplies the structured input used by the model automatic field module, including the `index`, `location`, and `player` properties.
     * @param {number} query.index The `index` property supplies structured input used by the model automatic field module.
     * @param {(string|number)} query.location The `location` property supplies structured input used by the model automatic field module.
     * @param {number} query.player The `player` property supplies structured input used by the model automatic field module.
     * @returns {Array} Returns the value produced by the model automatic field module.
     */
    function search(query) {
        const code = query.player + query.location + query.index,
            card = (lookup[code]?.state?.list?.length ? lookup[code] : undefined) || stack.find((pile) => {
                return (
                    pile?.state?.list?.length
                    && pile.state.player === query.player
                    && pile.state.location === query.location
                    && pile.state.index === query.index);
            });
        return card;
    }

    function queuePendingOverlayAttach(materialPile, hostPile) {
        const hostOrigin = hostPile?.state?.origin,
            materialOrigin = materialPile?.state?.origin;

        if (!hostOrigin || !materialOrigin) {
            return;
        }

        const queued = pendingOverlayHosts.get(hostOrigin) || [];
        queued.push(materialOrigin);
        pendingOverlayHosts.set(hostOrigin, queued);
    }

    function flushPendingOverlayAttach(hostPile) {
        const hostOrigin = hostPile?.state?.origin,
            queued = pendingOverlayHosts.get(hostOrigin) || [];

        if (!hostOrigin || !queued.length) {
            return;
        }

        queued.forEach((materialOrigin) => {
            const materialPile = getByOrigin(stack, materialOrigin);

            if (!materialPile?.state?.list?.length) {
                return;
            }

            hostPile.state.list.push(materialPile.state.list.shift());
        });

        pendingOverlayHosts.delete(hostOrigin);
        updateIndex();
    }

    function clearPendingOverlay(origin) {
        if (!origin) {
            return;
        }

        pendingOverlayHosts.delete(origin);
        pendingOverlayHosts.forEach((queued, hostOrigin) => {
            const nextQueued = queued.filter((queuedOrigin) => queuedOrigin !== origin);

            if (nextQueued.length) {
                pendingOverlayHosts.set(hostOrigin, nextQueued);
            } else {
                pendingOverlayHosts.delete(hostOrigin);
            }
        });
    }

            /**
     * Executes the add helper used by the model automatic field module.
     * @param {string} movelocation The movelocation value provides an input used by the model automatic field module.
     * @param {number} player The player value provides an input used by the model automatic field module.
     * @param {number} index The index value provides an input used by the model automatic field module.
     * @param {string} code The code value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function add(movelocation, player, index, code = 'unknown') {
        const uuid = uniqueIdenifier();
        stack.push(new Pile(movelocation, player, index, uuid, code));
    }

            /**
     * Executes the remove helper used by the model automatic field module.
     * @param {Object} query The query value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function remove(query) {
        const overlaySequence = Number.isInteger(query?.overlay_sequence)
                ? query.overlay_sequence + 1
                : Number.isInteger(query?.overlayindex)
                    ? query.overlayindex
                    : null;

        if (Number.isInteger(overlaySequence)) {
            const parent = search(query);
            if (!parent || typeof parent.detach !== 'function') {
                return;
            }
            parent.detach(overlaySequence);
            updateIndex();
            return;
        }

        pruneCardReferences(query);

        const card = search(query),
            removeIndex = stack.indexOf(card);

        if (removeIndex < 0) {
            return;
        }

        clearPendingOverlay(card?.state?.origin);
        stack.splice(removeIndex, 1);
        updateIndex();
    }

            /**
     * Executes the clean counters helper used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function cleanCounters() {
        const list = stack.filter((pile) => {
            return (
                pile.state.location === 'DECK'
                || pile.state.location === 'HAND'
                || pile.state.location === 'EXTRA'
                || pile.state.location === 'GRAVE'
                || pile.state.location === 'BANISHED'
            );
        });
        list.forEach((pile) => {
            pile.state.counters = {};
        });
    }

    function normalizeCoordinateReference(query) {
        if (!query || typeof query !== 'object') {
            return null;
        }

        const player = Number.isInteger(query.player)
                ? query.player
                : Number.isInteger(query.controller)
                    ? query.controller
                    : null,
            location = query.location,
            index = Number.isInteger(query.index)
                ? query.index
                : Number.isInteger(query.sequence)
                    ? query.sequence
                    : null;

        if (!Number.isInteger(player) || typeof location !== 'string' || !Number.isInteger(index)) {
            return null;
        }

        const output = {
            player,
            location,
            index
        };

        if (Number.isInteger(query.overlay_sequence)) {
            output.overlay_sequence = query.overlay_sequence;
            output.overlayindex = query.overlay_sequence + 1;
        } else if (Number.isInteger(query.overlayindex) && query.overlayindex > 0) {
            output.overlay_sequence = query.overlayindex - 1;
            output.overlayindex = query.overlayindex;
        }

        return output;
    }

    function coordinateMatches(primary, secondary) {
        const first = normalizeCoordinateReference(primary),
            second = normalizeCoordinateReference(secondary);

        if (!first || !second) {
            return false;
        }

        return (
            first.player === second.player
            && first.location === second.location
            && first.index === second.index
            && (first.overlay_sequence ?? null) === (second.overlay_sequence ?? null)
        );
    }

    function pruneCardReferences(query) {
        const reference = normalizeCoordinateReference(query);

        if (!reference) {
            return;
        }

        stack.forEach((pile) => {
            if (!pile?.state) {
                return;
            }

            const nextState = {},
                targets = Array.isArray(pile.state.cardTarget)
                    ? pile.state.cardTarget
                        .map(normalizeCoordinateReference)
                        .filter(Boolean)
                    : [];
            let dirty = false;

            if (coordinateMatches(pile.state, reference)) {
                if (pile.state.cardTarget !== undefined) {
                    nextState.cardTarget = undefined;
                    dirty = true;
                }
                if (pile.state.equipCard !== undefined) {
                    nextState.equipCard = undefined;
                    dirty = true;
                }
            }

            if (targets.length) {
                const filtered = targets.filter((target) => !coordinateMatches(target, reference));
                if (filtered.length !== targets.length) {
                    nextState.cardTarget = filtered.length ? filtered : undefined;
                    dirty = true;
                }
            }

            if (pile.state.equipCard && coordinateMatches(pile.state.equipCard, reference)) {
                nextState.equipCard = undefined;
                dirty = true;
            }

            if (dirty) {
                pile.update(nextState);
            }
        });
    }

            /**
     * Updates index used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function updateIndex() {
        Object.keys(lookup).forEach((key) => {
            delete lookup[key];
        });
        stack.forEach((card) => {
            var code = card.state.player + card.state.location + card.state.index;
            lookup[code] = (card.state.list.length) ? card : undefined;
        });
    }
            /**
     * Executes the re index helper used by the model automatic field module.
     * @param {number} player The player value provides an input used by the model automatic field module.
     * @param {string} location The location value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function reIndex(player, location) {
        const zone = stack.filter((pile) => {
            return (pile.state.player === player && pile.state.location === location);
        });

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

        zone.forEach(function (pile, index) {
            pile.state.index = index;
        });

        stack.sort(sortByIndex);
        updateIndex();
    }



            /**
     * Executes the move helper used by the model automatic field module.
     * @param {Object} previous The previous value provides an input used by the model automatic field module.
     * @param {Object} current The current object supplies the structured input used by the model automatic field module, including the `id`, `index`, `location`, `player`, and `position` properties.
     * @param {string} current.id The `id` property supplies structured input used by the model automatic field module.
     * @param {number} current.index The `index` property supplies structured input used by the model automatic field module.
     * @param {string} current.location The `location` property supplies structured input used by the model automatic field module.
     * @param {number} current.player The `player` property supplies structured input used by the model automatic field module.
     * @param {string} current.position The `position` property supplies structured input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function move(previous, current) {
        const pile = search(previous);
        if (!pile) {
            console.log('error', previous, current);
        }

        pruneCardReferences(previous);

        pile.state.player = current.player;
        pile.state.location = current.location;
        pile.state.index = current.index;
        pile.state.position = current.position;

        if (pile.state.list[0].id !== undefined && current.id !== undefined) {
            pile.state.list[0].id = current.id;
        }

        if (pile.state.location === 'HAND') {
            pile.state.position = 'FaceUp';
        }

        if (pile.state.location === 'MONSTERZONE') {
            flushPendingOverlayAttach(pile);
        }

        reIndex(current.player, 'GRAVE');
        reIndex(current.player, 'HAND');
        reIndex(current.player, 'EXTRA');
        reIndex(current.player, 'EXCAVATED');

        cleanCounters();
    }

            /**
     * Executes the detach helper used by the model automatic field module.
     * @param {Object} previous The previous value provides an input used by the model automatic field module.
     * @param {number} sequence The sequence value provides an input used by the model automatic field module.
     * @param {Object} current The current value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function detach(previous, sequence, current) {
        const parent = search(previous),
            card = parent.detach(sequence),
            original = getByOrigin(stack, card.uid);

        original.state.list = [card];
        move(original.state, current);
    }

            /**
     * Executes the attach helper used by the model automatic field module.
     * @param {Object} previous The previous value provides an input used by the model automatic field module.
     * @param {Object} current The current value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function attach(previous, current) {
        const parent = search(previous),
            adopter = search(current);

        if (!parent || !adopter) {
            return;
        }

        if (adopter.state.location !== 'MONSTERZONE') {
            queuePendingOverlayAttach(parent, adopter);
            return;
        }

        adopter.state.list.push(parent.state.list.shift());
        updateIndex();
    }

            /**
     * Executes the take helper used by the model automatic field module.
     * @param {Object} previous The previous value provides an input used by the model automatic field module.
     * @param {number} sequence The sequence value provides an input used by the model automatic field module.
     * @param {Object} current The current value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function take(previous, sequence, current) {
        const donor = search(previous),
            card = donor.detach(sequence),
            recipient = search(current);

        recipient.attach(card);
        updateIndex();
    }

            /**
     * Executes the rank up helper used by the model automatic field module.
     * @param {Object} previous The previous value provides an input used by the model automatic field module.
     * @param {Object} current The current value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function rankUp(previous, current) {
        const target = search(current),
            materials = search(previous);

        target.cards = target.cards.concat(materials.cards);
        materials.cards = [];
    }

            /**
     * Executes the add counter helper used by the model automatic field module.
     * @param {Object} query The query value provides an input used by the model automatic field module.
     * @param {string} type The type value provides an input used by the model automatic field module.
     * @param {number} amount The amount value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function addCounter(query, type, amount) {
        const card = search(query);
        if (!card?.state) {
            return;
        }
        if (!card.state.counters[type]) {
            card.state.counters[type] = 0;
        }
        card.state.counters[type] += amount;
    }

    function addCardTarget(sourceQuery, targetQuery) {
        const source = search(sourceQuery),
            target = normalizeCoordinateReference(targetQuery);

        if (!source?.state || !target) {
            return;
        }

        const nextTargets = Array.isArray(source.state.cardTarget)
            ? source.state.cardTarget
                .map(normalizeCoordinateReference)
                .filter(Boolean)
            : [];

        if (!nextTargets.some((entry) => coordinateMatches(entry, target))) {
            nextTargets.push(target);
        }

        source.update({
            cardTarget: nextTargets.length ? nextTargets : undefined
        });
    }

    function removeCardTarget(sourceQuery, targetQuery) {
        const source = search(sourceQuery),
            target = normalizeCoordinateReference(targetQuery);

        if (!source?.state || !target || !Array.isArray(source.state.cardTarget)) {
            return;
        }

        const nextTargets = source.state.cardTarget
            .map(normalizeCoordinateReference)
            .filter(Boolean)
            .filter((entry) => !coordinateMatches(entry, target));

        source.update({
            cardTarget: nextTargets.length ? nextTargets : undefined
        });
    }

    function setEquipCard(sourceQuery, targetQuery) {
        const source = search(sourceQuery),
            target = normalizeCoordinateReference(targetQuery);

        if (!source?.state) {
            return;
        }

        source.update({
            equipCard: target || undefined
        });
    }

    function updateExtra(player, codes) {
        const extraCards = stack.filter((pile) =>
            pile.state.player === player
            && pile.state.location === 'EXTRA'
            && pile.state.position !== 'FaceUp'
        ).sort(sortByIndex);

        extraCards.forEach((pile, index) => {
            const code = Number(codes?.[index] || 0);

            if (pile.state.list[0]) {
                pile.state.list[0].id = code || 'unknown';
            }
        });
    }

    function updateDeckTop(message) {
        const player = Number(message?.player || 0),
            offset = Math.max(0, Number(message?.offset ?? message?.count ?? 0)),
            deckCards = stack
                .filter((pile) =>
                    pile.state.player === player
                    && pile.state.location === 'DECK'
                )
                .sort(sortByIndex),
            pile = deckCards[deckCards.length - 1 - offset],
            cardId = Number(message?.id ?? message?.code ?? 0) || 'unknown';

        if (!pile?.state?.list?.[0]) {
            return;
        }

        pile.state.list[0].id = cardId;
        pile.update({
            is_reversed: Boolean(message?.reversed)
        });
    }

    function shuffleSet(location, cards) {
        const movements = Array.isArray(cards) ? cards : [],
            assignments = movements.map((movement) => {
                const pile = search(movement.from);
                return pile ? {
                    pile,
                    to: movement.to
                } : null;
            }).filter(Boolean);

        assignments.forEach(({ pile, to }) => {
            pile.state.player = to.player;
            pile.state.location = to.location || location;
            pile.state.index = to.index;
            if (pile.state.list[0]) {
                pile.state.list[0].id = 'unknown';
            }
        });

        updateIndex();
    }

    function removeMany(cards) {
        const removals = Array.isArray(cards) ? cards : [];

        removals.forEach((query) => {
            remove(query);
        });
    }

    function clear() {
        stack.splice(0, stack.length);
        pendingOverlayHosts.clear();
        Object.keys(lookup).forEach((key) => {
            delete lookup[key];
        });
    }

    function applyCardHint(hint) {
        const pile = search(hint);
        if (!pile?.state) {
            return;
        }

        if (hint.card_hint === 'desc_add' || hint.card_hint === 'desc_remove') {
            const descriptionKey = String(hint.description ?? hint.description_text ?? ''),
                counts = Object.assign({}, pile.state.desc_hint_counts || {}),
                texts = Object.assign({}, pile.state.desc_hint_texts || {});

            if (hint.card_hint === 'desc_add') {
                counts[descriptionKey] = (counts[descriptionKey] || 0) + 1;
                if (hint.description_text) {
                    texts[descriptionKey] = hint.description_text;
                }
            } else if (counts[descriptionKey]) {
                counts[descriptionKey] -= 1;
                if (counts[descriptionKey] <= 0) {
                    delete counts[descriptionKey];
                    delete texts[descriptionKey];
                }
            }

            pile.update({
                desc_hint_counts: counts,
                desc_hint_texts: texts,
                desc_hints: Object.keys(texts).map((key) => texts[key]).filter(Boolean)
            });
            return;
        }

        pile.update({
            card_hint: hint.card_hint,
            card_hint_value: hint.description,
            card_hint_text: hint.hint_text || hint.description_text || ''
        });
    }

    function rebuildReload(snapshot) {
        clear();

        (snapshot?.players || []).forEach((playerState, player) => {
            (playerState?.monsters || []).forEach((card) => {
                if (!card) {
                    return;
                }

                add(card.location || 'MONSTERZONE', player, card.index, card.id || 'unknown');
                const pile = search(card);
                if (!pile) {
                    return;
                }

                pile.update({
                    position: card.position || 'FaceDown',
                    player,
                    location: card.location || 'MONSTERZONE',
                    index: card.index
                });

                const overlayCards = Array.isArray(card?.overlay_cards)
                        ? card.overlay_cards
                        : Array.isArray(card?.overlayCards)
                            ? card.overlayCards
                            : [],
                    overlayCount = Math.max(Number(card.materials || 0), overlayCards.length);

                for (let overlayIndex = 0; overlayIndex < overlayCount; overlayIndex += 1) {
                    pile.state.list.push({
                        id: overlayCards[overlayIndex] || 'unknown',
                        uid: uniqueIdenifier(),
                        list: [],
                        originalcontroller: player
                    });
                }
            });

            (playerState?.spells || []).forEach((card) => {
                if (!card) {
                    return;
                }

                add(card.location || 'SPELLZONE', player, card.index, card.id || 'unknown');
                const pile = search(card);
                if (!pile) {
                    return;
                }

                pile.update({
                    position: card.position || 'FaceDown',
                    player,
                    location: card.location || 'SPELLZONE',
                    index: card.index
                });

                const overlayCards = Array.isArray(card?.overlay_cards)
                        ? card.overlay_cards
                        : Array.isArray(card?.overlayCards)
                            ? card.overlayCards
                            : [],
                    overlayCount = Math.max(Number(card.materials || 0), overlayCards.length);

                for (let overlayIndex = 0; overlayIndex < overlayCount; overlayIndex += 1) {
                    pile.state.list.push({
                        id: overlayCards[overlayIndex] || 'unknown',
                        uid: uniqueIdenifier(),
                        list: [],
                        originalcontroller: player
                    });
                }
            });

            ['deck', 'hand', 'grave', 'banished', 'extra'].forEach((zoneKey) => {
                (playerState?.[zoneKey] || []).forEach((card) => {
                    add(card.location, player, card.index, card.id || 'unknown');
                    const pile = search(card);
                    if (!pile) {
                        return;
                    }

                    pile.update({
                        position: card.position || 'FaceDown',
                        player,
                        location: card.location,
                        index: card.index
                    });
                });
            });
        });

        updateIndex();
    }

    function replacePlayerPiles(player, nextPiles = {}) {
        pendingOverlayHosts.clear();
        const locations = new Set(['DECK', 'HAND', 'EXTRA']);

        for (let index = stack.length - 1; index >= 0; index -= 1) {
            if (
                stack[index]?.state?.player === player
                && locations.has(stack[index]?.state?.location)
            ) {
                stack.splice(index, 1);
            }
        }

        ['deck', 'hand', 'extra'].forEach((zoneKey) => {
            (nextPiles?.[zoneKey] || []).forEach((card, index) => {
                const location = card.location || zoneKey.toUpperCase();

                add(location, player, Number(card.index ?? index), card.id || 'unknown');
                const pile = search({
                    player,
                    location,
                    index: Number(card.index ?? index)
                });

                if (!pile) {
                    return;
                }

                pile.update({
                    player,
                    location,
                    index: Number(card.index ?? index),
                    position: card.position || (location === 'HAND' ? 'FaceUp' : 'FaceDown')
                });
            });
        });

        updateIndex();
    }

            /**
     * Executes the update helper used by the model automatic field module.
     * @param {Object} data The data value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    function update(data) {
        //console.log(data.player, data.location, data.index, stack.length);
        try {
            const pile = search(data);
            if (pile) {
                pile.update(data);
                return;
            }
           // console.log('error', data);
        } catch (error) {
            console.log(error, 'no card at', data);
        }
    }

    return {
        add,
        addCardTarget,
        addCounter,
        applyCardHint,
        attach,
        cards,
        clear,
        detach,
        move,
        rankUp,
        reIndex,
        rebuildReload,
        replacePlayerPiles,
        removeCardTarget,
        remove,
        removeMany,
        setEquipCard,
        shuffleSet,
        take,
        update,
        updateDeckTop,
        updateExtra,
        updateIndex
    };
}

/**
 * Filters player used by the model automatic field module.
 * @param {Array} stack The stack array supplies the ordered values used by the model automatic field module, each item uses the `player` property.
 * @param {number} stack[].player The `[].player` property describes data read from each item used by the model automatic field module.
 * @param {number} player The player value provides an input used by the model automatic field module.
 * @returns {Array} Returns the value produced by the model automatic field module.
 */
function filterPlayer(stack, player) {

    return stack.filter(function (item) {
        return item.player === player;
    });
}

/**
 * Filters location used by the model automatic field module.
 * @param {Array} stack The stack array supplies the ordered values used by the model automatic field module, each item uses the `location` property.
 * @param {string} stack[].location The `[].location` property describes data read from each item used by the model automatic field module.
 * @param {string} location The location value provides an input used by the model automatic field module.
 * @returns {Array} Returns the value produced by the model automatic field module.
 */
function filterlocation(stack, location) {
    return stack.filter(function (item) {
        return item.location === location;
    });
}

/**
 * Hides view of zone used by the model automatic field module.
 * @param {Array} view The view value provides an input used by the model automatic field module.
 * @returns {Array} Returns the value produced by the model automatic field module.
 */
function hideViewOfZone(view) {
    var output = [];
    view.forEach(function (card, index) {
        output[index] = {};
        Object.assign(output[index], card);
        if (output[index].position === 'FaceDown' || output[index].position === 'FaceDownDefence' || output[index].position === 'FaceDownDefense') {
            output[index].id = 'unknown';
            output[index].counters = {};
            delete output[index].originalcontroller;
        }
    });

    return output;
}

/**
 * Hides view of extra used by the model automatic field module.
 * @param {Array} view The view value provides an input used by the model automatic field module.
 * @param {Array} allowed The allowed value provides an input used by the model automatic field module.
 * @returns {Array} Returns the value produced by the model automatic field module.
 */
function hideViewOfExtra(view, allowed) {
    var output = [];
    view.forEach(function (card, index) {
        output[index] = {};
        Object.assign(output[index], card);
        // if (card.position === 'FaceUpAttack') {
        //     output[index].id = (allowed) ? card.id : 0;
        // }
    });

    return output;
}


/**
 * Hides hand used by the model automatic field module.
 * @param {Array} view The view array supplies the ordered values used by the model automatic field module, each item uses the `isPublic` property.
 * @param {boolean} view[].isPublic The `[].isPublic` property describes data read from each item used by the model automatic field module.
 * @returns {Array} Returns the value produced by the model automatic field module.
 */
function hideHand(view) {
    var output = [];
    view.forEach(function (card, index) {
        output[index] = {};
        Object.assign(output[index], card);    
            output[index].position = (card.isPublic) ? 'FaceUp' : 'FaceDown';
        if (!card.isPublic) {
            output[index].id = 'unknown';
        }
    });

    return output;
}


class Game {

            /**
     * Initializes a new Model automatic field instance and prepares its internal state.
     * @param {Function} callback The callback value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    constructor(callback) {
        if (typeof callback !== 'function') {
            throw new Error('UI Output Callback required');
        }

        this.callback = callback;
        this.answerListener = new EventEmitter();
        this.lastQuestion = {};
        this.stack = new Field();
        this.addCard = this.stack.add;
        this.removeCard = this.stack.remove.bind(this.stack);
        this.moveCard = this.stack.move.bind(this.stack);
        this.attachMaterial = this.stack.attach.bind(this.stack);
        this.detachMaterial = this.stack.detach.bind(this.stack);
        this.takeMaterial = this.stack.take.bind(this.stack);
        this.rankUp = this.stack.rankUp.bind(this.stack);
        this.update = this.stack.update.bind(this.stack);
        this.previousStack = [];
        this.names = ['', ''];
        this.state = {
            turn: 0,
            turnOfPlayer: 0,
            phase: 0,
            playerHintCounts: {
                0: {},
                1: {}
            },
            playerHintTexts: {
                0: {},
                1: {}
            },
            playerHints: {
                0: [],
                1: []
            },
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
        return this;
    }

            /**
     * Gets state used by the model automatic field module.
     * @returns {Object} Returns the value produced by the model automatic field module.
     */
    getState() {
        return Object.assign(this.info, {
            names: this.names,
            stack: this.stack
        });
    }

            /**
     * Sets state used by the model automatic field module.
     * @param {Object} message The message object supplies the structured input used by the model automatic field module, including the `index`, `location`, `moveindex`, `movelocation`, `moveplayer`, `moveposition`, and `player` properties.
     * @param {number} message.index The `index` property supplies structured input used by the model automatic field module.
     * @param {string} message.location The `location` property supplies structured input used by the model automatic field module.
     * @param {number} message.moveindex The `moveindex` property supplies structured input used by the model automatic field module.
     * @param {string} message.movelocation The `movelocation` property supplies structured input used by the model automatic field module.
     * @param {number} message.moveplayer The `moveplayer` property supplies structured input used by the model automatic field module.
     * @param {string} message.moveposition The `moveposition` property supplies structured input used by the model automatic field module.
     * @param {number} message.player The `player` property supplies structured input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    setState(message) {
        this.stack.move({
            player: message.player,
            location: message.location,
            index: message.index
        }, {
            player: message.moveplayer,
            location: message.movelocation,
            index: message.moveindex,
            position: message.moveposition
        });
        this.callback(this.generateView(), this.stack.cards());
    }

        /**
     * Sets names used by the model automatic field module.
     * @param {number} slot The slot value provides an input used by the model automatic field module.
     * @param {string} username The username value provides an input used by the model automatic field module.
     * @public
     * @returns {void} Does not return a value.
     */
    setNames(slot, username) {
        this.names[slot] = username;
    }

            /**
     * Finds uidcollection used by the model automatic field module.
     * @param {string} uid The uid value provides an input used by the model automatic field module.
     * @returns {(Object|null)} Returns the value produced by the model automatic field module.
     */
    findUIDCollection(uid) {
        return getByUID(this.stack.cards(), uid);
    }

            /**
     * Finds uidcollection previous used by the model automatic field module.
     * @param {string} uid The uid value provides an input used by the model automatic field module.
     * @returns {(Object|null)} Returns the value produced by the model automatic field module.
     */
    findUIDCollectionPrevious(uid) {
        return getByUID(this.previousStack, uid);
    }

            /**
     * Filters edited used by the model automatic field module.
     * @param {Array} cards The cards array supplies the ordered values used by the model automatic field module, each item uses the `uid` property.
     * @param {string} cards[].uid The `[].uid` property describes data read from each item used by the model automatic field module.
     * @returns {Array} Returns the value produced by the model automatic field module.
     */
    filterEdited(cards) {
        return cards.filter((card) => {
            var newCards = this.findUIDCollection(card.uid),
                oldCards = this.findUIDCollectionPrevious(card.uid) || {};
            return !Object.keys(newCards).every(function (key) {
                return newCards[key] === oldCards[key];
            });
        });
    }

        /**
     * Executes the generate view count helper used by the model automatic field module.
     * @param {number} player The player value provides an input used by the model automatic field module.
     * @returns {Object} Returns the value produced by the model automatic field module.
     */
    generateViewCount(player) {
        var playersCards = filterPlayer(this.stack.cards(), player),
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
     * Executes the generate update view helper used by the model automatic field module.
     * @param {number} player The player value provides an input used by the model automatic field module.
     * @returns {Object} Returns the value produced by the model automatic field module.
     */
    generateUpdateView(player) {
        var playersCards = filterPlayer(this.stack.cards(), player),
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
     * Executes the generate single player view helper used by the model automatic field module.
     * @param {number} player The player value provides an input used by the model automatic field module.
     * @returns {Object} Returns the value produced by the model automatic field module.
     */
    generateSinglePlayerView(player) {
        var playersCards = this.filterEdited(filterPlayer(JSON.parse(JSON.stringify(this.stack.cards())), player)),
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
            EXTRA: extra, //hideViewOfExtra(extra, true),
            BANISHED: banished,
            SPELLZONE: spellzone,
            MONSTERZONE: monsterzone,
            EXCAVATED: excavated,
            INMATERIAL: inmaterial,
            ONFIELD: onfield
        };
    }

        /**
     * Executes the generate single player spectator view helper used by the model automatic field module.
     * @param {number} player The player value provides an input used by the model automatic field module.
     * @returns {Object} Returns the value produced by the model automatic field module.
     */
    generateSinglePlayerSpectatorView(player) {
        var playersCards = this.filterEdited(filterPlayer(JSON.parse(JSON.stringify(this.stack.cards())), player)),
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
     * Executes the generate spectator view helper used by the model automatic field module.
     * @returns {Array} Returns the value produced by the model automatic field module.
     */
    generateSpectatorView() {
        return [
            this.generateSinglePlayerSpectatorView(0),
            this.generateSinglePlayerSpectatorView(1)
        ];
    }

        /**
     * Executes the generate player1 view helper used by the model automatic field module.
     * @returns {Array} Returns the value produced by the model automatic field module.
     */
    generatePlayer1View() {
        return [
            this.generateSinglePlayerView(0),
            this.generateSinglePlayerSpectatorView(1)
        ];
    }

        /**
     * Executes the generate player2 view helper used by the model automatic field module.
     * @returns {Array} Returns the value produced by the model automatic field module.
     */
    generatePlayer2View() {
        return [
            this.generateSinglePlayerSpectatorView(0),
            this.generateSinglePlayerView(1)
        ];
    }

        /**
     * Executes the generate view helper used by the model automatic field module.
     * @param {string} action The action value provides an input used by the model automatic field module.
     * @returns {Object} Returns the value produced by the model automatic field module.
     */
    generateView(action) {
        if (action === 'start' || action === 'reload') {
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
            spectator: {
                duelAction: action || 'duel',
                info: this.state,
                field: this.generateSpectatorView()
            }
        };
        this.previousStack = JSON.parse(JSON.stringify(this.stack.cards()));
        return output;
    }

            /**
     * Executes the ygopro update helper used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    ygoproUpdate() {
        this.callback(this.generateView(), this.stack.cards());
    }

        /**
     * Makes new card used by the model automatic field module.
     * @param {string} location The location value provides an input used by the model automatic field module.
     * @param {number} controller The controller value provides an input used by the model automatic field module.
     * @param {number} sequence The sequence value provides an input used by the model automatic field module.
     * @param {string} position The position value provides an input used by the model automatic field module.
     * @param {string} code The code value provides an input used by the model automatic field module.
     * @param {number} index The index value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
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
        this.callback(this.generateView('newCard'), this.stack.cards());
    }


        /**
     * Executes the add counter helper used by the model automatic field module.
     * @param {Object} query The query value provides an input used by the model automatic field module.
     * @param {string} type The type value provides an input used by the model automatic field module.
     * @param {number} amount The amount value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    addCounter(query, type, amount) {
        this.stack.addCounter(query, type, amount);
        this.callback(this.generateView(), this.stack.cards());
    }

        /**
     * Removes counter used by the model automatic field module.
     * @param {Object} query The query value provides an input used by the model automatic field module.
     * @param {string} type The type value provides an input used by the model automatic field module.
     * @param {number} amount The amount value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    removeCounter(query, type, amount) {
        this.stack.addCounter(query, type, (-1 * amount));
        this.callback(this.generateView(), this.stack.cards());
    }

    addCardTarget(source, target) {
        this.stack.addCardTarget(source, target);
        this.callback(this.generateView(), this.stack.cards());
    }

    removeCardTarget(source, target) {
        this.stack.removeCardTarget(source, target);
        this.callback(this.generateView(), this.stack.cards());
    }

    setEquipCard(source, target) {
        this.stack.setEquipCard(source, target);
        this.callback(this.generateView(), this.stack.cards());
    }

    shuffleExtra(player, codes) {
        this.stack.updateExtra(player, codes);
        this.callback(this.generateView(), this.stack.cards());
    }

    updateDeckTop(message) {
        this.stack.updateDeckTop(message);
        this.callback(this.generateView(), this.stack.cards());
    }

    shuffleSetCards(location, cards) {
        this.stack.shuffleSet(location, cards);
        this.callback(this.generateView(), this.stack.cards());
    }

    removeCards(cards) {
        this.stack.removeMany(cards);
        this.callback(this.generateView(), this.stack.cards());
    }

    refreshDeck() {
        this.callback(this.generateView(), this.stack.cards());
    }

    tagSwap(message) {
        const player = Number(message?.player || 0),
            deckSize = Number(message?.deck_size || 0),
            deckTopCard = message?.deck_top_card ?? null,
            deck = Array.from({ length: deckSize }, (_, index) => ({
                player,
                location: 'DECK',
                index,
                position: 'FaceDown',
                id: index === Math.max(0, deckSize - 1) && deckTopCard ? deckTopCard : 'unknown'
            })),
            hand = (message?.hand || []).map((card, index) => ({
                player,
                location: 'HAND',
                index,
                position: card.position || 'FaceUp',
                id: card.id || 'unknown'
            })),
            extra = (message?.extra || []).map((card, index) => ({
                player,
                location: 'EXTRA',
                index,
                position: card.position || 'FaceDown',
                id: card.id || 'unknown'
            }));

        this.stack.replacePlayerPiles(player, {
            deck,
            hand,
            extra
        });
        this.callback(this.generateView(), this.stack.cards());
    }

    reloadField(snapshot) {
        const players = Array.isArray(snapshot?.players) ? snapshot.players : [];

        this.state.lifepoints = players.map((playerState, index) => {
            const value = Number(playerState?.lp);
            return Number.isFinite(value) ? value : (this.state.lifepoints?.[index] || 0);
        });
        this.state.duelFlags = Number(snapshot?.flags || 0);
        this.state.chain = Array.isArray(snapshot?.chain) ? snapshot.chain : [];
        this.state.playerHintCounts = {
            0: {},
            1: {}
        };
        this.state.playerHintTexts = {
            0: {},
            1: {}
        };
        this.state.playerHints = {
            0: [],
            1: []
        };
        this.stack.rebuildReload(snapshot);
        this.callback(this.generateView('reload'), this.stack.cards());
    }

    applyCardHint(message) {
        this.stack.applyCardHint(message);
        this.callback(this.generateView(), this.stack.cards());
    }

    applyPlayerHint(message) {
        const player = Number(message?.player || 0),
            hintType = message?.player_hint,
            descriptionKey = String(message?.description ?? message?.description_text ?? ''),
            descriptionText = message?.description_text || message?.description || '';

        if (!this.state.playerHintCounts) {
            this.state.playerHintCounts = {
                0: {},
                1: {}
            };
        }
        if (!this.state.playerHintTexts) {
            this.state.playerHintTexts = {
                0: {},
                1: {}
            };
        }
        if (!this.state.playerHints) {
            this.state.playerHints = {
                0: [],
                1: []
            };
        }

        const counts = Object.assign({}, this.state.playerHintCounts[player] || {}),
            texts = Object.assign({}, this.state.playerHintTexts[player] || {});

        if (hintType === 'desc_add') {
            counts[descriptionKey] = (counts[descriptionKey] || 0) + 1;
            if (descriptionText) {
                texts[descriptionKey] = descriptionText;
            }
        } else if (hintType === 'desc_remove') {
            if (counts[descriptionKey]) {
                counts[descriptionKey] -= 1;
                if (counts[descriptionKey] <= 0) {
                    delete counts[descriptionKey];
                    delete texts[descriptionKey];
                }
            }
        } else if (descriptionText) {
            counts[descriptionKey] = 1;
            texts[descriptionKey] = descriptionText;
        }

        this.state.playerHintCounts[player] = counts;
        this.state.playerHintTexts[player] = texts;
        this.state.playerHints[player] = Object.keys(texts).map((key) => texts[key]).filter(Boolean);
        this.callback(this.generateView(), this.stack.cards());
    }

        /**
     * Executes the draw card helper used by the model automatic field module.
     * @param {number} player The player value provides an input used by the model automatic field module.
     * @param {(number|Array)} numberOfCards The numberOfCards value provides an input used by the model automatic field module.
     * @param {Array} cards The cards array supplies the ordered values used by the model automatic field module, each item uses the `id` property.
     * @param {string} cards[].id The `[].id` property describes data read from each item used by the model automatic field module.
     * @param {Function} drawCallback The drawCallback value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    drawCard(player, numberOfCards, cards, drawCallback) {
        var currenthand = filterlocation(filterPlayer(this.stack.cards(), player), 'HAND').length,
            topcard,
            deck;

        for (let i = 0; i < numberOfCards; i += 1) {
            deck = filterlocation(filterPlayer(this.stack.cards(), player), 'DECK');
            topcard = deck[deck.length - 1];
            this.stack.move({
                player: topcard.player,
                location: 'DECK',
                index: topcard.index
            }, {
                player,
                location: 'HAND',
                index: currenthand + i,
                position: 'FaceUp',
                id: cards[i].id || topcard.id
            });
        }

        this.callback(this.generateView(), this.stack.cards());
        if (typeof drawCallback === 'function') {
            drawCallback();
        }
    }


        /**
     * Executes the reveal callback helper used by the model automatic field module.
     * @param {Array} reference The reference value provides an input used by the model automatic field module.
     * @param {number} player The player value provides an input used by the model automatic field module.
     * @param {string} call The call value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
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
        }, this.stack.cards());
    }

            /**
     * Gets field used by the model automatic field module.
     * @param {string} view The view value provides an input used by the model automatic field module.
     * @returns {Object} Returns the value produced by the model automatic field module.
     */
    getField(view) {
        return this.generateView('start')[view];
    }




        /**
     * Starts duel used by the model automatic field module.
     * @param {Object} player1 The player1 object supplies the structured input used by the model automatic field module, including the `extra` and `main` properties.
     * @param {Array} player1.extra The `extra` property supplies structured input used by the model automatic field module.
     * @param {Array} player1.main The `main` property supplies structured input used by the model automatic field module.
     * @param {Object} player2 The player2 object supplies the structured input used by the model automatic field module, including the `extra` and `main` properties.
     * @param {Array} player2.extra The `extra` property supplies structured input used by the model automatic field module.
     * @param {Array} player2.main The `main` property supplies structured input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    startDuel(player1, player2, options = {}) {
        const team1StartingLP = Number(options?.team1?.startingLP),
            team2StartingLP = Number(options?.team2?.startingLP);

        this.state.lifepoints = {
            0: Number.isFinite(team1StartingLP) ? team1StartingLP : 8000,
            1: Number.isFinite(team2StartingLP) ? team2StartingLP : 8000
        };

        player1.main.forEach((card, index) => {
            this.addCard('DECK', 0, index, card);
        });
        player2.main.forEach((card, index) => {
            this.addCard('DECK', 1, index, card);
        });

        player1.extra.forEach((card, index) => {
            this.addCard('EXTRA', 0, index, card);
        });
        player2.extra.forEach((card, index) => {
            this.addCard('EXTRA', 1, index, card);
        });
        this.stack.updateIndex();
        this.announcement(0, { command: 'MSG_ORIENTATION', slot: 0 });
        this.announcement(1, { command: 'MSG_ORIENTATION', slot: 1 });
        this.callback(this.generateView('start'), this.stack.cards());
    }

        /**
     * Executes the next phase helper used by the model automatic field module.
     * @param {(number|string)} phase The phase value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    nextPhase(phase) {
        this.state.phase = phase;
        this.callback(this.generateView(), this.stack.cards());
    }

        /**
     * Executes the next turn helper used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    nextTurn() {
        this.state.turn += 1;
        this.state.phase = 0;
        this.state.turnOfPlayer = (this.state.turnOfPlayer === 0) ? 1 : 0;
        this.callback(this.generateView(), this.stack.cards());
    }

            /**
     * Executes the announcement helper used by the model automatic field module.
     * @param {(string|number)} player The player value provides an input used by the model automatic field module.
     * @param {Object} message The message value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    announcement(player, message) {
        const slot = 'p' + player,
            output = {
                names: this.names,
                p0: {},
                p1: {},
                spectator: {}
            };
        output[slot] = {
            duelAction: 'announcement',
            message
        };
        this.callback(output, this.stack.cards());
    }

        /**
     * Executes the change lifepoints helper used by the model automatic field module.
     * @param {number} player The player value provides an input used by the model automatic field module.
     * @param {number} amount The amount value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    changeLifepoints(player, amount) {
        this.state.lifepoints[player] = this.state.lifepoints[player] + amount;
        this.callback(this.generateView(), this.stack.cards());
    }

        /**
     * Executes the set lifepoints helper used by the model automatic field module.
     * @param {number} player The player value provides an input used by the model automatic field module.
     * @param {number} amount The amount value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    setLifepoints(player, amount) {
        this.state.lifepoints[player] = Number(amount || 0);
        this.callback(this.generateView(), this.stack.cards());
    }

        /**
     * Executes the question helper used by the model automatic field module.
     * @param {number} slot The slot value provides an input used by the model automatic field module.
     * @param {string} type The type value provides an input used by the model automatic field module.
     * @param {Object} options The options value provides an input used by the model automatic field module.
     * @param {number} answerLength The answerLength value provides an input used by the model automatic field module.
     * @param {Function} onAnswerFromUser The onAnswerFromUser value provides an input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    question(slot, type, options, answerLength, onAnswerFromUser, forceResend = false) {

        // Create a mock view to populate with information so it gets sent to the right place.
        var uuid = uniqueIdenifier(),
            output = {
                names: this.names,
                p0: {},
                p1: {},
                spectator: {}
            };
        this.lastQuestion = {
            slot,
            type,
            options,
            answerLength,
            onAnswerFromUser,
            uuid
        };

        output[slot] = {
            duelAction: 'question',
            type: type,
            command: options?.command,
            options: options,
            prompt_text: options?.prompt_text,
            answerLength: answerLength,
            uuid: uuid
        };


        // So when the user answers this question we can fire `onAnswerFromUser` and pass the data to it.
        // https://nodejs.org/api/events.html#events_emitter_once_eventname_listener
        this.answerListener.once(uuid, function (data) {
            onAnswerFromUser(data);
        });

        this.callback(output, this.stack.cards());
    }

        /**
     * Executes the respond helper used by the model automatic field module.
     * @param {Object} message The message object supplies the structured input used by the model automatic field module, including the `answer` and `uuid` properties.
     * @param {Object} message.answer The `answer` property supplies structured input used by the model automatic field module.
     * @param {string} message.uuid The `uuid` property supplies structured input used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    respond(message) {
        this.answerListener.emit(message.uuid, message.answer);
    }

            /**
     * Retries last question used by the model automatic field module.
     * @returns {void} Does not return a value.
     */
    retryLastQuestion() {
        console.log('retrying', this.lastQuestion.slot, this.lastQuestion.type, this.lastQuestion.options, this.lastQuestion.answerLength, this.lastQuestion.onAnswerFromUser);
        this.question(this.lastQuestion.slot, this.lastQuestion.type, this.lastQuestion.options, this.lastQuestion.answerLength, this.lastQuestion.onAnswerFromUser, true);
    }

}

module.exports = Game;
