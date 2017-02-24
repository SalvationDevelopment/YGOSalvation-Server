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
    serveIndex = require('serve-index');

function createVirtualStaticHost(domainName, dirPath) {
    return vhost(domainName, express['static'](dirPath));
}

function createVirtualPHPHost(domainName, dirPath) {
    return vhost(domainName, php.cgi(dirPath));
}


app.use(createVirtualStaticHost('localhost', require('path').resolve(process.cwd() + '\\..\\http')));
app.use(createVirtualPHPHost('localforum', require('path').resolve(process.cwd() + '\\..\\..\\..\\invision')));
app.use(createVirtualStaticHost(process.env.ProductionSITE, require('path').resolve(process.cwd() + '\\..\\http')));
app.use(createVirtualPHPHost(process.env.ProductionFORUM, require('path').resolve(process.cwd() + '\\..\\..\\..\\invision')));

//app.use('/ygopro', serveIndex(require('path').resolve(process.cwd() + '\\..\\http\\ygopro', {
//    'icons': true
//})));

app.use(function (req, res, next) {
    if (toobusy()) {
        res.send(503, "I'm busy right now, sorry.");
    } else {
        next();
    }
});



require('fs').watch(__filename, process.exit);
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
        console.log(req.get('host'));
        res.redirect('https://' + req.get('host') + req.url);
    });

    openserver.listen(80);
    // have it listen on 8080
} catch (nossl) {
    console.log('FAILED TO APPLY SSL', nossl);
    app.listen(80);
}

if (process.env.SSL !== undefined) {
    try {
        require('fs').watch(process.env.SSL, process.exit);
    } catch (error) {}
}