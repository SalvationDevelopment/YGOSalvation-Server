import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import * as Module from "../../../../server/ui/components/duel/zone.selection.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";
import { render, setupDom } from "../../cms/dom-test-utils.js";

test("zone.selection.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});

test("zone.selection.component.jsx keeps key out of spread props and renders zone metadata", async () => {
  const dom = setupDom();

  try {
    globalThis.app = {
      duel: {
        field: {
          state: {
            cards: {},
          },
        },
      },
    };

    const properties = Module.getZoneSelectorProperties(
      {
        uid: "zone-1",
        player: 0,
        location: "MONSTERZONE",
        index: 2,
        position: "FaceUpAttack",
        id: "m2",
      },
      true,
      null,
      { current: false },
    );

    assert.equal(Object.prototype.hasOwnProperty.call(properties, "key"), false);

    const container = await render(
      <Module.ZoneSelector
        zone={{
          uid: "zone-1",
          player: 0,
          location: "MONSTERZONE",
          index: 2,
          position: "FaceUpAttack",
          id: "m2",
        }}
        active={true}
        store={null}
      />,
    );
    const zone = container.querySelector("div");

    assert.ok(zone);
    assert.equal(zone.getAttribute("key"), null);
    assert.equal(zone.dataset.uid, "zone-1");
    assert.equal(zone.dataset.index, "2");
  } finally {
    delete globalThis.app;
    await dom.cleanup();
  }
});
