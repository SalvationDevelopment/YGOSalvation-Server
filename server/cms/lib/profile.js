import { User } from "@/models/User";

/**
 * Executes the to legacy role helper used by the profile module.
 * @param {string} role The role value provides an input used by the profile module.
 * @returns {Object} Returns the value produced by the profile module.
 */
function toLegacyRole(role) {
  return {
    name: role === "admin" ? "Administrator" : "User"
  };
}

/**
 * Serializes friend used by the profile module.
 * @param {Object} entry The entry object supplies the structured input used by the profile module, including the `_id`, `avatarUrl`, `bio`, `elo`, `id`, `points`, and `username` properties.
 * @param {string} entry._id The `_id` property supplies structured input used by the profile module.
 * @param {string} entry.avatarUrl The `avatarUrl` property supplies structured input used by the profile module.
 * @param {string} entry.bio The `bio` property supplies structured input used by the profile module.
 * @param {number} entry.elo The `elo` property supplies structured input used by the profile module.
 * @param {string} entry.id The `id` property supplies structured input used by the profile module.
 * @param {number} entry.points The `points` property supplies structured input used by the profile module.
 * @param {string} entry.username The `username` property supplies structured input used by the profile module.
 * @returns {Object} Returns the value produced by the profile module.
 */
export function serializeFriend(entry) {
  return {
    id: entry._id?.toString?.() || entry.id || "",
    username: entry.username,
    avatarUrl: entry.avatarUrl || "",
    bio: entry.bio || "",
    points: entry.points ?? 0,
    elo: entry.elo ?? 1200
  };
}

/**
 * Serializes profile used by the profile module.
 * @param {Object} user The user object supplies the structured input used by the profile module, including the `_id`, `avatarUrl`, `bio`, `elo`, `email`, `friends`, `incomingFriendRequests`, `outgoingFriendRequests`, `points`, `role`, `service`, `settings`, and `username` properties.
 * @param {string} user._id The `_id` property supplies structured input used by the profile module.
 * @param {string} user.avatarUrl The `avatarUrl` property supplies structured input used by the profile module.
 * @param {string} user.bio The `bio` property supplies structured input used by the profile module.
 * @param {number} user.elo The `elo` property supplies structured input used by the profile module.
 * @param {string} user.email The `email` property supplies structured input used by the profile module.
 * @param {Array} user.friends The `friends` property supplies structured input used by the profile module.
 * @param {Array} user.incomingFriendRequests The `incomingFriendRequests` property supplies structured input used by the profile module.
 * @param {Array} user.outgoingFriendRequests The `outgoingFriendRequests` property supplies structured input used by the profile module.
 * @param {number} user.points The `points` property supplies structured input used by the profile module.
 * @param {string} user.role The `role` property supplies structured input used by the profile module.
 * @param {boolean} user.service The `service` property supplies structured input used by the profile module.
 * @param {Object} user.settings The `settings` property supplies structured input used by the profile module.
 * @param {string} user.username The `username` property supplies structured input used by the profile module.
 * @returns {Object} Returns the value produced by the profile module.
 */
export function serializeProfile(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: toLegacyRole(user.role),
    admin: user.role === "admin",
    blocked: false,
    points: user.points ?? 0,
    elo: user.elo ?? 1200,
    service: Boolean(user.service),
    avatarUrl: user.avatarUrl || "",
    bio: user.bio || "",
    settings: user.settings || {},
    friends: (user.friends || []).map(serializeFriend),
    incomingFriendRequests: (user.incomingFriendRequests || []).map(serializeFriend),
    outgoingFriendRequests: (user.outgoingFriendRequests || []).map(serializeFriend)
  };
}

/**
 * Loads profile used by the profile module.
 * @param {string} userId The userId value provides an input used by the profile module.
 * @param {Object} options The options object supplies the structured input used by the profile module, including the `lean` property.
 * @param {boolean} options.lean The `lean` property supplies structured input used by the profile module.
 * @returns {Promise<Object>} Resolves with the value produced by the profile module.
 */
export async function loadProfile(userId, options = {}) {
  const query = User.findById(userId)
    .populate("friends", "username avatarUrl bio points elo")
    .populate("incomingFriendRequests", "username avatarUrl bio points elo")
    .populate("outgoingFriendRequests", "username avatarUrl bio points elo");

  return options.lean ? query.lean() : query;
}
