/*jslint browser:true, plusplus : true, bitwise : true*/
/*globals WebSocket, Buffer, Uint8Array, enums, makeCard, recieveSTOC, CommandParser, Framemaker, makeCTOS, initiateNetwork*/
// card.js
// gui.js



var urlParams = new URLSearchParams(window.location.search),
    primusprotocol = (location.protocol === 'https:') ? 'wss://' : 'ws://',
    primus = window.Primus.connect(primusprotocol + location.host + ':' + urlParams.get('room')),
    settings = {};

function updateloby(state) {
    'use strict';
    if (state === undefined) {
        return;
    }
    settings = state;
    var p1 = (state.player[0]) ? state.player[0].username : '',
        p2 = (state.player[1]) ? state.player[1].username : '',
        p3 = (state.player[2]) ? state.player[2].username : '',
        p4 = (state.player[3]) ? state.player[3].username : '',
        r1 = (state.player[0]) ? state.player[0].ready : '',
        r2 = (state.player[1]) ? state.player[1].ready : '',
        r3 = (state.player[2]) ? state.player[2].ready : '',
        r4 = (state.player[3]) ? state.player[3].ready : '',
        cardpool = state.cardpool ? 'OCG rules' : 'TCG Rules'

    $('#player1lobbyslot').val(p1);
    $('#player2lobbyslot').val(p2);
    //    $('#player3lobbyslot').val(p3);
    //    $('#player4lobbyslot').val(p4);
    $('#slot1 .lockindicator').attr('data-state', r1);
    $('#slot2 .lockindicator').attr('data-state', r2);
    //    $('#slot3 .lockindicator').attr('data-state', r3);
    //    $('#slot4 .lockindicator').attr('data-state', r4);
    $('#lobbytimelimit').text(state.timelimit + ' seconds');
    $('#lobbyflist').text(state.banlist);
    $('#lobbylp').text(state.startLP);
    $('#lobbycdpt').text(state.drawcount);
    $('#lobbyallowed').text(cardpool);
    $('#lobbygamemode').text(state.mode);
    $('#lobbyprerelease').text(state.prerelease);
    if (state.ishost) {
        $('#lobbystart').css('display', 'inline-block');
    } else {
        $('#lobbystart').css('display', 'none');
    }

    if ($('#creategameduelmode option').eq(state.mode).text() === 'Tag') {
        $('.slot').eq(2).css('display', 'block');
        $('.slot').eq(3).css('display', 'block');
    } else {
        $('.slot').eq(2).css('display', 'none');
        $('.slot').eq(3).css('display', 'none');
    }
}

function duelController(message) {
    switch (message.action) {
        case 'lobby':
            updateloby(message.game);
            break;
        case 'registered':
            primus.write({
                action: 'join'
            });
            break;
        case 'decks':
            message.decks.forEach(function(deck, index) {
                $('.currentdeck').append('<option value="' + index + '">' + deck.name + '</option>');
            });
            window.decks = message.decks;
            break;
        case 'chat':
            $('.ingamechatbox').append('<li>[' + new Date(message.date).toLocaleTimeString() + '] ' + message.username + ': ' + message.message + '</li>');
            break;
        case 'start':
            $('#lobby').toggle();
            $('#duelscreen').toggle();
            break;

        case 'turn_player':
            window.verification = message.verification;
            $('#selectwhogoesfirst').css('display', 'block');
            break;
        case 'ygopro':

            manualReciver(message.message);
            break;
        default:
            return;
    }
}

function gofirst(startplayer) {
    primus.write({
        action: 'start',
        turn_player: Number(startplayer),
        verification: window.verification
    });
    $('#selectwhogoesfirst').css('display', 'none');
}

primus.on('data', function(data) {
    console.log(data);
    if (data.action) {
        duelController(data);
    }
});

primus.on('open', function() {
    console.log('connected');
    primus.write({
        action: 'register',
        usernamename: localStorage.nickname,
        session: localStorage.session
    });
});

primus.on('error', function(error) {
    console.log('error', error);
});