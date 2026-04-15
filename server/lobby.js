'use strict';

require('./lib/load-shared-env');

const { WebSocket } = require('ws');
const userController = require('./api/routes/endpoint_users');
const decks = require('./api/routes/endpoint_decks');
const services = require('./api/routes/endpoint_services');
const sanitize = require('./game/lib_html_sanitizer');
const { parseHostConfig } = require('./host-config');
const { LobbyState } = require('./lobby-state');
const { LobbyAuthService } = require('./lobby-auth-service');
const { LobbyChatService } = require('./lobby-chat-service');
const { LobbyClientRegistry } = require('./lobby-client-registry');
const { LobbyDeckService } = require('./lobby-deck-service');
const { LobbyDispatchService } = require('./lobby-dispatch-service');
const { LobbyStatusService } = require('./lobby-status-service');
const { LobbyActionRouter } = require('./lobby-action-router');
const { LobbyProxyService } = require('./lobby-proxy-service');
const { LobbyHostedGameService } = require('./lobby-hosted-game-service');

class Lobby {
  constructor(
    ircServer,
    {
      logger = () => {},
      chatBridge = ircServer?.ircBridge || null
    } = {}
  ) {
    this.ircServer = ircServer;

    const state = new LobbyState();

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

    const baseDependencies = {
      state,
      sendPacket
    };
    const clientRegistry = new LobbyClientRegistry({
      ...baseDependencies
    });
    const broadcastDependencies = {
      ...baseDependencies,
      broadcast: clientRegistry.broadcast
    };
    const lobbyProxyService = new LobbyProxyService({
      ...baseDependencies,
      WebSocketClass: WebSocket
    });
    const lobbyStatusService = new LobbyStatusService({
      ...broadcastDependencies,
      addClient: clientRegistry.addClient,
    });
    const roomDependencies = {
      ...broadcastDependencies,
      joinRoom: clientRegistry.joinRoom,
      roomStatePacket: lobbyStatusService.roomStatePacket
    };

    const lobbyHostedGameService = new LobbyHostedGameService({
      ...roomDependencies,
      logDuel: (message, callback) => services.logDuel(message, callback),
      parseHostConfig,
      validateSession: userController.validateSession
    });
    const lobbyChatService = new LobbyChatService({
      ...broadcastDependencies,
      chatBridge,
      roomWrite: clientRegistry.roomWrite,
      sanitizeMessage: sanitize,
      validateUser: userController.validate
    });
    const lobbyDeckService = new LobbyDeckService({
      decksApi: decks,
      log,
      roomWrite: clientRegistry.roomWrite
    });
    const lobbyAuthService = new LobbyAuthService({
      ...roomDependencies,
      log,
      onAuthenticatedClient: lobbyChatService.attachClient,
      validateLogin: userController.validate,
      validateUserSession: userController.validateSession
    });
    const moderationDependencies = {
      chatLineCall: lobbyChatService.chatLineCall,
      censorCall: lobbyChatService.censorCall,
      createIrcRoom: lobbyChatService.createIrcRoom,
      disconnectIrcClient: lobbyChatService.disconnectIrcClient,
      genocideCall: lobbyChatService.genocideCall,
      globalCall: lobbyChatService.globalCall,
      globalRequested: lobbyChatService.globalRequested,
      joinIrcRoom: lobbyChatService.joinIrcRoom,
      listIrcRooms: lobbyChatService.listIrcRooms,
      mindCrushCall: lobbyChatService.mindCrushCall,
      murderCall: lobbyChatService.murderCall,
      privateMessageCall: lobbyChatService.privateMessageCall,
      reviveCall: lobbyChatService.reviveCall,
      sendIrcMessage: lobbyChatService.sendIrcMessage,
      syncIrcClient: lobbyChatService.syncIrcClient
    };
    const deckDependencies = {
      deleteDeckCall: lobbyDeckService.deleteDeckCall,
      saveDeckCall: lobbyDeckService.saveDeckCall
    };
    const proxyDependencies = {
      closeProxyConnection: lobbyProxyService.closeProxyConnection,
      forwardToProxy: lobbyProxyService.forwardToProxy,
      openProxyConnection: lobbyProxyService.openProxyConnection
    };

    const lobbyActionRouter = new LobbyActionRouter({
      ...broadcastDependencies,
      ...moderationDependencies,
      ...proxyDependencies,
      ...deckDependencies,
      gamelistRequested: lobbyStatusService.gamelistRequested,
      joinRoom: clientRegistry.joinRoom,
      registrationCall: lobbyAuthService.registrationCall,
      spawnHostedChild: lobbyHostedGameService.spawnHostedChild,
      validateSession: lobbyAuthService.validateSession
    });
    const lobbyDispatchService = new LobbyDispatchService({
      ...baseDependencies,
      ...proxyDependencies,
      gamelistRequested: lobbyStatusService.gamelistRequested,
      detachClient: lobbyChatService.detachClient,
      handleAction: lobbyActionRouter.handleAction,
      removeClientFromRegistry: clientRegistry.removeClient
    });

    this.handleConnection = lobbyStatusService.handleConnection;
    this.handleMessage = lobbyDispatchService.handleMessage;
    this.removeClient = lobbyDispatchService.removeClient;
    this.getSnapshot = lobbyStatusService.getSnapshot;
    this.hostGame = lobbyHostedGameService.hostGame;
    this._startLobby = lobbyStatusService.start;
  }

  async start() {
    await this.ircServer.start();
    this._startLobby();
  }
}

module.exports = {
  Lobby
};
