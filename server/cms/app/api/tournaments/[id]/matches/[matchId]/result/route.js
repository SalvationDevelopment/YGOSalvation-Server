import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";
import { recordPairingResult, resolvePairingId } from "@/lib/tournament-coordinator";
import { applyTournamentEloForPairing, createTournamentResultAlerts } from "@/lib/tournament-notifications";

/**
 * Handles POST requests for the result route.
 * @param {Request} request The request object provides the incoming data used by the result route.
 * @param {Object} context The context object supplies the structured input used by the result module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the result module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the result module.
 * @param {string} context.params.matchId The `params.matchId` property supplies structured input used by the result module.
 * @returns {Promise<Response>} Resolves with the response generated for the result route.
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
    return NextResponse.json({ success: false, error: "Only the tournament owner or an admin can record match results from this flow." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const result = String(body.result || "").trim();

  if (!["player_a_win", "player_b_win", "draw"].includes(result)) {
    return NextResponse.json({ success: false, error: "A valid match result is required." }, { status: 400 });
  }

  const pairing = (tournament.pairings || []).find((entry) => resolvePairingId(entry) === params.matchId);
  if (!pairing) {
    return NextResponse.json({ success: false, error: "Tournament pairing not found." }, { status: 404 });
  }

  try {
    const winner = result === "player_a_win"
      ? pairing.playerA
      : result === "player_b_win"
        ? pairing.playerB
        : "";

    recordPairingResult(tournament, params.matchId, result, winner);
    const ratingDelta = await applyTournamentEloForPairing({ tournament, pairing, result });
    await tournament.save();
    await createTournamentResultAlerts({ tournament, pairing: { ...pairing, winner }, result, ratingDelta });

    return NextResponse.json({
      success: true,
      tournament: serializeTournamentForViewer(tournament, session)
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || "Result recording failed."
    }, { status: 409 });
  }
}
