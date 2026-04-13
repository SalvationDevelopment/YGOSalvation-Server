'use strict';

const { CLIENT_MESSAGE_TYPES } = require('./protocol');
const {
  findCanonicalRoomTypeInventoryEntry,
  findLegacyActionInventoryEntry
} = require('./runtime-message-inventory');

const ROOM_ACTION_TRANSLATORS = Object.freeze({
  join(message) {
    return {
      type: CLIENT_MESSAGE_TYPES.JOIN_ROOM,
      payload: {
        roomId:
          message?.roomId ||
          message?.payload?.roomId ||
          message?.room
      }
    };
  },
  leave() {
    return {
      type: CLIENT_MESSAGE_TYPES.LEAVE_ROOM,
      payload: {}
    };
  },
  chat(message) {
    return {
      type: CLIENT_MESSAGE_TYPES.CHAT,
      payload: {
        message: message?.message || message?.msg || ''
      }
    };
  },
  lock(message) {
    return {
      type: CLIENT_MESSAGE_TYPES.SUBMIT_DECK,
      payload: {
        deck: message?.deck
      }
    };
  },
  start() {
    return {
      type: CLIENT_MESSAGE_TYPES.START_DUEL,
      payload: {}
    };
  },
  question(message) {
    return {
      type: CLIENT_MESSAGE_TYPES.OCG_RESPONSE,
      payload: {
        response: message?.answer
      }
    };
  },
  choice(message) {
    return {
      type: CLIENT_MESSAGE_TYPES.OCG_RESPONSE,
      payload: {
        response: message?.answer
      }
    };
  },
  ping() {
    return {
      type: CLIENT_MESSAGE_TYPES.PING,
      payload: {}
    };
  }
});

function normalizeLegacyLobbyAction(action) {
  if (action === 'listen' || action === 'listen(') {
    return 'register';
  }
  return action;
}

function translateIncomingRuntimeMessage(message) {
  if (!message || typeof message !== 'object') {
    return {
      owner: null,
      protocolMode: 'canonical',
      message
    };
  }

  if (typeof message.action === 'string' && message.action.length > 0) {
    const normalizedAction = normalizeLegacyLobbyAction(message.action),
      inventoryEntry = findLegacyActionInventoryEntry(normalizedAction),
      translator = ROOM_ACTION_TRANSLATORS[normalizedAction];

    if (
      inventoryEntry?.owner === 'room' &&
      inventoryEntry.disposition === 'delete'
    ) {
      return {
        owner: null,
        protocolMode: 'deleted-room-action',
        message: Object.assign({}, message, {
          action: normalizedAction
        })
      };
    }

    if (typeof translator === 'function') {
      return {
        owner: 'room',
        protocolMode: 'legacy-room',
        message: translator(message)
      };
    }

    return {
      owner: inventoryEntry?.owner || 'lobby',
      protocolMode:
        inventoryEntry?.owner === 'lobby' ? 'legacy-lobby' : 'canonical',
      message: Object.assign({}, message, {
        action: normalizedAction
      })
    };
  }

  if (typeof message.type === 'string' && message.type.length > 0) {
    const inventoryEntry = findCanonicalRoomTypeInventoryEntry(message.type);
    return {
      owner: inventoryEntry?.owner || 'room',
      protocolMode: 'canonical',
      message
    };
  }

  return {
    owner: null,
    protocolMode: 'canonical',
    message
  };
}

function translateOutgoingRoomPacket(type, payload = {}, protocolMode = 'canonical') {
  if (protocolMode !== 'legacy-room') {
    return null;
  }

  if (type === 'error') {
    return Object.assign(
      {
        action: 'error',
        error: payload?.message
      },
      payload
    );
  }

  return Object.assign(
    {
      action: type
    },
    payload
  );
}

function attachRoomClientProtocol(client, protocolMode = 'canonical') {
  if (!client || typeof client.send !== 'function') {
    return client;
  }

  client.__roomProtocolMode = protocolMode;

  if (typeof client.__roomSendAdapterOriginal === 'function') {
    return client;
  }

  const originalSend = client.send.bind(client);

  Object.defineProperty(client, '__roomSendAdapterOriginal', {
    value: originalSend,
    enumerable: false,
    configurable: true,
    writable: false
  });

  client.send = function sendRoomPacket(type, payload = {}) {
    const translated = translateOutgoingRoomPacket(
      type,
      payload,
      client.__roomProtocolMode
    );

    if (translated && typeof client.sendPacket === 'function') {
      client.sendPacket(translated);
      return;
    }

    if (translated && typeof translated.action === 'string') {
      const { action, ...actionPayload } = translated;
      originalSend(action, actionPayload);
      return;
    }

    originalSend(type, payload);
  };

  return client;
}

module.exports = {
  attachRoomClientProtocol,
  normalizeLegacyLobbyAction,
  translateIncomingRuntimeMessage,
  translateOutgoingRoomPacket
};
