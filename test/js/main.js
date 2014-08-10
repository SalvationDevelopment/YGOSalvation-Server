/* jshint browser : true */
/* jshint jquery : true */
/* globals alert, console */
/* globals isChecked, randomString */

//Define all the globals you are going to use. Avoid using to many globals. All Globals should be databases of sorts.
// ReadInt32() = readUInt16LE()
/* jshint node: true */
/* globals */
/* global module */
/* jslint browser : true */

var game = {};

function Model() {
    "use strict";
    var model = {
        gamestate: 'off',
        gametype: 'single',
        lobby: {
            player1_username: '',
            player2_username: '',
            player3_username: '',
            player4_username: '',
            player1_loaded: false,
            player2_loaded: false,
            player3_loaded: false,
            player4_loaded: false,
            spectators: 0
        },
        player1_rps_choice: 0,
        player2_rps_choice: 0,
        activePlayer: 0,
        phase: 0,
        player1_lifepoints: 8000,
        player2_lifepoints: 8000,
        player1_cards: {
            deck: [],
            extra: [],
            side: [],
            hand: [],
            monsters: [null, null, null, null, null],
            spells: [null, null, null, null, null, null, null, null]
        },
        player2_cards: {
            deck: [],
            extra: [],
            side: [],
            hand: [],
            monsters: [null, null, null, null, null],
            spells: [null, null, null, null, null, null, null, null]
        },
        wincondition: 'none',
        replaysave: false,
        replayfile: '',
        gamelog: [],
        cardunderexamine: 0
    };
    return model;
}

console.log('Runing DevPro Packet Sniffing Proxy');

var net = require('net');

var parsePackets = require('../server/libs/parsepackets.js');
var enums = require('../server/libs/enums.js');

//var recieveCTOS = require('../../recieveCTOS');
var recieveSTOC = require('../server/libs/recieveSTOC.js');
var ws = new WebSocket('ws://192.99.11.19:8913/path');
var wsproxy = net.createServer(function () {});
wsproxy.listen(8912);
//wsproxy.on('connection', function (socket) {
//    console.log('new client starting a proxy.');
//    socket.on('data', function (data) {
//        console.log('sending data');
//        ws.send(data);
//
//    });
//    ws.on('message', function (data) {
//        console.log('recieving data');
//        socket.write(data);
//        var task = parsePackets('STOC', data);
//        console.log(task)
//        processTask(task, socket);
//    });
//});
var model = new Model();
model.singlelock = false;
var proxy = net.createServer(function () {});
proxy.on('connection', function (socket) {

    var connection = net.connect(8911, '91.250.87.52');
    connection.on('data', function (data) {
        socket.write(data);
        var task = parsePackets('STOC', data);
        processTask(task, socket);
    });
    socket.on('data', function (data) {
        connection.write(data);
    });
    connection.on('error', function () {});
    socket.on('error', function () {});
});
proxy.listen(8914);



