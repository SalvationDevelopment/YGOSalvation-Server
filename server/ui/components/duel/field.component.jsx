import React from "react";
import styles from "./field.component.module.scss";
import { MountedCardImage } from '../common/card.component';
import { MountedPhaseIndicator, normalizePhaseIndicatorUpdate, updatePhaseIndicator } from './phases.component';
import { MountedFieldSelector, disableFieldSelection, selectFieldZones } from './field.selection.component';
import { createDuelFieldViewport } from '../../services/duel-field-viewport.service';
import { defaultDuelFieldStateService } from '../../services/duel-field-state.service';

const defaultFieldViewport = createDuelFieldViewport();

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
    return (
      Number(state.overlayindex || 0) === Number(query.overlay_sequence) + 1
    );
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

function removeFieldMapEntry(map, key) {
  const nextMap = { ...map };
  delete nextMap[key];
  return nextMap;
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
    active: Boolean(active),
  };
}

function normalizeFieldQuery(query) {
  if (!query || typeof query !== "object") {
    return null;
  }

  const player = Number(query.player),
    index = Number(query.index);

  if (
    !Number.isInteger(player) ||
    typeof query.location !== "string" ||
    !Number.isInteger(index)
  ) {
    return null;
  }

  const output = {
    player,
    location: query.location,
    index,
  };

  if (Number.isInteger(query.overlay_sequence)) {
    output.overlay_sequence = Number(query.overlay_sequence);
  } else if (
    Number.isInteger(query.overlayindex) &&
    Number(query.overlayindex) > 0
  ) {
    output.overlay_sequence = Number(query.overlayindex) - 1;
  }

  return output;
}

function FieldOverlayZone({ className, dataset = {}, style = {}, ariaHidden = null }) {
  return (
    <div
      className={className}
      data-player={dataset.player}
      data-location={dataset.location}
      data-index={dataset.index}
      data-uid={dataset.uid}
      aria-hidden={ariaHidden}
      style={style}
    />
  );
}

