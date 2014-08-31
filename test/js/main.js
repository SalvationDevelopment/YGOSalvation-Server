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

    //card movement vars
    var code, pc, pl, ps, pp, cc, cl, cs, cp, reason;
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
            } else if (command === 'MSG_HINT') {
                console.log('MSG_HINT', task[i].STOC_GAME_MSG.message);
                var hintplayer = task[i].STOC_GAME_MSG.message[1];
                var hintcont = task[i].STOC_GAME_MSG.message[2];
                var hintspeccount = task[i].STOC_GAME_MSG.message[3];
                var hintforce = task[i].STOC_GAME_MSG.message[4];


                console.log('Win', task[i].STOC_GAME_MSG.message[1]);
            } else if (command === 'MSG_NEW_TURN') {
                model.activePlayer = !model.activePlayer;
                model.phase = 0;
                game.NewTurn(model.activePlayer);
                game.NewPhase(model.phase);
            } else if (command === 'MSG_WIN') {
                console.log('Win', task[i].STOC_GAME_MSG.message[1]);
            } else if (command === 'MSG_NEW_PHASE') {
                model.phase++;
                game.NewPhase(model.phase);
            } else if (command === 'MSG_DRAW') {
                var drawplayer = task[i].STOC_GAME_MSG.message[1];
                var draw = task[i].STOC_GAME_MSG.message[2];
                console.log('%c' + ('Player' + (drawplayer + 1)) + ' drew' + draw + ' cards', 'background: #222; color: #bada55');
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
                code = task[i].STOC_GAME_MSG.message.readUInt16LE(1);
                pc = task[i].STOC_GAME_MSG.message[5]; // original controller
                pl = task[i].STOC_GAME_MSG.message[6]; // original cLocation
                ps = task[i].STOC_GAME_MSG.message[7]; // original sequence (index)
                pp = task[i].STOC_GAME_MSG.message[8]; // padding??
                cc = task[i].STOC_GAME_MSG.message[9]; // current controller
                cl = task[i].STOC_GAME_MSG.message[10]; // current cLocation
                cs = task[i].STOC_GAME_MSG.message[11]; // current sequence (index)
                cp = task[i].STOC_GAME_MSG.message[11]; // current position
                reason = task[i].STOC_GAME_MSG.message.readUInt16LE[12]; //debug data??
                game.MoveCard(code, pc, pl, ps, pp, cc, cl, cs, cp, reason);
            } else if (command === 'MSG_POS_CHANGE') {
                code = task[i].STOC_GAME_MSG.message.readUInt16LE(1);
                cc = task[i].STOC_GAME_MSG.message[5]; // current controller
                cl = task[i].STOC_GAME_MSG.message[6]; // current cLocation
                cs = task[i].STOC_GAME_MSG.message[7]; // current sequence (index)
                pp = task[i].STOC_GAME_MSG.message[8]; // padding??
                cp = task[i].STOC_GAME_MSG.message[9]; // current position
                game.ChangeCardPosition(code, cc, cl, cs, cp);
            } else if (command === 'MSG_SET') {
                // All the vars are commented out in the source.
                console.log('MSG_SET');
            } else if (command === 'MSG_SWAP') {
                console.log('MSG_SWAP');
                // code vars are commented out in the source, assuming graphical only.
            } else if (command === 'MSG_SUMMONING' || command === 'MSG_SPSUMMONING') {
                code = task[i].STOC_GAME_MSG.message.readUInt16LE(1);
            } else if (command === 'MSG_SUMMONED' || command == 'MSG_SPSUMMONED' || command === 'MSG_FLIPSUMMONED') {
                //graphical only
            } else if (command === 'MSG_FLIPSUMMONING') {
                // notice pp is missing, and everything is upshifted; not repeating code.
                code = task[i].STOC_GAME_MSG.message.readUInt16LE(1);
                cc = task[i].STOC_GAME_MSG.message[5]; // current controller
                cl = task[i].STOC_GAME_MSG.message[6]; // current cLocation
                cs = task[i].STOC_GAME_MSG.message[7]; // current sequence (index)
                cp = task[i].STOC_GAME_MSG.message[8]; // current position
                game.ChangeCardPosition(code, cc, cl, cs, cp);
            } else if (command === 'MSG_UPDATE_DATA') {
                player = task[i].STOC_GAME_MSG.message[1];
                var fieldlocation = task[i].STOC_GAME_MSG.message[2];
                var fieldmodel = enums.locations[fieldlocation];
                var udata = updateMassCards(player, fieldlocation, task[i].STOC_GAME_MSG.message);
                //console.log('MSG_UPDATE_DATA', 'Player' + (player + 1), fieldmodel, udata);
                game.UpdateCards(player, fieldlocation, udata);
            } else if (command === 'MSG_UPDATE_CARD') {
                var udplayer = task[i].STOC_GAME_MSG.message[1];
                var udfieldlocation = task[i].STOC_GAME_MSG.message[2];
                var udindex = task[i].STOC_GAME_MSG.message[3];

                var udcard = makeCard(task[i].STOC_GAME_MSG.message, 8, udplayer).card;
                //console.log('MSG_UPDATE_CARD',
                //'Player' + (udplayer + 1), enums.locations[udfieldlocation], udindex, udcard);
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
            var position = task[i].STOC_HS_PLAYER_ENTER.message[41];
            console.log(person, 'entered', 'the duel', position);
        } else if (task[i].STOC_HS_PLAYER_CHANGE) {
            var change = task[i].STOC_HS_PLAYER_CHANGE.message[0];
            var changepos = (change >> 4) & 0xF;
            var state = change & 0xF;
            console.log('position', changepos, enums.lobbyStates[state]);


        } else if (task[i].STOC_HS_WATCH_CHANGE) {
            console.log('Spectators:', task[i].STOC_HS_WATCH_CHANGE.message[0]);
        } else if (task[i].STOC_TYPE_CHANGE) {

            var typec = task[i].STOC_TYPE_CHANGE.message[0];
            var pos = typec & 0xF;
            var ishost = ((typec >> 4) & 0xF) !== 0;
            console.log('STOC_TYPE_CHANGE', task[i].STOC_TYPE_CHANGE, 'type', typec, 'pos', pos, 'ishost', ishost);

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
    if (buffer.length < 4) {
        return {
            card: {},
            readposition: start
        };
    }
    var flag = buffer.readUInt32LE(start);

    if (!flag) {
        return {
            card: {
                Code: 'cover',
                Position: 'FaceDownAttack',
            },
            readposition: start + 9
        };
    }
    var card = {
        Code: 'cover',
        Position: 'FaceDownAttack',
    };

    //console.log('flag:', flag);
    var readposition = start + 4;

    if (flag & enums.query.Code) {
        card.Code = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Position) {
        card.Controller = buffer[readposition + 0];
        card.Position = enums.Positions[buffer[readposition + 3]];
        readposition = readposition + 4;
    }
    if (flag & enums.query.Alias) {
        card.Alias = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Type) {
        card.Type = enums.cardTypes[buffer.readUInt32LE(readposition)];
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
        card.Attribute = enums.cardAttributes[buffer.readUInt32LE(readposition)];
        readposition = readposition + 4;
    }
    if (flag & enums.query.Race) {
        card.Race = enums.race[buffer.readUInt32LE(readposition)];
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
        card.TargetCard = [];
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
        DECK: $('.p' + player + '.DECK').length,
        HAND: $('.p' + player + '.HAND').length,
        EXTRA: $('.p' + player + '.EXTRA').length,
        GRAVE: $('.p' + player + '.GRAVE').length,
        REMOVED: $('.p' + player + '.REMOVED').length,
        SPELLZONE: 8,
        MONSTERZONE: 5

    };
}

