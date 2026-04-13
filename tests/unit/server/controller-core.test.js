const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const runtimeRequire = eval("require");

const controllerCoreModulePath = path.resolve(
  process.cwd(),
  "server",
  "core",
  "core",
  "controller_core.js",
);

function loadControllerCore() {
  delete require.cache[controllerCoreModulePath];
  return runtimeRequire(controllerCoreModulePath);
}

test("controller_core resolves canonical automatic duel settings for starting LP and timer", () => {
  const controllerCore = loadControllerCore();

  try {
    assert.equal(
      controllerCore.__testHooks.resolveStartingLpForTest({
        team1: { startingLP: 8000 },
      }),
      8000,
    );
    assert.equal(
      controllerCore.__testHooks.resolveStartingLpForTest({
        startingLP: 16000,
      }),
      16000,
    );
    assert.equal(
      controllerCore.__testHooks.resolveTimeLimitForTest({ timeLimitSeconds: 3000 }),
      3000,
    );
    assert.equal(
      controllerCore.__testHooks.resolveTimeLimitForTest({ timeLimitSeconds: 180 }),
      180,
    );
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage converts numeric MSG_HINT hint_type values into UI strings", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        HINT: 2,
      },
    });

    const normalized = controllerCore.normalizeMessage({
      type: 2,
      hint_type: 3,
      player: 0,
      hint: 123n,
    });

    assert.deepEqual(normalized, {
      type: 2,
      hint_type: "HINT_SELECTMSG",
      player: 0,
      hint: "123",
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage preserves unknown MSG_HINT hint_type values", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        HINT: 2,
      },
    });

    const normalized = controllerCore.normalizeMessage({
      type: 2,
      hint_type: 255,
      player: 1,
      hint: 456n,
    });

    assert.equal(normalized.hint_type, 255);
    assert.equal(normalized.player, 1);
    assert.equal(normalized.hint, "456");
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage builds browser-safe select-option and counter question payloads", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        SELECT_OPTION: 14,
        SELECT_COUNTER: 22,
      },
    });

    const normalizedOption = controllerCore.normalizeMessage({
      type: 14,
      player: 0,
      options: [560n, 1001n],
    });
    const normalizedCounter = controllerCore.normalizeMessage({
      type: 22,
      player: 0,
      counter_type: 27,
      count: 3,
      cards: [
        {
          code: 1001,
          controller: 0,
          location: 4,
          sequence: 2,
          count: 2,
        },
        {
          code: 1002,
          controller: 1,
          location: 8,
          sequence: 1,
          count: 5,
        },
      ],
    });

    assert.deepEqual(normalizedOption.select_options, [
      { i: 0, value: "560" },
      { i: 1, value: "1001" },
    ]);
    assert.deepEqual(normalizedOption.options, ["560", "1001"]);
    assert.deepEqual(normalizedCounter.counter_targets, [
      {
        code: 1001,
        controller: 0,
        location: "MONSTERZONE",
        sequence: 2,
        count: 2,
        counter_type: 27,
        id: 1001,
        player: 0,
        index: 2,
        i: 0,
      },
      {
        code: 1002,
        controller: 1,
        location: "SPELLZONE",
        sequence: 1,
        count: 5,
        counter_type: 27,
        id: 1002,
        player: 1,
        index: 1,
        i: 1,
      },
    ]);
    assert.equal(normalizedCounter.select_max, 3);
    assert.equal(normalizedCounter.select_min, 3);
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage preserves HAND_RES results and DECK_TOP packets as browser-safe values", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        DECK_TOP: 38,
        HAND_RES: 133,
      },
    });

    const normalizedDeckTop = controllerCore.normalizeMessage({
      type: 38,
      player: 1,
      count: 2,
      code: 46986414,
      position: 8,
    });
    const normalized = controllerCore.normalizeMessage({
      type: 133,
      results: [2, 1],
    });

    assert.deepEqual(normalizedDeckTop, {
      type: 38,
      player: 1,
      count: 2,
      code: 46986414,
      position: 8,
      offset: 2,
      id: 46986414,
      reversed: true,
    });
    assert.deepEqual(normalized, {
      type: 133,
      results: [2, 1],
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage preserves overlay-aware MSG_MOVE coordinates from ocgcore", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        MOVE: 50,
      },
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
        FACEUP: 16,
        FACEDOWN: 32,
        ATTACK: 64,
        DEFENSE: 128,
      },
    });

    const normalized = controllerCore.normalizeMessage({
      type: 50,
      card: 36553319,
      from: {
        controller: 0,
        location: 4,
        sequence: 1,
        position: 1,
        overlay_sequence: 1,
      },
      to: {
        controller: 0,
        location: 4,
        sequence: 2,
        position: 1,
        overlay_sequence: 0,
      },
    });

    assert.deepEqual(normalized, {
      type: 50,
      card: 36553319,
      from: {
        controller: 0,
        location: 4,
        sequence: 1,
        position: 1,
        overlay_sequence: 1,
      },
      to: {
        controller: 0,
        location: 4,
        sequence: 2,
        position: 1,
        overlay_sequence: 0,
      },
      code: 36553319,
      previousController: 0,
      previousLocation: "MONSTERZONE",
      previousIndex: 1,
      currentController: 0,
      currentLocation: "MONSTERZONE",
      currentIndex: 2,
      currentPosition: "FaceUpAttack",
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage converts FIELD_DISABLED, TOSS_COIN, and TOSS_DICE into browser-safe UI payloads", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        FIELD_DISABLED: 59,
        TOSS_COIN: 130,
        TOSS_DICE: 131,
      },
    });

    const normalizedFieldDisabled = controllerCore.normalizeMessage({
      type: 59,
      field_mask: 513,
    });
    const normalizedCoinToss = controllerCore.normalizeMessage({
      type: 130,
      player: 1,
      results: [1, 0, true],
    });
    const normalizedDiceToss = controllerCore.normalizeMessage({
      type: 131,
      player: 0,
      results: [6, "4", 2],
    });

    assert.deepEqual(normalizedFieldDisabled, {
      type: 59,
      field_mask: 513,
      zones: [
        {
          player: 0,
          location: "MONSTERZONE",
          index: 0,
        },
        {
          player: 0,
          location: "SPELLZONE",
          index: 1,
        },
      ],
    });
    assert.deepEqual(normalizedCoinToss, {
      type: 130,
      player: 1,
      results: [true, false, true],
    });
    assert.deepEqual(normalizedDiceToss, {
      type: 131,
      player: 0,
      results: [6, 4, 2],
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage converts ANNOUNCE_CARD opcodes into browser-safe values", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        ANNOUNCE_CARD: 142,
      },
    });

    const normalized = controllerCore.normalizeMessage({
      type: 142,
      player: 0,
      opcodes: [1001n, 4611687117939015680n],
    });

    assert.deepEqual(normalized, {
      type: 142,
      player: 0,
      opcodes: [1001, "ISCODE"],
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage prepares summon, chain, equip, and battle announcements for browser feedback", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        SUMMONING: 60,
        CHAINING: 70,
        EQUIP: 93,
        BATTLE: 111,
      },
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
        FACEUP: 16,
        FACEDOWN: 32,
        ATTACK: 64,
        DEFENSE: 128,
      },
    });

    const normalizedSummon = controllerCore.normalizeMessage({
      type: 60,
      code: 1001,
      controller: 0,
      location: 4,
      sequence: 2,
      position: 1,
    });
    const normalizedChain = controllerCore.normalizeMessage({
      type: 70,
      code: 2001,
      controller: 1,
      location: 8,
      sequence: 3,
      position: 32,
      triggering_controller: 1,
      triggering_location: 8,
      triggering_sequence: 3,
      description: 560n,
      chain_size: 2,
    });
    const normalizedEquip = controllerCore.normalizeMessage({
      type: 93,
      card: {
        controller: 0,
        location: 8,
        sequence: 1,
      },
      target: {
        controller: 1,
        location: 4,
        sequence: 2,
      },
    });
    const normalizedBattle = controllerCore.normalizeMessage({
      type: 111,
      card: {
        controller: 0,
        location: 4,
        sequence: 0,
        attack: 2500,
        defense: 2100,
        destroyed: false,
      },
      target: {
        controller: 1,
        location: 4,
        sequence: 1,
        attack: 1800,
        defense: 1200,
        destroyed: true,
      },
    });

    assert.deepEqual(normalizedSummon, {
      type: 60,
      code: 1001,
      controller: 0,
      location: "MONSTERZONE",
      sequence: 2,
      position: "FaceUpAttack",
      player: 0,
      index: 2,
      id: 1001,
    });
    assert.deepEqual(normalizedChain, {
      type: 70,
      code: 2001,
      controller: 1,
      location: "SPELLZONE",
      sequence: 3,
      position: 32,
      triggering_controller: 1,
      triggering_location: "SPELLZONE",
      triggering_sequence: 3,
      description: "560",
      chain_size: 2,
      player: 1,
      index: 3,
      id: 2001,
      source: {
        player: 1,
        location: "SPELLZONE",
        index: 3,
      },
      description_text: "Select",
    });
    assert.deepEqual(normalizedEquip, {
      type: 93,
      card: {
        controller: 0,
        location: 8,
        sequence: 1,
      },
      source: {
        player: 0,
        location: "SPELLZONE",
        index: 1,
      },
      target: {
        player: 1,
        location: "MONSTERZONE",
        index: 2,
      },
    });
    assert.deepEqual(normalizedBattle, {
      type: 111,
      card: {
        controller: 0,
        location: 4,
        sequence: 0,
        attack: 2500,
        defense: 2100,
        destroyed: false,
      },
      source: {
        player: 0,
        location: "MONSTERZONE",
        index: 0,
        attack: 2500,
        defense: 2100,
        destroyed: false,
      },
      target: {
        player: 1,
        location: "MONSTERZONE",
        index: 1,
        attack: 1800,
        defense: 1200,
        destroyed: true,
      },
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage prepares reveal and coordinate payloads for extra-top, shuffle-set, and remove-cards messages", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        CONFIRM_EXTRATOP: 42,
        SHUFFLE_SET_CARD: 36,
        REMOVE_CARDS: 190,
      },
    });

    const normalizedConfirm = controllerCore.normalizeMessage({
      type: 42,
      player: 1,
      cards: [
        {
          code: 3001,
          controller: 1,
          location: 64,
          sequence: 0,
        },
      ],
    });
    const normalizedShuffleSet = controllerCore.normalizeMessage({
      type: 36,
      location: 8,
      cards: [
        {
          from: {
            controller: 0,
            location: 8,
            sequence: 1,
          },
          to: {
            controller: 0,
            location: 8,
            sequence: 0,
          },
        },
      ],
    });
    const normalizedRemove = controllerCore.normalizeMessage({
      type: 190,
      cards: [
        {
          controller: 0,
          location: 4,
          sequence: 2,
        },
        {
          controller: 1,
          location: 4,
          sequence: 0,
          overlay_sequence: 1,
        },
      ],
    });

    assert.deepEqual(normalizedConfirm.reveal_cards, [
      {
        code: 3001,
        controller: 1,
        location: "EXTRA",
        sequence: 0,
        id: 3001,
        player: 1,
        index: 0,
        i: 0,
      },
    ]);
    assert.deepEqual(normalizedConfirm.selectable_targets, normalizedConfirm.reveal_cards);
    assert.deepEqual(normalizedShuffleSet, {
      type: 36,
      location: "SPELLZONE",
      cards: [
        {
          from: {
            player: 0,
            location: "SPELLZONE",
            index: 1,
          },
          to: {
            player: 0,
            location: "SPELLZONE",
            index: 0,
          },
        },
      ],
    });
    assert.deepEqual(normalizedRemove.cards, [
      {
        player: 0,
        location: "MONSTERZONE",
        index: 2,
      },
      {
        player: 1,
        location: "MONSTERZONE",
        index: 0,
        overlay_sequence: 1,
        overlayindex: 2,
      },
    ]);
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage prepares target relation announcements with browser-safe coordinates", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        BECOME_TARGET: 83,
        BE_CHAIN_TARGET: 121,
        CREATE_RELATION: 122,
        RELEASE_RELATION: 123,
        CARD_TARGET: 96,
        CANCEL_TARGET: 97,
      },
    });

    const normalizedBecome = controllerCore.normalizeMessage({
      type: 83,
      cards: [
        {
          controller: 0,
          location: 4,
          sequence: 2,
        },
        {
          controller: 1,
          location: 8,
          sequence: 1,
        },
      ],
    });

    const normalizedTarget = controllerCore.normalizeMessage({
      type: 96,
      card: {
        controller: 0,
        location: 4,
        sequence: 2,
      },
      target: {
        controller: 1,
        location: 8,
        sequence: 1,
      },
    });
    const normalizedCancel = controllerCore.normalizeMessage({
      type: 97,
      card: {
        controller: 1,
        location: 8,
        sequence: 3,
      },
      target: {
        controller: 0,
        location: 4,
        sequence: 4,
      },
    });
    const normalizedChainTarget = controllerCore.normalizeMessage({
      type: 121,
      cards: [
        {
          controller: 0,
          location: 4,
          sequence: 2,
        },
      ],
    });
    const normalizedCreateRelation = controllerCore.normalizeMessage({
      type: 122,
      source: {
        controller: 0,
        location: 8,
        sequence: 1,
      },
      target: {
        controller: 1,
        location: 4,
        sequence: 0,
      },
      cards: [
        {
          controller: 0,
          location: 8,
          sequence: 1,
        },
        {
          controller: 1,
          location: 4,
          sequence: 0,
        },
      ],
    });
    const normalizedReleaseRelation = controllerCore.normalizeMessage({
      type: 123,
      source: {
        controller: 1,
        location: 4,
        sequence: 3,
      },
      cards: [
        {
          controller: 1,
          location: 4,
          sequence: 3,
        },
      ],
    });

    assert.deepEqual(normalizedBecome, {
      type: 83,
      cards: [
        {
          player: 0,
          location: "MONSTERZONE",
          index: 2,
        },
        {
          player: 1,
          location: "SPELLZONE",
          index: 1,
        },
      ],
    });
    assert.deepEqual(normalizedTarget, {
      type: 96,
      card: {
        controller: 0,
        location: 4,
        sequence: 2,
      },
      source: {
        player: 0,
        location: "MONSTERZONE",
        index: 2,
      },
      target: {
        player: 1,
        location: "SPELLZONE",
        index: 1,
      },
    });
    assert.deepEqual(normalizedCancel, {
      type: 97,
      card: {
        controller: 1,
        location: 8,
        sequence: 3,
      },
      source: {
        player: 1,
        location: "SPELLZONE",
        index: 3,
      },
      target: {
        player: 0,
        location: "MONSTERZONE",
        index: 4,
      },
    });
    assert.deepEqual(normalizedChainTarget, {
      type: 121,
      cards: [
        {
          player: 0,
          location: "MONSTERZONE",
          index: 2,
        },
      ],
    });
    assert.deepEqual(normalizedCreateRelation, {
      type: 122,
      source: {
        player: 0,
        location: "SPELLZONE",
        index: 1,
      },
      target: {
        player: 1,
        location: "MONSTERZONE",
        index: 0,
      },
      cards: [
        {
          player: 0,
          location: "SPELLZONE",
          index: 1,
        },
        {
          player: 1,
          location: "MONSTERZONE",
          index: 0,
        },
      ],
    });
    assert.deepEqual(normalizedReleaseRelation, {
      type: 123,
      source: {
        player: 1,
        location: "MONSTERZONE",
        index: 3,
      },
      target: null,
      cards: [
        {
          player: 1,
          location: "MONSTERZONE",
          index: 3,
        },
      ],
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage prepares selection, unequip, and missed-effect announcements for browser feedback", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        CARD_SELECTED: 80,
        RANDOM_SELECTED: 81,
        UNEQUIP: 95,
        ATTACK_DISABLED: 112,
        MISSED_EFFECT: 120,
      },
    });

    const normalizedSelected = controllerCore.normalizeMessage({
      type: 80,
      cards: [
        {
          controller: 0,
          location: 4,
          sequence: 1,
        },
      ],
    });
    const normalizedRandom = controllerCore.normalizeMessage({
      type: 81,
      player: 1,
      cards: [
        {
          controller: 1,
          location: 8,
          sequence: 2,
        },
      ],
    });
    const normalizedUnequip = controllerCore.normalizeMessage({
      type: 95,
      card: {
        controller: 0,
        location: 8,
        sequence: 0,
      },
    });
    const normalizedAttackDisabled = controllerCore.normalizeMessage({
      type: 112,
    });
    const normalizedMissedEffect = controllerCore.normalizeMessage({
      type: 120,
      controller: 1,
      location: 4,
      sequence: 3,
      code: 46986414,
    });

    assert.deepEqual(normalizedSelected, {
      type: 80,
      cards: [
        {
          player: 0,
          location: "MONSTERZONE",
          index: 1,
        },
      ],
    });
    assert.deepEqual(normalizedRandom, {
      type: 81,
      player: 1,
      cards: [
        {
          player: 1,
          location: "SPELLZONE",
          index: 2,
        },
      ],
    });
    assert.deepEqual(normalizedUnequip, {
      type: 95,
      card: {
        controller: 0,
        location: 8,
        sequence: 0,
      },
      source: {
        player: 0,
        location: "SPELLZONE",
        index: 0,
      },
    });
    assert.equal(normalizedAttackDisabled.text, "An attack was negated");
    assert.deepEqual(normalizedMissedEffect.source, {
      player: 1,
      location: "MONSTERZONE",
      index: 3,
    });
    assert.equal(normalizedMissedEffect.id, 46986414);
    assert.equal(normalizedMissedEffect.text, "\"Dark Magician\" missed the timing");
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage converts card and player hints into browser-safe text payloads", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        CARD_HINT: 210,
        PLAYER_HINT: 211,
      },
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
        FACEUP: 16,
        FACEDOWN: 32,
        ATTACK: 64,
        DEFENSE: 128,
      },
    });

    const normalizedCardHint = controllerCore.normalizeMessage({
      type: 210,
      controller: 0,
      location: 4,
      sequence: 2,
      position: 1,
      card_hint: 1,
      description: 2n,
    });
    const normalizedPlayerHint = controllerCore.normalizeMessage({
      type: 211,
      player: 1,
      player_hint: 6,
      description: 560n,
    });

    assert.deepEqual(normalizedCardHint, {
      type: 210,
      controller: 0,
      location: "MONSTERZONE",
      sequence: 2,
      position: "FaceUpAttack",
      card_hint: "turn",
      description: "2",
      player: 0,
      index: 2,
      description_text: "Special Summon",
      hint_text: "Turn 2",
    });
    assert.deepEqual(normalizedPlayerHint, {
      type: 211,
      player: 1,
      player_hint: "desc_add",
      description: "560",
      description_text: "Select",
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage converts reload-field into a browser-safe field snapshot", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        RELOAD_FIELD: 212,
      },
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
        FACEUP: 16,
        FACEDOWN: 32,
        ATTACK: 64,
        DEFENSE: 128,
      },
    });

    const normalized = controllerCore.normalizeMessage({
      type: 212,
      flags: 7n,
      players: [
        {
          lp: 7600,
          deck_size: 2,
          hand_size: 1,
          grave_size: 1,
          banish_size: 0,
          extra_size: 2,
          extra_faceup_count: 1,
          monsters: [{ position: 1, materials: 2 }, null],
          spells: [{ position: 32, materials: 0 }],
        },
        {
          lp: 5400,
          deck_size: 0,
          hand_size: 0,
          grave_size: 0,
          banish_size: 1,
          extra_size: 0,
          extra_faceup_count: 0,
          monsters: [],
          spells: [],
        },
      ],
      chain: [
        {
          code: 1001,
          controller: 0,
          location: 4,
          sequence: 0,
          triggering_controller: 0,
          triggering_location: 4,
          triggering_sequence: 0,
          description: 560n,
        },
      ],
    });

    assert.equal(normalized.flags, 7);
    assert.deepEqual(normalized.players[0].monsters, [
      {
        player: 0,
        location: "MONSTERZONE",
        index: 0,
        position: "FaceUpAttack",
        materials: 2,
      },
      null,
    ]);
    assert.deepEqual(normalized.players[0].spells, [
      {
        player: 0,
        location: "SPELLZONE",
        index: 0,
        position: "FaceDown",
        materials: 0,
      },
    ]);
    assert.deepEqual(normalized.players[0].deck, [
      { player: 0, location: "DECK", index: 0, position: "FaceDown", id: "unknown" },
      { player: 0, location: "DECK", index: 1, position: "FaceDown", id: "unknown" },
    ]);
    assert.deepEqual(normalized.players[0].extra, [
      { player: 0, location: "EXTRA", index: 0, position: "FaceDown", id: "unknown" },
      { player: 0, location: "EXTRA", index: 1, position: "FaceUp", id: "unknown" },
    ]);
    assert.deepEqual(normalized.players[1].banished, [
      { player: 1, location: "BANISHED", index: 0, position: "FaceUp", id: "unknown" },
    ]);
    assert.deepEqual(normalized.chain, [
      {
        index: 0,
        id: 1001,
        card: {
          player: 0,
          location: "MONSTERZONE",
          index: 0,
        },
        triggering_controller: 0,
        triggering_location: "MONSTERZONE",
        triggering_sequence: 0,
        description: "560",
        description_text: "Select",
      },
    ]);
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("hydrateReloadFieldOverlayCards adds material identities to reload snapshots via duelQuery", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        RELOAD_FIELD: 212,
      },
      OcgQueryFlags: {
        OVERLAY_CARD: 0x10000,
      },
    });

    const calls = [];
    const hydrated = controllerCore.__testHooks.hydrateReloadFieldOverlayCardsForTest({
      type: 212,
      players: [
        {
          monsters: [
            {
              player: 0,
              location: "MONSTERZONE",
              index: 0,
              position: "FaceUpAttack",
              materials: 2,
            },
            null,
          ],
          spells: [
            {
              player: 0,
              location: "SPELLZONE",
              index: 0,
              position: "FaceDown",
              materials: 1,
            },
          ],
        },
        {
          monsters: [],
          spells: [],
        },
      ],
    }, {
      pduel: { id: "duel-handle" },
      ocgapi: {
        duelQuery(handle, query) {
          calls.push({ handle, query });
          if (query.location === 4 && query.sequence === 0) {
            return {
              overlayCards: [36553319, 62957424],
            };
          }
          if (query.location === 8 && query.sequence === 0) {
            return {
              overlayCards: [83531441],
            };
          }
          return {};
        },
      },
    });

    assert.deepEqual(hydrated.players[0].monsters[0], {
      player: 0,
      location: "MONSTERZONE",
      index: 0,
      position: "FaceUpAttack",
      materials: 2,
      overlay_cards: [36553319, 62957424],
    });
    assert.deepEqual(hydrated.players[0].spells[0], {
      player: 0,
      location: "SPELLZONE",
      index: 0,
      position: "FaceDown",
      materials: 1,
      overlay_cards: [83531441],
    });
    assert.deepEqual(calls, [
      {
        handle: { id: "duel-handle" },
        query: {
          flags: 0x10000,
          controller: 0,
          location: 4,
          sequence: 0,
          overlaySequence: 0,
        },
      },
      {
        handle: { id: "duel-handle" },
        query: {
          flags: 0x10000,
          controller: 0,
          location: 8,
          sequence: 0,
          overlaySequence: 0,
        },
      },
    ]);
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("hydrateIdleExtraField adds an ocgcore extra snapshot to idle questions and strips it for observers", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        SELECT_IDLECMD: 11,
      },
      OcgQueryFlags: {
        CODE: 0x1,
        POSITION: 0x2,
        IS_PUBLIC: 0x100000,
      },
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_DEFENSE: 8,
        FACEUP: 16,
        FACEDOWN: 32,
      },
    });

    const calls = [];
    const hydrated = controllerCore.__testHooks.hydrateIdleExtraFieldForTest({
      type: 11,
      player: 0,
      special_summons: [
        { code: 2002, controller: 0, location: 64, sequence: 1 },
      ],
    }, {
      pduel: { id: "duel-handle" },
      ocgapi: {
        duelQueryLocation(handle, query) {
          calls.push({ handle, query });
          return [
            { code: 2001, position: 8, isPublic: false },
            { code: 2002, position: 1, isPublic: true },
          ];
        },
      },
    });

    assert.deepEqual(hydrated.field, [
      {
        EXTRA: [
          { player: 0, location: "EXTRA", index: 0, position: "FaceDown", id: 2001, isPublic: false },
          { player: 0, location: "EXTRA", index: 1, position: "FaceUp", id: 2002, isPublic: true },
        ],
      },
      {},
    ]);
    assert.deepEqual(calls, [
      {
        handle: { id: "duel-handle" },
        query: {
          flags: 0x1 | 0x2 | 0x100000,
          controller: 0,
          location: 0x40,
        },
      },
    ]);
    assert.deepEqual(
      controllerCore.__testHooks.stripPrivateIdleFieldForTest(hydrated),
      {
        type: 11,
        player: 0,
        special_summons: [
          { code: 2002, controller: 0, location: 64, sequence: 1 },
        ],
      },
    );
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("dispatchCoreMessage returns WAIT_FOR_RESPONSE for interactive idle prompts and strips private field data for observers", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        WAITING: 3,
        SELECT_BATTLECMD: 10,
        SELECT_IDLECMD: 11,
        SELECT_UNSELECT_CARD: 26,
        ANNOUNCE_ATTRIB: 141,
        ANNOUNCE_RACE: 140,
        ANNOUNCE_CARD: 142,
        ANNOUNCE_NUMBER: 143,
        ROCK_PAPER_SCISSORS: 132,
      },
    });

    const sent = [];
    const game = {
      pduel: { id: "duel-handle" },
      pendingQuestionType: null,
      awaitingInteractiveResponse: false,
      ocgapi: {},
      last(player) {
        this.lastPlayer = player;
      },
      sendBufferToPlayer(player, message) {
        sent.push({ player, message });
      },
      reSendToPlayer(player) {
        sent.push({ resend: player });
      },
      sendToObservers(message) {
        sent.push({ observer: message });
      },
    };

    const result = controllerCore.__testHooks.dispatchCoreMessageForTest(game, {
      type: 11,
      player: 0,
      field: [{ location: "EXTRA", player: 0, index: 0, id: 1234 }],
      battle: [],
      activatable_cards: [],
      summonable_cards: [],
      sp_summon: [],
      repositionable_cards: [],
      msetable_cards: [],
      ssetable_cards: [],
      to_bp: false,
      to_ep: false,
      to_m2: false,
    });

    assert.equal(
      result,
      controllerCore.__testHooks.ControllerProcessResult.WAIT_FOR_RESPONSE,
    );
    assert.equal(game.pendingQuestionType, 11);
    assert.equal(game.awaitingInteractiveResponse, true);
    assert.deepEqual(game.activePrompt, {
      player: 0,
      messageType: 11,
      command: 11,
      rawMessage: {
        type: 11,
        player: 0,
        field: [{ location: "EXTRA", player: 0, index: 0, id: 1234 }],
        battle: [],
        activatable_cards: [],
        summonable_cards: [],
        sp_summon: [],
        repositionable_cards: [],
        msetable_cards: [],
        ssetable_cards: [],
        to_bp: false,
        to_ep: false,
        to_m2: false,
      },
      normalizedMessage: {
        type: 11,
        player: 0,
        field: [{ location: "EXTRA", player: 0, index: 0, id: 1234 }],
        battle: [],
        activatable_cards: [],
        summonable_cards: [],
        sp_summon: [],
        repositionable_cards: [],
        msetable_cards: [],
        ssetable_cards: [],
        to_bp: false,
        to_ep: false,
        to_m2: false,
      },
      retryCount: 0,
    });
    assert.equal(
      sent.filter(
        (entry) =>
          entry.player === 1 &&
          entry.message?.type === 3,
      ).length,
      1,
    );
    assert.equal(
      sent.filter(
        (entry) =>
          entry.player === 0 &&
          entry.message?.duelAction === "announcement" &&
          entry.message?.message?.command === "MSG_OPPONENT_TURN",
      ).length,
      1,
    );
    assert.equal(
      sent.filter(
        (entry) =>
          entry.player === 1 &&
          entry.message?.duelAction === "announcement" &&
          entry.message?.message?.command === "MSG_OPPONENT_TURN",
      ).length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 0 && entry.message?.type === 11)
        .length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 1 && entry.message?.type === 11)
        .length,
      0,
    );
    assert.deepEqual(
      sent.find((entry) => Object.prototype.hasOwnProperty.call(entry, "observer"))
        ?.observer,
      {
        type: 11,
        player: 0,
        battle: [],
        activatable_cards: [],
        summonable_cards: [],
        sp_summon: [],
        repositionable_cards: [],
        msetable_cards: [],
        ssetable_cards: [],
        to_bp: false,
        to_ep: false,
        to_m2: false,
      },
    );
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("Responser.write consumes activePrompt state for numeric answers and resumes mainProcess", async () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        WAITING: 3,
        ANNOUNCE_NUMBER: 143,
      },
      OcgProcessResult: {
        WAITING: 0,
        END: 1,
      },
      OcgResponseType: {
        ANNOUNCE_NUMBER: "ANNOUNCE_NUMBER",
      },
    });

    const duelSetResponseCalls = [];
    let duelProcessCount = 0;
    const game = {
      pduel: { id: "duel-handle" },
      pendingQuestionType: null,
      activePrompt: {
        player: 0,
        messageType: 143,
        command: 143,
        rawMessage: { type: 143, player: 0 },
        normalizedMessage: { type: 143, player: 0 },
        retryCount: 0,
      },
      awaitingInteractiveResponse: true,
      bufferedMessages: [],
      mainProcessPromise: null,
      ocgapi: {
        duelSetResponse(_handle, response) {
          duelSetResponseCalls.push(response);
        },
        async duelProcess() {
          duelProcessCount += 1;
          return 0;
        },
        duelGetMessage() {
          return [];
        },
      },
      last(player) {
        this.lastPlayer = player;
      },
      sendBufferToPlayer() {},
      reSendToPlayer() {},
      sendToObservers() {},
    };

    const responder = controllerCore.__testHooks.createResponserForTest(game, 0);
    await responder.write(7);

    assert.deepEqual(duelSetResponseCalls, [
      {
        type: "ANNOUNCE_NUMBER",
        value: 7,
      },
    ]);
    assert.equal(duelProcessCount, 1);
    assert.equal(game.activePrompt, null);
    assert.equal(game.awaitingInteractiveResponse, false);
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("Responser.write ignores answers from the wrong player while an activePrompt exists", async () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        WAITING: 3,
        ANNOUNCE_NUMBER: 143,
      },
      OcgResponseType: {
        ANNOUNCE_NUMBER: "ANNOUNCE_NUMBER",
      },
    });

    const duelSetResponseCalls = [];
    const game = {
      pduel: { id: "duel-handle" },
      pendingQuestionType: null,
      activePrompt: {
        player: 0,
        messageType: 143,
        command: 143,
        rawMessage: { type: 143, player: 0 },
        normalizedMessage: { type: 143, player: 0 },
        retryCount: 0,
      },
      awaitingInteractiveResponse: true,
      bufferedMessages: [],
      mainProcessPromise: null,
      ocgapi: {
        duelSetResponse(_handle, response) {
          duelSetResponseCalls.push(response);
        },
      },
      last(player) {
        this.lastPlayer = player;
      },
      sendBufferToPlayer() {},
      reSendToPlayer() {},
      sendToObservers() {},
    };

    const responder = controllerCore.__testHooks.createResponserForTest(game, 1);
    await responder.write(7);

    assert.deepEqual(duelSetResponseCalls, []);
    assert.deepEqual(game.activePrompt, {
      player: 0,
      messageType: 143,
      command: 143,
      rawMessage: { type: 143, player: 0 },
      normalizedMessage: { type: 143, player: 0 },
      retryCount: 0,
    });
    assert.equal(game.awaitingInteractiveResponse, true);
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("dispatchCoreMessage reopens the last prompt when ocgcore emits MSG_RETRY", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        RETRY: 1,
        WAITING: 3,
        SELECT_BATTLECMD: 10,
        SELECT_CHAIN: 16,
        SELECT_UNSELECT_CARD: 26,
        ANNOUNCE_ATTRIB: 141,
        ANNOUNCE_RACE: 140,
        ANNOUNCE_CARD: 142,
        ANNOUNCE_NUMBER: 143,
        ROCK_PAPER_SCISSORS: 132,
      },
    });

    const sent = [];
    const game = {
      pduel: { id: "duel-handle" },
      pendingQuestionType: null,
      activePrompt: null,
      lastPrompt: {
        player: 0,
        messageType: 16,
        command: 16,
        rawMessage: {
          type: 16,
          player: 0,
          count: 0,
          specount: 0,
          forced: false,
        },
        normalizedMessage: {
          type: 16,
          player: 0,
          count: 0,
          specount: 0,
          forced: false,
        },
        retryCount: 0,
      },
      awaitingInteractiveResponse: false,
      timeLimitSeconds: 300,
      ocgapi: {},
      last(player) {
        this.lastPlayer = player;
      },
      sendBufferToPlayer(player, message) {
        sent.push({ player, message });
      },
      reSendToPlayer(player) {
        sent.push({ resend: player });
      },
      sendToObservers(message) {
        sent.push({ observer: message });
      },
    };

    const result = controllerCore.__testHooks.dispatchCoreMessageForTest(game, {
      type: 1,
    });

    assert.equal(
      result,
      controllerCore.__testHooks.ControllerProcessResult.WAIT_FOR_RESPONSE,
    );
    assert.equal(game.awaitingInteractiveResponse, true);
    assert.equal(game.pendingQuestionType, 16);
    assert.equal(game.activePrompt?.player, 0);
    assert.equal(game.activePrompt?.messageType, 16);
    assert.equal(game.activePrompt?.retryCount, 1);
    assert.equal(game.lastPrompt?.retryCount, 1);
    assert.equal(
      sent.filter((entry) => entry.player === 1 && entry.message?.type === 3)
        .length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 0 && entry.message?.type === 16)
        .length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 0 && entry.message?.retry_count === 1)
        .length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 1 && entry.message?.type === 16)
        .length,
      0,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 0 && entry.message?.type === 1)
        .length,
      0,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 1 && entry.message?.type === 1)
        .length,
      0,
    );
    assert.equal(
      sent.find((entry) => Object.prototype.hasOwnProperty.call(entry, "observer"))
        ?.observer?.retry_count,
      1,
    );
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("makeGame reSendToPlayer replays active prompt state instead of stale lastMessage", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        WAITING: 3,
      },
    });

    const player0 = [];
    const player1 = [];
    const live = controllerCore.__testHooks.makeGameForTest(
      { id: "duel-handle" },
      { startingLP: 8000, timeLimitSeconds: 0 },
      {
        query_field_count() {
          return 0;
        },
      },
    );

    live.setPlayers(
      [
        { write(message) { player0.push(message); } },
        { write(message) { player1.push(message); } },
      ],
      { write() {} },
    );

    live.sendBufferToPlayer(0, { type: 999, id: "stale" });
    live.activePrompt = {
      player: 0,
      messageType: 16,
      command: 16,
      rawMessage: { type: 16, player: 0 },
      normalizedMessage: { type: 16, player: 0, count: 0, specount: 0 },
      retryCount: 2,
    };

    live.reSendToPlayer(0);
    live.reSendToPlayer(1);

    assert.deepEqual(player0.at(-1), {
      type: 16,
      player: 0,
      count: 0,
      specount: 0,
      retry_count: 2,
    });
    assert.deepEqual(player1.at(-1), {
      type: 3,
      time: 0,
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("makeGame sendToObservers replays sanitized active prompt state instead of stale lastMessage", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        SELECT_IDLECMD: 11,
      },
    });

    const observerMessages = [];
    const live = controllerCore.__testHooks.makeGameForTest(
      { id: "duel-handle" },
      { startingLP: 8000, timeLimitSeconds: 0 },
      {
        query_field_count() {
          return 0;
        },
      },
    );

    live.setPlayers(
      [
        { write() {} },
        { write() {} },
      ],
      {
        write(message) {
          observerMessages.push(message);
        },
      },
    );

    live.sendBufferToPlayer(0, { type: 999, id: "stale" });
    live.activePrompt = {
      player: 0,
      messageType: 11,
      command: 11,
      rawMessage: {
        type: 11,
        player: 0,
        field: [{ location: "EXTRA", player: 0, index: 0, id: 1234 }],
        battle: [],
      },
      normalizedMessage: {
        type: 11,
        player: 0,
        field: [{ location: "EXTRA", player: 0, index: 0, id: 1234 }],
        battle: [],
      },
      retryCount: 1,
    };

    live.sendToObservers();

    assert.deepEqual(observerMessages.at(-1), {
      type: 11,
      player: 0,
      battle: [],
      retry_count: 1,
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("Responser.write reopens the last prompt when the next core batch contains MSG_RETRY", async () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        RETRY: 1,
        WAITING: 3,
        ANNOUNCE_NUMBER: 143,
      },
      OcgProcessResult: {
        WAITING: 0,
        END: 1,
      },
      OcgResponseType: {
        ANNOUNCE_NUMBER: "ANNOUNCE_NUMBER",
      },
    });

    const duelSetResponseCalls = [];
    const sent = [];
    let duelProcessCount = 0;
    const game = {
      pduel: { id: "duel-handle" },
      pendingQuestionType: null,
      activePrompt: {
        player: 0,
        messageType: 143,
        command: 143,
        rawMessage: {
          type: 143,
          player: 0,
          announcement_values: [3, 4, 5],
          options: [],
          values: [],
        },
        normalizedMessage: {
          type: 143,
          player: 0,
          announcement_values: [3, 4, 5],
          options: [],
          values: [],
        },
        retryCount: 0,
      },
      lastPrompt: {
        player: 0,
        messageType: 143,
        command: 143,
        rawMessage: {
          type: 143,
          player: 0,
          announcement_values: [3, 4, 5],
          options: [],
          values: [],
        },
        normalizedMessage: {
          type: 143,
          player: 0,
          announcement_values: [3, 4, 5],
          options: [],
          values: [],
        },
        retryCount: 0,
      },
      awaitingInteractiveResponse: true,
      bufferedMessages: [],
      mainProcessPromise: null,
      timeLimitSeconds: 300,
      ocgapi: {
        duelSetResponse(_handle, response) {
          duelSetResponseCalls.push(response);
        },
        async duelProcess() {
          duelProcessCount += 1;
          return 0;
        },
        duelGetMessage() {
          return [{ type: 1 }];
        },
      },
      last(player) {
        this.lastPlayer = player;
      },
      sendBufferToPlayer(player, message) {
        sent.push({ player, message });
      },
      reSendToPlayer(player) {
        sent.push({ resend: player });
      },
      sendToObservers(message) {
        sent.push({ observer: message });
      },
    };

    const responder = controllerCore.__testHooks.createResponserForTest(game, 0);
    await responder.write(7);

    assert.deepEqual(duelSetResponseCalls, [
      {
        type: "ANNOUNCE_NUMBER",
        value: 7,
      },
    ]);
    assert.equal(duelProcessCount, 1);
    assert.equal(game.awaitingInteractiveResponse, true);
    assert.equal(game.activePrompt?.messageType, 143);
    assert.equal(game.activePrompt?.retryCount, 1);
    assert.equal(
      sent.filter((entry) => entry.player === 1 && entry.message?.type === 3)
        .length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 0 && entry.message?.type === 143)
        .length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 0 && entry.message?.retry_count === 1)
        .length,
      1,
    );
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("dispatchCoreMessage returns CONTINUE for non-interactive player messages", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        SELECT_BATTLECMD: 10,
        SELECT_UNSELECT_CARD: 26,
        ANNOUNCE_ATTRIB: 141,
        ANNOUNCE_RACE: 140,
        ANNOUNCE_CARD: 142,
        ANNOUNCE_NUMBER: 143,
        ROCK_PAPER_SCISSORS: 132,
        WIN: 5,
      },
    });

    const sent = [];
    const game = {
      pduel: { id: "duel-handle" },
      pendingQuestionType: null,
      awaitingInteractiveResponse: false,
      ocgapi: {},
      last(player) {
        this.lastPlayer = player;
      },
      sendBufferToPlayer(player, message) {
        sent.push({ player, message });
      },
      reSendToPlayer(player) {
        sent.push({ resend: player });
      },
      sendToObservers(message) {
        sent.push({ observer: message });
      },
    };

    const result = controllerCore.__testHooks.dispatchCoreMessageForTest(game, {
      type: 70,
      player: 0,
      id: 4242,
    });

    assert.equal(
      result,
      controllerCore.__testHooks.ControllerProcessResult.CONTINUE,
    );
    assert.equal(game.awaitingInteractiveResponse, false);
    assert.equal(
      sent.filter((entry) => entry.player === 0 && entry.message?.type === 70)
        .length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.resend === 1).length,
      1,
    );
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("mainProcess does not re-enter duelProcess while an interactive question is pending", async () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        WAITING: 3,
        SELECT_BATTLECMD: 10,
        SELECT_UNSELECT_CARD: 26,
        ANNOUNCE_NUMBER: 143,
      },
      OcgProcessResult: {
        WAITING: 0,
        END: 1,
      },
    });

    let duelProcessCount = 0;
    const sent = [];
    const game = {
      pduel: { id: "duel-handle" },
      pendingQuestionType: null,
      awaitingInteractiveResponse: false,
      ocgapi: {
        async duelProcess() {
          duelProcessCount += 1;
          await new Promise((resolve) => setTimeout(resolve, 10));
          return 0;
        },
        duelGetMessage() {
          return [
            {
              type: 143,
              player: 0,
              announcement_values: [3, 4, 5],
            },
          ];
        },
      },
      last(player) {
        this.lastPlayer = player;
      },
      sendBufferToPlayer(player, message) {
        sent.push({ player, message });
      },
      reSendToPlayer(player) {
        sent.push({ resend: player });
      },
      sendToObservers(message) {
        sent.push({ observer: message });
      },
    };

    await Promise.all([
      controllerCore.__testHooks.mainProcessForTest(game),
      controllerCore.__testHooks.mainProcessForTest(game),
    ]);

    assert.equal(duelProcessCount, 1);
    assert.equal(game.awaitingInteractiveResponse, true);
    assert.equal(game.pendingQuestionType, 143);
    assert.equal(
      sent.filter((entry) => entry.player === 1 && entry.message?.type === 3)
        .length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 0 && entry.message?.type === 143)
        .length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 1 && entry.message?.type === 143)
        .length,
      0,
    );

    const sentCount = sent.length;
    await controllerCore.__testHooks.mainProcessForTest(game);

    assert.equal(duelProcessCount, 1);
    assert.equal(sent.length, sentCount);
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("mainProcess buffers later messages after the first interactive prompt in a batch", async () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        WAITING: 3,
        SELECT_BATTLECMD: 10,
        SELECT_CHAIN: 16,
        SELECT_UNSELECT_CARD: 26,
      },
      OcgProcessResult: {
        WAITING: 0,
        END: 1,
      },
    });

    let duelProcessCount = 0;
    const sent = [];
    const game = {
      pduel: { id: "duel-handle" },
      pendingQuestionType: null,
      awaitingInteractiveResponse: false,
      bufferedMessages: [],
      ocgapi: {
        async duelProcess() {
          duelProcessCount += 1;
          return 0;
        },
        duelGetMessage() {
          return [
            {
              type: 16,
              player: 0,
              count: 1,
              specount: 1,
              forced: false,
            },
            {
              type: 16,
              player: 1,
              count: 0,
              specount: 0,
              forced: false,
            },
          ];
        },
      },
      last(player) {
        this.lastPlayer = player;
      },
      sendBufferToPlayer(player, message) {
        sent.push({ player, message });
      },
      reSendToPlayer(player) {
        sent.push({ resend: player });
      },
      sendToObservers(message) {
        sent.push({ observer: message });
      },
    };

    await controllerCore.__testHooks.mainProcessForTest(game);

    assert.equal(duelProcessCount, 1);
    assert.equal(game.awaitingInteractiveResponse, true);
    assert.deepEqual(game.bufferedMessages, [
      {
        type: 16,
        player: 1,
        count: 0,
        specount: 0,
        forced: false,
      },
    ]);
    assert.equal(
      sent.filter((entry) => entry.player === 1 && entry.message?.type === 3)
        .length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 0 && entry.message?.type === 16).length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 1 && entry.message?.type === 16).length,
      0,
    );

    game.awaitingInteractiveResponse = false;
    await controllerCore.__testHooks.mainProcessForTest(game);

    assert.equal(duelProcessCount, 1);
    assert.equal(game.awaitingInteractiveResponse, true);
    assert.equal(Array.isArray(game.bufferedMessages) ? game.bufferedMessages.length : 0, 0);
    assert.equal(
      sent.filter((entry) => entry.player === 0 && entry.message?.type === 3)
        .length,
      1,
    );
    assert.equal(
      sent.filter((entry) => entry.player === 1 && entry.message?.type === 16).length,
      1,
    );
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage converts tag-swap into browser-safe deck, hand, and extra piles", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        TAG_SWAP: 161,
      },
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
        FACEUP: 16,
        FACEDOWN: 32,
        ATTACK: 64,
        DEFENSE: 128,
      },
    });

    const normalized = controllerCore.normalizeMessage({
      type: 161,
      player: 1,
      deck_size: 3,
      extra_faceup_count: 1,
      deck_top_card: 4001,
      hand: [
        { code: 1001, position: 16 },
        { code: 1002, position: 16 },
      ],
      extra: [
        { code: 2001, position: 8 },
        { code: 2002, position: 1 },
      ],
    });

    assert.deepEqual(normalized, {
      type: 161,
      player: 1,
      deck_size: 3,
      extra_faceup_count: 1,
      deck_top_card: 4001,
      hand: [
        { player: 1, location: "HAND", index: 0, position: "FaceUp", id: 1001 },
        { player: 1, location: "HAND", index: 1, position: "FaceUp", id: 1002 },
      ],
      extra: [
        { player: 1, location: "EXTRA", index: 0, position: "FaceDown", id: 2001 },
        { player: 1, location: "EXTRA", index: 1, position: "FaceUp", id: 2002 },
      ],
      deck: [
        { player: 1, location: "DECK", index: 0, position: "FaceDown", id: "unknown" },
        { player: 1, location: "DECK", index: 1, position: "FaceDown", id: "unknown" },
        { player: 1, location: "DECK", index: 2, position: "FaceDown", id: 4001 },
      ],
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});

