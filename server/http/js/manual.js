/*global localStorage, $, Primus, console*/
function createmessage() {
    'use strict';
    return {
        command: '',
        identity: localStorage.username
    };
}

var manualconnection = Primus.connect(window.location.origin + ':24556');
manualconnection.on('data', function (data) {
    'use strict';
    console.log(data);

});
manualconnection.on('connect', function () {
    'use strict';
    console.log('!!!!!! connect');
});
manualconnection.on('close', function () {
    'use strict';
    console.log('!!!!!! close');
});


var shuffler, fix;




// Animation functions

function cardmargin(player, deck) {
    'use strict';
    var size = $('.card.' + player + '.' + deck).length;
    $('.card.p' + player + '.' + deck).each(function (i) {

        $(this).css('z-index', i).attr('style', '')
            .css('-webkit-transform', 'translate3d(0,0,' + i + 'px)');


    });
}


function shuffle(player, deck) {
    'use strict';
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
        var cache = $(this).css(orientation.x),
            spatical = Math.floor((Math.random() * 150) - 75);
        $(this).css(orientation.x, '-=' + spatical + 'px');
    });
    fix = setTimeout(function () {
        cardmargin(player, deck);
    }, 50);
}

function complete(player, deck) {
    'use strict';
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




function animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition, overlayindex, isBecomingCard) {
    'use strict';
    var isCard = (overlayindex === undefined) ? '.card' : '.card.overlayunit';
    isBecomingCard = (isBecomingCard) ? 'card overlayunit' : 'card';
    overlayindex = (overlayindex === undefined) ? '' : 0;
    var searchindex = (index === 'ignore') ? '' : ".i" + index,
        searchplayer = (player === 'ignore') ? '' : ".p" + player,
        origin = isCard + searchplayer + "." + enums.locations[clocation] + searchindex,
        destination = isBecomingCard + " p" + moveplayer + " " + enums.locations[movelocation] + " i" + movezone,
        card = $(origin)
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
var game = {};
game.UpdateTime = function (player, time) {
    'use strict';
    $('.p' + player + 'time').val(time);
};

game.LoadField = function () {
    'use strict';
    console.log('GAME INITIATE!');
    $('#duelzone').css('display', 'block').get(0).scrollIntoView();
    $('img.card').attr('class', 'card none undefined i0').attr('src', game.images + 'cover.jpg');

    $('#phases').css('display', 'block');
    console.log('Starting Duel!');
};
game.StartDuel = function (player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra) {
    'use strict'; // Interface signalled the game has started

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
    'use strict';
    var field = $('.fieldimage');
    $(field).detach();
    for (var i = 0; i < size; i++) {
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
        var query = '.p' + player + '.HAND' + '.i' + (currenthand + i);
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