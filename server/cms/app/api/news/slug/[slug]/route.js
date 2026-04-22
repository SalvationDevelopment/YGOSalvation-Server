import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { NewsPost } from "@/models/NewsPost";
import { normalizeSlug } from "@/lib/news";
import { serializeNewsPost } from "@/lib/serializers";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Handles GET requests for the slug route.
 * @param {Object} _request The _request value provides an input used by the slug module.
 * @param {Object} context The context object supplies the structured input used by the slug module, including the `params` property.
 * @param {(Object|Promise<*>)} context.params The `params` property supplies structured input used by the slug module.
 * @param {string} context.params.slug The `params.slug` property supplies structured input used by the slug module.
 * @returns {Promise<Object>} Resolves with the response generated for the slug route.
 */
export async function GET(_request, { params }) {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  log(`GET /api/news/slug/${normalizedSlug}`);

  if (!normalizedSlug) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  await connectToDatabase();
  const post = await NewsPost.findOne({ slug: normalizedSlug }).lean();

  if (!post) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, post: serializeNewsPost(post) });
}
