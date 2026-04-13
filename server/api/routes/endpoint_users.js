require('../../lib/load-shared-env');



const { request } = require('../../lib/http'),
  ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL || 'http://localhost:3000/api',
  zxcvbn = require('zxcvbn');

/**
 * Gets auth headers used by the endpoint users module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint users route, including the `headers` property.
 * @param {Object} req.headers The `headers` property supplies structured input used by the endpoint users module.
 * @param {string} req.headers.Authorization The `headers.Authorization` property supplies structured input used by the endpoint users module.
 * @param {string} req.headers.authorization The `headers.authorization` property supplies structured input used by the endpoint users module.
 * @returns {{Authorization?: string}} Returns the value produced by the endpoint users module.
 */
function getAuthHeaders(req) {
  const authorization = req.headers.authorization || req.headers.Authorization;
  return authorization ? { Authorization: authorization } : {};
}

/**
 * Normalizes input string used by the endpoint users module.
 * @param {string} value The value value provides an input used by the endpoint users module.
 * @returns {string} Returns the value produced by the endpoint users module.
 */
function normalizeInputString(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/\0/g, '').trim();
}

/**
 * Normalizes username used by the endpoint users module.
 * @param {string} value The value value provides an input used by the endpoint users module.
 * @returns {string} Returns the value produced by the endpoint users module.
 */
function normalizeUsername(value) {
  // Restrict username input to a plain string so Mongo query operators cannot
  // be smuggled in as objects, then trim and drop obvious metacharacters.
  return normalizeInputString(value).replace(/[$.]/g, '');
}


/**
 * Executes the validate helper used by the endpoint users module.
 * @param {boolean} attempt The attempt value provides an input used by the endpoint users module.
 * @param {Object} data The data object supplies the structured input used by the endpoint users module, including the `username` property.
 * @param {string} data.username The `username` property supplies structured input used by the endpoint users module.
 * @param {Function} callback The callback value provides an input used by the endpoint users module.
 * @returns {void} Does not return a value.
 */
function validate(attempt, data, callback) {
  console.log('Validating login attempt for user:', data.username);
  login(data).then((response => {
    callback(null, true, response);
  })).catch((error) => {
    callback(error, false, {});
  });
}

/**
 * Executes the login helper used by the endpoint users module.
 * @param {Object} data The data object supplies the structured input used by the endpoint users module, including the `password` and `username` properties.
 * @param {string} data.password The `password` property supplies structured input used by the endpoint users module.
 * @param {string} data.username The `username` property supplies structured input used by the endpoint users module.
 * @returns {Promise<Object>} Resolves with the value produced by the endpoint users module.
 */
async function login(data) {
  console.log(`Attempting login for user @ ${ADMIN_SERVER_URL}/auth/local :`, data.username);
  const response = await request(`${ADMIN_SERVER_URL}/auth/local`, {
      method: 'POST',
      body: {
        identifier: data.username,
        password: data.password
      } }), decksResponse = await request(`${ADMIN_SERVER_URL}/decks?owner=${data.username}&_sort=name:ASC`, {
      headers: {
        Authorization: `Bearer ${response.data['jwt']}`
      }
    });
  response.data.decks = Array.isArray(decksResponse.data)
    ? decksResponse.data
    : (decksResponse.data.decks || []);
  return response.data;
}

/**
 * Validates session used by the endpoint users module.
 * @param {Object} message The message object supplies the structured input used by the endpoint users module, including the `session` and `username` properties.
 * @param {string} message.session The `session` property supplies structured input used by the endpoint users module.
 * @param {string} message.username The `username` property supplies structured input used by the endpoint users module.
 * @param {Function} callback The callback value provides an input used by the endpoint users module.
 * @returns {Promise<void>} Resolves when the endpoint users operation completes.
 */
async function validateSession(message, callback) {
  console.log('Validating session for user:', message.username);
  let user = {};
  try {
    const response = await request(`${ADMIN_SERVER_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${message.session}`
        }
      }), decksResponse = await request(`${ADMIN_SERVER_URL}/decks?owner=${message.username}&_sort=name:ASC`, {
        headers: {
          Authorization: `Bearer ${message.session}`
        }
      });
    if (!response.data) {
      throw new Error('User not found');
    }
    user = response.data;
    user.decks = Array.isArray(decksResponse.data)
      ? decksResponse.data
      : (decksResponse.data.decks || []);
  } catch (error) {
    callback(error, false);
    return;
  }
  callback(null, true, user);
}

