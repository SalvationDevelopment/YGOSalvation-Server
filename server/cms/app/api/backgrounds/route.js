import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-auth";
import { Background } from "@/models/Background";
import { serializeBackground } from "@/lib/serializers";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles GET requests for the backgrounds route.
 * @returns {Promise<Object>} Resolves with the response generated for the backgrounds route.
 */
export async function GET() {
  log("GET /api/backgrounds");
  await connectToDatabase();
  const backgrounds = await Background.find({ isPublic: true }).sort({ createdAt: 1 }).lean();
  return NextResponse.json({ success: true, backgrounds: backgrounds.map(serializeBackground) });
}

/**
 * Handles POST requests for the backgrounds route.
 * @param {Object} request The request request provides the incoming data used by the backgrounds route.
 * @returns {Promise<Object>} Resolves with the response generated for the backgrounds route.
 */
export async function POST(request) {
  log("POST /api/backgrounds");
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = (body.name || "").trim();
  const imageUrl = (body.imageUrl || "").trim();

  if (!name || !imageUrl) {
    return NextResponse.json({ success: false, error: "name and imageUrl are required." }, { status: 400 });
  }

  await connectToDatabase();
  const created = await Background.create({ name, imageUrl, isPublic: true });

  return NextResponse.json({ success: true, background: serializeBackground(created) });
}
