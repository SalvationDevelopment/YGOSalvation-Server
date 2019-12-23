
require('dotenv').config();
const fs = require('fs');
const controller = require('./src');

/**
 * Program Entry Point
 * @returns {undefined}
 */
function main() {
    console.log('[SERVER] YGO Salvation Server - Saving Yu-Gi-Oh!'.bold.magenta);
    const banlist = './http/manifest/banlist.json';


    if (!fs.existsSync(banlist)) {
        console.error('Error: Banlist not generated, run "npm run banlist"');
        process.exit();
    }


    process.title = 'YGOSalvation Server ' + new Date();
    
}

main();