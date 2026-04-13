import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/api-auth";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles GET requests for the session route.
 * @param {Object} request The request request provides the incoming data used by the session route.
 * @returns {Promise<Object>} Resolves with the response generated for the session route.
 */
export async function GET(request) {
  log("GET /api/auth/session");
  const session = await getApiSession(request);

  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: session.sub,
      email: session.email,
      username: session.username,
      role: session.role
    }
  });
}
