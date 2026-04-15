'use strict';

/**
 * Normalizes lobby action used by the lobby action router module.
 * @param {string} action The action value provides an input used by the lobby action router module.
 * @returns {string} Returns the value produced by the lobby action router module.
 */
function normalizeLobbyAction(action) {
  if (action === 'listen' || action === 'listen(') {
    return 'register';
  }

  return String(action || '');
}

/**
 * Creates lobby action router used by the lobby action router module.
 * @param {Object} options The options object supplies the structured input used by the lobby action router module.
 * @param {Object} options.state The `state` property supplies structured input used by the lobby action router module.
 * @param {Function} options.broadcast The `broadcast` property supplies structured input used by the lobby action router module.
 * @param {Function} options.chatLineCall The `chatLineCall` property supplies structured input used by the lobby action router module.
 * @param {Function} options.closeProxyConnection The `closeProxyConnection` property supplies structured input used by the lobby action router module.
 * @param {Function} options.censorCall The `censorCall` property supplies structured input used by the lobby action router module.
 * @param {Function} options.createIrcRoom The `createIrcRoom` property supplies structured input used by the lobby action router module.
 * @param {Function} options.deleteDeckCall The `deleteDeckCall` property supplies structured input used by the lobby action router module.
 * @param {Function} options.disconnectIrcClient The `disconnectIrcClient` property supplies structured input used by the lobby action router module.
 * @param {Function} options.forwardToProxy The `forwardToProxy` property supplies structured input used by the lobby action router module.
 * @param {Function} options.gamelistRequested The `gamelistRequested` property supplies structured input used by the lobby action router module.
 * @param {Function} options.genocideCall The `genocideCall` property supplies structured input used by the lobby action router module.
 * @param {Function} options.globalCall The `globalCall` property supplies structured input used by the lobby action router module.
 * @param {Function} options.globalRequested The `globalRequested` property supplies structured input used by the lobby action router module.
 * @param {Function} options.joinRoom The `joinRoom` property supplies structured input used by the lobby action router module.
 * @param {Function} options.joinIrcRoom The `joinIrcRoom` property supplies structured input used by the lobby action router module.
 * @param {Function} options.listIrcRooms The `listIrcRooms` property supplies structured input used by the lobby action router module.
 * @param {Function} options.mindCrushCall The `mindCrushCall` property supplies structured input used by the lobby action router module.
 * @param {Function} options.murderCall The `murderCall` property supplies structured input used by the lobby action router module.
 * @param {Function} options.openProxyConnection The `openProxyConnection` property supplies structured input used by the lobby action router module.
 * @param {Function} options.privateMessageCall The `privateMessageCall` property supplies structured input used by the lobby action router module.
 * @param {Function} options.registrationCall The `registrationCall` property supplies structured input used by the lobby action router module.
 * @param {Function} options.reviveCall The `reviveCall` property supplies structured input used by the lobby action router module.
 * @param {Function} options.saveDeckCall The `saveDeckCall` property supplies structured input used by the lobby action router module.
 * @param {Function} options.sendIrcMessage The `sendIrcMessage` property supplies structured input used by the lobby action router module.
 * @param {Function} options.sendPacket The `sendPacket` property supplies structured input used by the lobby action router module.
 * @param {Function} options.spawnHostedChild The `spawnHostedChild` property supplies structured input used by the lobby action router module.
 * @param {Function} options.syncIrcClient The `syncIrcClient` property supplies structured input used by the lobby action router module.
 * @param {Function} options.validateSession The `validateSession` property supplies structured input used by the lobby action router module.
 * @returns {{handleAction: Function}} Returns the value produced by the lobby action router module.
 */
