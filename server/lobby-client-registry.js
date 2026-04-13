'use strict';

/**
 * Creates lobby client registry used by the lobby client registry module.
 * @param {Object} options The options object supplies the structured input used by the lobby client registry module.
 * @param {Function} options.sendPacket The `sendPacket` property supplies structured input used by the lobby client registry module.
 * @param {Object} options.state The `state` property supplies structured input used by the lobby client registry module.
 * @returns {{addClient: Function, broadcast: Function, joinRoom: Function, leaveAllRooms: Function, removeClient: Function, roomWrite: Function}} Returns the value produced by the lobby client registry module.
 */
function createLobbyClientRegistry({ state, sendPacket }) {
  /**
   * Executes the broadcast helper used by the lobby client registry module.
   * @param {Object} packet The packet value provides an input used by the lobby client registry module.
   * @returns {void} Does not return a value.
   */
  function broadcast(packet) {
    state.clients.forEach((client) => {
      sendPacket(client, packet);
    });
  }

  /**
   * Executes the room write helper used by the lobby client registry module.
   * @param {string} roomName The roomName value provides an input used by the lobby client registry module.
   * @param {Object} packet The packet value provides an input used by the lobby client registry module.
   * @returns {void} Does not return a value.
   */
  function roomWrite(roomName, packet) {
    const ids = state.roomSockets.get(roomName);
    if (!ids || !ids.size) {
      return;
    }

    ids.forEach((id) => {
      const client = state.clients.get(id);
      if (client) {
        sendPacket(client, packet);
      }
    });
  }

  /**
   * Joins room used by the lobby client registry module.
   * @param {Object} client The client object supplies the structured input used by the lobby client registry module, including the `id` property.
   * @param {string} client.id The `id` property supplies structured input used by the lobby client registry module.
   * @param {string} roomName The roomName value provides an input used by the lobby client registry module.
   * @returns {void} Does not return a value.
   */
  function joinRoom(client, roomName) {
    if (!roomName) {
      return;
    }

    if (!state.socketRooms.has(client.id)) {
      state.socketRooms.set(client.id, new Set());
    }
    state.socketRooms.get(client.id).add(roomName);

    if (!state.roomSockets.has(roomName)) {
      state.roomSockets.set(roomName, new Set());
    }
    state.roomSockets.get(roomName).add(client.id);
  }

  /**
   * Executes the leave all rooms helper used by the lobby client registry module.
   * @param {Object} client The client object supplies the structured input used by the lobby client registry module, including the `id` property.
   * @param {string} client.id The `id` property supplies structured input used by the lobby client registry module.
   * @returns {void} Does not return a value.
   */
  function leaveAllRooms(client) {
    const rooms = state.socketRooms.get(client.id);
    if (!rooms) {
      return;
    }

    rooms.forEach((roomName) => {
      const ids = state.roomSockets.get(roomName);
      if (!ids) {
        return;
      }

      ids.delete(client.id);
      if (!ids.size) {
        state.roomSockets.delete(roomName);
      }
    });

    state.socketRooms.delete(client.id);
  }

  return {
    /**
     * Adds client used by the lobby client registry module.
     * @param {Object} client The client value provides an input used by the lobby client registry module.
     * @returns {void} Does not return a value.
     */
    addClient(client) {
      state.clients.set(client.id, client);
    },
    broadcast,
    joinRoom,
    leaveAllRooms,
    /**
     * Removes client used by the lobby client registry module.
     * @param {Object} client The client value provides an input used by the lobby client registry module.
     * @returns {void} Does not return a value.
     */
    removeClient(client) {
      leaveAllRooms(client);
      state.clients.delete(client.id);
    },
    roomWrite
  };
}

module.exports = {
  createLobbyClientRegistry
};
