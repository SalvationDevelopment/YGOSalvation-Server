const locationToCode = {
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

function normalizeList(values) {
    if (!Array.isArray(values)) {
        return [];
    }
    return values.map((value) => normalizeInteger(value));
}

function normalizePlace(placeOrPlayer, location, sequence) {
    if (placeOrPlayer && typeof placeOrPlayer === 'object' && !Array.isArray(placeOrPlayer)) {
        return normalizePlace(placeOrPlayer.player, placeOrPlayer.location, placeOrPlayer.sequence ?? placeOrPlayer.index);
    }

    const normalizedLocation = typeof location === 'string'
        ? locationToCode[location] ?? normalizeInteger(location)
        : normalizeInteger(location);

    return [
        normalizeInteger(placeOrPlayer),
        normalizedLocation,
        normalizeInteger(sequence)
    ];
}

/**
 * Builds the shared button-answer contract used by idle and battle command UI controls.
 *
 * The browser only knows which command-family button was clicked, such as
 * `summons`, `attacks`, or `enableEndPhase`. The pending duel message already
 * tells the server whether that click belongs to `SELECT_IDLECMD` or
 * `SELECT_BATTLECMD`, so the UI keeps the payload small and sends the command
 * family plus the clicked option index.
 *
 * @param {string} commandType The UI command family selected by the button.
 * @param {number} index The option index within that command family.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createCommandButtonAnswer(commandType, index = 0) {
    return {
        type: commandType,
        i: normalizeInteger(index)
    };
}

/**
 * Builds a `SELECT_BATTLECMD` transport answer for battle buttons such as
 * attack, chain, or phase-advance actions.
 *
 * @param {string} commandType The battle command family chosen by the UI.
 * @param {number} index The clicked option index within that family.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectBattleCommandAnswer(commandType, index = 0) {
    return createCommandButtonAnswer(commandType, index);
}

/**
 * Builds a `SELECT_IDLECMD` transport answer for idle buttons such as normal
 * summon, set, activate, or shuffle.
 *
 * @param {string} commandType The idle command family chosen by the UI.
 * @param {number} index The clicked option index within that family.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectIdleCommandAnswer(commandType, index = 0) {
    return createCommandButtonAnswer(commandType, index);
}

/**
 * Builds a boolean answer for `SELECT_EFFECTYN`.
 *
 * The server-side duel bridge translates this shared yes/no transport into the
 * actual ocgcore response object that `responses.ts` writes as `1` or `0`.
 *
 * @param {boolean} yes Whether the player accepted the effect prompt.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectEffectYnAnswer(yes) {
    return {
        type: 'yesno',
        i: Boolean(yes)
    };
}

/**
 * Builds a boolean answer for `SELECT_YESNO`.
 *
 * This uses the same transport shape as `SELECT_EFFECTYN` because the UI only
 * needs to communicate "yes" or "no" back to the duel bridge.
 *
 * @param {boolean} yes Whether the player answered yes.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectYesNoAnswer(yes) {
    return createSelectEffectYnAnswer(yes);
}

/**
 * Builds a numeric answer for `SELECT_OPTION`.
 *
 * @param {number} index The selected option index.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectOptionAnswer(index) {
    return {
        type: 'number',
        i: normalizeInteger(index)
    };
}

/**
 * Builds a multi-card answer for `SELECT_CARD`.
 *
 * The Revealer component can toggle multiple cards before submitting. The UI
 * keeps those indices in order and sends them as a list so the duel bridge can
 * turn them into the `indicies` array required by ocgcore.
 *
 * @param {(number[]|null)} indices The selected card indices or `null` to cancel.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectCardAnswer(indices) {
    return {
        type: 'list',
        i: indices === null ? null : normalizeList(indices)
    };
}

/**
 * Builds a card-code answer for `SELECT_CARD_CODES`.
 *
 * This transport stays array-based so UI pickers can work with plain passcodes
 * and let the duel bridge translate them into the ocgcore `codes` payload.
 *
 * @param {(number[]|null)} codes The selected card passcodes or `null` to cancel.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectCardCodesAnswer(codes) {
    return {
        type: 'card_codes',
        i: codes === null ? null : normalizeList(codes)
    };
}

/**
 * Builds a single-index answer for `SELECT_UNSELECT_CARD`.
 *
 * The Revealer can select one entry from the "select" pile or unselect one from
 * the "already selected" pile. The duel bridge resolves that index against the
 * two displayed lists and converts `-1` into the ocgcore cancel case.
 *
 * @param {(number|null)} index The clicked reveal index or `null` to cancel.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectUnselectCardAnswer(index) {
    return {
        type: 'number',
        i: index === null ? -1 : normalizeInteger(index)
    };
}

/**
 * Builds a numeric answer for `SELECT_CHAIN`.
 *
 * The chain picker uses `-1` as the UI-side cancel value because the websocket
 * bridge serializes everything as JSON before turning it into the nullable
 * ocgcore chain index.
 *
 * @param {(number|null)} index The chain index or `null` to decline chaining.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectChainAnswer(index) {
    return {
        type: 'number',
        i: index === null ? -1 : normalizeInteger(index)
    };
}

/**
 * Builds a zone answer for `SELECT_DISFIELD`.
 *
 * Zone selectors in the UI work with `[player, location, sequence]` tuples so
 * highlighted zones and clicked zones can share the same compact shape.
 *
 * @param {(Object|number)} placeOrPlayer The selected place object or player id.
 * @param {(number|string)} location The selected location code or location name.
 * @param {number} sequence The selected sequence within that location.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectDisfieldAnswer(placeOrPlayer, location, sequence) {
    return {
        type: 'zone',
        i: normalizePlace(placeOrPlayer, location, sequence)
    };
}

/**
 * Builds a zone answer for `SELECT_PLACE`.
 *
 * This is intentionally the same transport shape as `SELECT_DISFIELD` because
 * both prompts are answered by the same zone-selection overlay in the UI.
 *
 * @param {(Object|number)} placeOrPlayer The selected place object or player id.
 * @param {(number|string)} location The selected location code or location name.
 * @param {number} sequence The selected sequence within that location.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectPlaceAnswer(placeOrPlayer, location, sequence) {
    return createSelectDisfieldAnswer(placeOrPlayer, location, sequence);
}

/**
 * Builds a position answer for `SELECT_POSITION`.
 *
 * The position dialog already works with UI-facing position names, so the
 * browser can send the chosen name directly and let the duel bridge map it back
 * to the matching ocgcore enum value.
 *
 * @param {string} position The chosen UI position name.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectPositionAnswer(position) {
    return {
        type: position
    };
}

/**
 * Builds a multi-card answer for `SELECT_TRIBUTE`.
 *
 * Tribute selection uses the same reveal/list transport as regular card
 * selection, but it maps to a different ocgcore response case once the server
 * sees the pending duel message type.
 *
 * @param {(number[]|null)} indices The selected tribute indices or `null` to cancel.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectTributeAnswer(indices) {
    return createSelectCardAnswer(indices);
}

/**
 * Builds a counter-allocation answer for `SELECT_COUNTER`.
 *
 * The UI keeps one number per displayed counter group. The duel bridge can send
 * those values back to ocgcore as the packed `counters` array from
 * `responses.ts`.
 *
 * @param {number[]} counters The selected counter amounts in UI order.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectCounterAnswer(counters) {
    return {
        type: 'counter',
        i: normalizeList(counters)
    };
}

/**
 * Builds a multi-card answer for `SELECT_SUM`.
 *
 * Sum-selection prompts use the same reveal/list interaction as `SELECT_CARD`,
 * but the server interprets the submitted indices against the running total for
 * the current summon or cost calculation.
 *
 * @param {(number[]|null)} indices The selected sum indices or `null` to cancel.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSelectSumAnswer(indices) {
    return createSelectCardAnswer(indices);
}

/**
 * Builds a card-order answer for `SORT_CARD`.
 *
 * The sort dialog can keep the order nullable so the UI can explicitly signal a
 * cancel path without inventing a fake array value.
 *
 * @param {(number[]|null)} order The chosen order or `null` to cancel.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createSortCardAnswer(order) {
    return {
        type: 'order',
        i: order === null ? null : normalizeList(order)
    };
}

/**
 * Builds an announcement answer for `ANNOUNCE_RACE`.
 *
 * The browser keeps the selected race keys as a JSON-safe list. The duel bridge
 * can later fold those selections into the bitmask that ocgcore expects.
 *
 * @param {Array<(number|string)>} races The selected race ids or names.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createAnnounceRaceAnswer(races) {
    return {
        type: 'races',
        i: Array.isArray(races) ? races.slice() : []
    };
}

/**
 * Builds an announcement answer for `ANNOUNCE_ATTRIB`.
 *
 * The attribute picker uses the same list-based transport as race selection so
 * checkbox state can stay in plain JSON until the server resolves it.
 *
 * @param {Array<(number|string)>} attributes The selected attribute ids or names.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createAnnounceAttributeAnswer(attributes) {
    return {
        type: 'attributes',
        i: Array.isArray(attributes) ? attributes.slice() : []
    };
}

/**
 * Builds a numeric answer for `ANNOUNCE_CARD`.
 *
 * Card-announcement prompts ultimately need one passcode, so the UI sends the
 * chosen card as a single integer.
 *
 * @param {number} card The chosen card passcode.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createAnnounceCardAnswer(card) {
    return {
        type: 'number',
        i: normalizeInteger(card)
    };
}

/**
 * Builds a numeric answer for `ANNOUNCE_NUMBER`.
 *
 * Buttons that represent legal number choices can forward the selected numeric
 * value directly through this helper.
 *
 * @param {number} value The announced number.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createAnnounceNumberAnswer(value) {
    return {
        type: 'number',
        i: normalizeInteger(value)
    };
}

/**
 * Builds a numeric answer for `ROCK_PAPER_SCISSORS`.
 *
 * The choice screen still works with the compact numeric values expected by the
 * duel bridge. OCGCore uses `1` for scissors, `2` for rock, and `3` for paper.
 *
 * @param {number} value The chosen RPS value.
 * @returns {Object} JSON-safe answer packet for the websocket bridge.
 */
export function createRockPaperScissorsAnswer(value) {
    return {
        type: 'number',
        i: normalizeInteger(value)
    };
}
