const ANNOUNCE_CARD_OPCODE = {
    ADD: 'ADD',
    SUB: 'SUB',
    MUL: 'MUL',
    DIV: 'DIV',
    AND: 'AND',
    OR: 'OR',
    NEG: 'NEG',
    NOT: 'NOT',
    BAND: 'BAND',
    BOR: 'BOR',
    BNOT: 'BNOT',
    BXOR: 'BXOR',
    LSHIFT: 'LSHIFT',
    RSHIFT: 'RSHIFT',
    ALLOW_ALIASES: 'ALLOW_ALIASES',
    ALLOW_TOKENS: 'ALLOW_TOKENS',
    ISCODE: 'ISCODE',
    ISSETCARD: 'ISSETCARD',
    ISTYPE: 'ISTYPE',
    ISRACE: 'ISRACE',
    ISATTRIBUTE: 'ISATTRIBUTE',
    GETCODE: 'GETCODE',
    GETSETCARD: 'GETSETCARD',
    GETTYPE: 'GETTYPE',
    GETRACE: 'GETRACE',
    GETATTRIBUTE: 'GETATTRIBUTE'
};

const OCG_TYPE_MONSTER = 0x1;
const OCG_TYPE_TOKEN = 0x4000;
const CARD_MARINE_DOLPHIN = 78734254;
const CARD_TWINKLE_MOSS = 13857930;

function normalizeOpcodeValue(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.trunc(value);
    }

    if (typeof value === 'string' && value.trim().length) {
        const trimmed = value.trim();
        if (Object.values(ANNOUNCE_CARD_OPCODE).includes(trimmed)) {
            return trimmed;
        }
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? Math.trunc(parsed) : trimmed;
    }

    return 0;
}

function divideDecimalString(value, divisor) {
    let quotient = '',
        remainder = 0;

    for (const char of String(value)) {
        const digit = Number(char);
        if (!Number.isFinite(digit)) {
            continue;
        }
        const current = remainder * 10 + digit,
            nextDigit = Math.floor(current / divisor);
        remainder = current % divisor;

        if (quotient.length || nextDigit !== 0) {
            quotient += String(nextDigit);
        }
    }

    return {
        quotient: quotient || '0',
        remainder
    };
}

function decodeSetcodes(setcode) {
    if (Array.isArray(setcode)) {
        return setcode.map((value) => Number(value) || 0);
    }

    if (setcode === undefined || setcode === null || setcode === '' || setcode === 0) {
        return [];
    }

    const normalized = String(setcode).trim();
    if (!/^\d+$/.test(normalized)) {
        return [];
    }

    let working = normalized,
        output = [];

    while (working !== '0') {
        const division = divideDecimalString(working, 0x10000);
        if (division.remainder) {
            output.push(division.remainder);
        }
        working = division.quotient;
    }

    return output;
}

function toSearchKey(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
}

function normalizeDatabaseCard(card) {
    if (!card) {
        return null;
    }

    return {
        code: Number(card.id ?? card.code ?? 0),
        alias: Number(card.alias ?? 0),
        setcodes: decodeSetcodes(card.setcode ?? card.setcodes),
        type: Number(card.type ?? 0),
        race: Number(card.race ?? 0),
        attribute: Number(card.attribute ?? 0),
        name: String(card.name || card.code || ''),
        searchName: toSearchKey(card.name || card.code || '')
    };
}

/**
 * Checks whether a card is declarable for an `ANNOUNCE_CARD` opcode sequence.
 *
 * EDOPro evaluates the stack-machine opcodes client-side to build the list of
 * valid card names the player can declare. `/ygopro` needs the same filtering
 * layer because ocgcore only sends the opcode program, not the final list.
 *
 * @param {Object} card The normalized database card entry.
 * @param {Array<(string|number|bigint)>} opcodes The opcode sequence from ocgcore.
 * @returns {boolean} Returns `true` when the card can be declared.
 */
