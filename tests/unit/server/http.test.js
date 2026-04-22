const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const runtimeRequire = eval("require");

const httpModulePath = path.resolve(process.cwd(), "server", "lib", "http.js");

function loadHttpModule() {
  delete require.cache[httpModulePath];
  return runtimeRequire(httpModulePath);
}

function createResponse({ ok = true, status = 200, text = "", arrayBuffer = null, headers = {} }) {
  return {
    ok,
    status,
    headers,
    text: async () => text,
    arrayBuffer: async () => arrayBuffer
  };
}

test("request serializes JSON bodies and parses JSON responses", async () => {
  const originalFetch = global.fetch;
  const fetchCalls = [];
  const responseHeaders = { get() { return null; } };
  global.fetch = async (url, options) => {
    fetchCalls.push({ url, options });
    return createResponse({
      ok: true,
      status: 200,
      text: JSON.stringify({ saved: true }),
      headers: responseHeaders
    });
  };

  try {
    const { request } = loadHttpModule();
    const inputHeaders = { Authorization: "Bearer test-token" };
    const result = await request("https://example.test/decks", {
      method: "POST",
      headers: inputHeaders,
      body: { name: "Blue-Eyes" }
    });

    assert.equal(fetchCalls.length, 1);
    assert.equal(fetchCalls[0].url, "https://example.test/decks");
    assert.equal(fetchCalls[0].options.method, "POST");
    assert.deepEqual(fetchCalls[0].options.headers, {
      Authorization: "Bearer test-token",
      "Content-Type": "application/json"
    });
    assert.equal(fetchCalls[0].options.body, JSON.stringify({ name: "Blue-Eyes" }));
    assert.equal(fetchCalls[0].options.signal.aborted, false);
    assert.equal(inputHeaders["Content-Type"], undefined);
    assert.deepEqual(result, {
      ok: true,
      status: 200,
      data: { saved: true },
      headers: responseHeaders
    });
  } finally {
    global.fetch = originalFetch;
    delete require.cache[httpModulePath];
  }
});

test("request returns text and arrayBuffer payloads and surfaces HTTP errors", async () => {
  const originalFetch = global.fetch;
  const textHeaders = { get() { return null; } };
  const bufferHeaders = { get() { return null; } };
  const errorHeaders = { get() { return null; } };
  const payloads = [
    createResponse({
      ok: true,
      status: 200,
      text: "plain text",
      headers: textHeaders
    }),
    createResponse({
      ok: true,
      status: 200,
      arrayBuffer: Uint8Array.from([1, 2, 3]).buffer,
      text: "",
      headers: bufferHeaders
    }),
    createResponse({
      ok: false,
      status: 418,
      text: JSON.stringify({ error: "short and stout" }),
      headers: errorHeaders
    })
  ];
  const fetchCalls = [];
  global.fetch = async (url, options) => {
    fetchCalls.push({ url, options });
    return payloads.shift();
  };

  try {
    const { request } = loadHttpModule();
    const textResult = await request("https://example.test/text", {
      responseType: "text"
    });
    const bufferResult = await request("https://example.test/bin", {
      responseType: "arrayBuffer"
    });

    assert.equal(textResult.data, "plain text");
    assert.strictEqual(textResult.headers, textHeaders);
    assert.ok(Buffer.isBuffer(bufferResult.data));
    assert.deepEqual([...bufferResult.data], [1, 2, 3]);
    assert.strictEqual(bufferResult.headers, bufferHeaders);

    await assert.rejects(
      request("https://example.test/error", { method: "PATCH" }),
      (error) => {
        assert.equal(error.message, "HTTP 418 PATCH https://example.test/error");
        assert.equal(error.status, 418);
        assert.deepEqual(error.data, { error: "short and stout" });
        assert.equal(error.url, "https://example.test/error");
        return true;
      }
    );

    assert.equal(fetchCalls.length, 3);
  } finally {
    global.fetch = originalFetch;
    delete require.cache[httpModulePath];
  }
});
// Run with: npm run test:unit
