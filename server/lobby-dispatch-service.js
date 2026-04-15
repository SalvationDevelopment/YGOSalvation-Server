'use strict';

/**
 * Creates lobby dispatch service used by the lobby dispatch service module.
 * @param {Object} options The options object supplies the structured input used by the lobby dispatch service module.
 * @param {Function} options.closeProxyConnection The `closeProxyConnection` property supplies structured input used by the lobby dispatch service module.
 * @param {Function} options.detachClient The `detachClient` property supplies structured input used by the lobby dispatch service module.
 * @param {Function} options.forwardToProxy The `forwardToProxy` property supplies structured input used by the lobby dispatch service module.
 * @param {Function} options.gamelistRequested The `gamelistRequested` property supplies structured input used by the lobby dispatch service module.
 * @param {Function} options.handleAction The `handleAction` property supplies structured input used by the lobby dispatch service module.
 * @param {Function} options.removeClientFromRegistry The `removeClientFromRegistry` property supplies structured input used by the lobby dispatch service module.
 * @param {Function} options.sendPacket The `sendPacket` property supplies structured input used by the lobby dispatch service module.
 * @param {Object} options.state The `state` property supplies structured input used by the lobby dispatch service module.
 * @returns {{handleMessage: Function, removeClient: Function}} Returns the value produced by the lobby dispatch service module.
 */
class LobbyDispatchService {
  constructor({
    state,
    closeProxyConnection,
    detachClient,
    forwardToProxy,
    gamelistRequested,
    handleAction,
    removeClientFromRegistry,
    sendPacket
  }) {
  /**
   * Resolves whether the action is a direct proxy lifecycle action used by the
   * lobby dispatch service module.
   * @param {string} action The action value provides an input used by the lobby dispatch service module.
   * @returns {boolean} Returns the value produced by the lobby dispatch service module.
   */
  function isProxyLifecycleAction(action) {
    return action === 'proxy_connect' || action === 'proxy_disconnect';
  }

  /**
   * Resolves whether the action is a proxy channel action used by the lobby dispatch service module.
   * @param {string} action The action value provides an input used by the lobby dispatch service module.
   * @returns {boolean} Returns the value produced by the lobby dispatch service module.
   */
  function isProxyChannelAction(action) {
    return isProxyLifecycleAction(action) || action === 'proxy_message';
  }

  return {
    /**
     * Handles message used by the lobby dispatch service module.
     * @param {Object} client The client object supplies the structured input used by the lobby dispatch service module.
     * @param {Object} message The message object supplies the structured input used by the lobby dispatch service module.
     * @returns {boolean} Returns the value produced by the lobby dispatch service module.
     */
    handleMessage(client, message) {
      if (!message || typeof message !== 'object') {
        return false;
      }

      if (!message.action) {
        return false;
      }

      const proxyActive = state.proxiedSockets.has(client.id);
      if (proxyActive && !isProxyChannelAction(message.action)) {
        const forwarded = forwardToProxy(client, message);
        if (!forwarded) {
          sendPacket(client, {
            action: 'proxy',
            status: 'down',
            error: `Proxy unavailable for action "${message.action}".`
          });
        }
        return true;
      }

      if (!isProxyLifecycleAction(message.action)) {
        gamelistRequested(client);
      }

      handleAction(client, message);
      return true;
    },

    /**
     * Removes client used by the lobby dispatch service module.
     * @param {Object} client The client object supplies the structured input used by the lobby dispatch service module.
     * @returns {void} Does not return a value.
     */
    removeClient(client) {
      closeProxyConnection(client);
      detachClient(client.id);
      removeClientFromRegistry(client);
    }
  };
  }
}

module.exports = {
  LobbyDispatchService
};
