/**
 * Creates match id used by the tournament coordinator module.
 * @param {string} tournamentId The tournamentId value provides an input used by the tournament coordinator module.
 * @param {number} roundNumber The roundNumber value provides an input used by the tournament coordinator module.
 * @param {number} tableNumber The tableNumber value provides an input used by the tournament coordinator module.
 * @returns {string} Returns the value produced by the tournament coordinator module.
 */
function createMatchId(tournamentId, roundNumber, tableNumber) {
  return `${tournamentId}-r${roundNumber}-t${tableNumber}`;
}

/**
 * Resolves pairing id used by the tournament coordinator module.
 * @param {Object} pairing The pairing object supplies the structured input used by the tournament coordinator module, including the `matchId`, `round`, and `table` properties.
 * @param {string} pairing.matchId The `matchId` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.round The `round` property supplies structured input used by the tournament coordinator module.
 * @param {number} pairing.table The `table` property supplies structured input used by the tournament coordinator module.
 * @returns {string} Returns the value produced by the tournament coordinator module.
 */
export function resolvePairingId(pairing) {
  return pairing.matchId || `${pairing.round}::${pairing.table}`;
}

/**
 * Determines whether active entrant should be treated as valid in the tournament coordinator module.
 * @param {Object} entrant The entrant object supplies the structured input used by the tournament coordinator module, including the `registrationState` property.
 * @param {(string|Object)} entrant.registrationState The `registrationState` property supplies structured input used by the tournament coordinator module.
 * @param {boolean} checkInRequired The checkInRequired value provides an input used by the tournament coordinator module.
 * @returns {boolean} Returns `true` when active entrant is valid in the tournament coordinator module and `false` otherwise.
 */
function isActiveEntrant(entrant, checkInRequired) {
  if (!entrant || entrant.registrationState === "dropped" || entrant.registrationState === "eliminated" || entrant.registrationState === "disqualified") {
    return false;
  }

  if (!checkInRequired) {
    return entrant.registrationState === "registered" || entrant.registrationState === "checked_in";
  }

  return entrant.registrationState === "checked_in";
}

/**
 * Collects round one entrants used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `checkInRequired` and `entrants` properties.
 * @param {boolean} tournament.checkInRequired The `checkInRequired` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.entrants The `entrants` property supplies structured input used by the tournament coordinator module.
 * @returns {Object} Returns the value produced by the tournament coordinator module.
 */
export function collectRoundOneEntrants(tournament) {
  return (tournament.entrants || [])
    .filter((entrant) => isActiveEntrant(entrant, tournament.checkInRequired))
    .map((entrant) => ({
      userId: entrant.userId || "",
      username: entrant.username,
      receivedByeCount: entrant.receivedByeCount || 0,
    }))
    .sort((left, right) => left.username.localeCompare(right.username));
}

/**
 * Builds initial standings used by the tournament coordinator module.
 * @param {Array} entrants The entrants array supplies the ordered values used by the tournament coordinator module, each item uses the `username` property.
 * @param {string} entrants[].username The `[].username` property describes data read from each item used by the tournament coordinator module.
 * @returns {Array} Returns the value produced by the tournament coordinator module.
 */
export function buildInitialStandings(entrants) {
  return entrants.map((entrant, index) => ({
    place: index + 1,
    player: entrant.username,
    wins: 0,
    losses: 0,
    draws: 0,
    points: 0,
  }));
}

/**
 * Gets tournament id used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `_id` and `id` properties.
 * @param {string} tournament._id The `_id` property supplies structured input used by the tournament coordinator module.
 * @param {string} tournament.id The `id` property supplies structured input used by the tournament coordinator module.
 * @returns {string} Returns the value produced by the tournament coordinator module.
 */
function getTournamentId(tournament) {
  return tournament._id?.toString?.() || String(tournament.id || "");
}

/**
 * Gets round label used by the tournament coordinator module.
 * @param {number} roundNumber The roundNumber value provides an input used by the tournament coordinator module.
 * @returns {string} Returns the value produced by the tournament coordinator module.
 */
function getRoundLabel(roundNumber) {
  return `Round ${roundNumber}`;
}

/**
 * Gets entrant map used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `entrants` property.
 * @param {Array} tournament.entrants The `entrants` property supplies structured input used by the tournament coordinator module.
 * @returns {Map} Returns the value produced by the tournament coordinator module.
 */
function getEntrantMap(tournament) {
  return new Map((tournament.entrants || []).map((entrant) => [entrant.username, entrant]));
}

/**
 * Determines whether standings eligible entrant should be treated as valid in the tournament coordinator module.
 * @param {Object} entrant The entrant object supplies the structured input used by the tournament coordinator module, including the `registrationState` property.
 * @param {(string|Object)} entrant.registrationState The `registrationState` property supplies structured input used by the tournament coordinator module.
 * @returns {boolean} Returns `true` when standings eligible entrant is valid in the tournament coordinator module and `false` otherwise.
 */
function isStandingsEligibleEntrant(entrant) {
  return entrant.registrationState !== "dropped" && entrant.registrationState !== "disqualified";
}

/**
 * Gets current round pairings used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `currentRoundNumber` and `pairings` properties.
 * @param {number} tournament.currentRoundNumber The `currentRoundNumber` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.pairings The `pairings` property supplies structured input used by the tournament coordinator module.
 * @returns {Array} Returns the value produced by the tournament coordinator module.
 */
function getCurrentRoundPairings(tournament) {
  return (tournament.pairings || []).filter((pairing) => pairing.round === getRoundLabel(tournament.currentRoundNumber || 1));
}

