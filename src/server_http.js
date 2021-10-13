const express = require('express'),
    fs = require('fs'),
    https = require('https'),
    http = require('http'),
    path = require('path'),
    toobusy = require('toobusy-js'),
    app = express(),
    compression = require('compression'),
    users = require('./endpoint_users.js'),
    news = require('./endpoint_services.js'),
    forum = require('./endpoint_forum.js'),
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

function gitRoute(req, res, next) {
    child_process.spawn('git', ['pull'], {}, function () {
        console.log('Finished running git');
    });
    child_process.fork('./src/updater/banlist.js');
}


function useSSL(primusServer) {
    var privateKey = fs.readFileSync(path.resolve(process.env.SSL_KEY)).toString(),
        certificate = fs.readFileSync(path.resolve(process.env.SSL_CERT)).toString(),
        openserver = express();
    primusServer = https.createServer({
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
    return primusServer;
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

    users.setupEndpoints(app);
    news.setupEndpoints(app);
    forum.setupEndpoints(app);
    let primusServer;

    try {
        primusServer = useSSL(primusServer);
    } catch (nossl) {
        console.log('[HTTP] SSL (https protocol) not avaliable, using http protocol instead'.bold.red);
        primusServer = http.createServer(app);
        primusServer.listen(HTTP_PORT);
    }
    // app.use(ddos.express);
    return primusServer;
};