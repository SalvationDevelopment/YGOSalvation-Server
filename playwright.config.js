const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests/functional",
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: process.env.CMS_BASE_URL || "http://127.0.0.1:3000",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npm run cms:dev",
    url: process.env.CMS_BASE_URL || "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000
  }
});
