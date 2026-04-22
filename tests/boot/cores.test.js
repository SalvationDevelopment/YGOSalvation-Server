const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { pathToFileURL } = require("node:url");

const {
  createScriptReader,
  findMissingRuntimeAssets,
  loadNormalMonsterCards,
  readScriptSource,
  repoRoot,
} = require("../fixtures/ocgcore");

const missingRuntimeAssets = findMissingRuntimeAssets();

if (missingRuntimeAssets.length > 0) {
  test.skip(
    `cores boots with repo-local ocgcore assets (${missingRuntimeAssets.join(", ")})`,
    () => {}
  );
} else {
  test("cores boots with repo-local ocgcore assets", async (t) => {
    const coreEntry = path.join(
      repoRoot,
      "server",
      "ocgcore",
      "dist",
      "index.js"
    );
    const {
      default: createCore,
      OcgDuelMode,
      OcgLocation,
      OcgLogType,
      OcgMessageType,
      OcgPosition,
      OcgProcessResult
    } = await import(pathToFileURL(coreEntry).href);

    const fixture = loadNormalMonsterCards(40);
    const logEntries = [];
    const lib = await createCore({ sync: true });
    const createdHandle = await lib.createDuel({
      flags:
        OcgDuelMode.MODE_MR5 |
        OcgDuelMode.PSEUDO_SHUFFLE,
      seed: [1n, 2n, 3n, 4n],
      team1: {
        drawCountPerTurn: 1,
        startingDrawCount: 5,
        startingLP: 8000
      },
      team2: {
        drawCountPerTurn: 1,
        startingDrawCount: 5,
        startingLP: 8000
      },
      cardReader(code) {
        return fixture.cards.get(code) ?? null;
      },
      scriptReader: createScriptReader(),
      errorHandler(type, message) {
        logEntries.push({ type, message });
      }
    });

    assert.ok(createdHandle, "createCore() should return a duel handle");

    t.after(() => {
      lib.destroyDuel(createdHandle);
    });

    assert.equal(
      await lib.loadScript(
        createdHandle,
        "constant.lua",
        readScriptSource("constant.lua")
      ),
      true
    );
    assert.equal(
      await lib.loadScript(
        createdHandle,
        "utility.lua",
        readScriptSource("utility.lua")
      ),
      true
    );

    fixture.codes.forEach((code, index) => {
      const deckPosition = index === 0 ? 0 : 1;
      const addCard = {
        code,
        duelist: 0,
        team: 0,
        controller: 0,
        location: OcgLocation.DECK,
        position: OcgPosition.FACEDOWN_DEFENSE,
        sequence: deckPosition
      };

      lib.duelNewCard(createdHandle, addCard);
      lib.duelNewCard(createdHandle, {
        ...addCard,
        team: 1,
        controller: 1
      });
    });

    await lib.startDuel(createdHandle);

    const messages = [];
    let status = null;

    for (let i = 0; i < 10; i += 1) {
      status = await lib.duelProcess(createdHandle);
      messages.push(...lib.duelGetMessage(createdHandle));

      if (status !== OcgProcessResult.CONTINUE) {
        break;
      }
    }

    assert.equal(
      status,
      OcgProcessResult.WAITING,
      "the core should reach a playable waiting state"
    );
    assert.ok(
      messages.some((message) => message.type === OcgMessageType.DRAW),
      "the duel should emit at least one draw message"
    );
    assert.equal(lib.duelQueryCount(createdHandle, 0, OcgLocation.HAND), 5);
    assert.equal(lib.duelQueryCount(createdHandle, 1, OcgLocation.HAND), 5);
    assert.equal(lib.duelQueryCount(createdHandle, 0, OcgLocation.DECK), 35);
    assert.equal(lib.duelQueryCount(createdHandle, 1, OcgLocation.DECK), 35);
    assert.equal(
      logEntries.filter((entry) => entry.type === OcgLogType.ERROR).length,
      0,
      `expected no ocgcore error logs, saw: ${logEntries
        .map((entry) => `${entry.type}:${entry.message}`)
        .join(" | ")}`
    );
  });
}
// Run with: npm run test:boot