function processTask(task, socket) {
    var player, clocation, index, data;
    task = (function () {
        var output = [];
        for (var i = 0; task.length > i; i++) {
            output.push(recieveSTOC(task[i]));
        }
        return output;
    })();
    for (var i = 0; task.length > i; i++) {
        if (task[i].STOC_UNKNOWN) {
            //console.log('-----', makeCard(task[i].STOC_UNKNOWN.message));
        } else
        if (task[i].STOC_GAME_MSG) {
            var command = enums.STOC.STOC_GAME_MSG[task[i].STOC_GAME_MSG.message[0]];
            if (command === 'MSG_START') {
                var type = task[i].STOC_GAME_MSG.message[1];
                model.lifepoints1 = task[i].STOC_GAME_MSG.message.readUInt16LE(2);
                model.lifepoints2 = task[i].STOC_GAME_MSG.message.readUInt16LE(6);
                model.player1decksize = task[i].STOC_GAME_MSG.message.readUInt8(10);
                model.player1extrasize = task[i].STOC_GAME_MSG.message.readUInt8(12);
                model.player2decksize = task[i].STOC_GAME_MSG.message.readUInt8(14);
                model.player2extrasize = task[i].STOC_GAME_MSG.message.readUInt8(16);
                game.StartDuel(model.lifepoints1, model.lifepoints2, model.player1decksize, model.player1extrasize,
                    model.player2decksize, model.player2extrasize);
            } else if (command === 'MSG_NEW_TURN') {
                model.activePlayer = !model.activePlayer;
                model.phase = 0;
                console.log('Player' + (model.activePlayer + 1) + '\'s turn');
            } else if (command === 'MSG_WIN') {
                console.log('Win', task[i].STOC_GAME_MSG.message[1]);
            } else if (command === 'MSG_NEW_PHASE') {
                model.phase++;
                console.log(enums.phase[model.phase]);
            } else if (command === 'MSG_DRAW') {
                var drawplayer = task[i].STOC_GAME_MSG.message[1];
                var draw = task[i].STOC_GAME_MSG.message[2];
                console.log(('Player' + (drawplayer + 1)), 'drew', draw, 'cards');
                game.DrawCard(drawplayer, draw);
            } else if (command === 'MSG_SHUFFLE_DECK') {
                var deckshuffleplayer = task[i].STOC_GAME_MSG.message[1];
                console.log(('Player' + (deckshuffleplayer + 1)), 'shuffled the deck');
            } else if (command === 'MSG_SHUFFLE_HAND') {
                var handshuffleplayer = task[i].STOC_GAME_MSG.message[1];
                console.log(('Player' + (handshuffleplayer + 1)), 'shuffled the deck');
            } else if (command === 'MSG_CHAINED') {
                model.chainsolved = 0;
                console.log('Chain in progress');
            } else if (command === 'MSG_CHAIN_SOLVING') {
                model.chainsolved = 1;
                console.log('Resolving Chain');
            } else if (command === 'MSG_CHAIN_SOLVED') {
                model.chainsolved = 3;
                console.log('Solved Chain');
            } else if (command === 'MSG_PAY_LPCOST') {
                player = task[i].STOC_GAME_MSG.message[1];
                var lpcost = task[i].STOC_GAME_MSG.message.readUInt16LE(2);
                console.log(('Player' + (player + 1)), 'paid', lpcost, 'lifepoints');
            } else if (command === 'MSG_DAMAGE') {
                player = task[i].STOC_GAME_MSG.message[1];
                var damage = task[i].STOC_GAME_MSG.message.readUInt16LE(2);
                console.log(('Player' + (player + 1)), 'took', damage, 'damage');
            } else if (command === 'MSG_SUMMONING ') {
                //ignoring
                console.log('Normal summon preformed');
            } else if (command === 'MSG_SELECT_IDLECMD') {
                var idleplayer = task[i].STOC_GAME_MSG.message[1];
                model.idle = true;
                var idlereadposition = 2;
                for (var k = 0; k < 5; k++) {
                    var idlecount = task[i].STOC_GAME_MSG.message[idlereadposition];
                    idlereadposition++;
                    //                    for (var j = 0; j < idlecount; ++j) {
                    //                        var idlecard = task[i].STOC_GAME_MSG.message.readUInt16LE(idlereadposition);
                    //                        idlereadposition = idlereadposition + 4;
                    //                    }
                }
            } else if (command === 'MSG_MOVE') {
                var movecardid = task[i].STOC_GAME_MSG.message[1];
                var pc = task[i].STOC_GAME_MSG.message[2];
                var pl = task[i].STOC_GAME_MSG.message[3];
                var ps = task[i].STOC_GAME_MSG.message[4];
                var pp = task[i].STOC_GAME_MSG.message[5];
                var cc = task[i].STOC_GAME_MSG.message[6];
                var cl = task[i].STOC_GAME_MSG.message[7];
                var cs = task[i].STOC_GAME_MSG.message[8];
                var reason = task[i].STOC_GAME_MSG.message[3];
                animateState(pc, pl, ps, cc, cl, cs, pp, reason);
                console.log('Move', pc, pl, ps, 'to', cc, cl, cs, 'due to', pp, reason);
            } else if (command === 'MSG_SET') {
                var smovecardid = task[i].STOC_GAME_MSG.message[1];
                var spc = task[i].STOC_GAME_MSG.message[2];
                var spl = task[i].STOC_GAME_MSG.message[3];
                var sps = task[i].STOC_GAME_MSG.message[4];
                var spp = task[i].STOC_GAME_MSG.message[5];
                var scc = task[i].STOC_GAME_MSG.message[6];
                var scl = task[i].STOC_GAME_MSG.message[7];
                var scs = task[i].STOC_GAME_MSG.message[8];
                var sreason = task[i].STOC_GAME_MSG.message[3];
                console.log('Move', spc, spl, sps, 'to', scc, scl, scs, 'due to', spp, sreason);
            } else if (command === 'MSG_UPDATE_DATA') {
                var player = task[i].STOC_GAME_MSG.message[1];
                var fieldlocation = task[i].STOC_GAME_MSG.message[2];
                var fieldmodel = enums.locations[fieldlocation];
                //console.log('MSG_UPDATE_DATA', 'Player' + (player + 1), fieldmodel);
                updateMassCards(player, fieldlocation, task[i].STOC_GAME_MSG.message);
            } else if (command === 'MSG_UPDATE_CARD') {
                var udplayer = task[i].STOC_GAME_MSG.message[1];
                var udfieldlocation = task[i].STOC_GAME_MSG.message[2];
                var udindex = task[i].STOC_GAME_MSG.message[3];

                var udcard = makeCard(task[i].STOC_GAME_MSG.message, 0, udplayer).card;
                console.log('MSG_UPDATE_CARD',
                    'Player' + (udplayer + 1), enums.locations[udfieldlocation], udindex, udcard);
                game.UpdateCard(udplayer, udfieldlocation, udindex, udcard);
            } else {
                console.log(command, task[i].STOC_GAME_MSG.message);
            }
        } else if (task[i].STOC_DUEL_START) {
            console.log('Starting Duel!');
        } else if (task[i].STOC_SELECT_TP) {
            console.log('Select who goes first');
        } else if (task[i].STOC_HAND_RESULT) {
            var rpschoice = task[i].STOC_HAND_RESULT.message[0];
            console.log('Opponent used', enums.RPS[rpschoice]);
        } else if (task[i].STOC_SELECT_HAND) {
            console.log('Please Select RPS');
        } else if (task[i].STOC_REPLAY) {
            console.log('Replay Information', task[i].STOC_REPLAY);
        } else if (task[i].STOC_TIME_LIMIT) {

            //console.log('Player' + (task[i].STOC_TIME_LIMIT.message[0] + 1), 'has ' + (task[i].STOC_TIME_LIMIT.message[1] + task[i].STOC_TIME_LIMIT.message[2]) + 'sec left');
        } else if (task[i].STOC_CHAT) {
            var chat = task[i].STOC_CHAT.message.toString('utf16le', 2);
            console.log('Chat:', chat);
        } else if (task[i].STOC_HS_PLAYER_ENTER) {
            var person = task[i].STOC_HS_PLAYER_ENTER.message.toString('utf16le', 0, 40);
            var position = task[i].STOC_HS_PLAYER_ENTER.message.toString('utf16le', 41);
            console.log(person, 'entered', 'the duel', position.length);
        } else if (task[i].STOC_HS_PLAYER_CHANGE) {
            model.singlelock = !model.singlelock;
            var ready = model.singlelock ? 'now' : 'not';
            console.log('Opponent is', ready, 'ready');
        } else if (task[i].STOC_HS_WATCH_CHANGE) {
            console.log('Spectators:', task[i].STOC_HS_WATCH_CHANGE.message[0]);
        } else if (task[i].STOC_TYPE_CHANGE) {
            console.log('STOC_TYPE_CHANGE', task[i].STOC_TYPE_CHANGE);
        } else if (task[i].STOC_SELECT_TP) {
            console.log('Chat', task[i].STOC_SELECT_TP);
        } else if (task[i].STOC_JOIN_GAME) {
            console.log('Join Game', task[i].STOC_JOIN_GAME);
        } else {
            console.log('????', task[i]);
        }
    }
}

