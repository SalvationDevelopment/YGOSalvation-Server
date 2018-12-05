/*jslint browser:true, plusplus : true, bitwise : true*/
/*globals WebSocket, Buffer, Uint8Array, enums, makeCard, recieveSTOC, CommandParser, Framemaker, makeCTOS, initiateNetwork*/
// card.js
// gui.js




var primusprotocol = (location.protocol === 'https:') ? 'wss://' : 'ws://',
    primus = window.Primus.connect(primusprotocol + location.host);

function updateloby(state) {
    'use strict';
    if (state === undefined) {
        return;
    }
    //legacyMode = state.legacyfield;
    $('#player1lobbyslot').val(state.player[0].name);
    $('#player2lobbyslot').val(state.player[1].name);
    //    $('#player3lobbyslot').val(state.player[2].name);
    //    $('#player4lobbyslot').val(state.player[3].name);
    $('#slot1 .lockindicator').attr('data-state', state.player[0].ready);
    $('#slot2 .lockindicator').attr('data-state', state.player[1].ready);
    //    $('#slot3 .lockindicator').attr('data-state', state.player[2].ready);
    //    $('#slot4 .lockindicator').attr('data-state', state.player[3].ready);
    $('#lobbytimelimit').text(state.timelimit + ' seconds');
    $('#lobbyflist').text(state.banlist);
    $('#lobbylp').text(state.startLP);
    $('#lobbycdpt').text(state.drawcount);
    $('#lobbyallowed').text(state.cardpool);
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
    switch (message.duelAction) {
        case 'lobby':
            updateloby(message.game);
            break;
        case 'registered':
            primus.write({
                action: 'join',
                game: 'default_game',
                name: 'username',
                key: 'randomloginstring'
            });
    }
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
        action: 'ping'
    });
    primus.write({
        action: 'register',
        name: 'username',
        key: 'randomloginstring'
    });
});

primus.on('error', function(error) {
    console.log('error', error);
});