require('../../lib/load-shared-env');

const { request } = require('../../lib/http');
const { parseHostConfig } = require('../../host-config');

const ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL || 'http://localhost:3000/api';
const pendingTournamentRoomAssignments = new Map();

/**
 * Gets auth headers used by the endpoint tournaments module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint tournaments route, including the `headers` property.
 * @param {Object} req.headers The `headers` property supplies structured input used by the endpoint tournaments module.
 * @param {string} req.headers.Authorization The `headers.Authorization` property supplies structured input used by the endpoint tournaments module.
 * @param {string} req.headers.authorization The `headers.authorization` property supplies structured input used by the endpoint tournaments module.
 * @returns {{Authorization?: string}} Returns the value produced by the endpoint tournaments module.
 */
function getAuthHeaders(req) {
  const authorization = req.headers.authorization || req.headers.Authorization;
  return authorization ? { Authorization: authorization } : {};
}

/**
 * Gets leagues used by the endpoint tournaments module.
 * @param {Object} req The req request provides the incoming data used by the endpoint tournaments route.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint tournaments route.
 * @returns {Promise<void>} Resolves when the endpoint tournaments operation completes.
 */
async function getLeagues(req, res) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/leagues`, {
      headers: getAuthHeaders(req)
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.data?.error || error.message || 'League request failed.'
    });
  }
}

/**
 * Gets tournaments used by the endpoint tournaments module.
 * @param {Object} req The req request provides the incoming data used by the endpoint tournaments route.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint tournaments route.
 * @returns {Promise<void>} Resolves when the endpoint tournaments operation completes.
 */
async function getTournaments(req, res) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/tournaments`, {
      headers: getAuthHeaders(req)
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.data?.error || error.message || 'Tournament request failed.'
    });
  }
}

/**
 * Gets tournament used by the endpoint tournaments module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint tournaments route, including the `params` property.
 * @param {Object} req.params The `params` property supplies structured input used by the endpoint tournaments module.
 * @param {string} req.params.slug The `params.slug` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint tournaments route.
 * @returns {Promise<void>} Resolves when the endpoint tournaments operation completes.
 */
async function getTournament(req, res) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/tournaments/slug/${encodeURIComponent(req.params.slug)}`, {
      headers: getAuthHeaders(req)
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.data?.error || error.message || 'Tournament detail request failed.'
    });
  }
}

/**
 * Creates tournament used by the endpoint tournaments module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint tournaments route, including the `body` property.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint tournaments route.
 * @returns {Promise<void>} Resolves when the endpoint tournaments operation completes.
 */
async function createTournament(req, res) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/tournaments`, {
      method: 'POST',
      headers: getAuthHeaders(req),
      body: req.body || {}
    });
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.data?.error || error.message || 'Tournament creation failed.',
      errors: error.data?.errors || null
    });
  }
}

/**
 * Updates tournament used by the endpoint tournaments module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint tournaments route, including the `body` and `params` properties.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} req.params The `params` property supplies structured input used by the endpoint tournaments module.
 * @param {string} req.params.id The `params.id` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint tournaments route.
 * @returns {Promise<void>} Resolves when the endpoint tournaments operation completes.
 */
async function updateTournament(req, res) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/tournaments/${encodeURIComponent(req.params.id)}`, {
      method: 'PATCH',
      headers: getAuthHeaders(req),
      body: req.body || {}
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.data?.error || error.message || 'Tournament update failed.',
      errors: error.data?.errors || null
    });
  }
}

/**
 * Executes the post tournament action helper used by the endpoint tournaments module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint tournaments route, including the `body` and `params` properties.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} req.params The `params` property supplies structured input used by the endpoint tournaments module.
 * @param {string} req.params.id The `params.id` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint tournaments route.
 * @param {string} action The action value provides an input used by the endpoint tournaments module.
 * @returns {Promise<void>} Resolves when the endpoint tournaments operation completes.
 */
async function postTournamentAction(req, res, action) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/tournaments/${encodeURIComponent(req.params.id)}/${action}`, {
      method: 'POST',
      headers: getAuthHeaders(req),
      body: req.body || {}
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.data?.error || error.message || `Tournament ${action} failed.`,
      errors: error.data?.errors || null
    });
  }
}

/**
 * Gets pairing used by the endpoint tournaments module.
 * @param {Object} tournament The tournament object supplies the structured input used by the endpoint tournaments module, including the `pairings` property.
 * @param {Array} tournament.pairings The `pairings` property supplies structured input used by the endpoint tournaments module.
 * @param {string} matchId The matchId value provides an input used by the endpoint tournaments module.
 * @returns {(Object|null)} Returns the value produced by the endpoint tournaments module.
 */
