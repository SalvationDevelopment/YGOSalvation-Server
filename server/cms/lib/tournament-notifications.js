import { TournamentAlert } from "@/models/TournamentAlert";
import { TournamentReminder } from "@/models/TournamentReminder";
import { TournamentRating } from "@/models/TournamentRating";

const REMINDER_OFFSET_MINUTES = {
  "24h": 24 * 60,
  "4h": 4 * 60,
  "30m": 30,
};

/**
 * Executes the to tournament id helper used by the tournament notifications module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament notifications module, including the `_id` and `id` properties.
 * @param {{toString: function(): string}|string} tournament._id The `_id` property supplies structured input used by the tournament notifications module.
 * @param {string} tournament.id The `id` property supplies structured input used by the tournament notifications module.
 * @returns {string} Returns the value produced by the tournament notifications module.
 */
function toTournamentId(tournament) {
  return typeof tournament._id?.toString === "function" ? tournament._id.toString() : String(tournament.id || "");
}

/**
 * Creates unique user targets for the tournament notifications module.
 * @param {Array} targets The targets array supplies the ordered values used by the tournament notifications module, each item uses the `userId` and `username` properties.
 * @param {string} targets[].userId The `[].userId` property describes data read from each item used by the tournament notifications module.
 * @param {string} targets[].username The `[].username` property describes data read from each item used by the tournament notifications module.
 * @returns {{userId: string, username: string}[]} Returns the value produced by the tournament notifications module.
 */
