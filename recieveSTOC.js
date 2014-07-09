/* jshint node: true */
var enums = require('./enums.js');
module.exports = function RecieveSTOC(packet) {
    var todo = Object.create(enums.STOCCheck);
    todo[packet.STOC] = true;

    switch (packet.STOC) {

    case ('STOC_REPLAY'):
        {
            // catch this packet and do ranking on it.
            todo.STOC_REPLAY = true;
        }
        break;
    case ('STOC_TIME_LIMIT'):
        {
            // User went over time.
            todo[packet.STOC] = true;
        }
        break;
    case ('STOC_CHAT'):
        {
            // A user said something, we should record this.
            todo[packet.STOC] = true;
        }
        break;
    case ('STOC_HS_PLAYER_ENTER'):
        {

            todo[packet.STOC] = packet.message.toString('utf16le');
        }
        break;
    case ('STOC_HS_PLAYER_CHANGE'):
        {
            //A player swaped places
            //gamelist is done here
            //console.log('packet length %l', packet.LENGTH);
            //console.log('packet message %l', packet.message);
            //console.log('packet message', parseInt(packet.message[0]), packet.message[0]);
            //console.log('packet message', parseInt(packet.message[1]), packet.message[1]);
            todo[packet.STOC] = true;
        }
        break;
    case ('STOC_HS_WATCH_CHANGE'):
        {
            //A player is no longer dueling and is instead watching.
            //console.log('packet length %l', packet.LENGTH);
            //console.log('packet message %l', packet.message);
            //console.log('packet message', parseInt(packet.message[0]), packet.message[0]);
            //console.log('packet message', parseInt(packet.message[1]), packet.message[1]);
            todo[packet.STOC] = true;
        }
        break;
    case ('STOC_TYPE_CHANGE'):
        {
            //A player is no longer dueling and is instead watching.
            //console.log('packet length %l', packet.LENGTH);
            //console.log('packet message %l', packet.message);
            //console.log('packet message', parseInt(packet.message[0]), packet.message[0]);
            //console.log('packet message', parseInt(packet.message[1]), packet.message[1]);
            todo[packet.STOC] = true;

        }
        break;
    }
    return todo;
};