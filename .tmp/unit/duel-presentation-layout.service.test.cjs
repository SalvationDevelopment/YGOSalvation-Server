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

// tests/unit/ui/duel-presentation-layout.service.test.js
var import_strict = __toESM(require("node:assert/strict"));
var import_node_test = __toESM(require("node:test"));

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

// tests/unit/ui/duel-presentation-layout.service.test.js
(0, import_node_test.default)("buildStackedRevealPlacements fans cards from a shared anchor", () => {
  import_strict.default.deepEqual(buildStackedRevealPlacements({ x: 100, y: 200 }, 3), [
    {
      x: 100,
      y: 200,
      offsetX: -22,
      offsetY: -0,
      rotation: -4
    },
    {
      x: 100,
      y: 200,
      offsetX: 0,
      offsetY: -6,
      rotation: 0
    },
    {
      x: 100,
      y: 200,
      offsetX: 22,
      offsetY: -12,
      rotation: 4
    }
  ]);
});
(0, import_node_test.default)("createDuelPresentationLayoutService resolves reveal placements for deck and field previews", () => {
  const service = createDuelPresentationLayoutService(), field = {
    getPileViewportCenter(player, location) {
      return location === "DECK" ? { x: 50 + player, y: 80 } : { x: 120 + player, y: 140 };
    },
    getViewportCenter(card) {
      if (card?.id === 1001) {
        return { x: 20, y: 30 };
      }
      if (card?.id === 1002) {
        return { x: 40, y: 60 };
      }
      return null;
    }
  };
  import_strict.default.deepEqual(
    service.resolveRevealPresentation(field, [{ id: 1 }, { id: 2 }], {
      call: "deck_top",
      player: 1,
      duration: 900
    }),
    {
      cards: [{ id: 1 }, { id: 2 }],
      placements: [
        { x: 51, y: 80, offsetX: -11, offsetY: -0, rotation: -2 },
        { x: 51, y: 80, offsetX: 11, offsetY: -6, rotation: 2 }
      ],
      duration: 900,
      mode: "deck_top"
    }
  );
  import_strict.default.deepEqual(
    service.resolveRevealPresentation(field, [{ id: 1001 }, { id: 1002 }], {
      call: "confirm_cards",
      duration: 1500
    }),
    {
      cards: [{ id: 1001 }, { id: 1002 }],
      placements: [
        { x: 20, y: 30, offsetX: 0, offsetY: 0, rotation: 0 },
        { x: 40, y: 60, offsetX: 0, offsetY: 0, rotation: 0 }
      ],
      duration: 1500,
      mode: "confirm_cards"
    }
  );
});
(0, import_node_test.default)("createDuelPresentationLayoutService returns null when reveal anchors are unavailable", () => {
  const service = createDuelPresentationLayoutService(), field = {
    getPileViewportCenter() {
      return null;
    },
    getViewportCenter() {
      return null;
    }
  };
  import_strict.default.equal(service.resolveRevealPresentation(field, [{ id: 1 }], {
    call: "confirm_extratop",
    player: 0
  }), null);
  import_strict.default.equal(service.resolveRevealPresentation(field, [{ id: 1001 }], {
    call: "confirm_cards"
  }), null);
});
(0, import_node_test.default)("createDuelPresentationLayoutService resolves announcement and attack presentation payloads", () => {
  const service = createDuelPresentationLayoutService(), field = {
    getViewportCenter(query) {
      if (query?.id === "source") {
        return { x: 10, y: 20 };
      }
      if (query?.id === "target") {
        return { x: 40, y: 60 };
      }
      return null;
    },
    getDirectAttackViewportCenter(player) {
      return { x: 80 + player, y: 120 };
    }
  };
  import_strict.default.deepEqual(
    service.resolveAnnouncementPresentation(field, {
      id: 2001,
      mode: "legacy_preview",
      source: { id: "source" }
    }),
    {
      type: "pulse",
      cards: [{ id: "source" }],
      duration: 1e3
    }
  );
  import_strict.default.deepEqual(
    service.resolveAnnouncementPresentation(field, {
      id: 3001,
      mode: "summon",
      source: { id: "source" },
      duration: 700
    }),
    {
      type: "flasher",
      payload: {
        id: 3001,
        mode: "summon",
        source: { id: "source" },
        duration: 700,
        sourceAnchor: { x: 10, y: 20 }
      }
    }
  );
  import_strict.default.deepEqual(
    service.resolveAttackAnimation(field, { id: "source", player: 1 }, { id: "target" }, 640),
    {
      from: { x: 10, y: 20 },
      to: { x: 40, y: 60 },
      duration: 640
    }
  );
  import_strict.default.deepEqual(
    service.resolveAttackAnimation(field, { id: "source", player: 1 }, null, 640),
    {
      from: { x: 10, y: 20 },
      to: { x: 81, y: 120 },
      duration: 640
    }
  );
});
