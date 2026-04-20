const path = require("path");
const express = require("express");
const NEXT_UI_DIR = path.resolve(__dirname, "ui");
const next = require("next");
const { createApiRouter } = require("./api/routes");
const WS_PORT = Number(process.env.WS_PORT || 5051);

function log(message) {
  console.log(`[ui] ${message}`);
}

class UIServer {
  constructor({port, lobby}) {
    this.port = port;
    this.lobby = lobby;
  }

  async start(options = {}) {
    const app = express();
    const nextApp = next({
      dev: process.env.NODE_ENV !== "production",
      dir: NEXT_UI_DIR,
    });
    await nextApp.prepare();
    const nextHandler = nextApp.getRequestHandler();

    app.get("/api/websocket-port", (_req, res) => {
      res.json({ port: WS_PORT });
    });

    app.use(express.json());

    app.use(
      createApiRouter({
        hostGameAllocator: this.lobby.hostGame,
      }),
    );

    app.use("/", (req, res) => {
      return nextHandler(req, res);
    });

    app.listen(this.port, () => {
      log(`HTTP listening on ${this.port}`);
    });
  }
}

module.exports = {
  UIServer,
};
