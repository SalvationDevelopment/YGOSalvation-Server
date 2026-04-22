const assert = require('node:assert/strict');
const net = require('node:net');
const test = require('node:test');

const { createIrcBridge, startIrcServer } = require('../../../server/irc/irc');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Failed to reserve a free port.')));
        return;
      }

      server.close(() => resolve(address.port));
    });
  });
}

function createRawIrcClient(port) {
  const socket = net.createConnection({
    host: '127.0.0.1',
    port
  });
  socket.setEncoding('utf8');

  let buffer = '';
  const lines = [];
  socket.on('data', (chunk) => {
    buffer += String(chunk || '');
    let lineBreakIndex = buffer.indexOf('\n');
    while (lineBreakIndex >= 0) {
      lines.push(buffer.slice(0, lineBreakIndex).replace(/\r/g, ''));
      buffer = buffer.slice(lineBreakIndex + 1);
      lineBreakIndex = buffer.indexOf('\n');
    }
  });

  return {
    lines,
    socket,
    write(line) {
      socket.write(`${line}\r\n`);
    },
    async waitFor(match, timeoutMs = 5000) {
      const startedAt = Date.now();
      while (Date.now() - startedAt < timeoutMs) {
        const found = lines.find((line) =>
          typeof match === 'string' ? line.includes(match) : match(line)
        );
        if (found) {
          return found;
        }
        await wait(25);
      }
      throw new Error(`Timed out waiting for IRC line. Seen lines:\n${lines.join('\n')}`);
    },
    close() {
      socket.end('QUIT :test done\r\n');
      socket.destroy();
    }
  };
}

test('IRC server requires +v before channel speech', async (t) => {
  const port = await getFreePort();
  const server = await startIrcServer({
    host: '127.0.0.1',
    port,
    authProviders: []
  });
  const client = createRawIrcClient(port);

  t.after(async () => {
    client.close();
    await server.close();
  });

  client.write('NICK alice');
  client.write('USER alice 0 * :alice');
  await client.waitFor(' 001 alice ');

  client.write('JOIN #salvation');
  await client.waitFor('JOIN :#salvation');

  client.write('PRIVMSG #salvation :hello world');
  const errorLine = await client.waitFor(' 404 alice #salvation ');

  assert.match(errorLine, /\(\+v required\)/);
});

test('IRC bridge identifies with NickServ using session auth and can speak afterward', async (t) => {
  const port = await getFreePort();
  const server = await startIrcServer({
    host: '127.0.0.1',
    port,
    authProviders: [
      {
        authenticate(client, args) {
          return new Promise((resolve, reject) => {
            if (
              client.nick === 'alice' &&
              String(args[0] || '').toUpperCase() === 'SESSION' &&
              args[1] === 'valid-session'
            ) {
              resolve({
                provider: 'test-session',
                type: 'user',
                username: 'alice'
              });
              return;
            }
            reject(new Error('Invalid session token.'));
          });
        }
      }
    ]
  });
  const packets = [];
  const bridge = createIrcBridge({
    host: '127.0.0.1',
    port
  });

  t.after(async () => {
    bridge.detachClient('bridge-client');
    await server.close();
  });

  bridge.attachClient({
    clientId: 'bridge-client',
    username: 'alice',
    session: 'valid-session',
    deliver(packet) {
      packets.push(packet);
    }
  });

  const startedAt = Date.now();
  while (Date.now() - startedAt < 5000) {
    const readyState = packets.find(
      (packet) =>
        packet.clientEvent === 'irc_state' &&
        packet.status === 'ready' &&
        packet.authenticated === true
    );

    if (readyState) {
      break;
    }

    await wait(25);
  }

  assert.ok(
    packets.some(
      (packet) =>
        packet.clientEvent === 'irc_state' &&
        packet.status === 'ready' &&
        packet.authenticated === true
    )
  );

  assert.equal(bridge.sendMessage('bridge-client', 'authenticated hello', '#salvation'), true);

  const historyStart = Date.now();
  while (Date.now() - historyStart < 5000) {
    const history = server.getSnapshot().channels[0]?.history || [];
    if (history.some((entry) => entry.message === 'authenticated hello')) {
      break;
    }
    await wait(25);
  }

  assert.ok(
    server
      .getSnapshot()
      .channels[0]
      .history.some((entry) => entry.from === 'alice' && entry.message === 'authenticated hello')
  );
});

