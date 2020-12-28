const axios = require('axios'),
    ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL;


function validateDeckType(id, deck) {
    if (typeof id !== 'string') {
        throw new Error('Authentication Information Missing.');
    }
    if (typeof deck !== 'object') {
        throw new Error('Deck is required for this request.');
    }

    if (typeof deck.name !== 'string' || !deck.name.length) {
        throw new Error('Deck must have a name.');
    }
    if (!Array.isArray(deck.main) || !Array.isArray(deck.extra) || !Array.isArray(deck.side)) {
        throw new Error('Must be a properly formated deck.');
    }
}

async function callCreateDeck(id, deck) {
    validateDeckType(id, deck);
    const decks = await axios.post(`${ADMIN_SERVER_URL}/decks`, deck, {
        headers: {
            Authorization: `Bearer ${id}`
        }
    });
    return decks.data;
}

async function getDecks(jwt, owner) {
    const decks = await axios.get(`${ADMIN_SERVER_URL}/decks?owner=${owner}&_sort=name:ASC`, {
        headers: {
            Authorization: `Bearer ${jwt}`
        }
    });
    return decks.data;
}

async function callUpdateDeck(jwt, deck) {
    validateDeckType(jwt, deck);
    const decks = await axios.put(`${ADMIN_SERVER_URL}/decks/${deck._id}`, deck, {
        headers: {
            Authorization: `Bearer ${jwt}`
        }
    });
    return decks.data;
}

async function callDelete (jwt, guid) {
    if (typeof jwt !== 'string') {
        throw new Error('Authentication Information Missing');
    }
    const decks = await axios.delete(`${ADMIN_SERVER_URL}/decks/${guid}`, {
        headers: {
            Authorization: `Bearer ${jwt}`
        }
    });
    return decks.data;
}


async function saveDeck(jwt, deck, owner, callback) {
    const result = { error: null }
    try {
        const call = (deck.id) ? await callUpdateDeck(jwt, deck) : await callCreateDeck(jwt, deck);
    } catch (e) {
        console.log('[ENDPOINT/DECKS] Failed to save deck', deck.owner, deck.name);
    }


    result.decks = await getDecks(jwt, owner);

    callback(result.error, result.decks);
}

async function deleteDeck(jwt, deckID, owner, callback) {
    let results = { error: null };
    try {
        await callDelete (jwt, deckID);
        results.decks = await getDecks(jwt, owner);
    } catch (error) {
        results.error = error;
        return;
    }
    
    callback(results.error, results.decks);
    
}


module.exports = {
    saveDeck,
    deleteDeck,
}