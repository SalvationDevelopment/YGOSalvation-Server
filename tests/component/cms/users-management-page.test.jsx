import assert from "node:assert/strict";
import test from "node:test";
import UsersManagementPage from "../../../server/cms/components/management/users-management-page";
import { click, render, setupDom, textContent, waitFor } from "./dom-test-utils";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("UsersManagementPage loads users and supports delete flow", async () => {
  const dom = setupDom();
  const originalFetch = globalThis.fetch;
  const requests = [];
  const users = [
    { id: "1", username: "Alice", email: "alice@example.com", role: "user" },
    { id: "2", username: "Bob", email: "bob@example.com", role: "admin" }
  ];

  globalThis.fetch = async (path, options = {}) => {
    const method = options.method || "GET";
    requests.push({ path, method, body: options.body || null });

    if (path === "/api/users" && method === "GET") {
      return jsonResponse({ success: true, users: users.map((user) => ({ ...user })) });
    }

    if (path === "/api/users" && method === "POST") {
      const payload = JSON.parse(options.body);
      users.push({ id: "3", ...payload });
      return jsonResponse({ success: true });
    }

    if (String(path).startsWith("/api/users/") && method === "PATCH") {
      const id = String(path).split("/").pop();
      const payload = JSON.parse(options.body);
      const index = users.findIndex((user) => user.id === id);
      users[index] = { ...users[index], ...payload };
      return jsonResponse({ success: true });
    }

    if (String(path).startsWith("/api/users/") && method === "DELETE") {
      const id = String(path).split("/").pop();
      const index = users.findIndex((user) => user.id === id);
      users.splice(index, 1);
      return jsonResponse({ success: true });
    }

    throw new Error(`Unexpected request: ${method} ${path}`);
  };

  try {
    const container = await render(<UsersManagementPage />);

    await waitFor(() => {
      assert.match(textContent(container), /All Users \(2\)/);
      assert.match(textContent(container), /Alice/);
      assert.match(textContent(container), /Bob/);
    });

    const deleteButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Delete" && button.closest("li")?.textContent.includes("Bob"));
    assert.ok(deleteButton);
    await click(deleteButton);

    await waitFor(() => {
      assert.match(textContent(container), /All Users \(1\)/);
      assert.doesNotMatch(textContent(container), /Bob/);
    });

    assert.ok(requests.some((request) => request.path === "/api/users" && request.method === "GET"));
    assert.ok(requests.some((request) => request.path === "/api/users/2" && request.method === "DELETE"));
  } finally {
    globalThis.fetch = originalFetch;
    await dom.cleanup();
  }
});
// Run with: npm run test:component