function getPairing(tournament, matchId) {
  return (tournament?.pairings || []).find((pairing) => (pairing.pairingId || pairing.matchId || `${pairing.round}::${pairing.table}`) === matchId) || null;
}

/**
 * Executes the derive card pool helper used by the endpoint tournaments module.
 * @param {Object} roomRules The roomRules object supplies the structured input used by the endpoint tournaments module, including the `ruleset` property.
 * @param {string} roomRules.ruleset The `ruleset` property supplies structured input used by the endpoint tournaments module.
 * @returns {string} Returns the value produced by the endpoint tournaments module.
 */
function deriveAllowedCards(roomRules = {}) {
  const ruleset = String(roomRules.ruleset || '').toUpperCase();
  if (ruleset.includes('OCG') && !ruleset.includes('TCG')) {
    return 'ocg';
  }
  if (ruleset.includes('TCG') && !ruleset.includes('OCG')) {
    return 'tcg';
  }
  return 'ocg_tcg';
}

/**
 * Derives rule preset used by the endpoint tournaments module.
 * @param {Object} roomRules The roomRules object supplies the structured input used by the endpoint tournaments module.
 * @returns {string} Returns the value produced by the endpoint tournaments module.
 */
function deriveRulePreset(roomRules = {}) {
  const ruleset = String(roomRules.ruleset || roomRules.league || '').toLowerCase();
  if (ruleset.includes('goat')) {
    return 'goat';
  }
  if (ruleset.includes('rush')) {
    return 'rush';
  }
  if (ruleset.includes('speed')) {
    return 'speed';
  }
  return 'mr5';
}

/**
 * Builds tournament room settings used by the endpoint tournaments module.
 * @param {Object} tournament The tournament object supplies the structured input used by the endpoint tournaments module, including the `id`, `roomRules`, and `slug` properties.
 * @param {string} tournament.id The `id` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} tournament.roomRules The `roomRules` property supplies structured input used by the endpoint tournaments module.
 * @param {string} tournament.roomRules.automation The `roomRules.automation` property supplies structured input used by the endpoint tournaments module.
 * @param {Array} tournament.roomRules.banlist The `roomRules.banlist` property supplies structured input used by the endpoint tournaments module.
 * @param {string} tournament.roomRules.duelMode The `roomRules.duelMode` property supplies structured input used by the endpoint tournaments module.
 * @param {string} tournament.slug The `slug` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} pairing The pairing object supplies the structured input used by the endpoint tournaments module, including the `matchId`, `pairingId`, and `table` properties.
 * @param {string} pairing.matchId The `matchId` property supplies structured input used by the endpoint tournaments module.
 * @param {(string|number)} pairing.pairingId The `pairingId` property supplies structured input used by the endpoint tournaments module.
 * @param {number} pairing.table The `table` property supplies structured input used by the endpoint tournaments module.
 * @returns {Object} Returns the value produced by the endpoint tournaments module.
 */
function buildTournamentRoomSettings(tournament, pairing) {
  const roomRules = tournament?.roomRules || {};
  const duelMode = String(roomRules.duelMode || 'Match');
  const isTag = duelMode === 'Tag';
  const roompass = `${tournament?.id || tournament?.slug || 'tournament'}-${pairing?.pairingId || pairing?.matchId || pairing?.table || 'match'}`;
  return parseHostConfig({
    roomName: `${tournament?.name || tournament?.slug || 'Tournament Duel'} Table ${pairing.table || pairing.pairingId || pairing.matchId || ''}`.trim(),
    password: `${tournament.id || tournament.slug}-${pairing.pairingId || pairing.matchId || pairing.table}`,
    roompass,
    banlist: roomRules.banlist || 'No Banlist',
    allowedCards: deriveAllowedCards(roomRules),
    team1Count: isTag ? 2 : 1,
    team2Count: isTag ? 2 : 1,
    bestOf: duelMode === 'Single' ? 1 : 3,
    relay: false,
    rulePreset: deriveRulePreset(roomRules),
    timeLimitSeconds: 1800,
    tournamentId: tournament.id || '',
    tournamentSlug: tournament.slug || '',
    tournamentMatchId: pairing.pairingId || pairing.matchId || ''
  });
}

