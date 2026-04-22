import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ensureAdminUser } from "@/lib/bootstrap";
import { User } from "@/models/User";
import { Deck } from "@/models/Deck";
import { verifyPassword } from "@/lib/password";
import { signSession } from "@/lib/session";
import { normalizeIdentifier } from "@/lib/validation";
import { serializeDeck } from "@/lib/serializers";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Executes the to legacy role helper used by the local module.
 * @param {string} role The role value provides an input used by the local module.
 * @returns {Object} Returns the value produced by the local module.
 */
function toLegacyRole(role) {
  return {
    name: role === "admin" ? "Administrator" : "User"
  };
}

/**
 * Executes the to legacy user helper used by the local module.
 * @param {Object} user The user object supplies the structured input used by the local module, including the `_id`, `elo`, `email`, `points`, `role`, `service`, and `username` properties.
 * @param {string} user._id The `_id` property supplies structured input used by the local module.
 * @param {number} user.elo The `elo` property supplies structured input used by the local module.
 * @param {string} user.email The `email` property supplies structured input used by the local module.
 * @param {number} user.points The `points` property supplies structured input used by the local module.
 * @param {string} user.role The `role` property supplies structured input used by the local module.
 * @param {boolean} user.service The `service` property supplies structured input used by the local module.
 * @param {string} user.username The `username` property supplies structured input used by the local module.
 * @returns {Object} Returns the value produced by the local module.
 */
function toLegacyUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: toLegacyRole(user.role),
    admin: user.role === "admin",
    blocked: false,
    points: user.points ?? 0,
    elo: user.elo ?? 1200,
    service: Boolean(user.service)
  };
}

/**
 * Serializes friend list used by the local module.
 * @param {Array} list The list array supplies the ordered values used by the local module, each item uses the `_id`, `avatarUrl`, `elo`, `id`, `points`, and `username` properties.
 * @param {string} list[]._id The `[]._id` property describes data read from each item used by the local module.
 * @param {string} list[].avatarUrl The `[].avatarUrl` property describes data read from each item used by the local module.
 * @param {number} list[].elo The `[].elo` property describes data read from each item used by the local module.
 * @param {string} list[].id The `[].id` property describes data read from each item used by the local module.
 * @param {number} list[].points The `[].points` property describes data read from each item used by the local module.
 * @param {string} list[].username The `[].username` property describes data read from each item used by the local module.
 * @returns {Array} Returns the value produced by the local module.
 */
function serializeFriendList(list = []) {
  return list.map((entry) => ({
    id: entry._id?.toString?.() || entry.id || "",
    username: entry.username,
    avatarUrl: entry.avatarUrl || "",
    points: entry.points ?? 0,
    elo: entry.elo ?? 1200
  }));
}

/**
 * Handles POST requests for the local route.
 * @param {Object} request The request request provides the incoming data used by the local route.
 * @returns {Promise<Object>} Resolves with the response generated for the local route.
 */
export async function POST(request) {
  log("POST /api/auth/local");
  const body = await request.json().catch(() => ({}));
  const identifier = normalizeIdentifier(body.identifier).toLowerCase();
  const password = body.password || "";

  if (!identifier || !password) {
    return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
  }

  await connectToDatabase();
  await ensureAdminUser();

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  })
    .populate("friends", "username avatarUrl points elo")
    .populate("incomingFriendRequests", "username avatarUrl points elo")
    .populate("outgoingFriendRequests", "username avatarUrl points elo");

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const jwt = await signSession({
    sub: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role
  });

  const decks = await Deck.find({ owner: user.username }).sort({ name: 1 }).lean();
  const serializedDecks = decks.map(serializeDeck);
  const legacyUser = toLegacyUser(user);

  return NextResponse.json({
    success: true,
    jwt,
    user: legacyUser,
    decks: serializedDecks,
    info: {
      username: legacyUser.username,
      email: legacyUser.email,
      role: legacyUser.role,
      admin: legacyUser.admin,
      blocked: legacyUser.blocked,
      points: legacyUser.points,
      elo: legacyUser.elo,
      service: legacyUser.service,
      session: jwt,
      decks: serializedDecks,
      friends: serializeFriendList(user.friends),
      incomingFriendRequests: serializeFriendList(user.incomingFriendRequests),
      outgoingFriendRequests: serializeFriendList(user.outgoingFriendRequests),
      sessionExpiration: null,
      ranking: null,
      rewards: [],
      settings: user.settings || {},
      bans: []
    }
  });
}
