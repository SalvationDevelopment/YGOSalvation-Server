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

function setSession() {
    users.validate(true, {
        username: process.env.ADMIN_SERVER_USERNAME,
        password: process.env.ADMIN_SERVER_PASSWORD
    }, function (error, valid, responseData) {
        if (error) {
            setTimeout(setSession,10000);

            
            console.log('[SERVER] Server Permissions Incorrect '.bold.error);
            return;
        }
        console.log('[SERVER] Server Permissions Aquired '.bold.green);
        session = responseData.jwt;
    });
}

async function getNews() {
    const news = await axios.get(`${ADMIN_SERVER_URL}/updates?_sort=createdAt:ASC`);
    return news.data;
}

async function getBackgrounds() {
    const backgrounds = await axios.get(`${ADMIN_SERVER_URL}/backgrounds?_sort=createdAt:ASC`);
    return backgrounds.data;
}

async function getRanking() {
    const ranking = await axios.get(`${ADMIN_SERVER_URL}/users?_sort=elo:desc`,
        {
            headers: {
                Authorization: `Bearer ${session}`
            }
        });
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
            Authorization: `Bearer ${session}`
        }
    };
    const { winnerID, loserID, ranked, replay } = info;
    if (!ranked) {
        callback();
        return;
    }
    try {
        const elo = new EloRank(15);
        const winner = (await axios.get(`${ADMIN_SERVER_URL}/users/${winnerID}`, settings)).data;
        const loser = (await axios.get(`${ADMIN_SERVER_URL}/users/${loserID}`, settings)).data;
        winner.points = (winner.points) ? 10 : winner.points + 10;
        loser.points = (loser.points) ? 1 : loser.points + 1;
        const expectedScoreA = elo.getExpected(winner.elo, loser.elo);
        const expectedScoreB = elo.getExpected(loser.elo, winner.elo);

        //update score, 1 if won 0 if lost
        winner.elo = elo.updateRating(expectedScoreA, 1, winner);
        loser.elo = elo.updateRating(expectedScoreB, 0, loser.elo);

        await axios.put(`${ADMIN_SERVER_URL}/users/${winnerID}`, settings, { elo: winner.elo, points: winner.points });
        await axios.put(`${ADMIN_SERVER_URL}/users/${losserID}`, settings, { elo: loser.elo, points: loser.points });

        await axios.post(`${ADMIN_SERVER_URL}/replays/${winnerID}`, settings, { history: replay, creator: winnerID });
        await axios.post(`${ADMIN_SERVER_URL}/replays/${losserID}`, settings, { history: replay, creator: winnerID });
    } catch (error) {
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
            const news = await getBackgrounds();
            response.send(news);
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
}

setSession();
setInterval(setSession, 600000);