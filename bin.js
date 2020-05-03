process.title = 'YGOSalvation Server';
require('dotenv').config();
const
    ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL,
    child_process = require('child_process'),
    server = require('./src'),
    fs = require('fs'),
    ADMIN_SERVER_USERNAME = process.env.ADMIN_SERVER_USERNAME,
    ADMIN_SERVER_PASSWORD = process.env.ADMIN_SERVER_PASSWORD,
    os = require('os');

let adminServer,
    databaseServer;

/**
* Program Entry Point
* @returns {undefined}
*/
function main() {
    console.log('[SERVER] YGO Salvation Server - Saving Yu-Gi-Oh!'.bold.green);
    const banlist = './http/manifest/banlist.json';

    if (os.platform === 'win32' && process.env.NODIST_X64 !== '0' || os.arch() === 'x64') {
        console.error('Node is Running in 64bit mode, games can not start.');
        console.info('HINT --> SET NODIST_X64=0'.bold.yellow);
        process.exit();
    }
    if (!ADMIN_SERVER_URL || !ADMIN_SERVER_USERNAME || !ADMIN_SERVER_PASSWORD) {
        console.error('Administrative Server and User are not configured, no database access.');
        console.info('HINT --> README.MD'.bold.yellow);
        process.exit();
    }

    if (Boolean(process.env.ADMIN_SERVER_LOCAL)) {
        console.log('[SERVER] Starting Admin Server'.bold.green);
        adminServer = child_process.fork('../ygosalvation-admin/src/server.js');
    }

    if (Boolean(process.env.DATABASE_SERVER_LOCAL)) {
        console.log('[SERVER] Starting Database Server'.bold.green);
        databaseServer = child_process.fork('../ygosalvation-database/app.js');
    }

    fs.access(banlist, function (err) {
        if (err && err.code === 'ENOENT') {
            console.error('Error: Banlist not generated, run "npm run banlist"');
            console.info('HINT --> npm run banlist'.bold.yellow);
            process.exit();
        }
        server();
    });
}

main();