/**
 * Executes the record duel result helper used by the endpoint users module.
 * @returns {void} Does not return a value.
 */
function recordDuelResult() { }

/**
 * Saves deck used by the endpoint users module.
 * @returns {void} Does not return a value.
 */
function saveDeck() { }

/**
 * Executes the register helper used by the endpoint users module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint users route, including the `body` property.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint users module.
 * @param {string} req.body.email The `body.email` property supplies structured input used by the endpoint users module.
 * @param {string} req.body.password The `body.password` property supplies structured input used by the endpoint users module.
 * @param {string} req.body.username The `body.username` property supplies structured input used by the endpoint users module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint users route.
 * @returns {Promise<undefined>} Resolves with the value produced by the endpoint users module.
 */
async function register(req, res) {
  const payload = req.body || {};

  if (!payload.password) {
    res.send({
      error: 'No Password'
    });
    return;
  }
  payload.username = normalizeUsername(payload.username);
  payload.email = normalizeInputString(payload.email).toLowerCase();
  if (!payload.username) {
    res.send({
      error: 'No username'
    });
    return;
  }
  if (zxcvbn(payload.password).score < 3) {
    res.send({
      error: 'Password is to weak'
    });
    res.end();
    return;
  }

  try {
    const registerResponse = await request(`${ADMIN_SERVER_URL}/auth/local/register`, {
      method: 'POST',
      body: {
        username: payload.username,
        email: payload.email,
        password: payload.password
      } });
    res.send({
      info: registerResponse.data,
      success: true,
      error: null
    });
  } catch {
    return res.send({
      success: false,
      error: 'Unable to create Account.'
    });
  }
}

/**
 * Executes the forgot helper used by the endpoint users module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint users route, including the `body` property.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint users module.
 * @param {string} req.body.email The `body.email` property supplies structured input used by the endpoint users module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint users route.
 * @returns {Promise<undefined>} Resolves with the value produced by the endpoint users module.
 */
async function forgot(req, res) {
  const payload = req.body || {};
  payload.email = normalizeInputString(payload.email).toLowerCase();

  if (!payload.email) {
    res.send({
      error: 'No Email Address'
    });
    return;
  }

  try {
    const registerResponse = await request(`${ADMIN_SERVER_URL}/auth/forgot-password`, {
      method: 'POST',
      body: {
        email: payload.email,
        url: 'http:/localhost:1337/admin/plugins/users-permissions/auth/reset-password'
      } });
    res.send(registerResponse.data);
  } catch (error) {
    return res.send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Recovers password used by the endpoint users module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint users route, including the `body` property.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint users module.
 * @param {string} req.body.code The `body.code` property supplies structured input used by the endpoint users module.
 * @param {string} req.body.password The `body.password` property supplies structured input used by the endpoint users module.
 * @param {string} req.body.passwordConfirmation The `body.passwordConfirmation` property supplies structured input used by the endpoint users module.
 * @param {Object} req.body.recoveryPass The `body.recoveryPass` property supplies structured input used by the endpoint users module.
 * @param {string} req.body.recoveryPass.code The `body.recoveryPass.code` property supplies structured input used by the endpoint users module.
 * @param {string} req.body.recoveryPass.password The `body.recoveryPass.password` property supplies structured input used by the endpoint users module.
 * @param {string} req.body.recoveryPass.passwordConfirmation The `body.recoveryPass.passwordConfirmation` property supplies structured input used by the endpoint users module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint users route.
 * @returns {Promise<void>} Resolves when the endpoint users operation completes.
 */
async function recoverPassword(req, res) {
  const payload = req.body || {};
  const recovery = payload.recoveryPass || {};
  const code = normalizeInputString(recovery.code || payload.code);
  const password = normalizeInputString(recovery.password || payload.password);

  if (!code || !password) {
    res.send({
      success: false,
      error: 'Recovery code and new password are required.'
    });
    return;
  }

  try {
    const resetResponse = await request(`${ADMIN_SERVER_URL}/auth/reset-password`, {
      method: 'POST',
      body: {
        code,
        password,
        passwordConfirmation: normalizeInputString(recovery.passwordConfirmation || payload.passwordConfirmation || password)
      } });
    res.send({
      success: true,
      info: resetResponse.data
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message
    });
  }
}

/**
 * Gets session used by the endpoint users module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint users route, including the `params` property.
 * @param {Object} req.params The `params` property supplies structured input used by the endpoint users module.
 * @param {string} req.params.session The `params.session` property supplies structured input used by the endpoint users module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint users route.
 * @returns {Promise<void>} Resolves when the endpoint users operation completes.
 */
async function getSession(req, res) {
  const session = req.params.session;

  if (!session) {
    res.send({
      success: false,
      error: 'Missing session token.'
    });
    return;
  }

  try {
    const me = (await request(`${ADMIN_SERVER_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${session}`
        }
      })).data, decksResponse = (await request(`${ADMIN_SERVER_URL}/decks?owner=${me.username}&_sort=name:ASC`, {
        headers: {
          Authorization: `Bearer ${session}`
        }
      })).data;
    const decks = Array.isArray(decksResponse) ? decksResponse : (decksResponse.decks || []);

    res.send({
      success: true,
      user: {
        ...me,
        decks
      }
    });
  } catch {
    res.send({
      success: false,
      error: 'Invalid session'
    });
  }
}

