const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const runtimeRequire = eval("require");

const modelAutomaticFieldModulePath = path.resolve(
  process.cwd(),
  "server",
  "core",
  "core",
  "model_automatic_field.js",
);

function loadGameModel() {
  delete require.cache[modelAutomaticFieldModulePath];
  return runtimeRequire(modelAutomaticFieldModulePath);
}

function sortByPlayerLocationIndex(left, right) {
  return String(left.player).localeCompare(String(right.player))
    || String(left.location).localeCompare(String(right.location))
    || left.index - right.index
    || (left.overlayindex || 0) - (right.overlayindex || 0);
}

test("Game shuffleExtra updates facedown extra cards while keeping face-up cards intact", () => {
  const Game = loadGameModel();
  const updates = [];
  const game = new Game((view, cards) => {
    updates.push(cards.map((card) => ({ ...card })));
  });

  game.addCard("EXTRA", 0, 0, 111);
  game.addCard("EXTRA", 0, 1, 222);
  game.update({
    player: 0,
    location: "EXTRA",
    index: 1,
    position: "FaceUp",
  });

  game.shuffleExtra(0, [9001, 9002]);

  const extraCards = game.stack.cards()
    .filter((card) => card.player === 0 && card.location === "EXTRA")
    .sort((left, right) => left.index - right.index);

  assert.deepEqual(extraCards.map((card) => ({
    id: card.id,
    index: card.index,
    position: card.position,
  })), [
    { id: 9001, index: 0, position: "FaceDown" },
    { id: 222, index: 1, position: "FaceUp" },
  ]);
  assert.ok(updates.length >= 1);
});

test("Game shuffleSetCards swaps set cards, clears their public identity, and keeps the stack indexed", () => {
  const Game = loadGameModel();
  const game = new Game(() => {});

  game.addCard("SPELLZONE", 0, 0, 101);
  game.addCard("SPELLZONE", 0, 1, 202);

  const before = game.stack.cards()
    .filter((card) => card.player === 0 && card.location === "SPELLZONE")
    .sort((left, right) => left.index - right.index)
    .map((card) => ({
      uid: card.uid,
      index: card.index,
    }));

  game.shuffleSetCards("SPELLZONE", [
    {
      from: { player: 0, location: "SPELLZONE", index: 0 },
      to: { player: 0, location: "SPELLZONE", index: 1 },
    },
    {
      from: { player: 0, location: "SPELLZONE", index: 1 },
      to: { player: 0, location: "SPELLZONE", index: 0 },
    },
  ]);

  const after = game.stack.cards()
    .filter((card) => card.player === 0 && card.location === "SPELLZONE")
    .sort((left, right) => left.index - right.index)
    .map((card) => ({
      uid: card.uid,
      id: card.id,
      index: card.index,
      position: card.position,
    }));

  assert.deepEqual(after, [
    {
      uid: before[1].uid,
      id: "unknown",
      index: 0,
      position: "FaceDown",
    },
    {
      uid: before[0].uid,
      id: "unknown",
      index: 1,
      position: "FaceDown",
    },
  ]);
});

test("Game removeCards removes both field cards and overlay materials", () => {
  const Game = loadGameModel();
  const game = new Game(() => {});

  game.addCard("MONSTERZONE", 0, 0, 1001);
  game.addCard("MONSTERZONE", 0, 1, 1002);
  game.attachMaterial(
    { player: 0, location: "MONSTERZONE", index: 1 },
    { player: 0, location: "MONSTERZONE", index: 0 },
  );

  let cards = game.stack.cards()
    .filter((card) => card.player === 0 && card.location === "MONSTERZONE")
    .sort(sortByPlayerLocationIndex);

  assert.equal(cards.length, 2);
  assert.deepEqual(cards.map((card) => ({
    id: card.id,
    overlayindex: card.overlayindex,
  })), [
    { id: 1001, overlayindex: 0 },
    { id: 1002, overlayindex: 1 },
  ]);

  game.removeCards([
    { player: 0, location: "MONSTERZONE", index: 0, overlayindex: 1 },
  ]);

  cards = game.stack.cards()
    .filter((card) => card.player === 0 && card.location === "MONSTERZONE")
    .sort(sortByPlayerLocationIndex);

  assert.deepEqual(cards.map((card) => ({
    id: card.id,
    overlayindex: card.overlayindex,
  })), [
    { id: 1001, overlayindex: 0 },
  ]);

  game.removeCards([
    { player: 0, location: "MONSTERZONE", index: 0 },
  ]);

  cards = game.stack.cards()
    .filter((card) => card.player === 0 && card.location === "MONSTERZONE");

  assert.equal(cards.length, 0);
});