/**
 * Normalizes pairing slot used by the tournament coordinator module.
 * @param {string} slot The slot value provides an input used by the tournament coordinator module.
 * @returns {"playerA"|"playerB"} Returns the value produced by the tournament coordinator module.
 */
function normalizePairingSlot(slot) {
  if (slot === "playerA" || slot === "playerB") {
    return slot;
  }

  throw new Error("A valid pairing slot is required.");
}

/**
 * Executes the snapshot pairing helper used by the tournament coordinator module.
 * @param {Object} pairing The pairing object supplies the structured input used by the tournament coordinator module, including the `playerA`, `playerB`, `result`, `roomPass`, `roomPort`, `round`, `table`, and `winner` properties.
 * @param {string} pairing.playerA The `playerA` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.playerB The `playerB` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.result The `result` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.roomPass The `roomPass` property supplies structured input used by the tournament coordinator module.
 * @param {(number|null)} pairing.roomPort The `roomPort` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.round The `round` property supplies structured input used by the tournament coordinator module.
 * @param {number} pairing.table The `table` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.winner The `winner` property supplies structured input used by the tournament coordinator module.
 * @returns {{matchId: string, round: string, table: number, playerA: string, playerB: string, status: string, result: string, winner: string, roomPort: (number|null), roomPass: string}} Returns the value produced by the tournament coordinator module.
 */
function snapshotPairing(pairing) {
  return {
    matchId: resolvePairingId(pairing),
    round: pairing.round,
    table: pairing.table,
    playerA: pairing.playerA,
    playerB: pairing.playerB,
    status: pairing.status,
    result: pairing.result,
    winner: pairing.winner,
    roomPort: pairing.roomPort || null,
    roomPass: pairing.roomPass || ""
  };
}

/**
 * Executes the ensure editable pairing helper used by the tournament coordinator module.
 * @param {Object} pairing The pairing object supplies the structured input used by the tournament coordinator module, including the `completedAt`, `playerAJoinedAt`, `playerBJoinedAt`, `result`, `round`, and `startedAt` properties.
 * @param {(Date|null)} pairing.completedAt The `completedAt` property supplies structured input used by the tournament coordinator module.
 * @param {(Date|null)} pairing.playerAJoinedAt The `playerAJoinedAt` property supplies structured input used by the tournament coordinator module.
 * @param {(Date|null)} pairing.playerBJoinedAt The `playerBJoinedAt` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.result The `result` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.round The `round` property supplies structured input used by the tournament coordinator module.
 * @param {(Date|null)} pairing.startedAt The `startedAt` property supplies structured input used by the tournament coordinator module.
 * @param {string} currentRoundLabel The currentRoundLabel value provides an input used by the tournament coordinator module.
 * @returns {void} Does not return a value.
 */
function ensureEditablePairing(pairing, currentRoundLabel) {
  if (!pairing) {
    throw new Error("Tournament pairing not found.");
  }

  if (pairing.round !== currentRoundLabel) {
    throw new Error("Only pairings from the current round can be edited.");
  }

  if (pairing.result !== "pending") {
    throw new Error("Resolved pairings cannot be edited.");
  }

  if (pairing.startedAt || pairing.completedAt || pairing.playerAJoinedAt || pairing.playerBJoinedAt) {
    throw new Error("Started or joined pairings cannot be edited.");
  }
}

/**
 * Resets pairing state for manual edit used by the tournament coordinator module.
 * @param {Object} pairing The pairing object supplies the structured input used by the tournament coordinator module, including the `completedAt`, `playerAJoinedAt`, `playerBJoinedAt`, `result`, `roomPass`, `roomPort`, `startedAt`, and `winner` properties.
 * @param {(Date|null)} pairing.completedAt The `completedAt` property supplies structured input used by the tournament coordinator module.
 * @param {(Date|null)} pairing.playerAJoinedAt The `playerAJoinedAt` property supplies structured input used by the tournament coordinator module.
 * @param {(Date|null)} pairing.playerBJoinedAt The `playerBJoinedAt` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.result The `result` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.roomPass The `roomPass` property supplies structured input used by the tournament coordinator module.
 * @param {(number|null)} pairing.roomPort The `roomPort` property supplies structured input used by the tournament coordinator module.
 * @param {(Date|null)} pairing.startedAt The `startedAt` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.winner The `winner` property supplies structured input used by the tournament coordinator module.
 * @returns {void} Does not return a value.
 */
function resetPairingStateForManualEdit(pairing) {
  pairing.status = "Pending";
  pairing.result = "pending";
  pairing.winner = "";
  pairing.playerAJoinedAt = null;
  pairing.playerBJoinedAt = null;
  pairing.startedAt = null;
  pairing.completedAt = null;
  pairing.roomPort = null;
  pairing.roomPass = "";
}

/**
 * Syncs single elimination entrant states used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `checkInRequired`, `entrants`, `format`, and `pairings` properties.
 * @param {boolean} tournament.checkInRequired The `checkInRequired` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.entrants The `entrants` property supplies structured input used by the tournament coordinator module.
 * @param {string} tournament.format The `format` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.pairings The `pairings` property supplies structured input used by the tournament coordinator module.
 * @returns {void} Does not return a value.
 */
