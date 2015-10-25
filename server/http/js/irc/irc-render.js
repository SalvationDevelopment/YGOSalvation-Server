/*jslint plusplus:true*/
/*global $, console, ircStylize, Handlebars*/

ircStylize.template = Handlebars.compile("<span class='{{style}}'>{{{text}}}</span>");

var command,
    state = {
        nick: 'Duelist_Bot',
        currentChannel: '',
        rooms: {},
        roomList: []
    },
    i = 0;


function renderRoom() {
    'use strict';
    if (!state.currentChannel) {
        return;
    }
    var chatIter = 0;
    $('.chattitle').text(state.rooms[state.currentChannel].title);
    $('.chatbody').html('');
    for (chatIter; state.rooms[state.currentChannel].history.length > chatIter; chatIter++) {
        $('.chatbody').append('<li>' + state.rooms[state.currentChannel].history[chatIter] + '</li>');
    }
    chatIter = 0;
    $('.chatroomlist').html('');
    for (chatIter; state.rooms[state.currentChannel].users.length > chatIter; chatIter++) {
        $('.chatroomlist').prepend('<div>' + state.rooms[state.currentChannel].users[chatIter] + '</div>');
    }

}


function checkroom(roomname) {
    'use strict';
    if (!state.rooms[roomname]) {
        state.rooms[roomname] = {
            users: [],
            title: '',
            history: []
        };
    }
}

function command(message, socket) {
    'use strict';
    var nameListIter = 0,
        nameList,
        privmsg,
        timestamp;
    switch (message.command) {
    case ('NOTICE'):
        console.log('%c' + message.params[1], 'color:#00f');
        break;

    case ('RPL_WELCOME'):
        console.log('%c' + message.params[1], 'color:#00f');
        break;

    case ('RPL_MYINFO'):
        state.nickname = message.params[0];
        state.servername = message.params[1];
        state.serverDeamen = message.params[2];
        state.avaliableUserModes = message.params[3];
        state.avaliableServerModes = message.params[4];
        break;

    case ('RPL_ISUPPORT'):
        break;

    case ('RPL_LUSERCLIENT'):
        break;

    case ('RPL_LUSEROP'):
        break;

    case ('RPL_LUSERCHANNELS'):
        break;

    case ('RPL_LUSERME'):
        break;

    case ('RPL_LOCALUSERS'):
        //current and max users
        break;

    case ('RPL_GLOBALUSERS'):
        break;

    case ('RPL_MOTDSTART'):
        state.MOTD = '';
        break;

    case ('RPL_MOTD'):
        state.MOTD = state.MOTD + message.params[1] + '\n';
        break;

    case ('RPL_ENDOFMOTD'):
        JOIN('#lobby');
        //console.log(state.MOTD);
        break;

    case ('PING'):
        socket.send('PONG ' + message.params[1] + '\n');
        break;

    case ('RPL_YOURHOST'):
        break;

    case ('RPL_CREATED'):
        break;

    case ('PRIVMSG'):
        console.log(message);
        privmsg = '';
        timestamp = '[' + new Date().toTimeString().substring(0, 8) + '] ';
        if (message.prefix) {

            if (message.params[1].substring(0, 7) === '\u0001ACTION') {
                privmsg = message.prefix.split('!')[0] + ' ' + message.params[1].substring(7);
            } else {
                privmsg = '&lt' + message.prefix.split('!')[0] + '&gt:' + message.params[1];
            }

        } else {
            if (message.params[1].substring(0, 7) === '\u0001ACTION') {
                privmsg = state.nickname + ' ' + message.params[1].substring(7);
            } else {
                privmsg = state.nickname + ':' + message.params[1];
            }
        }
        state.rooms[message.params[0]].history.push(timestamp + privmsg);
        break;

    case ('396'):
        state.displayHost = message.params[1];
        break;

    case ('RPL_NAMREPLY'):
        checkroom(message.params[2]);
        nameList = message.params[3].split(' ');
        for (nameListIter; nameList.length > nameListIter; nameListIter++) {
            state.rooms[message.params[2]].users.push(nameList[nameListIter]);
        }
        break;

    case ('RPL_ENDOFNAMES'):
        // refresh namelist for message.params[3];
        break;

    case ('JOIN'):
        break;

    case ('PART'):
        delete state.rooms[message.params[0]];
        break;
    case ('RPL_LISTSTART'):
        state.roomList = new Array(state.roomList.length);
        break;
    case ('RPL_LIST'):
        state.roomList.push({
            name: message.params[1],
            usercount: message.params[2],
            modetitle: message.params[3]
        });
        break;
    case ('RPL_LISTEND'):
        //render the list
        console.log(state.roomList);
        break;
    case ('RPL_TOPIC'):
        checkroom(message.params[1]);
        state.rooms[message.params[1]].title = $(ircStylize(message.params[2]));
        break;
    case ('RPL_TOPIC_WHO_TIME'):
        checkroom(message.params[1]);
        state.rooms[message.params[1]].titleSetBy = message.params[2];
        state.rooms[message.params[1]].titleSetTime = new Date(message.params[3]);
        break;
    case (''):
        //do nothing
        break;
    default:
        console.log('%c' + message.command, 'color:#555', message.params);
    }
    renderRoom();
}