import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const FORMAT = "scrypt";

/**
 * Executes the hash password helper used by the password module.
 * @param {string} plainPassword The plainPassword value provides an input used by the password module.
 * @returns {Promise<string>} Resolves with the value produced by the password module.
 */
export async function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const derivedKey = await scrypt(plainPassword, salt, KEY_LENGTH);
  return `${FORMAT}$${salt.toString("hex")}$${Buffer.from(derivedKey).toString("hex")}`;
}

/**
 * Executes the verify password helper used by the password module.
 * @param {string} plainPassword The plainPassword value provides an input used by the password module.
 * @param {string} passwordHash The passwordHash value provides an input used by the password module.
 * @returns {Promise<boolean>} Resolves with the value produced by the password module.
 */
export async function verifyPassword(plainPassword, passwordHash) {
  if (typeof passwordHash !== "string") {
    return false;
  }

  const [format, saltHex, hashHex] = passwordHash.split("$");
  if (format !== FORMAT || !saltHex || !hashHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expectedHash = Buffer.from(hashHex, "hex");
  const derivedKey = Buffer.from(await scrypt(plainPassword, salt, expectedHash.length));

  if (derivedKey.length !== expectedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedKey, expectedHash);
}
