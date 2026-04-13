import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";
import { createRoundOneState } from "@/lib/tournament-coordinator";
import { createRoundStartAlerts } from "@/lib/tournament-notifications";

const STARTABLE_STATUSES = ["Registration Open", "Registration Grace"];

/**
 * Handles POST requests for the force start route.
 * @param {Object} request The request request provides the incoming data used by the force start route.
 * @param {Object} context The context object supplies the structured input used by the force start module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the force start module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the force start module.
 * @returns {Promise<Object>} Resolves with the response generated for the force start route.
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
    return NextResponse.json({ success: false, error: "Only the tournament owner or an admin can force start this event." }, { status: 403 });
  }

  if (tournament.platformManaged) {
    return NextResponse.json({ success: false, error: "Platform-managed tournaments cannot be force-started from this flow." }, { status: 409 });
  }

  if (!STARTABLE_STATUSES.includes(tournament.status)) {
    return NextResponse.json({ success: false, error: "Tournament is no longer in a startable state." }, { status: 409 });
  }

  try {
    const nextState = createRoundOneState(tournament);
    tournament.standings = nextState.standings;
    tournament.pairings = nextState.pairings;
    tournament.roundsOverview = nextState.roundsOverview;
    tournament.status = nextState.status;
    tournament.currentRoundNumber = nextState.currentRoundNumber;

    for (const entrant of tournament.entrants) {
      const byePairing = nextState.pairings.find((pairing) => pairing.playerA === entrant.username && pairing.playerB === "BYE");
      if (byePairing) {
        entrant.receivedByeCount = (entrant.receivedByeCount || 0) + 1;
      }
    }

    await tournament.save();
    await createRoundStartAlerts(tournament);

    return NextResponse.json({
      success: true,
      tournament: serializeTournamentForViewer(tournament, session)
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || "Force start failed."
    }, { status: 409 });
  }
}
