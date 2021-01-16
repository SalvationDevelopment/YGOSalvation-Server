
const ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL,
    ADMIN_HOST = new URL(ADMIN_SERVER_URL).host,
    http = require('http');



function proxyRequest(request, response) {
    request.headers.host = ADMIN_HOST;
    var proxy = http.request(80, request.headers.host),
        proxy_request = proxy.request(request.method, request.url, request.headers);

    proxy_request.addListener('response', function (proxy_response) {
        proxy_response.addListener('data', function (chunk) {
            response.write(chunk, 'binary');
        });
        proxy_response.addListener('end', function () {
            response.end();
        });
        response.writeHead(proxy_response.statusCode, proxy_response.headers);
    });
    request.addListener('data', function (chunk) {
        proxy_request.write(chunk, 'binary');
    });
    request.addListener('end', function () {
        proxy_request.end();
    });
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