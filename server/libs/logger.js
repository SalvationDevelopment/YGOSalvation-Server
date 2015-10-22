/*jslint node:true*/
var winston = require('winston'),
    logger = new(winston.Logger)({
        transports: [
            new(winston.transports.DailyRotateFile)({
                filename: ".\\http\\logs\\chat.log"
            })
        ]
    });
module.exports = logger;