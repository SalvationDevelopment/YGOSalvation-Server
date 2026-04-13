import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, canMutateEntrants, getViewerEntrant, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";

/**
 * Handles POST requests for the register route.
 * @param {Object} request The request request provides the incoming data used by the register route.
 * @param {Object} context The context object supplies the structured input used by the register module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the register module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the register module.
 * @returns {Promise<Object>} Resolves with the response generated for the register route.
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

  const existingEntrant = getViewerEntrant(tournament, session);
  if (existingEntrant && existingEntrant.registrationState !== "dropped") {
    return NextResponse.json({ success: false, error: "You are already registered for this tournament." }, { status: 409 });
  }

  const activeEntrants = tournament.entrants.filter((entrant) => entrant.registrationState !== "dropped").length;
  if (activeEntrants >= tournament.capacity) {
    return NextResponse.json({ success: false, error: "Tournament capacity has been reached." }, { status: 409 });
  }

  if (existingEntrant) {
    existingEntrant.registrationState = "registered";
    existingEntrant.joinedAt = new Date();
    existingEntrant.checkedInAt = null;
    existingEntrant.droppedAt = null;
  } else {
    tournament.entrants.push({
      userId: String(session.sub),
      username: session.username,
      registrationState: "registered",
      joinedAt: new Date(),
      checkedInAt: null,
      droppedAt: null,
    });
  }

  await tournament.save();

  return NextResponse.json({
    success: true,
    tournament: serializeTournamentForViewer(tournament, session)
  });
}
