/*jslint node : true*/
'use strict';
var
    express = require('express'),
    php = require("node-php"),
    path = require("path"),
    toobusy = require('toobusy-js'),
    app = express(),
    vhost = require('vhost'),
    compression = require('compression');

function createVirtualStaticHost(domainName, dirPath) {
    return vhost(domainName, express['static'](dirPath));
}

function createVirtualPHPHost(domainName, dirPath) {
    return vhost(domainName, php.cgi(dirPath));
}


app.use(createVirtualStaticHost(process.env.SITE, require('path').resolve(process.cwd() + '\\..\\http')));
app.use(createVirtualPHPHost(process.env.FORUM, require('path').resolve(process.cwd() + '\\..\\..\\..\\invision')));
app.use(createVirtualStaticHost(process.env.ProductionSITE, require('path').resolve(process.cwd() + '\\..\\http')));
app.use(createVirtualPHPHost(process.env.ProductionFORUM, require('path').resolve(process.cwd() + '\\..\\..\\..\\invision')));
app.use(compression());
app.use(function (req, res, next) {
    if (toobusy()) {
        res.send(503, "I'm busy right now, sorry.");
    } else {
        next();
    }
});

app.listen(80);

require('fs').watch(__filename, process.exit);