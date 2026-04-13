const assert = require('node:assert/strict');
const test = require('node:test');

const { createLobbyState } = require('../../../server/lobby-state');
const { createLobbyChatService } = require('../../../server/lobby-chat-service');

function createService(overrides = {}) {
  const state = overrides.state || createLobbyState();
  const broadcasts = [];
  const packets = [];
  const roomWrites = [];
  const bridgeCalls = [];
  const timerCalls = [];
  const chatBridge = overrides.chatBridge === null
    ? null
    : overrides.chatBridge || {
      attachClient(client) {
        bridgeCalls.push(['attachClient', client]);
      },
      detachClient(clientId) {
        bridgeCalls.push(['detachClient', clientId]);
      },
      sendMessage(clientId, message, channel) {
        bridgeCalls.push(['sendMessage', clientId, message, channel]);
      },
      syncClient(clientId) {
        bridgeCalls.push(['syncClient', clientId]);
      },
      listRooms(clientId) {
        bridgeCalls.push(['listRooms', clientId]);
      },
      joinChannel(clientId, channel) {
        bridgeCalls.push(['joinChannel', clientId, channel]);
      },
      createChannel(clientId, channel) {
        bridgeCalls.push(['createChannel', clientId, channel]);
      }
    };
  const service = createLobbyChatService({
    state,
    broadcast(packet) {
      broadcasts.push(packet);
    },
    chatBridge,
    createChatId: overrides.createChatId || (() => 'chat-1'),
    dateFactory: overrides.dateFactory || (() => new Date('2026-04-13T12:00:00.000Z')),
    roomWrite(roomName, packet) {
      roomWrites.push({ roomName, packet });
    },
    sanitizeMessage: overrides.sanitizeMessage || ((message) => String(message || '').replaceAll('<', '&lt;')),
    sendPacket(client, packet) {
      packets.push({
        clientId: client?.id,
        packet
      });
    },
    setTimeoutFn: overrides.setTimeoutFn || ((callback, delay) => {
      timerCalls.push({ callback, delay });
      return `timer-${timerCalls.length}`;
    }),
    validateUser: overrides.validateUser || ((_attempt, _data, callback) => {
      callback(null, true, {
        success: true,
        data: {
          g_access_cp: '1'
        }
      });
    })
  });

  return {
    broadcasts,
    bridgeCalls,
    packets,
    roomWrites,
    service,
    state,
    timerCalls
  };
}

test('chatLineCall sanitizes, stores, and broadcasts chat packets', () => {
  const { broadcasts, service, state, timerCalls } = createService();
  const client = {
    id: 'client-1',
    username: 'alice',
    speak: true
  };

  service.chatLineCall(client, {
    msg: '<b>hello</b>',
    timezone: 'UTC'
  }, 'room-1');

  assert.equal(client.speak, false);
  assert.deepEqual(broadcasts, [
    {
      clientEvent: 'chatline',
      from: 'alice',
      msg: '&lt;b>hello&lt;/b>',
      uid: 'chat-1',
      date: new Date('2026-04-13T12:00:00.000Z'),
      timezone: 'UTC'
    }
  ]);
  assert.deepEqual(state.chatbox, broadcasts);
  assert.equal(timerCalls.length, 1);
  assert.equal(timerCalls[0].delay, 500);

  timerCalls[0].callback();
  assert.equal(client.speak, true);
});

test('chatLineCall reports slowchat when the client is rate limited', () => {
  const { roomWrites, service } = createService();
  const client = {
    id: 'client-2',
    username: 'alice',
    speak: false
  };

  service.chatLineCall(client, {
    msg: 'hello again'
  }, 'room-2');

  assert.deepEqual(roomWrites, [
    {
      roomName: 'room-2',
      packet: {
        clientEvent: 'slowchat',
        error: 'Exceeded 500ms chat timeout'
      }
    }
  ]);
});

test('privateMessageCall writes a timestamped packet into the recipient room', () => {
  const { roomWrites, service } = createService();
  const client = {
    id: 'client-3',
    username: 'alice'
  };

  service.privateMessageCall(client, {
    to: 'bob',
    message: 'secret'
  });

  assert.deepEqual(roomWrites, [
    {
      roomName: 'bob',
      packet: {
        to: 'bob',
        message: 'secret',
        date: new Date('2026-04-13T12:00:00.000Z')
      }
    }
  ]);
});

test('censorCall removes the targeted chat history entry after validation', () => {
  const state = createLobbyState();
  state.adminlist.alice = true;
  state.chatbox = [
    { uid: '100', msg: 'keep' },
    { uid: '101', msg: 'remove' }
  ];
  const { broadcasts, service } = createService({ state });

  service.censorCall({
    username: 'alice',
    messageID: 101
  });

  assert.deepEqual(broadcasts, [
    {
      clientEvent: 'censor',
      messageID: 101
    }
  ]);
  assert.deepEqual(state.chatbox, [
    { uid: '100', msg: 'keep' }
  ]);
});

test('globalCall updates the shared global message for validated admins', () => {
  const state = createLobbyState();
  state.adminlist.alice = true;
  const { broadcasts, service } = createService({ state });

  service.globalCall({
    username: 'alice',
    message: 'Server maintenance soon'
  });

  assert.equal(state.currentGlobalMessage, 'Server maintenance soon');
  assert.deepEqual(broadcasts, [
    {
      clientEvent: 'global',
      message: 'Server maintenance soon'
    }
  ]);
});

test('chat bridge attachment and IRC helpers delegate through the bridge', () => {
  const { bridgeCalls, packets, service } = createService();
  const client = {
    id: 'client-4',
    username: 'alice',
    session: 'session-token'
  };

  service.attachClient(client);
  service.sendIrcMessage(client, {
    message: 'hello',
    channel: '#salvation'
  });
  service.syncIrcClient(client);
  service.listIrcRooms(client);
  service.joinIrcRoom(client, {
    channel: '#duel'
  });
  service.createIrcRoom(client, {
    channel: '#new-room'
  });
  service.disconnectIrcClient(client);
  service.detachClient(client.id);

  assert.equal(bridgeCalls.length, 8);
  assert.equal(bridgeCalls[0][0], 'attachClient');
  assert.equal(bridgeCalls[0][1].clientId, 'client-4');
  assert.equal(bridgeCalls[0][1].username, 'alice');
  assert.equal(bridgeCalls[0][1].session, 'session-token');
  bridgeCalls[0][1].deliver({
    clientEvent: 'irc_state',
    status: 'ready'
  });
  assert.deepEqual(packets, [
    {
      clientId: 'client-4',
      packet: {
        clientEvent: 'irc_state',
        status: 'ready'
      }
    }
  ]);
  assert.deepEqual(bridgeCalls.slice(1), [
    ['sendMessage', 'client-4', 'hello', '#salvation'],
    ['syncClient', 'client-4'],
    ['listRooms', 'client-4'],
    ['joinChannel', 'client-4', '#duel'],
    ['createChannel', 'client-4', '#new-room'],
    ['detachClient', 'client-4'],
    ['detachClient', 'client-4']
  ]);
});
