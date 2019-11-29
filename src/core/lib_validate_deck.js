/* eslint-disable no-plusplus */

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
    return true;
}

function checkSubDeckAmounts(card, main, side, extra, getCardById) {
    const MAXIMUM_COPIES = 3,
        reference = getCardById(card),
        totals = main[card] + side[card] + extra[card];

    if (!reference) {
        throw new Error('Error loading deck: check Deck Edit to verify that your deck looks fine');
    }
    if (totals > MAXIMUM_COPIES) {
        throw new Error(`You can\'t have ${MAXIMUM_COPIES} copies of "${reference.name}"`);
    }


}


function checkBanlist(main, side, extra, banlist, getCardById) {
    for (let card in banlist.bannedCards) {
        const reference = getCardById(card);
        let cardAmount = 0;

        if (reference.alias) {
            card = reference.alias;
        }
        if (main[card]) {
            cardAmount += main[card];
        }
        if (side[card]) {
            cardAmount += side[card];
        }
        if (extra[card]) {
            cardAmount += extra[card];
        }
        if (cardAmount > banlist.bannedCards[card]) {
            throw new Error(`The number of copies of ${reference.name} exceeds the number permitted by the selected Forbidden/Limited Card List`);
        }
    }
}

function CardSearcher(database) {
    function getCardById(cardId) {
        const result = database.find(function (card) {
            if (card.id === parseInt(cardId, 10)) {
                return true;
            }
            return false;
        });
        return result || {};
    }

    function getFilteredCardById(cardId) {
        const result = database.find(function (card) {
            if (card.id === parseInt(cardId, 10)) {
                return true;
            }
            return false;
        });
        return result || null;
    }

    return {
        getCardById,
        getFilteredCardById
    };
}

function mapSubDeck(subDeck, getCardById) {
    return subDeck.main.reduce(function (deck, card) {
        const cardObject = getCardById(card);
        if (cardObject.alias) {
            card = cardObject.alias;
        }
        if (!deck[card]) {
            deck[card] = 1;
            return deck;
        }
        deck[card]++;
        return deck;
    }, {});
}

function mapDecks(deck, getCardById) {
    if (
        !deck.main
        || !deck.side
        || !deck.extra
        || !Array.isArray(deck.main.forEach)
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

    if (!reference[region].date || !(reference && cardpool === 'OCG/TCG')) {
        throw new Error(`${reference.name} does not exist in the TCG`);
    }

    if (reference[region].date > new Date(banlist.endDate)) {
        throw new Error(`${subreference.name}  does not exist in the timeframe of the selected Forbidden/Limited Card List`);
    }

    if (banlist.masterRule < 4 && reference.type >= 33554433) {
        throw new Error('Link Monsters are not permitted by the selected Forbidden/Limited Card List');
    }
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
        return { error };
    }
}

module.exports = validateDeck;