class LobbyActionRouter {
  constructor({
    state,
    broadcast,
    chatLineCall,
    closeProxyConnection,
    censorCall,
    createIrcRoom,
    deleteDeckCall,
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
    registrationCall,
    reviveCall,
    saveDeckCall,
    sendIrcMessage,
    sendPacket,
    spawnHostedChild,
    syncIrcClient,
    validateSession
  }) {
  /**
   * Resolves room name used by the lobby action router module.
   * @param {Object} client The client object supplies the structured input used by the lobby action router module.
   * @param {Object} data The data object supplies the structured input used by the lobby action router module.
   * @returns {string} Returns the value produced by the lobby action router module.
   */
  function resolveRoomName(client, data) {
    return `${client?.address?.ip || ''}${data?.uniqueID || ''}`;
  }

  const actionHandlers = Object.freeze({
    duelrequest(_client, data) {
      broadcast({
        clientEvent: 'duelrequest',
        target: data.target,
        from: data.from,
        roompass: data.roompass
      });
    },
    ai(client, data) {
      if (!client.username || client.aiReady === false) {
        return;
      }

      broadcast({
        clientEvent: 'duelrequest',
        target: 'SnarkyChild',
        from: client.username,
        roompass: data.roompass,
        deck: data.deck
      });
      client.aiReady = false;
      setTimeout(() => {
        client.aiReady = true;
      }, 10000);
    },
    ack(_client, data) {
      state.acklevel += 1;
      if (data.name) {
        state.userlist.push(data.name);
      }
    },
    register(client, data) {
      registrationCall(data, client);
    },
    loadSession(client, data) {
      validateSession(data, client);
    },
    proxy_connect(client, data) {
      openProxyConnection(client, data.port);
    },
    proxy_disconnect(client) {
      closeProxyConnection(client);
      sendPacket(client, {
        action: 'proxy',
        status: 'down'
      });
    },
    proxy_message(client, data) {
      const forwarded = forwardToProxy(client, data.payload);
      if (!forwarded) {
        sendPacket(client, {
          action: 'proxy',
          status: 'down',
          error: 'Proxy unavailable for proxied payload.'
        });
      }
    },
    chatline(client, data, roomName) {
      chatLineCall(client, data, roomName);
    },
    irc_message(client, data) {
      sendIrcMessage(client, data);
    },
    irc_sync(client) {
      syncIrcClient(client);
    },
    irc_list_rooms(client) {
      listIrcRooms(client);
    },
    irc_join_room(client, data) {
      joinIrcRoom(client, data);
    },
    irc_create_room(client, data) {
      createIrcRoom(client, data);
    },
    irc_disconnect(client) {
      disconnectIrcClient(client);
    },
    global(_client, data) {
      globalCall(data);
    },
    globalrequest(client) {
      globalRequested(client);
    },
    gamelistrequest(client) {
      gamelistRequested(client);
    },
    genocide(_client, data) {
      genocideCall(data);
    },
    murder(_client, data) {
      murderCall(data);
    },
    censor(_client, data) {
      censorCall(data);
    },
    revive(_client, data) {
      reviveCall(data);
    },
    mindcrush(_client, data) {
      mindCrushCall(data);
    },
    host(client, data) {
      if (!data.hostConfig || typeof data.hostConfig !== 'object') {
        return;
      }

      spawnHostedChild(data.hostConfig, { client });
    },
    privateMessage(client, data) {
      privateMessageCall(client, data);
    },
    save(client, data, roomName) {
      saveDeckCall(client, data, roomName);
    },
    delete(client, data, roomName) {
      deleteDeckCall(client, data, roomName);
    }
  });

  return {
    /**
     * Handles action used by the lobby action router module.
     * @param {Object} client The client value provides an input used by the lobby action router module.
     * @param {Object} data The data value provides an input used by the lobby action router module.
     * @returns {void} Does not return a value.
     */
    handleAction(client, data) {
      const action = normalizeLobbyAction(data?.action);
      const roomName = resolveRoomName(client, data);

      joinRoom(client, roomName);
      actionHandlers[action]?.(client, data, roomName);
    }
  };
  }
}

module.exports = {
  LobbyActionRouter,
  normalizeLobbyAction
};
