require('../../lib/load-shared-env');

const { request } = require('../../lib/http'),
  { listProvidedPuzzles } = require('../../puzzle-catalog'),
  ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL || 'http://localhost:3000/api',
  users = require('./endpoint_users'),
  path = require('path'),
  mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
  };

let session = '';
let sessionRefreshTimer = null;

/**
 * Gets expected score used by the endpoint services module.
 * @param {number} playerRating The playerRating value provides an input used by the endpoint services module.
 * @param {number} opponentRating The opponentRating value provides an input used by the endpoint services module.
 * @returns {number} Returns the value produced by the endpoint services module.
 */
function getExpectedScore(playerRating, opponentRating) {
  // Elo starts by estimating the probability that a player wins.
  // A higher rating means a higher expected score, but the curve is smooth:
  // a 400-point gap is a large favorite, not a guaranteed result.
  return 1 / (1 + (10 ** ((opponentRating - playerRating) / 400)));
}

/**
 * Updates elo rating used by the endpoint services module.
 * @param {number} currentRating The currentRating value provides an input used by the endpoint services module.
 * @param {number} expectedScore The expectedScore value provides an input used by the endpoint services module.
 * @param {number} actualScore The actualScore value provides an input used by the endpoint services module.
 * @param {number} kFactor The kFactor value provides an input used by the endpoint services module.
 * @returns {number} Returns the value produced by the endpoint services module.
 */
function updateEloRating(currentRating, expectedScore, actualScore, kFactor = 15) {
  // Elo then moves the rating by K * (actual - expected).
  // Winning as expected changes little, an upset changes more, and losing to
  // a much weaker player costs more than losing to a stronger player.
  return Math.round(currentRating + (kFactor * (actualScore - expectedScore)));
}

/**
 * Executes the with session headers helper used by the endpoint services module.
 * @param {Record<string, string>} headers The headers value provides an input used by the endpoint services module.
 * @returns {Record<string, string>} Returns the value produced by the endpoint services module.
 */
function withSessionHeaders(headers = {}) {
  return session
    ? {
      ...headers,
      Authorization: `Bearer ${session}`
    }
    : headers;
}

/**
 * Sets session used by the endpoint services module.
 * @returns {void} Does not return a value.
 */
function setSession() {
  const adminUsername = process.env.ADMIN_SERVER_USERNAME || process.env.ADMIN_USERNAME,
    adminPassword = process.env.ADMIN_SERVER_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.log('[SERVER] Admin Server Permissions Failure: Missing ADMIN_SERVER_USERNAME/ADMIN_SERVER_PASSWORD (or ADMIN_USERNAME/ADMIN_PASSWORD).');
    setTimeout(setSession, 10000);
    return;
  }

  users.validate(true, {
    username: adminUsername,
    password: adminPassword
  }, function (error, valid, responseData) {
    if (error) {
      console.log(`[SERVER] Admin Server Permissions Failure: ${  error.message || error.toString()}`);
      setTimeout(setSession, 10000);
      return;
    }
    console.log('[SERVER] Server Permissions Acquired', responseData.jwt);
    session = responseData.jwt;
  });
}

/**
 * Starts session refresh used by the endpoint services module.
 * @returns {void} Does not return a value.
 */
function startSessionRefresh() {
  if (sessionRefreshTimer) {
    return;
  }

  setSession();
  sessionRefreshTimer = setInterval(setSession, 600000);
}

/**
 * Gets news page used by the endpoint services module.
 * @param {number} page The page value provides an input used by the endpoint services module.
 * @param {number} pageSize The pageSize value provides an input used by the endpoint services module.
 * @returns {Promise<Object>} Resolves with the value produced by the endpoint services module.
 */
async function getNewsPage(page = 1, pageSize = 5) {
  const news = await request(`${ADMIN_SERVER_URL}/news?page=${page}&pageSize=${pageSize}`, {
    headers: withSessionHeaders()
  });
  return news.data;
}

/**
 * Gets news post used by the endpoint services module.
 * @param {string} slug The slug value provides an input used by the endpoint services module.
 * @returns {Promise<Object>} Resolves with the value produced by the endpoint services module.
 */
async function getNewsPost(slug) {
  const post = await request(`${ADMIN_SERVER_URL}/news/slug/${encodeURIComponent(slug)}`, {
    headers: withSessionHeaders()
  });
  return post.data;
}

/**
 * Gets backgrounds used by the endpoint services module.
 * @returns {Promise<Array>} Resolves with the value produced by the endpoint services module.
 */
