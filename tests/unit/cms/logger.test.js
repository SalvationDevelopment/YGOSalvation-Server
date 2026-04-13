const assert = require("node:assert/strict");
const test = require("node:test");
const { loadCmsModule } = require("./load-module");

test("logger config exposes the expected defaults", async () => {
  const { config } = await loadCmsModule("logger.js");

  assert.deepEqual(config, {
    main: true,
    debug: false,
    error: true
  });
});

test("logger create returns a no-op when disabled", async () => {
  const { create } = await loadCmsModule("logger.js");
  const originalLog = console.log;
  let called = false;

  console.log = () => {
    called = true;
  };

  try {
    const logger = create(false, "[cms]");
    logger.log("ignored");
    assert.equal(called, false);
  } finally {
    console.log = originalLog;
  }
});

test("logger create binds the prefix when enabled", async () => {
  const { create } = await loadCmsModule("logger.js");
  const originalLog = console.log;
  const calls = [];

  console.log = (...args) => {
    calls.push(args);
  };

  try {
    const logger = create(true, "[cms]");
    logger.log("saved");
    assert.deepEqual(calls, [["[cms]", "saved"]]);
  } finally {
    console.log = originalLog;
  }
});
// Run with: npm run test:unit
