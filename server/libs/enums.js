/* jslint node:true */
module.exports.STOC = {
    0x0: "STOC_UNKNOWN",
    0x1: "STOC_GAME_MSG",
    0x2: "STOC_ERROR_MSG",
    0x3: "STOC_SELECT_HAND",
    0x4: "STOC_SELECT_TP",
    0x5: "STOC_HAND_RESULT",
    0x6: "STOC_TP_RESULT",
    0x7: "STOC_CHANGE_SIDE",
    0x8: "STOC_WAITING_SIDE",
    0x11: "STOC_CREATE_GAME",
    0x12: "STOC_JOIN_GAME",
    0x13: "STOC_TYPE_CHANGE",
    0x14: "STOC_LEAVE_GAME",
    0x15: "STOC_DUEL_START",
    0x16: "STOC_DUEL_END",
    0x17: "STOC_REPLAY",
    0x18: "STOC_TIME_LIMIT",
    0x19: "STOC_CHAT",
    0x20: "STOC_HS_PLAYER_ENTER",
    0x21: "STOC_HS_PLAYER_CHANGE",
    0x22: "STOC_HS_WATCH_CHANGE",
    STOC_GAME_MSG: {
        1: "MSG_RETRY",
        2: "MSG_HINT",
        3: "MSG_WAITING",
        4: "MSG_START",
        5: "MSG_WIN",
        6: "MSG_UPDATE_DATA",
        7: "MSG_UPDATE_CARD",
        8: "MSG_REQUEST_DECK",
        10: "MSG_SELECT_BATTLECMD",
        11: "MSG_SELECT_IDLECMD",
        12: "MSG_SELECT_EFFECTYN",
        13: "MSG_SELECT_YESNO",
        14: "MSG_SELECT_OPTION",
        15: "MSG_SELECT_CARD",
        16: "MSG_SELECT_CHAIN",
        18: "MSG_SELECT_PLACE",
        19: "MSG_SELECT_POSITION",
        20: "MSG_SELECT_TRIBUTE",
        21: "MSG_SORT_CHAIN",
        22: "MSG_SELECT_COUNTER",
        23: "MSG_SELECT_SUM",
        24: "MSG_SELECT_DISFIELD",
        25: "MSG_SORT_CARD",
        30: "MSG_CONFIRM_DECKTOP",
        31: "MSG_CONFIRM_CARDS",
        32: "MSG_SHUFFLE_DECK",
        33: "MSG_SHUFFLE_HAND",
        34: "MSG_REFRESH_DECK",
        35: "MSG_SWAP_GRAVE_DECK",
        36: "MSG_SHUFFLE_SET_CARD",
        37: "MSG_REVERSE_DECK",
        38: "MSG_DECK_TOP",
        40: "MSG_NEW_TURN",
        41: "MSG_NEW_PHASE",
        50: "MSG_MOVE",
        53: "MSG_POS_CHANGE",
        54: "MSG_SET",
        55: "MSG_SWAP",
        56: "MSG_FIELD_DISABLED",
        60: "MSG_SUMMONING",
        61: "MSG_SUMMONED",
        62: "MSG_SPSUMMONING",
        63: "MSG_SPSUMMONED",
        64: "MSG_FLIPSUMMONING",
        65: "MSG_FLIPSUMMONED",
        70: "MSG_CHAINING",
        71: "MSG_CHAINED",
        72: "MSG_CHAIN_SOLVING",
        73: "MSG_CHAIN_SOLVED",
        74: "MSG_CHAIN_END",
        75: "MSG_CHAIN_NEGATED",
        76: "MSG_CHAIN_DISABLED",
        80: "MSG_CARD_SELECTED",
        81: "MSG_RANDOM_SELECTED",
        83: "MSG_BECOME_TARGET",
        90: "MSG_DRAW",
        91: "MSG_DAMAGE",
        92: "MSG_RECOVER",
        93: "MSG_EQUIP",
        94: "MSG_LPUPDATE",
        95: "MSG_UNEQUIP",
        96: "MSG_CARD_TARGET",
        97: "MSG_CANCEL_TARGET",
        100: "MSG_PAY_LPCOST",
        101: "MSG_ADD_COUNTER",
        102: "MSG_REMOVE_COUNTER",
        110: "MSG_ATTACK",
        111: "MSG_BATTLE",
        112: "MSG_ATTACK_DISABLED",
        113: "MSG_DAMAGE_STEP_START",
        114: "MSG_DAMAGE_STEP_END",
        120: "MSG_MISSED_EFFECT",
        121: "MSG_BE_CHAIN_TARGET",
        122: "MSG_CREATE_RELATION",
        123: "MSG_RELEASE_RELATION",
        130: "MSG_TOSS_COIN",
        131: "MSG_TOSS_DICE",
        140: "MSG_ANNOUNCE_RACE",
        141: "MSG_ANNOUNCE_ATTRIB",
        142: "MSG_ANNOUNCE_CARD",
        143: "MSG_ANNOUNCE_NUMBER",
        160: "MSG_CARD_HINT",
        161: "MSG_TAG_SWAP",
        162: "MSG_RELOAD_FIELD",
        163: "MSG_AI_NAME",
        164: "MSG_SHOW_HINT",
        170: "MSG_MATCH_KILL",
        180: "MSG_CUSTOM_MSG",
        MSG_HINT: {
            1: "HINT_EVENT",
            2: "HINT_MESSAGE",
            3: "HINT_SELECTMSG",
            4: "HINT_OPSELECTED",
            5: "HINT_EFFECT",
            6: "HINT_RACE",
            7: "HINT_ATTRIB",
            8: "HINT_CODE",
            9: "HINT_NUMBER",
            10: "HINT_CARD"

        },
        MSG_NEW_PHASE: {
            0x01: "PHASE_DRAW",
            0x02: "PHASE_STANDBY",
            0x04: "PHASE_MAIN1",
            0x08: "PHASE_BATTLE",
            0x10: "PHASE_DAMAGE",
            0x20: "PHASE_DAMAGE_CAL",
            0x40: "PHASE_MAIN2",
            0x80: "PHASE_END",
        }

    }
};
module.exports.CTOS = {
    0x1: "CTOS_RESPONSE",
    0x2: "CTOS_UPDATE_DECK",
    0x3: "CTOS_HAND_RESULT",
    0x4: "CTOS_TP_RESULT",
    0x10: "CTOS_PLAYER_INFO",
    0x11: "CTOS_CREATE_GAME",
    0x12: "CTOS_JOIN_GAME",
    0x13: "CTOS_LEAVE_GAME",
    0x14: "CTOS_SURRENDER",
    0x15: "CTOS_TIME_COMFIRM",
    0x16: "CTOS_CHAT",
    0x20: "CTOS_HS_TODUELIST",
    0x21: "CTOS_HS_TOOBSERVER", //to observer
    0x22: "CTOS_HS_READY",
    0x23: "CTOS_HS_NOTREADY",
    0x24: "CTOS_HS_KICK",
    0x25: "CTOS_HS_START"
    //defunc 0x26: "DEVPRO_GAME_INFO"

};

