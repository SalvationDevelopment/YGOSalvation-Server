const assert = require('node:assert/strict');
const test = require('node:test');

const { createLobbyDeckService } = require('../../../server/lobby-deck-service');

function createService(overrides = {}) {
  const calls = [];
  const roomWrites = [];
  const logs = [];
  const service = createLobbyDeckService({
    decksApi: overrides.decksApi || {
      saveDeck(session, deck, username, callback) {
        calls.push(['saveDeck', session, deck, username]);
        callback(null, [{ id: 'deck-1' }]);
      },
      deleteDeck(session, deckId, username, callback) {
        calls.push(['deleteDeck', session, deckId, username]);
        callback(null, [{ id: 'deck-2' }]);
      }
    },
    log(message) {
      logs.push(message);
    },
    roomWrite(roomName, packet) {
      roomWrites.push({ roomName, packet });
    }
  });

  return {
    calls,
    logs,
    roomWrites,
    service
  };
}

test('saveDeckCall normalizes cards, preserves owner, and writes the saved deck packet', () => {
  const { calls, roomWrites, service } = createService();
  const client = {
    id: 'client-1',
    username: 'alice',
    session: 'session-token'
  };

  service.saveDeckCall(client, {
    deck: {
      name: 'Blue-Eyes',
      main: [{ id: '36553319' }, { id: 'not-a-card' }],
      side: [{ id: '62957424' }],
      extra: [{ id: '83531441' }]
    }
  }, 'room-1');

  assert.deepEqual(calls, [
    ['saveDeck', 'session-token', {
      name: 'Blue-Eyes',
      main: [{ id: 36553319 }],
      side: [{ id: 62957424 }],
      extra: [{ id: 83531441 }],
      owner: 'alice'
    }, 'alice']
  ]);
  assert.deepEqual(roomWrites, [
    {
      roomName: 'room-1',
      packet: {
        clientEvent: 'savedDeck',
        error: null,
        savedDecks: [{ id: 'deck-1' }]
      }
    }
  ]);
});

test('saveDeckCall logs persistence errors and still writes the savedDeck packet', () => {
  const { logs, roomWrites, service } = createService({
    decksApi: {
      saveDeck(_session, _deck, _username, callback) {
        callback(new Error('save failed'), []);
      },
      deleteDeck() {}
    }
  });
  const client = {
    id: 'client-2',
    username: 'alice',
    session: 'session-token'
  };

  service.saveDeckCall(client, {
    deck: {
      name: 'Dark Magician',
      main: [],
      side: [],
      extra: []
    }
  }, 'room-2');

  assert.deepEqual(logs, [
    'deck save failed for alice: save failed'
  ]);
  assert.equal(roomWrites.length, 1);
  assert.equal(roomWrites[0].roomName, 'room-2');
  assert.equal(roomWrites[0].packet.clientEvent, 'savedDeck');
  assert.equal(roomWrites[0].packet.error.message, 'save failed');
  assert.deepEqual(roomWrites[0].packet.savedDecks, []);
});

test('deleteDeckCall delegates the delete and writes the deletedDeck packet', () => {
  const { calls, roomWrites, service } = createService();
  const client = {
    id: 'client-3',
    username: 'alice',
    session: 'session-token'
  };

  service.deleteDeckCall(client, {
    deck: {
      id: 'deck-3'
    }
  }, 'room-3');

  assert.deepEqual(calls, [
    ['deleteDeck', 'session-token', 'deck-3', 'alice']
  ]);
  assert.deepEqual(roomWrites, [
    {
      roomName: 'room-3',
      packet: {
        clientEvent: 'deletedDeck',
        error: null,
        savedDecks: [{ id: 'deck-2' }],
        id: 'deck-3'
      }
    }
  ]);
});

test('deck service ignores requests without an authenticated owner or deck payload', () => {
  const { calls, roomWrites, service } = createService();

  service.saveDeckCall({
    id: 'client-4',
    session: 'session-token'
  }, {
    deck: {
      name: 'Ignored'
    }
  }, 'room-4');
  service.deleteDeckCall({
    id: 'client-4',
    username: 'alice',
    session: 'session-token'
  }, {}, 'room-4');

  assert.deepEqual(calls, []);
  assert.deepEqual(roomWrites, []);
});
