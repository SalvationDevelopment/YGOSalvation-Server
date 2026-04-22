import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { generateRawToken, hashToken } from "@/lib/tokens";
import { create, config as loggerConfig } from "@/lib/logger";

const RECOVERY_WINDOW_MINUTES = 15;
const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles POST requests for the forgot password route.
 * @param {Object} request The request request provides the incoming data used by the forgot password route.
 * @returns {Promise<Object>} Resolves with the response generated for the forgot password route.
 */
export async function POST(request) {
  log("POST /api/auth/forgot-password");
  const body = await request.json().catch(() => ({}));
  const email = (body.email || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const rawToken = generateRawToken();
  user.resetTokenHash = hashToken(rawToken);
  user.resetTokenExpiresAt = new Date(Date.now() + RECOVERY_WINDOW_MINUTES * 60 * 1000);
  await user.save();

  return NextResponse.json({
    ok: true,
    code: rawToken
  });
}
