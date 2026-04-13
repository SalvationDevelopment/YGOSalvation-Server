'use strict';

/**
 * Creates lobby proxy service used by the lobby proxy service module.
 * @param {Object} options The options object supplies the structured input used by the lobby proxy service module.
 * @param {Function} options.WebSocketClass The `WebSocketClass` property supplies structured input used by the lobby proxy service module.
 * @param {Function} options.sendPacket The `sendPacket` property supplies structured input used by the lobby proxy service module.
 * @param {Object} options.state The `state` property supplies structured input used by the lobby proxy service module.
 * @returns {{closeProxyConnection: Function, forwardToProxy: Function, openProxyConnection: Function}} Returns the value produced by the lobby proxy service module.
 */
function createLobbyProxyService({
  state,
  sendPacket,
  WebSocketClass
}) {
  /**
   * Reads proxy message payload used by the lobby proxy service module.
   * @param {*} raw The raw value provides an input used by the lobby proxy service module.
   * @returns {string} Returns the value produced by the lobby proxy service module.
   */
  function readProxyMessage(raw) {
    if (typeof raw === 'string') {
      return raw;
    }

    if (raw && typeof raw.toString === 'function') {
      return raw.toString('utf8');
    }

    return String(raw);
  }

  /**
   * Closes proxy connection used by the lobby proxy service module.
   * @param {Object} client The client object supplies the structured input used by the lobby proxy service module, including the `id` property.
   * @param {string} client.id The `id` property supplies structured input used by the lobby proxy service module.
   * @returns {void} Does not return a value.
   */
  function closeProxyConnection(client) {
    const proxy = state.proxiedSockets.get(client.id);
    if (!proxy) {
      return;
    }

    state.proxiedSockets.delete(client.id);
    if (
      proxy.socket.readyState === WebSocketClass.OPEN ||
      proxy.socket.readyState === WebSocketClass.CONNECTING
    ) {
      proxy.socket.close();
    }
  }

  /**
   * Forwards packet to proxy used by the lobby proxy service module.
   * @param {Object} client The client object supplies the structured input used by the lobby proxy service module, including the `id` property.
   * @param {string} client.id The `id` property supplies structured input used by the lobby proxy service module.
   * @param {Object} packet The packet value provides an input used by the lobby proxy service module.
   * @returns {boolean} Returns the value produced by the lobby proxy service module.
   */
  function forwardToProxy(client, packet) {
    const proxy = state.proxiedSockets.get(client.id);
    if (!proxy) {
      return false;
    }

    const serialized = JSON.stringify(packet);
    if (proxy.socket.readyState === WebSocketClass.OPEN) {
      proxy.socket.send(serialized);
      return true;
    }

    if (proxy.socket.readyState === WebSocketClass.CONNECTING) {
      proxy.queue.push(serialized);
      return true;
    }

    return false;
  }

  /**
   * Opens proxy connection used by the lobby proxy service module.
   * @param {Object} client The client object supplies the structured input used by the lobby proxy service module, including the `id` property.
   * @param {string} client.id The `id` property supplies structured input used by the lobby proxy service module.
   * @param {number} requestedPort The requestedPort value provides an input used by the lobby proxy service module.
   * @returns {void} Does not return a value.
   */
  function openProxyConnection(client, requestedPort) {
    const targetPort = Number(requestedPort);

    if (!Number.isFinite(targetPort) || targetPort <= 0) {
      sendPacket(client, {
        action: 'proxy',
        status: 'down',
        error: 'Invalid proxy port.'
      });
      return;
    }

    closeProxyConnection(client);

    const outbound = new WebSocketClass(`ws://127.0.0.1:${targetPort}`);
    const proxy = {
      socket: outbound,
      queue: []
    };
    state.proxiedSockets.set(client.id, proxy);

    sendPacket(client, {
      action: 'proxy',
      status: 'connecting',
      port: targetPort
    });

    outbound.on('open', () => {
      if (state.proxiedSockets.get(client.id)?.socket !== outbound) {
        outbound.close();
        return;
      }

      while (proxy.queue.length) {
        outbound.send(proxy.queue.shift());
      }
      sendPacket(client, {
        action: 'proxy',
        status: 'up',
        port: targetPort
      });
    });

    outbound.on('message', (raw) => {
      if (state.proxiedSockets.get(client.id)?.socket !== outbound) {
        return;
      }

      try {
        sendPacket(client, JSON.parse(readProxyMessage(raw)));
      } catch {
        // Ignore malformed upstream packets.
      }
    });

    outbound.on('close', () => {
      if (state.proxiedSockets.get(client.id)?.socket === outbound) {
        state.proxiedSockets.delete(client.id);
        sendPacket(client, {
          action: 'proxy',
          status: 'down',
          port: targetPort
        });
      }
    });

    outbound.on('error', (error) => {
      if (state.proxiedSockets.get(client.id)?.socket === outbound) {
        sendPacket(client, {
          action: 'proxy',
          status: 'down',
          port: targetPort,
          error: error.message
        });
      }
    });
  }

  return {
    closeProxyConnection,
    forwardToProxy,
    openProxyConnection
  };
}

module.exports = {
  createLobbyProxyService
};
