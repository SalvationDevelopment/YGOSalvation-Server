
require('dotenv').config();
const axios = require('axios'),
    CMS_URL = process.env.CMS_URL,
    controller = require('./src'),
    fs = require('fs');



/**
 * Program Entry Point
 * @returns {undefined}
 */
async function main() {
    console.log('[SERVER] YGO Salvation Server - Saving Yu-Gi-Oh!'.bold.magenta);
    const banlist = './http/manifest/banlist.json';

    if (!CMS_URL) {
        console.error('Administrative Server URL is not configured, no database access, see README.MD for details.');
        process.exit();
    }
    try {
        const status = await axios.get(`${CMS_URL}`);
    } catch {
        console.error(`Administrative Server is not online at ${CMS_URL}, no database access.`);
        process.exit();
    }

    if (!fs.existsSync(banlist)) {
        console.error('Error: Banlist not generated, run "npm run banlist"');
        process.exit();
    }

    process.title = 'YGOSalvation Server ' + new Date();

}

main();