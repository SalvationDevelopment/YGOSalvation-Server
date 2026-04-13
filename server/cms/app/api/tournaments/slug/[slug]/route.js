import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getApiSession } from "@/lib/api-auth";
import { serializeTournament } from "@/lib/serializers";
import { syncTournamentLifecycleBySlug } from "@/lib/tournament-lifecycle";

/**
 * Handles GET requests for the slug route.
 * @param {Object} request The request request provides the incoming data used by the slug route.
 * @param {Object} context The context object supplies the structured input used by the slug module, including the `params` property.
 * @param {(Object|Promise<*>)} context.params The `params` property supplies structured input used by the slug module.
 * @param {string} context.params.slug The `params.slug` property supplies structured input used by the slug module.
 * @returns {Promise<Object>} Resolves with the response generated for the slug route.
 */
export async function GET(request, { params }) {
  await connectToDatabase();
  const { slug } = await params;

  const session = await getApiSession(request);
  const tournament = await syncTournamentLifecycleBySlug(slug);

  if (!tournament) {
    return NextResponse.json({ success: false, error: "Tournament not found." }, { status: 404 });
  }

  if (tournament.visibility === "unlisted" && session?.username !== tournament.ownerUsername && session?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Tournament not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    tournament: serializeTournament(tournament.toObject(), session || {})
  });
}
