/*global React, ReactDOM, cardIs*/

function cardIs(cat, obj) {
    'use strict';
    if (cat === 'monster' && (obj.race !== 0 || obj.level !== 0 || obj.attribute !== 0)) {
        return true;
    }
    if (cat === 'monster') {
        return (obj.type & 1) === 1;
    }
    if (cat === 'spell') {
        return (obj.type & 2) === 2;
    }
    if (cat === 'trap') {
        return (obj.type & 4) === 4;
    }
    if (cat === 'fusion') {
        return (obj.type & 64) === 64;
    }
    if (cat === 'ritual') {
        return (obj.type & 128) === 128;
    }
    if (cat === 'synchro') {
        return (obj.type & 8192) === 8192;
    }
    if (cat === 'token') {
        return (obj.type & 16400) === 16400;
    }
    if (cat === 'xyz') {
        return (obj.type & 8388608) === 8388608;
    }
    if (cat === 'link') {
        return (obj.type & 33554432) === 33554432;
    }
}

const attributeMap = {
    1: 'EARTH',
    2: 'WATER',
    4: 'FIRE',
    8: 'WIND',
    16: 'LIGHT',
    32: 'DARK',
    64: 'DIVINE'
},
    stMap = {
        2: '',
        4: '',
        130: ' / Ritual',
        65538: ' / Quick-Play',
        131074: ' / Continuous',
        131076: ' / Continuous',
        262146: ' / Equip',
        524290: ' / Field',
        1048580: ' / Counter'
    },
    fieldspell = {
        524290: ' / Field'
    },
    monsterMap = {
        17: 'Normal',
        33: 'Effect',
        65: 'Fusion',
        97: 'Fusion / Effect',
        129: 'Ritual',
        161: 'Ritual / Effect',
        545: 'Spirit',
        673: 'Ritual / Spirit / Effect',
        1057: 'Union',
        2081: 'Gemini / Effect',
        4113: 'Tuner',
        4129: 'Tuner / Effect',
        4161: 'Fusion / Tuner',
        8193: 'Synchro',
        8225: 'Synchro / Effect',
        12321: 'Synchro / Tuner / Effect',
        16401: 'Token',
        2097185: 'Flip / Effect',
        2101281: 'Flip / Tuner / Effect',
        4194337: 'Toon / Effect',
        8388609: 'Xyz',
        8388641: 'Xyz / Effect',
        16777233: 'Pendulum / Normal',
        16777249: 'Pendulum / Effect',
        16777313: 'Fusion / Pendulum / Effect',
        16781313: 'Pendulum / Tuner / Normal',
        16781345: 'Pendulum / Tuner / Effect',
        16785441: 'Synchro / Pendulum / Effect',
        18874401: 'Pendulum / Flip / Effect',
        25165857: 'Xyz / Pendulum / Effect',
        33554433: 'Link',
        33554465: 'Link / Effect'
    },
    pendulumMap = {
        16777233: 'Pendulum',
        16777249: 'Pendulum / Effect',
        16777313: 'Fusion / Pendulum / Effect',
        16781313: 'Pendulum / Tuner / Normal',
        16781345: 'Pendulum / Tuner / Effect',
        16785441: 'Synchro / Pendulum / Effect',
        18874401: 'Pendulum / Flip / Effect',
        25165857: 'Xyz / Pendulum / Effect'
    },
    raceMap = {
        1: 'Warrior',
        2: 'Spellcaster',
        4: 'Fairy',
        8: 'Fiend',
        16: 'Zombie',
        32: 'Machine',
        64: 'Aqua',
        128: 'Pyro',
        256: 'Rock',
        512: 'Winged-Beast',
        1024: 'Plant',
        2048: 'Insect',
        4096: 'Thunder',
        8192: 'Dragon',
        16384: 'Beast',
        32768: 'Beast-Warrior',
        65536: 'Dinosaur',
        131072: 'Fish',
        262144: 'Sea-Serpent',
        524288: 'Reptile',
        1048576: 'Psychic',
        2097152: 'Divine-Beast',
        4194304: 'Creator God',
        8388608: 'Wyrm',
        16777216: 'Cyberse'
    };

