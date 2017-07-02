/*jslint node: true, plusplus: true, unparam: false, nomen: true, bitwise:true*/
'use strict';

var zlib = require('zlib'),
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    jsonfile = require('jsonfile');

function getBanlist() {
    // this needs to be rewritten;
    var banlist = {},
        files = fs.readdirSync('../http/banlist/');
    files.forEach(function (filename) {
        if (filename.indexOf('.js') > -1) {
            var listname = filename.slice(0, -3);
            banlist[listname] = require('../http/banlist/' + '/' + filename);
        }
    });
    return banlist;
}

function getManifestFromAPI(callback) {
    var options = {
        host: '127.0.0.1',
        port: 8081,
        path: '/manifest.json',
        method: 'GET'
    };

    callback = callback || function () {};
    http.request(options, function (res) {
        var responseString = '';
        res.on('data', function (chunk) {
            responseString += chunk;
        });
        res.on('end', function () {
            try {
                var output = JSON.parse(responseString),
                    banlistfiles = getBanlist();
                fs.writeFile('../http/manifest/manifest_0-en-OCGTCG.json', JSON.stringify(output), function () {
                    fs.writeFile('../http/manifest/banlist.json', JSON.stringify(banlistfiles, null, 1), function () {});
                    callback(null, output, banlistfiles);
                });
            } catch (error) {
                return callback(error, []);
            }
        });
    }).end();

}




getManifestFromAPI();

module.exports = getManifestFromAPI;