/**
 * Assigns tournament match room used by the endpoint tournaments module.
 * @param {Object} req The req request provides the incoming data used by the endpoint tournaments route.
 * @param {string} tournamentId The tournamentId value provides an input used by the endpoint tournaments module.
 * @param {string} matchId The matchId value provides an input used by the endpoint tournaments module.
 * @param {Object} tournament The tournament value provides an input used by the endpoint tournaments module.
 * @param {?Function} hostGameAllocator The hostGameAllocator value provides an input used by the endpoint tournaments module.
 * @returns {Promise<Object>} Resolves with the value produced by the endpoint tournaments module.
 */
async function assignTournamentMatchRoom(req, tournamentId, matchId, tournament, hostGameAllocator) {
  const pairing = getPairing(tournament, matchId);
  if (!pairing) {
    throw new Error('Tournament pairing not found after validation.');
  }
  if (pairing.roomPort) {
    return {
      tournament,
      matchAccess: {
        matchId,
        roomAssigned: true,
        roomPort: pairing.roomPort,
        roomPass: pairing.roomPass || '',
        joinPath: `/ygopro?room=${pairing.roomPort}`,
        message: 'Match access validated. Duel room assigned.'
      }
    };
  }

  const assignmentKey = `${tournamentId}:${matchId}`;
  if (!pendingTournamentRoomAssignments.has(assignmentKey)) {
    const promise = (async () => {
      if (typeof hostGameAllocator !== 'function') {
        throw new Error('Tournament room allocator is unavailable on the main server.');
      }

      const hosted = await hostGameAllocator(buildTournamentRoomSettings(tournament, pairing));
      const assignResponse = await request(`${ADMIN_SERVER_URL}/tournaments/${encodeURIComponent(tournamentId)}/matches/${encodeURIComponent(matchId)}/assign-room`, {
        method: 'POST',
        headers: getAuthHeaders(req),
        body: {
          roomPort: hosted.port,
          roomPass: hosted.roompass
        }
      });
      return assignResponse.data;
    })().finally(() => {
      pendingTournamentRoomAssignments.delete(assignmentKey);
    });
    pendingTournamentRoomAssignments.set(assignmentKey, promise);
  }

  const data = await pendingTournamentRoomAssignments.get(assignmentKey);
  const assignedPairing = getPairing(data.tournament, matchId);
  return {
    tournament: data.tournament,
    matchAccess: {
      ...(data.matchAccess || {}),
      matchId,
      roomAssigned: Boolean(assignedPairing?.roomPort),
      roomPort: assignedPairing?.roomPort || null,
      roomPass: assignedPairing?.roomPass || '',
      joinPath: assignedPairing?.roomPort ? `/ygopro?room=${assignedPairing.roomPort}` : null,
      message: assignedPairing?.roomPort
        ? 'Match access validated. Duel room assigned.'
        : 'Match access validated, but room assignment is still unavailable.'
    }
  };
}

/**
 * Joins tournament match used by the endpoint tournaments module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint tournaments route, including the `body` and `params` properties.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} req.params The `params` property supplies structured input used by the endpoint tournaments module.
 * @param {string} req.params.id The `params.id` property supplies structured input used by the endpoint tournaments module.
 * @param {string} req.params.matchId The `params.matchId` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint tournaments route.
 * @param {Object} options The options object supplies structured input used by the endpoint tournaments module.
 * @param {?Function} options.hostGameAllocator The `hostGameAllocator` property supplies structured input used by the endpoint tournaments module.
 * @returns {Promise<void>} Resolves when the endpoint tournaments operation completes.
 */
async function joinTournamentMatch(req, res, options = {}) {
  try {
    const joinResponse = await request(`${ADMIN_SERVER_URL}/tournaments/${encodeURIComponent(req.params.id)}/matches/${encodeURIComponent(req.params.matchId)}/join`, {
      method: 'POST',
      headers: getAuthHeaders(req),
      body: req.body || {}
    });

    const assigned = await assignTournamentMatchRoom(
      req,
      req.params.id,
      req.params.matchId,
      joinResponse.data.tournament,
      options.hostGameAllocator
    );

    res.json({
      success: true,
      tournament: assigned.tournament,
      matchAccess: assigned.matchAccess
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.data?.error || error.message || 'Tournament match join failed.',
      errors: error.data?.errors || null
    });
  }
}

/**
 * Executes the post tournament maintenance helper used by the endpoint tournaments module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint tournaments route, including the `body` property.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint tournaments route.
 * @param {string} action The action value provides an input used by the endpoint tournaments module.
 * @returns {Promise<void>} Resolves when the endpoint tournaments operation completes.
 */
