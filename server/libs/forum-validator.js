/*jslint node:true*/

'use strict';
var validationCache = {},
    request = require('request'),
    mysql = require('mysql'),
    crypto = require('crypto');

setInterval(function () {
    validationCache = {}
}, 600000); // cache the forum request for 10 mins.

function forumValidate(data, callback) {
    if (validationCache[data.username]) {
        callback(null, validationCache[data.username]);
        return;
    }
    process.nextTick(function () {
        var url = 'http://forum.ygopro.us/log.php',
            post = {
                ips_username: data.username,
                ips_password: data.password
            },
            info = {};
        request.post(url, {
            form: post
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                try {
                    forumdata = JSON.parse(body.trim());
                } catch (msgError) {
                    console.log('Error during validation', {}, body, msgError);
                    callback('Error during validation', info, body, msgError);
                    return;
                }
                info.success = forumdata.success;
                info.data = {};
                info.data.g_access_cp = forumdata.data.g_access_cp;
                info.displayname = forumdata.displayname
                validationCache[data.username] = forumdata;

                callback(null, info, body);
                return;
            } else {
                callback('Error during validation', {}, body);
            }
        });
    });
}

module.exports = forumValidate;
//
//var crypto = require('crypto');
//
//
//function md5(input) {
//    return crypto.createHash('md5').update(input).digest("hex");
//}
//
//function encode(pass, salt) {
//    return md5(md5(process.env.SALT) + md5(pass));
//}
//
//function initDB(query) {
//
//    var connection = mysql.createConnection({
//        host: 'localhost',
//        user: process.env.MYSQLUSER,
//        password: process.env.MYSQLPASSWORD,
//        database: process.env.MYSQLFORUMDB
//    });
//
//    connection.connect();
//    connection.query(query, function (err, rows, fields) {
//        if (err) {
//            throw err;
//        }
//
//        console.log('The solution is: ', rows[0].solution);
//        connection.end();
//    });
//}