function makeCheck(target) {
    var destination = target + 'Check';
    module.exports[destination] = {};
    for (var value in module.exports[target]) {
        if (module.exports[target].hasOwnProperty(value)) {
            module.exports[destination][value] = false;
        }
    }
}
makeCheck('STOC');
makeCheck('CTOS');

module.exports.locations = {
    0x01: 'DECK',
    0x02: 'HAND',
    0x04: 'MONSTERZONE',
    0x08: 'SPELLZONE',
    0x10: 'GRAVE',
    0x20: 'REMOVED',
    0x40: 'EXTRA',
    0x80: 'OVERLAY'
};
module.exports.race = {
    0x1: 'Warrior',
    0x2: 'SpellCaster',
    0x4: 'Fairy',
    0x8: 'Fiend',
    0x10: 'Zombie',
    0x20: 'Machine',
    0x40: 'Aqua',
    0x80: 'Pyro',
    0x100: 'Rock',
    0x200: 'WindBeast',
    0x400: 'Plant',
    0x800: 'Insect',
    0x1000: 'Thunder',
    0x2000: 'Dragon',
    0x4000: 'Beast',
    0x8000: 'BestWarrior',
    0x10000: 'Dinosaur',
    0x20000: 'Fish',
    0x40000: 'SeaSerpent',
    0x80000: 'Reptile',
    0x100000: 'Psychic',
    0x200000: 'DivineBeast'
};

module.exports.RPS = {
    0x01: 'Rock',
    0x02: 'Scissors',
    0x04: 'Paper'
};

module.exports.query = {
    Code: 0x01,
    Position: 0x02,
    Alias: 0x04,
    Type: 0x08,
    Level: 0x10,
    Rank: 0x20,
    Attribute: 0x40,
    Race: 0x80,
    Attack: 0x100,
    Defence: 0x200,
    BaseAttack: 0x400,
    BaseDefence: 0x800,
    Reason: 0x1000,
    ReasonCard: 0x2000,
    EquipCard: 0x4000,
    TargetCard: 0x8000,
    OverlayCard: 0x10000,
    Counters: 0x20000,
    Owner: 0x40000,
    IsDisabled: 0x80000,
    IsPublic: 0x100000
};
module.exports.cardAttributes = {
    0x01: 'Earth',
    0x02: 'Water',
    0x04: 'Fire',
    0x08: 'Wind',
    0x10: 'Light',
    0x20: 'Dark',
    0x40: 'Divine',
};
module.exports.phase = {
    1: 'Draw Phase',
    2: 'Standby Phase',
    3: 'Main Phase 1',
    4: 'Battle Phase',
    5: 'Battle Phase: Damage',
    6: 'Battle Phase: Damage Calculation',
    7: 'Main Phase 2',
    8: 'End Phase'
};
module.exports.Positions = {
    0x1: 'FaceUpAttack',
    0x2: 'FaceDownAttack',
    0x4: 'FaceUpDefence',
    0x8: 'FaceDownDefence',
    0x5: 'FaceUp',
    0xA: 'FaceDown',
    0x3: 'Attack',
    0xC: 'Defence'
};
module.exports.cardTypes = {
    0x1: 'Monster',
    0x2: 'Spell',
    0x4: 'Trap',
    0x10: 'Normal',
    0x20: 'Effect',
    0x40: 'Fusion',
    0x80: 'Ritual',
    0x100: 'TrapMonster',
    0x200: 'Spirit',
    0x400: 'Union',
    0x800: 'Dual',
    0x1000: 'Tuner',
    0x2000: 'Synchro',
    0x4000: 'Token',
    0x10000: 'QuickPlay',
    0x20000: 'Continuous',
    0x40000: 'Equip',
    0x80000: 'Field',
    0x100000: 'Counter',
    0x200000: 'Flip',
    0x400000: 'Toon',
    0x800000: 'Xyz'
};

module.exports.lobbyStates = {
    0x8: 'Observe',
    0x9: 'Ready',
    0xA: 'NotReady',
    0xB: 'Leave'

};