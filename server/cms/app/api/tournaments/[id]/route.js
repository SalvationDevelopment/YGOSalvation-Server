import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getApiSession, requireApiSession } from "@/lib/api-auth";
import { ensureDefaultLeagues } from "@/lib/tournament-bootstrap";
import { syncTournamentLifecycleById } from "@/lib/tournament-lifecycle";
import { TournamentAlert } from "@/models/TournamentAlert";
import { TournamentReminder } from "@/models/TournamentReminder";
import { League } from "@/models/League";
import { Tournament } from "@/models/Tournament";
import { serializeTournament } from "@/lib/serializers";
import { syncTournamentReminders } from "@/lib/tournament-notifications";

const EDITABLE_STATUSES = ["Registration Open", "Registration Grace"];

/**
 * Parses reminder offsets used by the id module.
 * @param {(string|Array)} value The value value provides an input used by the id module.
 * @returns {Array} Returns the value produced by the id module.
 */
function parseReminderOffsets(value) {
  if (!Array.isArray(value)) {
    return ["24h", "4h", "30m"];
  }
  const unique = [...new Set(value.map((entry) => String(entry).trim()).filter(Boolean))];
  return unique.length ? unique : ["24h", "4h", "30m"];
}

/**
 * Builds rounds overview used by the id module.
 * @param {number} roundCount The roundCount value provides an input used by the id module.
 * @returns {Array} Returns the value produced by the id module.
 */
function buildRoundsOverview(roundCount) {
  const rounds = [];
  for (let index = 0; index < roundCount; index += 1) {
    rounds.push({
      name: `Round ${index + 1}`,
      status: "Pending"
    });
  }
  return rounds;
}

/**
 * Validates body used by the id module.
 * @param {Object} body The body object supplies the structured input used by the id module, including the `capacity`, `configuredRoundCount`, `description`, `format`, `gracePeriodMinutes`, `name`, and `scheduledStart` properties.
 * @param {number} body.capacity The `capacity` property supplies structured input used by the id module.
 * @param {number} body.configuredRoundCount The `configuredRoundCount` property supplies structured input used by the id module.
 * @param {string} body.description The `description` property supplies structured input used by the id module.
 * @param {string} body.format The `format` property supplies structured input used by the id module.
 * @param {number} body.gracePeriodMinutes The `gracePeriodMinutes` property supplies structured input used by the id module.
 * @param {string} body.name The `name` property supplies structured input used by the id module.
 * @param {string} body.scheduledStart The `scheduledStart` property supplies structured input used by the id module.
 * @param {Object} league The league object supplies the structured input used by the id module, including the `supportedFormats` property.
 * @param {Array} league.supportedFormats The `supportedFormats` property supplies structured input used by the id module.
 * @returns {Array} Returns the value produced by the id module.
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
 * Handles GET requests for the id route.
 * @param {Request} request The request object provides the incoming data used by the id route.
 * @param {Object} context The context object supplies the structured input used by the id module, including the `params` property.
 * @param {{id: string}|Promise<{id: string}>} context.params The `params` property supplies structured input used by the id module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the id module.
 * @returns {Promise<Response>} Resolves with the response generated for the id route.
 */
export async function GET(request, { params }) {
  await connectToDatabase();
  const { id } = await params;
  const session = await getApiSession(request);
  const tournament = await syncTournamentLifecycleById(id);

  if (!tournament) {
    return NextResponse.json({ success: false, error: "Tournament not found." }, { status: 404 });
  }

  const tournamentId = tournament._id.toString();
  const [reminderSummary, alertSummary] = await Promise.all([
    TournamentReminder.aggregate([
      { $match: { tournamentId, status: { $ne: "cancelled" } } },
      { $group: { _id: "$tournamentId", count: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } } } }
    ]),
    session?.username ? TournamentAlert.aggregate([
      { $match: { tournamentId, username: session.username } },
      { $group: { _id: "$tournamentId", count: { $sum: 1 }, unread: { $sum: { $cond: [{ $eq: ["$readAt", null] }, 1, 0] } } } }
    ]) : [],
  ]);
  const reminderCounts = reminderSummary[0] || {};
  const alertCounts = alertSummary[0] || {};

  return NextResponse.json({
    success: true,
    tournament: serializeTournament({
      ...tournament.toObject(),
      reminderJobCount: reminderCounts.count || 0,
      pendingReminderCount: reminderCounts.pending || 0,
      viewerAlertCount: alertCounts.count || 0,
      viewerUnreadAlertCount: alertCounts.unread || 0,
    }, session || {})
  });
}

/**
 * Handles PATCH requests for the id route.
 * @param {Request} request The request object provides the incoming data used by the id route.
 * @param {Object} context The context object supplies the structured input used by the id module, including the `params` property.
 * @param {{id: string}|Promise<{id: string}>} context.params The `params` property supplies structured input used by the id module.
 * @param {string} context.params.id The `params.id` property supplies structured input used by the id module.
 * @returns {Promise<Response>} Resolves with the response generated for the id route.
 */
export async function PATCH(request, { params }) {
  const session = await requireApiSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body = await request.json().catch(() => ({}));

  await connectToDatabase();
  await ensureDefaultLeagues();

  const tournament = await Tournament.findById(id);
  if (!tournament) {
    return NextResponse.json({ success: false, error: "Tournament not found." }, { status: 404 });
  }

  if (tournament.ownerUserId !== String(session.sub) && session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Only the tournament owner can edit this event." }, { status: 403 });
  }

  if (!EDITABLE_STATUSES.includes(tournament.status) || tournament.platformManaged) {
    return NextResponse.json({ success: false, error: "Tournament can no longer be edited." }, { status: 409 });
  }

  const league = await League.findOne({ slug: String(body.leagueId || "").trim(), active: true }).lean();
  const validationErrors = validateBody(body, league);

  if (validationErrors.length) {
    return NextResponse.json({ success: false, error: validationErrors[0], errors: validationErrors }, { status: 400 });
  }

  const nextRoundCount = Number(body.configuredRoundCount);

  tournament.name = String(body.name).trim();
  tournament.description = String(body.description).trim();
  tournament.leagueId = league.slug;
  tournament.leagueName = league.name;
  tournament.format = body.format;
  tournament.visibility = body.visibility === "unlisted" ? "unlisted" : "public";
  tournament.capacity = Number(body.capacity);
  tournament.scheduledStartAt = new Date(body.scheduledStart);
  tournament.checkInRequired = Boolean(body.checkInRequired);
  tournament.gracePeriodMinutes = Number(body.gracePeriodMinutes);
  tournament.configuredRoundCount = nextRoundCount;
  tournament.ranked = Boolean(body.ranked);
  tournament.reminderOffsets = parseReminderOffsets(body.reminderOffsets);
  tournament.roomRules = league.roomConfiguration;

  if (!tournament.pairings.length && !tournament.standings.length) {
    tournament.roundsOverview = buildRoundsOverview(nextRoundCount);
  }

  await tournament.save();
  await syncTournamentReminders(tournament);

  return NextResponse.json({
    success: true,
    tournament: serializeTournament(tournament.toObject(), session)
  });
}