test("Game attachMaterial keeps later zone lookups pointed at the live host pile", () => {
  const Game = loadGameModel();
  const game = new Game(() => {});

  game.addCard("MONSTERZONE", 0, 0, 1001);
  game.addCard("MONSTERZONE", 0, 1, 1002);
  game.addCard("MONSTERZONE", 0, 2, 1003);

  game.attachMaterial(
    { player: 0, location: "MONSTERZONE", index: 1 },
    { player: 0, location: "MONSTERZONE", index: 0 },
  );

  game.addCard("MONSTERZONE", 0, 1, 1004);

  game.attachMaterial(
    { player: 0, location: "MONSTERZONE", index: 2 },
    { player: 0, location: "MONSTERZONE", index: 1 },
  );

  const cards = game.stack.cards()
    .filter((card) => card.player === 0 && card.location === "MONSTERZONE")
    .sort(sortByPlayerLocationIndex);

  assert.deepEqual(cards.map((card) => ({
    id: card.id,
    index: card.index,
    overlayindex: card.overlayindex,
  })), [
    { id: 1001, index: 0, overlayindex: 0 },
    { id: 1002, index: 0, overlayindex: 1 },
    { id: 1004, index: 1, overlayindex: 0 },
    { id: 1003, index: 1, overlayindex: 1 },
  ]);
});

test("Game render keeps overlay material identities after the host pile updates", () => {
  const Game = loadGameModel();
  const game = new Game(() => {});

  game.addCard("MONSTERZONE", 0, 0, 83531441);
  game.addCard("MONSTERZONE", 0, 1, 36553319);
  game.addCard("MONSTERZONE", 0, 2, 62957424);

  game.attachMaterial(
    { player: 0, location: "MONSTERZONE", index: 1 },
    { player: 0, location: "MONSTERZONE", index: 0 },
  );
  game.attachMaterial(
    { player: 0, location: "MONSTERZONE", index: 2 },
    { player: 0, location: "MONSTERZONE", index: 0 },
  );

  game.update({
    player: 0,
    location: "MONSTERZONE",
    index: 0,
    id: 83531441,
    position: "FaceUpAttack",
    attack: 2500,
    def: 1000,
  });

  const cards = game.stack.cards()
    .filter((card) => card.player === 0 && card.location === "MONSTERZONE")
    .sort(sortByPlayerLocationIndex);

  assert.deepEqual(cards.map((card) => ({
    id: card.id,
    index: card.index,
    overlayindex: card.overlayindex,
  })), [
    { id: 83531441, index: 0, overlayindex: 0 },
    { id: 36553319, index: 0, overlayindex: 1 },
    { id: 62957424, index: 0, overlayindex: 2 },
  ]);
});

test("Game question re-emits identical unanswered prompts and retries with a fresh uuid", () => {
  const Game = loadGameModel();
  const outputs = [];
  const answers = [];
  const game = new Game((view) => {
    outputs.push(view?.p0);
  });

  const options = {
    command: "MSG_ANNOUNCE_NUMBER",
    prompt_text: "Select a number",
    announcement_values: [3, 4, 5],
  };

  game.question("p0", "MSG_ANNOUNCE_NUMBER", options, { min: 1, max: 1 }, (answer) => {
    answers.push(answer);
  });

  const firstUuid = outputs[0]?.uuid;

  game.question("p0", "MSG_ANNOUNCE_NUMBER", { ...options }, { min: 1, max: 1 }, (answer) => {
    answers.push(answer);
  });

  assert.equal(outputs.length, 2);
  assert.equal(outputs[0]?.command, "MSG_ANNOUNCE_NUMBER");
  assert.equal(outputs[1]?.command, "MSG_ANNOUNCE_NUMBER");
  assert.notEqual(outputs[1]?.uuid, firstUuid);

  const latestUuid = outputs[1]?.uuid;

  game.respond({
    uuid: latestUuid,
    answer: { type: "number", i: 4 },
  });

  assert.deepEqual(answers, [{ type: "number", i: 4 }]);

  game.retryLastQuestion();

  assert.equal(outputs.length, 3);
  assert.notEqual(outputs[2]?.uuid, latestUuid);
  assert.equal(outputs[2]?.command, "MSG_ANNOUNCE_NUMBER");
});

