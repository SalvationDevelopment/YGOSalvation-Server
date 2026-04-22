import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-auth";
import { Background } from "@/models/Background";
import { serializeBackground } from "@/lib/serializers";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles PATCH requests for the id route.
 * @param {Object} request The request request provides the incoming data used by the id route.
 * @param {Object} context The context object supplies the structured input used by the id module, including the `params` property.
 * @param {(Object|Promise<*>)} context.params The `params` property supplies structured input used by the id module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the id module.
 * @returns {Promise<Object>} Resolves with the response generated for the id route.
 */
export async function PATCH(request, { params }) {
  const { id } = await params;
  log(`PATCH /api/backgrounds/${id}`);
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const updates = {};

  if (body.name !== undefined) updates.name = String(body.name || "").trim();
  if (body.imageUrl !== undefined) updates.imageUrl = String(body.imageUrl || "").trim();

  if (updates.name === "") {
    return NextResponse.json({ success: false, error: "name cannot be empty." }, { status: 400 });
  }
  if (updates.imageUrl === "") {
    return NextResponse.json({ success: false, error: "imageUrl cannot be empty." }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await Background.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!updated) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, background: serializeBackground(updated) });
}

/**
 * Handles DELETE requests for the id route.
 * @param {Object} request The request request provides the incoming data used by the id route.
 * @param {Object} context The context object supplies the structured input used by the id module, including the `params` property.
 * @param {(Object|Promise<*>)} context.params The `params` property supplies structured input used by the id module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the id module.
 * @returns {Promise<Object>} Resolves with the response generated for the id route.
 */
export async function DELETE(request, { params }) {
  const { id } = await params;
  log(`DELETE /api/backgrounds/${id}`);
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const result = await Background.findByIdAndDelete(id);
  if (!result) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
