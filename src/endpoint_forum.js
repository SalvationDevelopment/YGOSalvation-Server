
const ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL,
    ADMIN_HOST = new URL(ADMIN_SERVER_URL).host,
    http = require('http'),
    proxy = require('express-http-proxy');




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
    app.get('/sections', proxy(ADMIN_SERVER_URL));
    app.get('/forums',proxy(ADMIN_SERVER_URL));
    app.get('/threads',proxy(ADMIN_SERVER_URL));
    app.get('/comments', proxy(ADMIN_SERVER_URL));
}

module.exports = {
    setupEndpoints
};