const axios = require('axios'),
    CMS_URL = process.env.CMS_URL;


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
    const decks = await axios.post(`${CMS_URL}/decks`, deck, {
        headers: {
            Authorization: `Bearer ${id}`
        }
    });
    return decks.data;
}

async function getDecks(id) {
    const decks = await axios.get(`${CMS_URL}/decks`, {
        headers: {
            Authorization: `Bearer ${id}`
        }
    });
    return decks.data;
}

async function updateDeck(id, deck) {
    validateDeckType(id, deck);
    const decks = await axios.put(`${CMS_URL}/decks/${deck._id}`, deck, {
        headers: {
            Authorization: `Bearer ${id}`
        }
    });
    return decks.data;
}

async function deleteDeck(id, deck) {
    validateDeckType(id, deck);
    if (typeof id !== 'string') {
        throw new Error('Authentication Information Missing');
    }
    decks = await axios.delete(`${CMS_URL}/decks/${deck._id}`, {
        headers: {
            Authorization: `Bearer ${id}`
        }
    });
    return decks.data;
}

function setupEndpoints(app) {
    app.route('/deck').post(async (request, response) => {
        var payload = request.body || {};
        try {
            const result = await getDecks(payload.id, payload.deck);
            response.send(result);
        } catch (error) {
            response.send(error.toString());
        }
    });

    app.post('/deck/create', async (request, response) => {
        var payload = request.body || {};
        try {
            const result = await createDeck(payload.id, payload.deck);
            console.log('good');
            response.send(result);
        } catch (error) {
            response.send(error.toString());
        }
    });

    app.post('/deck/update', async (request, response) => {
        var payload = request.body || {};
        try {
            const result = await updateDeck(payload.id, payload.deck);
            response.send(result);
        } catch (error) {
            response.send(error.toString());
        }
    });

    app.post('/deck/delete', async (request, response) => {
        var payload = request.body || {};
        try {
            const result = await deleteDeck(payload.id, payload.deck);
            response.send(result);
        } catch (error) {
            response.send(error.toString());
        }
    });
}

module.exports = {
    setupEndpoints
}