'use strict';

/**
 * Creates id used by the utils module.
 * @param {string} prefix The prefix value provides an input used by the utils module.
 * @returns {string} Returns the value produced by the utils module.
 */
function createId(prefix) {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

/**
 * Executes the safe json parse helper used by the utils module.
 * @param {string} input The input value provides an input used by the utils module.
 * @returns {Object} Returns the value produced by the utils module.
 */
function safeJsonParse(input) {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (error) {
    return { ok: false, error };
  }
}

/**
 * Executes the to base64 from heap helper used by the utils module.
 * @param {Object} module The module object supplies the structured input used by the utils module, including the `HEAPU8` property.
 * @param {Uint8Array} module.HEAPU8 The `HEAPU8` property supplies structured input used by the utils module.
 * @param {number} ptr The ptr value provides an input used by the utils module.
 * @param {number} length The length value provides an input used by the utils module.
 * @returns {string} Returns the value produced by the utils module.
 */
function toBase64FromHeap(module, ptr, length) {
  if (!ptr || !length) {
    return '';
  }
  const view = module.HEAPU8.subarray(ptr, ptr + length);
  return Buffer.from(view).toString('base64');
}

/**
 * Executes the from base64 helper used by the utils module.
 * @param {string} base64Value The base64Value value provides an input used by the utils module.
 * @returns {Buffer} Returns the value produced by the utils module.
 */
function fromBase64(base64Value) {
  return Buffer.from(base64Value, 'base64');
}

module.exports = {
  createId,
  safeJsonParse,
  toBase64FromHeap,
  fromBase64
};
