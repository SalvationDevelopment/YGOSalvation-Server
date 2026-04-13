/* eslint-disable no-plusplus */

/**
 * Checks size used by the lib validate deck module.
 * @param {Object} deck The deck object supplies the structured input used by the lib validate deck module, including the `extra`, `main`, and `side` properties.
 * @param {Array} deck.extra The `extra` property supplies structured input used by the lib validate deck module.
 * @param {number} deck.extra.length The `extra.length` property supplies structured input used by the lib validate deck module.
 * @param {Array} deck.main The `main` property supplies structured input used by the lib validate deck module.
 * @param {number} deck.main.length The `main.length` property supplies structured input used by the lib validate deck module.
 * @param {Array} deck.side The `side` property supplies structured input used by the lib validate deck module.
 * @param {number} deck.side.length The `side.length` property supplies structured input used by the lib validate deck module.
 * @param {Object} banlist The banlist object supplies the structured input used by the lib validate deck module, including the `masterRule` property.
 * @param {number} banlist.masterRule The `masterRule` property supplies structured input used by the lib validate deck module.
 * @typedef {Object} Deck
 * @property {Number[]} main Passcode/YGOPRO_ID of cards in the main deck.
 * @property {Number[]} extra Passcode/YGOPRO_ID cards in the extra deck.
 * @property {Number[]} side Passcode/YGOPRO_ID cards in the side deck.
 * @returns {boolean} Returns the value produced by the lib validate deck module.
 */

/**
 * @typedef {Object} Banlist
 * @property {Number[]} bannedTypes values banned in this F&L Lists, such as Fusions, Synchro, etc
 * @property {Number[]} exceptions card IDs that ignore the bannedTypes array
 * @property {Date} startDate new Date('YYYY-MM-DD'), //legal start date
 * @property {Date} endDate new Date('YYYY-MM-DD'), //legal end date, or 'null' if date is unknown
 * @property {Boolean} primary if the banlist is the default of the host and deck editor
 * @property {Boolean} modern if the banlist is commonly planned and should be on the condensed ban list listings.
 * @property {String} name Format shorthand name, or release date and region concated name of the banlist
 */

/**
 * @typedef {Object} Validation
 * @property {Error|null} error validation error message
 */

 /**
  * Make sure the deck is of legal size
  * @param {Deck} deck Deck being tested
  * @param {Banlist} banlist provided banlist
  * @returns {Boolean} if the deck is legal returns true, else throws.
  */
function checkSize(deck, banlist) {
    if (deck.main.length < 40) {
        throw new Error('Main Deck size below 40');
    }
    if (deck.main.length > 60 && banlist.masterRule > 0) {
        throw new Error('Main Deck size above 60');
    }
    if (deck.side.length > 15) {
        throw new Error('Side Deck size above 15');
    }
    if (deck.extra.length > 15 && banlist.masterRule > 0) {
        throw new Error('Extra Deck size above 15');
    }
    if (banlist.masterRule === 0 && deck.side.length && deck.side.length !== 15) {
        throw new Error('Side Deck must be exactly 0 or 15 cards');
    }
    return true;
}

/**
 * Checks sub deck amounts used by the lib validate deck module.
 * @param {string} passcode The passcode value provides an input used by the lib validate deck module.
 * @param {Array} main The main value provides an input used by the lib validate deck module.
 * @param {(number|Object)} side The side value provides an input used by the lib validate deck module.
 * @param {Array} extra The extra value provides an input used by the lib validate deck module.
 * @param {Function} search The search value provides an input used by the lib validate deck module.
 * @returns {boolean} Returns the value produced by the lib validate deck module.
 */
function checkSubDeckAmounts(passcode, main, side, extra, search) {
    const MAXIMUM_COPIES = 3,
        reference = search(passcode),
        totals = main[passcode] + side[passcode] + extra[passcode];

    if (!reference) {
        throw new Error('Error loading deck: check Deck Edit to verify that your deck looks fine');
    }
    if (totals > MAXIMUM_COPIES) {
        throw new Error(`You can\'t have ${totals} copies of "${reference.name}"`);
    }
    return true;
}


