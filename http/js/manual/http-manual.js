/*jslint browser:true*/
/*global WebSocket, $, parseYDK*/

var manualServer,
    broadcast,
    activegame;

function updateloby(state) {

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
    $('#lobbyallowed').text($('#creategamecardpool option').eq(state.rule).text());
    $('#lobbygamemode').text($('#creategameduelmode option').eq(state.mode).text());
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

function makeGames() {
    Object.keys(broadcast).forEach(function (gameName) {
        var game = broadcast[gameName],
            string = '<div onclick="manualJoin(\'gameName\')"></div>'
    });
}

function getdeck() {
    'use strict';
    var selection,
        processedDeck;

    selection = $('.currentdeck option:selected').attr('data-file');
    processedDeck = parseYDK(selection);
    return processedDeck;
}

function manualReciver(message) {
    'use strict';
    console.log(message);
    switch (message.action) {
    case "lobby":
        singlesitenav('lobby');
        activegame = message.game;
        updateloby(broadcast[activegame]);
        break;
    case "broadcast":
        broadcast = message.data;
        makeGames();
        break;
    default:
        break;
    }
}

function serverconnect() {
    'use strict';
    window.manualServer = new WebSocket("ws://" + location.hostname + ":8080");
    manualServer.onopen = function () {
        console.log('connected to manual');
    };
    manualServer.onmessage = function (message) {
        manualReciver(JSON.parse(message.data));
    };
}

function manualHost() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'host',
        name: localStorage.nickname
    }));
}

function manualJoin(game) {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'join',
        game: game,
        name: localStorage.nickname
    }));
}

function manualLeave(game) {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'leave',
        game: activegame
    }));
}

function manualLock() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'lock',
        deck: getdeck()
    }));
}

function manualStart() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'start'
    }));
}

function manualChat(message) {
    'use strict';
    manualServer.send(JSON.stringify({}));
}

function manualNextPhase() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'nextPhase'
    }));
}

function manualNextTurn() {
    'use strict';
    manualServer.send({
        action: 'nextTurn'
    });
}

function manualChangeLifepoints(amount) {
    'use strict';
    manualServer.send({
        action: 'changeLifepoints',
        amount: amount
    });
}

function manualMoveCard(movement) {
    'use strict';
    Object.assign(movement, {
        action: 'moveCard'
    });
    manualServer.send(movement);
}

function manualModeGamelistSwitch() {
    'use strict';
    $('#manualgamelistitems').toggle();
    $('#gamelistitems').toggle();
}
serverconnect();

function debug() {
    manualHost();
    setTimeout(function () {
        manualLock();
        setTimeout(function () {
            manualStart();
        }, 2000);
    }, 2000);
}