import assert from "node:assert/strict";
import test from "node:test";
import ResetPasswordForm from "../../../server/cms/components/reset-password-form";
import { render, setupDom, textContent } from "./dom-test-utils";

test("ResetPasswordForm shows the missing token state and disables submission", async () => {
  const dom = setupDom();

  try {
    const container = await render(<ResetPasswordForm token="" />);

    assert.equal(container.querySelector("h1")?.textContent, "Set New Password");
    assert.match(textContent(container), /Missing recovery token\./);

    const submitButton = container.querySelector('button[type="submit"]');
    const link = Array.from(container.querySelectorAll("a")).find((node) => node.textContent === "Back to login");

    assert.ok(submitButton);
    assert.equal(submitButton.disabled, true);
    assert.ok(link);
    assert.equal(link.getAttribute("href"), "/login");
  } finally {
    await dom.cleanup();
  }
});

test("ResetPasswordForm enables submission when a token is present", async () => {
  const dom = setupDom();

  try {
    const container = await render(<ResetPasswordForm token="recovery-token" />);
    const submitButton = container.querySelector('button[type="submit"]');

    assert.ok(submitButton);
    assert.equal(submitButton.disabled, false);
    assert.doesNotMatch(textContent(container), /Missing recovery token\./);
  } finally {
    await dom.cleanup();
  }
});
// Run with: npm run test:component
