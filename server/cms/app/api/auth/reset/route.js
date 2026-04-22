import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/password";
import { validatePasswordStrength } from "@/lib/validation";
import { hashToken } from "@/lib/tokens";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles POST requests for the reset route.
 * @param {Object} request The request request provides the incoming data used by the reset route.
 * @returns {Promise<Object>} Resolves with the response generated for the reset route.
 */
export async function POST(request) {
  log("POST /api/auth/reset");
  const body = await request.json().catch(() => ({}));
  const token = (body.token || "").trim();
  const password = body.password || "";
  const passwordConfirmation = body.passwordConfirmation || "";

  if (!token || !password) {
    return NextResponse.json(
      { success: false, error: "Recovery token and new password are required." },
      { status: 400 }
    );
  }

  if (password !== passwordConfirmation) {
    return NextResponse.json({ success: false, error: "Passwords do not match." }, { status: 400 });
  }

  const strength = validatePasswordStrength(password);
  if (!strength.ok) {
    return NextResponse.json({ success: false, error: "Password is too weak." }, { status: 400 });
  }

  await connectToDatabase();

  const now = new Date();
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    resetTokenHash: tokenHash,
    resetTokenExpiresAt: { $gt: now }
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "Recovery token is invalid or expired." }, { status: 400 });
  }

  user.passwordHash = await hashPassword(password);
  user.resetTokenHash = null;
  user.resetTokenExpiresAt = null;
  await user.save();

  return NextResponse.json({ success: true, message: "Password updated." });
}
