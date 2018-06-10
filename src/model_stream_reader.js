/**
 * @typedef {Object} BufferStreamReader
 * @param {Function} readposition
 * @param {Function} setReadposition
 * @param {Function} readInt8
 * @param {Function} readInt16
 * @param {Function} readInt32
 * @param {Function} move
 */

/**
 * Takes a packet and makes a readable object out of it.
 * @constructor
 * @param {Packet} packet a delimited buffer
 * @returns {BufferStreamReader} Wrapper object around a packet with streamed read functionality.
 */
function BufferStreamReader(packet) {
    let readposition = 0;
    const stream = {};

    stream.packet = packet; // maybe stream should be read only.
    stream.readposition = function() {
        return readposition;
    };
    stream.setReadposition = function(value) {
        readposition = Number(value);
        return readposition;
    };
    stream.readInt8 = function() {
        // read 1 byte
        const output = packet[readposition];
        readposition += 1;
        return output;
    };
    stream.readUInt8 = stream.readInt8;
    stream.readInt16 = function() {
        const output = packet.readUInt16LE(readposition);
        readposition += 2;
        return output;
    };
    stream.readInt32 = function() {
        const output = packet.readUInt32LE(readposition);
        readposition += 4;
        return output;
    };
    stream.move = function(amount) {
        readposition += amount;
    };
    return stream;
}

module.exports = BufferStreamReader;