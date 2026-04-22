import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-auth";
import { NewsPost } from "@/models/NewsPost";
import { createExcerpt, normalizeSlug } from "@/lib/news";
import { serializeNewsPost } from "@/lib/serializers";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Parses pagination used by the news module.
 * @param {Object} request The request request object provides the incoming data used by the news route, including the `url` property.
 * @param {string} request.url The `url` property supplies structured input used by the news module.
 * @returns {Object} Returns the value produced by the news module.
 */
function parsePagination(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("pageSize") || "10", 10) || 10));

  return { page, pageSize };
}

/**
 * Handles GET requests for the news route.
 * @param {Object} request The request request provides the incoming data used by the news route.
 * @returns {Promise<Object>} Resolves with the response generated for the news route.
 */
export async function GET(request) {
  log("GET /api/news");
  const { page, pageSize } = parsePagination(request);
  await connectToDatabase();

  const totalItems = await NewsPost.countDocuments({});
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const posts = await NewsPost.find({})
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return NextResponse.json({
    success: true,
    posts: posts.map(serializeNewsPost),
    pagination: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages
    }
  });
}

/**
 * Handles POST requests for the news route.
 * @param {Object} request The request request provides the incoming data used by the news route.
 * @returns {Promise<Object>} Resolves with the response generated for the news route.
 */
export async function POST(request) {
  log("POST /api/news");
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const slug = normalizeSlug(body.slug || title);
  const content = String(body.body || "").trim();

  if (!title || !slug || !content) {
    return NextResponse.json({ success: false, error: "title, slug, and body are required." }, { status: 400 });
  }

  await connectToDatabase();

  try {
    const created = await NewsPost.create({
      title,
      slug,
      body: content,
      excerpt: createExcerpt(content)
    });

    return NextResponse.json({ success: true, post: serializeNewsPost(created) });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: "Slug already exists." }, { status: 409 });
    }
    throw error;
  }
}
