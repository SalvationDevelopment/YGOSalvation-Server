const assert = require("node:assert/strict");
const test = require("node:test");
const { loginAdmin, requestJson, resolveCmsContext } = require("./test-utils");

test("backgrounds CRUD flow creates, updates, lists, and deletes a record", async () => {
  const context = await resolveCmsContext();
  const jwt = await loginAdmin(context.baseUrl);
  const unique = `integration-background-${Date.now()}`;
  let createdId = "";

  try {
    const listBefore = await requestJson(context.baseUrl, "/api/backgrounds");
    assert.equal(listBefore.response.ok, true);
    assert.equal(listBefore.data.success, true);
    assert.equal(Array.isArray(listBefore.data.backgrounds), true);

    const create = await requestJson(context.baseUrl, "/api/backgrounds", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: {
        name: unique,
        imageUrl: `https://img.example/${unique}.jpg`
      }
    });
    assert.equal(create.response.status, 200);
    assert.equal(create.data.success, true);
    assert.equal(create.data.background.name, unique);
    assert.equal(create.data.background.imageUrl, `https://img.example/${unique}.jpg`);

    createdId = create.data.background.id;

    const patch = await requestJson(context.baseUrl, `/api/backgrounds/${createdId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${jwt}` },
      body: {
        name: `${unique}-updated`,
        imageUrl: `https://img.example/${unique}-updated.jpg`
      }
    });
    assert.equal(patch.response.status, 200);
    assert.equal(patch.data.success, true);
    assert.equal(patch.data.background.name, `${unique}-updated`);

    const listAfter = await requestJson(context.baseUrl, "/api/backgrounds");
    assert.equal(listAfter.response.ok, true);
    assert.equal(
      listAfter.data.backgrounds.some((item) => item.id === createdId && item.name === `${unique}-updated`),
      true
    );

    const remove = await requestJson(context.baseUrl, `/api/backgrounds/${createdId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwt}` }
    });
    assert.equal(remove.response.status, 200);
    assert.equal(remove.data.success, true);

    const missing = await requestJson(context.baseUrl, `/api/backgrounds/${createdId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwt}` }
    });
    assert.equal(missing.response.status, 404);
    assert.equal(missing.data.success, false);
  } finally {
    if (createdId) {
      try {
        await requestJson(context.baseUrl, `/api/backgrounds/${createdId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${jwt}` }
        });
      } catch {}
    }

    await context.cleanup();
  }
});
// Run with: npm run test:integration
