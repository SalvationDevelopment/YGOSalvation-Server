'use strict';

require('./lib/load-shared-env');

const { WebSocket } = require('ws');
const userController = require('./api/routes/endpoint_users');
const decks = require('./api/routes/endpoint_decks');
const services = require('./api/routes/endpoint_services');
const sanitize = require('./game/lib_html_sanitizer');
const { parseHostConfig } = require('./host-config');
const { createLobbyState } = require('./lobby-state');
const { createLobbyAuthService } = require('./lobby-auth-service');
const { createLobbyChatService } = require('./lobby-chat-service');
const { createLobbyClientRegistry } = require('./lobby-client-registry');
const { createLobbyDeckService } = require('./lobby-deck-service');
const { createLobbyDispatchService } = require('./lobby-dispatch-service');
const { createLobbyStatusService } = require('./lobby-status-service');
const { createLobbyActionRouter } = require('./lobby-action-router');
const { createLobbyProxyService } = require('./lobby-proxy-service');
const { createLobbyHostedGameService } = require('./lobby-hosted-game-service');

/**
 * Creates lobby used by the lobby module.
 * @param {Object} options The options object supplies the structured input used by the lobby module, including the `logger` property.
 * @param {Function} options.logger The `logger` property supplies structured input used by the lobby module.
 * @returns {{start: Function, handleConnection: Function, handleMessage: Function, removeClient: Function, getSnapshot: Function, hostGame: Function}} Returns the value produced by the lobby module.
 */
function createLobby({ logger = () => {}, chatBridge = null } = {}) {
  const state = createLobbyState();

  /**
   * Executes the log helper used by the lobby module.
   * @param {string} message The message value provides an input used by the lobby module.
   * @returns {void} Does not return a value.
   */
  function log(message) {
    logger(`[lobby] ${message}`);
  }

  /**
   * Sends packet used by the lobby module.
   * @param {Object} client The client object supplies the structured input used by the lobby module, including the `sendPacket` property.
   * @param {Function} client.sendPacket The `sendPacket` property supplies structured input used by the lobby module.
   * @param {Object} packet The packet value provides an input used by the lobby module.
   * @returns {void} Does not return a value.
   */
  function sendPacket(client, packet) {
    if (!client) {
      return;
    }

    client.sendPacket(packet);
  }
  const clientRegistry = createLobbyClientRegistry({
    state,
    sendPacket
  });
  const {
    addClient,
    broadcast,
    joinRoom,
    removeClient: removeClientFromRegistry,
    roomWrite
  } = clientRegistry;
  const {
    closeProxyConnection,
    forwardToProxy,
    openProxyConnection
  } = createLobbyProxyService({
    state,
    sendPacket,
    WebSocketClass: WebSocket
  });
  const {
    gamelistRequested,
    getSnapshot,
    handleConnection,
    roomStatePacket,
    start
  } = createLobbyStatusService({
    state,
    addClient,
    broadcast,
    sendPacket
  });

  const {
    hostGame,
    spawnHostedChild
  } = createLobbyHostedGameService({
    state,
    broadcast,
    logDuel: (message, callback) => services.logDuel(message, callback),
    parseHostConfig,
    roomStatePacket,
    sendPacket,
    validateSession: userController.validateSession
  });
  const {
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
  } = createLobbyChatService({
    state,
    broadcast,
    chatBridge,
    roomWrite,
    sanitizeMessage: sanitize,
    sendPacket,
    validateUser: userController.validate
  });
  const {
    deleteDeckCall,
    saveDeckCall
  } = createLobbyDeckService({
    decksApi: decks,
    log,
    roomWrite
  });
  const {
    registrationCall,
    validateSession: restoreSession
  } = createLobbyAuthService({
    state,
    broadcast,
    joinRoom,
    log,
    onAuthenticatedClient: attachClient,
    roomStatePacket,
    sendPacket,
    validateLogin: userController.validate,
    validateUserSession: userController.validateSession
  });

  const { handleAction } = createLobbyActionRouter({
    state,
    broadcast,
    chatLineCall,
    closeProxyConnection,
    censorCall,
    createIrcRoom,
    disconnectIrcClient,
    forwardToProxy,
    gamelistRequested,
    genocideCall,
    globalCall,
    globalRequested,
    joinRoom,
    joinIrcRoom,
    listIrcRooms,
    mindCrushCall,
    murderCall,
    openProxyConnection,
    privateMessageCall,
    deleteDeckCall,
    registrationCall,
    reviveCall,
    saveDeckCall,
    sendIrcMessage,
    sendPacket,
    spawnHostedChild,
    syncIrcClient,
    validateSession: restoreSession
  });
  const {
    handleMessage,
    removeClient
  } = createLobbyDispatchService({
    state,
    closeProxyConnection,
    detachClient,
    forwardToProxy,
    gamelistRequested,
    handleAction,
    removeClientFromRegistry,
    sendPacket
  });

  return {
    start,
    handleConnection,
    handleMessage,
    removeClient,
    getSnapshot,
    hostGame
  };
}

class Lobby {
  constructor(ircServer) {
    this.ircServer = ircServer;
    this.lobby = createLobby({
      logger: (msg) => log(msg),
      chatBridge: ircServer.ircBridge,
    });
    
  }

  async start() {
    await this.ircServer.start();
    this.lobby.start();
  }
}

module.exports = {
  Lobby
};
