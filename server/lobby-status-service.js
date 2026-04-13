'use strict';

/**
 * Creates lobby status service used by the lobby status service module.
 * @param {Object} options The options object supplies the structured input used by the lobby status service module.
 * @param {Function} options.addClient The `addClient` property supplies structured input used by the lobby status service module.
 * @param {Function} options.broadcast The `broadcast` property supplies structured input used by the lobby status service module.
 * @param {Function} options.sendPacket The `sendPacket` property supplies structured input used by the lobby status service module.
 * @param {Function} options.setIntervalFn The `setIntervalFn` property supplies structured input used by the lobby status service module.
 * @param {Object} options.state The `state` property supplies structured input used by the lobby status service module.
 * @returns {{gamelistRequested: Function, getSnapshot: Function, handleConnection: Function, roomStatePacket: Function, start: Function}} Returns the value produced by the lobby status service module.
 */
function createLobbyStatusService({
  state,
  addClient,
  broadcast,
  sendPacket,
  setIntervalFn = setInterval
}) {
  /**
   * Executes the room state packet helper used by the lobby status service module.
   * @returns {Object} Returns the value produced by the lobby status service module.
   */
  function roomStatePacket() {
    return {
      clientEvent: 'gamelist',
      gamelist: state.gamelist,
      ackresult: state.acklevel,
      userlist: state.userlist
    };
  }

  /**
   * Executes the gamelist requested helper used by the lobby status service module.
   * @param {Object} client The client value provides an input used by the lobby status service module.
   * @returns {void} Does not return a value.
   */
  function gamelistRequested(client) {
    sendPacket(client, roomStatePacket());
  }

  /**
   * Handles connection used by the lobby status service module.
   * @param {Object} client The client object supplies the structured input used by the lobby status service module.
   * @returns {void} Does not return a value.
   */
  function handleConnection(client) {
    addClient(client);
    gamelistRequested(client);
  }

  /**
   * Executes the start helper used by the lobby status service module.
   * @returns {void} Does not return a value.
   */
  function start() {
    if (state.ackTimer) {
      return;
    }

    state.ackTimer = setIntervalFn(() => {
      broadcast({
        clientEvent: 'ackresult',
        ackresult: state.acklevel,
        userlist: state.userlist
      });
      broadcast(roomStatePacket());
      state.acklevel = 0;
      state.userlist = [];
      broadcast({
        clientEvent: 'ack',
        serverEvent: 'ack'
      });
    }, 15000);
  }

  return {
    gamelistRequested,
    /**
     * Gets snapshot used by the lobby status service module.
     * @returns {Object} Returns the value produced by the lobby status service module.
     */
    getSnapshot() {
      return {
        gamelist: { ...state.gamelist },
        ackresult: state.acklevel,
        userlist: [...state.userlist]
      };
    },
    handleConnection,
    roomStatePacket,
    start
  };
}

module.exports = {
  createLobbyStatusService
};