function updateMassCards(player, clocation, buffer) {
    var field = cardCollections(player);
    var output = [];
    var readposition = 3;
    //console.log(field);
    if (field[enums.locations[clocation]] !== undefined) {
        for (var i = 0, count = field[enums.locations[clocation]]; count > i; i++) {
            var len = buffer.readUInt8(readposition);
            readposition = readposition + 4;
            if (len > 8) {
                var result = makeCard(buffer, readposition, player);
                output.push(result.card);
                readposition = readposition + len - 4;
            } else {
                output.push({
                    Code: 'nocard'
                });
            }
        }
    }
    //console.log(output);
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

game.images = 'http://salvationdevelopment.com/launcher/ygopro/pics/';

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

game.SelectRPS = function (value) { // Toggle RPS Screen. Screen will diengage when used.
    $('#rps').toggle();

};

game.SelectFirstPlayer = function (value) { // Select the player that goes first.
    $('#selectduelist').toggle();

};

game.StartDuel = function (player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra) { // Interface signalled the game has started
    $('#duelzone').css('display', 'block').get(0).scrollIntoView();
    $('img.card').attr('class', 'card none undefined i0');
    $('#player1lp').html("div class='width' style='width:" + (player1StartLP) + "'></div>" + player1StartLP + "</div>");
    $('#player2lp').html("div class='width' style='width:" + (player2StartLP) + "'></div>" + player1StartLP + "</div>");
    $('#phases').css('display', 'block');

    game.DOMWriter(OneDeck, 'DECK', 0);
    game.DOMWriter(TwoDeck, 'DECK', 1);
    game.DOMWriter(OneExtra, 'EXTRA', 0);
    game.DOMWriter(TwoExtra, 'EXTRA', 1);
    shuffle(0, 'DECK');
    shuffle(1, 'DECK');
    shuffle(0, 'EXTRA');
    shuffle(1, 'EXTRA');
    layouthand(0);
    layouthand(0);
    //game.DrawCard(0, 5);
    //game.DrawCard(1, 5);
    return [cardCollections(0), cardCollections(1)];
};

game.DOMWriter = function (size, movelocation, player) {
    for (var i = 0; i < size; i++) {
        animateState('ignore', 'unknown', 0, player, movelocation, i, 'DefenseFaceDown');
        //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition){
    }

};

game.UpdateCards = function (player, clocation, data) { //YGOPro is constantly sending data about game state, this function stores and records that information to allow access to a properly understood gamestate for reference. 


    for (var i = 0; data.length > i; i++) {
        if (data[i].Code !== 'nocard') {
            console.log('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i, data[i].Code);
            $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i).attr('src', game.images + data[i].Code + '.jpg')
                .attr('data-position', data[i].Position);
        }
    }
};
game.UpdateCard = function (player, clocation, index, data) {
    if (data.Code !== 'nocard') {
        console.log('.card.p' + player + '.' + enums.locations[clocation] + '.i' + index);
        $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + index).attr('src', game.images + data.Code + '.jpg')
            .attr('data-position', data.Position);
    }
};
game.MoveCard = function (code, pc, pl, ps, pp, cc, cl, cs, cp, reason) {
    if (pl === 0) {
        var newcard = '<img class="card p' + cc + ' ' + enums.locations[cl] + ' i' + cs + '" dataposition="">';
        $('.fieldimage').append(newcard);
    } else if (cl === 0) {
        var query = '.card.p' + pc + '.' + enums.locations[pl] + '.i' + ps;
        $(query).detach();
    } else {
        if (!(pl & 0x80) && !(cl & 0x80)) { //duelclient line 1885
            animateState(pc, enums.locations[pl], ps, cc, cl, cs, cp);
            //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
        } else if (!(pl & 0x80)) {
            console.log('targeting a xyz unit....');
        } else if (!(cl & 0x80)) {
            console.log('turning something into a xyz unit....');
        } else {
            console.log('update a monster that had overlay units....');
        }
    }
};
game.ChangeCardPosition = function (code, cc, cl, cs, cp) {
    animateState(cc, enums.locations[cl], cs, cc, cl, cs, cp);
    //var query = '.card.p' + cc + '.' + enums.locations[cl] + '.i' + cs;
    //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
};


