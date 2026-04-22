const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const { EventEmitter } = require('node:events');

const { LobbyState } = require('../../../server/lobby-state');
const {
  LobbyHostedGameService
} = require('../../../server/lobby-hosted-game-service');

class FakeChild extends EventEmitter {
  constructor(pid = 321) {
    super();
    this.pid = pid;
    this.sent = [];
  }

  send(payload) {
    this.sent.push(payload);
  }
}

function createService(overrides = {}) {
  const state = overrides.state || new LobbyState();
  const broadcasts = [];
  const packets = [];
  const forkCalls = [];
  const children = [];
  const service = new LobbyHostedGameService({
    state,
    broadcast(packet) {
      broadcasts.push(packet);
    },
    consoleLog() {},
    dateNow: overrides.dateNow || Date.now,
    logDuel: overrides.logDuel || ((_message, callback) => callback()),
    parseHostConfig: overrides.parseHostConfig || ((config) => config),
    roomStatePacket: overrides.roomStatePacket || (() => ({
      clientEvent: 'gamelist',
      gamelist: state.gamelist,
      ackresult: state.acklevel,
      userlist: state.userlist
    })),
    sendPacket(client, packet) {
      packets.push({ clientId: client?.id, packet });
    },
    validateSession: overrides.validateSession || ((_data, callback) => {
      callback(null, true, { username: 'alice' });
    }),
    clearTimeoutFn: overrides.clearTimeoutFn || clearTimeout,
    forkProcess: overrides.forkProcess || ((entry, argv, options) => {
      const child = new FakeChild();
      forkCalls.push({ entry, argv, options, child });
      children.push(child);
      return child;
    }),
    gameChildCwd: overrides.gameChildCwd || 'C:\\repo\\server\\game',
    pathModule: path,
    processArgv: overrides.processArgv || ['node', 'server.js'],
    processEnv: overrides.processEnv || {},
    setTimeoutFn: overrides.setTimeoutFn || setTimeout
  });

  return {
    broadcasts,
    children,
    forkCalls,
    packets,
    service,
    state
  };
}

test('spawnHostedChild boots the restructured game child and handles ready packets', () => {
  const { broadcasts, forkCalls, packets, service, state } = createService({
    parseHostConfig(config) {
      return {
        ...config,
        hostPort: 5150,
        roompass: 'room-1'
      };
    }
  });
  const client = { id: 'client-1' };
  let readyResult = null;

  const child = service.spawnHostedChild(
    { hostPort: 5150, roompass: 'room-1' },
    {
      client,
      onReady(result) {
        readyResult = result;
      }
    }
  );

  assert.equal(forkCalls.length, 1);
  assert.deepEqual(forkCalls[0].entry, './core/index.js');
  assert.deepEqual(forkCalls[0].argv, ['node', 'server.js']);
  assert.equal(
    forkCalls[0].options.cwd,
    path.resolve('C:\\repo\\server\\game')
  );
  assert.equal(
    JSON.parse(forkCalls[0].options.env.HOST_CONFIG_JSON).hostPort,
    5150
  );
  assert.equal(state.gamePorts[5150], child);

  child.emit('message', {
    action: 'ready',
    roompass: 'room-1',
    port: 5150,
    password: '',
    game: {
      roompass: 'room-1',
      roomName: 'Hosted Duel'
    }
  });

  assert.deepEqual(state.gamelist['room-1'], {
    roompass: 'room-1',
    roomName: 'Hosted Duel'
  });
  assert.deepEqual(broadcasts, [
    {
      clientEvent: 'gamelist',
      gamelist: {
        'room-1': {
          roompass: 'room-1',
          roomName: 'Hosted Duel'
        }
      },
      ackresult: 0,
      userlist: []
    }
  ]);
  assert.deepEqual(packets, [
    {
      clientId: 'client-1',
      packet: {
        clientEvent: 'lobby',
        roompass: 'room-1',
        port: 5150
      }
    }
  ]);
  assert.deepEqual(readyResult, {
    roompass: 'room-1',
    password: '',
    port: 5150,
    game: {
      roompass: 'room-1',
      roomName: 'Hosted Duel'
    },
    child
  });
});

test('handleChildMessage validates register packets through the injected session validator', () => {
  const validations = [];
  const { service } = createService({
    validateSession(data, callback) {
      validations.push(data);
      callback(null, true, {
        username: data.username,
        role: 'player'
      });
    }
  });
  const child = new FakeChild(777);

  service.handleChildMessage(child, { id: 'client-2' }, {
    action: 'register',
    session: 'jwt-token',
    username: 'alice'
  });

  assert.deepEqual(validations, [
    {
      session: 'jwt-token',
      username: 'alice'
    }
  ]);
  assert.deepEqual(child.sent, [
    {
      action: 'register',
      error: null,
      person: {
        username: 'alice',
        role: 'player'
      },
      session: 'jwt-token',
      valid: true
    }
  ]);
});

test('handleChildMessage win packets trigger post-duel shutdown messaging', () => {
  const logged = [];
  let callCount = 0;
  const { service } = createService({
    dateNow() {
      callCount += 1;
      return callCount === 1 ? 1000 : 1250;
    },
    logDuel(message, callback) {
      logged.push(message);
      callback();
    }
  });
  const child = new FakeChild(321);

  service.handleChildMessage(child, { id: 'client-3' }, {
    action: 'win',
    traceId: 'trace-1',
    game: {
      roompass: 'room-2',
      port: 5252
    }
  });

  assert.deepEqual(logged, [
    {
      action: 'win',
      traceId: 'trace-1',
      game: {
        roompass: 'room-2',
        port: 5252
      }
    }
  ]);
  assert.deepEqual(child.sent, [
    {
      action: 'shutdown_after_win',
      winTraceId: '1000_321',
      childTraceId: 'trace-1'
    }
  ]);
});

test('hostGame resolves when the child reports ready', async () => {
  const { children, service } = createService({
    parseHostConfig(config) {
      return {
        ...config,
        hostPort: 6060
      };
    }
  });

  const pending = service.hostGame({
    hostPort: 6060,
    roompass: 'room-3'
  });
  const child = children[0];
  child.emit('message', {
    action: 'ready',
    roompass: 'room-3',
    port: 6060,
    password: 'secret',
    game: {
      roompass: 'room-3'
    }
  });

  await assert.doesNotReject(() => pending);
  const result = await pending;
  assert.equal(result.roompass, 'room-3');
  assert.equal(result.port, 6060);
  assert.equal(result.password, 'secret');
  assert.equal(result.child, child);
});

test('hostGame rejects when startup times out', async () => {
  let timeoutCallback = null;
  const { service } = createService({
    setTimeoutFn(callback) {
      timeoutCallback = callback;
      return 'timeout-token';
    },
    clearTimeoutFn() {}
  });

  const pending = service.hostGame({
    hostPort: 7070,
    roompass: 'room-4'
  });

  timeoutCallback();

  await assert.rejects(
    pending,
    /Timed out while waiting for duel room startup\./
  );
});
