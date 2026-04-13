import { Tournament } from "@/models/Tournament";

/**
 * Executes the now date helper used by the tournament lifecycle module.
 * @param {number} input The input value provides an input used by the tournament lifecycle module.
 * @returns {Date} Returns the value produced by the tournament lifecycle module.
 */
function nowDate(input) {
  return input instanceof Date ? input : new Date(input || Date.now());
}

/**
 * Calculates grace closes at used by the tournament lifecycle module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament lifecycle module, including the `gracePeriodMinutes` and `scheduledStartAt` properties.
 * @param {number} tournament.gracePeriodMinutes The `gracePeriodMinutes` property supplies structured input used by the tournament lifecycle module.
 * @param {Date} tournament.scheduledStartAt The `scheduledStartAt` property supplies structured input used by the tournament lifecycle module.
 * @returns {Date} Returns the value produced by the tournament lifecycle module.
 */
export function calculateGraceClosesAt(tournament) {
  const startAt = new Date(tournament.scheduledStartAt);
  return new Date(startAt.getTime() + (Number(tournament.gracePeriodMinutes) || 0) * 60 * 1000);
}

/**
 * Applies tournament lifecycle used by the tournament lifecycle module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament lifecycle module, including the `scheduledStartAt` property.
 * @param {Date} tournament.scheduledStartAt The `scheduledStartAt` property supplies structured input used by the tournament lifecycle module.
 * @param {Date} inputNow The inputNow value provides an input used by the tournament lifecycle module.
 * @returns {boolean} Returns the value produced by the tournament lifecycle module.
 */
export function applyTournamentLifecycle(tournament, inputNow = new Date()) {
  const now = nowDate(inputNow);
  let changed = false;

  if (tournament.status === "Registration Open" && new Date(tournament.scheduledStartAt) <= now) {
    tournament.status = "Registration Grace";
    changed = true;
  }

  return changed;
}

/**
 * Runs tournament lifecycle tick used by the tournament lifecycle module.
 * @param {Date} inputNow The inputNow value provides an input used by the tournament lifecycle module.
 * @returns {Promise<Object>} Resolves with the value produced by the tournament lifecycle module.
 */
export async function runTournamentLifecycleTick(inputNow = new Date()) {
  const now = nowDate(inputNow);
  const tournaments = await Tournament.find({
    status: "Registration Open",
    scheduledStartAt: { $lte: now }
  });

  let updated = 0;
  for (const tournament of tournaments) {
    if (applyTournamentLifecycle(tournament, now)) {
      await tournament.save();
      updated += 1;
    }
  }

  return { updated };
}

/**
 * Syncs tournament lifecycle by id used by the tournament lifecycle module.
 * @param {string} id The id value provides an input used by the tournament lifecycle module.
 * @param {Date} inputNow The inputNow value provides an input used by the tournament lifecycle module.
 * @returns {Promise<(Object|null)>} Resolves with the value produced by the tournament lifecycle module.
 */
export async function syncTournamentLifecycleById(id, inputNow = new Date()) {
  const tournament = await Tournament.findById(id);
  if (!tournament) {
    return null;
  }

  if (applyTournamentLifecycle(tournament, inputNow)) {
    await tournament.save();
  }

  return tournament;
}

/**
 * Syncs tournament lifecycle by slug used by the tournament lifecycle module.
 * @param {string} slug The slug value provides an input used by the tournament lifecycle module.
 * @param {Date} inputNow The inputNow value provides an input used by the tournament lifecycle module.
 * @returns {Promise<(Object|null)>} Resolves with the value produced by the tournament lifecycle module.
 */
export async function syncTournamentLifecycleBySlug(slug, inputNow = new Date()) {
  const tournament = await Tournament.findOne({ slug });
  if (!tournament) {
    return null;
  }

  if (applyTournamentLifecycle(tournament, inputNow)) {
    await tournament.save();
  }

  return tournament;
}
