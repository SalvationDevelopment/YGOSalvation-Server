const axios = require('axios'),
    CMS_URL = process.env.CMS_URL;


async function getNews() {
    const news = await axios.get(`${CMS_URL}/updates?_sort=createdAt:ASC`);
    console.log(news.data)
    return news.data;
}

function setupEndpoints(app) {
    app.get('/news', async (request, response) => {
        try {
            const news = await getNews();
            response.send(news);
        } catch(error) {
            response.send(error.toJSON());
        }
    });
}

module.exports = {
    setupEndpoints
}