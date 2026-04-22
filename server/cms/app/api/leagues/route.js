import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { League } from "@/models/League";
import { serializeLeague } from "@/lib/serializers";
import { ensureDefaultLeagues } from "@/lib/tournament-bootstrap";

/**
 * Handles GET requests for the leagues route.
 * @returns {Promise<Object>} Resolves with the response generated for the leagues route.
 */
export async function GET() {
  await connectToDatabase();
  await ensureDefaultLeagues();

  const leagues = await League.find({ active: true }).sort({ name: 1 }).lean();
  return NextResponse.json({
    success: true,
    leagues: leagues.map(serializeLeague)
  });
}
