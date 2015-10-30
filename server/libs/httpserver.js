/*jslint node : true*/
'use strict';
var forum = process.env.FORUM || '127.0.0.1',
    sitefiles = './wordpress',
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


app.use(createVirtualStaticHost("ygopro.us", __dirname + '/../http'));
app.use(createVirtualPHPHost("forum.ygopro.us", __dirname + '/../wordpress'));
app.use(compression());
app.use(function (req, res, next) {
    if (toobusy()) {
        res.send(503, "I'm busy right now, sorry.");
    } else {
        next();
    }
});

app.listen(80);