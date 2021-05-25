process.title = 'YGOSalvation Server';
require('dotenv').config();
require('colors');

const
    ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL,
    child_process = require('child_process'),
    server = require('./src'),
    fs = require('fs'),
    ADMIN_SERVER_USERNAME = process.env.ADMIN_SERVER_USERNAME,
    ADMIN_SERVER_PASSWORD = process.env.ADMIN_SERVER_PASSWORD,
    os = require('os');

let adminServer,
    databaseServer,
    srvpro,
    proxyServer;

/**
* Program Entry Point
* @returns {undefined}
*/
function main() {
    console.log('[SERVER] YGO Salvation Server - Saving Yu-Gi-Oh!'.bold.green);
    const banlist = './http/manifest/banlist.json';
    
    if (!ADMIN_SERVER_URL || !ADMIN_SERVER_USERNAME || !ADMIN_SERVER_PASSWORD) {
        console.error('Administrative Server and User are not configured, no database access.');
        console.info('HINT --> README.MD'.bold.yellow);
        if (!process.env.DEFIANT) {
            process.exit(1);
        }
    }

    if (Boolean(process.env.ADMIN_SERVER_LOCAL)) {
        console.log('[SERVER] Starting Admin Server'.bold.green);
        adminServer = child_process.fork('../ygosalvation-admin/src/server.js');
    }

    if (Boolean(process.env.DATABASE_SERVER_LOCAL)) {
        console.log('[SERVER] Starting Database Server'.bold.green);
        databaseServer = child_process.fork('../ygosalvation-database/app.js', [], {

        });
    }

    if (Boolean(process.env.SRVPRO)) {
        console.log('[SERVER] Starting Database Server'.bold.green);
        srvpro = child_process.fork('../srvpro/', [], {

        });
    }

    if (Boolean(process.env.PROXY_PORT)) {
        console.log('[SERVER] Starting Network Proxy Server'.bold.green);
        proxyServer = child_process.fork('./src/server_proxy.js', [], {
            env: process.env
        });
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
