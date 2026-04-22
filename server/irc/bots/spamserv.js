// spamserv.js
const { createIRCService } = require('./base-service');

/**
 * Offers basic spam detection utilities by scanning provided messages.
 *
 * @param {import('net').Socket} socket - Connected IRC socket.
 * @param {string | null} nickname - Nickname declared by the remote client.
 * @param {string} command - IRC command issued to SpamServ.
 * @param {string[]} args - Arguments accompanying the command.
 * @returns {Promise<void>}
 */
const handleSpamServCommand = async (socket, nickname, command, args) => {
  if (command === 'SCAN') {
    const message = args.join(' ');
    if (message.includes('buy now') || message.includes('click here')) {
      socket.write(`:SpamServ NOTICE ${nickname} :Spam detected: ${message}\r\n`);
      return;
    }

    socket.write(`:SpamServ NOTICE ${nickname} :No spam detected.\r\n`);
    return;
  }

  socket.write(`:SpamServ NOTICE ${nickname} :Unknown command.\r\n`);
};

createIRCService(7004, 'SpamServ', handleSpamServCommand);
