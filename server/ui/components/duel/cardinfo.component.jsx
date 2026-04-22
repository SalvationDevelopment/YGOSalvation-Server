import React from 'react';
import { cardIs } from '../../util/cardManipulation';
import { getCardImageUrl } from '../../services/storage.service';
import AppImage from '../common/app-image';
import styles from './cardinfo.component.module.scss';

export const attributeMap = {
    1: 'EARTH',
    2: 'WATER',
    4: 'FIRE',
    8: 'WIND',
    16: 'LIGHT',
    32: 'DARK',
    64: 'DIVINE'
};

export const stMap = {
    2: '',
    4: '',
    130: ' / Ritual',
    65538: ' / Quick-Play',
    131074: ' / Continuous',
    131076: ' / Continuous',
    262146: ' / Equip',
    524290: ' / Field',
    1048580: ' / Counter'
};

export const fieldspell = {
    524290: ' / Field'
};

export const monsterMap = {
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
    33554465: 'Link / Effect',
    67108865: 'Link'
};

export const pendulumMap = {
    16777233: 'Pendulum',
    16777249: 'Pendulum / Effect',
    16777313: 'Fusion / Pendulum / Effect',
    16781313: 'Pendulum / Tuner / Normal',
    16781345: 'Pendulum / Tuner / Effect',
    16785441: 'Synchro / Pendulum / Effect',
    18874401: 'Pendulum / Flip / Effect',
    25165857: 'Xyz / Pendulum / Effect'
};

export const raceMap = {
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
    let output = '\r\n';
    const ranklevel = (cardIs('xyz', card)) ? 'â˜† Rank ' : 'â˜… Level ';

    if (cardIs('link', card)) {
        return `${output} LINK-${card.level}`;
    }

    if (card.level > 0 && card.level <= 12) {
        return `${output}${ranklevel}${card.level}`;
    }

    const leftScale = (card.level >> 0x18) & 0xff,
        pendulumLevel = card.level & 0xff;

    output += `${ranklevel}${pendulumLevel}</span> <span class="scales">â¬– Scale ${leftScale}`;
    return output;
}

function parseAtkDef(atk, def) {
    return ((atk < 0) ? 'ATK ?' : `ATK ${atk}`) + ' / ' + ((def < 0 && def !== '-') ? 'DEF ?' : `DEF ${def}`);
}

function CardTyping({ targetCard }) {
    if (cardIs('monster', targetCard)) {
        return (
            <span className="monstDesc">
                {`[ Monster / ${monsterMap[targetCard.type]} ]
            ${raceMap[targetCard.race]} / ${attributeMap[targetCard.attribute]}
            [ ${parseLevelScales(targetCard)}
            ${parseAtkDef(targetCard.atk, targetCard.def)}`}
            </span>
        );
    }

    if (cardIs('spell', targetCard)) {
        return <span className="spellDesc">{`[ Spell ${(stMap[targetCard.type] || '')} ]`}</span>;
    }

    if (cardIs('trap', targetCard)) {
        return <span className="trapDesc">{`[ Trap ${(stMap[targetCard.type] || '')} ]`}</span>;
    }

    return <span />;
}

function CardDescription({ targetCard }) {
    if (!targetCard || !targetCard.id) {
        return null;
    }

    return (
        <>
            <div className="descContainer">
                <div className="cardName">{`${targetCard.name} [${targetCard.id}]`}</div>
            </div>
            <br />
            <span className="description">
                <CardTyping targetCard={targetCard} />
            </span>
            <br />
            <div className="description">{targetCard.desc}</div>
        </>
    );
}

export function CardInfoView({ id, info }) {
    const src = getCardImageUrl(id);

    return (
        <div className={styles.root}>
            <div className="cardImage">
                {src ? <AppImage className="imgContainer" src={src} alt={info?.name || 'Card image'} fallbackSrc='img/textures/unknown.jpg' width={421} height={614} sizes='(max-width: 768px) 50vw, 421px' style={{ width: 'auto', height: '100%' }} /> : null}
            </div>
            <div className="cardDescription">
                <CardDescription targetCard={info} />
            </div>
        </div>
    );
}

export function MountedCardInfo({ controller }) {
    if (!controller) {
        return null;
    }

    return (
        <CardInfoView
            id={controller.id}
            info={controller.info}
        />
    );
}

export function updateCardInfo(controller, { id }) {
    controller.id = id;
    controller.info = controller.databaseSystem.find((entry) => entry.id === id) || {};
    return controller.info;
}

export function setCardInfoDatabase(controller, databaseSystem = []) {
    controller.databaseSystem = databaseSystem;
}

export function disposeCardInfo(controller) {
    return controller;
}

export function createCardInfoController(databaseSystem = []) {
    const controller = {
        databaseSystem,
        id: undefined,
        info: {}
    };

    controller.update = ({ id }) => updateCardInfo(controller, { id });
    controller.dispose = () => disposeCardInfo(controller);

    return controller;
}

export default function CardInfo(databaseSystem = []) {
    return createCardInfoController(databaseSystem);
}
