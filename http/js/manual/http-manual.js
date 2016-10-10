/*jslint browser:true*/
/*global WebSocket, $, parseYDK*/

var manualServer;

function getActive(user) {
    'use strict';
    var selection,
        processedDeck;

    selection = $('.currentdeck option:selected').attr('data-file');
    processedDeck = parseYDK(selection);
    return processedDeck;
}

function serverconnect() {
    'use strict';
    window.manualServer = new WebSocket("ws://" + location.hostname + ":8080", "duel");
}

function manualHost() {
    'use strict';
    manualServer.send({
        action: 'host'
    });
}

function manualJoin(game) {
    'use strict';
    manualServer.send({
        action: 'join',
        game: game
    });
}

function manualLeave(game) {
    'use strict';
    manualServer.send({
        action: 'leave',
        game: game
    });
}

function manualLock(deck) {
    'use strict';
    manualServer.send({
        action: 'lock',
        deck: deck
    });
}

function manualStart() {
    'use strict';
    manualServer.send({
        action: 'start'
    });
}

function manualChat(message) {
    'use strict';
    manualServer.send();
}

function manualNextPhase() {
    'use strict';
    manualServer.send({
        action: 'nextPhase'
    });
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