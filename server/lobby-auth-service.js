'use strict';

/**
 * Creates lobby auth service used by the lobby auth service module.
 * @param {Object} options The options object supplies the structured input used by the lobby auth service module.
 * @param {Function} options.broadcast The `broadcast` property supplies structured input used by the lobby auth service module.
 * @param {Function} options.joinRoom The `joinRoom` property supplies structured input used by the lobby auth service module.
 * @param {Function} options.log The `log` property supplies structured input used by the lobby auth service module.
 * @param {Function} options.onAuthenticatedClient The `onAuthenticatedClient` property supplies structured input used by the lobby auth service module.
 * @param {Function} options.roomStatePacket The `roomStatePacket` property supplies structured input used by the lobby auth service module.
 * @param {Function} options.sendPacket The `sendPacket` property supplies structured input used by the lobby auth service module.
 * @param {Object} options.state The `state` property supplies structured input used by the lobby auth service module.
 * @param {Function} options.validateLogin The `validateLogin` property supplies structured input used by the lobby auth service module.
 * @param {Function} options.validateUserSession The `validateUserSession` property supplies structured input used by the lobby auth service module.
 * @returns {{registrationCall: Function, restoreSession: Function, validateSession: Function}} Returns the value produced by the lobby auth service module.
 */
function createLobbyAuthService({
  state,
  broadcast,
  joinRoom,
  log = () => {},
  onAuthenticatedClient = () => {},
  roomStatePacket,
  sendPacket,
  validateLogin,
  validateUserSession
}) {
  /**
   * Executes the registration call helper used by the lobby auth service module.
   * @param {Object} data The data value provides an input used by the lobby auth service module.
   * @param {Object} client The client object supplies the structured input used by the lobby auth service module.
   * @returns {void} Does not return a value.
   */
  function registrationCall(data, client) {
    validateLogin(true, data, (error, valid, responseData) => {
      if (error) {
        sendPacket(client, {
          clientEvent: 'servererror',
          message: state.currentGlobalMessage
        });
        sendPacket(client, {
          clientEvent: 'login',
          info: {
            message: error.message
          },
          error
        });
        return;
      }

      const info = responseData.user || {};
      info.session = responseData.jwt;
      info.decks = responseData.decks;

      if (!valid) {
        sendPacket(client, {
          clientEvent: 'servererror',
          message: state.currentGlobalMessage
        });
        sendPacket(client, {
          clientEvent: 'login',
          info
        });
        return;
      }

      client.username = info.username;
      client.session = info.session;
      client.admin = info.role?.name === 'Administrator';
      state.adminlist[info.username] = Boolean(client.admin);

      sendPacket(client, {
        clientEvent: 'global',
        message: state.currentGlobalMessage,
        admin: client.admin
      });
      sendPacket(client, {
        clientEvent: 'ackresult',
        ackresult: state.acklevel,
        userlist: state.userlist
      });

      client.speak = true;
      sendPacket(client, {
        clientEvent: 'login',
        info: {
          username: info.username,
          decks: info.decks,
          friends: info.friends,
          session: info.session,
          sessionExpiration: info.sessionExpiration,
          ranking: info.ranking,
          admin: info.admin,
          rewards: info.rewards,
          settings: info.settings,
          bans: info.bans
        },
        chatbox: state.chatbox
      });

      onAuthenticatedClient(client);
      joinRoom(client, client.username);
      broadcast(roomStatePacket());
      log(`${client.username} logged in`);
    });
  }

  /**
   * Restores session used by the lobby auth service module.
   * @param {Object} data The data object supplies the structured input used by the lobby auth service module.
   * @param {Object} client The client object supplies the structured input used by the lobby auth service module.
   * @returns {void} Does not return a value.
   */
  function restoreSession(data, client) {
    validateUserSession(
      {
        session: data.session,
        username: data.username
      },
      (error, valid, info) => {
        if (error || !valid) {
          return;
        }

        client.username = info.username;
        client.session = data.session;
        client.speak = true;
        joinRoom(client, client.username);

        sendPacket(client, {
          clientEvent: 'global',
          message: state.currentGlobalMessage,
          admin: state.adminlist[data.username]
        });
        sendPacket(client, {
          clientEvent: 'ackresult',
          ackresult: state.acklevel,
          userlist: state.userlist
        });
        sendPacket(client, {
          clientEvent: 'login',
          info: {
            username: info.username,
            decks: info.decks,
            friends: info.friends,
            session: data.session,
            admin: info.admin,
            rewards: info.rewards,
            settings: info.settings,
            bans: info.bans
          },
          chatbox: state.chatbox
        });

        onAuthenticatedClient(client);
      }
    );
  }

  return {
    registrationCall,
    restoreSession,
    validateSession: restoreSession
  };
}

module.exports = {
  createLobbyAuthService
};
