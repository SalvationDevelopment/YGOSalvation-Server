var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .tmp/parity/startGame-smoke.test.js
var import_strict = __toESM(require("node:assert/strict"));
var import_node_test = __toESM(require("node:test"));
var import_jsdom = require("jsdom");

// server/ui/services/game.service.js
var import_react31 = __toESM(require("react"), 1);

// server/ui/services/listener.service.js
function Feed(initialStates) {
  const states = Object.assign({}, initialStates), events = {}, subscriptions = {}, replayableActions = /* @__PURE__ */ new Set([
    "LOAD_RANKING",
    "LOAD_DATABASE",
    "LOAD_RELEASES",
    "BANLIST",
    "GAME_LIST",
    "LOAD_DECKS",
    "LOAD_SETCODES",
    "SYSTEM_LOADED",
    "SET_LIFEPOINT_WAITING",
    "IRC_STATE",
    "IRC_HISTORY",
    "IRC_MESSAGE",
    "IRC_ERROR",
    "IRC_RESET"
  ]);
  function ensureState(action) {
    if (!states[action]) {
      states[action] = {};
    }
    return states[action];
  }
  function ensureCollection(collection, action) {
    if (!collection[action]) {
      collection[action] = [];
    }
    return collection[action];
  }
  function removeBehavior(collection, action, behavior) {
    const bucket = collection[action];
    if (!bucket || !bucket.length) {
      return;
    }
    const index = bucket.indexOf(behavior);
    if (index < 0) {
      return;
    }
    bucket.splice(index, 1);
    if (!bucket.length) {
      delete collection[action];
    }
  }
  function replayIfAvailable(action, behavior, includeState) {
    const state = ensureState(action);
    if (!replayableActions.has(action) || !state.lastEvent) {
      return;
    }
    if (includeState) {
      behavior(state.lastEvent, state);
      return;
    }
    behavior(state.lastEvent);
  }
  function on2(action, behavior) {
    if (typeof action !== "string" || typeof behavior !== "function") {
      return () => {
      };
    }
    ensureState(action);
    ensureCollection(events, action).push(behavior);
    console.log("registering:", action);
    replayIfAvailable(action, behavior, true);
    return function unsubscribe() {
      removeBehavior(events, action, behavior);
    };
  }
  function emit2(event) {
    if (!event || !event.action) {
      return;
    }
    const state = ensureState(event.action);
    if (replayableActions.has(event.action)) {
      state.lastEvent = event;
    }
    if (!replayableActions.has(event.action) && !(events[event.action] && events[event.action].length) && !(subscriptions[event.action] && subscriptions[event.action].length)) {
      console.log(new Error(`Action ${event.action} is not registered`));
    }
    if (events[event.action] && events[event.action].length) {
      [...events[event.action]].forEach((behavior) => {
        behavior(event, state);
      });
    }
    if (subscriptions[event.action] && subscriptions[event.action].length) {
      [...subscriptions[event.action]].forEach((behavior) => {
        behavior(event);
      });
    }
  }
  function subscribe2(action, behavior) {
    if (typeof action !== "string" || typeof behavior !== "function") {
      return () => {
      };
    }
    ensureCollection(subscriptions, action).push(behavior);
    console.log("Subscribing:", action);
    replayIfAvailable(action, behavior, false);
    return function unsubscribe() {
      removeBehavior(subscriptions, action, behavior);
    };
  }
  return {
    on: on2,
    emit: emit2,
    subscribe: subscribe2
  };
}
var {
  on,
  emit,
  subscribe
} = new Feed({});

// server/ui/util/cardManipulation.js
function cardIs(cat, obj) {
  "use strict";
  if (cat === "monster" && (obj.race !== 0 || obj.level !== 0 || obj.attribute !== 0)) {
    return true;
  }
  if (cat === "monster") {
    return (obj.type & 1) === 1;
  }
  if (cat === "spell") {
    return (obj.type & 2) === 2;
  }
  if (cat === "trap") {
    return (obj.type & 4) === 4;
  }
  if (cat === "fusion") {
    return (obj.type & 64) === 64;
  }
  if (cat === "ritual") {
    return (obj.type & 128) === 128;
  }
  if (cat === "synchro") {
    return (obj.type & 8192) === 8192;
  }
  if (cat === "token") {
    return (obj.type & 16400) === 16400;
  }
  if (cat === "xyz") {
    return (obj.type & 8388608) === 8388608;
  }
  if (cat === "link") {
    if (obj.links && obj.links.length) {
      return true;
    }
    return (obj.type & 67108864) === 67108864;
  }
}

// server/ui/services/manual.js
var ManualControls = class {
  /**
  * Initializes a new Manual instance and prepares its internal state.
  * @param {Object} store The store value provides an input used by the manual module.
  * @param {Object} ws The ws value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  constructor(store2, ws) {
    this.ws = ws;
    this.manualActionReference = {};
    this.zonetargetingmode = "";
    return this;
  }
  /**
  * Clears card reference used by the manual module.
  * @returns {void} Does not return a value.
  */
  clearCardReference() {
    app.duel.controls.enable({});
    app.duel.closeRevealer();
    emit({ action: "RENDER" });
  }
  /**
  * Executes the exclusion list helper used by the manual module.
  * @param {(string|number)} player The player value provides an input used by the manual module.
  * @param {(string|number)} location The location value provides an input used by the manual module.
  * @param {string} classValue The classValue value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  exclusionList(player, location, classValue) {
    var cardsOnField = app.duel.field.state.cards.filter(function(card) {
      return orient(card.player) === player && card.location === location;
    }), selections = cardsOnField.map(function(card) {
      return ".cardselectionzone.p" + player + "." + location + ".i" + card.index;
    });
    selections.forEach(function(cardzone) {
      $(cardzone).removeClass(classValue);
    });
    return {
      selections,
      cardsOnField
    };
  }
  /**
  * Makes card movement used by the manual module.
  * @param {Object} start The start object supplies the structured input used by the manual module, including the `code`, `index`, `location`, `player`, `position`, and `uid` properties.
  * @param {string} start.code The `code` property supplies structured input used by the manual module.
  * @param {number} start.index The `index` property supplies structured input used by the manual module.
  * @param {string} start.location The `location` property supplies structured input used by the manual module.
  * @param {number} start.player The `player` property supplies structured input used by the manual module.
  * @param {string} start.position The `position` property supplies structured input used by the manual module.
  * @param {string} start.uid The `uid` property supplies structured input used by the manual module.
  * @param {Object} end The end object supplies the structured input used by the manual module, including the `index`, `isBecomingCard`, `location`, `overlayindex`, `player`, and `position` properties.
  * @param {number} end.index The `index` property supplies structured input used by the manual module.
  * @param {boolean} end.isBecomingCard The `isBecomingCard` property supplies structured input used by the manual module.
  * @param {string} end.location The `location` property supplies structured input used by the manual module.
  * @param {number} end.overlayindex The `overlayindex` property supplies structured input used by the manual module.
  * @param {number} end.player The `player` property supplies structured input used by the manual module.
  * @param {string} end.position The `position` property supplies structured input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makeCardMovement(start, end) {
    if (end.position === void 0) {
      end.position = start.position;
    }
    if (end.overlayindex === void 0) {
      end.overlayindex = 0;
    }
    if (end.isBecomingCard === void 0) {
      end.isBecomingCard = false;
    }
    if (end.index === void 0) {
      end.index = start.index;
    }
    return {
      code: start.code,
      player: start.player,
      location: start.location,
      index: start.index,
      moveplayer: end.player,
      movelocation: end.location,
      moveindex: end.index,
      moveposition: end.position,
      overlayindex: end.overlayindex,
      isBecomingCard: end.isBecomingCard,
      uid: start.uid
    };
  }
  /**
  * Selects ionzoneonclick used by the manual module.
  * @param {number} choice The choice value provides an input used by the manual module.
  * @param {string} zone The zone value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  selectionzoneonclick(choice, zone) {
    if (this.overlaymode) {
      this.manualXYZSummon({
        location: "MONSTERZONE",
        index: choice,
        player: window.orientation
      });
      return;
    }
    if (!this.zonetargetingmode) {
      return;
    }
    app.duel.closeRevealer();
    $(".cardselectionzone.p0").removeClass("card");
    $(".cardselectionzone.p0").removeClass("attackglow");
    if (this.zonetargetingmode === "atk") {
      this.manualToAttack(choice);
    }
    if (this.zonetargetingmode === "generic") {
      if (zone === "GRAVE") {
        this.manualToGrave();
      } else {
        this.manualMoveGeneric(choice, zone);
      }
    }
    if (this.zonetargetingmode === "def") {
      this.manualSetMonsterFaceUp(choice);
    }
    if (this.zonetargetingmode === "normalatk") {
      this.manualNormalSummon(choice);
    }
    if (this.zonetargetingmode === "normaldef") {
      this.manualSetMonster(choice);
    }
    if (this.zonetargetingmode === "activate") {
      this.manualActivate(choice);
    }
    if (this.zonetargetingmode === "set") {
      this.manualSetSpell(choice);
    }
    if (this.zonetargetingmode === "token") {
      this.manualToken(choice);
    }
    this.zonetargetingmode = false;
    return;
  }
  /**
  * Starts special summon used by the manual module.
  * @param {string} mode The mode value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  startSpecialSummon(mode) {
    app.duel.closeRevealer();
    this.zonetargetingmode = mode;
    const player = 0;
    app.duel.select({
      zones: [
        { player, location: "MONSTERZONE", index: 0 },
        { player, location: "MONSTERZONE", index: 1 },
        { player, location: "MONSTERZONE", index: 2 },
        { player, location: "MONSTERZONE", index: 3 },
        { player, location: "MONSTERZONE", index: 4 }
      ]
    });
    if (!this.legacyMode) {
      app.duel.select({
        zones: [
          { player, location: "MONSTERZONE", index: 0 },
          { player, location: "MONSTERZONE", index: 1 },
          { player, location: "MONSTERZONE", index: 2 },
          { player, location: "MONSTERZONE", index: 3 },
          { player, location: "MONSTERZONE", index: 4 },
          { player, location: "MONSTERZONE", index: 5 },
          { player, location: "MONSTERZONE", index: 6 }
        ]
      });
    }
    if (mode === "generic") {
      if (this.legacyMode) {
        app.duel.select({
          zones: [
            { player, location: "SPELLZONE", index: 0 },
            { player, location: "SPELLZONE", index: 1 },
            { player, location: "SPELLZONE", index: 2 },
            { player, location: "SPELLZONE", index: 3 },
            { player, location: "SPELLZONE", index: 4 }
          ]
        });
      } else {
        app.duel.select({
          zones: [
            { player, location: "SPELLZONE", index: 0 },
            { player, location: "SPELLZONE", index: 1 },
            { player, location: "SPELLZONE", index: 2 },
            { player, location: "SPELLZONE", index: 3 },
            { player, location: "SPELLZONE", index: 4 },
            { player, location: "SPELLZONE", index: 5 },
            { player, location: "SPELLZONE", index: 6 }
          ]
        });
      }
    }
  }
  /**
  * Starts spell targeting used by the manual module.
  * @param {string} mode The mode value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  startSpellTargeting(mode) {
    "use strict";
    this.zonetargetingmode = mode;
    app.duel.closeRevealer();
    $(".cardselectionzone.p0.SPELLZONE").addClass("attackglow card");
    if (!this.legacyMode) {
      $(".cardselectionzone.p0.SPELLZONE.i6").removeClass("attackglow card");
      $(".cardselectionzone.p0.SPELLZONE.i7").removeClass("attackglow card");
    }
    $(".cardselectionzone.p0.SPELLZONE.i5").removeClass("attackglow card");
    this.exclusionList(0, "SPELLZONE", "attackglow");
  }
  /**
  * Starts xyzsummon used by the manual module.
  * @returns {void} Does not return a value.
  */
  startXYZSummon() {
    const viables = app.duel.field.state.cards.filter((card) => {
      return card.state.location === "MONSTERZONE" && card.state.player === window.orientation;
    });
    if (viables.length === 0) {
      return;
    }
    this.overlaymode = true;
    this.overlaylist = [this.manualActionReference];
    app.duel.select({
      zones: viables.map((card) => card.state)
    });
  }
  /**
  * Makes monster used by the manual module.
  * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
  * @param {number} card.player The `player` property supplies structured input used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makeMonster(card, index) {
    return {
      player: card.player,
      location: "MONSTERZONE",
      index,
      position: "FaceUpAttack",
      overlayindex: 0,
      isBecomingCard: false
    };
  }
  /**
  * Makes spell used by the manual module.
  * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
  * @param {number} card.player The `player` property supplies structured input used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makeSpell(card, index) {
    return {
      player: card.player,
      location: "SPELLZONE",
      index,
      position: "FaceUp",
      overlayindex: 0,
      isBecomingCard: false
    };
  }
  /**
  * Makes hand used by the manual module.
  * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
  * @param {number} card.player The `player` property supplies structured input used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makeHand(card, index) {
    return {
      player: card.player,
      location: "HAND",
      index,
      position: "FaceUp",
      overlayindex: 0,
      isBecomingCard: false
    };
  }
  /**
  * Makes deck card used by the manual module.
  * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
  * @param {number} card.player The `player` property supplies structured input used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makeDeckCard(card, index) {
    return {
      player: card.player,
      location: "DECK",
      index,
      position: "FaceDown",
      overlayindex: 0,
      isBecomingCard: false
    };
  }
  /**
  * Makes extra used by the manual module.
  * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
  * @param {number} card.player The `player` property supplies structured input used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makeExtra(card, index) {
    return {
      player: card.player,
      location: "EXTRA",
      index,
      position: "FaceDown",
      overlayindex: 0,
      isBecomingCard: false
    };
  }
  /**
  * Makes grave used by the manual module.
  * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
  * @param {number} card.player The `player` property supplies structured input used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makeGrave(card, index) {
    return {
      player: card.player,
      location: "GRAVE",
      index,
      position: "FaceUp",
      overlayindex: 0,
      isBecomingCard: false
    };
  }
  /**
  * Makes removed used by the manual module.
  * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
  * @param {number} card.player The `player` property supplies structured input used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makeRemoved(card, index) {
    return {
      player: card.player,
      location: "BANISHED",
      index,
      position: "FaceUp",
      overlayindex: 0,
      isBecomingCard: false
    };
  }
  /**
  * Sets monster used by the manual module.
  * @param {Object} card The card value provides an input used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  setMonster(card, index) {
    var end = this.makeMonster(card, index);
    end.position = "FaceDownDefence";
    return end;
  }
  /**
  * Executes the defence monster helper used by the manual module.
  * @param {Object} card The card value provides an input used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  defenceMonster(card, index) {
    var end = this.makeMonster(card, index);
    end.position = "FaceUpDefence";
    return end;
  }
  /**
  * Sets spell used by the manual module.
  * @param {Object} card The card value provides an input used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  setSpell(card, index) {
    var end = this.makeSpell(card, index);
    end.position = "FaceDown";
    return end;
  }
  /**
  * Makes field spell used by the manual module.
  * @param {Object} card The card value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makeFieldSpell(card) {
    return this.makeSpell(card, 5);
  }
  /**
  * Makes field spell face down used by the manual module.
  * @param {Object} card The card value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makeFieldSpellFaceDown(card) {
    var end = this.setSpell(card, 5);
    return end;
  }
  /**
  * Makes pendulum zone l used by the manual module.
  * @param {Object} card The card value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makePendulumZoneL(card) {
    return this.makeSpell(card, this.penL());
  }
  /**
  * Makes pendulum zone r used by the manual module.
  * @param {Object} card The card value provides an input used by the manual module.
  * @returns {Object} Returns the value produced by the manual module.
  */
  makePendulumZoneR(card) {
    return this.makeSpell(card, this.penR());
  }
  /**
  * Executes the manual next phase helper used by the manual module.
  * @param {string} phase The phase value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualNextPhase(phase) {
    this.ws.write({
      action: "nextPhase",
      phase,
      sound: "soundphase"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual next turn helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualNextTurn() {
    this.ws.write({
      action: "nextTurn"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual change lifepoints helper used by the manual module.
  * @param {number} amount The amount value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualChangeLifepoints(amount) {
    this.ws.write({
      action: "changeLifepoints",
      amount,
      sound: "soundchangeLifePoints"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual move card helper used by the manual module.
  * @param {Object} movement The movement value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualMoveCard(movement) {
    this.ws.write(movement);
    this.clearCardReference();
  }
  /**
  * Executes the manual shuffle hand helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualShuffleHand() {
    setTimeout(() => {
      this.ws.write({
        action: "shuffleHand",
        sound: "soundcardShuffle"
      });
      this.clearCardReference();
    });
  }
  /**
  * Executes the manual draw helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualDraw() {
    this.ws.write({
      action: "draw",
      sound: "sounddrawCard"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual excavate top helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualExcavateTop() {
    this.ws.write({
      action: "excavate",
      sound: "sounddrawCard"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual shuffle deck helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualShuffleDeck() {
    this.ws.write({
      action: "shuffleDeck",
      sound: "soundcardShuffle"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual reveal top helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRevealTop() {
    this.ws.write({
      action: "revealTop"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual reveal bottom helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRevealBottom() {
    this.ws.write({
      action: "revealBottom"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual reveal deck helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRevealDeck() {
    this.ws.write({
      action: "revealDeck"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual reveal extra helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRevealExtra() {
    this.ws.write({
      action: "revealExtra"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual reveal excavated helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRevealExcavated() {
    this.ws.write({
      action: "revealExcavated"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual mill helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualMill() {
    this.ws.write({
      action: "mill"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual mill removed card helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualMillRemovedCard() {
    this.ws.write({
      action: "millRemovedCard"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual mill removed card face down helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualMillRemovedCardFaceDown() {
    this.ws.write({
      action: "millRemovedCardFaceDown"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual view deck helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualViewDeck() {
    this.ws.write({
      action: "viewDeck"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual view banished helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualViewBanished() {
    this.ws.write({
      action: "viewBanished",
      player: this.manualActionReference.player
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual flip deck helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualFlipDeck() {
    this.ws.write({
      action: "flipDeck"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual add counter helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualAddCounter() {
    this.ws.write({
      action: "addCounter",
      uid: this.manualActionReference.uid
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual remove counter helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRemoveCounter() {
    this.ws.write({
      action: "removeCounter",
      uid: this.manualActionReference.uid
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual attack helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualAttack() {
    this.ws.write({
      action: "attack",
      source: this.manualActionReference,
      target: this.targetreference,
      sound: "soundattack"
    });
    this.attackmode = false;
    this.clearCardReference();
  }
  /**
  * Executes the manual attack directly helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualAttackDirectly() {
    this.targetreference = {
      player: orientSlot ? 0 : 1,
      location: "HAND",
      index: 0,
      position: "FaceUp"
    };
    this.manualAttack();
  }
  /**
  * Executes the manual target helper used by the manual module.
  * @param {string} target The target value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualTarget(target) {
    this.ws.write({
      action: "target",
      target
    });
    this.targetmode = false;
    this.clearCardReference();
  }
  /**
  * Executes the manual remove token helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRemoveToken() {
    console.log(this.manualActionReference);
    this.ws.write({
      action: "removeToken",
      uid: this.manualActionReference.uid
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual view extra helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualViewExtra() {
    this.ws.write({
      action: "viewExtra",
      player: this.manualActionReference.player
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual view excavated helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualViewExcavated() {
    this.ws.write({
      action: "viewExcavated",
      player: this.manualActionReference.player
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual view grave helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualViewGrave() {
    this.ws.write({
      action: "viewGrave",
      player: this.manualActionReference.player
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual view xyzmaterials helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualViewXYZMaterials() {
    this.ws.write({
      action: "viewXYZ",
      index: this.manualActionReference.index,
      player: this.manualActionReference.player
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual signal effect helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualSignalEffect() {
    this.ws.write({
      action: "effect",
      id: this.manualActionReference.id,
      player: this.manualActionReference.player,
      index: this.manualActionReference.index,
      location: this.manualActionReference.location,
      name: this.manualActionReference.name
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual normal summon helper used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualNormalSummon(index) {
    index = index !== void 0 ? index : this.manualActionReference.index;
    var end = this.makeMonster(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundspecialSummonFromExtra";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to attack helper used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToAttack(index) {
    index = index !== void 0 ? index : this.manualActionReference.index;
    var end = this.makeMonster(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundspecialSummonFromExtra";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual set monster helper used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualSetMonster(index) {
    index = index !== void 0 ? index : automaticZonePicker(this.manualActionReference.player, "MONSTERZONE");
    var end = this.setMonster(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundspecialSummonFromExtra";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to defence helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToDefence() {
    var index = this.manualActionReference.index, end = this.defenceMonster(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to face down defence helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToFaceDownDefence() {
    var index = this.manualActionReference.index, end = this.setMonster(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to face up defence helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToFaceUpDefence() {
    var index = this.manualActionReference.index, end = this.defenceMonster(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual set monster face up helper used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualSetMonsterFaceUp(index) {
    index = index !== void 0 ? index : this.manualActionReference.index;
    var end = this.defenceMonster(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundspecialSummonFromExtra";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual move generic helper used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @param {string} zone The zone value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualMoveGeneric(index, zone) {
    index = index !== void 0 ? index : this.manualActionReference.index;
    var message = this.makeCardMovement(this.manualActionReference, {
      player: window.orientation,
      location: zone,
      position: this.manualActionReference.position,
      index
    });
    message.action = "moveCard";
    message.sound = "soundspecialSummonFromExtra";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual activate helper used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualActivate(index) {
    index = index !== void 0 ? index : this.manualActionReference.index;
    var end = this.makeSpell(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundactivateCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual activate field spell helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualActivateFieldSpell() {
    var end = this.makeFieldSpell(this.manualActionReference), message = this.makeCardMovement(this.manualActionReference, end);
    message.sound = "soundactivateCard";
    message.action = "moveCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual activate field spell face down helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualActivateFieldSpellFaceDown() {
    var end = this.makeFieldSpellFaceDown(this.manualActionReference), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundsetCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual set spell helper used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualSetSpell(index) {
    index = index !== void 0 ? index : automaticZonePicker(this.manualActionReference.player, "SPELLZONE");
    var end = this.setSpell(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundsetCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual stflip down helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualSTFlipDown() {
    var index = this.manualActionReference.index, end = this.setSpell(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundflipSummon";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual stflip up helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualSTFlipUp() {
    var index = this.manualActionReference.index, end = this.makeSpell(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundflipSummon";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to excavate helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToExcavate() {
    var index = $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".EXCAVATED").length, end = this.makeHand(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.movelocation = "EXCAVATED";
    message.action = "moveCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to extra helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToExtra() {
    var index = $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".EXTRA").length, end = this.makeExtra(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.moveposition = "FaceDown";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual take helper used by the manual module.
  * @param {Object} message The message object supplies the structured input used by the manual module, including the `choice` and `target` properties.
  * @param {string} message.choice The `choice` property supplies structured input used by the manual module.
  * @param {Array} message.target The `target` property supplies structured input used by the manual module.
  * @param {number} message.target.index The `target.index` property supplies structured input used by the manual module.
  * @param {number} message.target.player The `target.player` property supplies structured input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualTake(message) {
    if (message.target.player !== window.orientation) {
      this.manualActionReference = message.target;
      if (message.choice === "HAND") {
        this.manualMoveGeneric(message.target.index, "HAND");
      } else {
        this.startSpecialSummon("generic");
      }
    }
  }
  /**
  * Executes the manual to opponent helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToOpponent() {
    this.ws.write({
      action: "give",
      target: this.manualActionReference
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual to opponents hand helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToOpponentsHand() {
    this.ws.write({
      action: "give",
      target: this.manualActionReference,
      choice: "HAND"
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual to top of deck helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToTopOfDeck() {
    if (cardIs("fusion", this.manualActionReference) || cardIs("synchro", this.manualActionReference) || cardIs("xyz", this.manualActionReference) || cardIs("link", this.manualActionReference)) {
      manualToExtra();
      return;
    }
    if (cardIs("fusion", this.manualActionReference) || cardIs("synchro", this.manualActionReference) || cardIs("xyz", this.manualActionReference) || cardIs("link", this.manualActionReference)) {
      manualToExtra();
      return;
    }
    var index = $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".DECK").length, end = this.makeDeckCard(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to bottom of deck helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToBottomOfDeck() {
    this.ws.write({
      action: "offsetDeck"
    });
    var index = 0, end = this.makeDeckCard(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    setTimeout(() => {
      this.ws.write(message);
      this.clearCardReference();
    }, 300);
  }
  /**
  * Executes the manual slide right helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualSlideRight() {
    var index = this.manualActionReference.index + 1, end = JSON.parse(JSON.stringify(this.manualActionReference)), message = this.makeCardMovement(this.manualActionReference, end);
    if (index === this.legacyMode ? 7 : 5) {
      index = 0;
    }
    message.moveindex = index;
    message.action = "moveCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual slide left helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualSlideLeft() {
    var index = this.manualActionReference.index - 1, end = JSON.parse(JSON.stringify(this.manualActionReference)), message = this.makeCardMovement(this.manualActionReference, end);
    if (index === -1) {
      index = legacyMode ? 6 : 4;
      index = legacyMode ? 6 : 4;
    }
    message.moveindex = index;
    message.action = "moveCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual overlay helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualOverlay() {
    var overlayindex = 0;
    this.revealcache.forEach((card, index) => {
      if (index === revealcacheIndex) {
        return;
      }
      overlayindex += 1;
      var message = this.makeCardMovement(card, card);
      message.overlayindex = overlayindex;
      message.action = "moveCard";
      this.ws.write(message);
      this.clearCardReference();
    });
  }
  /**
  * Executes the manual xyzsummon helper used by the manual module.
  * @param {Object} target The target object supplies the structured input used by the manual module, including the `index` property.
  * @param {number} target.index The `index` property supplies structured input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualXYZSummon(target) {
    this.overlaymode = false;
    this.overlaylist.push(target);
    var index = target.index, end = this.makeMonster(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    this.ws.write(message);
    setTimeout(() => {
      var overlayindex = 0;
      overlaylist.forEach((card, cindex) => {
        overlayindex += 1;
        var message2 = this.makeCardMovement(card, card);
        message2.overlayindex = overlayindex;
        message2.action = index;
        message2.action = "moveCard";
        this.ws.write(message2);
        this.clearCardReference();
      });
    }, 1e3);
  }
  /**
  * Executes the manual to grave helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToGrave() {
    var index = $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".GRAVE").length, end = this.makeGrave(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to opponents grave helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToOpponentsGrave() {
    var moveplayer = this.manualActionReference.player ? 0 : 1, index = $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".GRAVE").length, end = this.makeGrave(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.moveplayer = moveplayer;
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to removed helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToRemoved() {
    var index = $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".BANISHED").length, end = this.makeRemoved(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to extra face up helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToExtraFaceUp() {
    var index = $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".EXTRA").length, end = this.makeExtra(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.moveposition = "FaceUp";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to hand helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToHand() {
    if (cardIs("fusion", this.manualActionReference) || cardIs("synchro", this.manualActionReference) || cardIs("xyz", this.manualActionReference) || cardIs("link", this.manualActionReference)) {
      this.manualToExtra();
      return;
    }
    var index = $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".HAND").length, end = this.makeHand(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    this.clearCardReference();
    this.ws.write(message);
  }
  /**
  * Executes the manual to extra helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToExtra() {
    var index = $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".EXTRA").length, end = this.makeExtra(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.moveposition = "FaceDown";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to removed facedown helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToRemovedFacedown() {
    var index = $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".BANISHED").length, end = this.makeRemoved(this.manualActionReference, index), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.moveposition = "FaceDown";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual activate field helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualActivateField() {
    if ($("#automationduelfield .p" + orient(this.manualActionReference.player) + ".SPELLZONE.i5").length) {
      return;
    }
    var end = this.makeSpell(this.manualActionReference, 5), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundsetCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to pzone l helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToPZoneL() {
    if ($("#automationduelfield .p" + orient(this.manualActionReference.player) + ".SPELLZONE.i" + penL()).length) {
      return;
    }
    var end = this.makeSpell(this.manualActionReference, penL()), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundsetCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual to pzone r helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToPZoneR() {
    if ($("#automationduelfield .p" + orient(this.manualActionReference.player) + ".SPELLZONE.i" + penR()).length) {
      return;
    }
    var end = this.makeSpell(this.manualActionReference, penR()), message = this.makeCardMovement(this.manualActionReference, end);
    message.action = "moveCard";
    message.sound = "soundsetCard";
    this.ws.write(message);
    this.clearCardReference();
  }
  /**
  * Executes the manual reveal hand single helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRevealHandSingle() {
    this.ws.write({
      action: "revealHandSingle",
      card: this.manualActionReference
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual reveal hand helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRevealHand() {
    this.ws.write({
      action: "revealHand",
      card: this.manualActionReference
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual reveal extra deck random helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRevealExtraDeckRandom() {
    var card = this.manualActionReference;
    card.index = Math.floor(Math.random() * $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".EXTRA").length);
    this.ws.write({
      action: "reveal",
      card
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual reveal excavated random helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRevealExcavatedRandom() {
    var card = this.manualActionReference;
    card.index = Math.floor(Math.random() * $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".EXCAVATED").length);
    this.ws.write({
      action: "reveal",
      card
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual reveal deck random helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRevealDeckRandom() {
    var card = this.manualActionReference;
    card.index = Math.floor(Math.random() * $("#automationduelfield .p" + orient(this.manualActionReference.player) + ".DECK").length);
    this.ws.write({
      action: "reveal",
      card
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual token helper used by the manual module.
  * @param {number} index The index value provides an input used by the manual module.
  * @param {(string|number)} id The id value provides an input used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualToken(index, id) {
    var card = {};
    card.player = window.orientation;
    card.location = "MONSTERZONE";
    card.position = "FaceUpDefence";
    card.id = id || parseInt($("#tokendropdown").val(), 10);
    card.index = index;
    card.action = "makeToken";
    this.ws.write(card);
    this.clearCardReference();
  }
  /**
  * Executes the manual roll helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRoll() {
    this.ws.write({
      action: "rollDie",
      name: localStorage.nickname
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual flip helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualFlip() {
    this.ws.write({
      action: "flipCoin",
      name: localStorage.nickname
    });
    this.clearCardReference();
  }
  /**
  * Executes the manual rps helper used by the manual module.
  * @returns {void} Does not return a value.
  */
  manualRPS() {
    this.ws.write({
      action: "rps",
      name: localStorage.nickname
    });
    this.clearCardReference();
  }
};

// server/ui/components/duel/lobby.component.jsx
var import_react2 = __toESM(require("react"), 1);

// server/ui/components/common/app-image.jsx
var import_image = __toESM(require("next/image"), 1);
var import_react = __toESM(require("react"), 1);
function normalizeImageSrc(src) {
  const value = String(src || "").trim();
  if (!value) {
    return "";
  }
  if (/^(data:|blob:|https?:\/\/)/i.test(value)) {
    return value;
  }
  if (value.startsWith("../")) {
    return `/${value.replace(/^(\.\.\/)+/, "")}`;
  }
  if (value.startsWith("./")) {
    return `/${value.replace(/^(\.\/)+/, "")}`;
  }
  if (value.startsWith("/")) {
    return value;
  }
  return `/${value.replace(/^\/+/, "")}`;
}
function AppImage({
  src,
  fallbackSrc,
  alt = "",
  width = 100,
  height = 100,
  sizes,
  style,
  unoptimized,
  onError,
  ...rest
}) {
  const normalizedSrc = (0, import_react.useMemo)(() => normalizeImageSrc(src), [src]), normalizedFallbackSrc = (0, import_react.useMemo)(() => normalizeImageSrc(fallbackSrc), [fallbackSrc]), [currentSrc, setCurrentSrc] = (0, import_react.useState)(normalizedSrc || normalizedFallbackSrc);
  (0, import_react.useEffect)(() => {
    setCurrentSrc(normalizedSrc || normalizedFallbackSrc);
  }, [normalizedFallbackSrc, normalizedSrc]);
  if (!currentSrc) {
    return null;
  }
  const remote = /^https?:\/\//i.test(currentSrc), shouldSkipOptimization = unoptimized ?? (remote || currentSrc.endsWith(".svg"));
  return /* @__PURE__ */ import_react.default.createElement(
    import_image.default,
    {
      alt,
      height,
      onError: (event) => {
        if (normalizedFallbackSrc && currentSrc !== normalizedFallbackSrc) {
          setCurrentSrc(normalizedFallbackSrc);
        }
        onError?.(event);
      },
      sizes,
      src: currentSrc,
      style,
      unoptimized: shouldSkipOptimization,
      width,
      ...rest
    }
  );
}

// server/ui/components/duel/lobby.component.module.scss
var lobby_component_module_default = ".root {}\n";

// server/ui/components/duel/lobby.component.jsx
var LAST_SELECTED_DECK_KEY = "ygopro:lastSelectedDeckIndex";
function getStoredSelectedDeckIndex() {
  if (typeof window === "undefined") {
    return 0;
  }
  const rawValue = window.localStorage.getItem(LAST_SELECTED_DECK_KEY), parsedValue = Number(rawValue);
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
}
function storeSelectedDeckIndex(index) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LAST_SELECTED_DECK_KEY, String(index));
}
function getDeckValue(lobby) {
  const deck = lobby.state.decks[lobby.state.selectedDeck];
  if (!deck) {
    return null;
  }
  function toCardId(card) {
    if (typeof card === "number" && Number.isFinite(card)) {
      return card;
    }
    if (typeof card === "string" && card.trim()) {
      const parsed = Number(card);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (card && typeof card === "object") {
      const parsed = Number(card.id);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }
  function mapDeckZone(cards) {
    if (!Array.isArray(cards)) {
      return [];
    }
    return cards.map(toCardId).filter((cardId) => Number.isFinite(cardId) && cardId > 0);
  }
  return {
    main: mapDeckZone(deck.main),
    side: mapDeckZone(deck.side),
    extra: mapDeckZone(deck.extra)
  };
}
function slotElement(lobby, player) {
  if (lobby.state.mode !== "Tag" && player > 2) {
    return "";
  }
  const p = lobby.state.player[player - 1], username = typeof p?.username === "string" ? p.username : "", avatar = p && p.avatar ? p.avatar : "", points = Number.isFinite(Number(p?.points)) ? Number(p.points) : 0, elo = Number.isFinite(Number(p?.elo)) ? Number(p.elo) : 1200, rating = p && p.username ? `Points: ${points} | Rating: ${elo}` : "Open slot", lock = p ? p.ready : false;
  return /* @__PURE__ */ import_react2.default.createElement("div", { id: `slot${player}`, className: "slot", key: `slot-${player}` }, avatar ? /* @__PURE__ */ import_react2.default.createElement(AppImage, { className: "avatar", src: avatar, alt: username || `Open slot ${player}`, fallbackSrc: "../img/textures/cover.jpg", width: 56, height: 56, style: { width: "3.5rem", height: "5.5vh", objectFit: "cover" } }) : /* @__PURE__ */ import_react2.default.createElement("div", { className: "avatar placeholder", "data-slot": player }, username ? username.charAt(0).toUpperCase() : ""), /* @__PURE__ */ import_react2.default.createElement("div", { className: "lobbyrating" }, rating), /* @__PURE__ */ import_react2.default.createElement("div", { className: "kickbutton", onClick: () => lobby.kickDuelist(player) }, "X"), /* @__PURE__ */ import_react2.default.createElement("input", { id: `player${player}lobbyslot`, placeholder: "empty slot", value: username, readOnly: true }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "lockindicator", onClick: () => lobby.lock(player), "data-state": lock }));
}
function currentDeckElement(lobby) {
  if (!lobby.state.decks.length) {
    return /* @__PURE__ */ import_react2.default.createElement("div", { id: "lobbycurrentdeck" }, "Select Deck :", /* @__PURE__ */ import_react2.default.createElement("select", { className: "currentdeck", disabled: true }, /* @__PURE__ */ import_react2.default.createElement("option", { value: "" }, "Loading decks...")));
  }
  return /* @__PURE__ */ import_react2.default.createElement("div", { id: "lobbycurrentdeck" }, "Select Deck :", /* @__PURE__ */ import_react2.default.createElement(
    "select",
    {
      className: "currentdeck",
      value: String(lobby.state.selectedDeck),
      onChange: lobby.deckSelect
    },
    lobby.state.decks.map((deck, index) => /* @__PURE__ */ import_react2.default.createElement("option", { key: index, value: index }, deck.name))
  ));
}
function aiMetadataElement(lobby) {
  const aiName = typeof lobby.state.aiName === "string" && lobby.state.aiName.trim() ? lobby.state.aiName.trim() : typeof lobby.state.opponentName === "string" && lobby.state.opponentName.trim() ? lobby.state.opponentName.trim() : "";
  if (!aiName) {
    return "";
  }
  return [
    /* @__PURE__ */ import_react2.default.createElement("br", { key: "lobby-ai-break" }),
    /* @__PURE__ */ import_react2.default.createElement("span", { id: "translateaiopponent", key: "translateaiopponent" }, "AI Opponent"),
    /* @__PURE__ */ import_react2.default.createElement("span", { id: "lobbyainame", key: "lobbyainame" }, aiName)
  ];
}
function LobbyScreen({ lobby }) {
  console.log("lobby render", lobby.state.banlist);
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: lobby_component_module_default.root, id: "lobbymenu" }, /* @__PURE__ */ import_react2.default.createElement("div", { id: "duelspectate" }, /* @__PURE__ */ import_react2.default.createElement("span", { id: "lobbygotoduel", onClick: lobby.start }, "Duel"), /* @__PURE__ */ import_react2.default.createElement("span", { id: "lobbygotospectate", onClick: lobby.spectate }, "Spectate"), slotElement(lobby, 1), slotElement(lobby, 2), slotElement(lobby, 3), slotElement(lobby, 4)), /* @__PURE__ */ import_react2.default.createElement("div", { id: "lobbygameinfo" }, /* @__PURE__ */ import_react2.default.createElement("span", { id: "judgetxt" }, "Judge"), /* @__PURE__ */ import_react2.default.createElement("span", { id: "lobbyauto" }, lobby.state.automatic), /* @__PURE__ */ import_react2.default.createElement("br", null), /* @__PURE__ */ import_react2.default.createElement("span", { id: "competitiontxt" }, "Competition"), /* @__PURE__ */ import_react2.default.createElement("span", { id: "lobbyranked" }, lobby.state.ranked), /* @__PURE__ */ import_react2.default.createElement("br", null), /* @__PURE__ */ import_react2.default.createElement("span", { id: "translatefl" }, "Forbidden List"), /* @__PURE__ */ import_react2.default.createElement("span", { id: "lobbyflist" }, lobby.state.banlist), /* @__PURE__ */ import_react2.default.createElement("br", null), /* @__PURE__ */ import_react2.default.createElement("span", { id: "translateacp" }, "Allowed Card Pool"), /* @__PURE__ */ import_react2.default.createElement("span", { id: "lobbyallowed" }, lobby.state.allowedCardsLabel), /* @__PURE__ */ import_react2.default.createElement("br", null), /* @__PURE__ */ import_react2.default.createElement("span", { id: "translategamemode" }, "Game Mode"), /* @__PURE__ */ import_react2.default.createElement("span", { id: "lobbygamemode" }, lobby.state.mode), /* @__PURE__ */ import_react2.default.createElement("br", null), /* @__PURE__ */ import_react2.default.createElement("span", { id: "translatestartinglifepoints" }, "Starting Lifepoints"), /* @__PURE__ */ import_react2.default.createElement("span", { id: "lobbylp" }, lobby.state.startingLP), aiMetadataElement(lobby)), currentDeckElement(lobby));
}
function createLobbyScreen(store2, chat, ws) {
  const lobby = {
    ws,
    store: store2,
    sidechat: chat,
    state: {
      decks: [],
      selectedDeck: getStoredSelectedDeckIndex()
    },
    start: () => {
      if (!lobby.deck) {
        return;
      }
      const slotIndex = Number.isInteger(lobby.state.slot) ? lobby.state.slot : 0, player = lobby.state.player?.[slotIndex], alreadyReady = Boolean(player?.ready);
      if (!alreadyReady) {
        lobby.ws.write({
          action: "lock",
          deck: lobby.deck
        });
      }
      lobby.ws.write({
        action: "determine"
      });
    },
    spectate: () => {
      lobby.ws.write({
        action: "spectate"
      });
    },
    kickDuelist: (player) => {
      lobby.ws.write({
        action: "kick",
        slot: player
      });
    },
    leave: () => {
      lobby.ws.write({
        action: "leave"
      });
    },
    lock: () => {
      if (!lobby.deck) {
        return;
      }
      lobby.ws.write({
        action: "lock",
        deck: lobby.deck
      });
    },
    deckSelect: (event) => {
      lobby.state.selectedDeck = Number(event.currentTarget.value) || 0;
      storeSelectedDeckIndex(lobby.state.selectedDeck);
      lobby.store?.emit?.({
        action: "RENDER"
      });
    },
    update: (update) => {
      Object.assign(lobby.state, update);
      if (!lobby.state.decks.length) {
        lobby.state.selectedDeck = 0;
      } else if (!Number.isInteger(lobby.state.selectedDeck) || lobby.state.selectedDeck >= lobby.state.decks.length) {
        lobby.state.selectedDeck = getStoredSelectedDeckIndex();
        if (lobby.state.selectedDeck >= lobby.state.decks.length) {
          lobby.state.selectedDeck = 0;
        }
      }
      storeSelectedDeckIndex(lobby.state.selectedDeck);
      app.manual = Boolean(lobby.state.automatic !== "Automatic");
      console.log("lobby", lobby.state);
    }
  };
  Object.defineProperty(lobby, "deck", {
    get() {
      return getDeckValue(lobby);
    }
  });
  return lobby;
}

// server/ui/components/duel/choice.component.jsx
var import_react4 = __toESM(require("react"), 1);

// server/ui/components/duel/sidechat.component.jsx
var import_react3 = __toESM(require("react"), 1);

// server/ui/components/duel/sidechat.component.module.scss
var sidechat_component_module_default = ".root {}\n";

// server/ui/components/duel/sidechat.component.jsx
function sanitize(str) {
  var temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}
function resolveSideChatStore(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function createEmptySideChatState(state = {}) {
  return {
    chat: [],
    ...state
  };
}
function appendSideChatMessage(target, message) {
  const controller = target?.state ? target : void 0, resolvedStore = resolveSideChatStore(target);
  if (!controller || !message) {
    return;
  }
  const nextMessage = {
    ...message,
    avatar: ""
  };
  if (app.lobby.state.player.length) {
    const player = app.lobby.state.player.find((player2) => message.username === player2.username);
    if (player) {
      nextMessage.avatar = player.avatar;
    }
  }
  nextMessage.message = sanitize(nextMessage.message);
  controller.state.chat = controller.state.chat.concat([nextMessage]);
  resolvedStore?.emit?.({
    action: "UPDATE_SIDECHAT",
    state: {
      chat: controller.state.chat
    }
  });
}
function handleSideChatKeyDown(controller, event) {
  const message = sanitize(event.target.value), parts = message.split(" "), key = {
    RETURN: 13,
    DOWN: 40
  };
  let amount;
  switch (event.which) {
    case key.DOWN:
      event.target.value = controller.sent;
      break;
    case key.RETURN:
      if (!event.target.value) {
        return;
      }
      if (parts[0] === "/surrender") {
        event.target.value = "";
        app.surrender();
        return;
      }
      if (app.manual) {
        if (parts[0] === "/roll") {
          event.target.value = "";
          controller.manualControls.manualRoll();
          return;
        }
        if (parts[0] === "/flip") {
          event.target.value = "";
          controller.manualControls.manualFlip();
          return;
        }
        if (parts[0] === "/token") {
          event.target.value = "";
          controller.manualControls.manualToken();
          return;
        }
        if (parts[0] === "/rps") {
          event.target.value = "";
          controller.manualControls.manualRPS();
          return;
        }
        if (parts.length === 2) {
          if (parts[0] === "/sub") {
            amount = -1 * parseInt(parts[1], 10);
            if (isNaN(amount)) {
              return;
            }
            controller.manualControls.manualChangeLifepoints(amount);
            event.target.value = "";
            return;
          }
          if (parts[0] === "/add") {
            amount = parseInt(parts[1], 10);
            if (isNaN(amount)) {
              return;
            }
            controller.manualControls.manualChangeLifepoints(amount);
            event.target.value = "";
            return;
          }
          if (parts[0] === "/draw") {
            amount = parseInt(parts[1], 10);
            if (isNaN(amount)) {
              return;
            }
            for (let i = 0; i < amount; i += 1) {
              controller.manualControls.manualDraw();
            }
            event.target.value = "";
            return;
          }
          if (parts[0] === "/excavate") {
            amount = parseInt(parts[1], 10);
            if (isNaN(amount)) {
              return;
            }
            for (let i = 0; i < amount; i += 1) {
              controller.manualControls.manualExcavateTop();
            }
            event.target.value = "";
            return;
          }
          if (parts[0] === "/mill") {
            amount = parseInt(parts[1], 10);
            if (isNaN(amount)) {
              return;
            }
            for (let i = 0; i < amount; i += 1) {
              controller.manualControls.manualMill();
            }
            event.target.value = "";
            return;
          }
          if (parts[0] === "/banish") {
            amount = parseInt(parts[1], 10);
            if (isNaN(amount)) {
              return;
            }
            for (let i = 0; i < amount; i += 1) {
              controller.manualControls.manualMillRemovedCard();
            }
            event.target.value = "";
            return;
          }
          if (parts[0] === "/banishfd") {
            amount = parseInt(parts[1], 10);
            if (isNaN(amount)) {
              return;
            }
            for (let i = 0; i < amount; i += 1) {
              controller.manualControls.manualMillRemovedCardFaceDown();
            }
            event.target.value = "";
            return;
          }
        }
      }
      controller.store.emit({ action: "CHAT_ENTRY", message });
      controller.sent = message;
      event.target.value = "";
      break;
    default:
      return;
  }
}
function SideChatMessage({ message, index }) {
  return /* @__PURE__ */ import_react3.default.createElement("li", { key: `char-message-${index}` }, /* @__PURE__ */ import_react3.default.createElement(AppImage, { className: "avatar", src: message.avatar, alt: message.username ? `${message.username} avatar` : "", fallbackSrc: "data:image/gif;base64,R0lGODlhAQABAAAAACw=", width: 48, height: 48, style: { width: "3vw", height: "auto" } }), /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("span", { className: "sidechat-username" }, message.username), /* @__PURE__ */ import_react3.default.createElement("span", { className: "sidechat-date" }, new Date(message.date).toLocaleTimeString()), /* @__PURE__ */ import_react3.default.createElement("span", { className: "sidechat-message" }, message.message)));
}
function SideChatView({ chat, onKeyDown }) {
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: sidechat_component_module_default.root }, /* @__PURE__ */ import_react3.default.createElement(
    "ul",
    {
      id: "sidechattext",
      className: "ingamechatbox"
    },
    chat.map((message, index) => /* @__PURE__ */ import_react3.default.createElement(
      SideChatMessage,
      {
        key: `char-message-${index}`,
        message,
        index
      }
    ))
  ), /* @__PURE__ */ import_react3.default.createElement(
    "input",
    {
      id: "sidechatinput",
      onKeyDown
    }
  ));
}
function MountedSideChat({ controller }) {
  const [state, setState] = (0, import_react3.useState)(createEmptySideChatState(controller?.state));
  (0, import_react3.useEffect)(() => {
    setState(createEmptySideChatState(controller?.state));
  }, [controller]);
  (0, import_react3.useEffect)(() => {
    if (!controller?.store?.on) {
      return void 0;
    }
    return controller.store.on("UPDATE_SIDECHAT", (message) => {
      if (controller?.state) {
        controller.state.chat = message?.state?.chat || [];
      }
      setState(createEmptySideChatState(message?.state));
    });
  }, [controller]);
  if (!controller) {
    return null;
  }
  return /* @__PURE__ */ import_react3.default.createElement(
    SideChatView,
    {
      chat: state.chat,
      onKeyDown: (event) => handleSideChatKeyDown(controller, event)
    }
  );
}
function SideChat(store2, manualControls) {
  return {
    sent: "",
    state: {
      chat: []
    },
    store: store2,
    manualControls
  };
}

// server/ui/components/duel/choice.component.module.scss
var choice_component_module_default = ".root {}\n";

// server/ui/components/duel/choice.component.jsx
function ChoiceChat({ sidechat }) {
  return /* @__PURE__ */ import_react4.default.createElement("div", { id: "lobbychat", key: "sidechat" }, /* @__PURE__ */ import_react4.default.createElement(MountedSideChat, { controller: sidechat }));
}
function renderChoiceError() {
  return /* @__PURE__ */ import_react4.default.createElement("section", { id: "error", key: "error" }, /* @__PURE__ */ import_react4.default.createElement("div", { id: "gofirst" }, "Choice screen error."));
}
function toRpsDisplayIndex(choice, value) {
  const numeric = Number(value);
  if (choice?.state?.protocol === "ocgcore") {
    switch (numeric) {
      case 2:
        return 0;
      case 3:
        return 1;
      case 1:
        return 2;
      default:
        return 0;
    }
  }
  return Math.max(0, Math.min(2, numeric));
}
function startChoiceFirst(choice, startplayer) {
  choice.store?.emit?.({ action: "START_CHOICE", player: startplayer });
}
function replaceChoiceState(choice, nextState) {
  if (!choice) {
    return null;
  }
  choice.state = nextState || {};
  return choice.state;
}
function updateChoiceState(choice, update) {
  if (!choice) {
    return null;
  }
  const resolvedUpdate = typeof update === "function" ? update(choice.state || {}) : update;
  return replaceChoiceState(choice, {
    ...choice.state || {},
    ...resolvedUpdate || {}
  });
}
function setChoiceOverlayActive(choice, active) {
  return updateChoiceState(choice, {
    overlayActive: Boolean(active)
  });
}
function choiceStateMatches(choice, query = {}) {
  const state = choice?.state || {};
  return Object.entries(query).every(([key, value]) => state[key] === value);
}
function answerChoiceRps(choice, answer, setSelectedAnswer) {
  if (choice.state.selectedAnswer !== void 0) {
    return;
  }
  updateChoiceState(choice, {
    selectedAnswer: answer
  });
  setSelectedAnswer?.(answer);
  choice.store.emit({ action: "RENDER" });
  choice.store.emit({ action: "RPS", answer });
}
function renderChoiceRpsOption(label, answer, image, selectedAnswer, onAnswer) {
  const style = {
    background: `url(${image}) no-repeat`
  };
  if (selectedAnswer !== void 0 && selectedAnswer !== answer) {
    style.opacity = 0.25;
  }
  return /* @__PURE__ */ import_react4.default.createElement(
    "div",
    {
      style,
      id: label,
      className: "rpschoice",
      key: label,
      onClick: () => onAnswer(answer)
    }
  );
}
function renderTurnPlayerChoice(choice) {
  return [
    /* @__PURE__ */ import_react4.default.createElement("div", { id: "selectwhogoesfirst", key: "turn-player-controls" }, /* @__PURE__ */ import_react4.default.createElement("div", { id: "gofirst", onClick: () => startChoiceFirst(choice, 0) }, "Go First"), /* @__PURE__ */ import_react4.default.createElement("div", { id: "gosecond", onClick: () => startChoiceFirst(choice, 1) }, "Go Second")),
    /* @__PURE__ */ import_react4.default.createElement(ChoiceChat, { sidechat: choice.sidechat, key: "sidechat" })
  ];
}
function renderRpsChoice(choice, selectedAnswer, onAnswer) {
  return [
    /* @__PURE__ */ import_react4.default.createElement("div", { id: "selectwhogoesfirst", className: "rpscontainer", key: "rps-controls" }, renderChoiceRpsOption("Rock", "rock", "../img/textures/rock.jpg", selectedAnswer, onAnswer), renderChoiceRpsOption("Paper", "paper", "../img/textures/paper.jpg", selectedAnswer, onAnswer), renderChoiceRpsOption("Scissors", "scissors", "../img/textures/scissors.jpg", selectedAnswer, onAnswer)),
    /* @__PURE__ */ import_react4.default.createElement(ChoiceChat, { sidechat: choice.sidechat, key: "sidechat" })
  ];
}
function renderCoinChoice(choice) {
  const result = choice.state.slot ? "heads" : "tail";
  return [
    /* @__PURE__ */ import_react4.default.createElement("div", { id: "selectwhogoesfirst", key: "coin-controls" }, /* @__PURE__ */ import_react4.default.createElement("div", { id: "gofirst" }, `Flipped a coin, hoping for ${result}`)),
    /* @__PURE__ */ import_react4.default.createElement(ChoiceChat, { sidechat: choice.sidechat, key: "sidechat" })
  ];
}
function describeChoiceCoinFace(value) {
  return value ? "heads" : "tails";
}
function renderDiceChoice(choice) {
  return [
    /* @__PURE__ */ import_react4.default.createElement("div", { id: "selectwhogoesfirst", key: "dice-controls" }, /* @__PURE__ */ import_react4.default.createElement("div", { id: "gofirst" }, "Rolling a die.")),
    /* @__PURE__ */ import_react4.default.createElement(ChoiceChat, { sidechat: choice.sidechat, key: "sidechat" })
  ];
}
function renderRpsResultCard(id, image, key, extraClassName = "") {
  return /* @__PURE__ */ import_react4.default.createElement(
    "div",
    {
      className: `rpsresultlane ${extraClassName}`.trim(),
      key: `${key}-lane`
    },
    /* @__PURE__ */ import_react4.default.createElement(
      "div",
      {
        style: {
          background: `url(${image}) no-repeat`
        },
        id,
        className: extraClassName.includes("opponent") ? "rpschoice opponent" : "rpschoice"
      }
    )
  );
}
function renderRpsResult(choice) {
  const opponentOptions = [
    renderRpsResultCard("p2Rock", "../img/textures/rock.jpg", "p1one", "rpsresultlane-opponent"),
    renderRpsResultCard("p2Paper", "../img/textures/paper.jpg", "p1two", "rpsresultlane-opponent"),
    renderRpsResultCard("p2Scissors", "../img/textures/scissors.jpg", "p1three", "rpsresultlane-opponent")
  ], options = [
    renderRpsResultCard("Rock", "../img/textures/rock.jpg", "one", "rpsresultlane-self"),
    renderRpsResultCard("Paper", "../img/textures/paper.jpg", "two", "rpsresultlane-self"),
    renderRpsResultCard("Scissors", "../img/textures/scissors.jpg", "three", "rpsresultlane-self")
  ], playerResultIndex = toRpsDisplayIndex(choice, choice.state.result[choice.state.slot]), opponentResultIndex = toRpsDisplayIndex(choice, choice.state.result[Math.abs(choice.state.slot - 1)]);
  return [
    /* @__PURE__ */ import_react4.default.createElement("div", { id: "selectwhogoesfirst", className: "rpscontainer result", key: "p1" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "rpszones rpszones-opponent" }, opponentOptions[opponentResultIndex]), /* @__PURE__ */ import_react4.default.createElement("div", { className: "rpszones rpszones-self" }, options[playerResultIndex])),
    /* @__PURE__ */ import_react4.default.createElement(ChoiceChat, { sidechat: choice.sidechat, key: "sidechat" })
  ];
}
function renderCoinResult(choice, includeChat = true) {
  const ocgcoreResults = Array.isArray(choice.state.result) ? choice.state.result.map(describeChoiceCoinFace).join(", ") : "", result = choice.state.protocol === "ocgcore" ? `Coin toss ${Array.isArray(choice.state.result) && choice.state.result.length > 1 ? "results" : "result"}: ${ocgcoreResults || "unknown"}.` : `Flipped ${choice.state.slot ? "heads" : "tails"}.`, views = [/* @__PURE__ */ import_react4.default.createElement("div", { id: "selectwhogoesfirst", key: "coin-result" }, /* @__PURE__ */ import_react4.default.createElement("div", { id: "gofirst" }, result))];
  if (includeChat) {
    views.push(/* @__PURE__ */ import_react4.default.createElement(ChoiceChat, { sidechat: choice.sidechat, key: "sidechat" }));
  }
  return views;
}
function renderDiceResult(choice, includeChat = true) {
  const result = choice.state.protocol === "ocgcore" ? `Dice roll ${Array.isArray(choice.state.result) && choice.state.result.length > 1 ? "results" : "result"}: ${(choice.state.result || []).join(", ") || "unknown"}.` : `You rolled a ${choice.state.result[choice.state.slot]} your opponent rolled a ${choice.state.result[Math.abs(choice.state.slot - 1)]}`, views = [/* @__PURE__ */ import_react4.default.createElement("div", { id: "selectwhogoesfirst", key: "dice-result" }, /* @__PURE__ */ import_react4.default.createElement("div", { id: "gofirst" }, result))];
  if (includeChat) {
    views.push(/* @__PURE__ */ import_react4.default.createElement(ChoiceChat, { sidechat: choice.sidechat, key: "sidechat" }));
  }
  return views;
}
function renderWaitingChoice(choice) {
  return [
    /* @__PURE__ */ import_react4.default.createElement("div", { id: "selectwhogoesfirst", key: "waiting-controls" }, /* @__PURE__ */ import_react4.default.createElement("div", { id: "gofirst" }, "Opponent is deciding who goes first.")),
    /* @__PURE__ */ import_react4.default.createElement(ChoiceChat, { sidechat: choice.sidechat, key: "sidechat" })
  ];
}
function ChoiceOverlayView({ state }) {
  if (!state?.result || state.mode !== "coin" && state.mode !== "dice") {
    return null;
  }
  if (state.mode === "dice") {
    return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "dice", key: "dice-overlay" }, renderDiceResult({ state, sidechat: null }, false));
  }
  return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "coin", key: "coin-overlay" }, renderCoinResult({ state, sidechat: null }, false));
}
function ChoiceScreenView({ state, sidechat, store: store2, selectedAnswer, onSelectRpsAnswer }) {
  if (!state) {
    return null;
  }
  const choice = { state, sidechat, store: store2 };
  if (state.result) {
    switch (state.mode) {
      case "turn_player":
        return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "turn_player", key: "lobby" }, renderTurnPlayerChoice(choice));
      case "rps":
        return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "rps", key: "rps" }, renderRpsResult(choice));
      case "coin":
        return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "coin", key: "coin" }, renderCoinResult(choice));
      case "dice":
        return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "dice", key: "dice" }, renderDiceResult(choice));
      case "waiting":
        return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "waiting", key: "waiting" }, renderWaitingChoice(choice));
      default:
        return renderChoiceError();
    }
  }
  switch (state.mode) {
    case "turn_player":
      return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "turn_player", key: "lobby" }, renderTurnPlayerChoice(choice));
    case "rps":
      return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "rps", key: "rps" }, renderRpsChoice(choice, selectedAnswer, onSelectRpsAnswer));
    case "coin":
      return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "coin", key: "coin" }, renderCoinChoice(choice));
    case "dice":
      return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "dice", key: "dice" }, renderDiceChoice(choice));
    case "waiting":
      return /* @__PURE__ */ import_react4.default.createElement("section", { className: choice_component_module_default.root, id: "waiting", key: "waiting" }, renderWaitingChoice(choice));
    default:
      return renderChoiceError();
  }
}
function MountedChoiceOverlay({ controller }) {
  if (!controller) {
    return null;
  }
  return /* @__PURE__ */ import_react4.default.createElement(ChoiceOverlayView, { state: controller.state });
}
function MountedChoiceScreen({ controller }) {
  const [selectedAnswer, setSelectedAnswer] = (0, import_react4.useState)(controller?.state?.selectedAnswer);
  (0, import_react4.useEffect)(() => {
    if (!controller) {
      return;
    }
    setSelectedAnswer(controller.state.selectedAnswer);
  }, [controller?.state?.selectedAnswer, controller?.state?.mode, controller?.state?.result]);
  if (!controller) {
    return null;
  }
  return /* @__PURE__ */ import_react4.default.createElement(
    ChoiceScreenView,
    {
      state: controller.state,
      sidechat: controller.sidechat,
      store: controller.store,
      selectedAnswer,
      onSelectRpsAnswer: (answer) => answerChoiceRps(controller, answer, setSelectedAnswer)
    }
  );
}
function ChoiceScreenState(store2, chat) {
  return {
    sidechat: chat,
    store: store2,
    result: null,
    state: {
      mode: "coin",
      result: void 0,
      selectedAnswer: void 0
    }
  };
}
function ChoiceScreen(store2, chat) {
  return ChoiceScreenState(store2, chat);
}

// server/ui/components/duel/duel.component.jsx
var import_react27 = __toESM(require("react"), 1);

// server/ui/components/duel/duel.component.module.scss
var duel_component_module_default = ".root {}\n";

// server/ui/components/duel/attack.animation.component.jsx
var import_react5 = __toESM(require("react"), 1);

// server/ui/components/duel/attack.animation.component.module.scss
var attack_animation_component_module_default = ".attackAnimationLayer {\n}\n";

// server/ui/components/duel/attack.animation.component.jsx
function createEmptyAttackAnimationState() {
  return {
    active: false,
    from: void 0,
    to: void 0,
    stage: "idle"
  };
}
function resolveDialogStore(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerAttackAnimation(target, state = {}) {
  const resolvedStore = resolveDialogStore(target);
  if (!resolvedStore) {
    return;
  }
  resolvedStore.emit({
    action: "OPEN_ATTACK_ANIMATION",
    state: {
      active: true,
      from: state.from ?? void 0,
      to: state.to ?? void 0,
      stage: "priming",
      duration: Math.max(300, Number(state.duration || 720))
    }
  });
}
function disposeAttackAnimation(target) {
  resolveDialogStore(target)?.emit?.({ action: "CLOSE_ATTACK_ANIMATION" });
}
function AttackAnimationLayerView({ state }) {
  if (!state) {
    return null;
  }
  const from = state.from, to = state.to;
  if (!state.active || !from || !to) {
    return null;
  }
  const deltaX = Number(to.x || 0) - Number(from.x || 0), deltaY = Number(to.y || 0) - Number(from.y || 0), distance = Math.max(48, Math.hypot(deltaX, deltaY)), angle = Math.atan2(deltaY, deltaX), style = {
    left: `${Number(from.x || 0)}px`,
    top: `${Number(from.y || 0)}px`,
    width: state.stage === "travel" ? `${distance}px` : "0px",
    opacity: state.stage === "travel" ? 1 : 0.15,
    position: "fixed",
    pointerEvents: "none",
    transform: `translateY(-50%) rotate(${angle}rad)`,
    transformOrigin: "0 50%"
  };
  return /* @__PURE__ */ import_react5.default.createElement(
    "div",
    {
      id: "attackanimation",
      key: "attackanimation",
      className: attack_animation_component_module_default.attackAnimationLayer,
      style
    },
    /* @__PURE__ */ import_react5.default.createElement(
      AppImage,
      {
        alt: "",
        "aria-hidden": "true",
        src: "/img/textures/attack.png",
        width: 256,
        height: 24,
        style: {
          width: "100%",
          height: "24px",
          objectFit: "fill",
          display: "block"
        }
      }
    )
  );
}
function MountedAttackAnimationLayer({ controller, store: store2 }) {
  const resolvedStore = resolveDialogStore(store2 || controller), [state, setState] = (0, import_react5.useState)(createEmptyAttackAnimationState), stageTimerRef = (0, import_react5.useRef)(null), closeTimerRef = (0, import_react5.useRef)(null);
  (0, import_react5.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const clearTimers = () => {
      if (stageTimerRef.current) {
        clearTimeout(stageTimerRef.current);
        stageTimerRef.current = null;
      }
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }, closeDialog = () => {
      clearTimers();
      setState(createEmptyAttackAnimationState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_ATTACK_ANIMATION", (message) => {
      const nextState = message?.state || createEmptyAttackAnimationState();
      clearTimers();
      setState(nextState);
      stageTimerRef.current = setTimeout(() => {
        stageTimerRef.current = null;
        setState((current) => ({
          ...current,
          stage: "travel"
        }));
      }, 20);
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        setState(createEmptyAttackAnimationState());
      }, Math.max(300, Number(nextState.duration || 720)));
    }), unsubscribeClose = resolvedStore.on("CLOSE_ATTACK_ANIMATION", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react5.default.createElement(AttackAnimationLayerView, { state });
}

// server/ui/components/duel/attribute.component.jsx
var import_react6 = __toESM(require("react"), 1);

// server/ui/components/duel/attribute.component.module.scss
var attribute_component_module_default = ".root {\n}\n";

// server/ui/services/duel-response.service.js
var locationToCode = {
  DECK: 1,
  HAND: 2,
  MONSTERZONE: 4,
  SPELLZONE: 8,
  GRAVE: 16,
  BANISHED: 32,
  EXTRA: 64,
  OVERLAY: 128
};
function normalizeInteger(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function normalizeList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.map((value) => normalizeInteger(value));
}
function normalizePlace(placeOrPlayer, location, sequence) {
  if (placeOrPlayer && typeof placeOrPlayer === "object" && !Array.isArray(placeOrPlayer)) {
    return normalizePlace(placeOrPlayer.player, placeOrPlayer.location, placeOrPlayer.sequence ?? placeOrPlayer.index);
  }
  const normalizedLocation = typeof location === "string" ? locationToCode[location] ?? normalizeInteger(location) : normalizeInteger(location);
  return [
    normalizeInteger(placeOrPlayer),
    normalizedLocation,
    normalizeInteger(sequence)
  ];
}
function createCommandButtonAnswer(commandType, index = 0) {
  return {
    type: commandType,
    i: normalizeInteger(index)
  };
}
function createSelectEffectYnAnswer(yes) {
  return {
    type: "yesno",
    i: Boolean(yes)
  };
}
function createSelectYesNoAnswer(yes) {
  return createSelectEffectYnAnswer(yes);
}
function createSelectOptionAnswer(index) {
  return {
    type: "number",
    i: normalizeInteger(index)
  };
}
function createSelectCardAnswer(indices) {
  return {
    type: "list",
    i: indices === null ? null : normalizeList(indices)
  };
}
function createSelectUnselectCardAnswer(index) {
  return {
    type: "number",
    i: index === null ? -1 : normalizeInteger(index)
  };
}
function createSelectChainAnswer(index) {
  return {
    type: "number",
    i: index === null ? -1 : normalizeInteger(index)
  };
}
function createSelectDisfieldAnswer(placeOrPlayer, location, sequence) {
  return {
    type: "zone",
    i: normalizePlace(placeOrPlayer, location, sequence)
  };
}
function createSelectPlaceAnswer(placeOrPlayer, location, sequence) {
  return createSelectDisfieldAnswer(placeOrPlayer, location, sequence);
}
function createSelectPositionAnswer(position) {
  return {
    type: position
  };
}
function createSelectTributeAnswer(indices) {
  return createSelectCardAnswer(indices);
}
function createSelectCounterAnswer(counters) {
  return {
    type: "counter",
    i: normalizeList(counters)
  };
}
function createSelectSumAnswer(indices) {
  return createSelectCardAnswer(indices);
}
function createSortCardAnswer(order) {
  return {
    type: "order",
    i: order === null ? null : normalizeList(order)
  };
}
function createAnnounceRaceAnswer(races) {
  return {
    type: "races",
    i: Array.isArray(races) ? races.slice() : []
  };
}
function createAnnounceAttributeAnswer(attributes) {
  return {
    type: "attributes",
    i: Array.isArray(attributes) ? attributes.slice() : []
  };
}
function createAnnounceCardAnswer(card) {
  return {
    type: "number",
    i: normalizeInteger(card)
  };
}
function createAnnounceNumberAnswer(value) {
  return {
    type: "number",
    i: normalizeInteger(value)
  };
}
function createRockPaperScissorsAnswer(value) {
  return {
    type: "number",
    i: normalizeInteger(value)
  };
}

// server/ui/components/duel/attribute.component.jsx
function createEmptySelectAttributesState() {
  return {
    active: false,
    value: void 0,
    options: void 0,
    text: void 0,
    responseType: void 0
  };
}
function resolveDialogStore2(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function getSelectAttributeNumberChoices(state) {
  const values = state?.options;
  if (Array.isArray(values)) {
    return values.map((value, index) => {
      const normalizedValue = Number(value);
      return {
        key: `number-${index}-${normalizedValue}`,
        label: String(normalizedValue),
        value: normalizedValue
      };
    });
  }
  if (!values || typeof values !== "object") {
    return [];
  }
  return Object.entries(values).map(([key, value], index) => {
    const numericValue = Number(value);
    return {
      key: `number-${index}-${key}`,
      label: String(Number.isFinite(numericValue) ? numericValue : key),
      value: Number.isFinite(numericValue) ? numericValue : Number(key)
    };
  }).filter((choice) => Number.isFinite(choice.value));
}
function triggerSelectAttributesDialog(target, state) {
  resolveDialogStore2(target)?.emit?.({
    action: "OPEN_SELECT_ATTRIBUTES_DIALOG",
    state: {
      ...createEmptySelectAttributesState(),
      ...state,
      active: true
    }
  });
}
function closeSelectAttributesDialog(target) {
  resolveDialogStore2(target)?.emit?.({ action: "CLOSE_SELECT_ATTRIBUTES_DIALOG" });
}
function submitSelectAttributes(store2, state, closeDialog) {
  if (state.value === void 0) {
    return;
  }
  const selectedValue = state.value, responseType = state.responseType;
  closeDialog();
  let answer;
  switch (responseType) {
    case "MSG_ANNOUNCE_RACE":
      answer = createAnnounceRaceAnswer([selectedValue]);
      break;
    case "MSG_ANNOUNCE_ATTRIB":
      answer = createAnnounceAttributeAnswer([selectedValue]);
      break;
    default:
      answer = createAnnounceNumberAnswer(selectedValue);
      break;
  }
  store2?.emit?.({
    action: "ANNOUNCE_SELECTION_CLICK",
    answer
  });
}
function SelectAttributesView({ state, onChange, onSubmit }) {
  if (!state?.active) {
    return null;
  }
  if (state.responseType === "MSG_ANNOUNCE_NUMBER") {
    const choices = getSelectAttributeNumberChoices(state);
    return /* @__PURE__ */ import_react6.default.createElement("div", { className: `announceSelectDialog ${attribute_component_module_default.root}` }, /* @__PURE__ */ import_react6.default.createElement("div", null, `Select ${state.text}`), /* @__PURE__ */ import_react6.default.createElement("div", { className: "announceNumberChoices" }, choices.map((choice) => /* @__PURE__ */ import_react6.default.createElement(
      "label",
      {
        className: "announceNumberChoice",
        key: choice.key
      },
      /* @__PURE__ */ import_react6.default.createElement(
        "input",
        {
          checked: Number(state.value) === choice.value,
          id: `announce-number-${choice.value}`,
          name: "announcevalue",
          onChange: () => onChange(choice.value, choice.value),
          type: "radio",
          value: choice.value
        }
      ),
      /* @__PURE__ */ import_react6.default.createElement("span", { "data-announcement-value": String(choice.value) }, choice.label)
    ))), /* @__PURE__ */ import_react6.default.createElement(
      "button",
      {
        "data-role": "announce-confirm",
        disabled: !Number.isFinite(Number(state.value)),
        onClick: onSubmit
      },
      "Select"
    ));
  }
  const boxes = [];
  for (const option in state.options) {
    boxes.push(
      /* @__PURE__ */ import_react6.default.createElement("div", { className: "selectCheck", key: option }, /* @__PURE__ */ import_react6.default.createElement("label", null, option), /* @__PURE__ */ import_react6.default.createElement(
        "input",
        {
          name: "announcevalue",
          type: "checkbox",
          onChange: () => onChange(option, state.options[option])
        }
      ))
    );
  }
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: attribute_component_module_default.root }, /* @__PURE__ */ import_react6.default.createElement("div", null, `Select ${state.text}`), /* @__PURE__ */ import_react6.default.createElement("div", null, boxes), /* @__PURE__ */ import_react6.default.createElement("button", { onClick: onSubmit }, "Select"));
}
function MountedSelectAttributes({ controller, store: store2 }) {
  const resolvedStore = resolveDialogStore2(store2 || controller), [state, setState] = (0, import_react6.useState)(createEmptySelectAttributesState);
  (0, import_react6.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const closeDialog = () => {
      setState(createEmptySelectAttributesState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_SELECT_ATTRIBUTES_DIALOG", (message) => {
      setState({
        ...createEmptySelectAttributesState(),
        ...message?.state || {},
        active: true
      });
    }), unsubscribeClose = resolvedStore.on("CLOSE_SELECT_ATTRIBUTES_DIALOG", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react6.default.createElement(
    SelectAttributesView,
    {
      state,
      onChange: (option, value) => {
        setState((current) => ({
          ...current,
          value: value ?? option
        }));
      },
      onSubmit: () => submitSelectAttributes(resolvedStore, state, () => setState(createEmptySelectAttributesState()))
    }
  );
}
function SelectAttributes(props) {
  return /* @__PURE__ */ import_react6.default.createElement(MountedSelectAttributes, { ...props });
}

// server/ui/components/duel/phase.banner.component.jsx
var import_react7 = __toESM(require("react"), 1);

// server/ui/components/duel/phase.banner.component.module.scss
var phase_banner_component_module_default = ".root {\n}\n";

// server/ui/components/duel/phase.banner.component.jsx
function createEmptyPhaseBannerState() {
  return {
    active: false,
    text: "",
    token: 0
  };
}
function resolveDialogStore3(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerPhaseBanner(target, state = {}) {
  const resolvedStore = resolveDialogStore3(target);
  if (!resolvedStore) {
    return;
  }
  resolvedStore.emit({
    action: "OPEN_PHASE_BANNER",
    state: {
      active: true,
      text: state.text || "",
      token: Date.now(),
      duration: Math.max(2400, Number(state.duration || 2400))
    }
  });
}
function disposePhaseBanner(target) {
  resolveDialogStore3(target)?.emit?.({ action: "CLOSE_PHASE_BANNER" });
}
function PhaseBannerView({ active, text, token }) {
  if (!active || !text) {
    return null;
  }
  return /* @__PURE__ */ import_react7.default.createElement(
    "div",
    {
      className: `phaseindicatorslide animated ${phase_banner_component_module_default.root}`,
      "data-token": token,
      key: `phase-banner-${token}`
    },
    /* @__PURE__ */ import_react7.default.createElement(
      "div",
      {
        className: "phaseindicatorslidecopy",
        key: `phase-banner-copy-${token}`
      },
      text
    )
  );
}
function MountedPhaseBanner({ controller, store: store2 }) {
  const resolvedStore = resolveDialogStore3(store2 || controller), [state, setState] = (0, import_react7.useState)(createEmptyPhaseBannerState), closeTimerRef = (0, import_react7.useRef)(null);
  (0, import_react7.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const clearCloseTimer = () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }, closeDialog = () => {
      clearCloseTimer();
      setState(createEmptyPhaseBannerState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_PHASE_BANNER", (message) => {
      const nextState = message?.state || createEmptyPhaseBannerState();
      clearCloseTimer();
      setState(nextState);
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        setState((current) => ({
          ...current,
          active: false
        }));
      }, Math.max(2400, Number(nextState.duration || 2400)));
    }), unsubscribeClose = resolvedStore.on("CLOSE_PHASE_BANNER", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react7.default.createElement(
    PhaseBannerView,
    {
      active: state.active,
      text: state.text,
      token: state.token
    }
  );
}

// server/ui/services/storage.service.js
var DEFAULT_IMAGE_CDN = "https://images.ygoprodeck.com/images/cards";
var DEFAULT_CARD_COVER = "img/textures/cover.png";
function parseStoredBoolean(value, fallback = false) {
  if (value === void 0 || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }
  return Boolean(value);
}
function persist(key, value) {
  localStorage.setItem(key, value);
}
function normalizeImageCdnUrl(value) {
  const normalized = String(value || "").trim().replace(/\/+$/, "");
  return normalized || DEFAULT_IMAGE_CDN;
}
function getCardImageUrl(id) {
  if (!id) {
    return DEFAULT_CARD_COVER;
  }
  return `${normalizeImageCdnUrl(getStorage().imageURL)}/${id}.jpg`;
}
function getStorage() {
  const applicationDefaults = {
    username: "",
    password: "",
    remember: "",
    imageURL: DEFAULT_IMAGE_CDN,
    theme: "../img/magimagipinkshadow.jpg",
    cover: "../img/textures/cover.png",
    hide_banlist: true,
    autochain: false,
    waitchain: false,
    hide_hint_button: true,
    playassist: false,
    bluff: false,
    language: "en"
  }, storage = typeof window !== "undefined" ? JSON.parse(JSON.stringify(localStorage)) : {};
  return {
    ...applicationDefaults,
    ...storage,
    imageURL: normalizeImageCdnUrl(storage.imageURL || applicationDefaults.imageURL),
    autochain: parseStoredBoolean(storage.autochain, applicationDefaults.autochain),
    hide_banlist: parseStoredBoolean(storage.hide_banlist, applicationDefaults.hide_banlist),
    hide_hint_button: parseStoredBoolean(storage.hide_hint_button, applicationDefaults.hide_hint_button),
    playassist: parseStoredBoolean(storage.playassist, applicationDefaults.playassist),
    bluff: parseStoredBoolean(storage.bluff, applicationDefaults.bluff),
    waitchain: parseStoredBoolean(storage.waitchain, applicationDefaults.waitchain)
  };
}

// server/ui/components/duel/chain.component.jsx
var import_react8 = __toESM(require("react"), 1);

// server/ui/components/duel/chain.component.module.scss
var chain_component_module_default = ".root {}\n";

// server/ui/components/duel/chain.component.jsx
var AUTO_CHAIN_DELAY_MS = 320;
var CHAIN_MODE_NEUTRAL = "neutral";
var CHAIN_MODE_IGNORE = "ignore";
var CHAIN_MODE_ALWAYS = "always";
var CHAIN_MODE_WHEN_AVAILABLE = "when_available";
var CHAIN_SETTING_FIELDS = Object.freeze([
  {
    id: "autochain",
    label: "Automatic Chain Link Order"
  },
  {
    id: "waitchain",
    label: "Add a delay even when no response"
  },
  {
    id: "hide_hint_button",
    label: "Hide Chain Buttons"
  }
]);
var CHAIN_MODE_BUTTONS = Object.freeze([
  {
    id: CHAIN_MODE_IGNORE,
    label: "Chain: OFF"
  },
  {
    id: CHAIN_MODE_ALWAYS,
    label: "Always pause"
  },
  {
    id: CHAIN_MODE_WHEN_AVAILABLE,
    label: "Chain: ON"
  }
]);
var KEYBOARD_CHAIN_MODE_BY_CODE = Object.freeze({
  KeyA: CHAIN_MODE_ALWAYS,
  KeyS: CHAIN_MODE_IGNORE,
  KeyD: CHAIN_MODE_WHEN_AVAILABLE
});
function resolveKeyboardChainMode(event) {
  if (!event) {
    return CHAIN_MODE_NEUTRAL;
  }
  if (typeof event.code === "string" && KEYBOARD_CHAIN_MODE_BY_CODE[event.code]) {
    return KEYBOARD_CHAIN_MODE_BY_CODE[event.code];
  }
  switch (String(event.key || "").toLowerCase()) {
    case "a":
      return CHAIN_MODE_ALWAYS;
    case "s":
      return CHAIN_MODE_IGNORE;
    case "d":
      return CHAIN_MODE_WHEN_AVAILABLE;
    default:
      return CHAIN_MODE_NEUTRAL;
  }
}
function targetIsEditable(target) {
  if (!target || target === document || target === window) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tagName = String(target.tagName || "").toUpperCase();
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}
function normalizeChainMode(mode) {
  switch (mode) {
    case CHAIN_MODE_IGNORE:
    case CHAIN_MODE_ALWAYS:
    case CHAIN_MODE_WHEN_AVAILABLE:
      return mode;
    default:
      return CHAIN_MODE_NEUTRAL;
  }
}
function toggleChainMode(currentMode, nextMode) {
  const normalizedCurrent = normalizeChainMode(currentMode), normalizedNext = normalizeChainMode(nextMode);
  if (normalizedNext === CHAIN_MODE_NEUTRAL || normalizedCurrent === normalizedNext) {
    return CHAIN_MODE_NEUTRAL;
  }
  return normalizedNext;
}
function getChainModeFlags(mode) {
  const normalizedMode = normalizeChainMode(mode);
  return {
    ignore: normalizedMode === CHAIN_MODE_IGNORE,
    always: normalizedMode === CHAIN_MODE_ALWAYS,
    whenAvailable: normalizedMode === CHAIN_MODE_WHEN_AVAILABLE
  };
}
function resolveChainDecision(options = {}, settings = {}, mode = CHAIN_MODE_NEUTRAL) {
  const selectTrigger = Boolean(options.select_trigger) || Number(options.specount || 0) === 127, forced = Boolean(options.forced), count = Number(options.count || 0), specount = Number(options.specount || 0), autochain = Boolean(settings.autochain), waitchain = Boolean(settings.waitchain), {
    ignore,
    always,
    whenAvailable
  } = getChainModeFlags(mode), shouldDecline = !selectTrigger && !forced && (ignore || (count === 0 || specount === 0) && !always) && (count === 0 || !whenAvailable);
  if (shouldDecline) {
    return {
      type: "decline",
      delayMs: waitchain && !ignore ? AUTO_CHAIN_DELAY_MS : 0
    };
  }
  if (autochain && forced && !(always || whenAvailable)) {
    return {
      type: "accept_first",
      delayMs: 0
    };
  }
  return {
    type: "manual",
    delayMs: 0
  };
}
function readChainSettings() {
  const storage = getStorage();
  return {
    autochain: Boolean(storage.autochain),
    waitchain: Boolean(storage.waitchain),
    hide_hint_button: Boolean(storage.hide_hint_button)
  };
}
function setChainerState(controller, update) {
  controller.state = {
    ...controller.state,
    ...update
  };
}
function ChainOptionCard({ card, index, onClick, getCardKey }) {
  return /* @__PURE__ */ import_react8.default.createElement(
    AppImage,
    {
      key: getCardKey(card, index),
      className: card.selected ? "selected" : "",
      src: getCardImageUrl(card.id || card.code),
      alt: card.name || `Chain option ${index + 1}`,
      onClick,
      fallbackSrc: "img/textures/unknown.jpg",
      width: 177,
      height: 254,
      sizes: "(max-width: 768px) 40vw, 177px"
    }
  );
}
function ChainSettingsPanel({ normalizedMode, settings, onModeClick, onSettingChange }) {
  const showChainButtons = !settings.hide_hint_button;
  return /* @__PURE__ */ import_react8.default.createElement(
    "div",
    {
      key: "chain-settings-box",
      className: "chain-settings-box",
      "data-chain-mode": normalizedMode,
      "data-hide-chain-buttons": String(Boolean(settings.hide_hint_button))
    },
    showChainButtons ? /* @__PURE__ */ import_react8.default.createElement(
      "div",
      {
        key: "chain-mode-buttons",
        className: "chain-mode-buttons"
      },
      CHAIN_MODE_BUTTONS.map((button) => {
        const active = normalizedMode === button.id;
        return /* @__PURE__ */ import_react8.default.createElement(
          "button",
          {
            key: `chain-mode-${button.id}`,
            type: "button",
            className: `chain-mode-button${active ? " is-active" : ""}`,
            "data-chain-mode": button.id,
            "aria-pressed": String(active),
            onClick: (event) => onModeClick(button.id, event)
          },
          button.label
        );
      })
    ) : null,
    /* @__PURE__ */ import_react8.default.createElement(
      "div",
      {
        key: "chain-settings-title",
        className: "chain-settings-title"
      },
      "Chain Settings"
    ),
    CHAIN_SETTING_FIELDS.map((field) => /* @__PURE__ */ import_react8.default.createElement(
      "label",
      {
        key: `chain-setting-${field.id}`,
        className: "chain-settings-row",
        htmlFor: `chain-setting-${field.id}`
      },
      /* @__PURE__ */ import_react8.default.createElement(
        "input",
        {
          id: `chain-setting-${field.id}`,
          type: "checkbox",
          checked: Boolean(settings[field.id]),
          onChange: (event) => onSettingChange(field.id, event)
        }
      ),
      /* @__PURE__ */ import_react8.default.createElement("span", null, field.label)
    ))
  );
}
function ChainDialog({
  active,
  promptText,
  cards,
  forced,
  onCardClick,
  onActivateFirst,
  onDecline,
  getCardKey
}) {
  if (!active) {
    return null;
  }
  const hasSingleChoice = cards.length === 1, isForced = Boolean(forced), showDecline = !isForced, helperText = isForced ? hasSingleChoice ? "Choose Continue to resolve this chain link." : "Click a card to continue the forced chain." : hasSingleChoice ? "Choose Yes to activate this card, or No to continue." : "Click a card to answer Yes, or choose No to continue.";
  return /* @__PURE__ */ import_react8.default.createElement(
    "div",
    {
      className: chain_component_module_default.root,
      style: {
        display: "flex"
      },
      id: "revealed",
      className: "chain-dialog"
    },
    /* @__PURE__ */ import_react8.default.createElement("div", { className: "chain-dialog-content" }, promptText ? /* @__PURE__ */ import_react8.default.createElement("div", { className: "chainprompt" }, promptText) : null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "chaincards" }, cards.map((card, index) => /* @__PURE__ */ import_react8.default.createElement(
      ChainOptionCard,
      {
        key: getCardKey(card, index),
        card,
        index,
        getCardKey,
        onClick: (event) => onCardClick(card.selected, index, event)
      }
    ))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "chainactions" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "chainhelper" }, helperText), /* @__PURE__ */ import_react8.default.createElement("div", { className: "chainbuttons" }, hasSingleChoice ? /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        className: "chainbutton chainbutton-primary",
        onClick: onActivateFirst
      },
      isForced ? "Continue" : "Yes"
    ) : null, showDecline ? /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        className: "chainbutton chainbutton-secondary",
        onClick: onDecline
      },
      "No"
    ) : null)))
  );
}
function ChainerView({
  active,
  promptText,
  cards,
  forced,
  onCardClick,
  onActivateFirst,
  onDecline,
  getCardKey
}) {
  if (!active && !promptText && !cards.length && !forced) {
    return null;
  }
  return /* @__PURE__ */ import_react8.default.createElement(
    ChainDialog,
    {
      active,
      promptText,
      cards,
      forced,
      onCardClick,
      onActivateFirst,
      onDecline,
      getCardKey
    }
  );
}
function MountedChainer({ controller }) {
  import_react8.default.useEffect(() => {
    if (typeof document === "undefined") {
      return () => {
        disposeChainer(controller);
      };
    }
    const handleKeyDown = (event) => handleChainerKeyDown(controller, event), handleKeyUp = (event) => handleChainerKeyUp(controller, event);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      disposeChainer(controller);
    };
  }, [controller]);
  return /* @__PURE__ */ import_react8.default.createElement(
    ChainerView,
    {
      active: controller?.state?.active,
      promptText: controller?.state?.promptText,
      cards: controller?.state?.cards || [],
      forced: controller?.state?.forced,
      onCardClick: (selected, option, event) => clickChainCard(controller, selected, option, event),
      onActivateFirst: (event) => activateFirstChain(controller, event),
      onDecline: (event) => declineChain(controller, event),
      getCardKey: getChainCardKey
    }
  );
}
function MountedChainSettingsPanel({ controller }) {
  if (!controller) {
    return null;
  }
  return /* @__PURE__ */ import_react8.default.createElement(
    ChainSettingsPanel,
    {
      normalizedMode: getEffectiveChainMode(controller),
      settings: controller.state.settings,
      onModeClick: (mode, event) => {
        event.preventDefault();
        event.stopPropagation();
        updateChainerMode(controller, mode);
      },
      onSettingChange: (key, event) => {
        event.stopPropagation();
        updateChainerSetting(controller, key, event.target.checked);
      }
    }
  );
}
function ChainerState(store2) {
  return {
    store: store2,
    state: {
      active: false,
      promptText: "",
      cards: [],
      forced: false,
      mode: CHAIN_MODE_NEUTRAL,
      keyboardMode: CHAIN_MODE_NEUTRAL,
      settings: readChainSettings(),
      pendingAutoResponseTimer: null,
      pendingQuestionToken: 0
    }
  };
}
function getChainCardKey(card, index) {
  return `chain-${card?.uid || card?.id || card?.code || "card"}-${card?.player ?? "x"}-${card?.location || "unknown"}-${card?.index ?? index}-${index}`;
}
function closeChainModal(controller) {
  setChainerState(controller, {
    cards: [],
    promptText: "",
    active: false,
    forced: false
  });
}
function cancelPendingChainAutoResponse(controller) {
  if (controller.state.pendingAutoResponseTimer) {
    clearTimeout(controller.state.pendingAutoResponseTimer);
    setChainerState(controller, {
      pendingAutoResponseTimer: null
    });
  }
  setChainerState(controller, {
    pendingQuestionToken: controller.state.pendingQuestionToken + 1
  });
}
function closeChainer(controller) {
  cancelPendingChainAutoResponse(controller);
  closeChainModal(controller);
}
function queueChainResponse(controller, answer, delayMs = 0, label = "CHAIN_RESPONSE") {
  const token = controller.state.pendingQuestionToken, commit = () => {
    if (token !== controller.state.pendingQuestionToken) {
      return;
    }
    closeChainModal(controller);
    controller.store.emit({ action: "CHAIN_RESPONSE", answer, label });
    controller.store.emit({ action: "RENDER" });
  };
  if (delayMs > 0) {
    const timer = setTimeout(() => {
      setChainerState(controller, {
        pendingAutoResponseTimer: null
      });
      commit();
    }, delayMs);
    setChainerState(controller, {
      pendingAutoResponseTimer: timer
    });
    controller.store.emit({ action: "RENDER" });
    return;
  }
  commit();
}
function clickChainCard(controller, selected, option, event) {
  queueChainResponse(controller, createSelectChainAnswer(option), 0, "chain select");
  event?.preventDefault?.();
  event?.stopPropagation?.();
}
function declineChain(controller, event) {
  queueChainResponse(controller, createSelectChainAnswer(null), 0, "chain decline");
  event?.preventDefault?.();
  event?.stopPropagation?.();
}
function activateFirstChain(controller, event) {
  clickChainCard(controller, false, 0, event);
}
function getEffectiveChainMode(controller) {
  const keyboardMode = normalizeChainMode(controller.state.keyboardMode);
  if (keyboardMode !== CHAIN_MODE_NEUTRAL) {
    return keyboardMode;
  }
  return normalizeChainMode(controller.state.mode);
}
function resolveChainerQuestionDecision(controller, options = {}) {
  return resolveChainDecision(
    options,
    controller.state.settings,
    getEffectiveChainMode(controller)
  );
}
function triggerChainer(controller, state) {
  setChainerState(controller, {
    ...state,
    active: true
  });
}
function handleChainerQuestion(controller, options = {}, state = {}) {
  closeChainer(controller);
  const decision = resolveChainerQuestionDecision(controller, options);
  if (decision.type === "decline") {
    queueChainResponse(controller, createSelectChainAnswer(null), decision.delayMs, "auto chain");
    return true;
  }
  if (decision.type === "accept_first") {
    queueChainResponse(controller, createSelectChainAnswer(0), decision.delayMs, "forced chain");
    return true;
  }
  triggerChainer(controller, {
    promptText: state.promptText || "",
    cards: options.chain_choices || [],
    forced: Boolean(options.forced)
  });
  controller.store.emit({ action: "RENDER" });
  return false;
}
function handleChainerSortQuestion(controller) {
  cancelPendingChainAutoResponse(controller);
  closeChainModal(controller);
  if (!controller.state.settings.autochain) {
    return false;
  }
  queueChainResponse(controller, createSortCardAnswer(null), 0, "auto sort chain");
  return true;
}
function setChainerKeyboardMode(controller, mode) {
  const normalizedMode = normalizeChainMode(mode);
  if (controller.state.keyboardMode === normalizedMode) {
    return;
  }
  setChainerState(controller, {
    keyboardMode: normalizedMode
  });
  controller.store.emit({ action: "RENDER" });
}
function handleChainerKeyDown(controller, event) {
  if (!event || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }
  if (targetIsEditable(event.target)) {
    return;
  }
  const nextMode = resolveKeyboardChainMode(event);
  if (nextMode === CHAIN_MODE_NEUTRAL) {
    return;
  }
  event.preventDefault();
  setChainerKeyboardMode(controller, nextMode);
}
function handleChainerKeyUp(controller, event) {
  const releasedMode = resolveKeyboardChainMode(event);
  if (releasedMode === CHAIN_MODE_NEUTRAL || controller.state.keyboardMode !== releasedMode) {
    return;
  }
  event.preventDefault?.();
  setChainerKeyboardMode(controller, CHAIN_MODE_NEUTRAL);
}
function updateChainerMode(controller, mode) {
  setChainerState(controller, {
    mode: toggleChainMode(controller.state.mode, mode)
  });
  controller.store.emit({ action: "RENDER" });
}
function updateChainerSetting(controller, key, checked) {
  const nextSettings = {
    ...controller.state.settings,
    [key]: Boolean(checked)
  };
  setChainerState(controller, {
    settings: nextSettings
  });
  persist(key, String(Boolean(checked)));
  controller.store.emit({ action: "RENDER" });
}
function resetChainerDuelState(controller) {
  closeChainer(controller);
  setChainerState(controller, {
    mode: CHAIN_MODE_NEUTRAL,
    keyboardMode: CHAIN_MODE_NEUTRAL
  });
}
function disposeChainer(controller) {
  if (!controller) {
    return;
  }
  resetChainerDuelState(controller);
}
function Chainer({ controller }) {
  return /* @__PURE__ */ import_react8.default.createElement(MountedChainer, { controller });
}

// server/ui/components/duel/extracontrols.component.jsx
var import_react9 = __toESM(require("react"), 1);

// server/ui/components/duel/extracontrols.component.module.scss
var extracontrols_component_module_default = ".root {}\n";

// server/ui/components/duel/extracontrols.component.jsx
function sanitize2(value) {
  return String(value ?? "");
}
function ExtraControlsView({ controls, chainController, tokens }) {
  if (!controls || !chainController) {
    return null;
  }
  if (!app.manual) {
    return /* @__PURE__ */ import_react9.default.createElement("div", { className: extracontrols_component_module_default.root }, /* @__PURE__ */ import_react9.default.createElement(
      "button",
      {
        id: "control-surrender",
        onClick: () => app.surrender()
      },
      "Surrender"
    ), /* @__PURE__ */ import_react9.default.createElement(MountedChainSettingsPanel, { controller: chainController }));
  }
  return /* @__PURE__ */ import_react9.default.createElement("div", { className: extracontrols_component_module_default.root }, /* @__PURE__ */ import_react9.default.createElement(
    "button",
    {
      id: "control-surrender",
      onClick: () => app.surrender()
    },
    "Surrender"
  ), /* @__PURE__ */ import_react9.default.createElement(
    "button",
    {
      id: "control-filter-adv",
      onClick: () => toggleExtraControls(controls)
    },
    "Toggle Controls"
  ), /* @__PURE__ */ import_react9.default.createElement(
    "button",
    {
      id: "control-flip-coin",
      onClick: () => app.manualControls.manualFlip()
    },
    "Flip Coin"
  ), /* @__PURE__ */ import_react9.default.createElement(
    "button",
    {
      id: "control-roll-die",
      onClick: () => app.manualControls.manualRoll()
    },
    "Roll Die"
  ), /* @__PURE__ */ import_react9.default.createElement(
    "button",
    {
      id: "control-token",
      onClick: () => app.manualControls.startSpecialSummon("token")
    },
    "Make Token"
  ), /* @__PURE__ */ import_react9.default.createElement("select", { id: "tokendropdown" }, tokens.map((card, i) => /* @__PURE__ */ import_react9.default.createElement("option", { key: `selectn${i}`, value: card.id }, sanitize2(card.name)))), /* @__PURE__ */ import_react9.default.createElement(
    "button",
    {
      id: "control-surrender",
      onClick: () => app.surrender()
    },
    "Surrender"
  ));
}
function getResolvedTokens(tokens, databaseSystem, controller) {
  if (Array.isArray(tokens)) {
    return tokens;
  }
  if (Array.isArray(databaseSystem)) {
    return databaseSystem.filter((card) => {
      return cardIs("token", card);
    });
  }
  if (Array.isArray(controller?.tokens)) {
    return controller.tokens;
  }
  return [];
}
function MountedExtraControls({ controller, controls, databaseSystem, chainController, tokens }) {
  const resolvedControls = controls || controller?.controls, resolvedChainController = chainController || controller?.chainController, resolvedTokens = import_react9.default.useMemo(() => {
    return getResolvedTokens(tokens, databaseSystem, controller);
  }, [tokens, databaseSystem, controller]);
  return /* @__PURE__ */ import_react9.default.createElement(
    ExtraControlsView,
    {
      controls: resolvedControls,
      chainController: resolvedChainController,
      tokens: resolvedTokens
    }
  );
}
function toggleExtraControls(controls) {
  if (!controls?.state) {
    return;
  }
  controls.state.filter = !controls.state.filter;
}
function ExtraControls(props) {
  return /* @__PURE__ */ import_react9.default.createElement(MountedExtraControls, { ...props });
}

// server/ui/components/duel/field.reveal.component.jsx
var import_react10 = __toESM(require("react"), 1);

// server/ui/components/duel/field.reveal.component.module.scss
var field_reveal_component_module_default = ".fieldRevealOverlay {\n}\n";

// server/ui/components/duel/field.reveal.component.jsx
function FieldRevealCard({ card, index, mode, style }) {
  return /* @__PURE__ */ import_react10.default.createElement(
    "div",
    {
      className: `field-reveal-card ${mode}`,
      key: card.uid || card.id || index,
      style
    },
    /* @__PURE__ */ import_react10.default.createElement(
      AppImage,
      {
        alt: card.name || "Revealed card",
        src: getCardImageUrl(card.id),
        fallbackSrc: "img/textures/unknown.jpg",
        width: 177,
        height: 254,
        sizes: "(max-width: 768px) 40vw, 177px"
      }
    )
  );
}
function createEmptyFieldRevealState() {
  return {
    active: false,
    cards: [],
    placements: [],
    mode: "panel",
    stage: "idle"
  };
}
function resolveDialogStore4(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerFieldReveal(target, state = {}) {
  const resolvedStore = resolveDialogStore4(target);
  if (!resolvedStore) {
    return;
  }
  resolvedStore.emit({
    action: "OPEN_FIELD_REVEAL",
    state: {
      active: true,
      cards: Array.isArray(state.cards) ? state.cards.slice() : [],
      placements: Array.isArray(state.placements) ? state.placements.slice() : [],
      mode: state.mode || "panel",
      stage: "priming",
      duration: Math.max(700, Number(state.duration || 1400))
    }
  });
}
function disposeFieldReveal(target) {
  resolveDialogStore4(target)?.emit?.({ action: "CLOSE_FIELD_REVEAL" });
}
function FieldRevealOverlayView({ state }) {
  if (!state?.active || !state.cards.length) {
    return null;
  }
  return /* @__PURE__ */ import_react10.default.createElement(
    "div",
    {
      id: "fieldrevealoverlay",
      className: field_reveal_component_module_default.fieldRevealOverlay,
      key: "field-reveal-overlay"
    },
    state.cards.map((card, index) => {
      const placement = state.placements[index] || {}, priming = state.stage !== "open", style = {
        left: `${Number(placement.x || 0)}px`,
        top: `${Number(placement.y || 0)}px`,
        transform: priming ? "translate(-50%, -50%) scale(0.72)" : `translate(-50%, -50%) translate(${Number(placement.offsetX || 0)}px, ${Number(placement.offsetY || 0)}px) rotate(${Number(placement.rotation || 0)}deg) scale(1)`,
        zIndex: 20 + index
      };
      return /* @__PURE__ */ import_react10.default.createElement(
        FieldRevealCard,
        {
          card,
          index,
          key: card.uid || card.id || index,
          mode: state.mode,
          style
        }
      );
    })
  );
}
function MountedFieldRevealOverlay({ controller, store: store2 }) {
  const resolvedStore = resolveDialogStore4(store2 || controller), [state, setState] = (0, import_react10.useState)(createEmptyFieldRevealState), openTimerRef = (0, import_react10.useRef)(null), closeTimerRef = (0, import_react10.useRef)(null);
  (0, import_react10.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const clearTimers = () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }, closeDialog = () => {
      clearTimers();
      setState(createEmptyFieldRevealState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_FIELD_REVEAL", (message) => {
      const nextState = message?.state || createEmptyFieldRevealState();
      clearTimers();
      setState(nextState);
      openTimerRef.current = setTimeout(() => {
        openTimerRef.current = null;
        setState((current) => ({
          ...current,
          stage: "open"
        }));
      }, 20);
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        setState(createEmptyFieldRevealState());
      }, Math.max(700, Number(nextState.duration || 1400)));
    }), unsubscribeClose = resolvedStore.on("CLOSE_FIELD_REVEAL", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react10.default.createElement(FieldRevealOverlayView, { state });
}

// server/ui/components/duel/idle.extra.viewer.component.jsx
var import_react11 = __toESM(require("react"), 1);

// server/ui/components/duel/idle.extra.viewer.component.module.scss
var idle_extra_viewer_component_module_default = ".root {}\n";

// server/ui/components/duel/idle.extra.viewer.component.jsx
var REVEAL_LOCATION_LABELS = Object.freeze({
  BANISHED: "Banished",
  DECK: "Deck",
  EXTRA: "Extra Deck",
  EXCAVATED: "Excavated",
  FZONE: "Field Zone",
  GRAVE: "Graveyard",
  HAND: "Hand",
  MONSTERZONE: "Monster Zone",
  ONFIELD: "Field",
  OVERLAY: "Overlay Unit",
  PZONE: "Pendulum Zone",
  SPELLZONE: "Spell & Trap Zone"
});
var VIEWER_MODE_LABELS = Object.freeze({
  activate: "Activate",
  spsummon: "Special Summon",
  view: "View"
});
function resolveViewerMode(mode) {
  return ["activate", "spsummon", "view"].includes(mode) ? mode : "view";
}
function createEmptyIdleExtraDeckViewerState() {
  return {
    active: false,
    mode: "view",
    deck: []
  };
}
function resolveDialogStore5(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function getIdleExtraDeckViewerCoordinateLabel(card) {
  if (!card || typeof card !== "object") {
    return "";
  }
  const location = typeof card.location === "string" ? REVEAL_LOCATION_LABELS[card.location] || card.location : null, index = Number(card.index), owner = Number(card.player);
  if (!location || !Number.isInteger(index)) {
    return "";
  }
  const prefix = owner === 0 ? "Your" : owner === 1 ? "Opponent's" : "";
  return `${prefix ? `${prefix} ` : ""}${location} ${index + 1}`;
}
function closeIdleExtraDeckViewer(target) {
  resolveDialogStore5(target)?.emit?.({ action: "CLOSE_IDLE_EXTRA_VIEWER" });
}
function disposeIdleExtraDeckViewer(target) {
  closeIdleExtraDeckViewer(target);
}
function clickIdleExtraDeckViewerCard(store2, state, closeDialog, card, event) {
  event?.stopPropagation?.();
  if (state.mode === "view") {
    return;
  }
  const answerCard = card?.viewerAnswer || card;
  store2?.emit?.({ action: "CONTROL_CLICK", card: answerCard });
  closeDialog();
}
function IdleExtraDeckViewerCard({ card, index, state, store: store2, closeDialog }) {
  const key = `idle-extra-${card.uid || card.id || card.code || "card"}-${card.player ?? "x"}-${card.location || "unknown"}-${card.index ?? index}-${index}`, src = getCardImageUrl(card.id || card.code), coordinateLabel = getIdleExtraDeckViewerCoordinateLabel(card);
  return /* @__PURE__ */ import_react11.default.createElement(
    "div",
    {
      key,
      className: "reveal-card",
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.25rem"
      }
    },
    /* @__PURE__ */ import_react11.default.createElement(
      "div",
      {
        className: "reveal-card-frame",
        onClick: (event) => clickIdleExtraDeckViewerCard(store2, state, closeDialog, card, event)
      },
      coordinateLabel ? /* @__PURE__ */ import_react11.default.createElement("div", { className: "reveal-card-coordinate" }, coordinateLabel) : null,
      /* @__PURE__ */ import_react11.default.createElement(
        AppImage,
        {
          className: card.actionable ? "actionable" : "",
          "data-actionable": card.actionable ? "true" : "false",
          src,
          fallbackSrc: "img/textures/unknown.jpg",
          width: 177,
          height: 254,
          sizes: "(max-width: 768px) 40vw, 177px"
        }
      )
    )
  );
}
function IdleExtraDeckViewerView({ state, store: store2, closeDialog }) {
  if (!state?.active || !state.deck.length) {
    return null;
  }
  return /* @__PURE__ */ import_react11.default.createElement(
    "div",
    {
      className: idle_extra_viewer_component_module_default.root,
      id: "revealed",
      "data-mode": state.mode,
      onClick: closeDialog,
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        gap: "0.75rem"
      }
    },
    /* @__PURE__ */ import_react11.default.createElement("div", { className: "reveal-header" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "reveal-mode-label" }, VIEWER_MODE_LABELS[state.mode] || VIEWER_MODE_LABELS.view), /* @__PURE__ */ import_react11.default.createElement(
      "button",
      {
        type: "button",
        className: "reveal-close",
        "aria-label": "Close viewer",
        title: "Close"
      },
      "X"
    )),
    /* @__PURE__ */ import_react11.default.createElement(
      "div",
      {
        onClick: (event) => event.stopPropagation(),
        style: {
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          alignItems: "flex-start"
        }
      },
      state.deck.map((card, index) => /* @__PURE__ */ import_react11.default.createElement(
        IdleExtraDeckViewerCard,
        {
          card,
          state,
          store: store2,
          closeDialog,
          index,
          key: `idle-extra-${card.uid || card.id || card.code || "card"}-${card.player ?? "x"}-${card.location || "unknown"}-${card.index ?? index}-${index}`
        }
      ))
    )
  );
}
function MountedIdleExtraDeckViewer({ controller, store: store2 }) {
  const resolvedStore = resolveDialogStore5(store2 || controller), [state, setState] = (0, import_react11.useState)(createEmptyIdleExtraDeckViewerState);
  (0, import_react11.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const closeDialog = () => {
      setState(createEmptyIdleExtraDeckViewerState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_IDLE_EXTRA_VIEWER", (message) => {
      setState({
        active: true,
        deck: Array.isArray(message.deck) ? message.deck : [],
        mode: resolveViewerMode(message.mode)
      });
    }), unsubscribeClose = resolvedStore.on("CLOSE_IDLE_EXTRA_VIEWER", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react11.default.createElement(
    IdleExtraDeckViewerView,
    {
      state,
      store: resolvedStore,
      closeDialog: () => setState(createEmptyIdleExtraDeckViewerState())
    }
  );
}

// server/ui/components/duel/field.component.jsx
var import_react16 = __toESM(require("react"), 1);

// server/ui/components/duel/field.component.module.scss
var field_component_module_default = ".root {}\n";

// server/ui/components/common/card.component.jsx
var import_react12 = __toESM(require("react"), 1);

// server/ui/components/common/card.component.module.scss
var card_component_module_default = ".cardComponent {\n}\n";

// server/ui/components/common/card.component.jsx
function makeCardheader(state) {
  const level = Number(state.level), rank = Number(state.rank);
  if (state.position === "FaceDownDefence" || state.position === "FaceDownAttack") {
    return "";
  }
  if (cardIs("link", state)) {
    return Number.isFinite(level) && level > 0 ? `L ${level}` : "L";
  }
  if (cardIs("xyz", state) || Number.isFinite(rank) && rank > 0) {
    return `R ${Number.isFinite(rank) && rank > 0 ? rank : level}`;
  }
  if (Number.isFinite(level) && level > 0) {
    return `\xE2\u02DC\u2026 ${level}`;
  }
  return "";
}
function getCounterTotal(counters) {
  if (typeof counters === "number") {
    return counters;
  }
  if (!counters || typeof counters !== "object") {
    return 0;
  }
  return Object.values(counters).reduce((total, amount) => total + (Number(amount) || 0), 0);
}
function getCardHintLines(state) {
  const lines = [];
  if (typeof state?.card_hint_text === "string" && state.card_hint_text.trim()) {
    lines.push(state.card_hint_text.trim());
  }
  if (Array.isArray(state?.desc_hints)) {
    state.desc_hints.forEach((hint) => {
      if (typeof hint === "string" && hint.trim()) {
        lines.push(hint.trim());
      }
    });
  }
  return Array.from(new Set(lines));
}
function renderChainOverlay(state) {
  if (!state?.chainOverlay || !Number.isInteger(Number(state.chainOverlay.index))) {
    return null;
  }
  const status = typeof state.chainOverlay.status === "string" ? state.chainOverlay.status : "queued";
  return /* @__PURE__ */ import_react12.default.createElement(
    "div",
    {
      className: `card-overlay chain-overlay ${status}`,
      "data-chain-index": state.chainOverlay.index,
      "data-chain-status": status
    },
    /* @__PURE__ */ import_react12.default.createElement(AppImage, { alt: "", "aria-hidden": "true", src: "/img/textures/chain-overlay.svg", width: 128, height: 128, style: { width: "100%", height: "100%", objectFit: "contain" } }),
    /* @__PURE__ */ import_react12.default.createElement("span", { className: "chain-overlay-number" }, state.chainOverlay.index)
  );
}
function renderBattleOverlay(state) {
  if (typeof state?.battlePulse !== "string" || !state.battlePulse.length) {
    return null;
  }
  return /* @__PURE__ */ import_react12.default.createElement(
    "div",
    {
      className: `card-overlay battle-overlay ${state.battlePulse}`,
      "data-battle-pulse": state.battlePulse
    },
    /* @__PURE__ */ import_react12.default.createElement(AppImage, { alt: "", "aria-hidden": "true", src: "/img/textures/attack.png", width: 128, height: 128, style: { width: "100%", height: "100%", objectFit: "contain" } })
  );
}
function renderRelationOverlay(state) {
  if (state?.relationOverlay !== "equip") {
    return null;
  }
  return /* @__PURE__ */ import_react12.default.createElement(
    "div",
    {
      className: "card-overlay relation-overlay equip-overlay",
      "data-relation-overlay": "equip"
    },
    /* @__PURE__ */ import_react12.default.createElement(AppImage, { alt: "", "aria-hidden": "true", src: "/img/textures/equip.png", width: 128, height: 128, style: { width: "100%", height: "100%", objectFit: "contain" } })
  );
}
function hoverCardImage(state, tooltip) {
  emit({
    action: "CARD_HOVER",
    id: state.id,
    card: state
  });
  if (!["MONSTERZONE", "SPELLZONE", "HAND"].includes(state.location)) {
    return;
  }
  if ((state.position === "FaceDown" || state.position === "FaceDownDefence") && state.player !== window.orientation) {
    return;
  }
  window.toolTipData = tooltip;
}
function clearCardImageHover() {
  emit({
    action: "CARD_HOVER",
    clear: true
  });
  window.toolTipData = "";
}
function clickCardImage(state, event) {
  emit({ action: "CARD_CLICK", card: state, y: event.pageY, x: event.pageX });
  emit({ action: "UPDATE_FIELD" });
}
function getCardImageContainerProperties(state) {
  const isOverlayUnit = Number(state.overlayindex || 0) > 0, counterTotal = getCounterTotal(state.counters), hintLines = getCardHintLines(state), counters = !isOverlayUnit && counterTotal > 0 && state.location !== "HAND" ? `
${counterTotal} Counters` : "", line2 = !isOverlayUnit && cardIs("monster", state) ? `
${makeCardheader(state)}` : "", line3 = !isOverlayUnit && state.def !== void 0 ? `
${state.attack || state.atk} / ${state.def} ${counters}` : counters, hintFooter = !isOverlayUnit && hintLines.length ? `
${hintLines.join("\n")}` : "", player = window.orientation ? state.player ? 0 : 1 : state.player, className = ["card"], style = {};
  if (!state.ghostOverlay) {
    className.push("p" + player, state.location, "i" + state.index);
  }
  if (!player && state.location === "HAND") {
    state = { ...state, position: "FaceUp" };
  }
  if (state.location === "HAND") {
    const f = 75 / 0.8, xCoord = state.handLocation < 6 ? (5.5 * f - 0.8 * f * state.handLocation) / 2 + 1.55 * f + state.index * 0.8 * f : 1.9 * f + state.index * 4 * f / (state.handLocation - 1);
    style.left = String() + xCoord + "px";
  }
  if (state.location === "DECK" || state.location === "EXTRA" || state.location === "GRAVE" || state.location === "BANISHED") {
    style.transform = "translate3d(0, 0, " + state.index + "px)";
    style.zIndex = state.index;
  }
  if (state.location === "MONSTERZONE" && state.overlayindex) {
    const offsetX = state.overlayindex % 2 ? -1 * (state.overlayindex + 1) * 3 : state.overlayindex + -1 * 3, offsetY = state.overlayindex * 4;
    style.zIndex = -1 * state.overlayindex;
    style.transform = "translate(" + offsetX + "px, " + offsetY + "px)";
  }
  if (state.ghostOverlay && state.ghostStyle) {
    Object.assign(style, state.ghostStyle);
  }
  if (state.attackmode) {
    className.push("attackglow");
  }
  if (state.selectionPulse) {
    className.push("selectionglow");
  }
  if (state.flashCover) {
    className.push("flashcover");
  }
  if (state.commandHintPulse) {
    className.push("commandhintglow");
  }
  if (state.targetGlow || state.targetPulse) {
    className.push("targetglow");
  }
  if (state.enterFade) {
    className.push("card-enter");
  }
  if (state.exitFade) {
    className.push("card-exit", "card-ghost");
  }
  return {
    className: `${className.join(" ")} ${card_component_module_default.cardComponent}`,
    "data-position": state.position,
    "data-id": state.id,
    "data-uid": state.uid,
    "data-index": state.index,
    "data-overlayindex": state.overlayindex || 0,
    "data-selection-pulse": state.selectionPulse ? "true" : "false",
    "data-flash-cover": state.flashCover ? "true" : "false",
    "data-command-hint-pulse": state.commandHintPulse ? "true" : "false",
    "data-target-pulse": state.targetPulse ? "true" : "false",
    "data-header": line2,
    "data-footer": `${line3}${hintFooter}`,
    reloaded: state.reloaded,
    onMouseEnter: () => hoverCardImage(state, `${state.name} ${line2} ${line3}${hintFooter}`),
    onMouseLeave: () => clearCardImageHover(),
    onClick: (event) => clickCardImage(state, event),
    style
  };
}
function getCardImageProperties(state) {
  const facedown = state.position === "FaceDownDefence" || state.position === "FaceDownAttack" || state.id === "unknown", src = state.id && !facedown ? getCardImageUrl(state.id) : "img/textures/cover.jpg", style = {};
  if (state.location !== "HAND") {
    style.zIndex = state.index;
  }
  return {
    src,
    style
  };
}
function CardImageState(input) {
  return {
    state: input?.state || input || {}
  };
}
function CardImageView({ controller }) {
  if (!controller) {
    return null;
  }
  const imageProperties = getCardImageProperties(controller.state);
  return /* @__PURE__ */ import_react12.default.createElement("div", { key: controller.state.uid, ...getCardImageContainerProperties(controller.state) }, /* @__PURE__ */ import_react12.default.createElement(AppImage, { alt: controller.state.name || "Card image", fallbackSrc: "img/textures/unknown.jpg", width: 177, height: 254, sizes: "(max-width: 768px) 33vw, 177px", ...imageProperties }), renderRelationOverlay(controller.state), renderChainOverlay(controller.state), renderBattleOverlay(controller.state));
}
function CardImage({ controller, state }) {
  const resolvedController = controller || CardImageState(state);
  return /* @__PURE__ */ import_react12.default.createElement(CardImageView, { controller: resolvedController });
}
function MountedCardImage({ controller }) {
  return /* @__PURE__ */ import_react12.default.createElement(CardImage, { controller });
}

// server/ui/components/duel/phases.component.jsx
var import_react13 = __toESM(require("react"), 1);

// server/ui/components/duel/phases.component.module.scss
var phases_component_module_default = ".root {}\n";

// server/ui/components/duel/phases.component.jsx
var PHASE_INDEX_BY_NAME = {
  DRAW: 0,
  PHASE_DRAW: 0,
  STANDBY: 1,
  PHASE_STANDBY: 1,
  MAIN1: 2,
  MAIN_1: 2,
  PHASE_MAIN1: 2,
  BATTLE: 3,
  BATTLE_START: 3,
  PHASE_BATTLE_START: 3,
  MAIN2: 4,
  MAIN_2: 4,
  PHASE_MAIN2: 4,
  END: 5,
  PHASE_END: 5
};
function createEmptyPhaseIndicatorState(state = {}) {
  return {
    opponentTurn: false,
    phase: void 0,
    battlephase: void 0,
    mainphase2: void 0,
    endphase: void 0,
    ...state
  };
}
function resolvePhaseStore(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function resolvePhaseController(target) {
  if (target?.state || target?.phase !== void 0) {
    return target;
  }
  return target?.controller;
}
function normalizePhaseIndicatorUpdate(phaseUpdate) {
  const numericPhase = Number(phaseUpdate);
  if (Number.isInteger(numericPhase)) {
    return numericPhase;
  }
  return PHASE_INDEX_BY_NAME[String(phaseUpdate || "").toUpperCase()] ?? phaseUpdate;
}
function updatePhaseIndicator(target, state = {}) {
  const controller = resolvePhaseController(target), resolvedStore = resolvePhaseStore(target);
  if (controller) {
    Object.assign(controller.state, state);
  }
  resolvedStore?.emit?.({
    action: "UPDATE_PHASE_INDICATOR",
    state: createEmptyPhaseIndicatorState({
      ...controller?.state || {},
      ...state
    })
  });
}
function clickPhase(store2, phase) {
  store2?.emit?.({
    action: "PHASE_CLICK",
    phase: createCommandButtonAnswer(phase)
  });
}
function triggerManualPhase(number) {
  if (!app.manual) {
    return;
  }
  if (number === 6) {
    app.manualControls.manualNextTurn(number);
    return;
  }
  app.manualControls.manualNextPhase(number);
}
function isActivePhase(state, number) {
  return Number(state?.phase) === number;
}
function PhaseIndicatorButton({ number, id, text, enabled, active, onEnabledClick, onManualClick }) {
  const classNames = ["phaseindicator"];
  if (enabled) {
    classNames.push("enabled");
  }
  if (active) {
    classNames.push("active");
  }
  return /* @__PURE__ */ import_react13.default.createElement(
    "button",
    {
      className: classNames.join(" "),
      id,
      onClick: enabled ? onEnabledClick : onManualClick
    },
    text
  );
}
function PhaseIndicator({ controller, store: store2 }) {
  const resolvedStore = resolvePhaseStore(store2 || controller), [state, setState] = (0, import_react13.useState)(createEmptyPhaseIndicatorState(controller?.state));
  (0, import_react13.useEffect)(() => {
    setState(createEmptyPhaseIndicatorState(controller?.state));
  }, [controller]);
  (0, import_react13.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const unsubscribeUpdate = resolvedStore.on("UPDATE_PHASE_INDICATOR", (message) => {
      if (controller?.state) {
        Object.assign(controller.state, message?.state || {});
      }
      setState((current) => createEmptyPhaseIndicatorState({
        ...current,
        ...message?.state || {}
      }));
    }), unsubscribeEnablePhase = resolvedStore.on("ENABLE_PHASE", (message) => {
      if (controller?.state) {
        Object.assign(controller.state, {
          battlephase: message.battlephase,
          mainphase2: message.mainphase2,
          endphase: message.endphase
        });
      }
      setState((current) => ({
        ...current,
        battlephase: message.battlephase,
        mainphase2: message.mainphase2,
        endphase: message.endphase
      }));
    }), unsubscribeOpponentTurn = resolvedStore.on("OPPONENT_TURN", (message) => {
      if (controller?.state) {
        controller.state.opponentTurn = Boolean(message.active);
      }
      setState((current) => ({
        ...current,
        opponentTurn: Boolean(message.active)
      }));
    });
    return () => {
      unsubscribeUpdate?.();
      unsubscribeEnablePhase?.();
      unsubscribeOpponentTurn?.();
    };
  }, [resolvedStore]);
  const buttons = [
    { number: 0, id: "drawphi", text: "DP", enabled: false, active: isActivePhase(state, 0) },
    { number: 1, id: "standbyphi", text: "SP", enabled: false, active: isActivePhase(state, 1) },
    { number: 2, id: "main1phi", text: "M1", enabled: false, active: isActivePhase(state, 2) },
    { number: 3, id: "battlephi", text: "BP", enabled: state.battlephase, active: isActivePhase(state, 3) },
    { number: 4, id: "main2phi", text: "M2", enabled: state.mainphase2, active: isActivePhase(state, 4) },
    { number: 5, id: "endphi", text: "EP", enabled: state.endphase, active: isActivePhase(state, 5) },
    { number: 6, id: "nextturn", text: "Opponent", enabled: state.opponentTurn, active: Boolean(state.opponentTurn) }
  ];
  return /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      className: phases_component_module_default.root,
      "data-currentphase": state.phase,
      "data-opponentturn": state.opponentTurn ? "true" : "false",
      id: "phaseindicator"
    },
    buttons.map((button) => /* @__PURE__ */ import_react13.default.createElement(
      PhaseIndicatorButton,
      {
        active: button.active,
        enabled: button.enabled,
        id: button.id,
        key: button.id,
        number: button.number,
        onEnabledClick: () => clickPhase(resolvedStore, button.enabled),
        onManualClick: () => triggerManualPhase(button.number),
        text: button.text
      }
    ))
  );
}
function MountedPhaseIndicator(props) {
  return /* @__PURE__ */ import_react13.default.createElement(PhaseIndicator, { ...props });
}

// server/ui/components/duel/field.selection.component.jsx
var import_react15 = __toESM(require("react"), 1);

// server/ui/components/duel/zone.selection.component.jsx
var import_react14 = __toESM(require("react"), 1);

// server/ui/components/duel/zone.selection.component.module.scss
var zone_selection_component_module_default = ".root {}\n";

// server/ui/components/duel/zone.selection.component.jsx
function getZoneSelectorViewerPlayer(zone) {
  return window.orientation ? zone.player ? 0 : 1 : zone.player;
}
function hoverZoneSelector(store2, zone, hoveredRef) {
  if (!store2 || !zone || hoveredRef.current) {
    return;
  }
  hoveredRef.current = true;
  store2.emit?.({
    action: "ZONE_HOVER",
    player: zone.player,
    location: zone.location,
    index: zone.index
  });
}
function unhoverZoneSelector(hoveredRef) {
  hoveredRef.current = false;
}
function clickZoneSelector(store2, zone) {
  if (!store2 || !zone) {
    return;
  }
  store2.emit?.({
    action: "ZONE_CLICK",
    manual: {
      choice: zone.index,
      location: zone.location
    },
    automatic: createSelectPlaceAnswer(
      getZoneSelectorViewerPlayer(zone),
      zone.location,
      zone.index
    )
  });
}
function getZoneSelectorProperties(zone, active, store2, hoveredRef) {
  const viewerPlayer = getZoneSelectorViewerPlayer(zone), className = ["cardselectionzone", "p" + viewerPlayer, zone.location, "i" + zone.index], style = {
    pointerEvents: active ? "auto" : "none",
    background: active ? "rgba(255,0,0,.5)" : "none"
  }, count = Object.keys(app.duel.field.state.cards).reduce((total, uid) => {
    const card = app.duel.field.state.cards[uid];
    if (card.state.location === zone.location && zone.player === card.state.player) {
      return total + 1;
    }
    return total;
  }, 0);
  return {
    className: className.join(" "),
    "data-position": zone.position,
    "data-id": zone.id,
    "data-uid": zone.uid,
    "data-index": zone.index,
    "data-count": count ? count : "",
    reloaded: zone.reloaded,
    key: zone.uid,
    onError: function(event) {
      event.target.src = "img/textures/unknown.jpg";
    },
    onMouseEnter: () => hoverZoneSelector(store2, zone, hoveredRef),
    onMouseLeave: () => unhoverZoneSelector(hoveredRef),
    onClick: () => clickZoneSelector(store2, zone),
    style
  };
}
function ZoneSelector({ zone, active, store: store2 }) {
  const hoveredRef = (0, import_react14.useRef)(false);
  if (!zone) {
    return null;
  }
  const properties = getZoneSelectorProperties(zone, active, store2, hoveredRef);
  return /* @__PURE__ */ import_react14.default.createElement("div", { ...properties, className: `${properties.className} ${zone_selection_component_module_default.root}`.trim() });
}
function MountedZoneSelector({ zone, active, store: store2 }) {
  return /* @__PURE__ */ import_react14.default.createElement(ZoneSelector, { zone, active, store: store2 });
}
var zone_selection_component_default = ZoneSelector;

// server/ui/components/duel/field.selection.component.module.scss
var field_selection_component_module_default = ".root {}\n";

// server/ui/components/duel/field.selection.component.jsx
function resolveCanonicalZonePlayer(player, query = {}) {
  const normalizedPlayer = Number(player);
  if (query?.command === "MSG_SELECT_PLACE" && Number.isInteger(Number(query?.player))) {
    const promptPlayer = Number(query.player);
    return window.orientation ? promptPlayer ? 0 : 1 : promptPlayer;
  }
  if (normalizedPlayer !== 0 && normalizedPlayer !== 1) {
    return 0;
  }
  return window.orientation ? normalizedPlayer ? 0 : 1 : normalizedPlayer;
}
function setupFieldSelectorZones(zoneType, count) {
  const selectors = [];
  for (let player = 0; player <= 1; player++) {
    for (let index = 0; index <= count; index++) {
      selectors.push({
        index,
        location: zoneType,
        player,
        uid: `selector-player_${player}-${zoneType}-${index}`
      });
    }
  }
  return selectors;
}
var FIELD_SELECTOR_ZONES = [
  ...setupFieldSelectorZones("SPELLZONE", 7),
  ...setupFieldSelectorZones("MONSTERZONE", 7),
  ...setupFieldSelectorZones("DECK", 1),
  ...setupFieldSelectorZones("EXTRA", 1),
  ...setupFieldSelectorZones("GRAVE", 1),
  ...setupFieldSelectorZones("BANISHED", 1)
];
function forceFieldSelectionRender(controller) {
  controller?.store?.emit?.({ action: "RENDER" });
}
function useFieldSelectionVersion(controller) {
  const [, forceRender] = (0, import_react15.useReducer)((value) => value + 1, 0);
  (0, import_react15.useEffect)(() => {
    if (!controller?.store?.on) {
      return void 0;
    }
    return controller.store.on("RENDER", () => {
      forceRender();
    });
  }, [controller]);
}
function disableFieldSelection(controller) {
  if (!controller?.state) {
    return;
  }
  controller.state.activeZones = [];
  forceFieldSelectionRender(controller);
}
function selectFieldZones(controller, query) {
  if (!controller?.state) {
    return;
  }
  controller.state.activeZones = (query?.zones || []).reduce((activeZones, zone) => {
    const player = resolveCanonicalZonePlayer(zone.player, query), uuid = `selector-player_${player}-${zone.location}-${zone.index}`;
    if (FIELD_SELECTOR_ZONES.some((fieldZone) => fieldZone.uid === uuid)) {
      activeZones.push(uuid);
    }
    return activeZones;
  }, []);
  forceFieldSelectionRender(controller);
}
function FieldSelector({ controller }) {
  useFieldSelectionVersion(controller);
  if (!controller) {
    return null;
  }
  const activeZones = new Set(controller.state?.activeZones || []);
  return /* @__PURE__ */ import_react15.default.createElement("div", { className: field_selection_component_module_default.root, id: "selectionsystem" }, FIELD_SELECTOR_ZONES.map((zone) => /* @__PURE__ */ import_react15.default.createElement(
    MountedZoneSelector,
    {
      active: activeZones.has(zone.uid),
      key: zone.uid,
      store: controller.store,
      zone
    }
  )));
}
function MountedFieldSelector({ controller }) {
  return /* @__PURE__ */ import_react15.default.createElement(FieldSelector, { controller });
}
var field_selection_component_default = FieldSelector;

// server/ui/services/duel-field-viewport.service.js
function resolveDocument(dependencies) {
  return dependencies.document || globalThis.document;
}
function resolveWindow(dependencies) {
  return dependencies.window || globalThis.window;
}
function getElementCenter(element) {
  const rect = element?.getBoundingClientRect?.();
  if (!rect) {
    return null;
  }
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}
function createDuelFieldViewport(dependencies = {}) {
  function queryElements(selector) {
    const documentImpl = resolveDocument(dependencies);
    if (!documentImpl || typeof documentImpl.querySelectorAll !== "function") {
      return [];
    }
    return Array.from(documentImpl.querySelectorAll(selector));
  }
  function queryElement(selector) {
    const documentImpl = resolveDocument(dependencies);
    if (!documentImpl || typeof documentImpl.querySelector !== "function") {
      return null;
    }
    return documentImpl.querySelector(selector);
  }
  function getElementById(id) {
    const documentImpl = resolveDocument(dependencies);
    if (!documentImpl || typeof documentImpl.getElementById !== "function") {
      return null;
    }
    return documentImpl.getElementById(id);
  }
  function getNumericStyle(element, property) {
    const windowImpl = resolveWindow(dependencies);
    if (!windowImpl || typeof windowImpl.getComputedStyle !== "function") {
      return 0;
    }
    return Number.parseFloat(windowImpl.getComputedStyle(element)?.[property]) || 0;
  }
  function getCardElementByUid(uid) {
    if (!uid) {
      return null;
    }
    return queryElement(`.card[data-uid="${uid}"]`);
  }
  function getCardCenterByUid(uid) {
    return getElementCenter(getCardElementByUid(uid));
  }
  function getFieldRootCenter(fieldRootId = "automationduelfield") {
    return getElementCenter(getElementById(fieldRootId));
  }
  function getLpSlotCenter(player) {
    return getElementCenter(queryElement(`.lp-slot.p${player}`));
  }
  function getCardGhostStyle(uid) {
    const element = getCardElementByUid(uid), rect = element?.getBoundingClientRect?.();
    if (!rect) {
      return null;
    }
    const computedStyle = element ? resolveWindow(dependencies)?.getComputedStyle?.(element) : null;
    return {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transform: computedStyle?.transform && computedStyle.transform !== "none" ? computedStyle.transform : "",
      zIndex: 40
    };
  }
  return {
    getCardCenterByUid,
    getCardElementByUid,
    getCardGhostStyle,
    getFieldRootCenter,
    getLpSlotCenter,
    getNumericStyle,
    queryElement,
    queryElements
  };
}

// server/ui/services/duel-field-state.service.js
function removeFieldMapEntry(map, key) {
  const nextMap = { ...map };
  delete nextMap[key];
  return nextMap;
}
function castField(field, callback) {
  Object.keys(field).forEach((zone) => {
    field[zone].forEach(callback);
    field[zone].forEach(callback);
  });
}
function createDuelFieldStateService(dependencies = {}) {
  const setTimeoutImpl = dependencies.setTimeout || globalThis.setTimeout?.bind(globalThis) || setTimeout, clearTimeoutImpl = dependencies.clearTimeout || globalThis.clearTimeout?.bind(globalThis) || clearTimeout, now = dependencies.now || Date.now, random = dependencies.random || Math.random;
  function getCardMetadata(controller, cardId) {
    if (!Array.isArray(controller.databaseSystem) || !cardId) {
      return {};
    }
    return controller.databaseSystem.find((entry) => entry.id === cardId) || {};
  }
  function collectCards(field) {
    const cards = [];
    if (Array.isArray(field)) {
      field.forEach((view) => {
        if (view && typeof view === "object") {
          castField(view, (card) => cards.push(card));
        }
      });
      return cards;
    }
    if (field && typeof field === "object") {
      castField(field, (card) => cards.push(card));
    }
    return cards;
  }
  function rememberHydratedPiles(controller, update) {
    const views = Array.isArray(update) ? update : [update];
    views.forEach((view, fallbackPlayer) => {
      if (!view || typeof view !== "object") {
        return;
      }
      Object.keys(view).forEach((location) => {
        const cards = Array.isArray(view[location]) ? view[location] : [];
        if (!cards.length) {
          return;
        }
        const snapshot = cards.map((card, fallbackIndex) => {
          const player = Number.isInteger(Number(card?.player)) ? Number(card.player) : Number(fallbackPlayer), index = Number.isInteger(Number(card?.index)) ? Number(card.index) : Number(fallbackIndex), [cardImage] = controller.findPrimaryCardImages({
            player,
            location,
            index
          }), existingState = cardImage?.state || {};
          return {
            ...existingState,
            ...card,
            player,
            location,
            index,
            status: card?.status || existingState.status || "revealed"
          };
        });
        if (snapshot.length) {
          controller.state.pileSnapshots[controller.getPileSnapshotKey(snapshot[0].player, location)] = snapshot;
        }
      });
    });
  }
  function clearHydratedPiles(controller, update) {
    const views = Array.isArray(update) ? update : [update];
    views.forEach((view, fallbackPlayer) => {
      if (!view || typeof view !== "object") {
        return;
      }
      Object.keys(view).forEach((location) => {
        const cards = Array.isArray(view[location]) ? view[location] : [];
        if (!cards.length) {
          return;
        }
        const firstCard = cards[0] || {}, player = Number.isInteger(Number(firstCard?.player)) ? Number(firstCard.player) : Number(fallbackPlayer);
        delete controller.state.pileSnapshots[controller.getPileSnapshotKey(player, location)];
      });
    });
  }
  function scheduleEnterFade(controller, cardImage, duration = 240) {
    if (!cardImage) {
      return;
    }
    if (cardImage.__enterFadeTimer) {
      clearTimeoutImpl(cardImage.__enterFadeTimer);
    }
    controller.setCardImageState(cardImage, { enterFade: true });
    cardImage.__enterFadeTimer = setTimeoutImpl(() => {
      controller.setCardImageState(cardImage, { enterFade: void 0 });
      cardImage.__enterFadeTimer = null;
      controller.store.emit({ action: "RENDER" });
    }, duration);
  }
  function queueExitFade(controller, cardImage, duration = 220) {
    if (!cardImage?.state?.uid) {
      return;
    }
    const ghostStyle = controller.viewport.getCardGhostStyle(cardImage.state.uid), ghostKey = `${cardImage.state.uid}-ghost-${now()}-${random().toString(16).slice(2)}`, ghost = CardImageState({
      state: Object.assign({}, cardImage.state, {
        uid: ghostKey,
        ghostOverlay: true,
        ghostStyle,
        exitFade: true
      })
    });
    controller.state = {
      ...controller.state,
      fadeCards: {
        ...controller.state.fadeCards,
        [ghostKey]: ghost
      }
    };
    const cleanupTimer = setTimeoutImpl(() => {
      controller.state = {
        ...controller.state,
        fadeCards: removeFieldMapEntry(controller.state.fadeCards, ghostKey)
      };
      controller.fadeCleanupTimers.delete(cleanupTimer);
      controller.store.emit({ action: "RENDER" });
    }, duration);
    controller.fadeCleanupTimers.add(cleanupTimer);
  }
  function syncField(controller, field, replace = false) {
    const cards = collectCards(field).filter((card) => card && card.location !== "INMATERIAL"), previousCards = controller.state.cards, nextCards = replace ? {} : controller.state.cards, seenUids = /* @__PURE__ */ new Set();
    cards.forEach((card) => {
      let dbEntry = {};
      seenUids.add(card.uid);
      if (replace && previousCards[card.uid] && !nextCards[card.uid]) {
        nextCards[card.uid] = previousCards[card.uid];
      }
      if (!nextCards[card.uid]) {
        dbEntry = getCardMetadata(controller, card.id);
        nextCards[card.uid] = CardImageState({
          state: Object.assign({}, dbEntry, card)
        });
        if (replace && controller.fieldPrimed) {
          scheduleEnterFade(controller, nextCards[card.uid]);
        }
      }
      if (nextCards[card.uid].state.id !== card.id) {
        dbEntry = getCardMetadata(controller, card.id);
      }
      nextCards[card.uid].state = {
        ...nextCards[card.uid].state,
        ...dbEntry,
        ...card
      };
    });
    if (replace && controller.fieldPrimed) {
      Object.keys(previousCards).forEach((uid) => {
        if (!seenUids.has(uid)) {
          queueExitFade(controller, previousCards[uid]);
        }
      });
    }
    if (replace) {
      controller.state = {
        ...controller.state,
        cards: nextCards
      };
      controller.fieldPrimed = true;
    }
    const count = { 0: 0, 1: 0 };
    Object.keys(controller.state.cards).forEach((uid) => {
      const cardImage = controller.state.cards[uid];
      if (cardImage?.state?.location === "HAND") {
        count[cardImage.state.player] += 1;
      }
    });
    Object.keys(controller.state.cards).forEach((uid) => {
      const cardImage = controller.state.cards[uid];
      if (cardImage?.state?.location === "HAND") {
        controller.setCardImageState(cardImage, {
          handLocation: count[cardImage.state.player]
        });
      }
    });
    if (controller.hoveredRelationSource) {
      controller.applyRelationHighlights(controller.hoveredRelationSource);
    }
  }
  function updateField(controller, update) {
    clearHydratedPiles(controller, update);
    syncField(controller, update, false);
  }
  function hydrateField(controller, update) {
    const views = Array.isArray(update) ? update : [update];
    let changed = false;
    rememberHydratedPiles(controller, update);
    views.forEach((view, fallbackPlayer) => {
      if (!view || typeof view !== "object") {
        return;
      }
      Object.keys(view).forEach((location) => {
        const cards = Array.isArray(view[location]) ? view[location] : [];
        cards.forEach((card, fallbackIndex) => {
          const player = Number.isInteger(Number(card?.player)) ? Number(card.player) : Number(fallbackPlayer), index = Number.isInteger(Number(card?.index)) ? Number(card.index) : Number(fallbackIndex), [cardImage] = controller.findPrimaryCardImages({
            player,
            location,
            index
          });
          if (!cardImage?.state) {
            return;
          }
          const dbEntry = getCardMetadata(controller, card.id);
          controller.setCardImageState(cardImage, {
            ...dbEntry,
            ...card
          });
          changed = true;
        });
      });
    });
    if (changed) {
      controller.store.emit({ action: "RENDER" });
    }
  }
  function replaceField(controller, update) {
    controller.state = {
      ...controller.state,
      pileSnapshots: {}
    };
    syncField(controller, update, true);
  }
  function getDeck(controller, player, location) {
    const deck = Object.keys(controller.state.cards).filter((guid) => {
      const cardImage = controller.state.cards[guid];
      return cardImage.state.location === location && cardImage.state.player === player;
    }).map((guid) => {
      const cardImage = controller.state.cards[guid];
      return {
        id: cardImage.state.id,
        uid: cardImage.state.uid,
        player: cardImage.state.player,
        location: cardImage.state.location,
        index: cardImage.state.index,
        type: cardImage.state.type,
        setcode: cardImage.state.setcode,
        position: cardImage.state.position,
        status: "revealed",
        name: cardImage.state.name
      };
    }).sort((first, second) => Number(first.index || 0) - Number(second.index || 0));
    const snapshot = controller.state.pileSnapshots[controller.getPileSnapshotKey(player, location)];
    if (!Array.isArray(snapshot) || !snapshot.length) {
      return deck;
    }
    const merged = /* @__PURE__ */ new Map();
    deck.forEach((card) => {
      merged.set(Number(card.index || 0), card);
    });
    snapshot.forEach((card) => {
      merged.set(Number(card.index || 0), {
        ...merged.get(Number(card.index || 0)) || {},
        ...card,
        player: Number.isInteger(Number(card?.player)) ? Number(card.player) : player,
        location: card?.location || location,
        index: Number.isInteger(Number(card?.index)) ? Number(card.index) : Number(merged.size),
        status: card?.status || "revealed"
      });
    });
    return Array.from(merged.values()).sort(
      (first, second) => Number(first.index || 0) - Number(second.index || 0)
    );
  }
  return {
    clearHydratedPiles,
    getCardMetadata,
    getDeck,
    hydrateField,
    queueExitFade,
    rememberHydratedPiles,
    replaceField,
    scheduleEnterFade,
    syncField,
    updateField
  };
}
var defaultDuelFieldStateService = createDuelFieldStateService();

// server/ui/components/duel/field.component.jsx
var defaultFieldViewport = createDuelFieldViewport();
function matchesFieldCardState(state, query) {
  if (!state || !query) {
    return false;
  }
  if (state.player !== Number(query.player)) {
    return false;
  }
  if (state.location !== query.location) {
    return false;
  }
  if (state.index !== Number(query.index)) {
    return false;
  }
  if (Number.isInteger(query.overlay_sequence)) {
    return Number(state.overlayindex || 0) === Number(query.overlay_sequence) + 1;
  }
  return true;
}
function setFieldCardImageState(cardImage, patch) {
  if (!cardImage?.state) {
    return;
  }
  cardImage.state = {
    ...cardImage.state,
    ...patch
  };
}
function setFieldZoneActive(zone, active) {
  if (!zone) {
    return zone;
  }
  if (Boolean(zone.active) === Boolean(active)) {
    return zone;
  }
  return {
    ...zone,
    active: Boolean(active)
  };
}
function normalizeFieldQuery(query) {
  if (!query || typeof query !== "object") {
    return null;
  }
  const player = Number(query.player), index = Number(query.index);
  if (!Number.isInteger(player) || typeof query.location !== "string" || !Number.isInteger(index)) {
    return null;
  }
  const output = {
    player,
    location: query.location,
    index
  };
  if (Number.isInteger(query.overlay_sequence)) {
    output.overlay_sequence = Number(query.overlay_sequence);
  } else if (Number.isInteger(query.overlayindex) && Number(query.overlayindex) > 0) {
    output.overlay_sequence = Number(query.overlayindex) - 1;
  }
  return output;
}
function FieldOverlayZone({ className, dataset = {}, style = {}, ariaHidden = null }) {
  return /* @__PURE__ */ import_react16.default.createElement(
    "div",
    {
      className,
      "data-player": dataset.player,
      "data-location": dataset.location,
      "data-index": dataset.index,
      "data-uid": dataset.uid,
      "aria-hidden": ariaHidden,
      style
    }
  );
}
function buildFieldActionSpinners(controller) {
  return controller.getActionSpinnerDescriptors().map(({ player, location, index }) => {
    const key = controller.getActionSpinnerKey(player, location, index ?? null), enabled = Boolean(controller.state.actionSpinners[key]);
    return /* @__PURE__ */ import_react16.default.createElement(
      FieldOverlayZone,
      {
        key,
        className: [
          `p${player}`,
          location,
          Number.isInteger(index) ? `i${index}` : null,
          "actcover",
          enabled ? "enabled" : "disabled"
        ].filter(Boolean).join(" ")
      }
    );
  });
}
function FieldView({ controller }) {
  if (!controller) {
    return null;
  }
  const cards = Object.keys(controller.state.cards).map((card) => {
    return /* @__PURE__ */ import_react16.default.createElement(
      MountedCardImage,
      {
        controller: controller.state.cards[card],
        key: card
      }
    );
  }), fadeCards = Object.keys(controller.state.fadeCards).map((card) => {
    return /* @__PURE__ */ import_react16.default.createElement(
      MountedCardImage,
      {
        controller: controller.state.fadeCards[card],
        key: card
      }
    );
  }), disabledZones = Object.keys(controller.state.disabledZones).map((card) => {
    return /* @__PURE__ */ import_react16.default.createElement(
      MountedFieldDisabledZone,
      {
        state: controller.state.disabledZones[card],
        key: card
      }
    );
  });
  return /* @__PURE__ */ import_react16.default.createElement("div", { className: field_component_module_default.root }, cards, fadeCards, /* @__PURE__ */ import_react16.default.createElement(MountedPhaseIndicator, { controller: controller.state.phase, key: "field-phase-indicator" }), /* @__PURE__ */ import_react16.default.createElement(MountedFieldSelector, { controller: controller.state.selectors, key: "field-selector" }), disabledZones, buildFieldActionSpinners(controller));
}
function MountedField({ controller }) {
  return /* @__PURE__ */ import_react16.default.createElement(FieldView, { controller });
}
function MountedFieldDisabledZone({ state }) {
  if (!state) {
    return null;
  }
  const properties = getFieldDisabledZoneProperties(state);
  return /* @__PURE__ */ import_react16.default.createElement(
    FieldOverlayZone,
    {
      className: properties.className,
      dataset: {
        player: properties["data-player"],
        location: properties["data-location"],
        index: properties["data-index"],
        uid: properties["data-uid"]
      },
      ariaHidden: properties["aria-hidden"],
      style: properties.style
    }
  );
}
function getFieldDisabledZoneProperties(state) {
  return {
    className: [
      "cardselectionzone",
      "fielddisabledzone",
      "p" + state.player,
      state.location,
      "i" + state.index,
      state.active ? "active" : "inactive"
    ].join(" "),
    "data-player": state.player,
    "data-location": state.location,
    "data-index": state.index,
    "data-uid": state.uid,
    "aria-hidden": "true",
    key: state.uid,
    style: {
      pointerEvents: "none"
    }
  };
}
var fieldMethods = {
  normalizeActionSpinnerLocation(location) {
    if (location === "BANISH" || location === "BANISHED") {
      return "BANISHED";
    }
    return location;
  },
  getActionSpinnerKey(player, location, index = null) {
    return `action-spinner-player_${player}-${location}-${index === null ? "pile" : index}`;
  },
  getActionSpinnerDescriptors() {
    const descriptors = [];
    ["EXTRA", "GRAVE", "BANISHED"].forEach((location) => {
      for (let player = 0; player <= 1; player += 1) {
        descriptors.push({ player, location });
      }
    });
    ["MONSTERZONE", "SPELLZONE"].forEach((location) => {
      const maxIndex = location === "MONSTERZONE" ? 7 : 8;
      for (let player = 0; player <= 1; player += 1) {
        for (let index = 0; index < maxIndex; index += 1) {
          descriptors.push({ player, location, index });
        }
      }
    });
    return descriptors;
  },
  createActionSpinnerState() {
    const spinners = {};
    this.getActionSpinnerDescriptors().forEach(({ player, location, index }) => {
      spinners[this.getActionSpinnerKey(player, location, index ?? null)] = false;
    });
    return spinners;
  },
  getPileSnapshotKey(player, location) {
    return `${Number(player)}:${location}`;
  },
  rememberHydratedPiles(update) {
    return this.fieldStateService.rememberHydratedPiles(this, update);
  },
  clearHydratedPiles(update) {
    return this.fieldStateService.clearHydratedPiles(this, update);
  },
  getCardMetadata(cardId) {
    return this.fieldStateService.getCardMetadata(this, cardId);
  },
  buildFieldDisabledZones(zoneType, count) {
    const zones = [];
    for (let player = 0; player <= 1; player += 1) {
      for (let index = 0; index < count; index += 1) {
        zones.push({
          active: false,
          index,
          location: zoneType,
          player,
          uid: `field-disabled-player_${player}-${zoneType}-${index}`
        });
      }
    }
    return zones;
  },
  createFieldDisabledState() {
    const disabledZones = {}, zones = [].concat(this.buildFieldDisabledZones("MONSTERZONE", 7)).concat(this.buildFieldDisabledZones("SPELLZONE", 8));
    zones.forEach((zone) => {
      disabledZones[zone.uid] = zone;
    });
    return disabledZones;
  },
  scheduleEnterFade(cardImage, duration = 240) {
    return this.fieldStateService.scheduleEnterFade(this, cardImage, duration);
  },
  queueExitFade(cardImage, duration = 220) {
    return this.fieldStateService.queueExitFade(this, cardImage, duration);
  },
  syncField(field, replace = false) {
    return this.fieldStateService.syncField(this, field, replace);
  },
  updateField(update) {
    return this.fieldStateService.updateField(this, update);
  },
  hydrateField(update) {
    return this.fieldStateService.hydrateField(this, update);
  },
  replaceField(update) {
    return this.fieldStateService.replaceField(this, update);
  },
  setDisabledZones(zones = []) {
    const activeZoneKeys = new Set(
      (Array.isArray(zones) ? zones : []).map(
        (zone) => `field-disabled-player_${Number(zone?.player ?? 0)}-${zone?.location}-${Number(zone?.index ?? 0)}`
      )
    );
    let changed = false;
    const nextDisabledZones = {};
    Object.keys(this.state.disabledZones).forEach((uid) => {
      const nextZone = setFieldZoneActive(
        this.state.disabledZones[uid],
        activeZoneKeys.has(uid)
      );
      if (nextZone !== this.state.disabledZones[uid]) {
        changed = true;
      }
      nextDisabledZones[uid] = nextZone;
    });
    if (!changed) {
      return;
    }
    this.state = {
      ...this.state,
      disabledZones: nextDisabledZones
    };
    this.store.emit({ action: "RENDER" });
  },
  findCardImages(query) {
    return Object.values(this.state.cards).filter(
      (cardImage) => matchesFieldCardState(cardImage?.state, query)
    );
  },
  findPrimaryCardImages(query) {
    const normalized = normalizeFieldQuery(query);
    if (!normalized) {
      return [];
    }
    return Object.values(this.state.cards).filter((cardImage) => {
      if (!matchesFieldCardState(cardImage?.state, normalized)) {
        return false;
      }
      if (Number.isInteger(normalized.overlay_sequence)) {
        return true;
      }
      return Number(cardImage?.state?.overlayindex || 0) === 0;
    });
  },
  getCardElement(query) {
    const [cardImage] = this.findPrimaryCardImages(query);
    if (!cardImage?.state?.uid) {
      return null;
    }
    return this.viewport.getCardElementByUid(cardImage.state.uid);
  },
  getViewportCenter(query) {
    const [cardImage] = this.findPrimaryCardImages(query);
    if (!cardImage?.state?.uid) {
      return null;
    }
    return this.viewport.getCardCenterByUid(cardImage.state.uid);
  },
  getPileViewportCenter(player, location) {
    const cards = Object.values(this.state.cards).filter(
      (cardImage) => cardImage?.state?.player === Number(player) && cardImage?.state?.location === location && Number(cardImage?.state?.overlayindex || 0) === 0
    ).sort(
      (first, second) => Number(second?.state?.index || 0) - Number(first?.state?.index || 0)
    ), topCard = cards[0];
    if (topCard) {
      return this.viewport.getCardCenterByUid(topCard.state.uid);
    }
    return this.viewport.getFieldRootCenter("automationduelfield");
  },
  getDirectAttackViewportCenter(attackingPlayer = 0) {
    return this.viewport.getLpSlotCenter(attackingPlayer ? 0 : 1) || this.getPileViewportCenter(attackingPlayer ? 0 : 1, "DECK");
  },
  clearRelationHighlights() {
    this.hoveredRelationSource = null;
    Object.values(this.state.cards).forEach((cardImage) => {
      setFieldCardImageState(cardImage, {
        targetGlow: void 0,
        relationOverlay: void 0
      });
    });
  },
  applyRelationHighlights(query) {
    const normalized = normalizeFieldQuery(query), relatedTargets = [];
    this.clearRelationHighlights();
    if (!normalized) {
      return;
    }
    this.hoveredRelationSource = normalized;
    this.findPrimaryCardImages(normalized).forEach((cardImage) => {
      if (cardImage?.state?.equipCard) {
        setFieldCardImageState(cardImage, {
          relationOverlay: "equip"
        });
        relatedTargets.push(cardImage.state.equipCard);
      }
      if (Array.isArray(cardImage?.state?.cardTarget)) {
        cardImage.state.cardTarget.forEach((target) => {
          relatedTargets.push(target);
        });
      }
    });
    relatedTargets.forEach((target) => {
      this.findPrimaryCardImages(target).forEach((cardImage) => {
        setFieldCardImageState(cardImage, {
          targetGlow: true
        });
      });
    });
  },
  findCardImagesByChainIndex(chainIndex) {
    return Object.values(this.state.cards).filter(
      (cardImage) => Number(cardImage?.state?.chainOverlay?.index) === Number(chainIndex)
    );
  },
  updateChainOverlay(contract) {
    if (contract?.phase === "end") {
      this.clearChainOverlays();
      return;
    }
    const overlays = contract?.source ? this.findCardImages(contract.source) : this.findCardImagesByChainIndex(contract?.chainIndex), status = typeof contract?.phase === "string" ? contract.phase : "queued", chainIndex = Number(contract?.chainIndex || 0);
    overlays.forEach((cardImage) => {
      setFieldCardImageState(cardImage, {
        chainOverlay: {
          index: chainIndex,
          status
        }
      });
    });
    if (overlays.length) {
      this.store.emit({ action: "RENDER" });
    }
  },
  clearChainOverlays() {
    Object.values(this.state.cards).forEach((cardImage) => {
      setFieldCardImageState(cardImage, {
        chainOverlay: void 0
      });
    });
    this.store.emit({ action: "RENDER" });
  },
  pulseSelectionCards(cards = [], duration = 900) {
    const visibleDuration = Math.max(90, Number(duration || 900));
    const seen = /* @__PURE__ */ new Set();
    (Array.isArray(cards) ? cards : []).forEach((query) => {
      this.findCardImages(query).forEach((cardImage) => {
        if (!cardImage?.state?.uid || seen.has(cardImage.state.uid)) {
          return;
        }
        seen.add(cardImage.state.uid);
        if (cardImage.__selectionPulseTimer) {
          clearTimeout(cardImage.__selectionPulseTimer);
        }
        setFieldCardImageState(cardImage, {
          selectionPulse: true
        });
        cardImage.__selectionPulseTimer = setTimeout(() => {
          setFieldCardImageState(cardImage, {
            selectionPulse: void 0
          });
          cardImage.__selectionPulseTimer = null;
          this.store.emit({ action: "RENDER" });
        }, visibleDuration);
      });
    });
    if (seen.size) {
      this.store.emit({ action: "RENDER" });
    }
  },
  pulseTargetCards(cards = [], duration = 900) {
    const visibleDuration = Math.max(90, Number(duration || 900));
    const seen = /* @__PURE__ */ new Set();
    (Array.isArray(cards) ? cards : []).forEach((query) => {
      this.findCardImages(query).forEach((cardImage) => {
        if (!cardImage?.state?.uid || seen.has(cardImage.state.uid)) {
          return;
        }
        seen.add(cardImage.state.uid);
        if (cardImage.__targetPulseTimer) {
          clearTimeout(cardImage.__targetPulseTimer);
        }
        setFieldCardImageState(cardImage, {
          targetPulse: true
        });
        cardImage.__targetPulseTimer = setTimeout(() => {
          setFieldCardImageState(cardImage, {
            targetPulse: void 0
          });
          cardImage.__targetPulseTimer = null;
          this.store.emit({ action: "RENDER" });
        }, visibleDuration);
      });
    });
    if (seen.size) {
      this.store.emit({ action: "RENDER" });
    }
  },
  pulseAnnouncementCards(cards = [], duration = 1e3) {
    const visibleDuration = Math.max(1e3, Number(duration || 1e3));
    const seen = /* @__PURE__ */ new Set();
    (Array.isArray(cards) ? cards : []).forEach((query) => {
      this.findCardImages(query).forEach((cardImage) => {
        if (!cardImage?.state?.uid || seen.has(cardImage.state.uid)) {
          return;
        }
        seen.add(cardImage.state.uid);
        if (cardImage.__announcementFlashTimer) {
          clearTimeout(cardImage.__announcementFlashTimer);
        }
        setFieldCardImageState(cardImage, {
          flashCover: true
        });
        cardImage.__announcementFlashTimer = setTimeout(() => {
          setFieldCardImageState(cardImage, {
            flashCover: void 0
          });
          cardImage.__announcementFlashTimer = null;
          this.store.emit({ action: "RENDER" });
        }, visibleDuration);
      });
    });
    if (seen.size) {
      this.store.emit({ action: "RENDER" });
    }
  },
  pulseBattleOverlay(source, target, duration = 700) {
    const pulse = (query, role) => {
      this.findCardImages(query).forEach((cardImage) => {
        if (cardImage.__battlePulseTimer) {
          clearTimeout(cardImage.__battlePulseTimer);
        }
        setFieldCardImageState(cardImage, {
          battlePulse: role
        });
        cardImage.__battlePulseTimer = setTimeout(() => {
          setFieldCardImageState(cardImage, {
            battlePulse: void 0
          });
          cardImage.__battlePulseTimer = null;
          this.store.emit({ action: "RENDER" });
        }, duration);
      });
    };
    pulse(source, "source");
    pulse(target, "target");
    this.store.emit({ action: "RENDER" });
  },
  setPileCommandHints(hints = []) {
    const activeHints = new Set(
      (Array.isArray(hints) ? hints : []).filter((hint) => hint?.location).map((hint) => `${Number(hint.player ?? 0)}:${hint.location}`)
    );
    let changed = false;
    Object.values(this.state.cards).forEach((cardImage) => {
      const state = cardImage?.state;
      if (!state?.location) {
        return;
      }
      const shouldHint = activeHints.has(
        `${Number(state.player ?? 0)}:${state.location}`
      );
      if (shouldHint) {
        if (!state.commandHintPulse) {
          setFieldCardImageState(cardImage, {
            commandHintPulse: true
          });
          changed = true;
        }
        return;
      }
      if (state.commandHintPulse) {
        setFieldCardImageState(cardImage, {
          commandHintPulse: void 0
        });
        changed = true;
      }
    });
    if (changed) {
      this.store.emit({ action: "RENDER" });
    }
  },
  setActionSpinners(hints = []) {
    const activeHints = new Set(
      (Array.isArray(hints) ? hints : []).filter((hint) => hint?.location).map(
        (hint) => this.getActionSpinnerKey(
          Number(hint.player ?? 0),
          this.normalizeActionSpinnerLocation(hint.location),
          Number.isInteger(Number(hint.index)) ? Number(hint.index) : null
        )
      )
    );
    let changed = false;
    const nextActionSpinners = {
      ...this.state.actionSpinners
    };
    Object.keys(this.state.actionSpinners).forEach((key) => {
      const shouldEnable = activeHints.has(key);
      if (this.state.actionSpinners[key] !== shouldEnable) {
        nextActionSpinners[key] = shouldEnable;
        changed = true;
      }
    });
    if (changed) {
      this.state = {
        ...this.state,
        actionSpinners: nextActionSpinners
      };
      this.store.emit({ action: "RENDER" });
    }
  },
  getStackCards(query) {
    const normalized = normalizeFieldQuery(query);
    if (!normalized) {
      return [];
    }
    return Object.values(this.state.cards).filter(
      (cardImage) => cardImage?.state?.player === normalized.player && cardImage?.state?.location === normalized.location && cardImage?.state?.index === normalized.index
    ).sort(
      (first, second) => Number(first?.state?.overlayindex || 0) - Number(second?.state?.overlayindex || 0)
    );
  },
  getStackHost(query) {
    const host = this.getStackCards(query).find(
      (cardImage) => Number(cardImage?.state?.overlayindex || 0) === 0
    );
    return host?.state ? Object.assign({}, host.state) : null;
  },
  getOverlayViewerDeck(query) {
    return this.getStackCards(query).filter((cardImage) => Number(cardImage?.state?.overlayindex || 0) > 0).map((cardImage, materialIndex) => ({
      id: cardImage.state.id,
      uid: cardImage.state.uid,
      player: cardImage.state.player,
      location: "OVERLAY",
      index: materialIndex,
      type: cardImage.state.type,
      setcode: cardImage.state.setcode,
      position: cardImage.state.position,
      status: "revealed",
      name: cardImage.state.name,
      overlayindex: cardImage.state.overlayindex,
      hostLocation: cardImage.state.location,
      hostIndex: cardImage.state.index
    }));
  },
  disableSelection() {
    disableFieldSelection(this.state.selectors);
  },
  select(query) {
    selectFieldZones(this.state.selectors, query);
  },
  phase(value) {
    updatePhaseIndicator(this.state.phase, {
      phase: normalizePhaseIndicatorUpdate(value),
      battlephase: void 0,
      mainphase2: void 0,
      endphase: void 0
    });
  },
  getDeck(player, location) {
    return this.fieldStateService.getDeck(this, player, location);
  },
  dispose() {
    this.fadeCleanupTimers.forEach((timer) => clearTimeout(timer));
    this.fadeCleanupTimers.clear();
    Object.values(this.state.cards).forEach((cardImage) => {
      if (cardImage?.__enterFadeTimer) {
        clearTimeout(cardImage.__enterFadeTimer);
        cardImage.__enterFadeTimer = null;
      }
      if (cardImage?.__selectionPulseTimer) {
        clearTimeout(cardImage.__selectionPulseTimer);
        cardImage.__selectionPulseTimer = null;
      }
      if (cardImage?.__targetPulseTimer) {
        clearTimeout(cardImage.__targetPulseTimer);
        cardImage.__targetPulseTimer = null;
      }
      if (cardImage?.__announcementFlashTimer) {
        clearTimeout(cardImage.__announcementFlashTimer);
        cardImage.__announcementFlashTimer = null;
      }
      if (cardImage?.__battlePulseTimer) {
        clearTimeout(cardImage.__battlePulseTimer);
        cardImage.__battlePulseTimer = null;
      }
    });
    this.state = {
      ...this.state,
      fadeCards: {}
    };
  }
};
function FieldState(state = {}, store2, databaseSystem = [], dependencies = {}) {
  const controller = {
    store: store2,
    databaseSystem,
    hoveredRelationSource: null,
    fieldPrimed: false,
    fadeCleanupTimers: /* @__PURE__ */ new Set(),
    viewport: dependencies.viewport || defaultFieldViewport,
    fieldStateService: dependencies.fieldStateService || defaultDuelFieldStateService,
    setCardImageState: setFieldCardImageState
  };
  Object.assign(controller, fieldMethods);
  controller.state = {
    cards: {},
    fadeCards: {},
    pileSnapshots: {},
    actionSpinners: controller.createActionSpinnerState(),
    disabledZones: controller.createFieldDisabledState(),
    phase: {
      store: store2,
      state: {
        opponentTurn: false,
        phase: normalizePhaseIndicatorUpdate(state?.info?.phase),
        battlephase: void 0,
        mainphase2: void 0,
        endphase: void 0
      }
    },
    selectors: {
      store: store2,
      state: {
        activeZones: []
      }
    }
  };
  controller.replaceField(state?.field || {});
  return controller;
}
function Field(state, store2, databaseSystem = []) {
  return FieldState(state, store2, databaseSystem);
}

// server/ui/components/duel/cardinfo.component.jsx
var import_react17 = __toESM(require("react"), 1);

// server/ui/components/duel/cardinfo.component.module.scss
var cardinfo_component_module_default = ".root {}\n";

// server/ui/components/duel/cardinfo.component.jsx
var attributeMap = {
  1: "EARTH",
  2: "WATER",
  4: "FIRE",
  8: "WIND",
  16: "LIGHT",
  32: "DARK",
  64: "DIVINE"
};
var stMap = {
  2: "",
  4: "",
  130: " / Ritual",
  65538: " / Quick-Play",
  131074: " / Continuous",
  131076: " / Continuous",
  262146: " / Equip",
  524290: " / Field",
  1048580: " / Counter"
};
var fieldspell = {
  524290: " / Field"
};
var monsterMap = {
  17: "Normal",
  33: "Effect",
  65: "Fusion",
  97: "Fusion / Effect",
  129: "Ritual",
  161: "Ritual / Effect",
  545: "Spirit",
  673: "Ritual / Spirit / Effect",
  1057: "Union",
  2081: "Gemini / Effect",
  4113: "Tuner",
  4129: "Tuner / Effect",
  4161: "Fusion / Tuner",
  8193: "Synchro",
  8225: "Synchro / Effect",
  12321: "Synchro / Tuner / Effect",
  16401: "Token",
  2097185: "Flip / Effect",
  2101281: "Flip / Tuner / Effect",
  4194337: "Toon / Effect",
  8388609: "Xyz",
  8388641: "Xyz / Effect",
  16777233: "Pendulum / Normal",
  16777249: "Pendulum / Effect",
  16777313: "Fusion / Pendulum / Effect",
  16781313: "Pendulum / Tuner / Normal",
  16781345: "Pendulum / Tuner / Effect",
  16785441: "Synchro / Pendulum / Effect",
  18874401: "Pendulum / Flip / Effect",
  25165857: "Xyz / Pendulum / Effect",
  33554465: "Link / Effect",
  67108865: "Link"
};
var pendulumMap = {
  16777233: "Pendulum",
  16777249: "Pendulum / Effect",
  16777313: "Fusion / Pendulum / Effect",
  16781313: "Pendulum / Tuner / Normal",
  16781345: "Pendulum / Tuner / Effect",
  16785441: "Synchro / Pendulum / Effect",
  18874401: "Pendulum / Flip / Effect",
  25165857: "Xyz / Pendulum / Effect"
};
var raceMap = {
  1: "Warrior",
  2: "Spellcaster",
  4: "Fairy",
  8: "Fiend",
  16: "Zombie",
  32: "Machine",
  64: "Aqua",
  128: "Pyro",
  256: "Rock",
  512: "Winged-Beast",
  1024: "Plant",
  2048: "Insect",
  4096: "Thunder",
  8192: "Dragon",
  16384: "Beast",
  32768: "Beast-Warrior",
  65536: "Dinosaur",
  131072: "Fish",
  262144: "Sea-Serpent",
  524288: "Reptile",
  1048576: "Psychic",
  2097152: "Divine-Beast",
  4194304: "Creator God",
  8388608: "Wyrm",
  16777216: "Cyberse"
};
function parseLevelScales(card) {
  let output = "\r\n";
  const ranklevel = cardIs("xyz", card) ? "\xE2\u02DC\u2020 Rank " : "\xE2\u02DC\u2026 Level ";
  if (cardIs("link", card)) {
    return `${output} LINK-${card.level}`;
  }
  if (card.level > 0 && card.level <= 12) {
    return `${output}${ranklevel}${card.level}`;
  }
  const leftScale = card.level >> 24 & 255, pendulumLevel = card.level & 255;
  output += `${ranklevel}${pendulumLevel}</span> <span class="scales">\xE2\xAC\u2013 Scale ${leftScale}`;
  return output;
}
function parseAtkDef(atk, def) {
  return (atk < 0 ? "ATK ?" : `ATK ${atk}`) + " / " + (def < 0 && def !== "-" ? "DEF ?" : `DEF ${def}`);
}
function CardTyping({ targetCard }) {
  if (cardIs("monster", targetCard)) {
    return /* @__PURE__ */ import_react17.default.createElement("span", { className: "monstDesc" }, `[ Monster / ${monsterMap[targetCard.type]} ]
            ${raceMap[targetCard.race]} / ${attributeMap[targetCard.attribute]}
            [ ${parseLevelScales(targetCard)}
            ${parseAtkDef(targetCard.atk, targetCard.def)}`);
  }
  if (cardIs("spell", targetCard)) {
    return /* @__PURE__ */ import_react17.default.createElement("span", { className: "spellDesc" }, `[ Spell ${stMap[targetCard.type] || ""} ]`);
  }
  if (cardIs("trap", targetCard)) {
    return /* @__PURE__ */ import_react17.default.createElement("span", { className: "trapDesc" }, `[ Trap ${stMap[targetCard.type] || ""} ]`);
  }
  return /* @__PURE__ */ import_react17.default.createElement("span", null);
}
function CardDescription({ targetCard }) {
  if (!targetCard || !targetCard.id) {
    return null;
  }
  return /* @__PURE__ */ import_react17.default.createElement(import_react17.default.Fragment, null, /* @__PURE__ */ import_react17.default.createElement("div", { className: "descContainer" }, /* @__PURE__ */ import_react17.default.createElement("div", { className: "cardName" }, `${targetCard.name} [${targetCard.id}]`)), /* @__PURE__ */ import_react17.default.createElement("br", null), /* @__PURE__ */ import_react17.default.createElement("span", { className: "description" }, /* @__PURE__ */ import_react17.default.createElement(CardTyping, { targetCard })), /* @__PURE__ */ import_react17.default.createElement("br", null), /* @__PURE__ */ import_react17.default.createElement("div", { className: "description" }, targetCard.desc));
}
function CardInfoView({ id, info }) {
  const src = getCardImageUrl(id);
  return /* @__PURE__ */ import_react17.default.createElement("div", { className: cardinfo_component_module_default.root }, /* @__PURE__ */ import_react17.default.createElement("div", { className: "cardImage" }, src ? /* @__PURE__ */ import_react17.default.createElement(AppImage, { className: "imgContainer", src, alt: info?.name || "Card image", fallbackSrc: "img/textures/unknown.jpg", width: 421, height: 614, sizes: "(max-width: 768px) 50vw, 421px", style: { width: "auto", height: "100%" } }) : null), /* @__PURE__ */ import_react17.default.createElement("div", { className: "cardDescription" }, /* @__PURE__ */ import_react17.default.createElement(CardDescription, { targetCard: info })));
}
function MountedCardInfo({ controller }) {
  if (!controller) {
    return null;
  }
  return /* @__PURE__ */ import_react17.default.createElement(
    CardInfoView,
    {
      id: controller.id,
      info: controller.info
    }
  );
}
function updateCardInfo(controller, { id }) {
  controller.id = id;
  controller.info = controller.databaseSystem.find((entry) => entry.id === id) || {};
  return controller.info;
}
function disposeCardInfo(controller) {
  return controller;
}
function createCardInfoController(databaseSystem = []) {
  const controller = {
    databaseSystem,
    id: void 0,
    info: {}
  };
  controller.update = ({ id }) => updateCardInfo(controller, { id });
  controller.dispose = () => disposeCardInfo(controller);
  return controller;
}
function CardInfo(databaseSystem = []) {
  return createCardInfoController(databaseSystem);
}

// server/ui/components/duel/lifepoint.component.jsx
var import_react18 = __toESM(require("react"), 1);

// server/ui/components/duel/lifepoint.component.module.scss
var lifepoint_component_module_default = ".root {\n}\n";

// server/ui/components/duel/lifepoint.component.jsx
function createLifepointState(state = {}) {
  const nextState = Object.assign({
    lifepoints: [8e3, 8e3],
    turn: 1,
    names: ["Player 1", "Player 2"],
    lpDeltas: {
      0: void 0,
      1: void 0
    },
    playerHints: {
      0: [],
      1: []
    },
    waiting: false
  }, state);
  return {
    ...nextState,
    maxLifepoints: Math.max(
      Number(nextState?.lifepoints?.[0]) || 0,
      Number(nextState?.lifepoints?.[1]) || 0,
      Number(nextState?.maxLifepoints || 0),
      8e3
    )
  };
}
function resolveLifepointStore(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function resolveLifepointController(target) {
  if (target?.state || target?.waiting !== void 0) {
    return target;
  }
  return target?.controller;
}
function normalizeLifepointUpdate(current, update = {}) {
  const nextState = {
    ...current,
    ...update,
    lpDeltas: update.lpDeltas || current.lpDeltas || {
      0: void 0,
      1: void 0
    },
    playerHints: update.playerHints || current.playerHints || {
      0: [],
      1: []
    }
  }, nextMax = Math.max(
    Number(nextState?.lifepoints?.[0]) || 0,
    Number(nextState?.lifepoints?.[1]) || 0,
    Number(current?.maxLifepoints || 0),
    8e3
  );
  return {
    ...nextState,
    maxLifepoints: nextMax
  };
}
function LifepointSlot({ player, value, ratio, delta, name, hints }) {
  return /* @__PURE__ */ import_react18.default.createElement("div", { className: `lp-slot p${player}`, key: `lp-slot-${player}` }, /* @__PURE__ */ import_react18.default.createElement("div", { className: "lp-shell" }, /* @__PURE__ */ import_react18.default.createElement("div", { className: "lp-track" }, /* @__PURE__ */ import_react18.default.createElement("div", { className: "lp-fill", style: { width: `${ratio * 100}%` } })), /* @__PURE__ */ import_react18.default.createElement("div", { className: "lp-value" }, value), delta ? /* @__PURE__ */ import_react18.default.createElement("div", { className: `lp-delta ${delta.tone || "damage"}` }, delta.value > 0 ? `+${delta.value}` : `${delta.value}`) : null), /* @__PURE__ */ import_react18.default.createElement("div", { className: "lp-name" }, name), hints.map((hint, index) => /* @__PURE__ */ import_react18.default.createElement("div", { className: "lp-hint", key: `lp-hint-${player}-${index}` }, hint)));
}
function getLifepoints(state, player) {
  const value = state?.lifepoints?.[player];
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}
function getPlayerName(state, player) {
  const value = state?.names?.[player];
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return `Player ${player + 1}`;
}
function getTurnCount(state) {
  const turn = Number(state?.turn);
  return Number.isFinite(turn) ? Math.max(1, turn) : 1;
}
function getPlayerHints(state, player) {
  const hints = state?.playerHints?.[player];
  return Array.isArray(hints) ? hints.filter(Boolean) : [];
}
function getDelta(state, player) {
  return state?.lpDeltas?.[player] || void 0;
}
function getLifepointRatio(state, player) {
  const maxLifepoints = Number(state?.maxLifepoints || 0), value = getLifepoints(state, player);
  return maxLifepoints > 0 ? Math.max(0, Math.min(1, value / maxLifepoints)) : 0;
}
function clearDeltaTimers(timerRefs) {
  Object.values(timerRefs.current || {}).forEach((timer) => {
    if (timer) {
      clearTimeout(timer);
    }
  });
  timerRefs.current = {};
}
function updateLifepointState(target, state) {
  const controller = resolveLifepointController(target), resolvedStore = resolveLifepointStore(target);
  if (!controller || !state) {
    return;
  }
  const currentState = createLifepointState({
    ...controller.state || {},
    waiting: Boolean(controller.waiting),
    maxLifepoints: controller.maxLifepoints
  });
  const nextState = normalizeLifepointUpdate(currentState, state);
  controller.state = {
    lifepoints: nextState.lifepoints,
    turn: nextState.turn,
    names: nextState.names,
    lpDeltas: nextState.lpDeltas,
    playerHints: nextState.playerHints
  };
  controller.maxLifepoints = nextState.maxLifepoints;
  resolvedStore?.emit?.({
    action: "UPDATE_LIFEPOINTS",
    state: nextState
  });
}
function setLifepointWaiting(target, active) {
  const controller = resolveLifepointController(target), resolvedStore = resolveLifepointStore(target), waiting = Boolean(active);
  if (controller) {
    controller.waiting = waiting;
  }
  resolvedStore?.emit?.({
    action: "SET_LIFEPOINT_WAITING",
    active: waiting
  });
  resolvedStore?.emit?.({
    action: "RENDER"
  });
}
function pulseLifepointDelta(target, player, value, tone = "damage", duration = 1300) {
  const controller = resolveLifepointController(target), resolvedStore = resolveLifepointStore(target), numericPlayer = Number(player || 0), numericValue = Number(value || 0);
  if (!controller || !numericValue) {
    return;
  }
  const nextDeltas = Object.assign({}, controller.state?.lpDeltas || {});
  nextDeltas[numericPlayer] = {
    value: numericValue,
    tone,
    token: Date.now()
  };
  controller.state.lpDeltas = nextDeltas;
  resolvedStore?.emit?.({
    action: "PULSE_LIFEPOINT_DELTA",
    state: {
      player: numericPlayer,
      value: numericValue,
      tone,
      duration: Math.max(500, Number(duration || 1300)),
      token: Date.now()
    }
  });
}
function disposeLifepointState(target) {
  const controller = resolveLifepointController(target), resolvedStore = resolveLifepointStore(target);
  if (controller) {
    controller.waiting = false;
    if (controller.state) {
      controller.state.lpDeltas = {
        0: void 0,
        1: void 0
      };
    }
  }
  resolvedStore?.emit?.({
    action: "RESET_LIFEPOINTS"
  });
}
function LifepointDisplayView({ state }) {
  if (!state) {
    return null;
  }
  return /* @__PURE__ */ import_react18.default.createElement("div", { className: `lp-layout ${lifepoint_component_module_default.root}` }, /* @__PURE__ */ import_react18.default.createElement(
    LifepointSlot,
    {
      player: 0,
      value: getLifepoints(state, 0),
      ratio: getLifepointRatio(state, 0),
      delta: getDelta(state, 0),
      name: getPlayerName(state, 0),
      hints: getPlayerHints(state, 0)
    }
  ), /* @__PURE__ */ import_react18.default.createElement("div", { className: "turncount" }, getTurnCount(state)), /* @__PURE__ */ import_react18.default.createElement(
    LifepointSlot,
    {
      player: 1,
      value: getLifepoints(state, 1),
      ratio: getLifepointRatio(state, 1),
      delta: getDelta(state, 1),
      name: getPlayerName(state, 1),
      hints: getPlayerHints(state, 1)
    }
  ));
}
function MountedLifepointDisplay({ controller, store: store2 }) {
  const resolvedStore = resolveLifepointStore(store2 || controller), initialControllerState = controller ? createLifepointState({
    ...controller.state || {},
    waiting: Boolean(controller.waiting),
    maxLifepoints: controller.maxLifepoints
  }) : createLifepointState(), [state, setState] = (0, import_react18.useState)(initialControllerState), deltaTimersRef = (0, import_react18.useRef)({});
  (0, import_react18.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const resetState = () => {
      clearDeltaTimers(deltaTimersRef);
      setState(createLifepointState());
    }, unsubscribeUpdate = resolvedStore.on("UPDATE_LIFEPOINTS", (message) => {
      setState((current) => normalizeLifepointUpdate(current, message?.state || {}));
    }), unsubscribeWaiting = resolvedStore.on("SET_LIFEPOINT_WAITING", (message) => {
      setState((current) => ({
        ...current,
        waiting: Boolean(message?.active)
      }));
    }), unsubscribePulse = resolvedStore.on("PULSE_LIFEPOINT_DELTA", (message) => {
      const payload = message?.state || {}, numericPlayer = Number(payload.player || 0), duration = Math.max(500, Number(payload.duration || 1300));
      if (deltaTimersRef.current[numericPlayer]) {
        clearTimeout(deltaTimersRef.current[numericPlayer]);
      }
      setState((current) => ({
        ...current,
        lpDeltas: {
          ...current.lpDeltas || {},
          [numericPlayer]: {
            value: Number(payload.value || 0),
            tone: payload.tone || "damage",
            token: payload.token || Date.now()
          }
        }
      }));
      deltaTimersRef.current[numericPlayer] = setTimeout(() => {
        deltaTimersRef.current[numericPlayer] = null;
        setState((current) => ({
          ...current,
          lpDeltas: {
            ...current.lpDeltas || {},
            [numericPlayer]: void 0
          }
        }));
      }, duration);
    }), unsubscribeReset = resolvedStore.on("RESET_LIFEPOINTS", () => {
      resetState();
    });
    return () => {
      unsubscribeUpdate?.();
      unsubscribeWaiting?.();
      unsubscribePulse?.();
      unsubscribeReset?.();
      resetState();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react18.default.createElement(LifepointDisplayView, { state });
}
function LifepointDisplay(props) {
  return /* @__PURE__ */ import_react18.default.createElement(MountedLifepointDisplay, { ...props });
}

// server/ui/components/duel/announce.card.component.jsx
var import_react19 = __toESM(require("react"), 1);

// server/ui/services/announce-card.service.js
var ANNOUNCE_CARD_OPCODE = {
  ADD: "ADD",
  SUB: "SUB",
  MUL: "MUL",
  DIV: "DIV",
  AND: "AND",
  OR: "OR",
  NEG: "NEG",
  NOT: "NOT",
  BAND: "BAND",
  BOR: "BOR",
  BNOT: "BNOT",
  BXOR: "BXOR",
  LSHIFT: "LSHIFT",
  RSHIFT: "RSHIFT",
  ALLOW_ALIASES: "ALLOW_ALIASES",
  ALLOW_TOKENS: "ALLOW_TOKENS",
  ISCODE: "ISCODE",
  ISSETCARD: "ISSETCARD",
  ISTYPE: "ISTYPE",
  ISRACE: "ISRACE",
  ISATTRIBUTE: "ISATTRIBUTE",
  GETCODE: "GETCODE",
  GETSETCARD: "GETSETCARD",
  GETTYPE: "GETTYPE",
  GETRACE: "GETRACE",
  GETATTRIBUTE: "GETATTRIBUTE"
};
var OCG_TYPE_MONSTER = 1;
var OCG_TYPE_TOKEN = 16384;
var CARD_MARINE_DOLPHIN = 78734254;
var CARD_TWINKLE_MOSS = 13857930;
function normalizeOpcodeValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim().length) {
    const trimmed = value.trim();
    if (Object.values(ANNOUNCE_CARD_OPCODE).includes(trimmed)) {
      return trimmed;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : trimmed;
  }
  return 0;
}
function divideDecimalString(value, divisor) {
  let quotient = "", remainder = 0;
  for (const char of String(value)) {
    const digit = Number(char);
    if (!Number.isFinite(digit)) {
      continue;
    }
    const current = remainder * 10 + digit, nextDigit = Math.floor(current / divisor);
    remainder = current % divisor;
    if (quotient.length || nextDigit !== 0) {
      quotient += String(nextDigit);
    }
  }
  return {
    quotient: quotient || "0",
    remainder
  };
}
function decodeSetcodes(setcode) {
  if (Array.isArray(setcode)) {
    return setcode.map((value) => Number(value) || 0);
  }
  if (setcode === void 0 || setcode === null || setcode === "" || setcode === 0) {
    return [];
  }
  const normalized = String(setcode).trim();
  if (!/^\d+$/.test(normalized)) {
    return [];
  }
  let working = normalized, output = [];
  while (working !== "0") {
    const division = divideDecimalString(working, 65536);
    if (division.remainder) {
      output.push(division.remainder);
    }
    working = division.quotient;
  }
  return output;
}
function toSearchKey(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}
function normalizeDatabaseCard(card) {
  if (!card) {
    return null;
  }
  return {
    code: Number(card.id ?? card.code ?? 0),
    alias: Number(card.alias ?? 0),
    setcodes: decodeSetcodes(card.setcode ?? card.setcodes),
    type: Number(card.type ?? 0),
    race: Number(card.race ?? 0),
    attribute: Number(card.attribute ?? 0),
    name: String(card.name || card.code || ""),
    searchName: toSearchKey(card.name || card.code || "")
  };
}
function cardMatchesAnnounceOpcode(card, opcodes) {
  const normalizedCard = normalizeDatabaseCard(card), normalizedOpcodes = Array.isArray(opcodes) ? opcodes.map(normalizeOpcodeValue) : [];
  if (!normalizedCard) {
    return false;
  }
  const stack = [];
  let allowAliases = false;
  let allowTokens = false;
  for (const opcode of normalizedOpcodes) {
    switch (opcode) {
      case ANNOUNCE_CARD_OPCODE.ADD: {
        if (stack.length >= 2) {
          const rhs = stack.pop();
          const lhs = stack.pop();
          stack.push(lhs + rhs);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.SUB: {
        if (stack.length >= 2) {
          const rhs = stack.pop();
          const lhs = stack.pop();
          stack.push(lhs - rhs);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.MUL: {
        if (stack.length >= 2) {
          const rhs = stack.pop();
          const lhs = stack.pop();
          stack.push(lhs * rhs);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.DIV: {
        if (stack.length >= 2) {
          const rhs = stack.pop();
          const lhs = stack.pop();
          stack.push(rhs === 0 ? 0 : Math.trunc(lhs / rhs));
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.AND: {
        if (stack.length >= 2) {
          const rhs = stack.pop();
          const lhs = stack.pop();
          stack.push(lhs !== 0 && rhs !== 0 ? 1 : 0);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.OR: {
        if (stack.length >= 2) {
          const rhs = stack.pop();
          const lhs = stack.pop();
          stack.push(lhs !== 0 || rhs !== 0 ? 1 : 0);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.NEG: {
        if (stack.length >= 1) {
          stack.push(-stack.pop());
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.NOT: {
        if (stack.length >= 1) {
          stack.push(stack.pop() !== 0 ? 0 : 1);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.BAND: {
        if (stack.length >= 2) {
          const rhs = stack.pop();
          const lhs = stack.pop();
          stack.push(lhs & rhs);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.BOR: {
        if (stack.length >= 2) {
          const rhs = stack.pop();
          const lhs = stack.pop();
          stack.push(lhs | rhs);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.BNOT: {
        if (stack.length >= 1) {
          stack.push(~stack.pop());
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.BXOR: {
        if (stack.length >= 2) {
          const rhs = stack.pop();
          const lhs = stack.pop();
          stack.push(lhs ^ rhs);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.LSHIFT: {
        if (stack.length >= 2) {
          const rhs = stack.pop();
          const lhs = stack.pop();
          stack.push(lhs << rhs);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.RSHIFT: {
        if (stack.length >= 2) {
          const rhs = stack.pop();
          const lhs = stack.pop();
          stack.push(lhs >> rhs);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.ALLOW_ALIASES:
        allowAliases = true;
        break;
      case ANNOUNCE_CARD_OPCODE.ALLOW_TOKENS:
        allowTokens = true;
        break;
      case ANNOUNCE_CARD_OPCODE.ISCODE: {
        if (stack.length >= 1) {
          stack.push(normalizedCard.code === stack.pop() ? 1 : 0);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.ISSETCARD: {
        if (stack.length >= 1) {
          const setCode = Number(stack.pop()), setType = setCode & 4095, setSubType = setCode & 61440;
          let result = 0;
          for (const set of normalizedCard.setcodes) {
            if ((set & 4095) === setType && (set & 61440 & setSubType) === setSubType) {
              result = 1;
              break;
            }
          }
          stack.push(result);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.ISTYPE: {
        if (stack.length >= 1) {
          stack.push((normalizedCard.type & stack.pop()) !== 0 ? 1 : 0);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.ISRACE: {
        if (stack.length >= 1) {
          stack.push((normalizedCard.race & stack.pop()) !== 0 ? 1 : 0);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.ISATTRIBUTE: {
        if (stack.length >= 1) {
          stack.push((normalizedCard.attribute & stack.pop()) !== 0 ? 1 : 0);
        }
        break;
      }
      case ANNOUNCE_CARD_OPCODE.GETCODE:
        stack.push(normalizedCard.code);
        break;
      case ANNOUNCE_CARD_OPCODE.GETTYPE:
        stack.push(normalizedCard.type);
        break;
      case ANNOUNCE_CARD_OPCODE.GETRACE:
        stack.push(normalizedCard.race);
        break;
      case ANNOUNCE_CARD_OPCODE.GETATTRIBUTE:
        stack.push(normalizedCard.attribute);
        break;
      default:
        stack.push(opcode);
        break;
    }
  }
  if (stack.length !== 1 || stack[0] === 0) {
    return false;
  }
  if (normalizedCard.code === CARD_MARINE_DOLPHIN || normalizedCard.code === CARD_TWINKLE_MOSS) {
    return true;
  }
  if (!allowAliases && normalizedCard.alias !== 0) {
    return false;
  }
  if (!allowTokens) {
    return (normalizedCard.type & (OCG_TYPE_MONSTER | OCG_TYPE_TOKEN)) !== (OCG_TYPE_MONSTER | OCG_TYPE_TOKEN);
  }
  return true;
}
function buildAnnounceCardChoices(database, opcodes, searchText = "", limit = 60) {
  const cards = Array.isArray(database) ? database : [], normalizedSearch = toSearchKey(searchText).trim();
  if (/^\d+$/.test(normalizedSearch)) {
    const match = cards.find((card) => Number(card?.id ?? card?.code ?? 0) === Number(normalizedSearch));
    if (match && cardMatchesAnnounceOpcode(match, opcodes)) {
      return [{
        id: Number(match.id ?? match.code),
        label: `${match.name} (${match.id ?? match.code})`,
        name: match.name,
        code: Number(match.id ?? match.code)
      }];
    }
    return [];
  }
  const exactMatches = [], partialMatches = [];
  for (const card of cards) {
    if (!cardMatchesAnnounceOpcode(card, opcodes)) {
      continue;
    }
    const name = String(card?.name || ""), searchName = toSearchKey(name);
    if (normalizedSearch && !searchName.includes(normalizedSearch)) {
      continue;
    }
    const row = {
      id: Number(card.id ?? card.code),
      label: `${name} (${card.id ?? card.code})`,
      name,
      code: Number(card.id ?? card.code)
    };
    if (normalizedSearch && searchName === normalizedSearch) {
      exactMatches.push(row);
    } else {
      partialMatches.push(row);
    }
    if (exactMatches.length + partialMatches.length >= limit * 2) {
      break;
    }
  }
  return exactMatches.concat(partialMatches).slice(0, limit);
}

// server/ui/components/duel/announce.card.component.module.scss
var announce_card_component_module_default = ".root {\n}\n";

// server/ui/components/duel/announce.card.component.jsx
function createEmptyAnnounceCardDialogState() {
  return {
    active: false,
    query: "",
    opcodes: [],
    selectedCode: void 0
  };
}
function resolveDialogStore6(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerAnnounceCardDialog(target, state) {
  resolveDialogStore6(target)?.emit?.({
    action: "OPEN_ANNOUNCE_CARD_DIALOG",
    state: {
      ...createEmptyAnnounceCardDialogState(),
      opcodes: Array.isArray(state?.opcodes) ? state.opcodes.slice() : [],
      active: true
    }
  });
}
function closeAnnounceCardDialog(target) {
  resolveDialogStore6(target)?.emit?.({ action: "CLOSE_ANNOUNCE_CARD_DIALOG" });
}
function submitAnnounceCardDialog(store2, state, closeDialog) {
  if (!Number.isInteger(state.selectedCode)) {
    return;
  }
  const answer = createAnnounceCardAnswer(state.selectedCode);
  closeDialog();
  store2?.emit?.({
    action: "ANNOUNCE_SELECTION_CLICK",
    answer
  });
}
function AnnounceCardDialogView({ state, options, onQueryChange, onSelectOption, onSubmit }) {
  if (!state?.active) {
    return null;
  }
  return /* @__PURE__ */ import_react19.default.createElement(
    "div",
    {
      id: "announcecardbox",
      className: announce_card_component_module_default.root,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
      }
    },
    /* @__PURE__ */ import_react19.default.createElement("label", { htmlFor: "announcecardinput" }, "Declare a card"),
    /* @__PURE__ */ import_react19.default.createElement(
      "input",
      {
        id: "announcecardinput",
        type: "text",
        value: state.query,
        placeholder: "Type a card name or passcode",
        onChange: onQueryChange
      }
    ),
    /* @__PURE__ */ import_react19.default.createElement(
      "div",
      {
        id: "announcecardresults",
        style: {
          display: "flex",
          flexDirection: "column",
          maxHeight: "16rem",
          overflowY: "auto"
        }
      },
      options.length ? options.map((option) => /* @__PURE__ */ import_react19.default.createElement(
        "button",
        {
          type: "button",
          key: option.code,
          id: `announcecardresult-${option.code}`,
          onClick: () => onSelectOption(option),
          style: {
            fontWeight: option.code === state.selectedCode ? "bold" : "normal"
          }
        },
        option.label
      )) : /* @__PURE__ */ import_react19.default.createElement("div", { id: "announcecardempty" }, "No declarable cards found.")
    ),
    /* @__PURE__ */ import_react19.default.createElement(
      "button",
      {
        id: "announcecardconfirm",
        disabled: !Number.isInteger(state.selectedCode),
        onClick: onSubmit
      },
      "Confirm"
    )
  );
}
function AnnounceCardDialog({ controller, store: store2, database }) {
  const resolvedStore = resolveDialogStore6(store2 || controller), [state, setState] = (0, import_react19.useState)(createEmptyAnnounceCardDialogState), options = (0, import_react19.useMemo)(() => {
    const nextOptions = buildAnnounceCardChoices(
      Array.isArray(database) ? database : [],
      state.opcodes,
      state.query
    );
    return nextOptions;
  }, [database, state.opcodes, state.query]);
  (0, import_react19.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const closeDialog = () => {
      setState(createEmptyAnnounceCardDialogState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_ANNOUNCE_CARD_DIALOG", (message) => {
      setState({
        ...createEmptyAnnounceCardDialogState(),
        ...message?.state || {},
        active: true
      });
    }), unsubscribeClose = resolvedStore.on("CLOSE_ANNOUNCE_CARD_DIALOG", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  (0, import_react19.useEffect)(() => {
    if (!state.active) {
      return;
    }
    if (!options.some((option) => option.code === state.selectedCode)) {
      setState((current) => ({
        ...current,
        selectedCode: options[0]?.code ?? void 0
      }));
    }
  }, [options, state.active, state.selectedCode]);
  return /* @__PURE__ */ import_react19.default.createElement(
    AnnounceCardDialogView,
    {
      state,
      options,
      onQueryChange: (event) => {
        setState((current) => ({
          ...current,
          query: event?.target?.value || ""
        }));
      },
      onSelectOption: (option) => {
        setState((current) => ({
          ...current,
          selectedCode: option?.code ?? void 0
        }));
        if (Number.isInteger(option?.code)) {
          resolvedStore?.emit?.({
            action: "ANNOUNCE_CARD_PREVIEW",
            id: option.code
          });
        }
      },
      onSubmit: () => submitAnnounceCardDialog(resolvedStore, state, () => setState(createEmptyAnnounceCardDialogState()))
    }
  );
}
function MountedAnnounceCardDialog(props) {
  return /* @__PURE__ */ import_react19.default.createElement(AnnounceCardDialog, { ...props });
}

// server/ui/components/duel/controls.component.jsx
var import_react20 = __toESM(require("react"), 1);

// server/ui/components/duel/controls.component.module.scss
var controls_component_module_default = ".root {}\n";

// server/ui/components/duel/controls.component.jsx
var buttonDetails = {
  activatable_cards: { text: "Activate", id: 6 },
  activates: { text: "Activate", id: 6 },
  summonable_cards: { text: "Normal Summon", id: 1 },
  summons: { text: "Normal Summon", id: 1 },
  spsummonable_cards: { text: "Special Summon", id: 2 },
  special_summons: { text: "Special Summon", id: 2 },
  repositionable_cards: { text: "Flip", id: 3 },
  pos_changes: { text: "Flip", id: 3 },
  msetable_cards: { text: "Set MZ", id: 4 },
  monster_sets: { text: "Set MZ", id: 4 },
  ssetable_cards: { text: "Set ST", id: 5 },
  spell_sets: { text: "Set ST", id: 5 },
  select_options: { text: "Select", id: 7 },
  attackable_cards: { text: "Attack", id: 8 },
  attacks: { text: "Attack", id: 8 },
  chains: { text: "Activate", id: 0 },
  view_materials: { text: "View", id: 9 },
  view_pile: { text: "View", id: 10 },
  activate_pile: { text: "Activate", id: 11 },
  spsummon_pile: { text: "Special Summon", id: 12 }
};
var commandOptionKeys = [
  "summonable_cards",
  "summons",
  "spsummonable_cards",
  "special_summons",
  "repositionable_cards",
  "pos_changes",
  "msetable_cards",
  "monster_sets",
  "ssetable_cards",
  "spell_sets",
  "activatable_cards",
  "activates",
  "select_options",
  "attackable_cards",
  "attacks",
  "chains"
];
var pileActivateOptionKeys = ["activatable_cards", "activates", "chains"];
var pileSpecialSummonOptionKeys = ["spsummonable_cards", "special_summons"];
var fieldActivateOptionKeys = ["activatable_cards", "activates", "chains"];
var viewerModeByCardType = Object.freeze({
  activate_pile: "activate",
  spsummon_pile: "spsummon",
  view_materials: "view",
  view_pile: "view"
});
function getViewerSlot(viewerSlot) {
  const fallbackViewerSlot = typeof window !== "undefined" ? window.orientation || 0 : 0, resolvedViewerSlot = viewerSlot === void 0 ? fallbackViewerSlot : viewerSlot;
  return Number.isInteger(Number(resolvedViewerSlot)) ? Number(resolvedViewerSlot) : 0;
}
function checksetcode(obj, sc) {
  "use strict";
  var val = obj.setcode, hexA = val.toString(16), hexB = sc.toString(16);
  if (val === sc || parseInt(hexA.substr(hexA.length - 4), 16) === parseInt(hexB, 16) || parseInt(hexA.substr(hexA.length - 2), 16) === parseInt(hexB, 16) || (val >> 16).toString(16) === hexB) {
    return true;
  }
  return false;
}
function excludeTokens(card) {
  if (card.type === 16401 || card.type === 16417) {
    return false;
  }
  return true;
}
function hasKnownCardIdentity(id) {
  return !(id === void 0 || id === null || id === "" || id === "unknown");
}
function setControlButtonsState(controller, nextState) {
  controller.state = {
    ...controller.state,
    ...nextState
  };
}
function setControlButtonsInfo(controller, nextInfo) {
  controller.info = {
    ...controller.info,
    ...nextInfo
  };
}
function ControlActionButton({ text, onClick, className, style }) {
  return /* @__PURE__ */ import_react20.default.createElement(
    "button",
    {
      className,
      onClick,
      style
    },
    text
  );
}
function FloatingControlPanel({ coords, className, children }) {
  return /* @__PURE__ */ import_react20.default.createElement(
    "div",
    {
      style: {
        left: `${coords.x - 15}px`,
        top: `${coords.y - 15}px`,
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        textAlign: "center"
      },
      className: [controls_component_module_default.root, className].filter(Boolean).join(" ")
    },
    children
  );
}
function ControlButtonsView({ state, info, store: store2 }) {
  if (!state || !info || !store2) {
    return null;
  }
  const list = [], query = info.target;
  if (!query) {
    return null;
  }
  if (app.manual) {
    return manualDisplayControls({ state, info, store: store2 }, query);
  }
  if (query.pile) {
    getPileActionEntriesForControls({ state }, query.deck).forEach((entry) => {
      list.push({
        ...entry,
        id: `${entry.type}-${query.player}-${query.location}`
      });
    });
    return list.length ? displayControlButtons({ state, info, store: store2 }, list) : null;
  }
  Object.keys(state).forEach((type) => {
    const options = Array.isArray(state[type]) ? state[type] : [], selectableIndex = options.findIndex((option, i) => {
      return commandOptionMatchesQuery({
        ...option,
        i,
        type
      }, query);
    });
    if (selectableIndex !== -1) {
      list.push({ type, card: query, i: selectableIndex });
    }
  });
  if (Array.isArray(query.overlayMaterials) && query.overlayMaterials.length) {
    list.push({
      type: "view_materials",
      id: `view-materials-${query.uid || query.id || query.location}-${query.index}`,
      deck: query.overlayMaterials
    });
  }
  if (!list.length) {
    return null;
  }
  return displayControlButtons({ state, info, store: store2 }, list);
}
function MountedControlButtons({ controller }) {
  return /* @__PURE__ */ import_react20.default.createElement(
    ControlButtonsView,
    {
      state: controller?.state,
      info: controller?.info,
      store: controller?.store
    }
  );
}
function resolveViewerPlayer(player, viewerSlot = getViewerSlot()) {
  const normalizedPlayer = Number(player);
  if (!Number.isInteger(normalizedPlayer)) {
    return player;
  }
  return viewerSlot ? normalizedPlayer ? 0 : 1 : normalizedPlayer;
}
function commandOptionMatchesQuery(option, query, viewerSlot = getViewerSlot()) {
  if (!option || !query) {
    return false;
  }
  const queryPlayer = query.player === void 0 ? void 0 : resolveViewerPlayer(query.player, viewerSlot);
  return option.index === query.index && option.location === query.location && (option.player === void 0 || queryPlayer === void 0 || Number(option.player) === Number(queryPlayer)) && (option.id === void 0 || !hasKnownCardIdentity(option.id) || !hasKnownCardIdentity(query.id) || option.id === query.id);
}
function cardMatchesCommandFamilies(card, commandOptions = [], commandFamilies = commandOptionKeys, viewerSlot = getViewerSlot()) {
  if (!card || !Array.isArray(commandOptions) || !commandFamilies.length) {
    return false;
  }
  return commandOptions.some(
    (option) => commandFamilies.includes(option?.type) && commandOptionMatchesQuery(option, card, viewerSlot)
  );
}
function optionMatchesPile(option, pileCard, viewerSlot = getViewerSlot()) {
  if (!option || !pileCard) {
    return false;
  }
  const pilePlayer = pileCard.player === void 0 ? void 0 : resolveViewerPlayer(pileCard.player, viewerSlot);
  return option.location === pileCard.location && (option.player === void 0 || pilePlayer === void 0 || Number(option.player) === Number(pilePlayer));
}
function annotatePileDeck(deck = [], commandOptions = [], commandFamilies = commandOptionKeys, viewerSlot = getViewerSlot()) {
  return (Array.isArray(deck) ? deck : []).map((card) => ({
    ...card,
    actionable: cardMatchesCommandFamilies(card, commandOptions, commandFamilies, viewerSlot)
  }));
}
function buildPileActionDeck(deck = [], commandOptions = [], commandFamilies = commandOptionKeys, viewerSlot = getViewerSlot()) {
  const cards = Array.isArray(deck) ? deck : [], pileCard = cards[0];
  if (!pileCard || !Array.isArray(commandOptions) || !commandFamilies.length) {
    return [];
  }
  return commandOptions.filter(
    (option) => commandFamilies.includes(option?.type) && optionMatchesPile(option, pileCard, viewerSlot)
  ).map((option) => {
    const matchedCard = cards.find((card) => commandOptionMatchesQuery(option, card, viewerSlot)) || cards.find(
      (card) => card?.location === option.location && Number(card?.index) === Number(option.index)
    ), resolvedId = hasKnownCardIdentity(option?.id) ? option.id : matchedCard?.id, viewerAnswer = {
      type: option.type,
      i: option.i
    };
    return {
      ...pileCard || {},
      ...matchedCard || {},
      ...resolvedId !== void 0 ? { id: resolvedId } : {},
      player: matchedCard?.player ?? pileCard.player,
      location: matchedCard?.location || pileCard.location,
      index: matchedCard?.index ?? option.index,
      actionable: true,
      viewerAnswer
    };
  }).filter((card) => card.viewerAnswer);
}
function getPileActionEntries(deck = [], commandOptions = [], viewerSlot = getViewerSlot()) {
  const cards = Array.isArray(deck) ? deck : [], resolvedViewerSlot = getViewerSlot(viewerSlot), list = [];
  if (!cards.length) {
    return list;
  }
  list.push({
    type: "view_pile",
    deck: annotatePileDeck(cards, commandOptions, commandOptionKeys, resolvedViewerSlot)
  });
  const activateDeck = buildPileActionDeck(cards, commandOptions, pileActivateOptionKeys, resolvedViewerSlot);
  if (activateDeck.length) {
    list.push({
      type: "activate_pile",
      deck: activateDeck
    });
  }
  const specialSummonDeck = buildPileActionDeck(cards, commandOptions, pileSpecialSummonOptionKeys, resolvedViewerSlot);
  if (specialSummonDeck.length) {
    list.push({
      type: "spsummon_pile",
      deck: specialSummonDeck
    });
  }
  return list;
}
function clickGameplayControlButton(store2, card, uuid) {
  if (["view_materials", "view_pile", "activate_pile", "spsummon_pile"].includes(card.type)) {
    app.duel.closeRevealer();
    clearControlButtons(app.duel.controls);
    store2.emit({
      action: "OPEN_IDLE_EXTRA_VIEWER",
      deck: Array.isArray(card.deck) ? card.deck : [],
      mode: viewerModeByCardType[card.type] || "view"
    });
    return;
  }
  store2.emit({ action: "CONTROL_CLICK", card, uuid });
  app.duel.closeRevealer();
}
function GameplayControlButtonView({ store: store2, card, info, uuid }) {
  return /* @__PURE__ */ import_react20.default.createElement(
    ControlActionButton,
    {
      key: info.text,
      onClick: () => clickGameplayControlButton(store2, card, uuid),
      style: {
        display: "flex",
        width: "auto",
        zIndex: "350",
        textAlign: "center"
      },
      text: info.text
    }
  );
}
function getControlButtonsCommandOptions(controller) {
  return commandOptionKeys.flatMap(
    (type) => (Array.isArray(controller?.state?.[type]) ? controller.state[type] : []).map((option, index) => ({
      ...option,
      i: index,
      type
    }))
  );
}
function hasActionableControlCard(controller, query) {
  return getControlButtonsCommandOptions(controller).some((option) => commandOptionMatchesQuery(option, query));
}
function getActionableDeckForControls(controller, deck = []) {
  return annotatePileDeck(deck, getControlButtonsCommandOptions(controller), commandOptionKeys, getViewerSlot());
}
function getPileActionEntriesForControls(controller, deck = [], viewerSlot = getViewerSlot()) {
  return getPileActionEntries(deck, getControlButtonsCommandOptions(controller), viewerSlot);
}
function getIdleCommandPileHintsForControls(controller, viewerSlot = getViewerSlot()) {
  const localCanonicalPlayer = viewerSlot ? 1 : 0, pileLocations = new Set(
    getControlButtonsCommandOptions(controller).filter(
      (option) => ["EXTRA", "GRAVE", "BANISHED"].includes(option?.location) && (option.player === void 0 || Number(option.player) === 0)
    ).map((option) => option.location)
  );
  return Array.from(pileLocations).map((location) => ({
    player: localCanonicalPlayer,
    location
  }));
}
function getIdleCommandPileActionCoversForControls(controller, viewerSlot = getViewerSlot()) {
  const localCanonicalPlayer = viewerSlot ? 1 : 0, pileLocations = new Set(
    getControlButtonsCommandOptions(controller).filter(
      (option) => ["EXTRA", "GRAVE", "BANISHED"].includes(option?.location) && (option.player === void 0 || Number(option.player) === 0) && (pileActivateOptionKeys.includes(option?.type) || pileSpecialSummonOptionKeys.includes(option?.type))
    ).map((option) => option.location)
  );
  return Array.from(pileLocations).map((location) => ({
    player: localCanonicalPlayer,
    location
  }));
}
function getIdleCommandFieldActionCoversForControls(controller, viewerSlot = getViewerSlot()) {
  const localCanonicalPlayer = viewerSlot ? 1 : 0, seen = /* @__PURE__ */ new Set();
  return getControlButtonsCommandOptions(controller).filter(
    (option) => ["MONSTERZONE", "SPELLZONE"].includes(option?.location) && (option.player === void 0 || Number(option.player) === 0) && fieldActivateOptionKeys.includes(option?.type) && Number.isInteger(Number(option?.index))
  ).map((option) => ({
    player: localCanonicalPlayer,
    location: option.location,
    index: Number(option.index)
  })).filter((hint) => {
    const key = `${hint.player}:${hint.location}:${hint.index}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
function hideControlZones(controller) {
  const zones = controller?.state?.zones;
  if (!zones) {
    return;
  }
  setControlButtonsState(controller, {
    zones: Object.fromEntries(
      Object.entries(zones).map(([uid, zone]) => [
        uid,
        zone ? {
          ...zone,
          state: {
            ...zone.state,
            active: false
          }
        } : zone
      ])
    )
  });
}
function renderEnabledControlClasses(controller, enabledClasses, disabledClasses) {
  const buttons = [
    { text: "Flip Deck Over", options: ["filtered", "m-deck", "m-convulse"], onClick: function() {
      app.manualControls.manualFlipDeck();
    } },
    { text: "Reveal Deck", options: ["filtered", "m-deck"], onClick: function() {
      app.manualControls.manualRevealDeck();
    } },
    { text: "Reveal Top Card", options: ["filtered", "m-deck"], onClick: function() {
      app.manualControls.manualRevealTop();
    } },
    { text: "Reveal Bottom Card", options: ["filtered", "m-deck"], onClick: function() {
      app.manualControls.manualRevealBottom();
    } },
    { text: "Banish Top Card", options: ["filtered", "m-deck", "non-banish"], onClick: function() {
      app.manualControls.manualMillRemovedCard();
    } },
    { text: "Banish FaceDown", options: ["m-deck", "non-banish"], onClick: function() {
      app.manualControls.manualMillRemovedCardFaceDown();
    } },
    { text: "Excavate", options: ["filtered", "m-hand", "m-deck", "v-grave", "v-removed", "v-deck", "non-excavate"], onClick: function() {
      app.manualControls.manualToExcavate();
    } },
    { text: "Excavate Face-down", options: ["filtered", "m-deck"], onClick: function() {
      app.manualControls.manualExcavateTop();
    } },
    { text: "Shuffle Deck", options: ["m-deck"], onClick: function() {
      app.manualControls.manualShuffleDeck();
    } },
    { text: "View Deck", options: ["m-deck"], onClick: function() {
      app.manualControls.manualViewDeck();
    } },
    { text: "Mill", options: ["m-deck"], onClick: function() {
      app.manualControls.manualMill();
    } },
    { text: "Draw", options: ["m-deck"], onClick: function() {
      app.manualControls.manualDraw();
    } },
    { text: "View Graveyard", options: ["m-grave"], onClick: function() {
      app.manualControls.manualViewGrave();
    } },
    { text: "View Banished", options: ["m-removed"], onClick: function() {
      app.manualControls.manualViewBanished();
    } },
    { text: "View Extra Deck", options: ["m-extra", "m-extra-view"], onClick: function() {
      app.manualControls.manualViewExtra();
    } },
    { text: "Reveal Extra Deck", options: ["filtered", "m-extra"], onClick: function() {
      app.manualControls.manualRevealExtra();
    } },
    { text: "Reveal Random Card", options: ["filtered", "m-extra"], onClick: function() {
      app.manualControls.manualRevealExtraDeckRandom();
    } },
    { text: "View Excavated", options: ["m-excavated"], onClick: function() {
      app.manualControls.manualViewExcavated();
    } },
    { text: "Reveal Excavated", options: ["m-excavated"], onClick: function() {
      app.manualControls.manualRevealExcavated();
    } },
    { text: "Reveal Random Card", options: ["m-excavated"], onClick: function() {
      app.manualControls.manualRevealExcavatedRandom();
    } },
    { text: "To Bottom of Deck", options: ["filtered", "m-hand", "m-field", "st-field", "non-extra", "v-grave", "v-removed", "v-excavate", "non-deck"], onClick: function() {
      app.manualControls.manualToBottomOfDeck();
    } },
    { text: "To Top of Deck", options: ["m-hand", "m-field", "st-field", "non-extra", "v-grave", "v-removed", "v-excavate", "non-deck"], onClick: function() {
      app.manualControls.manualToTopOfDeck();
    } },
    { text: "To Opponents Hand", options: ["filtered", "m-hand", "m-field", "st-field", "non-extra"], onClick: function() {
      app.manualControls.manualToOpponentsHand();
    } },
    { text: "To Opponents Field", options: ["filtered", "m-hand", "m-field", "st-field", "v-deck ", "v-extra", "v-grave", "v-excavate", "v-removed"], onClick: function() {
      app.manualControls.manualToOpponent();
    } },
    { text: "Reveal", options: ["m-hand", "v-extra", "v-excavate"], onClick: function() {
      app.manualControls.manualRevealHandSingle();
    } },
    { text: "Banish", options: ["m-hand", "m-field", "st-field", "v-deck", "v-extra", "v-grave", "v-excavate"], onClick: function() {
      app.manualControls.manualToRemoved();
    } },
    { text: "Banish Face-down", options: ["filtered", "m-hand", "m-field", "st-field", "v-deck", "v-extra", "v-grave", "v-excavate"], onClick: function() {
      app.manualControls.manualToRemovedFacedown();
    } },
    { text: "To GY", options: ["m-hand", "m-field", "st-field", "v-deck", "v-removed", "v-extra", "v-excavate", "non-grave"], onClick: function() {
      app.manualControls.manualToGrave();
    } },
    { text: "Set in S/T", options: ["m-hand-st", "m-monster-st", "m-st-monster", "non-deck", "non-banished"], onClick: function() {
      app.manualControls.startSpellTargeting("set");
    } },
    { text: "Activate", options: ["m-hand-st"], onClick: function() {
      app.manualControls.startSpellTargeting("activate");
    } },
    { text: "To Hand", options: ["m-field", "st-field", "non-extra"], onClick: function() {
      app.manualControls.manualToHand();
    } },
    {
      text: "Reveal and Add to Hand",
      options: ["v-deck", "v-grave", "v-removed", "v-excavate", "v-extra-p non-extra"],
      onClick: function() {
        app.manualControls.manualToHand();
        app.manualControls.manualRevealHandSingle();
      }
    },
    { text: "To Extra Deck Face-up", options: ["m-hand-p", "m-monster-p", "m-monster-to-extra-faceup"], onClick: function() {
      app.manualControls.manualToExtraFaceUp();
    } },
    { text: "To Extra Deck", options: ["m-monster-extra", "v-monster-extra"], onClick: function() {
      app.manualControls.manualToExtra();
    } },
    { text: "SS in Defense", options: ["m-hand-m", "v-extra"], onClick: function() {
      app.manualControls.startSpecialSummon("def");
    } },
    { text: "SS in Attack", options: ["m-hand-m", "v-extra"], onClick: function() {
      app.manualControls.startSpecialSummon("atk");
    } },
    { text: "Set Monster", options: ["m-hand-m", "non-grave non-excavate", "non-banished", "non-deck"], onClick: function() {
      app.manualControls.startSpecialSummon("normaldef");
    } },
    { text: "Normal Summon", options: ["m-hand-m", "non-grave", "non-banished", "non-deck"], onClick: function() {
      app.manualControls.startSpecialSummon("normalatk");
    } },
    { text: "Activate Field Spell", options: ["m-hand-f"], onClick: function() {
      app.manualControls.manualActivateFieldSpell();
    } },
    { text: "Set Field Spell", options: ["m-hand-f"], onClick: function() {
      app.manualControls.manualActivateFieldSpellFaceDown();
    } },
    { text: "Flip Face-down", options: ["m-st"], onClick: function() {
      app.manualControls.manualSTFlipDown();
    } },
    { text: "Flip Face-up", options: ["m-st"], onClick: function() {
      app.manualControls.manualActivate();
    } },
    { text: "Move", options: ["m-monster", "m-st"], onClick: function() {
      app.manualControls.startSpecialSummon("generic");
    } },
    { text: "Add Counter", options: ["filtered", "m-monster", "m-st", "countercontroller"], onClick: function() {
      app.manualControls.manualAddCounter();
    } },
    { text: "Remove Counter", options: ["filtered", "m-monster", "m-st", "countercontroller"], onClick: function() {
      app.manualControls.manualRemoveCounter();
    } },
    { text: "View Xyz Materials", options: ["m-monster-xyz"], onClick: function() {
      app.manualControls.manualViewXYZMaterials();
    } },
    { text: "Overlay", options: ["m-monster", "m-monster-xyz", "v-monster-xyz"], onClick: function() {
      app.manualControls.startXYZSummon();
    } },
    { text: "Flip Face-up", options: ["m-monster", "toDefence"], onClick: function() {
      app.manualControls.manualToFaceUpDefence();
    } },
    { text: "Flip Face-down", options: ["m-monster"], onClick: function() {
      app.manualControls.manualToFaceDownDefence();
    } },
    { text: "To Attack", options: ["m-monster"], onClick: function() {
      app.manualControls.manualToAttack();
    } },
    { text: "To Defense", options: ["m-field", "toDefence"], onClick: function() {
      app.manualControls.manualToDefence();
    } },
    { text: "Remove Token", options: ["m-monster-token"], onClick: function() {
      app.manualControls.manualRemoveToken();
    } },
    { text: "To Left Pendulumn Zone", options: ["m-hand-p", "m-monster-p"], onClick: function() {
      app.manualControls.manualToPZoneL();
    } },
    { text: "To Right Pendulumn Zone", options: ["m-hand-p", "m-monster-p"], onClick: function() {
      app.manualControls.manualToPZoneR();
    } },
    { text: "Send to Deck Face-up", options: ["filtered", "m-parasite"], onClick: function() {
      app.manualControls.manualSendToDeckFaceup();
    } },
    { text: "Attack", options: ["a-field"], onClick: function() {
      app.manualControls.startAttack();
    } },
    { text: "Attack Directly", options: ["a-field"], onClick: function() {
      app.manualControls.manualAttackDirectly();
    } },
    { text: "Signal Effect", options: ["m-field", "st-field", "m-hand-m", "v-grave", "v-removed"], onClick: function() {
      app.manualControls.manualSignalEffect();
    } }
  ], elements = buttons.filter((button) => {
    return enabledClasses.some((prospect) => {
      return button.options.includes(prospect);
    });
  }).filter((button) => {
    return disabledClasses.every((prospect) => {
      return !button.options.includes(prospect);
    });
  }).map((button, i) => {
    const buttonClassName = button.options.join(" ");
    return /* @__PURE__ */ import_react20.default.createElement(
      ControlActionButton,
      {
        key: `mbutton${i}`,
        className: buttonClassName,
        onClick: button.onClick,
        style: {
          width: "auto",
          textAlign: "center"
        },
        text: button.text
      }
    );
  }).reverse();
  return /* @__PURE__ */ import_react20.default.createElement(
    FloatingControlPanel,
    {
      coords: controller.info.coords,
      className: controller.state.filter ? "button-filter" : "no-button-filter"
    },
    elements
  );
}
function manualDisplayControls(controller, query) {
  const enabledClasses = [], disabledClasses = [];
  if (query.location === "GRAVE") {
    if (query.status === "revealed") {
      enabledClasses.push("m-hand");
      if (monsterMap[query.type]) {
        enabledClasses.push("m-hand-m");
      }
      if ((stMap[query.type] || query.type === 2 || query.type === 4 || checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) && !fieldspell[query.type]) {
        enabledClasses.push("m-hand-st");
      }
      if (fieldspell[query.type]) {
        enabledClasses.push("m-hand-f");
      }
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
        enabledClasses.push("m-monster-p");
      }
      disabledClasses.push("non-grave");
    } else {
      enabledClasses.push("m-grave");
    }
    if (cardIs("link", query)) {
      disabledClasses.push("spdef");
    }
    if (pendulumMap[query.type]) {
      enabledClasses.push("m-monster-p");
    }
  }
  if (query.location === "MONSTERZONE") {
    enabledClasses.push("m-opponent");
    enabledClasses.push("m-field");
    enabledClasses.push("m-monster");
    if (cardIs("fusion", query) || cardIs("synchro", query) || cardIs("xyz", query) || cardIs("link", query)) {
      enabledClasses.push("m-monster-extra");
    }
    if (!(cardIs("fusion", query) || cardIs("synchro", query) || cardIs("xyz", query) || cardIs("link", query))) {
      enabledClasses.push("non-extra");
    }
    if (pendulumMap[query.type]) {
      enabledClasses.push("m-monster-p");
    }
    if (cardIs("xyz", query)) {
      enabledClasses.push("m-monster-xyz");
    }
    if (!excludeTokens(query)) {
      enabledClasses.push("m-monster-token");
      disabledClasses.push("non-extra", "m-monster-xyz", "non-deck", "non-banish", "non-hand", "overlayStack", "flipDownMonster", "banishcardfd", "non-grave");
    }
    if (checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) {
      enabledClasses.push("m-st-monster");
    }
    if (query.id === 27911549) {
      enabledClasses.push("m-parasite");
    }
    if (query.position === "FaceUpAttack") {
      enabledClasses.push("m-monster");
    }
    if (cardIs("link", query)) {
      disabledClasses.push("toDefence", "flipUpMonster", "flipDownMonster", "flipDown");
    }
    if (query.position === "FaceUpDefence") {
      disabledClasses.push("toDefence", "flipUpMonster");
    }
    if (!query.counters) {
      disabledClasses.push("#removeCounter");
    }
  }
  if (query.location === "SPELLZONE") {
    enabledClasses.push("st-field");
    if ((stMap[query.type] || query.type === 2 || query.type === 4) && !fieldspell[query.type]) {
      enabledClasses.push("m-st");
    }
    if (query.id === 62966332) {
      enabledClasses.push("m-convulse");
    }
    if (query.id === 63571750) {
      enabledClasses.push("m-pharaohstreasure");
    }
    if (pendulumMap[query.type]) {
      enabledClasses.push("m-monster-to-extra-faceup");
    }
  }
  if (query.location === "EXCAVATED") {
    if (query.status === "revealed") {
      enabledClasses.push("m-hand");
      if (monsterMap[query.type]) {
        enabledClasses.push("m-hand-m");
      }
      if ((stMap[query.type] || query.type === 2 || query.type === 4 || checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) && !fieldspell[query.type]) {
        enabledClasses.push("m-hand-st");
      }
      if (fieldspell[query.type]) {
        enabledClasses.push("m-hand-f");
      }
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
        enabledClasses.push("m-monster-p");
      }
    } else {
      enabledClasses.push("m-excavated");
    }
  }
  if (query.location === "EXTRA") {
    if (query.status === "revealed") {
      enabledClasses.push("v-removed");
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
        enabledClasses.push("m-monster-p");
      }
      if (monsterMap[query.type]) {
        enabledClasses.push("m-hand-m");
      }
      if ((stMap[query.type] || query.type === 2 || query.type === 4) && !fieldspell[query.type]) {
        enabledClasses.push("m-hand-st");
      }
      if (fieldspell[query.type]) {
        enabledClasses.push("m-hand-f");
      }
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
      }
      if (cardIs("fusion", query) || cardIs("synchro", query) || cardIs("xyz", query) || cardIs("link", query)) {
        enabledClasses.push("v-monster-extra");
      }
    } else {
      enabledClasses.push("m-extra-view");
      enabledClasses.push("m-extra");
      if (cardIs("link", query)) {
      }
    }
  }
  if (query.location === "BANISHED") {
    if (query.status === "revealed") {
      enabledClasses.push("v-removed");
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
        enabledClasses.push("m-monster-p");
      }
      if (monsterMap[query.type]) {
        enabledClasses.push("m-hand-m");
      }
      if ((stMap[query.type] || query.type === 2 || query.type === 4) && !fieldspell[query.type]) {
        enabledClasses.push("m-hand-st");
      }
      if (fieldspell[query.type]) {
        enabledClasses.push("m-hand-f");
      }
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
      }
      if (cardIs("fusion", query) || cardIs("synchro", query) || cardIs("xyz", query) || cardIs("link", query)) {
        enabledClasses.push("v-monster-extra");
      } else {
        enabledClasses.push("non-extra");
      }
    } else {
      enabledClasses.push("m-excavated");
    }
  }
  if (query.location === "DECK") {
    if (query.status === "revealed") {
      enabledClasses.push("m-hand");
      if (monsterMap[query.type]) {
        enabledClasses.push("m-hand-m");
      }
      if ((stMap[query.type] || query.type === 2 || query.type === 4 || checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) && !fieldspell[query.type]) {
        enabledClasses.push("m-hand-st");
      }
      if (fieldspell[query.type]) {
        enabledClasses.push("m-hand-f");
      }
      if (pendulumMap[query.type]) {
        enabledClasses.push("m-hand-p");
        enabledClasses.push("m-monster-p");
      }
    } else {
      enabledClasses.push("m-deck");
    }
  }
  if (query.player !== window.orientation) {
    return;
  }
  if (query.location === "HAND") {
    enabledClasses.push("m-hand");
    if (monsterMap[query.type]) {
      enabledClasses.push("m-hand-m");
    }
    if ((stMap[query.type] || query.type === 2 || query.type === 4 || checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) && !fieldspell[query.type]) {
      enabledClasses.push("m-hand-st");
    }
    if (fieldspell[query.type]) {
      enabledClasses.push("m-hand-f");
    }
    if (pendulumMap[query.type]) {
      enabledClasses.push("m-hand-p");
      enabledClasses.push("m-monster-p");
    }
  }
  return renderEnabledControlClasses(controller, enabledClasses, disabledClasses);
}
function displayControlButtons(controller, list) {
  const elements = list.map((card) => {
    return /* @__PURE__ */ import_react20.default.createElement(
      GameplayControlButtonView,
      {
        key: `${card.type}-${card.id ?? card.uid ?? card.location}-${card.i ?? "x"}`,
        store: controller.store,
        card,
        info: buttonDetails[card.type],
        uuid: controller.state.uuid
      }
    );
  });
  return /* @__PURE__ */ import_react20.default.createElement(FloatingControlPanel, { coords: controller.info.coords }, elements);
}
function updateControlButtons(controller, newState) {
  setControlButtonsState(controller, newState);
  controller.store.emit({
    action: "ENABLE_PHASE",
    battlephase: controller.state.enableBattlePhase ? "enableBattlePhase" : false,
    mainphase2: controller.state.enableMainPhase2 ? "enableMainPhase2" : false,
    endphase: controller.state.enableEndPhase ? "enableEndPhase" : false
  });
  controller.store.emit({ action: "RENDER" });
}
function enableControlButtons(controller, query, coords) {
  setControlButtonsInfo(controller, {
    target: {
      id: query.id,
      uid: query.uid,
      index: query.index,
      location: query.location,
      type: query.type,
      player: query.player,
      pile: Boolean(query.pile),
      deck: Array.isArray(query.deck) ? query.deck : [],
      setcode: query.setcode,
      position: query.position,
      status: query.status,
      overlayMaterials: Array.isArray(query.overlayMaterials) ? query.overlayMaterials : []
    },
    coords
  });
  app.manualControls.manualActionReference = controller.info.target;
}
function clearControlButtons(controller) {
  setControlButtonsInfo(controller, {
    target: null
  });
}
function ControlButtonsState(store2) {
  const controller = {
    store: store2,
    state: {
      summonable_cards: [],
      spsummonable_cards: [],
      repositionable_cards: [],
      msetable_cards: [],
      ssetable_cards: [],
      activatable_cards: [],
      select_options: [],
      attackable_cards: []
    },
    info: {
      coords: {
        x: 0,
        y: 0
      },
      target: null
    }
  };
  controller.getCommandOptions = () => getControlButtonsCommandOptions(controller);
  controller.hasActionableCard = (query) => hasActionableControlCard(controller, query);
  controller.getActionableDeck = (deck = []) => getActionableDeckForControls(controller, deck);
  controller.getPileActionEntries = (deck = [], viewerSlot = getViewerSlot()) => getPileActionEntriesForControls(controller, deck, viewerSlot);
  controller.getIdleCommandPileHints = (viewerSlot = getViewerSlot()) => getIdleCommandPileHintsForControls(controller, viewerSlot);
  controller.getIdleCommandPileActionCovers = (viewerSlot = getViewerSlot()) => getIdleCommandPileActionCoversForControls(controller, viewerSlot);
  controller.getIdleCommandFieldActionCovers = (viewerSlot = getViewerSlot()) => getIdleCommandFieldActionCoversForControls(controller, viewerSlot);
  controller.hide = () => hideControlZones(controller);
  controller.renderEnabledClasses = (enabledClasses, disabledClasses) => renderEnabledControlClasses(controller, enabledClasses, disabledClasses);
  controller.manualDisplay = (query) => manualDisplayControls(controller, query);
  controller.display = (list) => displayControlButtons(controller, list);
  controller.update = (newState) => updateControlButtons(controller, newState);
  controller.enable = (query, coords) => enableControlButtons(controller, query, coords);
  controller.clear = () => clearControlButtons(controller);
  return controller;
}
function ControlButtons(store2) {
  return ControlButtonsState(store2);
}

// server/ui/components/duel/position.component.jsx
var import_react21 = __toESM(require("react"), 1);

// server/ui/components/duel/position.component.module.scss
var position_component_module_default = ".root {}\n";

// server/ui/components/duel/position.component.jsx
var POSITION_OPTIONS = [
  { bit: 1, name: "FaceUpAttack" },
  { bit: 2, name: "FaceDownAttack" },
  { bit: 4, name: "FaceUpDefence" },
  { bit: 8, name: "FaceDownDefence" }
];
function createEmptySelectPositionState() {
  return {
    active: false,
    cards: []
  };
}
function resolveDialogStore7(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function resolveSelectablePositions(positions) {
  if (Array.isArray(positions)) {
    return positions.filter(Boolean);
  }
  if (typeof positions === "string") {
    return [positions];
  }
  const mask = Number(positions);
  if (!Number.isFinite(mask) || mask <= 0) {
    return [];
  }
  return POSITION_OPTIONS.filter((entry) => (mask & entry.bit) === entry.bit).map((entry) => entry.name);
}
function triggerSelectPositionDialog(target, state) {
  const positions = resolveSelectablePositions(state?.positions), cards = positions.map((position) => {
    return {
      id: state?.id || state?.code,
      position,
      type: position
    };
  });
  resolveDialogStore7(target)?.emit?.({
    action: "OPEN_SELECT_POSITION_DIALOG",
    state: {
      active: cards.length > 0,
      cards
    }
  });
}
function closeSelectPositionDialog(target) {
  resolveDialogStore7(target)?.emit?.({ action: "CLOSE_SELECT_POSITION_DIALOG" });
}
function clickSelectPosition(store2, closeDialog, position) {
  closeDialog();
  store2?.emit?.({
    action: "POSITION_CARD_CLICK",
    position: createSelectPositionAnswer(position.position || position.type)
  });
}
function PositionOptionCard({ card, onClick }) {
  const src = getCardImageUrl(card.id);
  return /* @__PURE__ */ import_react21.default.createElement(AppImage, { className: `card ${card.position}`, src, onClick, alt: "", fallbackSrc: "img/textures/unknown.jpg", width: 177, height: 254, sizes: "(max-width: 768px) 40vw, 177px" });
}
function SelectPositionView({ state, onSelect }) {
  if (!state?.active) {
    return null;
  }
  return /* @__PURE__ */ import_react21.default.createElement(
    "div",
    {
      className: position_component_module_default.root,
      style: {
        display: "flex"
      },
      id: "revealed"
    },
    state.cards.map((card) => /* @__PURE__ */ import_react21.default.createElement(
      PositionOptionCard,
      {
        key: `${card.id}-${card.position}`,
        card,
        onClick: () => onSelect(card)
      }
    ))
  );
}
function MountedSelectPosition({ controller, store: store2 }) {
  const resolvedStore = resolveDialogStore7(store2 || controller), [state, setState] = (0, import_react21.useState)(createEmptySelectPositionState);
  (0, import_react21.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const closeDialog = () => {
      setState(createEmptySelectPositionState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_SELECT_POSITION_DIALOG", (message) => {
      setState({
        ...createEmptySelectPositionState(),
        ...message?.state || {}
      });
    }), unsubscribeClose = resolvedStore.on("CLOSE_SELECT_POSITION_DIALOG", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react21.default.createElement(
    SelectPositionView,
    {
      state,
      onSelect: (card) => clickSelectPosition(resolvedStore, () => setState(createEmptySelectPositionState()), card)
    }
  );
}
function SelectPosition(props) {
  return /* @__PURE__ */ import_react21.default.createElement(MountedSelectPosition, { ...props });
}

// server/ui/components/duel/reveal.component.jsx
var import_react22 = __toESM(require("react"), 1);

// server/ui/components/duel/reveal.component.module.scss
var reveal_component_module_default = ".revealRoot {\n}\n";

// server/ui/components/duel/reveal.component.jsx
var REVEAL_LOCATION_LABELS2 = Object.freeze({
  BANISHED: "Banished",
  DECK: "Deck",
  EXTRA: "Extra Deck",
  EXCAVATED: "Excavated",
  FZONE: "Field Zone",
  GRAVE: "Graveyard",
  HAND: "Hand",
  MONSTERZONE: "Monster Zone",
  ONFIELD: "Field",
  OVERLAY: "Overlay Unit",
  PZONE: "Pendulum Zone",
  SPELLZONE: "Spell & Trap Zone"
});
function createEmptyRevealerState() {
  return {
    active: false,
    cards: [],
    mode: "select",
    dismissable: true
  };
}
function resolveDialogStore8(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function getRevealSelectionMarker(state, index) {
  if (state.mode === "sort") {
    const order = Array.isArray(state.selectionOrder) ? state.selectionOrder.indexOf(index) : -1;
    return order >= 0 ? String(order + 1) : "";
  }
  if (state.mode === "counter") {
    const allocation = Array.isArray(state.counterAllocations) ? Number(state.counterAllocations[index] || 0) : 0;
    return allocation > 0 ? String(allocation) : "";
  }
  return "";
}
function getRevealCardClassName(state, card, index) {
  const classNames = ["reveal-card"];
  if (card?.selected) {
    classNames.push("selected");
  }
  if (state.mode === "sort" && Array.isArray(state.selectionOrder) && state.selectionOrder.includes(index)) {
    classNames.push("ordered");
  }
  if (state.mode === "counter" && Number(Array.isArray(state.counterAllocations) ? state.counterAllocations[index] : 0) > 0) {
    classNames.push("allocated");
  }
  return classNames.join(" ");
}
function getRevealCoordinateLabel(card) {
  if (!card || typeof card !== "object") {
    return "";
  }
  const location = typeof card.location === "string" ? REVEAL_LOCATION_LABELS2[card.location] || card.location : null, index = Number(card.index), owner = Number(card.player);
  if (!location || !Number.isInteger(index)) {
    return "";
  }
  const prefix = owner === 0 ? "Your" : owner === 1 ? "Opponent's" : "";
  return `${prefix ? `${prefix} ` : ""}${location} ${index + 1}`;
}
function clickRevealCard(store2, state, selected, option, closeDialog, event) {
  event?.stopPropagation?.();
  if (state.mode === "sort") {
    store2?.emit?.({ action: "REVEAL_SORT_CLICK", option, selected });
    store2?.emit?.({ action: "RENDER" });
    return;
  }
  if (state.mode === "counter") {
    store2?.emit?.({ action: "REVEAL_COUNTER_CLICK", option, direction: 1 });
    store2?.emit?.({ action: "RENDER" });
    return;
  }
  closeDialog();
  store2?.emit?.({ action: "REVEAL_CARD_CLICK", option, selected });
  store2?.emit?.({ action: "RENDER" });
}
function decrementRevealCounter(store2, option, event) {
  event.preventDefault();
  event.stopPropagation();
  store2?.emit?.({ action: "REVEAL_COUNTER_CLICK", option, direction: -1 });
  store2?.emit?.({ action: "RENDER" });
}
function confirmReveal(store2, event) {
  event?.stopPropagation?.();
  store2?.emit?.({ action: "REVEAL_CONFIRM" });
}
function resetReveal(store2, event) {
  event?.stopPropagation?.();
  store2?.emit?.({ action: "REVEAL_RESET" });
  store2?.emit?.({ action: "RENDER" });
}
function manualRevealClick(store2, card, event) {
  event.stopPropagation();
  card.status = "revealed";
  app.duel.controls.enable(card, { x: event.pageX, y: event.pageY });
  store2?.emit?.({ action: "RENDER" });
}
function triggerRevealer(target, state) {
  resolveDialogStore8(target)?.emit?.({
    action: "OPEN_REVEALER",
    state: {
      ...createEmptyRevealerState(),
      ...state,
      dismissable: state?.dismissable !== void 0 ? Boolean(state.dismissable) : true,
      active: true
    }
  });
}
function closeRevealer(target) {
  resolveDialogStore8(target)?.emit?.({ action: "CLOSE_REVEALER" });
}
function disposeRevealer(target) {
  closeRevealer(target);
}
function RevealCard({ card, index, state, store: store2, closeDialog }) {
  const src = getCardImageUrl(card.id || card.code), onClick = app.manual ? (event) => manualRevealClick(store2, card, event) : (event) => clickRevealCard(store2, state, card.selected, index, closeDialog, event), marker = getRevealSelectionMarker(state, index), available = Number(card?.count || 0), allocated = Array.isArray(state.counterAllocations) ? Number(state.counterAllocations[index] || 0) : 0, coordinateLabel = getRevealCoordinateLabel(card);
  return /* @__PURE__ */ import_react22.default.createElement(
    "div",
    {
      key: card.uid || card.id || index,
      className: getRevealCardClassName(state, card, index),
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.25rem"
      }
    },
    /* @__PURE__ */ import_react22.default.createElement(
      "div",
      {
        className: "reveal-card-frame",
        onClick,
        onContextMenu: state.mode === "counter" ? (event) => decrementRevealCounter(store2, index, event) : void 0
      },
      coordinateLabel ? /* @__PURE__ */ import_react22.default.createElement("div", { className: "reveal-card-coordinate" }, coordinateLabel) : null,
      /* @__PURE__ */ import_react22.default.createElement(
        AppImage,
        {
          className: card.selected ? "selected" : "",
          src,
          fallbackSrc: "img/textures/unknown.jpg",
          width: 177,
          height: 254,
          sizes: "(max-width: 768px) 40vw, 177px"
        }
      )
    ),
    marker ? /* @__PURE__ */ import_react22.default.createElement("span", { className: "reveal-marker" }, marker) : null,
    state.mode === "counter" ? /* @__PURE__ */ import_react22.default.createElement("span", { className: "reveal-counter" }, `${allocated} / ${available}`) : null
  );
}
function RevealControls({ state, store: store2 }) {
  if (state.mode !== "sort" && state.mode !== "counter") {
    return null;
  }
  const sortReady = state.mode === "sort" && Array.isArray(state.selectionOrder) && state.selectionOrder.length === (Array.isArray(state.cards) ? state.cards.length : 0);
  const counterReady = state.mode === "counter" && Number(state.remaining || 0) === 0;
  const canConfirm = sortReady || counterReady;
  const summary = state.mode === "counter" ? `Remaining counters: ${Number(state.remaining || 0)}` : `Selected order: ${Array.isArray(state.selectionOrder) ? state.selectionOrder.length : 0} / ${Array.isArray(state.cards) ? state.cards.length : 0}`;
  return /* @__PURE__ */ import_react22.default.createElement(
    "div",
    {
      id: "revealcontrols",
      style: {
        display: "flex",
        gap: "0.5rem",
        alignItems: "center"
      }
    },
    /* @__PURE__ */ import_react22.default.createElement("span", null, summary),
    /* @__PURE__ */ import_react22.default.createElement(
      "button",
      {
        id: "revealerreset",
        onClick: (event) => resetReveal(store2, event)
      },
      "Reset"
    ),
    /* @__PURE__ */ import_react22.default.createElement(
      "button",
      {
        id: "revealerconfirm",
        disabled: !canConfirm,
        onClick: (event) => confirmReveal(store2, event)
      },
      "Confirm"
    )
  );
}
function RevealerView({ state, store: store2, closeDialog }) {
  if (!state?.active) {
    return null;
  }
  return /* @__PURE__ */ import_react22.default.createElement(
    "div",
    {
      onClick: state.mode === "select" && state.dismissable ? closeDialog : void 0,
      className: reveal_component_module_default.revealRoot,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem"
      },
      id: "revealed",
      "data-dismissable": state.dismissable ? "true" : "false"
    },
    /* @__PURE__ */ import_react22.default.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap"
        }
      },
      state.cards.map((card, index) => /* @__PURE__ */ import_react22.default.createElement(
        RevealCard,
        {
          card,
          state,
          store: store2,
          closeDialog,
          index,
          key: card.uid || card.id || index
        }
      ))
    ),
    /* @__PURE__ */ import_react22.default.createElement(RevealControls, { state, store: store2 })
  );
}
function MountedRevealer({ controller, store: store2 }) {
  const resolvedStore = resolveDialogStore8(store2 || controller), [state, setState] = (0, import_react22.useState)(createEmptyRevealerState);
  (0, import_react22.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const closeDialog = () => {
      setState(createEmptyRevealerState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_REVEALER", (message) => {
      setState({
        ...createEmptyRevealerState(),
        ...message?.state || {},
        active: true
      });
    }), unsubscribeClose = resolvedStore.on("CLOSE_REVEALER", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react22.default.createElement(
    RevealerView,
    {
      state,
      store: resolvedStore,
      closeDialog: () => setState(createEmptyRevealerState())
    }
  );
}
function Revealer(props) {
  return /* @__PURE__ */ import_react22.default.createElement(MountedRevealer, { ...props });
}

// server/ui/components/duel/select.option.component.jsx
var import_react23 = __toESM(require("react"), 1);

// server/ui/components/duel/select.option.component.module.scss
var select_option_component_module_default = ".root {}\n";

// server/ui/components/duel/select.option.component.jsx
function createEmptySelectOptionDialogState() {
  return {
    active: false,
    options: [],
    selectedIndex: 0
  };
}
function resolveDialogStore9(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerSelectOptionDialog(target, state) {
  const options = Array.isArray(state?.options) ? state.options : [];
  resolveDialogStore9(target)?.emit?.({
    action: "OPEN_SELECT_OPTION_DIALOG",
    state: {
      ...createEmptySelectOptionDialogState(),
      ...state,
      options,
      selectedIndex: options.length ? Number(state?.selectedIndex ?? options[0]?.i ?? 0) : 0,
      active: true
    }
  });
}
function closeSelectOptionDialog(target) {
  resolveDialogStore9(target)?.emit?.({ action: "CLOSE_SELECT_OPTION_DIALOG" });
}
function submitSelectOptionDialog(store2, state, closeDialog) {
  closeDialog();
  store2?.emit?.({
    action: "SELECT_OPTION_CLICK",
    answer: createSelectOptionAnswer(state.selectedIndex)
  });
}
function SelectOptionDialogView({ state, onChange, onSubmit }) {
  if (!state?.active) {
    return null;
  }
  return /* @__PURE__ */ import_react23.default.createElement(
    "div",
    {
      className: select_option_component_module_default.root,
      id: "selectoptionbox",
      style: {
        display: "flex",
        flexDirection: "column"
      }
    },
    /* @__PURE__ */ import_react23.default.createElement("label", { htmlFor: "duelselectoption" }, "Select an option"),
    /* @__PURE__ */ import_react23.default.createElement(
      "select",
      {
        id: "duelselectoption",
        value: String(state.selectedIndex),
        onChange
      },
      state.options.map((option, index) => /* @__PURE__ */ import_react23.default.createElement(
        "option",
        {
          key: option?.key || option?.i || index,
          value: String(option?.i ?? index)
        },
        option?.label || `Option ${index + 1}`
      ))
    ),
    /* @__PURE__ */ import_react23.default.createElement(
      "button",
      {
        id: "duelselectoptionconfirm",
        onClick: onSubmit
      },
      "Confirm"
    )
  );
}
function MountedSelectOptionDialog({ controller, store: store2 }) {
  const resolvedStore = resolveDialogStore9(store2 || controller), [state, setState] = (0, import_react23.useState)(createEmptySelectOptionDialogState);
  (0, import_react23.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const closeDialog = () => {
      setState(createEmptySelectOptionDialogState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_SELECT_OPTION_DIALOG", (message) => {
      setState({
        ...createEmptySelectOptionDialogState(),
        ...message?.state || {},
        active: true
      });
    }), unsubscribeClose = resolvedStore.on("CLOSE_SELECT_OPTION_DIALOG", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react23.default.createElement(
    SelectOptionDialogView,
    {
      state,
      onChange: (event) => {
        setState((current) => ({
          ...current,
          selectedIndex: Number(event?.target?.value || 0)
        }));
      },
      onSubmit: () => submitSelectOptionDialog(resolvedStore, state, () => setState(createEmptySelectOptionDialogState()))
    }
  );
}
function SelectOptionDialog(props) {
  return /* @__PURE__ */ import_react23.default.createElement(MountedSelectOptionDialog, { ...props });
}

// server/ui/components/duel/view_decks.component.jsx
var import_react24 = __toESM(require("react"), 1);

// server/ui/components/duel/view_decks.component.module.scss
var view_decks_component_module_default = ".deckDialogRoot {\n}\n";

// server/ui/components/duel/view_decks.component.jsx
function createEmptyDeckDialogState() {
  return {
    active: false,
    deck: []
  };
}
function resolveDialogStore10(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function clickDeckDialogCard(store2, closeDialog, card, event) {
  closeDialog();
  store2?.emit?.({ action: "DECK_CARD_CLICK", card, y: event.pageY, x: event.pageX });
}
function closeDeckDialog(target) {
  resolveDialogStore10(target)?.emit?.({ action: "CLOSE_DECK_DIALOG" });
}
function DeckDialogCard({ card, index, onClick }) {
  const src = getCardImageUrl(card.id || card.code);
  return /* @__PURE__ */ import_react24.default.createElement(
    AppImage,
    {
      key: `deck-dialog-${card.uid || card.id || card.code || "card"}-${card.player ?? "x"}-${card.location || "unknown"}-${card.index ?? index}-${index}`,
      className: [
        card.selected ? "selected" : "",
        card.actionable ? "actionable" : ""
      ].filter(Boolean).join(" "),
      "data-actionable": card.actionable ? "true" : "false",
      src,
      onClick,
      fallbackSrc: "img/textures/unknown.jpg",
      width: 177,
      height: 254,
      sizes: "(max-width: 768px) 40vw, 177px"
    }
  );
}
function DeckDialogView({ state, onCardClick }) {
  if (!state?.active || !state.deck.length) {
    return null;
  }
  return /* @__PURE__ */ import_react24.default.createElement(
    "div",
    {
      id: "revealed",
      className: view_decks_component_module_default.deckDialogRoot,
      style: {
        display: "block"
      }
    },
    state.deck.map((card, index) => /* @__PURE__ */ import_react24.default.createElement(
      DeckDialogCard,
      {
        card,
        index,
        key: `deck-dialog-${card.uid || card.id || card.code || "card"}-${card.player ?? "x"}-${card.location || "unknown"}-${card.index ?? index}-${index}`,
        onClick: (event) => onCardClick(card, event)
      }
    ))
  );
}
function MountedDeckDialog({ controller, store: store2 }) {
  const resolvedStore = resolveDialogStore10(store2 || controller), [state, setState] = (0, import_react24.useState)(createEmptyDeckDialogState);
  (0, import_react24.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const closeDialog = () => {
      setState(createEmptyDeckDialogState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_DECK", (message) => {
      setState({
        active: true,
        deck: Array.isArray(message.deck) ? message.deck : []
      });
    }), unsubscribeClose = resolvedStore.on("CLOSE_DECK_DIALOG", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react24.default.createElement(
    DeckDialogView,
    {
      state,
      onCardClick: (card, event) => clickDeckDialogCard(resolvedStore, () => setState(createEmptyDeckDialogState()), card, event)
    }
  );
}
function DeckDialog(props) {
  return /* @__PURE__ */ import_react24.default.createElement(MountedDeckDialog, { ...props });
}

// server/ui/components/duel/anouncement.component.jsx
var import_react25 = __toESM(require("react"), 1);

// server/ui/components/duel/anouncement.component.module.scss
var anouncement_component_module_default = ".root {\n}\n";

// server/ui/components/duel/anouncement.component.jsx
function createEmptyFlasherState() {
  return {
    active: false
  };
}
function resolveDialogStore11(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerFlasher(target, state = {}) {
  const resolvedStore = resolveDialogStore11(target);
  if (!resolvedStore) {
    return;
  }
  resolvedStore.emit({
    action: "OPEN_FLASHER",
    state: {
      ...state,
      active: true,
      duration: Math.max(120, Number(state?.duration || 500))
    }
  });
}
function disposeFlasher(target) {
  resolveDialogStore11(target)?.emit?.({ action: "CLOSE_FLASHER" });
}
function FlasherView({ state }) {
  if (!state?.active) {
    return null;
  }
  const src = getCardImageUrl(state.id), children = [
    /* @__PURE__ */ import_react25.default.createElement(AppImage, { className: "mainimage", src, key: "mainimage", alt: "", width: 421, height: 614, sizes: "70vh", style: { width: "auto", height: "70vh" } })
  ];
  if (state.sourceAnchor && Number.isFinite(state.sourceAnchor.x) && Number.isFinite(state.sourceAnchor.y)) {
    children.push(
      /* @__PURE__ */ import_react25.default.createElement(
        "div",
        {
          className: "effectflash-source-beacon",
          "data-source-beacon": "true",
          key: "source-beacon",
          style: {
            left: `${state.sourceAnchor.x}px`,
            top: `${state.sourceAnchor.y}px`
          }
        }
      )
    );
  }
  return /* @__PURE__ */ import_react25.default.createElement(
    "div",
    {
      className: `${state.mode ? `effectflasher mode-${state.mode}` : "effectflasher"} ${anouncement_component_module_default.root}`,
      style: {
        display: "block"
      },
      "data-mode": state.mode || "legacy_preview",
      id: "effectflasher"
    },
    children
  );
}
function MountedFlasher({ controller, store: store2 }) {
  const resolvedStore = resolveDialogStore11(store2 || controller), [state, setState] = (0, import_react25.useState)(createEmptyFlasherState), closeTimerRef = (0, import_react25.useRef)(null);
  (0, import_react25.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const clearCloseTimer = () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }, closeDialog = () => {
      clearCloseTimer();
      setState(createEmptyFlasherState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_FLASHER", (message) => {
      clearCloseTimer();
      setState(message?.state || createEmptyFlasherState());
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        setState(createEmptyFlasherState());
      }, Math.max(120, Number(message?.state?.duration || 500)));
    }), unsubscribeClose = resolvedStore.on("CLOSE_FLASHER", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react25.default.createElement(FlasherView, { state });
}
function Flasher(props) {
  return /* @__PURE__ */ import_react25.default.createElement(MountedFlasher, { ...props });
}

// server/ui/components/duel/yesno.component.jsx
var import_react26 = __toESM(require("react"), 1);

// server/ui/components/duel/yesno.component.module.scss
var yesno_component_module_default = ".yesNoRoot {\n}\n";

// server/ui/components/duel/yesno.component.jsx
function createEmptyYesNoDialogState() {
  return {
    active: false,
    promptText: "",
    yesLabel: "Yes",
    noLabel: "No",
    onYes: void 0,
    onNo: void 0
  };
}
function resolveDialogStore12(target) {
  if (target?.on && target?.emit) {
    return target;
  }
  return target?.store;
}
function triggerYesNoDialog(target, state = {}) {
  resolveDialogStore12(target)?.emit?.({
    action: "OPEN_YESNO_DIALOG",
    state: {
      ...createEmptyYesNoDialogState(),
      ...state,
      active: true
    }
  });
}
function closeYesNoDialog(target) {
  resolveDialogStore12(target)?.emit?.({ action: "CLOSE_YESNO_DIALOG" });
}
function clickYesNoDialog(store2, state, closeDialog, option) {
  const onYes = state.onYes, onNo = state.onNo;
  closeDialog();
  if (option && typeof onYes === "function") {
    onYes();
    return;
  }
  if (!option && typeof onNo === "function") {
    onNo();
    return;
  }
  store2?.emit?.({
    action: "YESNO_CLICK",
    option: createSelectYesNoAnswer(option)
  });
}
function YesNoDialogView({ state, onSelect }) {
  if (!state?.active) {
    return null;
  }
  return /* @__PURE__ */ import_react26.default.createElement(
    "div",
    {
      className: yesno_component_module_default.yesNoRoot,
      style: {
        display: "flex"
      },
      id: "yesnobox"
    },
    /* @__PURE__ */ import_react26.default.createElement(
      "p",
      {
        key: "prompt",
        style: {
          whiteSpace: "pre-line"
        }
      },
      state.promptText || "Use effect?"
    ),
    /* @__PURE__ */ import_react26.default.createElement("div", { key: "actions" }, /* @__PURE__ */ import_react26.default.createElement("button", { onClick: () => onSelect(true), key: "yes" }, state.yesLabel || "Yes"), /* @__PURE__ */ import_react26.default.createElement("button", { onClick: () => onSelect(false), key: "no" }, state.noLabel || "No"))
  );
}
function MountedYesNoDialog({ controller, store: store2 }) {
  const resolvedStore = resolveDialogStore12(store2 || controller), [state, setState] = (0, import_react26.useState)(createEmptyYesNoDialogState);
  (0, import_react26.useEffect)(() => {
    if (!resolvedStore?.on) {
      return void 0;
    }
    const closeDialog = () => {
      setState(createEmptyYesNoDialogState());
    }, unsubscribeOpen = resolvedStore.on("OPEN_YESNO_DIALOG", (message) => {
      setState({
        ...createEmptyYesNoDialogState(),
        ...message?.state || {},
        active: true
      });
    }), unsubscribeClose = resolvedStore.on("CLOSE_YESNO_DIALOG", () => {
      closeDialog();
    });
    return () => {
      unsubscribeOpen?.();
      unsubscribeClose?.();
      closeDialog();
    };
  }, [resolvedStore]);
  return /* @__PURE__ */ import_react26.default.createElement(
    YesNoDialogView,
    {
      state,
      onSelect: (option) => clickYesNoDialog(resolvedStore, state, () => setState(createEmptyYesNoDialogState()), option)
    }
  );
}
function YesNoDialog(props) {
  return /* @__PURE__ */ import_react26.default.createElement(MountedYesNoDialog, { ...props });
}

// server/ui/services/duel-field-dom-effects.service.js
function normalizePlayerSlot(player) {
  const token = String(player ?? "");
  return token.startsWith("p") ? token.slice(1) : token;
}
function getPlayerClass(player) {
  return `p${normalizePlayerSlot(player)}`;
}
function toPixelString(value) {
  return `${value}px`;
}
function createDuelFieldDomEffectsService(dependencies = {}) {
  const viewport = dependencies.viewport || createDuelFieldViewport(), setTimeoutImpl = dependencies.setTimeout || globalThis.setTimeout?.bind(globalThis) || setTimeout, setIntervalImpl = dependencies.setInterval || globalThis.setInterval?.bind(globalThis) || setInterval, clearIntervalImpl = dependencies.clearInterval || globalThis.clearInterval?.bind(globalThis) || clearInterval, random = dependencies.random || Math.random;
  function getElements(selector) {
    return viewport.queryElements(selector);
  }
  function getNumericStyle(element, property) {
    return viewport.getNumericStyle(element, property);
  }
  function layoutHand(player) {
    const slot = normalizePlayerSlot(player), cards = getElements(`.p${slot}.HAND`), count = cards.length, factor = 75 / 0.8;
    for (let sequence = 0; sequence < count; sequence += 1) {
      const xCoord = count < 6 ? (5.5 * factor - 0.8 * factor * count) / 2 + 1.55 * factor + sequence * 0.8 * factor : 1.9 * factor + sequence * 4 * factor / (count - 1);
      getElements(`.p${slot}.HAND.i${sequence}`).forEach((card) => {
        card.style.left = toPixelString(xCoord);
      });
    }
  }
  function resetDeckStackMargins(player, deck) {
    getElements(`.card.${getPlayerClass(player)}.${deck}`).forEach((element) => {
      const index = Number(element.getAttribute("data-index") || 0);
      if (typeof element.setAttribute === "function") {
        element.setAttribute("style", "");
      }
      Object.assign(element.style, {
        webkitTransform: `translate3d(0,0,${index}px)`,
        zIndex: String(index)
      });
    });
  }
  function applyDeckShuffle(player, deck) {
    const playerClass = getPlayerClass(player), axis = playerClass === "p0" ? "left" : "right";
    resetDeckStackMargins(player, deck);
    getElements(`.card.${playerClass}.${deck}`).reverse().forEach((element) => {
      const cachedPosition = getNumericStyle(element, axis), randomOffset = Math.floor(random() * 100 - 50);
      element.style[axis] = toPixelString(cachedPosition - randomOffset);
    });
  }
  function shuffleDeck(player, deck) {
    const slot = normalizePlayerSlot(player), action = setIntervalImpl(() => {
      applyDeckShuffle(slot, deck);
      setTimeoutImpl(() => {
        resetDeckStackMargins(slot, deck);
      }, 50);
    }, 200);
    setTimeoutImpl(() => {
      clearIntervalImpl(action);
      resetDeckStackMargins(slot, deck);
      setTimeoutImpl(() => {
        layoutHand(slot);
      }, 500);
    }, 1e3);
    applyDeckShuffle(slot, deck);
  }
  function shuffleZone(player, location) {
    const cards = getElements(`.card.${getPlayerClass(player)}.${location}`).filter(
      (element) => Number(element.getAttribute("data-overlayindex") || 0) === 0
    );
    cards.forEach((element) => {
      const previousTransform = element.style.transform || "", offsetX = Math.floor(random() * 36 - 18), offsetY = Math.floor(random() * 18 - 9);
      element.dataset.shuffleTransform = previousTransform;
      element.style.transform = `${previousTransform} translate(${offsetX}px, ${offsetY}px)`.trim();
    });
    setTimeoutImpl(() => {
      cards.forEach((element) => {
        element.style.transform = element.dataset.shuffleTransform || "";
        delete element.dataset.shuffleTransform;
      });
    }, 350);
  }
  function shuffleTagSwap(player, zones = ["DECK", "HAND", "EXTRA"]) {
    zones.forEach((zone) => {
      shuffleDeck(player, zone);
    });
  }
  return {
    layoutHand,
    shuffleDeck,
    shuffleTagSwap,
    shuffleZone
  };
}
var defaultDuelFieldDomEffectsService = createDuelFieldDomEffectsService();

// server/ui/services/duel-presentation-layout.service.js
var summonModes = /* @__PURE__ */ new Set(["summon", "special_summon", "flip_summon"]);
function normalizePlacementNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
function resolveRevealDuration(duration) {
  return normalizePlacementNumber(duration, 1400);
}
function buildStackedRevealPlacements(anchor, count) {
  if (!anchor || !Number.isFinite(Number(anchor.x)) || !Number.isFinite(Number(anchor.y)) || count <= 0) {
    return [];
  }
  return Array.from({ length: count }, (_value, index) => ({
    x: anchor.x,
    y: anchor.y,
    offsetX: index * 22 - (count - 1) * 22 / 2,
    offsetY: index * -6,
    rotation: (index - (count - 1) / 2) * 4
  }));
}
function resolveAttackTargetAnchor(field, source, target) {
  const resolvedTarget = target || field.getDirectAttackViewportCenter(source?.player || 0);
  if (Array.isArray(resolvedTarget)) {
    return field.getViewportCenter(resolvedTarget[0]);
  }
  if (resolvedTarget?.x !== void 0) {
    return resolvedTarget;
  }
  return field.getViewportCenter(resolvedTarget);
}
function createDuelPresentationLayoutService() {
  function resolveAnnouncementPresentation(field, card) {
    const mode = typeof card?.mode === "string" ? card.mode : "legacy_preview", usesFullscreenFlasher = summonModes.has(mode) || !card?.source;
    if (!usesFullscreenFlasher) {
      return {
        type: "pulse",
        cards: [card.source],
        duration: 1e3
      };
    }
    return {
      type: "flasher",
      payload: Object.assign({}, card, {
        duration: Math.max(120, Number(card?.duration || 500)),
        sourceAnchor: card?.source ? field.getViewportCenter(card.source) : null
      })
    };
  }
  function resolveRevealPresentation(field, cards = [], options = {}) {
    if (!Array.isArray(cards) || !cards.length) {
      return null;
    }
    const call = options.call || "panel", player = normalizePlacementNumber(options.player, 0), duration = resolveRevealDuration(options.duration);
    if (call === "confirm_decktop" || call === "deck_top") {
      const anchor = field.getPileViewportCenter(player, "DECK"), placements = buildStackedRevealPlacements(anchor, cards.length);
      if (!placements.length) {
        return null;
      }
      return {
        cards,
        placements,
        duration,
        mode: call
      };
    }
    if (call === "confirm_extratop") {
      const anchor = field.getPileViewportCenter(player, "EXTRA"), placements = buildStackedRevealPlacements(anchor, cards.length);
      if (!placements.length) {
        return null;
      }
      return {
        cards,
        placements,
        duration,
        mode: call
      };
    }
    if (call === "confirm_cards") {
      const placements = cards.map((card) => {
        const center = field.getViewportCenter(card);
        if (!center) {
          return null;
        }
        return {
          x: center.x,
          y: center.y,
          offsetX: 0,
          offsetY: 0,
          rotation: 0
        };
      });
      if (!placements.every(Boolean)) {
        return null;
      }
      return {
        cards,
        placements,
        duration,
        mode: call
      };
    }
    return null;
  }
  function resolveAttackAnimation(field, source, target, duration = 720) {
    const from = field.getViewportCenter(source), to = resolveAttackTargetAnchor(field, source, target);
    if (!from || !to) {
      return null;
    }
    return {
      from,
      to,
      duration
    };
  }
  return {
    resolveAnnouncementPresentation,
    resolveAttackAnimation,
    resolveRevealPresentation
  };
}

// server/ui/services/duel-screen-controller.service.js
var defaultPresentationLayoutService = createDuelPresentationLayoutService();
function createDefaultLifepointState(store2) {
  return {
    store: store2,
    state: {
      lifepoints: [8e3, 8e3],
      turn: 1,
      names: ["Player 1", "Player 2"],
      lpDeltas: {
        0: null,
        1: null
      },
      playerHints: {
        0: [],
        1: []
      }
    },
    waiting: false,
    maxLifepoints: 8e3
  };
}
function createDuelScreenController(store2, chat, databaseSystem, dependencies = {}) {
  const createFieldState = dependencies.createFieldState || ((state, nextStore, nextDatabaseSystem, fieldDependencies2 = {}) => FieldState(state, nextStore, nextDatabaseSystem, fieldDependencies2)), createCardInfo = dependencies.createCardInfo || ((nextDatabaseSystem) => CardInfo(nextDatabaseSystem)), createChainerState = dependencies.createChainerState || ((nextStore) => ChainerState(nextStore)), createControlButtonsState = dependencies.createControlButtonsState || ((nextStore) => ControlButtonsState(nextStore)), createLifepointState2 = dependencies.createLifepointState || ((nextStore) => createDefaultLifepointState(nextStore)), presentationLayoutService = dependencies.presentationLayoutService || defaultPresentationLayoutService, updateCardInfoImpl = dependencies.updateCardInfo || updateCardInfo, updateLifepointStateImpl = dependencies.updateLifepointState || updateLifepointState, updateControlButtonsImpl = dependencies.updateControlButtons || updateControlButtons, enableControlButtonsImpl = dependencies.enableControlButtons || enableControlButtons, getActionableDeckForControlsImpl = dependencies.getActionableDeckForControls || getActionableDeckForControls, getIdleCommandPileHintsForControlsImpl = dependencies.getIdleCommandPileHintsForControls || getIdleCommandPileHintsForControls, getIdleCommandPileActionCoversForControlsImpl = dependencies.getIdleCommandPileActionCoversForControls || getIdleCommandPileActionCoversForControls, getIdleCommandFieldActionCoversForControlsImpl = dependencies.getIdleCommandFieldActionCoversForControls || getIdleCommandFieldActionCoversForControls, triggerFlasherImpl = dependencies.triggerFlasher || triggerFlasher, triggerFieldRevealImpl = dependencies.triggerFieldReveal || triggerFieldReveal, triggerAttackAnimationImpl = dependencies.triggerAttackAnimation || triggerAttackAnimation, triggerPhaseBannerImpl = dependencies.triggerPhaseBanner || triggerPhaseBanner, triggerRevealerImpl = dependencies.triggerRevealer || triggerRevealer, triggerChainerImpl = dependencies.triggerChainer || triggerChainer, handleChainerQuestionImpl = dependencies.handleChainerQuestion || handleChainerQuestion, handleChainerSortQuestionImpl = dependencies.handleChainerSortQuestion || handleChainerSortQuestion, resetChainerDuelStateImpl = dependencies.resetChainerDuelState || resetChainerDuelState, closeChainerImpl = dependencies.closeChainer || closeChainer, closeRevealerImpl = dependencies.closeRevealer || closeRevealer, closeIdleExtraDeckViewerImpl = dependencies.closeIdleExtraDeckViewer || closeIdleExtraDeckViewer, closeDeckDialogImpl = dependencies.closeDeckDialog || closeDeckDialog, closeSelectPositionDialogImpl = dependencies.closeSelectPositionDialog || closeSelectPositionDialog, closeSelectAttributesDialogImpl = dependencies.closeSelectAttributesDialog || closeSelectAttributesDialog, closeAnnounceCardDialogImpl = dependencies.closeAnnounceCardDialog || closeAnnounceCardDialog, closeYesNoDialogImpl = dependencies.closeYesNoDialog || closeYesNoDialog, closeSelectOptionDialogImpl = dependencies.closeSelectOptionDialog || closeSelectOptionDialog, disposeCardInfoImpl = dependencies.disposeCardInfo || disposeCardInfo, disposeChainerImpl = dependencies.disposeChainer || disposeChainer, disposeAttackAnimationImpl = dependencies.disposeAttackAnimation || disposeAttackAnimation, disposePhaseBannerImpl = dependencies.disposePhaseBanner || disposePhaseBanner, disposeFieldRevealImpl = dependencies.disposeFieldReveal || disposeFieldReveal, disposeFlasherImpl = dependencies.disposeFlasher || disposeFlasher, disposeLifepointStateImpl = dependencies.disposeLifepointState || disposeLifepointState, disposeRevealerImpl = dependencies.disposeRevealer || disposeRevealer, disposeIdleExtraDeckViewerImpl = dependencies.disposeIdleExtraDeckViewer || disposeIdleExtraDeckViewer, isManualMode = dependencies.isManualMode || (() => Boolean(globalThis.app?.manual)), fieldDependencies = dependencies.fieldDependencies || {};
  function instantiateFieldState(state = { info: {}, field: {} }) {
    return createFieldState(state, store2, databaseSystem, fieldDependencies);
  }
  let field = instantiateFieldState(), info = createCardInfo(databaseSystem), chainer = createChainerState(store2), controls = createControlButtonsState(store2), lifepoints = createLifepointState2(store2), cleanup = () => {
  };
  const controller = {
    databaseSystem,
    state: {
      lastUpdate: {}
    },
    store: store2,
    sidechat: chat
  };
  Object.defineProperties(controller, {
    field: {
      enumerable: true,
      get() {
        return field;
      },
      set(value) {
        field = value;
      }
    },
    info: {
      enumerable: true,
      get() {
        return info;
      },
      set(value) {
        info = value;
      }
    },
    chainer: {
      enumerable: true,
      get() {
        return chainer;
      },
      set(value) {
        chainer = value;
      }
    },
    controls: {
      enumerable: true,
      get() {
        return controls;
      },
      set(value) {
        controls = value;
      }
    },
    lifepoints: {
      enumerable: true,
      get() {
        return lifepoints;
      },
      set(value) {
        lifepoints = value;
      }
    },
    cleanup: {
      enumerable: true,
      get() {
        return cleanup;
      },
      set(value) {
        cleanup = typeof value === "function" ? value : () => {
        };
      }
    }
  });
  function clearDuelScreen() {
    controller.field = instantiateFieldState();
    resetChainerDuelStateImpl(controller.chainer);
  }
  function handleDuelManualCardClick(event) {
    enableControlButtonsImpl(controller.controls, event.card, { x: event.x, y: event.y });
    controller.store.emit({ action: "RENDER" });
    return event;
  }
  function handleDuelDeckCardClick(event) {
    enableControlButtonsImpl(controller.controls, event.card, { x: event.x, y: event.y });
    controller.store.emit({ action: "RENDER" });
    return event;
  }
  function handleDuelCardClick(event) {
    const overlayMaterials = controller.field.getOverlayViewerDeck(event.card), controlTarget = Number(event.card?.overlayindex || 0) > 0 ? controller.field.getStackHost(event.card) || event.card : event.card;
    if (isManualMode()) {
      return handleDuelManualCardClick(event);
    }
    if (!event.viewDeck && ["EXTRA", "GRAVE", "BANISHED"].includes(event.card.location)) {
      const deck = getActionableDeckForControlsImpl(
        controller.controls,
        controller.field.getDeck(event.card.player, event.card.location)
      );
      enableControlButtonsImpl(controller.controls, Object.assign({}, event.card, {
        pile: true,
        deck
      }), { x: event.x, y: event.y });
      controller.store.emit({ action: "RENDER" });
      return event;
    }
    if (event.card.location === "DECK") {
      return void 0;
    }
    enableControlButtonsImpl(controller.controls, Object.assign({}, controlTarget, {
      overlayMaterials
    }), { x: event.x, y: event.y });
    controller.store.emit({ action: "RENDER" });
    return event;
  }
  function handleDuelHover(event) {
    if (event?.clear) {
      controller.field.clearRelationHighlights();
      controller.store.emit({ action: "RENDER" });
      return null;
    }
    if (event?.card) {
      controller.field.applyRelationHighlights(event.card);
    }
    if (!event?.id) {
      controller.store.emit({ action: "RENDER" });
      return void 0;
    }
    const description = updateCardInfoImpl(controller.info, {
      id: event.id
    });
    controller.store.emit({ action: "RENDER" });
    return {
      id: event.id,
      description
    };
  }
  function updateDuelScreen(update) {
    updateLifepointStateImpl(controller.lifepoints, {
      lifepoints: update.lifepoints,
      turn: update.turn,
      names: update.names,
      playerHints: update.playerHints
    });
    controller.field.phase(update.phase);
  }
  function idleDuelScreen(commands) {
    updateControlButtonsImpl(controller.controls, commands);
    controller.field.setPileCommandHints(getIdleCommandPileHintsForControlsImpl(controller.controls));
    controller.field.setActionSpinners([
      ...getIdleCommandPileActionCoversForControlsImpl(controller.controls),
      ...getIdleCommandFieldActionCoversForControlsImpl(controller.controls)
    ]);
  }
  function flashDuelScreen(card) {
    const presentation = presentationLayoutService.resolveAnnouncementPresentation(controller.field, card);
    if (!presentation) {
      return;
    }
    if (presentation.type === "pulse") {
      controller.field.pulseAnnouncementCards(presentation.cards, presentation.duration);
      return;
    }
    triggerFlasherImpl(controller.store, presentation.payload);
  }
  function previewDuelReveal(cards = [], options = {}) {
    const presentation = presentationLayoutService.resolveRevealPresentation(controller.field, cards, options);
    if (!presentation) {
      return false;
    }
    triggerFieldRevealImpl(controller.store, presentation);
    return true;
  }
  function disposeDuelScreen() {
    controller.cleanup?.();
    controller.cleanup = () => {
    };
    disposeCardInfoImpl(controller.info);
    disposeChainerImpl(controller.chainer);
    disposeAttackAnimationImpl(controller.store);
    disposePhaseBannerImpl(controller.store);
    disposeFieldRevealImpl(controller.store);
    disposeFlasherImpl(controller.store);
    disposeLifepointStateImpl(controller.lifepoints);
    disposeRevealerImpl(controller.store);
    disposeIdleExtraDeckViewerImpl(controller.store);
    closeSelectPositionDialogImpl(controller.store);
    closeSelectAttributesDialogImpl(controller.store);
    closeAnnounceCardDialogImpl(controller.store);
    closeYesNoDialogImpl(controller.store);
    closeSelectOptionDialogImpl(controller.store);
    controller.field?.dispose?.();
  }
  function registerDuelScreenListeners() {
    const listeners = [
      controller.store.on("CARD_HOVER", (event) => handleDuelHover(event)),
      controller.store.on("DECK_CARD_CLICK", (event) => handleDuelDeckCardClick(event)),
      controller.store.on("CARD_CLICK", (event) => handleDuelCardClick(event))
    ];
    return () => {
      listeners.forEach((unsubscribe) => {
        unsubscribe?.();
      });
    };
  }
  controller.clear = () => clearDuelScreen();
  controller.onCardClick = (event) => handleDuelCardClick(event);
  controller.onManualCardClick = (event) => handleDuelManualCardClick(event);
  controller.onDeckCardClick = (event) => handleDuelDeckCardClick(event);
  controller.onHover = (event) => handleDuelHover(event);
  controller.update = (update) => updateDuelScreen(update);
  controller.updateField = (nextField) => controller.field.updateField(nextField);
  controller.hydrateField = (nextField) => controller.field.hydrateField(nextField);
  controller.replaceField = (nextField) => controller.field.replaceField(nextField);
  controller.setDisabledZones = (zones) => controller.field.setDisabledZones(zones);
  controller.idle = (commands) => idleDuelScreen(commands);
  controller.flash = (card) => flashDuelScreen(card);
  controller.reveal = (cards, state = {}) => triggerRevealerImpl(controller.store, { active: true, cards, ...state });
  controller.chain = (cards, state = {}) => triggerChainerImpl(controller.chainer, { active: true, cards, ...state });
  controller.handleChainQuestion = (options = {}, state = {}) => handleChainerQuestionImpl(controller.chainer, options, state);
  controller.handleSortChainQuestion = (options = {}, state = {}) => handleChainerSortQuestionImpl(controller.chainer, options, state);
  controller.clearChainQuestion = () => closeChainerImpl(controller.chainer);
  controller.resetChainState = () => resetChainerDuelStateImpl(controller.chainer);
  controller.closeRevealer = () => {
    closeRevealerImpl(controller.store);
    closeIdleExtraDeckViewerImpl(controller.store);
    closeDeckDialogImpl(controller.store);
  };
  controller.updateChainOverlay = (contract) => controller.field.updateChainOverlay(contract);
  controller.clearChainOverlays = () => controller.field.clearChainOverlays();
  controller.animateBattle = (source, target) => controller.field.pulseBattleOverlay(source, target);
  controller.animateAttack = (source, target, duration = 720) => {
    const animation = presentationLayoutService.resolveAttackAnimation(controller.field, source, target, duration);
    if (animation) {
      triggerAttackAnimationImpl(controller.store, animation);
    }
  };
  controller.showPhaseBanner = (text, duration) => {
    triggerPhaseBannerImpl(controller.store, {
      text,
      duration
    });
  };
  controller.previewReveal = (cards = [], options = {}) => previewDuelReveal(cards, options);
  controller.pulseLifepoints = (player, value, tone, duration) => pulseLifepointDelta(controller.lifepoints, player, value, tone, duration);
  controller.pulseSelectionCards = (cards, duration) => controller.field.pulseSelectionCards(cards, duration);
  controller.pulseTargetCards = (cards, duration) => controller.field.pulseTargetCards(cards, duration);
  controller.disableSelection = () => controller.field.disableSelection();
  controller.select = (query) => controller.field.select(query);
  controller.dispose = () => disposeDuelScreen();
  controller.cleanup = registerDuelScreenListeners();
  return controller;
}

// server/ui/components/duel/duel.component.jsx
var defaultFieldDomEffectsService = defaultDuelFieldDomEffectsService;
function LegacyControllerSlot({ id, className, children }) {
  return /* @__PURE__ */ import_react27.default.createElement("div", { id, className }, children);
}
function DuelRuntimeScene({
  duel,
  fieldDomEffectsService = defaultFieldDomEffectsService
}) {
  (0, import_react27.useEffect)(() => {
    fieldDomEffectsService.layoutHand(0);
    fieldDomEffectsService.layoutHand(1);
  });
  if (!duel) {
    return null;
  }
  return /* @__PURE__ */ import_react27.default.createElement("div", { className: duel_component_module_default.root }, /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "sidechat", key: "sidechat" }, /* @__PURE__ */ import_react27.default.createElement(MountedSideChat, { controller: duel.sidechat })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "extracontrols", key: "extracontrols" }, /* @__PURE__ */ import_react27.default.createElement(
    MountedExtraControls,
    {
      controls: duel.controls,
      databaseSystem: duel.databaseSystem,
      chainController: duel.chainer
    }
  )), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "actions", key: "actions" }, /* @__PURE__ */ import_react27.default.createElement(MountedControlButtons, { controller: duel.controls })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "ingamecardimage", key: "ingamecardimage" }, /* @__PURE__ */ import_react27.default.createElement(MountedCardInfo, { controller: duel.info })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "lifepoints", key: "lifepoints" }, /* @__PURE__ */ import_react27.default.createElement(MountedLifepointDisplay, { controller: duel.lifepoints })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "phasebanner", key: "phasebanner" }, /* @__PURE__ */ import_react27.default.createElement(MountedPhaseBanner, { store: duel.store })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "fieldreveal", key: "fieldreveal" }, /* @__PURE__ */ import_react27.default.createElement(MountedFieldRevealOverlay, { store: duel.store })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "attacklayer", key: "attacklayer" }, /* @__PURE__ */ import_react27.default.createElement(MountedAttackAnimationLayer, { store: duel.store })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "revealer", key: "revealer" }, /* @__PURE__ */ import_react27.default.createElement(MountedRevealer, { store: duel.store })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "idleExtraDeckViewer", key: "idleExtraDeckViewer" }, /* @__PURE__ */ import_react27.default.createElement(MountedIdleExtraDeckViewer, { store: duel.store })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "chain", key: "chain" }, /* @__PURE__ */ import_react27.default.createElement(MountedChainer, { controller: duel.chainer })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "positionDialog", key: "positionDialog" }, /* @__PURE__ */ import_react27.default.createElement(MountedSelectPosition, { store: duel.store })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "yesnoDialog", key: "yesnoDialog" }, /* @__PURE__ */ import_react27.default.createElement(MountedYesNoDialog, { store: duel.store })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "optionDialog", key: "optionDialog" }, /* @__PURE__ */ import_react27.default.createElement(MountedSelectOptionDialog, { store: duel.store })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "announceCardDialog", key: "announceCardDialog" }, /* @__PURE__ */ import_react27.default.createElement(AnnounceCardDialog, { store: duel.store, database: duel.databaseSystem })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "viewDecks", key: "viewDecks" }, /* @__PURE__ */ import_react27.default.createElement(MountedDeckDialog, { store: duel.store })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "announcer", key: "announcer" }, /* @__PURE__ */ import_react27.default.createElement(MountedFlasher, { store: duel.store })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { id: "attributes", key: "attributes" }, /* @__PURE__ */ import_react27.default.createElement(MountedSelectAttributes, { store: duel.store })), /* @__PURE__ */ import_react27.default.createElement(LegacyControllerSlot, { className: "field newfield", key: "field-newfield" }, /* @__PURE__ */ import_react27.default.createElement(
    "div",
    {
      id: "automationduelfield",
      className: "fieldimage",
      style: {
        display: "block"
      }
    },
    /* @__PURE__ */ import_react27.default.createElement(MountedField, { controller: duel.field })
  )));
}
function DuelScreenState(store2, chat, databaseSystem, dependencies = {}) {
  return createDuelScreenController(store2, chat, databaseSystem, dependencies);
}
function DuelScreen(store2, chat, databaseSystem, dependencies = {}) {
  return DuelScreenState(store2, chat, databaseSystem, dependencies);
}

// server/ui/services/duel-hint.service.js
var DEFAULT_PROMPT_IDS = Object.freeze({
  MSG_SELECT_CARD: 560,
  MSG_SELECT_SUM: 560,
  MSG_SELECT_TRIBUTE: 531,
  MSG_SELECT_DISFIELD: 570,
  MSG_ANNOUNCE_ATTRIB: 562,
  MSG_ANNOUNCE_RACE: 563,
  MSG_ANNOUNCE_CARD: 564,
  MSG_ANNOUNCE_NUMBER: 565
});

// server/ui/services/game-dialog.service.js
var duelMessageTypes = {
  2: "MSG_HINT",
  3: "MSG_WAITING",
  10: "MSG_SELECT_BATTLECMD",
  11: "MSG_SELECT_IDLECMD",
  12: "MSG_SELECT_EFFECTYN",
  13: "MSG_SELECT_YESNO",
  14: "MSG_SELECT_OPTION",
  15: "MSG_SELECT_CARD",
  16: "MSG_SELECT_CHAIN",
  18: "MSG_SELECT_PLACE",
  19: "MSG_SELECT_POSITION",
  20: "MSG_SELECT_TRIBUTE",
  21: "MSG_SORT_CHAIN",
  22: "MSG_SELECT_COUNTER",
  23: "MSG_SELECT_SUM",
  24: "MSG_SELECT_DISFIELD",
  25: "MSG_SORT_CARD",
  26: "MSG_SELECT_UNSELECT_CARD",
  30: "MSG_CONFIRM_DECKTOP",
  31: "MSG_CONFIRM_CARDS",
  32: "MSG_SHUFFLE_DECK",
  33: "MSG_SHUFFLE_HAND",
  36: "MSG_SHUFFLE_SET_CARD",
  38: "MSG_DECK_TOP",
  39: "MSG_SHUFFLE_EXTRA",
  42: "MSG_CONFIRM_EXTRATOP",
  60: "MSG_SUMMONING",
  62: "MSG_SPSUMMONING",
  64: "MSG_FLIPSUMMONING",
  70: "MSG_CHAINING",
  80: "MSG_CARD_SELECTED",
  81: "MSG_RANDOM_SELECTED",
  83: "MSG_BECOME_TARGET",
  95: "MSG_UNEQUIP",
  96: "MSG_CARD_TARGET",
  97: "MSG_CANCEL_TARGET",
  101: "MSG_ADD_COUNTER",
  102: "MSG_REMOVE_COUNTER",
  112: "MSG_ATTACK_DISABLED",
  120: "MSG_MISSED_EFFECT",
  121: "MSG_BE_CHAIN_TARGET",
  122: "MSG_CREATE_RELATION",
  123: "MSG_RELEASE_RELATION",
  130: "MSG_TOSS_COIN",
  131: "MSG_TOSS_DICE",
  132: "MSG_ROCK_PAPER_SCISSORS",
  133: "MSG_HAND_RES",
  141: "MSG_ANNOUNCE_ATTRIB",
  140: "MSG_ANNOUNCE_RACE",
  142: "MSG_ANNOUNCE_CARD",
  143: "MSG_ANNOUNCE_NUMBER",
  161: "MSG_TAG_SWAP",
  163: "MSG_AI_NAME",
  164: "MSG_SHOW_HINT",
  170: "MSG_MATCH_KILL",
  180: "MSG_CUSTOM_MSG",
  190: "MSG_REMOVE_CARDS"
};
function resolveDuelMessageName(message, fallback) {
  if (typeof fallback === "string" && fallback.length) {
    return fallback;
  }
  if (typeof message?.command === "string" && message.command.length) {
    return message.command;
  }
  if (typeof message?.type === "string" && message.type.length) {
    return message.type;
  }
  if (typeof message?.type === "number") {
    return duelMessageTypes[message.type];
  }
  return void 0;
}
function getRevealCards(options) {
  if (Array.isArray(options?.reveal_cards)) {
    return options.reveal_cards;
  }
  if (Array.isArray(options?.select_options)) {
    return options.select_options;
  }
  if (Array.isArray(options?.selectable_targets)) {
    return options.selectable_targets;
  }
  return [];
}
function isFieldZoneSelectionCard(card) {
  return card && (card.location === "MONSTERZONE" || card.location === "SPELLZONE") && Number.isInteger(card.player) && Number.isInteger(card.index);
}
function canUseZoneSelectorsForCards(cards) {
  return Array.isArray(cards) && cards.length > 0 && cards.every(isFieldZoneSelectionCard);
}
function buildZoneSelectionQuery(cards) {
  return {
    zones: cards.map((card) => ({
      player: card.player,
      location: card.location,
      index: card.index
    }))
  };
}
function getZoneSelectionCard(cards, zoneAnswer, orient2) {
  if (!Array.isArray(cards) || !zoneAnswer) {
    return null;
  }
  const [player, location, index] = Array.isArray(zoneAnswer.i) ? zoneAnswer.i : [];
  const locationMap = {
    4: "MONSTERZONE",
    8: "SPELLZONE"
  };
  const resolvedLocation = locationMap[location], normalizedPlayer = Number(player), normalizedIndex = Number(index), directMatch = cards.find((card) => card && card.player === normalizedPlayer && card.location === resolvedLocation && card.index === normalizedIndex);
  if (directMatch) {
    return directMatch;
  }
  return cards.find((card) => card && card.player === orient2(normalizedPlayer) && card.location === resolvedLocation && card.index === normalizedIndex);
}
function toggleOrderedRevealSelection(selection, option) {
  const current = Array.isArray(selection) ? selection.slice() : [], index = current.indexOf(option);
  if (index >= 0) {
    current.splice(index, 1);
    return current;
  }
  current.push(option);
  return current;
}
function applyCounterAllocation(allocations, cards, totalRequired, option, direction = 1) {
  const next = Array.isArray(allocations) ? allocations.slice() : Array.from({ length: Array.isArray(cards) ? cards.length : 0 }, () => 0), target = Number(next[option] || 0), available = Number(cards?.[option]?.count || 0), currentTotal = next.reduce((sum, value) => sum + (Number(value) || 0), 0);
  if (direction < 0) {
    if (target > 0) {
      next[option] = target - 1;
    }
    return next;
  }
  if (available <= 0 || target >= available || currentTotal >= Number(totalRequired || 0)) {
    return next;
  }
  next[option] = target + 1;
  return next;
}
function toLegacyRpsAnswer(choice) {
  switch (choice) {
    case "rock":
      return 0;
    case "paper":
      return 1;
    case "scissors":
      return 2;
    default:
      return 0;
  }
}
function toOcgcoreRpsAnswer(choice) {
  switch (choice) {
    case "rock":
      return 2;
    case "paper":
      return 3;
    case "scissors":
      return 1;
    default:
      return 2;
  }
}
function createGameDialogService(context2, helpers) {
  const { store: store2, questionState: questionState2, uiRuntimeState: uiRuntimeState2 } = context2;
  const { orient: orient2 } = helpers;
  function getDuelRuntime() {
    return context2.duelRuntime || null;
  }
  function setQuestionPrompt(text) {
    if (questionState2.promptTimer) {
      clearTimeout(questionState2.promptTimer);
      questionState2.promptTimer = null;
    }
    questionState2.prompt = typeof text === "string" ? text : "";
  }
  function showTransientPrompt(text, duration = 1400) {
    if (typeof text !== "string" || !text.trim()) {
      return;
    }
    const visibleDuration = Math.max(120, Number(duration || 1400));
    setQuestionPrompt(text);
    store2.emit({ action: "RENDER" });
    questionState2.promptTimer = setTimeout(() => {
      questionState2.prompt = "";
      questionState2.promptTimer = null;
      store2.emit({ action: "RENDER" });
    }, visibleDuration);
  }
  function buildQuestionSignature(message) {
    const command = resolveDuelMessageName(message, message?.command), promptText = typeof message?.prompt_text === "string" ? message.prompt_text : "";
    if (command === "MSG_ANNOUNCE_NUMBER") {
      const announcementValues = Array.isArray(message?.options?.announcement_values) ? message.options.announcement_values.map((value) => Number(value)) : Array.isArray(message?.options?.options) ? message.options.options.map((value) => Number(value)) : Array.isArray(message?.options?.values) ? message.options.values.map((value) => Number(value)) : [];
      return JSON.stringify({
        command,
        promptText,
        announcementValues
      });
    }
    return JSON.stringify({
      command,
      promptText,
      options: message?.options || null
    });
  }
  function clearQuestionTracking() {
    questionState2.signature = null;
    questionState2.answerPending = false;
  }
  function hasActiveZoneSelectorQuestion() {
    if (questionState2.signature === null || questionState2.answerPending) {
      return false;
    }
    if (questionState2.command === "MSG_SELECT_PLACE" || questionState2.command === "MSG_SELECT_DISFIELD") {
      return true;
    }
    return canUseZoneSelectorsForCards(getRevealCards(questionState2.options));
  }
  function hasActiveAnnounceNumberQuestion() {
    return questionState2.signature !== null && !questionState2.answerPending && questionState2.command === "MSG_ANNOUNCE_NUMBER";
  }
  function sendQuestionAnswer(answer, label) {
    const duelRuntime = getDuelRuntime();
    if (questionState2.answerPending) {
      console.log(`[ygopro/question] ignoring ${label} answer while a response is already pending`, {
        question: questionState2.id,
        answer
      });
      return;
    }
    console.log(`[ygopro/question] sending ${label} answer`, {
      question: questionState2.id,
      answer
    });
    questionState2.answerPending = true;
    duelRuntime?.sendQuestionAnswer(answer, questionState2.id);
  }
  function updateSelectableCardSelection(selectedCard, answerIndex, rerender) {
    if (selectedCard?.selected) {
      const remove = questionState2.selection.indexOf(answerIndex);
      if (remove >= 0) {
        questionState2.selection.splice(remove, 1);
      }
      selectedCard.selected = false;
      rerender();
      return;
    }
    questionState2.selection.push(answerIndex);
    if (questionState2.selection.length === questionState2.max) {
      sendQuestionAnswer(createRevealSelectionAnswer(questionState2.selection), "selection");
      return;
    }
    if (questionState2.selection.length > questionState2.min) {
      promptForAdditionalTargets(selectedCard, rerender);
      return;
    }
    if (selectedCard) {
      selectedCard.selected = true;
    }
    setTimeout(() => {
      rerender();
    }, 300);
  }
  function resolveCommandAnswer(card, options = questionState2.options) {
    if (!card || !options || typeof options !== "object") {
      return card;
    }
    if (typeof card.type === "string" && Number.isInteger(card.i)) {
      return {
        type: card.type,
        i: card.i
      };
    }
    const commandKeys = [
      "summonable_cards",
      "summons",
      "spsummonable_cards",
      "special_summons",
      "repositionable_cards",
      "pos_changes",
      "msetable_cards",
      "monster_sets",
      "ssetable_cards",
      "spell_sets",
      "activatable_cards",
      "activates",
      "select_options",
      "attackable_cards",
      "attacks",
      "chains"
    ];
    const hasKnownCardIdentity2 = (id) => !(id === void 0 || id === null || id === "" || id === "unknown");
    for (const type of commandKeys) {
      const optionSet = Array.isArray(options[type]) ? options[type] : [];
      const matchIndex = optionSet.findIndex((option) => option && option.index === card.index && option.location === card.location && (option.player === void 0 || card.player === void 0 || option.player === card.player) && (option.id === void 0 || !hasKnownCardIdentity2(option.id) || !hasKnownCardIdentity2(card.id) || option.id === card.id));
      if (matchIndex >= 0) {
        return createCommandButtonAnswer(type, matchIndex);
      }
    }
    return createCommandButtonAnswer(card.type, card.i);
  }
  function createRevealSelectionAnswer(indices) {
    switch (questionState2.command) {
      case "MSG_SELECT_TRIBUTE":
        return createSelectTributeAnswer(indices);
      case "MSG_SELECT_SUM":
        return createSelectSumAnswer(indices);
      case "MSG_SELECT_UNSELECT_CARD":
        return createSelectUnselectCardAnswer(indices[0] ?? null);
      default:
        return createSelectCardAnswer(indices);
    }
  }
  function resolveRevealCardId(card) {
    const numericId = Number(card?.id ?? card?.code ?? 0);
    if (Number.isInteger(numericId) && numericId > 0) {
      return numericId;
    }
    return card?.id ?? card?.code ?? null;
  }
  function hydrateRevealCard(card, database = context2.databaseSystem) {
    if (!card || typeof card !== "object") {
      return card;
    }
    const id = resolveRevealCardId(card), dbEntry = Number.isInteger(Number(id)) ? database.find((entry) => entry.id === Number(id)) || {} : {};
    return {
      ...dbEntry,
      ...card,
      id
    };
  }
  function hydrateRevealCardList(cards, database = context2.databaseSystem) {
    return Array.isArray(cards) ? cards.map((card) => hydrateRevealCard(card, database)) : [];
  }
  function renderRevealQuestion(cards, state = {}) {
    getDuelRuntime()?.openReveal(hydrateRevealCardList(cards), {
      dismissable: false,
      ...state,
      cards2: hydrateRevealCardList(state.cards2)
    });
  }
  function promptForAdditionalTargets(selectedCard, rerender) {
    const duelRuntime = getDuelRuntime();
    if (selectedCard) {
      selectedCard.selected = true;
    }
    duelRuntime?.openYesNoDialog({
      promptText: "Select Additional Targets?",
      onYes: () => {
        setTimeout(() => {
          rerender();
        }, 300);
      },
      onNo: () => {
        sendQuestionAnswer(createRevealSelectionAnswer(questionState2.selection), "partial selection");
      }
    });
    store2.emit({ action: "RENDER" });
  }
  function getCounterTargets(options = questionState2.options) {
    if (Array.isArray(options?.reveal_cards)) {
      return options.reveal_cards;
    }
    return Array.isArray(options?.counter_targets) ? options.counter_targets : [];
  }
  function rerenderCounterQuestion() {
    const counterTargets = getCounterTargets();
    renderRevealQuestion(counterTargets, {
      mode: "counter",
      counterAllocations: questionState2.counterAllocations,
      remaining: Math.max(0, questionState2.counterTarget - questionState2.counterAllocations.reduce((sum, value) => sum + (Number(value) || 0), 0))
    });
  }
  function rerenderSortQuestion() {
    renderRevealQuestion(getRevealCards(questionState2.options), {
      mode: "sort",
      selectionOrder: questionState2.selection
    });
  }
  function setupQuestion(message) {
    const duelRuntime = getDuelRuntime(), command = message.command, nextQuestionSignature = buildQuestionSignature(message), repeatedActiveQuestion = !questionState2.answerPending && nextQuestionSignature === questionState2.signature && command === questionState2.command;
    questionState2.id = message.uuid;
    questionState2.command = command;
    questionState2.min = Number(message.options?.select_min || 0);
    questionState2.max = Number(message.options?.select_max || 0);
    setQuestionPrompt(message.prompt_text || "");
    if (Array.isArray(message.field)) {
      duelRuntime?.hydrateField(message.field);
    }
    if (repeatedActiveQuestion) {
      questionState2.options = message.options || questionState2.options;
      if (command === "MSG_SELECT_IDLECMD" || command === "MSG_SELECT_BATTLECMD") {
        duelRuntime?.idle(questionState2.options);
      }
      if (command === "MSG_SELECT_CHAIN") {
        questionState2.min = 1;
        questionState2.max = 1;
        duelRuntime?.handleChainQuestion(questionState2.options, {
          promptText: message.prompt_text || ""
        });
      }
      if (command === "MSG_SORT_CHAIN") {
        questionState2.selection = [];
        if (!duelRuntime?.handleSortChainQuestion(questionState2.options, {
          promptText: message.prompt_text || ""
        })) {
          rerenderSortQuestion();
        }
      }
      store2.emit({ action: "RENDER" });
      return;
    }
    questionState2.signature = nextQuestionSignature;
    questionState2.answerPending = false;
    questionState2.options = message.options || {};
    questionState2.selection = [];
    questionState2.counterAllocations = [];
    questionState2.counterTarget = 0;
    duelRuntime?.disableSelection();
    duelRuntime?.idle({});
    duelRuntime?.clearChainQuestion();
    switch (command) {
      case "MSG_ROCK_PAPER_SCISSORS":
        duelRuntime?.showChoicePrompt("rps", {
          protocol: "ocgcore",
          runtimeMode: "choice",
          slot: uiRuntimeState2.orientation ?? 0
        });
        break;
      case "MSG_SELECT_IDLECMD":
      case "MSG_SELECT_BATTLECMD":
        duelRuntime?.idle(message.options);
        break;
      case "MSG_SELECT_PLACE":
      case "MSG_SELECT_DISFIELD":
        duelRuntime?.select({
          ...message.options.zone_selection || { zones: [] },
          command,
          player: message.options.player
        });
        break;
      case "MSG_SELECT_OPTION":
        duelRuntime?.openSelectOptionDialog({
          active: true,
          options: message.options.option_rows || [],
          selectedIndex: 0
        });
        break;
      case "MSG_SELECT_CARD":
      case "MSG_SELECT_TRIBUTE":
      case "MSG_CONFIRM_CARDS":
        if (message.options.zone_selection) {
          duelRuntime?.select({
            ...message.options.zone_selection,
            command,
            player: message.options.player
          });
          break;
        }
        renderRevealQuestion(message.options.reveal_cards || []);
        break;
      case "MSG_SELECT_UNSELECT_CARD":
        questionState2.min = 1;
        questionState2.max = 1;
        renderRevealQuestion(message.options.reveal_cards || [], {
          cards2: message.options.secondary_reveal_cards || []
        });
        break;
      case "MSG_SELECT_SUM":
        questionState2.max = 1;
        questionState2.selection.push(Number(message.options.must_select_count || 0));
        if (message.options.zone_selection) {
          duelRuntime?.select({
            ...message.options.zone_selection,
            command,
            player: message.options.player
          });
          break;
        }
        renderRevealQuestion(message.options.reveal_cards || []);
        break;
      case "MSG_SELECT_COUNTER":
        questionState2.counterTarget = Number(message.options.count || message.options.select_max || 0);
        questionState2.counterAllocations = Array.from({
          length: getCounterTargets(message.options).length
        }, () => 0);
        rerenderCounterQuestion();
        break;
      case "MSG_SORT_CARD":
        questionState2.selection = [];
        rerenderSortQuestion();
        break;
      case "MSG_SORT_CHAIN":
        questionState2.selection = [];
        if (!duelRuntime?.handleSortChainQuestion(message.options || {}, {
          promptText: message.prompt_text || ""
        })) {
          rerenderSortQuestion();
        }
        break;
      case "MSG_SELECT_POSITION":
        duelRuntime?.openSelectPositionDialog(message.options);
        break;
      case "MSG_SELECT_EFFECTYN":
      case "MSG_SELECT_YESNO":
        duelRuntime?.openYesNoDialog({
          active: true,
          promptText: message.prompt_text || (command === "MSG_SELECT_EFFECTYN" ? "Use effect?" : "Confirm this action?")
        });
        break;
      case "MSG_SELECT_CHAIN":
        questionState2.min = 1;
        questionState2.max = 1;
        duelRuntime?.handleChainQuestion(message.options || {}, {
          promptText: message.prompt_text || ""
        });
        break;
      case "MSG_ANNOUNCE_ATTRIB":
      case "MSG_ANNOUNCE_RACE":
      case "MSG_ANNOUNCE_NUMBER":
        duelRuntime?.openSelectAttributesDialog({
          active: true,
          options: message.options.announcement_values || {},
          text: command === "MSG_ANNOUNCE_NUMBER" ? "Number" : command === "MSG_ANNOUNCE_RACE" ? "Race" : "Attribute",
          responseType: command
        });
        break;
      case "MSG_ANNOUNCE_CARD":
        duelRuntime?.openAnnounceCardDialog({
          opcodes: message.options.opcodes || []
        });
        break;
      default:
        break;
    }
  }
  function onZoneClick(message) {
    const duelRuntime = getDuelRuntime();
    if (context2.app.manual) {
      context2.app.manualControls?.selectionzoneonclick(message.manual.choice, message.manual.location);
      return;
    }
    if (canUseZoneSelectorsForCards(getRevealCards(questionState2.options))) {
      const revealCards = getRevealCards(questionState2.options);
      const selectedCard = getZoneSelectionCard(revealCards, message.automatic, orient2);
      const answerIndex = Number.isInteger(selectedCard?.i) ? selectedCard.i : revealCards.indexOf(selectedCard);
      if (answerIndex < 0) {
        return;
      }
      updateSelectableCardSelection(selectedCard, answerIndex, () => {
        duelRuntime?.select(buildZoneSelectionQuery(revealCards));
        store2.emit({ action: "RENDER" });
      });
      return;
    }
    sendQuestionAnswer(message.automatic, "ZONE_CLICK");
  }
  function onZoneHover(message) {
    getDuelRuntime()?.hoverFieldCard({
      player: message.player,
      location: message.location,
      index: message.index
    });
  }
  function onRevealCardClick(message) {
    if (questionState2.command === "MSG_SORT_CARD" || questionState2.command === "MSG_SORT_CHAIN") {
      questionState2.selection = toggleOrderedRevealSelection(questionState2.selection, message.option);
      rerenderSortQuestion();
      store2.emit({ action: "RENDER" });
      return;
    }
    const revealCards = getRevealCards(questionState2.options);
    const selectedCard = revealCards[message.option];
    const answerIndex = Number.isInteger(selectedCard?.i) ? selectedCard.i : message.option;
    updateSelectableCardSelection(selectedCard, answerIndex, () => {
      renderRevealQuestion(revealCards);
      store2.emit({ action: "RENDER" });
    });
  }
  function onRevealSortClick(message) {
    questionState2.selection = toggleOrderedRevealSelection(questionState2.selection, message.option);
    rerenderSortQuestion();
    store2.emit({ action: "RENDER" });
  }
  function onRevealCounterClick(message) {
    questionState2.counterAllocations = applyCounterAllocation(
      questionState2.counterAllocations,
      getCounterTargets(),
      questionState2.counterTarget,
      message.option,
      message.direction
    );
    rerenderCounterQuestion();
    store2.emit({ action: "RENDER" });
  }
  function onRevealConfirm() {
    const duelRuntime = getDuelRuntime();
    if (questionState2.command === "MSG_SELECT_COUNTER") {
      duelRuntime?.closeRevealer();
      sendQuestionAnswer(createSelectCounterAnswer(questionState2.counterAllocations), "REVEAL_CONFIRM_COUNTER");
      return;
    }
    if (questionState2.command === "MSG_SORT_CARD" || questionState2.command === "MSG_SORT_CHAIN") {
      duelRuntime?.closeRevealer();
      sendQuestionAnswer(createSortCardAnswer(questionState2.selection), "REVEAL_CONFIRM_SORT");
    }
  }
  function onRevealReset() {
    if (questionState2.command === "MSG_SELECT_COUNTER") {
      questionState2.counterAllocations = Array.from({
        length: getCounterTargets().length
      }, () => 0);
      rerenderCounterQuestion();
      return;
    }
    if (questionState2.command === "MSG_SORT_CARD" || questionState2.command === "MSG_SORT_CHAIN") {
      questionState2.selection = [];
      rerenderSortQuestion();
    }
  }
  function registerListeners() {
    store2.on("CONTROL_CLICK", (message) => {
      const answer = resolveCommandAnswer(message.card);
      console.log("control click", message, answer);
      sendQuestionAnswer(answer, "CONTROL_CLICK");
    });
    store2.on("SELECT_OPTION_CLICK", (message) => {
      sendQuestionAnswer(message.answer, "SELECT_OPTION_CLICK");
    });
    store2.on("PHASE_CLICK", (message) => {
      sendQuestionAnswer(message.phase, "PHASE_CLICK");
    });
    store2.on("RPS", (message) => {
      if (questionState2.command === "MSG_ROCK_PAPER_SCISSORS" && uiRuntimeState2.mode === "choice" && choiceStateMatches(uiRuntimeState2.choice, {
        mode: "rps",
        protocol: "ocgcore"
      })) {
        sendQuestionAnswer(
          createRockPaperScissorsAnswer(toOcgcoreRpsAnswer(message.answer)),
          "RPS"
        );
        return;
      }
      getDuelRuntime()?.sendLegacyChoiceAnswer(toLegacyRpsAnswer(message.answer));
    });
    store2.on("ZONE_CLICK", onZoneClick);
    store2.on("ZONE_HOVER", onZoneHover);
    store2.on("POSITION_CARD_CLICK", (message) => {
      sendQuestionAnswer(message.position, "POSITION_CARD_CLICK");
    });
    store2.on("YESNO_CLICK", (message) => {
      sendQuestionAnswer(message.option, "YESNO_CLICK");
    });
    store2.on("EMPTY_SPACE", () => {
      getDuelRuntime()?.closeRevealer();
      store2.emit({ action: "RENDER" });
    });
    store2.on("REVEAL_CARD_CLICK", onRevealCardClick);
    store2.on("REVEAL_SORT_CLICK", onRevealSortClick);
    store2.on("REVEAL_COUNTER_CLICK", onRevealCounterClick);
    store2.on("CHAIN_RESPONSE", (message) => {
      sendQuestionAnswer(message.answer, message.label || "CHAIN_RESPONSE");
    });
    store2.on("ANNOUNCE_SELECTION_CLICK", (message) => {
      sendQuestionAnswer(message.answer, "ANNOUNCE_SELECTION_CLICK");
    });
    store2.on("ANNOUNCE_CARD_PREVIEW", (message) => {
      if (!Number.isInteger(message?.id)) {
        return;
      }
      getDuelRuntime()?.previewCard(message.id);
    });
    store2.on("REVEALER_CLOSE", () => {
      if (questionState2.selection.length > questionState2.min) {
        sendQuestionAnswer(createRevealSelectionAnswer(questionState2.selection), "REVEALER_CLOSE");
      }
    });
    store2.on("REVEAL_CONFIRM", onRevealConfirm);
    store2.on("REVEAL_RESET", onRevealReset);
  }
  return {
    setQuestionPrompt,
    showTransientPrompt,
    clearQuestionTracking,
    hasActiveZoneSelectorQuestion,
    hasActiveAnnounceNumberQuestion,
    hydrateRevealCardList,
    renderRevealQuestion,
    setupQuestion,
    sendQuestionAnswer,
    resolveCommandAnswer,
    registerListeners
  };
}

// server/ui/services/game-passive-state.service.js
var duelSoundFiles = Object.freeze({
  activate: "/sounds/activate.wav",
  attack: "/sounds/attack.wav",
  coinflip: "/sounds/coinflip.wav",
  diceroll: "/sounds/diceroll.wav",
  equip: "/sounds/equip.wav",
  flip: "/sounds/flip.wav",
  soundactivateCard: "/sounds/activate.wav",
  soundattack: "/sounds/attack.wav",
  soundequip: "/sounds/equip.wav",
  soundflipSummon: "/sounds/flip.wav",
  soundspecialSummonFromExtra: "/sounds/specialsummon.wav",
  soundsummonCard: "/sounds/summon.wav",
  specialsummon: "/sounds/specialsummon.wav",
  summon: "/sounds/summon.wav"
});
function createPassiveGameStateService(context2, dialogService2) {
  const soundCache = /* @__PURE__ */ new Map();
  function getDuelRuntime() {
    return context2.duelRuntime || null;
  }
  function orient2(player, currentOrientation = context2.uiRuntimeState.orientation) {
    return currentOrientation ? player ? 0 : 1 : player;
  }
  function orientFieldQuery(query, currentOrientation = context2.uiRuntimeState.orientation) {
    if (!query || typeof query !== "object") {
      return null;
    }
    return {
      ...query,
      player: orient2(Number(query.player || 0), currentOrientation)
    };
  }
  function orientFieldQueryList(cards, currentOrientation = context2.uiRuntimeState.orientation) {
    return Array.isArray(cards) ? cards.map((card) => orientFieldQuery(card, currentOrientation)).filter(Boolean) : [];
  }
  function orientFieldCoordinate(query, currentOrientation = context2.uiRuntimeState.orientation) {
    if (!query || typeof query !== "object") {
      return null;
    }
    const player = Number(query.player), index = Number(query.index);
    if (!Number.isInteger(player) || typeof query.location !== "string" || !Number.isInteger(index)) {
      return null;
    }
    const output = {
      player: orient2(player, currentOrientation),
      location: query.location,
      index
    };
    if (Number.isInteger(Number(query.overlay_sequence))) {
      output.overlay_sequence = Number(query.overlay_sequence);
    }
    if (Number.isInteger(Number(query.overlayindex))) {
      output.overlayindex = Number(query.overlayindex);
    }
    return output;
  }
  function orientRevealCards(cards, currentOrientation = context2.uiRuntimeState.orientation) {
    return Array.isArray(cards) ? cards.map((card) => ({
      ...card,
      player: Number.isInteger(Number(card?.player)) ? orient2(Number(card.player), currentOrientation) : card?.player
    })) : [];
  }
  function resolvePhaseBannerText(phase) {
    const normalized = String(phase ?? "").toUpperCase(), labels = {
      0: "Draw Phase",
      1: "Standby Phase",
      2: "Main Phase 1",
      3: "Battle Phase",
      4: "Main Phase 2",
      5: "End Phase",
      DRAW: "Draw Phase",
      PHASE_DRAW: "Draw Phase",
      STANDBY: "Standby Phase",
      PHASE_STANDBY: "Standby Phase",
      MAIN1: "Main Phase 1",
      MAIN_1: "Main Phase 1",
      PHASE_MAIN1: "Main Phase 1",
      BATTLE: "Battle Phase",
      BATTLE_START: "Battle Phase",
      PHASE_BATTLE_START: "Battle Phase",
      MAIN2: "Main Phase 2",
      MAIN_2: "Main Phase 2",
      PHASE_MAIN2: "Main Phase 2",
      END: "End Phase",
      PHASE_END: "End Phase"
    };
    return labels[normalized] || labels[phase] || "Phase";
  }
  function resolveSoundFile(name) {
    if (typeof name !== "string" || !name.length) {
      return null;
    }
    return duelSoundFiles[name] || null;
  }
  function playUiSound(name) {
    const src = resolveSoundFile(name);
    if (!src || typeof window === "undefined" || typeof window.Audio !== "function") {
      return;
    }
    let audio = soundCache.get(src);
    if (!audio) {
      audio = new window.Audio(src);
      soundCache.set(src, audio);
    }
    try {
      audio.currentTime = 0;
      const playback = audio.play?.();
      if (playback && typeof playback.catch === "function") {
        playback.catch(() => {
        });
      }
    } catch (_error) {
    }
  }
  function showChoiceResultOverlay(contract, modeName) {
    const duelRuntime = getDuelRuntime();
    if (!duelRuntime) {
      return;
    }
    if (context2.uiFlowState.choiceOverlay.timer) {
      clearTimeout(context2.uiFlowState.choiceOverlay.timer);
      context2.uiFlowState.choiceOverlay.timer = null;
    }
    context2.uiFlowState.choiceOverlay.token += 1;
    const overlayToken = context2.uiFlowState.choiceOverlay.token;
    duelRuntime.showChoiceResult(modeName, contract, {
      overlayActive: true
    });
    const duration = Math.max(0, Number(contract?.duration || 1500) || 1500);
    context2.uiFlowState.choiceOverlay.timer = setTimeout(() => {
      if (overlayToken !== context2.uiFlowState.choiceOverlay.token) {
        return;
      }
      duelRuntime.setChoiceOverlayActive(false);
      context2.uiFlowState.choiceOverlay.timer = null;
      context2.renderCurrentView();
    }, duration);
  }
  function resolveAnnouncementContract(message, currentOrientation = 0) {
    function resolveSummonMode(command) {
      switch (command) {
        case "MSG_SUMMONING":
        case "MSG_SUMMONED":
          return "summon";
        case "MSG_SPSUMMONING":
        case "MSG_SPSUMMONED":
          return "special_summon";
        case "MSG_FLIPSUMMONING":
        case "MSG_FLIPSUMMONED":
          return "flip_summon";
        default:
          return "summon";
      }
    }
    function resolveSummonSound(command) {
      switch (command) {
        case "MSG_SUMMONING":
          return "summon";
        case "MSG_SPSUMMONING":
          return "specialsummon";
        case "MSG_FLIPSUMMONING":
          return "flip";
        default:
          return void 0;
      }
    }
    function resolveFieldCoordinate(query) {
      return orientFieldCoordinate(query, currentOrientation);
    }
    switch (resolveDuelMessageName(message, message.command)) {
      case "MSG_AI_NAME": {
        const aiName = message?.ai_name || message?.name || message?.opponent_name || "AI";
        return {
          kind: "lobby_metadata",
          aiName,
          opponentName: aiName
        };
      }
      case "MSG_SHOW_HINT":
        return {
          kind: "notice",
          text: message?.text || message?.hint || "",
          duration: Number(message?.duration || 1800),
          log: true,
          logLabel: "MSG_SHOW_HINT"
        };
      case "MSG_CUSTOM_MSG":
        return {
          kind: "notice",
          text: message?.text || "Custom duel message received.",
          duration: Number(message?.duration || 1800),
          log: true,
          logLabel: "MSG_CUSTOM_MSG"
        };
      case "MSG_MATCH_KILL":
        return {
          kind: "notice",
          text: message?.text || "Match kill effect registered",
          duration: Number(message?.duration || 1600),
          log: true,
          logLabel: "MSG_MATCH_KILL"
        };
      case "MSG_NEW_TURN":
        return {
          kind: "phase_banner",
          bannerType: "turn",
          text: `Turn ${Number(message?.turn || 0) || 1}`,
          duration: Number(message?.duration || 1400)
        };
      case "MSG_NEW_PHASE":
        return {
          kind: "phase_banner",
          bannerType: "phase",
          text: resolvePhaseBannerText(message?.gui_phase ?? message?.phase),
          duration: Number(message?.duration || 1400)
        };
      case "MSG_ORIENTATION":
        return { kind: "orientation", slot: message.slot };
      case "MSG_OPPONENT_TURN":
        return { kind: "opponent_turn", active: Boolean(message.active) };
      case "MSG_WAITING":
        return { kind: "waiting" };
      case "MSG_SUMMONING":
      case "MSG_SPSUMMONING":
      case "MSG_FLIPSUMMONING":
      case "MSG_SUMMONED":
      case "MSG_SPSUMMONED":
      case "MSG_FLIPSUMMONED": {
        const command = resolveDuelMessageName(message, message.command), contract = {
          kind: "flash",
          mode: resolveSummonMode(command),
          phase: command.endsWith("ED") ? "complete" : "start",
          id: message.id,
          source: resolveFieldCoordinate(message?.source || message)
        };
        if (command.endsWith("ED")) {
          contract.confirmation = true;
        }
        if (resolveSummonSound(command)) {
          contract.sound = resolveSummonSound(command);
        }
        return contract;
      }
      case "MSG_CHAINING":
        return {
          kind: "chain",
          mode: "activate",
          phase: "start",
          chainIndex: Number(message?.chain_size || 0),
          id: message?.id,
          source: resolveFieldCoordinate(message?.source || message),
          sound: "activate"
        };
      case "MSG_CHAINED":
      case "MSG_CHAIN_SOLVING":
      case "MSG_CHAIN_SOLVED":
      case "MSG_CHAIN_NEGATED":
      case "MSG_CHAIN_DISABLED":
        return {
          kind: "chain",
          mode: resolveDuelMessageName(message, message.command) === "MSG_CHAIN_NEGATED" || resolveDuelMessageName(message, message.command) === "MSG_CHAIN_DISABLED" ? "negated" : "activate",
          phase: {
            MSG_CHAINED: "queued",
            MSG_CHAIN_SOLVING: "solving",
            MSG_CHAIN_SOLVED: "solved",
            MSG_CHAIN_NEGATED: "negated",
            MSG_CHAIN_DISABLED: "disabled"
          }[resolveDuelMessageName(message, message.command)],
          chainIndex: Number(message?.chain_size || 0),
          id: message?.id,
          source: resolveFieldCoordinate(message?.source || message)
        };
      case "MSG_CHAIN_END":
        return { kind: "chain", phase: "end" };
      case "MSG_CARD_SELECTED":
      case "MSG_RANDOM_SELECTED":
        return {
          kind: "selection_event",
          phase: resolveDuelMessageName(message, message.command) === "MSG_RANDOM_SELECTED" ? "random_selected" : "card_selected",
          cards: orientFieldQueryList(message?.cards, currentOrientation),
          duration: Number(message?.duration || (resolveDuelMessageName(message, message.command) === "MSG_RANDOM_SELECTED" ? 650 : 900))
        };
      case "MSG_ATTACK":
        return {
          kind: "attack",
          id: message?.source?.code || message?.source?.id || message?.attacker?.code || message?.attacker?.id,
          sound: message.sound,
          source: message.source || message.attacker,
          target: message.target || message.defender
        };
      case "MSG_EQUIP":
        return { kind: "sound", sound: "equip", source: message?.source || message?.card || null, target: message?.target || null };
      case "MSG_UNEQUIP":
        return {
          kind: "selection_event",
          phase: "unequip",
          cards: orientFieldQueryList([message?.source || message?.card], currentOrientation),
          duration: Number(message?.duration || 650)
        };
      case "MSG_CARD_TARGET":
      case "MSG_CANCEL_TARGET":
        return {
          kind: "target_event",
          phase: resolveDuelMessageName(message, message.command) === "MSG_CARD_TARGET" ? "link" : "unlink",
          cards: orientFieldQueryList([message?.source || message?.card, message?.target], currentOrientation),
          duration: Number(message?.duration || (resolveDuelMessageName(message, message.command) === "MSG_CARD_TARGET" ? 950 : 700))
        };
      case "MSG_BECOME_TARGET":
      case "MSG_BE_CHAIN_TARGET": {
        const cards = orientFieldQueryList(message?.cards, currentOrientation);
        return cards.length ? {
          kind: "target_event",
          phase: resolveDuelMessageName(message, message.command) === "MSG_BECOME_TARGET" ? "become_target" : "chain_target",
          cards,
          duration: Number(message?.duration || 950)
        } : null;
      }
      case "MSG_CREATE_RELATION":
      case "MSG_RELEASE_RELATION": {
        const cards = Array.isArray(message?.cards) && message.cards.length ? message.cards : [message?.source || message?.card, message?.target], orientedCards = orientFieldQueryList(cards, currentOrientation);
        return orientedCards.length ? {
          kind: "relation_event",
          phase: resolveDuelMessageName(message, message.command) === "MSG_CREATE_RELATION" ? "create" : "release",
          cards: orientedCards,
          duration: Number(message?.duration || (resolveDuelMessageName(message, message.command) === "MSG_CREATE_RELATION" ? 900 : 650))
        } : null;
      }
      case "MSG_BATTLE":
        return { kind: "battle", source: message?.source || message?.card || null, target: message?.target || null };
      case "MSG_ATTACK_DISABLED":
        return { kind: "notice", text: message?.text || "An attack was negated", duration: Number(message?.duration || 1400) };
      case "MSG_DAMAGE":
      case "MSG_PAY_LPCOST":
      case "MSG_RECOVER":
      case "MSG_LPUPDATE": {
        const delta = Number(
          message?.delta ?? (resolveDuelMessageName(message, message.command) === "MSG_RECOVER" ? Number(message?.amount || message?.lp || 0) : resolveDuelMessageName(message, message.command) === "MSG_LPUPDATE" ? 0 : -1 * Number(message?.amount || message?.lp || 0))
        );
        return delta ? {
          kind: "lp_delta",
          player: orient2(message?.player, currentOrientation),
          value: delta,
          tone: resolveDuelMessageName(message, message.command) === "MSG_RECOVER" ? "recover" : resolveDuelMessageName(message, message.command) === "MSG_PAY_LPCOST" ? "cost" : "damage",
          duration: Number(message?.duration || 1300)
        } : null;
      }
      case "MSG_MISSED_EFFECT":
        return {
          kind: "selection_event",
          phase: "missed_effect",
          cards: orientFieldQueryList(message?.cards || [message?.source || message], currentOrientation),
          text: message?.text || "An effect missed the timing",
          duration: Number(message?.duration || 1400)
        };
      case "MSG_TOSS_COIN":
        return { kind: "coin_result", player: orient2(message.player, currentOrientation), results: Array.isArray(message?.results) ? message.results.map((value) => Boolean(value)) : [], sound: "coinflip" };
      case "MSG_TOSS_DICE":
        return { kind: "dice_result", player: orient2(message.player, currentOrientation), results: Array.isArray(message?.results) ? message.results.map((value) => Number(value)) : [], sound: "diceroll" };
      case "MSG_FIELD_DISABLED":
        return {
          kind: "field_disabled",
          zones: Array.isArray(message?.zones) ? message.zones.map((zone) => ({ player: orient2(zone?.player, currentOrientation), location: zone?.location, index: Number(zone?.index ?? 0) })) : []
        };
      case "MSG_SHUFFLE_DECK":
      case "MSG_SHUFFLE_HAND":
      case "MSG_SHUFFLE_EXTRA":
        return {
          kind: "shuffle",
          zone: { MSG_SHUFFLE_DECK: "DECK", MSG_SHUFFLE_HAND: "HAND", MSG_SHUFFLE_EXTRA: "EXTRA" }[resolveDuelMessageName(message, message.command)],
          player: orient2(message.player, currentOrientation)
        };
      case "MSG_SHUFFLE_SET_CARD": {
        const players = Array.from(new Set((message.cards || []).reduce((output, movement) => {
          if (Number.isInteger(movement?.from?.player)) {
            output.push(orient2(movement.from.player, currentOrientation));
          }
          if (Number.isInteger(movement?.to?.player)) {
            output.push(orient2(movement.to.player, currentOrientation));
          }
          return output;
        }, [])));
        return { kind: "shuffle_set", zone: message.location, players };
      }
      case "MSG_TAG_SWAP":
        return { kind: "tag_swap", player: orient2(message.player, currentOrientation), zones: ["DECK", "HAND", "EXTRA"] };
      case "MSG_DECK_TOP":
        return Number(message?.id || 0) ? {
          kind: "pile_reveal",
          call: "deck_top",
          player: orient2(message?.player, currentOrientation),
          cards: [{ id: Number(message.id), player: orient2(message?.player, currentOrientation), location: "DECK", index: Number(message?.offset || 0) }],
          duration: Number(message?.duration || 900)
        } : null;
      case "MSG_HAND_RES":
        return { kind: "rps_result", results: Array.isArray(message?.results) ? message.results.slice() : [], duration: Number(message?.duration || 1e3) };
      default:
        return null;
    }
  }
  function handleAnnouncement(message) {
    const duelRuntime = getDuelRuntime(), contract = message?.ui || resolveAnnouncementContract(message, context2.uiRuntimeState.orientation);
    if (contract?.kind === "rps_result") {
      duelRuntime?.showChoiceResult("rps", contract, {
        clearPrompt: true,
        overlayActive: false,
        runtimeMode: "choice"
      });
      context2.setIncomingActionDelay(contract.duration || 1e3);
      return;
    }
    if (contract?.kind === "hint") {
      if (contract.log && contract.text) {
        console.log(`[ygopro/${contract.logLabel || contract.kind}]`, contract.text);
      }
      dialogService2.setQuestionPrompt(contract.text || "");
      return;
    }
    if (contract?.kind === "coin_result") {
      playUiSound(contract.sound);
      showChoiceResultOverlay(contract, "coin");
      return;
    }
    if (contract?.kind === "dice_result") {
      playUiSound(contract.sound);
      showChoiceResultOverlay(contract, "dice");
      return;
    }
    if (contract?.sound) {
      playUiSound(contract.sound);
    }
    if (contract?.kind === "notice") {
      if (contract.text && contract.log) {
        console.log(`[ygopro/${contract.logLabel || contract.kind}]`, contract.text);
      }
      dialogService2.showTransientPrompt(contract.text, contract.duration);
      return;
    }
    if (duelRuntime?.applyAnnouncementContract(contract)) {
      if (contract.kind === "selection_event" && contract.text) {
        dialogService2.showTransientPrompt(contract.text, contract.duration);
      }
      return;
    }
  }
  function handleDuelAction(message) {
    const duelRuntime = getDuelRuntime(), preserveActiveZoneSelection = dialogService2.hasActiveZoneSelectorQuestion(), preserveActiveAnnounceNumber = dialogService2.hasActiveAnnounceNumberQuestion(), preserveActiveQuestionUi = preserveActiveZoneSelection || preserveActiveAnnounceNumber;
    switch (message.duelAction) {
      case "start":
      case "reload":
        dialogService2.clearQuestionTracking();
        duelRuntime?.applyDuelSnapshot(message, {
          clearField: true,
          clearPrompt: true,
          disableSelection: true,
          mode: "duel",
          resetChainState: true
        });
        break;
      case "duel":
        if (!preserveActiveQuestionUi) {
          dialogService2.clearQuestionTracking();
        }
        duelRuntime?.applyDuelSnapshot(message, {
          disableSelection: !preserveActiveQuestionUi,
          mode: "duel"
        });
        break;
      case "question":
        dialogService2.setupQuestion(message);
        break;
      case "announcement":
        handleAnnouncement(message.message);
        break;
      case "reveal":
        dialogService2.clearQuestionTracking();
        duelRuntime?.disableSelection();
        {
          const revealCards = dialogService2.hydrateRevealCardList(orientRevealCards(message.reveal));
          if (duelRuntime?.previewReveal(revealCards, {
            call: message.call,
            player: orient2(Number(message.player || 0)),
            duration: Number(message.duration || 1400)
          })) {
            break;
          }
          duelRuntime?.openReveal(revealCards);
        }
        break;
      case "effect":
        if (!preserveActiveQuestionUi) {
          dialogService2.clearQuestionTracking();
          duelRuntime?.disableSelection();
        }
        duelRuntime?.flashDuel(Object.assign({}, message, {
          mode: message?.mode || "legacy_preview",
          phase: message?.phase || "start",
          source: orientFieldCoordinate(message, context2.uiRuntimeState.orientation)
        }));
        break;
      case "chat":
        duelRuntime?.appendChatMessage(message);
        break;
      case "give":
        duelRuntime?.manualTake(message);
        break;
      default:
        break;
    }
  }
  return {
    Field,
    orient: orient2,
    orientFieldQuery,
    orientFieldQueryList,
    orientFieldCoordinate,
    orientRevealCards,
    handleAnnouncement,
    handleDuelAction,
    resolveAnnouncementContract,
    resolvePhaseBannerText,
    playUiSound,
    showChoiceResultOverlay
  };
}

// server/ui/util/deck-hydration.js
function cloneDeckRecord(deck) {
  return {
    ...deck || {},
    main: Array.isArray(deck?.main) ? [...deck.main] : [],
    extra: Array.isArray(deck?.extra) ? [...deck.extra] : [],
    side: Array.isArray(deck?.side) ? [...deck.side] : []
  };
}
function resolveDeckCardId(card) {
  if (typeof card === "number") {
    return card;
  }
  if (typeof card === "string") {
    return Number(card);
  }
  if (card && typeof card === "object") {
    return Number(card.id);
  }
  return NaN;
}
function hydrateDeckRecords(deckRecords, database) {
  if (!Array.isArray(deckRecords)) {
    return [];
  }
  if (!Array.isArray(database) || !database.length) {
    return deckRecords.map(cloneDeckRecord);
  }
  return deckRecords.map((deckRecord) => {
    const hydratedDeck = cloneDeckRecord(deckRecord);
    hydratedDeck.main = hydratedDeck.main.map((card) => {
      const cardId = resolveDeckCardId(card);
      return database.find((item) => Number(item.id) === cardId);
    }).filter(Boolean);
    hydratedDeck.extra = hydratedDeck.extra.map((card) => {
      const cardId = resolveDeckCardId(card);
      return database.find((item) => Number(item.id) === cardId);
    }).filter(Boolean);
    hydratedDeck.side = hydratedDeck.side.map((card) => {
      const cardId = resolveDeckCardId(card);
      return database.find((item) => Number(item.id) === cardId);
    }).filter(Boolean);
    return hydratedDeck;
  });
}

// server/ui/services/duel-runtime-adapter.service.js
var import_react30 = __toESM(require("react"), 1);
var import_client = require("react-dom/client");
var import_react_dom = require("react-dom");

// server/ui/components/duel/runtime.root.component.jsx
var import_react29 = __toESM(require("react"), 1);

// server/ui/components/duel/question.prompt.component.jsx
var import_react28 = __toESM(require("react"), 1);

// server/ui/components/duel/question.prompt.component.module.scss
var question_prompt_component_module_default = ".root {}\n";

// server/ui/components/duel/question.prompt.component.jsx
function QuestionPrompt({ text }) {
  if (typeof text !== "string" || !text.trim()) {
    return null;
  }
  return /* @__PURE__ */ import_react28.default.createElement("div", { className: question_prompt_component_module_default.root, id: "duelquestionprompt" }, /* @__PURE__ */ import_react28.default.createElement(
    "p",
    {
      className: "duelquestionprompt-text",
      style: {
        whiteSpace: "pre-line"
      }
    },
    text
  ));
}

// server/ui/components/duel/runtime.root.component.module.scss
var runtime_root_component_module_default = ".root {}\n";

// server/ui/components/duel/runtime.root.component.jsx
function scrollSideChatToBottom() {
  const list = document.getElementById("sidechattext");
  if (list) {
    list.scrollTop = list.scrollHeight;
  }
}
function renderDuelRoot(duel, choice, questionPrompt) {
  const questionText = duel?.lifepoints?.waiting ? "Waiting,..." : questionPrompt, showChoiceOverlay = Boolean(choice?.state?.overlayActive);
  return /* @__PURE__ */ import_react29.default.createElement("section", { className: runtime_root_component_module_default.root, id: "duel" }, /* @__PURE__ */ import_react29.default.createElement(
    QuestionPrompt,
    {
      key: "question-prompt",
      text: questionText
    }
  ), showChoiceOverlay ? /* @__PURE__ */ import_react29.default.createElement(MountedChoiceOverlay, { controller: choice }) : null, /* @__PURE__ */ import_react29.default.createElement(DuelRuntimeScene, { duel }));
}
function renderChoiceRoot(choice) {
  return /* @__PURE__ */ import_react29.default.createElement("section", { className: runtime_root_component_module_default.root, id: "choice-runtime" }, /* @__PURE__ */ import_react29.default.createElement(MountedChoiceScreen, { controller: choice }));
}
function renderLobbyRoot(lobby) {
  return /* @__PURE__ */ import_react29.default.createElement("section", { className: runtime_root_component_module_default.root, id: "lobby" }, /* @__PURE__ */ import_react29.default.createElement(LobbyScreen, { lobby }));
}
function DuelRuntimeRoot({
  mode,
  duel,
  choice,
  lobby,
  questionPrompt
}) {
  (0, import_react29.useEffect)(() => {
    scrollSideChatToBottom();
  });
  switch (mode) {
    case "duel":
      return renderDuelRoot(duel, choice, questionPrompt);
    case "choice":
      return renderChoiceRoot(choice);
    default:
      return renderLobbyRoot(lobby);
  }
}

// server/ui/services/duel-runtime-adapter.service.js
var initialLobbyState = Object.freeze({
  player: [{}, {}],
  decks: [],
  automatic: "Automatic",
  ranked: "Casual",
  banlist: "Loading...",
  allowedCardsLabel: "OCG / TCG",
  mode: "Single",
  startingLP: 8e3
});
function getStorageValue(key) {
  if (typeof localStorage === "undefined" || !key) {
    return void 0;
  }
  if (typeof localStorage.getItem === "function") {
    return localStorage.getItem(key) ?? void 0;
  }
  return localStorage[key];
}
function logTransport(logger, message, payload) {
  if (typeof logger?.log === "function") {
    logger.log(message, payload);
    return;
  }
  console.log(message, payload);
}
function createLegacySocketTransport(url, dependencies = {}) {
  const WebSocketImpl = dependencies.WebSocketImpl || globalThis.WebSocket;
  if (typeof WebSocketImpl !== "function") {
    throw new Error("WebSocket transport is unavailable.");
  }
  const logger = dependencies.logger || console, socket = new WebSocketImpl(url), openState = Number(WebSocketImpl.OPEN ?? 1), adapter = {
    raw: socket,
    proxyReady: false,
    on(event, handler) {
      if (event === "data") {
        socket.addEventListener("message", (messageEvent) => {
          let data;
          try {
            data = JSON.parse(messageEvent.data);
          } catch (_error) {
            return;
          }
          handler(data);
        });
        return;
      }
      socket.addEventListener(event, handler);
    },
    write(payload) {
      if (socket.readyState !== openState) {
        logTransport(logger, "[ygopro/ws] drop outgoing packet because socket is not open", {
          readyState: socket.readyState,
          payload
        });
        return;
      }
      const packet = adapter.proxyReady && payload?.action && payload.action !== "proxy_connect" && payload.action !== "proxy_disconnect" ? {
        action: "proxy_message",
        payload
      } : payload;
      logTransport(logger, "[ygopro/ws] outgoing packet", {
        proxyReady: adapter.proxyReady,
        payload,
        packet
      });
      socket.send(JSON.stringify(packet));
    },
    close() {
      adapter.proxyReady = false;
      socket.close();
    }
  };
  return adapter;
}
function createDuelRuntimeAdapter(context2, services, dependencies = {}) {
  const { dialogService: dialogService2, passiveService: passiveService2 } = services, RuntimeRootComponent = dependencies.RuntimeRootComponent || DuelRuntimeRoot, rootFactory = dependencies.createRoot || import_client.createRoot, flush2 = dependencies.flushSync || import_react_dom.flushSync, createChat = dependencies.createChat || ((store2) => SideChat(store2)), createChoice = dependencies.createChoice || ((store2, chat) => ChoiceScreen(store2, chat)), createLobby = dependencies.createLobby || ((store2, chat) => createLobbyScreen(store2, chat, null)), createDuel = dependencies.createDuel || ((store2, chat, databaseSystem) => DuelScreen(store2, chat, databaseSystem)), createManualControls = dependencies.createManualControls || ((store2, ws) => new ManualControls(store2, ws)), createSocketTransport = dependencies.createSocketTransport || ((url) => createLegacySocketTransport(url, dependencies)), openSelectPositionDialogImpl = dependencies.openSelectPositionDialog || triggerSelectPositionDialog, openYesNoDialogImpl = dependencies.openYesNoDialog || triggerYesNoDialog, openSelectAttributesDialogImpl = dependencies.openSelectAttributesDialog || triggerSelectAttributesDialog, openAnnounceCardDialogImpl = dependencies.openAnnounceCardDialog || triggerAnnounceCardDialog, openSelectOptionDialogImpl = dependencies.openSelectOptionDialog || triggerSelectOptionDialog, fieldDomEffectsService = dependencies.fieldDomEffectsService || defaultDuelFieldDomEffectsService, logger = dependencies.logger || console;
  function withDuelController(callback, fallback = false) {
    const duel = context2.uiRuntimeState.duel;
    if (!duel) {
      return fallback;
    }
    return callback(duel);
  }
  function setMode(mode) {
    context2.uiRuntimeState.mode = mode;
    return mode;
  }
  function updateLobby(patch) {
    context2.uiRuntimeState.lobby?.update?.(patch);
    return Boolean(context2.uiRuntimeState.lobby);
  }
  function appendChatMessage(message) {
    appendSideChatMessage(context2.uiRuntimeState.chat, message);
    return Boolean(context2.uiRuntimeState.chat);
  }
  function setOrientation(slot) {
    context2.uiRuntimeState.orientation = slot;
    if (typeof window !== "undefined") {
      window.orientation = slot;
    }
    updateLobby({ slot });
    return slot;
  }
  function updateChoiceState2(update) {
    if (!context2.uiRuntimeState.choice) {
      return false;
    }
    context2.choiceApi.updateChoiceState(context2.uiRuntimeState.choice, update);
    return true;
  }
  function setChoiceOverlayActive2(active) {
    if (!context2.uiRuntimeState.choice) {
      return false;
    }
    context2.choiceApi.setChoiceOverlayActive(context2.uiRuntimeState.choice, active);
    return true;
  }
  function showLegacyTurnChoice(message) {
    setMode("choice");
    dialogService2.setQuestionPrompt("");
    updateChoiceState2({
      mode: "turn_player",
      protocol: "legacy",
      result: void 0,
      slot: message.slot ?? 0,
      selectedAnswer: void 0
    });
    if (typeof window !== "undefined") {
      window.verification = message.verification;
    }
  }
  function showLegacyChoice(message) {
    setMode("choice");
    dialogService2.setQuestionPrompt("");
    if (!context2.uiRuntimeState.choice) {
      return false;
    }
    context2.choiceApi.updateChoiceState(context2.uiRuntimeState.choice, (state) => ({
      mode: message.type,
      protocol: "legacy",
      result: message.result,
      slot: message.slot,
      winner: message.winner,
      selectedAnswer: message.type === "rps" && message.result === void 0 ? void 0 : state.selectedAnswer
    }));
    return true;
  }
  function showChoiceResult(modeName, contract, options = {}) {
    const choiceUpdate = {
      mode: modeName,
      protocol: options.protocol || "ocgcore",
      result: Array.isArray(contract?.results) ? contract.results.slice() : options.result,
      slot: Number(contract?.player ?? options.slot ?? context2.uiRuntimeState.orientation ?? 0),
      selectedAnswer: void 0
    };
    if (Object.prototype.hasOwnProperty.call(options, "overlayActive")) {
      choiceUpdate.overlayActive = options.overlayActive;
    }
    if (options.runtimeMode) {
      setMode(options.runtimeMode);
    }
    if (options.clearPrompt) {
      dialogService2.setQuestionPrompt("");
    }
    return updateChoiceState2(choiceUpdate);
  }
  function showChoicePrompt(modeName, options = {}) {
    const choiceUpdate = {
      mode: modeName,
      protocol: options.protocol || "ocgcore",
      result: options.result,
      slot: Number(options.slot ?? context2.uiRuntimeState.orientation ?? 0),
      selectedAnswer: void 0
    };
    if (Object.prototype.hasOwnProperty.call(options, "winner")) {
      choiceUpdate.winner = options.winner;
    }
    if (Object.prototype.hasOwnProperty.call(options, "overlayActive")) {
      choiceUpdate.overlayActive = options.overlayActive;
    }
    setMode(options.runtimeMode || "choice");
    if (options.clearPrompt !== false) {
      dialogService2.setQuestionPrompt("");
    }
    return updateChoiceState2(choiceUpdate);
  }
  function setWaiting(waiting) {
    context2.lifepointApi.setLifepointWaiting(
      context2.uiRuntimeState.duel?.lifepoints,
      Boolean(waiting)
    );
  }
  function disableSelection() {
    return withDuelController((duel) => {
      duel.disableSelection?.();
      return true;
    });
  }
  function idle(commands = {}) {
    return withDuelController((duel) => {
      duel.idle?.(commands);
      return true;
    });
  }
  function clearChainQuestion() {
    return withDuelController((duel) => {
      duel.clearChainQuestion?.();
      return true;
    });
  }
  function applyDuelSnapshot(message, options = {}) {
    const update = Object.assign({}, message?.info, { names: message?.names });
    if (options.clearPrompt) {
      dialogService2.setQuestionPrompt("");
    }
    if (options.disableSelection) {
      disableSelection();
    }
    if (options.mode) {
      setMode(options.mode);
    }
    return withDuelController((duel) => {
      if (options.resetChainState) {
        duel.resetChainState?.();
      }
      if (options.clearField) {
        duel.clear?.();
      }
      if (message?.info || message?.names !== void 0) {
        duel.update?.(update);
      }
      if (message?.field !== void 0) {
        duel.replaceField?.(message.field);
      }
      return true;
    });
  }
  function hydrateField(field) {
    return withDuelController((duel) => {
      duel.hydrateField?.(field);
      return true;
    });
  }
  function select(query) {
    return withDuelController((duel) => {
      duel.select?.(query);
      return true;
    });
  }
  function sendQuestionAnswer(answer, uuid) {
    dialogService2.setQuestionPrompt("");
    disableSelection();
    renderCurrentView();
    context2.ws?.write({
      action: "question",
      answer,
      uuid
    });
    return Boolean(context2.ws);
  }
  function sendLegacyChoiceAnswer(answer) {
    context2.ws?.write({
      action: "choice",
      answer
    });
    return Boolean(context2.ws);
  }
  function openReveal(cards, state = {}) {
    return withDuelController((duel) => {
      duel.reveal?.(cards, state);
      return true;
    });
  }
  function previewReveal(cards, options = {}) {
    return withDuelController((duel) => duel.previewReveal?.(cards, options), false);
  }
  function closeRevealer2() {
    return withDuelController((duel) => {
      duel.closeRevealer?.();
      return true;
    });
  }
  function flashDuel(contract) {
    return withDuelController((duel) => {
      duel.flash?.(contract);
      return true;
    });
  }
  function previewCard(id) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return false;
    }
    return flashDuel({
      id: numericId,
      mode: "legacy_preview",
      phase: "preview"
    });
  }
  function hoverFieldCard(query) {
    const cards = Object.values(context2.uiRuntimeState.duel?.field?.state?.cards || {}), hoveredCard = cards.find((cardImage) => cardImage?.state && cardImage.state.player === query?.player && cardImage.state.location === query?.location && cardImage.state.index === query?.index);
    if (!hoveredCard?.state?.id) {
      return false;
    }
    context2.store.emit({
      action: "CARD_HOVER",
      id: hoveredCard.state.id
    });
    return true;
  }
  function handleChainQuestion(options = {}, state = {}) {
    return withDuelController((duel) => {
      duel.handleChainQuestion?.(options, state);
      return true;
    });
  }
  function handleSortChainQuestion(options = {}, state = {}) {
    return withDuelController((duel) => duel.handleSortChainQuestion?.(options, state), false);
  }
  function openSelectPositionDialog(state) {
    return withDuelController((duel) => {
      openSelectPositionDialogImpl(duel, state);
      return true;
    });
  }
  function openYesNoDialog(state) {
    return withDuelController((duel) => {
      openYesNoDialogImpl(duel, state);
      return true;
    });
  }
  function openSelectAttributesDialog(state) {
    return withDuelController((duel) => {
      openSelectAttributesDialogImpl(duel, state);
      return true;
    });
  }
  function openAnnounceCardDialog(state) {
    return withDuelController((duel) => {
      openAnnounceCardDialogImpl(duel, state);
      return true;
    });
  }
  function openSelectOptionDialog(state) {
    return withDuelController((duel) => {
      openSelectOptionDialogImpl(duel, state);
      return true;
    });
  }
  function applyAnnouncementContract(contract) {
    switch (contract?.kind) {
      case "orientation":
        setOrientation(contract.slot);
        return true;
      case "lobby_metadata":
        updateLobby({
          aiName: contract.aiName,
          opponentName: contract.opponentName
        });
        return true;
      case "opponent_turn":
        context2.store.emit({
          action: "OPPONENT_TURN",
          active: contract.active
        });
        return true;
      case "waiting":
        setWaiting(true);
        return true;
      case "flash":
        return flashDuel(contract);
      case "phase_banner":
        return withDuelController((duel) => {
          duel.showPhaseBanner?.(contract.text, contract.duration);
          return true;
        });
      case "lp_delta":
        return withDuelController((duel) => {
          duel.pulseLifepoints?.(contract.player, contract.value, contract.tone, contract.duration);
          return true;
        });
      case "attack":
        return withDuelController((duel) => {
          duel.flash?.({
            id: contract.id,
            sound: contract.sound,
            source: contract.source,
            target: contract.target
          });
          duel.animateAttack?.(contract.source, Array.isArray(contract.target) ? contract.target[0] : contract.target);
          return true;
        });
      case "battle":
        return withDuelController((duel) => {
          duel.animateBattle?.(contract.source, Array.isArray(contract.target) ? contract.target[0] : contract.target);
          return true;
        });
      case "selection_event":
        return withDuelController((duel) => {
          duel.pulseSelectionCards?.(contract.cards || [], contract.duration);
          return true;
        });
      case "target_event":
      case "relation_event":
        return withDuelController((duel) => {
          duel.pulseTargetCards?.(contract.cards || [], contract.duration);
          return true;
        });
      case "field_disabled":
        return withDuelController((duel) => {
          duel.setDisabledZones?.(contract.zones || []);
          return true;
        });
      case "chain":
        return withDuelController((duel) => {
          if (contract.phase === "start" && contract.id) {
            duel.flash?.(contract);
            return true;
          }
          if (contract.phase === "end") {
            duel.clearChainOverlays?.();
            return true;
          }
          duel.updateChainOverlay?.(contract);
          if ((contract.phase === "negated" || contract.phase === "disabled") && contract.id) {
            duel.flash?.(contract);
          }
          return true;
        });
      case "shuffle":
        fieldDomEffectsService.shuffleDeck(contract.player, contract.zone);
        return true;
      case "shuffle_set":
        contract.players.forEach((player) => {
          fieldDomEffectsService.shuffleZone(player, contract.zone);
        });
        return true;
      case "tag_swap":
        fieldDomEffectsService.shuffleTagSwap(contract.player, contract.zones);
        return true;
      case "pile_reveal":
        return withDuelController((duel) => {
          if (!duel.previewReveal?.(contract.cards || [], {
            call: contract.call,
            player: contract.player,
            duration: contract.duration
          }) && contract.cards?.[0]?.id) {
            duel.flash?.({ id: contract.cards[0].id });
          }
          return true;
        });
      default:
        return false;
    }
  }
  function manualTake(message) {
    context2.uiRuntimeState.manualControls?.manualTake?.(message);
    return Boolean(context2.uiRuntimeState.manualControls);
  }
  function getMountRoot() {
    if (typeof document === "undefined") {
      return null;
    }
    const mountNode = document.getElementById("main");
    if (!mountNode) {
      return null;
    }
    if (!context2.root) {
      context2.root = rootFactory(mountNode);
    }
    return context2.root;
  }
  function renderCurrentView() {
    const mountRoot = getMountRoot();
    if (!mountRoot || !context2.uiRuntimeState.lobby || !context2.uiRuntimeState.chat || !context2.uiRuntimeState.choice) {
      return;
    }
    flush2(() => {
      mountRoot.render(
        /* @__PURE__ */ import_react30.default.createElement(
          RuntimeRootComponent,
          {
            mode: context2.uiRuntimeState.mode,
            duel: context2.uiRuntimeState.duel,
            choice: context2.uiRuntimeState.choice,
            lobby: context2.uiRuntimeState.lobby,
            questionPrompt: context2.questionState.prompt
          }
        )
      );
    });
  }
  function hydrateRuntime() {
    context2.uiRuntimeState.chat = createChat(context2.store);
    context2.uiRuntimeState.choice = createChoice(context2.store, context2.uiRuntimeState.chat);
    context2.uiRuntimeState.lobby = createLobby(context2.store, context2.uiRuntimeState.chat);
    context2.uiRuntimeState.duel = createDuel(context2.store, context2.uiRuntimeState.chat, context2.databaseSystem);
    dialogService2.setQuestionPrompt("");
    context2.uiRuntimeState.lobby.update({ ...initialLobbyState });
    context2.app.duel = context2.uiRuntimeState.duel;
    context2.app.lobby = context2.uiRuntimeState.lobby;
  }
  function handleIncomingAction(message) {
    switch (message.action) {
      case "proxy":
        logTransport(logger, "[ygopro/ws] proxy status update", {
          previous: context2.ws?.proxyReady,
          next: message.status === "up",
          message
        });
        if (!context2.ws) {
          break;
        }
        context2.ws.proxyReady = message.status === "up";
        if (message.status !== "up") {
          break;
        }
        context2.ws.write({
          action: "register",
          username: getStorageValue("username"),
          session: getStorageValue("session")
        });
        break;
      case "lobby":
        updateLobby(message.game);
        break;
      case "registered":
        context2.ws?.write({ action: "join" });
        break;
      case "decks":
        updateLobby({ decks: message.decks });
        break;
      case "chat":
        appendChatMessage(message);
        break;
      case "slot":
        setOrientation(message.slot);
        break;
      case "turn_player":
        showLegacyTurnChoice(message);
        break;
      case "choice":
        showLegacyChoice(message);
        break;
      case "start":
        setMode("duel");
        dialogService2.setQuestionPrompt("");
        break;
      case "clear":
        applyDuelSnapshot({}, {
          clearField: true,
          clearPrompt: true,
          mode: "lobby",
          resetChainState: true
        });
        break;
      case "ygopro":
        logTransport(logger, "[ygopro/ws] duel message", message.message);
        passiveService2.handleDuelAction(message.message);
        break;
      case "error":
        logTransport(logger, "[ygopro/ws] server error", message.msg || message.error);
        break;
      default:
        break;
    }
  }
  function connect(proxyPort, roomPort) {
    const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    context2.ws = createSocketTransport(`${protocol}${window.location.hostname}:${proxyPort}`);
    if (context2.uiRuntimeState.lobby) {
      context2.uiRuntimeState.lobby.ws = context2.ws;
    }
    context2.uiRuntimeState.manualControls = createManualControls(context2.store, context2.ws);
    if (context2.uiRuntimeState.chat) {
      context2.uiRuntimeState.chat.manualControls = context2.uiRuntimeState.manualControls;
    }
    context2.app.manualControls = context2.uiRuntimeState.manualControls;
    context2.ws.on("data", (data) => {
      context2.lifepointApi.setLifepointWaiting(context2.uiRuntimeState.duel?.lifepoints, false);
      if (data.action) {
        handleIncomingAction(data);
      }
      renderCurrentView();
    });
    context2.ws.on("open", () => {
      logTransport(logger, "[ygopro/ws] socket open", { proxyPort, roomPort });
      context2.ws.write({
        action: "proxy_connect",
        port: roomPort
      });
    });
    context2.ws.on("error", (error) => {
      logTransport(logger, "[ygopro/ws] transport error", error);
    });
  }
  function dispose() {
    if (context2.questionState.promptTimer) {
      clearTimeout(context2.questionState.promptTimer);
      context2.questionState.promptTimer = null;
    }
    if (context2.uiFlowState.choiceOverlay.timer) {
      clearTimeout(context2.uiFlowState.choiceOverlay.timer);
      context2.uiFlowState.choiceOverlay.timer = null;
    }
    if (context2.uiFlowState.incomingActions.timer) {
      clearTimeout(context2.uiFlowState.incomingActions.timer);
      context2.uiFlowState.incomingActions.timer = null;
    }
    context2.uiFlowState.incomingActions.delayUntil = 0;
    context2.uiFlowState.incomingActions.buffered = [];
    context2.uiFlowState.choiceOverlay.token += 1;
    context2.questionState.prompt = "";
    if (context2.ws) {
      context2.ws.close();
      context2.ws = null;
    }
    context2.uiRuntimeState.duel?.dispose?.();
    if (context2.root) {
      context2.root.unmount();
      context2.root = null;
    }
    context2.uiRuntimeState.orientation = 0;
    if (typeof window !== "undefined") {
      window.orientation = 0;
    }
    context2.uiRuntimeState.mode = "lobby";
    context2.uiRuntimeState.duel = null;
    context2.uiRuntimeState.chat = null;
    context2.uiRuntimeState.lobby = null;
    context2.uiRuntimeState.choice = null;
    context2.uiRuntimeState.manualControls = null;
    context2.app.duel = null;
    context2.app.lobby = null;
    context2.app.manualControls = null;
    dialogService2.setQuestionPrompt("");
  }
  return {
    appendChatMessage,
    applyAnnouncementContract,
    applyDuelSnapshot,
    clearChainQuestion,
    connect,
    dispose,
    disableSelection,
    flashDuel,
    handleIncomingAction,
    handleChainQuestion,
    handleSortChainQuestion,
    hydrateField,
    hydrateRuntime,
    hoverFieldCard,
    idle,
    manualTake,
    openAnnounceCardDialog,
    openReveal,
    openSelectAttributesDialog,
    openSelectOptionDialog,
    openSelectPositionDialog,
    openYesNoDialog,
    previewReveal,
    previewCard,
    renderCurrentView,
    select,
    sendLegacyChoiceAnswer,
    sendQuestionAnswer,
    setChoiceOverlayActive: setChoiceOverlayActive2,
    setMode,
    setOrientation,
    setWaiting,
    showChoicePrompt,
    showChoiceResult,
    updateLobby
  };
}

// server/ui/services/game-setup.service.js
function createGameSetupService(context2, dialogService2, passiveService2) {
  const duelRuntimeAdapter = createDuelRuntimeAdapter(context2, {
    dialogService: dialogService2,
    passiveService: passiveService2
  });
  context2.duelRuntime = duelRuntimeAdapter;
  async function loadDecksForYGOPro(database) {
    if (typeof window === "undefined") {
      return [];
    }
    const session = localStorage.session;
    if (!session) {
      return [];
    }
    try {
      const response = await fetch(`/api/session/${session}`, {
        cache: "no-store"
      }), payload = await response.json();
      if (!payload?.success || !Array.isArray(payload?.user?.decks)) {
        return [];
      }
      return hydrateDeckRecords(payload.user.decks, database);
    } catch (error) {
      console.warn("Failed to load YGOPro decks", error);
      return [];
    }
  }
  context2.renderCurrentView = duelRuntimeAdapter.renderCurrentView;
  function scheduleBufferedIncomingActions() {
    if (context2.uiFlowState.incomingActions.timer) {
      clearTimeout(context2.uiFlowState.incomingActions.timer);
      context2.uiFlowState.incomingActions.timer = null;
    }
    if (!context2.uiFlowState.incomingActions.buffered.length) {
      return;
    }
    const delayMs = Math.max(0, context2.uiFlowState.incomingActions.delayUntil - Date.now());
    context2.uiFlowState.incomingActions.timer = setTimeout(() => {
      context2.uiFlowState.incomingActions.timer = null;
      flushBufferedIncomingActions();
    }, delayMs);
  }
  function setIncomingActionDelay(durationMs) {
    const delay = Math.max(0, Number(durationMs) || 0);
    if (!delay) {
      return;
    }
    context2.uiFlowState.incomingActions.delayUntil = Math.max(context2.uiFlowState.incomingActions.delayUntil, Date.now() + delay);
    scheduleBufferedIncomingActions();
  }
  context2.setIncomingActionDelay = setIncomingActionDelay;
  function flushBufferedIncomingActions() {
    while (context2.uiFlowState.incomingActions.buffered.length && Date.now() >= context2.uiFlowState.incomingActions.delayUntil) {
      duelRuntimeAdapter.handleIncomingAction(context2.uiFlowState.incomingActions.buffered.shift());
    }
    duelRuntimeAdapter.renderCurrentView();
    if (context2.uiFlowState.incomingActions.buffered.length) {
      scheduleBufferedIncomingActions();
    }
  }
  function registerListeners() {
    if (context2.listenersRegistered) {
      return;
    }
    context2.listenersRegistered = true;
    context2.store.on("CHAT_ENTRY", (message) => {
      context2.ws.write({
        action: "chat",
        message: message.message
      });
    });
    context2.store.on("START_CHOICE", (message) => {
      context2.ws.write({
        action: "start",
        turn_player: message.player,
        verification: window.verification
      });
    });
    dialogService2.registerListeners();
    context2.store.on("UPDATE_FIELD", () => {
      duelRuntimeAdapter.renderCurrentView();
    });
    context2.store.on("RENDER", () => {
      duelRuntimeAdapter.renderCurrentView();
    });
  }
  async function resolveProxyPort() {
    const response = await fetch("/api/websocket-port", {
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error(`Unable to fetch websocket port (${response.status})`);
    }
    const payload = await response.json(), port = Number(payload?.port);
    if (!Number.isFinite(port) || port <= 0) {
      throw new Error("Invalid websocket port payload");
    }
    return port;
  }
  function resolveRoomPort(room) {
    const directPort = Number(room);
    if (Number.isFinite(directPort) && directPort > 0) {
      return directPort;
    }
    if (typeof window === "undefined") {
      return null;
    }
    const roomParam = new URLSearchParams(window.location.search).get("room"), parsedPort = Number(roomParam);
    if (!Number.isFinite(parsedPort) || parsedPort <= 0) {
      return null;
    }
    return parsedPort;
  }
  async function startGame(room) {
    const roomPort = resolveRoomPort(room);
    context2.uiRuntimeState.orientation = 0;
    if (typeof window !== "undefined") {
      window.orientation = 0;
    }
    if (!roomPort) {
      duelRuntimeAdapter.renderCurrentView();
      return () => {
      };
    }
    context2.databaseSystem = await fetch("/manifest/manifest_0-language-merged.json").then((response) => response.json());
    duelRuntimeAdapter.hydrateRuntime();
    context2.uiRuntimeState.lobby.update({
      decks: await loadDecksForYGOPro(context2.databaseSystem)
    });
    registerListeners();
    duelRuntimeAdapter.renderCurrentView();
    try {
      const proxyPort = await resolveProxyPort();
      duelRuntimeAdapter.connect(proxyPort, roomPort);
    } catch (error) {
      console.error(error);
    }
    return () => {
      duelRuntimeAdapter.dispose();
    };
  }
  return {
    renderCurrentView: duelRuntimeAdapter.renderCurrentView,
    startGame
  };
}

// server/ui/services/game.service.js
var store = { emit, on, subscribe };
var uiRuntimeState = {
  duel: null,
  chat: null,
  lobby: null,
  choice: null,
  manualControls: null,
  mode: "lobby",
  orientation: 0
};
var questionState = {
  id: void 0,
  command: void 0,
  min: 0,
  max: 0,
  options: {},
  selection: [],
  counterAllocations: [],
  counterTarget: 0,
  prompt: "",
  promptTimer: null,
  signature: null,
  answerPending: false
};
var uiFlowState = {
  choiceOverlay: {
    timer: null,
    token: 0
  },
  incomingActions: {
    delayUntil: 0,
    timer: null,
    buffered: []
  }
};
var app2 = {
  manual: false,
  duel: null,
  lobby: null,
  manualControls: null,
  refreshUI: () => context.renderCurrentView(),
  surrender: () => {
    if (!context.ws) {
      return;
    }
    context.ws.write({
      action: "surrender",
      slot: context.uiRuntimeState.orientation || 0
    });
  }
};
var context = {
  store,
  app: app2,
  root: null,
  ws: null,
  databaseSystem: [],
  listenersRegistered: false,
  uiRuntimeState,
  questionState,
  uiFlowState,
  renderCurrentView: () => {
  },
  setIncomingActionDelay: () => {
  },
  choiceApi: {
    setChoiceOverlayActive,
    updateChoiceState
  },
  lifepointApi: {
    setLifepointWaiting
  }
};
var localOrient = (player, currentOrientation = context.uiRuntimeState.orientation) => currentOrientation ? player ? 0 : 1 : player;
var dialogService = createGameDialogService(context, {
  orient: localOrient
});
var passiveService = createPassiveGameStateService(context, dialogService);
var game = createGameSetupService(context, dialogService, passiveService);
Object.assign(globalThis, {
  React: import_react31.default,
  app: app2,
  Field,
  CardInfo,
  SideChat,
  LobbyScreen,
  DuelScreen,
  ChoiceScreen,
  ManualControls,
  PhaseIndicator,
  FieldSelector: field_selection_component_default,
  ZoneSelector: zone_selection_component_default,
  CardImage,
  Flasher,
  Revealer,
  ControlButtons,
  LifepointDisplay,
  SelectPosition,
  DeckDialog,
  YesNoDialog,
  SelectOptionDialog,
  SelectAttributes,
  AnnounceCardDialog: MountedAnnounceCardDialog,
  Chainer,
  ExtraControls,
  createLobbyScreen
});
async function createGame(room) {
  return game.startGame(room);
}

// .tmp/parity/startGame-smoke.test.js
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
function installDom(html = '<!doctype html><html><body><main id="main"></main></body></html>') {
  const dom = new import_jsdom.JSDOM(html, {
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
(0, import_node_test.default)("startGame smoke keeps proxy boot and turn-choice flow working", async () => {
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
        json: async () => [{ id: 1001, name: "Scarm, Malebranche of the Burning Abyss" }]
      };
    }
    if (url === "/api/session/test-session") {
      return {
        ok: true,
        json: async () => ({
          success: true,
          user: {
            decks: [{ name: "Burning Abyss", main: [1001], extra: [], side: [] }]
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
  const cleanup = await createGame(12345);
  try {
    await waitFor(() => document.querySelector("#lobby"), 500);
    import_strict.default.ok(socket);
    import_strict.default.equal(socket.url, "ws://localhost:31337");
    await waitFor(() => socket.sent.length > 0 ? socket.sent[0] : null, 250);
    import_strict.default.deepEqual(socket.sent[0], { action: "proxy_connect", port: 12345 });
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "proxy", status: "up" })
    }));
    await flush(20);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "registered" })
    }));
    await flush(20);
    socket.dispatchEvent(new dom.window.MessageEvent("message", {
      data: JSON.stringify({ action: "turn_player", slot: 0, verification: "verify-1" })
    }));
    await flush(20);
    import_strict.default.equal(document.querySelector("#choice-runtime") !== null, true);
    import_strict.default.deepEqual(fetchCalls.map((call) => call.url), [
      "/manifest/manifest_0-language-merged.json",
      "/api/session/test-session",
      "/api/websocket-port"
    ]);
    import_strict.default.deepEqual(socket.sent.slice(0, 3), [
      { action: "proxy_connect", port: 12345 },
      {
        action: "proxy_message",
        payload: { action: "register", username: "alice", session: "test-session" }
      },
      {
        action: "proxy_message",
        payload: { action: "join" }
      }
    ]);
    import_strict.default.equal(globalThis.window.verification, "verify-1");
  } finally {
    await cleanup();
    await flush(50);
    restore();
  }
});