test("Game still emits repeated idle command prompts even when the payload matches", () => {
  const Game = loadGameModel();
  const outputs = [];
  const game = new Game((view) => {
    outputs.push(view?.p0);
  });

  const options = {
    command: "MSG_SELECT_IDLECMD",
    summons: [
      {
        player: 0,
        location: "HAND",
        index: 0,
        id: 1001,
      },
    ],
  };

  game.question("p0", "MSG_SELECT_IDLECMD", options, { min: 1, max: 1 }, () => {});
  game.question("p0", "MSG_SELECT_IDLECMD", { ...options }, { min: 1, max: 1 }, () => {});

  assert.equal(outputs.length, 2);
  assert.equal(outputs[0]?.command, "MSG_SELECT_IDLECMD");
  assert.equal(outputs[1]?.command, "MSG_SELECT_IDLECMD");
  assert.notEqual(outputs[0]?.uuid, outputs[1]?.uuid);
});

test("Game stores cardTarget arrays and equipCard coordinates on server-side cards", () => {
  const Game = loadGameModel();
  const updates = [];
  const game = new Game((view, cards) => {
    updates.push({
      action: view?.p0?.duelAction,
      cards: cards.map((card) => ({
        ...card,
        cardTarget: Array.isArray(card.cardTarget)
          ? card.cardTarget.map((target) => ({ ...target }))
          : card.cardTarget,
        equipCard: card.equipCard ? { ...card.equipCard } : card.equipCard,
      })),
    });
  });

  game.addCard("MONSTERZONE", 0, 0, 1001);
  game.addCard("MONSTERZONE", 1, 1, 2002);
  game.addCard("SPELLZONE", 0, 0, 3003);

  let cards = game.stack.cards().sort(sortByPlayerLocationIndex);
  const sourceMonster = cards.find((card) => card.player === 0 && card.location === "MONSTERZONE" && card.index === 0);
  const sourceSpell = cards.find((card) => card.player === 0 && card.location === "SPELLZONE" && card.index === 0);

  assert.equal(Object.prototype.hasOwnProperty.call(sourceMonster, "cardTarget"), true);
  assert.equal(sourceMonster.cardTarget, undefined);
  assert.equal(Object.prototype.hasOwnProperty.call(sourceSpell, "equipCard"), true);
  assert.equal(sourceSpell.equipCard, undefined);

  game.addCardTarget(
    { player: 0, location: "MONSTERZONE", index: 0 },
    { player: 1, location: "MONSTERZONE", index: 1 },
  );
  game.setEquipCard(
    { player: 0, location: "SPELLZONE", index: 0 },
    { player: 1, location: "MONSTERZONE", index: 1 },
  );

  cards = game.stack.cards().sort(sortByPlayerLocationIndex);

  assert.deepEqual(
    cards.find((card) => card.player === 0 && card.location === "MONSTERZONE" && card.index === 0)?.cardTarget,
    [{ player: 1, location: "MONSTERZONE", index: 1 }],
  );
  assert.deepEqual(
    cards.find((card) => card.player === 0 && card.location === "SPELLZONE" && card.index === 0)?.equipCard,
    { player: 1, location: "MONSTERZONE", index: 1 },
  );

  game.removeCardTarget(
    { player: 0, location: "MONSTERZONE", index: 0 },
    { player: 1, location: "MONSTERZONE", index: 1 },
  );
  game.setEquipCard(
    { player: 0, location: "SPELLZONE", index: 0 },
    undefined,
  );

  cards = game.stack.cards().sort(sortByPlayerLocationIndex);

  assert.equal(
    cards.find((card) => card.player === 0 && card.location === "MONSTERZONE" && card.index === 0)?.cardTarget,
    undefined,
  );
  assert.equal(
    cards.find((card) => card.player === 0 && card.location === "SPELLZONE" && card.index === 0)?.equipCard,
    undefined,
  );
  assert.ok(updates.length >= 4);
});

