const assert = require("node:assert/strict");
const test = require("node:test");
const { loginAdmin, requestJson, resolveCmsContext } = require("./test-utils");

test("news CRUD flow creates, updates, lists, and deletes a post", async () => {
  const context = await resolveCmsContext();
  const jwt = await loginAdmin(context.baseUrl);
  const unique = `integration-news-${Date.now()}`;
  let createdId = "";

  try {
    const listBefore = await requestJson(context.baseUrl, "/api/news?page=1&pageSize=5");
    assert.equal(listBefore.response.ok, true);
    assert.equal(listBefore.data.success, true);
    assert.equal(Array.isArray(listBefore.data.posts), true);

    const create = await requestJson(context.baseUrl, "/api/news", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: {
        title: unique,
        slug: `${unique}-slug`,
        body: `Body for ${unique}`
      }
    });
    assert.equal(create.response.status, 200);
    assert.equal(create.data.success, true);
    assert.equal(create.data.post.title, unique);
    assert.equal(create.data.post.slug, `${unique}-slug`);

    createdId = create.data.post.id;

    const patch = await requestJson(context.baseUrl, `/api/news/${createdId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${jwt}` },
      body: {
        title: `${unique}-updated`,
        slug: `${unique}-updated-slug`,
        body: `Updated body for ${unique}`
      }
    });
    assert.equal(patch.response.status, 200);
    assert.equal(patch.data.success, true);
    assert.equal(patch.data.post.title, `${unique}-updated`);
    assert.equal(patch.data.post.slug, `${unique}-updated-slug`);

    const listAfter = await requestJson(context.baseUrl, "/api/news?page=1&pageSize=5");
    assert.equal(listAfter.response.ok, true);
    assert.equal(
      listAfter.data.posts.some((item) => item.id === createdId && item.slug === `${unique}-updated-slug`),
      true
    );

    const remove = await requestJson(context.baseUrl, `/api/news/${createdId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwt}` }
    });
    assert.equal(remove.response.status, 200);
    assert.equal(remove.data.success, true);

    const missing = await requestJson(context.baseUrl, `/api/news/${createdId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwt}` }
    });
    assert.equal(missing.response.status, 404);
    assert.equal(missing.data.success, false);
  } finally {
    if (createdId) {
      try {
        await requestJson(context.baseUrl, `/api/news/${createdId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${jwt}` }
        });
      } catch {}
    }

    await context.cleanup();
  }
});
// Run with: npm run test:integration
