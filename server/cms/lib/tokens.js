import crypto from "crypto";

/**
 * Executes the generate raw token helper used by the tokens module.
 * @returns {string} Returns the value produced by the tokens module.
 */
export function generateRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Executes the hash token helper used by the tokens module.
 * @param {string} token The token value provides an input used by the tokens module.
 * @returns {string} Returns the value produced by the tokens module.
 */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
