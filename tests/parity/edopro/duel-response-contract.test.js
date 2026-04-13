import assert from "node:assert/strict";
import test from "node:test";
import {
  createAnnounceAttributeAnswer,
  createAnnounceCardAnswer,
  createAnnounceNumberAnswer,
  createAnnounceRaceAnswer,
  createCommandButtonAnswer,
  createRockPaperScissorsAnswer,
  createSelectBattleCommandAnswer,
  createSelectCardAnswer,
  createSelectCardCodesAnswer,
  createSelectChainAnswer,
  createSelectCounterAnswer,
  createSelectDisfieldAnswer,
  createSelectEffectYnAnswer,
  createSelectIdleCommandAnswer,
  createSelectOptionAnswer,
  createSelectPlaceAnswer,
  createSelectPositionAnswer,
  createSelectSumAnswer,
  createSelectTributeAnswer,
  createSelectUnselectCardAnswer,
  createSelectYesNoAnswer,
  createSortCardAnswer
} from "../../../server/ui/services/duel-response.service.js";

test("command helpers preserve the UI command family and option index", () => {
  assert.deepEqual(createCommandButtonAnswer("summons", 2), { type: "summons", i: 2 });
  assert.deepEqual(createSelectIdleCommandAnswer("enableEndPhase"), { type: "enableEndPhase", i: 0 });
  assert.deepEqual(createSelectBattleCommandAnswer("attacks", 4), { type: "attacks", i: 4 });
});

test("boolean and numeric helpers build JSON-safe duel answers", () => {
  assert.deepEqual(createSelectEffectYnAnswer(true), { type: "yesno", i: true });
  assert.deepEqual(createSelectYesNoAnswer(false), { type: "yesno", i: false });
  assert.deepEqual(createSelectOptionAnswer("7"), { type: "number", i: 7 });
  assert.deepEqual(createSelectChainAnswer(null), { type: "number", i: -1 });
  assert.deepEqual(createSelectChainAnswer(3), { type: "number", i: 3 });
  assert.deepEqual(createAnnounceCardAnswer("89631139"), { type: "number", i: 89631139 });
  assert.deepEqual(createAnnounceNumberAnswer("5"), { type: "number", i: 5 });
  assert.deepEqual(createRockPaperScissorsAnswer(2), { type: "number", i: 2 });
});

test("reveal and zone helpers normalize list and location payloads", () => {
  assert.deepEqual(createSelectCardAnswer([1, "2"]), { type: "list", i: [1, 2] });
  assert.deepEqual(createSelectTributeAnswer([0, 3]), { type: "list", i: [0, 3] });
  assert.deepEqual(createSelectSumAnswer([4]), { type: "list", i: [4] });
  assert.deepEqual(createSelectCardCodesAnswer([1001, "1002"]), { type: "card_codes", i: [1001, 1002] });
  assert.deepEqual(createSelectUnselectCardAnswer(null), { type: "number", i: -1 });
  assert.deepEqual(createSelectUnselectCardAnswer(6), { type: "number", i: 6 });
  assert.deepEqual(createSelectDisfieldAnswer({ player: 1, location: "SPELLZONE", index: 2 }), {
    type: "zone",
    i: [1, 8, 2]
  });
  assert.deepEqual(createSelectPlaceAnswer(0, "MONSTERZONE", 5), {
    type: "zone",
    i: [0, 4, 5]
  });
  assert.deepEqual(createSelectPositionAnswer("FaceDownDefence"), { type: "FaceDownDefence" });
});

test("list-style future response helpers preserve nullable and array payloads", () => {
  assert.deepEqual(createSelectCounterAnswer([1, "2", 3]), { type: "counter", i: [1, 2, 3] });
  assert.deepEqual(createSortCardAnswer([2, 0, 1]), { type: "order", i: [2, 0, 1] });
  assert.deepEqual(createSortCardAnswer(null), { type: "order", i: null });
  assert.deepEqual(createAnnounceRaceAnswer([1, "8"]), { type: "races", i: [1, "8"] });
  assert.deepEqual(createAnnounceAttributeAnswer([4, "16"]), { type: "attributes", i: [4, "16"] });
});
