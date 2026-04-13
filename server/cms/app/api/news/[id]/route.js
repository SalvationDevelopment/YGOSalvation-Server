import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-auth";
import { createExcerpt, normalizeSlug } from "@/lib/news";
import { NewsPost } from "@/models/NewsPost";
import { serializeNewsPost } from "@/lib/serializers";
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
  log(`PATCH /api/news/${id}`);
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const updates = {};

  if (body.title !== undefined) {
    updates.title = String(body.title || "").trim();
    if (!updates.title) {
      return NextResponse.json({ success: false, error: "title cannot be empty." }, { status: 400 });
    }
  }

  if (body.slug !== undefined) {
    updates.slug = normalizeSlug(body.slug);
    if (!updates.slug) {
      return NextResponse.json({ success: false, error: "slug cannot be empty." }, { status: 400 });
    }
  }

  if (body.body !== undefined) {
    updates.body = String(body.body || "").trim();
    if (!updates.body) {
      return NextResponse.json({ success: false, error: "body cannot be empty." }, { status: 400 });
    }
    updates.excerpt = createExcerpt(updates.body);
  }

  await connectToDatabase();

  try {
    const updated = await NewsPost.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, post: serializeNewsPost(updated) });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: "Slug already exists." }, { status: 409 });
    }
    throw error;
  }
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
  log(`DELETE /api/news/${id}`);
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const result = await NewsPost.findByIdAndDelete(id);

  if (!result) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
