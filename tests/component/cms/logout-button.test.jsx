import assert from "node:assert/strict";
import test from "node:test";
import LogoutButton from "../../../server/cms/components/dashboard/logout-button";
import { __getRouterMockState, __resetRouterMock } from "next/navigation";
import { click, render, setupDom, waitFor } from "./dom-test-utils";

test("LogoutButton posts to logout and redirects to login", async () => {
  const dom = setupDom();
  const originalFetch = globalThis.fetch;
  const requests = [];
  __resetRouterMock();

  globalThis.fetch = async (path, options = {}) => {
    requests.push({ path, method: options.method || "GET" });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  try {
    const container = await render(<LogoutButton />);
    const button = Array.from(container.querySelectorAll("button")).find((node) => node.textContent === "Logout");

    assert.ok(button);
    await click(button);

    await waitFor(() => {
      const routerState = __getRouterMockState();
      assert.deepEqual(routerState.pushCalls, ["/login"]);
      assert.equal(routerState.refreshCount, 1);
    });

    assert.deepEqual(requests, [{ path: "/api/auth/logout", method: "POST" }]);
  } finally {
    globalThis.fetch = originalFetch;
    await dom.cleanup();
  }
});
// Run with: npm run test:component
