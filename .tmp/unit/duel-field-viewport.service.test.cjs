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

// tests/unit/ui/duel-field-viewport.service.test.js
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

// tests/unit/ui/duel-field-viewport.service.test.js
(0, import_node_test.default)("createDuelFieldViewport exposes query helpers and numeric style reads", () => {
  const handElements = [{ id: "a" }, { id: "b" }], document = {
    querySelectorAll(selector) {
      import_strict.default.equal(selector, ".p0.HAND");
      return handElements;
    }
  }, window = {
    getComputedStyle() {
      return {
        left: "14.5px"
      };
    }
  }, viewport = createDuelFieldViewport({
    document,
    window
  });
  import_strict.default.deepEqual(viewport.queryElements(".p0.HAND"), handElements);
  import_strict.default.equal(viewport.getNumericStyle({}, "left"), 14.5);
});
(0, import_node_test.default)("createDuelFieldViewport measures card, pile, and lifepoint anchors from DOM elements", () => {
  const cardElement = {
    getBoundingClientRect() {
      return {
        left: 10,
        top: 20,
        width: 30,
        height: 40
      };
    }
  }, fieldRoot = {
    getBoundingClientRect() {
      return {
        left: 100,
        top: 200,
        width: 120,
        height: 120
      };
    }
  }, lifepointSlot = {
    getBoundingClientRect() {
      return {
        left: 40,
        top: 60,
        width: 30,
        height: 30
      };
    }
  }, document = {
    querySelector(selector) {
      if (selector === '.card[data-uid="alpha"]') {
        return cardElement;
      }
      if (selector === ".lp-slot.p1") {
        return lifepointSlot;
      }
      return null;
    },
    getElementById(id) {
      if (id === "automationduelfield") {
        return fieldRoot;
      }
      return null;
    }
  }, window = {
    getComputedStyle(element) {
      if (element === cardElement) {
        return {
          transform: "translate(4px, 6px)"
        };
      }
      return {
        transform: "none"
      };
    }
  }, viewport = createDuelFieldViewport({
    document,
    window
  });
  import_strict.default.deepEqual(viewport.getCardCenterByUid("alpha"), {
    x: 25,
    y: 40
  });
  import_strict.default.deepEqual(viewport.getFieldRootCenter(), {
    x: 160,
    y: 260
  });
  import_strict.default.deepEqual(viewport.getLpSlotCenter(1), {
    x: 55,
    y: 75
  });
  import_strict.default.deepEqual(viewport.getCardGhostStyle("alpha"), {
    position: "fixed",
    left: "10px",
    top: "20px",
    width: "30px",
    height: "40px",
    transform: "translate(4px, 6px)",
    zIndex: 40
  });
});
