const assert = require('node:assert/strict');
const test = require('node:test');
const { EventEmitter } = require('node:events');

const { LobbyState } = require('../../../server/lobby-state');
const { LobbyProxyService } = require('../../../server/lobby-proxy-service');

class FakeWebSocket extends EventEmitter {
  static CONNECTING = 0;

  static OPEN = 1;

  static CLOSING = 2;

  static CLOSED = 3;

  static instances = [];

  constructor(url) {
    super();
    this.url = url;
    this.sent = [];
    this.readyState = FakeWebSocket.CONNECTING;
    FakeWebSocket.instances.push(this);
  }

  send(payload) {
    this.sent.push(payload);
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
    this.emit('close');
  }
}

function createService() {
  FakeWebSocket.instances = [];
  const state = new LobbyState();
  const packets = [];
  const service = new LobbyProxyService({
    state,
    WebSocketClass: FakeWebSocket,
    sendPacket(client, packet) {
      packets.push({
        clientId: client.id,
        packet
      });
    }
  });

  return {
    service,
    state,
    packets
  };
}

test('lobby proxy service rejects invalid proxy ports without opening a socket', () => {
  const { service, state, packets } = createService();
  const client = { id: 'client-1' };

  service.openProxyConnection(client, 'not-a-port');

  assert.equal(FakeWebSocket.instances.length, 0);
  assert.equal(state.proxiedSockets.size, 0);
  assert.deepEqual(packets, [
    {
      clientId: 'client-1',
      packet: {
        action: 'proxy',
        status: 'down',
        error: 'Invalid proxy port.'
      }
    }
  ]);
});

test('lobby proxy service queues proxied packets while connecting and flushes them on open', () => {
  const { service, state, packets } = createService();
  const client = { id: 'client-2' };

  service.openProxyConnection(client, 31337);

  const socket = FakeWebSocket.instances[0];
  assert.equal(socket.url, 'ws://127.0.0.1:31337');
  assert.equal(service.forwardToProxy(client, { action: 'ping' }), true);
  assert.equal(socket.sent.length, 0);
  assert.equal(state.proxiedSockets.get('client-2').queue.length, 1);

  socket.readyState = FakeWebSocket.OPEN;
  socket.emit('open');

  assert.deepEqual(socket.sent, [
    JSON.stringify({ action: 'ping' })
  ]);
  assert.deepEqual(packets, [
    {
      clientId: 'client-2',
      packet: {
        action: 'proxy',
        status: 'connecting',
        port: 31337
      }
    },
    {
      clientId: 'client-2',
      packet: {
        action: 'proxy',
        status: 'up',
        port: 31337
      }
    }
  ]);
});

test('lobby proxy service forwards parsed upstream packets and ignores malformed payloads', () => {
  const { service, packets } = createService();
  const client = { id: 'client-3' };

  service.openProxyConnection(client, 5051);
  const socket = FakeWebSocket.instances[0];

  socket.readyState = FakeWebSocket.OPEN;
  socket.emit('message', Buffer.from(JSON.stringify({
    action: 'proxy',
    status: 'upstream'
  })));
  socket.emit('message', Buffer.from('not-json'));

  assert.deepEqual(packets, [
    {
      clientId: 'client-3',
      packet: {
        action: 'proxy',
        status: 'connecting',
        port: 5051
      }
    },
    {
      clientId: 'client-3',
      packet: {
        action: 'proxy',
        status: 'upstream'
      }
    }
  ]);
});

test('lobby proxy service closes and unregisters the active socket', () => {
  const { service, state, packets } = createService();
  const client = { id: 'client-4' };

  service.openProxyConnection(client, 4040);
  const socket = FakeWebSocket.instances[0];

  socket.readyState = FakeWebSocket.OPEN;
  service.closeProxyConnection(client);

  assert.equal(state.proxiedSockets.has('client-4'), false);
  assert.equal(socket.readyState, FakeWebSocket.CLOSED);
  assert.deepEqual(packets, [
    {
      clientId: 'client-4',
      packet: {
        action: 'proxy',
        status: 'connecting',
        port: 4040
      }
    }
  ]);
});
