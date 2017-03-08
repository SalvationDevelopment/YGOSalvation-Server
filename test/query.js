'use strict';
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
    return first.index > second.index;
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
 * Returns info on a card, or rather a single card.
 * @param   {Number} player       Player Interger
 * @param   {Number} clocation    Location enumeral
 * @param   {Number} index        Index
 * @param   {Number} overlayindex Index of where a card is in an XYZ stack starting at 1
 * @returns {object} The card you where looking for.
 */
function queryCard(stack, search) {
    if (search) {
        return filterUID(stack, search)[0];
    }
    return filterOverlyIndex(filterIndex(filterlocation(filterPlayer(stack, search.player), search.clocation), search.index), search.overlayindex)[0];
}

/**
 * Returns the number of cards in each zone.
 * @param   {Array} the stack
 * @returns {object}   information on number of slots on each zone.
 */
function field(stack) {
    /*The YGOPro messages have a design flaw in them where they dont tell the number of cards
      that you have to itterate over in order to get a proper message, this function resolves that problem,
      this flaw has caused me all types of grief.
    */

    return {
        player1: {
            DECK: filterlocation(filterPlayer(stack, 0), 'DECK'),
            HAND: filterlocation(filterPlayer(stack, 0), 'HAND'),
            EXTRA: filterlocation(filterPlayer(stack, 0), 'EXTRA'),
            GRAVE: filterlocation(filterPlayer(stack, 0), 'GRAVE'),
            REMOVED: filterlocation(filterPlayer(stack, 0), 'REMOVED'),
            EXCAVATED: filterlocation(filterPlayer(stack, 0), 'EXCAVATED'),
            SPELLZONE: filterlocation(filterPlayer(stack, 0), 'SPELLZONE'),
            MONSTERZONE: filterlocation(filterPlayer(stack, 0), 'MONSTERZONE')
        },
        player2: {
            DECK: filterlocation(filterPlayer(stack, 1), 'DECK'),
            HAND: filterlocation(filterPlayer(stack, 1), 'HAND'),
            EXTRA: filterlocation(filterPlayer(stack, 1), 'EXTRA'),
            GRAVE: filterlocation(filterPlayer(stack, 1), 'GRAVE'),
            REMOVED: filterlocation(filterPlayer(stack, 1), 'REMOVED'),
            EXCAVATED: filterlocation(filterPlayer(stack, 1), 'EXCAVATED'),
            SPELLZONE: filterlocation(filterPlayer(stack, 1), 'SPELLZONE'),
            MONSTERZONE: filterlocation(filterPlayer(stack, 1), 'MONSTERZONE')
        }
    };
}

module.exports = {
    queryCard: queryCard,
    filterUID: filterUID,
    field: field
};