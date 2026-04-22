// helpserv.js
const { createIRCService } = require('./base-service');

/**
 * Responds to HelpServ commands with usage details or service information.
 *
 * @param {import('net').Socket} socket - Connected IRC socket.
 * @param {string | null} nickname - Nickname declared by the remote client.
 * @param {string} command - IRC command issued to HelpServ.
 * @param {string[]} args - Arguments accompanying the command.
 * @returns {Promise<void>}
 */
const handleHelpServCommand = async (socket, nickname, command, args) => {
  if (command === 'HELP') {
    socket.write(`:HelpServ NOTICE ${nickname} :Available commands: HELP, INFO\r\n`);
    return;
  }

  if (command === 'INFO') {
    socket.write(`:HelpServ NOTICE ${nickname} :This is the HelpServ for the IRC network.\r\n`);
    return;
  }

  socket.write(`:HelpServ NOTICE ${nickname} :Unknown command.\r\n`);
};

createIRCService(7003, 'HelpServ', handleHelpServCommand);
