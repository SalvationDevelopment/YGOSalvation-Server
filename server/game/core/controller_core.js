/* eslint-disable new-cap */
/* eslint-disable one-var */
/* eslint-disable no-sync */
/*eslint no-plusplus: 0*/

/**
 * @type DuelSettings
 * @property {Boolean} priority
 * @property {Number} draw_count
 * @property {Number} start_hand_count
 * @property {Number`} time Timelimit per turn in seconds
 * @property {Boolean} shuffle
 * @property {Number} start_lp
 * @property {String} roompass
 * @property {Boolean} started
 * @property {Boolean} deckcheck
 * @property {Number} ot
 * @property {String} banlist
 * @property {Number} banlistid
 * @property {Number} mode
 * @property {Number} cardpool
 * @property {Boolean} prerelease
 * @property {Number} masterRule
 * @property {Number} rule
 * @property {Number} startLP
 * @property {Object} player
 */
const fs = require("fs"),
  path = require("path"),
  { pathToFileURL } = require("url"),
  POS_FACEDOWN_DEFENSE = 0x8,
  LOCATION_DECK = 0x01,
  LOCATION_MZONE = 0x04,
  LOCATION_SZONE = 0x08,
  LOCATION_EXTRA = 0x40,
  LOCATION_GRAVE = 0x10,
  LOCATION_HAND = 0x02,
  enums = require("./enums"),
  boardController = require("./controller_automatic"),
  ManualControlEngine = require("./model_automatic_field"),
  database = require(
    path.resolve(
      __dirname,
      "../../ui/public/manifest/manifest_0-en-OCGTCG.json",
    ),
  ),
  uiStrings = require(
    path.resolve(__dirname, "../../ui/public/manifest/strings.json"),
  ),
  scriptsFolder = path.resolve(__dirname, "../scripts"),
  STARTUP_SCRIPT_NAMES = Object.freeze(["constant.lua", "utility.lua"]),
  SCRIPT_FOLDER_PRIORITY = Object.freeze([
    "official",
    "pre-release",
    "unofficial",
  ]);

let createCore,
  OcgMessageType,
  OcgProcessResult,
  OcgLocation,
  OcgPosition,
  OcgQueryFlags,
  OcgDuelMode,
  OcgResponseType;

const ANNOUNCE_CARD_OPCODE = Object.freeze({
    ADD: 0x4000000000000000n,
    SUB: 0x4000000100000000n,
    MUL: 0x4000000200000000n,
    DIV: 0x4000000300000000n,
    AND: 0x4000000400000000n,
    OR: 0x4000000500000000n,
    NEG: 0x4000000600000000n,
    NOT: 0x4000000700000000n,
    BAND: 0x4000000800000000n,
    BOR: 0x4000000900000000n,
    BNOT: 0x4000001000000000n,
    BXOR: 0x4000001100000000n,
    LSHIFT: 0x4000001200000000n,
    RSHIFT: 0x4000001300000000n,
    ALLOW_ALIASES: 0x4000001400000000n,
    ALLOW_TOKENS: 0x4000001500000000n,
    ISCODE: 0x4000010000000000n,
    ISSETCARD: 0x4000010100000000n,
    ISTYPE: 0x4000010200000000n,
    ISRACE: 0x4000010300000000n,
    ISATTRIBUTE: 0x4000010400000000n,
    GETCODE: 0x4000010500000000n,
    GETSETCARD: 0x4000010600000000n,
    GETTYPE: 0x4000010700000000n,
    GETRACE: 0x4000010800000000n,
    GETATTRIBUTE: 0x4000010900000000n,
});

const announceCardOpcodeNames = Object.freeze(
  Object.fromEntries(
    Object.entries(ANNOUNCE_CARD_OPCODE).map(([name, value]) => [
      value.toString(),
      name,
    ]),
  ),
);

const CARD_HINT_TYPE = Object.freeze({
  1: "turn",
  2: "card",
  3: "race",
  4: "attribute",
  5: "number",
  6: "desc_add",
  7: "desc_remove",
});

const PLAYER_HINT_TYPE = Object.freeze({
  6: "desc_add",
  7: "desc_remove",
});

const STRING_ID_MASK = 0xfffffn;
const STRING_ID_SHIFT = 20n;

let ocgapiPromise;
let ocgcoreModulePromise;

global.gc_protected = [];
process.replay = [[], []];
/**
 * Executes the seed helper used by the controller core module.
 * @returns {number} Returns the value produced by the controller core module.
 */
function seed() {
  var max = 4294967295,
    min = 0;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Seeds array used by the controller core module.
 * @returns {Array} Returns the value produced by the controller core module.
 */
function seedArray() {
  return [seed(), seed(), seed(), seed()].map((value) => BigInt(value));
}

/**
 * Decodes setcodes used by the controller core module.
 * @param {(string|Array)} setcode The setcode value provides an input used by the controller core module.
 * @returns {(string|Array)} Returns the value produced by the controller core module.
 */
function decodeSetcodes(setcode) {
  if (Array.isArray(setcode)) {
    return setcode;
  }
  if (!setcode) {
    return [];
  }
  let value = BigInt(setcode),
    output = [];

  while (value > 0n) {
    const part = Number(value & 0xffffn);
    if (part) {
      output.push(part);
    }
    value >>= 16n;
  }

  return output;
}

/**
 * Reads card data used by the controller core module.
 * @param {string} code The code value provides an input used by the controller core module.
 * @returns {(Object|null)} Returns the value produced by the controller core module.
 */
function readCardData(code) {
  const dbEntry = database.find((cardEntry) => cardEntry.id === code);

  if (!dbEntry) {
    return null;
  }

  return {
    code: dbEntry.id,
    alias: dbEntry.alias || 0,
    setcodes: decodeSetcodes(dbEntry.setcode),
    type: dbEntry.type || 0,
    level: (dbEntry.level || 0) & 0xff,
    attribute: dbEntry.attribute || 0,
    race: BigInt(dbEntry.race || 0),
    attack: dbEntry.atk || 0,
    defense: dbEntry.def || 0,
    lscale: ((dbEntry.level || 0) >> 24) & 0xff,
    rscale: ((dbEntry.level || 0) >> 16) & 0xff,
    link_marker: dbEntry.type & 0x4000000 ? dbEntry.def || 0 : 0,
  };
}

/**
 * Executes the location name helper used by the controller core module.
 * @param {string} location The location value provides an input used by the controller core module.
 * @returns {string} Returns the value produced by the controller core module.
 */
function locationName(location) {
  return enums.locations[location] || location;
}

/**
 * Executes the position name helper used by the controller core module.
 * @param {(number|string)} position The position value provides an input used by the controller core module.
 * @returns {string} Returns the value produced by the controller core module.
 */
function positionName(position) {
  switch (position) {
    case OcgPosition.FACEUP_ATTACK:
      return "FaceUpAttack";
    case OcgPosition.FACEDOWN_ATTACK:
      return "FaceDownAttack";
    case OcgPosition.FACEUP_DEFENSE:
      return "FaceUpDefence";
    case OcgPosition.FACEDOWN_DEFENSE:
      return "FaceDownDefence";
    case OcgPosition.FACEUP:
      return "FaceUp";
    case OcgPosition.FACEDOWN:
      return "FaceDown";
    case OcgPosition.ATTACK:
      return "FaceUpAttack";
    case OcgPosition.DEFENSE:
      return "FaceUpDefence";
    default:
      return "FaceUpAttack";
  }
}

/**
 * Normalizes browser-facing position names for zone types that do not use battle positions.
 * @param {(number|string)} position The raw position value.
 * @param {(number|string)} location The raw location value.
 * @returns {string} Returns the normalized browser position.
 */
function browserPositionName(position, location) {
  const namedPosition = positionName(position),
    resolvedLocation = locationName(location);

  if (resolvedLocation === "EXTRA") {
    if (
      namedPosition === "FaceDownAttack"
      || namedPosition === "FaceDownDefence"
    ) {
      return "FaceDown";
    }

    if (
      namedPosition === "FaceUpAttack"
      || namedPosition === "FaceUpDefence"
    ) {
      return "FaceUp";
    }
  }

  return namedPosition;
}

/**
 * Executes the expand field mask to zones helper used by the controller core module.
 * @param {number} fieldMask The fieldMask value provides an input used by the controller core module.
 * @returns {Array} Returns the value produced by the controller core module.
 */
function expandFieldMaskToZones(fieldMask) {
  const zones = [],
            /**
     * Executes the push zones for player helper used by the controller core module.
     * @param {number} mask The mask value provides an input used by the controller core module.
     * @param {number} player The player value provides an input used by the controller core module.
     * @returns {void} Does not return a value.
     */
    pushZonesForPlayer = (mask, player) => {
      let workingMask = Number(mask) >>> 0;

      for (let index = 0; index < 7; index++) {
        if ((workingMask & 1) === 0) {
          zones.push({
            player,
            location: "MONSTERZONE",
            index,
          });
        }
        workingMask >>>= 1;
      }

      workingMask >>>= 1;

      for (let index = 0; index < 8; index++) {
        if ((workingMask & 1) === 0) {
          zones.push({
            player,
            location: "SPELLZONE",
            index,
          });
        }
        workingMask >>>= 1;
      }
    };

  pushZonesForPlayer(fieldMask & 0xffff, 0);
  pushZonesForPlayer((fieldMask >>> 16) & 0xffff, 1);

  return zones;
}

/**
 * Expands disabled field mask to zones used by the controller core module.
 * @param {number} fieldMask The fieldMask value provides an input used by the controller core module.
 * @returns {Array} Returns the value produced by the controller core module.
 */
function expandDisabledFieldMaskToZones(fieldMask) {
  const zones = [],
    pushZonesForPlayer = (mask, player) => {
      let workingMask = Number(mask) >>> 0;

      for (let index = 0; index < 7; index++) {
        if ((workingMask & 1) === 1) {
          zones.push({
            player,
            location: "MONSTERZONE",
            index,
          });
        }
        workingMask >>>= 1;
      }

      workingMask >>>= 1;

      for (let index = 0; index < 8; index++) {
        if ((workingMask & 1) === 1) {
          zones.push({
            player,
            location: "SPELLZONE",
            index,
          });
        }
        workingMask >>>= 1;
      }
    };

  pushZonesForPlayer(fieldMask & 0xffff, 0);
  pushZonesForPlayer((fieldMask >>> 16) & 0xffff, 1);

  return zones;
}

/**
 * Normalizes selectable card used by the controller core module.
 * @param {Object} card The card object supplies the structured input used by the controller core module, including the `code`, `controller`, `index`, `location`, `player`, and `sequence` properties.
 * @param {string} card.code The `code` property supplies structured input used by the controller core module.
 * @param {number} card.controller The `controller` property supplies structured input used by the controller core module.
 * @param {number} card.index The `index` property supplies structured input used by the controller core module.
 * @param {string} card.location The `location` property supplies structured input used by the controller core module.
 * @param {number} card.player The `player` property supplies structured input used by the controller core module.
 * @param {number} card.sequence The `sequence` property supplies structured input used by the controller core module.
 * @param {number} index The index value provides an input used by the controller core module.
 * @returns {Object} Returns the value produced by the controller core module.
 */
function normalizeSelectableCard(card, index) {
  if (!card) {
    return card;
  }

  const player = Number.isInteger(card.controller)
      ? card.controller
      : Number.isInteger(card.player)
        ? card.player
        : 0,
    sequence = Number.isInteger(card.sequence)
      ? card.sequence
      : Number.isInteger(card.index)
        ? card.index
        : index;

  return Object.assign({}, card, {
    id: card.code,
    player,
    location: locationName(card.location),
    index: sequence,
    i: index,
  });
}

/**
 * Normalizes a location pointer into browser-friendly coordinates.
 * @param {Object} card The location pointer used by the controller core module.
 * @returns {(Object|null)} Returns the normalized field coordinate.
 */
function normalizeFieldCoordinate(card) {
  if (!card) {
    return null;
  }

  const player = Number.isInteger(card.controller)
      ? card.controller
      : Number.isInteger(card.player)
        ? card.player
        : 0,
    sequence = Number.isInteger(card.sequence)
      ? card.sequence
      : Number.isInteger(card.index)
        ? card.index
        : 0,
    normalized = {
      player,
      location: locationName(card.location),
      index: sequence,
    };

  if (Number.isInteger(card.overlay_sequence)) {
    normalized.overlay_sequence = card.overlay_sequence;
    normalized.overlayindex = card.overlay_sequence + 1;
  }

  return normalized;
}

function normalizeFieldCoordinateList(cards) {
  if (!Array.isArray(cards)) {
    return [];
  }

  return cards.map(normalizeFieldCoordinate).filter(Boolean);
}

/**
 * Converts protocol scalar values into JSON-safe values used by the controller core module.
 * @param {(bigint|number|string|null|undefined)} value The value provides an input used by the controller core module.
 * @returns {(string|number|null|undefined)} Returns the JSON-safe value produced by the controller core module.
 */
function normalizeProtocolScalar(value) {
  if (typeof value === "bigint") {
    return value.toString();
  }

  return value;
}

/**
 * Normalizes announce-card opcode entries into JSON-safe browser tokens.
 * @param {(bigint|number|string)} value The value provides an input used by the controller core module.
 * @returns {(number|string)} Returns the browser-safe token produced by the controller core module.
 */
function normalizeAnnounceCardOpcode(value) {
  if (typeof value === "bigint") {
    const opcodeName = announceCardOpcodeNames[value.toString()];
    if (opcodeName) {
      return opcodeName;
    }

    const numeric = Number(value);
    return Number.isSafeInteger(numeric) ? numeric : value.toString();
  }

  return value;
}

function toProtocolBigInt(value) {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return BigInt(Math.trunc(value));
  }

  if (typeof value === "string" && value.trim()) {
    try {
      return BigInt(value);
    } catch (error) {
      return null;
    }
  }

  return null;
}

