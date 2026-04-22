import zxcvbn from "zxcvbn";

/**
 * Normalizes identifier used by the validation module.
 * @param {string} value The value value provides an input used by the validation module.
 * @returns {string} Returns the value produced by the validation module.
 */
export function normalizeIdentifier(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\0/g, "").trim();
}

/**
 * Determines whether valid email should be treated as valid in the validation module.
 * @param {string} value The value value provides an input used by the validation module.
 * @returns {boolean} Returns `true` when valid email is valid in the validation module and `false` otherwise.
 */
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Validates password strength used by the validation module.
 * @param {string} password The password value provides an input used by the validation module.
 * @returns {Object} Returns the value produced by the validation module.
 */
export function validatePasswordStrength(password) {
  const result = zxcvbn(password || "");
  return {
    ok: result.score >= 3,
    score: result.score,
    feedback: result.feedback
  };
}
