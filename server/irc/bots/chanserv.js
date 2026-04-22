// chanserv.js
const { createIRCService } = require('./base-service');

/**
 * Handles incoming ChanServ requests, allowing channel registration and
 * information lookups.
 *
 * @param {import('net').Socket} socket - Connected IRC socket.
 * @param {string | null} nickname - Nickname declared by the remote client.
 * @param {string} command - IRC command issued to ChanServ.
 * @param {string[]} args - Arguments accompanying the command.
 * @returns {Promise<void>}
 */
const handleChanServCommand = async (socket, nickname, command, args) => {
  if (command === 'REGISTER') {
    const channel = args[0];
    socket.write(`:ChanServ NOTICE ${nickname} :Channel ${channel} registered successfully.\r\n`);
    return;
  }

  if (command === 'INFO') {
    const channel = args[0];
    socket.write(`:ChanServ NOTICE ${nickname} :Info for channel ${channel}: Example channel.\r\n`);
    return;
  }

  socket.write(`:ChanServ NOTICE ${nickname} :Unknown command.\r\n`);
};

createIRCService(7001, 'ChanServ', handleChanServCommand);