test("normalizeMessage converts AI_NAME, SHOW_HINT, MATCH_KILL, and CUSTOM_MSG into browser-safe auxiliary payloads", () => {
  const controllerCore = loadControllerCore();

  try {
    controllerCore.__testHooks.setOcgBindingsForTest({
      OcgMessageType: {
        AI_NAME: 163,
        SHOW_HINT: 164,
        MATCH_KILL: 170,
        CUSTOM_MSG: 180,
      },
    });

    const normalizedAiName = controllerCore.normalizeMessage({
      type: 163,
      name: "Yugi Bot",
    });
    const normalizedShowHint = controllerCore.normalizeMessage({
      type: 164,
      hint: "A duel script says hello",
    });
    const normalizedMatchKill = controllerCore.normalizeMessage({
      type: 170,
      card: 44508094,
    });
    const normalizedCustom = controllerCore.normalizeMessage({
      type: 180,
    });

    assert.deepEqual(normalizedAiName, {
      type: 163,
      name: "Yugi Bot",
      ai_name: "Yugi Bot",
      opponent_name: "Yugi Bot",
      text: "Yugi Bot",
    });
    assert.deepEqual(normalizedShowHint, {
      type: 164,
      hint: "A duel script says hello",
      text: "A duel script says hello",
    });
    assert.deepEqual(normalizedMatchKill, {
      type: 170,
      card: 44508094,
      id: 44508094,
      card_name: "Stardust Dragon",
      text: "Match kill active: Stardust Dragon",
    });
    assert.deepEqual(normalizedCustom, {
      type: 180,
      text: "Custom duel message received.",
    });
  } finally {
    delete require.cache[controllerCoreModulePath];
  }
});
// Run with: npm run test:unit
