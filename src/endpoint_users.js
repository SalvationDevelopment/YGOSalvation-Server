const axios = require('axios'),
    ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL,
    sanitizer = require('sanitizer'),
    zxcvbn = require('zxcvbn');


function validate(attempt, data, callback) {
    login(data).then((response => {
        callback(null, true, response)
    })).catch((error) => {
        callback(error, false, {});
    });
}

async function login(data) {
    const response = await axios.post(`${ADMIN_SERVER_URL}/auth/local`, {
        identifier: data.username,
        password: data.password,
    }), decks = await axios.get(`${ADMIN_SERVER_URL}/decks?owner=${data.username}&_sort=name:ASC`, {
        headers: {
            Authorization: `Bearer ${response.data.jwt}`
        }
    });
    response.data.decks = decks.data;
    return response.data;
}

async function validateSession(message, callback) {
    let user = {};
    try {
        const response = await axios.get(`${ADMIN_SERVER_URL}/users?username=${message.username}`, {
            headers: {
                Authorization: `Bearer ${message.session}`
            }
        }), decks = await axios.get(`${ADMIN_SERVER_URL}/decks?owner=${message.username}&_sort=name:ASC`, {
            headers: {
                Authorization: `Bearer ${message.session}`
            }
        });
        if (!response.data[0]) {
            throw new Error('User not found');
        }
        user = response.data[0];
        user.decks = decks.data;
    } catch (error) {
        callback(error, false);
        return;
    }
    callback(null, true, user);
}

function recordDuelResult() { }

function saveDeck() { }

async function register(request, response) {
    var payload = request.body || {};

    if (!payload.password) {
        response.send({
            error: 'No Password'
        });
        return;
    }
    payload.username = sanitizer.sanitize(payload.username);
    if (!payload.username) {
        response.send({
            error: 'No username'
        });
        return;
    }
    if (zxcvbn(payload.password) < 3) {
        response.send({
            error: 'Password is to weak'
        });
        response.end();
        return;
    }

    try {
        const registerResponse = await axios.post(`${ADMIN_SERVER_URL}/auth/local/register`, {
            username: payload.username,
            email: payload.email,
            password: payload.password,
        });
        response.send({
            info: registerResponse.data,
            success: true,
            error: null
        });
    } catch (error) {
        return response.send({
            success: false,
            error: 'Unable to create Account.'
        });
    }
}

async function forgot(request, response) {
    var payload = request.body || {};

    if (!payload.email) {
        response.send({
            error: 'No Email Address'
        });
        return;
    }

    try {
        const registerResponse = await axios.post(`${ADMIN_SERVER_URL}/auth/forgot-password`, {
            email: payload.email,
            url: 'http:/localhost:1337/admin/plugins/users-permissions/auth/reset-password',
        });
        response.send(registerResponse);
    } catch (error) {
        return response.send({
            success: false,
            error: error.message
        });
    }
}


function setupEndpoints(app) {

    app.post('/register', register);
    app.post('/forgot', register);

}

module.exports = {
    recordDuelResult,
    saveDeck,
    setupEndpoints,
    validate,
    validateSession,

}