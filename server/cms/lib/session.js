import { createSecretKey } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import "@/lib/load-root-env";

const SESSION_COOKIE = "ygo_cms_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

/**
 * Gets secret used by the session module.
 * @returns {Object} Returns the secret key object used by the session module.
 */
function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET must be at least 16 characters");
  }

  return createSecretKey(Buffer.from(secret));
}

/**
 * Gets session cookie name used by the session module.
 * @returns {string} Returns the value produced by the session module.
 */
export function getSessionCookieName() {
  return SESSION_COOKIE;
}

/**
 * Executes the sign session helper used by the session module.
 * @param {Object} payload The payload value provides an input used by the session module.
 * @returns {Promise<string>} Resolves with the value produced by the session module.
 */
export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

/**
 * Executes the verify session helper used by the session module.
 * @param {string} token The token value provides an input used by the session module.
 * @returns {Promise<Object>} Resolves with the value produced by the session module.
 */
export async function verifySession(token) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}

/**
 * Executes the session cookie options helper used by the session module.
 * @returns {Object} Returns the value produced by the session module.
 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  };
}
