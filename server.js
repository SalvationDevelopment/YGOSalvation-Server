require('dotenv').config();
const controller = require('./src/controller_main.js');

/**
 * Program Entry Point
 * @returns {undefined}
 */
function main() {

    process.title = 'YGOPro Salvation Server ' + new Date();
    console.log('YGO Salvation Server - Saving Yu-Gi-Oh!'.bold.yellow);
    controller();
}

main();