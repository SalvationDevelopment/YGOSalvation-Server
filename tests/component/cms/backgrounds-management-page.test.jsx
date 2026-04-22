import assert from "node:assert/strict";
import test from "node:test";
import BackgroundsManagementPage from "../../../server/cms/components/management/backgrounds-management-page";
import { click, render, setupDom, textContent, waitFor } from "./dom-test-utils";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("BackgroundsManagementPage loads entries and deletes an item through the CMS flow", async () => {
  const dom = setupDom();
  const originalFetch = globalThis.fetch;
  const requests = [];
  const items = [
    { id: "1", name: "Sky Temple", imageUrl: "https://img.example/sky.jpg" }
  ];

  globalThis.fetch = async (path, options = {}) => {
    const method = options.method || "GET";
    requests.push({ path, method, body: options.body || null });

    if (path === "/api/backgrounds" && method === "GET") {
      return jsonResponse({ success: true, backgrounds: items.map((item) => ({ ...item })) });
    }

    if (String(path).startsWith("/api/backgrounds/") && method === "DELETE") {
      const id = String(path).split("/").pop();
      const index = items.findIndex((item) => item.id === id);
      items.splice(index, 1);
      return jsonResponse({ success: true });
    }

    throw new Error(`Unexpected request: ${method} ${path}`);
  };

  try {
    const container = await render(<BackgroundsManagementPage />);

    await waitFor(() => {
      assert.match(textContent(container), /All Backgrounds \(1\)/);
      assert.match(textContent(container), /Sky Temple/);
    });

    const deleteButtons = Array.from(container.querySelectorAll("button")).filter((button) => button.textContent === "Delete");
    const deleteTarget = deleteButtons.find((button) => button.closest("li")?.textContent.includes("Sky Temple"));
    assert.ok(deleteTarget);
    await click(deleteTarget);

    await waitFor(() => {
      assert.match(textContent(container), /All Backgrounds \(0\)/);
      assert.doesNotMatch(textContent(container), /Sky Temple/);
    });

    assert.ok(requests.some((request) => request.path === "/api/backgrounds" && request.method === "GET"));
    assert.ok(requests.some((request) => request.path === "/api/backgrounds/1" && request.method === "DELETE"));
  } finally {
    globalThis.fetch = originalFetch;
    await dom.cleanup();
  }
});
// Run with: npm run test:component
