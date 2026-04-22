import assert from "node:assert/strict";
import test from "node:test";
import ManagementPageShell from "../../../server/cms/components/management/management-page-shell";
import { render, setupDom, textContent } from "./dom-test-utils";

test("ManagementPageShell renders title, description, search controls, and child content", async () => {
  const dom = setupDom();

  try {
    const container = await render(
      <ManagementPageShell
        title="Backgrounds"
        description="Manage public backgrounds."
        searchValue=""
        onSearchValueChange={() => {}}
        searchField="name"
        onSearchFieldChange={() => {}}
        searchFieldOptions={[
          { value: "name", label: "Name" },
          { value: "imageUrl", label: "Image URL" }
        ]}
      >
        <p>Child Content</p>
      </ManagementPageShell>
    );

    assert.equal(container.querySelector("h1")?.textContent, "Backgrounds");
    assert.match(textContent(container), /Manage public backgrounds\./);
    assert.match(textContent(container), /Child Content/);

    const select = container.querySelector("select");
    const input = container.querySelector('input[placeholder="Search entries"]');

    assert.ok(select);
    assert.ok(input);
    assert.equal(select.value, "name");
    assert.equal(select.querySelectorAll("option").length, 2);
    assert.equal(input.getAttribute("placeholder"), "Search entries");
  } finally {
    await dom.cleanup();
  }
});
// Run with: npm run test:component
