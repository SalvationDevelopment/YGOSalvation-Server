import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, canMutateEntrants, getViewerEntrant, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";

/**
 * Handles POST requests for the unregister route.
 * @param {Object} request The request request provides the incoming data used by the unregister route.
 * @param {Object} context The context object supplies the structured input used by the unregister module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the unregister module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the unregister module.
 * @returns {Promise<Object>} Resolves with the response generated for the unregister route.
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
    return NextResponse.json({ success: false, error: "Registration is locked for this tournament." }, { status: 409 });
  }

  const entrant = getViewerEntrant(tournament, session);
  if (!entrant || entrant.registrationState === "dropped") {
    return NextResponse.json({ success: false, error: "You are not registered for this tournament." }, { status: 409 });
  }
  if (entrant.registrationState === "checked_in") {
    return NextResponse.json({ success: false, error: "Checked-in entrants cannot unregister." }, { status: 409 });
  }

  entrant.registrationState = "dropped";
  entrant.droppedAt = new Date();
  await tournament.save();

  return NextResponse.json({
    success: true,
    tournament: serializeTournamentForViewer(tournament, session)
  });
}
