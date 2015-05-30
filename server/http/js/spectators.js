//Define all the globals you are going to use. Avoid using to many globals. All Globals should be databases of sorts.
// ReadInt32() = readUInt16LE()
/*jslint node: true, bitwise:true*/
/*globals $, WebSocket*/
/*jslint browser : true, plusplus:true*/
'use strict';



var game = {
    images: 'http:\/\/ygopro.us\/http\/ygopro\/pics\/'
};




var Framemaker = require('../../../server/libs/parseframes.js');
var enums = require('../../../server/libs/enums.js');
var recieveSTOC = require('../../../server/libs/recieveSTOC.js');
var makeCTOS = require('../../ai/responseGenerator.js');
var Buffer = require('buffer/').Buffer,
    events = require('events'),
    makeCard = require('./card.js');

function processTask(task, socket) {
   
    var i = 0,
        l = 0,
        output = [],
        RESPONSE = false;
    for (i; task.length > i; i++) {
        output.push(recieveSTOC(task[i]));
    }

    return output;
}

function CommandParser() {

    var protoResponse = [],
        responseRequired = false,
        output = {};

    output.event = new events.EventEmitter();

    output.input = function (input) {
        var serverToClient,
            gameMessage;
        
        for (serverToClient in input) {
            if (input.hasOwnProperty(serverToClient)) {
                if (input[serverToClient] === true) {
                    output.event.emit(input.command, input);
                    console.log(serverToClient);
                }
            }
        }
        //console.log(input);
        if (input.STOC_GAME_MSG) {
            output.event.emit(input.command, input);
            console.log(input.command, input);
        }
    };
    return output;
}

function GameState() {
    var state = {
            0: {
                Lifepoints: 8000,
                MonsterZones: [],
                SpellTrapZones: [],
                Graveyard: [],
                Banished: [],
                Hand: [],
                ExtraDeck: [],
                MainDeck: [],
                Time : 300
            },
            1: {
                LifePoints: 8000,
                MonsterZones: [],
                SpellTrapZones: [],
                Graveyard: [],
                Banished: [],
                Hand: [],
                ExtraDeck: [],
                MainDeck: [],
                Time : 300
            }
        };
    function updateTime(player, newTime) {
        state[player].Time = newTime;
        console.log('time', player, newTime, '.p' + player + 'time');
        $('.p' + player + 'time').val(newTime);
    }

    function start(p0lp, p1lp, OneDeck, TwoDeck, OneExtra, TwoExtra) {
        $('.fieldimage').html('');
        game.DOMWriter(OneDeck, 'DECK', 0);
        game.DOMWriter(TwoDeck, 'DECK', 1);
        game.DOMWriter(OneExtra, 'EXTRA', 0);
        game.DOMWriter(TwoExtra, 'EXTRA', 1);
        shuffle(0, 'DECK');
        shuffle(1, 'DECK');
        shuffle(0, 'EXTRA');
        shuffle(1, 'EXTRA');
        setTimeout(function () {
            cardmargin(0, 'DECK');
            cardmargin(1, 'DECK');
            cardmargin(0, 'EXTRA');
            cardmargin(1, 'EXTRA');
        }, 1000);

        state[0].LifePoints = p0lp;
        state[1].LifePoints = p1lp;
        $('.p0lp').val(parseInt(p0lp, 10));
        $('.p1lp').val(parseInt(p1lp, 10));
    }

    function update(player, clocation, index, data) {
        if (index !== 'mass') {
            state[player][clocation] = data;
        } else {
            state[player][clocation][index] = data;
        }
    }

    function move(player, clocation, index, moveplayer, movelocation, movezone, moveposition, overlayindex, isBecomingCard) {

        //enums.locations[clocation] === 'DECK/EXTRA/REMOVED
        state[moveplayer][movelocation][moveposition] = state[player][clocation][index];
        state[player][clocation][index] = undefined;
        //if grave
        //if banished
        //if hand
        //if extraDeck
        //if maindeck
        //if above, reshuffle;
        state[player][clocation] = state[player][clocation].filter(function (element) {
            return element !== undefined;
        });


        return;
    }

    function newphase(turnx) {
        turnx = +state.phase;
    }



    function loadDeck(player, deck, cardList) {

    }
    return {
        move: move,
        update: update,
        loadDeck: loadDeck,
        lobby: {
            ready : [0, 0],
            duelist : [],
            totalplayers: 0
        },
        updateTime : updateTime,
        fieldside : 0,
        state : state,
        start : start
    };

}

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
    //return [cardCollections(0), cardCollections(1)];
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