test("Game reloadField clears stale cards, rebuilds piles, and emits a reload duel action", () => {
  const Game = loadGameModel();
  const updates = [];
  const game = new Game((view) => {
    updates.push(view);
  });

  game.addCard("MONSTERZONE", 0, 0, 9999);
  game.addCard("HAND", 1, 0, 8888);

  game.reloadField({
    flags: 7,
    players: [
      {
        lp: 7600,
        monsters: [
          { player: 0, location: "MONSTERZONE", index: 0, position: "FaceUpAttack", materials: 1 },
          null
        ],
        spells: [
          { player: 0, location: "SPELLZONE", index: 0, position: "FaceDown", materials: 0 }
        ],
        deck: [{ player: 0, location: "DECK", index: 0, position: "FaceDown", id: "unknown" }],
        hand: [],
        grave: [{ player: 0, location: "GRAVE", index: 0, position: "FaceUp", id: "unknown" }],
        banished: [],
        extra: [{ player: 0, location: "EXTRA", index: 0, position: "FaceDown", id: "unknown" }]
      },
      {
        lp: 5400,
        monsters: [],
        spells: [],
        deck: [],
        hand: [{ player: 1, location: "HAND", index: 0, position: "FaceDown", id: "unknown" }],
        grave: [],
        banished: [],
        extra: []
      }
    ],
    chain: [{ index: 0, description_text: "Chain link 1" }]
  });

  const cards = game.stack.cards().sort(sortByPlayerLocationIndex);

  assert.deepEqual(game.state.lifepoints, [7600, 5400]);
  assert.equal(game.state.duelFlags, 7);
  assert.deepEqual(game.state.chain, [{ index: 0, description_text: "Chain link 1" }]);
  assert.equal(cards.some((card) => card.id === 9999 || card.id === 8888), false);
  assert.deepEqual(cards.map((card) => ({
    player: card.player,
    location: card.location,
    index: card.index,
    position: card.position,
    overlayindex: card.overlayindex || 0
  })), [
    { player: 0, location: "DECK", index: 0, position: "FaceDown", overlayindex: 0 },
    { player: 0, location: "EXTRA", index: 0, position: "FaceDown", overlayindex: 0 },
    { player: 0, location: "GRAVE", index: 0, position: "FaceUp", overlayindex: 0 },
    { player: 0, location: "MONSTERZONE", index: 0, position: "FaceUpAttack", overlayindex: 0 },
    { player: 0, location: "MONSTERZONE", index: 0, position: "FaceUpAttack", overlayindex: 1 },
    { player: 0, location: "SPELLZONE", index: 0, position: "FaceDown", overlayindex: 0 },
    { player: 1, location: "HAND", index: 0, position: "FaceDown", overlayindex: 0 }
  ]);
  assert.equal(updates.at(-1)?.p0?.duelAction, "reload");
});

