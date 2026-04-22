import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-auth";
import { Cover } from "@/models/Cover";
import { serializeCover } from "@/lib/serializers";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles GET requests for the covers route.
 * @returns {Promise<Object>} Resolves with the response generated for the covers route.
 */
export async function GET() {
  log("GET /api/covers");
  await connectToDatabase();
  const covers = await Cover.find({ isPublic: true }).sort({ createdAt: 1 }).lean();
  return NextResponse.json({ success: true, covers: covers.map(serializeCover) });
}

/**
 * Handles POST requests for the covers route.
 * @param {Object} request The request request provides the incoming data used by the covers route.
 * @returns {Promise<Object>} Resolves with the response generated for the covers route.
 */
export async function POST(request) {
  log("POST /api/covers");
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
  const created = await Cover.create({ name, imageUrl, isPublic: true });

  return NextResponse.json({ success: true, cover: serializeCover(created) });
}
