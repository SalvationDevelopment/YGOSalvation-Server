/**
 * Serializes background used by the serializers module.
 * @param {Object} item The item object supplies the structured input used by the serializers module, including the `_id`, `createdAt`, `imageUrl`, `isPublic`, and `name` properties.
 * @param {string} item._id The `_id` property supplies structured input used by the serializers module.
 * @param {Date} item.createdAt The `createdAt` property supplies structured input used by the serializers module.
 * @param {string} item.imageUrl The `imageUrl` property supplies structured input used by the serializers module.
 * @param {boolean} item.isPublic The `isPublic` property supplies structured input used by the serializers module.
 * @param {string} item.name The `name` property supplies structured input used by the serializers module.
 * @returns {Object} Returns the value produced by the serializers module.
 */
export function serializeBackground(item) {
  return {
    id: item._id.toString(),
    name: item.name,
    imageUrl: item.imageUrl,
    image: { url: item.imageUrl },
    isPublic: item.isPublic,
    createdAt: item.createdAt
  };
}

/**
 * Serializes news post used by the serializers module.
 * @param {Object} item The item object supplies the structured input used by the serializers module, including the `_id`, `body`, `createdAt`, `excerpt`, `slug`, `title`, and `updatedAt` properties.
 * @param {string} item._id The `_id` property supplies structured input used by the serializers module.
 * @param {Object} item.body The `body` property supplies structured input used by the serializers module.
 * @param {Date} item.createdAt The `createdAt` property supplies structured input used by the serializers module.
 * @param {string} item.excerpt The `excerpt` property supplies structured input used by the serializers module.
 * @param {string} item.slug The `slug` property supplies structured input used by the serializers module.
 * @param {string} item.title The `title` property supplies structured input used by the serializers module.
 * @param {Date} item.updatedAt The `updatedAt` property supplies structured input used by the serializers module.
 * @returns {Object} Returns the value produced by the serializers module.
 */
