import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, canMutateEntrants, getViewerEntrant, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";

/**
 * Handles POST requests for the check in route.
 * @param {Object} request The request request provides the incoming data used by the check in route.
 * @param {Object} context The context object supplies the structured input used by the check in module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the check in module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the check in module.
 * @returns {Promise<Object>} Resolves with the response generated for the check in route.
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
  if (!canMutateEntrants(tournament)) {
    return NextResponse.json({ success: false, error: "Check-in is locked for this tournament." }, { status: 409 });
  }
  if (!tournament.checkInRequired) {
    return NextResponse.json({ success: false, error: "This tournament does not require check-in." }, { status: 409 });
  }

  const entrant = getViewerEntrant(tournament, session);
  if (!entrant || entrant.registrationState === "dropped") {
    return NextResponse.json({ success: false, error: "You must register before checking in." }, { status: 409 });
  }

  entrant.registrationState = "checked_in";
  entrant.checkedInAt = new Date();
  entrant.droppedAt = null;
  await tournament.save();

  return NextResponse.json({
    success: true,
    tournament: serializeTournamentForViewer(tournament, session)
  });
}
