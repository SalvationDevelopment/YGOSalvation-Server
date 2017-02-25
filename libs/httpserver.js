/*jslint node : true*/
'use strict';
var express = require('express'),
    fs = require('fs'),
    https = require('https'),
    http = require('http'),
    url = require('url'),
    php = require("node-php"),
    path = require("path"),
    toobusy = require('toobusy-js'),
    app = express(),
    vhost = require('vhost'),
    serveIndex = require('serve-index'),
    protection = false;

require('fs').watch(__filename, process.exit);

app.use(express['static'](path.join(__dirname, '../http')));
app.use(function (req, res, next) {
    if (toobusy()) {
        res.send(503, "I'm busy right now, sorry.");
    } else {
        next();
    }
});

try {
    var privateKey = fs.readFileSync(path.resolve(process.env.SSL + '\\ssl.key')).toString();
    var certificate = fs.readFileSync(path.resolve(process.env.SSL + '\\ssl.crt')).toString();


    https.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(443);
    var openserver = express();
    // set up a route to redirect http to https
    openserver.get('*', function (req, res) {
        res.redirect('https://' + req.get('host') + req.url);
    });

    openserver.listen(80);
    // have it listen on 8080
    protection = true;
} catch (nossl) {
    console.log('Failed to apply SSL to HTTP server');
    app.listen(80);
}

if (process.env.SSL !== undefined) {
    try {
        require('fs').watch(process.env.SSL, process.exit);
    } catch (error) {}
}