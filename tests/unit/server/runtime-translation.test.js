const assert = require('node:assert/strict');
const test = require('node:test');

const {
  attachRoomClientProtocol,
  normalizeLegacyLobbyAction,
  translateIncomingRuntimeMessage,
  translateOutgoingRoomPacket
} = require('../../../server/runtime-translation');

test('runtime translation normalizes legacy lobby aliases without changing ownership', () => {
  assert.equal(normalizeLegacyLobbyAction('listen'), 'register');
  assert.equal(normalizeLegacyLobbyAction('listen('), 'register');
  assert.equal(normalizeLegacyLobbyAction('loadSession'), 'loadSession');

  assert.deepEqual(
    translateIncomingRuntimeMessage({ action: 'listen', username: 'Zayel' }),
    {
      owner: 'lobby',
      protocolMode: 'legacy-lobby',
      message: {
        action: 'register',
        username: 'Zayel'
      }
    }
  );
});

test('runtime translation maps legacy room actions into canonical room messages', () => {
  assert.deepEqual(
    translateIncomingRuntimeMessage({ action: 'join', roomId: 'room-2' }),
    {
      owner: 'room',
      protocolMode: 'legacy-room',
      message: {
        type: 'join_room',
        payload: {
          roomId: 'room-2'
        }
      }
    }
  );

  assert.deepEqual(
    translateIncomingRuntimeMessage({
      action: 'lock',
      deck: {
        main: [1001],
        extra: [2002],
        side: []
      }
    }),
    {
      owner: 'room',
      protocolMode: 'legacy-room',
      message: {
        type: 'submit_deck',
        payload: {
          deck: {
            main: [1001],
            extra: [2002],
            side: []
          }
        }
      }
    }
  );

  assert.deepEqual(
    translateIncomingRuntimeMessage({
      action: 'question',
      answer: { type: 'yesno', value: true }
    }),
    {
      owner: 'room',
      protocolMode: 'legacy-room',
      message: {
        type: 'ocg_response',
        payload: {
          response: { type: 'yesno', value: true }
        }
      }
    }
  );
});

test('runtime translation converts canonical room packets back into action packets for legacy room clients', () => {
  assert.equal(
    translateOutgoingRoomPacket('room_state', { roomId: 'room-1' }, 'canonical'),
    null
  );

  assert.deepEqual(
    translateOutgoingRoomPacket('room_state', { roomId: 'room-1' }, 'legacy-room'),
    {
      action: 'room_state',
      roomId: 'room-1'
    }
  );

  assert.deepEqual(
    translateOutgoingRoomPacket('error', { message: 'Failed to start duel.' }, 'legacy-room'),
    {
      action: 'error',
      error: 'Failed to start duel.',
      message: 'Failed to start duel.'
    }
  );
});

test('runtime translation adapts client.send for room protocol compatibility', () => {
  const sent = [];
  const client = {
    send(type, payload) {
      sent.push(['send', type, payload]);
    },
    sendPacket(packet) {
      sent.push(['sendPacket', packet]);
    }
  };

  attachRoomClientProtocol(client, 'legacy-room');
  client.send('room_joined', { roomId: 'room-3' });
  client.send('error', { message: 'Room is full.' });

  assert.deepEqual(sent, [
    ['sendPacket', { action: 'room_joined', roomId: 'room-3' }],
    ['sendPacket', { action: 'error', error: 'Room is full.', message: 'Room is full.' }]
  ]);
});