test("Game reloadField hydrates overlay material ids when the snapshot includes overlay cards", () => {
  const Game = loadGameModel();
  const game = new Game(() => {});

  game.reloadField({
    flags: 0,
    players: [
      {
        lp: 8000,
        monsters: [
          {
            player: 0,
            location: "MONSTERZONE",
            index: 0,
            position: "FaceUpAttack",
            materials: 2,
            overlay_cards: [36553319, 62957424],
          },
        ],
        spells: [
          {
            player: 0,
            location: "SPELLZONE",
            index: 1,
            position: "FaceDown",
            materials: 1,
            overlay_cards: [83531441],
          },
        ],
        deck: [],
        hand: [],
        grave: [],
        banished: [],
        extra: [],
      },
      {
        lp: 8000,
        monsters: [],
        spells: [],
        deck: [],
        hand: [],
        grave: [],
        banished: [],
        extra: [],
      },
    ],
    chain: [],
  });

  const cards = game.stack.cards()
    .filter((card) =>
      card.player === 0
      && ["MONSTERZONE", "SPELLZONE"].includes(card.location))
    .sort(sortByPlayerLocationIndex);

  assert.deepEqual(cards.map((card) => ({
    id: card.id,
    location: card.location,
    index: card.index,
    overlayindex: card.overlayindex,
  })), [
    { id: "unknown", location: "MONSTERZONE", index: 0, overlayindex: 0 },
    { id: 36553319, location: "MONSTERZONE", index: 0, overlayindex: 1 },
    { id: 62957424, location: "MONSTERZONE", index: 0, overlayindex: 2 },
    { id: "unknown", location: "SPELLZONE", index: 1, overlayindex: 0 },
    { id: 83531441, location: "SPELLZONE", index: 1, overlayindex: 1 },
  ]);
});

test("Game refreshDeck emits a maintenance update without mutating current piles", () => {
  const Game = loadGameModel();
  const updates = [];
  const game = new Game((view, cards) => {
    updates.push({
      action: view?.p0?.duelAction,
      cards: cards.map((card) => ({ ...card })),
    });
  });

  game.addCard("DECK", 0, 0, 4001);
  game.addCard("HAND", 0, 0, 1001);

  const before = game.stack.cards()
    .sort(sortByPlayerLocationIndex)
    .map((card) => ({
      player: card.player,
      location: card.location,
      index: card.index,
      position: card.position,
      id: card.id,
    }));

  game.refreshDeck();

  const after = game.stack.cards()
    .sort(sortByPlayerLocationIndex)
    .map((card) => ({
      player: card.player,
      location: card.location,
      index: card.index,
      position: card.position,
      id: card.id,
    }));

  assert.deepEqual(after, before);
  assert.equal(updates.at(-1)?.action, "duel");
  assert.deepEqual(
    updates.at(-1)?.cards.map((card) => ({
      player: card.player,
      location: card.location,
      index: card.index,
      position: card.position,
      id: card.id,
    })),
    before,
  );
});

test("Game tagSwap rebuilds one player's deck, hand, and extra piles from the tag packet", () => {
  const Game = loadGameModel();
  const updates = [];
  const game = new Game((view, cards) => {
    updates.push({
      action: view?.p0?.duelAction,
      cards: cards.map((card) => ({ ...card })),
    });
  });

  game.addCard("DECK", 0, 0, 101);
  game.addCard("HAND", 0, 0, 102);
  game.addCard("EXTRA", 0, 0, 103);
  game.addCard("MONSTERZONE", 0, 0, 104);
  game.addCard("DECK", 1, 0, 201);

  game.tagSwap({
    player: 0,
    deck_size: 3,
    deck_top_card: 4001,
    hand: [
      { id: 1001, position: "FaceUp" },
      { id: 1002, position: "FaceUp" },
    ],
    extra: [
      { id: 2001, position: "FaceDown" },
      { id: 2002, position: "FaceUp" },
    ],
  });

  const cards = game.stack.cards().sort(sortByPlayerLocationIndex);
  const playerZeroCards = cards.filter((card) => card.player === 0);
  const playerOneCards = cards.filter((card) => card.player === 1);

  assert.deepEqual(playerZeroCards.map((card) => ({
    location: card.location,
    index: card.index,
    position: card.position,
    id: card.id,
  })), [
    { location: "DECK", index: 0, position: "FaceDown", id: "unknown" },
    { location: "DECK", index: 1, position: "FaceDown", id: "unknown" },
    { location: "DECK", index: 2, position: "FaceDown", id: 4001 },
    { location: "EXTRA", index: 0, position: "FaceDown", id: 2001 },
    { location: "EXTRA", index: 1, position: "FaceUp", id: 2002 },
    { location: "HAND", index: 0, position: "FaceUp", id: 1001 },
    { location: "HAND", index: 1, position: "FaceUp", id: 1002 },
    { location: "MONSTERZONE", index: 0, position: "FaceDown", id: 104 },
  ]);
  assert.deepEqual(playerOneCards.map((card) => ({
    location: card.location,
    index: card.index,
    id: card.id,
  })), [
    { location: "DECK", index: 0, id: 201 },
  ]);
  assert.equal(updates.at(-1)?.action, "duel");
});

