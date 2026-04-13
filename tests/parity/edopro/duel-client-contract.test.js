import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import {
  applyCounterAllocation,
  buildSelectOptionChoices,
  buildZoneSelectionQuery,
  canUseZoneSelectorsForCards,
  getRevealCards,
  getZoneSelectionCard,
  resolveAnnouncementContract,
  resolveCommandAnswer,
  resolveDuelMessageName,
  toggleOrderedRevealSelection,
  default as startGame
} from "../../../server/ui/services/game.service.js";
import {
  getPileActionEntries,
  commandOptionMatchesQuery
} from "../../../server/ui/components/duel/controls.component.jsx";
import {
  ANNOUNCE_CARD_OPCODE,
  buildAnnounceCardChoices,
  cardMatchesAnnounceOpcode
} from "../../../server/ui/services/announce-card.service.js";
import { resolveChainDecision } from "../../../server/ui/components/duel/chain.component.jsx";

async function flush(ms = 0) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(predicate, timeoutMs = 250, intervalMs = 10) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = predicate();
    if (result) {
      return result;
    }
    await flush(intervalMs);
  }

  return predicate();
}

async function clickActionButton(label, timeoutMs = 250) {
  const button = await waitFor(() =>
    Array.from(document.querySelectorAll("#actions button"))
      .find((node) => node.textContent?.trim() === label), timeoutMs);

  assert.ok(button, `Expected action button "${label}" to be visible`);
  button.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await flush(30);
  return button;
}

function installDom(html = "<!doctype html><html><body><main id=\"main\"></main></body></html>") {
  const dom = new JSDOM(html, {
    url: "http://localhost/ygopro?room=12345"
  });
  const previousGlobals = {
    window: globalThis.window,
    document: globalThis.document,
    navigator: globalThis.navigator,
    HTMLElement: globalThis.HTMLElement,
    Node: globalThis.Node,
    Event: globalThis.Event,
    MessageEvent: globalThis.MessageEvent,
    MouseEvent: globalThis.MouseEvent,
    CustomEvent: globalThis.CustomEvent,
    FormData: globalThis.FormData,
    localStorage: globalThis.localStorage,
    fetch: globalThis.fetch,
    WebSocket: globalThis.WebSocket,
    Audio: globalThis.Audio,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    cancelAnimationFrame: globalThis.cancelAnimationFrame,
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT
  };

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.MessageEvent = dom.window.MessageEvent;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.FormData = dom.window.FormData;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  globalThis.cancelAnimationFrame = (handle) => clearTimeout(handle);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  return {
    dom,
    restore() {
      dom.window.close();
      globalThis.window = previousGlobals.window;
      globalThis.document = previousGlobals.document;
      globalThis.navigator = previousGlobals.navigator;
      globalThis.HTMLElement = previousGlobals.HTMLElement;
      globalThis.Node = previousGlobals.Node;
      globalThis.Event = previousGlobals.Event;
      globalThis.MessageEvent = previousGlobals.MessageEvent;
      globalThis.MouseEvent = previousGlobals.MouseEvent;
      globalThis.CustomEvent = previousGlobals.CustomEvent;
      globalThis.FormData = previousGlobals.FormData;
      globalThis.localStorage = previousGlobals.localStorage;
      globalThis.fetch = previousGlobals.fetch;
      globalThis.WebSocket = previousGlobals.WebSocket;
      globalThis.Audio = previousGlobals.Audio;
      globalThis.requestAnimationFrame = previousGlobals.requestAnimationFrame;
      globalThis.cancelAnimationFrame = previousGlobals.cancelAnimationFrame;
      globalThis.IS_REACT_ACT_ENVIRONMENT = previousGlobals.IS_REACT_ACT_ENVIRONMENT;
    }
  };
}

test("resolveDuelMessageName resolves duelclient-style message names", () => {
  assert.equal(resolveDuelMessageName({ command: "MSG_SELECT_IDLECMD" }, ""), "MSG_SELECT_IDLECMD");
  assert.equal(resolveDuelMessageName({ type: "MSG_SELECT_CHAIN" }, ""), "MSG_SELECT_CHAIN");
  assert.equal(resolveDuelMessageName({ type: 33 }, ""), "MSG_SHUFFLE_HAND");
  assert.equal(resolveDuelMessageName({ type: 14 }, ""), "MSG_SELECT_OPTION");
  assert.equal(resolveDuelMessageName({ type: 22 }, ""), "MSG_SELECT_COUNTER");
  assert.equal(resolveDuelMessageName({ type: 25 }, ""), "MSG_SORT_CARD");
  assert.equal(
    resolveDuelMessageName({ command: "MSG_SELECT_BATTLECMD", type: "MSG_SELECT_CHAIN" }, "MSG_FALLBACK"),
    "MSG_FALLBACK"
  );
  assert.equal(resolveDuelMessageName({ type: 999 }, "MSG_FALLBACK"), "MSG_FALLBACK");
  assert.equal(resolveDuelMessageName({}, ""), undefined);
  assert.equal(resolveDuelMessageName(undefined, undefined), undefined);
});

test("resolveCommandAnswer maps a card to the matching command family", () => {
  const options = {
    summons: [{ index: 2, location: "MONSTERZONE", player: 0, id: "summon-a" }],
    attacks: [{ index: 4, location: "MONSTERZONE", player: 1, id: "attack-b" }],
    select_options: [{ index: 1, location: "MONSTERZONE", player: 0, id: "zone-c" }]
  };

  assert.deepEqual(
    resolveCommandAnswer({ index: 2, location: "MONSTERZONE", player: 0 }, options),
    { type: "summons", i: 0 }
  );
  assert.deepEqual(
    resolveCommandAnswer({ index: 4, location: "MONSTERZONE", player: 1 }, options),
    { type: "attacks", i: 0 }
  );
  assert.deepEqual(
    resolveCommandAnswer({ index: 1, location: "MONSTERZONE", player: 0 }, options),
    { type: "select_options", i: 0 }
  );
  assert.deepEqual(
    resolveCommandAnswer({ type: "number", i: 7 }, options),
    { type: "number", i: 7 }
  );
});

test("zone selection helpers build and resolve the correct payload", () => {
  const cards = [
    { player: 0, location: "MONSTERZONE", index: 0, i: 0, id: "m-0" },
    { player: 1, location: "SPELLZONE", index: 2, i: 1, id: "s-2" }
  ];

  assert.equal(canUseZoneSelectorsForCards(cards), true);
  assert.equal(canUseZoneSelectorsForCards([{ player: 0, location: "HAND" }]), false);
  assert.deepEqual(buildZoneSelectionQuery(cards), {
    zones: [
      { player: 0, location: "MONSTERZONE", index: 0 },
      { player: 1, location: "SPELLZONE", index: 2 }
    ]
  });
  assert.strictEqual(getZoneSelectionCard(cards, { i: [1, 8, 2] }), cards[1]);
  assert.equal(getZoneSelectionCard(cards, { i: [0, 4, 99] }), undefined);
  assert.deepEqual(getRevealCards({ select_options: cards }), cards);
  assert.deepEqual(getRevealCards({ selectable_targets: cards.slice(1) }), cards.slice(1));
  assert.deepEqual(getRevealCards({}), []);
  assert.equal(getZoneSelectionCard(null, { i: [0, 4, 0] }), null);
  assert.equal(getZoneSelectionCard(cards, null), null);
});

test("option, sort, and counter helpers preserve duelclient-style interaction state", () => {
  assert.deepEqual(
    buildSelectOptionChoices([{ i: 0, value: "560" }, { i: 1, value: "1001" }], [
      { id: 1001, name: "Graff, Malebranche of the Burning Abyss" }
    ], {
      system: { "560": "Select a card" }
    }),
    [
      { i: 0, value: "560", label: "Select a card" },
      { i: 1, value: "1001", label: "Graff, Malebranche of the Burning Abyss" }
    ]
  );
  assert.deepEqual(toggleOrderedRevealSelection([], 2), [2]);
  assert.deepEqual(toggleOrderedRevealSelection([2, 0], 2), [0]);
  assert.deepEqual(toggleOrderedRevealSelection([2, 0], 1), [2, 0, 1]);
  assert.deepEqual(
    applyCounterAllocation([0, 0], [{ count: 2 }, { count: 1 }], 3, 0, 1),
    [1, 0]
  );
  assert.deepEqual(
    applyCounterAllocation([2, 0], [{ count: 2 }, { count: 1 }], 3, 0, 1),
    [2, 0]
  );
  assert.deepEqual(
    applyCounterAllocation([1, 1], [{ count: 2 }, { count: 2 }], 3, 1, -1),
    [1, 0]
  );
});

test("announce-card helpers filter the browser database using duelclient-style opcodes", () => {
  const database = [
    { id: 1001, alias: 0, setcode: 0, type: 1, race: 8, attribute: 32, name: "Graff, Malebranche of the Burning Abyss" },
    { id: 2001, alias: 0, setcode: 0, type: 2, race: 0, attribute: 0, name: "Fire Lake of the Burning Abyss" }
  ];

  assert.equal(
    cardMatchesAnnounceOpcode(database[0], [1, ANNOUNCE_CARD_OPCODE.ISTYPE]),
    true
  );
  assert.equal(
    cardMatchesAnnounceOpcode(database[1], [1, ANNOUNCE_CARD_OPCODE.ISTYPE]),
    false
  );
  assert.deepEqual(
    buildAnnounceCardChoices(database, [1001, ANNOUNCE_CARD_OPCODE.ISCODE], ""),
    [{
      id: 1001,
      label: "Graff, Malebranche of the Burning Abyss (1001)",
      name: "Graff, Malebranche of the Burning Abyss",
      code: 1001
    }]
  );
});

test("resolveChainDecision mirrors duelclient chain mode policy", () => {
  assert.deepEqual(
    resolveChainDecision(
      { select_trigger: false, forced: false, count: 1, specount: 0 },
      { autochain: false, waitchain: false },
      "neutral"
    ),
    { type: "decline", delayMs: 0 }
  );
  assert.deepEqual(
    resolveChainDecision(
      { select_trigger: false, forced: false, count: 1, specount: 0 },
      { autochain: false, waitchain: false },
      "always"
    ),
    { type: "manual", delayMs: 0 }
  );
  assert.deepEqual(
    resolveChainDecision(
      { select_trigger: false, forced: false, count: 1, specount: 0 },
      { autochain: false, waitchain: false },
      "when_available"
    ),
    { type: "manual", delayMs: 0 }
  );
  assert.deepEqual(
    resolveChainDecision(
      { select_trigger: false, forced: false, count: 1, specount: 1 },
      { autochain: false, waitchain: true },
      "ignore"
    ),
    { type: "decline", delayMs: 0 }
  );
  assert.deepEqual(
    resolveChainDecision(
      { select_trigger: false, forced: true, count: 1, specount: 1 },
      { autochain: true, waitchain: false },
      "neutral"
    ),
    { type: "accept_first", delayMs: 0 }
  );
});

test("zone selection helpers reject invalid cards and preserve select_options precedence", () => {
  const cards = [
    { player: 0, location: "MONSTERZONE", index: 0, i: 0, id: "m-0" },
    { player: 1, location: "SPELLZONE", index: 2, i: 1, id: "s-2" }
  ];

  assert.equal(canUseZoneSelectorsForCards([]), false);
  assert.equal(canUseZoneSelectorsForCards([{ player: 0, location: "HAND", index: 0 }]), false);
  assert.equal(canUseZoneSelectorsForCards([{ player: 0, location: "MONSTERZONE", index: "0" }]), false);
  assert.deepEqual(getRevealCards({ select_options: cards, selectable_targets: cards.slice(1) }), cards);
  assert.deepEqual(getRevealCards({ selectable_targets: cards.slice(1) }), cards.slice(1));
  assert.strictEqual(getZoneSelectionCard(cards, { i: [1, 8, 2] }), cards[1]);
});

