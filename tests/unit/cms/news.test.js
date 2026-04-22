const assert = require("node:assert/strict");
const test = require("node:test");
const { loadCmsModule } = require("./load-module");

test("normalizeSlug lowercases, removes quotes, and collapses separators", async () => {
  const { normalizeSlug } = await loadCmsModule("news.js");
  assert.equal(normalizeSlug(`  Dante's "Inferno" Deck Profile  `), "dantes-inferno-deck-profile");
  assert.equal(normalizeSlug("  ---Burning___Abyss---  "), "burning-abyss");
});

test("createExcerpt preserves short content and truncates long content with ellipsis", async () => {
  const { createExcerpt } = await loadCmsModule("news.js");
  assert.equal(createExcerpt("Short update."), "Short update.");
  assert.equal(createExcerpt("alpha beta gamma", 10), "alpha beta...");
});
// Run with: npm run test:unit