async function getBackgrounds() {
  const backgrounds = await request(`${ADMIN_SERVER_URL}/backgrounds?_sort=createdAt:ASC`, {
    headers: withSessionHeaders()
  });
  return backgrounds.data;
}

/**
 * Gets covers used by the endpoint services module.
 * @returns {Promise<Array>} Resolves with the value produced by the endpoint services module.
 */
async function getCovers() {
  const covers = await request(`${ADMIN_SERVER_URL}/covers?_sort=createdAt:ASC`, {
    headers: withSessionHeaders()
  });
  return covers.data;
}

/**
 * Executes the post contact message helper used by the endpoint services module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint services route, including the `body` and `headers` properties.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint services module.
 * @param {Object} req.headers The `headers` property supplies structured input used by the endpoint services module.
 * @param {string} req.headers.Authorization The `headers.Authorization` property supplies structured input used by the endpoint services module.
 * @param {string} req.headers.authorization The `headers.authorization` property supplies structured input used by the endpoint services module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint services route.
 * @returns {Promise<void>} Resolves when the endpoint services operation completes.
 */
async function postContactMessage(req, res) {
  try {
    const authorization = req.headers.authorization || req.headers.Authorization;
    const response = await request(`${ADMIN_SERVER_URL}/contact-messages`, {
      method: 'POST',
      headers: authorization ? { Authorization: authorization } : {},
      body: req.body || {}
    });
    res.send(response.data);
  } catch (error) {
    res.status(error.status || 500).send({
      success: false,
      error: error.data?.error || error.message || 'Unable to send contact message.'
    });
  }
}

/**
 * Gets ranking used by the endpoint services module.
 * @returns {Promise<Array>} Resolves with the value produced by the endpoint services module.
 */
async function getRanking() {
  try {
    const ranking = await request(`${ADMIN_SERVER_URL}/rankings`, {
      headers: withSessionHeaders()
    });
    let data = [];
    if (Array.isArray(ranking.data)) {
      data = ranking.data;
    }
    if (!Array.isArray(ranking.data) && Array.isArray(ranking.data?.ranks)) {
      data = ranking.data.ranks;
    }

    const ranks = data.map((user) => ({
      username: user.username,
      points: user.points || 0,
      elo: user.elo || 1200
    }));
    ranks.sort((a, b) => b.elo - a.elo);
    return ranks;
  } catch {
    const ranking = await request(`${ADMIN_SERVER_URL}/users?_sort=elo:desc`, {
      headers: withSessionHeaders()
    });
    const data = ranking.data.filter((user) => {
      return !user.service;
    });
    const ranks = data.map((user) => {
      return {
        username: user.username,
        points: user.points || 0,
        elo: user.elo || 1200
      };
    });
    ranks.sort((a, b) => b.elo - a.elo);
    return ranks;
  }
}

/**
 * Gets avatar used by the endpoint services module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint services route, including the `path` property.
 * @param {string} req.path The `path` property supplies structured input used by the endpoint services module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint services route.
 * @returns {Promise<(ArrayBuffer|Buffer)>} Resolves with the value produced by the endpoint services module.
 */
async function getAvatar(req, res) {
  const avatar = (await request(`${ADMIN_SERVER_URL}${req.path}`, {
      headers: withSessionHeaders(),
      responseType: 'arrayBuffer'
    })),
    type = mime[path.extname(req.path).slice(1)] || 'text/plain';
  res.set('Content-Type', type);
  return avatar.data;
}


/**
 * Executes the log duel helper used by the endpoint services module.
 * @param {Object} info The info object supplies the structured input used by the endpoint services module, including the `loserID`, `ranked`, `replay`, and `winnerID` properties.
 * @param {(string|number)} info.loserID The `loserID` property supplies structured input used by the endpoint services module.
 * @param {boolean} info.ranked The `ranked` property supplies structured input used by the endpoint services module.
 * @param {(Array|Buffer)} info.replay The `replay` property supplies structured input used by the endpoint services module.
 * @param {number} info.replay.length The `replay.length` property supplies structured input used by the endpoint services module.
 * @param {(string|number)} info.winnerID The `winnerID` property supplies structured input used by the endpoint services module.
 * @param {Function} callback The callback value provides an input used by the endpoint services module.
 * @returns {Promise<void>} Resolves when the endpoint services operation completes.
 */
