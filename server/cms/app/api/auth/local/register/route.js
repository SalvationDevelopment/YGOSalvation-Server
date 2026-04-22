import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/password";
import { isValidEmail, normalizeIdentifier, validatePasswordStrength } from "@/lib/validation";
import { signSession } from "@/lib/session";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Executes the to legacy role helper used by the register module.
 * @param {string} role The role value provides an input used by the register module.
 * @returns {Object} Returns the value produced by the register module.
 */
function toLegacyRole(role) {
  return {
    name: role === "admin" ? "Administrator" : "User"
  };
}

/**
 * Executes the to legacy user helper used by the register module.
 * @param {Object} user The user object supplies the structured input used by the register module, including the `_id`, `elo`, `email`, `points`, `role`, `service`, and `username` properties.
 * @param {string} user._id The `_id` property supplies structured input used by the register module.
 * @param {number} user.elo The `elo` property supplies structured input used by the register module.
 * @param {string} user.email The `email` property supplies structured input used by the register module.
 * @param {number} user.points The `points` property supplies structured input used by the register module.
 * @param {string} user.role The `role` property supplies structured input used by the register module.
 * @param {boolean} user.service The `service` property supplies structured input used by the register module.
 * @param {string} user.username The `username` property supplies structured input used by the register module.
 * @returns {Object} Returns the value produced by the register module.
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
 * Handles POST requests for the register route.
 * @param {Object} request The request request provides the incoming data used by the register route.
 * @returns {Promise<Object>} Resolves with the response generated for the register route.
 */
export async function POST(request) {
  log("POST /api/auth/local/register");
  const body = await request.json().catch(() => ({}));
  const username = normalizeIdentifier(body.username);
  const email = normalizeIdentifier(body.email).toLowerCase();
  const password = body.password || "";

  if (!username || !email || !password) {
    return NextResponse.json({ error: "username, email, and password are required." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
  }

  const strength = validatePasswordStrength(password);
  if (!strength.ok) {
    return NextResponse.json({ error: "Password is too weak." }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await User.findOne({
    $or: [{ username }, { email }]
  }).lean();

  if (existing) {
    return NextResponse.json({ error: "Username or email is already in use." }, { status: 409 });
  }

  const created = await User.create({
    username,
    email,
    passwordHash: await hashPassword(password),
    role: "user",
    points: 0,
    elo: 1200,
    service: false,
    avatarUrl: "",
    bio: "",
    settings: {},
    friends: [],
    incomingFriendRequests: [],
    outgoingFriendRequests: []
  });

  const jwt = await signSession({
    sub: created._id.toString(),
    email: created.email,
    username: created.username,
    role: created.role
  });

  return NextResponse.json({
    jwt,
    user: toLegacyUser(created)
  });
}
