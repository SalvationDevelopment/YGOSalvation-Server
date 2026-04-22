import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";
import { swapPairingPlayers } from "@/lib/tournament-coordinator";

/**
 * Normalizes match id used by the swap module.
 * @param {string} value The value value provides an input used by the swap module.
 * @returns {string} Returns the value produced by the swap module.
 */
function normalizeMatchId(value) {
  return String(value || "").trim();
}

/**
 * Handles POST requests for the swap route.
 * @param {Object} request The request request provides the incoming data used by the swap route.
 * @param {Object} context The context object supplies the structured input used by the swap module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the swap module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the swap module.
 * @returns {Promise<Object>} Resolves with the response generated for the swap route.
 */
export async function POST(request, { params }) {
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Only staff can edit tournament pairings from this flow." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const leftMatchId = normalizeMatchId(body.leftMatchId);
  const leftSlot = String(body.leftSlot || "").trim();
  const rightMatchId = normalizeMatchId(body.rightMatchId);
  const rightSlot = String(body.rightSlot || "").trim();
  const reason = String(body.reason || "").trim().slice(0, 280);

  if (!leftMatchId || !rightMatchId) {
    return NextResponse.json({ success: false, error: "Two pairing identifiers are required." }, { status: 400 });
  }

  await connectToDatabase();
  const tournament = await findTournamentByIdOr404(params.id);
  if (!tournament) {
    return NextResponse.json({ success: false, error: "Tournament not found." }, { status: 404 });
  }

  try {
    const swap = swapPairingPlayers(tournament, {
      leftMatchId,
      leftSlot,
      rightMatchId,
      rightSlot
    });

    tournament.bracketEdits = [
      ...(tournament.bracketEdits || []),
      {
        action: "swap_pairing_slots",
        actorUserId: String(session.sub || ""),
        actorUsername: session.username || "",
        reason,
        details: {
          leftMatchId,
          leftSlot,
          rightMatchId,
          rightSlot,
          before: swap.before,
          after: swap.after
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
      error: error.message || "Pairing swap failed."
    }, { status: 409 });
  }
}
