import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { TournamentAlert } from "@/models/TournamentAlert";

/**
 * Handles GET requests for the alerts route.
 * @param {Object} request The request request provides the incoming data used by the alerts route.
 * @returns {Promise<Object>} Resolves with the response generated for the alerts route.
 */
export async function GET(request) {
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const alerts = await TournamentAlert.find({ username: session.username })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({
    success: true,
    alerts: alerts.map((alert) => ({
      id: alert._id.toString(),
      tournamentId: alert.tournamentId,
      username: alert.username,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      readAt: alert.readAt,
      metadata: alert.metadata || {},
      createdAt: alert.createdAt,
    })),
  });
}