export function serializeNewsPost(item) {
  return {
    id: item._id.toString(),
    title: item.title,
    slug: item.slug,
    body: item.body,
    excerpt: item.excerpt,
    author: {
      username: "YGOSalvation"
    },
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

/**
 * Serializes cover used by the serializers module.
 * @param {Object} item The item object supplies the structured input used by the serializers module, including the `_id`, `createdAt`, `imageUrl`, `isPublic`, and `name` properties.
 * @param {string} item._id The `_id` property supplies structured input used by the serializers module.
 * @param {Date} item.createdAt The `createdAt` property supplies structured input used by the serializers module.
 * @param {string} item.imageUrl The `imageUrl` property supplies structured input used by the serializers module.
 * @param {boolean} item.isPublic The `isPublic` property supplies structured input used by the serializers module.
 * @param {string} item.name The `name` property supplies structured input used by the serializers module.
 * @returns {Object} Returns the value produced by the serializers module.
 */
export function serializeCover(item) {
  return {
    id: item._id.toString(),
    name: item.name,
    imageUrl: item.imageUrl,
    image: { url: item.imageUrl },
    isPublic: item.isPublic,
    createdAt: item.createdAt
  };
}

/**
 * Serializes deck used by the serializers module.
 * @param {Object} item The item object supplies the structured input used by the serializers module, including the `_id`, `createdAt`, `extra`, `main`, `name`, `notes`, `owner`, `side`, and `updatedAt` properties.
 * @param {string} item._id The `_id` property supplies structured input used by the serializers module.
 * @param {Date} item.createdAt The `createdAt` property supplies structured input used by the serializers module.
 * @param {Array} item.extra The `extra` property supplies structured input used by the serializers module.
 * @param {Array} item.main The `main` property supplies structured input used by the serializers module.
 * @param {string} item.name The `name` property supplies structured input used by the serializers module.
 * @param {string} item.notes The `notes` property supplies structured input used by the serializers module.
 * @param {string} item.owner The `owner` property supplies structured input used by the serializers module.
 * @param {number} item.side The `side` property supplies structured input used by the serializers module.
 * @param {Date} item.updatedAt The `updatedAt` property supplies structured input used by the serializers module.
 * @returns {Object} Returns the value produced by the serializers module.
 */
export function serializeDeck(item) {
  return {
    id: item._id.toString(),
    name: item.name,
    owner: item.owner,
    main: item.main,
    extra: item.extra,
    side: item.side,
    notes: item.notes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

/**
 * Serializes league used by the serializers module.
 * @param {Object} item The item object supplies the structured input used by the serializers module, including the `_id`, `active`, `createdAt`, `description`, `name`, `ranked`, `roomConfiguration`, `slug`, `supportedFormats`, `updatedAt`, and `visibility` properties.
 * @param {string} item._id The `_id` property supplies structured input used by the serializers module.
 * @param {boolean} item.active The `active` property supplies structured input used by the serializers module.
 * @param {Date} item.createdAt The `createdAt` property supplies structured input used by the serializers module.
 * @param {string} item.description The `description` property supplies structured input used by the serializers module.
 * @param {string} item.name The `name` property supplies structured input used by the serializers module.
 * @param {boolean} item.ranked The `ranked` property supplies structured input used by the serializers module.
 * @param {Object} item.roomConfiguration The `roomConfiguration` property supplies structured input used by the serializers module.
 * @param {string} item.slug The `slug` property supplies structured input used by the serializers module.
 * @param {Array} item.supportedFormats The `supportedFormats` property supplies structured input used by the serializers module.
 * @param {Date} item.updatedAt The `updatedAt` property supplies structured input used by the serializers module.
 * @param {string} item.visibility The `visibility` property supplies structured input used by the serializers module.
 * @returns {Object} Returns the value produced by the serializers module.
 */
export function serializeLeague(item) {
  return {
    id: item._id.toString(),
    slug: item.slug,
    name: item.name,
    description: item.description,
    active: item.active,
    ranked: item.ranked,
    visibility: item.visibility,
    supportedFormats: item.supportedFormats || [],
    roomConfiguration: item.roomConfiguration,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

/**
 * Serializes tournament used by the serializers module.
 * @param {Object} item The item object supplies the structured input used by the serializers module, including the `_id`, `bracketEdits`, `capacity`, `checkInRequired`, `configuredRoundCount`, `createdAt`, `currentRoundNumber`, `description`, `entrants`, `entrants[]`, `format`, `gracePeriodMinutes`, `leagueId`, `leagueName`, `name`, `ownerUsername`, `pairings`, `pairings[]`, `pendingReminderCount`, `platformManaged`, `ranked`, `reminderJobCount`, `reminderOffsets`, `roomRules`, `roundsOverview`, `scheduledStartAt`, `slug`, `standings`, `updatedAt`, `viewerAlertCount`, `viewerUnreadAlertCount`, and `visibility` properties.
 * @param {string} item._id The `_id` property supplies structured input used by the serializers module.
 * @param {Array} item.bracketEdits The `bracketEdits` property supplies structured input used by the serializers module.
 * @param {number} item.capacity The `capacity` property supplies structured input used by the serializers module.
 * @param {boolean} item.checkInRequired The `checkInRequired` property supplies structured input used by the serializers module.
 * @param {number} item.configuredRoundCount The `configuredRoundCount` property supplies structured input used by the serializers module.
 * @param {Date} item.createdAt The `createdAt` property supplies structured input used by the serializers module.
 * @param {number} item.currentRoundNumber The `currentRoundNumber` property supplies structured input used by the serializers module.
 * @param {string} item.description The `description` property supplies structured input used by the serializers module.
 * @param {Array} item.entrants The `entrants` property supplies structured input used by the serializers module.
 * @param {string} item.entrants[].registrationState The `entrants[].registrationState` property supplies structured input used by the serializers module.
 * @param {string} item.entrants[].username The `entrants[].username` property supplies structured input used by the serializers module.
 * @param {string} item.format The `format` property supplies structured input used by the serializers module.
 * @param {number} item.gracePeriodMinutes The `gracePeriodMinutes` property supplies structured input used by the serializers module.
 * @param {string} item.leagueId The `leagueId` property supplies structured input used by the serializers module.
 * @param {string} item.leagueName The `leagueName` property supplies structured input used by the serializers module.
 * @param {string} item.name The `name` property supplies structured input used by the serializers module.
 * @param {string} item.ownerUsername The `ownerUsername` property supplies structured input used by the serializers module.
 * @param {Array} item.pairings The `pairings` property supplies structured input used by the serializers module.
 * @param {string} item.pairings[].matchId The `pairings[].matchId` property supplies structured input used by the serializers module.
 * @param {Date} item.pairings[].playerAJoinedAt The `pairings[].playerAJoinedAt` property supplies structured input used by the serializers module.
 * @param {Date} item.pairings[].playerBJoinedAt The `pairings[].playerBJoinedAt` property supplies structured input used by the serializers module.
 * @param {string} item.pairings[].round The `pairings[].round` property supplies structured input used by the serializers module.
 * @param {number} item.pairings[].table The `pairings[].table` property supplies structured input used by the serializers module.
 * @param {number} item.pendingReminderCount The `pendingReminderCount` property supplies structured input used by the serializers module.
 * @param {boolean} item.platformManaged The `platformManaged` property supplies structured input used by the serializers module.
 * @param {boolean} item.ranked The `ranked` property supplies structured input used by the serializers module.
 * @param {number} item.reminderJobCount The `reminderJobCount` property supplies structured input used by the serializers module.
 * @param {Array} item.reminderOffsets The `reminderOffsets` property supplies structured input used by the serializers module.
 * @param {Object} item.roomRules The `roomRules` property supplies structured input used by the serializers module.
 * @param {Array} item.roundsOverview The `roundsOverview` property supplies structured input used by the serializers module.
 * @param {Date} item.scheduledStartAt The `scheduledStartAt` property supplies structured input used by the serializers module.
 * @param {string} item.slug The `slug` property supplies structured input used by the serializers module.
 * @param {Array} item.standings The `standings` property supplies structured input used by the serializers module.
 * @param {Date} item.updatedAt The `updatedAt` property supplies structured input used by the serializers module.
 * @param {number} item.viewerAlertCount The `viewerAlertCount` property supplies structured input used by the serializers module.
 * @param {number} item.viewerUnreadAlertCount The `viewerUnreadAlertCount` property supplies structured input used by the serializers module.
 * @param {string} item.visibility The `visibility` property supplies structured input used by the serializers module.
 * @param {Object} viewer The viewer object supplies the structured input used by the serializers module, including the `role` and `username` properties.
 * @param {string} viewer.role The `role` property supplies structured input used by the serializers module.
 * @param {(string|boolean|Array)} viewer.username The `username` property supplies structured input used by the serializers module.
 * @returns {Object} Returns the value produced by the serializers module.
 */
export function serializeTournament(item, viewer = {}) {
  const viewerUsername = viewer.username || "";
  const isAdminViewer = viewer.role === "admin";
  const entrants = Array.isArray(item.entrants) ? item.entrants : [];
  const viewerEntrant = viewerUsername
    ? entrants.find((entrant) => entrant.username === viewerUsername)
    : null;
  const pairings = Array.isArray(item.pairings) ? item.pairings : [];
  const startAt = new Date(item.scheduledStartAt);
  const graceClosesAt = new Date(startAt.getTime() + (Number(item.gracePeriodMinutes) || 0) * 60 * 1000);
  const currentRoundLabel = `Round ${item.currentRoundNumber || 1}`;
  const currentRoundPairings = pairings.filter((pairing) => pairing.round === currentRoundLabel);
  const liveMatches = currentRoundPairings.filter((pairing) => pairing.status === "Dueling");
  const waitingMatches = currentRoundPairings.filter((pairing) => pairing.status === "Waiting For Opponent");
  const completedMatches = currentRoundPairings.filter((pairing) => pairing.result !== "pending");

  return {
    id: item._id.toString(),
    slug: item.slug,
    name: item.name,
    description: item.description,
    leagueId: item.leagueId,
    league: item.leagueName,
    format: item.format,
    ranked: item.ranked,
    capacity: item.capacity,
    preregistered: entrants.filter((entrant) => entrant.registrationState !== "dropped").length,
    status: item.status,
    registrationOpen: item.status === "Registration Open" || item.status === "Registration Grace",
    platformManaged: item.platformManaged,
    ownedByMe: Boolean(viewerUsername && item.ownerUsername === viewerUsername),
    registeredByMe: Boolean(viewerUsername && entrants.some((entrant) => entrant.username === viewerUsername && entrant.registrationState !== "dropped")),
    myRegistrationState: viewerEntrant?.registrationState || null,
    startAt,
    graceClosesAt,
    rounds: item.configuredRoundCount,
    graceMinutes: item.gracePeriodMinutes,
    summary: item.description,
    checkInRequired: item.checkInRequired,
    graceActive: item.status === "Registration Grace",
    currentRoundNumber: item.currentRoundNumber || 0,
    currentRoundLabel,
    reminderOffsets: item.reminderOffsets || [],
    reminderSummary: {
      configuredOffsets: item.reminderOffsets || [],
      reminderJobCount: item.reminderJobCount || 0,
      pendingReminderCount: item.pendingReminderCount || 0,
    },
    entrants: entrants.map((entrant) => entrant.username),
    roundsOverview: item.roundsOverview || [],
    standings: item.standings || [],
    pairings: pairings.map((pairing) => ({
      ...pairing,
      pairingId: pairing.matchId || `${pairing.round}::${pairing.table}`,
      playerAReady: Boolean(pairing.playerAJoinedAt),
      playerBReady: Boolean(pairing.playerBJoinedAt)
    })),
    bracketEdits: isAdminViewer
      ? (item.bracketEdits || []).map((entry) => ({
          action: entry.action,
          actorUserId: entry.actorUserId || "",
          actorUsername: entry.actorUsername || "",
          reason: entry.reason || "",
          details: entry.details || {},
          createdAt: entry.createdAt || null
        }))
      : [],
    liveOverview: {
      liveMatchCount: liveMatches.length,
      waitingMatchCount: waitingMatches.length,
      completedMatchCount: completedMatches.length,
      currentDuelists: liveMatches.flatMap((pairing) => [pairing.playerA, pairing.playerB]).filter((player) => player && player !== "BYE")
    },
    viewerAlertCount: Number(item.viewerAlertCount || 0),
    viewerUnreadAlertCount: Number(item.viewerUnreadAlertCount || 0),
    roomRules: item.roomRules,
    ownerUsername: item.ownerUsername,
    visibility: item.visibility,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}
