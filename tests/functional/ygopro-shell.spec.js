const { expect, test } = require("@playwright/test");
const net = require("node:net");
const path = require("node:path");
const { spawn } = require("node:child_process");

test.describe.configure({ timeout: 120000 });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Failed to reserve a free port.")));
        return;
      }

      const { port } = address;
      server.close(() => resolve(port));
    });
  });
}

async function waitForHealth(baseUrl, timeoutMs = 120000) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/websocket-port`, {
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        return response;
      }

      lastError = new Error(`Unexpected status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await wait(1000);
  }

  throw new Error(`YGOPro test server did not become healthy at ${baseUrl}: ${lastError?.message || "unknown error"}`);
}

test.describe("YGOPro shell", () => {
  let server;
  let httpPort;
  let tcpPort;
  let wsPort;
  let baseUrl;

  test.beforeAll(async () => {
    const repoRoot = path.resolve(__dirname, "../..");
    httpPort = await getFreePort();
    tcpPort = await getFreePort();
    wsPort = await getFreePort();
    baseUrl = `http://127.0.0.1:${httpPort}`;

    server = spawn(
      process.execPath,
      [path.join(repoRoot, "server", "index.js")],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          NODE_ENV: "production",
          HTTP_PORT: String(httpPort),
          TCP_PORT: String(tcpPort),
          WS_PORT: String(wsPort)
        },
        stdio: ["ignore", "pipe", "pipe"]
      }
    );

    let stderr = "";
    let exited = false;
    server.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    server.once("exit", () => {
      exited = true;
    });

    await waitForHealth(baseUrl);

    if (exited && stderr.trim()) {
      throw new Error(`YGOPro test server exited during startup:\n${stderr.trim()}`);
    }
  });

  test.afterAll(async () => {
    if (server && !server.killed) {
      server.kill("SIGTERM");
      await wait(1000);
    }
  });

  test("shows the missing room message when no room query is supplied", async ({ page }) => {
    await page.goto(`${baseUrl}/ygopro`);

    await expect(page.locator("#ygopro")).toBeVisible();
    await expect(page.locator("#translatefl")).toHaveText("YGOPro Lobby");
    await expect(page.locator("#lobbyflist")).toHaveText("Missing room number");
    await expect(page.locator("#ygopro")).not.toHaveAttribute("data-room");
  });

  test("boots the room shell and opens a websocket for the room query", async ({ page }) => {
    let websocketPortHits = 0;

    await page.route("**/api/websocket-port", (route) => {
      websocketPortHits += 1;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ port: 31337 })
      });
    });

    await page.addInitScript(() => {
      window.__ygoproHarness = {
        sockets: []
      };

      class FakeWebSocket extends EventTarget {
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSING = 2;
        static CLOSED = 3;

        constructor(url) {
          super();
          this.url = url;
          this.readyState = FakeWebSocket.OPEN;
          this.sent = [];
          window.__ygoproHarness.sockets.push({
            url,
            sent: this.sent
          });

          setTimeout(() => {
            this.dispatchEvent(new Event("open"));
          }, 0);
        }

        send(payload) {
          this.sent.push(JSON.parse(payload));
        }

        close() {
          this.readyState = FakeWebSocket.CLOSED;
          this.dispatchEvent(new Event("close"));
        }
      }

      window.WebSocket = FakeWebSocket;
    });

    await page.goto(`${baseUrl}/ygopro?room=12345`);

    await expect(page.locator("#ygopro")).toHaveAttribute("data-room", "12345");
    await page.waitForFunction(() => Boolean(window.__ygoproHarness?.sockets?.length));

    expect(websocketPortHits).toBeGreaterThan(0);

    const state = await page.evaluate(() => window.__ygoproHarness);
    expect(state.sockets[0].url).toBe("ws://127.0.0.1:31337");
    expect(Array.isArray(state.sockets[0].sent)).toBe(true);
  });

  test("drives a deterministic lobby and turn-order flow through mocked websocket packets", async ({ page }) => {
    await page.route("**/api/websocket-port", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ port: 31337 })
      });
    });

    await page.route("**/manifest/manifest_0-language-merged.json", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([])
      });
    });

    await page.route("**/api/session/test-session", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: {
            username: "alice",
            decks: [
              {
                name: "Burning Abyss",
                main: [1001, 1002],
                extra: [2001],
                side: [3001]
              }
            ]
          }
        })
      });
    });

    await context.addInitScript(() => {
      localStorage.session = "test-session";
      localStorage.username = "alice";
      window.__ygoproHarness = {
        sockets: []
      };

      class FakeWebSocket extends EventTarget {
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSING = 2;
        static CLOSED = 3;

        constructor(url) {
          super();
          this.url = url;
          this.readyState = FakeWebSocket.OPEN;
          this.sent = [];
          window.__ygoproHarness.sockets.push(this);

          setTimeout(() => {
            this.dispatchEvent(new Event("open"));
          }, 0);
        }

        send(payload) {
          this.sent.push(JSON.parse(payload));
        }

        emit(payload) {
          this.dispatchEvent(new MessageEvent("message", {
            data: JSON.stringify(payload)
          }));
        }

        close() {
          this.readyState = FakeWebSocket.CLOSED;
          this.dispatchEvent(new Event("close"));
        }
      }

      window.WebSocket = FakeWebSocket;
    });

    await page.goto(`${baseUrl}/ygopro?room=12345`);
    await page.waitForFunction(() => window.__ygoproHarness?.sockets?.length === 1);

    await page.evaluate(() => {
      const socket = window.__ygoproHarness.sockets[0];
      socket.emit({ action: "proxy", status: "up" });
      socket.emit({ action: "registered" });
      socket.emit({ action: "slot", slot: 0 });
      socket.emit({
        action: "lobby",
        game: {
          automatic: "Automatic",
          ranked: "Ranked",
          banlist: "April 2026",
          allowedCardsLabel: "OCG / TCG",
          mode: "Match",
          startingLP: 8000,
          decks: [
            {
              name: "Burning Abyss",
              main: [1001, 1002],
              extra: [2001],
              side: [3001]
            }
          ],
          player: [
            { username: "alice", ready: false, points: 25, elo: 1310 },
            { username: "bob", ready: false, points: 10, elo: 1200 }
          ]
        }
      });
    });

    await expect(page.locator("#lobbyflist")).toHaveText("April 2026");
    await expect(page.locator("#lobbylp")).toHaveText("8000");
    await page.waitForFunction(() => {
      const select = document.querySelector(".currentdeck");
      return Boolean(select && select.options.length === 1 && select.value === "0");
    });
    await expect(page.locator(".currentdeck")).toHaveValue("0");
    await expect(page.locator(".currentdeck option")).toHaveText("Burning Abyss");
    await page.locator("#slot1 .lockindicator").click();

    await page.locator("#lobbygotoduel").click();

    await page.evaluate(() => {
      const socket = window.__ygoproHarness.sockets[0];
      socket.emit({ action: "turn_player", slot: 0, verification: "verify-1" });
    });

    await expect(page.locator("#gofirst").first()).toBeVisible();
    await page.locator("#gofirst").first().click();

    const sentPackets = await page.evaluate(() =>
      window.__ygoproHarness.sockets[0].sent.map((packet) => {
        if (packet.action === "proxy_message") {
          return packet.payload;
        }
        return packet;
      })
    );

    expect(sentPackets).toEqual(
      expect.arrayContaining([
        { room: 12345 },
        { action: "register", username: "alice", session: "test-session" },
        { action: "join" },
        expect.objectContaining({
          action: "lock",
          deck: expect.any(Object)
        }),
        { action: "determine" },
        { action: "start", turn_player: 0, verification: "verify-1" }
      ])
    );

    const lockPacket = sentPackets.find((packet) => packet?.action === "lock");
    expect(lockPacket.deck.main).toHaveLength(2);
    expect(lockPacket.deck.extra).toHaveLength(1);
    expect(lockPacket.deck.side).toHaveLength(1);
  });

  test("starts a puzzle room from /puzzles and advances straight to Main Phase 1", async ({ page }) => {
    const context = page.context();

    await context.route("**/api/websocket-port", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ port: 31337 })
      });
    });

    await context.route("**/manifest/manifest_0-language-merged.json", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([])
      });
    });

    await context.route("**/api/session/test-session", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: {
            username: "alice",
            decks: []
          }
        })
      });
    });

    await page.addInitScript(() => {
      localStorage.session = "test-session";
      localStorage.username = "alice";
      window.__ygoproHarness = {
        sockets: []
      };

      class FakeWebSocket extends EventTarget {
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSING = 2;
        static CLOSED = 3;

        constructor(url) {
          super();
          this.url = url;
          this.readyState = FakeWebSocket.OPEN;
          this.sent = [];
          window.__ygoproHarness.sockets.push(this);

          setTimeout(() => {
            this.dispatchEvent(new Event("open"));
          }, 0);
        }

        send(payload) {
          this.sent.push(JSON.parse(payload));
        }

        emit(payload) {
          this.dispatchEvent(new MessageEvent("message", {
            data: JSON.stringify(payload)
          }));
        }

        close() {
          this.readyState = FakeWebSocket.CLOSED;
          this.dispatchEvent(new Event("close"));
        }
      }

      window.WebSocket = FakeWebSocket;
    });

    await page.goto(`${baseUrl}/puzzles`);
    await page.waitForFunction(() => window.__ygoproHarness?.sockets?.length === 1);
    await expect(page.locator("#startpuzzle")).toBeVisible();

    const popupPromise = page.waitForEvent("popup");
    await page.locator("#startpuzzle").click();

    await page.waitForFunction(() =>
      window.__ygoproHarness.sockets[0]?.sent?.some(
        (packet) => packet?.action === "host" && packet?.hostConfig?.puzzleId === "opening-drill",
      )
    );

    await page.evaluate(() => {
      window.__ygoproHarness.sockets[0].emit({
        clientEvent: "lobby",
        roompass: "opening-drill-room",
        port: 12345
      });
    });

    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
    await popup.waitForFunction(() => window.__ygoproHarness?.sockets?.length === 1);

    await popup.evaluate(() => {
      const socket = window.__ygoproHarness.sockets[0];
      socket.emit({ action: "proxy", status: "up" });
      socket.emit({ action: "registered" });
      socket.emit({ action: "slot", slot: 0 });
      socket.emit({
        action: "lobby",
        game: {
          automatic: "Automatic",
          ranked: "Puzzle",
          banlist: "Puzzle",
          allowedCardsLabel: "OCG / TCG",
          mode: "Single",
          startingLP: 4000,
          aiName: "Training Bot",
          opponentName: "Training Bot",
          decks: [
            {
              name: "Opening Drill Deck",
              main: [46986414, 89631139],
              extra: [],
              side: []
            }
          ],
          player: [
            { username: "alice", ready: true, points: 0, elo: 1200 },
            { username: "Training Bot", ready: true, points: 0, elo: 1200 }
          ],
          started: true
        }
      });
      socket.emit({ action: "start" });
      socket.emit({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_NEW_PHASE",
            gui_phase: "MAIN1",
            duration: 2400
          }
        }
      });
    });

    await expect(popup.locator("#duel")).toBeVisible();
    await expect(popup.getByText("Main Phase 1")).toBeVisible();

    const popupPackets = await popup.evaluate(() =>
      window.__ygoproHarness.sockets[0].sent.map((packet) => {
        if (packet.action === "proxy_message") {
          return packet.payload;
        }
        return packet;
      })
    );

    expect(popupPackets).toEqual(
      expect.arrayContaining([
        { action: "proxy_connect", port: 12345 },
        { room: 12345 },
        { action: "register", username: "alice", session: "test-session" },
        { action: "join" }
      ])
    );
    expect(popupPackets.find((packet) => packet?.action === "lock")).toBeUndefined();
    expect(popupPackets.find((packet) => packet?.action === "determine")).toBeUndefined();
    expect(popupPackets.find((packet) => packet?.action === "start")).toBeUndefined();
  });
});
// Run with: npm run test:functional
