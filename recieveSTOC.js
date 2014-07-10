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






module.exports = function RecieveSTOC(packet) {
    var output;
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
            output = STOC_TimeLimit.read(packet);
            console.log('STOC_TIME_LIMIT', output);
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
            output = STOC_HS_WatchChange.read(packet);
            console.log('watch change', output);
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