//Define all the globals you are going to use. Avoid using to many globals. All Globals should be databases of sorts.
// ReadInt32() = readUInt16LE()
/* jshint node: true */
/* globals $*/
/* jslint browser : true */
console.log('Runing DevPro Packet Sniffing Proxy');
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

var game = {};
var model = {};
var net = require('net');
var parsePackets = require('../server/libs/parsepackets.js');
var enums = require('../server/libs/enums.js');
var recieveSTOC = require('../server/libs/recieveSTOC.js');
var proxy = net.createServer(function () {}).listen(8914);

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

function processTask(task, socket) {
    var player, clocation, index, data;

    //card movement vars
    var code, pc, pl, ps, pp, cc, cl, cs, cp, reason, ct;
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
            var game_message = task[i].STOC_GAME_MSG.message;
            console.log(command);
            if (command === 'MSG_START') {
                var type = game_message[1];
                var lifepoints1 = game_message.readUInt16LE(2);
                var lifepoints2 = game_message.readUInt16LE(6);
                var player1decksize = game_message.readUInt8(10);
                var player1extrasize = game_message.readUInt8(12);
                var player2decksize = game_message.readUInt8(14);
                var player2extrasize = game_message.readUInt8(16);
                game.StartDuel(lifepoints1, lifepoints2,
                    player1decksize, player2decksize,
                    player1extrasize, player2extrasize);
            } else if (command === 'MSG_HINT') {
                console.log('MSG_HINT', game_message);
                var hintplayer = game_message[1];
                var hintcont = game_message[2];
                var hintspeccount = game_message[3];
                var hintforce = game_message[4];


                console.log('Win', game_message[1]);
            } else if (command === 'MSG_NEW_TURN') {
                model.activePlayer = !model.activePlayer;
                model.phase = 0;
                game.NewTurn(model.activePlayer);
                game.NewPhase(+model.phase);
            } else if (command === 'MSG_WIN') {
                console.log('Win', game_message[1]);
            } else if (command === 'MSG_NEW_PHASE') {
                model.phase++;
                game.NewPhase(model.phase);
            } else if (command === 'MSG_DRAW') {
                var drawplayer = game_message[1];
                var draw = game_message[2];
                var cards = [];
                var drawReadposition = 3;
                for (var drawcount; draw > drawcount; drawcount++) {
                    cards.push(game_message.readUInt16LE(drawReadposition));

                }
                console.log('%c' + ('Player' + (drawplayer + 1)) + ' drew' + draw + ' cards', 'background: #222; color: #bada55');
                game.DrawCard(drawplayer, draw, cards);
            } else if (command === 'MSG_SHUFFLE_DECK') {
                shuffle(game_message[1], 'DECK');
                
            } else if (command === 'MSG_SHUFFLE_HAND') {
                layouthand(game_message[1]);
            } else if (command === 'MSG_CHAINING') {
                console.log('Chain in acknolweleged');
            } else if (command === 'MSG_CHAINED') {
                ct = game_message[1];
                // "push back chain"
                console.log('Chain in progress');
            } else if (command === 'MSG_CHAIN_SOLVING') {
                ct = game_message[1];
                model.chainsolved = 1;
                console.log('Resolving Chain');
            } else if (command === 'MSG_CHAIN_SOLVED') {
                // graphical or a trigger
                console.log('Solved Chain');
            } else if (command === 'MSG_CHAIN_END') {
                // remove any liggering chain parts
            } else if (command === 'MSG_CHAIN_NEGATED' || command === 'MSG_CHAIN_DISABLED') {
                //graphical and trigger only for replay
            } else if (command === 'MSG_CARD_SELECTED') {
                // trigger
            } else if (command === 'MSG_CARD_SELECTED') {
                /*  player = game_message[1];*/
                var count = game_message[2];
                var randomRead = 3;
                for (var randomcount = 0; count > randomcount; randomcount++) {

                }
                game.showRandomSelected();
            } else if (command === 'MSG_PAY_LPCOST') {
                player = game_message[1];
                var lpcost = game_message.readUInt16LE(2);
                console.log(('Player' + (player + 1)), 'paid', lpcost, 'lifepoints');
                game.updatelifepoints(player, -1, lpcost);
            } else if (command === 'MSG_DAMAGE') {
                player = game_message[1];
                var damage = game_message.readUInt16LE(2);
                console.log(('Player' + (player + 1)), 'took', damage, 'damage');
                game.updatelifepoints(player, -1, damage);
            } else if (command === 'MSG_SUMMONING ') {
                //ignoring
                console.log('Normal summon preformed');
            } else if (command === 'MSG_SELECT_IDLECMD') {
                var idleplayer = game_message[1];
                model.idle = true;
                var idlereadposition = 2;
                for (var k = 0; k < 5; k++) {
                    var idlecount = game_message[idlereadposition];
                    idlereadposition++;
                    //                    for (var j = 0; j < idlecount; ++j) {
                    //                        var idlecard = game_message.readUInt16LE(idlereadposition);
                    //                        idlereadposition = idlereadposition + 4;
                    //                    }
                }
            } else if (command === 'MSG_MOVE') {
                code = game_message.readUInt16LE(1);
                pc = game_message[5]; // original controller
                pl = game_message[6]; // original cLocation
                ps = game_message[7]; // original sequence (index)
                pp = game_message[8]; // padding??
                cc = game_message[9]; // current controller
                cl = game_message[10]; // current cLocation
                cs = game_message[11]; // current sequence (index)
                cp = game_message[12]; // current position
                reason = game_message.readUInt16LE[12]; //debug data??
                game.MoveCard(code, pc, pl, ps, pp, cc, cl, cs, cp, reason);
            } else if (command === 'MSG_POS_CHANGE') {
                code = game_message.readUInt16LE(1);
                cc = game_message[5]; // current controller
                cl = game_message[6]; // current cLocation
                cs = game_message[7]; // current sequence (index)
                pp = game_message[8]; // padding??
                cp = game_message[9]; // current position
                game.ChangeCardPosition(code, cc, cl, cs, cp);
            } else if (command === 'MSG_SET') {
                // All the vars are commented out in the source.
                console.log('MSG_SET');
            } else if (command === 'MSG_SWAP') {
                console.log('MSG_SWAP');
                // code vars are commented out in the source, assuming graphical only.
            } else if (command === 'MSG_SUMMONING' || command === 'MSG_SPSUMMONING') {
                code = game_message.readUInt16LE(1);
            } else if (command === 'MSG_SUMMONED' || command == 'MSG_SPSUMMONED' || command === 'MSG_FLIPSUMMONED') {
                //graphical only
            } else if (command === 'MSG_FLIPSUMMONING') {
                // notice pp is missing, and everything is upshifted; not repeating code.
                code = game_message.readUInt16LE(1);
                cc = game_message[5]; // current controller
                cl = game_message[6]; // current cLocation
                cs = game_message[7]; // current sequence (index)
                cp = game_message[8]; // current position
                game.ChangeCardPosition(code, cc, cl, cs, cp);
            } else if (command === 'MSG_UPDATE_DATA') {
                player = game_message[1];
                var fieldlocation = game_message[2];
                var fieldmodel = enums.locations[fieldlocation];
                var udata = updateMassCards(player, fieldlocation, game_message);
                //console.log('MSG_UPDATE_DATA', 'Player' + (player + 1), fieldmodel, udata);
                game.UpdateCards(player, fieldlocation, udata);
            } else if (command === 'MSG_UPDATE_CARD') {
                var udplayer = game_message[1];
                var udfieldlocation = game_message[2];
                var udindex = game_message[3];

                var udcard = makeCard(game_message, 8, udplayer).card;
                //console.log('MSG_UPDATE_CARD',
                //'Player' + (udplayer + 1), enums.locations[udfieldlocation], udindex, udcard);
                game.UpdateCard(udplayer, udfieldlocation, udindex, udcard);
            } else {
                console.log(command, game_message);
            }
        } else if (task[i].STOC_DUEL_START) {
            game.LoadField();

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
            game.UpdateTime(task[i].STOC_TIME_LIMIT.message[0], (task[i].STOC_TIME_LIMIT.message[1] + task[i].STOC_TIME_LIMIT.message[2]));

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
            card: {
                Code: 'nocard'
            },
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
        EXTRA: $('.p' + player + '.EXTRA').not('.overlayunit').length,
        GRAVE: $('.p' + player + '.GRAVE').length,
        REMOVED: $('.p' + player + '.REMOVED').length,
        SPELLZONE: 8,
        MONSTERZONE: 5

    };
}

