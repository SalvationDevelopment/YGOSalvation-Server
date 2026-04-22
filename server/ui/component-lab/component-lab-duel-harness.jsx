"use client";

import React, { useMemo } from "react";
import { FieldState, MountedField } from "../components/duel/field.component";

const DUEL_SLOT_BY_ENTRY_ID = {
  "duel/announce.card.component": { id: "announceCardDialog" },
  "duel/anouncement.component": { id: "announcer" },
  "duel/attack.animation.component": { id: "attacklayer" },
  "duel/attribute.component": { id: "attributes" },
  "duel/cardinfo.component": { id: "ingamecardimage" },
  "duel/chain.component": { id: "chain" },
  "duel/choice.component": { id: "duel-choice-overlay" },
  "duel/controls.component": { id: "actions" },
  "duel/extracontrols.component": { id: "extracontrols" },
  "duel/field.reveal.component": { id: "fieldreveal" },
  "duel/lifepoint.component": { id: "lifepoints" },
  "duel/phase.banner.component": { id: "phasebanner" },
  "duel/position.component": { id: "positionDialog" },
  "duel/reveal.component": { id: "revealer" },
  "duel/select.option.component": { id: "optionDialog" },
  "duel/sidechat.component": { id: "sidechat" },
  "duel/view_decks.component": { id: "viewDecks" },
  "duel/yesno.component": { id: "yesnoDialog" },
};

function LegacyControllerSlot({ id, className, children }) {
  return (
    <div className={className} id={id}>
      {children}
    </div>
  );
}

function wrapDuelPreviewChild(entryId, child) {
  const slot = DUEL_SLOT_BY_ENTRY_ID[entryId];

  if (!slot) {
    return child;
  }

  return (
    <LegacyControllerSlot className={slot.className} id={slot.id}>
      {child}
    </LegacyControllerSlot>
  );
}

function createNoopManualControls() {
  return new Proxy({}, {
    get(_target, property) {
      if (property === "manualActionReference") {
        return undefined;
      }

      return () => {};
    }
  });
}

function ensureComponentLabApp(fieldController) {
  const existingApp = globalThis.app && typeof globalThis.app === "object"
      ? globalThis.app
      : {},
    noopManualControls = existingApp.manualControls || createNoopManualControls(),
    duel = {
      ...(existingApp.duel || {}),
      field: fieldController,
      controls: {
        enable: () => {},
        ...(existingApp.duel?.controls || {})
      },
      closeRevealer: existingApp.duel?.closeRevealer || (() => {}),
      info: {
        target: undefined,
        ...(existingApp.duel?.info || {})
      }
    },
    nextApp = {
      ...existingApp,
      manual: Boolean(existingApp.manual),
      surrender: existingApp.surrender || (() => {}),
      manualControls: noopManualControls,
      lobby: {
        state: {
          player: [],
          ...(existingApp.lobby?.state || {})
        },
        ...(existingApp.lobby || {})
      },
      duel
    };

  globalThis.app = nextApp;
  return nextApp;
}

export default function ComponentLabDuelHarness({ entryId, children }) {
  const fieldController = useMemo(() => FieldState({ info: {}, field: {} }, undefined, []), []);
  ensureComponentLabApp(fieldController);

  return (
    <div className="component-lab-duel-harness">
      <LegacyControllerSlot className="field newfield component-lab-duel-field-slot" id="component-lab-duel-field">
        <div className="fieldimage" id="automationduelfield" style={{ display: "block" }}>
          <MountedField controller={fieldController} />
        </div>
      </LegacyControllerSlot>
      {wrapDuelPreviewChild(entryId, children)}
    </div>
  );
}
