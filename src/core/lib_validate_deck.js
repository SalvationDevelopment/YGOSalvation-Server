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

function checkSubDeckAmounts(passcode, main, side, extra, getCardById) {
    const MAXIMUM_COPIES = 3,
        reference = getCardById(passcode),
        totals = main[passcode] + side[passcode] + extra[passcode];

    if (!reference) {
        throw new Error('Error loading deck: check Deck Edit to verify that your deck looks fine');
    }
    if (totals > MAXIMUM_COPIES) {
        throw new Error(`You can\'t have ${totals} copies of "${reference.name}"`);
    }
}

function checkBanlist(main, side, extra, banlist, getCardById) {
    for (let passcode in banlist.bannedCards) {
        const reference = getCardById(passcode);
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

function CardSearcher(database) {
    function getCardById(cardId) {
        const result = database.find(function (card) {
            return (card.id === parseInt(cardId, 10));
        });
        return result || {};
    }

    function getFilteredCardById(cardId) {
        const result = database.find(function (card) {
            return (card.id === parseInt(cardId, 10));
        });
        return result || {};
    }

    return {
        getCardById,
        getFilteredCardById
    };
}

function mapSubDeck(subDeck, getCardById) {
    return subDeck.reduce(function (deck, passcode) {
        const cardObject = getCardById(passcode);
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

function mapDecks(deck, getCardById) {
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
        main: mapSubDeck(deck.main, getCardById),
        side: mapSubDeck(deck.side, getCardById),
        extra: mapSubDeck(deck.extra, getCardById)
    };
}

function validateDeckToRegion(card, region, cardpool, banlist, getCardById, getFilteredCardById) {
    const reference = getFilteredCardById(card),
        subreference = getCardById(card);

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

function checkAmounts(main, side, extra, getCardById) {
    for (const card in main) {
        checkSubDeckAmounts(card, main, side, extra, getCardById);
    }

    for (const card in side) {
        checkSubDeckAmounts(card, main, side, extra, getCardById);
    }

    for (const card in extra) {
        checkSubDeckAmounts(card, main, side, extra, getCardById);
    }
}

function checkRegion(main, side, extra, banlist, cardpool, getCardById, getFilteredCardById) {

    const region = banlist.region;

    for (const card in main) {
        validateDeckToRegion(card, region, cardpool, banlist, getCardById, getFilteredCardById);
    }

    for (const card in side) {
        validateDeckToRegion(card, region, cardpool, banlist, getCardById, getFilteredCardById);
    }

    for (const card in extra) {
        validateDeckToRegion(card, region, cardpool, banlist, getCardById, getFilteredCardById);
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

    const {
        getCardById,
        getFilteredCardById
    } = new CardSearcher(database);

    try {
        const { main, side, extra } = mapDecks(deck, getCardById);
        checkSize(deck, banlist);
        checkAmounts(main, side, extra, getCardById);
        checkBanlist(main, side, extra, banlist, getCardById);
        checkRegion(main, side, extra, banlist, cardpool, getCardById, getFilteredCardById);
        return { error: null };
    } catch (error) {
        return {
            error: error.toString()
        };
    }
}

module.exports = validateDeck;