const assert = require('node:assert/strict');
const test = require('node:test');

const { createLobbyState } = require('../../../server/lobby-state');
const { createLobbyStatusService } = require('../../../server/lobby-status-service');

function createService(overrides = {}) {
  const state = overrides.state || createLobbyState();
  const addClientCalls = [];
  const broadcasts = [];
  const packets = [];
  const intervals = [];
  const service = createLobbyStatusService({
    state,
    addClient(client) {
      addClientCalls.push(client.id);
    },
    broadcast(packet) {
      broadcasts.push(packet);
    },
    sendPacket(client, packet) {
      packets.push({
        clientId: client?.id,
        packet
      });
    },
    setIntervalFn: overrides.setIntervalFn || ((callback, delay) => {
      intervals.push({ callback, delay });
      return `interval-${intervals.length}`;
    })
  });

  return {
    addClientCalls,
    broadcasts,
    intervals,
    packets,
    service,
    state
  };
}

test('handleConnection registers the client and sends the current room state packet', () => {
  const state = createLobbyState();
  state.gamelist = {
    alpha: {
      roompass: 'alpha'
    }
  };
  state.acklevel = 3;
  state.userlist = ['alice'];
  const { addClientCalls, packets, service } = createService({ state });
  const client = {
    id: 'client-1'
  };

  service.handleConnection(client);

  assert.deepEqual(addClientCalls, ['client-1']);
  assert.deepEqual(packets, [
    {
      clientId: 'client-1',
      packet: {
        clientEvent: 'gamelist',
        gamelist: {
          alpha: {
            roompass: 'alpha'
          }
        },
        ackresult: 3,
        userlist: ['alice']
      }
    }
  ]);
});

test('roomStatePacket and getSnapshot expose lobby state without leaking top-level collections', () => {
  const state = createLobbyState();
  state.gamelist = {
    beta: {
      roompass: 'beta'
    }
  };
  state.acklevel = 5;
  state.userlist = ['alice', 'bob'];
  const { service } = createService({ state });

  const packet = service.roomStatePacket();
  const snapshot = service.getSnapshot();

  assert.deepEqual(packet, {
    clientEvent: 'gamelist',
    gamelist: {
      beta: {
        roompass: 'beta'
      }
    },
    ackresult: 5,
    userlist: ['alice', 'bob']
  });
  assert.deepEqual(snapshot, {
    gamelist: {
      beta: {
        roompass: 'beta'
      }
    },
    ackresult: 5,
    userlist: ['alice', 'bob']
  });
  assert.notEqual(snapshot.gamelist, state.gamelist);
  assert.notEqual(snapshot.userlist, state.userlist);
});

test('start schedules a single ack loop and resets ack state when the interval fires', () => {
  const state = createLobbyState();
  state.gamelist = {
    gamma: {
      roompass: 'gamma'
    }
  };
  state.acklevel = 2;
  state.userlist = ['alice'];
  const { broadcasts, intervals, service } = createService({ state });

  service.start();
  service.start();

  assert.equal(intervals.length, 1);
  assert.equal(intervals[0].delay, 15000);
  assert.equal(state.ackTimer, 'interval-1');

  intervals[0].callback();

  assert.deepEqual(broadcasts, [
    {
      clientEvent: 'ackresult',
      ackresult: 2,
      userlist: ['alice']
    },
    {
      clientEvent: 'gamelist',
      gamelist: {
        gamma: {
          roompass: 'gamma'
        }
      },
      ackresult: 2,
      userlist: ['alice']
    },
    {
      clientEvent: 'ack',
      serverEvent: 'ack'
    }
  ]);
  assert.equal(state.acklevel, 0);
  assert.deepEqual(state.userlist, []);
});
