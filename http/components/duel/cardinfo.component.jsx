import React, { useEffect, useState } from 'react';
import { cardIs } from '../../util/cardManipulation';
import { getStorage } from '../../services/storage.service';
import { watchOut } from '../../services/listener.service';


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
        67108865: 'Link',
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
        return output;
    }
    if (level > 0 && level <= 12) {
        output += ranklevel + level;
        return output;
    }
    // format: [0-9A-F]0[0-9A-F][0-9A-F]{4}
    leftScale = (card.level >> 0x18) & 0xff; // first digit: left scale in hex (0-16)
    rightScale = (card.level >> 0x10) & 0xff; // third digit: right scale in hex (0-16)
    pendulumLevel = card.level & 0xff; // seventh digit: level of the monster in hex (technically, all 4 digits are levels, but here we only need the last char)
    output += ranklevel + pendulumLevel + '</span> <span class="scales">⬖ Scale ' + leftScale;

    return output;
}

function parseAtkDef(atk, def) {
    'use strict';
    return ((atk < 0) ? 'ATK ?' : 'ATK ' + atk) + ' / ' + ((def < 0 && def !== '-') ? 'DEF ?' : 'DEF ' + def);
}

let databaseSystem = [];

export default function CardInfo() {


    const [id, setId] = useState(undefined),
        [info, setCardInfo] = useState({});

    useEffect(() => {
        watchOut('CARD_HOVER', (action) => {
            if (!action.id) {
                return;
            }
            
            const card = databaseSystem.find(function (entry) {
                return (action.id === entry.id);
            });
            
            setCardInfo(card || {});
            setId(action.id);
        });

        watchOut('LOAD_DATABASE', (action) => {
            databaseSystem = action.data;
        });
    }, []);


    function typings(targetCard) {
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
            return React.createElement('span', { className }, text);
        }

        if (isSpell) {
            className = 'spellDesc';
            text = `[ Spell' ${(stMap[targetCard.type] || '')}]'`;
            return React.createElement('span', { className }, text);
        }

        if (isTrap) {
            className = 'trapDesc';
            text = `[Trap' ${(stMap[targetCard.type] || '')}]`;
            return React.createElement('span', { className }, text);
        }

        return React.createElement('span', { className }, text);
    }

    function makeDescription(targetCard) {
        if (!targetCard) {
            return '';
        }
        if (!targetCard.id) {
            return '';
        }
        return [
            React.createElement('div', { className: 'descContainer', key: 'descContainer' },
                React.createElement('div', { className: 'cardName', key: 'cardName' },
                    targetCard.name + ' [' + targetCard.id + ']')),
            React.createElement('br'),
            React.createElement('span', { className: 'description', key: 'typing-description' }, typings(targetCard)),
            React.createElement('br'),
            React.createElement('div', { className: 'description', key: 'main-description' }, targetCard.desc)
        ];
    }

    function render() {
        const src = (id) ? `${getStorage().imageURL}/${id}.jpg` : '',
            picture = [
                React.createElement('div', { className: 'cardImage' },
                    React.createElement('img', { className: 'imgContainer', src })),
                React.createElement('div', { className: 'cardDescription' }, makeDescription(info))
            ];
        return picture;
    }



    return { render };
}

