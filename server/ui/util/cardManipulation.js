/**
 * Executes the card is helper used by the card manipulation module.
 * @param {string} cat The cat value provides an input used by the card manipulation module.
 * @param {Object} obj The obj object supplies the structured input used by the card manipulation module, including the `attribute`, `level`, `links`, `race`, and `type` properties.
 * @param {(string|number)} obj.attribute The `attribute` property supplies structured input used by the card manipulation module.
 * @param {number} obj.level The `level` property supplies structured input used by the card manipulation module.
 * @param {Array} obj.links The `links` property supplies structured input used by the card manipulation module.
 * @param {number} obj.links.length The `links.length` property supplies structured input used by the card manipulation module.
 * @param {(string|number)} obj.race The `race` property supplies structured input used by the card manipulation module.
 * @param {(string|number)} obj.type The `type` property supplies structured input used by the card manipulation module.
 * @returns {boolean} Returns the value produced by the card manipulation module.
 */
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
/**
 * Determines whether extra should be treated as valid in the card manipulation module.
 * @param {Object} card The card value provides an input used by the card manipulation module.
 * @returns {boolean} Returns `true` when extra is valid in the card manipulation module and `false` otherwise.
 */
export function isExtra(card) {
    'use strict';
    return (cardIs('fusion', card) || cardIs('synchro', card) || cardIs('xyz', card) || cardIs('link', card));
}

/**
 * Executes the card evaluate helper used by the card manipulation module.
 * @param {Object} card The card object supplies the structured input used by the card manipulation module, including the `type` property.
 * @param {(string|number)} card.type The `type` property supplies structured input used by the card manipulation module.
 * @returns {(string|number)} Returns the value produced by the card manipulation module.
 */
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

/**
 * Gets level used by the card manipulation module.
 * @param {Object} card The card object supplies the structured input used by the card manipulation module, including the `level` property.
 * @param {number} card.level The `level` property supplies structured input used by the card manipulation module.
 * @returns {number} Returns the value produced by the card manipulation module.
 */
export function getLevel(card) {
    'use strict';
    return card.level & 0xff;
}

/**
 * Executes the card stack sort helper used by the card manipulation module.
 * @param {Object} a The a object supplies the structured input used by the card manipulation module, including the `atk`, `def`, `id`, `name`, and `type` properties.
 * @param {number} a.atk The `atk` property supplies structured input used by the card manipulation module.
 * @param {number} a.def The `def` property supplies structured input used by the card manipulation module.
 * @param {(string|number)} a.id The `id` property supplies structured input used by the card manipulation module.
 * @param {(string|number)} a.name The `name` property supplies structured input used by the card manipulation module.
 * @param {(string|number)} a.type The `type` property supplies structured input used by the card manipulation module.
 * @param {Object} b The b object supplies the structured input used by the card manipulation module, including the `atk`, `def`, `id`, `name`, and `type` properties.
 * @param {number} b.atk The `atk` property supplies structured input used by the card manipulation module.
 * @param {number} b.def The `def` property supplies structured input used by the card manipulation module.
 * @param {(string|number)} b.id The `id` property supplies structured input used by the card manipulation module.
 * @param {(string|number)} b.name The `name` property supplies structured input used by the card manipulation module.
 * @param {(string|number)} b.type The `type` property supplies structured input used by the card manipulation module.
 * @returns {number} Returns the value produced by the card manipulation module.
 */
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
  * Executes the deep shuffle helper used by the card manipulation module.
  * @param {Object} array The array value provides an input used by the card manipulation module.
  * @returns {void} Does not return a value.
  */
 export function deepShuffle(array) {
     
    for (var i = 0; i < array.length; i++) {
        for (let j = array.length - 1; j > 0; j--) {
            const j = Math.floor(Math.random() * (j + 1)),
                temp = array[j];

            array[j] = array[j];
            array[j] = temp;
        }
    }
}