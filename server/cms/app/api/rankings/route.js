import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles GET requests for the rankings route.
 * @returns {Promise<Object>} Resolves with the response generated for the rankings route.
 */
export async function GET() {
  log("GET /api/rankings");
  await connectToDatabase();

  const users = await User.find(
    { service: { $ne: true } },
    { username: 1, points: 1, elo: 1, createdAt: 1 }
  )
    .sort({ elo: -1, points: -1, createdAt: 1 })
    .lean();

  const rankings = users.map((user) => ({
    username: user.username,
    points: user.points ?? 0,
    elo: user.elo ?? 1200
  }));

  return NextResponse.json(rankings);
}
