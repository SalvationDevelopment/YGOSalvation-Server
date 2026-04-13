import React, { useEffect, useState } from "react";
import Link from "next/link";
import { emit } from "../../services/listener.service";
import { subscribe } from "../../hooks/use-listener";
import styles from "./host.component.module.scss";

function splitLabels(text) {
  return text
    .trim()
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const HOST_TABS = [
  ["duel", "Restrictions", "Core room fields and match structure."],
  ["deck", "Deck Options", "Deck-size limits and validation flags."],
  ["custom", "Custom Rule", "Rule flags, type filters, and format drift."],
];

const ALLOWED_CARD_OPTIONS = [
  ["ocg", "OCG"],
  ["tcg", "TCG"],
  ["ocg_tcg", "OCG / TCG"],
  ["prerelease", "Prerelease"],
  ["anything_goes", "Anything Goes"],
];

const TEAM_COUNT_OPTIONS = [1, 2, 3];
const BEST_OF_OPTIONS = [1, 3, 5];

const GAME_RULE_OPTIONS = splitLabels(`
OCG Ignition Priority
First turn draw
1 Field Spell
Pendulum Zones
Separate Pendulum Zones
Extra Monster Zones
Fusion Synchro Xyz summonable anywhere
Trap Monsters don't occupy Spell/Trap Zone
Effects activate face-down in the Main and Extra Decks
Trigger Effects only activate in the correct location
Negated summons count for OPT restrictions
Negated summons count for activation restrictions
No Standby Phase
No Main Phase 2
Three-column field
Normal draw until 5 in hand
Unlimited hand size
Unlimited Normal Summons
Inverted Quick Priority
Traps must wait resolving
6 substeps Battle Step
Trigger even if private knowledge
Equip cards not destroyed on target miss
0 ATK vs 0 ATK destroys both monsters
Store attack replays
Only 1 Chain in damage substep
Can change position if summoned by your opponent
TCG SEGOC
SEGOC: First triggered effect first in chain
GOAT Ignition Priority
Rituals placed in the Extra Deck
Normal Summon in face-up Defense position
`);

const FORBIDDEN_TYPE_OPTIONS = splitLabels(`
No Fusion
No Synchro
No Xyz
No Pendulum
No Link
`);

const EXTRA_RULE_OPTIONS = splitLabels(`
Sealed Duel
Booster Draft Duel
Destiny Draw
Concentration Duel
Boss Duel
Battle City
Duelist Kingdom
Dimension Duel
Turbo Duel
Rule of the day
Command Duel
Virtual World
Action Duel
`);

const EXTRA_RULE_CONFLICT_GROUPS = [
  ["Sealed Duel", "Booster Draft Duel", "Boss Duel"],
  ["Battle City", "Duelist Kingdom", "Dimension Duel"],
];

const DEFAULT_DECK_LIMITS = {
  main: { min: 40, max: 60 },
  extra: { min: 0, max: 15 },
  side: { min: 0, max: 15 },
};

const TIME_LIMITS = {
  900: "15 minutes",
  1800: "30 minutes",
  2700: "45 minutes",
  3600: "60 minutes",
};

const SPEED_DECK_LIMITS = {
  main: { min: 20, max: 30 },
  extra: { min: 0, max: 6 },
  side: { min: 0, max: 6 },
};

const GOAT_DECK_LIMITS = {
  main: { min: 40, max: 60 },
  extra: { min: 0, max: 999 },
  side: { min: 0, max: 15 },
};

const DECK_LIMIT_FIELDS = [
  ["main", "min", "Minimum Main Deck size"],
  ["main", "max", "Maximum Main Deck size"],
  ["extra", "min", "Minimum Extra Deck size"],
  ["extra", "max", "Maximum Extra Deck size"],
  ["side", "min", "Minimum Side Deck size"],
  ["side", "max", "Maximum Side Deck size"],
];

const RULE_PRESETS = {
  mr1: {
    label: "Master Rule 1",
    startingHand: 5,
    deckLimits: DEFAULT_DECK_LIMITS,
    customRules: [
      "OCG Ignition Priority",
      "First turn draw",
      "1 Field Spell",
      "Negated summons count for OPT restrictions",
      "Negated summons count for activation restrictions",
    ],
    forbiddenTypes: ["No Xyz", "No Pendulum", "No Link"],
    startingLP: 8000
  },
  mr2: {
    label: "Master Rule 2",
    startingHand: 5,
    deckLimits: DEFAULT_DECK_LIMITS,
    customRules: [
      "First turn draw",
      "1 Field Spell",
      "Negated summons count for OPT restrictions",
      "Negated summons count for activation restrictions",
    ],
    forbiddenTypes: ["No Pendulum", "No Link"],
    startingLP: 8000
  },
  mr3: {
    label: "Master Rule 3",
    startingHand: 5,
    deckLimits: DEFAULT_DECK_LIMITS,
    customRules: [
      "Pendulum Zones",
      "Separate Pendulum Zones",
      "Negated summons count for OPT restrictions",
      "Negated summons count for activation restrictions",
    ],
    forbiddenTypes: ["No Link"],
    startingLP: 8000
  },
  mr4: {
    label: "Master Rule 4",
    startingHand: 5,
    deckLimits: DEFAULT_DECK_LIMITS,
    customRules: [
      "Pendulum Zones",
      "Extra Monster Zones",
      "Negated summons count for OPT restrictions",
      "Negated summons count for activation restrictions",
    ],
    forbiddenTypes: [],
    startingLP: 8000

  },
  mr5: {
    label: "Master Rules (2020)",
    startingHand: 5,
    deckLimits: DEFAULT_DECK_LIMITS,
    customRules: [
      "Pendulum Zones",
      "Extra Monster Zones",
      "Fusion Synchro Xyz summonable anywhere",
      "Trap Monsters don't occupy Spell/Trap Zone",
      "Trigger Effects only activate in the correct location",
    ],
    forbiddenTypes: [],
    startingLP: 8000
  },
  speed: {
    label: "Speed Duel",
    startingHand: 4,
    deckLimits: SPEED_DECK_LIMITS,
    customRules: [
      "Three-column field",
      "No Main Phase 2",
      "Trap Monsters don't occupy Spell/Trap Zone",
      "Trigger Effects only activate in the correct location",
    ],
    forbiddenTypes: [],
    startingLP: 8000

  },
  rush: {
    label: "Rush Duel",
    startingHand: 4,
    deckLimits: DEFAULT_DECK_LIMITS,
    customRules: [
      "Three-column field",
      "No Main Phase 2",
      "No Standby Phase",
      "First turn draw",
      "Inverted Quick Priority",
      "Normal draw until 5 in hand",
      "Unlimited hand size",
      "Unlimited Normal Summons",
      "Trap Monsters don't occupy Spell/Trap Zone",
      "Trigger Effects only activate in the correct location",
      "Rituals placed in the Extra Deck",
    ],
    forbiddenTypes: [],
    startingLP: 8000
  },
  goat: {
    label: "GOAT Format",
    startingHand: 5,
    deckLimits: GOAT_DECK_LIMITS,
    customRules: [
      "OCG Ignition Priority",
      "First turn draw",
      "1 Field Spell",
      "Negated summons count for OPT restrictions",
      "Negated summons count for activation restrictions",
      "TCG SEGOC",
      "SEGOC: First triggered effect first in chain",
      "GOAT Ignition Priority",
      "Traps must wait resolving",
      "6 substeps Battle Step",
      "Trigger even if private knowledge",
      "Equip cards not destroyed on target miss",
      "0 ATK vs 0 ATK destroys both monsters",
      "Store attack replays",
      "Only 1 Chain in damage substep",
      "Can change position if summoned by your opponent",
    ],
    forbiddenTypes: ["No Xyz", "No Pendulum", "No Link"],
    startingLP: 8000
  },
};

const RULE_PRESET_OPTIONS = [
  ["mr1", "Master Rule 1"],
  ["mr2", "Master Rule 2"],
  ["mr3", "Master Rule 3"],
  ["mr4", "Master Rule 4"],
  ["mr5", "Master Rules (2020)"],
  ["speed", "Speed Duel"],
  ["rush", "Rush Duel"],
  ["goat", "GOAT Format"],
  ["custom", "Custom"],
];

function cloneDeckLimits(deckLimits) {
  return {
    main: { ...deckLimits.main },
    extra: { ...deckLimits.extra },
    side: { ...deckLimits.side },
  };
}

function createDefaultHostConfig() {
  const preset = RULE_PRESETS.mr5;
  return {
    roomName: "",
    password: "",
    hostPort: null,
    notes: "",
    banlist: "No Banlist",
    allowedCards: "ocg_tcg",
    team1Count: 1,
    team2Count: 1,
    bestOf: 3,
    relay: false,
    timeLimitSeconds: 1800,
    noShuffleDeck: false,
    noCheckDeckContents: false,
    noCheckDeckSize: false,
    tcgSegocRulings: false,
    team1: {
      startingLP: preset.startingLP,
      startingDrawCount: preset.startingHand,
      drawCountPerTurn: 1,
    },
    team2: {
      startingLP: preset.startingLP,
      startingDrawCount: preset.startingHand,
      drawCountPerTurn: 1,
    },
    deckLimits: cloneDeckLimits(preset.deckLimits),
    customRules: preset.customRules.slice(),
    forbiddenTypes: preset.forbiddenTypes.slice(),
    extraRules: [],
  };
}

function sameStringSet(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((entry) => right.includes(entry));
}

function sameDeckLimits(left, right) {
  return (
    left.main.min === right.main.min &&
    left.main.max === right.main.max &&
    left.extra.min === right.extra.min &&
    left.extra.max === right.extra.max &&
    left.side.min === right.side.min &&
    left.side.max === right.side.max
  );
}

function detectRulePreset(hostConfig) {
  if (hostConfig.noCheckDeckSize) {
    return "custom";
  }

  const match = Object.entries(RULE_PRESETS).find(([, preset]) => {
    return (
      preset.startingLP === Number(hostConfig.team1.startingLP) &&
      preset.startingLP === Number(hostConfig.team2.startingLP) &&
      preset.startingHand === Number(hostConfig.team1.startingDrawCount) &&
      preset.startingHand === Number(hostConfig.team2.startingDrawCount) &&
      Number(hostConfig.team1.drawCountPerTurn) === 1 &&
      Number(hostConfig.team2.drawCountPerTurn) === 1 &&
      sameDeckLimits(hostConfig.deckLimits, preset.deckLimits) &&
      sameStringSet(hostConfig.customRules, preset.customRules) &&
      sameStringSet(hostConfig.forbiddenTypes, preset.forbiddenTypes)
    );
  });

  return match ? match[0] : "custom";
}

function formatTimeLimit(seconds) {
  const numeric = Number(seconds);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "No limit";
  }
  const minutes = numeric / 60;
  if (Number.isInteger(minutes)) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  return `${numeric} seconds`;
}

