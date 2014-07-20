/* jshint node: true */
var enums = require('./enums.js');
module.exports = function parsePackets(command, message) {
    var task = [];
    var buffer_read_position = 0;
    //The message is stripped and turned into a normal packet so we can understand it as:
    //{length, +length, type of message, the message itself }
    //the server may send more than one at a time so lets take it one at a time.
    while (buffer_read_position < message.length) {
        var read = message[buffer_read_position] + message[(buffer_read_position + 1)];
        var packet = {
            LENGTH: read,
            message: message.slice((buffer_read_position + 3), (buffer_read_position + 1 + read)),
            readposition: 0
        };
        packet[command] = enums[command][message[(buffer_read_position + 2)]] || message[(buffer_read_position + 2)];


        task.push(packet);

        buffer_read_position = buffer_read_position + 2 + read;
    }
    return task;
};

/*
function SendCommunication(message, commandEnum) {

    var communication = [];

    communication[0] = message.length * 2 + 1;
    communication[2] = commandEnum;
    var write_position = 3;

    var i, strLen, c, arrLen;
    if (typeof message === 'string') {
        for (i = 0, strLen = message.length, c = 0; i < strLen; i++, c = c + 2) {
            communication[(c + write_position)] = message.charCodeAt(i);
        }
    }
    if (message instanceof Array) {
        for (i = 0, arrLen = message.length; i < arrLen; i++) {
            communication[(i + write_position)] = message[i];
        }
    }
    return new Buffer(communication);
}
*/