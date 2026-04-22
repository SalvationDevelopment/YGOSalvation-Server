/**
 * Gets auth headers used by the tournament.api module.
 * @returns {Object} Returns the value produced by the tournament.api module.
 */
function getAuthHeaders() {
    if (typeof window === 'undefined') {
        return {};
    }

    const session = window.localStorage?.session;
    return session ? { Authorization: `Bearer ${session}` } : {};
}

/**
 * Reads json used by the tournament.api module.
 * @param {Object} response The response response object provides the outgoing channel used by the tournament.api route, including the `ok` property.
 * @param {boolean} response.ok The `ok` property supplies structured input used by the tournament.api module.
 * @returns {Promise<Object>} Resolves with the value produced by the tournament.api module.
 */
async function readJson(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.error || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

/**
 * Fetches leagues used by the tournament.api module.
 * @returns {Promise<Array>} Resolves with the value produced by the tournament.api module.
 */
export async function fetchLeagues() {
    const response = await fetch('/api/leagues', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
    });
    const data = await readJson(response);
    return data.leagues || [];
}

/**
 * Fetches tournaments used by the tournament.api module.
 * @returns {Promise<Array>} Resolves with the value produced by the tournament.api module.
 */
export async function fetchTournaments() {
    const response = await fetch('/api/tournaments', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
    });
    const data = await readJson(response);
    return (data.tournaments || []).map((tournament) => ({
        ...tournament,
        startAt: new Date(tournament.startAt),
        graceClosesAt: tournament.graceClosesAt ? new Date(tournament.graceClosesAt) : null,
    }));
}

/**
 * Fetches tournament used by the tournament.api module.
 * @param {string} slug The slug value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Resolves with the value produced by the tournament.api module.
 */
export async function fetchTournament(slug) {
    const response = await fetch(`/api/tournaments/${encodeURIComponent(slug)}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
    });
    const data = await readJson(response);
    return {
        ...data.tournament,
        startAt: new Date(data.tournament.startAt),
        graceClosesAt: data.tournament.graceClosesAt ? new Date(data.tournament.graceClosesAt) : null,
    };
}

/**
 * Creates tournament used by the tournament.api module.
 * @param {Object} payload The payload value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Resolves with the value produced by the tournament.api module.
 */
export async function createTournament(payload) {
    const response = await fetch('/api/tournaments', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    const data = await readJson(response);
    return {
        ...data.tournament,
        startAt: new Date(data.tournament.startAt),
        graceClosesAt: data.tournament.graceClosesAt ? new Date(data.tournament.graceClosesAt) : null,
    };
}

/**
 * Updates tournament used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @param {Object} payload The payload value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Resolves with the value produced by the tournament.api module.
 */
export async function updateTournament(id, payload) {
    const response = await fetch(`/api/tournaments/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    const data = await readJson(response);
    return {
        ...data.tournament,
        startAt: new Date(data.tournament.startAt),
        graceClosesAt: data.tournament.graceClosesAt ? new Date(data.tournament.graceClosesAt) : null,
    };
}

/**
 * Executes the post tournament action helper used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @param {string} action The action value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Resolves with the value produced by the tournament.api module.
 */
async function postTournamentAction(id, action) {
    const response = await fetch(`/api/tournaments/${encodeURIComponent(id)}/${action}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    });
    const data = await readJson(response);
    return {
        ...data.tournament,
        startAt: new Date(data.tournament.startAt),
        graceClosesAt: data.tournament.graceClosesAt ? new Date(data.tournament.graceClosesAt) : null,
    };
}

/**
 * Registers for tournament used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Returns the value produced by the tournament.api module.
 */
export function registerForTournament(id) {
    return postTournamentAction(id, 'register');
}

/**
 * Unregisters from tournament used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Returns the value produced by the tournament.api module.
 */
export function unregisterFromTournament(id) {
    return postTournamentAction(id, 'unregister');
}

/**
 * Checks in to tournament used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Returns the value produced by the tournament.api module.
 */
export function checkInToTournament(id) {
    return postTournamentAction(id, 'check-in');
}

/**
 * Drops from tournament used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Returns the value produced by the tournament.api module.
 */
export function dropFromTournament(id) {
    return postTournamentAction(id, 'drop');
}

/**
 * Cancels tournament used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Returns the value produced by the tournament.api module.
 */
export function cancelTournament(id) {
    return postTournamentAction(id, 'cancel');
}

/**
 * Opens tournament registration used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Returns the value produced by the tournament.api module.
 */
export function openTournamentRegistration(id) {
    return postTournamentAction(id, 'open-registration');
}

/**
 * Closes tournament registration used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Returns the value produced by the tournament.api module.
 */
export function closeTournamentRegistration(id) {
    return postTournamentAction(id, 'close-registration');
}

/**
 * Forces start tournament used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Returns the value produced by the tournament.api module.
 */
export function forceStartTournament(id) {
    return postTournamentAction(id, 'force-start');
}

/**
 * Creates next tournament round used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Returns the value produced by the tournament.api module.
 */
export function createNextTournamentRound(id) {
    return postTournamentAction(id, 'next-round');
}

/**
 * Joins tournament match used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @param {string} matchId The matchId value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Resolves with the value produced by the tournament.api module.
 */
export async function joinTournamentMatch(id, matchId) {
    const response = await fetch(`/api/tournaments/${encodeURIComponent(id)}/matches/${encodeURIComponent(matchId)}/join`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    });
    const data = await readJson(response);
    return {
        tournament: {
            ...data.tournament,
            startAt: new Date(data.tournament.startAt),
            graceClosesAt: data.tournament.graceClosesAt ? new Date(data.tournament.graceClosesAt) : null,
        },
        matchAccess: data.matchAccess,
    };
}

/**
 * Reports tournament match result used by the tournament.api module.
 * @param {string} id The id value provides an input used by the tournament.api module.
 * @param {string} matchId The matchId value provides an input used by the tournament.api module.
 * @param {Object} payload The payload value provides an input used by the tournament.api module.
 * @returns {Promise<Object>} Resolves with the value produced by the tournament.api module.
 */
export async function reportTournamentMatchResult(id, matchId, payload) {
    const response = await fetch(`/api/tournaments/${encodeURIComponent(id)}/matches/${encodeURIComponent(matchId)}/result`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    const data = await readJson(response);
    return {
        ...data.tournament,
        startAt: new Date(data.tournament.startAt),
        graceClosesAt: data.tournament.graceClosesAt ? new Date(data.tournament.graceClosesAt) : null,
    };
}

/**
 * Fetches tournament alerts used by the tournament.api module.
 * @returns {Promise<Array>} Resolves with the value produced by the tournament.api module.
 */
export async function fetchTournamentAlerts() {
    const response = await fetch('/api/tournaments/alerts', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
    });
    const data = await readJson(response);
    return data.alerts || [];
}

/**
 * Fetches tournament rankings used by the tournament.api module.
 * @param {string} leagueId The leagueId value provides an input used by the tournament.api module.
 * @returns {Promise<Array>} Resolves with the value produced by the tournament.api module.
 */
export async function fetchTournamentRankings(leagueId = '') {
    const query = leagueId ? `?leagueId=${encodeURIComponent(leagueId)}` : '';
    const response = await fetch(`/api/tournament-rankings${query}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
    });
    const data = await readJson(response);
    return data.rankings || [];
}
