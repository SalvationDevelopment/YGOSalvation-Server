const axios = require('axios'),
    ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL,
    users = require('./endpoint_users'),
    EloRank = require('elo-rank'),
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
axios.interceptors.request.use(
    config => {
        if(!!session)
        config.headers.Authorization = `Bearer ${session}`
        return config
    },
    err => {
        return Promise.reject(err)
    })

async function setRank(user) {
    try {
        await axios.get(`${ADMIN_SERVER_URL}/rankings?username=${user.username}`);
    } catch (error) {

    }
}

function setSession() {
    users.validate(true, {
        username: process.env.ADMIN_SERVER_USERNAME,
        password: process.env.ADMIN_SERVER_PASSWORD
    }, function (error, valid, responseData) {
        if (error) {
            console.log('[SERVER] Admin Server Permissions Failure: '.bold + error.toString());
            setTimeout(setSession, 3000);
            return;
        }
        console.log('[SERVER] Server Permissions Acquired '.bold, responseData.jwt);
        session = responseData.jwt;
    });
}

async function getNews() {
    const news = await axios.get(`${ADMIN_SERVER_URL}/updates?_sort=createdAt:ASC`, {
        // headers: {host: 'ygopro.us'},
        // host: 'ygopro.us'
    });
    return news.data;
}

async function getBackgrounds() {
    const backgrounds = await axios.get(`${ADMIN_SERVER_URL}/backgrounds?_sort=createdAt:ASC`);
    return backgrounds.data;
}

async function getCovers() {
    const covers = await axios.get(`${ADMIN_SERVER_URL}/covers?_sort=createdAt:ASC`);
    return covers.data;
}

async function getRanking() {
    const ranking = await axios.get(`${ADMIN_SERVER_URL}/users?_sort=elo:desc`);
    const data = ranking.data.filter((user) => {
        return !user.service;
    });
    const ranks = data.map((user) => {
        return {
            username: user.username,
            points: user.points || 0,
            elo: user.elo || 1200
        }
    });
    ranks.sort((a, b) => b.elo - a.elo);
    return ranks;
}

async function getAvatar(request, response) {
    const avatar = (await axios.get(`${ADMIN_SERVER_URL}${request.path}`, {
            responseType: 'arraybuffer'
        })),
        type = mime[path.extname(request.path).slice(1)] || 'text/plain';
    response.set('Content-Type', type);
    return avatar.data
}


async function logDuel(info, callback) {
    const settings = {
        headers: {
            Authorization: `Bearer ${session}`,
            'Content-Type': 'application/json',
            Accept: '*/*'
        }
    }, {winnerID, loserID, ranked, replay} = info;

    if (!ranked) {
        callback();
        return;
    }
    try {
        const elo = new EloRank(15),
            winner = (await axios.get(`${ADMIN_SERVER_URL}/users/${winnerID}`, settings)).data,
            loser = (await axios.get(`${ADMIN_SERVER_URL}/users/${loserID}`, settings)).data;

        winner.points = (winner.points) ? 10 : winner.points + 10;
        loser.points = (loser.points) ? 1 : loser.points + 1;

        //update score, 1 if won 0 if lost
        winner.elo = elo.updateRating(elo.getExpected(winner.elo, loser.elo), 1, winner.elo);
        loser.elo = elo.updateRating(elo.getExpected(loser.elo, winner.elo), 0, loser.elo);

        await axios.put(`${ADMIN_SERVER_URL}/users/${winnerID}`, {elo: winner.elo, points: winner.points}, settings);
        await axios.put(`${ADMIN_SERVER_URL}/users/${loserID}`, {elo: loser.elo, points: loser.points}, settings);

    } catch (error) {
        console.log('[SERVER]', error);
        callback();
        return;
    }
    callback();

}


function setupEndpoints(app) {
    app.get('/news', async (request, response) => {
        try {
            const news = await getNews();
            response.send(news);
        } catch (error) {
            response.send(error.toJSON());
        }
    });

    app.get('/backgrounds', async (request, response) => {
        try {
            const backgrounds = await getBackgrounds();
            response.send(backgrounds);
        } catch (error) {
            response.send(error.toJSON());
        }
    });

    app.get('/covers', async (request, response) => {
        try {
            const covers = await getCovers();
            response.send(covers);
        } catch (error) {
            response.send(error.toJSON());
        }
    });

    app.get('/ranking', async (request, response) => {
        try {
            const news = await getRanking();
            response.send(news);
        } catch (error) {
            response.send(error.toJSON());
        }
    });

    app.get('/uploads/*', async (request, response) => {
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

setSession();
setInterval(setSession, 600000);