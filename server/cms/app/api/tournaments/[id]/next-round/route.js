import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";
import { createNextRoundState } from "@/lib/tournament-coordinator";
import { createRoundStartAlerts } from "@/lib/tournament-notifications";

/**
 * Handles POST requests for the next round route.
 * @param {Object} request The request request provides the incoming data used by the next round route.
 * @param {Object} context The context object supplies the structured input used by the next round module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the next round module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the next round module.
 * @returns {Promise<Object>} Resolves with the response generated for the next round route.
 */
export async function POST(request, { params }) {
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const tournament = await findTournamentByIdOr404(params.id);
  if (!tournament) {
    return NextResponse.json({ success: false, error: "Tournament not found." }, { status: 404 });
  }

  if (tournament.ownerUserId !== String(session.sub) && session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Only the tournament owner or an admin can create the next round." }, { status: 403 });
  }

  try {
    createNextRoundState(tournament);
    await tournament.save();
    await createRoundStartAlerts(tournament);

    return NextResponse.json({
      success: true,
      tournament: serializeTournamentForViewer(tournament, session)
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || "Next-round creation failed."
    }, { status: 409 });
  }
}
