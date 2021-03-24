var ADMIN_SERVER_HOST = process.env.ADMIN_SERVER_HOST,
    http = require('http');

function proxyRequest(request, response) {
    const config = {};
    config.host = ADMIN_SERVER_HOST;
    config.port = 1337;
    config.method = request.method;
    config.url = request.url;

    http.request(config, res => {
        res.on('data', function (chunk) {
            // console.log('chunk', chunk)
            response.write(chunk, 'binary');
        });
        res.on('end', function () {
            response.end();
        });
    }).end();

}

function setupEndpoints(app) {
    app.get('/sections', (request, response) => {
        proxyRequest(request, response);
    });

    app.get('/forums', (request, response) => {
        proxyRequest(request, response);
    });

    app.get('/threads', (request, response) => {
        proxyRequest(request, response);
    });

    app.get('/comments', (request, response) => {
        proxyRequest(request, response);
    });
}

module.exports = {
    setupEndpoints
};