function formatRulePreset(value) {
  if (RULE_PRESETS[value]) {
    return RULE_PRESETS[value].label;
  }
  return "Custom";
}

function formatAllowedCards(value) {
  const match = ALLOWED_CARD_OPTIONS.find(([option]) => option === value);
  return match ? match[1] : "OCG / TCG";
}

function formatSelectedList(values) {
  if (!values.length) {
    return "None selected";
  }
  if (values.length <= 3) {
    return values.join(", ");
  }
  return `${values.slice(0, 3).join(", ")} + ${values.length - 3} more`;
}

function formatModeSummary(hostConfig) {
  const duelMode =
    hostConfig.team1Count === 2 && hostConfig.team2Count === 2
      ? "Tag Duel"
      : `${hostConfig.team1Count} vs ${hostConfig.team2Count}`;
  return `${duelMode} | Best of ${hostConfig.bestOf}${hostConfig.relay ? " | Relay" : ""}`;
}

function formatRoomListMode(hostConfig) {
  if (hostConfig.team1Count === 2 && hostConfig.team2Count === 2) {
    return "Tag";
  }
  return hostConfig.bestOf > 1 ? "Match" : "Single";
}

function formatOpeningState(hostConfig) {
  return `${hostConfig.team1.startingLP} LP | ${hostConfig.team1.startingDrawCount} card hand | Draw ${hostConfig.team1.drawCountPerTurn}`;
}

