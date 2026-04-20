import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import * as Module from "../../../../server/ui/components/screens/superheader.component.jsx";
import { AuthStateProvider } from "../../../../server/ui/hooks/use-auth-state.js";
import { render, setupDom, textContent } from "../../cms/dom-test-utils.js";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("superheader.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});

test("superheader.component.jsx includes the puzzles link for logged-in users", async () => {
  const dom = setupDom();

  try {
    const container = await render(
      <AuthStateProvider>
        <Module.default loggedInOverride />
      </AuthStateProvider>,
    );
    const puzzleLink = Array.from(container.querySelectorAll("a")).find(
      (node) => node.textContent?.trim() === "Puzzles",
    );

    assert.match(textContent(container), /Puzzles/);
    assert.ok(puzzleLink);
    assert.equal(puzzleLink.getAttribute("href"), "/puzzles");
  } finally {
    await dom.cleanup();
  }
});
