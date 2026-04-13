import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { findTournamentByIdOr404, serializeTournamentForViewer } from "@/app/api/tournaments/_lib";

const CANCELLABLE_STATUSES = ["Registration Open", "Registration Grace"];

/**
 * Handles POST requests for the cancel route.
 * @param {Object} request The request request provides the incoming data used by the cancel route.
 * @param {Object} context The context object supplies the structured input used by the cancel module, including the `params` property.
 * @param {Object} context.params The `params` property supplies structured input used by the cancel module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the cancel module.
 * @returns {Promise<Object>} Resolves with the response generated for the cancel route.
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
    return NextResponse.json({ success: false, error: "Only the tournament owner can cancel this event." }, { status: 403 });
  }

  if (tournament.platformManaged) {
    return NextResponse.json({ success: false, error: "Platform-managed tournaments cannot be cancelled from this flow." }, { status: 409 });
  }

  if (!CANCELLABLE_STATUSES.includes(tournament.status)) {
    return NextResponse.json({ success: false, error: "Tournament can no longer be cancelled." }, { status: 409 });
  }

  tournament.status = "Cancelled";
  await tournament.save();

  return NextResponse.json({
    success: true,
    tournament: serializeTournamentForViewer(tournament, session)
  });
}
