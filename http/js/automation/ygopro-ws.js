/*jslint browser:true, plusplus : true, bitwise : true*/
/*globals WebSocket, Buffer, Uint8Array,  makeCard, recieveSTOC, CommandParser, Framemaker, makeCTOS, initiateNetwork,  gui,deckfiles, $*/
// buffer.js
// card.js
// gui.js

function parsePackets(command, message) {
    "use strict";

    var task = [],
        packet = {
            message: message.slice(1),
            readposition: 0
        };
    packet[command] = window.enums[command][message[0]];
    task.push(packet);
    return task;
}

function processTask(task, socket) {
    'use strict';
    var i = 0,
        l = 0,
        output = [],
        RESPONSE = false;
    for (i; task.length > i; i++) {
        output.push(recieveSTOC(task[i]));
    }

    return output;
}


/*globals console*/

//"ws://192.99.11.19:8082"

window.ws = null;

function startgame(roompass) {
    'use strict';
    try {
        window.ws.close();
        window.ws = undefined;
    } catch (noWebSocket) {
        //no previous websocket so dont worry about it.
    }
    if (localStorage.nickname === undefined) {
        console.log('localStorage.nickname is undefined, required!');
        return;
    }
    var framer = new Framemaker(),

        network = new CommandParser(),
        dInfo = {};
    window.ws = new WebSocket("ws://" + location.host + ":8082", "duel");
    window.activeReplayRecorde = [];
    window.ws.binaryType = 'arraybuffer';

    window.ws.onopen = function () {
        cleanstate();
        console.log('connected');

    };
    window.ws.onerror = function (errormessage) {
        console.log('There was an error with the websocket', errormessage);
        ws.close();
    };
    window.ws.onclose = function () {
        console.log('Websocket died');
    };
    window.ws.onmessage = function (data) {
        var q = new Buffer(new Uint8Array(data.data)),
            frame,
            task,
            newframes = 0,
            commands,
            l = 0,
            reply;

        console.log('.');
        frame = framer.input(q);
        for (newframes; frame.length > newframes; newframes++) {
            task = parsePackets('STOC', new Buffer(frame[newframes]));
            commands = processTask(task);
            l = 0;
            for (l; commands.length > l; l++) {
                /*binary code goes in and comes out as events*/

                console.log(commands[l]);
                network.input(commands[l]);
            }
        }
        frame = [];
    };
    window.ws.onopen = function () {
        console.log('Send Game request for', roompass);
        var CTOS_PlayerInfo = makeCTOS('CTOS_PlayerInfo', localStorage.nickname),
            CTOS_JoinGame = makeCTOS('CTOS_JoinGame', roompass),
            toduelist = makeCTOS('CTOS_HS_TODUELIST'),
            tosend = Buffer.concat([CTOS_PlayerInfo, CTOS_JoinGame]);

        window.ws.send(tosend);
    };

    initiateNetwork.STOC(network);
    initiateNetwork.MSG(network);

}

function parseYDK(ydkFileContents) {
    var lineSplit = ydkFileContents.split("\n"),
        originalValues = {
            "main": [],
            "side": [],
            "extra": []
        },
        current = "";
    lineSplit.forEach(function (value) {
        if (value === "") {
            return;
        }
        if (value[0] === "#" || value[0] === "!") {
            if (originalValues.hasOwnProperty(value.substr(1))) {
                current = value.substr(1);
            } else {
                return;
            }
        } else {
            originalValues[current].push(value);
        }
    });
    return originalValues;
}

function sendDeckListToServer(deck) {
    'use strict';
    ws.send(makeCTOS('CTOS_UPDATE_DECK', deck));
    ws.send(makeCTOS('CTOS_HS_READY'));
}

function movetoSpectator() {
    'use strict';
    var servermessage = makeCTOS('CTOS_HS_TOOBSERVER');
    console.log(servermessage);
    window.ws.send(servermessage);
}

function startDuel() {
    'use strict';
    var servermessage = makeCTOS('CTOS_START');
    window.ws.send(servermessage);
}

function leaveDuel() {
    'use strict';
    var servermessage = makeCTOS('CTOS_LEAVE_GAME');
    window.ws.send(servermessage);
    window.singlesitenav('gamelist');
}

function movetoeDuel() {
    'use strict';
    var servermessage = makeCTOS('CTOS_HS_TODUELIST');
    window.ws.send(servermessage);

}

function kickDuelist(playerIndex) {
    'use strict';
    var servermessage = makeCTOS('CTOS_HS_KICK', playerIndex);
    window.ws.send(servermessage);
}

function rps(choice) {
    'use strict';
    var servermessage;
    try {
        servermessage = makeCTOS(choice);
    } catch (error) {
        console.log(error);
        return;
    }
    window.ws.send(servermessage);
    gui.hideRPSSelector();
}

function gofirst(player) {
    'use strict';
    var servermessage = (player) ? makeCTOS('GO_FIRST') : makeCTOS('GO_SECOND');
    window.ws.send(servermessage);
    gui.hideSelectWhoGoesFirst();
}

function idleReply(element) {
    'use strict';
    var index = $(element).attr('data-index'),
        action = $(element).attr('data-action'),
        response = (parseInt(index, 10) << 16) + parseInt(action, 10),
        buf = new Buffer(4),
        servermessage;
    buf[0] = response;
    servermessage = makeCTOS('CTOS_RESPONSE', buf);
    window.ws.send(servermessage);
}

function injectDeck(decks) {
    'use strict';
    if (decks.length === 0) {
        return;
    }

    var i,
        data = {
            currentdecks: ''
        };
    for (i = 0; decks.length > i; i++) {
        data.currentdecks = data.currentdecks + '<option value="' + i + '">' + decks[i].name + '</option>';
    }

    $('.currentdeck, .deckSelect').html(data.currentdecks).val(window.activeDeckSelect).trigger('change');

}

function lockInDeck(user) {
    'use strict';
    var selection,
        servermessage,
        processedDeck
    if (window.duel.player[user].ready) {
        servermessage = makeCTOS('CTOS_HS_NOTREADY');
        window.ws.send(servermessage);
        return;
    }
    selection = $('.currentdeck option:selected').attr('data-file');
    processedDeck = parseYDK(selection);
    console.log(processedDeck);
    sendDeckListToServer(processedDeck);
}

var wish = {
    name: 'Clustering Wishes',
    owner: 'AccessDenied',
    description: 'Synchron-Stardust Deck',
    main: [63977008, 63977008, 63977008, 9365703, 36736723, 36736723, 36736723, 62125438, 62125438, 62125438, 36643046, 36643046, 36643046, 9742784, 67270095, 67270095, 68543408, 68543408, 68543408, 15310033, 32807846, 96363153, 96363153, 96363153, 5318639, 5318639, 5318639, 8529136, 8529136, 8529136, 43898403, 43898403, 79068663, 79068663, 20590784, 27196937, 27196937, 27196937, 47264717, 58120309],
    extra: [26268488, 35952884, 24696097, 74892653, 89474727, 44508094, 44508094, 60800381, 60800381, 60800381, 37675907, 37675907, 37675907, 50091196, 50091196],
    side: []
};


function sayNo() {
    'use strict';
    window.ws.send(makeCTOS('CTOS_RESPONSE', new Buffer([-1, 0, 0, 0])));
}

function chat(message) {
    'use strict';
    var servermessage = makeCTOS('CTOS_CHAT', message);
    window.ws.send(servermessage);
    $('.ingamechatbox').append('<li>[' + localStorage.nickname + ']: ' + message + '</li>');
}