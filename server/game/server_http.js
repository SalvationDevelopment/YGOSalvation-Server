const express = require('express'),
    fs = require('fs'),
    https = require('https'),
    http = require('http'),
    path = require('path'),
    toobusy = require('toobusy-js'),
    app = express(),
    compression = require('compression'),
    createApiRouter = require('../api/routes').createApiRouter,
    // Ddos = require('ddos'),
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    child_process = require('child_process'),
    HTTP_PORT = process.env.HTTP_PORT || 80,
    HTTPS_PORT = process.env.HTTPS_PORT || 443,
    PROXY_PORT = process.env.PROXY_PORT || 8080;
// ddos = new Ddos({
//     maxcount: 2000,
//     burst: 500,
//     limit: 500 * 10,
//     maxexpiry: 15,
//     checkinterval: 5,
//     trustProxy: true,
//     includeUserAgent: true,
//     whitelist: [],
//     errormessage: 'Error',
//     testmode: false,
//     silent: true,
//     silentStart: true,
//     responseStatus: 429
// });


/**
 * Executes the system load helper used by the server http module.
 * @param {Object} req The req request object provides the incoming data used by the server http route, including the `get`, `headers`, and `url` properties.
 * @param {Function} req.get The `get` property supplies structured input used by the server http module.
 * @param {Object} req.headers The `headers` property supplies structured input used by the server http module.
 * @param {string} req.headers.Content-Type The `headers.Content-Type` property supplies structured input used by the server http module.
 * @param {string} req.url The `url` property supplies structured input used by the server http module.
 * @param {Object} res The res response object provides the outgoing channel used by the server http route, including the `redirect` property.
 * @param {Function} res.redirect The `redirect` property supplies structured input used by the server http module.
 * @param {Function} next The next callback advances request handling in the server http module.
 * @returns {void} Does not return a value.
 */
function systemLoad(req, res, next) {
    toobusy.maxLag(10000);
    const processing = false;
    if (processing && req.headers['Content-Type'] !== 'application/json') {
        res.status(503).send(`<html lang=""><head>
        <title>YGOSalvation</title>
        <style>
        body {color:white;background:black; text-align:center}
        div {margin-top:45vh}
        </style>
        </head><body>
            <div>Server is loading,...</div>
            <script>
                setTimeout(window.location.reload.bind(window.location),5000);
            </script>
        </body></html>`);
        next();
        return;
    }

    if (req.get('host') === 'ygopro.us') {
        res.redirect(301, 'https://ygosalvation.com' + req.url);
        res.end();
        return;
    }

    next();
}

/**
 * Executes the git route helper used by the server http module.
 * @param {Object} req The req request provides the incoming data used by the server http route.
 * @param {Object} res The res response provides the outgoing channel used by the server http route.
 * @param {Function} next The next callback advances request handling in the server http module.
 * @returns {void} Does not return a value.
 */
function gitRoute(req, res, next) {
    child_process.spawn('git', ['pull'], {}, function () {
        console.log('Finished running git');
    });
    child_process.fork('./src/updater/banlist.js');
}


/**
 * Uses ssl used by the server http module.
 * @param {Object} connectionServer The connectionServer value carries the active HTTP or HTTPS server instance used by the server http module.
 * @returns {Object} Returns the HTTPS server instance configured by the server http module.
 */
function useSSL(connectionServer) {
    var privateKey = fs.readFileSync(path.resolve(process.env.SSL_KEY)).toString(),
        certificate = fs.readFileSync(path.resolve(process.env.SSL_CERT)).toString(),
        openserver = express();
    connectionServer = https.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(HTTPS_PORT);
    // set up a route to redirect http to spdy
    openserver.use(helmet());
    //openserver.use(ddos.express);
    openserver.get('*', function (req, res) {
        const direction = (req.get('host') === 'ygopro.us')
            ? res.redirect(301, 'https://ygosalvation.com' + req.url)
            : res.redirect(301, 'https://' + req.get('host') + req.url);

    });
    openserver.listen(HTTP_PORT);
    return connectionServer;
}


module.exports = function () {

    app.use(compression());
    app.use(helmet());
    app.use(bodyParser.json()); // Body parser use JSON data

    app.use(systemLoad);


    app.use(express.static(path.join(__dirname, '../build')));

    app.post('/git', function (request, response, next) {
        gitRoute(request, response, next);
    });

    app.get('/git', function (request, response, next) {
        gitRoute(request, response, next);
    });

    app.get('/status.json', function (request, response, next) {
        response.send({
            PROXY_PORT
        });
    });

    app.use(createApiRouter());
    let connectionServer;

    try {
        connectionServer = useSSL(connectionServer);
    } catch (nossl) {
        console.log('[HTTP] SSL (https protocol) not avaliable, using http protocol instead'.bold.red);
        connectionServer = http.createServer(app);
        connectionServer.listen(HTTP_PORT);
    }
    // app.use(ddos.express);
    return connectionServer;
};
