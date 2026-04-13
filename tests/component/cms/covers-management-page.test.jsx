import assert from "node:assert/strict";
import test from "node:test";
import CoversManagementPage from "../../../server/cms/components/management/covers-management-page";
import { click, render, setupDom, textContent, waitFor } from "./dom-test-utils";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("CoversManagementPage loads covers and deletes a cover through the CMS flow", async () => {
  const dom = setupDom();
  const originalFetch = globalThis.fetch;
  const requests = [];
  const covers = [
    { id: "1", name: "Blue Flame", imageUrl: "https://img.example/blue.jpg" },
    { id: "2", name: "Red Eclipse", imageUrl: "https://img.example/red.jpg" }
  ];

  globalThis.fetch = async (path, options = {}) => {
    const method = options.method || "GET";
    requests.push({ path, method, body: options.body || null });

    if (path === "/api/covers" && method === "GET") {
      return jsonResponse({ success: true, covers: covers.map((item) => ({ ...item })) });
    }

    if (String(path).startsWith("/api/covers/") && method === "DELETE") {
      const id = String(path).split("/").pop();
      const index = covers.findIndex((item) => item.id === id);
      covers.splice(index, 1);
      return jsonResponse({ success: true });
    }

    throw new Error(`Unexpected request: ${method} ${path}`);
  };

  try {
    const container = await render(<CoversManagementPage />);

    await waitFor(() => {
      assert.match(textContent(container), /All Covers \(2\)/);
      assert.match(textContent(container), /Blue Flame/);
      assert.match(textContent(container), /Red Eclipse/);
    });

    const deleteButtons = Array.from(container.querySelectorAll("button")).filter((button) => button.textContent === "Delete");
    const deleteTarget = deleteButtons.find((button) => button.closest("li")?.textContent.includes("Red Eclipse"));
    assert.ok(deleteTarget);
    await click(deleteTarget);

    await waitFor(() => {
      assert.match(textContent(container), /All Covers \(1\)/);
      assert.match(textContent(container), /Blue Flame/);
      assert.doesNotMatch(textContent(container), /Red Eclipse/);
    });

    assert.ok(requests.some((request) => request.path === "/api/covers" && request.method === "GET"));
    assert.ok(requests.some((request) => request.path === "/api/covers/2" && request.method === "DELETE"));
  } finally {
    globalThis.fetch = originalFetch;
    await dom.cleanup();
  }
});
// Run with: npm run test:component