function parseLevelScales(card) {
    'use strict';
    var output = '\r\n',
        leftScale,
        rightScale,
        pendulumLevel,
        level = card.level,
        ranklevel = (cardIs('xyz', card)) ? '☆ Rank ' : '★ Level ';
    if (cardIs('link', card)) {
        output += ' LINK-' + level;
        //def = '-';
    } else if (level > 0 && level <= 12) {
        output += ranklevel + level;

    } else {
        // format: [0-9A-F]0[0-9A-F][0-9A-F]{4}
        leftScale = (card.level >> 0x18) & 0xff; // first digit: left scale in hex (0-16)
        rightScale = (card.level >> 0x10) & 0xff; // third digit: right scale in hex (0-16)
        pendulumLevel = card.level & 0xff; // seventh digit: level of the monster in hex (technically, all 4 digits are levels, but here we only need the last char)
        output += ranklevel + pendulumLevel + '</span> <span class="scales">⬖ Scale ' + leftScale;
    }
    return output;
}

function parseAtkDef(atk, def) {
    'use strict';
    return ((atk < 0) ? 'ATK ?' : 'ATK ' + atk) + ' / ' + ((def < 0 && def !== '-') ? 'DEF ?' : 'DEF ' + def);
}
class CardInfo extends React.Component {

    constructor(databaseSystem) {
        super();
        this.state = {};
        this.cardInfo = this.cardInfo || {};
        this.databaseSystem = databaseSystem;
    }


    typings(targetCard) {
        const isMonster = cardIs('monster', targetCard),
            isSpell = cardIs('spell', targetCard),
            isTrap = cardIs('trap', targetCard);

        let text = '',
            className;

        if (isMonster) {
            className = 'monstDesc';

            text = `[ Monster / ${monsterMap[targetCard.type]} ]
            ${raceMap[targetCard.race]} / ${attributeMap[targetCard.attribute]}
            [ ${parseLevelScales(targetCard)}
            ${parseAtkDef(targetCard.atk, targetCard.def)}`;

        } else if (isSpell) {
            className = 'spellDesc';
            text = `[ Spell' ${(stMap[targetCard.type] || '')}]'`;
        } else if (isTrap) {
            className = 'trapDesc';
            text = `[Trap' ${(stMap[targetCard.type] || '')}]`;
        }
        return React.createElement('span', { className }, text);
    }

    makeDescription(targetCard) {
        if (!targetCard) {
            return '';
        }
        return [
            React.createElement('div', { className: 'descContainer', key: 'descContainer' },
                React.createElement('div', { className: 'cardName', key: 'cardName' },
                    targetCard.name + ' [' + targetCard.id + ']')),
            React.createElement('br'),
            React.createElement('span', { className: 'description', key: 'typing-description' }, this.typings(targetCard)),
            React.createElement('br'),
            React.createElement('div', { className: 'description', key: 'main-description' }, targetCard.desc)
        ];
    }

    render() {
        const src = `http://127.0.0.1:8887/${this.state.id}.jpg`,
            picture = [
                React.createElement('div', { className: 'cardImage' },
                    React.createElement('img', { className: 'imgContainer', src })),
                React.createElement('div', { className: 'cardDescription' }, this.makeDescription(this.state.cardInfo))
            ];
        return picture;
    }

    update(state) {
        Object.assign(this.state, state);
        let card = (!state.id) ? {} : this.databaseSystem.find(function (entry) {
            if (state.id === entry.id) {
                return entry;
            } else {
                return false;
            }
        });
        card = card || {};
        if (card.id) {
            this.state.id = card.id;
            this.state.cardInfo = card;
            return card;
        }
        return card;
    }
}

