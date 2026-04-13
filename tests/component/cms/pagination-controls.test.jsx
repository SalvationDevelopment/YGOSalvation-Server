import assert from "node:assert/strict";
import test from "node:test";
import PaginationControls from "../../../server/cms/components/management/pagination-controls";
import { click, render, setupDom, textContent } from "./dom-test-utils";

test("PaginationControls hides itself when there is only one page", async () => {
  const dom = setupDom();

  try {
    const container = await render(
      <PaginationControls page={1} totalPages={1} onPageChange={() => {}} />
    );

    assert.equal(container.innerHTML, "");
  } finally {
    await dom.cleanup();
  }
});

test("PaginationControls reports next and previous page changes", async () => {
  const dom = setupDom();
  const pages = [];

  try {
    const container = await render(
      <PaginationControls page={2} totalPages={3} onPageChange={(page) => pages.push(page)} />
    );

    const buttons = container.querySelectorAll("button");

    assert.equal(buttons.length, 2);
    assert.match(textContent(container), /Page 2 of 3/);

    await click(buttons[0]);
    await click(buttons[1]);

    assert.deepEqual(pages, [1, 3]);
  } finally {
    await dom.cleanup();
  }
});
// Run with: npm run test:component
