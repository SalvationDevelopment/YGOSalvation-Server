import assert from "node:assert/strict";
import test from "node:test";
import {
  applyDuelHintMessage,
  createDuelHintState,
  decodeCardStringId,
  resolveCardName,
  resolveCardString,
  resolveQuestionPrompt
} from "../../../server/ui/services/duel-hint.service.js";

const database = [
  {
    id: 1001,
    name: "Graff, Malebranche of the Burning Abyss",
    str1: "Special Summon 1 \"Burning Abyss\" monster from your Deck"
  },
  {
    id: 2001,
    name: "Dante, Traveler of the Burning Abyss",
    str1: "Detach 1 material; send the top 3 cards of your Deck to the Graveyard"
  }
];

const strings = {
  system: {
    "531": "Select monsters for Tribute Summon",
    "560": "Select",
    "562": "Declare an Attribute",
    "563": "Declare a Type",
    "565": "Declare a number",
    "569": "Select the zone to place \"%ls\"",
    "570": "Select the zone(s) to become unusable"
  }
};

test("MSG_HINT caching preserves select and event channels", () => {
  const initial = createDuelHintState();
  const withSelect = applyDuelHintMessage(initial, {
    hint_type: "HINT_SELECTMSG",
    player: 0,
    hint: 562
  });
  const withEvent = applyDuelHintMessage(withSelect, {
    hint_type: "event",
    player: 0,
    hint: 565
  });

  assert.equal(withSelect.selectHint, 562);
  assert.deepEqual(withSelect.lastHint, {
    type: "HINT_SELECTMSG",
    hint: 562,
    player: 0
  });
  assert.equal(withEvent.selectHint, 562);
  assert.equal(withEvent.eventHint, 565);
  assert.deepEqual(withEvent.lastHint, {
    type: "HINT_EVENT",
    hint: 565,
    player: 0
  });
});

test("encoded card string ids resolve against the browser card manifest", () => {
  const descId = (1001n << 20n) | 1n;

  assert.deepEqual(decodeCardStringId(descId), {
    cardId: 1001,
    stringIndex: 1
  });
  assert.equal(resolveCardName(database, 1001), "Graff, Malebranche of the Burning Abyss");
  assert.equal(resolveCardString(database, descId), "Special Summon 1 \"Burning Abyss\" monster from your Deck");
});

test("select-place prompts format the hinted card name like duelclient.cpp", () => {
  const hintState = applyDuelHintMessage(createDuelHintState(), {
    hint_type: "HINT_SELECTMSG",
    player: 0,
    hint: 1001
  });
  const prompt = resolveQuestionPrompt(hintState, "MSG_SELECT_PLACE", database, strings);

  assert.equal(prompt.text, "Select the zone to place \"Graff, Malebranche of the Burning Abyss\"");
  assert.equal(prompt.state.selectHint, null);
});

test("question prompts fall back to EDOPro-compatible system strings when no hint exists", () => {
  const announce = resolveQuestionPrompt(createDuelHintState(), "MSG_ANNOUNCE_ATTRIB", database, strings);
  const disfield = resolveQuestionPrompt(createDuelHintState(), "MSG_SELECT_DISFIELD", database, strings);
  const tribute = resolveQuestionPrompt(createDuelHintState(), "MSG_SELECT_TRIBUTE", database, strings);

  assert.equal(announce.text, "Declare an Attribute");
  assert.equal(disfield.text, "Select the zone(s) to become unusable");
  assert.equal(tribute.text, "Select monsters for Tribute Summon");
});

test("event hints stay available for effect prompts while select hints are consumed", () => {
  const withEvent = applyDuelHintMessage(createDuelHintState(), {
    hint_type: "HINT_EVENT",
    player: 0,
    hint: 565
  });
  const eventPrompt = resolveQuestionPrompt(withEvent, "MSG_SELECT_EFFECTYN", database, strings);

  assert.equal(eventPrompt.text, "Declare a number");
  assert.equal(eventPrompt.state.eventHint, 565);
});

test("select hints can resolve card string ids before falling back to system text", () => {
  const withSelect = applyDuelHintMessage(createDuelHintState(), {
    hint_type: "HINT_SELECTMSG",
    player: 0,
    hint: (2001n << 20n) | 1n
  });
  const prompt = resolveQuestionPrompt(withSelect, "MSG_SELECT_CARD", database, strings);

  assert.equal(prompt.text, "Detach 1 material; send the top 3 cards of your Deck to the Graveyard");
  assert.equal(prompt.state.selectHint, null);
});
// Run with: npm run test:parity
