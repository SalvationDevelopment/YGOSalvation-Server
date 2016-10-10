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

function manualReciver(message) {
    'use strict';
    console.log(message);
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
        action: 'host'
    }));
}

function manualJoin(game) {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'join',
        game: game
    }));
}

function manualLeave(game) {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'leave',
        game: game
    }));
}

function manualLock(deck) {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'lock',
        deck: deck
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