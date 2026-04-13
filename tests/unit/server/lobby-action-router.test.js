const assert = require('node:assert/strict');
const test = require('node:test');

const { createLobbyState } = require('../../../server/lobby-state');
const {
  createLobbyActionRouter,
  normalizeLobbyAction
} = require('../../../server/lobby-action-router');

function createRouter(overrides = {}) {
  const calls = [];
  const state = overrides.state || createLobbyState();
  const router = createLobbyActionRouter({
    state,
    broadcast(packet) {
      calls.push(['broadcast', packet]);
    },
    chatLineCall(client, data, roomName) {
      calls.push(['chatLineCall', client.id, roomName, data.msg]);
    },
    closeProxyConnection(client) {
      calls.push(['closeProxyConnection', client.id]);
    },
    censorCall(data) {
      calls.push(['censorCall', data]);
    },
    createIrcRoom(client, data) {
      calls.push(['createIrcRoom', client.id, data.channel]);
    },
    deleteDeckCall(client, data, roomName) {
      calls.push(['deleteDeckCall', client.id, roomName, data.deck?.id]);
    },
    disconnectIrcClient(client) {
      calls.push(['disconnectIrcClient', client.id]);
    },
    forwardToProxy(client, payload) {
      calls.push(['forwardToProxy', client.id, payload]);
      return false;
    },
    gamelistRequested(client) {
      calls.push(['gamelistRequested', client.id]);
    },
    genocideCall(data) {
      calls.push(['genocideCall', data]);
    },
    globalCall(data) {
      calls.push(['globalCall', data]);
    },
    globalRequested(client) {
      calls.push(['globalRequested', client.id]);
    },
    joinRoom(client, roomName) {
      calls.push(['joinRoom', client.id, roomName]);
    },
    joinIrcRoom(client, data) {
      calls.push(['joinIrcRoom', client.id, data.channel]);
    },
    listIrcRooms(client) {
      calls.push(['listIrcRooms', client.id]);
    },
    mindCrushCall(data) {
      calls.push(['mindCrushCall', data]);
    },
    murderCall(data) {
      calls.push(['murderCall', data]);
    },
    openProxyConnection(client, port) {
      calls.push(['openProxyConnection', client.id, port]);
    },
    privateMessageCall(client, data) {
      calls.push(['privateMessageCall', client.id, data.to]);
    },
    registrationCall(data, client) {
      calls.push(['registrationCall', client.id, data.action]);
    },
    reviveCall(data) {
      calls.push(['reviveCall', data]);
    },
    saveDeckCall(client, data, roomName) {
      calls.push(['saveDeckCall', client.id, roomName, data.deck]);
    },
    sendIrcMessage(client, data) {
      calls.push(['sendIrcMessage', client.id, data.channel, data.message]);
    },
    sendPacket(client, packet) {
      calls.push(['sendPacket', client.id, packet]);
    },
    spawnHostedChild(hostConfig, options) {
      calls.push(['spawnHostedChild', hostConfig, options?.client?.id]);
    },
    syncIrcClient(client) {
      calls.push(['syncIrcClient', client.id]);
    },
    validateSession(data, client) {
      calls.push(['validateSession', client.id, data.session]);
    },
    ...overrides
  });

  return {
    calls,
    router,
    state
  };
}

test('normalizeLobbyAction maps legacy listen packets to register', () => {
  assert.equal(normalizeLobbyAction('listen'), 'register');
  assert.equal(normalizeLobbyAction('listen('), 'register');
  assert.equal(normalizeLobbyAction('register'), 'register');
  assert.equal(normalizeLobbyAction(undefined), '');
});

test('lobby action router joins the derived room and routes register-like actions through registrationCall', () => {
  const { calls, router } = createRouter();
  const client = {
    id: 'client-1',
    address: { ip: '192.0.2.5' }
  };

  router.handleAction(client, {
    action: 'listen',
    uniqueID: 'abc123'
  });

  assert.deepEqual(calls, [
    ['joinRoom', 'client-1', '192.0.2.5abc123'],
    ['registrationCall', 'client-1', 'listen']
  ]);
});

test('lobby action router reports proxied payload failures through the router table', () => {
  const { calls, router } = createRouter();
  const client = {
    id: 'client-2',
    address: { ip: '198.51.100.7' }
  };

  router.handleAction(client, {
    action: 'proxy_message',
    uniqueID: 'proxy-room',
    payload: {
      action: 'join_room',
      payload: { roomId: 'room-9' }
    }
  });

  assert.deepEqual(calls, [
    ['joinRoom', 'client-2', '198.51.100.7proxy-room'],
    [
      'forwardToProxy',
      'client-2',
      {
        action: 'join_room',
        payload: { roomId: 'room-9' }
      }
    ],
    [
      'sendPacket',
      'client-2',
      {
        action: 'proxy',
        status: 'down',
        error: 'Proxy unavailable for proxied payload.'
      }
    ]
  ]);
});

test('lobby action router delegates deck persistence actions to the injected deck service', () => {
  const { calls, router } = createRouter();
  const client = {
    id: 'client-3',
    address: { ip: '203.0.113.1' },
    session: 'session-token',
    username: 'alice'
  };

  router.handleAction(client, {
    action: 'save',
    uniqueID: 'deck-room',
    deck: {
      main: [{ id: '36553319' }, { id: 'not-a-card' }],
      side: [{ id: '62957424' }],
      extra: [{ id: '83531441' }]
    }
  });
  router.handleAction(client, {
    action: 'delete',
    uniqueID: 'deck-room',
    deck: {
      id: 'deck-1'
    }
  });

  assert.deepEqual(calls, [
    ['joinRoom', 'client-3', '203.0.113.1deck-room'],
    ['saveDeckCall', 'client-3', '203.0.113.1deck-room', {
      main: [{ id: '36553319' }, { id: 'not-a-card' }],
      side: [{ id: '62957424' }],
      extra: [{ id: '83531441' }]
    }],
    ['joinRoom', 'client-3', '203.0.113.1deck-room'],
    ['deleteDeckCall', 'client-3', '203.0.113.1deck-room', 'deck-1']
  ]);
});

test('lobby action router delegates chat, private messages, and IRC actions to injected services', () => {
  const { calls, router } = createRouter();
  const client = {
    id: 'client-4',
    address: { ip: '203.0.113.9' },
    username: 'alice'
  };

  router.handleAction(client, {
    action: 'chatline',
    uniqueID: 'chat-room',
    msg: 'hello'
  });
  router.handleAction(client, {
    action: 'privateMessage',
    uniqueID: 'chat-room',
    to: 'bob'
  });
  router.handleAction(client, {
    action: 'irc_message',
    uniqueID: 'chat-room',
    channel: '#salvation',
    message: 'hello irc'
  });

  assert.deepEqual(calls, [
    ['joinRoom', 'client-4', '203.0.113.9chat-room'],
    ['chatLineCall', 'client-4', '203.0.113.9chat-room', 'hello'],
    ['joinRoom', 'client-4', '203.0.113.9chat-room'],
    ['privateMessageCall', 'client-4', 'bob'],
    ['joinRoom', 'client-4', '203.0.113.9chat-room'],
    ['sendIrcMessage', 'client-4', '#salvation', 'hello irc']
  ]);
});
