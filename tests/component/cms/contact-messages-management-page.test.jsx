import assert from "node:assert/strict";
import test from "node:test";
import ContactMessagesManagementPage from "../../../server/cms/components/management/contact-messages-management-page";
import { click, render, setupDom, textContent, waitFor } from "./dom-test-utils";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("ContactMessagesManagementPage loads messages and updates status through the CMS flow", async () => {
  const dom = setupDom();
  const originalFetch = globalThis.fetch;
  const requests = [];
  let messages = [
    {
      id: "1",
      subject: "Deck issue",
      classification: "support",
      name: "Ada",
      email: "ada@example.com",
      username: "ada",
      status: "new",
      createdAt: "2026-03-25T15:00:00.000Z",
      message: "The deck editor is not saving side decks."
    }
  ];

  globalThis.fetch = async (path, options = {}) => {
    const method = options.method || "GET";
    requests.push({ path, method, body: options.body || null });

    if (path === "/api/contact-messages" && method === "GET") {
      return jsonResponse({ success: true, messages: messages.map((item) => ({ ...item })) });
    }

    if (String(path).startsWith("/api/contact-messages/") && method === "PATCH") {
      const id = String(path).split("/").pop();
      const payload = JSON.parse(options.body);
      messages = messages.map((item) => (item.id === id ? { ...item, status: payload.status } : item));
      return jsonResponse({ success: true });
    }

    throw new Error(`Unexpected request: ${method} ${path}`);
  };

  try {
    const container = await render(<ContactMessagesManagementPage />);

    await waitFor(() => {
      assert.match(textContent(container), /Messages \(1\)/);
      assert.match(textContent(container), /Deck issue/);
      assert.match(textContent(container), /Status: new/);
    });

    const reviewedButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Reviewed");
    assert.ok(reviewedButton);
    await click(reviewedButton);

    await waitFor(() => {
      assert.match(textContent(container), /Status: reviewed/);
    });

    const closedButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Closed");
    assert.ok(closedButton);
    await click(closedButton);

    await waitFor(() => {
      assert.match(textContent(container), /Status: closed/);
    });

    assert.ok(requests.some((request) => request.path === "/api/contact-messages" && request.method === "GET"));
    assert.ok(requests.some((request) => request.path === "/api/contact-messages/1" && request.method === "PATCH"));
  } finally {
    globalThis.fetch = originalFetch;
    await dom.cleanup();
  }
});
// Run with: npm run test:component
