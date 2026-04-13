import assert from "node:assert/strict";
import test from "node:test";
import RecoverPage from "../../../server/cms/app/recover/page";
import { click, render, setupDom, submit, textContent, waitFor } from "./dom-test-utils";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("RecoverPage renders the recovery links and controls", async () => {
  const dom = setupDom();

  try {
    const container = await render(<RecoverPage />);
    const submitButton = container.querySelector('button[type="submit"]');
    const links = Array.from(container.querySelectorAll("a")).map((node) => node.getAttribute("href"));

    assert.equal(container.querySelector("h1")?.textContent, "Recover Password");
    assert.ok(submitButton);
    assert.equal(submitButton.disabled, false);
    assert.deepEqual(links, ["/login", "/"]);
  } finally {
    await dom.cleanup();
  }
});

test("RecoverPage shows an error when submitted without an email address", async () => {
  const dom = setupDom();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => jsonResponse({ success: false, error: "Email is required." }, 400);

  try {
    const container = await render(<RecoverPage />);
    const submitButton = container.querySelector('button[type="submit"]');
    const form = container.querySelector("form");

    await submit(form);

    await waitFor(() => {
      assert.match(textContent(container), /Email is required\./);
    });
  } finally {
    globalThis.fetch = originalFetch;
    await dom.cleanup();
  }
});
// Run with: npm run test:component
