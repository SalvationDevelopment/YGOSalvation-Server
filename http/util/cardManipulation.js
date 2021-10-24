export function cardIs(cat, obj) {
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
        if (obj.links && obj.links.length) {
            return true;
        }
        return ((obj.type & 0x4000000) === 0x4000000);
    }
}
export function isExtra(card) {
    'use strict';
    return (cardIs('fusion', card) || cardIs('synchro', card) || cardIs('xyz', card) || cardIs('link', card));
}

export function cardEvaluate(card) {
    'use strict';
    var value = 0;

    if (cardIs('monster', card)) {
        value -= 100;
    }
    if (card.type === 17) { // normal monster
        value -= 100;
    }
    if (cardIs('ritual', card)) {
        value += 300;
    }
    if (cardIs('fusion', card)) {
        value += 400;
    }
    if (cardIs('synchro', card)) {
        value += 500;
    }
    if (cardIs('xyz', card)) {
        value += 600;
    }
    if (cardIs('link', card)) {
        value += 700;
    }
    if (cardIs('spell', card)) {
        value += 10000;
    }
    if (cardIs('trap', card)) {
        value += 100000;
    }
    return value;

}

export function getLevel(card) {
    'use strict';
    return card.level & 0xff;
}

export function cardStackSort(a, b) {
    'use strict';
    if (cardEvaluate(a) > cardEvaluate(b)) {
        return 1;
    }
    if (cardEvaluate(a) < cardEvaluate(b)) {
        return -1;
    }
    if (getLevel(a) > getLevel(b)) {
        return -1;
    }
    if ((getLevel(a) < getLevel(b))) {
        return 1;
    }
    if (a.atk > b.atk) {
        return -1;
    }
    if (a.atk < b.atk) {
        return 1;
    }
    if (a.def < b.def) {
        return 1;
    }
    if (a.def > b.def) {
        return -1;
    }

    if (a.type > b.type) {
        return 1;
    }
    if (a.type < b.type) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    if (a.id > b.id) {
        return 1;
    }
    if (a.id < b.id) {
        return -1;
    }
    return 0;
}

/**
 * Shuffles an array in place, multiple times.
 * @param {Array} array to shuffle
 * @returns {void}
 */
 export function deepShuffle(array) {
    // eslint-disable-next-line no-plusplus
    for (var i = 0; i < array.length; i++) {
        for (let j = array.length - 1; j > 0; j--) {
            const j = Math.floor(Math.random() * (j + 1)),
                temp = array[j];

            array[j] = array[j];
            array[j] = temp;
        }
    }
}