game.UpdateCards = function (player, clocation, data) { //YGOPro is constantly sending data about game state, this function stores and records that information to allow access to a properly understood gamestate for reference. 
    var i, deadcard, deadzone, index, animateState;

    for (i = 0; data.length > i; i++) {
        if (data[i].Code !== 'nocard') {
            console.log('.card.p' + player + '.' + clocation + '.i' + i, data[i].Code);
            $('.card.p' + player + '.' + clocation + '.i' + i).not('.overlayunit')
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

function parsePackets(command, message) {
    var task = [],
        packet = {
            message: message.slice(1)
        };
    
    packet[command] = enums[command][message[0]];


    task.push(packet);
    return task;
}

var duel = {};
window.ws = {};




function startgame(roompass) {
    duel.gameState = new GameState();
    duel.commandParser = new CommandParser();
    window.ws = new WebSocket("ws://192.99.11.19:8082", "duel");
    window.ws.binaryType = 'arraybuffer';
    var framer = new Framemaker();
    duel.commandParser = new CommandParser();
    window.ws.onconnect = function () {
        
       
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

        
        frame = framer.input(q);
        for (newframes; frame.length > newframes; newframes++) {
            task = parsePackets('STOC', new Buffer(frame[newframes]));
            //console.log('!', task);
            commands = processTask(task);
            // process AI
            //console.log(task);
            l = 0;
            for (l; commands.length > l; l++) {
                duel.commandParser.input(commands[l]);
            }
            

        }
        frame = [];
        

        
        
    };
    window.ws.onopen = function () {
        console.log('Send Game request for', roompass);
        var name = makeCTOS('CTOS_PlayerInfo', 'Spectator'),
            join = makeCTOS('CTOS_JoinGame', roompass),
            tosend = Buffer.concat([name, join]);
        window.ws.send(tosend);
    };
    duel.commandParser.event.on('STOC_JOIN_GAME', function (input) {

    });
    duel.commandParser.event.on('STOC_HS_PLAYER_CHANGE', function (input) {
        if (input.pos > 3) {
            return;
        }
        if (input.state > 8) {
            duel.gameState.lobby.ready[input.changepos] = input.state;
        }
        console.log(duel.gameState.lobby.ready[0], duel.gameState.lobby.ready[1]);
        if ((duel.gameState.lobby.ready[0] + duel.gameState.lobby.ready[0]) === 18) {
            duel.server.write(makeCTOS('CTOS_START'));
        }
    });
    duel.commandParser.event.on('STOC_HS_PLAYER_CHANGE', function (input) {

    });
    duel.commandParser.event.on('STOC_SELECT_TP', function (input) {

    });
    duel.commandParser.event.on('MSG_START', function (input) {
        console.log(input);
        duel.gameState.start(input.lifepoints1, input.lifepoints2, input.player1decksize, input.player2decksize, input.player1extrasize, input.player2extrasize);
        duel.gameState.fieldside =  input.playertype;
        
        console.log(input);
    });
    duel.commandParser.event.on('MSG_NEW_TURN', function (input) {
        console.log('MSG_NEW_TURN', input);
    });
    duel.commandParser.event.on('MSG_WIN', function (input) {
        console.log('MSG_WIN', input);
    });
    duel.commandParser.event.on('MSG_DRAW', function (input) {
        //console.log('MSG_DRAW', input);
        game.DrawCard(input.player, input.draw, input.cardslist);
    });
    duel.commandParser.event.on('MSG_PAY_LPCOST', function (input) {
        //console.log('MSG_PAY_LPCOST', input);
        //game.DrawCard(input.player, input.draw, input.cardslist);
    });
    duel.commandParser.event.on('MSG_UPDATE_DATA', function (input) {
        var field = duel.gameState.state[input.player],
            output = [],
            readposition = 3,
            failed = false,
            player = input.player,
            clocation = input.clocation,
            buffer = input.message,
            i = 0,
            count,
            len,
            result;

        if (field[input.fieldmodel] !== undefined) {
            while (!failed) {
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
                    failed = true;
                }
            }
           
            //console.log(output);

            game.UpdateCards(player, input.fieldmodel, output);
        }
        duel.gameState.state[input.player][input.fieldmodel] = output;
        //console.log(player, input.fieldmodel, output);
    });
    duel.commandParser.event.on('STOC_TIME_LIMIT', function (input) {
        console.log('STOC_TIME_LIMIT', input);
        duel.gameState.updateTime(input.player, input.time);
    });
    duel.commandParser.event.on('STOC_ERROR_MSG', function (input) {
       
    });
    duel.commandParser.event.on('STOC_SELECT_HAND', function (input) {
       
    });
    duel.commandParser.event.on('STOC_SELECT_TP', function (input) {
       
    });
    duel.commandParser.event.on('STOC_HAND_RESULT', function (input) {
        console.log('STOC_HAND_RESULT', input);
    });
    duel.commandParser.event.on('STOC_CHANGE_SIDE', function (input) {
       
    });
    duel.commandParser.event.on('STOC_CREATE_GAME', function (input) {
       
    });
    duel.commandParser.event.on('STOC_JOIN_GAME', function (input) {
       
    });
    duel.commandParser.event.on('STOC_TYPE_CHANGE', function (input) {
       
    });
    duel.commandParser.event.on('STOC_LEAVE_GAME', function (input) {
       
    });
    duel.commandParser.event.on('STOC_HS_PLAYER_CHANGE', function (input) {
       
    });
    duel.commandParser.event.on('STOC_DUEL_END', function (input) {
       
    });
    duel.commandParser.event.on('STOC_REPLAY', function (input) {
       
    });
    duel.commandParser.event.on('STOC_DUEL_START', function (input) {
       
    });
    duel.commandParser.event.on('STOC_HS_PLAYER_ENTER', function (input) {
       
    });
    duel.commandParser.event.on('STOC_HS_WATCH_CHANGE', function (input) {
       
    });
    duel.commandParser.event.on('STOC_CHAT', function (input) {
        $('#ingamechat').append('<div>' + input.from + ' ' + input.chat + '</div>');
    });
    duel.commandParser.event.on('MSG_DAMAGE', function (input) {
        duel.gameState.updatelifepoints(input.player, input.multiplier, input.lp);
    });
    duel.commandParser.event.on('MSG_RECOVER', function (input) {
        duel.gameState.updatelifepoints(input.player, input.multiplier, input.lp);
    });
    duel.commandParser.event.on('MSG_PAY_LPCOST', function (input) {
        duel.gameState.updatelifepoints(input.player, input.multiplier, input.lp);
    });
    duel.commandParser.event.on('MSG_MOVE', function (input) {
        game.MoveCard(input.code, input.pc, input.pl, input.ps, input.pp, input.cc, input.cl, input.cs, input.cp);
    });
}

window.startgame = startgame;
window.duel = duel;
