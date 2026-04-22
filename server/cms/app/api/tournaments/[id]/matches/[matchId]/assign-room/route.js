import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, getViewerEntrant, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";
import { resolvePairingId } from "@/lib/tournament-coordinator";

/**
 * Handles POST requests for the assign room route.
 * @param {Request} request The request object provides the incoming data used by the assign room route.
 * @param {Object} context The context object supplies the structured input used by the assign room module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the assign room module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the assign room module.
 * @param {string} context.params.matchId The `params.matchId` property supplies structured input used by the assign room module.
 * @returns {Promise<Response>} Resolves with the response generated for the assign room route.
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
  const isOwnerOrAdmin = tournament.ownerUserId === String(session.sub) || session.role === "admin";
  if (!entrant && !isOwnerOrAdmin) {
    return NextResponse.json({ success: false, error: "You are not allowed to assign a room for this tournament match." }, { status: 403 });
  }

  const pairing = (tournament.pairings || []).find((entry) => resolvePairingId(entry) === params.matchId);
  if (!pairing) {
    return NextResponse.json({ success: false, error: "Tournament pairing not found." }, { status: 404 });
  }

  if (
    !isOwnerOrAdmin
    && pairing.playerA !== session.username
    && pairing.playerB !== session.username
  ) {
    return NextResponse.json({ success: false, error: "You are not assigned to this tournament match." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const roomPort = Number(body.roomPort);
  const roomPass = String(body.roomPass || "").trim();

  if (!Number.isFinite(roomPort) || roomPort <= 0 || !roomPass) {
    return NextResponse.json({ success: false, error: "A valid room assignment is required." }, { status: 400 });
  }

  if (!pairing.roomPort) {
    pairing.roomPort = roomPort;
    pairing.roomPass = roomPass;
    await tournament.save();
  }

  return NextResponse.json({
    success: true,
    tournament: serializeTournamentForViewer(tournament, session),
    matchAccess: {
      matchId: resolvePairingId(pairing),
      roomAssigned: Boolean(pairing.roomPort),
      roomPort: pairing.roomPort || null,
      roomPass: pairing.roomPass || "",
      joinPath: pairing.roomPort ? `/ygopro?room=${pairing.roomPort}` : null
    }
  });
}
