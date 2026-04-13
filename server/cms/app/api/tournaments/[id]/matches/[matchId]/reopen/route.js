import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";
import { reopenPairingResult } from "@/lib/tournament-coordinator";

/**
 * Handles POST requests for the reopen route.
 * @param {Request} request The request object provides the incoming data used by the reopen route.
 * @param {Object} context The context object supplies the structured input used by the reopen module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the reopen module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the reopen module.
 * @param {string} context.params.matchId The `params.matchId` property supplies structured input used by the reopen module.
 * @returns {Promise<Response>} Resolves with the response generated for the reopen route.
 */
export async function POST(request, { params }) {
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Only staff can reopen pairing results from this flow." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const reason = String(body.reason || "").trim().slice(0, 280);

  await connectToDatabase();
  const tournament = await findTournamentByIdOr404(params.id);
  if (!tournament) {
    return NextResponse.json({ success: false, error: "Tournament not found." }, { status: 404 });
  }

  try {
    const reopen = reopenPairingResult(tournament, params.matchId);

    tournament.bracketEdits = [
      ...(tournament.bracketEdits || []),
      {
        action: "reopen_pairing_result",
        actorUserId: String(session.sub || ""),
        actorUsername: session.username || "",
        reason,
        details: {
          matchId: params.matchId,
          before: reopen.before,
          after: reopen.after
        }
      }
    ].slice(-100);

    await tournament.save();

    return NextResponse.json({
      success: true,
      tournament: serializeTournamentForViewer(tournament, session)
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || "Pairing reopen failed."
    }, { status: 409 });
  }
}
