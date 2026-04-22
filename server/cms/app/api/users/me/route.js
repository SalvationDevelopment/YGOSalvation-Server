import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { User } from "@/models/User";
import { loadProfile, serializeProfile } from "@/lib/profile";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles GET requests for the me route.
 * @param {Object} request The request request provides the incoming data used by the me route.
 * @returns {Promise<Object>} Resolves with the response generated for the me route.
 */
export async function GET(request) {
  log("GET /api/users/me");
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const user = await loadProfile(session.sub, { lean: true });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(serializeProfile(user));
}

/**
 * Handles PATCH requests for the me route.
 * @param {Object} request The request request provides the incoming data used by the me route.
 * @returns {Promise<Object>} Resolves with the response generated for the me route.
 */
export async function PATCH(request) {
  log("PATCH /api/users/me");
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const updates = {};

  if (body.avatarUrl !== undefined) {
    updates.avatarUrl = String(body.avatarUrl || "").trim().slice(0, 500);
  }

  if (body.bio !== undefined) {
    updates.bio = String(body.bio || "").trim().slice(0, 400);
  }

  if (body.settings !== undefined) {
    const currentSettings = body.settings && typeof body.settings === "object" ? body.settings : {};
    updates.settings = {
      theme: String(currentSettings.theme || "").trim(),
      cover: String(currentSettings.cover || "").trim(),
      imageURL: String(currentSettings.imageURL || "").trim(),
      hide_banlist: Boolean(currentSettings.hide_banlist),
      playassist: Boolean(currentSettings.playassist),
      bluff: Boolean(currentSettings.bluff)
    };
  }

  await connectToDatabase();

  const updated = await User.findByIdAndUpdate(session.sub, updates, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const hydratedProfile = await loadProfile(updated._id);

  return NextResponse.json({
    success: true,
    profile: serializeProfile(hydratedProfile.toObject())
  });
}
