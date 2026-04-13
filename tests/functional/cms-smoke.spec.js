const { expect, test } = require("@playwright/test");

test("CMS smoke flow opens the home page and login page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Admin Login" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Recover Password" })).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/login(?:\?.*)?$/),
    page.getByRole("link", { name: "Admin Login" }).click()
  ]);

  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: "Admin Login" })).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel("Identifier")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
});
// Run with: npm run test:functional
