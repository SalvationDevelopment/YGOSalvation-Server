/* eslint-disable no-plusplus */

/**
 * @typedef {Object} Deck
 * @property {Number[]} main Passcode/YGOPRO_ID of cards in the main deck.
 * @property {Number[]} extra Passcode/YGOPRO_ID cards in the extra deck.
 * @property {Number[]} side Passcode/YGOPRO_ID cards in the side deck.
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
 * Make sure specific copies of cards don't go over between decks
 * @param {Number} passcode Unique 8 digit identifier.
 * @param {Number[]} main Passcode/YGOPRO_ID of cards representing the main deck.
 * @param {Number[]} side Passcode/YGOPRO_ID of cards representing the side deck.
 * @param {Number[]} extra Passcode/YGOPRO_ID of cards representing the extra deck.
 * @param {Function} search Database getter for card information.
 * @returns {Boolean} if the deck is legal returns true, else throws.
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
 * Check if the deck follows the provided banlist
 * @param {Number[]} main Passcode/YGOPRO_ID of cards representing the main deck.
 * @param {Number[]} side Passcode/YGOPRO_ID of cards representing the side deck.
 * @param {Number[]} extra Passcode/YGOPRO_ID of cards representing the extra deck.
 * @param {Banlist} banlist provided banlist
 * @param {Function} search Database getter for card information.
 * @returns {Boolean} if the deck is legal returns true, else throws.
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
 * 
 * @param {Deck} deck deck to compare against the banlist
 * @param {Banlist} banlist banlist to validate the deck against
 * @param {Card[]} database all the avaliable cards in the game
 * @param {String} cardpool region of cards to use from the database
 * @return {Validation} validation information
 */
function validateDeck(deck, banlist, database, cardpool = 'OCG/TCG') {

     /**
     * Finds a single card based on ID
     * @param {Number} cardId Passcode/YGOPRO_ID
     * @return {Object} Full card data
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