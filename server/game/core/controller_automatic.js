let ResponseType;
let Position;
let MessageType;
let messageTypeNames = {};

const path = require("path");
const uiDatabase = require(
  path.resolve(
    __dirname,
    "../../ui/public/manifest/manifest_0-language-merged.json",
  ),
);
const uiStrings = require(
  path.resolve(__dirname, "../../ui/public/manifest/strings.json"),
);

const DEFAULT_PROMPT_IDS = Object.freeze({
  MSG_SELECT_CARD: 560,
  MSG_SELECT_SUM: 560,
  MSG_SELECT_TRIBUTE: 531,
  MSG_SELECT_DISFIELD: 570,
  MSG_ANNOUNCE_ATTRIB: 562,
  MSG_ANNOUNCE_RACE: 563,
  MSG_ANNOUNCE_CARD: 564,
  MSG_ANNOUNCE_NUMBER: 565,
});

const SELECT_HINT_COMMANDS = new Set([
  "MSG_SELECT_CARD",
  "MSG_SELECT_SUM",
  "MSG_SELECT_TRIBUTE",
  "MSG_SELECT_PLACE",
  "MSG_SELECT_DISFIELD",
  "MSG_ANNOUNCE_ATTRIB",
  "MSG_ANNOUNCE_RACE",
  "MSG_ANNOUNCE_CARD",
  "MSG_ANNOUNCE_NUMBER",
]);

const EVENT_HINT_COMMANDS = new Set([
  "MSG_SELECT_EFFECTYN",
  "MSG_SELECT_YESNO",
  "MSG_SELECT_CHAIN",
]);

const locationCodeMap = Object.freeze({
  DECK: 1,
  HAND: 2,
  MONSTERZONE: 4,
  SPELLZONE: 8,
  GRAVE: 16,
  BANISHED: 32,
  EXTRA: 64,
  OVERLAY: 128,
  FZONE: 256,
  PZONE: 512,
});

const STRING_ID_MASK = 0xfffffn;
const STRING_ID_SHIFT = 20n;

/**
 * Executes the configure ocgcore helper used by the controller automatic module.
 * @param {Object} ocgcore The ocgcore object supplies the structured input used by the controller automatic module, including the `OcgMessageType`, `OcgPosition`, and `OcgResponseType` properties.
 * @param {string} ocgcore.OcgMessageType The `OcgMessageType` property supplies structured input used by the controller automatic module.
 * @param {Object} ocgcore.OcgPosition The `OcgPosition` property supplies structured input used by the controller automatic module.
 * @param {string} ocgcore.OcgResponseType The `OcgResponseType` property supplies structured input used by the controller automatic module.
 * @returns {void} Does not return a value.
 */
function configureOcgcore(ocgcore) {
  ResponseType = ocgcore?.OcgResponseType;
  Position = ocgcore?.OcgPosition;
  MessageType = ocgcore?.OcgMessageType;
  messageTypeNames = Object.fromEntries(
    Object.entries(MessageType || {}).map(([name, value]) => [value, name]),
  );
}

function normalizeMessageCommandName(name) {
  if (typeof name !== "string" || !name.length) {
    return undefined;
  }
  return name.startsWith("MSG_") ? name : `MSG_${name}`;
}

function resolveMessageCommand(message) {
  if (typeof message?.command === "string" && message.command.length) {
    return normalizeMessageCommandName(message.command);
  }
  return normalizeMessageCommandName(messageTypeNames[message?.type]);
}

function getSystemStrings(strings = uiStrings) {
  if (!strings || typeof strings !== "object") {
    return {};
  }
  return strings.system && typeof strings.system === "object"
    ? strings.system
    : strings;
}

function normalizeHintType(hintType) {
  if (typeof hintType !== "string") {
    return undefined;
  }
  if (hintType.startsWith("HINT_")) {
    return hintType;
  }
  const normalized = hintType.trim().toUpperCase();
  return normalized ? `HINT_${normalized}` : undefined;
}