game.DrawCard = function (player, numberOfCards) {
    var currenthand = $('.p' + player + '.HAND').length;
    for (var i = 0; i < numberOfCards; i++) {
        animateState(player, 0x01, 'ignore', player, 'HAND', currenthand + i, 'AttackFaceUp');
        //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition){
    }

    layouthand(player);
    //console.log("p" + player + " drew " + numberOfCards + " card(s)");
};

game.NewPhase = function (phase) {
    $('#phases .phase').text(enums.phase[phase]);

};

game.NewTurn = function (turn) {
    console.log("It is now p" + turn + "'s turn.");
    $('#phases .player').text('Player ' + (1 + turn) + ':');
};

game.MoveCard = function (player, clocation, index, moveplayer, movelocation, movezone, moveposition) {
    console.log('p' + player + "'s' ", enums.locations[clocation], index, "Moved to p" + moveplayer + "s", enums.locations[movelocation], movezone, moveposition);
    animateState(player, clocation, index, moveplayer, enums.locations[movelocation], movezone, moveposition);
    //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition);
    layouthand(moveplayer);
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
    shuffle(player, 'DECK');
};

function debugField() {
    $('.field').toggle();
    game.DOMWriter(40, 'Deck', 'p0');
    game.DOMWriter(40, 'Deck', 'p1');
    game.DOMWriter(15, 'Extra', 'p0');
    game.DOMWriter(15, 'Extra', 'p1');
    game.DrawCard(0, 5);
    game.DrawCard(1, 5);
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
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

function shuffle(player, deck) {
    player = 'p' + player;
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




function animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition, count) {

    if (count === undefined) {
        count = 1;
    }
    var searchindex = (index === 'ignore') ? '' : ".i" + index;
    var searchplayer = (player === 'ignore') ? '' : ".p" + player;

    var query = '.card' + searchplayer + "." + enums.locations[clocation] + searchindex;
    $(query).slice(0, count).attr('class', "card p" + moveplayer + " " + movelocation + " i" + movezone)
        .attr('style', '').attr('data-position', moveposition);
    //console.log(player, clocation, index, moveplayer, movelocation, movezone, moveposition, count);
    //console.log(query, 'changed to', "card .p" + moveplayer + "." + movelocation + ".i" + movezone);
}

function animateChaining(player, clocation, index) {
    $(player + '.' + clocation + '.i' + index).addClass('chainable');
}

function animateRemoveChaining() {
    $('.chainable').removeClass('chainable');
}

function layouthand(player) {
    var count = $('.p' + player + '.HAND').length;
    var f = 83 / 0.8;
    var xCoord;
    //    console.log(count,f,xCoord);
    for (var sequence = 0; sequence < count; sequence++) {
        if (count < 6) {
            xCoord = (5.5 * f - 0.8 * f * count) / 2 + 1.55 * f + sequence * 0.8 * f;
        } else {
            xCoord = 1.9 * f + sequence * 4.0 * f / (count - 1);
        }
        // console.log('.'+player+'.Hand.i'+sequence);
        //console.log(xCoord);
        if (player === 0) {
            $('.p' + player + '.HAND.i' + sequence).css('left', '' + xCoord + 'px');
        } else {
            $('.p' + player + '.HAND.i' + sequence).css('right', '' + xCoord + 'px');
        }
    }
}

//    
//    if (count <= 6)
//    t->X = (5.5f - 0.8f * count) / 2 + 1.55f + sequence * 0.8f;
//   else
//    t->X = 1.9f + sequence * 4.0f / (count - 1);
var cardlocations = {

    'p0': {
        DECK: {
            x_origin: 735, // player 1
            y_origin: 43
        },
        HAND: {
            x_origin: 124,
            y_origin: -10
        },
        EXTRA: {
            x_origin: 22,
            y_origin: 43
        },
        Field: {
            x_origin: 22,
            y_origin: 181
        },
        Spells: {
            zone1: {
                x_origin: 144,
                y_origin: 188
            },
            zone2: {
                x_origin: 261,
                y_origin: 188
            },
            zone3: {
                x_origin: 379,
                y_oirgin: 188
            },
            zone4: {
                x_origin: 497,
                y_origin: 188
            },
            zone5: {
                x_origin: 614,
                y_origin: 188
            }
        },
        MonsterZone: {
            zone1: {
                x_origin: 144,
                y_origin: 250
            },
            zone2: {
                x_origin: 261,
                y_origin: 250
            },
            zone3: {
                x_origin: 379,
                y_oirgin: 250
            },
            zone4: {
                x_origin: 497,
                y_origin: 250
            },
            zone5: {
                x_origin: 614,
                y_origin: 250
            }
        }


    },
    'p1': {
        DECK: {
            x_origin: 675, // player 1
            y_origin: 43
        },
        HAND: {
            x_origin: 124,
            y_origin: -10
        },
        EXTRA: {
            x_origin: 32,
            y_origin: 43
        },
        Field: {
            x_origin: 22,
            y_origin: 181
        },
        Spells: {
            zone1: {
                x_origin: 144,
                y_origin: 188
            },
            zone2: {
                x_origin: 261,
                y_origin: 188
            },
            zone3: {
                x_origin: 379,
                y_oirgin: 188
            },
            zone4: {
                x_origin: 497,
                y_origin: 188
            },
            zone5: {
                x_origin: 614,
                y_origin: 188
            }
        },
        MonsterZone: {
            zone1: {
                x_origin: 144,
                y_origin: 250
            },
            zone2: {
                x_origin: 261,
                y_origin: 250
            },
            zone3: {
                x_origin: 379,
                y_oirgin: 250
            },
            zone4: {
                x_origin: 497,
                y_origin: 250
            },
            zone5: {
                x_origin: 614,
                y_origin: 250
            }
        }


    }

};

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