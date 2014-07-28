/* jshint node: true */
var enums = require('./enums.js');

module.exports = function recieveSTOC(packet) {
    var task = Object.create(enums.STOCCheck);
    task[packet.STOC] = packet;
    return task;
};