const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createRuntimeDispatcher,
  getMessageOwner
} = require('../../../server/runtime-dispatcher');

test('getMessageOwner preserves legacy action precedence', () => {
  assert.equal(getMessageOwner(null), null);
  assert.equal(getMessageOwner({}), null);
  assert.equal(getMessageOwner({ type: 'join_room' }), 'room');
  assert.equal(getMessageOwner({ action: 'gamelistrequest' }), 'lobby');
  assert.equal(getMessageOwner({ action: 'join' }), 'room');
  assert.equal(getMessageOwner({ action: 'lock' }), 'room');
  assert.equal(getMessageOwner({ action: 'determine' }), null);
  assert.equal(
    getMessageOwner({
      action: 'loadSession',
      type: 'join_room'
    }),
    'lobby'
  );
});

test('runtime dispatcher initializes the room runtime only for room packets', () => {
  const calls = [];
  const packets = [];
  const lobby = {
    handleConnection(client) {
      calls.push(['lobby.handleConnection', client.id]);
    },
    handleMessage(client, message) {
      calls.push(['lobby.handleMessage', client.id, message.action]);
      return true;
    },
    removeClient(client) {
      calls.push(['lobby.removeClient', client.id]);
    }
  };
  const roomManager = {
    handleConnection(client) {
      calls.push(['room.handleConnection', client.id]);
      client.send('room_list', {
        rooms: [{ id: 'room-1' }]
      });
    },
    handleMessage(client, message) {
      calls.push(['room.handleMessage', client.id, message.type]);
    },
    removeClient(client) {
      calls.push(['room.removeClient', client.id]);
    }
  };
  const dispatcher = createRuntimeDispatcher({
    lobby,
    roomManager
  });
  const client = {
    id: 'client-1',
    roomId: null,
    send() {},
    sendPacket(packet) {
      packets.push(packet);
    }
  };

  dispatcher.handleConnection(client);
  dispatcher.handleMessage(client, { action: 'gamelistrequest' });
  dispatcher.handleMessage(client, { type: 'list_rooms' });
  dispatcher.handleMessage(client, { type: 'join_room', payload: { roomId: 'room-1' } });
  dispatcher.removeClient(client);

  assert.deepEqual(calls, [
    ['lobby.handleConnection', 'client-1'],
    ['lobby.handleMessage', 'client-1', 'gamelistrequest'],
    ['room.handleConnection', 'client-1'],
    ['room.handleMessage', 'client-1', 'list_rooms'],
    ['room.handleMessage', 'client-1', 'join_room'],
    ['lobby.removeClient', 'client-1'],
    ['room.removeClient', 'client-1']
  ]);
  assert.deepEqual(packets, []);
});

test('runtime dispatcher keeps ambiguous packets on the legacy path', () => {
  const calls = [];
  const dispatcher = createRuntimeDispatcher({
    lobby: {
      handleConnection() {},
      handleMessage(client, message) {
        calls.push(['lobby', client.id, message.action, message.type]);
        return true;
      },
      removeClient() {}
    },
    roomManager: {
      handleConnection() {
        calls.push(['room.handleConnection']);
      },
      handleMessage() {
        calls.push(['room.handleMessage']);
      },
      removeClient() {}
    }
  });

  dispatcher.handleMessage(
    { id: 'client-2', roomId: null },
    { action: 'loadSession', type: 'join_room' }
  );

  assert.deepEqual(calls, [['lobby', 'client-2', 'loadSession', 'join_room']]);
});

test('runtime dispatcher translates legacy room actions into canonical room commands', () => {
  const calls = [];
  const packets = [];
  const dispatcher = createRuntimeDispatcher({
    lobby: {
      handleConnection() {},
      handleMessage() {
        calls.push(['lobby.handleMessage']);
        return true;
      },
      removeClient() {}
    },
    roomManager: {
      handleConnection(client) {
        calls.push(['room.handleConnection', client.id]);
        client.send('room_joined', { roomId: 'room-4' });
      },
      handleMessage(client, message) {
        calls.push(['room.handleMessage', client.id, message.type, message.payload]);
      },
      removeClient() {}
    }
  });

  const client = {
    id: 'client-3',
    roomId: null,
    send() {},
    sendPacket(packet) {
      packets.push(packet);
    }
  };

  dispatcher.handleMessage(client, {
    action: 'lock',
    deck: {
      main: [36553319],
      extra: [83531441],
      side: []
    }
  });

  assert.deepEqual(calls, [
    ['room.handleConnection', 'client-3'],
    [
      'room.handleMessage',
      'client-3',
      'submit_deck',
      {
        deck: {
          main: [36553319],
          extra: [83531441],
          side: []
        }
      }
    ]
  ]);
  assert.deepEqual(packets, [
    {
      action: 'room_joined',
      roomId: 'room-4'
    }
  ]);
});
