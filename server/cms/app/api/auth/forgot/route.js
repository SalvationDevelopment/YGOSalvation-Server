import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { generateRawToken, hashToken } from "@/lib/tokens";
import { create, config as loggerConfig } from "@/lib/logger";

const RECOVERY_WINDOW_MINUTES = 15;
const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles POST requests for the forgot route.
 * @param {Object} request The request request object provides the incoming data used by the forgot route, including the `url` property.
 * @param {string} request.url The `url` property supplies structured input used by the forgot module.
 * @returns {Promise<Object>} Resolves with the response generated for the forgot route.
 */
export async function POST(request) {
  log("POST /api/auth/forgot");
  const body = await request.json().catch(() => ({}));
  const email = (body.email || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findOne({ email });
  if (user) {
    const rawToken = generateRawToken();
    user.resetTokenHash = hashToken(rawToken);
    user.resetTokenExpiresAt = new Date(Date.now() + RECOVERY_WINDOW_MINUTES * 60 * 1000);
    await user.save();

    const baseUrl = new URL(request.url).origin;
    const resetUrl = `${baseUrl}/reset?token=${rawToken}`;

    return NextResponse.json({
      success: true,
      message: "If an account exists, recovery instructions are now available.",
      recovery: {
        resetUrl,
        expiresInMinutes: RECOVERY_WINDOW_MINUTES
      }
    });
  }

  return NextResponse.json({
    success: true,
    message: "If an account exists, recovery instructions are now available."
  });
}