function toProtocolKey(value) {
  const numeric = toProtocolBigInt(value);
  if (numeric !== null) {
    return numeric.toString();
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
}

function resolveSystemString(value) {
  const key = toProtocolKey(value),
    systemStrings =
      uiStrings?.system && typeof uiStrings.system === "object"
        ? uiStrings.system
        : {};

  if (!key) {
    return null;
  }

  const text = systemStrings[key];
  return typeof text === "string" && text.trim() ? text : null;
}

function decodeCardStringId(value) {
  const numeric = toProtocolBigInt(value);
  if (numeric === null || numeric <= 0n) {
    return null;
  }

  const cardId = Number(numeric >> STRING_ID_SHIFT),
    stringIndex = Number(numeric & STRING_ID_MASK);

  if (
    !Number.isInteger(cardId) ||
    cardId <= 0 ||
    !Number.isInteger(stringIndex) ||
    stringIndex <= 0
  ) {
    return null;
  }

  return {
    cardId,
    stringIndex,
  };
}

function resolveCardString(value) {
  const decoded = decodeCardStringId(value);
  if (!decoded) {
    return null;
  }

  const card = database.find((entry) => Number(entry?.id) === decoded.cardId),
    text = card?.[`str${decoded.stringIndex}`];

  return typeof text === "string" && text.trim() ? text : null;
}

function resolveCardName(value) {
  const key = toProtocolKey(value);
  if (!key) {
    return null;
  }

  const card = database.find((entry) => String(entry?.id) === key);
  return typeof card?.name === "string" && card.name.trim() ? card.name : null;
}

function resolveProtocolText(value) {
  return (
    resolveSystemString(value) ||
    resolveCardString(value) ||
    resolveCardName(value) ||
    null
  );
}

function formatSystemString(template, replacements) {
  if (typeof template !== "string" || !template.length) {
    return "";
  }

  let replacementIndex = 0;
  return template.replace(/%ls|%d|\{\}/g, () => {
    const replacement = replacements[replacementIndex];
    replacementIndex += 1;
    return replacement === undefined || replacement === null
      ? ""
      : String(replacement);
  });
}

/**
 * Resolves script path used by the controller core module.
 * @param {string} scriptname The scriptname value provides an input used by the controller core module.
 * @returns {(string|null)} Returns the value produced by the controller core module.
 */
function resolveScriptPath(scriptname) {
  const normalized = String(scriptname ?? "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .trim();

  if (!normalized || normalized === "0") {
    return "";
  }

  const basename = path.posix.basename(normalized);
  const rootScriptPath = path.resolve(scriptsFolder, basename);
  if (fs.existsSync(rootScriptPath) && fs.statSync(rootScriptPath).isFile()) {
    return rootScriptPath;
  }

  if (!/^c\d+\.lua$/i.test(basename)) {
    return null;
  }

  for (const folderName of SCRIPT_FOLDER_PRIORITY) {
    const candidate = path.resolve(scriptsFolder, folderName, basename);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  console.log(`[tcgcore/ocg] script not found for ${scriptname} (normalized: ${normalized})`);
  return null;
}

/**
 * Reads script source used by the controller core module.
 * @param {Object} scriptCache The scriptCache value provides an input used by the controller core module.
 * @param {string} scriptname The scriptname value provides an input used by the controller core module.
 * @returns {null} Returns the value produced by the controller core module.
 */
function readScriptSource(scriptCache, scriptname) {
  const resolvedPath = resolveScriptPath(scriptname);

  if (resolvedPath === "") {
    return null;
  }
  if (!resolvedPath) {
    return null;
  }
  if (!scriptCache[resolvedPath]) {
    scriptCache[resolvedPath] = fs.readFileSync(resolvedPath, "utf8");
  }

  return scriptCache[resolvedPath];
}

function normalizeReloadFieldPlayer(playerState, player) {
  const faceupExtraCount = Number(playerState?.extra_faceup_count || 0),
    extraSize = Number(playerState?.extra_size || 0);

  return {
    lp: Number(playerState?.lp || 0),
    deck_size: Number(playerState?.deck_size || 0),
    hand_size: Number(playerState?.hand_size || 0),
    grave_size: Number(playerState?.grave_size || 0),
    banish_size: Number(playerState?.banish_size || 0),
    extra_size: extraSize,
    extra_faceup_count: faceupExtraCount,
    monsters: (playerState?.monsters || []).map((card, index) =>
      card
        ? {
            player,
            location: "MONSTERZONE",
            index,
            position: positionName(card.position),
            materials: Number(card.materials || 0),
          }
        : null,
    ),
    spells: (playerState?.spells || []).map((card, index) =>
      card
        ? {
            player,
            location: "SPELLZONE",
            index,
            position: positionName(card.position),
            materials: Number(card.materials || 0),
          }
        : null,
    ),
    deck: Array.from({ length: Number(playerState?.deck_size || 0) }, (_, index) => ({
      player,
      location: "DECK",
      index,
      position: "FaceDown",
      id: "unknown",
    })),
    hand: Array.from({ length: Number(playerState?.hand_size || 0) }, (_, index) => ({
      player,
      location: "HAND",
      index,
      position: "FaceDown",
      id: "unknown",
    })),
    grave: Array.from({ length: Number(playerState?.grave_size || 0) }, (_, index) => ({
      player,
      location: "GRAVE",
      index,
      position: "FaceUp",
      id: "unknown",
    })),
    banished: Array.from({ length: Number(playerState?.banish_size || 0) }, (_, index) => ({
      player,
      location: "BANISHED",
      index,
      position: "FaceUp",
      id: "unknown",
    })),
    extra: Array.from({ length: extraSize }, (_, index) => ({
      player,
      location: "EXTRA",
      index,
      position:
        index >= Math.max(0, extraSize - faceupExtraCount) ? "FaceUp" : "FaceDown",
      id: "unknown",
    })),
  };
}

function normalizeReloadChain(chain, index) {
  const location = normalizeFieldCoordinate(chain);

  return {
    index,
    id: chain?.code ?? "unknown",
    card: location,
    triggering_controller: Number(chain?.triggering_controller ?? 0),
    triggering_location: locationName(chain?.triggering_location),
    triggering_sequence: Number(chain?.triggering_sequence ?? 0),
    description: normalizeProtocolScalar(chain?.description),
    description_text: resolveProtocolText(chain?.description),
  };
}

function hydrateReloadFieldZone(cards, player, location, pduel, ocgapi) {
  if (!Array.isArray(cards) || !cards.length || typeof ocgapi?.duelQuery !== "function") {
    return cards;
  }

  const overlayQueryFlag = Number(OcgQueryFlags?.OVERLAY_CARD ?? 0x10000) || 0x10000;
  let changed = false;
  const nextCards = cards.map((card, index) => {
    if (!card || Number(card.materials || 0) <= 0) {
      return card;
    }

    let query = null;

    try {
      query = ocgapi.duelQuery(pduel, {
        flags: overlayQueryFlag,
        controller: player,
        location,
        sequence: index,
        overlaySequence: 0,
      });
    } catch (error) {
      console.log("[tcgcore/ocg] failed to query reload overlay cards", {
        error: error?.message || String(error),
        player,
        location,
        index,
      });
      return card;
    }

    const overlayCards = (query?.overlayCards || [])
      .map((value) => Number(value || 0))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (!overlayCards.length) {
      return card;
    }

    changed = true;
    return Object.assign({}, card, {
      materials: Math.max(Number(card.materials || 0), overlayCards.length),
      overlay_cards: overlayCards,
    });
  });

  return changed ? nextCards : cards;
}

function hydrateReloadFieldOverlayCards(message, pduel, ocgapi) {
  if (
    !message
    || message.type !== OcgMessageType?.RELOAD_FIELD
    || !Array.isArray(message.players)
  ) {
    return message;
  }

  const players = message.players.map((playerState, player) => {
    if (!playerState || typeof playerState !== "object") {
      return playerState;
    }

    const monsters = hydrateReloadFieldZone(
        playerState.monsters,
        player,
        LOCATION_MZONE,
        pduel,
        ocgapi,
      ),
      spells = hydrateReloadFieldZone(
        playerState.spells,
        player,
        LOCATION_SZONE,
        pduel,
        ocgapi,
      );

    if (
      monsters === playerState.monsters
      && spells === playerState.spells
    ) {
      return playerState;
    }

    return Object.assign({}, playerState, {
      monsters,
      spells,
    });
  });

  return Object.assign({}, message, {
    players,
  });
}

function queryLocationCards(pduel, ocgapi, player, location, flags) {
  if (!pduel || !ocgapi) {
    return [];
  }

  if (typeof ocgapi.duelQueryLocation === "function") {
    try {
      const queried = ocgapi.duelQueryLocation(pduel, {
        flags,
        controller: player,
        location,
      });

      return Array.isArray(queried) ? queried : [];
    } catch (error) {
      console.log("[tcgcore/ocg] failed to query location snapshot", {
        error: error?.message || String(error),
        player,
        location,
      });
      return [];
    }
  }

  if (
    typeof ocgapi.query_field_count !== "function" ||
    typeof ocgapi.duelQuery !== "function"
  ) {
    return [];
  }

  const count = Number(ocgapi.query_field_count(pduel, player, location) || 0),
    queried = [];

  for (let index = 0; index < count; index += 1) {
    try {
      queried.push(
        ocgapi.duelQuery(pduel, {
          flags,
          controller: player,
          location,
          sequence: index,
          overlaySequence: 0,
        }),
      );
    } catch (error) {
      console.log("[tcgcore/ocg] failed to query location card", {
        error: error?.message || String(error),
        player,
        location,
        index,
      });
      queried.push(null);
    }
  }

  return queried;
}

function buildQueriedLocationCards(cards, player, location) {
  const resolvedLocation = locationName(location),
    facedownByDefault = location === LOCATION_EXTRA;

  return (Array.isArray(cards) ? cards : []).map((card, index) => ({
    player,
    location: resolvedLocation,
    index,
    position:
      card?.position !== undefined
        ? browserPositionName(card.position, resolvedLocation)
        : facedownByDefault
          ? "FaceDown"
          : "FaceUp",
    id: card?.code ? Number(card.code) : "unknown",
    isPublic: Boolean(card?.isPublic),
  }));
}

function hydrateIdleExtraField(message, pduel, ocgapi) {
  if (
    !message ||
    message.type !== OcgMessageType?.SELECT_IDLECMD ||
    !Number.isInteger(Number(message.player))
  ) {
    return message;
  }

  const player = Number(message.player),
    flags =
      Number(OcgQueryFlags?.CODE ?? 0x1) |
      Number(OcgQueryFlags?.POSITION ?? 0x2) |
      Number(OcgQueryFlags?.IS_PUBLIC ?? 0x100000),
    cards = buildQueriedLocationCards(
      queryLocationCards(pduel, ocgapi, player, LOCATION_EXTRA, flags),
      player,
      LOCATION_EXTRA,
    );

  if (!cards.length) {
    return message;
  }

  const field = Array.isArray(message.field)
      ? message.field.map((view) => Object.assign({}, view))
      : [{}, {}];

  field[player] = Object.assign({}, field[player], {
    EXTRA: cards,
  });

  return Object.assign({}, message, {
    field,
  });
}

function stripPrivateIdleField(message) {
  if (!message || !Array.isArray(message.field)) {
    return message;
  }

  const nextMessage = Object.assign({}, message);
  delete nextMessage.field;
  return nextMessage;
}

function resolveStartingLp(game) {
  const value = Number(
    game?.team1?.startingLP ??
      game?.startingLP ??
      8000
  );
  return Number.isFinite(value) ? value : 8000;
}

function resolveStartingDrawCount(game) {
  const value = Number(
    game?.team1?.startingDrawCount ??
      game?.startingDrawCount ??
      5
  );
  return Number.isFinite(value) ? value : 5;
}

function resolveDrawCountPerTurn(game) {
  const value = Number(
    game?.team1?.drawCountPerTurn ??
      game?.drawCountPerTurn ??
      1
  );
  return Number.isFinite(value) ? value : 1;
}

function resolveTimeLimit(game) {
  const value = Number(
    game?.timeLimitSeconds ??
      0
  );
  return Number.isFinite(value) ? value : 0;
}

/**
 * Executes the preload startup scripts helper used by the controller core module.
 * @param {Object} core The core object supplies the structured input used by the controller core module, including the `loadScript` property.
 * @param {(Function|function)} core.loadScript The `loadScript` property supplies structured input used by the controller core module.
 * @param {number} handle The handle value provides an input used by the controller core module.
 * @param {Map} scriptCache The scriptCache value provides an input used by the controller core module.
 * @returns {void} Does not return a value.
 */
function preloadStartupScripts(core, handle, scriptCache) {
  if (typeof core.loadScript !== "function") {
    return;
  }

  STARTUP_SCRIPT_NAMES.forEach((scriptName) => {
    const scriptSource = readScriptSource(scriptCache, scriptName);
    if (typeof scriptSource !== "string" || !scriptSource.length) {
      throw new Error(`Missing required startup script: ${scriptName}`);
    }
    core.loadScript(handle, `./expansions/script/${scriptName}`, scriptSource);
  });
}

/**
 * Normalizes message used by the controller core module.
 * @param {Object} message The message object supplies the structured input used by the controller core module, including the `amount`, `can_cancel`, `card`, `cards`, `code`, `controller`, `drawn`, `drawn[]`, `field_mask`, `from`, `location`, `max`, `min`, `phase`, `position`, `select_cards`, `selects`, `selects_must`, `sequence`, `spe_count`, `target`, `to`, `type`, and `unselect_cards` properties.
 * @param {number} message.amount The `amount` property supplies structured input used by the controller core module.
 * @param {boolean} message.can_cancel The `can_cancel` property supplies structured input used by the controller core module.
 * @param {Array} message.card The `card` property supplies structured input used by the controller core module.
 * @param {Array} message.cards The `cards` property supplies structured input used by the controller core module.
 * @param {string} message.code The `code` property supplies structured input used by the controller core module.
 * @param {number} message.controller The `controller` property supplies structured input used by the controller core module.
 * @param {Array} message.drawn The `drawn` property supplies structured input used by the controller core module.
 * @param {number} message.drawn.length The `drawn.length` property supplies structured input used by the controller core module.
 * @param {string} message.drawn[].code The `drawn[].code` property supplies structured input used by the controller core module.
 * @param {number} message.field_mask The `field_mask` property supplies structured input used by the controller core module.
 * @param {Object} message.from The `from` property supplies structured input used by the controller core module.
 * @param {number} message.from.controller The `from.controller` property supplies structured input used by the controller core module.
 * @param {string} message.from.location The `from.location` property supplies structured input used by the controller core module.
 * @param {number} message.from.sequence The `from.sequence` property supplies structured input used by the controller core module.
 * @param {string} message.location The `location` property supplies structured input used by the controller core module.
 * @param {number} message.max The `max` property supplies structured input used by the controller core module.
 * @param {number} message.min The `min` property supplies structured input used by the controller core module.
 * @param {(number|string)} message.phase The `phase` property supplies structured input used by the controller core module.
 * @param {(number|string)} message.position The `position` property supplies structured input used by the controller core module.
 * @param {Array} message.select_cards The `select_cards` property supplies structured input used by the controller core module.
 * @param {Array} message.selects The `selects` property supplies structured input used by the controller core module.
 * @param {number} message.selects.length The `selects.length` property supplies structured input used by the controller core module.
 * @param {Array} message.selects_must The `selects_must` property supplies structured input used by the controller core module.
 * @param {number} message.sequence The `sequence` property supplies structured input used by the controller core module.
 * @param {number} message.spe_count The `spe_count` property supplies structured input used by the controller core module.
 * @param {Array} message.target The `target` property supplies structured input used by the controller core module.
 * @param {Object} message.to The `to` property supplies structured input used by the controller core module.
 * @param {number} message.to.controller The `to.controller` property supplies structured input used by the controller core module.
 * @param {string} message.to.location The `to.location` property supplies structured input used by the controller core module.
 * @param {(number|string)} message.to.position The `to.position` property supplies structured input used by the controller core module.
 * @param {number} message.to.sequence The `to.sequence` property supplies structured input used by the controller core module.
 * @param {(string|number)} message.type The `type` property supplies structured input used by the controller core module.
 * @param {Array} message.unselect_cards The `unselect_cards` property supplies structured input used by the controller core module.
 * @returns {Object} Returns the value produced by the controller core module.
 */
function normalizeMessage(message) {
  if (!message || typeof message.type !== "number") {
    return message;
  }

  switch (message.type) {
    case OcgMessageType.NEW_PHASE:
      return Object.assign({}, message, {
        gui_phase: enums.phase[message.phase],
      });
    case OcgMessageType.HINT:
      return Object.assign({}, message, {
        hint: normalizeProtocolScalar(message.hint),
        hint_type:
          enums.STOC?.STOC_GAME_MSG?.MSG_HINT?.[message.hint_type] ??
          message.hint_type,
      });
    case OcgMessageType.SELECT_EFFECTYN:
    case OcgMessageType.SELECT_YESNO:
      return Object.assign({}, message, {
        description: normalizeProtocolScalar(message.description),
      });
    case OcgMessageType.SELECT_OPTION:
      return Object.assign({}, message, {
        options: (message.options || []).map((value) =>
          normalizeProtocolScalar(value),
        ),
        select_options: (message.options || []).map((value, index) => ({
          i: index,
          value: normalizeProtocolScalar(value),
        })),
      });
    case OcgMessageType.DRAW:
      return Object.assign({}, message, {
        count: message.drawn.length,
        cards: message.drawn.map((card) => ({ id: card.code })),
      });
    case OcgMessageType.CARD_SELECTED:
    case OcgMessageType.RANDOM_SELECTED:
      return Object.assign({}, message, {
        cards: normalizeFieldCoordinateList(message.cards),
      });
    case OcgMessageType.DAMAGE:
      return Object.assign({}, message, { lp: message.amount, multiplier: -1 });
    case OcgMessageType.PAY_LPCOST:
      return Object.assign({}, message, { lp: message.amount, multiplier: -1 });
    case OcgMessageType.RECOVER:
      return Object.assign({}, message, { lp: message.amount, multiplier: 1 });
    case OcgMessageType.ATTACK:
      return Object.assign({}, message, {
        attacker: message.card,
        defender: message.target,
      });
    case OcgMessageType.EQUIP:
      return Object.assign({}, message, {
        source: normalizeFieldCoordinate(message.card),
        target: normalizeFieldCoordinate(message.target),
      });
    case OcgMessageType.UNEQUIP:
      return Object.assign({}, message, {
        source: normalizeFieldCoordinate(message.card),
      });
    case OcgMessageType.BECOME_TARGET:
      return Object.assign({}, message, {
        cards: normalizeFieldCoordinateList(message.cards),
      });
    case OcgMessageType.CARD_TARGET:
    case OcgMessageType.CANCEL_TARGET:
      return Object.assign({}, message, {
        source: normalizeFieldCoordinate(message.card),
        target: normalizeFieldCoordinate(message.target),
      });
    case OcgMessageType.BE_CHAIN_TARGET:
      return Object.assign({}, message, {
        cards: normalizeFieldCoordinateList(message.cards),
      });
    case OcgMessageType.CREATE_RELATION:
    case OcgMessageType.RELEASE_RELATION:
      return Object.assign({}, message, {
        source: normalizeFieldCoordinate(message.source || message.card),
        target: normalizeFieldCoordinate(message.target),
        cards: normalizeFieldCoordinateList(message.cards),
      });
    case OcgMessageType.BATTLE: {
      const source = normalizeFieldCoordinate(message.card),
        target =
          message?.target && message.target.location
            ? normalizeFieldCoordinate(message.target)
            : null;

      return Object.assign({}, message, {
        source: source
          ? Object.assign({}, source, {
              attack: Number(message?.card?.attack || 0),
              defense: Number(message?.card?.defense || 0),
              destroyed: Boolean(message?.card?.destroyed),
            })
          : null,
        target: target
          ? Object.assign({}, target, {
              attack: Number(message?.target?.attack || 0),
              defense: Number(message?.target?.defense || 0),
              destroyed: Boolean(message?.target?.destroyed),
            })
          : null,
      });
    }
    case OcgMessageType.ATTACK_DISABLED:
      return Object.assign({}, message, {
        text: resolveSystemString(1621) || "An attack was negated",
      });
    case OcgMessageType.MISSED_EFFECT:
      return Object.assign({}, message, normalizeFieldCoordinate(message), {
        source: normalizeFieldCoordinate(message),
        id: Number(message.code || 0) || undefined,
        text:
          formatSystemString(resolveSystemString(1622) || "\"%ls\" missed the timing", [
            resolveCardName(message.code) || "An effect",
          ]) || "An effect missed the timing",
      });
    case OcgMessageType.MOVE:
      return Object.assign({}, message, {
        code: message.card,
        previousController: message.from.controller,
        previousLocation: locationName(message.from.location),
        previousIndex: message.from.sequence,
        currentController: message.to.controller,
        currentLocation: locationName(message.to.location),
        currentIndex: message.to.sequence,
        currentPosition: browserPositionName(
          message.to.position,
          message.to.location,
        ),
      });
    case OcgMessageType.POS_CHANGE:
      return Object.assign({}, message, {
        player: message.controller,
        index: message.sequence,
        location: locationName(message.location),
        position: browserPositionName(message.position, message.location),
      });
    case OcgMessageType.FIELD_DISABLED:
      return Object.assign({}, message, {
        field_mask: Number(message.field_mask || 0),
        zones: expandDisabledFieldMaskToZones(message.field_mask),
      });
    case OcgMessageType.SELECT_PLACE:
    case OcgMessageType.SELECT_DISFIELD:
      return Object.assign({}, message, {
        zones: expandFieldMaskToZones(message.field_mask),
      });
    case OcgMessageType.SELECT_CARD:
    case OcgMessageType.SELECT_TRIBUTE:
      return Object.assign({}, message, {
        select_min: message.min,
        select_max: message.max,
        can_cancel: message.can_cancel,
        selectable_targets: (message.selects || message.cards || []).map(
          normalizeSelectableCard,
        ),
      });
    case OcgMessageType.SELECT_COUNTER:
      return Object.assign({}, message, {
        select_min: message.count,
        select_max: message.count,
        counter_targets: (message.cards || []).map((card, index) =>
          Object.assign(normalizeSelectableCard(card, index), {
            count: card.count,
            counter_type: message.counter_type,
          }),
        ),
      });
    case OcgMessageType.DECK_TOP:
      return Object.assign({}, message, {
        player: Number(message.player || 0),
        offset: Number(message.count || 0),
        id: Number(message.code || 0) || "unknown",
        reversed: Boolean(Number(message.position || 0) & POS_FACEDOWN_DEFENSE),
      });
    case OcgMessageType.HAND_RES:
      return Object.assign({}, message, {
        results: Array.isArray(message.results)
          ? message.results.map((value) => Number(value))
          : [],
      });
    case OcgMessageType.TOSS_COIN:
      return Object.assign({}, message, {
        player: Number(message.player || 0),
        results: Array.isArray(message.results)
          ? message.results.map((value) => Boolean(value))
          : [],
      });
    case OcgMessageType.TOSS_DICE:
      return Object.assign({}, message, {
        player: Number(message.player || 0),
        results: Array.isArray(message.results)
          ? message.results.map((value) => Number(value))
          : [],
      });
    case OcgMessageType.CONFIRM_DECKTOP:
    case OcgMessageType.CONFIRM_EXTRATOP:
    case OcgMessageType.CONFIRM_CARDS:
      return Object.assign({}, message, {
        reveal_cards: (message.cards || []).map(normalizeSelectableCard),
        selectable_targets: (message.selects || message.cards || []).map(
          normalizeSelectableCard,
        ),
      });
    case OcgMessageType.SELECT_CHAIN:
      return Object.assign({}, message, {
        selects: (message.selects || []).map((card) =>
          Object.assign({}, card, {
            description: normalizeProtocolScalar(card.description),
          }),
        ),
        select_options: (message.selects || []).map(normalizeSelectableCard),
        count: message.selects?.length || 0,
        specount: message.spe_count,
        select_trigger: (message.selects?.length || 0) > 0,
      });
    case OcgMessageType.CHAINING:
      return Object.assign({}, message, normalizeFieldCoordinate(message), {
        id: message.code,
        source: normalizeFieldCoordinate(message),
        triggering_location: locationName(message.triggering_location),
        description: normalizeProtocolScalar(message.description),
        description_text: resolveProtocolText(message.description),
        chain_size: Number(message.chain_size || 0),
      });
    case OcgMessageType.CHAINED:
    case OcgMessageType.CHAIN_SOLVING:
    case OcgMessageType.CHAIN_SOLVED:
    case OcgMessageType.CHAIN_NEGATED:
    case OcgMessageType.CHAIN_DISABLED:
      return Object.assign({}, message, {
        chain_size: Number(message.chain_size || 0),
      });
    case OcgMessageType.SELECT_UNSELECT_CARD:
      return Object.assign({}, message, {
        cards1: (message.select_cards || []).map(normalizeSelectableCard),
        cards2: (message.unselect_cards || []).map(normalizeSelectableCard),
      });
    case OcgMessageType.SORT_CARD:
    case OcgMessageType.SORT_CHAIN:
      return Object.assign({}, message, {
        select_min: 0,
        select_max: (message.cards || []).length,
        select_options: (message.cards || []).map(normalizeSelectableCard),
      });
    case OcgMessageType.SELECT_SUM:
      return Object.assign({}, message, {
        can_select: (message.selects || []).map(normalizeSelectableCard),
        must_select: (message.selects_must || []).map(normalizeSelectableCard),
        must_select_count: message.amount,
        select_min: message.min,
        select_max: message.max,
      });
    case OcgMessageType.ADD_COUNTER:
    case OcgMessageType.REMOVE_COUNTER:
      return Object.assign({}, message, {
        player: message.controller,
        index: message.sequence,
        location: locationName(message.location),
      });
    case OcgMessageType.SHUFFLE_SET_CARD:
      return Object.assign({}, message, {
        location: locationName(message.location),
        cards: (message.cards || []).map((movement) => ({
          from: normalizeFieldCoordinate(movement.from),
          to: normalizeFieldCoordinate(movement.to),
        })),
      });
    case OcgMessageType.REMOVE_CARDS:
      return Object.assign({}, message, {
        cards: (message.cards || []).map(normalizeFieldCoordinate),
      });
    case OcgMessageType.TAG_SWAP: {
      const player = Number(message.player || 0),
        deckSize = Number(message.deck_size || 0),
        deckTopCard = Number(message.deck_top_card || 0) || null;

      return Object.assign({}, message, {
        player,
        deck_size: deckSize,
        deck_top_card: deckTopCard,
        deck: Array.from({ length: deckSize }, (_, index) => ({
          player,
          location: "DECK",
          index,
          position: "FaceDown",
          id:
            index === Math.max(0, deckSize - 1) && deckTopCard
              ? deckTopCard
              : "unknown",
        })),
        hand: (message.hand || []).map((card, index) => ({
          player,
          location: "HAND",
          index,
          position: positionName(card.position),
          id: Number(card.code || 0) || "unknown",
        })),
        extra: (message.extra || []).map((card, index) => ({
          player,
          location: "EXTRA",
          index,
          position: browserPositionName(card.position, "EXTRA"),
          id: Number(card.code || 0) || "unknown",
        })),
      });
    }
    case OcgMessageType.AI_NAME: {
      const aiName =
        typeof message.name === "string" && message.name.trim()
          ? message.name.trim()
          : "AI";

      return Object.assign({}, message, {
        ai_name: aiName,
        opponent_name: aiName,
        text: aiName,
      });
    }
    case OcgMessageType.SHOW_HINT: {
      const text =
        typeof message.hint === "string" && message.hint.trim()
          ? message.hint.trim()
          : "";

      return Object.assign({}, message, {
        hint: text,
        text,
      });
    }
    case OcgMessageType.MATCH_KILL: {
      const card = Number(message.card || 0) || 0,
        cardName = card ? resolveCardName(card) : null;

      return Object.assign({}, message, {
        card,
        id: card || undefined,
        card_name: cardName,
        text: cardName
          ? `Match kill active: ${cardName}`
          : "Match kill effect registered",
      });
    }
    case OcgMessageType.CUSTOM_MSG:
      return Object.assign({}, message, {
        text:
          typeof message.text === "string" && message.text.trim()
            ? message.text.trim()
            : "Custom duel message received.",
      });
    case OcgMessageType.CARD_HINT: {
      const description = normalizeProtocolScalar(message.description),
        hintType = CARD_HINT_TYPE[message.card_hint] || message.card_hint,
        text = resolveProtocolText(message.description),
        location = normalizeFieldCoordinate(message);

      return Object.assign({}, message, location, {
        card_hint: hintType,
        description,
        description_text: text,
        hint_text:
          hintType === "turn"
            ? `Turn ${Number(message.description || 0)}`
            : text,
        position: browserPositionName(message.position, message.location),
      });
    }
    case OcgMessageType.PLAYER_HINT:
      return Object.assign({}, message, {
        player_hint: PLAYER_HINT_TYPE[message.player_hint] || message.player_hint,
        description: normalizeProtocolScalar(message.description),
        description_text: resolveProtocolText(message.description),
      });
    case OcgMessageType.RELOAD_FIELD:
      return Object.assign({}, message, {
        flags: Number(message.flags || 0n),
        players: (message.players || []).map(normalizeReloadFieldPlayer),
        chain: (message.chain || []).map(normalizeReloadChain),
      });
    case OcgMessageType.ANNOUNCE_NUMBER:
      return Object.assign({}, message, {
        options: (message.options || []).map((value) =>
          normalizeProtocolScalar(value),
        ),
        values: (message.options || []).map((value) =>
          normalizeProtocolScalar(value),
        ),
      });
    case OcgMessageType.ANNOUNCE_CARD:
      return Object.assign({}, message, {
        opcodes: (message.opcodes || []).map((value) =>
          normalizeAnnounceCardOpcode(value),
        ),
      });
    case OcgMessageType.SUMMONING:
    case OcgMessageType.SPSUMMONING:
    case OcgMessageType.FLIPSUMMONING:
      return Object.assign({}, message, {
        player: message.controller,
        index: message.sequence,
        location: locationName(message.location),
        position: browserPositionName(message.position, message.location),
        id: message.code,
      });
    default:
      return message;
  }
}

/**
 * Builds response from encoded selection used by the controller core module.
 * @param {string} messageType The messageType value provides an input used by the controller core module.
 * @param {(number|Object)} data The data value provides an input used by the controller core module.
 * @returns {(Object|null)} Returns the value produced by the controller core module.
 */
function buildResponseFromEncodedSelection(messageType, data) {
  if (typeof data !== "number") {
    return null;
  }

  const index = (data >> 16) & 0xffff,
    action = data & 0xffff;

  switch (messageType) {
    case OcgMessageType.SELECT_IDLECMD:
      return {
        type: OcgResponseType.SELECT_IDLECMD,
        action,
        index,
      };
    case OcgMessageType.SELECT_BATTLECMD:
      return {
        type: OcgResponseType.SELECT_BATTLECMD,
        action,
        index,
      };
    case OcgMessageType.SELECT_EFFECTYN:
      return {
        type: OcgResponseType.SELECT_EFFECTYN,
        yes: Boolean(data),
      };
    case OcgMessageType.SELECT_YESNO:
      return {
        type: OcgResponseType.SELECT_YESNO,
        yes: Boolean(data),
      };
    case OcgMessageType.SELECT_OPTION:
      return {
        type: OcgResponseType.SELECT_OPTION,
        index: data,
      };
    case OcgMessageType.SELECT_CHAIN:
      return {
        type: OcgResponseType.SELECT_CHAIN,
        index: data <= 0 ? null : 0,
      };
    case OcgMessageType.SELECT_POSITION:
      return {
        type: OcgResponseType.SELECT_POSITION,
        position: data,
      };
    case OcgMessageType.ANNOUNCE_NUMBER:
      return {
        type: OcgResponseType.ANNOUNCE_NUMBER,
        value: data,
      };
    default:
      return null;
  }
}

/**
 * Gets core used by the controller core module.
 * @returns {Promise<Object>} Resolves with the value produced by the controller core module.
 */
async function getCore() {
  if (!ocgapiPromise) {
    if (!ocgcoreModulePromise) {
      ocgcoreModulePromise = import(
        pathToFileURL(path.resolve(__dirname, "../ocgcore-wasm/dist/index.js"))
          .href
      ).then((ocgcore) => {
        createCore = ocgcore.default || ocgcore;
        OcgMessageType = ocgcore.OcgMessageType;
        OcgProcessResult = ocgcore.OcgProcessResult;
        OcgLocation = ocgcore.OcgLocation;
        OcgPosition = ocgcore.OcgPosition;
        OcgQueryFlags = ocgcore.OcgQueryFlags;
        OcgDuelMode = ocgcore.OcgDuelMode;
        OcgResponseType = ocgcore.OcgResponseType;
        boardController.configureOcgcore(ocgcore);
        return ocgcore;
      });
    }

    ocgapiPromise = ocgcoreModulePromise.then(() => createCore({ sync: true }));
  }
  return ocgapiPromise;
}

/**
 * Executes the duel end procedure helper used by the controller core module.
 * @param {Array} players The players value provides an input used by the controller core module.
 * @returns {void} Does not return a value.
 */
function duelEndProcedure(players) {
  console.log("game ended");
}

/**
 * Executes the game board helper used by the controller core module.
 * @param {Object} playerConnection The playerConnection value provides an input used by the controller core module.
 * @param {(string|number)} slot The slot value provides an input used by the controller core module.
 * @param {number} masterRule The masterRule value provides an input used by the controller core module.
 * @returns {ManualControlEngine} Returns the value produced by the controller core module.
 */
function GameBoard(playerConnection, slot, masterRule) {
  const board = new ManualControlEngine(function (
    perspectives,
    stack,
    callback,
  ) {
    try {
      const view = typeof slot === "number" ? "p" + slot : "spectator";

      //process.replay[slot].push(view['p' + slot]);
      playerConnection.write(perspectives[view]);
    } catch (error) {
      console.log("failed messaging socket", slot, playerConnection, error);
    } finally {
      if (callback) {
        return callback(stack);
      }
    }
  });
  board.masterRule = masterRule;
  board.slot = slot;
  return board;
}

const ControllerProcessResult = Object.freeze({
  CONTINUE: 0,
  WAIT_FOR_RESPONSE: 1,
  END_DUEL: 2,
});

function isTrackedQuestionType(normalized) {
  if (!normalized) {
    return false;
  }

  return (
    (normalized.type >= OcgMessageType.SELECT_BATTLECMD &&
      normalized.type <= OcgMessageType.SELECT_UNSELECT_CARD) ||
    normalized.type === OcgMessageType.ANNOUNCE_NUMBER ||
    normalized.type === OcgMessageType.ANNOUNCE_CARD ||
    normalized.type === OcgMessageType.ROCK_PAPER_SCISSORS
  );
}

function isInteractiveQuestionMessage(normalized) {
  if (!normalized) {
    return false;
  }

  return (
    (normalized.type >= OcgMessageType.SELECT_BATTLECMD &&
      normalized.type <= OcgMessageType.SELECT_UNSELECT_CARD) ||
    normalized.type === OcgMessageType.ROCK_PAPER_SCISSORS ||
    normalized.type === OcgMessageType.ANNOUNCE_ATTRIB ||
    normalized.type === OcgMessageType.ANNOUNCE_RACE ||
    normalized.type === OcgMessageType.ANNOUNCE_CARD ||
    normalized.type === OcgMessageType.ANNOUNCE_NUMBER
  );
}

function recordMessageSummary(rawMessage, normalized) {
  const messageSummary = {
    seenAt: new Date().toISOString(),
    rawType: rawMessage?.type,
    normalizedType: normalized?.type,
    rawPlayer: rawMessage?.player,
    normalizedPlayer: normalized?.player,
    rawReason: rawMessage?.reason,
    normalizedReason: normalized?.reason,
  };

  if (!Array.isArray(process.lastOcgMessages)) {
    process.lastOcgMessages = [];
  }
  process.lastOcgMessages.push(messageSummary);
  if (process.lastOcgMessages.length > 20) {
    process.lastOcgMessages.shift();
  }
}

function createPromptState(rawMessage, normalized, retryCount = 0) {
  return {
    player: normalized?.player,
    messageType: normalized?.type,
    command:
      typeof normalized?.command === "string"
        ? normalized.command
        : normalized?.type,
    rawMessage,
    normalizedMessage: normalized,
    retryCount,
  };
}

function setActivePrompt(game, rawMessage, normalized, retryCount = 0) {
  const promptState = createPromptState(rawMessage, normalized, retryCount);
  game.activePrompt = promptState;
  game.lastPrompt = promptState;
  game.awaitingInteractiveResponse = true;
  if (typeof normalized?.type === "number") {
    game.pendingQuestionType = normalized.type;
  }
  return promptState;
}

function clearActivePrompt(game) {
  game.activePrompt = null;
  game.awaitingInteractiveResponse = false;
}

function getActivePromptMessageType(game) {
  return game.activePrompt?.messageType ?? game.pendingQuestionType;
}

function sendWaitingState(game, activePlayer) {
  if (typeof activePlayer !== "number") {
    return;
  }

  const waitingTime = Math.max(
      0,
      typeof game.getTimeLimit === "function"
        ? Number(game.getTimeLimit())
        : Number(game.timeLimitSeconds || 0),
    ),
    waitingPlayer = 1 - activePlayer,
    waitingMessage = {
      type: OcgMessageType.WAITING,
      time: waitingTime,
    };

  game.sendBufferToPlayer(waitingPlayer, waitingMessage);
}

function promptMessageForPlayer(promptState) {
  if (!promptState?.normalizedMessage) {
    return null;
  }

  const message = Object.assign({}, promptState.normalizedMessage);
  if (promptState.retryCount > 0) {
    message.retry_count = promptState.retryCount;
  }
  return message;
}

function promptMessageForObservers(promptState) {
  if (!promptState?.normalizedMessage) {
    return null;
  }

  const observerMessage =
    promptState.normalizedMessage.type === OcgMessageType.SELECT_IDLECMD
      ? stripPrivateIdleField(promptState.normalizedMessage)
      : Object.assign({}, promptState.normalizedMessage);

  if (promptState.retryCount > 0) {
    observerMessage.retry_count = promptState.retryCount;
  }

  return observerMessage;
}

function deliverInteractivePrompt(game, promptState) {
  sendWaitingState(game, promptState.player);
  game.sendBufferToPlayer(promptState.player, {
    duelAction: "announcement",
    message: {
      command: "MSG_OPPONENT_TURN",
      active: false,
    },
  });
  game.sendBufferToPlayer(1 - promptState.player, {
    duelAction: "announcement",
    message: {
      command: "MSG_OPPONENT_TURN",
      active: true,
    },
  });
  game.sendBufferToPlayer(promptState.player, promptMessageForPlayer(promptState));
  game.sendToObservers(promptMessageForObservers(promptState));
}

function reopenLastPromptAfterRetry(game) {
  if (!game.lastPrompt?.normalizedMessage) {
    console.log(
      "[tcgcore/lifecycle] RETRY received without a previous prompt to reopen",
    );
    clearActivePrompt(game);
    return ControllerProcessResult.CONTINUE;
  }

  const nextRetryCount = Number(game.lastPrompt.retryCount || 0) + 1,
    promptState = setActivePrompt(
      game,
      game.lastPrompt.rawMessage,
      game.lastPrompt.normalizedMessage,
      nextRetryCount,
    );

  deliverInteractivePrompt(game, promptState);
  return ControllerProcessResult.WAIT_FOR_RESPONSE;
}

function dispatchCoreMessage(game, rawMessage) {
  let normalized = normalizeMessage(rawMessage);

  normalized = hydrateReloadFieldOverlayCards(
    normalized,
    game.pduel,
    game.ocgapi,
  );
  normalized = hydrateIdleExtraField(normalized, game.pduel, game.ocgapi);

  recordMessageSummary(rawMessage, normalized);

  console.log("[tcgcore/ocg] raw message", rawMessage);
  console.log("[tcgcore/ocg] normalized message", normalized);

  const isWinMessage =
    rawMessage?.type === OcgMessageType.WIN ||
    normalized?.type === OcgMessageType.WIN;

  if (isWinMessage) {
    console.log("[tcgcore/ocg] WIN message detected in mainProcess", {
      raw: rawMessage,
      normalized,
      pendingQuestionType: game.pendingQuestionType,
    });
  }

  if (normalized?.player === 2) {
    normalized.player = 1;
  }

  if (normalized?.type === OcgMessageType.RETRY) {
    return reopenLastPromptAfterRetry(game);
  }

  if (isTrackedQuestionType(normalized)) {
    game.pendingQuestionType = normalized.type;
  }

  if (typeof normalized?.player === "number") {
    const isInteractiveQuestion = isInteractiveQuestionMessage(normalized);

    game.last(normalized.player);
    if (isInteractiveQuestion) {
      const promptState = setActivePrompt(game, rawMessage, normalized);
      deliverInteractivePrompt(game, promptState);
    } else {
      game.sendBufferToPlayer(normalized.player, normalized);
      game.reSendToPlayer(1 - normalized.player);
      game.sendToObservers(normalized);
    }
    if (isWinMessage) {
      return ControllerProcessResult.END_DUEL;
    }
    return isInteractiveQuestion
      ? ControllerProcessResult.WAIT_FOR_RESPONSE
      : ControllerProcessResult.CONTINUE;
  }

  game.sendBufferToPlayer(0, normalized);
  game.sendBufferToPlayer(1, normalized);
  game.sendToObservers(normalized);
  if (typeof game.refreshAll === "function") {
    game.refreshAll();
  }

  return isWinMessage
    ? ControllerProcessResult.END_DUEL
    : ControllerProcessResult.CONTINUE;
}

/**
 * Executes the main process helper used by the controller core module.
 * @param {Object} game The game object supplies the structured input used by the controller core module, including the `last`, `ocgapi`, `pduel`, `pendingQuestionType`, `reSendToPlayer`, `refreshAll`, `sendBufferToPlayer`, and `sendToObservers` properties.
 * @param {Function} game.last The `last` property supplies structured input used by the controller core module.
 * @param {Object} game.ocgapi The `ocgapi` property supplies structured input used by the controller core module.
 * @param {(string|Function)} game.ocgapi.duelGetMessage The `ocgapi.duelGetMessage` property supplies structured input used by the controller core module.
 * @param {Function} game.ocgapi.duelProcess The `ocgapi.duelProcess` property supplies structured input used by the controller core module.
 * @param {number} game.pduel The `pduel` property supplies structured input used by the controller core module.
 * @param {string} game.pendingQuestionType The `pendingQuestionType` property supplies structured input used by the controller core module.
 * @param {Function} game.reSendToPlayer The `reSendToPlayer` property supplies structured input used by the controller core module.
 * @param {(Function|function)} game.refreshAll The `refreshAll` property supplies structured input used by the controller core module.
 * @param {Function} game.sendBufferToPlayer The `sendBufferToPlayer` property supplies structured input used by the controller core module.
 * @param {Function} game.sendToObservers The `sendToObservers` property supplies structured input used by the controller core module.
 * @returns {Promise<void>} Returns the value produced by the controller core module.
 */
function mainProcess(game) {
  if (game.mainProcessPromise) {
    return game.mainProcessPromise;
  }

  if (game.awaitingInteractiveResponse) {
    console.log(
      "[tcgcore/lifecycle] mainProcess skipped while awaiting interactive response",
      {
        pendingQuestionType: getActivePromptMessageType(game),
        activePromptPlayer: game.activePrompt?.player,
      },
    );
    return Promise.resolve();
  }

  game.mainProcessPromise = (async function () {
    try {
      while (true) {
        const drainingBufferedMessages =
          Array.isArray(game.bufferedMessages) &&
          game.bufferedMessages.length > 0;
        let status = null,
          messages = [];

        if (drainingBufferedMessages) {
          messages = game.bufferedMessages.splice(0);
        } else {
          status = await game.ocgapi.duelProcess(game.pduel);
          messages = game.ocgapi.duelGetMessage(game.pduel) || [];
        }

        console.log("[tcgcore/ocg] duelProcess tick", {
          status,
          drainingBufferedMessages,
          pendingQuestionType: getActivePromptMessageType(game),
          activePromptPlayer: game.activePrompt?.player,
          messageCount: messages.length,
          messageTypes: messages.map((message) => message?.type),
        });

        let processResult = ControllerProcessResult.CONTINUE;

        for (
          let messageIndex = 0;
          messageIndex < messages.length;
          messageIndex += 1
        ) {
          processResult = dispatchCoreMessage(game, messages[messageIndex]);

          if (processResult === ControllerProcessResult.WAIT_FOR_RESPONSE) {
            if (messageIndex + 1 < messages.length) {
              game.bufferedMessages = messages.slice(messageIndex + 1);
              console.log(
                "[tcgcore/lifecycle] buffered trailing messages after interactive question",
                {
                  bufferedMessageCount: game.bufferedMessages.length,
                  bufferedMessageTypes: game.bufferedMessages.map(
                    (entry) => entry?.type,
                  ),
                },
              );
            } else {
              game.bufferedMessages = [];
            }
            break;
          }

          if (processResult === ControllerProcessResult.END_DUEL) {
            game.bufferedMessages = [];
            break;
          }
        }

        if (processResult === ControllerProcessResult.WAIT_FOR_RESPONSE) {
          break;
        }

        if (processResult === ControllerProcessResult.END_DUEL) {
          console.log("[tcgcore/lifecycle] duel ended");
          duelEndProcedure(game);
          break;
        }

        if (drainingBufferedMessages) {
          continue;
        }

        if (status === OcgProcessResult.WAITING) {
          console.log("[tcgcore/lifecycle] waiting for player response");
          break;
        }
        if (status === OcgProcessResult.END) {
          console.log("[tcgcore/lifecycle] duel ended");
          duelEndProcedure(game);
          break;
        }
      }
    } finally {
      game.mainProcessPromise = null;
    }
  })();

  return game.mainProcessPromise;
}

/**
 * Executes the responser helper used by the controller core module.
 * @param {Object} game The game object supplies the structured input used by the controller core module, including the `last`, `ocgapi`, `pduel`, and `pendingQuestionType` properties.
 * @param {Function} game.last The `last` property supplies structured input used by the controller core module.
 * @param {Object} game.ocgapi The `ocgapi` property supplies structured input used by the controller core module.
 * @param {Function} game.ocgapi.duelSetResponse The `ocgapi.duelSetResponse` property supplies structured input used by the controller core module.
 * @param {number} game.pduel The `pduel` property supplies structured input used by the controller core module.
 * @param {string} game.pendingQuestionType The `pendingQuestionType` property supplies structured input used by the controller core module.
 * @param {number} player The player value provides an input used by the controller core module.
 * @param {number} slot The slot value provides an input used by the controller core module.
 * @class
 * @returns {Object} Returns the value produced by the controller core module.
 */
function Responser(game, player, slot) {
      /**
   * Executes the write helper used by the controller core module.
   * @param {(Object|object)} data The data value provides an input used by the controller core module.
   * @returns {Promise<void>} Resolves when the controller core operation completes.
   */
  async function write(data) {
    game.last(slot);
    const activePrompt = game.activePrompt || null,
      responseMessageType = getActivePromptMessageType(game);

    if (
      activePrompt &&
      typeof activePrompt.player === "number" &&
      activePrompt.player !== slot
    ) {
      console.log("[tcgcore/lifecycle] ignoring response from non-active player", {
        slot,
        activePromptPlayer: activePrompt.player,
        pendingQuestionType: responseMessageType,
      });
      return;
    }

    if (typeof data === "object") {
      console.log("[tcgcore/ocg] duelSetResponse object", {
        slot,
        pendingQuestionType: responseMessageType,
        activePrompt,
        data,
      });
      clearActivePrompt(game);
      game.ocgapi.duelSetResponse(game.pduel, data);
      console.log("[tcgcore/lifecycle] player responded with object", data);
      await mainProcess(game);
      return;
    }

    const response = buildResponseFromEncodedSelection(
      responseMessageType,
      data,
    );
    if (!response) {
      console.log(
        "Unsupported numeric response for message type",
        responseMessageType,
        data,
      );
      return;
    }

    console.log("[tcgcore/ocg] duelSetResponse encoded", {
      slot,
      pendingQuestionType: responseMessageType,
      activePrompt,
      data,
      response,
    });
    clearActivePrompt(game);
    game.ocgapi.duelSetResponse(game.pduel, response);

    await mainProcess(game);
  }

  return {
    write,
    writeResponse: write,
  };
}

/**
 * Executes the player instance helper used by the controller core module.
 * @param {Object} playerConnection The playerConnection value provides an input used by the controller core module.
 * @param {(string|number)} slot The slot value provides an input used by the controller core module.
 * @param {Object} game The game value provides an input used by the controller core module.
 * @param {Object} settings The settings object supplies the structured input used by the controller core module, including the `masterRule` property.
 * @param {number} settings.masterRule The `masterRule` property supplies structured input used by the controller core module.
 * @returns {Object} Returns the value produced by the controller core module.
 */
function playerInstance(playerConnection, slot, game, settings) {
  const gameBoard = new GameBoard(playerConnection, slot, settings.masterRule),
    responder = new Responser(game, playerConnection, slot);

      /**
   * Executes the preform game action helper used by the controller core module.
   * @param {Object} gameAction The gameAction object supplies the structured input used by the controller core module, including the `type` property.
   * @param {(string|number)} gameAction.type The `type` property supplies structured input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function preformGameAction(gameAction) {
    if (
      gameAction?.type === 5 ||
      gameAction?.type === 11 ||
      gameAction?.type === 10
    ) {
      console.log("[tcgcore/board] preformGameAction", {
        slot,
        type: gameAction?.type,
        gameAction,
      });
    }
    var output = boardController(
      gameBoard,
      slot,
      gameAction,
      responder,
      playerConnection,
    );
    //playerConnection.write(output);
  }

      /**
   * Queues game actions used by the controller core module.
   * @param {Array} gameActions The gameActions value provides an input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function queueGameActions(gameActions) {
    gameActions.forEach(function (gameAction) {
      try {
        preformGameAction(gameAction);
      } catch (e) {
        console.log(e);
      }
    });
  }

  return {
    write: function (data) {
      queueGameActions([data]);
    },
    read: function (message) {
      gameBoard.respond(message);
    },
    getField: function () {
      const view = typeof slot === "number" ? "p" + slot : "spectator";
      console.log(view);
      return gameBoard.getField(view);
    },
  };
}

/**
 * Makes game used by the controller core module.
 * @param {number} pduel The pduel value provides an input used by the controller core module.
 * @param {Object} game The game object supplies the structured input used by the controller core module, including the `start_lp` and `time_limit` properties.
 * @param {number} game.start_lp The `start_lp` property supplies structured input used by the controller core module.
 * @param {number} game.time_limit The `time_limit` property supplies structured input used by the controller core module.
 * @param {Object} ocgapi The ocgapi object supplies the structured input used by the controller core module, including the `duelQuery` and `query_field_count` properties.
 * @param {(string|Function)} ocgapi.duelQuery The `duelQuery` property supplies structured input used by the controller core module.
 * @param {(number|Function)} ocgapi.query_field_count The `query_field_count` property supplies structured input used by the controller core module.
 * @returns {Object} Returns the value produced by the controller core module.
 */
function makeGame(pduel, game, ocgapi) {
  let lastMessage = new Buffer(""),
    last_response = -1,
    time_limit = resolveTimeLimit(game),
    players = [],
    observers = {};
  const live = {};

      /**
   * Sets players used by the controller core module.
   * @param {Array} clients The clients value provides an input used by the controller core module.
   * @param {Array} additionalClients The additionalClients value provides an input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function setPlayers(clients, additionalClients) {
    players = clients;
    observers = additionalClients;
  }

      /**
   * Executes the game tick helper used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function gameTick() {
    time_limit -= 1;
    if (time_limit > 0) {
      setTimeout(gameTick, 1000);
    }
  }

    /**
   * Sends buffer to player used by the controller core module.
   * @param {number} player The player value provides an input used by the controller core module.
   * @param {Object} message The message value provides an input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function sendBufferToPlayer(player, message) {
    lastMessage = message;
    sendDirectToPlayer(player, message);
  }

    /**
   * Sends direct message to player used by the controller core module.
   * @param {number} player The player value provides an input used by the controller core module.
   * @param {Object} message The message value provides an input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function sendDirectToPlayer(player, message) {
    if (!players[player]) {
      console.log("unknown player", player, message);
      return;
    }
    players[player].write(message);
  }

    /**
   * Executes the re send to player helper used by the controller core module.
   * @param {number} player The player value provides an input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function reSendToPlayer(player) {
    const slot = Math.abs(Boolean(player));

    if (live.activePrompt?.normalizedMessage) {
      const waitingTime = Math.max(
        0,
        typeof live.getTimeLimit === "function"
          ? Number(live.getTimeLimit())
          : Number(time_limit || 0),
      );
      const message =
        live.activePrompt.player === slot
          ? promptMessageForPlayer(live.activePrompt)
          : {
              type: OcgMessageType.WAITING,
              time: waitingTime,
            };

      sendDirectToPlayer(slot, message);
      return;
    }

    sendDirectToPlayer(slot, lastMessage);
  }

    /**
   * Executes the retry helper used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function retry() {
    players[last_response].write({
      type: OcgMessageType.RETRY,
    });
  }

      /**
   * Executes the last helper used by the controller core module.
   * @param {number} player The player value provides an input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function last(player) {
    if (typeof player === "number") {
      last_response = player;
    }
  }

      /**
   * Executes the respond helper used by the controller core module.
   * @param {Object} message The message value provides an input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function respond(message) {
    players.forEach(function (player) {
      player.read(message);
    });
  }

    /**
   * Executes the waitfor response helper used by the controller core module.
   * @param {number} player The player value provides an input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function waitforResponse(player) {
    last_response = player;
    sendWaitingState(
      {
        sendBufferToPlayer,
        time_limit,
      },
      player,
    );
  }

    /**
   * Sends to observers used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function sendToObservers(message = lastMessage) {
    const observerMessage =
      message === lastMessage && live.activePrompt?.normalizedMessage
        ? promptMessageForObservers(live.activePrompt)
        : message;

    observers.write(observerMessage);
  }

      /**
   * Starts ing info used by the controller core module.
   * @returns {Object} Returns the value produced by the controller core module.
   */
  function startingInfo() {
    const startLp = resolveStartingLp(game);
    return {
      type: OcgMessageType.START,
      lifepoints1: startLp,
      lifepoints2: startLp,
      player1decksize: ocgapi.query_field_count(pduel, 0, 0x1),
      player1extrasize: ocgapi.query_field_count(pduel, 0, 0x40),
      player2decksize: ocgapi.query_field_count(pduel, 1, 0x1),
      player2extrasize: ocgapi.query_field_count(pduel, 1, 0x40),
    };
  }

    /**
   * Sends start info used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function sendStartInfo() {
    console.log("sending start info");
    const info = startingInfo();
    sendBufferToPlayer(0, info);
    sendBufferToPlayer(1, info);
    observers.write(info);

    sendBufferToPlayer(0, {
      duelAction: "announcement",
      message: {
        command: "MSG_ORIENTATION",
        slot: 0,
      },
    });

    sendBufferToPlayer(1, {
      duelAction: "announcement",
      message: {
        command: "MSG_ORIENTATION",
        slot: 1,
      },
    });

    sendBufferToPlayer(0, {
      duelAction: "announcement",
      message: {
        command: "MSG_OPPONENT_TURN",
        active: false,
      },
    });

    sendBufferToPlayer(1, {
      duelAction: "announcement",
      message: {
        command: "MSG_OPPONENT_TURN",
        active: false,
      },
    });
  }

      /**
   * Executes the msg update data helper used by the controller core module.
   * @param {number} player The player value provides an input used by the controller core module.
   * @param {string} location The location value provides an input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function msg_update_data(player, location) {
    const count = ocgapi.query_field_count(pduel, player, location),
      cards = [],
      message = {};
    for (let index = 0; count > index; ++index) {
      const query = ocgapi.duelQuery(pduel, {
        flags:
          OcgQueryFlags.CODE | OcgQueryFlags.POSITION | OcgQueryFlags.IS_PUBLIC,
        controller: player,
        location,
        sequence: index,
        overlaySequence: 0,
      });

      cards.push({
        player,
        location: enums.locations[location],
        index,
        position: browserPositionName(query && query.position, location),
        id: query && query.code ? query.code : "unknown",
        isPublic: Boolean(query && query.isPublic),
      });
    }
    message.type = OcgMessageType.UPDATE_DATA;
    message.location = enums.locations[location];
    message.cards = cards;
    sendBufferToPlayer(0, message);
    sendBufferToPlayer(1, message);
    sendToObservers();
  }

      /**
   * Executes the refresh helper used by the controller core module.
   * @param {number} player The player value provides an input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function refresh(player) {
    msg_update_data(player, LOCATION_EXTRA);
    msg_update_data(player, LOCATION_GRAVE);
    msg_update_data(player, LOCATION_MZONE);
    msg_update_data(player, LOCATION_SZONE);
    msg_update_data(player, LOCATION_HAND);
  }

      /**
   * Executes the refresh all helper used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function refreshAll() {
    refresh(0);
    refresh(1);
  }

      /**
   * Executes the refresh single helper used by the controller core module.
   * @param {number} player The player value provides an input used by the controller core module.
   * @param {string} location The location value provides an input used by the controller core module.
   * @param {number} index The index value provides an input used by the controller core module.
   * @param {number} flag The flag value provides an input used by the controller core module.
   * @returns {void} Does not return a value.
   */
  function refreshSingle(player, location, index, flag = 0x834333) {
    const query = ocgapi.duelQuery(pduel, {
      flags:
        OcgQueryFlags.CODE | OcgQueryFlags.POSITION | OcgQueryFlags.IS_PUBLIC,
      controller: player,
      location,
      sequence: index,
      overlaySequence: 0,
    });

    var message = {
      type: OcgMessageType.UPDATE_CARD,
      card: {
        player,
        location: enums.locations[location],
        index,
        position: browserPositionName(query && query.position, location),
        id: query && query.code ? query.code : "unknown",
        isPublic: Boolean(query && query.isPublic),
      },
    };
    sendBufferToPlayer(player, message);
    reSendToPlayer(1 - player);
    sendToObservers();
  }

      /**
   * Gets turn player used by the controller core module.
   * @returns {number} Returns the value produced by the controller core module.
   */
  function getTurnPlayer() {
    return last_response;
  }

  gameTick();

  return Object.assign(live, {
    sendStartInfo,
    refresh,
    refreshAll,
    refreshSingle,
    respond,
    last,
    retry,
    setPlayers,
    waitforResponse,
    sendBufferToPlayer,
    reSendToPlayer,
    sendToObservers,
    getTurnPlayer,
    getTimeLimit() {
      return time_limit;
    },
    duel_count: 0,
    match_result: [],
    activePrompt: null,
    lastPrompt: null,
    awaitingInteractiveResponse: false,
    bufferedMessages: [],
    mainProcessPromise: null,
    pendingQuestionType: null,
    pduel,
  });
}

/**
 * Executes the duel helper used by the controller core module.
 * @param {Object} game The game object supplies the structured input used by the controller core module, including the `draw_count`, `masterRule`, `start_hand_count`, and `start_lp` properties.
 * @param {number} game.draw_count The `draw_count` property supplies structured input used by the controller core module.
 * @param {number} game.masterRule The `masterRule` property supplies structured input used by the controller core module.
 * @param {number} game.start_hand_count The `start_hand_count` property supplies structured input used by the controller core module.
 * @param {number} game.start_lp The `start_lp` property supplies structured input used by the controller core module.
 * @param {Object} state The state value provides an input used by the controller core module.
 * @param {Function} errorHandler The errorHandler value provides an input used by the controller core module.
 * @param {Array} players The players array supplies the ordered values used by the controller core module, each item uses the `extra` and `main` properties.
 * @param {Array} players[].extra The `[].extra` property describes data read from each item used by the controller core module.
 * @param {Array} players[].main The `[].main` property describes data read from each item used by the controller core module.
 * @param {Object} spectators The spectators value provides an input used by the controller core module.
 * @returns {Object} Returns the value produced by the controller core module.
 */
function duel(game, state, errorHandler, players, spectators) {
  const instance = {
    _respond: function () {},
    _getField: function () {},
            /**
     * Executes the respond helper used by the controller core module.
     * @param {Object} message The message value provides an input used by the controller core module.
     * @returns {Object} Returns the value produced by the controller core module.
     */
    respond(message) {
      return instance._respond(message);
    },
            /**
     * Gets field used by the controller core module.
     * @param {Object} client The client value provides an input used by the controller core module.
     * @returns {Object} Returns the value produced by the controller core module.
     */
    getField(client) {
      return instance._getField(client);
    },
  };

  (async function boot() {
    try {
      console.log("booting duel with settings", game);
      const core = await getCore(),
        scriptCache = {},
        startLp = resolveStartingLp(game),
        startingDrawCount = resolveStartingDrawCount(game),
        drawCountPerTurn = resolveDrawCountPerTurn(game);
      console.log(startLp, startingDrawCount, drawCountPerTurn);
      const ocgapi = {
        create_duel: async function () {
          const handle = await core.createDuel({
            flags:
              game.masterRule === 4
                ? OcgDuelMode.MODE_MR4
                : OcgDuelMode.MODE_MR5,
            seed: seedArray(),
            team1: {
              startingLP: startLp,
              startingDrawCount,
              drawCountPerTurn,
            },
            team2: {
              startingLP: startLp,
              startingDrawCount,
              drawCountPerTurn,
            },
            cardReader: readCardData,
            scriptReader: function (scriptname) {
              console.log("requesting script", scriptname);
              return readScriptSource(scriptCache, scriptname);
            },
            errorHandler: function (type, text) {
              errorHandler(text || String(type));
            },
          });
          preloadStartupScripts(core, handle, scriptCache);
          return handle;
        },
        start_duel: (handle) => core.startDuel(handle),
        duelProcess: (handle) => core.duelProcess(handle),
        duelGetMessage: (handle) => core.duelGetMessage(handle),
        duelSetResponse: (handle, response) =>
          core.duelSetResponse(handle, response),
        query_field_count: (handle, player, location) =>
          core.duelQueryCount(handle, player, location),
        duelQuery: (handle, query) => core.duelQuery(handle, query),
        duelQueryLocation: (handle, query) =>
          core.duelQueryLocation(handle, query),
      };

      const pduel = await ocgapi.create_duel();
      if (!pduel) {
        throw new Error("Failed to create duel with ocgcore");
      }

      console.log("duel created, setting up cards");
      for (const cardID of players[0].main) {
        await core.duelNewCard(pduel, {
          code: cardID,
          team: 0,
          duelist: 0,
          controller: 0,
          location: OcgLocation.DECK,
          sequence: 0,
          position: OcgPosition.FACEDOWN_DEFENSE,
        });
      }
      for (const cardID of players[0].extra) {
        await core.duelNewCard(pduel, {
          code: cardID,
          team: 0,
          duelist: 0,
          controller: 0,
          location: OcgLocation.EXTRA,
          sequence: 0,
          position: OcgPosition.FACEDOWN_DEFENSE,
        });
      }
      for (const cardID of players[1].main) {
        await core.duelNewCard(pduel, {
          code: cardID,
          team: 1,
          duelist: 0,
          controller: 1,
          location: OcgLocation.DECK,
          sequence: 0,
          position: OcgPosition.FACEDOWN_DEFENSE,
        });
      }
      for (const cardID of players[1].extra) {
        await core.duelNewCard(pduel, {
          code: cardID,
          team: 1,
          duelist: 0,
          controller: 1,
          location: OcgLocation.EXTRA,
          sequence: 0,
          position: OcgPosition.FACEDOWN_DEFENSE,
        });
      }

      const live = makeGame(pduel, game, ocgapi),
        playerConnections = players.map(function (playerConnection, slot) {
          return playerInstance(playerConnection, slot, live, game);
        }),
        observers = playerInstance(spectators, "spectator", live, game);

      live.setPlayers(playerConnections, observers);
      console.log("sending start info and starting duel");
      live.sendStartInfo();
      live.refresh(0);
      live.refresh(1);
      await ocgapi.start_duel(pduel);

      live.getField = function (client) {
        const slot = client.slot;
        if (client.slot === 0 || client.slot === 1) {
          client.write(playerConnections[slot].getField());
        }
        if (live.activePrompt || live.getTurnPlayer() === client.slot) {
          live.reSendToPlayer(slot);
        }
        spectators.write(observers.getField());
        if (live.activePrompt) {
          live.sendToObservers();
        }
      };
      live.ocgapi = ocgapi;

      instance._respond = live.respond;
      instance._getField = live.getField;
      process.instance = live;
      console.log("duel started, first cycle beginning");
      
      await mainProcess(live);
    } catch (error) {
      console.log(error);
      errorHandler(error.message || String(error));
    }
  })();

  return instance;
}

module.exports = {
  duel: duel,
  normalizeMessage,
};

module.exports.configurations = {
  normal: {
    priority: false,
    timeLimitSeconds: 300,
    shuffleDeck: true,
    team1: {
      drawCountPerTurn: 1,
      startingDrawCount: 5,
      startingLP: 8000,
    },
    team2: {
      drawCountPerTurn: 1,
      startingDrawCount: 5,
      startingLP: 8000,
    },
  },
};

module.exports.__testHooks = {
  setOcgBindingsForTest(bindings = {}) {
    if (bindings.OcgMessageType !== undefined) {
      OcgMessageType = bindings.OcgMessageType;
    }
    if (bindings.OcgPosition !== undefined) {
      OcgPosition = bindings.OcgPosition;
    }
    if (bindings.OcgQueryFlags !== undefined) {
      OcgQueryFlags = bindings.OcgQueryFlags;
    }
    if (bindings.OcgProcessResult !== undefined) {
      OcgProcessResult = bindings.OcgProcessResult;
    }
    if (bindings.OcgResponseType !== undefined) {
      OcgResponseType = bindings.OcgResponseType;
    }
  },
  ControllerProcessResult,
  mainProcessForTest(game) {
    return mainProcess(game);
  },
  dispatchCoreMessageForTest(game, rawMessage) {
    return dispatchCoreMessage(game, rawMessage);
  },
  createResponserForTest(game, slot = 0) {
    return Responser(game, null, slot);
  },
  makeGameForTest(pduel, game, ocgapi) {
    return makeGame(pduel, game, ocgapi);
  },
  resolveStartingLpForTest(game) {
    return resolveStartingLp(game);
  },
  resolveTimeLimitForTest(game) {
    return resolveTimeLimit(game);
  },
  hydrateReloadFieldOverlayCardsForTest(message, context = {}) {
    return hydrateReloadFieldOverlayCards(
      message,
      context.pduel,
      context.ocgapi,
    );
  },
  hydrateIdleExtraFieldForTest(message, context = {}) {
    return hydrateIdleExtraField(
      message,
      context.pduel,
      context.ocgapi,
    );
  },
  stripPrivateIdleFieldForTest(message) {
    return stripPrivateIdleField(message);
  },
};