test("resolveAnnouncementContract maps attack and shuffle announcements", () => {
  const attack = resolveAnnouncementContract({
    command: "MSG_ATTACK",
    source: { code: 123, id: "atk-123" },
    target: [{ code: 456, id: "def-456" }],
    sound: "attack"
  });
  const shuffled = resolveAnnouncementContract({
    command: "MSG_SHUFFLE_HAND",
    player: 0
  }, 1);

  assert.deepEqual(attack, {
    kind: "attack",
    id: 123,
    sound: "attack",
    source: { code: 123, id: "atk-123" },
    target: [{ code: 456, id: "def-456" }]
  });
  assert.deepEqual(shuffled, {
    kind: "shuffle",
    zone: "HAND",
    player: 1
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_ORIENTATION",
    slot: 2
  }), {
    kind: "orientation",
    slot: 2
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_OPPONENT_TURN",
    active: "yes"
  }), {
    kind: "opponent_turn",
    active: true
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_WAITING"
  }), {
    kind: "waiting"
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_SHUFFLE_EXTRA",
    player: 0
  }, 1), {
    kind: "shuffle",
    zone: "EXTRA",
    player: 1
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_SHUFFLE_DECK",
    player: 0
  }, 1), {
    kind: "shuffle",
    zone: "DECK",
    player: 1
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_TAG_SWAP",
    player: 0
  }, 1), {
    kind: "tag_swap",
    player: 1,
    zones: ["DECK", "HAND", "EXTRA"]
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_TOSS_COIN",
    player: 0,
    results: [true, false]
  }, 1), {
    kind: "coin_result",
    player: 1,
    results: [true, false],
    sound: "coinflip"
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_TOSS_DICE",
    player: 0,
    results: [6, 2]
  }, 1), {
    kind: "dice_result",
    player: 1,
    results: [6, 2],
    sound: "diceroll"
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_FIELD_DISABLED",
    zones: [
      { player: 0, location: "MONSTERZONE", index: 0 },
      { player: 1, location: "SPELLZONE", index: 2 }
    ]
  }, 1), {
    kind: "field_disabled",
    zones: [
      { player: 1, location: "MONSTERZONE", index: 0 },
      { player: 0, location: "SPELLZONE", index: 2 }
    ]
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_DECK_TOP",
    id: 46986414,
    player: 0,
    offset: 0
  }), {
    kind: "pile_reveal",
    call: "deck_top",
    player: 0,
    cards: [
      {
        id: 46986414,
        player: 0,
        location: "DECK",
        index: 0
      }
    ],
    duration: 900
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_NEW_TURN",
    turn: 3
  }), {
    kind: "phase_banner",
    bannerType: "turn",
    text: "Turn 3",
    duration: 1400
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_NEW_PHASE",
    gui_phase: "BATTLE"
  }), {
    kind: "phase_banner",
    bannerType: "phase",
    text: "Battle Phase",
    duration: 1400
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_DAMAGE",
    player: 1,
    amount: 800
  }), {
    kind: "lp_delta",
    player: 1,
    value: -800,
    tone: "damage",
    duration: 1300
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_RECOVER",
    player: 0,
    amount: 500
  }), {
    kind: "lp_delta",
    player: 0,
    value: 500,
    tone: "recover",
    duration: 1300
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_HAND_RES",
    results: [2, 1]
  }), {
    kind: "rps_result",
    results: [2, 1],
    duration: 1000
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_ATTACK",
    attacker: { code: 777, id: "atk-777" },
    target: [{ code: 888, id: "def-888" }],
    sound: "attack"
  }), {
    kind: "attack",
    id: 777,
    sound: "attack",
    source: { code: 777, id: "atk-777" },
    target: [{ code: 888, id: "def-888" }]
  });
  assert.equal(resolveAnnouncementContract({
    command: "MSG_NOT_REAL"
  }), null);
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_SUMMONING",
    id: "sum-1",
    player: 0,
    location: "MONSTERZONE",
    index: 2
  }, 1), {
    kind: "flash",
    mode: "summon",
    phase: "start",
    id: "sum-1",
    source: {
      player: 1,
      location: "MONSTERZONE",
      index: 2
    },
    sound: "summon"
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_SUMMONED",
    id: "sum-1",
    player: 0,
    location: "MONSTERZONE",
    index: 2
  }, 1), {
    kind: "flash",
    mode: "summon",
    phase: "complete",
    id: "sum-1",
    source: {
      player: 1,
      location: "MONSTERZONE",
      index: 2
    },
    confirmation: true
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_SPSUMMONING",
    id: "sum-2",
    player: 1,
    location: "MONSTERZONE",
    index: 4
  }), {
    kind: "flash",
    mode: "special_summon",
    phase: "start",
    id: "sum-2",
    source: {
      player: 1,
      location: "MONSTERZONE",
      index: 4
    },
    sound: "specialsummon"
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_EQUIP",
    source: { player: 0, location: "SPELLZONE", index: 1 },
    target: { player: 1, location: "MONSTERZONE", index: 2 }
  }), {
    kind: "sound",
    sound: "equip",
    source: { player: 0, location: "SPELLZONE", index: 1 },
    target: { player: 1, location: "MONSTERZONE", index: 2 }
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_CARD_TARGET",
    source: { player: 0, location: "SPELLZONE", index: 1 },
    target: { player: 1, location: "MONSTERZONE", index: 2 }
  }), {
    kind: "target_event",
    phase: "link",
    cards: [
      { player: 0, location: "SPELLZONE", index: 1 },
      { player: 1, location: "MONSTERZONE", index: 2 }
    ],
    duration: 950
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_CANCEL_TARGET",
    source: { player: 0, location: "SPELLZONE", index: 1 },
    target: { player: 1, location: "MONSTERZONE", index: 2 }
  }), {
    kind: "target_event",
    phase: "unlink",
    cards: [
      { player: 0, location: "SPELLZONE", index: 1 },
      { player: 1, location: "MONSTERZONE", index: 2 }
    ],
    duration: 700
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_BECOME_TARGET",
    cards: [
      { player: 0, location: "MONSTERZONE", index: 1 },
      { player: 1, location: "SPELLZONE", index: 2 }
    ]
  }), {
    kind: "target_event",
    phase: "become_target",
    cards: [
      { player: 0, location: "MONSTERZONE", index: 1 },
      { player: 1, location: "SPELLZONE", index: 2 }
    ],
    duration: 950
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_CARD_SELECTED",
    cards: [
      { player: 0, location: "MONSTERZONE", index: 1 }
    ]
  }), {
    kind: "selection_event",
    phase: "card_selected",
    cards: [
      { player: 0, location: "MONSTERZONE", index: 1 }
    ],
    duration: 900
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_RANDOM_SELECTED",
    cards: [
      { player: 1, location: "SPELLZONE", index: 2 }
    ]
  }), {
    kind: "selection_event",
    phase: "random_selected",
    cards: [
      { player: 1, location: "SPELLZONE", index: 2 }
    ],
    duration: 650
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_UNEQUIP",
    source: { player: 0, location: "SPELLZONE", index: 1 }
  }), {
    kind: "selection_event",
    phase: "unequip",
    cards: [
      { player: 0, location: "SPELLZONE", index: 1 }
    ],
    duration: 650
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_ATTACK_DISABLED",
    text: "An attack was negated"
  }), {
    kind: "notice",
    text: "An attack was negated",
    duration: 1400
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_MISSED_EFFECT",
    source: { player: 1, location: "MONSTERZONE", index: 3 },
    text: "\"Burning Spear\" missed the timing"
  }), {
    kind: "selection_event",
    phase: "missed_effect",
    cards: [
      { player: 1, location: "MONSTERZONE", index: 3 }
    ],
    text: "\"Burning Spear\" missed the timing",
    duration: 1400
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_BE_CHAIN_TARGET",
    cards: [
      { player: 0, location: "SPELLZONE", index: 1 },
      { player: 1, location: "MONSTERZONE", index: 2 }
    ]
  }), {
    kind: "target_event",
    phase: "chain_target",
    cards: [
      { player: 0, location: "SPELLZONE", index: 1 },
      { player: 1, location: "MONSTERZONE", index: 2 }
    ],
    duration: 950
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_CREATE_RELATION",
    cards: [
      { player: 0, location: "SPELLZONE", index: 1 },
      { player: 1, location: "MONSTERZONE", index: 2 }
    ]
  }), {
    kind: "relation_event",
    phase: "create",
    cards: [
      { player: 0, location: "SPELLZONE", index: 1 },
      { player: 1, location: "MONSTERZONE", index: 2 }
    ],
    duration: 900
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_RELEASE_RELATION",
    cards: [
      { player: 0, location: "SPELLZONE", index: 1 },
      { player: 1, location: "MONSTERZONE", index: 2 }
    ]
  }), {
    kind: "relation_event",
    phase: "release",
    cards: [
      { player: 0, location: "SPELLZONE", index: 1 },
      { player: 1, location: "MONSTERZONE", index: 2 }
    ],
    duration: 650
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_BATTLE",
    source: { player: 0, location: "MONSTERZONE", index: 1 },
    target: { player: 1, location: "MONSTERZONE", index: 2 }
  }), {
    kind: "battle",
    source: { player: 0, location: "MONSTERZONE", index: 1 },
    target: { player: 1, location: "MONSTERZONE", index: 2 }
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_CHAINING",
    id: 2001,
    source: { player: 0, location: "SPELLZONE", index: 1 },
    chain_size: 1
  }, 1), {
    kind: "chain",
    mode: "activate",
    phase: "start",
    chainIndex: 1,
    id: 2001,
    source: { player: 1, location: "SPELLZONE", index: 1 },
    sound: "activate"
  });
  assert.deepEqual(resolveAnnouncementContract({
    command: "MSG_CHAIN_NEGATED",
    source: { player: 1, location: "SPELLZONE", index: 3 },
    chain_size: 1
  }, 1), {
    kind: "chain",
    mode: "negated",
    phase: "negated",
    chainIndex: 1,
    id: undefined,
    source: { player: 0, location: "SPELLZONE", index: 3 }
  });
});

test("resolveCommandAnswer falls back when no command family matches", () => {
  const card = { index: 9, location: "MONSTERZONE", player: 0, type: "number", i: 4 };

  assert.deepEqual(resolveCommandAnswer(card, { summons: [] }), { type: "number", i: 4 });
  assert.deepEqual(resolveCommandAnswer(card, null), card);
  assert.deepEqual(resolveCommandAnswer(undefined, { summons: [] }), undefined);
});

test("resolveCommandAnswer matches additional command families with loose card identity checks", () => {
  const options = {
    activatable_cards: [{ index: 7, location: "SPELLZONE" }],
    attackable_cards: [{ index: 5, location: "MONSTERZONE", player: 1, id: "atk-1" }],
    chains: [{ index: 6, location: "SPELLZONE", player: 0, id: "chain-6" }]
  };

  assert.deepEqual(
    resolveCommandAnswer({ index: 7, location: "SPELLZONE", player: 0, id: "spell-a" }, options),
    { type: "activatable_cards", i: 0 }
  );
  assert.deepEqual(
    resolveCommandAnswer({ index: 5, location: "MONSTERZONE", player: 1, id: "atk-1" }, options),
    { type: "attackable_cards", i: 0 }
  );
  assert.deepEqual(
    resolveCommandAnswer({ index: 6, location: "SPELLZONE", player: 0, id: "chain-6" }, options),
    { type: "chains", i: 0 }
  );
  assert.deepEqual(
    resolveCommandAnswer(
      { index: 1, location: "EXTRA", player: 0, id: "unknown" },
      { special_summons: [{ index: 1, location: "EXTRA", player: 0, id: 2002 }] }
    ),
    { type: "special_summons", i: 0 }
  );
});

test("commandOptionMatchesQuery resolves viewer-oriented command targets for player 2", () => {
  assert.equal(
    commandOptionMatchesQuery(
      { index: 2, location: "MONSTERZONE", player: 0, id: 1001 },
      { index: 2, location: "MONSTERZONE", player: 1, id: 1001 },
      1
    ),
    true
  );
  assert.equal(
    commandOptionMatchesQuery(
      { index: 2, location: "MONSTERZONE", player: 0, id: 1001 },
      { index: 2, location: "MONSTERZONE", player: 0, id: 1001 },
      1
    ),
    false
  );
  assert.equal(
    commandOptionMatchesQuery(
      { index: 1, location: "EXTRA", player: 0, id: 2002 },
      { index: 1, location: "EXTRA", player: 0, id: "unknown" },
      0
    ),
    true
  );
});

test("getPileActionEntries exposes View plus filtered Activate and Special Summon pile actions", () => {
  const commandOptions = [
    { type: "special_summons", player: 0, location: "EXTRA", index: 1, id: 1002, i: 0 },
    { type: "activatable_cards", player: 0, location: "GRAVE", index: 0, id: 2001, i: 0 },
    { type: "activates", player: 0, location: "BANISHED", index: 0, id: 3001, i: 0 }
  ];

  assert.deepEqual(
    getPileActionEntries([
      { player: 0, location: "EXTRA", index: 0, id: 1001 },
      { player: 0, location: "EXTRA", index: 1, id: "unknown" }
    ], commandOptions, 0).map((entry) => ({
      type: entry.type,
      ids: entry.deck.map((card) => card.id),
      answers: entry.deck.map((card) => card.viewerAnswer || null)
    })),
    [
      { type: "view_pile", ids: [1001, "unknown"], answers: [null, null] },
      { type: "spsummon_pile", ids: [1002], answers: [{ type: "special_summons", i: 0 }] }
    ]
  );

  assert.deepEqual(
    getPileActionEntries([
      { player: 0, location: "EXTRA", index: 0, id: "unknown" }
    ], commandOptions, 0).map((entry) => ({
      type: entry.type,
      ids: entry.deck.map((card) => card.id),
      indices: entry.deck.map((card) => card.index),
      answers: entry.deck.map((card) => card.viewerAnswer || null)
    })),
    [
      { type: "view_pile", ids: ["unknown"], indices: [0], answers: [null] },
      { type: "spsummon_pile", ids: [1002], indices: [1], answers: [{ type: "special_summons", i: 0 }] }
    ]
  );

  assert.deepEqual(
    getPileActionEntries([
      { player: 0, location: "GRAVE", index: 0, id: 2001 }
    ], commandOptions, 0).map((entry) => ({
      type: entry.type,
      ids: entry.deck.map((card) => card.id),
      answers: entry.deck.map((card) => card.viewerAnswer || null)
    })),
    [
      { type: "view_pile", ids: [2001], answers: [null] },
      { type: "activate_pile", ids: [2001], answers: [{ type: "activatable_cards", i: 0 }] }
    ]
  );

  assert.deepEqual(
    getPileActionEntries([
      { player: 0, location: "BANISHED", index: 0, id: 3001 }
    ], commandOptions, 0).map((entry) => ({
      type: entry.type,
      ids: entry.deck.map((card) => card.id),
      answers: entry.deck.map((card) => card.viewerAnswer || null)
    })),
    [
      { type: "view_pile", ids: [3001], answers: [null] },
      { type: "activate_pile", ids: [3001], answers: [{ type: "activates", i: 0 }] }
    ]
  );
});

