const assert = require('node:assert/strict');
const test = require('node:test');

const { createLobbyClientRegistry } = require('../../../server/lobby-client-registry');
const { createLobbyState } = require('../../../server/lobby-state');

test('lobby client registry tracks connected clients and room membership explicitly', () => {
  const state = createLobbyState();
  const delivered = [];
  const registry = createLobbyClientRegistry({
    state,
    sendPacket(client, packet) {
      delivered.push([client.id, packet]);
    }
  });

  const clientA = { id: 'client-a' };
  const clientB = { id: 'client-b' };

  registry.addClient(clientA);
  registry.addClient(clientB);
  registry.joinRoom(clientA, 'room-1');
  registry.joinRoom(clientB, 'room-1');
  registry.joinRoom(clientA, 'room-2');

  registry.broadcast({ clientEvent: 'all' });
  registry.roomWrite('room-2', { clientEvent: 'room-only' });
  registry.removeClient(clientA);

  assert.equal(state.clients.has(clientA.id), false);
  assert.equal(state.clients.has(clientB.id), true);
  assert.equal(state.socketRooms.has(clientA.id), false);
  assert.equal(state.roomSockets.has('room-2'), false);
  assert.deepEqual([...state.roomSockets.get('room-1')], ['client-b']);
  assert.deepEqual(delivered, [
    ['client-a', { clientEvent: 'all' }],
    ['client-b', { clientEvent: 'all' }],
    ['client-a', { clientEvent: 'room-only' }]
  ]);
});
