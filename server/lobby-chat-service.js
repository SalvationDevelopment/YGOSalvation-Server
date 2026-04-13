'use strict';

/**
 * Creates lobby chat service used by the lobby chat service module.
 * @param {Object} options The options object supplies the structured input used by the lobby chat service module.
 * @param {Function} options.broadcast The `broadcast` property supplies structured input used by the lobby chat service module.
 * @param {Object|null} options.chatBridge The `chatBridge` property supplies structured input used by the lobby chat service module.
 * @param {Function} options.createChatId The `createChatId` property supplies structured input used by the lobby chat service module.
 * @param {Function} options.dateFactory The `dateFactory` property supplies structured input used by the lobby chat service module.
 * @param {Function} options.roomWrite The `roomWrite` property supplies structured input used by the lobby chat service module.
 * @param {Function} options.sanitizeMessage The `sanitizeMessage` property supplies structured input used by the lobby chat service module.
 * @param {Function} options.sendPacket The `sendPacket` property supplies structured input used by the lobby chat service module.
 * @param {Function} options.setTimeoutFn The `setTimeoutFn` property supplies structured input used by the lobby chat service module.
 * @param {Object} options.state The `state` property supplies structured input used by the lobby chat service module.
 * @param {Function} options.validateUser The `validateUser` property supplies structured input used by the lobby chat service module.
 * @returns {{attachClient: Function, chatLineCall: Function, censorCall: Function, createIrcRoom: Function, detachClient: Function, disconnectIrcClient: Function, genocideCall: Function, globalCall: Function, globalRequested: Function, joinIrcRoom: Function, listIrcRooms: Function, mindCrushCall: Function, murderCall: Function, privateMessageCall: Function, reviveCall: Function, sendIrcMessage: Function, syncIrcClient: Function}} Returns the value produced by the lobby chat service module.
 */
