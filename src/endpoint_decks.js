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

async function createDeck(id, deck) {
    validateDeckType(id, deck);
    const decks = await axios.post(`${ADMIN_SERVER_URL}/decks`, deck, {
        headers: {
            Authorization: `Bearer ${id}`
        }
    });
    return decks.data;
}

async function getDecks(id) {
    const decks = await axios.get(`${ADMIN_SERVER_URL}/decks?_sort=name:ASC`, {
        headers: {
            Authorization: `Bearer ${id}`
        }
    });
    return decks.data;
}

async function updateDeck(id, deck) {
    validateDeckType(id, deck);
    const decks = await axios.put(`${ADMIN_SERVER_URL}/decks/${deck._id}`, deck, {
        headers: {
            Authorization: `Bearer ${id}`
        }
    });
    return decks.data;
}

async function deleteDeck(id, guid) {
    if (typeof id !== 'string') {
        throw new Error('Authentication Information Missing');
    }
    decks = await axios.delete(`${ADMIN_SERVER_URL}/decks/${guid}`, {
        headers: {
            Authorization: `Bearer ${id}`
        }
    });
    return decks.data;
}


async function processDecks(user, callback) {
    const result = { error: null },
        decks = user.decks,
        id = user.session,
        saved = [];
    try {
        for (const deck of decks) {
            try {
                const call = (deck.id) ? await updateDeck(id, deck) : await createDeck(id, deck);
                saved.push(call.id);
            } catch (e) {
                console.log('throwing out deck at slot', n);
            }

        }
        result.decks = await getDecks(id);

        const serverSaved = result.decks.map((deck) => {
            return deck.id;
        });
        const deletions = serverSaved.filter((deck) => {
            return !saved.includes(deck);
        });
        
        for (const guid of deletions) {
            await deleteDeck(id, guid);
        }
        result.decks = await getDecks(id);
    } catch (error) {
        result.error = error;
        result.decks = await getDecks(id);
    }
    callback(result.error, result.decks);
}


module.exports = {
    processDecks
}