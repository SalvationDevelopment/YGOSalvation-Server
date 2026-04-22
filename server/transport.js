"use strict";

const net = require("net");
const { WebSocketServer: NativeWebSocketServer } = require("ws");
const { Id, safeJsonParse } = require("./utils");

class ClientConnection {
  /**
   * Initializes a new Transport instance and prepares its internal state.
   * @param {Object} options The options object supplies the structured input used by the transport module, including the `closeRaw`, `id`, `meta`, `onClose`, `sendRaw`, and `transport` properties.
   * @param {Function} options.closeRaw The `closeRaw` property supplies structured input used by the transport module.
   * @param {string} options.id The `id` property supplies structured input used by the transport module.
   * @param {{address?: {ip?: string, port?: number}}} options.meta The `meta` property supplies structured input used by the transport module.
   * @param {Function} options.onClose The `onClose` property supplies structured input used by the transport module.
   * @param {Function} options.sendRaw The `sendRaw` property supplies structured input used by the transport module.
   * @param {string} options.transport The `transport` property supplies structured input used by the transport module.
   * @returns {void} Does not return a value.
   */
  constructor({ id, transport, sendRaw, closeRaw, onClose, meta }) {
    this.id = id;
    this.transport = transport;
    this._sendRaw = sendRaw;
    this._closeRaw = closeRaw;
    this._onClose = onClose;
    this.roomId = null;
    this.role = null;
    this.meta = meta || {};
    this.address = this.meta.address || {};
  }

  /**
   * Executes the send helper used by the transport module.
   * @param {string} type The type value provides an input used by the transport module.
   * @param {Object} payload The payload value provides an input used by the transport module.
   * @returns {void} Does not return a value.
   */
  send(type, payload = {}) {
    this._sendRaw(JSON.stringify({ type, payload }));
  }

  /**
   * Sends packet used by the transport module.
   * @param {Object} packet The packet value provides an input used by the transport module.
   * @returns {void} Does not return a value.
   */
  sendPacket(packet) {
    this._sendRaw(JSON.stringify(packet));
  }

  /**
   * Executes the close helper used by the transport module.
   * @returns {void} Does not return a value.
   */
  close() {
    this._closeRaw();
  }

  /**
   * Handles close used by the transport module.
   * @returns {void} Does not return a value.
   */
  handleClose() {
    this._onClose(this);
  }
}

/**
 * Creates tcp server used by the transport module.
 * @param {Object} options The options object supplies the structured input used by the transport module, including the `log`, `onClose`, `onConnection`, `onMessage`, and `port` properties.
 * @param {Function} options.log The `log` property supplies structured input used by the transport module.
 * @param {Function} options.onClose The `onClose` property supplies structured input used by the transport module.
 * @param {Function} options.onConnection The `onConnection` property supplies structured input used by the transport module.
 * @param {Function} options.onMessage The `onMessage` property supplies structured input used by the transport module.
 * @param {number} options.port The `port` property supplies structured input used by the transport module.
 * @returns {net.Server} Returns the value produced by the transport module.
 */
class TcpServer {
  constructor({ port, onConnection, onMessage, onClose, log }) {
    const server = net.createServer((socket) => {
      const client = new ClientConnection({
        id: String(new Id("tcp")),
        transport: "tcp",
        sendRaw: (text) => socket.write(`${text}\n`),
        closeRaw: () => socket.destroy(),
        onClose,
        meta: {
          address: {
            ip: socket.remoteAddress || "",
            port: socket.remotePort || 0,
          },
        },
      });

      onConnection(client);

      let buffer = "";
      socket.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
        let lineBreak = buffer.indexOf("\n");
        while (lineBreak >= 0) {
          const line = buffer.slice(0, lineBreak).trim();
          buffer = buffer.slice(lineBreak + 1);
          if (line.length > 0) {
            const parsed = safeJsonParse(line);
            if (!parsed.ok) {
              client.send("error", { message: "Invalid JSON packet." });
            }
            if (parsed.ok) {
              onMessage(client, parsed.value);
            }
          }
          lineBreak = buffer.indexOf("\n");
        }
      });

      socket.on("close", () => client.handleClose());
      socket.on("error", (error) => {
        log(`[tcp:${client.id}] ${error.message}`);
      });
    });

    server.listen(port, () => log(`TCP listening on ${port}`));
    return server;
  }
}

/**
 * Creates web socket server used by the transport module.
 * @param {Object} options The options object supplies the structured input used by the transport module, including the `log`, `onClose`, `onConnection`, `onMessage`, and `port` properties.
 * @param {Function} options.log The `log` property supplies structured input used by the transport module.
 * @param {Function} options.onClose The `onClose` property supplies structured input used by the transport module.
 * @param {Function} options.onConnection The `onConnection` property supplies structured input used by the transport module.
 * @param {Function} options.onMessage The `onMessage` property supplies structured input used by the transport module.
 * @param {number} options.port The `port` property supplies structured input used by the transport module.
 * @returns {WebSocketServer} Returns the value produced by the transport module.
 */
class WebSocketServer {
  constructor({
    port,
    onConnection,
    onMessage,
    onClose,
    log,
  }) {
    const wss = new NativeWebSocketServer({ port });
    wss.on("connection", (socket, req) => {
      const client = new ClientConnection({
        id: String(new Id("ws")),
        transport: "ws",
        sendRaw: (text) => socket.send(text),
        closeRaw: () => socket.close(),
        onClose,
        meta: {
          address: {
            ip: req?.socket?.remoteAddress || "",
            port: req?.socket?.remotePort || 0,
          },
        },
      });

      onConnection(client);

      socket.on("message", (data) => {
        const message = data.toString("utf8");
        const parsed = safeJsonParse(message);
        if (!parsed.ok) {
          client.send("error", { message: "Invalid JSON packet." });
          return;
        }
        onMessage(client, parsed.value);
      });

      socket.on("close", () => client.handleClose());
      socket.on("error", (error) => {
        log(`[ws:${client.id}] ${error.message}`);
      });
    });

    log(`WebSocket listening on ${port}`);
    return wss;
  }
}

module.exports = {
  ClientConnection,
  WebSocketServer,
  TcpServer,
};