test("startGame boots the source duel client, proxies startup packets, and handles turn-choice clicks", async () => {
  const { dom, restore } = installDom();
  const fetchCalls = [];
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url, options = {}) => {
    fetchCalls.push({ url, options });

    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Scarm, Malebranche of the Burning Abyss" },
          { id: 1002, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 2001, name: "Dante, Traveler of the Burning Abyss" },
          { id: 3001, name: "Fire Lake of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/session/test-session") {
      return {
        ok: true,
        json: async () => ({
          success: true,
          user: {
            decks: [
              {
                name: "Burning Abyss",
                main: [1001, 1002],
                extra: [2001],
                side: [3001]
              }
            ]
          }
        })
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  globalThis.localStorage.setItem("session", "test-session");
  globalThis.localStorage.setItem("username", "alice");

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => document.querySelector("#lobby"), 500);

    assert.ok(socket);
    assert.equal(socket.url, "ws://localhost:31337");
    assert.deepEqual(fetchCalls.map((call) => call.url), [
      "/manifest/manifest_0-language-merged.json",
      "/api/session/test-session",
      "/api/websocket-port"
    ]);
    await waitFor(() => socket.sent.length > 0 ? socket.sent[0] : null, 250);
    assert.deepEqual(socket.sent[0], {
      action: "proxy_connect",
      port: 12345
    });
    assert.ok(document.querySelector("#lobby"));
    assert.ok(document.querySelector(".currentdeck"));

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "proxy", status: "up" })
    }));
    await flush(20);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "registered" })
    }));
    await flush(20);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "lobby",
        game: {
          automatic: "Automatic",
          ranked: "Ranked",
          banlist: "April 2026",
          allowedCardsLabel: "OCG / TCG",
          mode: "Match",
          startingLP: 8000,
          player: [
            { username: "alice", ready: false, points: 25, elo: 1310 },
            { username: "bob", ready: false, points: 10, elo: 1200 }
          ]
        }
      })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "slot", slot: 0 })
    }));
    await flush(20);
    assert.equal(document.getElementById("lobbyflist")?.textContent, "April 2026");

    document.getElementById("lobbygotoduel").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "turn_player", slot: 0, verification: "verify-1" })
    }));
    await flush(20);

    const goFirst = document.querySelector("#gofirst");
    assert.ok(goFirst);
    goFirst.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);

    assert.deepEqual(socket.sent, [
      { action: "proxy_connect", port: 12345 },
      {
        action: "proxy_message",
        payload: { action: "register", username: "alice", session: "test-session" }
      },
      {
        action: "proxy_message",
        payload: { action: "join" }
      },
      {
        action: "proxy_message",
        payload: {
          action: "lock",
          deck: {
            main: [1001, 1002],
            extra: [2001],
            side: [3001]
          }
        }
      },
      {
        action: "proxy_message",
        payload: { action: "determine" }
      },
      {
        action: "proxy_message",
        payload: { action: "start", turn_player: 0, verification: "verify-1" }
      }
    ]);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_PLACE",
          prompt_text: "Select the zone to place \"Scarm, Malebranche of the Burning Abyss\"",
          uuid: "question-place-1",
          options: {
            zone_selection: {
              zones: [
                { player: 0, location: "MONSTERZONE", index: 0 }
              ]
            }
          }
        }
      })
    }));
    await flush(20);

    assert.equal(
      document.getElementById("duelquestionprompt")?.textContent?.trim(),
      "Select the zone to place \"Scarm, Malebranche of the Burning Abyss\""
    );
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame keeps slot-1 select-place zones on the viewer side and sends the answer", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => []
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "slot", slot: 1 })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_PLACE",
          prompt_text: "Select the zone to place \"Scarm, Malebranche of the Burning Abyss\"",
          uuid: "question-place-p2",
          options: {
            zone_selection: {
              zones: [
                { player: 0, location: "MONSTERZONE", index: 0 }
              ]
            }
          }
        }
      })
    }));

    const ownSideZone = await waitFor(() =>
      Array.from(document.querySelectorAll(".cardselectionzone.p0.MONSTERZONE.i0"))
        .find((node) => node.style.pointerEvents === "auto"), 250);
    const opponentSideZone = Array.from(document.querySelectorAll(".cardselectionzone.p1.MONSTERZONE.i0"))
      .find((node) => node.style.pointerEvents === "auto");

    assert.ok(ownSideZone);
    assert.equal(opponentSideZone, undefined);

    ownSideZone.dispatchEvent(new dom.window.MouseEvent("mouseenter", { bubbles: true }));
    ownSideZone.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

    const questionAnswer = await waitFor(() =>
      socket.sent.find((entry) => entry.action === "question"), 250);

    assert.deepEqual(questionAnswer, {
      action: "question",
      uuid: "question-place-p2",
      answer: {
        type: "zone",
        i: [0, 4, 0]
      }
    });
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame keeps slot-1 select-place zones on the viewer side when the payload player is still canonical", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => []
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "slot", slot: 1 })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_PLACE",
          prompt_text: "Select the zone to place \"Scarm, Malebranche of the Burning Abyss\"",
          uuid: "question-place-p2-canonical",
          options: {
            player: 0,
            zone_selection: {
              zones: [
                { player: 1, location: "MONSTERZONE", index: 0 }
              ]
            }
          }
        }
      })
    }));

    const ownSideZone = await waitFor(() =>
      Array.from(document.querySelectorAll(".cardselectionzone.p0.MONSTERZONE.i0"))
        .find((node) => node.style.pointerEvents === "auto"), 250);
    const opponentSideZone = Array.from(document.querySelectorAll(".cardselectionzone.p1.MONSTERZONE.i0"))
      .find((node) => node.style.pointerEvents === "auto");

    assert.ok(ownSideZone);
    assert.equal(opponentSideZone, undefined);

    ownSideZone.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

    const questionAnswer = await waitFor(() =>
      socket.sent.find((entry) => entry.action === "question"), 250);

    assert.deepEqual(questionAnswer, {
      action: "question",
      uuid: "question-place-p2-canonical",
      answer: {
        type: "zone",
        i: [0, 4, 0]
      }
    });
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame keeps MSG_SELECT_PLACE zones active across duel updates and retries the latest uuid", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => []
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    const getActiveZone = () =>
      Array.from(document.querySelectorAll(".cardselectionzone.p0.MONSTERZONE.i0"))
        .find((node) => node.style.pointerEvents === "auto");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_PLACE",
          prompt_text: "Select the zone to place \"Scarm, Malebranche of the Burning Abyss\"",
          uuid: "question-place-retry-1",
          options: {
            zone_selection: {
              zones: [
                { player: 0, location: "MONSTERZONE", index: 0 }
              ]
            }
          }
        }
      })
    }));

    assert.ok(await waitFor(getActiveZone, 250));

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "duel",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    assert.ok(getActiveZone());

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_PLACE",
          prompt_text: "Select the zone to place \"Scarm, Malebranche of the Burning Abyss\"",
          uuid: "question-place-retry-2",
          options: {
            zone_selection: {
              zones: [
                { player: 0, location: "MONSTERZONE", index: 0 }
              ]
            }
          }
        }
      })
    }));
    await flush(20);

    const retriedZone = await waitFor(getActiveZone, 250);
    assert.ok(retriedZone);

    retriedZone.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

    const questionAnswer = await waitFor(() =>
      socket.sent.find((entry) => entry.action === "question"), 250);

    assert.deepEqual(questionAnswer, {
      action: "question",
      uuid: "question-place-retry-2",
      answer: {
        type: "zone",
        i: [0, 4, 0]
      }
    });
    assert.equal(socket.sent.filter((entry) => entry.action === "question").length, 1);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame renders code-only reveal cards and uses the duel modal for additional targets", async () => {
  const { dom, restore } = installDom();
  let socket = null;
  let confirmCalled = false;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  dom.window.confirm = () => {
    confirmCalled = true;
    return true;
  };
  globalThis.window.confirm = dom.window.confirm;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 1002, name: "Scarm, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CARD",
          prompt_text: "Select targets",
          uuid: "question-reveal-modal-1",
          options: {
            select_min: 0,
            select_max: 2,
            reveal_cards: [
              { code: 1001, player: 0, location: "MONSTERZONE", index: 0, i: 0 },
              { code: 1002, player: 0, location: "MONSTERZONE", index: 1, i: 1 },
              { player: 0, location: "MONSTERZONE", index: 2, i: 2 }
            ]
          }
        }
      })
    }));

    const revealCards = await waitFor(() => document.querySelectorAll("#revealed img").length === 3
      ? Array.from(document.querySelectorAll("#revealed img"))
      : null, 250);

    assert.match(revealCards[0].getAttribute("src") || "", /1001\.jpg$/);
    assert.match(revealCards[1].getAttribute("src") || "", /1002\.jpg$/);
    assert.match(revealCards[2].getAttribute("src") || "", /cover\.png$/);

    revealCards[0].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

    const modal = await waitFor(() => document.getElementById("yesnobox"), 250);
    assert.ok(modal);
    assert.match(modal.textContent || "", /select additional targets/i);
    assert.equal(confirmCalled, false);

    modal.querySelectorAll("button")[1].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

    const questionAnswer = await waitFor(() =>
      socket.sent.find((entry) => entry.action === "question"), 250);

    assert.deepEqual(questionAnswer, {
      action: "question",
      uuid: "question-reveal-modal-1",
      answer: {
        type: "list",
        i: [0]
      }
    });
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame does not allow closing core question revealers by clicking the backdrop", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 1002, name: "Scarm, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CARD",
          prompt_text: "Select the card(s) to add to your hand",
          uuid: "question-reveal-locked-1",
          options: {
            select_min: 1,
            select_max: 1,
            reveal_cards: [
              { code: 1001, player: 0, location: "GRAVE", index: 0, i: 0 },
              { code: 1002, player: 0, location: "GRAVE", index: 1, i: 1 }
            ]
          }
        }
      })
    }));

    const revealer = await waitFor(() => document.querySelector("#revealed[data-dismissable='false']"), 250);
    assert.ok(revealer);

    revealer.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);

    assert.ok(document.querySelector("#revealed[data-dismissable='false']"));
    assert.deepEqual(socket.sent, [
      { action: "proxy_connect", port: 12345 }
    ]);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame opens the revealer instead of field selectors when select-card targets include overlay materials", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Dante, Traveler of the Burning Abyss" },
          { id: 1002, name: "Farfa, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CARD",
          prompt_text: "Select an Xyz material",
          uuid: "question-overlay-revealer-1",
          options: {
            select_min: 1,
            select_max: 1,
            reveal_cards: [
              { code: 1001, player: 0, location: "MONSTERZONE", index: 0, overlayindex: 0, i: 0 },
              { code: 1002, player: 0, location: "MONSTERZONE", index: 0, overlayindex: 1, i: 1 }
            ]
          }
        }
      })
    }));

    const revealCards = await waitFor(() => document.querySelectorAll("#revealed img").length === 2
      ? Array.from(document.querySelectorAll("#revealed img"))
      : null, 250);

    assert.equal(document.querySelectorAll(".cardselectionzone.active").length, 0);
    assert.match(revealCards[0].getAttribute("src") || "", /1001\.jpg$/);
    assert.match(revealCards[1].getAttribute("src") || "", /1002\.jpg$/);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame renders select-option, sort-card, and select-counter questions and sends duel answers", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 1002, name: "Scarm, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_OPTION",
          prompt_text: "Select a card",
          uuid: "question-option-1",
          options: {
            option_rows: [
              { i: 0, value: "560", label: "Select a card" },
              { i: 1, value: "1001", label: "Graff, Malebranche of the Burning Abyss" }
            ]
          }
        }
      })
    }));
    await flush(20);

    const optionSelect = document.getElementById("duelselectoption");
    assert.ok(optionSelect);
    assert.deepEqual(
      Array.from(optionSelect.querySelectorAll("option")).map((option) => option.textContent),
      ["Select a card", "Graff, Malebranche of the Burning Abyss"]
    );
    optionSelect.value = "1";
    optionSelect.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    document.getElementById("duelselectoptionconfirm").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SORT_CARD",
          uuid: "question-sort-1",
          options: {
            reveal_cards: [
              { id: 1001, i: 0, index: 0, location: "MONSTERZONE", player: 0 },
              { id: 1002, i: 1, index: 1, location: "MONSTERZONE", player: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    let revealCards = document.querySelectorAll("#revealed img");
    assert.equal(revealCards.length, 2);
    assert.deepEqual(
      Array.from(document.querySelectorAll("#revealed .reveal-card-coordinate")).map((node) => node.textContent?.trim()),
      ["Your Monster Zone 1", "Your Monster Zone 2"]
    );
    revealCards[0].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);
    revealCards = document.querySelectorAll("#revealed img");
    revealCards[1].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);
    document.getElementById("revealerconfirm").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_COUNTER",
          uuid: "question-counter-1",
          options: {
            count: 2,
            reveal_cards: [
              { id: 1001, i: 0, index: 0, location: "MONSTERZONE", player: 0, count: 2 },
              { id: 1002, i: 1, index: 1, location: "SPELLZONE", player: 0, count: 1 }
            ]
          }
        }
      })
    }));
    await flush(20);

    revealCards = document.querySelectorAll("#revealed img");
    assert.equal(revealCards.length, 2);
    assert.deepEqual(
      Array.from(document.querySelectorAll("#revealed .reveal-card-coordinate")).map((node) => node.textContent?.trim()),
      ["Your Monster Zone 1", "Your Spell & Trap Zone 2"]
    );
    revealCards[0].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);
    revealCards = document.querySelectorAll("#revealed img");
    revealCards[0].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);
    document.getElementById("revealerconfirm").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    assert.deepEqual(socket.sent, [
      { action: "proxy_connect", port: 12345 },
      {
        action: "question",
        answer: { type: "number", i: 1 },
        uuid: "question-option-1"
      },
      {
        action: "question",
        answer: { type: "order", i: [0, 1] },
        uuid: "question-sort-1"
      },
      {
        action: "question",
        answer: { type: "counter", i: [2, 0] },
        uuid: "question-counter-1"
      }
    ]);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame renders richer prompt text for hint, yesno, and chain flows", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_HINT",
            ui: {
              kind: "hint",
              text: "Your opponent's choice: [Select]",
              hintType: "HINT_OPSELECTED"
            }
          }
        }
      })
    }));
    await flush(20);

    assert.equal(
      document.getElementById("duelquestionprompt")?.textContent?.trim(),
      "Your opponent's choice: [Select]"
    );

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_EFFECTYN",
          prompt_text: "Activate a card or effect?\nUse the effect of \"Graff, Malebranche of the Burning Abyss\" from [Monster Zone 2]?",
          uuid: "question-effect-1",
          options: {}
        }
      })
    }));
    await flush(20);

    assert.equal(
      document.getElementById("duelquestionprompt")?.textContent?.trim(),
      "Activate a card or effect?\nUse the effect of \"Graff, Malebranche of the Burning Abyss\" from [Monster Zone 2]?"
    );
    assert.ok(document.getElementById("yesnobox"));
    assert.equal(
      document.querySelector("#yesnobox p")?.textContent?.trim(),
      "Activate a card or effect?\nUse the effect of \"Graff, Malebranche of the Burning Abyss\" from [Monster Zone 2]?"
    );

    document.querySelectorAll("#yesnobox button")[1].dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CHAIN",
          prompt_text: "Activate a card or effect?\nActivate a Trigger Effect?",
          uuid: "question-chain-1",
          options: {
            select_trigger: true,
            forced: false,
            count: 1,
            specount: 127,
            chain_choices: [
              { id: 1001, player: 0, location: "MONSTERZONE", index: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    assert.ok(document.querySelector("#chain #revealed")?.textContent?.includes("Activate a Trigger Effect?"));
    assert.deepEqual(
      Array.from(document.querySelectorAll("#chain .chainbuttons button")).map((button) => button.textContent?.trim()),
      ["Yes", "No"]
    );

    document.querySelectorAll("#chain .chainbuttons button")[0].dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    assert.deepEqual(socket.sent, [
      { action: "proxy_connect", port: 12345 },
      {
        action: "question",
        answer: { type: "yesno", i: false },
        uuid: "question-effect-1"
      },
      {
        action: "question",
        answer: { type: "number", i: 0 },
        uuid: "question-chain-1"
      }
    ]);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame keeps duplicate-id chain choices renderable and exposes an explicit decline button", async () => {
  const { dom, restore } = installDom();
  let socket = null;
  const consoleErrors = [];
  const originalConsoleError = console.error;

  console.error = (...args) => {
    consoleErrors.push(args.map((value) => String(value)).join(" "));
  };

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 18386170, name: "The Traveler and the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CHAIN",
          prompt_text: "Attempting to end the Battle Phase\nActivate a Trigger Effect?",
          uuid: "question-chain-duplicate-1",
          options: {
            select_trigger: true,
            forced: false,
            count: 2,
            specount: 127,
            chain_choices: [
              { id: 18386170, player: 0, location: "SPELLZONE", index: 0 },
              { id: 18386170, player: 0, location: "SPELLZONE", index: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    assert.equal(document.querySelectorAll("#chain #revealed img").length, 2);
    assert.equal(document.querySelectorAll("#chain .chainbuttons button").length, 1);
    assert.equal(document.querySelector("#chain .chainbuttons button")?.textContent?.trim(), "No");
    assert.equal(consoleErrors.some((message) => message.includes("same key")), false);

    document.querySelector("#chain .chainbuttons button").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    const questionAnswer = socket.sent.find((entry) => entry.action === "question");
    assert.deepEqual(questionAnswer, {
      action: "question",
      answer: { type: "number", i: -1 },
      uuid: "question-chain-duplicate-1"
    });
  } finally {
    console.error = originalConsoleError;
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame reuses the choice screen for MSG_ROCK_PAPER_SCISSORS and MSG_HAND_RES", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => []
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_ORIENTATION",
            slot: 0
          }
        }
      })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_ROCK_PAPER_SCISSORS",
          uuid: "question-rps-1",
          prompt_text: "",
          options: {
            type: 132,
            player: 0
          }
        }
      })
    }));
    await flush(20);

    assert.ok(document.querySelector("#rps"));

    document.getElementById("Rock").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    assert.deepEqual(socket.sent, [
      { action: "proxy_connect", port: 12345 },
      {
        action: "question",
        answer: { type: "number", i: 2 },
        uuid: "question-rps-1"
      }
    ]);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_HAND_RES",
            results: [2, 1],
            ui: {
              kind: "rps_result",
              results: [2, 1]
            }
          }
        }
      })
    }));
    await flush(20);

    assert.ok(document.getElementById("Rock"));
    assert.ok(document.getElementById("p2Scissors"));
    assert.ok(document.querySelector(".rpsresultlane-self #Rock"));
    assert.ok(document.querySelector(".rpsresultlane-opponent #p2Scissors"));

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    assert.ok(document.getElementById("rps"));
    assert.equal(document.getElementById("duel"), null);

    await flush(1100);

    assert.ok(document.getElementById("duel"));
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame renders MSG_ANNOUNCE_CARD, previews the candidate, and sends the chosen passcode", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, alias: 0, setcode: 0, type: 1, race: 8, attribute: 32, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 2001, alias: 0, setcode: 0, type: 2, race: 0, attribute: 0, name: "Fire Lake of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_ANNOUNCE_CARD",
          uuid: "question-announce-card-1",
          prompt_text: "Declare a card name",
          options: {
            opcodes: [1001, ANNOUNCE_CARD_OPCODE.ISCODE]
          }
        }
      })
    }));
    await flush(20);

    assert.equal(
      document.getElementById("duelquestionprompt")?.textContent?.trim(),
      "Declare a card name"
    );
    assert.ok(document.getElementById("announcecardbox"));
    assert.ok(document.getElementById("announcecardresult-1001"));

    document.getElementById("announcecardresult-1001").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    await waitFor(() => document.querySelector("#effectflasher img"), 250);
    assert.ok(document.querySelector("#effectflasher img"));

    document.getElementById("announcecardconfirm").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    assert.deepEqual(socket.sent, [
      { action: "proxy_connect", port: 12345 },
      {
        action: "question",
        answer: { type: "number", i: 1001 },
        uuid: "question-announce-card-1"
      }
    ]);
  } finally {
    await flush(550);
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame keeps MSG_ANNOUNCE_NUMBER stable across repeated updates and sends the exact chosen number", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => []
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_ANNOUNCE_NUMBER",
          uuid: "question-announce-number-1",
          prompt_text: "Select a number",
          options: {
            announcement_values: [3, 4, 5]
          }
        }
      })
    }));
    await flush(20);

    assert.equal(
      document.getElementById("duelquestionprompt")?.textContent?.trim(),
      "Select a number"
    );
    assert.equal(document.querySelectorAll("#attributes .announceSelectDialog").length, 1);
    assert.deepEqual(
      Array.from(document.querySelectorAll("#attributes [data-announcement-value]")).map((node) => node.textContent?.trim()),
      ["3", "4", "5"]
    );

    const selectedInput = document.querySelector('#attributes input[value="4"]');
    assert.ok(selectedInput);
    selectedInput.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);
    assert.equal(document.querySelector('#attributes input[value="4"]')?.checked, true);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "duel",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_ANNOUNCE_NUMBER",
          uuid: "question-announce-number-2",
          prompt_text: "Select a number",
          options: {
            announcement_values: [3, 4, 5]
          }
        }
      })
    }));
    await flush(20);

    assert.equal(document.querySelectorAll("#attributes .announceSelectDialog").length, 1);
    assert.equal(document.querySelector('#attributes input[value="4"]')?.checked, true);

    document.querySelector('#attributes button[data-role="announce-confirm"]')?.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    assert.deepEqual(socket.sent, [
      { action: "proxy_connect", port: 12345 },
      {
        action: "question",
        answer: { type: "number", i: 4 },
        uuid: "question-announce-number-2"
      }
    ]);
  } finally {
    await flush(550);
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame replaces stale field state so extra shuffles and removed cards stay in sync", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss", atk: 1000, def: 1000 },
          { id: 2001, name: "Dante, Traveler of the Burning Abyss" },
          { id: 3001, name: "Beatrice, Lady of the Eternal" },
          { id: 4001, name: "Farfa, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/manifest/strings.json") {
      return {
        ok: true,
        json: async () => ({ system: {} })
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              MONSTERZONE: [
                {
                  uid: "monster-1",
                  id: 1001,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack",
                  attack: 1000,
                  def: 1000
                }
              ],
              EXTRA: [
                {
                  uid: "extra-1",
                  id: 2001,
                  player: 0,
                  location: "EXTRA",
                  index: 0,
                  position: "FaceDown"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await flush(20);

    assert.equal(document.querySelectorAll(".card.p0.MONSTERZONE").length, 1);
    assert.equal(document.querySelector(".card.p0.EXTRA")?.getAttribute("data-id"), "2001");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "duel",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              EXTRA: [
                {
                  uid: "extra-1",
                  id: 3001,
                  player: 0,
                  location: "EXTRA",
                  index: 0,
                  position: "FaceDown"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            type: 39,
            player: 0,
            cards: [3001]
          }
        }
      })
    }));
    await flush(40);

    assert.equal(document.querySelectorAll(".card.p0.MONSTERZONE").length, 0);
    assert.equal(document.querySelector(".card.p0.EXTRA")?.getAttribute("data-id"), "3001");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "reveal",
          reveal: [
            {
              uid: "reveal-1",
              id: 4001,
              player: 0,
              location: "EXTRA",
              index: 0,
              position: "FaceUp"
            }
          ]
        }
      })
    }));
    await flush(20);

    assert.equal(document.querySelectorAll("#revealed img").length, 1);
    await flush(1100);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame renders duel-page chain settings and routes forced chains through the chain component", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await waitFor(() => document.querySelector("#extracontrols #control-surrender"), 1000);

    const extraControlsChildren = Array.from(document.querySelectorAll("#extracontrols > *"));
    assert.equal(extraControlsChildren[0]?.textContent?.trim(), "Surrender");
    assert.equal(extraControlsChildren[1]?.className, "chain-settings-box");
    assert.deepEqual(
      Array.from(document.querySelectorAll("#extracontrols .chain-settings-row span")).map((node) => node.textContent?.trim()),
      [
        "Automatic Chain Link Order",
        "Add a delay even when no response",
        "Hide Chain Buttons"
      ]
    );
    assert.equal(document.querySelector("#chain-setting-autochain")?.checked, false);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CHAIN",
          prompt_text: "Select the effect you want to activate",
          uuid: "question-forced-chain-manual-1",
          options: {
            select_trigger: false,
            forced: true,
            count: 1,
            specount: 1,
            chain_choices: [
              { id: 1001, player: 0, location: "MONSTERZONE", index: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    assert.ok(document.querySelector("#chain #revealed"));
    assert.deepEqual(
      Array.from(document.querySelectorAll("#chain .chainbuttons button")).map((button) => button.textContent?.trim()),
      ["Continue"]
    );

    document.querySelector("#chain .chainbuttons button").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    assert.deepEqual(
      socket.sent.find((entry) => entry.uuid === "question-forced-chain-manual-1"),
      {
        action: "question",
        answer: { type: "number", i: 0 },
        uuid: "question-forced-chain-manual-1"
      }
    );

    document.querySelector("#chain-setting-autochain").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);
    assert.equal(document.querySelector("#chain-setting-autochain")?.checked, true);
    assert.equal(dom.window.localStorage.getItem("autochain"), "true");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CHAIN",
          prompt_text: "Select the effect you want to activate",
          uuid: "question-forced-chain-auto-2",
          options: {
            select_trigger: false,
            forced: true,
            count: 1,
            specount: 1,
            chain_choices: [
              { id: 1001, player: 0, location: "MONSTERZONE", index: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    assert.equal(document.querySelector("#chain #revealed"), null);
    assert.deepEqual(
      socket.sent.find((entry) => entry.uuid === "question-forced-chain-auto-2"),
      {
        action: "question",
        answer: { type: "number", i: 0 },
        uuid: "question-forced-chain-auto-2"
      }
    );
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame applies the duel-page waitchain checkbox to automatic chain declines", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => []
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await waitFor(() => document.querySelector("#chain-setting-waitchain"), 1000);

    document.querySelector("#chain-setting-waitchain").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);
    assert.equal(document.querySelector("#chain-setting-waitchain")?.checked, true);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CHAIN",
          prompt_text: "Activate a card or effect?",
          uuid: "question-chain-delay-1",
          options: {
            select_trigger: false,
            forced: false,
            count: 0,
            specount: 1,
            chain_choices: []
          }
        }
      })
    }));
    await flush(80);

    assert.equal(socket.sent.some((entry) => entry.uuid === "question-chain-delay-1"), false);
    await waitFor(() => socket.sent.find((entry) => entry.uuid === "question-chain-delay-1"), 800, 20);
    assert.deepEqual(
      socket.sent.find((entry) => entry.uuid === "question-chain-delay-1"),
      {
        action: "question",
        answer: { type: "number", i: -1 },
        uuid: "question-chain-delay-1"
      }
    );
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame exposes duelclient chain mode buttons and applies them to chain prompts", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await waitFor(() => document.querySelector("#chain-setting-hide_hint_button"), 1000);

    assert.equal(document.querySelectorAll("#extracontrols .chain-mode-button").length, 0);

    document.querySelector("#chain-setting-hide_hint_button").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    assert.equal(document.querySelector("#chain-setting-hide_hint_button")?.checked, false);
    assert.equal(dom.window.localStorage.getItem("hide_hint_button"), "false");
    assert.deepEqual(
      Array.from(document.querySelectorAll("#extracontrols .chain-mode-button")).map((button) => button.textContent?.trim()),
      ["Chain: OFF", "Always pause", "Chain: ON"]
    );

    Array.from(document.querySelectorAll("#extracontrols .chain-mode-button"))
      .find((button) => button.textContent?.trim() === "Always pause")
      ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);

    assert.equal(document.querySelector("#extracontrols .chain-settings-box")?.getAttribute("data-chain-mode"), "always");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CHAIN",
          prompt_text: "Activate a card or effect?",
          uuid: "question-chain-always-1",
          options: {
            select_trigger: false,
            forced: false,
            count: 1,
            specount: 0,
            chain_choices: [
              { id: 1001, player: 0, location: "MONSTERZONE", index: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    assert.ok(document.querySelector("#chain #revealed"));
    assert.equal(socket.sent.some((entry) => entry.uuid === "question-chain-always-1"), false);

    Array.from(document.querySelectorAll("#chain .chainbuttons button"))
      .find((button) => button.textContent?.trim() === "No")
      ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);

    assert.deepEqual(
      socket.sent.find((entry) => entry.uuid === "question-chain-always-1"),
      {
        action: "question",
        answer: { type: "number", i: -1 },
        uuid: "question-chain-always-1"
      }
    );

    Array.from(document.querySelectorAll("#extracontrols .chain-mode-button"))
      .find((button) => button.textContent?.trim() === "Chain: OFF")
      ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);

    assert.equal(document.querySelector("#extracontrols .chain-settings-box")?.getAttribute("data-chain-mode"), "ignore");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CHAIN",
          prompt_text: "Activate a card or effect?",
          uuid: "question-chain-ignore-2",
          options: {
            select_trigger: false,
            forced: false,
            count: 1,
            specount: 1,
            chain_choices: [
              { id: 1001, player: 0, location: "MONSTERZONE", index: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    assert.equal(document.querySelector("#chain #revealed"), null);
    assert.deepEqual(
      socket.sent.find((entry) => entry.uuid === "question-chain-ignore-2"),
      {
        action: "question",
        answer: { type: "number", i: -1 },
        uuid: "question-chain-ignore-2"
      }
    );

    Array.from(document.querySelectorAll("#extracontrols .chain-mode-button"))
      .find((button) => button.textContent?.trim() === "Chain: ON")
      ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);

    assert.equal(document.querySelector("#extracontrols .chain-settings-box")?.getAttribute("data-chain-mode"), "when_available");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CHAIN",
          prompt_text: "Activate a card or effect?",
          uuid: "question-chain-whenavail-3",
          options: {
            select_trigger: false,
            forced: false,
            count: 1,
            specount: 0,
            chain_choices: [
              { id: 1001, player: 0, location: "MONSTERZONE", index: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    assert.ok(document.querySelector("#chain #revealed"));
    assert.equal(socket.sent.some((entry) => entry.uuid === "question-chain-whenavail-3"), false);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame applies A, S, and D chain shortcuts while ignoring focused chat input", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await waitFor(() => document.querySelector("#sidechatinput"), 1000);

    const chainBox = document.querySelector("#extracontrols .chain-settings-box"),
      chatInput = document.querySelector("#sidechatinput");

    assert.equal(chainBox?.getAttribute("data-chain-mode"), "neutral");

    chatInput.dispatchEvent(new dom.window.KeyboardEvent("keydown", {
      key: "s",
      code: "KeyS",
      bubbles: true
    }));
    await flush(20);

    assert.equal(chainBox?.getAttribute("data-chain-mode"), "neutral");

    document.dispatchEvent(new dom.window.KeyboardEvent("keydown", {
      key: "a",
      code: "KeyA",
      bubbles: true
    }));
    await flush(20);
    assert.equal(chainBox?.getAttribute("data-chain-mode"), "always");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CHAIN",
          prompt_text: "Activate a card or effect?",
          uuid: "question-chain-key-a-1",
          options: {
            select_trigger: false,
            forced: false,
            count: 1,
            specount: 0,
            chain_choices: [
              { id: 1001, player: 0, location: "MONSTERZONE", index: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    assert.ok(document.querySelector("#chain #revealed"));
    assert.equal(socket.sent.some((entry) => entry.uuid === "question-chain-key-a-1"), false);

    Array.from(document.querySelectorAll("#chain .chainbuttons button"))
      .find((button) => button.textContent?.trim() === "No")
      ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);

    assert.deepEqual(
      socket.sent.find((entry) => entry.uuid === "question-chain-key-a-1"),
      {
        action: "question",
        answer: { type: "number", i: -1 },
        uuid: "question-chain-key-a-1"
      }
    );

    document.dispatchEvent(new dom.window.KeyboardEvent("keyup", {
      key: "a",
      code: "KeyA",
      bubbles: true
    }));
    await flush(20);
    assert.equal(chainBox?.getAttribute("data-chain-mode"), "neutral");

    document.dispatchEvent(new dom.window.KeyboardEvent("keydown", {
      key: "s",
      code: "KeyS",
      bubbles: true
    }));
    await flush(20);
    assert.equal(chainBox?.getAttribute("data-chain-mode"), "ignore");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CHAIN",
          prompt_text: "Activate a card or effect?",
          uuid: "question-chain-key-s-2",
          options: {
            select_trigger: false,
            forced: false,
            count: 1,
            specount: 1,
            chain_choices: [
              { id: 1001, player: 0, location: "MONSTERZONE", index: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    assert.equal(document.querySelector("#chain #revealed"), null);
    assert.deepEqual(
      socket.sent.find((entry) => entry.uuid === "question-chain-key-s-2"),
      {
        action: "question",
        answer: { type: "number", i: -1 },
        uuid: "question-chain-key-s-2"
      }
    );

    document.dispatchEvent(new dom.window.KeyboardEvent("keyup", {
      key: "s",
      code: "KeyS",
      bubbles: true
    }));
    await flush(20);
    assert.equal(chainBox?.getAttribute("data-chain-mode"), "neutral");

    document.dispatchEvent(new dom.window.KeyboardEvent("keydown", {
      key: "d",
      code: "KeyD",
      bubbles: true
    }));
    await flush(20);
    assert.equal(chainBox?.getAttribute("data-chain-mode"), "when_available");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_CHAIN",
          prompt_text: "Activate a card or effect?",
          uuid: "question-chain-key-d-3",
          options: {
            select_trigger: false,
            forced: false,
            count: 1,
            specount: 0,
            chain_choices: [
              { id: 1001, player: 0, location: "MONSTERZONE", index: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    assert.ok(document.querySelector("#chain #revealed"));
    assert.equal(socket.sent.some((entry) => entry.uuid === "question-chain-key-d-3"), false);

    Array.from(document.querySelectorAll("#chain .chainbuttons button"))
      .find((button) => button.textContent?.trim() === "No")
      ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);

    assert.deepEqual(
      socket.sent.find((entry) => entry.uuid === "question-chain-key-d-3"),
      {
        action: "question",
        answer: { type: "number", i: -1 },
        uuid: "question-chain-key-d-3"
      }
    );

    document.dispatchEvent(new dom.window.KeyboardEvent("keyup", {
      key: "d",
      code: "KeyD",
      bubbles: true
    }));
    await flush(20);
    assert.equal(chainBox?.getAttribute("data-chain-mode"), "neutral");
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame restores the clicked chain mode after releasing A, S, or D", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => []
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await waitFor(() => document.querySelector("#chain-setting-hide_hint_button"), 1000);

    document.querySelector("#chain-setting-hide_hint_button").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    Array.from(document.querySelectorAll("#extracontrols .chain-mode-button"))
      .find((button) => button.textContent?.trim() === "Chain: ON")
      ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(20);

    const chainBox = document.querySelector("#extracontrols .chain-settings-box");
    assert.equal(chainBox?.getAttribute("data-chain-mode"), "when_available");

    document.dispatchEvent(new dom.window.KeyboardEvent("keydown", {
      key: "a",
      code: "KeyA",
      bubbles: true
    }));
    await flush(20);
    assert.equal(chainBox?.getAttribute("data-chain-mode"), "always");

    document.dispatchEvent(new dom.window.KeyboardEvent("keyup", {
      key: "a",
      code: "KeyA",
      bubbles: true
    }));
    await flush(20);
    assert.equal(chainBox?.getAttribute("data-chain-mode"), "when_available");
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame auto answers MSG_SORT_CHAIN when automatic chain link order is enabled", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 1002, name: "Scarm, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await waitFor(() => document.querySelector("#chain-setting-autochain"), 1000);

    document.querySelector("#chain-setting-autochain").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(20);

    assert.equal(document.querySelector("#chain-setting-autochain")?.checked, true);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SORT_CHAIN",
          uuid: "question-sort-chain-auto-1",
          options: {
            reveal_cards: [
              { id: 1001, i: 0, index: 0, location: "MONSTERZONE", player: 0 },
              { id: 1002, i: 1, index: 1, location: "MONSTERZONE", player: 0 }
            ]
          }
        }
      })
    }));
    await flush(20);

    assert.equal(document.querySelector("#revealed"), null);
    assert.deepEqual(
      socket.sent.find((entry) => entry.uuid === "question-sort-chain-auto-1"),
      {
        action: "question",
        answer: { type: "order", i: null },
        uuid: "question-sort-chain-auto-1"
      }
    );
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame renders summon flash, equip sound, battle animation, and chain overlays from server announcements", async () => {
  const { dom, restore } = installDom();
  let socket = null;
  const playedSounds = [];

  class FakeAudio {
    constructor(src) {
      this.src = src;
      this.currentTime = 0;
    }

    play() {
      playedSounds.push(this.src);
      return Promise.resolve();
    }
  }

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.Audio = FakeAudio;
  globalThis.window.Audio = FakeAudio;
  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 1002, name: "Scarm, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              MONSTERZONE: [
                {
                  uid: "monster-1",
                  id: 1001,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack"
                }
              ],
              SPELLZONE: [
                {
                  uid: "spell-1",
                  id: 1002,
                  player: 0,
                  location: "SPELLZONE",
                  index: 1,
                  position: "FaceUp"
                }
              ]
            },
            {
              MONSTERZONE: [
                {
                  uid: "monster-2",
                  id: 1002,
                  player: 1,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack"
                }
              ]
            }
          ]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_SUMMONED",
            ui: {
              kind: "flash",
              id: 1001,
              mode: "summon",
              source: { player: 0, location: "MONSTERZONE", index: 0 }
            }
          }
        }
      })
    }));
      await waitFor(() => document.querySelector("#effectflasher img"), 250);
      assert.ok(document.querySelector("#effectflasher img"));
      assert.ok(document.querySelector('#effectflasher [data-source-beacon="true"]'));

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_EQUIP",
            ui: {
              kind: "sound",
              sound: "equip",
              source: { player: 0, location: "SPELLZONE", index: 1 },
              target: { player: 1, location: "MONSTERZONE", index: 0 }
            }
          }
        }
      })
    }));
    await flush(20);
    assert.deepEqual(playedSounds, ["/sounds/equip.wav"]);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_ATTACK",
            ui: {
              kind: "attack",
              id: 1001,
              sound: "attack",
              source: { player: 0, location: "MONSTERZONE", index: 0 },
              target: { player: 1, location: "MONSTERZONE", index: 0 }
            }
          }
        }
      })
    }));
    await waitFor(() => document.querySelector("#attackanimation"), 250);
    assert.ok(document.querySelector("#attackanimation"));

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_BATTLE",
            ui: {
              kind: "battle",
              source: { player: 0, location: "MONSTERZONE", index: 0 },
              target: { player: 1, location: "MONSTERZONE", index: 0 }
            }
          }
        }
      })
    }));
    await flush(20);
    assert.equal(document.querySelectorAll(".battle-overlay").length, 2);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_CHAINING",
            ui: {
              kind: "chain",
              mode: "activate",
              phase: "start",
              chainIndex: 1,
              id: 1002,
              source: { player: 0, location: "SPELLZONE", index: 1 },
              sound: "activate"
            }
          }
        }
      })
    }));
      await flush(20);
      assert.deepEqual(playedSounds, ["/sounds/equip.wav", "/sounds/attack.wav", "/sounds/activate.wav"]);
      assert.equal(
        document.querySelector(".card.p0.SPELLZONE.i1")?.getAttribute("data-flash-cover"),
        "true"
      );
      assert.equal(document.querySelector('#effectflasher[data-mode="activate"]'), null);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_CHAINED",
            ui: {
              kind: "chain",
              phase: "queued",
              chainIndex: 1,
              id: 1002,
              source: { player: 0, location: "SPELLZONE", index: 1 }
            }
          }
        }
      })
    }));
    await waitFor(() => document.querySelector('.chain-overlay[data-chain-status="queued"]'), 250);
    assert.equal(document.querySelector('.chain-overlay-number')?.textContent, "1");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_CHAIN_SOLVING",
            ui: {
              kind: "chain",
              phase: "solving",
              chainIndex: 1,
              id: 1002,
              source: { player: 0, location: "SPELLZONE", index: 1 }
            }
          }
        }
      })
    }));
    await waitFor(() => document.querySelector('.chain-overlay[data-chain-status="solving"]'), 250);
    assert.ok(document.querySelector('.chain-overlay[data-chain-status="solving"]'));

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_CHAIN_END",
            ui: {
              kind: "chain",
              phase: "end"
            }
          }
        }
      })
    }));
    await flush(30);
    assert.equal(document.querySelector(".chain-overlay"), null);
  } finally {
    await flush(800);
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame renders phase banners, LP deltas, anchored pile reveals, and short field fade ghosts", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 1002, name: "Scarm, Malebranche of the Burning Abyss" },
          { id: 46986414, name: "Stardust Dragon" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              DECK: [
                {
                  uid: "deck-0",
                  id: 46986414,
                  player: 0,
                  location: "DECK",
                  index: 0,
                  position: "FaceDown"
                }
              ],
              EXTRA: [
                {
                  uid: "extra-0",
                  id: 1002,
                  player: 0,
                  location: "EXTRA",
                  index: 0,
                  position: "FaceDown"
                }
              ],
              MONSTERZONE: [
                {
                  uid: "monster-a",
                  id: 1001,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_NEW_TURN",
            ui: {
              kind: "phase_banner",
              bannerType: "turn",
              text: "Turn 2",
              duration: 60
            }
          }
        }
      })
    }));
    assert.ok(await waitFor(() => document.querySelector(".phaseindicatorslide"), 250));

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_DAMAGE",
            ui: {
              kind: "lp_delta",
              player: 0,
              value: -500,
              tone: "damage",
              duration: 60
            }
          }
        }
      })
    }));
    const lpDelta = await waitFor(() => document.querySelector(".lp-slot.p0 .lp-delta"), 250);
    assert.ok(lpDelta);
    assert.match(lpDelta.textContent, /-500/);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "reveal",
          call: "confirm_decktop",
          player: 0,
          reveal: [
            {
              uid: "reveal-top",
              id: 46986414,
              player: 0,
              location: "DECK",
              index: 0,
              position: "FaceUp"
            }
          ]
        }
      })
    }));
    assert.equal((await waitFor(() => document.querySelectorAll("#fieldrevealoverlay .field-reveal-card.confirm_decktop"), 250)).length, 1);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "duel",
          info: {
            lifepoints: [7500, 8000],
            phase: 0,
            turn: 2
          },
          names: ["alice", "bob"],
          field: [
            {
              DECK: [
                {
                  uid: "deck-0",
                  id: 46986414,
                  player: 0,
                  location: "DECK",
                  index: 0,
                  position: "FaceDown"
                }
              ],
              EXTRA: [
                {
                  uid: "extra-0",
                  id: 1002,
                  player: 0,
                  location: "EXTRA",
                  index: 0,
                  position: "FaceDown"
                }
              ],
              MONSTERZONE: [
                {
                  uid: "monster-b",
                  id: 1002,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack"
                }
              ]
            },
            {}
          ]
        }
      })
    }));

    assert.ok(await waitFor(() => document.querySelector(".card.card-enter"), 250));
    assert.ok(await waitFor(() => document.querySelector(".card.card-ghost.card-exit"), 250));
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame handles MSG_TAG_SWAP announcements by animating the swapped deck, hand, and extra piles", async () => {
  const { dom, restore } = installDom();
  let socket = null;
  const originalRandom = Math.random;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 1002, name: "Scarm, Malebranche of the Burning Abyss" },
          { id: 2001, name: "Dante, Traveler of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    Math.random = () => 1;
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              DECK: [
                {
                  uid: "deck-1",
                  id: 1001,
                  player: 0,
                  location: "DECK",
                  index: 0,
                  position: "FaceDown"
                }
              ],
              HAND: [
                {
                  uid: "hand-1",
                  id: 1002,
                  player: 0,
                  location: "HAND",
                  index: 0,
                  position: "FaceUp"
                }
              ],
              EXTRA: [
                {
                  uid: "extra-1",
                  id: 2001,
                  player: 0,
                  location: "EXTRA",
                  index: 0,
                  position: "FaceDown"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await waitFor(() => document.querySelector('.card.DECK[data-id="1001"]'), 1000);

    const deckCard = document.querySelector('.card.DECK[data-id="1001"]');
    const handCard = document.querySelector('.card.HAND[data-id="1002"]');
    const extraCard = document.querySelector('.card.EXTRA[data-id="2001"]');

    assert.ok(deckCard);
    assert.ok(handCard);
    assert.ok(extraCard);

    const beforeDeckLeft = deckCard.style.left || "";
    const beforeExtraLeft = extraCard.style.left || "";

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_TAG_SWAP",
            player: 0,
            ui: {
              kind: "tag_swap",
              player: 0,
              zones: ["DECK", "HAND", "EXTRA"]
            }
          }
        }
      })
    }));
    await flush(30);

    assert.notEqual(document.querySelector('.card.DECK[data-id="1001"]')?.style.left || "", beforeDeckLeft);
    assert.notEqual(document.querySelector('.card.EXTRA[data-id="2001"]')?.style.left || "", beforeExtraLeft);
  } finally {
    Math.random = originalRandom;
    await flush(1100);
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame clears facedown identities after MSG_SHUFFLE_SET_CARD style field replacement", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Fire Lake of the Burning Abyss" },
          { id: 1002, name: "Karma Cut" }
        ]
      };
    }

    if (url === "/manifest/strings.json") {
      return {
        ok: true,
        json: async () => ({ system: {} })
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              SPELLZONE: [
                {
                  uid: "set-1",
                  id: 1001,
                  player: 0,
                  location: "SPELLZONE",
                  index: 0,
                  position: "FaceDown"
                },
                {
                  uid: "set-2",
                  id: 1002,
                  player: 0,
                  location: "SPELLZONE",
                  index: 1,
                  position: "FaceDown"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await flush(20);

    assert.deepEqual(
      Array.from(document.querySelectorAll(".card.p0.SPELLZONE")).map((element) => ({
        id: element.getAttribute("data-id"),
        index: element.getAttribute("data-index")
      })),
      [
        { id: "1001", index: "0" },
        { id: "1002", index: "1" }
      ]
    );

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "duel",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              SPELLZONE: [
                {
                  uid: "set-2",
                  id: "unknown",
                  player: 0,
                  location: "SPELLZONE",
                  index: 0,
                  position: "FaceDown"
                },
                {
                  uid: "set-1",
                  id: "unknown",
                  player: 0,
                  location: "SPELLZONE",
                  index: 1,
                  position: "FaceDown"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            type: 36,
            location: "SPELLZONE",
            cards: [
              {
                from: { player: 0, location: "SPELLZONE", index: 0 },
                to: { player: 0, location: "SPELLZONE", index: 1 }
              },
              {
                from: { player: 0, location: "SPELLZONE", index: 1 },
                to: { player: 0, location: "SPELLZONE", index: 0 }
              }
            ]
          }
        }
      })
    }));
    await flush(40);

    assert.deepEqual(
      Array.from(document.querySelectorAll(".card.p0.SPELLZONE")).map((element) => ({
        id: element.getAttribute("data-id"),
        index: element.getAttribute("data-index")
      })),
      [
        { id: "unknown", index: "0" },
        { id: "unknown", index: "1" }
      ]
    );
    await flush(400);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame opens the idle pile viewer during idle state without dialog lifecycle warnings", async () => {
  const { dom, restore } = installDom();
  let socket = null;
  const consoleErrors = [];
  const originalConsoleError = console.error;

  console.error = (...args) => {
    consoleErrors.push(args.map((value) => String(value)).join(" "));
  };

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 2001, name: "Dante, Traveler of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              EXTRA: [
                {
                  uid: "extra-1",
                  id: 2001,
                  player: 0,
                  location: "EXTRA",
                  index: 0,
                  position: "FaceDown"
                },
                {
                  uid: "extra-2",
                  id: 2001,
                  player: 0,
                  location: "EXTRA",
                  index: 1,
                  position: "FaceDown"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await waitFor(() => document.querySelector('.card.EXTRA[data-id="2001"]'), 1000);

    document.querySelector('.card.EXTRA[data-id="2001"]').dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 640,
      pageY: 360
    }));
    await flush(30);

    await clickActionButton("View");
    assert.equal(document.querySelector("#idleExtraDeckViewer #revealed")?.getAttribute("data-mode"), "view");
    assert.equal(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-card").length, 2);
    assert.equal(document.querySelectorAll('#idleExtraDeckViewer #revealed img[data-actionable="true"]').length, 0);
    assert.equal(document.querySelector("#viewDecks #revealed"), null);
    assert.equal(consoleErrors.some((message) => message.includes("not yet mounted")), false);
    assert.equal(consoleErrors.some((message) => message.includes("same key")), false);
  } finally {
    console.error = originalConsoleError;
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame uses the idle pile viewer for extra, graveyard, and banished inspection during idle state", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 2001, name: "Dante, Traveler of the Burning Abyss" },
          { id: 2002, name: "Beatrice, Lady of the Eternal" },
          { id: 3001, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 3002, name: "Scarm, Malebranche of the Burning Abyss" },
          { id: 4001, name: "Farfa, Malebranche of the Burning Abyss" },
          { id: 4002, name: "Libic, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              EXTRA: [
                {
                  uid: "idle-view-extra-1",
                  id: 2001,
                  player: 0,
                  location: "EXTRA",
                  index: 0,
                  position: "FaceDown"
                },
                {
                  uid: "idle-view-extra-2",
                  id: 2002,
                  player: 0,
                  location: "EXTRA",
                  index: 1,
                  position: "FaceDown"
                }
              ],
              GRAVE: [
                {
                  uid: "idle-view-grave-1",
                  id: 3001,
                  player: 0,
                  location: "GRAVE",
                  index: 0,
                  position: "FaceUpAttack"
                },
                {
                  uid: "idle-view-grave-2",
                  id: 3002,
                  player: 0,
                  location: "GRAVE",
                  index: 1,
                  position: "FaceUpAttack"
                }
              ],
              BANISHED: [
                {
                  uid: "idle-view-banished-1",
                  id: 4001,
                  player: 0,
                  location: "BANISHED",
                  index: 0,
                  position: "FaceUpAttack"
                },
                {
                  uid: "idle-view-banished-2",
                  id: 4002,
                  player: 0,
                  location: "BANISHED",
                  index: 1,
                  position: "FaceUpAttack"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await waitFor(() => document.querySelector('[data-uid="idle-view-banished-2"]'), 1000);

    const closeViewer = async () => {
      document.querySelector("#idleExtraDeckViewer #revealed")?.dispatchEvent(new dom.window.MouseEvent("click", {
        bubbles: true
      }));
      await flush(30);
      assert.equal(document.querySelector("#idleExtraDeckViewer #revealed"), null);
    };

    document.querySelector('[data-uid="idle-view-extra-2"]')?.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 640,
      pageY: 360
    }));
    await flush(30);

    await clickActionButton("View");
    assert.equal(document.querySelector("#idleExtraDeckViewer #revealed")?.getAttribute("data-mode"), "view");
    assert.equal(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-card").length, 2);
    assert.equal(document.querySelector("#viewDecks #revealed"), null);
    assert.deepEqual(
      Array.from(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-card-coordinate")).map((node) => node.textContent?.trim()),
      ["Your Extra Deck 1", "Your Extra Deck 2"]
    );
    await closeViewer();

    document.querySelector('[data-uid="idle-view-grave-2"]')?.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 640,
      pageY: 360
    }));
    await flush(30);

    await clickActionButton("View");
    assert.equal(document.querySelector("#idleExtraDeckViewer #revealed")?.getAttribute("data-mode"), "view");
    assert.equal(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-card").length, 2);
    assert.deepEqual(
      Array.from(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-card-coordinate")).map((node) => node.textContent?.trim()),
      ["Your Graveyard 1", "Your Graveyard 2"]
    );
    await closeViewer();

    document.querySelector('[data-uid="idle-view-banished-2"]')?.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 640,
      pageY: 360
    }));
    await flush(30);

    await clickActionButton("View");
    assert.equal(document.querySelector("#idleExtraDeckViewer #revealed")?.getAttribute("data-mode"), "view");
    assert.equal(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-card").length, 2);
    assert.deepEqual(
      Array.from(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-card-coordinate")).map((node) => node.textContent?.trim()),
      ["Your Banished 1", "Your Banished 2"]
    );
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame pulses actionable extra deck piles during idle questions and lets the player resolve the command from the viewer", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 2001, name: "Dante, Traveler of the Burning Abyss" },
          { id: 2002, name: "Beatrice, Lady of the Eternal" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              EXTRA: [
                {
                  uid: "extra-view-1",
                  id: "unknown",
                  player: 0,
                  location: "EXTRA",
                  index: 0,
                  position: "FaceDown"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await waitFor(() => document.querySelector('.card.EXTRA.i0'), 1000);

    const extraActcover = document.querySelector('.actcover.p0.EXTRA');
    assert.ok(extraActcover);
    assert.equal(extraActcover?.classList.contains("enabled"), false);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_IDLECMD",
          uuid: "question-idle-extra-1",
          options: {
            special_summons: [
              { player: 0, location: "EXTRA", index: 1, id: 2002 }
            ]
          }
        }
      })
    }));
    await flush(30);

    await waitFor(() => document.querySelector('.card.EXTRA.i0'), 250);
    const extraPile = document.querySelector('.card.EXTRA.i0');
    assert.equal(extraPile?.getAttribute("data-command-hint-pulse"), "true");
    assert.equal(extraActcover?.classList.contains("enabled"), true);

    extraPile.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 640,
      pageY: 360
    }));
    await flush(30);

    assert.deepEqual(
      Array.from(document.querySelectorAll("#actions button")).map((button) => button.textContent?.trim()),
      ["View", "Special Summon"]
    );

    await clickActionButton("Special Summon");
    assert.equal(document.querySelector("#idleExtraDeckViewer #revealed")?.getAttribute("data-mode"), "spsummon");
    assert.equal(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-card").length, 1);
    assert.equal(document.querySelectorAll('#idleExtraDeckViewer #revealed img[data-actionable="true"]').length, 1);

    document.querySelector('#idleExtraDeckViewer #revealed img[data-actionable="true"]').dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 680,
      pageY: 320
    }));
    await flush(30);

    assert.equal(document.querySelector("#idleExtraDeckViewer #revealed"), null);

    const questionAnswer = socket.sent.find((entry) => entry.action === "question");
    assert.deepEqual(questionAnswer, {
      action: "question",
      answer: { type: "special_summons", i: 0 },
      uuid: "question-idle-extra-1"
    });
    assert.equal(document.querySelector("#idleExtraDeckViewer #revealed"), null);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame enables actcover overlays for activatable monster and spell zones during idle questions", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 2001, name: "Fire Lake of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              MONSTERZONE: [
                {
                  uid: "monster-activate-1",
                  id: 1001,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack"
                }
              ],
              SPELLZONE: [
                {
                  uid: "spell-activate-1",
                  id: 2001,
                  player: 0,
                  location: "SPELLZONE",
                  index: 0,
                  position: "FaceUp"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await waitFor(() => document.querySelector(".card.MONSTERZONE.i0"), 1000);
    await waitFor(() => document.querySelector(".card.SPELLZONE.i0"), 1000);

    const monsterActcover = document.querySelector(".actcover.p0.MONSTERZONE.i0"),
      spellActcover = document.querySelector(".actcover.p0.SPELLZONE.i0");

    assert.ok(monsterActcover);
    assert.ok(spellActcover);
    assert.equal(monsterActcover?.classList.contains("enabled"), false);
    assert.equal(spellActcover?.classList.contains("enabled"), false);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_IDLECMD",
          uuid: "question-idle-field-activate-1",
          options: {
            activatable_cards: [
              { player: 0, location: "MONSTERZONE", index: 0, id: 1001 }
            ],
            activates: [
              { player: 0, location: "SPELLZONE", index: 0, id: 2001 }
            ]
          }
        }
      })
    }));
    await flush(30);

    assert.equal(monsterActcover?.classList.contains("enabled"), true);
    assert.equal(spellActcover?.classList.contains("enabled"), true);

    document.querySelector(".card.p0.MONSTERZONE.i0")?.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 420,
      pageY: 360
    }));
    await flush(30);

    assert.deepEqual(
      Array.from(document.querySelectorAll("#actions button")).map((button) => button.textContent?.trim()),
      ["Activate"]
    );

    globalThis.app.duel.controls.clear();
    await flush(30);

    document.querySelector(".card.p0.SPELLZONE.i0")?.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 240,
      pageY: 440
    }));
    await flush(30);

    assert.deepEqual(
      Array.from(document.querySelectorAll("#actions button")).map((button) => button.textContent?.trim()),
      ["Activate"]
    );

    globalThis.app.duel.idle({});
    await flush(30);

    assert.equal(monsterActcover?.classList.contains("enabled"), false);
    assert.equal(spellActcover?.classList.contains("enabled"), false);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame reapplies idle controls when the same idle question is resent", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 2001, name: "Dante, Traveler of the Burning Abyss" },
          { id: 2002, name: "Beatrice, Lady of the Eternal" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              EXTRA: [
                {
                  uid: "extra-retry-view-1",
                  id: "unknown",
                  player: 0,
                  location: "EXTRA",
                  index: 0,
                  position: "FaceDown"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await waitFor(() => document.querySelector('.card.EXTRA.i0'), 1000);

    const extraActcover = document.querySelector('.actcover.p0.EXTRA');
    assert.ok(extraActcover);
    assert.equal(extraActcover?.classList.contains("enabled"), false);

    const questionMessage = {
      duelAction: "question",
      command: "MSG_SELECT_IDLECMD",
      options: {
        special_summons: [
          { player: 0, location: "EXTRA", index: 1, id: 2002 }
        ]
      }
    };

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          ...questionMessage,
          uuid: "question-idle-retry-1"
        }
      })
    }));
    await flush(30);

    const extraPile = document.querySelector('.card.EXTRA.i0');
    assert.equal(extraPile?.getAttribute("data-command-hint-pulse"), "true");
    assert.equal(extraActcover?.classList.contains("enabled"), true);

    globalThis.app.duel.idle({});
    await flush(30);
    assert.equal(extraPile?.getAttribute("data-command-hint-pulse"), "false");
    assert.equal(extraActcover?.classList.contains("enabled"), false);

    extraPile.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 640,
      pageY: 360
    }));
    await flush(30);

    assert.deepEqual(
      Array.from(document.querySelectorAll("#actions button")).map((button) => button.textContent?.trim()),
      ["View"]
    );
    assert.equal(extraActcover?.classList.contains("enabled"), false);
    globalThis.app.duel.controls.clear();
    await flush(30);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          ...questionMessage,
          uuid: "question-idle-retry-2"
        }
      })
    }));
    await flush(30);

    assert.equal(extraPile?.getAttribute("data-command-hint-pulse"), "true");
    assert.equal(extraActcover?.classList.contains("enabled"), true);

    extraPile.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 640,
      pageY: 360
    }));
    await flush(30);

    assert.deepEqual(
      Array.from(document.querySelectorAll("#actions button")).map((button) => button.textContent?.trim()),
      ["View", "Special Summon"]
    );

    await clickActionButton("Special Summon");
    document.querySelector('#idleExtraDeckViewer #revealed img[data-actionable="true"]').dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 680,
      pageY: 320
    }));
    await flush(30);

    const questionAnswer = socket.sent.find((entry) => entry.action === "question");
    assert.deepEqual(questionAnswer, {
      action: "question",
      answer: { type: "special_summons", i: 0 },
      uuid: "question-idle-retry-2"
    });
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame keeps the idle extra deck viewer open on card clicks and closes it on the close icon and backdrop", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 2001, name: "Dante, Traveler of the Burning Abyss" },
          { id: 2002, name: "Beatrice, Lady of the Eternal" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              EXTRA: [
                {
                  uid: "extra-idle-view-1",
                  id: 2001,
                  player: 0,
                  location: "EXTRA",
                  index: 0,
                  position: "FaceDown"
                },
                {
                  uid: "extra-idle-view-2",
                  id: 2002,
                  player: 0,
                  location: "EXTRA",
                  index: 1,
                  position: "FaceDown"
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await waitFor(() => document.querySelector('.card.EXTRA[data-id="2002"]'), 1000);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_IDLECMD",
          uuid: "question-idle-extra-viewer-1",
          options: {
            special_summons: [
              { player: 0, location: "EXTRA", index: 1, id: 2002 }
            ]
          }
        }
      })
    }));
    await flush(30);

    document.querySelector('.card.EXTRA[data-id="2002"]').dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 640,
      pageY: 360
    }));
    await flush(30);

    await clickActionButton("View");
    assert.equal(document.querySelector("#idleExtraDeckViewer #revealed")?.getAttribute("data-mode"), "view");
    const actionableCard = document.querySelector('#idleExtraDeckViewer #revealed img[data-actionable="true"]');
    assert.ok(actionableCard);
    assert.equal(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-close").length, 1);

    actionableCard.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 680,
      pageY: 320
    }));
    await flush(30);

    assert.equal(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-card").length, 2);
    assert.equal(document.querySelectorAll("#actions button").length, 0);

    document.querySelector("#idleExtraDeckViewer #revealed .reveal-close").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(30);

    assert.equal(document.querySelector("#idleExtraDeckViewer #revealed"), null);

    document.querySelector('.card.EXTRA[data-id="2002"]').dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 640,
      pageY: 360
    }));
    await flush(30);

    await clickActionButton("View");
    assert.equal(document.querySelector("#idleExtraDeckViewer #revealed")?.getAttribute("data-mode"), "view");

    document.querySelector("#idleExtraDeckViewer #revealed").dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true
    }));
    await flush(30);

    assert.equal(document.querySelector("#idleExtraDeckViewer #revealed"), null);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame adds a View action for Xyz stacks and shows overlay materials with their own artwork", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 83531441, name: "Dante, Traveler of the Burning Abyss", rank: 3, attack: 2500, def: 1000 },
          { id: 36553319, name: "Farfa, Malebranche of the Burning Abyss", level: 3, attack: 1000, def: 1900 },
          { id: 62957424, name: "Libic, Malebranche of the Burning Abyss", level: 3, attack: 1700, def: 1000 }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              MONSTERZONE: [
                {
                  uid: "xyz-host",
                  id: 83531441,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  overlayindex: 0,
                  position: "FaceUpAttack",
                  attack: 2500,
                  def: 1000
                },
                {
                  uid: "xyz-material-1",
                  id: 36553319,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  overlayindex: 1,
                  position: "FaceUpAttack",
                  attack: 1000,
                  def: 1900
                },
                {
                  uid: "xyz-material-2",
                  id: 62957424,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  overlayindex: 2,
                  position: "FaceUpAttack",
                  attack: 1700,
                  def: 1000
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await waitFor(() => document.querySelector('[data-uid="xyz-material-2"]'), 1000);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "question",
          command: "MSG_SELECT_IDLECMD",
          uuid: "question-idle-overlay-view-1",
          options: {
            attackable_cards: [
              { player: 0, location: "MONSTERZONE", index: 0, id: 83531441 }
            ]
          }
        }
      })
    }));
    await flush(30);

    const firstMaterial = document.querySelector('[data-uid="xyz-material-1"]');
    const secondMaterial = document.querySelector('[data-uid="xyz-material-2"]');
    assert.match(firstMaterial?.querySelector("img")?.getAttribute("src") || "", /36553319\.jpg$/);
    assert.match(secondMaterial?.querySelector("img")?.getAttribute("src") || "", /62957424\.jpg$/);

    document.querySelector('[data-uid="xyz-host"]')?.dispatchEvent(new dom.window.MouseEvent("click", {
      bubbles: true,
      pageX: 640,
      pageY: 360
    }));
    await flush(30);

    assert.deepEqual(
      Array.from(document.querySelectorAll("#actions button")).map((button) => button.textContent?.trim()),
      ["Attack", "View"]
    );

    Array.from(document.querySelectorAll("#actions button"))
      .find((button) => button.textContent?.trim() === "View")
      ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await flush(30);

    assert.equal(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-card").length, 2);
    assert.deepEqual(
      Array.from(document.querySelectorAll("#idleExtraDeckViewer #revealed .reveal-card-coordinate")).map((node) => node.textContent?.trim()),
      ["Your Overlay Unit 1", "Your Overlay Unit 2"]
    );
    assert.equal(socket.sent.some((entry) => entry.action === "question"), false);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame treats reload as a hard field reset, renders player/card hints, and keeps XYZ stacks aligned", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss", atk: 1000, def: 1000 },
          { id: 1002, name: "Scarm, Malebranche of the Burning Abyss", atk: 800, def: 0 },
          { id: 83531441, name: "Dante, Traveler of the Burning Abyss", rank: 3, attack: 2500, def: 1000 },
          { id: 36553319, name: "Farfa, Malebranche of the Burning Abyss", level: 3, attack: 1000, def: 1900 },
          { id: 62957424, name: "Libic, Malebranche of the Burning Abyss", level: 3, attack: 1700, def: 1000 }
        ]
      };
    }

    if (url === "/manifest/strings.json") {
      return {
        ok: true,
        json: async () => ({ system: {} })
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              MONSTERZONE: [
                {
                  uid: "stale-monster",
                  id: 1002,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack",
                  attack: 800,
                  def: 0
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await flush(20);

    assert.equal(document.querySelector(".card.p0.MONSTERZONE")?.getAttribute("data-id"), "1002");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "reload",
          info: {
            lifepoints: [7200, 5000],
            phase: 0,
            turn: 3,
            playerHints: {
              0: ["Cannot attack directly this turn."],
              1: ["Can only Special Summon Fiends this turn."]
            }
          },
          names: ["alice", "bob"],
          field: [
            {
              MONSTERZONE: [
                {
                  uid: "reloaded-monster",
                  id: 83531441,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack",
                  overlayindex: 0,
                  attack: 2500,
                  def: 1000,
                  card_hint_text: "Turn 2",
                  desc_hints: ["Negated until the End Phase."]
                },
                {
                  uid: "reloaded-material-1",
                  id: 36553319,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  overlayindex: 1,
                  position: "FaceUpAttack",
                  attack: 1000,
                  def: 1900
                },
                {
                  uid: "reloaded-material-2",
                  id: 62957424,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  overlayindex: 2,
                  position: "FaceUpAttack",
                  attack: 1700,
                  def: 1000
                }
              ]
            },
            {}
          ]
        }
      })
    }));
    await flush(30);

    const reloadedCard = document.querySelector('.card.p0.MONSTERZONE[data-overlayindex="0"]');
    const firstMaterial = document.querySelector('.card.p0.MONSTERZONE[data-overlayindex="1"]');
    const secondMaterial = document.querySelector('.card.p0.MONSTERZONE[data-overlayindex="2"]');

    assert.equal(document.querySelectorAll(".card.p0.MONSTERZONE.i0").length, 3);
    assert.equal(reloadedCard?.getAttribute("data-id"), "83531441");
    assert.equal(reloadedCard?.getAttribute("data-uid"), "reloaded-monster");
    assert.equal(firstMaterial?.getAttribute("data-id"), "36553319");
    assert.equal(secondMaterial?.getAttribute("data-id"), "62957424");
    assert.equal(document.querySelector('[data-uid="stale-monster"]'), null);
    assert.match(reloadedCard?.getAttribute("data-header") || "", /R 3/);
    assert.match(reloadedCard?.getAttribute("data-footer") || "", /Turn 2/);
    assert.match(reloadedCard?.getAttribute("data-footer") || "", /Negated until the End Phase\./);
    assert.equal(firstMaterial?.getAttribute("data-header") || "", "");
    assert.equal(firstMaterial?.getAttribute("data-footer") || "", "");
    assert.equal(secondMaterial?.getAttribute("data-header") || "", "");
    assert.equal(secondMaterial?.getAttribute("data-footer") || "", "");
    assert.equal(reloadedCard?.style.transform || "", "");
    assert.equal(firstMaterial?.style.transform, "translate(-6px, 4px)");
    assert.equal(secondMaterial?.style.transform, "translate(-1px, 8px)");
    assert.equal(firstMaterial?.style.zIndex, "-1");
    assert.equal(secondMaterial?.style.zIndex, "-2");
    assert.deepEqual(
      Array.from(document.querySelectorAll(".lp-slot.p0 .lp-hint")).map((node) => node.textContent),
      ["Cannot attack directly this turn."]
    );
    assert.deepEqual(
      Array.from(document.querySelectorAll(".lp-slot.p1 .lp-hint")).map((node) => node.textContent),
      ["Can only Special Summon Fiends this turn."]
    );
    assert.deepEqual(
      Array.from(document.querySelectorAll(".lp-value")).map((node) => node.textContent),
      ["7200", "5000"]
    );
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame renders field-disabled X markers and reuses the coin toss result UI during duel announcements", async () => {
  const { dom, restore } = installDom();
  let socket = null;
  const playedSounds = [];

  class FakeAudio {
    constructor(src) {
      this.src = src;
      this.currentTime = 0;
    }

    play() {
      playedSounds.push(this.src);
      return Promise.resolve();
    }
  }

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.Audio = FakeAudio;
  globalThis.window.Audio = FakeAudio;
  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await waitFor(() => document.querySelector('.card.MONSTERZONE.i0[data-id="1001"]'), 1000);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_FIELD_DISABLED",
            ui: {
              kind: "field_disabled",
              zones: [
                { player: 0, location: "MONSTERZONE", index: 0 },
                { player: 1, location: "SPELLZONE", index: 2 }
              ]
            }
          }
        }
      })
    }));
    await flush(20);

    assert.ok(document.querySelector(".fielddisabledzone.active.p0.MONSTERZONE.i0"));
    assert.ok(document.querySelector(".fielddisabledzone.active.p1.SPELLZONE.i2"));
    assert.ok(document.querySelector(".fielddisabledzone.inactive.p0.MONSTERZONE.i1"));

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_TOSS_COIN",
            ui: {
              kind: "coin_result",
              player: 0,
              results: [true, false],
              sound: "coinflip"
            }
          }
        }
      })
    }));

    await waitFor(() => document.querySelector("#duel-choice-overlay #gofirst"), 250);
    assert.match(
      document.querySelector("#duel-choice-overlay #gofirst")?.textContent || "",
      /Coin toss results: heads, tails\./
    );
    assert.deepEqual(playedSounds, ["/sounds/coinflip.wav"]);

    await flush(1600);
    assert.equal(document.querySelector("#duel-choice-overlay #gofirst"), null);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame reuses the dice result overlay during duel announcements", async () => {
  const { dom, restore } = installDom();
  let socket = null;
  const playedSounds = [];

  class FakeAudio {
    constructor(src) {
      this.src = src;
      this.currentTime = 0;
    }

    play() {
      playedSounds.push(this.src);
      return Promise.resolve();
    }
  }

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.Audio = FakeAudio;
  globalThis.window.Audio = FakeAudio;
  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Graff, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_TOSS_DICE",
            ui: {
              kind: "dice_result",
              player: 0,
              results: [6, 2],
              sound: "diceroll"
            }
          }
        }
      })
    }));

    await waitFor(() => document.querySelector("#duel-choice-overlay #gofirst"), 250);
    assert.match(
      document.querySelector("#duel-choice-overlay #gofirst")?.textContent || "",
      /Dice roll results: 6, 2\./
    );
    assert.deepEqual(playedSounds, ["/sounds/diceroll.wav"]);

    await flush(1600);
    assert.equal(document.querySelector("#duel-choice-overlay #gofirst"), null);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame glows hover-linked target cards and shows the equip icon on hovered equip cards", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Burning Spear" },
          { id: 2001, name: "Graff, Malebranche of the Burning Abyss" },
          { id: 2002, name: "Scarm, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              SPELLZONE: [
                {
                  uid: "equip-source",
                  id: 1001,
                  player: 0,
                  location: "SPELLZONE",
                  index: 0,
                  position: "FaceUp",
                  equipCard: {
                    player: 1,
                    location: "MONSTERZONE",
                    index: 0
                  },
                  cardTarget: [
                    {
                      player: 1,
                      location: "MONSTERZONE",
                      index: 1
                    }
                  ]
                }
              ]
            },
            {
              MONSTERZONE: [
                {
                  uid: "equip-target",
                  id: 2001,
                  player: 1,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack"
                },
                {
                  uid: "card-target",
                  id: 2002,
                  player: 1,
                  location: "MONSTERZONE",
                  index: 1,
                  position: "FaceUpAttack"
                }
              ]
            }
          ]
        }
      })
    }));
    await flush(20);

    const sourceCard = document.querySelector(".card.p0.SPELLZONE.i0");
    const equipTarget = document.querySelector(".card.p1.MONSTERZONE.i0");
    const cardTarget = document.querySelector(".card.p1.MONSTERZONE.i1");

    assert.ok(sourceCard);
    assert.ok(equipTarget);
    assert.ok(cardTarget);

    sourceCard.dispatchEvent(new dom.window.MouseEvent("mouseover", { bubbles: true }));
    await flush(20);

    assert.ok(sourceCard.querySelector('[data-relation-overlay="equip"]'));
    assert.equal(equipTarget.classList.contains("targetglow"), true);
    assert.equal(cardTarget.classList.contains("targetglow"), true);

    sourceCard.dispatchEvent(new dom.window.MouseEvent("mouseout", { bubbles: true }));
    await flush(20);

    assert.equal(sourceCard.querySelector('[data-relation-overlay="equip"]'), null);
    assert.equal(equipTarget.classList.contains("targetglow"), false);
    assert.equal(cardTarget.classList.contains("targetglow"), false);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame pulses target cards when MSG_BECOME_TARGET is announced", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Burning Spear" },
          { id: 2001, name: "Graff, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              MONSTERZONE: [
                {
                  uid: "source-card",
                  id: 1001,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack"
                }
              ]
            },
            {
              MONSTERZONE: [
                {
                  uid: "target-card",
                  id: 2001,
                  player: 1,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack"
                }
              ]
            }
          ]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_BECOME_TARGET",
            ui: {
              kind: "target_event",
              phase: "become_target",
              cards: [
                {
                  player: 1,
                  location: "MONSTERZONE",
                  index: 0
                }
              ],
              duration: 30
            }
          }
        }
      })
    }));
    await flush(10);

    const targetCard = await waitFor(() => document.querySelector(".card.p1.MONSTERZONE.i0"), 250);

    assert.ok(targetCard);
    assert.equal(targetCard.classList.contains("targetglow"), true);
    assert.equal(targetCard.getAttribute("data-target-pulse"), "true");

    await flush(140);

    assert.equal(targetCard.classList.contains("targetglow"), false);
    assert.equal(targetCard.getAttribute("data-target-pulse"), "false");
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame pulses selected cards and shows transient timing notices", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => [
          { id: 1001, name: "Burning Spear" },
          { id: 2001, name: "Graff, Malebranche of the Burning Abyss" }
        ]
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [
            {
              MONSTERZONE: [
                {
                  uid: "selected-card",
                  id: 1001,
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack"
                }
              ]
            },
            {
              MONSTERZONE: [
                {
                  uid: "missed-card",
                  id: 2001,
                  player: 1,
                  location: "MONSTERZONE",
                  index: 0,
                  position: "FaceUpAttack"
                }
              ]
            }
          ]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_CARD_SELECTED",
            ui: {
              kind: "selection_event",
              phase: "card_selected",
              cards: [
                {
                  player: 0,
                  location: "MONSTERZONE",
                  index: 0
                }
              ],
              duration: 30
            }
          }
        }
      })
    }));
    await flush(10);

    const selectedCard = await waitFor(() => document.querySelector('.card.MONSTERZONE.i0[data-id="1001"]'), 1000);
    assert.ok(selectedCard);
    assert.equal(selectedCard.classList.contains("selectionglow"), true);
    assert.equal(selectedCard.getAttribute("data-selection-pulse"), "true");

    await flush(140);

    assert.equal(selectedCard.classList.contains("selectionglow"), false);
    assert.equal(selectedCard.getAttribute("data-selection-pulse"), "false");

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_MISSED_EFFECT",
            ui: {
              kind: "selection_event",
              phase: "missed_effect",
              cards: [
                {
                  player: 1,
                  location: "MONSTERZONE",
                  index: 0
                }
              ],
              text: "\"Burning Spear\" missed the timing",
              duration: 30
            }
          }
        }
      })
    }));
    await flush(10);

    const missedCard = document.querySelector(".card.p1.MONSTERZONE.i0");
    const prompt = await waitFor(() => document.querySelector("#duelquestionprompt"), 250);
    assert.ok(missedCard);
    assert.equal(missedCard.classList.contains("selectionglow"), true);
    assert.ok(prompt);
    assert.match(prompt.textContent, /missed the timing/i);

    await flush(140);

    assert.equal(document.querySelector("#duelquestionprompt"), null);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_ATTACK_DISABLED",
            ui: {
              kind: "notice",
              text: "An attack was negated",
              duration: 30
            }
          }
        }
      })
    }));
    await flush(10);

    const attackPrompt = await waitFor(() => document.querySelector("#duelquestionprompt"), 250);
    assert.ok(attackPrompt);
    assert.match(attackPrompt.textContent, /attack was negated/i);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame renders MSG_WAITING in the shared duel prompt instead of the LP banner", async () => {
  const { dom, restore } = installDom();
  let socket = null;

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => []
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "bob"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_WAITING"
          }
        }
      })
    }));
    await flush(20);

    assert.equal(
      document.getElementById("duelquestionprompt")?.textContent?.trim(),
      "Waiting,..."
    );
    assert.equal(document.getElementById("ygowaiting"), null);
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});

