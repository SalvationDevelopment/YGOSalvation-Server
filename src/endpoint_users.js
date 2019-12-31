const axios = require('axios'),
    CMS_URL = process.env.CMS_URL


function validate(login, data, callback) {
    axios.post(`${CMS_URL}/auth/local`, {
        identifier: data.username,
        password: data.password,
    }).then(response => {
        console.log(response.data);
       callback(null, true, response.data)
    }).catch(error => {
        callback(error, false);
    });
}

function validateSession() { }

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
        const registerResponse = await axios.post(`${CMS_URL}/auth/local/register`, {
            username: payload.username,
            email: payload.email,
            password: payload.password,
        });
        response.send(registerResponse);
    } catch (error) {
        return response.send(error);
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
        const registerResponse = await axios.post(`${CMS_URL}/auth/forgot-password`, {
            email: payload.email,
            url: 'http:/localhost:1337/admin/plugins/users-permissions/auth/reset-password',
        });
        response.send(registerResponse);
    } catch (error) {
        return response.send(error);
    }
}


function setupController(app) {

    app.post('/register', register);
    app.post('/forgot', register);
    
}

module.exports = {
    recordDuelResult,
    saveDeck,
    setupController,
    validate,
    validateSession,

}