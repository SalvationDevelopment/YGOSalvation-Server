// base-service.js
import net from 'net';
/**
 * Spins up a lightweight IRC service listener that delegates commands to the
 * supplied handler.
 *
 * @param {number} port - TCP port to listen on for IRC traffic.
 * @param {string} serviceName - Name announced to connecting clients.
 * @param {(socket: net.Socket, nickname: string | null, command: string, args: string[]) => Promise<void>} handleCommand -
 * Handler invoked for every non-registration command received from the client.
 * @returns {void}
 */
function createIRCService(port, serviceName, handleCommand) {
  const server = net.createServer(socket => {
    let nickname = null;

    socket.setEncoding('utf-8');

    socket.on('data', async data => {
      const lines = data.split('\r\n');

      for (const line of lines) {
        if (!line) continue;

        const parts = line.trim().split(' ');
        const command = parts[0].toUpperCase();

        if (command === 'NICK') {
          nickname = parts[1]?.trim();
          socket.write(`:${serviceName} 001 ${nickname} :Welcome to ${serviceName}!\r\n`);
          continue;
        }

        if (command === 'USER') {
          continue; // Skip, not used in this minimal service
        }

        // Delegate other commands to service-specific logic
        await handleCommand(socket, nickname, command, parts.slice(1));
      }
    });

    socket.on('error', err => {
      console.error(`[${serviceName}] Socket error:`, err.message);
    });
  });

  server.listen(port, () => {
    console.log(`${serviceName} running on port ${port}`);
  });
}

export default { createIRCService };