function syncSingleEliminationEntrantStates(tournament) {
  if (tournament.format !== "Single Elimination") {
    return;
  }

  const eliminatedPlayers = new Set();
  for (const pairing of tournament.pairings || []) {
    if (pairing.result === "pending" || pairing.result === "draw" || pairing.result === "bye" || !pairing.winner) {
      continue;
    }

    const loser = pairing.winner === pairing.playerA ? pairing.playerB : pairing.playerA;
    if (loser && loser !== "BYE") {
      eliminatedPlayers.add(loser);
    }
  }

  for (const entrant of tournament.entrants || []) {
    if (entrant.registrationState === "dropped" || entrant.registrationState === "disqualified") {
      continue;
    }

    entrant.registrationState = eliminatedPlayers.has(entrant.username)
      ? "eliminated"
      : (tournament.checkInRequired ? "checked_in" : "registered");
  }
}

/**
 * Gets resolved pairing winner used by the tournament coordinator module.
 * @param {Object} pairing The pairing object supplies the structured input used by the tournament coordinator module, including the `playerA`, `result`, and `winner` properties.
 * @param {string} pairing.playerA The `playerA` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.result The `result` property supplies structured input used by the tournament coordinator module.
 * @param {string} pairing.winner The `winner` property supplies structured input used by the tournament coordinator module.
 * @returns {string} Returns the value produced by the tournament coordinator module.
 */
function getResolvedPairingWinner(pairing) {
  if (!pairing || pairing.result === "pending") {
    return "";
  }

  if (pairing.result === "bye") {
    return pairing.playerA;
  }

  return pairing.winner || "";
}

/**
 * Sorts standings entries used by the tournament coordinator module.
 * @param {Object} left The left object supplies the structured input used by the tournament coordinator module, including the `player`, `points`, and `wins` properties.
 * @param {(string|number)} left.player The `player` property supplies structured input used by the tournament coordinator module.
 * @param {number} left.points The `points` property supplies structured input used by the tournament coordinator module.
 * @param {number} left.wins The `wins` property supplies structured input used by the tournament coordinator module.
 * @param {Object} right The right object supplies the structured input used by the tournament coordinator module, including the `player`, `points`, and `wins` properties.
 * @param {string} right.player The `player` property supplies structured input used by the tournament coordinator module.
 * @param {number} right.points The `points` property supplies structured input used by the tournament coordinator module.
 * @param {number} right.wins The `wins` property supplies structured input used by the tournament coordinator module.
 * @returns {number} Returns the value produced by the tournament coordinator module.
 */
function sortStandingsEntries(left, right) {
  return right.points - left.points || right.wins - left.wins || left.player.localeCompare(right.player);
}

/**
 * Applies bye used by the tournament coordinator module.
 * @param {Array} standings The standings array supplies the ordered values used by the tournament coordinator module, each item uses the `player` property.
 * @param {string} standings[].player The `[].player` property describes data read from each item used by the tournament coordinator module.
 * @param {Object} entrant The entrant object supplies the structured input used by the tournament coordinator module, including the `username` property.
 * @param {string} entrant.username The `username` property supplies structured input used by the tournament coordinator module.
 * @returns {void} Does not return a value.
 */
function applyBye(standings, entrant) {
  const standing = standings.find((entry) => entry.player === entrant.username);
  if (!standing) {
    return;
  }

  standing.wins += 1;
  standing.points += 3;
}

/**
 * Executes the pick bye entrant helper used by the tournament coordinator module.
 * @param {Array} entrants The entrants value provides an input used by the tournament coordinator module.
 * @returns {Array} Returns the value produced by the tournament coordinator module.
 */
function pickByeEntrant(entrants) {
  return [...entrants].sort((left, right) => {
    if ((left.receivedByeCount || 0) !== (right.receivedByeCount || 0)) {
      return (left.receivedByeCount || 0) - (right.receivedByeCount || 0);
    }
    return left.username.localeCompare(right.username);
  })[0];
}

/**
 * Executes the pick swiss bye entrant helper used by the tournament coordinator module.
 * @param {Array} entrants The entrants value provides an input used by the tournament coordinator module.
 * @param {Object} standingsMap The standingsMap object supplies the structured input used by the tournament coordinator module, including the `get` property.
 * @param {Function} standingsMap.get The `get` property supplies structured input used by the tournament coordinator module.
 * @returns {Object} Returns the value produced by the tournament coordinator module.
 */
function pickSwissByeEntrant(entrants, standingsMap) {
  return [...entrants].sort((left, right) => {
    if ((left.receivedByeCount || 0) !== (right.receivedByeCount || 0)) {
      return (left.receivedByeCount || 0) - (right.receivedByeCount || 0);
    }

    const leftStanding = standingsMap.get(left.username) || { points: 0, wins: 0, place: Number.MAX_SAFE_INTEGER };
    const rightStanding = standingsMap.get(right.username) || { points: 0, wins: 0, place: Number.MAX_SAFE_INTEGER };

    return leftStanding.points - rightStanding.points
      || leftStanding.wins - rightStanding.wins
      || leftStanding.place - rightStanding.place
      || left.username.localeCompare(right.username);
  })[0];
}

/**
 * Builds rounds overview with active round used by the tournament coordinator module.
 * @param {Array} roundsOverview The roundsOverview value provides an input used by the tournament coordinator module.
 * @param {number} nextRoundNumber The nextRoundNumber value provides an input used by the tournament coordinator module.
 * @returns {Object} Returns the value produced by the tournament coordinator module.
 */
