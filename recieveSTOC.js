/* jshint node: true */
var enums = require('./enums.js');
module.exports = function RecieveSTOC(packet, tempData) {
    var todo = Object.create(enums.STOCCheck);

    ////console.log(packet.STOC);
    var intro;
    switch (packet.STOC) {

    case ('STOC_GAME_MSG'):
        {
            //game data dont need to process

        }
        break;
    case ('STOC_ERROR_MSG'):
        {
            //game died, recover it!
        }
        break;
    case ('STOC_SELECT_HAND'):
        {
            //play rps
        }
        break;
    case ('STOC_HAND_RESULT'):
        {
            //rps result
        }
        break;
    case ('STOC_CHANGE_SIDE'):
        {
            //side decking
        }
        break;
    case ('STOC_WAITING_SIDE'):
        {
            //waiting on side decking.
        }
        break;
    case ('STOC_CREATE_GAME'):
        {

        }
        break;
    case ('STOC_TYPE_CHANGE'):
        {

        }
        break;
    case ('STOC_JOIN_GAME'):
        {
            //Player requesting to join room.
            //var version = packet.message[0] + packet.message[1];
            //var roomname = packet.message.toString('utf16le', 8, 52);
            ////console.log(packet.message.toString('utf16le'));
            ////console.log('version:', '0x' + parseInt(version, 16), 'roomname:', roomname);
            ////console.log('gamestring',hostString, '')




        }
        break;
    case ('STOC_LEAVE_GAME'):
        {
            //name of player that just left the duel.
            intro = packet.message.toString('utf16le');
            //console.log(intro, intro.length);
        }
        break;
    case ('STOC_DUEL_START'):
        {
            //Game started
            todo.STOC_DUEL_START = true;
        }
        break;

    case ('STOC_REPLAY'):
        {
            // catch this packet and do ranking on it.
            todo.STOC_REPLAY = true;
        }
        break;
    case ('STOC_TIME_LIMIT'):
        {
            // User went over time.
            return false;
        }
        break;
    case ('STOC_CHAT'):
        {
            // A user said something, we should record this.
            return 'chat';
        }
        break;
    case ('STOC_HS_PLAYER_ENTER'):
        {
            //name of player that just entered the duel.
            intro = packet.message.toString('utf16le');
            //console.log('player enter', intro, intro.length);

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
            return 'player swap';
        }
        break;
    case ('STOC_HS_WATCH_CHANGE'):
        {
            //A player is no longer dueling and is instead watching.
            //console.log('packet length %l', packet.LENGTH);
            //console.log('packet message %l', packet.message);
            //console.log('packet message', parseInt(packet.message[0]), packet.message[0]);
            //console.log('packet message', parseInt(packet.message[1]), packet.message[1]);
        }
        break;
    case ('STOC_TYPE_CHANGE'):
        {
            //A player is no longer dueling and is instead watching.
            //console.log('packet length %l', packet.LENGTH);
            //console.log('packet message %l', packet.message);
            //console.log('packet message', parseInt(packet.message[0]), packet.message[0]);
            //console.log('packet message', parseInt(packet.message[1]), packet.message[1]);

        }
        break;
    }

};