export function cardMatchesAnnounceOpcode(card, opcodes) {
    const normalizedCard = normalizeDatabaseCard(card),
        normalizedOpcodes = Array.isArray(opcodes) ? opcodes.map(normalizeOpcodeValue) : [];

    if (!normalizedCard) {
        return false;
    }

    const stack = [];
    let allowAliases = false;
    let allowTokens = false;

    for (const opcode of normalizedOpcodes) {
        switch (opcode) {
            case ANNOUNCE_CARD_OPCODE.ADD: {
                if (stack.length >= 2) {
                    const rhs = stack.pop();
                    const lhs = stack.pop();
                    stack.push(lhs + rhs);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.SUB: {
                if (stack.length >= 2) {
                    const rhs = stack.pop();
                    const lhs = stack.pop();
                    stack.push(lhs - rhs);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.MUL: {
                if (stack.length >= 2) {
                    const rhs = stack.pop();
                    const lhs = stack.pop();
                    stack.push(lhs * rhs);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.DIV: {
                if (stack.length >= 2) {
                    const rhs = stack.pop();
                    const lhs = stack.pop();
                    stack.push(rhs === 0 ? 0 : Math.trunc(lhs / rhs));
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.AND: {
                if (stack.length >= 2) {
                    const rhs = stack.pop();
                    const lhs = stack.pop();
                    stack.push(lhs !== 0 && rhs !== 0 ? 1 : 0);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.OR: {
                if (stack.length >= 2) {
                    const rhs = stack.pop();
                    const lhs = stack.pop();
                    stack.push(lhs !== 0 || rhs !== 0 ? 1 : 0);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.NEG: {
                if (stack.length >= 1) {
                    stack.push(-(stack.pop()));
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.NOT: {
                if (stack.length >= 1) {
                    stack.push(stack.pop() !== 0 ? 0 : 1);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.BAND: {
                if (stack.length >= 2) {
                    const rhs = stack.pop();
                    const lhs = stack.pop();
                    stack.push(lhs & rhs);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.BOR: {
                if (stack.length >= 2) {
                    const rhs = stack.pop();
                    const lhs = stack.pop();
                    stack.push(lhs | rhs);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.BNOT: {
                if (stack.length >= 1) {
                    stack.push(~(stack.pop()));
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.BXOR: {
                if (stack.length >= 2) {
                    const rhs = stack.pop();
                    const lhs = stack.pop();
                    stack.push(lhs ^ rhs);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.LSHIFT: {
                if (stack.length >= 2) {
                    const rhs = stack.pop();
                    const lhs = stack.pop();
                    stack.push(lhs << rhs);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.RSHIFT: {
                if (stack.length >= 2) {
                    const rhs = stack.pop();
                    const lhs = stack.pop();
                    stack.push(lhs >> rhs);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.ALLOW_ALIASES:
                allowAliases = true;
                break;
            case ANNOUNCE_CARD_OPCODE.ALLOW_TOKENS:
                allowTokens = true;
                break;
            case ANNOUNCE_CARD_OPCODE.ISCODE: {
                if (stack.length >= 1) {
                    stack.push(normalizedCard.code === stack.pop() ? 1 : 0);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.ISSETCARD: {
                if (stack.length >= 1) {
                    const setCode = Number(stack.pop()),
                        setType = setCode & 0xfff,
                        setSubType = setCode & 0xf000;
                    let result = 0;

                    for (const set of normalizedCard.setcodes) {
                        if ((set & 0xfff) === setType && (set & 0xf000 & setSubType) === setSubType) {
                            result = 1;
                            break;
                        }
                    }

                    stack.push(result);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.ISTYPE: {
                if (stack.length >= 1) {
                    stack.push((normalizedCard.type & stack.pop()) !== 0 ? 1 : 0);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.ISRACE: {
                if (stack.length >= 1) {
                    stack.push((normalizedCard.race & stack.pop()) !== 0 ? 1 : 0);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.ISATTRIBUTE: {
                if (stack.length >= 1) {
                    stack.push((normalizedCard.attribute & stack.pop()) !== 0 ? 1 : 0);
                }
                break;
            }
            case ANNOUNCE_CARD_OPCODE.GETCODE:
                stack.push(normalizedCard.code);
                break;
            case ANNOUNCE_CARD_OPCODE.GETTYPE:
                stack.push(normalizedCard.type);
                break;
            case ANNOUNCE_CARD_OPCODE.GETRACE:
                stack.push(normalizedCard.race);
                break;
            case ANNOUNCE_CARD_OPCODE.GETATTRIBUTE:
                stack.push(normalizedCard.attribute);
                break;
            default:
                stack.push(opcode);
                break;
        }
    }

    if (stack.length !== 1 || stack[0] === 0) {
        return false;
    }

    if (normalizedCard.code === CARD_MARINE_DOLPHIN || normalizedCard.code === CARD_TWINKLE_MOSS) {
        return true;
    }

    if (!allowAliases && normalizedCard.alias !== 0) {
        return false;
    }

    if (!allowTokens) {
        return (normalizedCard.type & (OCG_TYPE_MONSTER | OCG_TYPE_TOKEN)) !== (OCG_TYPE_MONSTER | OCG_TYPE_TOKEN);
    }

    return true;
}

/**
 * Builds the browser-facing announce-card choice list from the loaded card
 * database, the core opcode program, and the current search text.
 *
 * @param {Array} database The loaded browser card database.
 * @param {Array<(string|number|bigint)>} opcodes The announce-card opcode sequence.
 * @param {string} searchText The current text in the announce-card search box.
 * @param {number} limit The maximum number of matches to return.
 * @returns {Array} Returns filtered announce-card rows for the dialog.
 */
export function buildAnnounceCardChoices(database, opcodes, searchText = '', limit = 60) {
    const cards = Array.isArray(database) ? database : [],
        normalizedSearch = toSearchKey(searchText).trim();

    if (/^\d+$/.test(normalizedSearch)) {
        const match = cards.find((card) => Number(card?.id ?? card?.code ?? 0) === Number(normalizedSearch));
        if (match && cardMatchesAnnounceOpcode(match, opcodes)) {
            return [{
                id: Number(match.id ?? match.code),
                label: `${match.name} (${match.id ?? match.code})`,
                name: match.name,
                code: Number(match.id ?? match.code)
            }];
        }
        return [];
    }

    const exactMatches = [],
        partialMatches = [];

    for (const card of cards) {
        if (!cardMatchesAnnounceOpcode(card, opcodes)) {
            continue;
        }

        const name = String(card?.name || ''),
            searchName = toSearchKey(name);

        if (normalizedSearch && !searchName.includes(normalizedSearch)) {
            continue;
        }

        const row = {
            id: Number(card.id ?? card.code),
            label: `${name} (${card.id ?? card.code})`,
            name,
            code: Number(card.id ?? card.code)
        };

        if (normalizedSearch && searchName === normalizedSearch) {
            exactMatches.push(row);
        } else {
            partialMatches.push(row);
        }

        if (exactMatches.length + partialMatches.length >= limit * 2) {
            break;
        }
    }

    return exactMatches.concat(partialMatches).slice(0, limit);
}

export { ANNOUNCE_CARD_OPCODE };