function buildRoundsOverviewWithActiveRound(roundsOverview, nextRoundNumber) {
  const nextRoundLabel = getRoundLabel(nextRoundNumber);
  const mapped = (roundsOverview || []).map((round) => ({
    ...round,
    status: round.name === nextRoundLabel ? "Active" : round.status
  }));

  if (!mapped.some((round) => round.name === nextRoundLabel)) {
    mapped.push({
      name: nextRoundLabel,
      status: "Active"
    });
  }

  return mapped.map((round, index) => ({
    name: round.name || getRoundLabel(index + 1),
    status: round.status || (index + 1 === nextRoundNumber ? "Active" : "Pending")
  }));
}

/**
 * Builds advancing single elimination entrants used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `standings` property.
 * @param {Array} tournament.standings The `standings` property supplies structured input used by the tournament coordinator module.
 * @returns {Array} Returns the value produced by the tournament coordinator module.
 */
function buildAdvancingSingleEliminationEntrants(tournament) {
  const currentRoundPairings = getCurrentRoundPairings(tournament);
  if (currentRoundPairings.length === 0) {
    throw new Error("No current round pairings are available for advancement.");
  }

  const entrantsByUsername = getEntrantMap(tournament);
  const standingsMap = new Map((tournament.standings || []).map((standing) => [standing.player, standing]));
  const advancing = [];

  for (const pairing of currentRoundPairings) {
    const winner = getResolvedPairingWinner(pairing);
    if (!winner) {
      throw new Error("Single elimination cannot advance while a pairing winner is unresolved.");
    }

    const entrant = entrantsByUsername.get(winner);
    if (!entrant) {
      continue;
    }

    advancing.push({
      userId: entrant.userId || "",
      username: entrant.username,
      receivedByeCount: entrant.receivedByeCount || 0,
      standing: standingsMap.get(entrant.username) || { points: 0, wins: 0, place: Number.MAX_SAFE_INTEGER }
    });
  }

  return advancing.sort((left, right) => {
    return sortStandingsEntries(left.standing, right.standing) || left.username.localeCompare(right.username);
  });
}

/**
 * Builds swiss round entrants used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `standings` property.
 * @param {Array} tournament.standings The `standings` property supplies structured input used by the tournament coordinator module.
 * @returns {Array} Returns the value produced by the tournament coordinator module.
 */
function buildSwissRoundEntrants(tournament) {
  const entrantsByUsername = getEntrantMap(tournament);
  const standings = [...(tournament.standings || [])].sort(sortStandingsEntries);

  return standings
    .map((standing) => {
      const entrant = entrantsByUsername.get(standing.player);
      if (!entrant || !isStandingsEligibleEntrant(entrant)) {
        return null;
      }

      return {
        userId: entrant.userId || "",
        username: entrant.username,
        receivedByeCount: entrant.receivedByeCount || 0,
        standing
      };
    })
    .filter(Boolean);
}

/**
 * Builds opponent history used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `pairings` property.
 * @param {Array} tournament.pairings The `pairings` property supplies structured input used by the tournament coordinator module.
 * @returns {Map} Returns the value produced by the tournament coordinator module.
 */
function buildOpponentHistory(tournament) {
  const history = new Map();

  for (const pairing of tournament.pairings || []) {
    if (!pairing.playerA || !pairing.playerB || pairing.playerB === "BYE") {
      continue;
    }

    if (!history.has(pairing.playerA)) {
      history.set(pairing.playerA, new Set());
    }
    if (!history.has(pairing.playerB)) {
      history.set(pairing.playerB, new Set());
    }

    history.get(pairing.playerA).add(pairing.playerB);
    history.get(pairing.playerB).add(pairing.playerA);
  }

  return history;
}

/**
 * Gets swiss pair score used by the tournament coordinator module.
 * @param {Object} playerA The playerA object supplies the structured input used by the tournament coordinator module, including the `standing` and `username` properties.
 * @param {Object} playerA.standing The `standing` property supplies structured input used by the tournament coordinator module.
 * @param {number} playerA.standing.place The `standing.place` property supplies structured input used by the tournament coordinator module.
 * @param {number} playerA.standing.points The `standing.points` property supplies structured input used by the tournament coordinator module.
 * @param {number} playerA.standing.wins The `standing.wins` property supplies structured input used by the tournament coordinator module.
 * @param {string} playerA.username The `username` property supplies structured input used by the tournament coordinator module.
 * @param {Object} playerB The playerB object supplies the structured input used by the tournament coordinator module, including the `standing` and `username` properties.
 * @param {Object} playerB.standing The `standing` property supplies structured input used by the tournament coordinator module.
 * @param {number} playerB.standing.place The `standing.place` property supplies structured input used by the tournament coordinator module.
 * @param {number} playerB.standing.points The `standing.points` property supplies structured input used by the tournament coordinator module.
 * @param {number} playerB.standing.wins The `standing.wins` property supplies structured input used by the tournament coordinator module.
 * @param {string} playerB.username The `username` property supplies structured input used by the tournament coordinator module.
 * @param {Object} opponentHistory The opponentHistory object supplies the structured input used by the tournament coordinator module, including the `get` property.
 * @param {Function} opponentHistory.get The `get` property supplies structured input used by the tournament coordinator module.
 * @returns {number} Returns the value produced by the tournament coordinator module.
 */