function makeCard(buffer, start, controller) {
    if (buffer.length < 12) {
        return {
            card: {},
            readposition: start
        };
    }
    var flag = buffer.readUInt32LE(start + 8);
    if (!flag) {
        return {
            card: {},
            readposition: start + 9
        };
    }
    var card = {};

    //console.log('flag:', flag);
    var readposition = 12;

    if (flag & enums.query.Code) {
        card.Code = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Position) {
        card.Controller = buffer[readposition + 0];
        card.Position = buffer[readposition + 3];
        readposition = readposition + 4;
    }
    if (flag & enums.query.Alias) {
        card.Alias = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Type) {
        card.Type = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Level) {
        card.Level = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Rank) {
        card.Rank = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Attribute) {
        card.Attribute = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Race) {
        card.Race = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Attack) {
        card.Attack = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Defense) {
        card.Defense = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.BaseAttack) {
        card.Attribute = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.BaseDefense) {
        card.Attribute = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Reason) {
        card.Attribute = buffer.readUInt16LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.ReasonCard) {
        card.Attribute = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.EquipCard) {
        card.EquipCard = {
            c: buffer[readposition + 0],
            l: buffer[readposition + 1],
            s: buffer[readposition + 2]
        };
        readposition = readposition + 4;
    }
    if (flag & enums.query.TargetCard) {

        for (var i = 0; i < buffer.readUInt32LE(readposition); ++i) {
            card.TargetCard.push({
                c: buffer[readposition + 0],
                l: buffer[readposition + 1],
                s: buffer[readposition + 2]
            });
            readposition = readposition + 4;
        }
    }
    if (flag & enums.query.OverlayCard) {
        card.OverlayCard = [];
        for (var ii = 0; ii < buffer.readUInt32LE(readposition); ++ii) {
            card.OverlayCard.push(buffer.readUInt32LE(readposition));
            readposition = readposition + 4;
        }
    }
    if (flag & enums.query.Counters) {
        card.Counters = [];
        for (var iii = 0; iii < buffer.readUInt32LE(readposition); ++iii) {
            card.Counters.push({
                counterType: buffer.readUInt16LE(readposition),
                amount: buffer.readUInt16LE(readposition + 2)
            });
            readposition = readposition + 4;
        }
    }
    if (flag & enums.query.Owner) {
        card.EquipCard = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.IsDisabled) {
        card.EquipCard = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.IsPublic) {
        card.EquipCard = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.lscale) {
        card.lscale = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.rscale) {
        card.rscale = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    return {
        card: card,
        readposition: readposition
    };


}

function cardCollections(player) {
    return {
        DECK: $('.p' + player + '.deck').length,
        EXTRA: $('.p' + player + '.extra').length,
        GRAVE: $('.p' + player + '.grave').length,
        REMOVED: $('.p' + player + '.removed').length,
        SPELLZONE: 8,
        MONSTERZONE: 5

    };
}

function updateMassCards(player, clocation, buffer) {
    var field = cardCollections(player);
    var output = [];
    var readposition = 0;
    if (field[clocation]) {
        for (var i = 0, count = field[clocation]; count > i; i++) {
            var len = buffer.readUInt16LE(readposition);
            if (len < 8) {
                readposition = readposition + 4;
                var result = makeCard(buffer, readposition, player);
                output.push(result.card);
                readposition = result.readposition + len - 4;
            } else {
                output.push({});
            }
        }
    }
    return output;
}
var playerStart = [0, 0];
var cardIndex = {};
var cardData;
var deckData;
var decklistData;
var decklist = [];
var player1StartLP;
var player2StartLP;

var duelData;


//This Global defines the duel state at all times via update functions. It has no impact on the DOM but may be referenced to provide information to the user or draw images.
var duel = {
    'p0': {
        'Deck': [],
        'Hand': [],
        'MonsterZone': [],
        'SpellZone': [],
        'Grave': [],
        'Removed': [],
        'Extra': [],
        'Overlay': [],
        'Onfield': []
    },
    'p1': {
        'Deck': [],
        'Hand': [],
        'MonsterZone': [],
        'SpellZone': [],
        'Grave': [],
        'Removed': [],
        'Extra': [],
        'Overlay': [],
        'Onfield': []
    }
};






//Functions used by the websocket object

game.images = 'http://salvationdevelopment.com/launcher/ygopro/pics/c';

function MessagePopUp(message) {
    alert(message);
}



game.PosUpdate = function (pos) { // Used in the lobby to notify the viewer of who is in the lobby.
    console.log('PosUpdate: ' + pos);
};

game.PlayerEnter = function (username, pos) { // Used in the lobby to notify the viewer of who is in the lobby.
    console.log('PlayerEnter: ' + username + ", " + pos);
    $('#lobbyplayer' + pos).html(username);
};

game.PlayerLeave = function (pos) { // Used in the lobby to notify the viewer of who is in the lobby.
    $('#lobbyplayer' + pos).html("");
    $('#lobbystart').attr('class', 'button ready0');
};

game.UpdatePlayer = function (pos, newpos) { // Used in the lobby to notify the viewer of who is in the lobby.
    var UpdatePlayerposscache = $('#lobbyplayer' + pos).html();
    $('#lobbyplayer' + pos).html("");
    $('#lobbyplayer' + newpos).html(UpdatePlayerposscache);
};

game.PlayerReady = function (pos, ready) { // Used in the lobby to notify the viewer of who is in the lobby.
    ready = (ready) ? 1 : 0;
    playerStart[pos] = ready;
    var state = playerStart[0] + playerStart[1];
    $('#lobbyplayer' + pos).toggleClass('ready');
    console.log('button ready' + state);
    $('#lobbystart').attr('class', 'button ready' + state);
    if (state === 2) {
        $('.button.ready2').on('click', function () {

            $('.game').toggle();
            $('.field').toggle();

        });
    }


};

game.KickPlayer = function (pos) {
    pos = (pos) ? pos : 1;
};

game.PlayerMessage = function (player, message) { //YGOPro messages.
    var playername;
    if (player) {
        playername = $('#lobbyplayer' + player).html();
    } else {
        playername = 'Spectator';
    }
    $('#messagerbox').css('height', '150px');
    $('#messagerbox ul').append('<li>' + playername + ": " + message + '</li>');
    $('#messagerbox ul, #messagerbox').animate({
        scrollTop: $('#messagerbox ul').height()
    }, "fast");
    console.log(playername + " :" + message);
};



game.DeckError = function (card) { //When you have an illegal card in your deck.
    MessagePopUp(cardIndex('c' + card).name + " is not legal for this game format");
};

game.SelectRPS = function (value) { // Toggle RPS Screen. Screen will diengage when used.
    $('#rps').toggle();

};

game.SelectFirstPlayer = function (value) { // Select the player that goes first.
    $('#selectduelist').toggle();

};

game.StartDuel = function (player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra) { // Interface signalled the game has started
    $('#player1lp').html("div class='width' style='width:" + (player1StartLP) + "'></div>" + player1StartLP + "</div>");
    $('#player2lp').html("div class='width' style='width:" + (player2StartLP) + "'></div>" + player1StartLP + "</div>");

    game.DOMWriter(OneDeck, 'Deck', 'p0');
    game.DOMWriter(TwoDeck, 'Deck', 'p1');
    game.DOMWriter(OneExtra, 'Extra', 'p0');
    game.DOMWriter(TwoExtra, 'Extra', 'p1');
    shuffle('p0', 'Deck');
    shuffle('p1', 'Deck');
    shuffle('p0', 'Extra');
    shuffle('p1', 'Extra');
    layouthand('p0');
    layouthand('p1');
};

game.DOMWriter = function (size, movelocation, player) {
    for (var i = 0; i < size; i++) {
        animateState('none', 'unknown', 0, player, movelocation, i, 1);
        //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition){
    }

};

game.UpdateCards = function (player, clocation, data) { //YGOPro is constantly sending data about game state, this function stores and records that information to allow access to a properly understood gamestate for reference. 


    for (var i = 0; data.length > i; i++) {
        $('.p' + player + '.' + clocation + '.i' + i).attr('src', game.images + data[i].Id);
    }
};

game.UpdateCard = function (player, clocation, index, data) {
    $('.p' + player + '.' + clocation + '.i' + index).attr('src', game.images + data[index].Id);
};

game.DrawCard = function (player, numberOfCards) {
    console.log("p" + player + " drew " + numberOfCards + " card(s)");
    animateDrawCard("p" + player, numberOfCards);
    layouthand('p' + player);
};

game.NewPhase = function (phase) {
    console.log(enums.phase[phase]);
};

game.NewTurn = function (turn) {
    console.log("It is now p" + turn + "'s turn.");
};

game.MoveCard = function (player, clocation, index, moveplayer, movelocation, movezone, moveposition) {
    console.log('p' + player + "'s' ", enums.locations[clocation], index, "Moved to p" + moveplayer + "s", enums.locations[movelocation], movezone, moveposition);
    animateState('p' + player, enums.locations[clocation], index, 'p' + moveplayer, enums.locations[movelocation], movezone, moveposition);
    //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition);
    layouthand('p' + moveplayer);
};

game.OnWin = function (result) {
    console.log("Function OnWin: " + result);
};

game.SelectCards = function (cards, min, max, cancelable) {
    var debugObject = {
        cards: cards,
        min: min,
        max: max,
        cancelable: cancelable
    };
    console.log('Function SelectCards:' + JSON.stringify(debugObject));
};

game.DuelEnd = function () {
    console.log('Duel has ended.');
};

game.SelectYn = function (description) {
    console.log("Function SelectYn :" + description);
};

game.IdleCommands = function (main) {
    var update = JSON.parse(main);
    console.log('IdleCommands', update);
};

game.SelectPosition = function (positions) {
    var debugObject = JSON.Strigify(positions);
    console.log(debugObject);
};

game.SelectOption = function (options) {
    var debugObject = JSON.Strigify(options);
    console.log(debugObject);
};

game.AnnounceCard = function () {
    //Select a card from all known cards.
    console.log('AnnounceCard');
};

game.OnChaining = function (cards, desc, forced) {
    var cardIDs = JSON.parse(cards);

    for (var i = 0; i < cardIDs.length; i++) {
        animateChaining(('p' + cardIDs[i].Player), enums.locations[cardIDs[i].location], cardIDs[i].Index);
    }

    //auto say no
    if (forced) {

        animateRemoveChaining();
    } else {

        animateRemoveChaining();
    }
    console.log('chaining', cardIDs, desc);

};

game.ShuffleDeck = function (player) {
    console.log(player);
    shuffle('p' + player, 'Deck');
};

function debugField() {
    $('.field').toggle();
    game.DOMWriter(40, 'Deck', 'p0');
    game.DOMWriter(40, 'Deck', 'p1');
    game.DOMWriter(15, 'Extra', 'p0');
    game.DOMWriter(15, 'Extra', 'p1');
    game.DrawCard('p0', 5);
    game.DrawCard('p1', 5);
    layouthand('p0');
    layouthand('p1');


}

var deckpositionx = 735;
var currenterror;
var positions = {
    extra: {
        x: 25
    }
};
var shuffler, fix;

$(document).ready(function () {
    $('.card').on('click', function () {
        complete(deckpositionx);
    });
});


// Animation functions

function cardmargin(player, deck) {
    var orientation = (player === 'p0') ? ({
        x: 'left',
        y: 'bottom',
        direction: 1,
        multiple: 2
    }) : ({
        x: 'right',
        y: 'top',
        direction: -1,
        multiple: 3
    });
    $('.card.' + player + '.' + deck).each(function (i) {
        // console.log($('.card.'+player+'.'+deck), cardlocations[player],player,deck);
        var decklocationx = (orientation.direction * i / orientation.multiple) + (cardlocations[player][deck].x_origin);
        var decklocationy = (orientation.direction * i / orientation.multiple) + (cardlocations[player][deck].y_origin);
        //console.log(decklocationx,decklocationy);

        $(this).css(
            orientation.y, decklocationy + 'px').css(
            orientation.x, decklocationx + 'px'
        );

    });
}

function shuffle(player, deck) {
    var orientation = (player === 'p0') ? ({
        x: 'left',
        y: 'bottom',
        direction: 1
    }) : ({
        x: 'right',
        y: 'top',
        direction: -1
    });
    cardmargin(player, deck);
    $($('.card.' + player + '.' + deck).get().reverse()).each(function (i) {
        var cache = $(this).css(orientation.x);
        var spatical = Math.floor((Math.random() * 150) - 75);
        $(this).css(orientation.x, '-=' + spatical + 'px');
    });
    fix = setTimeout(function () {
        cardmargin(player, deck);
    }, 50);
}

function complete(x) {
    var started = Date.now();

    // make it loop every 100 milliseconds

    var interval = setInterval(function () {

        // for 1.5 seconds
        if (Date.now() - started > 500) {

            // and then pause it
            clearInterval(interval);

        } else {

            // the thing to do every 100ms
            shuffle('p0');

        }
    }, 100); // every 100 milliseconds
}


function animateDrawCard(player, amount) {
    var c = $('.' + player + '.Deck').splice(0, amount);
    //    console.log('.'+player+'.Deck');
    //    console.log(c.length);
    $(c).each(function (i) {
        $(this).attr('class', "card " + player + ' ' + 'Hand i' + (i + duel[player].Hand.length) + ' AttackFaceUp')
            .attr('style', '');
    });
}

function animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition, count) {
    if (count === undefined) {
        count = 1;
    }
    var query = "." + player + "." + clocation + ".i" + index;
    $(query).slice(0, count).attr('class', "card " + moveplayer + " " + movelocation + " i" + movezone + " index" + index)
        .attr('style', '');
}

function animateChaining(player, clocation, index) {
    $(player + '.' + clocation + '.i' + index).addClass('chainable');
}

function animateRemoveChaining() {
    $('.chainable').removeClass('chainable');
}

function layouthand(player) {
    var count = $('.' + player + '.Hand').length;
    var f = 83 / 0.8;
    var xCoord;
    //    console.log(count,f,xCoord);
    for (var sequence = 0; sequence < count; sequence++) {
        if (duel[player].Hand.length < 6) {
            xCoord = (5.5 * f - 0.8 * f * count) / 2 + 1.55 * f + sequence * 0.8 * f;
        } else {
            xCoord = 1.9 * f + sequence * 4.0 * f / (count - 1);
        }
        // console.log('.'+player+'.Hand.i'+sequence);
        //console.log(xCoord);
        if (player === 'p0') {
            $('.' + player + '.Hand.i' + sequence).css('left', '' + xCoord + 'px');
        } else {
            $('.' + player + '.Hand.i' + sequence).css('right', '' + xCoord + 'px');
        }
    }
}

//    
//    if (count <= 6)
//    t->X = (5.5f - 0.8f * count) / 2 + 1.55f + sequence * 0.8f;
//   else
//    t->X = 1.9f + sequence * 4.0f / (count - 1);