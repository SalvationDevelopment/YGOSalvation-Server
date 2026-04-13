const STRING_ID_MASK = 0xfffffn;
const STRING_ID_SHIFT = 20n;

export const DEFAULT_PROMPT_IDS = Object.freeze({
    MSG_SELECT_CARD: 560,
    MSG_SELECT_SUM: 560,
    MSG_SELECT_TRIBUTE: 531,
    MSG_SELECT_DISFIELD: 570,
    MSG_ANNOUNCE_ATTRIB: 562,
    MSG_ANNOUNCE_RACE: 563,
    MSG_ANNOUNCE_CARD: 564,
    MSG_ANNOUNCE_NUMBER: 565
});

const SELECT_HINT_COMMANDS = new Set([
    'MSG_SELECT_CARD',
    'MSG_SELECT_SUM',
    'MSG_SELECT_TRIBUTE',
    'MSG_SELECT_PLACE',
    'MSG_SELECT_DISFIELD',
    'MSG_ANNOUNCE_ATTRIB',
    'MSG_ANNOUNCE_RACE',
    'MSG_ANNOUNCE_CARD',
    'MSG_ANNOUNCE_NUMBER'
]);

const EVENT_HINT_COMMANDS = new Set([
    'MSG_SELECT_EFFECTYN',
    'MSG_SELECT_YESNO',
    'MSG_SELECT_CHAIN'
]);

function normalizeHintType(hintType) {
    if (typeof hintType !== 'string') {
        return undefined;
    }

    if (hintType.startsWith('HINT_')) {
        return hintType;
    }

    const normalized = hintType.trim().toUpperCase();
    return normalized ? `HINT_${normalized}` : undefined;
}

function toHintBigInt(value) {
    if (typeof value === 'bigint') {
        return value;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return BigInt(Math.trunc(value));
    }

    if (typeof value === 'string' && value.trim()) {
        try {
            return BigInt(value);
        } catch (error) {
            return undefined;
        }
    }

    return undefined;
}

function toHintKey(value) {
    const numeric = toHintBigInt(value);
    if (numeric !== undefined) {
        return numeric.toString();
    }

    if (typeof value === 'string' && value.trim()) {
        return value.trim();
    }

    return undefined;
}

function getSystemStrings(strings) {
    if (!strings || typeof strings !== 'object') {
        return {};
    }

    return strings.system && typeof strings.system === 'object'
        ? strings.system
        : strings;
}

function formatSystemString(template, replacements) {
    if (typeof template !== 'string' || !template.length) {
        return '';
    }

    let replacementIndex = 0;
    return template.replace(/%ls|%d/g, () => {
        const replacement = replacements[replacementIndex];
        replacementIndex += 1;
        return replacement === undefined || replacement === null ? '' : String(replacement);
    });
}

export function createDuelHintState() {
    return {
        selectHint: undefined,
        eventHint: undefined,
        lastHint: undefined
    };
}

export function decodeCardStringId(value) {
    const numeric = toHintBigInt(value);
    if (numeric === undefined || numeric <= 0n) {
        return undefined;
    }

    const cardId = Number(numeric >> STRING_ID_SHIFT),
        stringIndex = Number(numeric & STRING_ID_MASK);

    if (!Number.isInteger(cardId) || cardId <= 0 || !Number.isInteger(stringIndex) || stringIndex <= 0) {
        return undefined;
    }

    return {
        cardId,
        stringIndex
    };
}

export function resolveSystemString(strings, value) {
    const key = toHintKey(value);
    if (!key) {
        return undefined;
    }

    const text = getSystemStrings(strings)[key];
    return typeof text === 'string' && text.trim() ? text : undefined;
}

export function resolveCardString(database, value) {
    const decoded = decodeCardStringId(value);
    if (!decoded) {
        return undefined;
    }

    const { cardId, stringIndex } = decoded,
        card = Array.isArray(database)
            ? database.find((entry) => Number(entry?.id) === cardId)
            : undefined,
        text = card?.[`str${stringIndex}`];

    return typeof text === 'string' && text.trim() ? text : undefined;
}

export function resolveCardName(database, value) {
    const key = toHintKey(value);
    if (!key || !Array.isArray(database)) {
        return undefined;
    }

    const card = database.find((entry) => String(entry?.id) === key);
    return typeof card?.name === 'string' && card.name.trim() ? card.name : undefined;
}

export function resolveHintText(value, database, strings) {
    return resolveSystemString(strings, value) || resolveCardString(database, value) || undefined;
}

export function applyDuelHintMessage(state, message) {
    const nextState = {
            ...createDuelHintState(),
            ...(state || {})
        },
        hintType = normalizeHintType(message?.hint_type),
        hintValue = message?.hint ?? undefined;

    if (!hintType) {
        return nextState;
    }

    nextState.lastHint = {
        type: hintType,
        hint: hintValue,
        player: Number(message?.player ?? 0)
    };

    if (hintType === 'HINT_SELECTMSG') {
        nextState.selectHint = hintValue;
    } else if (hintType === 'HINT_EVENT') {
        nextState.eventHint = hintValue;
    }

    return nextState;
}

function resolveSelectPlaceText(selectHint, database, strings) {
    const hintedCardName = resolveCardName(database, selectHint);
    if (hintedCardName) {
        return formatSystemString(resolveSystemString(strings, 569), [hintedCardName]);
    }

    return resolveHintText(selectHint, database, strings);
}

export function resolveQuestionPrompt(state, command, database, strings) {
    const currentState = {
        ...createDuelHintState(),
        ...(state || {})
    };

    if (EVENT_HINT_COMMANDS.has(command)) {
        const eventText = resolveHintText(currentState.eventHint, database, strings);
        if (eventText) {
            return {
                text: eventText,
                state: currentState,
                source: 'event'
            };
        }
    }

    if (SELECT_HINT_COMMANDS.has(command)) {
        const selectHint = currentState.selectHint,
            nextState = {
                ...currentState,
                selectHint: undefined
            };

        let text = undefined;
        if (command === 'MSG_SELECT_PLACE') {
            text = resolveSelectPlaceText(selectHint, database, strings);
        } else {
            text = resolveHintText(selectHint, database, strings);
        }

        if (text) {
            return {
                text,
                state: nextState,
                source: 'select'
            };
        }

        const fallbackId = command === 'MSG_SELECT_PLACE' ? 560 : DEFAULT_PROMPT_IDS[command],
            fallbackText = resolveSystemString(strings, fallbackId);

        return {
            text: fallbackText || '',
            state: nextState,
            source: fallbackText ? 'fallback' : undefined
        };
    }

    const fallbackText = resolveSystemString(strings, DEFAULT_PROMPT_IDS[command]);
    return {
        text: fallbackText || '',
        state: currentState,
        source: fallbackText ? 'fallback' : undefined
    };
}
