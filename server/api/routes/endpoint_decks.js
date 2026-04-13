require('../../lib/load-shared-env');

const { request } = require('../../lib/http'),
  ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL || 'http://localhost:3000/api';


/**
 * Validates deck type used by the endpoint decks module.
 * @param {string} id The id value provides an input used by the endpoint decks module.
 * @param {Object} deck The deck object supplies the structured input used by the endpoint decks module, including the `extra`, `main`, `name`, and `side` properties.
 * @param {Array<(number|{id: (string|number)})>} deck.extra The `extra` property supplies structured input used by the endpoint decks module.
 * @param {Array<(number|{id: (string|number)})>} deck.main The `main` property supplies structured input used by the endpoint decks module.
 * @param {string} deck.name The `name` property supplies structured input used by the endpoint decks module.
 * @param {number} deck.name.length The `name.length` property supplies structured input used by the endpoint decks module.
 * @param {Array<(number|{id: (string|number)})>} deck.side The `side` property supplies structured input used by the endpoint decks module.
 * @returns {void} Does not return a value.
 */
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

/**
 * Normalizes card ids used by the endpoint decks module.
 * @param {Array} cards The cards array supplies the ordered values used by the endpoint decks module, each item uses the `id` property.
 * @param {(string|number)} cards[].id The `[].id` property describes data read from each item used by the endpoint decks module.
 * @returns {number[]} Returns the value produced by the endpoint decks module.
 */
function normalizeCardIds(cards) {
  if (!Array.isArray(cards)) {
    return [];
  }

  return cards.map((entry) => {
    if (typeof entry === 'number') {
      return entry;
    }
    if (entry && typeof entry === 'object') {
      return Number(entry.id);
    }
    return Number(entry);
  }).filter(Number.isFinite);
}

/**
 * Normalizes deck payload used by the endpoint decks module.
 * @param {Object} deck The deck object supplies the structured input used by the endpoint decks module, including the `extra`, `main`, `name`, `notes`, `owner`, and `side` properties.
 * @param {Array<(number|{id: (string|number)})>} deck.extra The `extra` property supplies structured input used by the endpoint decks module.
 * @param {Array<(number|{id: (string|number)})>} deck.main The `main` property supplies structured input used by the endpoint decks module.
 * @param {string} deck.name The `name` property supplies structured input used by the endpoint decks module.
 * @param {string} deck.notes The `notes` property supplies structured input used by the endpoint decks module.
 * @param {string} deck.owner The `owner` property supplies structured input used by the endpoint decks module.
 * @param {Array<(number|{id: (string|number)})>} deck.side The `side` property supplies structured input used by the endpoint decks module.
 * @returns {{name: string, owner: string, main: number[], extra: number[], side: number[], notes: string}} Returns the value produced by the endpoint decks module.
 */
function normalizeDeckPayload(deck) {
  return {
    name: deck.name,
    owner: deck.owner,
    main: normalizeCardIds(deck.main),
    extra: normalizeCardIds(deck.extra),
    side: normalizeCardIds(deck.side),
    notes: deck.notes || ''
  };
}

/**
 * Executes the call create deck helper used by the endpoint decks module.
 * @param {string} id The id value provides an input used by the endpoint decks module.
 * @param {Object} deck The deck value provides an input used by the endpoint decks module.
 * @returns {Promise<Object>} Resolves with the value produced by the endpoint decks module.
 */
async function callCreateDeck(id, deck) {
  validateDeckType(id, deck);
  const decks = await request(`${ADMIN_SERVER_URL}/decks`, {
    method: 'POST',
    body: normalizeDeckPayload(deck),
    headers: {
      Authorization: `Bearer ${id}`
    }
  });
  return decks.data;
}

/**
 * Gets decks used by the endpoint decks module.
 * @param {string} jwt The jwt value provides an input used by the endpoint decks module.
 * @param {string} owner The owner value provides an input used by the endpoint decks module.
 * @returns {Promise<Array>} Resolves with the value produced by the endpoint decks module.
 */
