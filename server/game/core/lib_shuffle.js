/**
 * Executes the shuffle helper used by the lib shuffle module.
 * @param {Array} array The array array supplies the ordered values used by the lib shuffle module, including the `length` property.
 * @param {number} array.length The `length` property supplies structured input used by the lib shuffle module.
 * @returns {void} Does not return a value.
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)),
            temp = array[i];

        array[i] = array[j];
        array[j] = temp;
    }
}

/**
 * Executes the deep shuffle helper used by the lib shuffle module.
 * @param {Array} array The array value provides an input used by the lib shuffle module.
 * @returns {void} Does not return a value.
 */
function deepShuffle(array) {
    for (var i = 0; i < array.length; i++) {
        shuffle(array);
    }
}

module.exports = deepShuffle;