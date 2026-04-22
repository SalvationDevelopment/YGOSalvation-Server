import { Tournament } from "@/models/Tournament";
import { serializeTournament } from "@/lib/serializers";

/**
 * Finds tournament by id or404 used by the tournaments module.
 * @param {string} id The id value provides an input used by the tournaments module.
 * @returns {Promise<(Object|null)>} Resolves with the value produced by the tournaments module.
 */
export async function findTournamentByIdOr404(id) {
  const tournament = await Tournament.findById(id);
  return tournament;
}

/**
 * Determines whether mutate entrants should be treated as valid in the tournaments module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournaments module, including the `status` property.
 * @returns {boolean} Returns `true` when mutate entrants is valid in the tournaments module and `false` otherwise.
 */
export function canMutateEntrants(tournament) {
  return tournament.status === "Registration Open" || tournament.status === "Registration Grace";
}

/**
 * Gets viewer entrant used by the tournaments module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournaments module, including the `entrants` and `entrants[]` properties.
 * @param {Array} tournament.entrants The `entrants` property supplies structured input used by the tournaments module.
 * @param {string} tournament.entrants[].username The `entrants[].username` property supplies structured input used by the tournaments module.
 * @param {Object} session The session object supplies the structured input used by the tournaments module, including the `username` property.
 * @param {string} session.username The `username` property supplies structured input used by the tournaments module.
 * @returns {(Object|undefined)} Returns the value produced by the tournaments module.
 */
export function getViewerEntrant(tournament, session) {
  return tournament.entrants.find((entrant) => entrant.username === session.username);
}

/**
 * Syncs entrant state flags used by the tournaments module.
 * @param {Object} serialized The serialized object supplies the structured input used by the tournaments module, including the `myRegistrationState` property.
 * @param {(string|Object|null)} serialized.myRegistrationState The `myRegistrationState` property supplies structured input used by the tournaments module.
 * @returns {Object} Returns the value produced by the tournaments module.
 */
export function syncEntrantStateFlags(serialized) {
  return {
    ...serialized,
    registeredByMe: serialized.myRegistrationState !== null && serialized.myRegistrationState !== "dropped",
  };
}

/**
 * Serializes tournament for viewer used by the tournaments module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournaments module, including the `toObject` property.
 * @param {() => Object} tournament.toObject The `toObject` property supplies structured input used by the tournaments module.
 * @param {Object} session The session object provides an input used by the tournaments module.
 * @returns {Object} Returns the value produced by the tournaments module.
 */
export function serializeTournamentForViewer(tournament, session) {
  return syncEntrantStateFlags(serializeTournament(tournament.toObject(), session));
}