function formatDeckLimitSummary(hostConfig) {
  if (hostConfig.noCheckDeckSize) {
    return "Unlimited while deck-size checks are disabled";
  }
  return `${hostConfig.deckLimits.main.min}-${hostConfig.deckLimits.main.max} main | ${hostConfig.deckLimits.extra.min}-${hostConfig.deckLimits.extra.max} extra | ${hostConfig.deckLimits.side.min}-${hostConfig.deckLimits.side.max} side`;
}

function formatRoomAccess(hostConfig) {
  const access = hostConfig.password ? "Password protected" : "Public room";
  const port = hostConfig.hostPort ? `Port ${hostConfig.hostPort}` : "Auto port";
  return `${access} | ${port}`;
}

function isListingStandard(hostConfig) {
  return (
    !hostConfig.noShuffleDeck &&
    hostConfig.banlist !== "No Banlist" &&
    Number(hostConfig.team1.startingDrawCount) === 5 &&
    Number(hostConfig.team1.drawCountPerTurn) === 1
  );
}

function toggleRule(values, rule, enabled) {
  if (enabled) {
    return values.includes(rule) ? values : values.concat(rule);
  }
  return values.filter((entry) => entry !== rule);
}

export default function HostScreen() {
  const [activeTab, setActiveTab] = useState("duel");
  const [banlists, setBanlists] = useState([]);
  const [extraRulesOpen, setExtraRulesOpen] = useState(false);
  const [draftExtraRules, setDraftExtraRules] = useState([]);
  const [hostConfig, setHostConfig] = useState(createDefaultHostConfig);

  subscribe("BANLIST", (action) => {
    const availableBanlists = Array.isArray(action.banlist)
      ? action.banlist
      : [];
    setBanlists(availableBanlists);
    if (!action.primary) {
      return;
    }
    setHostConfig((current) => {
      if (
        current.banlist &&
        availableBanlists.some((list) => list.name === current.banlist)
      ) {
        return current;
      }
      return {
        ...current,
        banlist: action.primary,
      };
    });
  });

  useEffect(() => {
    if (!extraRulesOpen) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setDraftExtraRules(hostConfig.extraRules);
        setExtraRulesOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [extraRulesOpen, hostConfig.extraRules]);

  const availableBanlists = banlists.length
    ? banlists
    : [{ name: hostConfig.banlist || "No Banlist" }];
  const isPendulumZonesEnabled =
    hostConfig.customRules.includes("Pendulum Zones");
  const detectedRulePreset = detectRulePreset(hostConfig);
  const advancedRuleCount =
    hostConfig.customRules.length +
    hostConfig.forbiddenTypes.length +
    hostConfig.extraRules.length +
    (hostConfig.noCheckDeckSize ? 1 : 0);
  const selectedDeckLimitValues = formatDeckLimitSummary(hostConfig);

  function updateHostConfig(updater) {
    setHostConfig((current) =>
      typeof updater === "function"
        ? updater(current)
        : { ...current, ...updater },
    );
  }

  function updateField(field, value) {
    updateHostConfig((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateTeamField(field, value) {
    updateHostConfig((current) => ({
      ...current,
      team1: {
        ...current.team1,
        [field]: value,
      },
      team2: {
        ...current.team2,
        [field]: value,
      },
    }));
  }

  function updateDeckLimit(section, field, value) {
    updateHostConfig((current) => ({
      ...current,
      deckLimits: {
        ...current.deckLimits,
        [section]: {
          ...current.deckLimits[section],
          [field]: value,
        },
      },
    }));
  }

  function updateHostPort(value) {
    updateField(
      "hostPort",
      value.trim() === ""
        ? null
        : Number.isNaN(Number(value))
          ? null
          : Number(value),
    );
  }

  function setTcgSegoc(enabled) {
    updateHostConfig((current) => ({
      ...current,
      tcgSegocRulings: enabled,
      customRules: toggleRule(current.customRules, "TCG SEGOC", enabled),
    }));
  }

  function toggleCustomRule(rule) {
    updateHostConfig((current) => {
      const hasRule = current.customRules.includes(rule);
      if (hasRule) {
        const nextCustomRules = current.customRules.filter(
          (entry) => entry !== rule,
        );
        return {
          ...current,
          customRules:
            rule === "Pendulum Zones"
              ? nextCustomRules.filter(
                  (entry) => entry !== "Separate Pendulum Zones",
                )
              : nextCustomRules,
          tcgSegocRulings:
            rule === "TCG SEGOC" ? false : current.tcgSegocRulings,
        };
      }

      if (
        rule === "Separate Pendulum Zones" &&
        !current.customRules.includes("Pendulum Zones")
      ) {
        return current;
      }

      const nextCustomRules = current.customRules.concat(rule);
      return {
        ...current,
        customRules: nextCustomRules,
        tcgSegocRulings: rule === "TCG SEGOC" ? true : current.tcgSegocRulings,
      };
    });
  }

  function toggleForbiddenType(rule) {
    updateHostConfig((current) => ({
      ...current,
      forbiddenTypes: current.forbiddenTypes.includes(rule)
        ? current.forbiddenTypes.filter((entry) => entry !== rule)
        : current.forbiddenTypes.concat(rule),
    }));
  }

  function applyRulePreset(presetKey) {
    if (presetKey === "custom" || !RULE_PRESETS[presetKey]) {
      return;
    }

    const preset = RULE_PRESETS[presetKey];
    updateHostConfig((current) => ({
      ...current,
      noCheckDeckSize: false,
      tcgSegocRulings: preset.customRules.includes("TCG SEGOC"),
      team1: {
        ...current.team1,
        startingLP: preset.startingLP,
        startingDrawCount: preset.startingHand,
        drawCountPerTurn: 1,
      },
      team2: {
        ...current.team2,
        startingLP: preset.startingLP,
        startingDrawCount: preset.startingHand,
        drawCountPerTurn: 1,
      },
      deckLimits: cloneDeckLimits(preset.deckLimits),
      customRules: preset.customRules.slice(),
      forbiddenTypes: preset.forbiddenTypes.slice(),
    }));
  }

  function openExtraRulesModal() {
    setDraftExtraRules(hostConfig.extraRules);
    setExtraRulesOpen(true);
  }

  function closeExtraRulesModal() {
    setDraftExtraRules(hostConfig.extraRules);
    setExtraRulesOpen(false);
  }

  function applyExtraRulesModal() {
    updateField("extraRules", draftExtraRules);
    setExtraRulesOpen(false);
  }

  function clearDraftExtraRules() {
    setDraftExtraRules([]);
  }

  function toggleDraftExtraRule(rule) {
    setDraftExtraRules((current) => {
      if (current.includes(rule)) {
        return current.filter((entry) => entry !== rule);
      }

      const conflictingGroup = EXTRA_RULE_CONFLICT_GROUPS.find((group) =>
        group.includes(rule),
      );
      const next = conflictingGroup
        ? current.filter((entry) => !conflictingGroup.includes(entry))
        : current.slice();

      return next.concat(rule);
    });
  }

  function host() {
    emit({
      action: "HOST",
      hostConfig: {
        ...hostConfig,
        rulePreset: detectedRulePreset,
      },
    });
  }

  function renderDuelTab() {
    return (
      <div
        id="host-panel-duel"
        className="host-tabpanel"
        role="tabpanel"
        aria-labelledby="host-tab-duel"
      >
        <div className="host-section-header">
          <h3>Restrictions</h3>
          <p>
            Set the core room restrictions, match structure, and access details
            before adjusting deck limits or format-specific rule flags.
          </p>
        </div>

        <div className="host-preview-section">
          <div className="host-preview-section-head">
            <div>
              <h4>Rule Base</h4>
              <p className="host-section-copy">
                Banlist, card pool, duel timer, and preset defaults stay
                visible on the room summary and game-list preview.
              </p>
            </div>
          </div>
          <div className="host-form-grid host-form-grid-compact">
            <label className="host-field">
              <span>Forbidden List</span>
              <select
                value={hostConfig.banlist}
                onChange={(event) => updateField("banlist", event.target.value)}
              >
                {availableBanlists.map((list, index) => (
                  <option key={`${list.name}-${index}`} value={list.name}>
                    {list.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="host-field">
              <span>Allowed Cards</span>
              <select
                value={hostConfig.allowedCards}
                onChange={(event) =>
                  updateField("allowedCards", event.target.value)
                }
              >
                {ALLOWED_CARD_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="host-field">
              <span>Time Limit</span>
              <select
                value={hostConfig.timeLimitSeconds}
                onChange={(event) =>
                  updateField("timeLimitSeconds", Number(event.target.value))
                }
              >
                {Object.entries(TIME_LIMITS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="host-field">
              <span>Rule Preset</span>
              <select
                value={detectedRulePreset}
                onChange={(event) => applyRulePreset(event.target.value)}
              >
                {RULE_PRESET_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="host-preview-section">
          <div className="host-preview-section-head">
            <div>
              <h4>Match Structure</h4>
              <p className="host-section-copy">
                EDOPro models duel structure from the seat counts, match length,
                and relay flag rather than one combined mode field.
              </p>
            </div>
          </div>
          <div className="host-form-grid host-form-grid-compact host-mode-grid">
            <label className="host-field">
              <span>Team 1 Seats</span>
              <select
                value={hostConfig.team1Count}
                onChange={(event) =>
                  updateField("team1Count", Number(event.target.value))
                }
              >
                {TEAM_COUNT_OPTIONS.map((value) => (
                  <option key={`team-1-${value}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="host-field">
              <span>Team 2 Seats</span>
              <select
                value={hostConfig.team2Count}
                onChange={(event) =>
                  updateField("team2Count", Number(event.target.value))
                }
              >
                {TEAM_COUNT_OPTIONS.map((value) => (
                  <option key={`team-2-${value}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="host-field">
              <span>Best Of</span>
              <select
                value={hostConfig.bestOf}
                onChange={(event) =>
                  updateField("bestOf", Number(event.target.value))
                }
              >
                {BEST_OF_OPTIONS.map((value) => (
                  <option key={`best-of-${value}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="host-toggle host-mode-toggle">
              <input
                type="checkbox"
                checked={hostConfig.relay}
                onChange={(event) => updateField("relay", event.target.checked)}
              />
              <span>
                <strong>Relay</strong>
                <small>Rotate duelists between rounds without changing teams.</small>
              </span>
            </label>
          </div>
        </div>

        <div className="host-preview-section">
          <div className="host-preview-section-head">
            <div>
              <h4>Shared Validation</h4>
              <p className="host-section-copy">
                These toggles stay synchronized with the Deck Options and
                Custom Rule surfaces.
              </p>
            </div>
          </div>
          <div className="host-toggle-grid">
            <label className="host-toggle">
              <input
                type="checkbox"
                checked={hostConfig.noShuffleDeck}
                onChange={(event) =>
                  updateField("noShuffleDeck", event.target.checked)
                }
              />
              <span>
                <strong>Don&apos;t shuffle deck</strong>
                <small>Preserve incoming deck order for the duel.</small>
              </span>
            </label>
            <label className="host-toggle">
              <input
                type="checkbox"
                checked={hostConfig.noCheckDeckContents}
                onChange={(event) =>
                  updateField("noCheckDeckContents", event.target.checked)
                }
              />
              <span>
                <strong>Don&apos;t check deck contents</strong>
                <small>Skip card-pool and banlist validation on join.</small>
              </span>
            </label>
            <label className="host-toggle">
              <input
                type="checkbox"
                checked={hostConfig.noCheckDeckSize}
                onChange={(event) =>
                  updateField("noCheckDeckSize", event.target.checked)
                }
              />
              <span>
                <strong>Don&apos;t check deck size</strong>
                <small>Turns the deck-size limits into a staging-only view.</small>
              </span>
            </label>
            <label className="host-toggle">
              <input
                type="checkbox"
                checked={hostConfig.tcgSegocRulings}
                onChange={(event) => setTcgSegoc(event.target.checked)}
              />
              <span>
                <strong>TCG SEGOC Rulings</strong>
                <small>Stays in sync with the matching Custom Rule flag.</small>
              </span>
            </label>
          </div>
        </div>

        <div className="host-preview-section">
          <div className="host-preview-section-head">
            <div>
              <h4>Room Access</h4>
              <p className="host-section-copy">
                The room preview and action bar use these values directly.
              </p>
            </div>
          </div>
          <div className="host-form-grid">
            <label className="host-field">
              <span>Host Name</span>
              <input
                type="text"
                value={hostConfig.roomName}
                placeholder="Room name shown in listings"
                onChange={(event) => updateField("roomName", event.target.value)}
              />
            </label>
            <label className="host-field">
              <span>Password</span>
              <input
                type="text"
                value={hostConfig.password}
                placeholder="Leave blank for a public room"
                onChange={(event) => updateField("password", event.target.value)}
              />
            </label>
            <label className="host-field">
              <span>Host Port</span>
              <input
                type="number"
                min="1"
                max="65535"
                placeholder="Automatic"
                value={hostConfig.hostPort ?? ""}
                onChange={(event) => updateHostPort(event.target.value)}
              />
            </label>
          </div>
          <div className="host-note-card">
            <p>
              Leave the port blank to let the managed host flow choose it.
              Notes appear in the footer summary instead of the room list item.
            </p>
          </div>
          <label className="host-field host-field-full host-notes">
            <span>Notes</span>
            <textarea
              value={hostConfig.notes}
              placeholder="Optional room notes."
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </label>
        </div>
      </div>
    );
  }

  function renderDeckTab() {
    return (
      <div
        id="host-panel-deck"
        className="host-tabpanel"
        role="tabpanel"
        aria-labelledby="host-tab-deck"
      >
        <div className="host-section-header">
          <h3>Deck Options</h3>
          <p>
            Keep the validation toggles alongside the hard limits so the room
            reads as one coherent deck policy.
          </p>
        </div>

        <div className="host-preview-section">
          <div className="host-preview-section-head">
            <div>
              <h4>Shared Validation</h4>
              <p className="host-section-copy">
                These three deck policy flags mirror the controls on the
                Restrictions tab.
              </p>
            </div>
          </div>
          <div className="host-toggle-grid">
            <label className="host-toggle">
              <input
                type="checkbox"
                checked={hostConfig.noShuffleDeck}
                onChange={(event) =>
                  updateField("noShuffleDeck", event.target.checked)
                }
              />
              <span>
                <strong>Don&apos;t shuffle deck</strong>
                <small>Shared with Restrictions.</small>
              </span>
            </label>
            <label className="host-toggle">
              <input
                type="checkbox"
                checked={hostConfig.noCheckDeckContents}
                onChange={(event) =>
                  updateField("noCheckDeckContents", event.target.checked)
                }
              />
              <span>
                <strong>Don&apos;t check deck contents</strong>
                <small>Shared with Restrictions.</small>
              </span>
            </label>
            <label className="host-toggle">
              <input
                type="checkbox"
                checked={hostConfig.noCheckDeckSize}
                onChange={(event) =>
                  updateField("noCheckDeckSize", event.target.checked)
                }
              />
              <span>
                <strong>Don&apos;t check deck size</strong>
                <small>Shared with Restrictions.</small>
              </span>
            </label>
          </div>
        </div>

        <div className="host-preview-section">
          <div className="host-preview-section-head">
            <div>
              <h4>Deck Size Limits</h4>
              <p className="host-section-copy">
                The summary keeps these values visible even when size checks are
                disabled.
              </p>
            </div>
            <span className="host-tag">
              {hostConfig.noCheckDeckSize ? "Checks disabled" : "Checks enforced"}
            </span>
          </div>
          <div className="host-form-grid">
            {DECK_LIMIT_FIELDS.map(([section, field, label]) => (
              <label key={`${section}-${field}`} className="host-field">
                <span>{label}</span>
                <input
                  type="number"
                  min="0"
                  value={hostConfig.deckLimits[section][field]}
                  disabled={hostConfig.noCheckDeckSize}
                  onChange={(event) =>
                    updateDeckLimit(
                      section,
                      field,
                      Number.isNaN(Number(event.target.value))
                        ? 0
                        : Number(event.target.value),
                    )
                  }
                />
              </label>
            ))}
          </div>
          <div className="host-note-card">
            <p>{selectedDeckLimitValues}</p>
          </div>
        </div>
      </div>
    );
  }

  function renderCustomTab() {
    return (
      <div
        id="host-panel-custom"
        className="host-tabpanel"
        role="tabpanel"
        aria-labelledby="host-tab-custom"
      >
        <div className="host-section-header">
          <h3>Custom Rule</h3>
          <p>
            Selecting a built-in preset applies the EDOPro defaults. Any drift
            in LP, opening draw, deck limits, or rule flags moves the effective
            preset back to <strong>Custom</strong>.
          </p>
        </div>

        <div className="host-preview-section">
          <div className="host-preview-section-head">
            <div>
              <h4>Opening State</h4>
              <p className="host-section-copy">
                These values write directly to both teams in the canonical
                `hostConfig` contract.
              </p>
            </div>
            <span className="host-tag">{formatRulePreset(detectedRulePreset)}</span>
          </div>
          <div className="host-form-grid host-form-grid-compact">
            <label className="host-field">
              <span>Starting LP</span>
              <input
                type="number"
                min="100"
                step="100"
                value={hostConfig.team1.startingLP}
                onChange={(event) =>
                  updateTeamField(
                    "startingLP",
                    Number.isNaN(Number(event.target.value))
                      ? 8000
                      : Number(event.target.value),
                  )
                }
              />
            </label>
            <label className="host-field">
              <span>Starting Hand</span>
              <input
                type="number"
                min="0"
                max="20"
                value={hostConfig.team1.startingDrawCount}
                onChange={(event) =>
                  updateTeamField(
                    "startingDrawCount",
                    Number.isNaN(Number(event.target.value))
                      ? 5
                      : Number(event.target.value),
                  )
                }
              />
            </label>
            <label className="host-field">
              <span>Cards per Draw</span>
              <input
                type="number"
                min="0"
                max="10"
                value={hostConfig.team1.drawCountPerTurn}
                onChange={(event) =>
                  updateTeamField(
                    "drawCountPerTurn",
                    Number.isNaN(Number(event.target.value))
                      ? 1
                      : Number(event.target.value),
                  )
                }
              />
            </label>
          </div>
          <div className="host-note-card">
            <p>{formatOpeningState(hostConfig)}</p>
          </div>
        </div>

        <div className="host-preview-section">
          <div className="host-preview-section-head">
            <div>
              <h4>Game Rules</h4>
              <p className="host-section-copy">
                TCG SEGOC stays synchronized with the shared toggle on the
                Restrictions tab. Separate Pendulum Zones unlocks only when
                Pendulum Zones is enabled.
              </p>
            </div>
          </div>
          <div className="host-preview-toggle-grid">
            {GAME_RULE_OPTIONS.map((rule) => {
              const disabled =
                rule === "Separate Pendulum Zones" && !isPendulumZonesEnabled;
              return (
                <label
                  key={rule}
                  className={`host-preview-toggle${disabled ? " is-disabled" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={hostConfig.customRules.includes(rule)}
                    onChange={() => toggleCustomRule(rule)}
                    disabled={disabled}
                  />
                  <span>{rule}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="host-preview-section">
          <div className="host-preview-section-head">
            <div>
              <h4>Card Type Filter</h4>
              <p className="host-section-copy">
                These exclusions are included in preset detection and the final
                room summary.
              </p>
            </div>
          </div>
          <div className="host-preview-toggle-grid">
            {FORBIDDEN_TYPE_OPTIONS.map((rule) => (
              <label key={rule} className="host-preview-toggle">
                <input
                  type="checkbox"
                  checked={hostConfig.forbiddenTypes.includes(rule)}
                  onChange={() => toggleForbiddenType(rule)}
                />
                <span>{rule}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      id="hostSettings"
      className={`${styles.root} host-workbench`}
    >
      <div className="host-shell">
        <div className="host-layout">
          <section className="host-console host-panel">
            <div
              className="host-tablist"
              role="tablist"
              aria-label="Host sections"
            >
              {HOST_TABS.map(([id, label, description]) => (
                <button
                  key={id}
                  id={`host-tab-${id}`}
                  className="host-tabbutton"
                  type="button"
                  role="tab"
                  data-active={activeTab === id}
                  aria-selected={activeTab === id}
                  aria-controls={`host-panel-${id}`}
                  onClick={() => setActiveTab(id)}
                >
                  <strong>{label}</strong>
                  <span>{description}</span>
                </button>
              ))}
            </div>

            <div className="host-tabbody">
              {activeTab === "duel" ? renderDuelTab() : null}
              {activeTab === "deck" ? renderDeckTab() : null}
              {activeTab === "custom" ? renderCustomTab() : null}
            </div>
          </section>

          <aside className="host-rail">
            <div className="host-preview-card host-panel host-room-preview">
              <div className="host-section-header">
                <h3>Game List Preview</h3>
                <p>
                  Approximate listing card for the room you are about to open.
                </p>
              </div>
              <div className="host-room-preview-item">
                <div className="host-room-preview-kicker">
                  <span className="host-tag">{formatRoomListMode(hostConfig)}</span>
                  <span className="host-tag">
                    {hostConfig.password ? "Locked" : "Open"}
                  </span>
                  <span className="host-tag">
                    {isListingStandard(hostConfig) ? "Standard" : "Custom"}
                  </span>
                </div>
                <strong className="host-room-preview-title">
                  {hostConfig.roomName || "Unnamed room"}
                </strong>
                <span className="host-room-preview-players">
                  {formatModeSummary(hostConfig)}
                </span>
                <div className="host-room-preview-meta">
                  <span>{hostConfig.banlist}</span>
                  <span>{formatAllowedCards(hostConfig.allowedCards)}</span>
                </div>
                <div className="host-room-preview-meta">
                  <span>{formatRulePreset(detectedRulePreset)}</span>
                  <span>{formatTimeLimit(hostConfig.timeLimitSeconds)}</span>
                </div>
                <div className="host-room-preview-meta">
                  <span>{formatOpeningState(hostConfig)}</span>
                </div>
              </div>
            </div>

            <div className="host-summary host-panel">
              <div className="host-section-header">
                <h3>Room Summary</h3>
                <p>Readable final check before the canonical host payload is sent.</p>
              </div>
              <div className="host-summary-stack">
                <article className="host-summary-card">
                  <span className="host-summary-label">Match Structure</span>
                  <strong className="host-summary-value">
                    {formatModeSummary(hostConfig)}
                  </strong>
                  <span className="host-summary-detail">
                    {formatRulePreset(detectedRulePreset)} |{" "}
                    {formatTimeLimit(hostConfig.timeLimitSeconds)}
                  </span>
                </article>
                <article className="host-summary-card">
                  <span className="host-summary-label">Restrictions</span>
                  <strong className="host-summary-value">
                    {hostConfig.banlist}
                  </strong>
                  <span className="host-summary-detail">
                    {formatAllowedCards(hostConfig.allowedCards)}
                  </span>
                </article>
                <article className="host-summary-card">
                  <span className="host-summary-label">Validation</span>
                  <div className="host-chip-list">
                    <span className="host-chip">
                      {hostConfig.noShuffleDeck
                        ? "No shuffle"
                        : "Shuffle enabled"}
                    </span>
                    <span className="host-chip">
                      {hostConfig.noCheckDeckContents
                        ? "Deck contents unchecked"
                        : "Deck contents checked"}
                    </span>
                    <span className="host-chip">
                      {hostConfig.noCheckDeckSize
                        ? "Size checks off"
                        : "Size checks on"}
                    </span>
                    <span className="host-chip">
                      {hostConfig.tcgSegocRulings
                        ? "TCG SEGOC"
                        : "Public SEGOC"}
                    </span>
                    <span className="host-chip">
                      {hostConfig.password
                        ? "Password protected"
                        : "Public room"}
                    </span>
                  </div>
                </article>
                <article className="host-summary-card">
                  <span className="host-summary-label">Opening State</span>
                  <strong className="host-summary-value">
                    {formatOpeningState(hostConfig)}
                  </strong>
                  <span className="host-summary-detail">
                    Applied to team 1 and team 2.
                  </span>
                </article>

                <article className="host-summary-card">
                  <span className="host-summary-label">Advanced Rules</span>
                  <strong className="host-summary-value">
                    {hostConfig.customRules.length} rules |{" "}
                    {hostConfig.forbiddenTypes.length} filters
                  </strong>
                  <span className="host-summary-detail">
                    {hostConfig.extraRules.length
                      ? formatSelectedList(hostConfig.extraRules)
                      : `${advancedRuleCount} staged changes total`}
                  </span>
                </article>
                <article className="host-summary-card">
                  <span className="host-summary-label">Deck Limits</span>
                  <strong className="host-summary-value">
                    {hostConfig.noCheckDeckSize
                      ? "Checks disabled"
                      : "Checks enforced"}
                  </strong>
                  <span className="host-summary-detail">
                    {selectedDeckLimitValues}
                  </span>
                </article>

                <article className="host-summary-card">
                  <span className="host-summary-label">Access</span>
                  <strong className="host-summary-value">
                    {hostConfig.roomName || "Public room"}
                  </strong>
                  <span className="host-summary-detail">
                    {formatRoomAccess(hostConfig)}
                  </span>
                </article>
              </div>
            </div>
          </aside>
        </div>

        <div className="host-actionbar host-panel">
          <div className="host-actionbar-copy">
            <span className="host-summary-label">Ready To Host</span>
            <strong className="host-actionbar-title">
              {hostConfig.roomName || "Public room"}
            </strong>
            <div className="host-chip-list">
              <span className="host-chip">
                {hostConfig.password ? "Private room" : "Public room"}
              </span>
              <span className="host-chip">{formatModeSummary(hostConfig)}</span>
              <span className="host-chip">
                {formatRulePreset(detectedRulePreset)}
              </span>
              <span className="host-chip">{hostConfig.banlist}</span>
              <span className="host-chip">
                {formatTimeLimit(hostConfig.timeLimitSeconds)}
              </span>
            </div>
            <p className="host-actionbar-notes">
              {hostConfig.notes ? hostConfig.notes : "No room notes."}
            </p>
          </div>
          <div className="host-actionbar-buttons">
            <Link
              href="/gamelist"
              className="host-action host-action-secondary"
            >
              Back to Game List
            </Link>
            <button
              type="button"
              className="host-action host-action-secondary"
              onClick={openExtraRulesModal}
            >
              Extra Rules
              {hostConfig.extraRules.length
                ? ` (${hostConfig.extraRules.length})`
                : ""}
            </button>
            <button
              type="button"
              className="host-action host-action-primary"
              onClick={host}
            >
              Host Duel
            </button>
          </div>
        </div>
      </div>

      {extraRulesOpen ? (
        <div className="host-modal-backdrop" onClick={closeExtraRulesModal}>
          <div
            className="host-modal host-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="host-extra-rules-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="host-modal-head">
              <div>
                <h3 id="host-extra-rules-title">Extra Rules</h3>
                <p>
                  Select the local extra-rule set to stage for parity.
                  Conflicting EDOPro rule families replace one another
                  automatically inside the modal.
                </p>
              </div>
              <button
                type="button"
                className="host-action host-action-secondary"
                onClick={closeExtraRulesModal}
              >
                Cancel
              </button>
            </div>

            <div className="host-modal-conflicts">
              <p>
                <strong>Exclusive group:</strong> Sealed Duel, Booster Draft
                Duel, and Boss Duel.
              </p>
              <p>
                <strong>Exclusive group:</strong> Battle City, Duelist Kingdom,
                and Dimension Duel.
              </p>
            </div>

            <div className="host-modal-grid">
              {EXTRA_RULE_OPTIONS.map((rule) => (
                <label key={rule} className="host-preview-toggle">
                  <input
                    type="checkbox"
                    checked={draftExtraRules.includes(rule)}
                    onChange={() => toggleDraftExtraRule(rule)}
                  />
                  <span>{rule}</span>
                </label>
              ))}
            </div>

            <div className="host-modal-actions">
              <div className="host-modal-selection">
                Selected:{" "}
                {draftExtraRules.length ? draftExtraRules.join(", ") : "None"}
              </div>
              <div className="host-actionbar-buttons">
                <button
                  type="button"
                  className="host-action host-action-secondary"
                  onClick={clearDraftExtraRules}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="host-action host-action-primary"
                  onClick={applyExtraRulesModal}
                >
                  Use Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