function uniqueUserTargets(targets = []) {
  const seen = new Set();
  return targets.filter((target) => {
    const key = `${target.userId || ""}:${target.username || ""}`;
    if (!target.username || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Builds entrant targets used by the tournament notifications module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament notifications module, including the `entrants` property.
 * @param {Array} tournament.entrants The `entrants` property supplies structured input used by the tournament notifications module.
 * @returns {{userId: string, username: string}[]} Returns the value produced by the tournament notifications module.
 */
function buildEntrantTargets(tournament) {
  return (tournament.entrants || [])
    .filter((entrant) => entrant.registrationState !== "dropped")
    .map((entrant) => ({
      userId: entrant.userId || "",
      username: entrant.username,
    }));
}

/**
 * Normalizes reminder offsets used by the tournament notifications module.
 * @param {Array} reminderOffsets The reminderOffsets value provides an input used by the tournament notifications module.
 * @returns {string[]} Returns the value produced by the tournament notifications module.
 */
export function normalizeReminderOffsets(reminderOffsets = []) {
  const unique = [...new Set((Array.isArray(reminderOffsets) ? reminderOffsets : []).map((offset) => String(offset).trim()).filter(Boolean))];
  return unique.filter((offset) => REMINDER_OFFSET_MINUTES[offset] !== undefined);
}

/**
 * Syncs tournament reminders used by the tournament notifications module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament notifications module, including the `reminderOffsets`, `scheduledStartAt`, and `slug` properties.
 * @param {Array} tournament.reminderOffsets The `reminderOffsets` property supplies structured input used by the tournament notifications module.
 * @param {Date} tournament.scheduledStartAt The `scheduledStartAt` property supplies structured input used by the tournament notifications module.
 * @param {string} tournament.slug The `slug` property supplies structured input used by the tournament notifications module.
 * @returns {Promise<Array>} Resolves with the value produced by the tournament notifications module.
 */
export async function syncTournamentReminders(tournament) {
  const tournamentId = toTournamentId(tournament);
  const offsets = normalizeReminderOffsets(tournament.reminderOffsets);
  const scheduledStartAt = new Date(tournament.scheduledStartAt);

  await TournamentReminder.updateMany(
    { tournamentId, status: "pending" },
    { $set: { status: "cancelled" } }
  );

  if (Number.isNaN(scheduledStartAt.getTime())) {
    return [];
  }

  const reminders = offsets.flatMap((offsetLabel) => {
    const offsetMinutes = REMINDER_OFFSET_MINUTES[offsetLabel];
    const scheduledFor = new Date(scheduledStartAt.getTime() - offsetMinutes * 60 * 1000);
    return ["email", "in_app"].map((channel) => ({
      tournamentId,
      tournamentSlug: tournament.slug,
      offsetLabel,
      offsetMinutes,
      scheduledFor,
      channel,
      status: "pending",
      sentAt: null,
      error: "",
    }));
  });

  if (!reminders.length) {
    return [];
  }

  return TournamentReminder.insertMany(reminders, { ordered: false });
}

/**
 * Creates tournament alerts used by the tournament notifications module.
 * @param {Object} options The options object supplies the structured input used by the tournament notifications module, including the `message`, `metadata`, `targets`, `title`, `tournament`, and `type` properties.
 * @param {string} options.message The `message` property supplies structured input used by the tournament notifications module.
 * @param {Object} options.metadata The `metadata` property supplies structured input used by the tournament notifications module.
 * @param {Array} options.targets The `targets` property supplies structured input used by the tournament notifications module.
 * @param {number} options.targets.length The `targets.length` property supplies structured input used by the tournament notifications module.
 * @param {string} options.title The `title` property supplies structured input used by the tournament notifications module.
 * @param {Object} options.tournament The `tournament` property supplies structured input used by the tournament notifications module.
 * @param {string} options.type The `type` property supplies structured input used by the tournament notifications module.
 * @returns {Promise<Array>} Resolves with the value produced by the tournament notifications module.
 */
export async function createTournamentAlerts({ tournament, type, title, message, targets, metadata = {} }) {
  const tournamentId = toTournamentId(tournament);
  const resolvedTargets = uniqueUserTargets(targets?.length ? targets : buildEntrantTargets(tournament));

  if (!resolvedTargets.length) {
    return [];
  }

  return TournamentAlert.insertMany(
    resolvedTargets.map((target) => ({
      tournamentId,
      userId: target.userId || "",
      username: target.username,
      type,
      title,
      message,
      metadata,
    })),
    { ordered: false }
  );
}

/**
 * Executes the expected score helper used by the tournament notifications module.
 * @param {number} playerRating The playerRating value provides an input used by the tournament notifications module.
 * @param {number} opponentRating The opponentRating value provides an input used by the tournament notifications module.
 * @returns {number} Returns the value produced by the tournament notifications module.
 */
function expectedScore(playerRating, opponentRating) {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
}

/**
 * Executes the k factor for helper used by the tournament notifications module.
 * @param {Object} record The record object supplies the structured input used by the tournament notifications module, including the `provisionalGames` property.
 * @param {number} record.provisionalGames The `provisionalGames` property supplies structured input used by the tournament notifications module.
 * @returns {number} Returns the value produced by the tournament notifications module.
 */
function kFactorFor(record) {
  return record.provisionalGames < 10 ? 40 : 24;
}

/**
 * Gets or create rating used by the tournament notifications module.
 * @param {Object} options The options object supplies the structured input used by the tournament notifications module, including the `leagueId`, `userId`, and `username` properties.
 * @param {string} options.leagueId The `leagueId` property supplies structured input used by the tournament notifications module.
 * @param {string} options.userId The `userId` property supplies structured input used by the tournament notifications module.
 * @param {string} options.username The `username` property supplies structured input used by the tournament notifications module.
 * @returns {Promise<Object>} Resolves with the value produced by the tournament notifications module.
 */
async function getOrCreateRating({ leagueId, userId, username }) {
  let rating = await TournamentRating.findOne({ leagueId, userId });
  if (!rating) {
    rating = await TournamentRating.create({
      leagueId,
      userId,
      username,
      rating: 1200,
      provisionalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      byes: 0,
      history: [],
    });
  }
  return rating;
}

/**
 * Applies tournament elo for pairing used by the tournament notifications module.
 * @param {Object} options The options object supplies the structured input used by the tournament notifications module, including the `pairing`, `result`, and `tournament` properties.
 * @param {Object} options.pairing The `pairing` property supplies structured input used by the tournament notifications module.
 * @param {string} options.pairing.matchId The `pairing.matchId` property supplies structured input used by the tournament notifications module.
 * @param {string} options.pairing.playerA The `pairing.playerA` property supplies structured input used by the tournament notifications module.
 * @param {string} options.pairing.playerB The `pairing.playerB` property supplies structured input used by the tournament notifications module.
 * @param {string} options.result The `result` property supplies structured input used by the tournament notifications module.
 * @param {Object} options.tournament The `tournament` property supplies structured input used by the tournament notifications module.
 * @param {Array} options.tournament.entrants The `tournament.entrants` property supplies structured input used by the tournament notifications module.
 * @param {string} options.tournament.entrants[].username The `tournament.entrants[].username` property supplies structured input used by the tournament notifications module.
 * @param {string} options.tournament.leagueId The `tournament.leagueId` property supplies structured input used by the tournament notifications module.
 * @param {boolean} options.tournament.ranked The `tournament.ranked` property supplies structured input used by the tournament notifications module.
 * @returns {Promise<({leagueId: string, playerA: {username: string, previousRating: number, nextRating: number, delta: number}, playerB: {username: string, previousRating: number, nextRating: number, delta: number}}|null)>} Resolves with the value produced by the tournament notifications module.
 */
export async function applyTournamentEloForPairing({ tournament, pairing, result }) {
  if (!tournament.ranked || pairing.playerB === "BYE") {
    return null;
  }

  const entrants = tournament.entrants || [];
  const playerAEntrant = entrants.find((entrant) => entrant.username === pairing.playerA);
  const playerBEntrant = entrants.find((entrant) => entrant.username === pairing.playerB);

  if (!playerAEntrant?.userId || !playerBEntrant?.userId) {
    return null;
  }

  const [playerARating, playerBRating] = await Promise.all([
    getOrCreateRating({
      leagueId: tournament.leagueId,
      userId: playerAEntrant.userId,
      username: playerAEntrant.username,
    }),
    getOrCreateRating({
      leagueId: tournament.leagueId,
      userId: playerBEntrant.userId,
      username: playerBEntrant.username,
    }),
  ]);

  const scoreA = result === "player_a_win" ? 1 : result === "player_b_win" ? 0 : 0.5;
  const scoreB = result === "player_b_win" ? 1 : result === "player_a_win" ? 0 : 0.5;
  const expectedA = expectedScore(playerARating.rating, playerBRating.rating);
  const expectedB = expectedScore(playerBRating.rating, playerARating.rating);
  const kA = kFactorFor(playerARating);
  const kB = kFactorFor(playerBRating);
  const preA = playerARating.rating;
  const preB = playerBRating.rating;
  const nextA = Math.round(preA + kA * (scoreA - expectedA));
  const nextB = Math.round(preB + kB * (scoreB - expectedB));
  const happenedAt = new Date();

  playerARating.rating = nextA;
  playerBRating.rating = nextB;
  playerARating.provisionalGames += 1;
  playerBRating.provisionalGames += 1;
  playerARating.lastMatchAt = happenedAt;
  playerBRating.lastMatchAt = happenedAt;

  if (scoreA === 1) {
    playerARating.wins += 1;
    playerBRating.losses += 1;
  } else if (scoreB === 1) {
    playerBRating.wins += 1;
    playerARating.losses += 1;
  } else {
    playerARating.draws += 1;
    playerBRating.draws += 1;
  }

  playerARating.history.push({
    tournamentId: toTournamentId(tournament),
    matchId: pairing.matchId || "",
    preRating: preA,
    postRating: nextA,
    expectedScore: Number(expectedA.toFixed(4)),
    actualScore: scoreA,
    kFactor: kA,
    happenedAt,
  });
  playerBRating.history.push({
    tournamentId: toTournamentId(tournament),
    matchId: pairing.matchId || "",
    preRating: preB,
    postRating: nextB,
    expectedScore: Number(expectedB.toFixed(4)),
    actualScore: scoreB,
    kFactor: kB,
    happenedAt,
  });

  await Promise.all([playerARating.save(), playerBRating.save()]);

  return {
    leagueId: tournament.leagueId,
    playerA: {
      username: pairing.playerA,
      previousRating: preA,
      nextRating: nextA,
      delta: nextA - preA,
    },
    playerB: {
      username: pairing.playerB,
      previousRating: preB,
      nextRating: nextB,
      delta: nextB - preB,
    },
  };
}

/**
 * Creates round start alerts used by the tournament notifications module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament notifications module, including the `currentRoundNumber` and `name` properties.
 * @param {number} tournament.currentRoundNumber The `currentRoundNumber` property supplies structured input used by the tournament notifications module.
 * @param {string} tournament.name The `name` property supplies structured input used by the tournament notifications module.
 * @returns {Promise<Array>} Resolves with the value produced by the tournament notifications module.
 */
export async function createRoundStartAlerts(tournament) {
  const currentRoundNumber = tournament.currentRoundNumber || 0;
  if (!currentRoundNumber) {
    return [];
  }
  return createTournamentAlerts({
    tournament,
    type: "round_started",
    title: `${tournament.name}: Round ${currentRoundNumber} started`,
    message: `Round ${currentRoundNumber} is now active. Check your pairings and join when ready.`,
    metadata: {
      roundNumber: currentRoundNumber,
      status: tournament.status,
    },
  });
}

/**
 * Creates tournament result alerts used by the tournament notifications module.
 * @param {Object} options The options object supplies the structured input used by the tournament notifications module, including the `pairing`, `ratingDelta`, `result`, and `tournament` properties.
 * @param {Object} options.pairing The `pairing` property supplies structured input used by the tournament notifications module.
 * @param {string} options.pairing.matchId The `pairing.matchId` property supplies structured input used by the tournament notifications module.
 * @param {string} options.pairing.playerA The `pairing.playerA` property supplies structured input used by the tournament notifications module.
 * @param {string} options.pairing.playerB The `pairing.playerB` property supplies structured input used by the tournament notifications module.
 * @param {string} options.pairing.round The `pairing.round` property supplies structured input used by the tournament notifications module.
 * @param {number} options.pairing.table The `pairing.table` property supplies structured input used by the tournament notifications module.
 * @param {string} options.pairing.winner The `pairing.winner` property supplies structured input used by the tournament notifications module.
 * @param {({leagueId: string, playerA: {username: string, previousRating: number, nextRating: number, delta: number}, playerB: {username: string, previousRating: number, nextRating: number, delta: number}}|null)} options.ratingDelta The `ratingDelta` property supplies structured input used by the tournament notifications module.
 * @param {string} options.result The `result` property supplies structured input used by the tournament notifications module.
 * @param {Object} options.tournament The `tournament` property supplies structured input used by the tournament notifications module.
 * @param {string} options.tournament.name The `tournament.name` property supplies structured input used by the tournament notifications module.
 * @param {string} options.tournament.ownerUserId The `tournament.ownerUserId` property supplies structured input used by the tournament notifications module.
 * @param {string} options.tournament.ownerUsername The `tournament.ownerUsername` property supplies structured input used by the tournament notifications module.
 * @returns {Promise<Array>} Resolves with the value produced by the tournament notifications module.
 */
export async function createTournamentResultAlerts({ tournament, pairing, result, ratingDelta }) {
  const title = `${tournament.name}: Match result recorded`;
  const summary = result === "draw"
    ? `${pairing.playerA} and ${pairing.playerB} drew their match.`
    : `${pairing.winner} won the match between ${pairing.playerA} and ${pairing.playerB}.`;
  const targets = buildEntrantTargets(tournament).filter((target) => [pairing.playerA, pairing.playerB, tournament.ownerUsername].includes(target.username))
    .concat([{ userId: tournament.ownerUserId, username: tournament.ownerUsername }]);

  return createTournamentAlerts({
    tournament,
    type: "match_result_recorded",
    title,
    message: summary,
    targets,
    metadata: {
      matchId: pairing.matchId || "",
      round: pairing.round,
      table: pairing.table,
      result,
      ratingDelta,
    },
  });
}
