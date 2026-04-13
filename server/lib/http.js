/**
 * Normalizes body used by the http module.
 * @param {(string|number|Object|null)} body The body value provides an input used by the http module.
 * @param {Object} headers The headers object supplies the structured input used by the http module, including the `Content-Type` property.
 * @param {string} headers.Content-Type The `Content-Type` property supplies structured input used by the http module.
 * @returns {(string|Object)} Returns the value produced by the http module.
 */
function normalizeBody(body, headers) {
  if (body === null || body === undefined) {
    return undefined;
  }

  if (typeof body === 'string' || body instanceof URLSearchParams || body instanceof FormData || body instanceof Blob) {
    return body;
  }

  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  return JSON.stringify(body);
}

/**
 * Parses response body used by the http module.
 * @param {Object} response The response response object provides the outgoing channel used by the http route, including the `arrayBuffer` and `text` properties.
 * @param {(Function|Buffer)} response.arrayBuffer The `arrayBuffer` property supplies structured input used by the http module.
 * @param {(string|Function)} response.text The `text` property supplies structured input used by the http module.
 * @param {string} responseType The responseType value provides an input used by the http module.
 * @returns {Promise<(string|Buffer|null)>} Resolves with the value produced by the http module.
 */
async function parseResponseBody(response, responseType) {
  if (responseType === 'arrayBuffer') {
    return Buffer.from(await response.arrayBuffer());
  }

  if (responseType === 'text') {
    return response.text();
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Executes the request helper used by the http module.
 * @param {string} url The url value provides an input used by the http module.
 * @param {Object} options The options object supplies the structured input used by the http module, including the `body`, `expectOk`, `headers`, `method`, `responseType`, and `timeout` properties.
 * @param {Object} options.body The `body` property supplies structured input used by the http module.
 * @param {boolean} options.expectOk The `expectOk` property supplies structured input used by the http module.
 * @param {Object} options.headers The `headers` property supplies structured input used by the http module.
 * @param {string} options.method The `method` property supplies structured input used by the http module.
 * @param {string} options.responseType The `responseType` property supplies structured input used by the http module.
 * @param {number} options.timeout The `timeout` property supplies structured input used by the http module.
 * @returns {Promise<Object>} Resolves with the value produced by the http module.
 */
async function request(url, options = {}) {
  const {
    method = 'GET',
    headers: inputHeaders = {},
    body,
    timeout = 60000,
    responseType = 'json',
    expectOk = true
  } = options;
  const headers = { ...inputHeaders };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: normalizeBody(body, headers),
      signal: controller.signal
    });
    const data = await parseResponseBody(response, responseType);

    if (expectOk && !response.ok) {
      const error = new Error(`HTTP ${response.status} ${method} ${url}`);
      error.status = response.status;
      error.data = data;
      error.url = url;
      throw error;
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  request
};
