const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const runtimeRequire = eval("require");

const controllerAutomaticModulePath = path.resolve(
  process.cwd(),
  "server",
  "core",
  "core",
  "controller_automatic.js",
);
const modelAutomaticFieldModulePath = path.resolve(
  process.cwd(),
  "server",
  "core",
  "core",
  "model_automatic_field.js",
);

function loadControllerAutomatic() {
  delete require.cache[controllerAutomaticModulePath];
  return runtimeRequire(controllerAutomaticModulePath);
}

function loadGameModel() {
  delete require.cache[modelAutomaticFieldModulePath];
  return runtimeRequire(modelAutomaticFieldModulePath);
}

test("boardController routes MSG_ROCK_PAPER_SCISSORS through askUser and writes the ocgcore response", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        ROCK_PAPER_SCISSORS: 132,
      },
      OcgResponseType: {
        ROCK_PAPER_SCISSORS: "ROCK_PAPER_SCISSORS",
      },
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    let questionCall = null;
    let writtenResponse = null;
    const gameBoard = {
      question(slot, type, options, answerLength, onAnswerFromUser) {
        questionCall = { slot, type, options, answerLength };
        onAnswerFromUser({ type: "number", i: 2 });
      },
    };
    const ygopro = {
      writeResponse(response) {
        writtenResponse = response;
      },
    };

    boardController(gameBoard, 0, { type: 132, player: 0 }, ygopro, null);

    assert.deepEqual(questionCall, {
      slot: "p0",
      type: 132,
      options: {
        type: 132,
        player: 0,
        command: "MSG_ROCK_PAPER_SCISSORS",
        prompt_text: "",
      },
      answerLength: { min: 1, max: 1 },
    });
    assert.deepEqual(writtenResponse, {
      type: "ROCK_PAPER_SCISSORS",
      value: 2,
    });
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController forwards MSG_HAND_RES as an announcement", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        HAND_RES: 133,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const announcements = [];
    const gameBoard = {
      announcement(slot, message) {
        announcements.push({ slot, message });
      },
    };

    boardController(gameBoard, 1, { type: 133, results: [2, 1] }, {}, null);

    assert.deepEqual(announcements, [
      {
        slot: 1,
        message: {
          type: 133,
          results: [2, 1],
          command: "MSG_HAND_RES",
          ui: {
            kind: "rps_result",
            results: [2, 1],
            duration: 1000,
          },
        },
      },
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController updates deck-top state before forwarding the browser flash contract", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        DECK_TOP: 38,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const calls = [];
    const gameBoard = {
      updateDeckTop(message) {
        calls.push(["updateDeckTop", message]);
      },
      announcement(slot, message) {
        calls.push(["announcement", slot, message]);
      },
    };

    boardController(gameBoard, 0, {
      type: 38,
      player: 1,
      offset: 2,
      id: 46986414,
      reversed: true,
    }, {}, null);

    assert.deepEqual(calls, [
      ["updateDeckTop", {
        type: 38,
        player: 1,
        offset: 2,
        id: 46986414,
        reversed: true,
      }],
      ["announcement", 0, {
        type: 38,
        player: 1,
        offset: 2,
        id: 46986414,
        reversed: true,
        command: "MSG_DECK_TOP",
        ui: {
          kind: "flash",
          id: 46986414,
        },
      }],
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController routes overlay-aware MSG_MOVE packets through board mutations", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        MOVE: 50,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const calls = [];
    const gameBoard = {
      announcement() {},
      attachMaterial(previous, current) {
        calls.push(["attachMaterial", previous, current]);
      },
      detachMaterial(previous, sequence, current) {
        calls.push(["detachMaterial", previous, sequence, current]);
      },
      takeMaterial(previous, sequence, current) {
        calls.push(["takeMaterial", previous, sequence, current]);
      },
      removeCard(query) {
        calls.push(["removeCard", query]);
      },
      ygoproUpdate() {
        calls.push(["ygoproUpdate"]);
      },
    };

    boardController(gameBoard, 0, {
      type: 50,
      code: 36553319,
      from: {
        controller: 0,
        location: 4,
        sequence: 0,
        position: 1,
      },
      to: {
        controller: 0,
        location: 4,
        sequence: 2,
        position: 1,
        overlay_sequence: 0,
      },
    }, {}, null);

    boardController(gameBoard, 0, {
      type: 50,
      code: 62957424,
      from: {
        controller: 0,
        location: 4,
        sequence: 2,
        position: 1,
        overlay_sequence: 1,
      },
      to: {
        controller: 0,
        location: 4,
        sequence: 4,
        position: 1,
      },
    }, {}, null);

    boardController(gameBoard, 0, {
      type: 50,
      code: 36553319,
      from: {
        controller: 0,
        location: 4,
        sequence: 2,
        position: 1,
        overlay_sequence: 0,
      },
      to: {
        controller: 0,
        location: 4,
        sequence: 1,
        position: 1,
        overlay_sequence: 1,
      },
    }, {}, null);

    boardController(gameBoard, 0, {
      type: 50,
      code: 62957424,
      from: {
        controller: 0,
        location: 4,
        sequence: 1,
        position: 1,
        overlay_sequence: 1,
      },
      to: {
        controller: 0,
        location: 0,
        sequence: 0,
        position: 0,
      },
    }, {}, null);

    assert.deepEqual(calls, [
      ["attachMaterial", {
        player: 0,
        location: "MONSTERZONE",
        index: 0,
      }, {
        player: 0,
        location: "MONSTERZONE",
        index: 2,
      }],
      ["ygoproUpdate"],
      ["detachMaterial", {
        player: 0,
        location: "MONSTERZONE",
        index: 2,
      }, 2, {
        player: 0,
        location: "MONSTERZONE",
        index: 4,
        position: "FaceUpAttack",
      }],
      ["ygoproUpdate"],
      ["takeMaterial", {
        player: 0,
        location: "MONSTERZONE",
        index: 2,
      }, 1, {
        player: 0,
        location: "MONSTERZONE",
        index: 1,
      }],
      ["ygoproUpdate"],
      ["removeCard", {
        player: 0,
        location: "MONSTERZONE",
        index: 1,
        position: "FaceUpAttack",
        overlay_sequence: 1,
      }],
      ["ygoproUpdate"],
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController defers off-field XYZ overlays until the host reaches the Monster Zone", () => {
  const boardController = loadControllerAutomatic();
  const Game = loadGameModel();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        MOVE: 50,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const game = new Game(() => {});
    game.startDuel(
      {
        main: [],
        extra: [83531441],
      },
      {
        main: [],
        extra: [],
      },
    );
    game.addCard("MONSTERZONE", 0, 1, 36553319);
    game.addCard("MONSTERZONE", 0, 2, 62957424);
    const readPlayerCards = () =>
      game.stack.cards()
        .filter((card) => card.player === 0)
        .sort((left, right) =>
          String(left.location).localeCompare(String(right.location))
          || left.index - right.index
          || (left.overlayindex || 0) - (right.overlayindex || 0))
        .map((card) => ({
          id: card.id,
          location: card.location,
          index: card.index,
          overlayindex: card.overlayindex,
        }));

    boardController(game, 0, {
      type: 50,
      code: 36553319,
      from: {
        controller: 0,
        location: 4,
        sequence: 1,
        position: 1,
      },
      to: {
        controller: 0,
        location: 64,
        sequence: 0,
        position: 1,
        overlay_sequence: 0,
      },
    }, {}, null);

    assert.deepEqual(readPlayerCards(), [
      {
        id: 83531441,
        location: "EXTRA",
        index: 0,
        overlayindex: 0,
      },
      {
        id: 36553319,
        location: "MONSTERZONE",
        index: 1,
        overlayindex: 0,
      },
      {
        id: 62957424,
        location: "MONSTERZONE",
        index: 2,
        overlayindex: 0,
      },
    ]);

    boardController(game, 0, {
      type: 50,
      code: 62957424,
      from: {
        controller: 0,
        location: 4,
        sequence: 2,
        position: 1,
      },
      to: {
        controller: 0,
        location: 64,
        sequence: 0,
        position: 1,
        overlay_sequence: 1,
      },
    }, {}, null);

    assert.deepEqual(readPlayerCards(), [
      {
        id: 83531441,
        location: "EXTRA",
        index: 0,
        overlayindex: 0,
      },
      {
        id: 36553319,
        location: "MONSTERZONE",
        index: 1,
        overlayindex: 0,
      },
      {
        id: 62957424,
        location: "MONSTERZONE",
        index: 2,
        overlayindex: 0,
      },
    ]);

    boardController(game, 0, {
      type: 50,
      code: 83531441,
      from: {
        controller: 0,
        location: 64,
        sequence: 0,
        position: 1,
      },
      to: {
        controller: 0,
        location: 4,
        sequence: 4,
        position: 1,
      },
    }, {}, null);

    assert.deepEqual(readPlayerCards(), [
      {
        id: 83531441,
        location: "MONSTERZONE",
        index: 4,
        overlayindex: 0,
      },
      {
        id: 36553319,
        location: "MONSTERZONE",
        index: 4,
        overlayindex: 1,
      },
      {
        id: 62957424,
        location: "MONSTERZONE",
        index: 4,
        overlayindex: 2,
      },
    ]);
  } finally {
    delete require.cache[modelAutomaticFieldModulePath];
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController turns visible MSG_HINT variants into browser hint announcements", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        HINT: 2,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const announcements = [];
    const gameBoard = {
      announcement(slot, message) {
        announcements.push({ slot, message });
      },
    };

    boardController(gameBoard, 0, {
      type: 2,
      player: 0,
      hint_type: "HINT_MESSAGE",
      hint: 201,
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 2,
      player: 1,
      hint_type: "HINT_OPSELECTED",
      hint: 560,
    }, {}, null);

    assert.deepEqual(announcements, [
      {
        slot: 0,
        message: {
          type: 2,
          player: 0,
          hint_type: "HINT_MESSAGE",
          hint: 201,
          command: "MSG_HINT",
          ui: {
            kind: "hint",
            text: "No card or effect can be activated right now.",
            hintType: "HINT_MESSAGE",
          },
        },
      },
      {
        slot: 1,
        message: {
          type: 2,
          player: 1,
          hint_type: "HINT_OPSELECTED",
          hint: 560,
          command: "MSG_HINT",
          ui: {
            kind: "hint",
            text: "Your opponent's choice: [Select]",
            hintType: "HINT_OPSELECTED",
          },
        },
      },
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController forwards MSG_TOSS_COIN, MSG_TOSS_DICE, and MSG_FIELD_DISABLED through normalized UI contracts", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        TOSS_COIN: 130,
        TOSS_DICE: 131,
        FIELD_DISABLED: 132,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const announcements = [];
    const gameBoard = {
      announcement(slot, message) {
        announcements.push({ slot, message });
      },
    };

    boardController(gameBoard, 0, {
      type: 130,
      player: 1,
      results: [true, false],
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 131,
      player: 0,
      results: [6, 2],
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 132,
      zones: [
        { player: 0, location: "MONSTERZONE", index: 0 },
        { player: 1, location: "SPELLZONE", index: 2 },
      ],
    }, {}, null);

    assert.deepEqual(announcements, [
      {
        slot: 0,
        message: {
          type: 130,
          player: 1,
          results: [true, false],
          command: "MSG_TOSS_COIN",
          ui: {
            kind: "coin_result",
            player: 1,
            results: [true, false],
            sound: "coinflip",
          },
        },
      },
      {
        slot: 0,
        message: {
          type: 131,
          player: 0,
          results: [6, 2],
          command: "MSG_TOSS_DICE",
          ui: {
            kind: "dice_result",
            player: 0,
            results: [6, 2],
            sound: "diceroll",
          },
        },
      },
      {
        slot: 0,
        message: {
          type: 132,
          zones: [
            { player: 0, location: "MONSTERZONE", index: 0 },
            { player: 1, location: "SPELLZONE", index: 2 },
          ],
          command: "MSG_FIELD_DISABLED",
          ui: {
            kind: "field_disabled",
            zones: [
              { player: 0, location: "MONSTERZONE", index: 0 },
              { player: 1, location: "SPELLZONE", index: 2 },
            ],
          },
        },
      },
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController composes duelclient-style prompts for effect, yesno, and chain questions", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        HINT: 2,
        SELECT_EFFECTYN: 12,
        SELECT_YESNO: 13,
        SELECT_CHAIN: 16,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const questions = [];
    const gameBoard = {
      announcement() {
        return null;
      },
      question(slot, type, options) {
        questions.push({ slot, type, options });
      },
    };

    boardController(gameBoard, 0, {
      type: 2,
      player: 0,
      hint_type: "HINT_EVENT",
      hint: 203,
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 12,
      player: 0,
      code: 20758643,
      location: "MONSTERZONE",
      index: 1,
      description: 0,
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 13,
      player: 0,
      description: 201,
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 2,
      player: 0,
      hint_type: "HINT_EVENT",
      hint: 203,
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 16,
      player: 0,
      forced: false,
      count: 1,
      specount: 0x7f,
      select_options: [
        {
          code: 1001,
          id: 1001,
          location: "MONSTERZONE",
          index: 0,
          player: 0,
          client_mode: 0,
        },
      ],
    }, {}, null);

    assert.deepEqual(questions, [
      {
        slot: "p0",
        type: 12,
        options: {
          type: 12,
          player: 0,
          code: 20758643,
          location: "MONSTERZONE",
          index: 1,
          description: 0,
          command: "MSG_SELECT_EFFECTYN",
          prompt_text: "Activate a card or effect?\nUse the effect of \"Graff, Malebranche of the Burning Abyss\" from [Monster Zone 2]?",
        },
      },
      {
        slot: "p0",
        type: 13,
        options: {
          type: 13,
          player: 0,
          description: 201,
          command: "MSG_SELECT_YESNO",
          prompt_text: "No card or effect can be activated right now.",
        },
      },
      {
        slot: "p0",
        type: 16,
        options: {
          type: 16,
          player: 0,
          forced: false,
          count: 1,
          specount: 127,
          select_options: [
            {
              code: 1001,
              id: 1001,
              location: "MONSTERZONE",
              index: 0,
              player: 0,
              client_mode: 0,
            },
          ],
          command: "MSG_SELECT_CHAIN",
          chain_choices: [
            {
              code: 1001,
              id: 1001,
              location: "MONSTERZONE",
              index: 0,
              player: 0,
              client_mode: 0,
            },
          ],
          select_trigger: true,
          prompt_text: "Activate a card or effect?\nActivate a Trigger Effect?",
        },
      },
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController orients slot-1 questions for the viewer and deorients select-place answers for ocgcore", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        SELECT_CARD: 15,
        SELECT_PLACE: 18,
      },
      OcgResponseType: {
        SELECT_PLACE: "SELECT_PLACE",
      },
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const questions = [];
    let writtenResponse = null;
    const gameBoard = {
      question(slot, type, options, answerLength, onAnswerFromUser) {
        questions.push({ slot, type, options, answerLength });
        if (type === 18) {
          onAnswerFromUser({ type: "zone", i: [0, 4, 2] });
        }
      },
    };
    const ygopro = {
      writeResponse(response) {
        writtenResponse = response;
      },
    };

    boardController(gameBoard, 1, {
      type: 15,
      player: 1,
      select_min: 1,
      select_max: 1,
      selectable_targets: [
        {
          id: 1001,
          player: 0,
          location: "MONSTERZONE",
          index: 0,
          i: 0,
        },
        {
          id: 1002,
          player: 1,
          location: "MONSTERZONE",
          index: 2,
          i: 1,
        },
      ],
    }, ygopro, null);
    boardController(gameBoard, 1, {
      type: 18,
      player: 1,
      zones: [
        {
          player: 1,
          location: "MONSTERZONE",
          index: 2,
        },
      ],
    }, ygopro, null);

    assert.deepEqual(questions, [
      {
        slot: "p1",
        type: 15,
        options: {
          type: 15,
          player: 0,
          select_min: 1,
          select_max: 1,
          selectable_targets: [
            {
              id: 1001,
              player: 1,
              location: "MONSTERZONE",
              index: 0,
              i: 0,
            },
            {
              id: 1002,
              player: 0,
              location: "MONSTERZONE",
              index: 2,
              i: 1,
            },
          ],
          command: "MSG_SELECT_CARD",
          reveal_cards: [
            {
              id: 1001,
              player: 1,
              location: "MONSTERZONE",
              index: 0,
              i: 0,
            },
            {
              id: 1002,
              player: 0,
              location: "MONSTERZONE",
              index: 2,
              i: 1,
            },
          ],
          zone_selection: {
            zones: [
              {
                player: 1,
                location: "MONSTERZONE",
                index: 0,
              },
              {
                player: 0,
                location: "MONSTERZONE",
                index: 2,
              },
            ],
          },
          prompt_text: "Select",
        },
        answerLength: { min: 1, max: 1 },
      },
      {
        slot: "p1",
        type: 18,
        options: {
          type: 18,
          player: 0,
          zones: [
            {
              player: 0,
              location: "MONSTERZONE",
              index: 2,
            },
          ],
          command: "MSG_SELECT_PLACE",
          zone_selection: {
            zones: [
              {
                player: 0,
                location: "MONSTERZONE",
                index: 2,
              },
            ],
          },
          prompt_text: "Select",
        },
        answerLength: { min: 1, max: 1 },
      },
    ]);
    assert.deepEqual(writtenResponse, {
      type: "SELECT_PLACE",
      places: [
        {
          player: 1,
          location: 4,
          sequence: 2,
        },
      ],
    });
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController orients slot-1 announcement UI contracts", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        TOSS_COIN: 130,
        FIELD_DISABLED: 132,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const announcements = [];
    const gameBoard = {
      announcement(slot, message) {
        announcements.push({ slot, message });
      },
    };

    boardController(gameBoard, 1, {
      type: 130,
      player: 0,
      results: [true, false],
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 132,
      zones: [
        { player: 0, location: "MONSTERZONE", index: 0 },
        { player: 1, location: "SPELLZONE", index: 2 },
      ],
    }, {}, null);

    assert.deepEqual(announcements, [
      {
        slot: 1,
        message: {
          type: 130,
          player: 0,
          results: [true, false],
          command: "MSG_TOSS_COIN",
          ui: {
            kind: "coin_result",
            player: 1,
            results: [true, false],
            sound: "coinflip",
          },
        },
      },
      {
        slot: 1,
        message: {
          type: 132,
          zones: [
            { player: 0, location: "MONSTERZONE", index: 0 },
            { player: 1, location: "SPELLZONE", index: 2 },
          ],
          command: "MSG_FIELD_DISABLED",
          ui: {
            kind: "field_disabled",
            zones: [
              { player: 1, location: "MONSTERZONE", index: 0 },
              { player: 0, location: "SPELLZONE", index: 2 },
            ],
          },
        },
      },
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController routes MSG_ANNOUNCE_CARD through askUser and writes the selected card code", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        ANNOUNCE_CARD: 142,
      },
      OcgResponseType: {
        ANNOUNCE_CARD: "ANNOUNCE_CARD",
      },
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    let questionCall = null;
    let writtenResponse = null;
    const gameBoard = {
      question(slot, type, options, answerLength, onAnswerFromUser) {
        questionCall = { slot, type, options, answerLength };
        onAnswerFromUser({ type: "number", i: 1001 });
      },
    };
    const ygopro = {
      writeResponse(response) {
        writtenResponse = response;
      },
    };

    boardController(gameBoard, 0, {
      type: 142,
      player: 0,
      opcodes: [1001, "ISCODE"],
    }, ygopro, null);

    assert.deepEqual(questionCall, {
      slot: "p0",
      type: 142,
      options: {
        type: 142,
        player: 0,
        opcodes: [1001, "ISCODE"],
        command: "MSG_ANNOUNCE_CARD",
        prompt_text: "Declare a card name",
      },
      answerLength: { min: 1, max: 1 },
    });
    assert.deepEqual(writtenResponse, {
      type: "ANNOUNCE_CARD",
      card: 1001,
    });
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController routes shuffle, reveal, and remove state messages through the duel board", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        SHUFFLE_EXTRA: 39,
        CONFIRM_EXTRATOP: 42,
        SHUFFLE_SET_CARD: 36,
        REMOVE_CARDS: 190,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const calls = [];
    const gameBoard = {
      shuffleExtra(player, cards) {
        calls.push(["shuffleExtra", player, cards]);
      },
      revealCallback(cards, player, call) {
        calls.push(["revealCallback", cards, player, call]);
      },
      shuffleSetCards(location, cards) {
        calls.push(["shuffleSetCards", location, cards]);
      },
      removeCards(cards) {
        calls.push(["removeCards", cards]);
      },
      announcement(slot, message) {
        calls.push(["announcement", slot, message]);
      },
    };

    boardController(gameBoard, 1, {
      type: 39,
      player: 0,
      cards: [1001, 1002],
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 42,
      player: 0,
      reveal_cards: [{ id: 2001, index: 0 }],
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 36,
      location: "SPELLZONE",
      cards: [
        {
          from: { player: 0, location: "SPELLZONE", index: 0 },
          to: { player: 0, location: "SPELLZONE", index: 1 },
        },
      ],
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 190,
      cards: [{ player: 0, location: "MONSTERZONE", index: 2 }],
    }, {}, null);

    assert.deepEqual(calls, [
      ["shuffleExtra", 0, [1001, 1002]],
      ["announcement", 1, {
        type: 39,
        player: 0,
        cards: [1001, 1002],
        command: "MSG_SHUFFLE_EXTRA",
        ui: {
          kind: "shuffle",
          zone: "EXTRA",
          player: 1,
        },
      }],
      ["revealCallback", [{ id: 2001, index: 0 }], 0, "confirm_extratop"],
      ["shuffleSetCards", "SPELLZONE", [
        {
          from: { player: 0, location: "SPELLZONE", index: 0 },
          to: { player: 0, location: "SPELLZONE", index: 1 },
        },
      ]],
      ["announcement", 1, {
        type: 36,
        location: "SPELLZONE",
        cards: [
          {
            from: { player: 0, location: "SPELLZONE", index: 0 },
            to: { player: 0, location: "SPELLZONE", index: 1 },
          },
        ],
        command: "MSG_SHUFFLE_SET_CARD",
        ui: {
          kind: "shuffle_set",
          zone: "SPELLZONE",
          players: [1],
        },
      }],
      ["removeCards", [{ player: 0, location: "MONSTERZONE", index: 2 }]],
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController routes reload and hint state messages through the duel board", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        CARD_HINT: 160,
        PLAYER_HINT: 161,
        RELOAD_FIELD: 162,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const calls = [];
    const gameBoard = {
      applyCardHint(message) {
        calls.push(["applyCardHint", message]);
      },
      applyPlayerHint(message) {
        calls.push(["applyPlayerHint", message]);
      },
      reloadField(message) {
        calls.push(["reloadField", message]);
      },
    };

    boardController(gameBoard, 0, {
      type: 160,
      player: 0,
      location: "MONSTERZONE",
      index: 1,
      card_hint: "turn",
      hint_text: "Turn 2",
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 161,
      player: 1,
      player_hint: "desc_add",
      description_text: "Only Fiends can attack this turn.",
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 162,
      flags: 7,
      players: [{ lp: 8000 }, { lp: 4000 }],
      chain: [],
    }, {}, null);

    assert.deepEqual(calls, [
      ["applyCardHint", {
        type: 160,
        player: 0,
        location: "MONSTERZONE",
        index: 1,
        card_hint: "turn",
        hint_text: "Turn 2",
      }],
      ["applyPlayerHint", {
        type: 161,
        player: 1,
        player_hint: "desc_add",
        description_text: "Only Fiends can attack this turn.",
      }],
      ["reloadField", {
        type: 162,
        flags: 7,
        players: [{ lp: 8000 }, { lp: 4000 }],
        chain: [],
      }],
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController routes refresh-deck and tag-swap through duel-board maintenance handlers", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        REFRESH_DECK: 34,
        TAG_SWAP: 161,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const calls = [];
    const gameBoard = {
      refreshDeck(message) {
        calls.push(["refreshDeck", message]);
      },
      tagSwap(message) {
        calls.push(["tagSwap", message]);
      },
      announcement(slot, message) {
        calls.push(["announcement", slot, message]);
      },
    };

    boardController(gameBoard, 0, { type: 34 }, {}, null);
    boardController(gameBoard, 1, {
      type: 161,
      player: 1,
      deck_size: 3,
      deck_top_card: 4001,
      hand: [{ id: 1001, position: "FaceUp" }],
      extra: [{ id: 2001, position: "FaceDown" }],
    }, {}, null);

    assert.deepEqual(calls, [
      ["refreshDeck", { type: 34 }],
      ["tagSwap", {
        type: 161,
        player: 1,
        deck_size: 3,
        deck_top_card: 4001,
        hand: [{ id: 1001, position: "FaceUp" }],
        extra: [{ id: 2001, position: "FaceDown" }],
      }],
      ["announcement", 1, {
        type: 161,
        player: 1,
        deck_size: 3,
        deck_top_card: 4001,
        hand: [{ id: 1001, position: "FaceUp" }],
        extra: [{ id: 2001, position: "FaceDown" }],
        command: "MSG_TAG_SWAP",
        ui: {
          kind: "tag_swap",
          player: 0,
          zones: ["DECK", "HAND", "EXTRA"],
        },
      }],
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController forwards summon, equip, battle, and chain announcements through normalized UI contracts", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        SUMMONING: 60,
        SUMMONED: 61,
        CHAINING: 70,
        CHAINED: 71,
        CHAIN_SOLVING: 72,
        CHAIN_NEGATED: 75,
        CHAIN_END: 74,
        EQUIP: 93,
        BATTLE: 111,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const calls = [];
    const gameBoard = {
      update(message) {
        calls.push(["update", message]);
      },
      announcement(slot, message) {
        calls.push(["announcement", slot, message]);
      },
    };

    boardController(gameBoard, 0, {
      type: 60,
      command: "MSG_SUMMONING",
      id: 1001,
      player: 0,
      location: "MONSTERZONE",
      index: 2,
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 61,
      command: "MSG_SUMMONED",
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 70,
      command: "MSG_CHAINING",
      id: 2001,
      source: {
        player: 0,
        location: "SPELLZONE",
        index: 1,
      },
      chain_size: 1,
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 71,
      command: "MSG_CHAINED",
      chain_size: 1,
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 72,
      command: "MSG_CHAIN_SOLVING",
      chain_size: 1,
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 75,
      command: "MSG_CHAIN_NEGATED",
      chain_size: 1,
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 74,
      command: "MSG_CHAIN_END",
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 93,
      command: "MSG_EQUIP",
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
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 111,
      command: "MSG_BATTLE",
      source: {
        player: 0,
        location: "MONSTERZONE",
        index: 2,
      },
      target: {
        player: 1,
        location: "MONSTERZONE",
        index: 3,
      },
    }, {}, null);

    assert.deepEqual(calls, [
      ["update", {
        type: 60,
        command: "MSG_SUMMONING",
        id: 1001,
        player: 0,
        location: "MONSTERZONE",
        index: 2,
      }],
      ["announcement", 0, {
        type: 60,
        command: "MSG_SUMMONING",
        id: 1001,
        player: 0,
        location: "MONSTERZONE",
        index: 2,
        ui: {
          kind: "flash",
          mode: "summon",
          phase: "start",
          id: 1001,
          source: {
            player: 0,
            location: "MONSTERZONE",
            index: 2,
            overlay_sequence: undefined,
            overlayindex: undefined,
          },
          sound: "summon",
        },
      }],
      ["announcement", 0, {
        type: 61,
        command: "MSG_SUMMONED",
        ui: {
          kind: "flash",
          mode: "summon",
          phase: "complete",
          confirmation: true,
          id: 1001,
          source: {
            player: 0,
            location: "MONSTERZONE",
            index: 2,
            overlay_sequence: undefined,
            overlayindex: undefined,
          },
        },
      }],
      ["announcement", 0, {
        type: 70,
        command: "MSG_CHAINING",
        id: 2001,
        source: {
          player: 0,
          location: "SPELLZONE",
          index: 1,
        },
        chain_size: 1,
        ui: {
          kind: "chain",
          mode: "activate",
          phase: "start",
          chainIndex: 1,
          id: 2001,
          source: {
            player: 0,
            location: "SPELLZONE",
            index: 1,
            overlay_sequence: undefined,
            overlayindex: undefined,
          },
          sound: "activate",
        },
      }],
      ["announcement", 0, {
        type: 71,
        command: "MSG_CHAINED",
        chain_size: 1,
        ui: {
          kind: "chain",
          mode: "activate",
          phase: "queued",
          chainIndex: 1,
          id: 2001,
          source: {
            player: 0,
            location: "SPELLZONE",
            index: 1,
            overlay_sequence: undefined,
            overlayindex: undefined,
          },
        },
      }],
      ["announcement", 0, {
        type: 72,
        command: "MSG_CHAIN_SOLVING",
        chain_size: 1,
        ui: {
          kind: "chain",
          mode: "activate",
          phase: "solving",
          chainIndex: 1,
          id: 2001,
          source: {
            player: 0,
            location: "SPELLZONE",
            index: 1,
            overlay_sequence: undefined,
            overlayindex: undefined,
          },
        },
      }],
      ["announcement", 0, {
        type: 75,
        command: "MSG_CHAIN_NEGATED",
        chain_size: 1,
        ui: {
          kind: "chain",
          mode: "negated",
          phase: "negated",
          chainIndex: 1,
          id: 2001,
          source: {
            player: 0,
            location: "SPELLZONE",
            index: 1,
            overlay_sequence: undefined,
            overlayindex: undefined,
          },
        },
      }],
      ["announcement", 0, {
        type: 74,
        command: "MSG_CHAIN_END",
        ui: {
          kind: "chain",
          phase: "end",
        },
      }],
      ["announcement", 0, {
        type: 93,
        command: "MSG_EQUIP",
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
        ui: {
          kind: "sound",
          sound: "equip",
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
        },
      }],
      ["announcement", 0, {
        type: 111,
        command: "MSG_BATTLE",
        source: {
          player: 0,
          location: "MONSTERZONE",
          index: 2,
        },
        target: {
          player: 1,
          location: "MONSTERZONE",
          index: 3,
        },
        ui: {
          kind: "battle",
          source: {
            player: 0,
            location: "MONSTERZONE",
            index: 2,
          },
          target: {
            player: 1,
            location: "MONSTERZONE",
            index: 3,
          },
        },
      }],
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController preserves special and flip summon mode metadata across summon start and completion", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        SPSUMMONING: 62,
        SPSUMMONED: 63,
        FLIPSUMMONING: 64,
        FLIPSUMMONED: 65,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const announcements = [];
    const gameBoard = {
      update() {},
      announcement(slot, message) {
        announcements.push({ slot, message });
      },
    };

    boardController(gameBoard, 1, {
      type: 62,
      command: "MSG_SPSUMMONING",
      id: 3001,
      player: 0,
      location: "MONSTERZONE",
      index: 4,
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 63,
      command: "MSG_SPSUMMONED",
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 64,
      command: "MSG_FLIPSUMMONING",
      id: 4001,
      player: 1,
      location: "MONSTERZONE",
      index: 2,
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 65,
      command: "MSG_FLIPSUMMONED",
    }, {}, null);

    assert.deepEqual(announcements, [
      {
        slot: 1,
        message: {
          type: 62,
          command: "MSG_SPSUMMONING",
          id: 3001,
          player: 0,
          location: "MONSTERZONE",
          index: 4,
          ui: {
            kind: "flash",
            mode: "special_summon",
            phase: "start",
            id: 3001,
            source: {
              player: 1,
              location: "MONSTERZONE",
              index: 4,
              overlay_sequence: undefined,
              overlayindex: undefined,
            },
            sound: "specialsummon",
          },
        },
      },
      {
        slot: 1,
        message: {
          type: 63,
          command: "MSG_SPSUMMONED",
          ui: {
            kind: "flash",
            mode: "special_summon",
            phase: "complete",
            confirmation: true,
            id: 3001,
            source: {
              player: 1,
              location: "MONSTERZONE",
              index: 4,
              overlay_sequence: undefined,
              overlayindex: undefined,
            },
          },
        },
      },
      {
        slot: 1,
        message: {
          type: 64,
          command: "MSG_FLIPSUMMONING",
          id: 4001,
          player: 1,
          location: "MONSTERZONE",
          index: 2,
          ui: {
            kind: "flash",
            mode: "flip_summon",
            phase: "start",
            id: 4001,
            source: {
              player: 0,
              location: "MONSTERZONE",
              index: 2,
              overlay_sequence: undefined,
              overlayindex: undefined,
            },
            sound: "flip",
          },
        },
      },
      {
        slot: 1,
        message: {
          type: 65,
          command: "MSG_FLIPSUMMONED",
          ui: {
            kind: "flash",
            mode: "flip_summon",
            phase: "complete",
            confirmation: true,
            id: 4001,
            source: {
              player: 0,
              location: "MONSTERZONE",
              index: 2,
              overlay_sequence: undefined,
              overlayindex: undefined,
            },
          },
        },
      },
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController persists equip and target coordinates in the game board before announcing feedback", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        EQUIP: 93,
        CARD_TARGET: 96,
        CANCEL_TARGET: 97,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const calls = [];
    const equipSource = {
      player: 0,
      location: "SPELLZONE",
      index: 1,
    };
    const targetCard = {
      player: 1,
      location: "MONSTERZONE",
      index: 2,
    };
    const gameBoard = {
      setEquipCard(source, target) {
        calls.push(["setEquipCard", source, target]);
      },
      addCardTarget(source, target) {
        calls.push(["addCardTarget", source, target]);
      },
      removeCardTarget(source, target) {
        calls.push(["removeCardTarget", source, target]);
      },
      announcement(slot, message) {
        calls.push(["announcement", slot, message]);
      },
    };

    boardController(gameBoard, 0, {
      type: 93,
      command: "MSG_EQUIP",
      source: equipSource,
      target: targetCard,
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 96,
      command: "MSG_CARD_TARGET",
      source: {
        player: 0,
        location: "MONSTERZONE",
        index: 0,
      },
      target: targetCard,
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 97,
      command: "MSG_CANCEL_TARGET",
      source: {
        player: 0,
        location: "MONSTERZONE",
        index: 0,
      },
      target: targetCard,
    }, {}, null);

    assert.deepEqual(calls, [
      ["setEquipCard", equipSource, targetCard],
      ["announcement", 0, {
        type: 93,
        command: "MSG_EQUIP",
        source: equipSource,
        target: targetCard,
        ui: {
          kind: "sound",
          sound: "equip",
          source: equipSource,
          target: targetCard,
        },
      }],
      ["addCardTarget", {
        player: 0,
        location: "MONSTERZONE",
        index: 0,
      }, targetCard],
      ["announcement", 0, {
        type: 96,
        command: "MSG_CARD_TARGET",
        source: {
          player: 0,
          location: "MONSTERZONE",
          index: 0,
        },
        target: targetCard,
        ui: {
          kind: "target_event",
          phase: "link",
          cards: [
            {
              player: 0,
              location: "MONSTERZONE",
              index: 0,
            },
            targetCard,
          ],
          duration: 950,
        },
      }],
      ["removeCardTarget", {
        player: 0,
        location: "MONSTERZONE",
        index: 0,
      }, targetCard],
      ["announcement", 0, {
        type: 97,
        command: "MSG_CANCEL_TARGET",
        source: {
          player: 0,
          location: "MONSTERZONE",
          index: 0,
        },
        target: targetCard,
        ui: {
          kind: "target_event",
          phase: "unlink",
          cards: [
            {
              player: 0,
              location: "MONSTERZONE",
              index: 0,
            },
            targetCard,
          ],
          duration: 700,
        },
      }],
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController routes target and relation announcement families through normalized browser contracts", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        CHAINING: 70,
        BECOME_TARGET: 83,
        BE_CHAIN_TARGET: 121,
        CREATE_RELATION: 122,
        RELEASE_RELATION: 123,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const announcements = [];
    const gameBoard = {
      announcement(slot, message) {
        announcements.push({ slot, message });
      },
    };

    boardController(gameBoard, 1, {
      type: 70,
      command: "MSG_CHAINING",
      id: 2001,
      source: {
        player: 0,
        location: "SPELLZONE",
        index: 1,
      },
      chain_size: 1,
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 83,
      command: "MSG_BECOME_TARGET",
      cards: [
        {
          player: 0,
          location: "MONSTERZONE",
          index: 1,
        },
        {
          player: 1,
          location: "SPELLZONE",
          index: 3,
        },
      ],
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 121,
      command: "MSG_BE_CHAIN_TARGET",
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 122,
      command: "MSG_CREATE_RELATION",
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 123,
      command: "MSG_RELEASE_RELATION",
    }, {}, null);

    assert.deepEqual(announcements, [
      {
        slot: 1,
        message: {
          type: 70,
          command: "MSG_CHAINING",
          id: 2001,
          source: {
            player: 0,
            location: "SPELLZONE",
            index: 1,
          },
          chain_size: 1,
          ui: {
            kind: "chain",
            mode: "activate",
            phase: "start",
            chainIndex: 1,
            id: 2001,
            source: {
              player: 1,
              location: "SPELLZONE",
              index: 1,
              overlay_sequence: undefined,
              overlayindex: undefined,
            },
            sound: "activate",
          },
        },
      },
      {
        slot: 1,
        message: {
          type: 83,
          command: "MSG_BECOME_TARGET",
          cards: [
            {
              player: 0,
              location: "MONSTERZONE",
              index: 1,
            },
            {
              player: 1,
              location: "SPELLZONE",
              index: 3,
            },
          ],
          ui: {
            kind: "target_event",
            phase: "become_target",
            cards: [
              {
                player: 1,
                location: "MONSTERZONE",
                index: 1,
              },
              {
                player: 0,
                location: "SPELLZONE",
                index: 3,
              },
            ],
            duration: 950,
          },
        },
      },
      {
        slot: 1,
        message: {
          type: 121,
          command: "MSG_BE_CHAIN_TARGET",
          source: {
            player: 0,
            location: "SPELLZONE",
            index: 1,
          },
          cards: [
            {
              player: 0,
              location: "SPELLZONE",
              index: 1,
            },
            {
              player: 0,
              location: "MONSTERZONE",
              index: 1,
            },
            {
              player: 1,
              location: "SPELLZONE",
              index: 3,
            },
          ],
          protocol_inferred: true,
          ui: {
            kind: "target_event",
            phase: "chain_target",
            cards: [
              {
                player: 1,
                location: "SPELLZONE",
                index: 1,
              },
              {
                player: 1,
                location: "MONSTERZONE",
                index: 1,
              },
              {
                player: 0,
                location: "SPELLZONE",
                index: 3,
              },
            ],
            duration: 950,
          },
        },
      },
      {
        slot: 1,
        message: {
          type: 122,
          command: "MSG_CREATE_RELATION",
          source: {
            player: 0,
            location: "SPELLZONE",
            index: 1,
          },
          cards: [
            {
              player: 0,
              location: "SPELLZONE",
              index: 1,
            },
            {
              player: 0,
              location: "MONSTERZONE",
              index: 1,
            },
            {
              player: 1,
              location: "SPELLZONE",
              index: 3,
            },
          ],
          protocol_inferred: true,
          ui: {
            kind: "relation_event",
            phase: "create",
            cards: [
              {
                player: 1,
                location: "SPELLZONE",
                index: 1,
              },
              {
                player: 1,
                location: "MONSTERZONE",
                index: 1,
              },
              {
                player: 0,
                location: "SPELLZONE",
                index: 3,
              },
            ],
            duration: 900,
          },
        },
      },
      {
        slot: 1,
        message: {
          type: 123,
          command: "MSG_RELEASE_RELATION",
          source: {
            player: 0,
            location: "SPELLZONE",
            index: 1,
          },
          cards: [
            {
              player: 0,
              location: "SPELLZONE",
              index: 1,
            },
            {
              player: 0,
              location: "MONSTERZONE",
              index: 1,
            },
            {
              player: 1,
              location: "SPELLZONE",
              index: 3,
            },
          ],
          protocol_inferred: true,
          ui: {
            kind: "relation_event",
            phase: "release",
            cards: [
              {
                player: 1,
                location: "SPELLZONE",
                index: 1,
              },
              {
                player: 1,
                location: "MONSTERZONE",
                index: 1,
              },
              {
                player: 0,
                location: "SPELLZONE",
                index: 3,
              },
            ],
            duration: 650,
          },
        },
      },
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController forwards selection, timing, and unequip announcements through normalized browser contracts", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        CARD_SELECTED: 80,
        RANDOM_SELECTED: 81,
        UNEQUIP: 95,
        ATTACK_DISABLED: 112,
        MISSED_EFFECT: 120,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const calls = [];
    const gameBoard = {
      setEquipCard(source, target) {
        calls.push(["setEquipCard", source, target]);
      },
      announcement(slot, message) {
        calls.push(["announcement", slot, message]);
      },
    };

    boardController(gameBoard, 0, {
      type: 80,
      command: "MSG_CARD_SELECTED",
      cards: [
        {
          player: 0,
          location: "MONSTERZONE",
          index: 1,
        },
      ],
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 81,
      command: "MSG_RANDOM_SELECTED",
      player: 1,
      cards: [
        {
          player: 1,
          location: "SPELLZONE",
          index: 2,
        },
      ],
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 95,
      command: "MSG_UNEQUIP",
      source: {
        player: 0,
        location: "SPELLZONE",
        index: 0,
      },
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 112,
      command: "MSG_ATTACK_DISABLED",
      text: "An attack was negated",
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 120,
      command: "MSG_MISSED_EFFECT",
      source: {
        player: 1,
        location: "MONSTERZONE",
        index: 3,
      },
      text: "\"Burning Spear\" missed the timing",
      id: 1001,
    }, {}, null);

    assert.deepEqual(calls, [
      ["announcement", 0, {
        type: 80,
        command: "MSG_CARD_SELECTED",
        cards: [
          {
            player: 0,
            location: "MONSTERZONE",
            index: 1,
          },
        ],
        ui: {
          kind: "selection_event",
          phase: "card_selected",
          cards: [
            {
              player: 0,
              location: "MONSTERZONE",
              index: 1,
            },
          ],
          duration: 900,
        },
      }],
      ["announcement", 0, {
        type: 81,
        command: "MSG_RANDOM_SELECTED",
        player: 1,
        cards: [
          {
            player: 1,
            location: "SPELLZONE",
            index: 2,
          },
        ],
        ui: {
          kind: "selection_event",
          phase: "random_selected",
          cards: [
            {
              player: 1,
              location: "SPELLZONE",
              index: 2,
            },
          ],
          duration: 650,
        },
      }],
      ["setEquipCard", {
        player: 0,
        location: "SPELLZONE",
        index: 0,
      }, undefined],
      ["announcement", 0, {
        type: 95,
        command: "MSG_UNEQUIP",
        source: {
          player: 0,
          location: "SPELLZONE",
          index: 0,
        },
        ui: {
          kind: "selection_event",
          phase: "unequip",
          cards: [
            {
              player: 0,
              location: "SPELLZONE",
              index: 0,
            },
          ],
          duration: 650,
        },
      }],
      ["announcement", 0, {
        type: 112,
        command: "MSG_ATTACK_DISABLED",
        text: "An attack was negated",
        ui: {
          kind: "notice",
          text: "An attack was negated",
          duration: 1400,
        },
      }],
      ["announcement", 0, {
        type: 120,
        command: "MSG_MISSED_EFFECT",
        source: {
          player: 1,
          location: "MONSTERZONE",
          index: 3,
        },
        text: "\"Burning Spear\" missed the timing",
        id: 1001,
        ui: {
          kind: "selection_event",
          phase: "missed_effect",
          cards: [
            {
              player: 1,
              location: "MONSTERZONE",
              index: 3,
            },
          ],
          text: "\"Burning Spear\" missed the timing",
          duration: 1400,
        },
      }],
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController routes MSG_AI_NAME into duel names and lobby metadata", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        AI_NAME: 163,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const calls = [];
    const announcements = [];
    const gameBoard = {
      setNames(slot, username) {
        calls.push(["setNames", slot, username]);
      },
      ygoproUpdate() {
        calls.push(["ygoproUpdate"]);
      },
      announcement(slot, message) {
        announcements.push({ slot, message });
      },
    };

    boardController(gameBoard, 0, {
      type: 163,
      ai_name: "Yugi Bot",
      opponent_name: "Yugi Bot",
      text: "Yugi Bot",
    }, {}, null);

    assert.deepEqual(calls, [
      ["setNames", 1, "Yugi Bot"],
      ["ygoproUpdate"],
    ]);
    assert.deepEqual(announcements, [
      {
        slot: 0,
        message: {
          type: 163,
          ai_name: "Yugi Bot",
          opponent_name: "Yugi Bot",
          text: "Yugi Bot",
          command: "MSG_AI_NAME",
          ui: {
            kind: "lobby_metadata",
            aiName: "Yugi Bot",
            opponentName: "Yugi Bot",
          },
        },
      },
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController forwards MSG_SHOW_HINT and MSG_CUSTOM_MSG as visible notice contracts", () => {
  const boardController = loadControllerAutomatic();

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        SHOW_HINT: 164,
        CUSTOM_MSG: 180,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    const announcements = [];
    const gameBoard = {
      announcement(slot, message) {
        announcements.push({ slot, message });
      },
    };

    boardController(gameBoard, 0, {
      type: 164,
      text: "A duel script says hello",
      hint: "A duel script says hello",
    }, {}, null);
    boardController(gameBoard, 0, {
      type: 180,
      text: "Custom duel message received.",
    }, {}, null);

    assert.deepEqual(announcements, [
      {
        slot: 0,
        message: {
          type: 164,
          text: "A duel script says hello",
          hint: "A duel script says hello",
          command: "MSG_SHOW_HINT",
          ui: {
            kind: "notice",
            text: "A duel script says hello",
            duration: 1800,
            log: true,
            logLabel: "MSG_SHOW_HINT",
          },
        },
      },
      {
        slot: 0,
        message: {
          type: 180,
          text: "Custom duel message received.",
          command: "MSG_CUSTOM_MSG",
          ui: {
            kind: "notice",
            text: "Custom duel message received.",
            duration: 1800,
            log: true,
            logLabel: "MSG_CUSTOM_MSG",
          },
        },
      },
    ]);
  } finally {
    delete require.cache[controllerAutomaticModulePath];
  }
});

test("boardController emits one MSG_MATCH_KILL process message for tournament reporting", () => {
  const boardController = loadControllerAutomatic(),
    originalSend = process.send,
    originalMatchKill = process.matchKill,
    originalHostConfiguration = process.hostConfiguration;

  try {
    boardController.configureOcgcore({
      OcgMessageType: {
        MATCH_KILL: 170,
      },
      OcgResponseType: {},
      OcgPosition: {
        FACEUP_ATTACK: 1,
        FACEDOWN_ATTACK: 2,
        FACEUP_DEFENSE: 4,
        FACEDOWN_DEFENSE: 8,
      },
    });

    process.hostConfiguration = {
      roompass: "room-123",
      tournamentId: "tour-9",
      tournamentSlug: "spring-cup",
      tournamentMatchId: "match-4",
    };

    const sent = [];
    process.send = (payload) => {
      sent.push(payload);
    };

    const announcements = [];
    const gameBoard = {
      announcement(slot, message) {
        announcements.push({ slot, message });
      },
    };

    boardController(gameBoard, 0, {
      type: 170,
      card: 44508094,
      card_name: "Exodius the Ultimate Forbidden Lord",
      text: "Match kill active: Exodius the Ultimate Forbidden Lord",
    }, {}, null);
    boardController(gameBoard, 1, {
      type: 170,
      card: 44508094,
      card_name: "Exodius the Ultimate Forbidden Lord",
      text: "Match kill active: Exodius the Ultimate Forbidden Lord",
    }, {}, null);

    assert.deepEqual(sent, [
      {
        action: "match_kill",
        command: "MSG_MATCH_KILL",
        roompass: "room-123",
        tournamentId: "tour-9",
        tournamentSlug: "spring-cup",
        tournamentMatchId: "match-4",
        card: 44508094,
        cardName: "Exodius the Ultimate Forbidden Lord",
        occurredAt: sent[0].occurredAt,
      },
    ]);
    assert.deepEqual(process.matchKill, sent[0]);
    assert.equal(announcements.length, 2);
    assert.equal(announcements[0].message.ui.kind, "notice");
    assert.equal(announcements[1].message.ui.kind, "notice");
  } finally {
    process.send = originalSend;
    process.matchKill = originalMatchKill;
    process.hostConfiguration = originalHostConfiguration;
    delete require.cache[controllerAutomaticModulePath];
  }
});
// Run with: npm run test:unit
