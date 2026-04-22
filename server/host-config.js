'use strict';

const { randomUUID } = require('crypto');

const DEFAULT_TEAM_SETTINGS = Object.freeze({
  startingLP: 8000,
  startingDrawCount: 5,
  drawCountPerTurn: 1
});

const DEFAULT_DECK_LIMITS = Object.freeze({
  main: Object.freeze({ min: 40, max: 60 }),
  extra: Object.freeze({ min: 0, max: 15 }),
  side: Object.freeze({ min: 0, max: 15 })
});

const DEFAULT_HOST_CONFIG = Object.freeze({
  roomName: '',
  password: '',
  hostPort: null,
  notes: '',
  banlist: 'No Banlist',
  allowedCards: 'ocg_tcg',
  team1Count: 1,
  team2Count: 1,
  bestOf: 3,
  relay: false,
  rulePreset: 'mr5',
  timeLimitSeconds: 1800,
  noShuffleDeck: false,
  noCheckDeckContents: false,
  noCheckDeckSize: false,
  tcgSegocRulings: false,
  team1: DEFAULT_TEAM_SETTINGS,
  team2: DEFAULT_TEAM_SETTINGS,
  deckLimits: DEFAULT_DECK_LIMITS,
  customRules: Object.freeze([]),
  forbiddenTypes: Object.freeze([]),
  extraRules: Object.freeze([]),
  puzzleId: '',
  roompass: '',
  tournamentId: '',
  tournamentSlug: '',
  tournamentMatchId: ''
});

const RULE_PRESET_MASTER_RULE = Object.freeze({
  mr1: 1,
  mr2: 2,
  mr3: 3,
  mr4: 4,
  mr5: 5,
  speed: 5,
  rush: 5,
  goat: 1,
  custom: 5
});

const ALLOWED_CARDS_VALUES = new Set([
  'ocg',
  'tcg',
  'ocg_tcg',
  'prerelease',
  'anything_goes'
]);

function toTrimmedString(value, fallback = '') {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value).trim();
}

function toBoolean(value, fallback = false) {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }
    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }
  }
  return Boolean(value);
}

function toPositiveInteger(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return Math.trunc(numeric);
}

function toNonNegativeInteger(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }
  return Math.trunc(numeric);
}

function toBoundedInteger(value, fallback, min, max) {
  const numeric = toPositiveInteger(value, fallback);
  return Math.max(min, Math.min(max, numeric));
}

function toNullablePort(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  const normalized = Math.trunc(numeric);
  if (normalized < 1 || normalized > 65535) {
    return null;
  }
  return normalized;
}

function cloneTeamSettings(team = DEFAULT_TEAM_SETTINGS) {
  return {
    startingLP: toPositiveInteger(team.startingLP, DEFAULT_TEAM_SETTINGS.startingLP),
    startingDrawCount: toNonNegativeInteger(
      team.startingDrawCount,
      DEFAULT_TEAM_SETTINGS.startingDrawCount
    ),
    drawCountPerTurn: toNonNegativeInteger(
      team.drawCountPerTurn,
      DEFAULT_TEAM_SETTINGS.drawCountPerTurn
    )
  };
}

function cloneDeckLimits(deckLimits = DEFAULT_DECK_LIMITS) {
  const main = deckLimits?.main || {};
  const extra = deckLimits?.extra || {};
  const side = deckLimits?.side || {};
  return {
    main: {
      min: toNonNegativeInteger(main.min, DEFAULT_DECK_LIMITS.main.min),
      max: toNonNegativeInteger(main.max, DEFAULT_DECK_LIMITS.main.max)
    },
    extra: {
      min: toNonNegativeInteger(extra.min, DEFAULT_DECK_LIMITS.extra.min),
      max: toNonNegativeInteger(extra.max, DEFAULT_DECK_LIMITS.extra.max)
    },
    side: {
      min: toNonNegativeInteger(side.min, DEFAULT_DECK_LIMITS.side.min),
      max: toNonNegativeInteger(side.max, DEFAULT_DECK_LIMITS.side.max)
    }
  };
}

function uniqueStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const next = [];
  value.forEach((entry) => {
    const normalized = toTrimmedString(entry);
    if (normalized && !next.includes(normalized)) {
      next.push(normalized);
    }
  });
  return next;
}

