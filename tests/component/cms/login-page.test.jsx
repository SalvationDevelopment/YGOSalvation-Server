import assert from "node:assert/strict";
import test from "node:test";
import LoginPage from "../../../server/cms/app/login/page";
import { __getRouterMockState, __resetRouterMock } from "next/navigation";
import { click, render, setupDom, submit, textContent, waitFor } from "./dom-test-utils";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("LoginPage renders the auth links and controls", async () => {
  const dom = setupDom();

  try {
    const container = await render(<LoginPage />);
    const submitButton = container.querySelector('button[type="submit"]');
    const links = Array.from(container.querySelectorAll("a")).map((node) => node.getAttribute("href"));

    assert.equal(container.querySelector("h1")?.textContent, "Admin Login");
    assert.ok(submitButton);
    assert.equal(submitButton.disabled, false);
    assert.deepEqual(links, ["/recover", "/"]);
  } finally {
    await dom.cleanup();
  }
});

test("LoginPage shows a missing credentials error when submitted empty", async () => {
  const dom = setupDom();
  const originalFetch = globalThis.fetch;
  __resetRouterMock();

  globalThis.fetch = async () => jsonResponse({ success: false, error: "Missing credentials." }, 400);

  try {
    const container = await render(<LoginPage />);
    const submitButton = container.querySelector('button[type="submit"]');
    const form = container.querySelector("form");

    await submit(form);

    await waitFor(() => {
      assert.match(textContent(container), /Missing credentials\./);
    });

    const routerState = __getRouterMockState();
    assert.deepEqual(routerState.pushCalls, []);
    assert.equal(routerState.refreshCount, 0);
  } finally {
    globalThis.fetch = originalFetch;
    await dom.cleanup();
  }
});
// Run with: npm run test:component
