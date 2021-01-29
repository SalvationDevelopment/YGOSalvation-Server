var ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL,
    ADMIN_HOST = new URL(ADMIN_SERVER_URL).host,//127.0.0.1:1337
    httpProxy = require('http-proxy'),
    http = require('http');

function proxyRequest(request, response) {
    let config = {};
    config.host = 'localhost';
    config.port = 1337;
    config.method = request.method;
    config.url = request.url;

    // const proxy = http.createClient(80, request.headers.host),
    //     proxy_request = proxy.request(request.method, request.url, request.headers);

    http.request(config,res => {
        res.on('data', function (chunk) {
            // console.log('chunk', chunk)
            response.write(chunk, 'binary');
        });
        res.on('end', function () {
            response.end();
        });
    }).end()

    // proxy_request.on('response', function (proxy_response) {
    //     proxy_response.addListener('data', function (chunk) {
    //         response.write(chunk, 'binary');
    //     });
    //     proxy_response.addListener('end', function () {
    //         response.end();
    //     });
    //     response.writeHead(proxy_response.statusCode, proxy_response.headers);
    // });
    // request.addListener('data', function (chunk) {
    //     proxy_request.write(chunk, 'binary');
    // });
    // request.addListener('end', function () {
    //     proxy_request.end();
    // });

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