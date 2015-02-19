
/*jslint node: true */
var enums = require('./enums.js');

//The message is stripped and turned into a normal packet so we can understand it as:
//{length, +length, type of message, the message itself }
//the server may send more than one at a time so lets take it one at a time.

module.exports = function parsePackets(command, message) {
    "use strict";

    var task = [],
        packet = {
            message: message.slice(1),
            readposition: 0
        };
    packet[command] = enums[command][message[0]];
    task.push(packet);
    return task;
};