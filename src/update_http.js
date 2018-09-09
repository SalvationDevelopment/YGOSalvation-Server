/*jslint node: true, plusplus: true, unparam: false, nomen: true, bitwise:true*/
'use strict';

var zlib = require('zlib'),
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    jsonfile = require('jsonfile')

module.exports = function getManifestFromAPI(callback) {
    var options = {
        host: '127.0.0.1',
        port: 8082,
        path: '/manifest.json',
        method: 'GET'
    };

    callback = callback || function() {};

    var call;


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
                    callback(null, JSON.stringify(output));
                });
            } catch (error) {
                return callback(error, []);
            }
        });
    });
    call.on('error', function() {
        console.log('Unable to contact YGO_DB Instance');
        callback(null, fs.readFileSync('./http/manifest/manifest_0-en-OCGTCG.json'));
    });
    call.end();
}