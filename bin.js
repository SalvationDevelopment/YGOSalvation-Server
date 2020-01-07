
require('dotenv').config();
const axios = require('axios'),
    ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL,
    child_process = require('child_process'),
    controller = require('./src'),
    fs = require('fs'),
    ADMIN_SERVER_USERNAME = process.env.ADMIN_SERVER_USERNAME,
    ADMIN_SERVER_PASSWORD = process.env.ADMIN_SERVER_PASSWORD,
    os = require('os');



/**
 * Program Entry Point
 * @returns {undefined}
 */
async function main() {
    console.log('[SERVER] YGO Salvation Server - Saving Yu-Gi-Oh!'.bold.green);
    const banlist = './http/manifest/banlist.json';

    if (process.env.NODIST_X64 !== '0' || os.arch() === 'x64') {
        console.error('Node is Running in 64bit mode, games can not start; SET NODIST_X64=0');
        process.exit();
    }
    if (!ADMIN_SERVER_URL || !ADMIN_SERVER_USERNAME || !ADMIN_SERVER_PASSWORD) {
        console.error('Administrative Server and User are not configured, no database access, see README.MD for details.');
        process.exit();
    }

    if (!fs.existsSync(banlist)) {
        console.error('Error: Banlist not generated, run "npm run banlist"');
        process.exit();
    }

    if (Boolean(process.env.ADMIN_SERVER_LOCAL)) {
        console.log('[SERVER] Starting Admin Server'.bold.green);
        var subserver = child_process.fork('../ygosalvation-admin/src/server.js');
    }

    if (Boolean(process.env.DATABASE_SERVER_LOCAL)) {
        console.log('[SERVER] Starting Database Server'.bold.green);
        var subserver = child_process.fork('../ygosalvation-database/app.js');
    }
    
    process.title = 'YGOSalvation Server ' + new Date();

}

main();
