import assert from "node:assert/strict";
import test from "node:test";
import NewsManagementPage from "../../../server/cms/components/management/news-management-page";
import { click, render, setupDom, textContent, waitFor } from "./dom-test-utils";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("NewsManagementPage loads posts and deletes a post through the CMS flow", async () => {
  const dom = setupDom();
  const originalFetch = globalThis.fetch;
  const requests = [];
  const posts = [
    { id: "1", title: "Spring Update", slug: "spring-update", body: "Patch notes and event details." },
    { id: "2", title: "Tournament Rules", slug: "tournament-rules", body: "Bracket and check-in notes." }
  ];

  globalThis.fetch = async (path, options = {}) => {
    const method = options.method || "GET";
    requests.push({ path, method, body: options.body || null });

    if (path === "/api/news?page=1&pageSize=200" && method === "GET") {
      return jsonResponse({ success: true, posts: posts.map((item) => ({ ...item })) });
    }

    if (String(path).startsWith("/api/news/") && method === "DELETE") {
      const id = String(path).split("/").pop();
      const index = posts.findIndex((item) => item.id === id);
      posts.splice(index, 1);
      return jsonResponse({ success: true });
    }

    throw new Error(`Unexpected request: ${method} ${path}`);
  };

  try {
    const container = await render(<NewsManagementPage />);

    await waitFor(() => {
      assert.match(textContent(container), /All Posts \(2\)/);
      assert.match(textContent(container), /Spring Update/);
      assert.match(textContent(container), /Tournament Rules/);
    });

    const deleteButtons = Array.from(container.querySelectorAll("button")).filter((button) => button.textContent === "Delete");
    const deleteTarget = deleteButtons.find((button) => button.closest("li")?.textContent.includes("Tournament Rules"));
    assert.ok(deleteTarget);
    await click(deleteTarget);

    await waitFor(() => {
      assert.match(textContent(container), /All Posts \(1\)/);
      assert.match(textContent(container), /Spring Update/);
      assert.doesNotMatch(textContent(container), /Tournament Rules/);
    });

    assert.ok(requests.some((request) => request.path === "/api/news?page=1&pageSize=200" && request.method === "GET"));
    assert.ok(requests.some((request) => request.path === "/api/news/2" && request.method === "DELETE"));
  } finally {
    globalThis.fetch = originalFetch;
    await dom.cleanup();
  }
});
// Run with: npm run test:component