/**
 * Gets profile used by the endpoint users module.
 * @param {Object} req The req request provides the incoming data used by the endpoint users route.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint users route.
 * @returns {Promise<void>} Resolves when the endpoint users operation completes.
 */
async function getProfile(req, res) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/users/me`, {
      headers: getAuthHeaders(req)
    });
    res.send(response.data);
  } catch (error) {
    res.status(error.status || 500).send({
      success: false,
      error: error.data?.error || error.message || 'Unable to load profile.'
    });
  }
}

/**
 * Updates profile used by the endpoint users module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint users route, including the `body` property.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint users module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint users route.
 * @returns {Promise<void>} Resolves when the endpoint users operation completes.
 */
async function updateProfile(req, res) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/users/me`, {
      method: 'PATCH',
      headers: getAuthHeaders(req),
      body: req.body || {}
    });
    res.send(response.data);
  } catch (error) {
    res.status(error.status || 500).send({
      success: false,
      error: error.data?.error || error.message || 'Unable to update profile.'
    });
  }
}

/**
 * Creates friend request used by the endpoint users module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint users route, including the `body` property.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint users module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint users route.
 * @returns {Promise<void>} Resolves when the endpoint users operation completes.
 */
async function createFriendRequest(req, res) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/users/me/friends`, {
      method: 'POST',
      headers: getAuthHeaders(req),
      body: req.body || {}
    });
    res.send(response.data);
  } catch (error) {
    res.status(error.status || 500).send({
      success: false,
      error: error.data?.error || error.message || 'Unable to send friend request.'
    });
  }
}

/**
 * Updates friendship used by the endpoint users module.
 * @param {Object} req The req request object provides the incoming data used by the endpoint users route, including the `body` property.
 * @param {Object} req.body The `body` property supplies structured input used by the endpoint users module.
 * @param {Object} res The res response provides the outgoing channel used by the endpoint users route.
 * @returns {Promise<void>} Resolves when the endpoint users operation completes.
 */
async function updateFriendship(req, res) {
  try {
    const response = await request(`${ADMIN_SERVER_URL}/users/me/friends`, {
      method: 'PATCH',
      headers: getAuthHeaders(req),
      body: req.body || {}
    });
    res.send(response.data);
  } catch (error) {
    res.status(error.status || 500).send({
      success: false,
      error: error.data?.error || error.message || 'Unable to update friend relationship.'
    });
  }
}


/**
 * Sets up endpoints used by the endpoint users module.
 * @param {Object} app The app object supplies the structured input used by the endpoint users module, including the `get`, `patch`, and `post` properties.
 * @param {Function} app.get The `get` property supplies structured input used by the endpoint users module.
 * @param {Function} app.patch The `patch` property supplies structured input used by the endpoint users module.
 * @param {Function} app.post The `post` property supplies structured input used by the endpoint users module.
 * @returns {void} Does not return a value.
 */
function setupEndpoints(app) {

  app.post('/register', register);
  app.post('/forgot', forgot);
  app.post('/recover', forgot);
  app.post('/recoverpassword', recoverPassword);
  app.get('/api/session/:session', getSession);
  app.get('/api/profile', getProfile);
  app.patch('/api/profile', updateProfile);
  app.post('/api/profile/friends', createFriendRequest);
  app.patch('/api/profile/friends', updateFriendship);

}

module.exports = {
  recordDuelResult,
  saveDeck,
  setupEndpoints,
  validate,
  validateSession

};
