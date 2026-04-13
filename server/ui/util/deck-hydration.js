/**
 * Clones deck record used by the deck hydration module.
 * @param {Object} deck The deck object supplies the structured input used by the deck hydration module, including the `extra`, `main`, and `side` properties.
 * @param {Array} deck.extra The `extra` property supplies structured input used by the deck hydration module.
 * @param {Array} deck.main The `main` property supplies structured input used by the deck hydration module.
 * @param {(number|Array)} deck.side The `side` property supplies structured input used by the deck hydration module.
 * @returns {Object} Returns the value produced by the deck hydration module.
 */
function cloneDeckRecord(deck) {
    return {
        ...(deck || {}),
        main: Array.isArray(deck?.main) ? [...deck.main] : [],
        extra: Array.isArray(deck?.extra) ? [...deck.extra] : [],
        side: Array.isArray(deck?.side) ? [...deck.side] : []
    };
}

/**
 * Resolves deck card id used by the deck hydration module.
 * @param {Object} card The card object supplies the structured input used by the deck hydration module, including the `id` property.
 * @param {(string|number)} card.id The `id` property supplies structured input used by the deck hydration module.
 * @returns {(number|Object)} Returns the value produced by the deck hydration module.
 */
export function resolveDeckCardId(card) {
    if (typeof card === 'number') {
        return card;
    }

    if (typeof card === 'string') {
        return Number(card);
    }

    if (card && typeof card === 'object') {
        return Number(card.id);
    }

    return NaN;
}

/**
 * Hydrates deck records used by the deck hydration module.
 * @param {Array} deckRecords The deckRecords value provides an input used by the deck hydration module.
 * @param {Array} database The database array supplies the ordered values used by the deck hydration module, including the `length` property, and each item uses the `id` property.
 * @param {string} database[].id The `[].id` property describes data read from each item used by the deck hydration module.
 * @param {number} database.length The `length` property supplies structured input used by the deck hydration module.
 * @returns {Array} Returns the value produced by the deck hydration module.
 */
export function hydrateDeckRecords(deckRecords, database) {
    if (!Array.isArray(deckRecords)) {
        return [];
    }

    if (!Array.isArray(database) || !database.length) {
        return deckRecords.map(cloneDeckRecord);
    }

    return deckRecords.map((deckRecord) => {
        const hydratedDeck = cloneDeckRecord(deckRecord);

        hydratedDeck.main = hydratedDeck.main
            .map((card) => {
                const cardId = resolveDeckCardId(card);
                return database.find((item) => Number(item.id) === cardId);
            })
            .filter(Boolean);

        hydratedDeck.extra = hydratedDeck.extra
            .map((card) => {
                const cardId = resolveDeckCardId(card);
                return database.find((item) => Number(item.id) === cardId);
            })
            .filter(Boolean);

        hydratedDeck.side = hydratedDeck.side
            .map((card) => {
                const cardId = resolveDeckCardId(card);
                return database.find((item) => Number(item.id) === cardId);
            })
            .filter(Boolean);

        return hydratedDeck;
    });
}
