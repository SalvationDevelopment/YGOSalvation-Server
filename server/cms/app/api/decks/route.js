import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireApiSession } from "@/lib/api-auth";
import { Deck } from "@/models/Deck";
import { serializeDeck } from "@/lib/serializers";
import { create, config as loggerConfig } from "@/lib/logger";

const { log } = create(loggerConfig.main, "[CMS/API]");

/**
 * Parses card ids used by the decks module.
 * @param {(string|Array<(number|string|{id: number|string})>)} value The value supplies the structured input used by the decks module.
 * @returns {number[]} Returns the value produced by the decks module.
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
 * Normalizes deck used by the decks module.
 * @param {Object} body The body object supplies the structured input used by the decks module, including the `extra`, `main`, `name`, `notes`, `owner`, and `side` properties.
 * @param {(string|Array<(number|string|{id: number|string})>)} body.extra The `extra` property supplies structured input used by the decks module.
 * @param {(string|Array<(number|string|{id: number|string})>)} body.main The `main` property supplies structured input used by the decks module.
 * @param {string} body.name The `name` property supplies structured input used by the decks module.
 * @param {string} body.notes The `notes` property supplies structured input used by the decks module.
 * @param {string} body.owner The `owner` property supplies structured input used by the decks module.
 * @param {(string|Array<(number|string|{id: number|string})>)} body.side The `side` property supplies structured input used by the decks module.
 * @returns {{name: string, owner: string, main: number[], extra: number[], side: number[], notes: string}} Returns the value produced by the decks module.
 */
function normalizeDeck(body) {
  return {
    name: (body.name || "").trim(),
    owner: (body.owner || "").trim(),
    main: parseCardIds(body.main),
    extra: parseCardIds(body.extra),
    side: parseCardIds(body.side),
    notes: (body.notes || "").trim()
  };
}

/**
 * Handles GET requests for the decks route.
 * @param {Request} request The request object provides the incoming data used by the decks route, including the `url` property.
 * @param {string} request.url The `url` property supplies structured input used by the decks module.
 * @returns {Promise<Response>} Resolves with the response generated for the decks route.
 */
export async function GET(request) {
  log("GET /api/decks");
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const owner = new URL(request.url).searchParams.get("owner");

  await connectToDatabase();

  const query = {};
  if (session.role !== "admin") {
    query.owner = session.username;
  } else if (owner) {
    query.owner = owner;
  }
  const decks = await Deck.find(query).sort({ name: 1 }).lean();

  return NextResponse.json({ success: true, decks: decks.map(serializeDeck) });
}

/**
 * Handles POST requests for the decks route.
 * @param {Request} request The request object provides the incoming data used by the decks route.
 * @returns {Promise<Response>} Resolves with the response generated for the decks route.
 */
export async function POST(request) {
  log("POST /api/decks");
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const payload = normalizeDeck(body);

  if (!payload.name || !payload.owner) {
    return NextResponse.json({ success: false, error: "name and owner are required." }, { status: 400 });
  }
  if (session.role !== "admin" && payload.owner !== session.username) {
    return NextResponse.json({ success: false, error: "Cannot create deck for another owner." }, { status: 403 });
  }

  await connectToDatabase();

  try {
    const created = await Deck.create(payload);
    return NextResponse.json({ success: true, deck: serializeDeck(created) });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: "Deck with this owner and name already exists." }, { status: 409 });
    }
    throw error;
  }
}
