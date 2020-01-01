const axios = require('axios'),
    CMS_URL = process.env.CMS_URL,
    users = require('./endpoint_users'),
    EloRank = require('elo-rank');


let session = '';

users.validate(true, {
    username: process.env.SERVER_USERNAME,
    password: process.env.SERVER_PASSWORD
}, function (error, valid, responseData) {
    if (error) {
        console.log(error);
        process.exit();
    }
    session = responseData.jwt;
});

async function getNews() {
    const news = await axios.get(`${CMS_URL}/updates?_sort=createdAt:ASC`);
    return news.data;
}

async function getRanking() {
    const ranking = await axios.get(`${CMS_URL}/users?_sort=elo:desc`,
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
        const winner = (await axios.get(`${CMS_URL}/users/${winnerID}`, settings)).data;
        const loser = (await axios.get(`${CMS_URL}/users/${loserID}`, settings)).data;
        winner.points = (winner.points) ? 10 : winner.points + 10;
        loser.points = (loser.points) ? 1 : loser.points + 1;
        const expectedScoreA = elo.getExpected(winner.elo, loser.elo);
        const expectedScoreB = elo.getExpected(loser.elo, winner.elo);

        //update score, 1 if won 0 if lost
        winner.elo = elo.updateRating(expectedScoreA, 1, winner);
        loser.elo = elo.updateRating(expectedScoreB, 0, loser.elo);

        await axios.put(`${CMS_URL}/users/${winnerID}`, settings, { elo: winner.elo, points: winner.points });
        await axios.put(`${CMS_URL}/users/${losserID}`, settings, { elo: loser.elo, points: loser.points });

        await axios.post(`${CMS_URL}/replays/${winnerID}`, settings, { history: replay, creator: winnerID });
        await axios.post(`${CMS_URL}/replays/${losserID}`, settings, { history: replay, creator: winnerID });
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

    app.get('/ranking', async (request, response) => {
        try {
            const news = await getRanking();
            response.send(news);
        } catch (error) {
            response.send(error.toJSON());
        }
    });
}

module.exports = {
    setupEndpoints
}