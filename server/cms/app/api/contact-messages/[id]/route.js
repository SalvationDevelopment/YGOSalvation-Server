import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-auth";
import { serializeContactMessage } from "@/lib/contact-messages";
import { ContactMessage } from "@/models/ContactMessage";
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
  log(`PATCH /api/contact-messages/${id}`);
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const status = String(body.status || "").trim().toLowerCase();
  if (!["new", "reviewed", "closed"].includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid status." }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!updated) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: serializeContactMessage(updated) });
}
