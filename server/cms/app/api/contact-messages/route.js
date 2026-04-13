import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAdminApi, requireApiSession } from "@/lib/api-auth";
import { serializeContactMessage } from "@/lib/contact-messages";
import { ContactMessage } from "@/models/ContactMessage";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");
const CLASSIFICATIONS = new Set(["bugs", "business", "suggestions", "tournaments", "other"]);

/**
 * Handles GET requests for the contact messages route.
 * @param {Object} request The request request provides the incoming data used by the contact messages route.
 * @returns {Promise<Object>} Resolves with the response generated for the contact messages route.
 */
export async function GET(request) {
  log("GET /api/contact-messages");
  const session = await requireAdminApi(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const messages = await ContactMessage.find({}).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    success: true,
    messages: messages.map(serializeContactMessage)
  });
}

/**
 * Handles POST requests for the contact messages route.
 * @param {Object} request The request request provides the incoming data used by the contact messages route.
 * @returns {Promise<Object>} Resolves with the response generated for the contact messages route.
 */
export async function POST(request) {
  log("POST /api/contact-messages");
  const body = await request.json().catch(() => ({}));
  const classification = String(body.classification || "").trim().toLowerCase();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();

  if (!CLASSIFICATIONS.has(classification)) {
    return NextResponse.json({ success: false, error: "Invalid classification." }, { status: 400 });
  }

  if (!name || !email || !message) {
    return NextResponse.json({ success: false, error: "name, email, and message are required." }, { status: 400 });
  }

  await connectToDatabase();

  const session = await requireApiSession(request);
  const created = await ContactMessage.create({
    classification,
    name,
    email,
    username: session?.username ? String(session.username) : String(body.username || "").trim(),
    subject,
    message
  });

  return NextResponse.json({
    success: true,
    message: serializeContactMessage(created)
  });
}
