import { verifySession, getSessionCookieName } from "@/lib/session";

/**
 * Gets api session used by the api auth module.
 * @param {Object} request The request request object provides the incoming data used by the api auth route, including the `cookies` and `headers` properties.
 * @param {Object} request.cookies The `cookies` property supplies structured input used by the api auth module.
 * @param {Function} request.cookies.get The `cookies.get` property supplies structured input used by the api auth module.
 * @param {Object} request.headers The `headers` property supplies structured input used by the api auth module.
 * @param {Function} request.headers.get The `headers.get` property supplies structured input used by the api auth module.
 * @returns {Promise<null>} Resolves with the value produced by the api auth module.
 */
export async function getApiSession(request) {
  const authorization = request.headers.get("authorization") || request.headers.get("Authorization") || "";
  let token = "";

  if (authorization.toLowerCase().startsWith("bearer ")) {
    token = authorization.slice(7).trim();
  }

  if (!token) {
    token = request.cookies.get(getSessionCookieName())?.value || "";
  }

  if (!token) {
    return null;
  }

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

/**
 * Executes the require api session helper used by the api auth module.
 * @param {Object} request The request request provides the incoming data used by the api auth route.
 * @returns {Promise<string>} Resolves with the value produced by the api auth module.
 */
export async function requireApiSession(request) {
  return getApiSession(request);
}

/**
 * Executes the require admin api helper used by the api auth module.
 * @param {Object} request The request request provides the incoming data used by the api auth route.
 * @returns {Promise<(Object|null)>} Resolves with the value produced by the api auth module.
 */
export async function requireAdminApi(request) {
  const session = await requireApiSession(request);
  if (!session || session.role !== "admin") {
    return null;
  }

  return session;
}
