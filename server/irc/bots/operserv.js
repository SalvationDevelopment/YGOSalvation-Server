// operserv.js
const { createIRCService } = require('./base-service');

/**
 * Emulates basic operator commands for administrative tasks.
 *
 * @param {import('net').Socket} socket - Connected IRC socket.
 * @param {string | null} nickname - Nickname declared by the remote client.
 * @param {string} command - IRC command issued to OperServ.
 * @param {string[]} args - Arguments accompanying the command.
 * @returns {Promise<void>}
 */
const handleOperServCommand = async (socket, nickname, command, args) => {
  if (command === 'KILL') {
    const target = args[0];
    socket.write(`:OperServ NOTICE ${nickname} :User ${target} has been killed (simulation).\r\n`);
    return;
  }

  if (command === 'RESTART') {
    socket.write(`:OperServ NOTICE ${nickname} :Server restart requested (simulation).\r\n`);
    return;
  }

  socket.write(`:OperServ NOTICE ${nickname} :Unknown command.\r\n`);
};

createIRCService(7005, 'OperServ', handleOperServCommand);
