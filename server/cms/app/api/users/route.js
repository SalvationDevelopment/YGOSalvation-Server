import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-auth";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/password";
import { isValidEmail, normalizeIdentifier, validatePasswordStrength } from "@/lib/validation";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles GET requests for the users route.
 * @param {Object} request The request request provides the incoming data used by the users route.
 * @returns {Promise<Object>} Resolves with the response generated for the users route.
 */
export async function GET(request) {
  log("GET /api/users");
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const users = await User.find({}, { username: 1, email: 1, role: 1, points: 1, elo: 1, service: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .lean();

  const serializedUsers = users.map((user) => ({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    points: user.points ?? 0,
    elo: user.elo ?? 1200,
    service: Boolean(user.service),
    createdAt: user.createdAt
  }));

  return NextResponse.json({ success: true, users: serializedUsers });
}

/**
 * Handles POST requests for the users route.
 * @param {Object} request The request request provides the incoming data used by the users route.
 * @returns {Promise<Object>} Resolves with the response generated for the users route.
 */
export async function POST(request) {
  log("POST /api/users");
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const username = normalizeIdentifier(body.username);
  const email = normalizeIdentifier(body.email).toLowerCase();
  const password = body.password || "";

  if (!username || !email || !password) {
    return NextResponse.json({ success: false, error: "username, email, and password are required." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ success: false, error: "Invalid email format." }, { status: 400 });
  }

  const strength = validatePasswordStrength(password);
  if (!strength.ok) {
    return NextResponse.json({ success: false, error: "Password is too weak." }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await User.findOne({
    $or: [{ username }, { email }]
  }).lean();

  if (existing) {
    return NextResponse.json({ success: false, error: "Username or email is already in use." }, { status: 409 });
  }

  const created = await User.create({
    username,
    email,
    passwordHash: await hashPassword(password),
    role: "user",
    points: 0,
    elo: 1200,
    service: false
  });

  return NextResponse.json({
    success: true,
    user: {
      id: created._id.toString(),
      username: created.username,
      email: created.email,
      role: created.role,
      points: created.points ?? 0,
      elo: created.elo ?? 1200,
      service: Boolean(created.service),
      createdAt: created.createdAt
    }
  });
}
