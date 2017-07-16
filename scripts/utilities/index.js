/*jslint node : true, bitwise:true*/
'use strict';


function cardIs(card, query) {
    if (query === "MONSTER" && (card.race !== 0 || card.level !== 0 || card.attribute !== 0)) {
        return true;
    }
    if (query === "MONSTER") {
        return (card.type & 1) === 1;
    }
    if (query === "SPELL") {
        return (card.type & 2) === 2;
    }
    if (query === "TRAP") {
        return (card.type & 4) === 4;
    }
    if (query === "FUSION") {
        return (card.type & 64) === 64;
    }
    if (query === "RITUAL") {
        return (card.type & 128) === 128;
    }
    if (query === "SYNCHRO") {
        return (card.type & 8192) === 8192;
    }
    if (query === "XYZ") {
        return (card.type & 8388608) === 8388608;
    }
    if (query === "LINK") {
        return (card.type & 33554432) === 33554432;
    }
}

function filterType(stack, type) {
    return stack.filter(function (card) {
        return cardIs(card, type);
    });
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


/**
 * Sort function, sorts by card index
 * @param   {object}   first  card object
 * @param   {object}   second card object
 * @returns {boolean} 
 */
function sortByIndex(first, second) {
    return first.index - second.index;
}

function fusionMonster(card, effect, FUSION_MATERIALS) {
    card.FUSION_MATERIALS = FUSION_MATERIALS;
    effect.SetType = ['EFFECT_TYPE_SINGLE'];
    effect.SetOperation = function fusionSummon(action) {
        if (action.type === 'FUSION_SUMMONED') {
            card.FUSION_SUMMONED = true;
        }
    };
    return effect;
}

module.exports = {
    filterType: filterType,
    fusionMonster: fusionMonster,
    filterPlayer: filterPlayer,
    filterIsCard: filterIsCard,
    filterIndex: filterIndex,
    filterOverlyIndex: filterOverlyIndex,
    filterlocation: filterlocation,
    filterUID: filterUID,
    sortByIndex: sortByIndex
};