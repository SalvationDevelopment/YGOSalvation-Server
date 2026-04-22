import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, getViewerEntrant, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";

/**
 * Handles POST requests for the drop route.
 * @param {Object} request The request request provides the incoming data used by the drop route.
 * @param {Object} context The context object supplies the structured input used by the drop module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the drop module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the drop module.
 * @returns {Promise<Object>} Resolves with the response generated for the drop route.
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

  const entrant = getViewerEntrant(tournament, session);
  if (!entrant || entrant.registrationState === "dropped") {
    return NextResponse.json({ success: false, error: "You are not currently entered in this tournament." }, { status: 409 });
  }

  entrant.registrationState = "dropped";
  entrant.droppedAt = new Date();
  await tournament.save();

  return NextResponse.json({
    success: true,
    tournament: serializeTournamentForViewer(tournament, session)
  });
}