function getSwissPairScore(playerA, playerB, opponentHistory) {
  const previousOpponents = opponentHistory.get(playerA.username) || new Set();
  const hasPlayedBefore = previousOpponents.has(playerB.username);
  const standingA = playerA.standing || { points: 0, wins: 0, place: 0 };
  const standingB = playerB.standing || { points: 0, wins: 0, place: 0 };
  const pointGap = Math.abs((standingA.points || 0) - (standingB.points || 0));
  const winGap = Math.abs((standingA.wins || 0) - (standingB.wins || 0));
  const placeGap = Math.abs((standingA.place || 0) - (standingB.place || 0));

  return (hasPlayedBefore ? 1_000_000 : 0)
    + (pointGap * 10_000)
    + (winGap * 1_000)
    + (placeGap * 10)
    + (playerA.username.localeCompare(playerB.username) > 0 ? 1 : 0);
}

/**
 * Resolves swiss pairings used by the tournament coordinator module.
 * @param {Array} entrants The entrants value provides an input used by the tournament coordinator module.
 * @param {Map} opponentHistory The opponentHistory value provides an input used by the tournament coordinator module.
 * @returns {Array} Returns the value produced by the tournament coordinator module.
 */
function resolveSwissPairings(entrants, opponentHistory) {
  const ordered = [...entrants];
  const memo = new Map();

          /**
   * Executes the search helper used by the tournament coordinator module.
   * @param {Array} queue The queue array supplies the ordered values used by the tournament coordinator module, including the `length` property, and each item uses the `username` property.
   * @param {string} queue[].username The `[].username` property describes data read from each item used by the tournament coordinator module.
   * @param {number} queue.length The `length` property supplies structured input used by the tournament coordinator module.
   * @returns {(Object|null)} Returns the value produced by the tournament coordinator module.
   */
  function search(queue) {
    if (queue.length === 0) {
      return {
        score: 0,
        pairs: []
      };
    }

    const key = queue.map((entrant) => entrant.username).join("|");
    if (memo.has(key)) {
      return memo.get(key);
    }

    const playerA = queue[0];
    let best = null;

    for (let i = 1; i < queue.length; i += 1) {
      const playerB = queue[i];
      const pairScore = getSwissPairScore(playerA, playerB, opponentHistory);
      const remaining = queue.slice(1, i).concat(queue.slice(i + 1));
      const rest = search(remaining);
      if (!rest) {
        continue;
      }

      const candidate = {
        score: pairScore + rest.score,
        pairs: [[playerA, playerB], ...rest.pairs]
      };

      if (!best || candidate.score < best.score) {
        best = candidate;
      }
    }

    memo.set(key, best);
    return best;
  }

  const result = search(ordered);
  return result?.pairs || [];
}

/**
 * Executes the append bye pairing helper used by the tournament coordinator module.
 * @param {Array} pairings The pairings value provides an input used by the tournament coordinator module.
 * @param {string} tournamentId The tournamentId value provides an input used by the tournament coordinator module.
 * @param {number} roundNumber The roundNumber value provides an input used by the tournament coordinator module.
 * @param {number} tableNumber The tableNumber value provides an input used by the tournament coordinator module.
 * @param {Object} entrant The entrant object supplies the structured input used by the tournament coordinator module, including the `username` property.
 * @param {string} entrant.username The `username` property supplies structured input used by the tournament coordinator module.
 * @returns {void} Does not return a value.
 */
function appendByePairing(pairings, tournamentId, roundNumber, tableNumber, entrant) {
  pairings.push({
    round: getRoundLabel(roundNumber),
    table: tableNumber,
    playerA: entrant.username,
    playerB: "BYE",
    status: "Bye Awarded",
    result: "bye",
    winner: entrant.username,
    matchId: createMatchId(tournamentId, roundNumber, tableNumber),
    playerAJoinedAt: null,
    playerBJoinedAt: null,
    startedAt: null,
    completedAt: new Date(),
  });
}

/**
 * Creates round one state used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `roundsOverview` property.
 * @param {Array} tournament.roundsOverview The `roundsOverview` property supplies structured input used by the tournament coordinator module.
 * @returns {Object} Returns the value produced by the tournament coordinator module.
 */
export function createRoundOneState(tournament) {
  const entrants = collectRoundOneEntrants(tournament);
  if (entrants.length < 2) {
    throw new Error("At least two active entrants are required to start the tournament.");
  }

  const standings = buildInitialStandings(entrants);
  const pairings = [];
  const queue = [...entrants];
  const roundNumber = 1;
  let tableNumber = 1;

  if (queue.length % 2 === 1) {
    const byeEntrant = pickByeEntrant(queue);
    const byeIndex = queue.findIndex((entrant) => entrant.username === byeEntrant.username);
    if (byeIndex >= 0) {
      queue.splice(byeIndex, 1);
    }

    appendByePairing(pairings, getTournamentId(tournament), roundNumber, tableNumber, byeEntrant);
    tableNumber += 1;
    applyBye(standings, byeEntrant);
  }

  while (queue.length > 1) {
    const playerA = queue.shift();
    const playerB = queue.shift();
    pairings.push({
      round: `Round ${roundNumber}`,
      table: tableNumber,
      playerA: playerA.username,
      playerB: playerB.username,
      status: "Pending",
      result: "pending",
      winner: "",
      matchId: createMatchId(getTournamentId(tournament), roundNumber, tableNumber),
      playerAJoinedAt: null,
      playerBJoinedAt: null,
      startedAt: null,
      completedAt: null,
    });
    tableNumber += 1;
  }

  const roundsOverview = (tournament.roundsOverview || []).map((round, index) => ({
    name: round.name || `Round ${index + 1}`,
    status: index === 0 ? "Active" : "Pending",
  }));

  return {
    standings,
    pairings,
    roundsOverview,
    currentRoundNumber: roundNumber,
    status: "Round In Progress",
  };
}

