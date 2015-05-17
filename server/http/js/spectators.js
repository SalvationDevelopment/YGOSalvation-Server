//Define all the globals you are going to use. Avoid using to many globals. All Globals should be databases of sorts.
// ReadInt32() = readUInt16LE()
/*jslint node: true, bitwise:true*/
/*globals $, WebSocket*/
/*jslint browser : true, plusplus:true*/
'use strict';
console.log('Runing DevPro Packet Sniffing Proxy');
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

var game = {
    images: 'http://ygopro.us/http/ygopro/pics/'
};








function processTask(task) {
    var player, clocation, index, data,
        code, pc, pl, ps, pp, cc, cl, cs, cp, reason, ct, i,
        type, command, game_message, lifepoints1, lifepoints2, player1decksize, player1extrasize, player2extrasize,
        player2decksize, hintplayer, hintcont, hintspeccount, hintforce, drawplayer, draw, cardslist, drawReadposition,
        drawcount, cardcode, shuffle, layoutand, count, randomRead, randomcount, layouthand, lpcost, damage, idleplayer,
        idlereadposition, k, idlecount, fieldlocation, fieldmodel, updateMassCards, udplayer, udfieldlocation, udindex, udcard,
        makecard, chat, person, position, change, changepos, state, makeCard, typec, pos, ishost, errormessage, rpschoice;
    task = (function () {
        var output = [];
        for (i = 0; task.length > i; i++) {
            output.push(recieveSTOC(task[i]));
        }
        return output;
    }());
    for (i = 0; task.length > i; i++) {
//        if (task[i].STOC_UNKNOWN) {
//            //console.log('-----', makeCard(task[i].STOC_UNKNOWN.message));
//        } else
        if (task[i].STOC_GAME_MSG && task[i].STOC_GAME_MSG.message) {
            command = enums.STOC.STOC_GAME_MSG[task[i].STOC_GAME_MSG.message[0]];
            game_message = task[i].STOC_GAME_MSG.message;
            if (command === undefined) {
                console.log('figure out STOC', task[i].STOC_GAME_MSG);
            }
            console.log(command);
            if (command === 'MSG_START') {
                type = game_message[1];
                lifepoints1 = game_message.readUInt16LE(2);
                lifepoints2 = game_message.readUInt16LE(6);
                player1decksize = game_message.readUInt8(10);
                player1extrasize = game_message.readUInt8(12);
                player2decksize = game_message.readUInt8(14);
                player2extrasize = game_message.readUInt8(16);
                game.StartDuel(lifepoints1, lifepoints2,
                    player1decksize, player2decksize,
                    player1extrasize, player2extrasize);
            } else if (command === 'MSG_HINT') {
                console.log('MSG_HINT', game_message);
                hintplayer = game_message[1];
                hintcont = game_message[2];
                hintspeccount = game_message[3];
                hintforce = game_message[4];


                console.log('Win', game_message[1]);
            } else if (command === 'MSG_NEW_TURN') {
                game.activePlayer = !game.activePlayer;
                game.phase = 0;
                game.NewTurn(game.activePlayer);
                game.NewPhase(+game.phase);
            } else if (command === 'MSG_WIN') {
                console.log('Win', game_message[1]);
            } else if (command === 'MSG_NEW_PHASE') {
                game.phase++;
                game.NewPhase(game.phase);
            } else if (command === 'MSG_DRAW') {
                console.log(game_message);
                drawplayer = game_message[1];
                draw = game_message[2];
                cardslist = [];
                drawReadposition = 3;
                for (drawcount = 0; draw > drawcount; drawcount++) {
                    cardcode = game_message.readUInt32LE(drawReadposition) || 'cover';
                    cardslist.push(cardcode);
                    console.log(drawReadposition);
                    drawReadposition = drawReadposition + 4;
                }
                console.log('%c' + ('Player' + (drawplayer + 1)) + ' drew' + draw + ' cards', 'background: #222; color: #bada55', cardslist);
                game.DrawCard(drawplayer, draw, cardslist);
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
                game.chainsolved = 1;
                console.log('Resolving Chain');
            
            } else if (command === 'MSG_CARD_SELECTED') {
                /*  player = game_message[1];*/
                count = game_message[2];
                randomRead = 3;
                game.showRandomSelected();
            } else if (command === 'MSG_PAY_LPCOST') {
                player = game_message[1];
                lpcost = game_message.readUInt16LE(2);
                console.log(('Player' + (player + 1)), 'paid', lpcost, 'lifepoints');
                game.updatelifepoints(player, -1, lpcost);
            } else if (command === 'MSG_DAMAGE') {
                player = game_message[1];
                damage = game_message.readUInt16LE(2);
                console.log(('Player' + (player + 1)), 'took', damage, 'damage');
                game.updatelifepoints(player, -1, damage);
            } else if (command === 'MSG_SUMMONING ') {
                //ignoring
                console.log('Normal summon preformed');
            } else if (command === 'MSG_SELECT_IDLECMD') {
                idleplayer = game_message[1];
                game.idle = true;
                idlereadposition = 2;
                for (k = 0; k < 5; k++) {
                    idlecount = game_message[idlereadposition];
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
                fieldlocation = game_message[2];
                fieldmodel = enums.locations[fieldlocation];
                updateMassCards(player, fieldlocation, game_message);
                //console.log('MSG_UPDATE_DATA', 'Player' + (player + 1), fieldmodel, udata);

            } else if (command === 'MSG_UPDATE_CARD') {
                udplayer = game_message[1];
                udfieldlocation = game_message[2];
                udindex = game_message[3];

                udcard = makeCard(game_message, 8, udplayer).card;
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
            rpschoice = task[i].STOC_HAND_RESULT.message[0];
            console.log('Opponent used', enums.RPS[rpschoice]);
        } else if (task[i].STOC_SELECT_HAND) {
            console.log('Please Select RPS');
        } else if (task[i].STOC_REPLAY) {
            console.log('Replay Information', task[i].STOC_REPLAY);
        } else if (task[i].STOC_TIME_LIMIT) {

            //console.log('Player' + (task[i].STOC_TIME_LIMIT.message[0] + 1), 'has ' + (task[i].STOC_TIME_LIMIT.message[1] + task[i].STOC_TIME_LIMIT.message[2]) + 'sec left');
            game.UpdateTime(task[i].STOC_TIME_LIMIT.message[0], (task[i].STOC_TIME_LIMIT.message[1] + task[i].STOC_TIME_LIMIT.message[2]));

        } else if (task[i].STOC_CHAT) {
            chat = task[i].STOC_CHAT.message.toString('utf16le', 2);
            console.log('Chat:', chat);
        } else if (task[i].STOC_HS_PLAYER_ENTER) {
            person = task[i].STOC_HS_PLAYER_ENTER.message.toString('utf16le', 0, 40);
            position = task[i].STOC_HS_PLAYER_ENTER.message[41];
            console.log(person, 'entered', 'the duel', position);
        } else if (task[i].STOC_HS_PLAYER_CHANGE) {
            change = task[i].STOC_HS_PLAYER_CHANGE.message[0];
            changepos = (change >> 4) & 0xF;
            state = change & 0xF;
            console.log('position', changepos, enums.lobbyStates[state]);


        } else if (task[i].STOC_HS_WATCH_CHANGE) {
            console.log('Spectators:', task[i].STOC_HS_WATCH_CHANGE.message[0]);
        } else if (task[i].STOC_TYPE_CHANGE) {

            typec = task[i].STOC_TYPE_CHANGE.message[0];
            pos = typec & 0xF;
            ishost = ((typec >> 4) & 0xF) !== 0;
            console.log('STOC_TYPE_CHANGE', task[i].STOC_TYPE_CHANGE, 'type', typec, 'pos', pos, 'ishost', ishost);

        } else if (task[i].STOC_SELECT_TP) {
            console.log('Chat', task[i].STOC_SELECT_TP);
        } else if (task[i].STOC_JOIN_GAME) {
            console.log('Join Game', task[i].STOC_JOIN_GAME);
        } else if (task[i].STOC_ERROR_MSG) {
            errormessage = enums.STOC.STOC_ERROR_MSG[task[i].STOC_ERROR_MSG.message[0]];
            if (errormessage === "ERRMSG_JOINERROR") {
                console.log(enums.STOC.STOC_ERROR_MSG.ERRMSG_DECKERROR[task[i].STOC_ERROR_MSG.message[1]]);
            } else if (errormessage === "ERRMSG_DECKERROR") {
                if (task[i].STOC_ERROR_MSG.message[1] === 1) {
                    console.log('Invalid Deck');
                } else {
                    console.log('[%ls] not allowed. Check the TCG/OCG card list and check the banlist',
                        task[i].STOC_ERROR_MSG.message.readUInt32LE(4));
                }
            } else if (errormessage === "ERRMSG_SIDEERROR") {
                console.log('Side decking failed');
            } else if (errormessage === "ERRMSG_VERERROR") {
                console.log('Version mismatch.');
            }
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
    var flag = buffer.readUInt32LE(start),
        card,
        readposition,
        i,
        ii,
        iii;

    if (!flag) {
        return {
            card: {
                Code: 'cover',
                Position: 'FaceDownAttack'
            },
            readposition: start + 9
        };
    }
    card = {
        Code: 'cover',
        Position: 'FaceDownAttack'
    };

    //console.log('flag:', flag);
    readposition = start + 4;

    if (flag & enums.query.Code) {
        card.Code = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Position) {
        card.Controller = buffer[readposition];
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
            c: buffer[readposition],
            l: buffer[readposition + 1],
            s: buffer[readposition + 2]
        };
        readposition = readposition + 4;
    }
    if (flag & enums.query.TargetCard) {
        card.TargetCard = [];
        for (i = 0; i < buffer.readUInt32LE(readposition); ++i) {
            card.TargetCard.push({
                c: buffer[readposition],
                l: buffer[readposition + 1],
                s: buffer[readposition + 2]
            });
            readposition = readposition + 4;
        }
    }
    if (flag & enums.query.OverlayCard) {
        card.OverlayCard = [];
        for (ii = 0; ii < buffer.readUInt32LE(readposition); ++ii) {
            card.OverlayCard.push(buffer.readUInt32LE(readposition));
            readposition = readposition + 4;
        }
    }
    if (flag & enums.query.Counters) {
        card.Counters = [];
        for (iii = 0; iii < buffer.readUInt32LE(readposition); ++iii) {
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
    if (flag & enums.query.LScale) {
        card.lscale = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.RScale) {
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
    //console.log("Location:", enums.locations[clocation], clocation, player);
    //if (enums.locations[clocation] === 'EXTRA')return;
    var field = cardCollections(player),
        output = [],
        readposition = 3,
        failed = false,
        i,
        len,
        count,
        result;
    
    //console.log(field);
    if (field[enums.locations[clocation]] !== undefined) {
        for (i = 0, count = field[enums.locations[clocation]]; count > i; i++) {
            try {
                len = buffer.readUInt8(readposition);
                readposition = readposition + 4;
                if (len > 8) {
                    result = makeCard(buffer, readposition, player);
                    output.push(result.card);
                    readposition = readposition + len - 4;

                } else {
                    output.push({
                        Code: 'nocard'
                    });
                }
            } catch (e) {
                console.log('overshot', e);
                failed = true;
                game.additional = {
                    player: player,
                    clocation: clocation,
                    buffer: buffer
                };
            }
        }
        if (!failed) {
            game.additional = false;
        }
        //console.log(output);

        game.UpdateCards(player, clocation, output);
    }
}
//Functions used by the websocket object




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

function cardmargin(player, deck) {
    var size = $('.card.' + player + '.' + deck).length;
    $('.card.p' + player + '.' + deck).each(function (i) {

        $(this).css('z-index', i).attr('style', '')
            .css('-webkit-transform', 'translate3d(0,0,' + i + 'px)');


    });
}

function layouthand(player) {
    var count = $('.p' + player + '.HAND').length,
        f = 75 / 0.8,
        xCoord,
        sequence;
    //    console.log(count,f,xCoord);
    for (sequence = 0; sequence < count; sequence++) {
        if (count < 6) {
            xCoord = (5.5 * f - 0.8 * f * count) / 2 + 1.55 * f + sequence * 0.8 * f;
        } else {
            xCoord = 1.9 * f + sequence * 4.0 * f / (count - 1);
        }
        // console.log('.'+player+'.Hand.i'+sequence);
        //console.log(xCoord);
        if (player === 0) {
            $('.p' + player + '.HAND.i' + sequence).css('left', String() + xCoord + 'px');
        } else {
            $('.p' + player + '.HAND.i' + sequence).css('left', String() + xCoord + 'px');
        }
    }
}

//    
//    if (count <= 6)
//    t->X = (5.5f - 0.8f * count) / 2 + 1.55f + sequence * 0.8f;
//   else
//    t->X = 1.9f + sequence * 4.0f / (count - 1);

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
    return [cardCollections(0), cardCollections(1)];
};

game.DOMWriter = function (size, movelocation, player) {
    var field = $('.fieldimage'),
        i;
    $(field).detach();
    for (i = 0; i < size; i++) {
        $(field).append('<img class="card p' + player + ' ' + movelocation + ' i' + i + ' o" src="' + game.images + 'cover.jpg" data-position="FaceDown" />');
    }
    $(field).appendTo('.fieldcontainer');
};
game.updatelifepoints = function (player, multiplier, lp) {
    var lifepoints = +$('.p' + player + 'lp').eq(0).val() + (lp * multiplier);
    if (lifepoints < 0) {
        lifepoints = 0;
    }
    $('.p' + player + 'lp').val(lifepoints);
};
game.UpdateCards = function (player, clocation, data) { //YGOPro is constantly sending data about game state, this function stores and records that information to allow access to a properly understood gamestate for reference. 
    var i, deadcard, deadzone, index, animateState;

    for (i = 0; data.length > i; i++) {
        if (data[i].Code !== 'nocard') {
            console.log('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i, data[i].Code);
            $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i).not('.overlayunit')
                .attr('src', game.images + data[i].Code + '.jpg')
                .attr('data-position', data[i].Position);
            return;
        } else {
            deadcard = $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i).length;
            deadzone = (enums.locations[clocation] + '.i' + i === 'SPELLZONE.i6' ||
                enums.locations[clocation] + '.i' + i === 'SPELLZONE.i7'
            ) ? 'EXTRA' : 'GRAVE';
            if (deadcard) {
                index = $('.p' + player + '.' + deadzone).length - 1;
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
function animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition, overlayindex, isBecomingCard) {
    isBecomingCard = (isBecomingCard) ? 'card overlayunit' : 'card';
    overlayindex = (overlayindex === undefined) ? '' : 0;
    var isCard = (overlayindex === undefined) ? '.card' : '.card.overlayunit',
        
        searchindex = (index === 'ignore') ? '' : ".i" + index,
        searchplayer = (player === 'ignore') ? '' : ".p" + player,
        origin = isCard + searchplayer + "." + enums.locations[clocation] + searchindex,
        destination = isBecomingCard + " p" + moveplayer + " " + enums.locations[movelocation] + " i" + movezone,
        card = $(origin).attr({
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

game.MoveCard = function (code, pc, pl, ps, pp, cc, cl, cs, cp) {

    console.log(code, pc, pl, ps, pp, cc, cl, cs, cp);
    var newcard, query;
    if (pl === 0) {
        newcard = '<img class="card p' + cc + ' ' + enums.locations[cl] + ' i' + cs + '" data-position="">';
        $('.fieldimage').append(newcard);
        return;
    } else if (cl === 0) {
        query = '.card.p' + pc + '.' + enums.locations[pl] + '.i' + ps;
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
                $(this).attr('data-overlayunit', (i));
            });
            animateState(pc, pl, ps, cc, (cl & 0x7f), cs, cp, undefined, true);


        } else if (!(cl & 0x80)) {
            console.log('turning an xyz unit into a normal card....');
            animateState(pc, (pl & 0x7f), ps, cc, cl, cs, cp, pp);
            $('.overlayunit.p' + pc + '.i' + ps).each(function (i) {
                $(this).attr('data-overlayunit', (i));
            });
            console.log('turning something into a xyz unit....');
        } else {
            console.log('move one xyz unit to become the xyz unit of something else....');
            $('.overlayunit.p' + cc + '.i' + cs).each(function (i) {
                $(this).attr('data-overlayunit', (i));
            });
            animateState(pc, (pl & 0x7f), ps, cc, (cl & 0x7f), cs, cp, pp, true);
            $('.overlayunit.p' + pc + '.OVERLAY.i' + ps).each(function (i) {
                $(this).attr('data-overlayunit', true);
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
    var currenthand = $('.p' + player + '.HAND').length, i, topcard, query;

    for (i = 0; i < numberOfCards; i++) {
        topcard = $('.p' + player + '.DECK').length - 1;
        animateState(player, 1, topcard, player, 2, currenthand + i, 'FaceUp');
        //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition){
        query = '.p' + player + '.HAND' + '.i' + (currenthand + i);
        console.log(query + ' changed to ' + game.images + cards[i] + '.jpg');
        $(query).attr('src', game.images + cards[i] + '.jpg');

    }

    layouthand(player);
    //console.log("p" + player + " drew " + numberOfCards + " card(s)");
};

game.NewPhase = function (phase) {
    console.log('it is now' + enums.phase[phase]);
    $('#phases .phase').text(enums.phase[phase]);


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

function animateChaining(player, clocation, index) {
    $(player + '.' + clocation + '.i' + index).addClass('chainable');
}

function animateRemoveChaining() {
    $('.chainable').removeClass('chainable');
}

game.OnChaining = function (cards, desc, forced) {
    var cardIDs = JSON.parse(cards), i;

    for (i = 0; i < cardIDs.length; i++) {
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
    }),
        fix;
    cardmargin(player, deck);
    $($('.card.' + player + '.' + deck).get().reverse()).each(function (i) {
        var cache = $(this).css(orientation.x),
            spatical = Math.floor((Math.random() * 150) - 75);
        $(this).css(orientation.x, '-=' + spatical + 'px');
    });
    fix = setTimeout(function () {
        cardmargin(player, deck);
    }, 50);
}

game.ShuffleDeck = function (player) {
    console.log(player);
    shuffle(player, 'DECK');
};



var shuffler, fix;




// Animation functions






function complete(player, deck) {
    var started = Date.now(),
        interval = setInterval(function () {

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












var net = require('net');
var Framemaker = require('../server/libs/parseframes.js');
var enums = require('../server/libs/enums.js');
var recieveSTOC = require('../server/libs/recieveSTOC.js');
var proxy = net.createServer().listen(8914);

function parsePackets(command, message) {
    var task = [],
        packet = {
            message: message.slice(1)
        };
    
    packet[command] = enums[command][message[0]];


    task.push(packet);
    return task;
}

function startgame() {
    var ws = new WebSocket("ws://ygopro.us:8080", "duel"),
        framer = new Framemaker();
    ws.onconnect = function () {};
    ws.onclose = function () {};
    ws.onmessage = function (data) {
        //console.log(data)
        var frame = framer.input(data),
            newframes,
            task;
        console.log(frame.length);
        for (newframes = 0; frame.length > newframes; newframes++) {
            task = parsePackets('STOC', new Buffer(frame[newframes]));
            processTask(task);
        }
    };
    ws.onopen = function () {};
}


