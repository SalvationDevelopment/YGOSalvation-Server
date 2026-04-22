'use strict';

/**
 * Creates lobby state used by the lobby state module.
 * @returns {Object} Returns the value produced by the lobby state module.
 */
class LobbyState {
  constructor() {
    return {
      clients: new Map(),
      socketRooms: new Map(),
      roomSockets: new Map(),
      adminlist: {},
      gamelist: {},
      gamePorts: {},
      proxiedSockets: new Map(),
      chatbox: [],
      userlist: [],
      acklevel: 0,
      currentGlobalMessage: '',
      ackTimer: null,
      nextCoreDebugPort: process.env.CORE_DEBUG_PORT_BASE
        ? Number(process.env.CORE_DEBUG_PORT_BASE)
        : 9230
    };
  }
}

module.exports = {
  LobbyState
};
