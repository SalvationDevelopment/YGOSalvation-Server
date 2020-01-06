/**
 * Shuffles an array in place, once.
 * @param {Array} array to shuffle
 * @returns {void}
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
 * Shuffles an array in place, multiple times.
 * @param {Array} array to shuffle
 * @returns {void}
 */
function deepShuffle(array) {
    for (var i = 0; i < array.length; i++) {
        shuffle(array);
    }
}

module.exports = deepShuffle;