/**
 * Checks banlist used by the lib validate deck module.
 * @param {Array} main The main value provides an input used by the lib validate deck module.
 * @param {(number|Object)} side The side value provides an input used by the lib validate deck module.
 * @param {Array} extra The extra value provides an input used by the lib validate deck module.
 * @param {Object} banlist The banlist object supplies the structured input used by the lib validate deck module, including the `bannedCards` property.
 * @param {Array} banlist.bannedCards The `bannedCards` property supplies structured input used by the lib validate deck module.
 * @param {Function} search The search value provides an input used by the lib validate deck module.
 * @returns {void} Does not return a value.
 */
function checkBanlist(main, side, extra, banlist, search) {
    for (let passcode in banlist.bannedCards) {
        const reference = search(passcode);
        let cardAmount = 0;

        if (reference.alias) {
            passcode = reference.alias;
        }
        if (main[passcode]) {
            cardAmount += main[passcode];
        }
        if (side[passcode]) {
            cardAmount += side[passcode];
        }
        if (extra[passcode]) {
            cardAmount += extra[passcode];
        }
        if (cardAmount > banlist.bannedCards[passcode]) {
            throw new Error(`The number of copies of ${reference.name} exceeds the number permitted by the selected Forbidden/Limited Card List`);
        }
    }
}


/**
 * Maps sub deck used by the lib validate deck module.
 * @param {Array} subDeck The subDeck value provides an input used by the lib validate deck module.
 * @param {Function} search The search value provides an input used by the lib validate deck module.
 * @returns {Array} Returns the value produced by the lib validate deck module.
 */
function mapSubDeck(subDeck, search) {
    return subDeck.reduce( (deck, passcode) =>{
        const cardObject = search(passcode);
        if (cardObject.alias) {
            passcode = cardObject.alias;
        }
        if (!deck[passcode]) {
            deck[passcode] = 1;
            return deck;
        }
        deck[passcode]++;
        return deck;
    }, {});
}

/**
 * Maps decks used by the lib validate deck module.
 * @param {Object} deck The deck object supplies the structured input used by the lib validate deck module, including the `extra`, `main`, and `side` properties.
 * @param {Array} deck.extra The `extra` property supplies structured input used by the lib validate deck module.
 * @param {Array} deck.main The `main` property supplies structured input used by the lib validate deck module.
 * @param {(number|Array)} deck.side The `side` property supplies structured input used by the lib validate deck module.
 * @param {Function} search The search value provides an input used by the lib validate deck module.
 * @returns {Array} Returns the value produced by the lib validate deck module.
 */
function mapDecks(deck, search) {
    if (
        !deck.main
        || !deck.side
        || !deck.extra
        || !Array.isArray(deck.main)
        || !Array.isArray(deck.side)
        || !Array.isArray(deck.extra)
    ) {
        throw new Error('Invalid deck object');
    }

    return {
        main: mapSubDeck(deck.main, search),
        side: mapSubDeck(deck.side, search),
        extra: mapSubDeck(deck.extra, search)
    };
}

/**
 * Validates deck to region used by the lib validate deck module.
 * @param {Object} card The card value provides an input used by the lib validate deck module.
 * @param {string} region The region value provides an input used by the lib validate deck module.
 * @param {string} cardpool The cardpool value provides an input used by the lib validate deck module.
 * @param {Object} banlist The banlist object supplies the structured input used by the lib validate deck module, including the `endDate` and `masterRule` properties.
 * @param {Date} banlist.endDate The `endDate` property supplies structured input used by the lib validate deck module.
 * @param {number} banlist.masterRule The `masterRule` property supplies structured input used by the lib validate deck module.
 * @param {Function} search The search value provides an input used by the lib validate deck module.
 * @returns {boolean} Returns the value produced by the lib validate deck module.
 */