/**
 * Updates pairing join state used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `pairings` property.
 * @param {Array} tournament.pairings The `pairings` property supplies structured input used by the tournament coordinator module.
 * @param {string} matchId The matchId value provides an input used by the tournament coordinator module.
 * @param {string} username The username value provides an input used by the tournament coordinator module.
 * @returns {Object} Returns the value produced by the tournament coordinator module.
 */
export function updatePairingJoinState(tournament, matchId, username) {
  const pairing = (tournament.pairings || []).find((entry) => resolvePairingId(entry) === matchId);
  if (!pairing) {
    throw new Error("Tournament pairing not found.");
  }

  if (pairing.result !== "pending") {
    return pairing;
  }

  const now = new Date();
  if (pairing.playerA === username) {
    pairing.playerAJoinedAt = pairing.playerAJoinedAt || now;
  }
  if (pairing.playerB === username) {
    pairing.playerBJoinedAt = pairing.playerBJoinedAt || now;
  }

  if (pairing.playerAJoinedAt && pairing.playerBJoinedAt) {
    pairing.status = "Dueling";
    pairing.startedAt = pairing.startedAt || now;
  } else {
    pairing.status = "Waiting For Opponent";
  }

  return pairing;
}

/**
 * Swaps pairing players used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `currentRoundNumber` and `pairings` properties.
 * @param {number} tournament.currentRoundNumber The `currentRoundNumber` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.pairings The `pairings` property supplies structured input used by the tournament coordinator module.
 * @param {Object} swapRequest The swapRequest object supplies the structured input used by the tournament coordinator module, including the `leftMatchId`, `leftSlot`, `rightMatchId`, and `rightSlot` properties.
 * @param {string} swapRequest.leftMatchId The `leftMatchId` property supplies structured input used by the tournament coordinator module.
 * @param {string} swapRequest.leftSlot The `leftSlot` property supplies structured input used by the tournament coordinator module.
 * @param {string} swapRequest.rightMatchId The `rightMatchId` property supplies structured input used by the tournament coordinator module.
 * @param {string} swapRequest.rightSlot The `rightSlot` property supplies structured input used by the tournament coordinator module.
 * @returns {{leftPairing: Object, rightPairing: Object, before: {left: Object, right: Object}, after: {left: Object, right: Object}}} Returns the value produced by the tournament coordinator module.
 */
export function swapPairingPlayers(tournament, { leftMatchId, leftSlot, rightMatchId, rightSlot }) {
  const normalizedLeftSlot = normalizePairingSlot(leftSlot);
  const normalizedRightSlot = normalizePairingSlot(rightSlot);
  const currentRoundLabel = getRoundLabel(tournament.currentRoundNumber || 1);
  const leftPairing = (tournament.pairings || []).find((entry) => resolvePairingId(entry) === leftMatchId);
  const rightPairing = (tournament.pairings || []).find((entry) => resolvePairingId(entry) === rightMatchId);

  ensureEditablePairing(leftPairing, currentRoundLabel);
  ensureEditablePairing(rightPairing, currentRoundLabel);

  const leftPlayer = leftPairing[normalizedLeftSlot];
  const rightPlayer = rightPairing[normalizedRightSlot];

  if (!leftPlayer || !rightPlayer || leftPlayer === "BYE" || rightPlayer === "BYE") {
    throw new Error("Bye slots cannot be used in manual pairing swaps.");
  }

  if (leftPairing === rightPairing && normalizedLeftSlot === normalizedRightSlot) {
    throw new Error("Select two different pairing slots to swap.");
  }

  const before = {
    left: snapshotPairing(leftPairing),
    right: snapshotPairing(rightPairing)
  };

  leftPairing[normalizedLeftSlot] = rightPlayer;
  rightPairing[normalizedRightSlot] = leftPlayer;

  if (leftPairing.playerA === leftPairing.playerB || rightPairing.playerA === rightPairing.playerB) {
    leftPairing[normalizedLeftSlot] = leftPlayer;
    rightPairing[normalizedRightSlot] = rightPlayer;
    throw new Error("Manual swap would create an invalid self-pairing.");
  }

  resetPairingStateForManualEdit(leftPairing);
  if (rightPairing !== leftPairing) {
    resetPairingStateForManualEdit(rightPairing);
  }

  return {
    leftPairing,
    rightPairing,
    before,
    after: {
      left: snapshotPairing(leftPairing),
      right: snapshotPairing(rightPairing)
    }
  };
}

/**
 * Reopens pairing result used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `currentRoundNumber`, `pairings`, and `standings` properties.
 * @param {number} tournament.currentRoundNumber The `currentRoundNumber` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.pairings The `pairings` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.standings The `standings` property supplies structured input used by the tournament coordinator module.
 * @param {string} matchId The matchId value provides an input used by the tournament coordinator module.
 * @returns {Object} Returns the value produced by the tournament coordinator module.
 */
export function reopenPairingResult(tournament, matchId) {
  const currentRoundLabel = getRoundLabel(tournament.currentRoundNumber || 1);
  const pairing = (tournament.pairings || []).find((entry) => resolvePairingId(entry) === matchId);

  if (!pairing) {
    throw new Error("Tournament pairing not found.");
  }

  if (pairing.round !== currentRoundLabel) {
    throw new Error("Only pairings from the current round can be reopened.");
  }

  if (pairing.result === "pending") {
    throw new Error("Only resolved pairings can be reopened.");
  }

  if (pairing.playerB === "BYE" || pairing.result === "bye") {
    throw new Error("Bye pairings cannot be reopened from this flow.");
  }

  const before = snapshotPairing(pairing);
  resetPairingStateForManualEdit(pairing);
  syncSingleEliminationEntrantStates(tournament);
  tournament.standings = recalculateStandingsFromPairings(tournament);
  syncRoundProgress(tournament);

  return {
    before,
    after: snapshotPairing(pairing)
  };
}

