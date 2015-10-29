/*jslint node : true*/
'use strict';
var forum = process.env.FORUM || '127.0.0.1',
    sitefiles = '../../invision',
    express = require('express'),
    php = require("node-php"),
    path = require("path"),
    app = express();

app.use("/", php.cgi(sitefiles));

app.listen(80, forum);