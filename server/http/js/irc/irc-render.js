/*jslint plusplus:true*/
/*global $, console, ircStylize, Handlebars, JOIN, ircws*/

ircStylize.template = Handlebars.compile("<span class='{{style}}'>{{{text}}}</span>");

var command,
    needTimeStamp = true,
    lastCommand = '',
    state = {
        nick: 'Duelist_Bot',
        currentChannel: 'system',
        rooms: {
            'system': {
                users: [],
                title: '',
                history: []
            }
        },
        roomList: []
    },
    i = 0;


function renderRoom() {
    'use strict';
    if (!state.currentChannel) {
        return;
    }
    var chatIter = 0,
        rooms,
        doscroll = false,
        maxedheight = 0;
    $('.chatbody').each(function (i) {
        //this is how you do conditional autoscroll.....baka!
        var r = document.getElementsByClassName('chatbody')[i],
            calculation = (r.clientHeight - r.scrollHeight + r.scrollTop);
        if (calculation === 0) {
            doscroll = true;
            maxedheight = (r.scrollHeight > maxedheight) ? r.scrollHeight : maxedheight;
        }
    });
    $('.chattitle').text(state.rooms[state.currentChannel].title);
    $('.chatbody').html('');
    for (rooms in state.rooms) {
        if (state.rooms.hasOwnProperty(rooms)) {
            $('.chatbody').append('<div class="room_' + rooms + '"></div>');
            for (chatIter; state.rooms[state.currentChannel].history.length > chatIter; chatIter++) {
                $('.room_' + rooms).append('<li>' + state.rooms[state.currentChannel].history[chatIter] + '</li>');
            }
        }
    }
    chatIter = 0;
    $('.chatroomlist').html('');
    for (chatIter = 0; state.rooms[state.currentChannel].users.length > chatIter; chatIter++) {
        if (state.rooms[state.currentChannel].users[chatIter]) {
            $('.chatroomlist').append('<div>' + state.rooms[state.currentChannel].users[chatIter] + '</div>');
        }
    }
    $('.chatbody > div').css('display', 'none');
    $('.room_' + state.currentChannel).css('display', 'block');
    if (doscroll) {
        $('.chatbody').scrollTop(maxedheight);
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

function showmessage(message) {
    'use strict';
    console.log(message);
    var privmsg = '',
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
            privmsg = state.nickname + ': ' + message.params[1];
        }
    }
    state.rooms[message.params[0]].history.push(timestamp + privmsg);
}

function showsystemmessage(message) {
    'use strict';
    if (message.params[1] === undefined) {
        console.log('odd case', message);
        return;
    }
    if (message.params) {
        var timestamp = (needTimeStamp) ? '[' + new Date().toTimeString().substring(0, 8) + '] ' : '<span class="tab"></span>';
        state.rooms[state.currentChannel].history.push(timestamp + message.params[1]);
    }


}

function command(message) {
    'use strict';
    var nameListIter = 0,
        nameList,
        privmsg,
        timestamp;
    console.log(message);
    needTimeStamp = (message.command === lastCommand) ? false : true;
    timestamp = '[' + new Date().toTimeString().substring(0, 8) + '] ';
    lastCommand = message.command;
    switch (message.command) {
    case ('NOTICE'):
        console.log('%c' + message.params[1], 'color:#00f');
        showsystemmessage(message);
        break;
    case ('292'):
        console.log('%c' + message.params[1], 'color:#00f');
        showsystemmessage(message);
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
        ircws.send('PONG ' + message.params[1] + '\n');
        break;

    case ('RPL_YOURHOST'):
        break;

    case ('RPL_CREATED'):
        break;

    case ('PRIVMSG'):
        showmessage(message);
        break;
    case ('ERROR'):
        showsystemmessage(message);
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
        state.rooms[message.params[2]].users.sort();
        break;

    case ('RPL_ENDOFNAMES'):
        // refresh namelist for message.params[3];
        break;

    case ('JOIN'):
        checkroom(message.params[0].trim());
        if (state.nickname === message.prefix.split('!')[0]) {
            state.currentChannel = message.params[0].trim();

            state.rooms[message.params[0].trim()].history.push(timestamp + 'Now talking in ' + state.currentChannel);
        } else {
            console.log(message.params[0].trim(), message.params[0].trim().length, state.rooms[message.params[0].trim()]);
            state.rooms[message.params[0].trim()].history.push(timestamp + message.prefix.split('!')[0] + ' joined ' + message.params[0].trim());
        }

        break;

    case ('MODE'):

        state.rooms[state.currentChannel].history.push(timestamp + message.params[0] + ' MODE: ' +
            message.params[1]);
        break;

    case ('PART'):
        checkroom(message.params[0].trim());
        if (state.nickname === message.prefix.split('!')[0]) {
            state.currentChannel = message.params[0].trim();

            state.rooms[message.params[0].trim()].history.push(timestamp + 'You left ' + state.currentChannel);
        } else {
            console.log(message.params[0].trim(), message.params[0].trim().length, state.rooms[message.params[0].trim()]);
            state.rooms[message.params[0].trim()].history.push(timestamp + message.prefix.split('!')[0] + ' left ' + message.params[0].trim());
        }

        break;

    case ('RPL_LISTSTART'):
        state.roomList = new Array(state.roomList.length);


        break;
    case ('RPL_LIST'):
        state.roomList.push({
            roomname: message.params[1],
            usercount: message.params[2],
            modetitle: message.params[3]
        });

        break;
    case ('RPL_LISTEND'):
        //render the list
        $('#listdisplay table').html('<tr><td>User Count</td><td>Room Name</td><td>Title [Modes]</td></tr>');
        $('#listdisplay').css('display', 'block');
        console.log(state.roomList);
        for (i = 0; state.roomList.length > i; i++) {
            $('#listdisplay table').append('<tr onclick="JOIN(\'' + state.roomList[i].roomname + '\');closeListDisplay();"><td>' + state.roomList[i].usercount + '</td><td >' + state.roomList[i].roomname + '</td><td>' + state.roomList[i].modetitle + '</td></tr>');
        }
        break;
    case ('ERR_UNKNOWNCOMMAND'):
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
    case ('RPL_WHOISUSER'):
        state.rooms[state.currentChannel].history.push(timestamp + 'USER: ' + message.params.join());
        break;
    case ('RPL_WHOISCHANNELS'):
        state.rooms[state.currentChannel].history.push(timestamp + 'ROOMS: ' + message.raw.split(':')[2]);
        break;
    case ('RPL_WHOISSERVER'):
        state.rooms[state.currentChannel].history.push(timestamp + 'SERVER: ' + message.raw.split(':')[2]);
        break;
    case ('RPL_WHOISIDLE'):
        //time math ugh skipping.
        break;
    case ('RPL_ENDOFWHOIS'):
        state.rooms[state.currentChannel].history.push(timestamp + message.raw.split(':')[2]);
        break;
    default:
        showsystemmessage(message);
    }
    renderRoom();
}