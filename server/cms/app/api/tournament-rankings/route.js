import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TournamentRating } from "@/models/TournamentRating";

/**
 * Handles GET requests for the tournament rankings route.
 * @param {Object} request The request request object provides the incoming data used by the tournament rankings route, including the `url` property.
 * @param {string} request.url The `url` property supplies structured input used by the tournament rankings module.
 * @returns {Promise<Object>} Resolves with the response generated for the tournament rankings route.
 */
export async function GET(request) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const leagueId = String(searchParams.get("leagueId") || "").trim();
  const filter = leagueId ? { leagueId } : {};

  const ratings = await TournamentRating.find(filter)
    .sort({ rating: -1, wins: -1, updatedAt: 1 })
    .limit(100)
    .lean();

  return NextResponse.json({
    success: true,
    rankings: ratings.map((entry, index) => ({
      id: entry._id.toString(),
      place: index + 1,
      leagueId: entry.leagueId,
      userId: entry.userId,
      username: entry.username,
      rating: entry.rating,
      provisionalGames: entry.provisionalGames,
      wins: entry.wins,
      losses: entry.losses,
      draws: entry.draws,
      byes: entry.byes,
      lastMatchAt: entry.lastMatchAt,
      updatedAt: entry.updatedAt,
    })),
  });
}