test("Game updateDeckTop stores the revealed card on the indexed deck pile and keeps the reversal flag", () => {
  const Game = loadGameModel();
  const updates = [];
  const game = new Game((view, cards) => {
    updates.push({
      action: view?.p0?.duelAction,
      cards: cards.map((card) => ({ ...card })),
    });
  });

  game.addCard("DECK", 0, 0, 101);
  game.addCard("DECK", 0, 1, 102);
  game.addCard("DECK", 0, 2, 103);

  game.updateDeckTop({
    player: 0,
    offset: 1,
    id: 46986414,
    reversed: true,
  });

  const deckCards = game.stack.cards()
    .filter((card) => card.player === 0 && card.location === "DECK")
    .sort(sortByPlayerLocationIndex);

  assert.deepEqual(deckCards.map((card) => ({
    index: card.index,
    id: card.id,
    is_reversed: card.is_reversed,
  })), [
    { index: 0, id: 101, is_reversed: undefined },
    { index: 1, id: 46986414, is_reversed: true },
    { index: 2, id: 103, is_reversed: undefined },
  ]);
  assert.equal(updates.at(-1)?.action, "duel");
});

test("Game applyCardHint stores card hint text and reversible description hints on the pile", () => {
  const Game = loadGameModel();
  const game = new Game(() => {});

  game.addCard("MONSTERZONE", 0, 0, 1001);

  game.applyCardHint({
    player: 0,
    location: "MONSTERZONE",
    index: 0,
    card_hint: "turn",
    description: "2",
    hint_text: "Turn 2"
  });

  let card = game.stack.cards().find((entry) => entry.player === 0 && entry.location === "MONSTERZONE" && entry.index === 0);
  assert.equal(card.card_hint, "turn");
  assert.equal(card.card_hint_value, "2");
  assert.equal(card.card_hint_text, "Turn 2");

  game.applyCardHint({
    player: 0,
    location: "MONSTERZONE",
    index: 0,
    card_hint: "desc_add",
    description: "1600",
    description_text: "Negated until the end of this turn"
  });

  card = game.stack.cards().find((entry) => entry.player === 0 && entry.location === "MONSTERZONE" && entry.index === 0);
  assert.deepEqual(card.desc_hints, ["Negated until the end of this turn"]);

  game.applyCardHint({
    player: 0,
    location: "MONSTERZONE",
    index: 0,
    card_hint: "desc_remove",
    description: "1600",
    description_text: "Negated until the end of this turn"
  });

  card = game.stack.cards().find((entry) => entry.player === 0 && entry.location === "MONSTERZONE" && entry.index === 0);
  assert.deepEqual(card.desc_hints || [], []);
});

test("Game applyPlayerHint tracks add and remove semantics per player", () => {
  const Game = loadGameModel();
  const game = new Game(() => {});

  game.applyPlayerHint({
    player: 1,
    player_hint: "desc_add",
    description: "777",
    description_text: "You cannot Special Summon except Fiends this turn."
  });
  game.applyPlayerHint({
    player: 1,
    player_hint: "desc_add",
    description: "888",
    description_text: "You can only attack with Burning Abyss monsters."
  });

  assert.deepEqual(game.state.playerHints[1], [
    "You cannot Special Summon except Fiends this turn.",
    "You can only attack with Burning Abyss monsters."
  ]);

  game.applyPlayerHint({
    player: 1,
    player_hint: "desc_remove",
    description: "777",
    description_text: "You cannot Special Summon except Fiends this turn."
  });

  assert.deepEqual(game.state.playerHints[1], [
    "You can only attack with Burning Abyss monsters."
  ]);
});
// Run with: npm run test:unit
