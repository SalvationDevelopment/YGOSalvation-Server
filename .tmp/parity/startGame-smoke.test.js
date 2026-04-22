import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import startGame from "../../server/ui/services/game.service.js";

async function flush(ms = 0) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(predicate, timeoutMs = 250, intervalMs = 10) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = predicate();
    if (result) {
      return result;
    }
    await flush(intervalMs);
  }

  return predicate();
}

function installDom(html = "<!doctype html><html><body><main id=\"main\"></main></body></html>") {
  const dom = new JSDOM(html, {
    url: "http://localhost/ygopro?room=12345"
  });
  const previousGlobals = {
    window: globalThis.window,
    document: globalThis.document,
    navigator: globalThis.navigator,
    HTMLElement: globalThis.HTMLElement,
    Node: globalThis.Node,
    Event: globalThis.Event,
    MessageEvent: globalThis.MessageEvent,
    MouseEvent: globalThis.MouseEvent,
    CustomEvent: globalThis.CustomEvent,
    FormData: globalThis.FormData,
    localStorage: globalThis.localStorage,
    fetch: globalThis.fetch,
    WebSocket: globalThis.WebSocket,
    Audio: globalThis.Audio,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    cancelAnimationFrame: globalThis.cancelAnimationFrame,
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT
  };

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.MessageEvent = dom.window.MessageEvent;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.FormData = dom.window.FormData;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  globalThis.cancelAnimationFrame = (handle) => clearTimeout(handle);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  return {
    dom,
    restore() {
      dom.window.close();
      globalThis.window = previousGlobals.window;
      globalThis.document = previousGlobals.document;
      globalThis.navigator = previousGlobals.navigator;
      globalThis.HTMLElement = previousGlobals.HTMLElement;
      globalThis.Node = previousGlobals.Node;
      globalThis.Event = previousGlobals.Event;
      globalThis.MessageEvent = previousGlobals.MessageEvent;
      globalThis.MouseEvent = previousGlobals.MouseEvent;
      globalThis.CustomEvent = previousGlobals.CustomEvent;
      globalThis.FormData = previousGlobals.FormData;
      globalThis.localStorage = previousGlobals.localStorage;
      globalThis.fetch = previousGlobals.fetch;
      globalThis.WebSocket = previousGlobals.WebSocket;
      globalThis.Audio = previousGlobals.Audio;
      globalThis.requestAnimationFrame = previousGlobals.requestAnimationFrame;
      globalThis.cancelAnimationFrame = previousGlobals.cancelAnimationFrame;
      globalThis.IS_REACT_ACT_ENVIRONMENT = previousGlobals.IS_REACT_ACT_ENVIRONMENT;
    }
  };
}

test("startGame smoke keeps proxy boot and turn-choice flow working", async () => {
  const { dom, restore } = installDom();
  const fetchCalls = [];
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url, options = {}) => {
    fetchCalls.push({ url, options });

    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [{ id: 1001, name: "Scarm, Malebranche of the Burning Abyss" }]
      };
    }

    if (url === "/api/session/test-session") {
      return {
        ok: true,
        json: async () => ({
          success: true,
          user: {
            decks: [{ name: "Burning Abyss", main: [1001], extra: [], side: [] }]
          }
        })
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  globalThis.localStorage.setItem("session", "test-session");
  globalThis.localStorage.setItem("username", "alice");

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => document.querySelector("#lobby"), 500);

    assert.ok(socket);
    assert.equal(socket.url, "ws://localhost:31337");
    await waitFor(() => socket.sent.length > 0 ? socket.sent[0] : null, 250);
    assert.deepEqual(socket.sent[0], { action: "proxy_connect", port: 12345 });

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "proxy", status: "up" })
    }));
    await flush(20);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "registered" })
    }));
    await flush(20);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "turn_player", slot: 0, verification: "verify-1" })
    }));
    await flush(20);

    assert.equal(document.querySelector("#choice-runtime") !== null, true);
    assert.deepEqual(fetchCalls.map((call) => call.url), [
      "/manifest/manifest_0-language-merged.json",
      "/api/session/test-session",
      "/api/websocket-port"
    ]);
    assert.deepEqual(socket.sent.slice(0, 3), [
      { action: "proxy_connect", port: 12345 },
      {
        action: "proxy_message",
        payload: { action: "register", username: "alice", session: "test-session" }
      },
      {
        action: "proxy_message",
        payload: { action: "join" }
      }
    ]);
    assert.equal(globalThis.window.verification, "verify-1");
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});