/**
 * Executes the recalculate standings from pairings helper used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `entrants` and `pairings` properties.
 * @param {Array} tournament.entrants The `entrants` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.pairings The `pairings` property supplies structured input used by the tournament coordinator module.
 * @returns {Array} Returns the value produced by the tournament coordinator module.
 */
export function recalculateStandingsFromPairings(tournament) {
  const activeEntrants = (tournament.entrants || [])
    .filter(isStandingsEligibleEntrant)
    .map((entrant) => entrant.username);

  const standingsMap = new Map(activeEntrants.map((username) => [username, {
    player: username,
    wins: 0,
    losses: 0,
    draws: 0,
    points: 0,
  }]));

  for (const pairing of tournament.pairings || []) {
    if (pairing.result === "pending") {
      continue;
    }

    if (pairing.result === "bye") {
      const standing = standingsMap.get(pairing.playerA);
      if (standing) {
        standing.wins += 1;
        standing.points += 3;
      }
      continue;
    }

    if (pairing.result === "draw") {
      const standingA = standingsMap.get(pairing.playerA);
      const standingB = standingsMap.get(pairing.playerB);
      if (standingA) {
        standingA.draws += 1;
        standingA.points += 1;
      }
      if (standingB) {
        standingB.draws += 1;
        standingB.points += 1;
      }
      continue;
    }

    if (pairing.winner) {
      const loser = pairing.winner === pairing.playerA ? pairing.playerB : pairing.playerA;
      const winnerStanding = standingsMap.get(pairing.winner);
      const loserStanding = standingsMap.get(loser);
      if (winnerStanding) {
        winnerStanding.wins += 1;
        winnerStanding.points += 3;
      }
      if (loserStanding) {
        loserStanding.losses += 1;
      }
    }
  }

  return [...standingsMap.values()]
    .sort(sortStandingsEntries)
    .map((standing, index) => ({
      place: index + 1,
      ...standing,
    }));
}

/**
 * Determines whether single elimination complete should be treated as valid in the tournament coordinator module.
 * @param {Object} tournament The tournament value provides an input used by the tournament coordinator module.
 * @returns {boolean} Returns `true` when single elimination complete is valid in the tournament coordinator module and `false` otherwise.
 */
function isSingleEliminationComplete(tournament) {
  const currentRoundPairings = getCurrentRoundPairings(tournament);
  if (currentRoundPairings.length === 0 || currentRoundPairings.some((pairing) => pairing.result === "pending")) {
    return false;
  }

  const winners = currentRoundPairings
    .map((pairing) => getResolvedPairingWinner(pairing))
    .filter(Boolean);

  return winners.length <= 1;
}

/**
 * Syncs round progress used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `configuredRoundCount`, `currentRoundNumber`, `format`, and `roundsOverview` properties.
 * @param {number} tournament.configuredRoundCount The `configuredRoundCount` property supplies structured input used by the tournament coordinator module.
 * @param {number} tournament.currentRoundNumber The `currentRoundNumber` property supplies structured input used by the tournament coordinator module.
 * @param {string} tournament.format The `format` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.roundsOverview The `roundsOverview` property supplies structured input used by the tournament coordinator module.
 * @returns {void} Does not return a value.
 */
export function syncRoundProgress(tournament) {
  const currentRoundLabel = getRoundLabel(tournament.currentRoundNumber || 1);
  const currentRoundPairings = getCurrentRoundPairings(tournament);
  const allResolved = currentRoundPairings.length > 0 && currentRoundPairings.every((pairing) => pairing.result !== "pending");

  tournament.roundsOverview = (tournament.roundsOverview || []).map((round) => {
    if (round.name !== currentRoundLabel) {
      return round;
    }
    return {
      ...round,
      status: allResolved ? "Complete" : "Active",
    };
  });

  if (!allResolved) {
    tournament.status = "Round In Progress";
    return;
  }

  if (
    (tournament.format === "Single Elimination" && isSingleEliminationComplete(tournament))
    || ((tournament.currentRoundNumber || 1) >= (tournament.configuredRoundCount || 1) && tournament.format !== "Single Elimination")
  ) {
    tournament.status = "Completed";
    return;
  }

  tournament.status = "Between Rounds";
}

/**
 * Executes the record pairing result helper used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `entrants`, `format`, `pairings`, and `standings` properties.
 * @param {Array} tournament.entrants The `entrants` property supplies structured input used by the tournament coordinator module.
 * @param {string} tournament.format The `format` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.pairings The `pairings` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.standings The `standings` property supplies structured input used by the tournament coordinator module.
 * @param {string} matchId The matchId value provides an input used by the tournament coordinator module.
 * @param {string} result The result value provides an input used by the tournament coordinator module.
 * @param {string} winner The winner value provides an input used by the tournament coordinator module.
 * @returns {Object} Returns the value produced by the tournament coordinator module.
 */
