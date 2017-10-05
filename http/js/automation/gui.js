/*global $, console, cardmargin, layouthand, cardCollections, enums, animateState, animateRemoveChaining, shuffle, animateChaining*/
/*jslint plusplus:true, bitwise:true */

var gui = {};

(function () {
    'use strict';
    gui.gotoLobby = function () {
        singlesitenav('lobby');
    }
    gui.UpdateTime = function (player, time) {
        $('.p' + player + 'time').val(time);
    };

    gui.LoadField = function () {
        console.log('GAME INITIATE!');
        $('#duelzone').css('display', 'block').get(0).scrollIntoView();
        $('img.card').attr('class', 'card none undefined i0').attr('src', gui.images + 'cover.jpg');

        $('#phases').css('display', 'block');
        console.log('Starting Duel!');
    };
    gui.StartDuel = function (player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra) { // Interface signalled the game has started

        gui.DOMWriter(OneDeck, 'DECK', 0);
        gui.DOMWriter(TwoDeck, 'DECK', 1);
        gui.DOMWriter(OneExtra, 'EXTRA', 0);
        gui.DOMWriter(TwoExtra, 'EXTRA', 1);
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

    gui.DOMWriter = function (size, movelocation, player) {
        var field = $('.fieldimage'),
            i;
        $(field).detach();
        for (i = 0; i < size; i++) {
            $(field).append('<img class="card p' + player + ' ' + movelocation + ' i' + i + ' o" src="' + gui.images + 'cover.jpg" data-position="FaceDown" />');
        }
        $(field).appendTo('.fieldcontainer');
    };
    gui.updatelifepoints = function (player, multiplier, lp) {
        var lifepoints = +$('.p' + player + 'lp').eq(0).val() + (lp * multiplier);
        if (lifepoints < 0) {
            lifepoints = 0;
        }
        $('.p' + player + 'lp').val(lifepoints);
    };
    gui.UpdateCards = function (player, clocation, data) { //YGOPro is constantly sending data about game state, this function stores and records that information to allow access to a properly understood gamestate for reference. 

        var i,
            deadcard,
            deadzone,
            index;
        for (i = 0; data.length > i; i++) {
            if (data[i].Code !== 'nocard') {
                console.log('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i, data[i].Code);
                $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i).not('.overlayunit')
                    .attr('src', gui.images + data[i].Code + '.jpg')
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
    gui.UpdateCard = function (player, clocation, index, data) {
        if (data.Code !== 'nocard') {
            console.log('.card.p' + player + '.' + enums.locations[clocation] + '.i' + index);
            $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + index).attr('src', gui.images + data.Code + '.jpg')
                .attr('data-position', data.Position);
        }
    };
    gui.MoveCard = function (code, pc, pl, ps, pp, cc, cl, cs, cp) {

        console.log(code, pc, pl, ps, pp, cc, cl, cs, cp);
        var query,
            newcard;
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
                    $(this).attr('data-overlayunit', (i));
                });


            }
        }
    };
    gui.ChangeCardPosition = function (code, cc, cl, cs, cp) {
        animateState(cc, cl, cs, cc, cl, cs, cp);
        //var query = '.card.p' + cc + '.' + enums.locations[cl] + '.i' + cs;
        //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
    };

    gui.DrawCard = function (player, numberOfCards, cards) {
        var currenthand = $('.p' + player + '.HAND').length,
            topcard,
            query,
            i;

        for (i = 0; i < numberOfCards; i++) {
            topcard = $('.p' + player + '.DECK').length - 1;
            animateState(player, 1, topcard, player, 2, currenthand + i, 'FaceUp');
            //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition){
            query = '.p' + player + '.HAND' + '.i' + (currenthand + i);
            console.log(query + ' changed to ' + gui.images + cards[i] + '.jpg');
            $(query).attr('src', gui.images + cards[i] + '.jpg');

        }

        layouthand(player);
        //console.log("p" + player + " drew " + numberOfCards + " card(s)");
    };

    gui.NewPhase = function (phase) {
        console.log('it is now' + enums.phase[phase]);
        $('#phases .phase').text(enums.phase[phase]);


    };
    var turn = 0,
        turnplayer = 0;
    gui.NewTurn = function (turnx) {
        turnx = +turnx;
        console.log("It is now p" + turnx + "'s turn.");
        $('#phases .player').text('Player ' + (1 + turnx) + ':');
        turnplayer = turnx;
    };



    gui.OnWin = function (result) {
        console.log("Function OnWin: " + result);
    };

    gui.SelectCards = function (cards, min, max, cancelable) {
        var debugObject = {
            cards: cards,
            min: min,
            max: max,
            cancelable: cancelable
        };
        console.log('Function SelectCards:' + JSON.stringify(debugObject));
    };

    gui.DuelEnd = function () {
        console.log('Duel has ended.');
    };

    gui.SelectYn = function (description) {
        console.log("Function SelectYn :" + description);
    };

    gui.IdleCommands = function (main) {
        var update = JSON.parse(main);
        console.log('IdleCommands', update);
    };

    gui.SelectPosition = function (positions) {
        var debugObject = JSON.Strigify(positions);
        console.log(debugObject);
    };

    gui.SelectOption = function (options) {
        var debugObject = JSON.Strigify(options);
        console.log(debugObject);
    };

    gui.AnnounceCard = function () {
        //Select a card from all known cards.
        console.log('AnnounceCard');
    };

    gui.OnChaining = function (cards, desc, forced) {
        var cardIDs = JSON.parse(cards),
            i;

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

    gui.ShuffleDeck = function (player) {
        console.log(player);
        shuffle(player, 'DECK');
    };

}());