function buildFieldActionSpinners(controller) {
  return controller.getActionSpinnerDescriptors().map(({ player, location, index }) => {
    const key = controller.getActionSpinnerKey(player, location, index ?? null),
      enabled = Boolean(controller.state.actionSpinners[key]);

    return (
      <FieldOverlayZone
        key={key}
        className={[
          `p${player}`,
          location,
          Number.isInteger(index) ? `i${index}` : null,
          "actcover",
          enabled ? "enabled" : "disabled",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    );
  });
}

export function FieldView({ controller }) {
  if (!controller) {
    return null;
  }

  const cards = Object.keys(controller.state.cards).map((card) => {
      return (
        <MountedCardImage
          controller={controller.state.cards[card]}
          key={card}
        />
      );
    }),
    fadeCards = Object.keys(controller.state.fadeCards).map((card) => {
      return (
        <MountedCardImage
          controller={controller.state.fadeCards[card]}
          key={card}
        />
      );
    }),
    disabledZones = Object.keys(controller.state.disabledZones).map((card) => {
      return (
        <MountedFieldDisabledZone
          state={controller.state.disabledZones[card]}
          key={card}
        />
      );
    });

  return (
    <div className={styles.root}>
      {cards}
      {fadeCards}
      <MountedPhaseIndicator controller={controller.state.phase} key="field-phase-indicator" />
      <MountedFieldSelector controller={controller.state.selectors} key="field-selector" />
      {disabledZones}
      {buildFieldActionSpinners(controller)}
    </div>
  );
}

export function MountedField({ controller }) {
  return <FieldView controller={controller} />;
}

export function MountedFieldDisabledZone({ state }) {
  if (!state) {
    return null;
  }

  const properties = getFieldDisabledZoneProperties(state);

  return (
    <FieldOverlayZone
      className={properties.className}
      dataset={{
        player: properties["data-player"],
        location: properties["data-location"],
        index: properties["data-index"],
        uid: properties["data-uid"],
      }}
      ariaHidden={properties["aria-hidden"]}
      style={properties.style}
    />
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
      state.active ? "active" : "inactive",
    ].join(" "),
    "data-player": state.player,
    "data-location": state.location,
    "data-index": state.index,
    "data-uid": state.uid,
    "aria-hidden": "true",
    key: state.uid,
    style: {
      pointerEvents: "none",
    },
  };
}

const fieldMethods = {
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
          uid: `field-disabled-player_${player}-${zoneType}-${index}`,
        });
      }
    }

    return zones;
  },

  createFieldDisabledState() {
    const disabledZones = {},
      zones = []
        .concat(this.buildFieldDisabledZones("MONSTERZONE", 7))
        .concat(this.buildFieldDisabledZones("SPELLZONE", 8));

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
        (zone) =>
          `field-disabled-player_${Number(zone?.player ?? 0)}-${zone?.location}-${Number(zone?.index ?? 0)}`,
      ),
    );
    let changed = false;
    const nextDisabledZones = {};

    Object.keys(this.state.disabledZones).forEach((uid) => {
      const nextZone = setFieldZoneActive(
        this.state.disabledZones[uid],
        activeZoneKeys.has(uid),
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
      disabledZones: nextDisabledZones,
    };

    this.store.emit({ action: "RENDER" });
  },

  findCardImages(query) {
    return Object.values(this.state.cards).filter((cardImage) =>
      matchesFieldCardState(cardImage?.state, query),
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
    const cards = Object.values(this.state.cards)
        .filter(
          (cardImage) =>
            cardImage?.state?.player === Number(player) &&
            cardImage?.state?.location === location &&
            Number(cardImage?.state?.overlayindex || 0) === 0,
        )
        .sort(
          (first, second) =>
            Number(second?.state?.index || 0) -
            Number(first?.state?.index || 0),
        ),
      topCard = cards[0];

    if (topCard) {
      return this.viewport.getCardCenterByUid(topCard.state.uid);
    }

    return this.viewport.getFieldRootCenter("automationduelfield");
  },

  getDirectAttackViewportCenter(attackingPlayer = 0) {
    return this.viewport.getLpSlotCenter(attackingPlayer ? 0 : 1)
      || this.getPileViewportCenter(attackingPlayer ? 0 : 1, "DECK");
  },

  clearRelationHighlights() {
    this.hoveredRelationSource = null;
    Object.values(this.state.cards).forEach((cardImage) => {
      setFieldCardImageState(cardImage, {
        targetGlow: undefined,
        relationOverlay: undefined
      });
    });
  },

  applyRelationHighlights(query) {
    const normalized = normalizeFieldQuery(query),
      relatedTargets = [];

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
      (cardImage) =>
        Number(cardImage?.state?.chainOverlay?.index) === Number(chainIndex),
    );
  },

  updateChainOverlay(contract) {
    if (contract?.phase === "end") {
      this.clearChainOverlays();
      return;
    }

    const overlays = contract?.source
        ? this.findCardImages(contract.source)
        : this.findCardImagesByChainIndex(contract?.chainIndex),
      status = typeof contract?.phase === "string" ? contract.phase : "queued",
      chainIndex = Number(contract?.chainIndex || 0);

    overlays.forEach((cardImage) => {
      setFieldCardImageState(cardImage, {
        chainOverlay: {
          index: chainIndex,
          status,
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
        chainOverlay: undefined
      });
    });
    this.store.emit({ action: "RENDER" });
  },

  pulseSelectionCards(cards = [], duration = 900) {
    const visibleDuration = Math.max(90, Number(duration || 900));
    const seen = new Set();

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
            selectionPulse: undefined
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
    const seen = new Set();

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
            targetPulse: undefined
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

  pulseAnnouncementCards(cards = [], duration = 1000) {
    const visibleDuration = Math.max(1000, Number(duration || 1000));
    const seen = new Set();

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
            flashCover: undefined
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
            battlePulse: undefined
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
      (Array.isArray(hints) ? hints : [])
        .filter((hint) => hint?.location)
        .map((hint) => `${Number(hint.player ?? 0)}:${hint.location}`),
    );
    let changed = false;

    Object.values(this.state.cards).forEach((cardImage) => {
      const state = cardImage?.state;

      if (!state?.location) {
        return;
      }

      const shouldHint = activeHints.has(
        `${Number(state.player ?? 0)}:${state.location}`,
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
          commandHintPulse: undefined
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
      (Array.isArray(hints) ? hints : [])
        .filter((hint) => hint?.location)
        .map((hint) =>
          this.getActionSpinnerKey(
            Number(hint.player ?? 0),
            this.normalizeActionSpinnerLocation(hint.location),
            Number.isInteger(Number(hint.index)) ? Number(hint.index) : null,
          ),
        ),
    );
    let changed = false;

    const nextActionSpinners = {
      ...this.state.actionSpinners,
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
        actionSpinners: nextActionSpinners,
      };
      this.store.emit({ action: "RENDER" });
    }
  },

  getStackCards(query) {
    const normalized = normalizeFieldQuery(query);

    if (!normalized) {
      return [];
    }

    return Object.values(this.state.cards)
      .filter(
        (cardImage) =>
          cardImage?.state?.player === normalized.player &&
          cardImage?.state?.location === normalized.location &&
          cardImage?.state?.index === normalized.index,
      )
      .sort(
        (first, second) =>
          Number(first?.state?.overlayindex || 0) -
          Number(second?.state?.overlayindex || 0),
      );
  },

  getStackHost(query) {
    const host = this.getStackCards(query).find(
      (cardImage) => Number(cardImage?.state?.overlayindex || 0) === 0,
    );

    return host?.state ? Object.assign({}, host.state) : null;
  },

  getOverlayViewerDeck(query) {
    return this.getStackCards(query)
      .filter((cardImage) => Number(cardImage?.state?.overlayindex || 0) > 0)
      .map((cardImage, materialIndex) => ({
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
        hostIndex: cardImage.state.index,
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
      battlephase: undefined,
      mainphase2: undefined,
      endphase: undefined
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

export function FieldState(state = {}, store, databaseSystem = [], dependencies = {}) {
  const controller = {
    store,
    databaseSystem,
    hoveredRelationSource: null,
    fieldPrimed: false,
    fadeCleanupTimers: new Set(),
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
      store,
      state: {
        opponentTurn: false,
        phase: normalizePhaseIndicatorUpdate(state?.info?.phase),
        battlephase: undefined,
        mainphase2: undefined,
        endphase: undefined,
      },
    },
    selectors: {
      store,
      state: {
        activeZones: [],
      },
    },
  };

  controller.replaceField(state?.field || {});

  return controller;
}

export default function Field(state, store, databaseSystem = []) {
  return FieldState(state, store, databaseSystem);
}