function createLobbyChatService({
  state,
  broadcast,
  chatBridge = null,
  createChatId = () =>
    String(global.crypto?.randomUUID?.() || `${Date.now()}_${Math.random()}`),
  dateFactory = () => new Date(),
  roomWrite,
  sanitizeMessage,
  sendPacket,
  setTimeoutFn = setTimeout,
  validateUser
}) {
  /**
   * Executes a validated user action used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @param {Function} onValid The onValid callback provides an input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function withValidatedUser(data, onValid) {
    validateUser(false, data, (error, validOrInfo, responseData) => {
      if (error) {
        return;
      }

      const info = responseData === undefined ? validOrInfo : responseData;
      const valid = responseData === undefined ? true : validOrInfo;
      if (!valid) {
        return;
      }

      onValid(info || {});
    });
  }

  /**
   * Attaches chat bridge client used by the lobby chat service module.
   * @param {Object} client The client object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function attachClient(client) {
    if (!chatBridge || !client?.id || !client?.username || !client?.session) {
      return;
    }

    chatBridge.attachClient({
      clientId: client.id,
      username: client.username,
      session: client.session,
      deliver: (packet) => sendPacket(client, packet)
    });
  }

  /**
   * Detaches chat bridge client used by the lobby chat service module.
   * @param {string} clientId The clientId value provides an input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function detachClient(clientId) {
    if (!chatBridge) {
      return;
    }

    chatBridge.detachClient(clientId);
  }

  /**
   * Executes the global requested helper used by the lobby chat service module.
   * @param {Object} client The client value provides an input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function globalRequested(client) {
    sendPacket(client, {
      clientEvent: 'global',
      message: state.currentGlobalMessage
    });
  }

  /**
   * Executes the chat line helper used by the lobby chat service module.
   * @param {Object} client The client object supplies the structured input used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @param {string} roomName The roomName value provides an input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function chatLineCall(client, data, roomName) {
    if (client.username && client.speak) {
      const packet = {
        clientEvent: 'chatline',
        from: client.username,
        msg: sanitizeMessage(data.msg),
        uid: createChatId(),
        date: dateFactory(),
        timezone: data.timezone
      };

      client.speak = false;
      if (state.chatbox.length > 100) {
        state.chatbox.shift();
      }

      broadcast(packet);
      state.chatbox.push(packet);
      setTimeoutFn(() => {
        client.speak = true;
      }, 500);
      return;
    }

    roomWrite(roomName, {
      clientEvent: 'slowchat',
      error: 'Exceeded 500ms chat timeout'
    });
  }

  /**
   * Executes the private message helper used by the lobby chat service module.
   * @param {Object} client The client object supplies the structured input used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function privateMessageCall(client, data) {
    if (!client.username) {
      return;
    }

    roomWrite(data.to, Object.assign({}, data, {
      date: dateFactory()
    }));
  }

  /**
   * Executes the IRC send message helper used by the lobby chat service module.
   * @param {Object} client The client object supplies the structured input used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function sendIrcMessage(client, data) {
    if (client.username && chatBridge) {
      chatBridge.sendMessage(client.id, data.message, data.channel);
    }
  }

  /**
   * Executes the IRC sync helper used by the lobby chat service module.
   * @param {Object} client The client object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function syncIrcClient(client) {
    if (client.username && chatBridge) {
      chatBridge.syncClient(client.id);
    }
  }

  /**
   * Executes the IRC room list helper used by the lobby chat service module.
   * @param {Object} client The client object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function listIrcRooms(client) {
    if (client.username && chatBridge) {
      chatBridge.listRooms(client.id);
    }
  }

  /**
   * Executes the IRC join room helper used by the lobby chat service module.
   * @param {Object} client The client object supplies the structured input used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function joinIrcRoom(client, data) {
    if (client.username && chatBridge) {
      chatBridge.joinChannel(client.id, data.channel);
    }
  }

  /**
   * Executes the IRC create room helper used by the lobby chat service module.
   * @param {Object} client The client object supplies the structured input used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function createIrcRoom(client, data) {
    if (client.username && chatBridge) {
      chatBridge.createChannel(client.id, data.channel);
    }
  }

  /**
   * Executes the IRC disconnect helper used by the lobby chat service module.
   * @param {Object} client The client object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function disconnectIrcClient(client) {
    if (chatBridge) {
      chatBridge.detachClient(client.id);
    }
  }

  /**
   * Executes the global call helper used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function globalCall(data) {
    withValidatedUser(data, (info) => {
      if (info.success && state.adminlist[data.username]) {
        broadcast({
          clientEvent: 'global',
          message: data.message
        });
        state.currentGlobalMessage = data.message;
      }
    });
  }

  /**
   * Executes the genocide call helper used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function genocideCall(data) {
    withValidatedUser(data, (info) => {
      if (info.data && info.success && info.data.g_access_cp === '1') {
        broadcast({
          clientEvent: 'genocide',
          message: data.message
        });
      }
    });
  }

  /**
   * Executes the murder call helper used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function murderCall(data) {
    withValidatedUser(data, (info) => {
      if (info.success && state.adminlist[data.username]) {
        broadcast({
          clientEvent: 'murder',
          target: data.target
        });
      }
    });
  }

  /**
   * Executes the revive call helper used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function reviveCall(data) {
    withValidatedUser(data, (info) => {
      if (info.success && state.adminlist[data.username]) {
        broadcast({
          clientEvent: 'revive',
          target: data.target
        });
      }
    });
  }

  /**
   * Executes the censor call helper used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function censorCall(data) {
    withValidatedUser(data, (info) => {
      if (info.success && state.adminlist[data.username]) {
        broadcast({
          clientEvent: 'censor',
          messageID: data.messageID
        });
        state.chatbox = state.chatbox.filter(
          (message) => message.uid !== String(data.messageID)
        );
      }
    });
  }

  /**
   * Executes the mind crush call helper used by the lobby chat service module.
   * @param {Object} data The data object supplies the structured input used by the lobby chat service module.
   * @returns {void} Does not return a value.
   */
  function mindCrushCall(data) {
    withValidatedUser(data, (info) => {
      if (info.success && state.adminlist[data.username]) {
        broadcast({
          clientEvent: 'mindcrush',
          target: data.target
        });
      }
    });
  }

  return {
    attachClient,
    chatLineCall,
    censorCall,
    createIrcRoom,
    detachClient,
    disconnectIrcClient,
    genocideCall,
    globalCall,
    globalRequested,
    joinIrcRoom,
    listIrcRooms,
    mindCrushCall,
    murderCall,
    privateMessageCall,
    reviveCall,
    sendIrcMessage,
    syncIrcClient
  };
}

module.exports = {
  createLobbyChatService
};
