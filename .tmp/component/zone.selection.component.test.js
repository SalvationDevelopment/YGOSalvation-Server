var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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

// tests/component/ui/duel/zone.selection.component.test.jsx
var import_node_test = __toESM(require("node:test"));
var import_strict2 = __toESM(require("node:assert/strict"));
var import_react3 = __toESM(require("react"));

// server/ui/components/duel/zone.selection.component.jsx
var zone_selection_component_exports = {};
__export(zone_selection_component_exports, {
  MountedZoneSelector: () => MountedZoneSelector,
  ZoneSelector: () => ZoneSelector,
  clickZoneSelector: () => clickZoneSelector,
  default: () => zone_selection_component_default,
  getZoneSelectorProperties: () => getZoneSelectorProperties,
  getZoneSelectorViewerPlayer: () => getZoneSelectorViewerPlayer,
  hoverZoneSelector: () => hoverZoneSelector,
  unhoverZoneSelector: () => unhoverZoneSelector
});
var import_react = __toESM(require("react"), 1);

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
function createSelectDisfieldAnswer(placeOrPlayer, location, sequence) {
  return {
    type: "zone",
    i: normalizePlace(placeOrPlayer, location, sequence)
  };
}
function createSelectPlaceAnswer(placeOrPlayer, location, sequence) {
  return createSelectDisfieldAnswer(placeOrPlayer, location, sequence);
}

// server/ui/components/duel/zone.selection.component.module.scss
var zone_selection_component_module_default = ".root {}\n";

// server/ui/components/duel/zone.selection.component.jsx
var import_jsx_runtime = require("react/jsx-runtime");
function getZoneSelectorViewerPlayer(zone) {
  return window.orientation ? zone.player ? 0 : 1 : zone.player;
}
function hoverZoneSelector(store, zone, hoveredRef) {
  if (!store || !zone || hoveredRef.current) {
    return;
  }
  hoveredRef.current = true;
  store.emit?.({
    action: "ZONE_HOVER",
    player: zone.player,
    location: zone.location,
    index: zone.index
  });
}
function unhoverZoneSelector(hoveredRef) {
  hoveredRef.current = false;
}
function clickZoneSelector(store, zone) {
  if (!store || !zone) {
    return;
  }
  store.emit?.({
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
function getZoneSelectorProperties(zone, active, store, hoveredRef) {
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
    onError: function(event) {
      event.target.src = "img/textures/unknown.jpg";
    },
    onMouseEnter: () => hoverZoneSelector(store, zone, hoveredRef),
    onMouseLeave: () => unhoverZoneSelector(hoveredRef),
    onClick: () => clickZoneSelector(store, zone),
    style
  };
}
function ZoneSelector({ zone, active, store }) {
  const hoveredRef = (0, import_react.useRef)(false);
  if (!zone) {
    return null;
  }
  const properties = getZoneSelectorProperties(zone, active, store, hoveredRef);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...properties, className: `${properties.className} ${zone_selection_component_module_default.root}`.trim() }, zone.uid);
}
function MountedZoneSelector({ zone, active, store }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoneSelector, { zone, active, store });
}
var zone_selection_component_default = ZoneSelector;

// tests/component/ui/component-smoke-test-utils.js
var import_strict = __toESM(require("node:assert/strict"));
function expectDefaultComponentExport(moduleNamespace) {
  import_strict.default.ok(moduleNamespace);
  import_strict.default.equal(typeof moduleNamespace.default, "function");
}

// tests/component/cms/dom-test-utils.js
var import_react2 = require("react");
var import_client = __toESM(require("react-dom/client"));
var ReactDomTestUtils = __toESM(require("react-dom/test-utils"));
var import_jsdom = require("jsdom");
var mountedRoots = [];
function copyWindowProperties(windowObject) {
  for (const key of Object.getOwnPropertyNames(windowObject)) {
    if (key in globalThis) {
      continue;
    }
    globalThis[key] = windowObject[key];
  }
}
function setupDom() {
  const dom = new import_jsdom.JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/"
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.KeyboardEvent = dom.window.KeyboardEvent;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.FocusEvent = dom.window.FocusEvent;
  globalThis.FormData = dom.window.FormData;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  globalThis.cancelAnimationFrame = (handle) => clearTimeout(handle);
  copyWindowProperties(dom.window);
  return {
    window: dom.window,
    async cleanup() {
      while (mountedRoots.length) {
        const root = mountedRoots.pop();
        await (0, import_react2.act)(async () => {
          root.unmount();
        });
      }
      await flush();
      dom.window.close();
      globalThis.window = void 0;
      globalThis.document = void 0;
      globalThis.navigator = void 0;
    }
  };
}
async function render(element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = import_client.default.createRoot(container);
  mountedRoots.push(root);
  await (0, import_react2.act)(async () => {
    root.render(element);
  });
  return container;
}
async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// tests/component/ui/duel/zone.selection.component.test.jsx
var import_jsx_runtime2 = require("react/jsx-runtime");
(0, import_node_test.default)("zone.selection.component.jsx exports a default component", () => {
  expectDefaultComponentExport(zone_selection_component_exports);
});
(0, import_node_test.default)("zone.selection.component.jsx keeps key out of spread props and renders zone metadata", async () => {
  const dom = setupDom();
  try {
    globalThis.app = {
      duel: {
        field: {
          state: {
            cards: {}
          }
        }
      }
    };
    const properties = getZoneSelectorProperties(
      {
        uid: "zone-1",
        player: 0,
        location: "MONSTERZONE",
        index: 2,
        position: "FaceUpAttack",
        id: "m2"
      },
      true,
      null,
      { current: false }
    );
    import_strict2.default.equal(Object.prototype.hasOwnProperty.call(properties, "key"), false);
    const container = await render(
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        ZoneSelector,
        {
          zone: {
            uid: "zone-1",
            player: 0,
            location: "MONSTERZONE",
            index: 2,
            position: "FaceUpAttack",
            id: "m2"
          },
          active: true,
          store: null
        }
      )
    );
    const zone = container.querySelector("div");
    import_strict2.default.ok(zone);
    import_strict2.default.equal(zone.getAttribute("key"), null);
    import_strict2.default.equal(zone.dataset.uid, "zone-1");
    import_strict2.default.equal(zone.dataset.index, "2");
  } finally {
    delete globalThis.app;
    await dom.cleanup();
  }
});
//# sourceMappingURL=zone.selection.component.test.js.map
