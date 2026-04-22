'use strict';

const net = require('net');
const path = require('path');
const { randomUUID } = require('crypto');
const userController = require('../api/routes/endpoint_users');

const IRC_CONFIG_PAYLOAD = require(path.resolve(
  __dirname,
  '..',
  '..',
  'configuration',
  'irc.json'
));

function envString(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value);
}

function envNumber(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cloneStaticIdentities(source) {
  if (!Array.isArray(source)) {
    return [];
  }

  return source.map((entry) => ({
    ...entry,
    scopes: Array.isArray(entry?.scopes) ? [...entry.scopes] : []
  }));
}

function renderTemplate(template, values = {}) {
  return Object.entries(values).reduce((output, [key, value]) => {
    return output.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, String(template || ''));
}

const DEFAULTS = Object.freeze({
  host: envString('IRC_HOST', IRC_CONFIG_PAYLOAD.server?.host || '127.0.0.1'),
  port: envNumber('IRC_PORT', Number(IRC_CONFIG_PAYLOAD.server?.port || 6667)),
  serverName: envString(
    'IRC_SERVER_NAME',
    IRC_CONFIG_PAYLOAD.server?.name || 'irc.ygosalvation.local'
  ),
  serverDescription: envString(
    'IRC_SERVER_DESCRIPTION',
    IRC_CONFIG_PAYLOAD.server?.description || 'YGOSalvation internal IRC server'
  ),
  defaultChannel: envString(
    'IRC_DEFAULT_CHANNEL',
    IRC_CONFIG_PAYLOAD.channels?.default || '#salvation'
  ),
  topic: envString(
    'IRC_DEFAULT_TOPIC',
    IRC_CONFIG_PAYLOAD.channels?.topic || ''
  ),
  roomTopicTemplate: envString(
    'IRC_ROOM_TOPIC_TEMPLATE',
    IRC_CONFIG_PAYLOAD.channels?.roomTopicTemplate || 'Chat channel {channel}'
  ),
  historyLimit: envNumber(
    'IRC_HISTORY_LIMIT',
    Number(IRC_CONFIG_PAYLOAD.limits?.historyLimit || 150)
  ),
  maxMessageLength: envNumber(
    'IRC_MAX_MESSAGE_LENGTH',
    Number(IRC_CONFIG_PAYLOAD.limits?.maxMessageLength || 420)
  ),
  duplicateWindowMs: envNumber(
    'IRC_DUPLICATE_WINDOW_MS',
    Number(IRC_CONFIG_PAYLOAD.limits?.duplicateWindowMs || 10000)
  ),
  burstWindowMs: envNumber(
    'IRC_BURST_WINDOW_MS',
    Number(IRC_CONFIG_PAYLOAD.limits?.burstWindowMs || 8000)
  ),
  burstLimit: envNumber(
    'IRC_BURST_LIMIT',
    Number(IRC_CONFIG_PAYLOAD.limits?.burstLimit || 4)
  ),
  bridgeHost: envString(
    'IRC_BRIDGE_HOST',
    IRC_CONFIG_PAYLOAD.bridge?.host || IRC_CONFIG_PAYLOAD.server?.host || '127.0.0.1'
  ),
  bridgePort: envNumber(
    'IRC_BRIDGE_PORT',
    Number(IRC_CONFIG_PAYLOAD.bridge?.port || IRC_CONFIG_PAYLOAD.server?.port || 6667)
  ),
  bridgeMaxMessages: envNumber(
    'IRC_BRIDGE_MAX_MESSAGES',
    Number(IRC_CONFIG_PAYLOAD.bridge?.maxMessages || IRC_CONFIG_PAYLOAD.limits?.historyLimit || 150)
  ),
  nickServNick: envString(
    'IRC_NICKSERV_NICK',
    IRC_CONFIG_PAYLOAD.services?.nickServNick || 'NickServ'
  ),
  joinMotdTemplate: envString(
    'IRC_JOIN_MOTD_TEMPLATE',
    IRC_CONFIG_PAYLOAD.services?.joinMotdTemplate ||
      'Joined to {channel} for live lobby chat.'
  ),
  identifySessionSyntax: envString(
    'IRC_IDENTIFY_SESSION_SYNTAX',
    IRC_CONFIG_PAYLOAD.services?.identifySessionSyntax ||
      'Syntax: IDENTIFY SESSION <session-token>'
  ),
  identifyTokenSyntax: envString(
    'IRC_IDENTIFY_TOKEN_SYNTAX',
    IRC_CONFIG_PAYLOAD.services?.identifyTokenSyntax ||
      'Syntax: IDENTIFY TOKEN <token>'
  ),
  helpMessage: envString(
    'IRC_HELP_MESSAGE',
    IRC_CONFIG_PAYLOAD.services?.helpMessage ||
      'Commands: IDENTIFY SESSION <session-token>, IDENTIFY TOKEN <service-token>'
  ),
  invalidSessionTokenMessage: envString(
    'IRC_INVALID_SESSION_MESSAGE',
    IRC_CONFIG_PAYLOAD.services?.invalidSessionTokenMessage || 'Invalid session token.'
  ),
  sessionNicknameMismatchMessage: envString(
    'IRC_SESSION_NICK_MISMATCH_MESSAGE',
    IRC_CONFIG_PAYLOAD.services?.sessionNicknameMismatchMessage ||
      'Session does not match the current nickname.'
  ),
  unknownServiceIdentityTokenMessage: envString(
    'IRC_UNKNOWN_IDENTITY_MESSAGE',
    IRC_CONFIG_PAYLOAD.services?.unknownServiceIdentityTokenMessage ||
      'Unknown service identity token.'
  ),
  duplicateMessageBlockedNotice: envString(
    'IRC_DUPLICATE_BLOCKED_NOTICE',
    IRC_CONFIG_PAYLOAD.services?.duplicateMessageBlockedNotice ||
      'Duplicate message blocked. Slow down before repeating yourself.'
  ),
  burstBlockedNotice: envString(
    'IRC_BURST_BLOCKED_NOTICE',
    IRC_CONFIG_PAYLOAD.services?.burstBlockedNotice ||
      'You are sending messages too quickly. Please slow down.'
  ),
  staticIdentities: cloneStaticIdentities(IRC_CONFIG_PAYLOAD.auth?.staticIdentities)
});

function sanitizeNick(value, fallback = 'duelist') {
  const cleaned = String(value || '')
    .trim()
    .replace(/[^A-Za-z0-9_\-\[\]\\`^{}|]/g, '')
    .slice(0, 24);
  if (cleaned) {
    return cleaned;
  }
  return `${fallback}${Math.floor(Math.random() * 1000)}`;
}

function sanitizeChannel(value, fallback = DEFAULTS.defaultChannel) {
  const cleaned = String(value || '')
    .trim()
    .replace(/[^A-Za-z0-9_\-#]/g, '')
    .toLowerCase();
  const channel = cleaned || fallback;
  return channel.startsWith('#') ? channel : `#${channel}`;
}

function parseClientLine(line) {
  const raw = String(line || '').replace(/\r/g, '').trim();
  if (!raw) {
    return { command: '', params: [] };
  }

  const splitIndex = raw.indexOf(' :');
  if (splitIndex < 0) {
    const parts = raw.split(/\s+/).filter(Boolean);
    return {
      command: String(parts.shift() || '').toUpperCase(),
      params: parts
    };
  }

  const head = raw.slice(0, splitIndex).split(/\s+/).filter(Boolean);
  const trailing = raw.slice(splitIndex + 2);

  return {
    command: String(head.shift() || '').toUpperCase(),
    params: [...head, trailing]
  };
}

function parseServerLine(line) {
  let raw = String(line || '').replace(/\r/g, '').trim();
  let prefix = '';

  if (!raw) {
    return { prefix: '', command: '', params: [], trailing: '' };
  }

  if (raw.startsWith(':')) {
    const firstSpace = raw.indexOf(' ');
    prefix = raw.slice(1, firstSpace);
    raw = raw.slice(firstSpace + 1);
  }

  const splitIndex = raw.indexOf(' :');
  if (splitIndex < 0) {
    const parts = raw.split(/\s+/).filter(Boolean);
    return {
      prefix,
      command: String(parts.shift() || '').toUpperCase(),
      params: parts,
      trailing: ''
    };
  }

  const head = raw.slice(0, splitIndex).split(/\s+/).filter(Boolean);
  const trailing = raw.slice(splitIndex + 2);

  return {
    prefix,
    command: String(head.shift() || '').toUpperCase(),
    params: [...head, trailing],
    trailing
  };
}

function nickFromPrefix(prefix) {
  return String(prefix || '').split('!')[0] || '';
}

function createNickServSessionAuthProvider(options = {}) {
  const validateSession = options.validateSession || userController.validateSession;
  const sessionSyntax = options.identifySessionSyntax || DEFAULTS.identifySessionSyntax;
  const invalidSessionTokenMessage =
    options.invalidSessionTokenMessage || DEFAULTS.invalidSessionTokenMessage;
  const sessionNicknameMismatchMessage =
    options.sessionNicknameMismatchMessage || DEFAULTS.sessionNicknameMismatchMessage;

  return {
    name: options.name || 'cms-session',
    authenticate(client, args) {
      return new Promise((resolve, reject) => {
        const mode = String(args[0] || 'SESSION').toUpperCase();
        const token = String(
          mode === 'SESSION' ? args[1] || '' : args[0] || ''
        ).trim();

        if (!token) {
          reject(new Error(sessionSyntax));
          return;
        }

        validateSession(
          {
            username: client.nick,
            session: token
          },
          (error, valid, info) => {
            if (error || !valid || !info) {
              reject(new Error(invalidSessionTokenMessage));
              return;
            }

            const resolvedUsername = sanitizeNick(info.username, client.nick);
            if (
              resolvedUsername &&
              resolvedUsername.toLowerCase() !== client.nick.toLowerCase()
            ) {
              reject(new Error(sessionNicknameMismatchMessage));
              return;
            }

            resolve({
              provider: options.name || 'cms-session',
              type: 'user',
              username: info.username,
              session: token,
              account: info
            });
          }
        );
      });
    }
  };
}

function createStaticIdentityAuthProvider(options = {}) {
  const identities = new Map();
  const source = Array.isArray(options.identities) ? options.identities : [];
  const tokenSyntax = options.identifyTokenSyntax || DEFAULTS.identifyTokenSyntax;
  const unknownIdentityMessage =
    options.unknownServiceIdentityTokenMessage ||
    DEFAULTS.unknownServiceIdentityTokenMessage;

  source.forEach((entry) => {
    const nick = sanitizeNick(entry?.nick, '');
    const token = String(entry?.token || '').trim();
    if (!nick || !token) {
      return;
    }

    identities.set(`${nick.toLowerCase()}|${token}`, {
      provider: options.name || 'static-identities',
      type: entry.type || 'bot',
      username: entry.username || nick,
      service: Boolean(entry.service),
      scopes: Array.isArray(entry.scopes) ? [...entry.scopes] : []
    });
  });

  return {
    name: options.name || 'static-identities',
    authenticate(client, args) {
      return new Promise((resolve, reject) => {
        const mode = String(args[0] || 'TOKEN').toUpperCase();
        const token = String(
          mode === 'TOKEN' ? args[1] || '' : args[0] || ''
        ).trim();

        if (!token) {
          reject(new Error(tokenSyntax));
          return;
        }

        const identity = identities.get(
          `${String(client.nick || '').toLowerCase()}|${token}`
        );

        if (!identity) {
          reject(new Error(unknownIdentityMessage));
          return;
        }

        resolve(identity);
      });
    }
  };
}

function createIrcServer(options = {}) {
  const config = {
    ...DEFAULTS,
    ...options,
    defaultChannel: sanitizeChannel(
      options.defaultChannel || DEFAULTS.defaultChannel,
      DEFAULTS.defaultChannel
    )
  };
  config.staticIdentities = Array.isArray(options.staticIdentities)
    ? cloneStaticIdentities(options.staticIdentities)
    : cloneStaticIdentities(DEFAULTS.staticIdentities);
  config.authProviders = Array.isArray(options.authProviders) &&
    options.authProviders.length
    ? options.authProviders
    : [
      createNickServSessionAuthProvider({
        identifySessionSyntax: config.identifySessionSyntax,
        invalidSessionTokenMessage: config.invalidSessionTokenMessage,
        sessionNicknameMismatchMessage: config.sessionNicknameMismatchMessage
      }),
      createStaticIdentityAuthProvider({
        identities: config.staticIdentities,
        identifyTokenSyntax: config.identifyTokenSyntax,
        unknownServiceIdentityTokenMessage: config.unknownServiceIdentityTokenMessage
      })
    ];
  const clients = new Set();
  const channels = new Map();

  function normalizeSpamText(value) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  function log(message) {
    if (typeof config.logger === 'function') {
      config.logger(`[irc] ${message}`);
    }
  }

  function ensureChannel(requestedChannel) {
    const name = sanitizeChannel(requestedChannel, config.defaultChannel);
    if (!channels.has(name)) {
      channels.set(name, {
        name,
        topic:
          name === config.defaultChannel
            ? config.topic
            : renderTemplate(config.roomTopicTemplate, { channel: name }),
        history: [],
        members: new Set()
      });
    }
    return channels.get(name);
  }

  const primaryChannel = ensureChannel(config.defaultChannel);

  function send(client, line) {
    if (!client || client.socket.destroyed) {
      return;
    }

    client.socket.write(`${line}\r\n`);
  }

  function sendNotice(client, fromNick, message) {
    if (!client?.nick) {
      return;
    }

    send(
      client,
      `:${fromNick}!service@${config.serverName} NOTICE ${client.nick} :${message}`
    );
  }

  function isVoiced(client, channelName) {
    return Boolean(client?.voicedChannels?.has(channelName));
  }

  function setVoice(channel, client, enabled) {
    if (!channel || !client) {
      return;
    }

    const currentlyVoiced = isVoiced(client, channel.name);
    if (enabled === currentlyVoiced) {
      return;
    }

    if (enabled) {
      client.voicedChannels.add(channel.name);
    }
    if (!enabled) {
      client.voicedChannels.delete(channel.name);
    }

    broadcastChannel(
      channel,
      `:${config.serverName} MODE ${channel.name} ${enabled ? '+v' : '-v'} ${client.nick}`
    );
  }

  function applyIdentity(channel, client) {
    if (!channel || !client?.identity) {
      return;
    }

    setVoice(channel, client, true);
  }

  function sendNames(client, channel) {
    const names = [...channel.members]
      .map((member) =>
        `${isVoiced(member, channel.name) ? '+' : ''}${member.nick}`
      )
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right));

    send(
      client,
      `:${config.serverName} 353 ${client.nick} = ${channel.name} :${names.join(' ')}`
    );
    send(
      client,
      `:${config.serverName} 366 ${client.nick} ${channel.name} :End of /NAMES list.`
    );
  }

  function replayHistory(client, channel) {
    channel.history.forEach((entry) => {
      send(
        client,
        `:${config.serverName} NOTICE ${client.nick} :HISTORY ${JSON.stringify(entry)}`
      );
    });
  }

  function sendChannelList(client) {
    if (!client?.nick) {
      return;
    }

    send(
      client,
      `:${config.serverName} 321 ${client.nick} Channel :Users Name`
    );

    [...channels.values()]
      .sort((left, right) => left.name.localeCompare(right.name))
      .forEach((channel) => {
        send(
          client,
          `:${config.serverName} 322 ${client.nick} ${channel.name} ${channel.members.size} :${channel.topic}`
        );
      });

    send(
      client,
      `:${config.serverName} 323 ${client.nick} :End of /LIST`
    );
  }

  function broadcastChannel(channel, line) {
    channel.members.forEach((member) => {
      send(member, line);
    });
  }

  function appendHistory(channel, entry) {
    channel.history.push(entry);
    if (channel.history.length > config.historyLimit) {
      channel.history.shift();
    }
  }

  function finalizeRegistration(client) {
    if (client.registered || !client.nick || !client.user) {
      return;
    }

    client.registered = true;
    send(
      client,
      `:${config.serverName} 001 ${client.nick} :Welcome to ${config.serverDescription}`
    );
    send(
      client,
      `:${config.serverName} 375 ${client.nick} :- ${config.serverName} message of the day -`
    );
    send(
      client,
      `:${config.serverName} 372 ${client.nick} :- ${renderTemplate(config.joinMotdTemplate, {
        channel: config.defaultChannel
      })}`
    );
    send(
      client,
      `:${config.serverName} 376 ${client.nick} :End of /MOTD command.`
    );
    log(`registered nick=${client.nick}`);
  }

  function removeClient(client, reason = 'Connection closed') {
    if (!client || client.removed) {
      return;
    }

    client.removed = true;
    client.channels.forEach((channelName) => {
      const channel = channels.get(channelName);
      if (!channel) {
        return;
      }

      channel.members.delete(client);
      broadcastChannel(
        channel,
        `:${client.nick}!${client.user}@${config.host} QUIT :${reason}`
      );
    });
    client.channels.clear();
    clients.delete(client);
  }

  function handleJoin(client, params) {
    if (!client.registered) {
      return;
    }

    const requestedChannels = String(params[0] || config.defaultChannel)
      .split(',')
      .map((channelName) => sanitizeChannel(channelName, config.defaultChannel));

    requestedChannels.forEach((channelName) => {
      const channel = ensureChannel(channelName);
      if (client.channels.has(channel.name)) {
        return;
      }

      client.channels.add(channel.name);
      channel.members.add(client);
      setVoice(channel, client, false);

      broadcastChannel(
        channel,
        `:${client.nick}!${client.user}@${config.host} JOIN :${channel.name}`
      );
      send(
        client,
        `:${config.serverName} 332 ${client.nick} ${channel.name} :${channel.topic}`
      );
      sendNames(client, channel);
      replayHistory(client, channel);
      applyIdentity(channel, client);
    });
  }

  function handlePart(client, params) {
    const channel = channels.get(sanitizeChannel(params[0], config.defaultChannel));
    if (!channel || !client.channels.has(channel.name)) {
      return;
    }

    client.channels.delete(channel.name);
    channel.members.delete(client);
    client.voicedChannels.delete(channel.name);
    broadcastChannel(
      channel,
      `:${client.nick}!${client.user}@${config.host} PART ${channel.name} :Left channel`
    );
  }

  function handlePrivmsg(client, params) {
    const channel = channels.get(sanitizeChannel(params[0], config.defaultChannel));
    const message = String(params[1] || '')
      .replace(/[\r\n]+/g, ' ')
      .trim();

    if (!channel || !message || !client.channels.has(channel.name)) {
      return;
    }

    if (!isVoiced(client, channel.name)) {
      send(
        client,
        `:${config.serverName} 404 ${client.nick} ${channel.name} :Cannot send to channel (+v required)`
      );
      return;
    }

    if (message.length > config.maxMessageLength) {
      sendNotice(
        client,
        config.nickServNick,
        `Message too long. Limit is ${config.maxMessageLength} characters.`
      );
      return;
    }

    const now = Date.now();
    const normalizedMessage = normalizeSpamText(message);
    client.recentMessages = client.recentMessages.filter((entry) => {
      return now - entry.sentAt <= config.burstWindowMs;
    });

    if (
      client.recentMessages.some((entry) => {
        return (
          entry.normalizedMessage === normalizedMessage &&
          now - entry.sentAt <= config.duplicateWindowMs
        );
      })
    ) {
      sendNotice(
        client,
        config.nickServNick,
        config.duplicateMessageBlockedNotice
      );
      return;
    }

    if (client.recentMessages.length >= config.burstLimit) {
      sendNotice(
        client,
        config.nickServNick,
        config.burstBlockedNotice
      );
      return;
    }

    const entry = {
      id: randomUUID(),
      channel: channel.name,
      from: client.nick,
      message,
      sentAt: new Date().toISOString()
    };
    client.recentMessages.push({
      normalizedMessage,
      sentAt: now
    });

    appendHistory(channel, entry);
    broadcastChannel(
      channel,
      `:${client.nick}!${client.user}@${config.host} PRIVMSG ${channel.name} :${message}`
    );
  }

  async function identifyClient(client, args) {
    let lastError = new Error('Authentication failed.');

    for (const provider of config.authProviders) {
      if (!provider || typeof provider.authenticate !== 'function') {
        continue;
      }

      try {
        const identity = await provider.authenticate(client, args);
        client.identity = identity;
        sendNotice(
          client,
          config.nickServNick,
          `You are now identified as ${identity.username || client.nick}.`
        );
        client.channels.forEach((channelName) => {
          const channel = channels.get(channelName);
          applyIdentity(channel, client);
        });
        return;
      } catch (error) {
        lastError = error;
      }
    }

    sendNotice(
      client,
      config.nickServNick,
      lastError.message || 'Authentication failed.'
    );
  }

  function handleServicePrivmsg(client, target, message) {
    const serviceNick = sanitizeNick(target, '');
    if (!serviceNick || serviceNick.toLowerCase() !== config.nickServNick.toLowerCase()) {
      return false;
    }

    const pieces = String(message || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const command = String(pieces.shift() || '').toUpperCase();

    if (command === 'IDENTIFY' || command === 'LOGIN') {
      void identifyClient(client, pieces);
      return true;
    }

    if (command === 'HELP' || !command) {
      sendNotice(
        client,
        config.nickServNick,
        config.helpMessage
      );
      return true;
    }

    sendNotice(client, config.nickServNick, `Unknown command ${command}. Try HELP.`);
    return true;
  }

  function handleLine(client, line) {
    const { command, params } = parseClientLine(line);

    switch (command) {
    case 'NICK':
      client.nick = sanitizeNick(params[0], 'duelist');
      finalizeRegistration(client);
      return;
    case 'USER':
      client.user = sanitizeNick(params[0], client.nick || 'duelist');
      finalizeRegistration(client);
      return;
    case 'JOIN':
      handleJoin(client, params);
      return;
    case 'PART':
      handlePart(client, params);
      return;
    case 'PRIVMSG':
      if (handleServicePrivmsg(client, params[0], params[1])) {
        return;
      }
      handlePrivmsg(client, params);
      return;
    case 'NAMES': {
      const channel = ensureChannel(params[0] || config.defaultChannel);
      sendNames(client, channel);
      return;
    }
    case 'LIST':
      sendChannelList(client);
      return;
    case 'PING':
      send(client, `:${config.serverName} PONG ${config.serverName} :${params[0] || config.serverName}`);
      return;
    case 'QUIT':
      removeClient(client, params[0] || 'Client quit');
      client.socket.end();
      return;
    default:
      if (client.nick) {
        send(
          client,
          `:${config.serverName} 421 ${client.nick} ${command || '*'} :Unknown command`
        );
      }
    }
  }

  const server = net.createServer((socket) => {
    const client = {
      socket,
      nick: '',
      user: '',
      registered: false,
      removed: false,
      identity: null,
      channels: new Set(),
      voicedChannels: new Set(),
      recentMessages: [],
      buffer: ''
    };

    clients.add(client);
    socket.setEncoding('utf8');

    socket.on('data', (chunk) => {
      client.buffer += String(chunk || '');

      let lineBreakIndex = client.buffer.indexOf('\n');
      while (lineBreakIndex >= 0) {
        const nextLine = client.buffer.slice(0, lineBreakIndex);
        client.buffer = client.buffer.slice(lineBreakIndex + 1);
        handleLine(client, nextLine);
        lineBreakIndex = client.buffer.indexOf('\n');
      }
    });

    socket.on('close', () => {
      removeClient(client, 'Connection closed');
    });

    socket.on('error', (error) => {
      log(`socket error: ${error.message}`);
    });
  });

  return {
    listen() {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(config.port, config.host, () => {
          server.off('error', reject);
          const address = server.address();
          log(
            `listening on ${typeof address === 'object' && address ? address.port : config.port}`
          );
          resolve(this);
        });
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        clients.forEach((client) => {
          client.socket.destroy();
        });
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    },
    address() {
      return server.address();
    },
    getSnapshot() {
      return {
        channels: [...channels.values()].map((channel) => ({
          name: channel.name,
          topic: channel.topic,
          members: [...channel.members].map((member) => member.nick),
          history: [...channel.history]
        })),
        defaultChannel: primaryChannel.name
      };
    }
  };
}

function createIrcBridge(options = {}) {
  const config = {
    channel: sanitizeChannel(
      options.channel || DEFAULTS.defaultChannel,
      DEFAULTS.defaultChannel
    ),
    host: options.host || DEFAULTS.bridgeHost,
    port: Number(options.port || DEFAULTS.bridgePort),
    maxMessages: Number(options.maxMessages || DEFAULTS.bridgeMaxMessages),
    nickServNick: options.nickServNick || DEFAULTS.nickServNick
  };
  const bridgedClients = new Map();

  function deliver(state, packet) {
    if (!state || typeof state.deliver !== 'function') {
      return;
    }
    state.deliver(packet);
  }

  function emitState(state) {
    deliver(state, {
      clientEvent: 'irc_state',
      status: state.status,
      channel: state.channel,
      topic: state.topic,
      members: [...state.members],
      rooms: [...state.rooms],
      nickname: state.nickname,
      authenticated: Boolean(state.authenticated)
    });
  }

  function emitHistory(state) {
    deliver(state, {
      clientEvent: 'irc_history',
      messages: [...state.messages]
    });
  }

  function appendMessage(state, entry) {
    if (!entry || !entry.message || !entry.from) {
      return;
    }

    const dedupeKey = `${entry.from}|${entry.message}|${entry.sentAt || ''}`;
    const previousKey =
      state.messages.length > 0
        ? `${state.messages[state.messages.length - 1].from}|${state.messages[state.messages.length - 1].message}|${state.messages[state.messages.length - 1].sentAt || ''}`
        : '';

    if (dedupeKey === previousKey) {
      return;
    }

    const nextEntry = {
      id: entry.id || randomUUID(),
      channel: sanitizeChannel(entry.channel || state.channel, state.channel),
      from: String(entry.from || ''),
      message: String(entry.message || ''),
      sentAt: entry.sentAt || new Date().toISOString()
    };

    state.messages.push(nextEntry);
    if (state.messages.length > config.maxMessages) {
      state.messages.shift();
    }

    deliver(state, {
      clientEvent: 'irc_message',
      message: nextEntry
    });
  }

  function addMember(state, nickname) {
    const cleaned = sanitizeNick(nickname, '');
    if (!cleaned) {
      return;
    }

    if (!state.members.includes(cleaned)) {
      state.members = [...state.members, cleaned].sort((left, right) =>
        left.localeCompare(right)
      );
      emitState(state);
    }
  }

  function removeMember(state, nickname) {
    const cleaned = sanitizeNick(nickname, '');
    if (!cleaned) {
      return;
    }

    const nextMembers = state.members.filter((member) => member !== cleaned);
    if (nextMembers.length !== state.members.length) {
      state.members = nextMembers;
      emitState(state);
    }
  }

  function setRooms(state, rooms) {
    state.rooms = [...rooms].sort((left, right) =>
      String(left?.name || '').localeCompare(String(right?.name || ''))
    );
    emitState(state);
  }

  function requestRoomList(state) {
    if (!state?.socket || state.socket.destroyed) {
      return;
    }

    state.pendingRooms = [];
    state.socket.write('LIST\r\n');
  }

  function switchChannel(state, requestedChannel) {
    const nextChannel = sanitizeChannel(requestedChannel, state.channel);

    if (!state?.socket || state.socket.destroyed || !nextChannel) {
      return false;
    }

    if (state.channel === nextChannel && state.joined) {
      requestRoomList(state);
      emitState(state);
      return true;
    }

    const previousChannel = state.channel;
    state.channel = nextChannel;
    state.topic = '';
    state.members = [];
    state.messages = [];
    state.joined = false;
    state.status = state.authenticated ? 'connected' : 'connecting';
    emitState(state);
    emitHistory(state);

    if (previousChannel) {
      state.socket.write(`PART ${previousChannel} :Switching rooms\r\n`);
    }
    state.socket.write(`JOIN ${nextChannel}\r\n`);
    requestRoomList(state);
    return true;
  }

  function handleBridgeLine(state, line) {
    const { prefix, command, params, trailing } = parseServerLine(line);
    const nickname = nickFromPrefix(prefix);

    switch (command) {
    case '001':
      state.status = 'connected';
      emitState(state);
      if (state.session) {
        state.socket.write(
          `PRIVMSG ${config.nickServNick} :IDENTIFY SESSION ${state.session}\r\n`
        );
      }
      state.socket.write(`JOIN ${state.channel}\r\n`);
      requestRoomList(state);
      return;
    case '332':
      if (sanitizeChannel(params[1], state.channel) === state.channel) {
        state.topic = trailing || state.topic;
        emitState(state);
      }
      return;
    case '353': {
      if (sanitizeChannel(params[2], state.channel) !== state.channel) {
        return;
      }
      const names = String(trailing || params[params.length - 1] || '')
        .split(/\s+/)
        .filter(Boolean)
        .map((member) => member.replace(/^[~&@%+]+/, ''));

      state.members = [...new Set(names)].sort((left, right) =>
        left.localeCompare(right)
      );
      emitState(state);
      return;
    }
    case '366':
      if (sanitizeChannel(params[1], state.channel) === state.channel) {
        emitState(state);
      }
      return;
    case '321':
      state.pendingRooms = [];
      return;
    case '322':
      state.pendingRooms.push({
        name: sanitizeChannel(params[1], state.channel),
        members: Math.max(0, Number(params[2]) || 0),
        topic: String(trailing || '')
      });
      return;
    case '323':
      setRooms(state, state.pendingRooms);
      return;
    case 'JOIN':
      if (sanitizeChannel(params[params.length - 1], state.channel) === state.channel) {
        addMember(state, nickname);
        if (nickname === state.nickname) {
          state.joined = true;
          state.status = 'ready';
          emitState(state);
          requestRoomList(state);
        }
      }
      return;
    case 'PART':
      if (sanitizeChannel(params[0], state.channel) === state.channel) {
        removeMember(state, nickname);
        if (nickname === state.nickname) {
          state.joined = false;
          state.members = [];
          emitState(state);
        }
      }
      requestRoomList(state);
      return;
    case 'QUIT':
      removeMember(state, nickname);
      requestRoomList(state);
      return;
    case 'PRIVMSG':
      if (sanitizeChannel(params[0], state.channel) === state.channel) {
        appendMessage(state, {
          channel: state.channel,
          from: nickname,
          message: trailing || params[1] || '',
          sentAt: new Date().toISOString()
        });
      }
      return;
    case 'NOTICE':
      if (nickname.toLowerCase() === config.nickServNick.toLowerCase()) {
        state.authenticated = /identified/i.test(String(trailing || ''));
        emitState(state);
      }
      if (
        String(trailing || '').startsWith('HISTORY ') &&
        String(params[0] || '') === state.nickname
      ) {
        try {
          appendMessage(
            state,
            JSON.parse(String(trailing || '').slice('HISTORY '.length))
          );
        } catch {
          deliver(state, {
            clientEvent: 'irc_error',
            message: 'Failed to parse retained IRC history.'
          });
        }
      }
      return;
    default:
      return;
    }
  }

  return {
    attachClient({ clientId, deliver, username, session }) {
      this.detachClient(clientId);

      const state = {
        clientId,
        deliver,
        username: String(username || ''),
        session: String(session || ''),
        nickname: sanitizeNick(username, 'duelist'),
        channel: config.channel,
        topic: '',
        status: 'connecting',
        authenticated: false,
        joined: false,
        members: [],
        rooms: [],
        messages: [],
        pendingRooms: [],
        buffer: ''
      };

      state.socket = net.createConnection({
        host: config.host,
        port: config.port
      });
      state.socket.setEncoding('utf8');

      bridgedClients.set(clientId, state);
      emitState(state);

      state.socket.on('connect', () => {
        state.socket.write(`NICK ${state.nickname}\r\n`);
        state.socket.write(`USER ${state.nickname} 0 * :${state.username || state.nickname}\r\n`);
      });

      state.socket.on('data', (chunk) => {
        state.buffer += String(chunk || '');

        let lineBreakIndex = state.buffer.indexOf('\n');
        while (lineBreakIndex >= 0) {
          const nextLine = state.buffer.slice(0, lineBreakIndex);
          state.buffer = state.buffer.slice(lineBreakIndex + 1);
          handleBridgeLine(state, nextLine);
          lineBreakIndex = state.buffer.indexOf('\n');
        }
      });

      state.socket.on('error', (error) => {
        state.status = 'error';
        emitState(state);
        deliver(state, {
          clientEvent: 'irc_error',
          message: error.message || 'IRC connection failed.'
        });
      });

      state.socket.on('close', () => {
        if (!bridgedClients.has(clientId)) {
          return;
        }
        state.status = 'disconnected';
        state.joined = false;
        state.members = [];
        emitState(state);
      });
    },

    detachClient(clientId) {
      const state = bridgedClients.get(clientId);
      if (!state) {
        return;
      }

      bridgedClients.delete(clientId);
      if (state.socket && !state.socket.destroyed) {
        state.socket.end('QUIT :Leaving web chat\r\n');
        state.socket.destroy();
      }
    },

    sendMessage(clientId, message, channel) {
      const state = bridgedClients.get(clientId);
      const nextMessage = String(message || '')
        .replace(/[\r\n]+/g, ' ')
        .trim();

      if (!state || !nextMessage) {
        return false;
      }

      if (!state.joined || state.socket.destroyed) {
        deliver(state, {
          clientEvent: 'irc_error',
          message: 'Chat is still connecting. Try again in a moment.'
        });
        return false;
      }

      state.socket.write(
        `PRIVMSG ${sanitizeChannel(channel, state.channel)} :${nextMessage}\r\n`
      );
      return true;
    },

    syncClient(clientId) {
      const state = bridgedClients.get(clientId);
      if (!state) {
        return;
      }

      requestRoomList(state);
      emitState(state);
      emitHistory(state);
    },

    listRooms(clientId) {
      const state = bridgedClients.get(clientId);
      if (!state) {
        return false;
      }

      requestRoomList(state);
      return true;
    },

    joinChannel(clientId, channel) {
      const state = bridgedClients.get(clientId);
      if (!state) {
        return false;
      }

      return switchChannel(state, channel);
    },

    createChannel(clientId, channel) {
      const state = bridgedClients.get(clientId);
      if (!state) {
        return false;
      }

      return switchChannel(state, channel);
    }
  };
}

async function startIrcServer(options = {}) {
  const server = createIrcServer(options);
  await server.listen();
  return server;
}

module.exports = {
  DEFAULTS,
  createIrcBridge,
  createNickServSessionAuthProvider,
  createIrcServer,
  createStaticIdentityAuthProvider,
  parseClientLine,
  parseServerLine,
  sanitizeChannel,
  sanitizeNick,
  startIrcServer
};
