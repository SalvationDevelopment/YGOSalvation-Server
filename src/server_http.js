const express = require('express'),
    fs = require('fs'),
    https = require('https'),
    http = require('http'),
    path = require('path'),
    toobusy = require('toobusy-js'),
    app = express(),
    compression = require('compression'),
    users = require('./endpoint_users.js'),
    decks = require('./endpoint_decks.js'),
    // Ddos = require('ddos'),
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    child_process = require('child_process'),
    HTTP_PORT = 80;
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
    var processing = false;
    if (processing && req.headers['Content-Type'] !== 'application/json') {
        res.status(503).send(`<html><head>
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
    var privateKey = fs.readFileSync(path.resolve(process.env.SSL + '\\private.key')).toString(),
        certificate = fs.readFileSync(path.resolve(process.env.SSL + '\\certificate.crt')).toString(),
        openserver = express();
    primusServer = https.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(443);
    // set up a route to redirect http to spdy
    openserver.use(helmet());
    //openserver.use(ddos.express);
    openserver.get('*', function (req, res) {
        const direction = (req.get('host') === 'ygopro.us')
            ? res.redirect(301, 'https://ygosalvation.com' + req.url)
            : res.redirect(301, 'https://' + req.get('host') + req.url);
        return;
    });
    openserver.listen(HTTP_PORT);
    return primusServer;
}


module.exports = function () {

    app.use(compression());
    app.use(helmet());
    app.use(bodyParser.json()); // Body parser use JSON data

    app.use(systemLoad);


    app.use(express.static(path.join(__dirname, '../http')));

    app.post('/git', function (req, res, next) {
        gitRoute(req, res, next);
    });

    app.get('/git', function (req, res, next) {
        gitRoute(req, res, next);
    });
    users.setupEndpoints(app);
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