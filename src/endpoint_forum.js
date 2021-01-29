var ADMIN_SERVER_HOST = process.env.ADMIN_SERVER_HOST,
    http = require('http');

function proxyRequest(request, response) {
    let config = {};
    config.host = ADMIN_SERVER_HOST;
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