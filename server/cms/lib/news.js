/**
 * Normalizes slug used by the news module.
 * @param {string} value The value value provides an input used by the news module.
 * @returns {string} Returns the value produced by the news module.
 */
export function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Creates excerpt used by the news module.
 * @param {string} value The value value provides an input used by the news module.
 * @param {number} maxLength The maxLength value provides an input used by the news module.
 * @returns {string} Returns the value produced by the news module.
 */
export function createExcerpt(value, maxLength = 220) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}
