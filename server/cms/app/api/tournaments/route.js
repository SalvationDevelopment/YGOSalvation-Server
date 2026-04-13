import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getApiSession, requireApiSession } from "@/lib/api-auth";
import { serializeTournament } from "@/lib/serializers";
import { ensureDefaultLeagues } from "@/lib/tournament-bootstrap";
import { runTournamentLifecycleTick } from "@/lib/tournament-lifecycle";
import { TournamentAlert } from "@/models/TournamentAlert";
import { TournamentReminder } from "@/models/TournamentReminder";
import { League } from "@/models/League";
import { Tournament } from "@/models/Tournament";
import { syncTournamentReminders } from "@/lib/tournament-notifications";

const ACTIVE_OWNER_STATUSES = ["Registration Open", "Registration Grace", "Round In Progress", "Between Rounds"];

/**
 * Executes the slugify helper used by the tournaments module.
 * @param {string} value The value value provides an input used by the tournaments module.
 * @returns {string} Returns the value produced by the tournaments module.
 */
function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140) || `tournament-${Date.now()}`;
}

/**
 * Parses reminder offsets used by the tournaments module.
 * @param {(string|Array)} value The value value provides an input used by the tournaments module.
 * @returns {string[]} Returns the value produced by the tournaments module.
 */
function parseReminderOffsets(value) {
  if (!Array.isArray(value)) {
    return ["24h", "4h", "30m"];
  }
  const unique = [...new Set(value.map((entry) => String(entry).trim()).filter(Boolean))];
  return unique.length ? unique : ["24h", "4h", "30m"];
}

/**
 * Builds rounds overview used by the tournaments module.
 * @param {number} roundCount The roundCount value provides an input used by the tournaments module.
 * @returns {Array} Returns the value produced by the tournaments module.
 */
function buildRoundsOverview(roundCount) {
  const rounds = [];
  for (let index = 0; index < roundCount; index += 1) {
    rounds.push({
      name: `Round ${index + 1}`,
      status: index === 0 ? "Pending" : "Pending"
    });
  }
  return rounds;
}

/**
 * Creates unique slug used by the tournaments module.
 * @param {string} baseSlug The baseSlug value provides an input used by the tournaments module.
 * @returns {Promise<string>} Resolves with the value produced by the tournaments module.
 */
async function createUniqueSlug(baseSlug) {
  let candidate = baseSlug;
  let attempt = 1;

  while (await Tournament.exists({ slug: candidate })) {
    candidate = `${baseSlug}-${attempt}`;
    attempt += 1;
  }

  return candidate;
}

/**
 * Validates body used by the tournaments module.
 * @param {Object} body The body object supplies the structured input used by the tournaments module, including the `capacity`, `configuredRoundCount`, `description`, `format`, `gracePeriodMinutes`, `name`, and `scheduledStart` properties.
 * @param {number} body.capacity The `capacity` property supplies structured input used by the tournaments module.
 * @param {number} body.configuredRoundCount The `configuredRoundCount` property supplies structured input used by the tournaments module.
 * @param {string} body.description The `description` property supplies structured input used by the tournaments module.
 * @param {string} body.format The `format` property supplies structured input used by the tournaments module.
 * @param {number} body.gracePeriodMinutes The `gracePeriodMinutes` property supplies structured input used by the tournaments module.
 * @param {string} body.name The `name` property supplies structured input used by the tournaments module.
 * @param {string} body.scheduledStart The `scheduledStart` property supplies structured input used by the tournaments module.
 * @param {Object} league The league object supplies the structured input used by the tournaments module, including the `supportedFormats` property.
 * @param {Array} league.supportedFormats The `supportedFormats` property supplies structured input used by the tournaments module.
 * @returns {Array} Returns the value produced by the tournaments module.
 */
function validateBody(body, league) {
  const errors = [];
  const capacity = Number(body.capacity);
  const rounds = Number(body.configuredRoundCount);
  const grace = Number(body.gracePeriodMinutes);
  const scheduledStartAt = new Date(body.scheduledStart);

  if (!String(body.name || "").trim()) {
    errors.push("Tournament name is required.");
  }
  if (!String(body.description || "").trim()) {
    errors.push("Description is required.");
  }
  if (!league) {
    errors.push("Selected league was not found.");
  }
  if (capacity < 4 || capacity > 64) {
    errors.push("Capacity must be between 4 and 64.");
  }
  if (rounds < 1 || rounds > 7) {
    errors.push("Configured rounds must be between 1 and 7.");
  }
  if (grace < 0 || grace > 30) {
    errors.push("Grace period must be between 0 and 30 minutes.");
  }
  if (Number.isNaN(scheduledStartAt.getTime()) || scheduledStartAt <= new Date()) {
    errors.push("Scheduled start must be in the future.");
  }
  if (league && !league.supportedFormats.includes(body.format)) {
    errors.push("Selected format is not allowed for this league.");
  }

  return errors;
}

