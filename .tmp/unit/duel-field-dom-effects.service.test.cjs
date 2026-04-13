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

// tests/unit/ui/duel-field-dom-effects.service.test.js
var import_strict = __toESM(require("node:assert/strict"));
var import_node_test = __toESM(require("node:test"));

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

// tests/unit/ui/duel-field-dom-effects.service.test.js
function createFakeElement(attributes = {}, style = {}) {
  return {
    attributes: {
      ...attributes
    },
    dataset: {},
    style: {
      ...style
    },
    getAttribute(name) {
      return this.attributes[name];
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
      if (name === "style") {
        this.style = {};
      }
    }
  };
}
(0, import_node_test.default)("createDuelFieldDomEffectsService lays out hand cards through the injected viewport", () => {
  const firstCard = createFakeElement(), secondCard = createFakeElement(), thirdCard = createFakeElement(), service = createDuelFieldDomEffectsService({
    viewport: {
      queryElements(selector) {
        switch (selector) {
          case ".p0.HAND":
            return [firstCard, secondCard, thirdCard];
          case ".p0.HAND.i0":
            return [firstCard];
          case ".p0.HAND.i1":
            return [secondCard];
          case ".p0.HAND.i2":
            return [thirdCard];
          default:
            return [];
        }
      },
      getNumericStyle() {
        return 0;
      }
    }
  });
  service.layoutHand(0);
  import_strict.default.equal(firstCard.style.left, "290.625px");
  import_strict.default.equal(secondCard.style.left, "365.625px");
  import_strict.default.equal(thirdCard.style.left, "440.625px");
});
(0, import_node_test.default)("createDuelFieldDomEffectsService shuffles deck stacks and restores hand layout on completion", () => {
  const deckCard = createFakeElement({ "data-index": "3" }, { left: "0px" }), handCard = createFakeElement(), timeouts = [], intervals = [], clearedIntervals = [], service = createDuelFieldDomEffectsService({
    viewport: {
      queryElements(selector) {
        switch (selector) {
          case ".card.p0.DECK":
            return [deckCard];
          case ".p0.HAND":
            return [handCard];
          case ".p0.HAND.i0":
            return [handCard];
          default:
            return [];
        }
      },
      getNumericStyle(_element, property) {
        return property === "left" ? 100 : 0;
      }
    },
    random: () => 0.75,
    setInterval(callback, delay) {
      const token = { callback, delay };
      intervals.push(token);
      return token;
    },
    clearInterval(token) {
      clearedIntervals.push(token);
    },
    setTimeout(callback, delay) {
      const token = { callback, delay };
      timeouts.push(token);
      return token;
    }
  });
  service.shuffleDeck(0, "DECK");
  import_strict.default.equal(deckCard.style.webkitTransform, "translate3d(0,0,3px)");
  import_strict.default.equal(deckCard.style.zIndex, "3");
  import_strict.default.equal(deckCard.style.left, "75px");
  import_strict.default.deepEqual(intervals.map((entry) => entry.delay), [200]);
  import_strict.default.deepEqual(timeouts.map((entry) => entry.delay), [1e3]);
  timeouts[0].callback();
  import_strict.default.deepEqual(clearedIntervals, [intervals[0]]);
  import_strict.default.equal(deckCard.style.webkitTransform, "translate3d(0,0,3px)");
  import_strict.default.equal(deckCard.style.zIndex, "3");
  import_strict.default.deepEqual(timeouts.map((entry) => entry.delay), [1e3, 500]);
  timeouts[1].callback();
  import_strict.default.equal(handCard.style.left, "365.625px");
});
(0, import_node_test.default)("createDuelFieldDomEffectsService shuffles visible zone cards and restores prior transforms", () => {
  const baseCard = createFakeElement({ "data-overlayindex": "0" }, { transform: "rotate(5deg)" }), overlayCard = createFakeElement({ "data-overlayindex": "1" }, { transform: "rotate(10deg)" }), timeouts = [], service = createDuelFieldDomEffectsService({
    viewport: {
      queryElements(selector) {
        if (selector === ".card.p1.HAND") {
          return [baseCard, overlayCard];
        }
        return [];
      },
      getNumericStyle() {
        return 0;
      }
    },
    random: () => 0.75,
    setTimeout(callback, delay) {
      const token = { callback, delay };
      timeouts.push(token);
      return token;
    }
  });
  service.shuffleZone(1, "HAND");
  import_strict.default.equal(baseCard.dataset.shuffleTransform, "rotate(5deg)");
  import_strict.default.equal(baseCard.style.transform, "rotate(5deg) translate(9px, 4px)");
  import_strict.default.equal(overlayCard.style.transform, "rotate(10deg)");
  import_strict.default.deepEqual(timeouts.map((entry) => entry.delay), [350]);
  timeouts[0].callback();
  import_strict.default.equal(baseCard.style.transform, "rotate(5deg)");
  import_strict.default.equal(baseCard.dataset.shuffleTransform, void 0);
});
