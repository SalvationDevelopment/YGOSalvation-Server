"use strict";

require("./lib/load-shared-env");



const { TCPServer, WebSocketServer } = require("./transport");
const { Lobby } = require("./lobby");
const { ConnectionSuite } = require("./connection-suite");
const { IRCServer } = require("./irc/irc");
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
   
    this.ircServer = new IRCServer();

    this.lobby = new Lobby(this.ircServer);

    this.connectionSuite = new ConnectionSuite({
      lobby: this.lobby,
    });

    this.websocketServer = new WebSocketServer({
      port: WS_PORT,
      ...this.connectionSuite,
    });

    this.tcpServer = new TCPServer({
      port: TCP_PORT,
      ...this.connectionSuite,
    });

     this.uiServer = new UIServer({
      lobby: this.lobby,
      port: HTTP_PORT,
      ...this.connectionSuite,
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
