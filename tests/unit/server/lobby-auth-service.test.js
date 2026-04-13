const assert = require('node:assert/strict');
const test = require('node:test');

const { createLobbyState } = require('../../../server/lobby-state');
const { createLobbyAuthService } = require('../../../server/lobby-auth-service');

function createService(overrides = {}) {
  const state = overrides.state || createLobbyState();
  const authenticatedClients = [];
  const broadcasts = [];
  const packets = [];
  const joins = [];
  const logs = [];

  const service = createLobbyAuthService({
    state,
    broadcast(packet) {
      broadcasts.push(packet);
    },
    joinRoom(client, roomName) {
      joins.push({
        clientId: client.id,
        roomName
      });
    },
    log(message) {
      logs.push(message);
    },
    onAuthenticatedClient(client) {
      authenticatedClients.push({
        id: client.id,
        username: client.username,
        session: client.session
      });
    },
    roomStatePacket: overrides.roomStatePacket || (() => ({
      clientEvent: 'gamelist',
      gamelist: state.gamelist,
      ackresult: state.acklevel,
      userlist: state.userlist
    })),
    sendPacket(client, packet) {
      packets.push({
        clientId: client?.id,
        packet
      });
    },
    validateLogin: overrides.validateLogin || ((_attempt, _data, callback) => {
      callback(null, true, {
        user: {
          username: 'alice',
          friends: ['bob'],
          sessionExpiration: '2099-01-01T00:00:00.000Z',
          ranking: 7,
          admin: true,
          rewards: ['reward'],
          settings: {
            locale: 'en'
          },
          bans: [],
          role: {
            name: 'Administrator'
          }
        },
        jwt: 'jwt-login',
        decks: [{ id: 1, name: 'Blue-Eyes' }]
      });
    }),
    validateUserSession: overrides.validateUserSession || ((_data, callback) => {
      callback(null, true, {
        username: 'alice',
        decks: [{ id: 2, name: 'Dark Magician' }],
        friends: ['bob'],
        admin: true,
        rewards: ['reward'],
        settings: {
          locale: 'en'
        },
        bans: []
      });
    })
  });

  return {
    authenticatedClients,
    broadcasts,
    joins,
    logs,
    packets,
    service,
    state
  };
}

test('registrationCall updates lobby auth state and announces the login', () => {
  const {
    authenticatedClients,
    broadcasts,
    joins,
    logs,
    packets,
    service,
    state
  } = createService();
  state.currentGlobalMessage = 'Welcome to the lobby';
  state.acklevel = 2;
  state.userlist = ['alice'];
  state.chatbox = [{ uid: 'chat-1', msg: 'hello' }];
  const client = { id: 'client-1', speak: false };

  service.registrationCall({
    username: 'alice',
    password: 'secret'
  }, client);

  assert.equal(client.username, 'alice');
  assert.equal(client.session, 'jwt-login');
  assert.equal(client.admin, true);
  assert.equal(client.speak, true);
  assert.equal(state.adminlist.alice, true);
  assert.deepEqual(packets, [
    {
      clientId: 'client-1',
      packet: {
        clientEvent: 'global',
        message: 'Welcome to the lobby',
        admin: true
      }
    },
    {
      clientId: 'client-1',
      packet: {
        clientEvent: 'ackresult',
        ackresult: 2,
        userlist: ['alice']
      }
    },
    {
      clientId: 'client-1',
      packet: {
        clientEvent: 'login',
        info: {
          username: 'alice',
          decks: [{ id: 1, name: 'Blue-Eyes' }],
          friends: ['bob'],
          session: 'jwt-login',
          sessionExpiration: '2099-01-01T00:00:00.000Z',
          ranking: 7,
          admin: true,
          rewards: ['reward'],
          settings: {
            locale: 'en'
          },
          bans: []
        },
        chatbox: [{ uid: 'chat-1', msg: 'hello' }]
      }
    }
  ]);
  assert.deepEqual(joins, [
    {
      clientId: 'client-1',
      roomName: 'alice'
    }
  ]);
  assert.deepEqual(broadcasts, [
    {
      clientEvent: 'gamelist',
      gamelist: {},
      ackresult: 2,
      userlist: ['alice']
    }
  ]);
  assert.deepEqual(authenticatedClients, [
    {
      id: 'client-1',
      username: 'alice',
      session: 'jwt-login'
    }
  ]);
  assert.deepEqual(logs, ['alice logged in']);
});

test('registrationCall reports login validation errors without mutating the client', () => {
  const { broadcasts, joins, packets, service } = createService({
    validateLogin(_attempt, _data, callback) {
      callback(new Error('Invalid credentials'), false, {});
    }
  });
  const client = { id: 'client-2' };

  service.registrationCall({
    username: 'alice',
    password: 'wrong'
  }, client);

  assert.equal(client.username, undefined);
  assert.equal(client.session, undefined);
  assert.equal(client.admin, undefined);
  assert.equal(broadcasts.length, 0);
  assert.deepEqual(joins, []);
  assert.equal(packets.length, 2);
  assert.deepEqual(packets[0], {
    clientId: 'client-2',
    packet: {
      clientEvent: 'servererror',
      message: ''
    }
  });
  assert.equal(packets[1].clientId, 'client-2');
  assert.equal(packets[1].packet.clientEvent, 'login');
  assert.equal(packets[1].packet.info.message, 'Invalid credentials');
  assert.equal(packets[1].packet.error.message, 'Invalid credentials');
});

test('validateSession restores the client session and rejoins the personal room', () => {
  const {
    authenticatedClients,
    broadcasts,
    joins,
    packets,
    service,
    state
  } = createService();
  state.currentGlobalMessage = 'Lobby online';
  state.acklevel = 5;
  state.userlist = ['alice', 'bob'];
  state.chatbox = [{ uid: 'chat-9', msg: 'sync' }];
  state.adminlist.alice = true;
  const client = { id: 'client-3', speak: false };

  service.validateSession({
    username: 'alice',
    session: 'jwt-session'
  }, client);

  assert.equal(client.username, 'alice');
  assert.equal(client.session, 'jwt-session');
  assert.equal(client.speak, true);
  assert.deepEqual(joins, [
    {
      clientId: 'client-3',
      roomName: 'alice'
    }
  ]);
  assert.deepEqual(packets, [
    {
      clientId: 'client-3',
      packet: {
        clientEvent: 'global',
        message: 'Lobby online',
        admin: true
      }
    },
    {
      clientId: 'client-3',
      packet: {
        clientEvent: 'ackresult',
        ackresult: 5,
        userlist: ['alice', 'bob']
      }
    },
    {
      clientId: 'client-3',
      packet: {
        clientEvent: 'login',
        info: {
          username: 'alice',
          decks: [{ id: 2, name: 'Dark Magician' }],
          friends: ['bob'],
          session: 'jwt-session',
          admin: true,
          rewards: ['reward'],
          settings: {
            locale: 'en'
          },
          bans: []
        },
        chatbox: [{ uid: 'chat-9', msg: 'sync' }]
      }
    }
  ]);
  assert.deepEqual(broadcasts, []);
  assert.deepEqual(authenticatedClients, [
    {
      id: 'client-3',
      username: 'alice',
      session: 'jwt-session'
    }
  ]);
});