async function logDuel(info, callback) {
  const settings = {
      headers: withSessionHeaders({
        'Content-Type': 'application/json',
        Accept: '*/*'
      })
    }, { winnerID, loserID, ranked, replay } = info,
    trace = `${Date.now()}_${winnerID || 'unknown'}_${loserID || 'unknown'}`,
    startedAt = Date.now();

  console.log('[services/logDuel] start', {
    trace,
    ranked,
    winnerID,
    loserID,
    replayLength: Array.isArray(replay) ? replay.length : undefined
  });

  if (!ranked) {
    console.log('[services/logDuel] non-ranked duel, callback immediately', {
      trace,
      elapsedMs: Date.now() - startedAt
    });
    callback();
    return;
  }
  try {
    const winner = (await request(`${ADMIN_SERVER_URL}/users/${winnerID}`, settings)).data,
      loser = (await request(`${ADMIN_SERVER_URL}/users/${loserID}`, settings)).data;

    winner.points = (winner.points || 0) + 10;
    loser.points = (loser.points || 0) + 1;
    winner.elo = winner.elo || 1200;
    loser.elo = loser.elo || 1200;

    const winnerExpected = getExpectedScore(winner.elo, loser.elo);
    const loserExpected = getExpectedScore(loser.elo, winner.elo);
    winner.elo = updateEloRating(winner.elo, winnerExpected, 1);
    loser.elo = updateEloRating(loser.elo, loserExpected, 0);

    await request(`${ADMIN_SERVER_URL}/users/${winnerID}`, { method: 'PUT', body: { elo: winner.elo, points: winner.points }, headers: settings.headers });
    await request(`${ADMIN_SERVER_URL}/users/${loserID}`, { method: 'PUT', body: { elo: loser.elo, points: loser.points }, headers: settings.headers });
    console.log('[services/logDuel] success', {
      trace,
      elapsedMs: Date.now() - startedAt,
      winnerID,
      loserID,
      winnerElo: winner.elo,
      loserElo: loser.elo
    });

  } catch (error) {
    console.log('[services/logDuel] failure', {
      trace,
      elapsedMs: Date.now() - startedAt,
      winnerID,
      loserID,
      message: error?.message || String(error),
      stack: error?.stack
    });
    callback();
    return;
  }
  console.log('[services/logDuel] callback', {
    trace,
    elapsedMs: Date.now() - startedAt
  });
  callback();

}


/**
 * Sets up endpoints used by the endpoint services module.
 * @param {Object} app The app object supplies the structured input used by the endpoint services module, including the `get` and `post` properties.
 * @param {Function} app.get The `get` property supplies structured input used by the endpoint services module.
 * @param {Function} app.post The `post` property supplies structured input used by the endpoint services module.
 * @returns {void} Does not return a value.
 */
function setupEndpoints(app) {
  startSessionRefresh();

  app.get('/api/news', async (request, response) => {
    try {
      const page = Math.max(1, Number.parseInt(request.query.page || '1', 10) || 1);
      const pageSize = Math.min(20, Math.max(1, Number.parseInt(request.query.pageSize || '5', 10) || 5));
      const news = await getNewsPage(page, pageSize);
      response.send(news);
    } catch (error) {
      response.send(error.data || error.message || String(error));
    }
  });

  app.get('/api/news/:slug', async (request, response) => {
    try {
      const post = await getNewsPost(request.params.slug);
      response.send(post);
    } catch (error) {
      response.status(error.status || 500).send(error.data || error.message || String(error));
    }
  });

  app.get('/backgrounds', async (request, response) => {
    try {
      const backgrounds = await getBackgrounds();
      response.send(backgrounds);
    } catch (error) {
      response.send(error.data || error.message || String(error));
    }
  });

  app.get('/covers', async (request, response) => {
    try {
      const covers = await getCovers();
      response.send(covers);
    } catch (error) {
      response.send(error.data || error.message || String(error));
    }
  });

  app.get('/api/puzzles', (_request, response) => {
    response.send({
      success: true,
      puzzles: listProvidedPuzzles()
    });
  });

  app.post('/api/contact', postContactMessage);

  app.get('/ranking', async (request, response) => {
    try {
      const news = await getRanking();
      response.send(news);
    } catch (error) {
      response.send(error.data || error.message || String(error));
    }
  });

  app.get('/uploads/*path', async (request, response) => {
    try {
      const avatar = await getAvatar(request, response);
      response.send(avatar);
    } catch (error) {
      response.send(error.toString());
    }
  });
}

module.exports = {
  setupEndpoints,
  logDuel
};
