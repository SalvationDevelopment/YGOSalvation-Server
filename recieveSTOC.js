/* jshint node: true */
var enums = require('./enums.js');
var defineStructure = require('./objectifier.js');

var STOC_TimeLimit = defineStructure({
    player: 'unsigned char',
    left_time: 'unsigned short'
});
//var STOC_Chat = defineStructure( {
//	player:'unsigned short',
//	'unsigned short', msg[256];
//});

var STOC_HS_WatchChange = defineStructure({
    watch_count: 'unsigned short'
});

module.exports = function recieveSTOC(packet) {
    var output;
    var task = Object.create(enums.STOCCheck);
    task[packet.STOC] = true;

    switch (packet.STOC) {
    case ('STOC_UNKNOWN'):
        {
            task.STOC_UNKNOWN = packet;
        }
        break;
    case ('STOC_GAME_MSG'):
        {
            task.STOC_GAME_MSG = packet;
        }
        break;
    case ('STOC_ERROR_MSG'):
        {
            task.STOC_ERROR_MSG = packet;
        }
        break;
    case ('STOC_SELECT_HAND'):
        {
            task.STOC_SELECT_HAND = packet;
        }
        break;
    case ('STOC_REPLAY'):
        {
            // catch this packet and do ranking on it.
            task.STOC_REPLAY = true;
        }
        break;
    case ('STOC_TIME_LIMIT'):
        {
            //update time.
            output = STOC_TimeLimit.read(packet);
            task.STOC_TIME_LIMIT = output;
        }
        break;
    case ('STOC_CHAT'):
        {
            // A user said something, we should record this.
            task[packet.STOC] = packet;
        }
        break;
    case ('STOC_HS_PLAYER_ENTER'):
        {

            task[packet.STOC] = packet.message.toString('utf16le');
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
            task[packet.STOC] = packet;
        }
        break;
    case ('STOC_HS_WATCH_CHANGE'):
        {
            //A player is no longer dueling and is instead watching.
            //console.log('packet length %l', packet.LENGTH);
            //console.log('packet message %l', packet.message);
            //console.log('packet message', parseInt(packet.message[0]), packet.message[0]);
            //console.log('packet message', parseInt(packet.message[1]), packet.message[1]);
            output = STOC_HS_WatchChange.read(packet);
            console.log('watch change', output);
            task[packet.STOC] = output;
        }
        break;
    case ('STOC_TYPE_CHANGE'):
        {
            //A player is no longer dueling and is instead watching.
            //console.log('packet length %l', packet.LENGTH);
            //console.log('packet message %l', packet.message);
            //console.log('packet message', parseInt(packet.message[0]), packet.message[0]);
            //console.log('packet message', parseInt(packet.message[1]), packet.message[1]);
            task[packet.STOC] = packet;

        }
        break;
    default:
        {
            task.UNKOWN = packet;
        }
    }
    return task;
};