async function postTournamentMaintenance(req, res, action) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/tournaments/maintenance/${action}`, {
      method: 'POST',
      headers: getAuthHeaders(req),
      body: req.body || {}
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.data?.error || error.message || `Tournament maintenance ${action} failed.`,
      errors: error.data?.errors || null
    });
  }
}

/**
 * Gets tournament alerts used by the endpoint tournaments module.
 * @param {Object} req The req request provides the incoming data used by the endpoint tournaments route.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint tournaments route.
 * @returns {Promise<void>} Resolves when the endpoint tournaments operation completes.
 */
async function getTournamentAlerts(req, res) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/tournaments/alerts`, {
      headers: getAuthHeaders(req)
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.data?.error || error.message || 'Tournament alerts request failed.'
    });
  }
}

/**
 * Gets tournament rankings used by the endpoint tournaments module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint tournaments route, including the `query` property.
 * @param {Object} req.query The `query` property supplies structured input used by the endpoint tournaments module.
 * @param {string} req.query.leagueId The `query.leagueId` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint tournaments route.
 * @returns {Promise<void>} Resolves when the endpoint tournaments operation completes.
 */
async function getTournamentRankings(req, res) {
  try {
    const query = req.query?.leagueId ? `?leagueId=${encodeURIComponent(req.query.leagueId)}` : '';
    const response = await request(`${ADMIN_SERVER_URL}/tournament-rankings${query}`, {
      headers: getAuthHeaders(req)
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.data?.error || error.message || 'Tournament rankings request failed.'
    });
  }
}

/**
 * Sets up endpoints used by the endpoint tournaments module.
 * @param {Object} app The app object supplies the structured input used by the endpoint tournaments module, including the `get`, `patch`, and `post` properties.
 * @param {Function} app.get The `get` property supplies structured input used by the endpoint tournaments module.
 * @param {Function} app.patch The `patch` property supplies structured input used by the endpoint tournaments module.
 * @param {Function} app.post The `post` property supplies structured input used by the endpoint tournaments module.
 * @param {Object} options The options object supplies structured input used by the endpoint tournaments module.
 * @param {?Function} options.hostGameAllocator The `hostGameAllocator` property supplies structured input used by the endpoint tournaments module.
 * @returns {void} Does not return a value.
 */
function setupEndpoints(app, options = {}) {
  const hostGameAllocator = typeof options.hostGameAllocator === 'function'
    ? options.hostGameAllocator
    : null;

  app.get('/api/leagues', getLeagues);
  app.get('/api/tournaments', getTournaments);
  app.get('/api/tournaments/alerts', getTournamentAlerts);
  app.get('/api/tournament-rankings', getTournamentRankings);
  app.get('/api/tournaments/:slug', getTournament);
  app.post('/api/tournaments', createTournament);
  app.patch('/api/tournaments/:id', updateTournament);
  app.post('/api/tournaments/:id/register', (req, res) => postTournamentAction(req, res, 'register'));
  app.post('/api/tournaments/:id/unregister', (req, res) => postTournamentAction(req, res, 'unregister'));
  app.post('/api/tournaments/:id/check-in', (req, res) => postTournamentAction(req, res, 'check-in'));
  app.post('/api/tournaments/:id/drop', (req, res) => postTournamentAction(req, res, 'drop'));
  app.post('/api/tournaments/:id/cancel', (req, res) => postTournamentAction(req, res, 'cancel'));
  app.post('/api/tournaments/:id/open-registration', (req, res) => postTournamentAction(req, res, 'open-registration'));
  app.post('/api/tournaments/:id/close-registration', (req, res) => postTournamentAction(req, res, 'close-registration'));
  app.post('/api/tournaments/:id/force-start', (req, res) => postTournamentAction(req, res, 'force-start'));
  app.post('/api/tournaments/:id/next-round', (req, res) => postTournamentAction(req, res, 'next-round'));
  app.post('/api/tournaments/:id/pairings/swap', (req, res) => postTournamentAction(req, res, 'pairings/swap'));
  app.post('/api/tournaments/:id/matches/:matchId/join', (req, res) => joinTournamentMatch(req, res, { hostGameAllocator }));
  app.post('/api/tournaments/:id/matches/:matchId/result', (req, res) => postTournamentAction(req, res, `matches/${encodeURIComponent(req.params.matchId)}/result`));
  app.post('/api/tournaments/:id/matches/:matchId/reopen', (req, res) => postTournamentAction(req, res, `matches/${encodeURIComponent(req.params.matchId)}/reopen`));
  app.post('/api/tournaments/maintenance/tick', (req, res) => postTournamentMaintenance(req, res, 'tick'));
}

module.exports = {
  setupEndpoints
};
