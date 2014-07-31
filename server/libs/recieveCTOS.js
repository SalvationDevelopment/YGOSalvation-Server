/* jshint node: true */
var enums = require('./enums.js');


module.exports = function RecieveCTOS(packet) {
    var todo = Object.create(enums.CTOSCheck);
    switch (packet.CTOS) {
    case ('CTOS_PLAYER_INFO'):
        {

            var username = packet.message.toString('utf16le');
            username = username.split('\u0000');
            console.log(username[0]);
            todo.CTOS_PLAYER_INFO = username[0];
        }
        break;
    case ('CTOS_JOIN_GAME'):
        {
            //Player joined the game/server
            //var version = packet.message[0] + packet.message[1];
            var roomname = packet.message.toString('utf16le', 8, 56);
            //console.log('version:', '0x' + parseInt(version, 16), 'roomname:', roomname);
            todo.CTOS_JOIN_GAME = roomname;
        }
        break;
    case ('CTOS_HS_READY'):
        {
            todo.CTOS_HS_READY = true;
        }
        break;
    case ('CTOS_HS_NOTREADY'):
        {
            todo.CTOS_HS_NOTREADY = true;
        }
        break;
    case ('CTOS_HS_TODUELIST'):
        {
            todo.CTOS_HS_TODUELIST = true;
        }
        break;
    case ('CTOS_HS_TOOBSERVER'):
        {
            todo.CTOS_HS_TOOBSERVER = true;
        }
        break;

    case ('CTOS_LEAVE_GAME'):
        {
            todo.CTOS_LEAVE_GAME = true;
        }
        break;

    case ('CTOS_HS_START'):
        {
            todo.CTOS_HS_START = true;
        }
        break;
    }
    return todo;
};