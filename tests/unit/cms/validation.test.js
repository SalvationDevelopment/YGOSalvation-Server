const assert = require("node:assert/strict");
const test = require("node:test");
const { loadCmsModule } = require("./load-module");

test("normalizeIdentifier trims input and strips null characters", async () => {
  const { normalizeIdentifier } = await loadCmsModule("validation.js");
  assert.equal(normalizeIdentifier("  user\0name  "), "username");
  assert.equal(normalizeIdentifier(123), "");
});

test("isValidEmail accepts basic valid addresses and rejects malformed values", async () => {
  const { isValidEmail } = await loadCmsModule("validation.js");
  assert.equal(isValidEmail("duelist@example.com"), true);
  assert.equal(isValidEmail("bad-email"), false);
  assert.equal(isValidEmail("missing@domain"), false);
});

test("validatePasswordStrength returns score details and distinguishes weak from strong input", async () => {
  const { validatePasswordStrength } = await loadCmsModule("validation.js");
  const weak = validatePasswordStrength("12345");
  const strong = validatePasswordStrength("CorrectHorseBatteryStaple!2026");

  assert.equal(typeof weak.score, "number");
  assert.equal(typeof strong.score, "number");
  assert.equal(Array.isArray(weak.feedback.suggestions), true);
  assert.equal(weak.ok, false);
  assert.equal(strong.ok, true);
  assert.ok(strong.score >= weak.score);
});
// Run with: npm run test:unit