test("startGame surfaces AI metadata, show hints, and custom messages through the browser UI contract", async () => {
  const { dom, restore } = installDom();
  let socket = null;
  const originalConsoleLog = console.log;
  const logs = [];

  class FakeWebSocket extends dom.window.EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      super();
      this.url = url;
      this.readyState = FakeWebSocket.OPEN;
      this.sent = [];
      socket = this;

      setTimeout(() => {
        this.dispatchEvent(new dom.window.Event("open"));
      }, 0);
    }

    send(payload) {
      this.sent.push(JSON.parse(payload));
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.dispatchEvent(new dom.window.Event("close"));
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url) => {
    if (url === "/manifest/manifest_0-language-merged.json") {
      return {
        ok: true,
        json: async () => []
      };
    }

    if (url === "/api/websocket-port") {
      return {
        ok: true,
        json: async () => ({ port: 31337 })
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };
  console.log = (...args) => {
    logs.push(args.join(" "));
  };

  const cleanup = await startGame(12345);

  try {
    await waitFor(() => socket, 500);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_AI_NAME",
            ui: {
              kind: "lobby_metadata",
              aiName: "Yugi Bot",
              opponentName: "Yugi Bot",
            }
          }
        }
      })
    }));
    assert.deepEqual(
      resolveAnnouncementContract({
        command: "MSG_AI_NAME",
        ai_name: "Yugi Bot",
        opponent_name: "Yugi Bot",
      }),
      {
        kind: "lobby_metadata",
        aiName: "Yugi Bot",
        opponentName: "Yugi Bot",
      }
    );

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "start" })
    }));
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "start",
          info: {
            lifepoints: [8000, 8000],
            phase: 0,
            turn: 1
          },
          names: ["alice", "Yugi Bot"],
          field: [{}, {}]
        }
      })
    }));
    await flush(20);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_SHOW_HINT",
            ui: {
              kind: "notice",
              text: "A duel script says hello",
              duration: 30,
              log: true,
              logLabel: "MSG_SHOW_HINT"
            }
          }
        }
      })
    }));
    await flush(10);

    const hintPrompt = await waitFor(() => document.querySelector("#duelquestionprompt"), 250);
    assert.ok(hintPrompt);
    assert.match(hintPrompt.textContent, /duel script says hello/i);

    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({
        action: "ygopro",
        message: {
          duelAction: "announcement",
          message: {
            command: "MSG_CUSTOM_MSG",
            ui: {
              kind: "notice",
              text: "Custom duel message received.",
              duration: 30,
              log: true,
              logLabel: "MSG_CUSTOM_MSG"
            }
          }
        }
      })
    }));
    const customPrompt = await waitFor(() => document.querySelector("#duelquestionprompt"), 250);
    assert.ok(customPrompt);
    assert.match(customPrompt.textContent, /custom duel message received/i);
    assert.ok(logs.some((line) => line.includes("[ygopro/MSG_SHOW_HINT] A duel script says hello")));
    assert.ok(logs.some((line) => line.includes("[ygopro/MSG_CUSTOM_MSG] Custom duel message received.")));
  } finally {
    console.log = originalConsoleLog;
    await cleanup();
    await flush(50);
    restore();
  }
});
// Run with: npm run test:parity