function toHintBigInt(value) {
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

function toHintKey(value) {
  const numeric = toHintBigInt(value);
  if (numeric !== null) {
    return numeric.toString();
  }
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return null;
}

function resolveSystemString(value, strings = uiStrings) {
  const key = toHintKey(value);
  if (!key) {
    return null;
  }
  const text = getSystemStrings(strings)[key];
  return typeof text === "string" && text.trim() ? text : null;
}

function decodeCardStringId(value) {
  const numeric = toHintBigInt(value);
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

function resolveDatabaseCardById(value, database = uiDatabase) {
  const key = toHintKey(value);
  if (!key || !Array.isArray(database)) {
    return null;
  }
  return database.find((entry) => String(entry?.id) === key) || null;
}

function resolveCardString(value, database = uiDatabase) {
  const decoded = decodeCardStringId(value);
  if (!decoded) {
    return null;
  }

  const card = Array.isArray(database)
      ? database.find((entry) => Number(entry?.id) === decoded.cardId)
      : null,
    text = card?.[`str${decoded.stringIndex}`];

  return typeof text === "string" && text.trim() ? text : null;
}

function resolveCardName(value, database = uiDatabase) {
  const card = resolveDatabaseCardById(value, database);
  return typeof card?.name === "string" && card.name.trim() ? card.name : null;
}

function resolveHintText(value, database = uiDatabase, strings = uiStrings) {
  return (
    resolveSystemString(value, strings) ||
    resolveCardString(value, database) ||
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

function createUiHintState() {
  return {
    selectHint: null,
    eventHint: null,
    lastHint: null,
  };
}

function getUiHintState(gameBoard) {
  if (!gameBoard.__uiHintState) {
    gameBoard.__uiHintState = createUiHintState();
  }
  return gameBoard.__uiHintState;
}

function applyUiHintMessage(gameBoard, message) {
  const nextState = {
      ...createUiHintState(),
      ...getUiHintState(gameBoard),
    },
    hintType = normalizeHintType(message?.hint_type),
    hintValue = message?.hint ?? null;

  if (!hintType) {
    gameBoard.__uiHintState = nextState;
    return nextState;
  }

  nextState.lastHint = {
    type: hintType,
    hint: hintValue,
    player: Number(message?.player ?? 0),
  };

  if (hintType === "HINT_SELECTMSG") {
    nextState.selectHint = hintValue;
  } else if (hintType === "HINT_EVENT") {
    nextState.eventHint = hintValue;
  }

  gameBoard.__uiHintState = nextState;
  return nextState;
}

function resolveSelectPlacePrompt(selectHint) {
  const hintedCardName = resolveCardName(selectHint);
  if (hintedCardName) {
    return formatSystemString(resolveSystemString(569), [hintedCardName]);
  }
  return resolveHintText(selectHint);
}

function joinPromptLines(lines) {
  return (Array.isArray(lines) ? lines : [])
    .map((line) => (typeof line === "string" ? line.trim() : ""))
    .filter(Boolean)
    .join("\n");
}

function resolveQuestionDescriptionText(message) {
  if (
    typeof message?.description_text === "string" &&
    message.description_text.trim()
  ) {
    return message.description_text.trim();
  }

  return resolveHintText(message?.description) || null;
}

function resolveQuestionSourceCoordinate(message) {
  const location = normalizeLocation(message?.location);

  if (!location) {
    return null;
  }

  return {
    player: Number.isInteger(message?.player)
      ? message.player
      : Number.isInteger(message?.controller)
        ? message.controller
        : 0,
    location,
    index: Number.isInteger(message?.index)
      ? message.index
      : Number.isInteger(message?.sequence)
        ? message.sequence
        : 0,
  };
}

function formatPromptLocation(source) {
  if (!source || typeof source.location !== "string") {
    return null;
  }

  const index = Number(source.index || 0) + 1;

  switch (source.location) {
    case "MONSTERZONE":
      return `Monster Zone ${index}`;
    case "SPELLZONE":
      return `Spell & Trap Zone ${index}`;
    case "DECK":
      return "Deck";
    case "HAND":
      return "Hand";
    case "GRAVE":
      return "Graveyard";
    case "BANISHED":
      return "Banished Zone";
    case "EXTRA":
      return "Extra Deck";
    case "OVERLAY":
      return `Overlay Unit ${index}`;
    case "FZONE":
      return "Field Zone";
    case "PZONE":
      return `Pendulum Zone ${index}`;
    default:
      return source.location;
  }
}

function resolveQuestionCardName(message) {
  return (
    resolveCardName(message?.code) ||
    resolveCardName(message?.id) ||
    resolveCardName(message?.card?.id) ||
    resolveCardName(message?.card?.code) ||
    null
  );
}

function normalizeAnnouncementCoordinate(query) {
  if (!query || typeof query !== "object") {
    return null;
  }

  const player = Number.isInteger(query.player)
      ? query.player
      : Number.isInteger(query.controller)
        ? query.controller
        : null,
    location =
      typeof query.location === "string"
        ? query.location
        : normalizeLocation(query.location),
    index = Number.isInteger(query.index)
      ? query.index
      : Number.isInteger(query.sequence)
        ? query.sequence
        : null;

  if (!Number.isInteger(player) || typeof location !== "string" || !Number.isInteger(index)) {
    return null;
  }

  const normalized = {
    player,
    location,
    index,
  };

  if (Number.isInteger(query.overlay_sequence)) {
    normalized.overlay_sequence = query.overlay_sequence;
  } else if (Number.isInteger(query.overlayindex) && query.overlayindex > 0) {
    normalized.overlay_sequence = query.overlayindex - 1;
  }

  return normalized;
}

function buildAnnouncementCardList(message) {
  const cards = [],
    seen = new Set(),
    pushCard = (value) => {
      const normalized = normalizeAnnouncementCoordinate(value);

      if (!normalized) {
        return;
      }

      const key = [
        normalized.player,
        normalized.location,
        normalized.index,
        normalized.overlay_sequence ?? "",
      ].join(":");

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      cards.push(normalized);
    };

  pushCard(message?.source || message?.card);
  pushCard(message?.target);

  if (Array.isArray(message?.cards)) {
    message.cards.forEach(pushCard);
  }

  return cards;
}

function formatPromptTemplate(template, replacements) {
  if (typeof template !== "string" || !template.trim()) {
    return null;
  }

  return formatSystemString(template, replacements).trim();
}

function resolveEffectPromptText(gameBoard, message) {
  const currentState = {
      ...createUiHintState(),
      ...getUiHintState(gameBoard),
    },
    eventText = resolveHintText(currentState.eventHint) || "",
    descriptionKey = toHintKey(message?.description),
    descriptionText = resolveQuestionDescriptionText(message),
    cardName = resolveQuestionCardName(message) || "this card",
    locationText =
      formatPromptLocation(resolveQuestionSourceCoordinate(message)) || "the field";

  if (descriptionKey === "0") {
    return joinPromptLines([
      eventText,
      formatPromptTemplate(resolveSystemString(200), [cardName, locationText]),
    ]);
  }

  if (descriptionKey === "221") {
    return joinPromptLines([
      eventText,
      formatPromptTemplate(
        resolveSystemString(221) || descriptionText,
        [cardName, locationText],
      ),
      resolveSystemString(223),
    ]);
  }

  return (
    formatPromptTemplate(descriptionText, [cardName, locationText]) ||
    joinPromptLines([
      eventText,
      formatPromptTemplate(resolveSystemString(200), [cardName, locationText]),
    ])
  );
}

function resolveYesNoPromptText(gameBoard, message) {
  const currentState = {
      ...createUiHintState(),
      ...getUiHintState(gameBoard),
    },
    eventText = resolveHintText(currentState.eventHint) || "",
    descriptionText = resolveQuestionDescriptionText(message),
    cardName = resolveQuestionCardName(message) || "this card",
    locationText =
      formatPromptLocation(resolveQuestionSourceCoordinate(message)) || "the field";

  return (
    formatPromptTemplate(descriptionText, [cardName, locationText]) ||
    eventText
  );
}

function resolveChainPromptText(gameBoard, message) {
  const currentState = {
      ...createUiHintState(),
      ...getUiHintState(gameBoard),
    },
    eventText = resolveHintText(currentState.eventHint) || "",
    count = Number(message?.count || 0),
    specount = Number(message?.specount || 0),
    selectTrigger = Boolean(message?.select_trigger) || specount === 0x7f,
    contiExist = Array.isArray(message?.select_options) &&
      message.select_options.some((option) =>
        Number(option?.client_mode) === 1 || option?.client_mode === "RESOLVE"
      );

  if (Boolean(message?.forced)) {
    return resolveSystemString(contiExist ? 556 : 550) || "";
  }

  if (count === 0) {
    return joinPromptLines([
      resolveSystemString(201),
      resolveSystemString(202),
    ]);
  }

  if (selectTrigger) {
    return joinPromptLines([
      eventText,
      resolveSystemString(222),
      resolveSystemString(223),
    ]);
  }

  return (
    joinPromptLines([eventText, resolveSystemString(203)]) ||
    resolveSystemString(contiExist ? 556 : 550) ||
    ""
  );
}

function resolvePromptTextForQuestion(gameBoard, message, command) {
  if (command === "MSG_SELECT_EFFECTYN") {
    return resolveEffectPromptText(gameBoard, message) || "";
  }

  if (command === "MSG_SELECT_YESNO") {
    return resolveYesNoPromptText(gameBoard, message) || "";
  }

  if (command === "MSG_SELECT_CHAIN") {
    return resolveChainPromptText(gameBoard, message) || "";
  }

  const currentState = {
    ...createUiHintState(),
    ...getUiHintState(gameBoard),
  };

  if (EVENT_HINT_COMMANDS.has(command)) {
    return resolveHintText(currentState.eventHint) || "";
  }

  if (SELECT_HINT_COMMANDS.has(command)) {
    const selectHint = currentState.selectHint;
    currentState.selectHint = null;
    gameBoard.__uiHintState = currentState;

    let promptText = null;
    if (command === "MSG_SELECT_PLACE") {
      promptText = resolveSelectPlacePrompt(selectHint);
    } else {
      promptText = resolveHintText(selectHint);
    }

    if (promptText) {
      return promptText;
    }

    const fallbackId =
      command === "MSG_SELECT_PLACE" ? 560 : DEFAULT_PROMPT_IDS[command];
    return resolveSystemString(fallbackId) || "";
  }

  return resolveSystemString(DEFAULT_PROMPT_IDS[command]) || "";
}

function resolveHintAnnouncementText(message) {
  const hintType = normalizeHintType(message?.hint_type),
    hintText =
      resolveHintText(message?.hint) ||
      resolveCardName(message?.hint) ||
      (message?.hint === undefined || message?.hint === null
        ? null
        : String(message.hint));

  if (!hintText) {
    return null;
  }

  if (hintType === "HINT_MESSAGE") {
    return hintText;
  }

  if (hintType === "HINT_OPSELECTED") {
    return formatPromptTemplate(
      resolveSystemString(Number(message?.player ?? 0) === 0 ? 1510 : 1512),
      [hintText],
    );
  }

  return null;
}

function createUiAnnouncementState() {
  return {
    pendingSummons: {
      MSG_SUMMONING: null,
      MSG_SPSUMMONING: null,
      MSG_FLIPSUMMONING: null,
    },
    currentChain: null,
    chainStack: [],
  };
}

function getUiAnnouncementState(gameBoard) {
  if (!gameBoard.__uiAnnouncementState) {
    gameBoard.__uiAnnouncementState = createUiAnnouncementState();
  }
  return gameBoard.__uiAnnouncementState;
}

function cloneFieldCoordinate(card) {
  if (!card || typeof card !== "object") {
    return null;
  }

  return {
    player: Number(card.player ?? 0),
    location: card.location,
    index: Number(card.index ?? 0),
    overlay_sequence: Number.isInteger(card.overlay_sequence)
      ? card.overlay_sequence
      : undefined,
    overlayindex: Number.isInteger(card.overlayindex)
      ? card.overlayindex
      : undefined,
  };
}

function resolveSummonUiMode(command) {
  switch (command) {
    case "MSG_SUMMONING":
    case "MSG_SUMMONED":
      return "summon";
    case "MSG_SPSUMMONING":
    case "MSG_SPSUMMONED":
      return "special_summon";
    case "MSG_FLIPSUMMONING":
    case "MSG_FLIPSUMMONED":
      return "flip_summon";
    default:
      return "summon";
  }
}

function resolveSummonUiSound(command) {
  switch (command) {
    case "MSG_SUMMONING":
      return "summon";
    case "MSG_SPSUMMONING":
      return "specialsummon";
    case "MSG_FLIPSUMMONING":
      return "flip";
    default:
      return null;
  }
}

function rememberPendingSummon(gameBoard, command, message) {
  const state = getUiAnnouncementState(gameBoard),
    stored = {
      mode: resolveSummonUiMode(command),
      sound: resolveSummonUiSound(command),
      id:
        message?.id ||
        message?.source?.id ||
        message?.source?.code ||
        message?.attacker?.id ||
        message?.attacker?.code ||
        null,
      source: cloneFieldCoordinate(message?.source || message),
    };

  if (state.pendingSummons[command] !== undefined) {
    state.pendingSummons[command] = stored;
  }

  return stored;
}

function resolveCompletedSummon(gameBoard, command, message) {
  const state = getUiAnnouncementState(gameBoard),
    commandMap = {
      MSG_SUMMONED: "MSG_SUMMONING",
      MSG_SPSUMMONED: "MSG_SPSUMMONING",
      MSG_FLIPSUMMONED: "MSG_FLIPSUMMONING",
    },
    pendingKey = commandMap[command],
    stored =
      (pendingKey && state.pendingSummons[pendingKey]) ||
      rememberPendingSummon(gameBoard, command, message);

  return stored;
}

function rememberCurrentChain(gameBoard, message) {
  const state = getUiAnnouncementState(gameBoard),
    chainIndex = Number(message?.chain_size || 0),
    currentChain = {
      chainIndex,
      id: message?.id || message?.code || null,
      source: cloneFieldCoordinate(message?.source || message),
    };

  state.currentChain = currentChain;
  return currentChain;
}

function rememberCurrentChainTargets(gameBoard, cards) {
  const state = getUiAnnouncementState(gameBoard),
    targets = (Array.isArray(cards) ? cards : [])
      .map(cloneFieldCoordinate)
      .filter(Boolean);

  if (!state.currentChain || !targets.length) {
    return targets;
  }

  state.currentChain.targets = targets;

  const queued = findQueuedChain(gameBoard, state.currentChain.chainIndex);
  if (queued) {
    queued.targets = targets.map(cloneFieldCoordinate).filter(Boolean);
  }

  return targets;
}

function upsertQueuedChain(gameBoard, entry) {
  const state = getUiAnnouncementState(gameBoard);
  if (!entry || !Number.isInteger(entry.chainIndex) || entry.chainIndex <= 0) {
    return null;
  }

  const existingIndex = state.chainStack.findIndex(
    (chain) => chain?.chainIndex === entry.chainIndex,
  );

  if (existingIndex >= 0) {
    state.chainStack[existingIndex] = Object.assign(
      {},
      state.chainStack[existingIndex],
      entry,
    );
    return state.chainStack[existingIndex];
  }

  state.chainStack.push(Object.assign({}, entry));
  return state.chainStack[state.chainStack.length - 1];
}

function findQueuedChain(gameBoard, chainIndex) {
  const state = getUiAnnouncementState(gameBoard);
  return (
    state.chainStack.find((chain) => chain?.chainIndex === Number(chainIndex)) ||
    null
  );
}

function updateQueuedChain(gameBoard, chainIndex, changes = {}) {
  const existing = findQueuedChain(gameBoard, chainIndex);
  if (!existing) {
    return null;
  }

  Object.assign(existing, changes);
  return existing;
}

function clearQueuedChains(gameBoard) {
  const state = getUiAnnouncementState(gameBoard);
  state.currentChain = null;
  state.chainStack = [];
}

function pushUniqueAnnouncementCard(cards, seen, value) {
  const normalized = normalizeAnnouncementCoordinate(value);

  if (!normalized) {
    return;
  }

  const key = [
    normalized.player,
    normalized.location,
    normalized.index,
    normalized.overlay_sequence ?? "",
  ].join(":");

  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  cards.push(normalized);
}

function buildChainContextCards(gameBoard, message) {
  const directCards = buildAnnouncementCardList(message);

  if (directCards.length) {
    return directCards;
  }

  const state = getUiAnnouncementState(gameBoard),
    cards = [],
    seen = new Set(),
    pushChainCards = (chain) => {
      if (!chain || typeof chain !== "object") {
        return;
      }

      pushUniqueAnnouncementCard(cards, seen, chain.source);
      (Array.isArray(chain.targets) ? chain.targets : []).forEach((target) => {
        pushUniqueAnnouncementCard(cards, seen, target);
      });
    };

  pushChainCards(state.currentChain);
  if (state.chainStack.length) {
    pushChainCards(state.chainStack[state.chainStack.length - 1]);
  }

  return cards;
}

function enrichAnnouncementMessage(gameBoard, message, command) {
  if (
    command !== "MSG_BE_CHAIN_TARGET" &&
    command !== "MSG_CREATE_RELATION" &&
    command !== "MSG_RELEASE_RELATION"
  ) {
    return message;
  }

  const cards = buildChainContextCards(gameBoard, message);

  if (!cards.length) {
    return message;
  }

  const hasExplicitCards = buildAnnouncementCardList(message).length > 0;

  return Object.assign({}, message, {
    source: message?.source || message?.card || cards[0],
    cards,
    protocol_inferred: !hasExplicitCards,
  });
}

function normalizeLocationCode(location) {
  if (typeof location === "string") {
    return locationCodeMap[location] ?? location;
  }
  return location;
}

function normalizeLocation(location) {
  if (typeof location === "string") {
    return location;
  }
  return {
    0x01: "DECK",
    0x02: "HAND",
    0x04: "MONSTERZONE",
    0x08: "SPELLZONE",
    0x10: "GRAVE",
    0x20: "BANISHED",
    0x40: "EXTRA",
    0x80: "OVERLAY",
    0x100: "FZONE",
    0x200: "PZONE",
  }[location] || location;
}

function normalizeCommandOption(option) {
  if (!option || typeof option !== "object") {
    return option;
  }

  return Object.assign({}, option, {
    id: option.id ?? option.code,
    player: option.player ?? option.controller,
    index: option.index ?? option.sequence,
    location: typeof option.location === "string"
      ? option.location
      : normalizeLocation(option.location),
  });
}

function buildZoneSelection(cards) {
  if (!Array.isArray(cards) || !cards.length) {
    return null;
  }

  const zones = cards.filter((card) =>
    card &&
    (card.location === "MONSTERZONE" || card.location === "SPELLZONE") &&
    !Number.isInteger(card.overlay_sequence) &&
    !(Number.isInteger(card.overlayindex) && card.overlayindex > 0) &&
    Number.isInteger(card.player) &&
    Number.isInteger(card.index),
  ).map((card) => ({
    player: card.player,
    location: card.location,
    index: card.index,
  }));

  return zones.length === cards.length ? { zones } : null;
}

function buildSelectOptionRows(options) {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((option, index) => {
    const value = option?.value ?? option,
      label =
        resolveHintText(value) ||
        resolveCardName(value) ||
        (typeof value === "string" ? value : `Option ${index + 1}`);

    return {
      i: Number(option?.i ?? index),
      value,
      label,
    };
  });
}

function normalizeViewerSlot(slot) {
  const normalized = Number(slot);

  return normalized === 0 || normalized === 1 ? normalized : 0;
}

function orientPlayerForSlot(player, slot) {
  const normalizedSlot = normalizeViewerSlot(slot),
    normalizedPlayer = Number(player);

  if (normalizedSlot !== 1 || (normalizedPlayer !== 0 && normalizedPlayer !== 1)) {
    return player;
  }

  return normalizedPlayer === 0 ? 1 : 0;
}

function orientFieldCoordinateForSlot(card, slot) {
  if (!card || typeof card !== "object") {
    return card;
  }

  const output = Object.assign({}, card);

  if (Number.isInteger(output.player)) {
    output.player = orientPlayerForSlot(output.player, slot);
  }

  if (Number.isInteger(output.controller)) {
    output.controller = orientPlayerForSlot(output.controller, slot);
  }

  if (Number.isInteger(output.previousController)) {
    output.previousController = orientPlayerForSlot(
      output.previousController,
      slot,
    );
  }

  if (Number.isInteger(output.currentController)) {
    output.currentController = orientPlayerForSlot(output.currentController, slot);
  }

  return output;
}

function orientFieldCoordinateListForSlot(cards, slot) {
  return Array.isArray(cards)
    ? cards.map((card) => orientFieldCoordinateForSlot(card, slot))
    : [];
}

function orientZoneSelectionForSlot(zoneSelection, slot) {
  if (!zoneSelection || typeof zoneSelection !== "object") {
    return zoneSelection;
  }

  return Object.assign({}, zoneSelection, {
    zones: orientFieldCoordinateListForSlot(zoneSelection.zones, slot),
  });
}

function orientQuestionPayloadForSlot(question, slot) {
  if (!question || typeof question !== "object") {
    return question;
  }

  const output = Object.assign({}, question),
    coordinateListKeys = [
      "summonable_cards",
      "summons",
      "spsummonable_cards",
      "special_summons",
      "repositionable_cards",
      "pos_changes",
      "msetable_cards",
      "monster_sets",
      "ssetable_cards",
      "spell_sets",
      "activatable_cards",
      "activates",
      "select_options",
      "attackable_cards",
      "attacks",
      "chains",
      "selectable_targets",
      "reveal_cards",
      "secondary_reveal_cards",
      "counter_targets",
      "must_select",
      "can_select",
      "cards1",
      "cards2",
      "chain_choices",
      "zones",
    ];

  if (Number.isInteger(output.player)) {
    output.player = orientPlayerForSlot(output.player, slot);
  }

  coordinateListKeys.forEach((key) => {
    if (Array.isArray(output[key])) {
      output[key] = orientFieldCoordinateListForSlot(output[key], slot);
    }
  });

  if (output.zone_selection) {
    output.zone_selection = orientZoneSelectionForSlot(output.zone_selection, slot);
  }

  return output;
}

function orientUiContractForSlot(contract, slot) {
  if (!contract || typeof contract !== "object") {
    return contract;
  }

  const output = Object.assign({}, contract);

  if (Number.isInteger(output.player)) {
    output.player = orientPlayerForSlot(output.player, slot);
  }

  if (Array.isArray(output.players)) {
    output.players = output.players.map((player) => orientPlayerForSlot(player, slot));
  }

  if (output.source) {
    output.source = orientFieldCoordinateForSlot(output.source, slot);
  }

  if (output.target) {
    output.target = Array.isArray(output.target)
      ? orientFieldCoordinateListForSlot(output.target, slot)
      : orientFieldCoordinateForSlot(output.target, slot);
  }

  if (Array.isArray(output.cards)) {
    output.cards = orientFieldCoordinateListForSlot(output.cards, slot);
  }

  if (Array.isArray(output.zones)) {
    output.zones = orientFieldCoordinateListForSlot(output.zones, slot);
  }

  return output;
}

function normalizeControlQuestion(message, command) {
  const normalized = Object.assign({}, message);
  if (
    command !== "MSG_SELECT_IDLECMD" &&
    command !== "MSG_SELECT_BATTLECMD"
  ) {
    return normalized;
  }

  [
    "summonable_cards",
    "summons",
    "spsummonable_cards",
    "special_summons",
    "repositionable_cards",
    "pos_changes",
    "msetable_cards",
    "monster_sets",
    "ssetable_cards",
    "spell_sets",
    "activatable_cards",
    "activates",
    "select_options",
    "attackable_cards",
    "attacks",
    "chains",
  ].forEach((key) => {
    if (Array.isArray(normalized[key])) {
      normalized[key] = normalized[key].map(normalizeCommandOption);
    }
  });

  normalized.enableBattlePhase =
    normalized.enableBattlePhase ?? normalized.to_bp ?? false;
  normalized.enableMainPhase2 =
    normalized.enableMainPhase2 ?? normalized.to_m2 ?? false;
  normalized.enableEndPhase =
    normalized.enableEndPhase ?? normalized.to_ep ?? false;

  return normalized;
}

function normalizeQuestionPayload(gameBoard, message, command, slot = gameBoard?.slot) {
  const normalized = normalizeControlQuestion(Object.assign({}, message, {
      command,
    }), command),
    revealCards =
      normalized.reveal_cards ||
      normalized.selectable_targets ||
      normalized.select_options ||
      null;

  if (command === "MSG_SELECT_OPTION") {
    normalized.option_rows = buildSelectOptionRows(normalized.select_options);
  }

  if (
    command === "MSG_SELECT_PLACE" ||
    command === "MSG_SELECT_DISFIELD"
  ) {
    normalized.zone_selection = normalized.zone_selection || {
      zones: Array.isArray(normalized.zones) ? normalized.zones : [],
    };
  }

  if (
    command === "MSG_SELECT_CARD" ||
    command === "MSG_SELECT_TRIBUTE" ||
    command === "MSG_CONFIRM_CARDS" ||
    command === "MSG_CONFIRM_DECKTOP" ||
    command === "MSG_CONFIRM_EXTRATOP" ||
    command === "MSG_SORT_CARD" ||
    command === "MSG_SORT_CHAIN"
  ) {
    normalized.reveal_cards = Array.isArray(revealCards) ? revealCards : [];
    normalized.zone_selection =
      normalized.zone_selection || buildZoneSelection(normalized.reveal_cards);
  }

  if (command === "MSG_SELECT_UNSELECT_CARD") {
    normalized.reveal_cards = Array.isArray(normalized.cards1)
      ? normalized.cards1
      : [];
    normalized.secondary_reveal_cards = Array.isArray(normalized.cards2)
      ? normalized.cards2
      : [];
  }

  if (command === "MSG_SELECT_SUM") {
    normalized.reveal_cards = []
      .concat(Array.isArray(normalized.must_select) ? normalized.must_select : [])
      .concat(Array.isArray(normalized.can_select) ? normalized.can_select : []);
    normalized.zone_selection =
      normalized.zone_selection || buildZoneSelection(normalized.reveal_cards);
  }

  if (command === "MSG_SELECT_COUNTER") {
    normalized.reveal_cards = Array.isArray(normalized.counter_targets)
      ? normalized.counter_targets
      : [];
  }

  if (command === "MSG_SELECT_CHAIN") {
    normalized.chain_choices = Array.isArray(normalized.select_options)
      ? normalized.select_options
      : [];
    normalized.select_trigger =
      Boolean(normalized.select_trigger) ||
      Number(normalized.specount || 0) === 0x7f;
  }

  if (
    command === "MSG_ANNOUNCE_ATTRIB" ||
    command === "MSG_ANNOUNCE_RACE" ||
    command === "MSG_ANNOUNCE_NUMBER"
  ) {
    normalized.announcement_values =
      normalized.announcement_values ||
      normalized.options ||
      normalized.values ||
      {};
  }

  normalized.prompt_text = resolvePromptTextForQuestion(
    gameBoard,
    normalized,
    command,
  );
  return orientQuestionPayloadForSlot(normalized, slot);
}

function resolveUiAnnouncement(gameBoard, message) {
  const command = resolveMessageCommand(message);

  switch (command) {
    case "MSG_HINT": {
      const text = resolveHintAnnouncementText(message);
      return text
        ? {
            kind: "hint",
            text,
            hintType: normalizeHintType(message?.hint_type),
          }
        : null;
    }
    case "MSG_AI_NAME": {
      const aiName =
        (typeof message?.ai_name === "string" && message.ai_name) ||
        (typeof message?.name === "string" && message.name) ||
        (typeof message?.opponent_name === "string" && message.opponent_name) ||
        "AI";

      return {
        kind: "lobby_metadata",
        aiName,
        opponentName: aiName,
      };
    }
    case "MSG_SHOW_HINT":
      return {
        kind: "notice",
        text:
          (typeof message?.text === "string" && message.text) ||
          (typeof message?.hint === "string" && message.hint) ||
          "",
        duration: 1800,
        log: true,
        logLabel: "MSG_SHOW_HINT",
      };
    case "MSG_CUSTOM_MSG":
      return {
        kind: "notice",
        text:
          (typeof message?.text === "string" && message.text) ||
          "Custom duel message received.",
        duration: 1800,
        log: true,
        logLabel: "MSG_CUSTOM_MSG",
      };
    case "MSG_MATCH_KILL":
      return {
        kind: "notice",
        text:
          (typeof message?.text === "string" && message.text) ||
          "Match kill effect registered",
        duration: 1600,
        log: true,
        logLabel: "MSG_MATCH_KILL",
      };
    case "MSG_NEW_TURN":
      return {
        kind: "phase_banner",
        bannerType: "turn",
        text: `Turn ${Number(gameBoard?.state?.turn || message?.turn || 0)}`,
        duration: 1400,
      };
    case "MSG_NEW_PHASE":
      return {
        kind: "phase_banner",
        bannerType: "phase",
        text: resolvePhaseBannerText(message?.gui_phase ?? gameBoard?.state?.phase),
        duration: 1400,
      };
    case "MSG_ORIENTATION":
      return {
        kind: "orientation",
        slot: message.slot,
      };
    case "MSG_OPPONENT_TURN":
      return {
        kind: "opponent_turn",
        active: Boolean(message.active),
      };
    case "MSG_WAITING":
      return {
        kind: "waiting",
      };
    case "MSG_SUMMONING":
    case "MSG_SPSUMMONING":
    case "MSG_FLIPSUMMONING": {
      const summon = rememberPendingSummon(gameBoard, command, message);
      return {
        kind: "flash",
        mode: summon?.mode || resolveSummonUiMode(command),
        phase: "start",
        id: summon?.id,
        source: summon?.source || null,
        sound: summon?.sound || undefined,
      };
    }
    case "MSG_SUMMONED":
    case "MSG_SPSUMMONED":
    case "MSG_FLIPSUMMONED": {
      const summon = resolveCompletedSummon(gameBoard, command, message);
      return summon?.id
        ? {
            kind: "flash",
            mode: summon.mode || resolveSummonUiMode(command),
            phase: "complete",
            confirmation: true,
            id: summon.id,
            source: summon.source || null,
          }
        : null;
    }
    case "MSG_CHAINING": {
      const chain = rememberCurrentChain(gameBoard, message);
      return {
        kind: "chain",
        mode: "activate",
        phase: "start",
        chainIndex: chain.chainIndex,
        id: chain.id,
        source: chain.source,
        sound: "activate",
      };
    }
    case "MSG_CHAINED": {
      const state = getUiAnnouncementState(gameBoard),
        queued = upsertQueuedChain(gameBoard, Object.assign(
          {},
          state.currentChain || {},
          {
            chainIndex:
              Number(message?.chain_size || 0) ||
              Number(state.currentChain?.chainIndex || 0),
            status: "queued",
          },
        ));

      return queued
        ? {
            kind: "chain",
            mode: "activate",
            phase: "queued",
            chainIndex: queued.chainIndex,
            id: queued.id,
            source: queued.source,
          }
        : null;
    }
    case "MSG_CHAIN_SOLVING": {
      const chain = updateQueuedChain(gameBoard, Number(message?.chain_size || 0), {
        status: "solving",
      }) || findQueuedChain(gameBoard, Number(message?.chain_size || 0));

      return {
        kind: "chain",
        mode: "activate",
        phase: "solving",
        chainIndex: Number(message?.chain_size || 0),
        id: chain?.id,
        source: chain?.source || null,
      };
    }
    case "MSG_CHAIN_SOLVED": {
      const chain = updateQueuedChain(gameBoard, Number(message?.chain_size || 0), {
        status: "solved",
      }) || findQueuedChain(gameBoard, Number(message?.chain_size || 0));

      return {
        kind: "chain",
        mode: "activate",
        phase: "solved",
        chainIndex: Number(message?.chain_size || 0),
        id: chain?.id,
        source: chain?.source || null,
      };
    }
    case "MSG_CHAIN_NEGATED":
    case "MSG_CHAIN_DISABLED": {
      const chain = updateQueuedChain(gameBoard, Number(message?.chain_size || 0), {
        status: command === "MSG_CHAIN_NEGATED" ? "negated" : "disabled",
      }) || findQueuedChain(gameBoard, Number(message?.chain_size || 0));

      return {
        kind: "chain",
        mode: "negated",
        phase: command === "MSG_CHAIN_NEGATED" ? "negated" : "disabled",
        chainIndex: Number(message?.chain_size || 0),
        id: chain?.id,
        source: chain?.source || null,
      };
    }
    case "MSG_CHAIN_END":
      clearQueuedChains(gameBoard);
      return {
        kind: "chain",
        phase: "end",
      };
    case "MSG_CARD_SELECTED":
    case "MSG_RANDOM_SELECTED": {
      const cards = buildAnnouncementCardList(message);

      return cards.length
        ? {
            kind: "selection_event",
            phase: command === "MSG_RANDOM_SELECTED" ? "random_selected" : "card_selected",
            cards,
            duration: command === "MSG_RANDOM_SELECTED" ? 650 : 900,
          }
        : null;
    }
    case "MSG_ATTACK":
      return {
        kind: "attack",
        id:
          message?.source?.code ||
          message?.source?.id ||
          message?.attacker?.code ||
          message?.attacker?.id,
        sound: message.sound,
        source: message.source || message.attacker,
        target: message.target || message.defender,
      };
    case "MSG_EQUIP":
      return {
        kind: "sound",
        sound: "equip",
        source: message.source || message.card,
        target: message.target,
      };
    case "MSG_UNEQUIP": {
      const cards = buildAnnouncementCardList(message);

      return cards.length
        ? {
            kind: "selection_event",
            phase: "unequip",
            cards,
            duration: 650,
          }
        : null;
    }
    case "MSG_CARD_TARGET":
      return {
        kind: "target_event",
        phase: "link",
        cards: buildAnnouncementCardList(message),
        duration: 950,
      };
    case "MSG_CANCEL_TARGET":
      return {
        kind: "target_event",
        phase: "unlink",
        cards: buildAnnouncementCardList(message),
        duration: 700,
      };
    case "MSG_BECOME_TARGET": {
      const cards = buildAnnouncementCardList(message);
      rememberCurrentChainTargets(gameBoard, cards);

      return cards.length
        ? {
            kind: "target_event",
            phase: "become_target",
            cards,
            duration: 950,
          }
        : null;
    }
    case "MSG_BE_CHAIN_TARGET": {
      const cards = buildChainContextCards(gameBoard, message);
      rememberCurrentChainTargets(gameBoard, cards);

      return cards.length
        ? {
            kind: "target_event",
            phase: "chain_target",
            cards,
            duration: 950,
          }
        : null;
    }
    case "MSG_CREATE_RELATION":
    case "MSG_RELEASE_RELATION": {
      const cards = buildChainContextCards(gameBoard, message);

      return cards.length
        ? {
            kind: "relation_event",
            phase: command === "MSG_CREATE_RELATION" ? "create" : "release",
            cards,
            duration: command === "MSG_CREATE_RELATION" ? 900 : 650,
          }
        : null;
    }
    case "MSG_BATTLE":
      return {
        kind: "battle",
        source: message.source || message.card,
        target: message.target || null,
      };
    case "MSG_ATTACK_DISABLED":
      return {
        kind: "notice",
        text: message?.text || resolveSystemString(1621) || "An attack was negated",
        duration: 1400,
      };
    case "MSG_DAMAGE":
    case "MSG_PAY_LPCOST":
    case "MSG_RECOVER":
    case "MSG_LPUPDATE": {
      const delta = Number(message?.delta || 0);

      if (!delta) {
        return null;
      }

      return {
        kind: "lp_delta",
        player: Number(message?.player ?? 0),
        value: delta,
        tone:
          command === "MSG_RECOVER"
            ? "recover"
            : command === "MSG_PAY_LPCOST"
              ? "cost"
              : "damage",
        duration: 1300,
      };
    }
    case "MSG_MISSED_EFFECT": {
      const cards = buildAnnouncementCardList(message),
        text =
          message?.text ||
          formatSystemString(resolveSystemString(1622) || "\"%ls\" missed the timing", [
            resolveCardName(message?.id || message?.code) || "An effect",
          ]) ||
          "An effect missed the timing";

      return {
        kind: cards.length ? "selection_event" : "notice",
        phase: "missed_effect",
        cards,
        text,
        duration: 1400,
      };
    }
    case "MSG_TOSS_COIN":
      return {
        kind: "coin_result",
        player: Number(message?.player ?? 0),
        results: Array.isArray(message.results)
          ? message.results.map((value) => Boolean(value))
          : [],
        sound: "coinflip",
      };
    case "MSG_TOSS_DICE":
      return {
        kind: "dice_result",
        player: Number(message?.player ?? 0),
        results: Array.isArray(message.results)
          ? message.results.map((value) => Number(value))
          : [],
        sound: "diceroll",
      };
    case "MSG_FIELD_DISABLED":
      return {
        kind: "field_disabled",
        zones: Array.isArray(message.zones)
          ? message.zones.map((zone) => ({
              player: Number(zone?.player ?? 0),
              location: zone?.location,
              index: Number(zone?.index ?? 0),
            }))
          : [],
      };
    case "MSG_SHUFFLE_DECK":
      return {
        kind: "shuffle",
        zone: "DECK",
        player: message.player,
      };
    case "MSG_SHUFFLE_HAND":
      return {
        kind: "shuffle",
        zone: "HAND",
        player: message.player,
      };
    case "MSG_SHUFFLE_EXTRA":
      return {
        kind: "shuffle",
        zone: "EXTRA",
        player: message.player,
      };
    case "MSG_SHUFFLE_SET_CARD":
      return {
        kind: "shuffle_set",
        zone: message.location,
        players: Array.from(new Set((message.cards || []).reduce((output, movement) => {
          if (Number.isInteger(movement?.from?.player)) {
            output.push(movement.from.player);
          }
          if (Number.isInteger(movement?.to?.player)) {
            output.push(movement.to.player);
          }
          return output;
        }, []))),
      };
    case "MSG_TAG_SWAP":
      return {
        kind: "tag_swap",
        player: Number(message?.player ?? 0),
        zones: ["DECK", "HAND", "EXTRA"],
      };
    case "MSG_DECK_TOP":
      return Number(message?.id || 0)
        ? {
            kind: "flash",
            id: Number(message.id),
          }
        : null;
    case "MSG_HAND_RES":
      return {
        kind: "rps_result",
        results: Array.isArray(message.results) ? message.results.slice() : [],
        duration: Number(message?.duration || 1000),
      };
    default:
      return null;
  }
}

function normalizeAnnouncementMessage(gameBoard, message, slot = gameBoard?.slot) {
  const command = resolveMessageCommand(message);

  if (command === "MSG_HINT") {
    applyUiHintMessage(gameBoard, message);
  }

  const enriched = enrichAnnouncementMessage(gameBoard, message, command);

  return Object.assign({}, enriched, {
    command,
    ui: orientUiContractForSlot(
      resolveUiAnnouncement(gameBoard, enriched),
      slot,
    ),
  });
}

function resolvePhaseBannerText(phase) {
  const normalized = String(phase ?? "").toUpperCase();
  const labels = {
    0: "Draw Phase",
    1: "Standby Phase",
    2: "Main Phase 1",
    3: "Battle Phase",
    4: "Main Phase 2",
    5: "End Phase",
    DRAW: "Draw Phase",
    PHASE_DRAW: "Draw Phase",
    STANDBY: "Standby Phase",
    PHASE_STANDBY: "Standby Phase",
    MAIN1: "Main Phase 1",
    MAIN_1: "Main Phase 1",
    PHASE_MAIN1: "Main Phase 1",
    BATTLE: "Battle Phase",
    BATTLE_START: "Battle Phase",
    PHASE_BATTLE_START: "Battle Phase",
    MAIN2: "Main Phase 2",
    MAIN_2: "Main Phase 2",
    PHASE_MAIN2: "Main Phase 2",
    END: "End Phase",
    PHASE_END: "End Phase",
  };

  return labels[normalized] || labels[phase] || "Phase";
}

function shouldEmitProcessSignal(slot) {
  return slot === 0;
}

function getProcessHostConfiguration() {
  const hostConfiguration = process.hostConfiguration;
  return hostConfiguration && typeof hostConfiguration === "object"
    ? hostConfiguration
    : {};
}

function emitMatchKillProcessMessage(slot, message) {
  if (!shouldEmitProcessSignal(slot) || typeof process.send !== "function") {
    return null;
  }

  const hostConfiguration = getProcessHostConfiguration();
  const payload = {
    action: "match_kill",
    command: "MSG_MATCH_KILL",
    roompass: hostConfiguration.roompass || "",
    tournamentId: hostConfiguration.tournamentId || "",
    tournamentSlug: hostConfiguration.tournamentSlug || "",
    tournamentMatchId: hostConfiguration.tournamentMatchId || "",
    card: Number(message?.card || message?.id || 0) || null,
    cardName:
      (typeof message?.card_name === "string" && message.card_name) ||
      resolveCardName(message?.card || message?.id) ||
      null,
    occurredAt: new Date().toISOString(),
  };

  process.matchKill = payload;
  process.send(payload);
  return payload;
}

/**
 * @typedef FieldCoordinate
 * @type {Object}
 * @property {Number} player controlling player
 * @property {String} location zone or deck in caps, MONSTERZONE, SPELLZONE, EXTRA etc
 * @property {Number} index sequence in the zone or deck.
 */

const buttonName = {
  summonable_cards: (i) => i << 16,
  summons: (i) => i << 16,
  spsummonable_cards: (i) => (i << 16) + 1,
  special_summons: (i) => (i << 16) + 1,
  repositionable_cards: (i) => (i << 16) + 2,
  pos_changes: (i) => (i << 16) + 2,
  msetable_cards: (i) => (i << 16) + 3,
  monster_sets: (i) => (i << 16) + 3,
  ssetable_cards: (i) => (i << 16) + 4,
  spell_sets: (i) => (i << 16) + 4,
  activatable_cards: (i, command) =>
    command === MessageType.SELECT_IDLECMD ? (i << 16) + 5 : i << 16,
  activates: (i, command) =>
    command === MessageType.SELECT_IDLECMD ? (i << 16) + 5 : i << 16,
  chains: (i, command) =>
    command === MessageType.SELECT_IDLECMD ? (i << 16) + 5 : i << 16,
  select_options: (i, command) => {
    switch (command) {
      case MessageType.SELECT_IDLECMD:
        return (i << 16) + 5;
      case MessageType.SELECT_BATTLECMD:
        return i << 16;
      default:
        return i;
    }
  },
  attackable_cards: (i) => (i << 16) + 1,
  attacks: (i) => (i << 16) + 1,
  enableBattlePhase: () => 6,
  to_bp: () => 6,
  shuffle: () => 8,
  enableMainPhase2: () => 2,
  to_m2: () => 2,
  enableEndPhase: (i, command) => {
    switch (command) {
      case MessageType.SELECT_BATTLECMD:
        return 3;
      case MessageType.SELECT_IDLECMD:
        return 7;

      default:
        return -1;
    }
  },
  to_ep: (i, command) => {
    switch (command) {
      case MessageType.SELECT_BATTLECMD:
        return 3;
      case MessageType.SELECT_IDLECMD:
        return 7;
      default:
        return -1;
    }
  },
  yesno: (i, command) => {
    switch (command) {
      case MessageType.SELECT_CHAIN:
        if (!i) {
          return -1;
        }
        return 1;
      default:
        return Number(Boolean(i));
    }
  },
  zone: (i) => Buffer.from(i).readUIntLE(0, 3),
  list: (i) => Buffer.from([i.length].concat(i)),
  number: (i) => Number(i),
  FaceUpAttack: () => 0x1,
  FaceDownAttack: () => 0x2,
  FaceUpDefence: () => 0x4,
  FaceDownDefence: () => 0x8,
};

/**
 * Executes the ask user helper used by the controller automatic module.
 * @param {Object} gameBoard The gameBoard object supplies the structured input used by the controller automatic module, including the `question` property.
 * @param {Function} gameBoard.question The `question` property supplies structured input used by the controller automatic module.
 * @param {(string|number)} slot The slot value provides an input used by the controller automatic module.
 * @param {Object} message The message object supplies the structured input used by the controller automatic module, including the `type` property.
 * @param {string} message.type The `type` property supplies structured input used by the controller automatic module.
 * @param {Object} ygopro The ygopro object supplies the structured input used by the controller automatic module, including the `writeResponse` property.
 * @param {(Function|function)} ygopro.writeResponse The `writeResponse` property supplies structured input used by the controller automatic module.
 * @param {string} command The command value provides an input used by the controller automatic module.
 * @returns {void} Does not return a value.
 */
function askUser(gameBoard, slot, message, ygopro, command) {
  const normalizedMessage = normalizeQuestionPayload(gameBoard, message, resolveMessageCommand(message) || resolveMessageCommand({ type: command }) || message.command, slot);
  gameBoard.question(
    "p" + slot,
    message.type,
    normalizedMessage,
    {
      max: 1,
      min: 1,
    },
    function (answer) {
      const response = toResponse(answer, command, slot);

      console.log("p" + slot, "  -->", answer.type, answer.i, command);

      if (response && typeof ygopro.writeResponse === "function") {
        ygopro.writeResponse(response);
        return;
      }
    },
  );
}

/**
 * Executes the to response helper used by the controller automatic module.
 * @param {Object} answer The answer object supplies the structured input used by the controller automatic module, including the `i` and `type` properties.
 * @param {(number|Array)} answer.i The `i` property supplies structured input used by the controller automatic module.
 * @param {string} answer.type The `type` property supplies structured input used by the controller automatic module.
 * @param {string} command The command value provides an input used by the controller automatic module.
 * @returns {(Object|null)} Returns the value produced by the controller automatic module.
 */
function toResponse(answer, command, slot = 0) {
  const index = Number(answer.i);

  if (
    (command === MessageType.SELECT_PLACE || command === MessageType.SELECT_DISFIELD) &&
    Array.isArray(answer.i)
  ) {
    const [player, location, sequence] = answer.i.map((value) => Number(value));

    return {
      type:
        command === MessageType.SELECT_PLACE
          ? ResponseType.SELECT_PLACE
          : ResponseType.SELECT_DISFIELD,
      places: [
        {
          player: orientPlayerForSlot(player, slot),
          location,
          sequence,
        },
      ],
    };
  }

  if (
    Array.isArray(answer.i) &&
    (
      command === MessageType.SELECT_CARD ||
      command === MessageType.SELECT_TRIBUTE ||
      command === MessageType.SELECT_SUM
    )
  ) {
    return {
      type:
        command === MessageType.SELECT_CARD
          ? ResponseType.SELECT_CARD
          : command === MessageType.SELECT_TRIBUTE
            ? ResponseType.SELECT_TRIBUTE
            : ResponseType.SELECT_SUM,
      indicies: answer.i.map((value) => Number(value)),
    };
  }

  if (command === MessageType.SELECT_COUNTER && answer.type === "counter") {
    return {
      type: ResponseType.SELECT_COUNTER,
      counters: Array.isArray(answer.i) ? answer.i.map((value) => Number(value)) : [],
    };
  }

  if (
    (command === MessageType.SORT_CARD || command === MessageType.SORT_CHAIN) &&
    answer.type === "order"
  ) {
    return {
      type: ResponseType.SORT_CARD,
      order: Array.isArray(answer.i) ? answer.i.map((value) => Number(value)) : null,
    };
  }

  if (command === MessageType.ANNOUNCE_RACE && answer.type === "races") {
    return {
      type: ResponseType.ANNOUNCE_RACE,
      races: Array.isArray(answer.i) ? answer.i.map((value) => BigInt(value)) : [],
    };
  }

  if (command === MessageType.ANNOUNCE_ATTRIB && answer.type === "attributes") {
    return {
      type: ResponseType.ANNOUNCE_ATTRIB,
      attributes: Array.isArray(answer.i) ? answer.i.map((value) => Number(value)) : [],
    };
  }

  switch (command) {
    case MessageType.SELECT_IDLECMD:
      return {
        type: ResponseType.SELECT_IDLECMD,
        action: Number(buttonName[answer.type](0, command)),
        index,
      };
    case MessageType.SELECT_BATTLECMD:
      return {
        type: ResponseType.SELECT_BATTLECMD,
        action: Number(buttonName[answer.type](0, command)),
        index,
      };
    case MessageType.SELECT_EFFECTYN:
      return {
        type: ResponseType.SELECT_EFFECTYN,
        yes: Boolean(index),
      };
    case MessageType.SELECT_YESNO:
      return {
        type: ResponseType.SELECT_YESNO,
        yes: Boolean(index),
      };
    case MessageType.SELECT_OPTION:
      return {
        type: ResponseType.SELECT_OPTION,
        index,
      };
    case MessageType.SELECT_CHAIN:
      return {
        type: ResponseType.SELECT_CHAIN,
        index: index <= 0 ? null : index,
      };
    case MessageType.SELECT_UNSELECT_CARD:
      return {
        type: ResponseType.SELECT_UNSELECT_CARD,
        index: index < 0 ? null : index,
      };
    case MessageType.SELECT_POSITION:
      return {
        type: ResponseType.SELECT_POSITION,
        position: toPosition(answer.type, Position),
      };
    case MessageType.ANNOUNCE_CARD:
      return {
        type: ResponseType.ANNOUNCE_CARD,
        card: index,
      };
    case MessageType.ANNOUNCE_NUMBER:
      return {
        type: ResponseType.ANNOUNCE_NUMBER,
        value: index,
      };
    case MessageType.ROCK_PAPER_SCISSORS:
      return {
        type: ResponseType.ROCK_PAPER_SCISSORS,
        value: index,
      };
    default:
      return null;
  }
}

/**
 * Executes the to position helper used by the controller automatic module.
 * @param {string} type The type value provides an input used by the controller automatic module.
 * @param {Object} position The position object supplies the structured input used by the controller automatic module, including the `FACEDOWN_ATTACK`, `FACEDOWN_DEFENSE`, `FACEUP_ATTACK`, and `FACEUP_DEFENSE` properties.
 * @param {number} position.FACEDOWN_ATTACK The `FACEDOWN_ATTACK` property supplies structured input used by the controller automatic module.
 * @param {number} position.FACEDOWN_DEFENSE The `FACEDOWN_DEFENSE` property supplies structured input used by the controller automatic module.
 * @param {number} position.FACEUP_ATTACK The `FACEUP_ATTACK` property supplies structured input used by the controller automatic module.
 * @param {number} position.FACEUP_DEFENSE The `FACEUP_DEFENSE` property supplies structured input used by the controller automatic module.
 * @returns {number} Returns the value produced by the controller automatic module.
 */
function toPosition(type, position) {
  switch (type) {
    case "FaceUpAttack":
      return position.FACEUP_ATTACK;
    case "FaceDownAttack":
      return position.FACEDOWN_ATTACK;
    case "FaceUpDefence":
      return position.FACEUP_DEFENSE;
    case "FaceDownDefence":
      return position.FACEDOWN_DEFENSE;
    default:
      return position.FACEUP_ATTACK;
  }
}

/**
 * Normalizes board position used by the controller automatic module.
 * @param {string} value The value value provides an input used by the controller automatic module.
 * @returns {string} Returns the value produced by the controller automatic module.
 */
function normalizeBoardPosition(value) {
  if (typeof value === "string") {
    return value;
  }
  if (!Position) {
    return value;
  }

  switch (value) {
    case Position.FACEUP_ATTACK:
      return "FaceUpAttack";
    case Position.FACEDOWN_ATTACK:
      return "FaceDownAttack";
    case Position.FACEUP_DEFENSE:
      return "FaceUpDefence";
    case Position.FACEDOWN_DEFENSE:
      return "FaceDownDefence";
    case Position.FACEUP:
      return "FaceUp";
    case Position.FACEDOWN:
      return "FaceDown";
    case Position.ATTACK:
      return "FaceUpAttack";
    case Position.DEFENSE:
      return "FaceUpDefence";
    default:
      return value;
  }
}

/**
 * Moves ment used by the controller automatic module.
 * @param {Object} message The message object supplies the structured input used by the controller automatic module, including the `code`, `from`, `to`, `currentController`, `currentIndex`, `currentLocation`, `currentPosition`, `previousController`, `previousIndex`, and `previousLocation` properties.
 * @param {string} message.code The `code` property supplies structured input used by the controller automatic module.
 * @param {Object} message.from The `from` property supplies structured input used by the controller automatic module.
 * @param {Object} message.to The `to` property supplies structured input used by the controller automatic module.
 * @param {number} message.currentController The `currentController` property supplies structured input used by the controller automatic module.
 * @param {number} message.currentIndex The `currentIndex` property supplies structured input used by the controller automatic module.
 * @param {string} message.currentLocation The `currentLocation` property supplies structured input used by the controller automatic module.
 * @param {(number|string)} message.currentPosition The `currentPosition` property supplies structured input used by the controller automatic module.
 * @param {number} message.previousController The `previousController` property supplies structured input used by the controller automatic module.
 * @param {number} message.previousIndex The `previousIndex` property supplies structured input used by the controller automatic module.
 * @param {string} message.previousLocation The `previousLocation` property supplies structured input used by the controller automatic module.
 * @param {Object} gameBoard The gameBoard object supplies the structured input used by the controller automatic module, including the `attachMaterial`, `detachMaterial`, `makeNewCard`, `moveCard`, `removeCard`, `takeMaterial`, and `ygoproUpdate` properties.
 * @param {Function} gameBoard.attachMaterial The `attachMaterial` property supplies structured input used by the controller automatic module.
 * @param {Function} gameBoard.detachMaterial The `detachMaterial` property supplies structured input used by the controller automatic module.
 * @param {(Function|Array)} gameBoard.makeNewCard The `makeNewCard` property supplies structured input used by the controller automatic module.
 * @param {(Function|Array)} gameBoard.moveCard The `moveCard` property supplies structured input used by the controller automatic module.
 * @param {(Function|Array)} gameBoard.removeCard The `removeCard` property supplies structured input used by the controller automatic module.
 * @param {Function} gameBoard.takeMaterial The `takeMaterial` property supplies structured input used by the controller automatic module.
 * @param {Function} gameBoard.ygoproUpdate The `ygoproUpdate` property supplies structured input used by the controller automatic module.
 * @returns {void} Does not return a value.
 */
function normalizeMoveCoordinate(card, fallback = {}) {
  const player = Number.isInteger(card?.player)
      ? card.player
      : Number.isInteger(card?.controller)
        ? card.controller
        : Number.isInteger(fallback.player)
          ? fallback.player
          : Number.isInteger(fallback.controller)
            ? fallback.controller
            : 0,
    rawLocation = Object.prototype.hasOwnProperty.call(card || {}, "location")
      ? card.location
      : fallback.location,
    index = Number.isInteger(card?.index)
      ? card.index
      : Number.isInteger(card?.sequence)
        ? card.sequence
        : Number.isInteger(fallback.index)
          ? fallback.index
          : Number.isInteger(fallback.sequence)
            ? fallback.sequence
            : 0,
    rawPosition = Object.prototype.hasOwnProperty.call(card || {}, "position")
      ? card.position
      : fallback.position,
    normalized = {
      player,
      location: rawLocation === 0 ? 0 : normalizeLocation(rawLocation),
      index,
    };

  if (rawPosition !== undefined) {
    normalized.position = normalizeBoardPosition(rawPosition);
  }

  if (Number.isInteger(card?.overlay_sequence)) {
    normalized.overlay_sequence = card.overlay_sequence;
  } else if (Number.isInteger(card?.overlayindex) && card.overlayindex > 0) {
    normalized.overlay_sequence = card.overlayindex - 1;
  } else if (Number.isInteger(fallback.overlay_sequence)) {
    normalized.overlay_sequence = fallback.overlay_sequence;
  }

  return normalized;
}

function isEmptyMoveCoordinate(card) {
  return !card || card.location === 0;
}

function toHostCoordinate(card) {
  return {
    player: card.player,
    location: card.location,
    index: card.index,
  };
}

function movement(message, gameBoard) {
  const {
      code,
      from,
      to,
      previousController,
      previousLocation,
      previousIndex,
      currentController,
      currentIndex,
      currentLocation,
      currentPosition,
    } = message,
    previous = normalizeMoveCoordinate(from, {
      player: previousController,
      location: previousLocation,
      index: previousIndex,
    }),
    current = normalizeMoveCoordinate(to, {
      player: currentController,
      location: currentLocation,
      index: currentIndex,
      position: currentPosition,
    }),
    movementCardId = Number(code || 0) || undefined,
    previousIsOverlay = Number.isInteger(previous?.overlay_sequence),
    currentIsOverlay = Number.isInteger(current?.overlay_sequence),
    previousHost = toHostCoordinate(previous),
    currentHost = toHostCoordinate(current);

  if (isEmptyMoveCoordinate(previous)) {
    gameBoard.makeNewCard(
      currentHost.location,
      currentHost.player,
      currentHost.index,
      current.position,
      code,
      currentHost.index,
    );
    gameBoard.ygoproUpdate();
    return;
  }
  if (isEmptyMoveCoordinate(current)) {
    gameBoard.removeCard(previous);
    gameBoard.ygoproUpdate();
    return;
  }
  if (!previousIsOverlay && !currentIsOverlay) {
    gameBoard.moveCard(previous, Object.assign({}, current, {
      id: movementCardId,
    }));
    gameBoard.ygoproUpdate();
    return;
  }
  if (!previousIsOverlay) {
    gameBoard.attachMaterial(previousHost, currentHost);
    gameBoard.ygoproUpdate();
    return;
  }
  if (!currentIsOverlay) {
    gameBoard.detachMaterial(previousHost, previous.overlay_sequence + 1, current);
    gameBoard.ygoproUpdate();
    return;
  }
  gameBoard.takeMaterial(previousHost, previous.overlay_sequence + 1, currentHost);
  gameBoard.ygoproUpdate();
}

// Good, means completed in the UI.
/**
 * Executes the board controller helper used by the controller automatic module.
 * @param {Object} gameBoard The gameBoard object supplies the structured input used by the controller automatic module, including the `announcement`, `callback`, `changeLifepoints`, `drawCard`, `moveCard`, `nextPhase`, `nextTurn`, `retryLastQuestion`, `startDuel`, `update`, and `ygoproUpdate` properties.
 * @param {Function} gameBoard.announcement The `announcement` property supplies structured input used by the controller automatic module.
 * @param {Function} gameBoard.callback The `callback` property supplies structured input used by the controller automatic module.
 * @param {(number|Function)} gameBoard.changeLifepoints The `changeLifepoints` property supplies structured input used by the controller automatic module.
 * @param {(Function|Array)} gameBoard.drawCard The `drawCard` property supplies structured input used by the controller automatic module.
 * @param {(Function|Array)} gameBoard.moveCard The `moveCard` property supplies structured input used by the controller automatic module.
 * @param {Function} gameBoard.nextPhase The `nextPhase` property supplies structured input used by the controller automatic module.
 * @param {Function} gameBoard.nextTurn The `nextTurn` property supplies structured input used by the controller automatic module.
 * @param {Function} gameBoard.retryLastQuestion The `retryLastQuestion` property supplies structured input used by the controller automatic module.
 * @param {Function} gameBoard.startDuel The `startDuel` property supplies structured input used by the controller automatic module.
 * @param {Function} gameBoard.update The `update` property supplies structured input used by the controller automatic module.
 * @param {Function} gameBoard.ygoproUpdate The `ygoproUpdate` property supplies structured input used by the controller automatic module.
 * @param {number} slot The slot value provides an input used by the controller automatic module.
 * @param {Object} message The message object supplies the structured input used by the controller automatic module, including the `attacker`, `card`, `cards`, `cards[]`, `command`, `count`, `defender`, `gui_phase`, `index`, `lifepoints1`, `location`, `lp`, `multiplier`, `player`, `player1decksize`, `player1extrasize`, `player2decksize`, `player2extrasize`, `position`, `previousController`, `previousIndex`, `previousLocation`, and `type` properties.
 * @param {Object} message.attacker The `attacker` property supplies structured input used by the controller automatic module.
 * @param {Array} message.card The `card` property supplies structured input used by the controller automatic module.
 * @param {string} message.card.id The `card.id` property supplies structured input used by the controller automatic module.
 * @param {number} message.card.index The `card.index` property supplies structured input used by the controller automatic module.
 * @param {string} message.card.location The `card.location` property supplies structured input used by the controller automatic module.
 * @param {number} message.card.player The `card.player` property supplies structured input used by the controller automatic module.
 * @param {(number|string)} message.card.position The `card.position` property supplies structured input used by the controller automatic module.
 * @param {Array} message.cards The `cards` property supplies structured input used by the controller automatic module.
 * @param {number} message.cards.length The `cards.length` property supplies structured input used by the controller automatic module.
 * @param {string} message.cards[].location The `cards[].location` property supplies structured input used by the controller automatic module.
 * @param {(number|string)} message.cards[].position The `cards[].position` property supplies structured input used by the controller automatic module.
 * @param {string} message.command The `command` property supplies structured input used by the controller automatic module.
 * @param {number} message.count The `count` property supplies structured input used by the controller automatic module.
 * @param {Object} message.defender The `defender` property supplies structured input used by the controller automatic module.
 * @param {(number|string)} message.gui_phase The `gui_phase` property supplies structured input used by the controller automatic module.
 * @param {number} message.index The `index` property supplies structured input used by the controller automatic module.
 * @param {number} message.lifepoints1 The `lifepoints1` property supplies structured input used by the controller automatic module.
 * @param {string} message.location The `location` property supplies structured input used by the controller automatic module.
 * @param {number} message.lp The `lp` property supplies structured input used by the controller automatic module.
 * @param {number} message.multiplier The `multiplier` property supplies structured input used by the controller automatic module.
 * @param {number} message.player The `player` property supplies structured input used by the controller automatic module.
 * @param {number} message.player1decksize The `player1decksize` property supplies structured input used by the controller automatic module.
 * @param {number} message.player1extrasize The `player1extrasize` property supplies structured input used by the controller automatic module.
 * @param {number} message.player2decksize The `player2decksize` property supplies structured input used by the controller automatic module.
 * @param {number} message.player2extrasize The `player2extrasize` property supplies structured input used by the controller automatic module.
 * @param {(number|string)} message.position The `position` property supplies structured input used by the controller automatic module.
 * @param {number} message.previousController The `previousController` property supplies structured input used by the controller automatic module.
 * @param {number} message.previousIndex The `previousIndex` property supplies structured input used by the controller automatic module.
 * @param {string} message.previousLocation The `previousLocation` property supplies structured input used by the controller automatic module.
 * @param {string} message.type The `type` property supplies structured input used by the controller automatic module.
 * @param {Object} ygopro The ygopro value provides an input used by the controller automatic module.
 * @param {number} player The player value provides an input used by the controller automatic module.
 * @returns {Object} Returns the value produced by the controller automatic module.
 */
function boardController(gameBoard, slot, message, ygopro, player) {
  "use strict";
  if (!MessageType || !ResponseType || !Position) {
    throw new Error("ocgcore-wasm is not initialized");
  }
  var output = {
    p0: {},
    p1: {},
    spectators: {},
  };

  const previous = {
    player: message.previousController,
    location: message.previousLocation,
    index: message.previousIndex,
  };
  const forwardAnnouncement = function (payload = message) {
    gameBoard.announcement(
      slot,
      normalizeAnnouncementMessage(gameBoard, payload, slot),
    );
  };

  if (message.command === "MSG_ORIENTATION") {
    forwardAnnouncement(message);
    return message;
  }

  const messageType = message.type;

  switch (messageType) {
    case MessageType.RETRY: // Good
      setTimeout(() => {
          gameBoard.retryLastQuestion();
      }, 2000);

      break;
    case MessageType.START: // Good
      gameBoard.startDuel(
        {
          main: Array(message.player1decksize).fill(0),
          side: Array(0),
          extra: Array(message.player1extrasize).fill(0),
        },
        {
          main: Array(message.player2decksize).fill(0),
          side: Array(0),
          extra: Array(message.player2extrasize).fill(0),
        },
        {
          team1: {
            startingLP: message.lifepoints1,
          },
          team2: {
            startingLP: message.lifepoints2 ?? message.lifepoints1,
          },
        },
      );
      break;
    case MessageType.HINT:
      forwardAnnouncement(message);
      break;
    case MessageType.CARD_HINT:
      if (typeof gameBoard.applyCardHint === "function") {
        gameBoard.applyCardHint(message);
        break;
      }
      forwardAnnouncement(message);
      break;
    case MessageType.PLAYER_HINT:
      if (typeof gameBoard.applyPlayerHint === "function") {
        gameBoard.applyPlayerHint(message);
        break;
      }
      forwardAnnouncement(message);
      break;
    case MessageType.AI_NAME:
      if (typeof gameBoard.setNames === "function") {
        gameBoard.setNames(
          1,
          message?.ai_name || message?.name || message?.opponent_name || "AI",
        );
      }
      if (typeof gameBoard.ygoproUpdate === "function") {
        gameBoard.ygoproUpdate();
      }
      forwardAnnouncement(message);
      break;
    case MessageType.SHOW_HINT:
      forwardAnnouncement(message);
      break;
    case MessageType.NEW_TURN: // Good
      gameBoard.nextTurn();
      forwardAnnouncement(Object.assign({}, message, {
        turn: Number(gameBoard?.state?.turn || 0),
        phase: gameBoard?.state?.phase,
      }));
      break;
    case MessageType.WIN:
      forwardAnnouncement(message);
      //process.recordOutcome.emit("win", message);
      break;
    case MessageType.NEW_PHASE: // Good
      gameBoard.nextPhase(message.gui_phase);
      forwardAnnouncement(Object.assign({}, message, {
        phase: gameBoard?.state?.phase,
      }));
      break;
    case MessageType.DRAW: // Good
      gameBoard.drawCard(message.player, message.count, message.cards);
      break;
    case MessageType.SHUFFLE_DECK: // Good
      forwardAnnouncement(message);
      break;
    case MessageType.SHUFFLE_HAND:
      forwardAnnouncement(message);
      break;
    case MessageType.REFRESH_DECK:
      if (typeof gameBoard.refreshDeck === "function") {
        gameBoard.refreshDeck(message);
        break;
      }
      break;
    case MessageType.SHUFFLE_EXTRA:
      if (typeof gameBoard.shuffleExtra === "function") {
        gameBoard.shuffleExtra(message.player, message.cards || []);
      }
      forwardAnnouncement(message);
      break;
    case MessageType.CHAINING:
      forwardAnnouncement(message);
      break;
    case MessageType.CHAINED:
      forwardAnnouncement(message);
      break;
    case MessageType.CHAIN_SOLVING:
      forwardAnnouncement(message);
      break;
    case MessageType.CHAIN_SOLVED:
      forwardAnnouncement(message);
      break;
    case MessageType.CHAIN_END:
      forwardAnnouncement(message);
      break;
    case MessageType.CHAIN_NEGATED:
      forwardAnnouncement(message);
      break;
    case MessageType.CHAIN_DISABLED:
      forwardAnnouncement(message);
      break;
    case MessageType.CARD_SELECTED:
      forwardAnnouncement(message);
      break;
    case MessageType.RANDOM_SELECTED:
      forwardAnnouncement(message);
      break;
    case MessageType.BECOME_TARGET:
      forwardAnnouncement(message);
      break;
    case MessageType.PAY_LPCOST: // Good
      {
        const previousLp = Number(gameBoard?.state?.lifepoints?.[message.player] || 0),
          delta = Number(message.lp || 0) * Number(message.multiplier || -1);

        gameBoard.changeLifepoints(
          message.player,
          delta,
        );
        forwardAnnouncement(Object.assign({}, message, {
          delta,
          previous_lp: previousLp,
          current_lp: Number(gameBoard?.state?.lifepoints?.[message.player] || 0),
        }));
        output[slot] = {
          duelAction: "sound",
          sound: "soundchangeLifePoints",
        };
        gameBoard.callback(output);
      }
      break;
    case MessageType.DAMAGE: // Good
      {
        const previousLp = Number(gameBoard?.state?.lifepoints?.[message.player] || 0),
          delta = Number(message.lp || 0) * Number(message.multiplier || -1);

        gameBoard.changeLifepoints(
          message.player,
          delta,
        );
        forwardAnnouncement(Object.assign({}, message, {
          delta,
          previous_lp: previousLp,
          current_lp: Number(gameBoard?.state?.lifepoints?.[message.player] || 0),
        }));
        output[slot] = {
          duelAction: "sound",
          sound: "soundchangeLifePoints",
        };
        gameBoard.callback(output);
        output[slot] = {
          duelAction: "sound",
          sound: "soundchangeLifePoints",
        };
        gameBoard.callback(output);
      }
      break;
    case MessageType.RECOVER: // Good
      {
        const previousLp = Number(gameBoard?.state?.lifepoints?.[message.player] || 0),
          delta = Number(message.lp || 0) * Number(message.multiplier || 1);

        gameBoard.changeLifepoints(
          message.player,
          delta,
        );
        forwardAnnouncement(Object.assign({}, message, {
          delta,
          previous_lp: previousLp,
          current_lp: Number(gameBoard?.state?.lifepoints?.[message.player] || 0),
        }));
        output[slot] = {
          duelAction: "sound",
          sound: "soundchangeLifePoints",
        };
        gameBoard.callback(output);
      }
      break;
    case MessageType.LPUPDATE: // Good
      {
        const previousLp = Number(gameBoard?.state?.lifepoints?.[message.player] || 0),
          nextLp = Number(message.lp || 0),
          delta = nextLp - previousLp;

        if (typeof gameBoard.setLifepoints === "function") {
          gameBoard.setLifepoints(
            message.player,
            nextLp,
          );
        } else {
          gameBoard.changeLifepoints(
            message.player,
            delta,
          );
        }
        forwardAnnouncement(Object.assign({}, message, {
          delta,
          previous_lp: previousLp,
          current_lp: nextLp,
        }));
        output[slot] = {
          duelAction: "sound",
          sound: "soundchangeLifePoints",
        };
        gameBoard.callback(output);
      }
      break;
    case MessageType.EQUIP:
      if (typeof gameBoard.setEquipCard === "function") {
        gameBoard.setEquipCard(message.source || message.card, message.target);
      }
      forwardAnnouncement(message);
      break;
    case MessageType.CARD_TARGET:
      if (typeof gameBoard.addCardTarget === "function") {
        gameBoard.addCardTarget(message.source || message.card, message.target);
      }
      forwardAnnouncement(message);
      break;
    case MessageType.UNEQUIP:
      if (typeof gameBoard.setEquipCard === "function") {
        gameBoard.setEquipCard(message.source || message.card, undefined);
      }
      forwardAnnouncement(message);
      break;
    case MessageType.CANCEL_TARGET:
      if (typeof gameBoard.removeCardTarget === "function") {
        gameBoard.removeCardTarget(message.source || message.card, message.target);
      }
      forwardAnnouncement(message);
      break;
    case MessageType.BE_CHAIN_TARGET:
      forwardAnnouncement(message);
      break;
    case MessageType.CREATE_RELATION:
      forwardAnnouncement(message);
      break;
    case MessageType.RELEASE_RELATION:
      forwardAnnouncement(message);
      break;
    case MessageType.ADD_COUNTER:
      gameBoard.addCounter(
        {
          player: message.player,
          location: message.location,
          index: message.index,
        },
        message.counter_type,
        message.count,
      );
      gameBoard.ygoproUpdate();
      gameBoard.announcement(slot, message);
      break;
    case MessageType.REMOVE_COUNTER:
      gameBoard.removeCounter(
        {
          player: message.player,
          location: message.location,
          index: message.index,
        },
        message.counter_type,
        message.count,
      );
      gameBoard.ygoproUpdate();
      gameBoard.announcement(slot, message);
      break;
    case MessageType.ATTACK:
      forwardAnnouncement(Object.assign({}, message, {
        command: "MSG_ATTACK",
        sound: "soundattack",
        source: message.attacker,
        target: message.defender,
      }));
      break;
    case MessageType.BATTLE:
      forwardAnnouncement(message);
      break;
    case MessageType.ATTACK_DISABLED:
      forwardAnnouncement(message);
      break;
    case MessageType.DAMAGE_STEP_START: // Good
      break;
    case MessageType.DAMAGE_STEP_END: // Good
      break;
    case MessageType.MISSED_EFFECT:
      forwardAnnouncement(message);
      break;
    case MessageType.TOSS_COIN:
      forwardAnnouncement(message);
      break;
    case MessageType.TOSS_DICE:
      forwardAnnouncement(message);
      break;
    case MessageType.SELECT_IDLECMD: // Good
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_IDLECMD);
      break;
    // Movement-class packets are authoritative server-side state updates.
    // The automatic field model consumes them and emits the resulting board
    // state, so the browser does not need to interpret the raw protocol packet.
    case MessageType.MOVE: // Good
      gameBoard.announcement(slot, message);
      movement(message, gameBoard);
      break;
    case MessageType.POS_CHANGE:
      gameBoard.moveCard(previous, {
        player: message.player,
        location: message.location,
        index: message.index,
        position: normalizeBoardPosition(message.position),
      });
      gameBoard.ygoproUpdate();
      break;
    case MessageType.SET: // Good
      gameBoard.announcement(slot, message);
      break;
    case MessageType.SWAP:
      gameBoard.announcement(slot, message);
      break;
    case MessageType.FIELD_DISABLED:
      forwardAnnouncement(message);
      break;
    case MessageType.SUMMONING: // Good
      gameBoard.update(message);
      forwardAnnouncement(message);
      break;
    case MessageType.SPSUMMONING: // Good
      gameBoard.update(message);
      forwardAnnouncement(message);
      break;
    case MessageType.FLIPSUMMONING: // Good
      gameBoard.update(message);
      forwardAnnouncement(message);
      break;
    case MessageType.SUMMONED: // Good
      forwardAnnouncement(message);
      break;
    case MessageType.SPSUMMONED: // Good
      forwardAnnouncement(message);
      break;
    case MessageType.FLIPSUMMONED: // Good
      forwardAnnouncement(message);
      break;
    case MessageType.REQUEST_DECK:
      gameBoard.announcement(slot, message);
      break;
    case MessageType.SELECT_BATTLECMD:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_BATTLECMD);
      break;
    case MessageType.SELECT_EFFECTYN:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_EFFECTYN);
      break;
    case MessageType.SELECT_YESNO:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_YESNO);
      break;
    case MessageType.SELECT_OPTION:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_OPTION);
      break;
    case MessageType.SELECT_CARD:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_CARD);
      break;
    case MessageType.SELECT_UNSELECT_CARD:
      askUser(
        gameBoard,
        slot,
        message,
        ygopro,
        MessageType.SELECT_UNSELECT_CARD,
      );
      break;
    case MessageType.SELECT_CHAIN:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_CHAIN);
      break;
    case MessageType.SELECT_PLACE:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_PLACE);
      break;
    case MessageType.SELECT_POSITION:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_POSITION);
      break;
    case MessageType.SELECT_TRIBUTE:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_TRIBUTE);
      break;
    case MessageType.SORT_CHAIN:
      askUser(gameBoard, slot, message, ygopro, MessageType.SORT_CHAIN);
      break;
    case MessageType.SELECT_COUNTER:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_COUNTER);
      break;
    case MessageType.SELECT_SUM:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_SUM);
      break;
    case MessageType.SELECT_DISFIELD:
      askUser(gameBoard, slot, message, ygopro, MessageType.SELECT_DISFIELD);
      break;
    case MessageType.SORT_CARD:
      askUser(gameBoard, slot, message, ygopro, MessageType.SORT_CARD);
      break;
    case MessageType.CONFIRM_DECKTOP:
      if (typeof gameBoard.revealCallback === "function") {
        gameBoard.revealCallback(message.reveal_cards || message.cards || [], message.player, "confirm_decktop");
        break;
      }
      forwardAnnouncement(message);
      break;
    case MessageType.CONFIRM_CARDS:
      askUser(gameBoard, slot, message, ygopro, MessageType.CONFIRM_CARDS);
      break;
    case MessageType.CONFIRM_EXTRATOP:
      if (typeof gameBoard.revealCallback === "function") {
        gameBoard.revealCallback(message.reveal_cards || message.cards || [], message.player, "confirm_extratop");
        break;
      }
      forwardAnnouncement(message);
      break;
    case MessageType.SHUFFLE_SET_CARD:
      if (typeof gameBoard.shuffleSetCards === "function") {
        gameBoard.shuffleSetCards(message.location, message.cards || []);
      }
      forwardAnnouncement(message);
      break;
    case MessageType.ROCK_PAPER_SCISSORS:
      askUser(
        gameBoard,
        slot,
        message,
        ygopro,
        MessageType.ROCK_PAPER_SCISSORS,
      );
      break;
    case MessageType.HAND_RES:
      forwardAnnouncement(message);
      break;
    case MessageType.REMOVE_CARDS:
      if (typeof gameBoard.removeCards === "function") {
        gameBoard.removeCards(message.cards || []);
        break;
      }
      (message.cards || []).forEach((card) => {
        if (typeof gameBoard.removeCard === "function") {
          gameBoard.removeCard(card);
        }
      });
      if (typeof gameBoard.ygoproUpdate === "function") {
        gameBoard.ygoproUpdate();
      }
      break;
    case MessageType.RELOAD_FIELD:
      if (typeof gameBoard.reloadField === "function") {
        gameBoard.reloadField(message);
        break;
      }
      forwardAnnouncement(message);
      break;
    case MessageType.TAG_SWAP:
      if (typeof gameBoard.tagSwap === "function") {
        gameBoard.tagSwap(message);
        forwardAnnouncement(message);
        break;
      }
      forwardAnnouncement(message);
      break;
    case MessageType.UPDATE_DATA:
      message.cards.forEach(function (card) {
        card.location = message.location;
        card.position = normalizeBoardPosition(card.position);
        gameBoard.update(card);
      });
      if (message.cards.length) {
        gameBoard.ygoproUpdate();
      }
      return {};
    case MessageType.UPDATE_CARD:
      if (!message.card.id) {
        throw "----";
      }

      try {
        gameBoard.update({
          player: message.card.player,
          location: message.card.location,
          index: message.card.index,
          position: normalizeBoardPosition(message.card.position),
          id: message.card.id,
        });
        gameBoard.ygoproUpdate();
      } catch (e) {
        console.log(e, message);
      }
      break;
    case MessageType.WAITING: // Good
      forwardAnnouncement(message);
      break;
    case MessageType.MATCH_KILL:
      emitMatchKillProcessMessage(slot, message);
      forwardAnnouncement(message);
      break;
    case MessageType.CUSTOM_MSG:
      forwardAnnouncement(message);
      break;
    case MessageType.SWAP_GRAVE_DECK:
      gameBoard.announcement(slot, message);
      break;
    case MessageType.REVERSE_DECK:
      gameBoard.announcement(slot, message);
      break;
    case MessageType.DECK_TOP:
      if (typeof gameBoard.updateDeckTop === "function") {
        gameBoard.updateDeckTop(message);
      }
      forwardAnnouncement(message);
      break;
    case MessageType.ANNOUNCE_ATTRIB:
      askUser(gameBoard, slot, message, ygopro, MessageType.ANNOUNCE_ATTRIB);
      break;
    case MessageType.ANNOUNCE_RACE:
      askUser(gameBoard, slot, message, ygopro, MessageType.ANNOUNCE_RACE);
      break;
    case MessageType.ANNOUNCE_CARD:
      askUser(gameBoard, slot, message, ygopro, MessageType.ANNOUNCE_CARD);
      break;
    case MessageType.ANNOUNCE_NUMBER:
      askUser(gameBoard, slot, message, ygopro, MessageType.ANNOUNCE_NUMBER);
      break;
    default:
      console.log("FAILURE!", message);
      break;
  }
  return message;
}

module.exports = boardController;
module.exports.configureOcgcore = configureOcgcore;
