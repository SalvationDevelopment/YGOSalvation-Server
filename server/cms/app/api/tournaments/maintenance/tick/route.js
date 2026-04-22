import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { connectToDatabase } from "@/lib/db";
import { runTournamentLifecycleTick } from "@/lib/tournament-lifecycle";

/**
 * Handles POST requests for the tick route.
 * @param {Object} request The request request provides the incoming data used by the tick route.
 * @returns {Promise<Object>} Resolves with the response generated for the tick route.
 */
export async function POST(request) {
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });
  }

  await connectToDatabase();
  const result = await runTournamentLifecycleTick();

  return NextResponse.json({
    success: true,
    updated: result.updated
  });
}
