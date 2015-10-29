/*jslint node : true*/
'use strict';

var nodestatic = require('node-static');

//
// Create a node-static server instance to serve the './public' folder
//
var file = new nodestatic.Server('../http', {
    gzip: true
});

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(80, '127.0.0.1');