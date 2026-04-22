import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { Deck } from "@/models/Deck";
import { serializeDeck } from "@/lib/serializers";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Parses card ids used by the id module.
 * @param {Array} value The value array supplies the ordered values used by the id module, each item uses the `id` property.
 * @param {string} value[].id The `[].id` property describes data read from each item used by the id module.
 * @returns {Array} Returns the value produced by the id module.
 */
function parseCardIds(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "number") {
          return entry;
        }
        if (typeof entry === "object" && entry !== null) {
          return Number(entry.id);
        }
        return Number(entry);
      })
      .filter(Number.isFinite);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((entry) => Number(entry.trim()))
    .filter(Number.isFinite);
}

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
  log(`PATCH /api/decks/${id}`);
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const updates = {};

  if (body.name !== undefined) updates.name = (body.name || "").trim();
  if (body.owner !== undefined) updates.owner = (body.owner || "").trim();
  if (body.main !== undefined) updates.main = parseCardIds(body.main);
  if (body.extra !== undefined) updates.extra = parseCardIds(body.extra);
  if (body.side !== undefined) updates.side = parseCardIds(body.side);
  if (body.notes !== undefined) updates.notes = (body.notes || "").trim();

  await connectToDatabase();
  const existing = await Deck.findById(id);
  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (session.role !== "admin" && existing.owner !== session.username) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (session.role !== "admin" && updates.owner && updates.owner !== session.username) {
    return NextResponse.json({ success: false, error: "Cannot transfer owner." }, { status: 403 });
  }

  const updated = await Deck.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

  if (!updated) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, deck: serializeDeck(updated) });
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
  log(`DELETE /api/decks/${id}`);
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const existing = await Deck.findById(id);
  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (session.role !== "admin" && existing.owner !== session.username) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const deleted = await Deck.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
