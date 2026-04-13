'use strict';

const {
  attachRoomClientProtocol,
  translateIncomingRuntimeMessage
} = require('./runtime-translation');


/**
 * Executes the log helper used by the server module.
 * @param {Object} message The message value provides an input used by the server module.
 * @returns {void} Does not return a value.
 */
function log(message) {
  console.log(`[server] ${message}`);
}

/**
 * Resolves message owner used by the runtime dispatcher module.
 * Legacy `action` packets keep precedence to preserve the previous boot order.
 * @param {Object} message The message value provides an input used by the runtime dispatcher module.
 * @returns {('lobby'|'room'|null)} Returns the value produced by the runtime dispatcher module.
 */
function getMessageOwner(message) {
  return translateIncomingRuntimeMessage(message).owner;
}

/**
 * Creates runtime dispatcher used by the runtime dispatcher module.
 * @param {Object} options The options object supplies the structured input used by the runtime dispatcher module.
 * @param {Function} options.log The `log` property supplies structured input used by the runtime dispatcher module.
 * @param {Object} options.lobby The `lobby` property supplies structured input used by the runtime dispatcher module.
 * @returns {{handleConnection: Function, handleMessage: Function, removeClient: Function}} Returns the value produced by the runtime dispatcher module.
 */
function createRuntimeDispatcher({
  lobby,
  log = () => {}
}) {
  const initializedRoomClients = new Set();

  /**
   * Executes the log helper used by the runtime dispatcher module.
   * @param {string} message The message value provides an input used by the runtime dispatcher module.
   * @returns {void} Does not return a value.
   */
  function log(message) {
    log(`[runtime] ${message}`);
  }

  /**
   * Ensures room connection used by the runtime dispatcher module.
   * @param {Object} client The client value provides an input used by the runtime dispatcher module.
   * @returns {void} Does not return a value.
   */
  function ensureRoomConnection(client, protocolMode = 'canonical') {
    if (!client || initializedRoomClients.has(client.id)) {
      if (client) {
        attachRoomClientProtocol(client, protocolMode);
      }
      return;
    }

    attachRoomClientProtocol(client, protocolMode);
    initializedRoomClients.add(client.id);
  }

  return {
    /**
     * Handles connection used by the runtime dispatcher module.
     * @param {Object} client The client value provides an input used by the runtime dispatcher module.
     * @returns {void} Does not return a value.
     */
    handleConnection(client) {
      lobby.handleConnection(client);
    },
    /**
     * Handles message used by the runtime dispatcher module.
     * @param {Object} client The client value provides an input used by the runtime dispatcher module.
     * @param {Object} message The message value provides an input used by the runtime dispatcher module.
     * @returns {boolean} Returns the value produced by the runtime dispatcher module.
     */
    handleMessage(client, message) {
      const translated = translateIncomingRuntimeMessage(message),
        owner = translated.owner;

      if (
        message &&
        typeof message === 'object' &&
        typeof message.action === 'string' &&
        message.action.length > 0 &&
        typeof message.type === 'string' &&
        message.type.length > 0
      ) {
        log(
          `received ambiguous packet for ${client?.id || 'unknown'}; ` +
            `routing to lobby action=${message.action} type=${message.type}`
        );
      }

      if (owner === 'lobby') {
        return lobby.handleMessage(client, translated.message);
      }

     
      return false;
    },
    /**
     * Removes client used by the runtime dispatcher module.
     * @param {Object} client The client value provides an input used by the runtime dispatcher module.
     * @returns {void} Does not return a value.
     */
    removeClient(client) {
      lobby.removeClient(client);

      const hadRoomConnection = initializedRoomClients.delete(client?.id);
     
    }
  };
}

class ConnectionSuite {
  constructor({ lobby }) {
    const runtimeDispatcher = createRuntimeDispatcher({
      lobby,
      log,
    });

    /**
     * Handles connection events for the server module.
     * @param {Object} client The client value provides an input used by the server module.
     * @returns {void} Does not return a value.
     */
    const onConnection = (client) => {
      runtimeDispatcher.handleConnection(client);
    };
    /**
     * Handles message events for the server module.
     * @param {Object} client The client value provides an input used by the server module.
     * @param {Object} message The message value provides an input used by the server module.
     * @returns {void} Does not return a value.
     */
    const onMessage = (client, message) => {
      runtimeDispatcher.handleMessage(client, message);
    };
    /**
     * Handles close events for the server module.
     * @param {Object} client The client value provides an input used by the server module.
     * @returns {void} Does not return a value.
     */
    const onClose = (client) => {
      runtimeDispatcher.removeClient(client);
    };

    this.onConnection = onConnection;
    this.onMessage = onMessage;
    this.onClose = onClose;
    this.log = log;
  }
}

module.exports = {
  ConnectionSuite,
  createRuntimeDispatcher,
  getMessageOwner
};
