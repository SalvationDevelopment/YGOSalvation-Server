// memoserv.js
const { createIRCService } = require('./base-service');

/**
 * Processes MemoServ commands for sending and reading user memos.
 *
 * @param {import('net').Socket} socket - Connected IRC socket.
 * @param {string | null} nickname - Nickname declared by the remote client.
 * @param {string} command - IRC command issued to MemoServ.
 * @param {string[]} args - Arguments accompanying the command.
 * @returns {Promise<void>}
 */
const handleMemoServCommand = async (socket, nickname, command, args) => {
  if (command === 'SEND') {
    const target = args[0];
    const message = args.slice(1).join(' ');
    socket.write(`:MemoServ NOTICE ${nickname} :Memo sent to ${target}: ${message}\r\n`);
    return;
  }

  if (command === 'READ') {
    socket.write(`:MemoServ NOTICE ${nickname} :You have no new memos.\r\n`);
    return;
  }

  socket.write(`:MemoServ NOTICE ${nickname} :Unknown command.\r\n`);
};

createIRCService(7002, 'MemoServ', handleMemoServCommand);