async function getDecks(jwt, owner) {
  const response = await request(`${ADMIN_SERVER_URL}/decks?owner=${owner}&_sort=name:ASC`, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return Array.isArray(response.data) ? response.data : (response.data.decks || []);
}

/**
 * Serializes error used by the endpoint decks module.
 * @param {Object} error The error object supplies the structured input used by the endpoint decks module, including the `data`, `message`, and `url` properties.
 * @param {Object} error.data The `data` property supplies structured input used by the endpoint decks module.
 * @param {string} error.data.error The `data.error` property supplies structured input used by the endpoint decks module.
 * @param {string} error.message The `message` property supplies structured input used by the endpoint decks module.
 * @param {string} error.url The `url` property supplies structured input used by the endpoint decks module.
 * @returns {(Object|null)} Returns the value produced by the endpoint decks module.
 */
function serializeError(error) {
  if (!error) {
    return null;
  }

  return {
    message: error.data?.error || error.message || 'Deck request failed.',
    status: error.status,
    url: error.url,
    data: error.data || null
  };
}

/**
 * Executes the call update deck helper used by the endpoint decks module.
 * @param {string} jwt The jwt value provides an input used by the endpoint decks module.
 * @param {Object} deck The deck object supplies the structured input used by the endpoint decks module, including the `_id` and `id` properties.
 * @param {string} deck._id The `_id` property supplies structured input used by the endpoint decks module.
 * @param {string} deck.id The `id` property supplies structured input used by the endpoint decks module.
 * @returns {Promise<Object>} Resolves with the value produced by the endpoint decks module.
 */
async function callUpdateDeck(jwt, deck) {
  validateDeckType(jwt, deck);
  const deckID = deck.id || deck._id;
  if (!deckID) {
    throw new Error('Deck id is required for updates.');
  }
  const decks = await request(`${ADMIN_SERVER_URL}/decks/${deckID}`, {
    method: 'PATCH',
    body: normalizeDeckPayload(deck),
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return decks.data;
}

/**
 * Executes the call delete helper used by the endpoint decks module.
 * @param {string} jwt The jwt value provides an input used by the endpoint decks module.
 * @param {(string|number)} guid The guid value provides an input used by the endpoint decks module.
 * @returns {Promise<Object>} Resolves with the value produced by the endpoint decks module.
 */
async function callDelete (jwt, guid) {
  if (typeof jwt !== 'string') {
    throw new Error('Authentication Information Missing');
  }
  const decks = await request(`${ADMIN_SERVER_URL}/decks/${guid}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return decks.data;
}


/**
 * Saves deck used by the endpoint decks module.
 * @param {string} jwt The jwt value provides an input used by the endpoint decks module.
 * @param {Object} deck The deck object supplies the structured input used by the endpoint decks module, including the `_id`, `id`, `name`, and `owner` properties.
 * @param {string} deck._id The `_id` property supplies structured input used by the endpoint decks module.
 * @param {string} deck.id The `id` property supplies structured input used by the endpoint decks module.
 * @param {string} deck.name The `name` property supplies structured input used by the endpoint decks module.
 * @param {string} deck.owner The `owner` property supplies structured input used by the endpoint decks module.
 * @param {string} owner The owner value provides an input used by the endpoint decks module.
 * @param {Function} callback The callback value provides an input used by the endpoint decks module.
 * @returns {Promise<void>} Resolves when the endpoint decks operation completes.
 */
async function saveDeck(jwt, deck, owner, callback) {
  const result = { error: null };
  if (typeof jwt !== 'string' || !jwt.length) {
    callback(serializeError(new Error('Missing session token for deck save.')), []);
    return;
  }
  try {
    if (deck.id || deck._id) {
      await callUpdateDeck(jwt, deck);
      callback(null, result.error || []);
      return;
    }

    const existingDecks = await getDecks(jwt, owner);
    const existingDeck = existingDecks.find((entry) => entry.owner === owner && entry.name === deck.name);
    if (existingDeck) {
      await callUpdateDeck(jwt, {
        ...deck,
        id: existingDeck.id,
        _id: existingDeck._id
      });
      callback(null, result.error || []);
      return;
    }

    await callCreateDeck(jwt, deck);
  } catch (e) {
    result.error = serializeError(e);
    console.log('Failed to save deck', deck.owner, deck.name, e.url, e.status, e.data || e.message);
  }


  result.decks = await getDecks(jwt, owner);

  callback(result.error, result.decks);
}

/**
 * Deletes deck used by the endpoint decks module.
 * @param {string} jwt The jwt value provides an input used by the endpoint decks module.
 * @param {number} deckID The deckID value provides an input used by the endpoint decks module.
 * @param {string} owner The owner value provides an input used by the endpoint decks module.
 * @param {Function} callback The callback value provides an input used by the endpoint decks module.
 * @returns {Promise<void>} Resolves when the endpoint decks operation completes.
 */
async function deleteDeck(jwt, deckID, owner, callback) {
  const results = { error: null };
  if (typeof jwt !== 'string' || !jwt.length) {
    callback(new Error('Missing session token for deck delete.'), []);
    return;
  }
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
  deleteDeck
};
