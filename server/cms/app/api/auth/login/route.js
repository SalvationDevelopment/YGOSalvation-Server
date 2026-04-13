import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { ensureAdminUser } from "@/lib/bootstrap";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/password";
import { signSession, sessionCookieOptions, getSessionCookieName } from "@/lib/session";
import { normalizeIdentifier } from "@/lib/validation";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles POST requests for the login route.
 * @param {Object} request The request request provides the incoming data used by the login route.
 * @returns {Promise<Object>} Resolves with the response generated for the login route.
 */
export async function POST(request) {
  log("POST /api/auth/login");
  const body = await request.json().catch(() => ({}));
  const identifier = normalizeIdentifier(body.identifier).toLowerCase();
  const password = body.password || "";

  if (!identifier || !password) {
    return NextResponse.json({ success: false, error: "Missing credentials." }, { status: 400 });
  }

  await connectToDatabase();
  await ensureAdminUser();

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });
  }

  const token = await signSession({
    sub: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role
  });

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), token, sessionCookieOptions());

  return NextResponse.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
}
