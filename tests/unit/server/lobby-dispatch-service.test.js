const assert = require('node:assert/strict');
const test = require('node:test');

const { createLobbyState } = require('../../../server/lobby-state');
const { createLobbyDispatchService } = require('../../../server/lobby-dispatch-service');

function createService(overrides = {}) {
  const state = overrides.state || createLobbyState();
  const calls = [];
  const packets = [];
  const service = createLobbyDispatchService({
    state,
    closeProxyConnection(client) {
      calls.push(['closeProxyConnection', client.id]);
    },
    detachClient(clientId) {
      calls.push(['detachClient', clientId]);
    },
    forwardToProxy(client, message) {
      calls.push(['forwardToProxy', client.id, message]);
      return overrides.forwardToProxyResult ?? true;
    },
    gamelistRequested(client) {
      calls.push(['gamelistRequested', client.id]);
    },
    handleAction(client, message) {
      calls.push(['handleAction', client.id, message]);
    },
    removeClientFromRegistry(client) {
      calls.push(['removeClientFromRegistry', client.id]);
    },
    sendPacket(client, packet) {
      packets.push({
        clientId: client?.id,
        packet
      });
    }
  });

  return {
    calls,
    packets,
    service,
    state
  };
}

test('handleMessage returns false for non-action payloads', () => {
  const { calls, packets, service } = createService();
  const client = { id: 'client-1' };

  assert.equal(service.handleMessage(client, null), false);
  assert.equal(service.handleMessage(client, 'chat'), false);
  assert.equal(service.handleMessage(client, {}), false);
  assert.deepEqual(calls, []);
  assert.deepEqual(packets, []);
});

test('handleMessage forwards non-proxy actions to the active proxy connection', () => {
  const state = createLobbyState();
  state.proxiedSockets.set('client-2', {});
  const { calls, packets, service } = createService({ state });
  const client = { id: 'client-2' };
  const message = {
    action: 'chatline',
    msg: 'hello'
  };

  assert.equal(service.handleMessage(client, message), true);
  assert.deepEqual(calls, [
    ['forwardToProxy', 'client-2', message]
  ]);
  assert.deepEqual(packets, []);
});

test('handleMessage reports proxy failures when forwarding is unavailable', () => {
  const state = createLobbyState();
  state.proxiedSockets.set('client-3', {});
  const { calls, packets, service } = createService({
    state,
    forwardToProxyResult: false
  });
  const client = { id: 'client-3' };

  assert.equal(service.handleMessage(client, {
    action: 'save'
  }), true);
  assert.deepEqual(calls, [
    ['forwardToProxy', 'client-3', { action: 'save' }]
  ]);
  assert.deepEqual(packets, [
    {
      clientId: 'client-3',
      packet: {
        action: 'proxy',
        status: 'down',
        error: 'Proxy unavailable for action "save".'
      }
    }
  ]);
});

test('handleMessage sends the room state before direct lobby actions except proxy lifecycle actions', () => {
  const { calls, service } = createService();
  const client = { id: 'client-4' };

  assert.equal(service.handleMessage(client, {
    action: 'gamelistrequest'
  }), true);
  assert.equal(service.handleMessage(client, {
    action: 'proxy_connect',
    port: 7911
  }), true);

  assert.deepEqual(calls, [
    ['gamelistRequested', 'client-4'],
    ['handleAction', 'client-4', { action: 'gamelistrequest' }],
    ['handleAction', 'client-4', { action: 'proxy_connect', port: 7911 }]
  ]);
});

test('removeClient closes proxy state, detaches chat, and removes the registry entry', () => {
  const { calls, service } = createService();
  const client = { id: 'client-5' };

  service.removeClient(client);

  assert.deepEqual(calls, [
    ['closeProxyConnection', 'client-5'],
    ['detachClient', 'client-5'],
    ['removeClientFromRegistry', 'client-5']
  ]);
});