function validateDeckToRegion(card, region, cardpool, banlist, search) {
    const reference = search(card),
        subreference = search(card);

    if (cardpool === 'OCG/TCG') {
        return true;
    }

    if (!reference[region].date) {
        throw new Error(`${reference.name} does not exist in the ${cardpool} card pool`);
    }

    if (reference[region].date > new Date(banlist.endDate)) {
        throw new Error(`${subreference.name}  does not exist in the timeframe of the selected Forbidden/Limited Card List`);
    }

    if (banlist.masterRule < 4 && reference.type >= 33554433) {
        throw new Error('Link Monsters are not permitted by the selected Forbidden/Limited Card List');
    }

    return true;
}

/**
 * Checks amounts used by the lib validate deck module.
 * @param {Array} main The main value provides an input used by the lib validate deck module.
 * @param {number} side The side value provides an input used by the lib validate deck module.
 * @param {Array} extra The extra value provides an input used by the lib validate deck module.
 * @param {Function} search The search value provides an input used by the lib validate deck module.
 * @returns {void} Does not return a value.
 */
function checkAmounts(main, side, extra, search) {
    for (const card in main) {
        checkSubDeckAmounts(card, main, side, extra, search);
    }

    for (const card in side) {
        checkSubDeckAmounts(card, main, side, extra, search);
    }

    for (const card in extra) {
        checkSubDeckAmounts(card, main, side, extra, search);
    }
}

/**
 * Checks region used by the lib validate deck module.
 * @param {Array} main The main value provides an input used by the lib validate deck module.
 * @param {number} side The side value provides an input used by the lib validate deck module.
 * @param {Array} extra The extra value provides an input used by the lib validate deck module.
 * @param {Object} banlist The banlist object supplies the structured input used by the lib validate deck module, including the `region` property.
 * @param {string} banlist.region The `region` property supplies structured input used by the lib validate deck module.
 * @param {string} cardpool The cardpool value provides an input used by the lib validate deck module.
 * @param {Function} search The search value provides an input used by the lib validate deck module.
 * @returns {void} Does not return a value.
 */
function checkRegion(main, side, extra, banlist, cardpool, search) {

    const region = banlist.region;

    for (const card in main) {
        validateDeckToRegion(card, region, cardpool, banlist, search);
    }

    for (const card in side) {
        validateDeckToRegion(card, region, cardpool, banlist, search);
    }

    for (const card in extra) {
        validateDeckToRegion(card, region, cardpool, banlist, search);
    }
}

/**
 * Validates deck used by the lib validate deck module.
 * @param {Object} deck The deck value provides an input used by the lib validate deck module.
 * @param {Array} banlist The banlist value provides an input used by the lib validate deck module.
 * @param {Array} database The database array supplies the ordered values used by the lib validate deck module, each item uses the `id` property.
 * @param {string} database[].id The `[].id` property describes data read from each item used by the lib validate deck module.
 * @param {string} cardpool The cardpool value provides an input used by the lib validate deck module.
 * @returns {Object} Returns the value produced by the lib validate deck module.
 */
function validateDeck(deck, banlist, database, cardpool = 'OCG/TCG') {

         /**
     * Executes the search helper used by the lib validate deck module.
     * @param {number} cardId The cardId value provides an input used by the lib validate deck module.
     * @returns {Array} Returns the value produced by the lib validate deck module.
     */
    function search(cardId) {
        const result = database.find( (card) =>{
            return (card.id === parseInt(cardId, 10));
        });
        return result || {};
    }

    try {
        const { main, side, extra } = mapDecks(deck, search);
        checkSize(deck, banlist);
        checkAmounts(main, side, extra, search);
        checkBanlist(main, side, extra, banlist, search);
        checkRegion(main, side, extra, banlist, cardpool, search);
        return { error: null };
    } catch (error) {
        return {
            error: error.toString()
        };
    }
}

module.exports = validateDeck;
