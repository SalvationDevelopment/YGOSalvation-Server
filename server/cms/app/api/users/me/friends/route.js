import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { User } from "@/models/User";
import { loadProfile, serializeProfile } from "@/lib/profile";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Creates unique object id strings for the friends module.
 * @param {Array} values The values value provides an input used by the friends module.
 * @returns {Array} Returns the value produced by the friends module.
 */
function uniqueObjectIdStrings(values = []) {
  return [...new Set(values.map((value) => value.toString()))];
}

/**
 * Builds id without the excluded value for the friends module.
 * @param {Array} values The values value provides an input used by the friends module.
 * @param {string} id The id value provides an input used by the friends module.
 * @returns {Array} Returns the value produced by the friends module.
 */
function withoutId(values = [], id) {
  return values.filter((value) => value.toString() !== id);
}

/**
 * Handles POST requests for the friends route.
 * @param {Object} request The request request provides the incoming data used by the friends route.
 * @returns {Promise<Object>} Resolves with the response generated for the friends route.
 */
export async function POST(request) {
  log("POST /api/users/me/friends");
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  if (!username) {
    return NextResponse.json({ error: "username is required." }, { status: 400 });
  }

  await connectToDatabase();

  const currentUser = await User.findById(session.sub);
  const targetUser = await User.findOne({ username });

  if (!currentUser || !targetUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (currentUser._id.toString() === targetUser._id.toString()) {
    return NextResponse.json({ error: "You cannot friend yourself." }, { status: 400 });
  }

  if ((currentUser.friends || []).some((entry) => entry.toString() === targetUser._id.toString())) {
    return NextResponse.json({ error: "Already friends." }, { status: 409 });
  }

  if ((currentUser.outgoingFriendRequests || []).some((entry) => entry.toString() === targetUser._id.toString())) {
    return NextResponse.json({ error: "Friend request already sent." }, { status: 409 });
  }

  currentUser.outgoingFriendRequests = uniqueObjectIdStrings([
    ...(currentUser.outgoingFriendRequests || []),
    targetUser._id
  ]);
  targetUser.incomingFriendRequests = uniqueObjectIdStrings([
    ...(targetUser.incomingFriendRequests || []),
    currentUser._id
  ]);

  await currentUser.save();
  await targetUser.save();

  const profile = await loadProfile(session.sub);
  return NextResponse.json({ success: true, profile: serializeProfile(profile.toObject()) });
}

/**
 * Handles PATCH requests for the friends route.
 * @param {Object} request The request request provides the incoming data used by the friends route.
 * @returns {Promise<Object>} Resolves with the response generated for the friends route.
 */
export async function PATCH(request) {
  log("PATCH /api/users/me/friends");
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = String(body.userId || "").trim();
  const action = String(body.action || "").trim().toLowerCase();

  if (!userId || !["accept", "decline", "cancel", "remove"].includes(action)) {
    return NextResponse.json({ error: "userId and a valid action are required." }, { status: 400 });
  }

  await connectToDatabase();

  const currentUser = await User.findById(session.sub);
  const targetUser = await User.findById(userId);

  if (!currentUser || !targetUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (action === "accept") {
    currentUser.incomingFriendRequests = withoutId(currentUser.incomingFriendRequests || [], userId);
    targetUser.outgoingFriendRequests = withoutId(targetUser.outgoingFriendRequests || [], currentUser._id.toString());
    currentUser.friends = uniqueObjectIdStrings([...(currentUser.friends || []), userId]);
    targetUser.friends = uniqueObjectIdStrings([...(targetUser.friends || []), currentUser._id]);
  }

  if (action === "decline") {
    currentUser.incomingFriendRequests = withoutId(currentUser.incomingFriendRequests || [], userId);
    targetUser.outgoingFriendRequests = withoutId(targetUser.outgoingFriendRequests || [], currentUser._id.toString());
  }

  if (action === "cancel") {
    currentUser.outgoingFriendRequests = withoutId(currentUser.outgoingFriendRequests || [], userId);
    targetUser.incomingFriendRequests = withoutId(targetUser.incomingFriendRequests || [], currentUser._id.toString());
  }

  if (action === "remove") {
    currentUser.friends = withoutId(currentUser.friends || [], userId);
    targetUser.friends = withoutId(targetUser.friends || [], currentUser._id.toString());
  }

  await currentUser.save();
  await targetUser.save();

  const profile = await loadProfile(session.sub);
  return NextResponse.json({ success: true, profile: serializeProfile(profile.toObject()) });
}
