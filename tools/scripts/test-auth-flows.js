const { spawn } = require("child_process");
const path = require("path");
const { request } = require("../../server/lib/http");

/**
 * Executes the wait helper used by the test auth flows module.
 * @param {number} ms The ms value provides an input used by the test auth flows module.
 * @returns {Promise<*>} Returns the value produced by the test auth flows module.
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes the wait for cms helper used by the test auth flows module.
 * @param {string} baseUrl The baseUrl value provides an input used by the test auth flows module.
 * @returns {Promise<Object>} Resolves with the value produced by the test auth flows module.
 */
async function waitForCms(baseUrl) {
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await request(`${baseUrl}/api/rankings`, { timeout: 1000 });
      return response.data;
    } catch {
      await wait(1000);
    }
  }

  throw new Error("CMS did not start on :3000");
}

/**
 * Determines whether cms running should be treated as valid in the test auth flows module.
 * @param {string} baseUrl The baseUrl value provides an input used by the test auth flows module.
 * @returns {Promise<boolean>} Resolves to `true` when cms running is valid in the test auth flows module and `false` otherwise.
 */
async function isCmsRunning(baseUrl) {
  try {
    await request(`${baseUrl}/api/rankings`, { timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Executes the expect status helper used by the test auth flows module.
 * @param {Object} response The response response object provides the outgoing channel used by the test auth flows route, including the `data` property.
 * @param {Object} response.data The `data` property supplies structured input used by the test auth flows module.
 * @param {string} status The status value provides an input used by the test auth flows module.
 * @param {Object} message The message value provides an input used by the test auth flows module.
 * @returns {void} Does not return a value.
 */
function expectStatus(response, status, message) {
  if (response.status !== status) {
    throw new Error(`${message} (expected ${status}, got ${response.status}): ${JSON.stringify(response.data)}`);
  }
}

/**
 * Executes the extract reset code helper used by the test auth flows module.
 * @param {Object} response The response response object provides the outgoing channel used by the test auth flows route, including the `data` property.
 * @param {Object} response.data The `data` property supplies structured input used by the test auth flows module.
 * @param {string} response.data.code The `data.code` property supplies structured input used by the test auth flows module.
 * @returns {string} Returns the value produced by the test auth flows module.
 */
function extractResetCode(response) {
  const code = response?.data?.code;
  if (!code || typeof code !== "string") {
    throw new Error(`Password recovery did not return a reset code: ${JSON.stringify(response.data)}`);
  }

  return code;
}

/**
 * Executes the main helper used by the test auth flows module.
 * @returns {Promise<void>} Resolves when the test auth flows operation completes.
 */
async function main() {
  const baseUrl = process.env.CMS_BASE_URL || "http://127.0.0.1:3000";
  const adminIdentifier = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!ChangeMe";
  const rootDir = path.resolve(__dirname, "..", "..");
  const suffix = Date.now();
  const username = `auth_test_${suffix}`;
  const email = `${username}@example.com`;
  const password = "AuthTest123!Strong";
  const newPassword = "AuthTest456!Stronger";
  const cmsWasRunning = await isCmsRunning(baseUrl);
  const cms = cmsWasRunning
    ? null
    : spawn(process.execPath, [path.join(rootDir, "server", "cms", "index.js"), "--dev"], {
        cwd: rootDir,
        env: { ...process.env },
        stdio: ["ignore", "pipe", "pipe"]
      });

  let cmsOut = "";
  let cmsErr = "";

  if (cms) {
    cms.stdout.on("data", (chunk) => {
      cmsOut += chunk.toString();
    });
    cms.stderr.on("data", (chunk) => {
      cmsErr += chunk.toString();
    });
  }

  try {
    console.log("STEP: waiting for cms");
    await waitForCms(baseUrl);
    console.log("STEP: cms ready");

    console.log("STEP: admin login");
    const adminLogin = await request(`${baseUrl}/api/auth/login`, {
      method: "POST",
      body: {
        identifier: adminIdentifier,
        password: adminPassword
      },
      expectOk: false
    });
    expectStatus(adminLogin, 200, "Admin login failed");
    if (!adminLogin.data?.success || adminLogin.data?.user?.role !== "admin") {
      throw new Error(`Admin login returned unexpected payload: ${JSON.stringify(adminLogin.data)}`);
    }

    console.log(`STEP: register ${username}`);
    const registration = await request(`${baseUrl}/api/auth/local/register`, {
      method: "POST",
      body: {
        username,
        email,
        password
      },
      expectOk: false
    });
    expectStatus(registration, 200, "Registration failed");
    if (!registration.data?.jwt || registration.data?.user?.username !== username) {
      throw new Error(`Registration returned unexpected payload: ${JSON.stringify(registration.data)}`);
    }

    console.log(`STEP: login ${username}`);
    const login = await request(`${baseUrl}/api/auth/local`, {
      method: "POST",
      body: {
        identifier: username,
        password
      },
      expectOk: false
    });
    expectStatus(login, 200, "User login failed");
    if (!login.data?.jwt || login.data?.user?.username !== username) {
      throw new Error(`User login returned unexpected payload: ${JSON.stringify(login.data)}`);
    }

    console.log(`STEP: recover ${email}`);
    const forgot = await request(`${baseUrl}/api/auth/forgot-password`, {
      method: "POST",
      body: {
        email
      },
      expectOk: false
    });
    expectStatus(forgot, 200, "Password recovery request failed");
    const resetCode = extractResetCode(forgot);

    console.log("STEP: reset password");
    const reset = await request(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      body: {
        code: resetCode,
        password: newPassword,
        passwordConfirmation: newPassword
      },
      expectOk: false
    });
    expectStatus(reset, 200, "Password reset failed");
    if (!reset.data?.ok) {
      throw new Error(`Password reset returned unexpected payload: ${JSON.stringify(reset.data)}`);
    }

    console.log("STEP: verify old password rejected");
    const oldPasswordLogin = await request(`${baseUrl}/api/auth/local`, {
      method: "POST",
      body: {
        identifier: username,
        password
      },
      expectOk: false
    });
    expectStatus(oldPasswordLogin, 401, "Old password should no longer work");

    console.log("STEP: verify new password accepted");
    const updatedLogin = await request(`${baseUrl}/api/auth/local`, {
      method: "POST",
      body: {
        identifier: username,
        password: newPassword
      },
      expectOk: false
    });
    expectStatus(updatedLogin, 200, "New password login failed");
    if (!updatedLogin.data?.jwt || updatedLogin.data?.user?.username !== username) {
      throw new Error(`Updated login returned unexpected payload: ${JSON.stringify(updatedLogin.data)}`);
    }

    console.log("ADMIN_LOGIN_OK:true");
    console.log(`REGISTER_OK:${username}`);
    console.log(`LOGIN_OK:${username}`);
    console.log("RECOVERY_OK:true");
    console.log("RESET_OK:true");
    console.log("OLD_PASSWORD_REJECTED:true");
    console.log("NEW_PASSWORD_LOGIN_OK:true");
  } finally {
    if (cms) {
      cms.kill("SIGTERM");
      await wait(500);
    }

    if (cmsErr.trim()) {
      console.log("CMS_STDERR_START");
      console.log(cmsErr.trim());
      console.log("CMS_STDERR_END");
    }

    if (cmsOut.trim()) {
      console.log("CMS_STDOUT_START");
      console.log(cmsOut.trim());
      console.log("CMS_STDOUT_END");
    }
  }
}

main().catch((error) => {
  console.error(`TEST_FAILED:${error.message}`);
  process.exit(1);
});
