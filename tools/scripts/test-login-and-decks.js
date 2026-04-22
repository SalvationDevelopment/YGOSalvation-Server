const { spawn } = require("child_process");
const path = require("path");
const { request } = require("../../server/lib/http");
const users = require("../../server/api/routes/endpoint_users");
const decks = require("../../server/api/routes/endpoint_decks");

/**
 * Executes the wait helper used by the test login and decks module.
 * @param {number} ms The ms value provides an input used by the test login and decks module.
 * @returns {Promise<*>} Returns the value produced by the test login and decks module.
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes the wait for cms helper used by the test login and decks module.
 * @returns {Promise<Object>} Resolves with the value produced by the test login and decks module.
 */
async function waitForCms() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await request("http://localhost:3000/api/rankings", { timeout: 1000 });
      return response.data;
    } catch {
      await wait(1000);
    }
  }
  throw new Error("CMS did not start on :3000");
}

/**
 * Determines whether cms running should be treated as valid in the test login and decks module.
 * @returns {Promise<boolean>} Resolves to `true` when cms running is valid in the test login and decks module and `false` otherwise.
 */
async function isCmsRunning() {
  try {
    await request("http://localhost:3000/api/rankings", { timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates user used by the test login and decks module.
 * @param {string} username The username value provides an input used by the test login and decks module.
 * @param {string} password The password value provides an input used by the test login and decks module.
 * @returns {Promise<*>} Returns the value produced by the test login and decks module.
 */
function validateUser(username, password) {
  return new Promise((resolve, reject) => {
    users.validate(true, { username, password }, (error, valid, responseData) => {
      if (error || !valid) {
        reject(error || new Error("Invalid credentials"));
        return;
      }
      resolve(responseData);
    });
  });
}

/**
 * Saves deck used by the test login and decks module.
 * @param {Object} session The session value provides an input used by the test login and decks module.
 * @param {Object} deck The deck value provides an input used by the test login and decks module.
 * @param {string} owner The owner value provides an input used by the test login and decks module.
 * @returns {Promise<Array>} Returns the value produced by the test login and decks module.
 */
function saveDeck(session, deck, owner) {
  return new Promise((resolve, reject) => {
    decks.saveDeck(session, deck, owner, (error, savedDecks) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(savedDecks);
    });
  });
}

/**
 * Deletes deck used by the test login and decks module.
 * @param {Object} session The session value provides an input used by the test login and decks module.
 * @param {number} deckID The deckID value provides an input used by the test login and decks module.
 * @param {string} owner The owner value provides an input used by the test login and decks module.
 * @returns {Promise<Array>} Returns the value produced by the test login and decks module.
 */
function deleteDeck(session, deckID, owner) {
  return new Promise((resolve, reject) => {
    decks.deleteDeck(session, deckID, owner, (error, savedDecks) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(savedDecks);
    });
  });
}

/**
 * Executes the main helper used by the test login and decks module.
 * @returns {Promise<void>} Resolves when the test login and decks operation completes.
 */
async function main() {
  const cmsWasRunning = await isCmsRunning();
  const cmsDir = path.join(__dirname, "..", "..", "server", "cms");
  const cms = cmsWasRunning
    ? null
    : spawn(process.execPath, [path.join(cmsDir, "node_modules", "next", "dist", "bin", "next"), "start", "--port", "3000"], {
        cwd: cmsDir,
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
    const readyRankings = await waitForCms();
    console.log("STEP: cms ready");

    const rankings = readyRankings;
    if (!Array.isArray(rankings) || rankings.length === 0) {
      throw new Error("No users available for login test.");
    }

    const username = rankings[0].username;
    const password = "DummyUser123!";
    console.log(`STEP: login ${username}`);
    const auth = await validateUser(username, password);
    if (!auth.jwt) {
      throw new Error("Login did not return a JWT token.");
    }

    const deckName = `test_deck_${Date.now()}`;
    console.log(`STEP: create ${deckName}`);
    const createdDecks = await saveDeck(
      auth.jwt,
      {
        name: deckName,
        owner: username,
        main: [{ id: 89631139 }, { id: 46986414 }],
        extra: [],
        side: []
      },
      username
    );

    const created = createdDecks.find((deck) => deck.name === deckName);
    if (!created) {
      throw new Error("Deck was not returned after save.");
    }
    if (!Array.isArray(created.main) || created.main.length !== 2) {
      throw new Error("Deck main cards were not persisted.");
    }

    console.log(`STEP: update ${created.id}`);
    const updatedDecks = await saveDeck(
      auth.jwt,
      {
        id: created.id,
        name: deckName,
        owner: username,
        main: [{ id: 89631139 }],
        extra: [{ id: 23995346 }],
        side: []
      },
      username
    );

    const updated = updatedDecks.find((deck) => deck.id === created.id);
    if (!updated) {
      console.log("UPDATED_DECKS_PAYLOAD", JSON.stringify(updatedDecks));
    } else {
      console.log("UPDATED_DECK_FOUND", JSON.stringify(updated));
    }
    if (!updated || updated.main.length !== 1 || updated.extra.length !== 1) {
      throw new Error("Deck update did not persist.");
    }

    console.log(`STEP: delete ${created.id}`);
    await deleteDeck(auth.jwt, created.id, username);

    console.log(`LOGIN_OK:${username}`);
    console.log(`DECK_CREATE_OK:${created.id}`);
    console.log(`DECK_UPDATE_OK:${updated.id}`);
    console.log("DECK_DELETE_OK:true");
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
