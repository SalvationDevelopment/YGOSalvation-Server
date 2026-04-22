"use strict";

require("./lib/load-shared-env");

const { TcpServer, WebSocketServer } = require("./transport");
const { Lobby } = require("./lobby");
const { ConnectionSuite } = require("./connection-suite");
const { createIrcBridge, startIrcServer } = require("./irc/irc");
const { UIServer } = require("./ui-server");

const HTTP_PORT = Number(process.env.HTTP_PORT || 80);
const TCP_PORT = Number(process.env.TCP_PORT || 5050);
const WS_PORT = Number(process.env.WS_PORT || 5051);

/**
 * Creates ui server used by the server module.
 * @param {Object} options The options object supplies structured input used by the server module.
 * @param {?Function} options.hostGameAllocator The `hostGameAllocator` property supplies structured input used by the server module.
 * @returns {Promise<void>} Resolves when the server operation completes.
 */
class Server {
  constructor() {
    this.ircServer = {
      ircBridge: createIrcBridge(),
      server: null,
      start: async () => {
        if (this.ircServer.server) {
          return this.ircServer.server;
        }

        this.ircServer.server = await startIrcServer();
        return this.ircServer.server;
      },
    };

    this.lobby = new Lobby(this.ircServer);
    const lobbyDependencies = {
      lobby: this.lobby
    };

    this.connectionSuite = new ConnectionSuite({
      ...lobbyDependencies,
    });
    const connectionDependencies = {
      ...this.connectionSuite,
    };

    this.websocketServer = new WebSocketServer({
      ...connectionDependencies,
      port: WS_PORT,
    });

    this.tcpServer = new TcpServer({
      ...connectionDependencies,
      port: TCP_PORT,
    });

     this.uiServer = new UIServer({
      ...connectionDependencies,
      ...lobbyDependencies,
      port: HTTP_PORT,
    });
  }

  async start() {
    await this.lobby.start();
    await this.uiServer.start();
  }
}

/**
 * Main entry point for the server module, aka main()
 */
new Server()
.start()
.catch((error) => {
  console.error(error);
  process.exit(1);
});
