import assert from "node:assert/strict";
import test from "node:test";
import DecksManagementPage from "../../../server/cms/components/management/decks-management-page";
import { click, render, setupDom, textContent, waitFor } from "./dom-test-utils";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("DecksManagementPage loads decks and supports delete flow", async () => {
  const dom = setupDom();
  const originalFetch = globalThis.fetch;
  const requests = [];
  const decks = [
    { id: "1", name: "Burning Abyss", owner: "Alice", main: [1, 2], extra: [3], side: [4] }
  ];

  globalThis.fetch = async (path, options = {}) => {
    const method = options.method || "GET";
    requests.push({ path, method, body: options.body || null });

    if (path === "/api/decks" && method === "GET") {
      return jsonResponse({ success: true, decks: decks.map((deck) => ({ ...deck })) });
    }

    if (path === "/api/decks" && method === "POST") {
      const payload = JSON.parse(options.body);
      decks.push({ id: "2", ...payload });
      return jsonResponse({ success: true });
    }

    if (String(path).startsWith("/api/decks/") && method === "PATCH") {
      const id = String(path).split("/").pop();
      const payload = JSON.parse(options.body);
      const index = decks.findIndex((deck) => deck.id === id);
      decks[index] = { ...decks[index], ...payload };
      return jsonResponse({ success: true });
    }

    if (String(path).startsWith("/api/decks/") && method === "DELETE") {
      const id = String(path).split("/").pop();
      const index = decks.findIndex((deck) => deck.id === id);
      decks.splice(index, 1);
      return jsonResponse({ success: true });
    }

    throw new Error(`Unexpected request: ${method} ${path}`);
  };

  try {
    const container = await render(<DecksManagementPage />);

    await waitFor(() => {
      assert.match(textContent(container), /All Decks \(1\)/);
      assert.match(textContent(container), /Burning Abyss/);
    });

    const deleteButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Delete" && button.closest("tr")?.textContent.includes("Burning Abyss"));
    assert.ok(deleteButton);
    await click(deleteButton);

    await waitFor(() => {
      assert.match(textContent(container), /All Decks \(0\)/);
      assert.doesNotMatch(textContent(container), /Burning Abyss/);
    });

    assert.ok(requests.some((request) => request.path === "/api/decks" && request.method === "GET"));
    assert.ok(requests.some((request) => request.path === "/api/decks/1" && request.method === "DELETE"));
  } finally {
    globalThis.fetch = originalFetch;
    await dom.cleanup();
  }
});
// Run with: npm run test:component
