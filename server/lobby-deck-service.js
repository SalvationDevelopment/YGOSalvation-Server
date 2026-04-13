'use strict';

/**
 * Creates lobby deck service used by the lobby deck service module.
 * @param {Object} options The options object supplies the structured input used by the lobby deck service module.
 * @param {Object} options.decksApi The `decksApi` property supplies structured input used by the lobby deck service module.
 * @param {Function} options.log The `log` property supplies structured input used by the lobby deck service module.
 * @param {Function} options.roomWrite The `roomWrite` property supplies structured input used by the lobby deck service module.
 * @returns {{deleteDeckCall: Function, saveDeckCall: Function}} Returns the value produced by the lobby deck service module.
 */
function createLobbyDeckService({
  decksApi,
  log = () => {},
  roomWrite
}) {
  /**
   * Maps cards used by the lobby deck service module.
   * @param {Array} deck The deck array supplies the ordered values used by the lobby deck service module.
   * @returns {Array} Returns the value produced by the lobby deck service module.
   */
  function mapCards(deck) {
    if (!Array.isArray(deck)) {
      return [];
    }

    return deck
      .map((cardInDeck) => ({ id: Number(cardInDeck?.id) || 0 }))
      .filter((card) => card.id > 0);
  }

  /**
   * Saves deck used by the lobby deck service module.
   * @param {Object} client The client object supplies the structured input used by the lobby deck service module.
   * @param {Object} data The data object supplies the structured input used by the lobby deck service module.
   * @param {string} roomName The roomName value provides an input used by the lobby deck service module.
   * @returns {void} Does not return a value.
   */
  function saveDeckCall(client, data, roomName) {
    if (!client.username || !data?.deck) {
      return;
    }

    const deck = Object.assign({}, data.deck, {
      main: mapCards(data.deck.main),
      side: mapCards(data.deck.side),
      extra: mapCards(data.deck.extra),
      owner: client.username
    });
    const session = data.session || client.session;

    decksApi.saveDeck(session, deck, client.username, (error, savedDecks) => {
      if (error) {
        log(`deck save failed for ${client.username}: ${error.message || error}`);
      }

      roomWrite(roomName, {
        clientEvent: 'savedDeck',
        error,
        savedDecks
      });
    });
  }

  /**
   * Deletes deck used by the lobby deck service module.
   * @param {Object} client The client object supplies the structured input used by the lobby deck service module.
   * @param {Object} data The data object supplies the structured input used by the lobby deck service module.
   * @param {string} roomName The roomName value provides an input used by the lobby deck service module.
   * @returns {void} Does not return a value.
   */
  function deleteDeckCall(client, data, roomName) {
    if (!client.username || !data?.deck) {
      return;
    }

    decksApi.deleteDeck(
      data.session || client.session,
      data.deck.id,
      client.username,
      (error, savedDecks) => {
        roomWrite(roomName, {
          clientEvent: 'deletedDeck',
          error,
          savedDecks,
          id: data.deck.id
        });
      }
    );
  }

  return {
    deleteDeckCall,
    saveDeckCall
  };
}

module.exports = {
  createLobbyDeckService
};