test('IRC server blocks oversized and repeated rapid-fire messages', async (t) => {
  const port = await getFreePort();
  const server = await startIrcServer({
    host: '127.0.0.1',
    port,
    maxMessageLength: 24,
    duplicateWindowMs: 5000,
    burstWindowMs: 5000,
    burstLimit: 3,
    authProviders: [
      {
        authenticate() {
          return Promise.resolve({
            provider: 'test',
            type: 'user',
            username: 'alice'
          });
        }
      }
    ]
  });
  const client = createRawIrcClient(port);

  t.after(async () => {
    client.close();
    await server.close();
  });

  client.write('NICK alice');
  client.write('USER alice 0 * :alice');
  await client.waitFor(' 001 alice ');
  client.write('JOIN #salvation');
  await client.waitFor('JOIN :#salvation');
  client.write('PRIVMSG NickServ :IDENTIFY TOKEN test');
  await client.waitFor((line) => line.includes('MODE #salvation +v alice'));

  client.write('PRIVMSG #salvation :this message is definitely too long');
  const oversizeNotice = await client.waitFor('Message too long.');
  assert.match(oversizeNotice, /Limit is 24 characters/);

  client.write('PRIVMSG #salvation :hello');
  await client.waitFor('PRIVMSG #salvation :hello');
  client.write('PRIVMSG #salvation :hello');
  const duplicateNotice = await client.waitFor('Duplicate message blocked.');
  assert.match(duplicateNotice, /Slow down/);

  client.write('PRIVMSG #salvation :one');
  await client.waitFor('PRIVMSG #salvation :one');
  client.write('PRIVMSG #salvation :two');
  await client.waitFor('PRIVMSG #salvation :two');
  client.write('PRIVMSG #salvation :three');
  const burstNotice = await client.waitFor('You are sending messages too quickly.');
  assert.match(burstNotice, /slow down/i);
});

test('IRC bridge can list rooms and switch into a newly created room', async (t) => {
  const port = await getFreePort();
  const server = await startIrcServer({
    host: '127.0.0.1',
    port,
    authProviders: [
      {
        authenticate() {
          return Promise.resolve({
            provider: 'test',
            type: 'user',
            username: 'alice'
          });
        }
      }
    ]
  });
  const packets = [];
  const bridge = createIrcBridge({
    host: '127.0.0.1',
    port
  });

  t.after(async () => {
    bridge.detachClient('bridge-client');
    await server.close();
  });

  bridge.attachClient({
    clientId: 'bridge-client',
    username: 'alice',
    deliver(packet) {
      packets.push(packet);
    }
  });

  const startedAt = Date.now();
  while (Date.now() - startedAt < 5000) {
    const readyState = packets.find(
      (packet) =>
        packet.clientEvent === 'irc_state' &&
        packet.status === 'ready'
    );

    if (readyState) {
      break;
    }

    await wait(25);
  }

  bridge.listRooms('bridge-client');

  const listStartedAt = Date.now();
  while (Date.now() - listStartedAt < 5000) {
    const roomState = packets.find(
      (packet) =>
        packet.clientEvent === 'irc_state' &&
        Array.isArray(packet.rooms) &&
        packet.rooms.some((room) => room.name === '#salvation')
    );

    if (roomState) {
      break;
    }

    await wait(25);
  }

  assert.ok(
    packets.some(
      (packet) =>
        packet.clientEvent === 'irc_state' &&
        Array.isArray(packet.rooms) &&
        packet.rooms.some((room) => room.name === '#salvation')
    )
  );

  bridge.createChannel('bridge-client', 'side-duels');

  const switchedAt = Date.now();
  while (Date.now() - switchedAt < 5000) {
    const switchedState = packets.find(
      (packet) =>
        packet.clientEvent === 'irc_state' &&
        packet.status === 'ready' &&
        packet.channel === '#side-duels' &&
        Array.isArray(packet.rooms) &&
        packet.rooms.some((room) => room.name === '#side-duels')
    );

    if (switchedState) {
      break;
    }

    await wait(25);
  }

  assert.ok(
    packets.some(
      (packet) =>
        packet.clientEvent === 'irc_state' &&
        packet.status === 'ready' &&
        packet.channel === '#side-duels' &&
        Array.isArray(packet.rooms) &&
        packet.rooms.some((room) => room.name === '#side-duels')
    )
  );
});
