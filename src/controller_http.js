const express = require('express'),
    fs = require('fs'),
    https = require('https'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    toobusy = require('toobusy-js'),
    random_port = require('random-port'),
    app = express(),
    compression = require('compression'),
    hsts = require('hsts'),
    Ddos = require('ddos'),
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    HTTP_PORT = pack.port || 80,
    net = require('net'),
    ddos = new Ddos({
        maxcount: 2000,
        burst: 500,
        limit: 500 * 10,
        maxexpiry: 15,
        checkinterval: 5,
        trustProxy: true,
        includeUserAgent: true,
        whitelist: [],
        errormessage: 'Error',
        testmode: false,
        silent: true,
        silentStart: true,
        responseStatus: 429
    });

function systemLoad(req, res, next) {
    var processing = toobusy();
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
    } else {
        if (req.get('host') === 'ygopro.us') {
            res.redirect(301, 'https://ygosalvation.com' + req.url);
            res.end();
        } else {
            next();
        }
    }
}

function gitRoute(req, res, next) {
    manualController.setter();
    child_process.spawn('git', ['pull'], {}, function() {
        console.log('finished running git');
    });
}

module.exports = function() {

    app.use(ddos.express);
    app.use(compression());
    app.use(helmet());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json()); // Body parser use JSON data

    app.use(systemLoad);


    app.use(express.static(path.join(__dirname, '../http')));


    app.post('/git', function(req, res, next) {
        gitRoute(req, res, next);
    });

    app.get('/git', function(req, res, next) {
        gitRoute(req, res, next);
    });




    userController.setupController(app);
    forumController(app);

    try {
        var privateKey = fs.readFileSync(path.resolve(process.env.SSL + '\\private.key')).toString(),
            certificate = fs.readFileSync(path.resolve(process.env.SSL + '\\certificate.crt')).toString(),
            openserver = express();



        primusServer = https.createServer({
            key: privateKey,
            cert: certificate
        }, app).listen(443);

        // set up a route to redirect http to spdy
        openserver.use(helmet());
        openserver.use(ddos.express);
        openserver.get('*', function(req, res) {
            if (req.get('host') === 'ygopro.us') {
                res.redirect(301, 'https://ygosalvation.com' + req.url);
            } else {
                res.redirect(301, 'https://' + req.get('host') + req.url);
            }
        });
        openserver.listen(HTTP_PORT);
    } catch (nossl) {
        console.log('Failed to apply SSL to HTTP server', nossl.code);
        primusServer = http.createServer(app);
        primusServer.listen(HTTP_PORT);
    }





    primus = new Primus(primusServer, {
        parser: 'JSON'
    });

    primus.use('rooms', Rooms);






    primus.on('connection', function(socket) {
        socket.on('data', function(data) {
            try {
                onData(data, socket);
            } catch (error) {
                console.log(error);
            }
        });
    });
};