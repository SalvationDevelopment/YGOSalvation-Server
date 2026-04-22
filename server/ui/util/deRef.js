/**
 * Executes the de ref helper used by the de ref module.
 * @param {Array} values The values value provides an input used by the de ref module.
 * @returns {Array} Returns the value produced by the de ref module.
 */
export function deRef(values) {
    return Object.keys(values).reduce((product, ref) => {
        product[ref] = values[ref].current;
        return product;
    }, {});
}