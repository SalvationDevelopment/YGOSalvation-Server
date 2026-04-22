import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/password";
import { validatePasswordStrength } from "@/lib/validation";
import { hashToken } from "@/lib/tokens";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles POST requests for the reset password route.
 * @param {Object} request The request request provides the incoming data used by the reset password route.
 * @returns {Promise<Object>} Resolves with the response generated for the reset password route.
 */
export async function POST(request) {
  log("POST /api/auth/reset-password");
  const body = await request.json().catch(() => ({}));
  const token = (body.code || body.token || "").trim();
  const password = body.password || "";
  const passwordConfirmation = body.passwordConfirmation || password;

  if (!token || !password) {
    return NextResponse.json({ error: "Recovery token and new password are required." }, { status: 400 });
  }

  if (password !== passwordConfirmation) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  const strength = validatePasswordStrength(password);
  if (!strength.ok) {
    return NextResponse.json({ error: "Password is too weak." }, { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findOne({
    resetTokenHash: hashToken(token),
    resetTokenExpiresAt: { $gt: new Date() }
  });

  if (!user) {
    return NextResponse.json({ error: "Recovery token is invalid or expired." }, { status: 400 });
  }

  user.passwordHash = await hashPassword(password);
  user.resetTokenHash = null;
  user.resetTokenExpiresAt = null;
  await user.save();

  return NextResponse.json({ ok: true });
}