function updateMassCards(player, clocation, buffer) {
    console.log(enums.locations[clocation]);
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

//Functions used by the websocket object

game.images = 'http://salvationdevelopment.com/launcher/ygopro/pics/';


game.UpdateTime = function (player, time) {
    $('.p' + player + 'time').val(time);
};

game.LoadField = function () {
    console.log('GAME INITIATE!');
    $('#duelzone').css('display', 'block').get(0).scrollIntoView();
    $('img.card').attr('class', 'card none undefined i0').attr('src', game.images + 'cover.jpg');

    $('#phases').css('display', 'block');
    console.log('Starting Duel!');
};
game.StartDuel = function (player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra) { // Interface signalled the game has started

    game.DOMWriter(OneDeck, 'DECK', 0);
    game.DOMWriter(TwoDeck, 'DECK', 1);
    game.DOMWriter(OneExtra, 'EXTRA', 0);
    game.DOMWriter(TwoExtra, 'EXTRA', 1);
    cardmargin(0, 'DECK');
    cardmargin(1, 'DECK');
    cardmargin(0, 'EXTRA');
    cardmargin(1, 'EXTRA');
    layouthand(0);
    layouthand(1);
    $('.p0lp').val(player1StartLP);
    $('.p1lp').val(player2StartLP);
    game.DrawCard(0, 5, []);
    game.DrawCard(1, 5, []);
    return [cardCollections(0), cardCollections(1)];
};

game.DOMWriter = function (size, movelocation, player) {
    var field = $('.fieldimage');
    $(field).detach();
    for (var i = 0; i < size; i++) {
        $(field).append('<img class="card p' + player + ' ' + movelocation + ' i' + i + ' o" src="' + game.images + 'cover.jpg" data-position="FaceDown" />');
    }
    $(field).appendTo('.fieldcontainer');
};
game.updatelifepoints = function (player, multiplier, lp) {
    var lifepoints = +$('.p' + player + 'lp').eq(0).val() + (lp * multiplier);
    if (lifepoints < 0){ lifepoints = 0;}
    $('.p' + player + 'lp').val(lifepoints);
};
game.UpdateCards = function (player, clocation, data) { //YGOPro is constantly sending data about game state, this function stores and records that information to allow access to a properly understood gamestate for reference. 


    for (var i = 0; data.length > i; i++) {
        if (data[i].Code !== 'nocard') {
            console.log('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i, data[i].Code);
            $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i).not('.overlayunit')
                .attr('src', game.images + data[i].Code + '.jpg')
                .attr('data-position', data[i].Position);
            return;
        } else {
            var deadcard = $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i).length;
            var deadzone = (enums.locations[clocation] + '.i' + i === 'SPELLZONE.i6' ||
                enums.locations[clocation] + '.i' + i === 'SPELLZONE.i7'
            ) ? 'EXTRA' : 'GRAVE';
            if (deadcard) {
                var index = $('.p' + player + '.' + deadzone).length - 1;
                animateState(player, clocation, i, player, 0x10, index, 'AttackFaceUp');
                //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
            }
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
game.MoveCard = function (code, pc, pl, ps, pp, cc, cl, cs, cp) {

    console.log(code, pc, pl, ps, pp, cc, cl, cs, cp);

    if (pl === 0) {
        var newcard = '<img class="card p' + cc + ' ' + enums.locations[cl] + ' i' + cs + '" data-position="">';
        $('.fieldimage').append(newcard);
        return;
    } else if (cl === 0) {
        var query = '.card.p' + pc + '.' + enums.locations[pl] + '.i' + ps;
        $(query).detach();
        return;
    } else {

        if (!(pl & 0x80) && !(cl & 0x80)) { //duelclient line 1885
            console.log(pl);
            animateState(pc, pl, ps, cc, cl, cs, cp);
            //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
        } else if (!(pl & 0x80)) {
            console.log('targeting a card to become a xyz unit....');
            $('.overlayunit.p' + cc + '.i' + cs).each(function (i) {
                $(this).attr('data-overlayunit', (0 + i));
            });
            animateState(pc, pl, ps, cc, (cl & 0x7f), cs, cp, undefined, true);


        } else if (!(cl & 0x80)) {
            console.log('turning an xyz unit into a normal card....');
            animateState(pc, (pl & 0x7f), ps, cc, cl, cs, cp, pp);
            $('.overlayunit.p' + pc + '.i' + ps).each(function (i) {
                $(this).attr('data-overlayunit', (0 + i));
            });
            console.log('turning something into a xyz unit....');
        } else {
            console.log('move one xyz unit to become the xyz unit of something else....');
            $('.overlayunit.p' + cc + '.i' + cs).each(function (i) {
                $(this).attr('data-overlayunit', (0 + i));
            });
            animateState(pc, (pl & 0x7f), ps, cc, (cl & 0x7f), cs, cp, pp, true);
            $('.overlayunit.p' + pc + '.OVERLAY.i' + ps).each(function (i) {
                $(this).attr('data-overlayunit', (0 + i));
            });


        }
    }
};
game.ChangeCardPosition = function (code, cc, cl, cs, cp) {
    animateState(cc, cl, cs, cc, cl, cs, cp);
    //var query = '.card.p' + cc + '.' + enums.locations[cl] + '.i' + cs;
    //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
};

game.DrawCard = function (player, numberOfCards, cards) {
    var currenthand = $('.p' + player + '.HAND').length;

    for (var i = 0; i < numberOfCards; i++) {
        var topcard = $('.p' + player + '.DECK').length - 1;
        animateState(player, 1, topcard, player, 2, currenthand + i, 'FaceUp');
        //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition){
        if (cards[i]) {
            $('.p' + player + '.HAND' + 'i' + (currenthand + i)).attr('src', game.images + cards[i] + '.jpg');
        }
    }

    layouthand(player);
    //console.log("p" + player + " drew " + numberOfCards + " card(s)");
};

game.NewPhase = function (phase) {
    console.log('it is now' + enums.phase[phase]);
    $('#phases .phase').text(enums.phase[phase]);
    if (phase === 1 && turn !== 0) {
        game.DrawCard(turn, 1, []);
    }

};
var turn = 0;
var turnplayer = 0;
game.NewTurn = function (turnx) {
    turnx = +turnx;
    console.log("It is now p" + turnx + "'s turn.");
    $('#phases .player').text('Player ' + (1 + turnx) + ':');
    turnplayer = turnx;
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



var shuffler, fix;




// Animation functions

function cardmargin(player, deck) {
    var size = $('.card.' + player + '.' + deck).length;
    $('.card.p' + player + '.' + deck).each(function (i) {

        $(this).css('z-index', i).attr('style','')
            .css('-webkit-transform', 'translate3d(0,0,' + i + 'px)');


    });
}


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

function complete(player,deck) {
    var started = Date.now();

    // make it loop every 100 milliseconds

    var interval = setInterval(function () {

        // for 1.5 seconds
        if (Date.now() - started > 500) {

            // and then pause it
            clearInterval(interval);

        } else {

            // the thing to do every 100ms
            shuffle(player, deck);
            cardmargin(player, deck);

        }
    }, 100); // every 100 milliseconds
}




function animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition, overlayindex, isBecomingCard) {
    var isCard = (overlayindex === undefined) ? '.card' : '.card.overlayunit';
    isBecomingCard = (isBecomingCard) ? 'card overlayunit' : 'card';
    overlayindex = (overlayindex === undefined) ? '' : 0;
    var searchindex = (index === 'ignore') ? '' : ".i" + index;
    var searchplayer = (player === 'ignore') ? '' : ".p" + player;
    var origin = isCard + searchplayer + "." + enums.locations[clocation] + searchindex;
    var destination = isBecomingCard + " p" + moveplayer + " " + enums.locations[movelocation] + " i" + movezone;

    var card = $(origin)
        //.each(function(i){
        /*$(this)*/
        .attr({
            'style': '',
            'data-position': moveposition,
            'data-overlayunit': overlayindex,
            'class': destination
        });
    //   });


    console.log(origin, 'changed to', destination);
    if (enums.locations[clocation] === 'DECK' ||
        enums.locations[clocation] === 'EXTRA' ||
        enums.locations[clocation] === 'GRAVE' ||
        enums.locations[clocation] === 'REMOVED') {
        cardmargin(player, enums.locations[clocation]);
    }
    if (enums.locations[movelocation] === 'DECK' ||
        enums.locations[movelocation] === 'EXTRA' ||
        enums.locations[movelocation] === 'GRAVE' ||
        enums.locations[movelocation] === 'REMOVED') {
        cardmargin(moveplayer, enums.locations[movelocation]);
    }

    $('.card.p0.HAND').each(function (sequence) {
        $(this).attr('class', 'card p0 HAND i' + sequence);
    });
    $('.card.p1.HAND').each(function (sequence) {
        $(this).attr('class', 'card p1 HAND i' + sequence);
    });

    layouthand(0);
    layouthand(1);
    return card;
}

function animateChaining(player, clocation, index) {
    $(player + '.' + clocation + '.i' + index).addClass('chainable');
}

function animateRemoveChaining() {
    $('.chainable').removeClass('chainable');
}

function layouthand(player) {
    var count = $('.p' + player + '.HAND').length;
    var f = 75 / 0.8;
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
            $('.p' + player + '.HAND.i' + sequence).css('left', '' + xCoord + 'px');
        }
    }
}

//    
//    if (count <= 6)
//    t->X = (5.5f - 0.8f * count) / 2 + 1.55f + sequence * 0.8f;
//   else
//    t->X = 1.9f + sequence * 4.0f / (count - 1);