import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, getViewerEntrant, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";
import { resolvePairingId, updatePairingJoinState } from "@/lib/tournament-coordinator";

/**
 * Handles POST requests for the join route.
 * @param {Request} request The request object provides the incoming data used by the join route.
 * @param {Object} context The context object supplies the structured input used by the join module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the join module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the join module.
 * @param {string} context.params.matchId The `params.matchId` property supplies structured input used by the join module.
 * @returns {Promise<Response>} Resolves with the response generated for the join route.
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

  if (tournament.status !== "Round In Progress" && tournament.status !== "Between Rounds") {
    return NextResponse.json({ success: false, error: "Match join is only available once tournament play has started." }, { status: 409 });
  }

  const entrant = getViewerEntrant(tournament, session);
  if (!entrant || entrant.registrationState === "dropped") {
    return NextResponse.json({ success: false, error: "You are not an active entrant in this tournament." }, { status: 403 });
  }

  const pairing = (tournament.pairings || []).find((entry) => resolvePairingId(entry) === params.matchId);
  if (!pairing) {
    return NextResponse.json({ success: false, error: "Tournament pairing not found." }, { status: 404 });
  }

  if (pairing.playerA !== session.username && pairing.playerB !== session.username) {
    return NextResponse.json({ success: false, error: "You are not assigned to this tournament match." }, { status: 403 });
  }

  const updatedPairing = updatePairingJoinState(tournament, params.matchId, session.username);
  await tournament.save();

  return NextResponse.json({
    success: true,
    tournament: serializeTournamentForViewer(tournament, session),
    matchAccess: {
      matchId: resolvePairingId(updatedPairing),
      round: updatedPairing.round,
      table: updatedPairing.table,
      status: updatedPairing.status,
      joinValidated: true,
      roomAssigned: Boolean(updatedPairing.roomPort),
      roomPort: updatedPairing.roomPort || null,
      roomPass: updatedPairing.roomPass || "",
      joinPath: updatedPairing.roomPort ? `/ygopro?room=${updatedPairing.roomPort}` : null,
      message: updatedPairing.status === "Dueling"
        ? "Match access validated. Both players are marked as dueling."
        : updatedPairing.roomPort
          ? "Match access validated. Duel room assigned."
          : "Match access validated. Waiting for duel-room assignment."
    }
  });
}