export function recordPairingResult(tournament, matchId, result, winner) {
  const pairing = (tournament.pairings || []).find((entry) => resolvePairingId(entry) === matchId);
  if (!pairing) {
    throw new Error("Tournament pairing not found.");
  }

  if (pairing.result !== "pending") {
    throw new Error("Tournament pairing already has a recorded result.");
  }

  const now = new Date();
  pairing.result = result;
  pairing.completedAt = now;
  pairing.startedAt = pairing.startedAt || now;

  if (result === "draw") {
    pairing.status = "Draw Recorded";
    pairing.winner = "";
  } else {
    pairing.status = "Result Recorded";
    pairing.winner = winner;
    if (tournament.format === "Single Elimination") {
      const loser = winner === pairing.playerA ? pairing.playerB : pairing.playerA;
      const loserEntrant = (tournament.entrants || []).find((entrant) => entrant.username === loser);
      if (loserEntrant && loserEntrant.registrationState !== "dropped" && loserEntrant.registrationState !== "disqualified") {
        loserEntrant.registrationState = "eliminated";
      }
    }
  }

  tournament.standings = recalculateStandingsFromPairings(tournament);
  syncRoundProgress(tournament);

  return pairing;
}

/**
 * Creates next round state used by the tournament coordinator module.
 * @param {Object} tournament The tournament object supplies the structured input used by the tournament coordinator module, including the `configuredRoundCount`, `currentRoundNumber`, `entrants`, `format`, `pairings`, `roundsOverview`, and `standings` properties.
 * @param {number} tournament.configuredRoundCount The `configuredRoundCount` property supplies structured input used by the tournament coordinator module.
 * @param {number} tournament.currentRoundNumber The `currentRoundNumber` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.entrants The `entrants` property supplies structured input used by the tournament coordinator module.
 * @param {string} tournament.format The `format` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.pairings The `pairings` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.roundsOverview The `roundsOverview` property supplies structured input used by the tournament coordinator module.
 * @param {Array} tournament.standings The `standings` property supplies structured input used by the tournament coordinator module.
 * @returns {Object} Returns the value produced by the tournament coordinator module.
 */
export function createNextRoundState(tournament) {
  if (tournament.status !== "Between Rounds") {
    throw new Error("Tournament is not ready to generate the next round.");
  }

  const nextRoundNumber = (tournament.currentRoundNumber || 0) + 1;
  const tournamentId = getTournamentId(tournament);
  const pairings = [];
  let tableNumber = 1;

  if (tournament.format === "Swiss" && (tournament.currentRoundNumber || 0) >= (tournament.configuredRoundCount || 0)) {
    throw new Error("Swiss rounds are already complete for this tournament.");
  }

  let queue;
  let standingsMap = new Map();
  let opponentHistory = new Map();

  if (tournament.format === "Swiss") {
    queue = buildSwissRoundEntrants(tournament);
    standingsMap = new Map(queue.map((entrant) => [entrant.username, entrant.standing]));
    opponentHistory = buildOpponentHistory(tournament);
    if (queue.length < 2) {
      throw new Error("At least two active entrants are required to create another Swiss round.");
    }
  } else {
    queue = buildAdvancingSingleEliminationEntrants(tournament);
    if (queue.length <= 1) {
      throw new Error("Single elimination has no further round to generate.");
    }
  }

  if (queue.length % 2 === 1) {
    const byeEntrant = tournament.format === "Swiss"
      ? pickSwissByeEntrant(queue, standingsMap)
      : pickByeEntrant(queue);
    const byeIndex = queue.findIndex((entrant) => entrant.username === byeEntrant.username);
    if (byeIndex >= 0) {
      queue.splice(byeIndex, 1);
    }

    appendByePairing(pairings, tournamentId, nextRoundNumber, tableNumber, byeEntrant);
    tableNumber += 1;

    const entrant = (tournament.entrants || []).find((entry) => entry.username === byeEntrant.username);
    if (entrant) {
      entrant.receivedByeCount = (entrant.receivedByeCount || 0) + 1;
    }
  }

  const swissPairs = tournament.format === "Swiss"
    ? resolveSwissPairings(queue, opponentHistory)
    : [];

  while ((tournament.format === "Swiss" && swissPairs.length > 0) || (tournament.format !== "Swiss" && queue.length > 1)) {
    const [playerA, playerB] = tournament.format === "Swiss"
      ? swissPairs.shift()
      : [queue.shift(), queue.shift()];
    pairings.push({
      round: getRoundLabel(nextRoundNumber),
      table: tableNumber,
      playerA: playerA.username,
      playerB: playerB.username,
      status: "Pending",
      result: "pending",
      winner: "",
      matchId: createMatchId(tournamentId, nextRoundNumber, tableNumber),
      playerAJoinedAt: null,
      playerBJoinedAt: null,
      startedAt: null,
      completedAt: null,
    });
    tableNumber += 1;
  }

  const roundsOverview = buildRoundsOverviewWithActiveRound(
    (tournament.roundsOverview || []).map((round) => ({
      ...round,
      status: round.name === getRoundLabel(tournament.currentRoundNumber || 1) ? "Complete" : round.status
    })),
    nextRoundNumber
  );

  const nextPairings = [...(tournament.pairings || []), ...pairings];

  tournament.pairings = nextPairings;
  tournament.roundsOverview = roundsOverview;
  tournament.currentRoundNumber = nextRoundNumber;
  tournament.status = "Round In Progress";
  tournament.standings = recalculateStandingsFromPairings(tournament);

  return {
    pairings,
    roundsOverview,
    currentRoundNumber: nextRoundNumber,
    status: tournament.status,
    standings: tournament.standings
  };
}