function normalizeAllowedCards(value) {
  const normalized = toTrimmedString(value, DEFAULT_HOST_CONFIG.allowedCards).toLowerCase();
  return ALLOWED_CARDS_VALUES.has(normalized)
    ? normalized
    : DEFAULT_HOST_CONFIG.allowedCards;
}

function normalizeRulePreset(value) {
  const normalized = toTrimmedString(value, DEFAULT_HOST_CONFIG.rulePreset).toLowerCase();
  return RULE_PRESET_MASTER_RULE[normalized] ? normalized : DEFAULT_HOST_CONFIG.rulePreset;
}

function resolveModeLabel(hostConfig) {
  if (Number(hostConfig?.team1Count) === 2 && Number(hostConfig?.team2Count) === 2) {
    return 'Tag';
  }
  if (Number(hostConfig?.bestOf) > 1) {
    return 'Match';
  }
  return 'Single';
}

function resolveAllowedCardsLabel(value) {
  switch (value) {
  case 'ocg':
    return 'OCG';
  case 'tcg':
    return 'TCG';
  case 'prerelease':
    return 'Prerelease';
  case 'anything_goes':
    return 'Anything Goes';
  default:
    return 'OCG / TCG';
  }
}

function resolveMasterRule(rulePreset) {
  return RULE_PRESET_MASTER_RULE[rulePreset] || RULE_PRESET_MASTER_RULE.custom;
}

function parseHostConfig(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const team1 = cloneTeamSettings(source.team1 || DEFAULT_HOST_CONFIG.team1);
  const team2 = cloneTeamSettings(source.team2 || team1);
  return {
    roomName: toTrimmedString(source.roomName),
    password: toTrimmedString(source.password),
    hostPort: toNullablePort(source.hostPort),
    notes: toTrimmedString(source.notes),
    banlist: toTrimmedString(source.banlist, DEFAULT_HOST_CONFIG.banlist),
    allowedCards: normalizeAllowedCards(source.allowedCards),
    team1Count: toBoundedInteger(source.team1Count, DEFAULT_HOST_CONFIG.team1Count, 1, 3),
    team2Count: toBoundedInteger(source.team2Count, DEFAULT_HOST_CONFIG.team2Count, 1, 3),
    bestOf: toBoundedInteger(source.bestOf, DEFAULT_HOST_CONFIG.bestOf, 1, 9),
    relay: toBoolean(source.relay, DEFAULT_HOST_CONFIG.relay),
    rulePreset: normalizeRulePreset(source.rulePreset),
    timeLimitSeconds: toNonNegativeInteger(
      source.timeLimitSeconds,
      DEFAULT_HOST_CONFIG.timeLimitSeconds
    ),
    noShuffleDeck: toBoolean(source.noShuffleDeck, DEFAULT_HOST_CONFIG.noShuffleDeck),
    noCheckDeckContents: toBoolean(
      source.noCheckDeckContents,
      DEFAULT_HOST_CONFIG.noCheckDeckContents
    ),
    noCheckDeckSize: toBoolean(source.noCheckDeckSize, DEFAULT_HOST_CONFIG.noCheckDeckSize),
    tcgSegocRulings: toBoolean(
      source.tcgSegocRulings,
      DEFAULT_HOST_CONFIG.tcgSegocRulings
    ),
    team1,
    team2,
    deckLimits: cloneDeckLimits(source.deckLimits || DEFAULT_HOST_CONFIG.deckLimits),
    customRules: uniqueStringArray(source.customRules),
    forbiddenTypes: uniqueStringArray(source.forbiddenTypes),
    extraRules: uniqueStringArray(source.extraRules),
    puzzleId: toTrimmedString(source.puzzleId).toLowerCase(),
    roompass: toTrimmedString(source.roompass) || randomUUID(),
    tournamentId: toTrimmedString(source.tournamentId),
    tournamentSlug: toTrimmedString(source.tournamentSlug),
    tournamentMatchId: toTrimmedString(source.tournamentMatchId)
  };
}

module.exports = {
  DEFAULT_HOST_CONFIG,
  DEFAULT_TEAM_SETTINGS,
  DEFAULT_DECK_LIMITS,
  parseHostConfig,
  resolveModeLabel,
  resolveAllowedCardsLabel,
  resolveMasterRule,
  cloneDeckLimits,
  cloneTeamSettings
};
