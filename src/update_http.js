/*jslint node: true, plusplus: true, unparam: false, nomen: true, bitwise:true*/
'use strict';

var zlib = require('zlib'),
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    jsonfile = require('jsonfile'),
    hotload = require('hotload');

function getBanlist() {
    // this needs to be rewritten;
    var banlist = {},
        files = fs.readdirSync('./http/banlist/');
    files.forEach(function(filename) {
        if (filename.indexOf('.js') > -1) {
            var listname = filename.slice(0, -3);
            banlist[listname] = hotload('../http/banlist/' + '/' + filename);
        }
    });
    return banlist;
}

function getManifestFromAPI(callback) {
    var options = {
        host: '127.0.0.1',
        port: 8082,
        path: '/manifest.json',
        method: 'GET'
    };

    callback = callback || function() {};

    var banlistfiles = getBanlist(),
        call;

    fs.writeFile('../http/manifest/banlist.json', JSON.stringify(banlistfiles, null, 1), function() {
        call = http.request(options, function(res) {
            var responseString = '';
            res.on('data', function(chunk) {
                responseString += chunk;
            });
            res.on('error', function(errorMessage) {
                console.log(errorMessage);
            });
            res.on('end', function() {
                try {
                    var output = JSON.parse(responseString);
                    fs.writeFile('./http/manifest/manifest_0-en-OCGTCG.json', JSON.stringify(output), function() {
                        callback(null, output, banlistfiles);
                    });
                } catch (error) {
                    return callback(error, []);
                }
            });
        });
        call.on('error', function() {
            console.log('Unable to contact Database Application');
            callback(null, fs.readFileSync('./http/manifest/manifest_0-en-OCGTCG.json'), banlistfiles);
        });
        call.end();
    });
}




getManifestFromAPI();

module.exports = getManifestFromAPI;