/**
 * Handles GET requests for the tournaments route.
 * @param {Request} request The request object provides the incoming data used by the tournaments route.
 * @returns {Promise<Response>} Resolves with the response generated for the tournaments route.
 */
export async function GET(request) {
  await connectToDatabase();
  await ensureDefaultLeagues();
  await runTournamentLifecycleTick();

  const session = await getApiSession(request);
  const query = session?.role === "admin"
    ? {}
    : {
        $or: [
          { visibility: "public" },
          session?.username ? { ownerUsername: session.username } : null
        ].filter(Boolean)
      };
  const tournaments = await Tournament.find(query).sort({ scheduledStartAt: 1 }).lean();
  const tournamentIds = tournaments.map((entry) => entry._id.toString());
  const [reminderCounts, alertCounts] = await Promise.all([
    TournamentReminder.aggregate([
      { $match: { tournamentId: { $in: tournamentIds }, status: { $ne: "cancelled" } } },
      { $group: { _id: "$tournamentId", count: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } } } }
    ]),
    session?.username ? TournamentAlert.aggregate([
      { $match: { tournamentId: { $in: tournamentIds }, username: session.username } },
      { $group: { _id: "$tournamentId", count: { $sum: 1 }, unread: { $sum: { $cond: [{ $eq: ["$readAt", null] }, 1, 0] } } } }
    ]) : [],
  ]);
  const reminderMap = new Map(reminderCounts.map((entry) => [entry._id, entry]));
  const alertMap = new Map(alertCounts.map((entry) => [entry._id, entry]));

  return NextResponse.json({
    success: true,
    tournaments: tournaments.map((entry) => serializeTournament({
      ...entry,
      reminderJobCount: reminderMap.get(entry._id.toString())?.count || 0,
      pendingReminderCount: reminderMap.get(entry._id.toString())?.pending || 0,
      viewerAlertCount: alertMap.get(entry._id.toString())?.count || 0,
      viewerUnreadAlertCount: alertMap.get(entry._id.toString())?.unread || 0,
    }, session || {}))
  });
}

/**
 * Handles POST requests for the tournaments route.
 * @param {Request} request The request object provides the incoming data used by the tournaments route.
 * @returns {Promise<Response>} Resolves with the response generated for the tournaments route.
 */
export async function POST(request) {
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  await connectToDatabase();
  await ensureDefaultLeagues();

  const league = await League.findOne({ slug: String(body.leagueId || "").trim(), active: true }).lean();
  const validationErrors = validateBody(body, league);

  if (validationErrors.length) {
    return NextResponse.json({ success: false, error: validationErrors[0], errors: validationErrors }, { status: 400 });
  }

  const existingTournament = await Tournament.findOne({
    ownerUserId: String(session.sub),
    status: { $in: ACTIVE_OWNER_STATUSES }
  }).lean();

  if (existingTournament) {
    return NextResponse.json({ success: false, error: "Owner may only have one active tournament." }, { status: 409 });
  }

  const baseSlug = slugify(body.name);
  const slug = await createUniqueSlug(baseSlug);
  const roundCount = Number(body.configuredRoundCount);

  const created = await Tournament.create({
    slug,
    name: String(body.name).trim(),
    description: String(body.description).trim(),
    ownerUserId: String(session.sub),
    ownerUsername: session.username,
    leagueId: league.slug,
    leagueName: league.name,
    format: body.format,
    status: "Registration Open",
    visibility: body.visibility === "unlisted" ? "unlisted" : "public",
    capacity: Number(body.capacity),
    scheduledStartAt: new Date(body.scheduledStart),
    checkInRequired: Boolean(body.checkInRequired),
    gracePeriodMinutes: Number(body.gracePeriodMinutes),
    configuredRoundCount: roundCount,
    ranked: Boolean(body.ranked),
    platformManaged: false,
    reminderOffsets: parseReminderOffsets(body.reminderOffsets),
    roomRules: league.roomConfiguration,
    entrants: [],
    roundsOverview: buildRoundsOverview(roundCount),
    standings: [],
    pairings: []
  });
  await syncTournamentReminders(created);

  return NextResponse.json({
    success: true,
    tournament: serializeTournament(created.toObject(), session)
  });
}
