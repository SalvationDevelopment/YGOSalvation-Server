/*global $, console, cardmargin, layouthand, enums, animateState, animateRemoveChaining, shuffle, animateChaining*/
/*jslint plusplus:true, bitwise:true */

var gui = {};


function modalMsg(message, x) {
    'use strict';
    clearTimeout(window.modalTimeout);
    $('#modal').css({
        'display': 'flex',
        'opacity': '1'
    }).html(message);
    window.modalTimeout = setTimeout(function () {
        $('#modal').css({

            'opacity': '0'
        });
        window.modalTimeout = setTimeout(function () {
            $('#modal').css({
                'display': 'none',

            });
        }, 3000)
    }, 3000)
}

function getLocation(item) {
    'use strict';
    if ($(item).hasClass('DECK')) {
        return 0x01; //Number for deck
    }
    if ($(item).hasClass('HAND')) {
        return 0x02; //Number for hand
    }
    if ($(item).hasClass('MONSTERZONE')) {
        return 0x04; //Number for extra
    }
    if ($(item).hasClass('SPELLZONE')) {
        return 0x08; //Number for extra
    }
    if ($(item).hasClass('EXTRA')) {
        return 0x10; //Number for extra
    }
    if ($(item).hasClass('GRAVE')) {
        return 0x20; //Number for grave
    }
    if ($(item).hasClass('REMOVED')) {
        return 0x40; //Number for removed
    }
    if ($(item).hasClass('OVERLAY')) {
        return 0x80; //Number for grave
    }
}

(function wireUpUI() {
    'use strict';
    // these are wiring functions or rather controllers for the UI.
    // they are bounded to a higher level than the objects they 
    // interact with because the objects get dynamically created.

    $('#lobbychatinput, #sidechatinput').keypress(function (e) {
        if (e.which == 13) {
            chat($(e.currentTarget).val());
            $(e.currentTarget).val('');
            $('.ingamechatbox, #sidechat').scrollTop($('.ingamechatbox').prop("scrollHeight"))
            return false;
        }
    });

    $('body').on('click', '.okButton', function fireOKCallbackTrue() {
        window[gui.OKCallback](true);
        $('#alertUI').css('display', 'none');
    });

    $('body').on('click', '.cancelButton', function fireOKCallbackFalse() {
        window[gui.OKCallback](false);
        $('#alertUI').css('display', 'none');
    });
    $('div').on('hover', '.card', function displayCardOptions(cardElement) {
        // user is hovering over a card, display the information about it.
    });

    $('body').on('click', '.card', function displayCardOptions(cardElement) {
        // a card was click, you need to display a prompt system over top of it.
        // see if the card was allowed to be clicked in the first place. if not just return out.
        // get the x/y  coordinates of the card.
        // move the ui element near the card
        // populate it with options based on the information in it, you are gonna need the card ID for this.
        // display the card
        // window.actionables =  {00000000 : ['summon', 'set']};
        var x = cardElement.pageX,
            y = cardElement.pageY,
            id = $(this).attr('src').split('/')[2].slice(0, -4),
            location = getLocation(cardElement),
            actions;

        $('#actions').css({
            'top': (y - 33),
            'left': (x - 33),
            'display': 'block'
        });

        $('#actions button').css('display', 'none');
        console.log(id);
        if (window.actionables[id]) {
            window.actionsOpen = true;
            for (actions = 0; window.actionables[id].length > actions; actions++) {
                $('#actions #' + window.actionables[id][actions].list).attr({
                    'data-cardid': id,
                    'data-index': window.actionables[id][actions].index
                }).css('display', 'block');
            }
        }
    });

    $('body').on('click', '.setViaAutomation', function setViaAutomation(id) {
        //remove the prompt
        //reply via the automation-ws you want to set card id.
    });
    $('body').on('click', '.activateViaAutomation', function activateViaAutomation(id) {
        //remove the prompt
        //reply via the automation-ws you want to activate card id.
    });
    $('body').on('click', '.summonViaAutomation', function summonViaAutomation(id) {
        //remove the prompt
        //reply via the automation-ws you want to summon card id.
    });
    $('body').on('click', '.specialSummonViaAutomation', function specialSummonViaAutomation(id) {
        //remove the prompt
        //reply via the automation-ws you want to special summon card id.
    });
    $('body').on('click', '.manualReveal', function manualReveal(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToBottom', function manualToBottom(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToTop', function manualToTop(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToSetTrapSpell', function manualToSetTrapSpell(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualBanish', function manualBanish(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualBanishFaceDown', function manualBanishFaceDown(id) {
        //remove the prompt

    });
    $('body').on('click', '.moveToHand', function moveToHand(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToST', function manualToST(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualSpecialSummonDef', function manualSpecialSummonDef(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualSpecialSummonAtt', function manualSpecialSummonAtt(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualSetMonster', function manualSetMonster(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualNormalSummon', function manualNormalSummon(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualActivateFieldSpell', function manualActivateFieldSpell(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualViewExtra', function manualViewExtra(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToExtaFaceDown', function manualToExtaFaceDown(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualRevealExta', function manualRevealExta(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToExtraFaceUp', function manualToExtraFaceUp(id) {
        //remove the prompt
        // make sure its a token

    });
    $('body').on('click', '.moveChangeControl', function moveChangeControl(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualOverlay', function manualOverlay(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualDetach', function manualOverlay(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualFlipDown', function manualFlipDown(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualFlipUp', function manualFlipUp(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToAtk', function manualToAtk(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToDef', function manualToDef(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualRemove', function manualRemove(id) {
        //remove the prompt
        // make sure its a token

    });
    $('body').on('click', '.manualToPZoneR', function manualToPZoneR(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToPZoneL', function manualToPZoneL(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToGrave', function manualToGrave(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToOpponentsHand', function manualToOpponentsHand(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToOpponentsGrave', function manualToOpponentsGrave(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToOpponentsExtra', function manualToOpponentsExtra(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToDeck', function manualToDeck(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualToOpponentsDeck', function manualToOpponentsDeck(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualMill', function manualMill(id) {
        //remove the prompt

    });
    $('body').on('click', '.manualShuffle', function manualShuffle(player, deck) {
        //remove the prompt

    });
    $('body').on('click', '.manualDraw', function manualDraw(id) {
        //remove the prompt
    });
}());


(function () {
    'use strict';

    gui.displayWaiting = function () {
        $('#waiting').css('display', 'block');
    };
    gui.hideWaiting = function () {
        $('#waiting').css('display', 'none');
        $('#actions button').css('display', 'none');
    };
    gui.displayRPSSelector = function () {
        $('#rpschoice').css('display', 'block');
    };
    gui.hideRPSSelector = function () {
        $('#rpschoice').css('display', 'none');
    };
    gui.displaySelectWhoGoesFirst = function () {
        $('#selectwhogoesfirst').css('display', 'block');
    };
    gui.hideSelectWhoGoesFirst = function () {
        $('#selectwhogoesfirst').css('display', 'none');
    };
    gui.displayRPSResult = function (p1Response, p2Response) {
        $('#rpsunit1').css('background-image', 'url(../ygopro/textures/f' + p1Response + '.jpg)').addClass('active');
        $('#rpsunit2').css('background-image', 'url(../ygopro/textures/f' + p2Response + '.jpg)').addClass('active');
        setTimeout(function () {
            $('#rpsunit1').removeClass('active');
            $('#rpsunit2').removeClass('active');
            gui.doingAnimation = false;
        }, 2000); //needs tuning
    };
    gui.updateloby = function () {
        if (window.duel.player === undefined) {
            return;
        }
        $('#player1lobbyslot').val(window.duel.player[0].name);
        $('#player2lobbyslot').val(window.duel.player[1].name);
        $('#player3lobbyslot').val(window.duel.player[2].name);
        $('#player4lobbyslot').val(window.duel.player[3].name);
        $('#slot1 .lockindicator').attr('data-state', window.duel.player[0].ready);
        $('#slot2 .lockindicator').attr('data-state', window.duel.player[1].ready);
        $('#slot3 .lockindicator').attr('data-state', window.duel.player[2].ready);
        $('#slot4 .lockindicator').attr('data-state', window.duel.player[3].ready);
        $('#lobbytimelimit').text(window.duel.timelimit + ' seconds');
        $('#lobbyflist').text(window.duel.banlist);
        $('#lobbylp').text(window.duel.startLP);
        $('#lobbycdpt').text(window.duel.drawcount);
        $('#lobbyallowed').text($('#creategamecardpool option').eq(window.duel.rule).text());
        $('#lobbygamemode').text($('#creategameduelmode option').eq(window.duel.mode).text());
        if (window.duel.ishost) {
            $('#lobbystart').css('display', 'inline-block');
        } else {
            $('#lobbystart').css('display', 'none');
        }

        if ($('#creategameduelmode option').eq(window.duel.mode).text() === 'Tag') {
            $('.slot').eq(2).css('display', 'block');
            $('.slot').eq(3).css('display', 'block');
        } else {
            $('.slot').eq(2).css('display', 'none');
            $('.slot').eq(3).css('display', 'none');
        }

    };
    gui.gotoLobby = function () {
        window.singlesitenav('lobby');
        $('.ingamechatbox').html('');
    };
    gui.UpdateTime = function (player, time) {
        $('.p' + player + 'time').val(time);
    };

    gui.LoadField = function () {
        console.log('GAME INITIATE!');
        $('#duelzone').css('display', 'block').get(0).scrollIntoView();
        $('img.card').attr('class', 'card none undefined i0').attr('src', 'img/textures/cover.jpg');

        $('#phases').css('display', 'block');
        console.log('Starting Duel!');
    };
    gui.StartDuel = function (player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra) { // Interface signalled the game has started
        $('#automationduelfield').html('');
        $('#p0time, #p1time').attr('max', window.duel.timelimit);
        $('#p0time, #p1time').attr('max', window.duel.timelimit);
        $('#p0time, #p1time').attr('value', window.duel.timelimit);
        $('#p0time, #p1time').attr('value', window.duel.timelimit);
        $('.p0name').html(window.duel.player[0].name);
        $('.p1name').html(window.duel.player[1].name);
        $('#p0avatar').attr('src', avatarMap[window.duel.player[0].name]);
        $('#p1avatar').attr('src', avatarMap[window.duel.player[1].name]);

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
        $('.card').on('mouseenter', function () {
            var id = $(this).attr('src').split('/')[2].slice(0, -4);
            $('.imgContainer').attr('src', $(this).attr('src'));
            $('.cardDescription').html(makeDescription(id));
        });
    };

    gui.DOMWriter = function (size, movelocation, player) {
        var field = $('#automationduelfield'),
            i;
        $(field).detach();
        for (i = 0; i < size; i++) {
            $(field).append('<img class="card p' + player + ' ' + movelocation + ' i' + i + ' o" src="img/textures/cover.jpg" data-position="FaceDown" />');
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
    gui.UpdateData = function (player, clocation, data) { //YGOPro is constantly sending data about game state, this function stores and records that information to allow access to a properly understood gamestate for reference. 

        var i,
            deadcard,
            deadzone,
            index;
        for (i = 0; data.length > i; i++) {
            //console.log('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i, data[i].Code);
            if (data[i].Code !== 'nocard') {

                $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i).not('.overlayunit')
                    .attr('src', 'ygopro/pics/' + data[i].Code + '.jpg')
                    .attr('data-position', data[i].Position);

            }
            //            else {
            //                deadcard = $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i).length;
            //                deadzone = (enums.locations[clocation] + '.i' + i === 'SPELLZONE.i6' ||
            //                    enums.locations[clocation] + '.i' + i === 'SPELLZONE.i7'
            //                ) ? 'EXTRA' : 'GRAVE';
            //                if (deadcard) {
            //                    index = $('.p' + player + '.' + deadzone).length - 1;
            //                    gui.animateState(player, clocation, i, player, 0x10, index, 0x01);
            //                    //gui.animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
            //                }
            //            }
        }
    };
    gui.UpdateCard = function (player, clocation, index, data) {
        console.log(data);
        if (data.Code !== 'nocard') {
            console.log('.card.p' + player + '.' + enums.locations[clocation] + '.i' + index);
            $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + index).attr('src', 'ygopro/pics/' + data.Code + '.jpg')
                .attr('data-position', enums.Positions[data.Position]);
        }
    };
    gui.MoveCard = function (code, pc, pl, ps, pp, cc, cl, cs, cp) {

        console.log(code, pc, pl, ps, pp, cc, cl, cs, cp);
        var query,
            newcard;
        if (pl === 0) {
            newcard = '<img class="card p' + cc + ' ' + enums.locations[cl] + ' i' + cs + '" data-position="">';
            $('#duelzone .fieldimage').append(newcard);
            return;
        } else if (cl === 0) {
            query = '.card.p' + pc + '.' + enums.locations[pl] + '.i' + ps;
            $(query).detach();
            return;
        } else {

            if (!(pl & 0x80) && !(cl & 0x80)) { //duelclient line 1885
                console.log(pl);
                gui.animateState(pc, pl, ps, cc, cl, cs, cp);
                //gui.animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
            } else if (!(pl & 0x80)) {
                console.log('targeting a card to become a xyz unit....');
                $('.overlayunit.p' + cc + '.i' + cs).each(function (i) {
                    $(this).attr('data-overlayunit', (i));
                });
                gui.animateState(pc, pl, ps, cc, (cl & 0x7f), cs, cp, undefined, true);


            } else if (!(cl & 0x80)) {
                console.log('turning an xyz unit into a normal card....');
                gui.animateState(pc, (pl & 0x7f), ps, cc, cl, cs, cp, pp);
                $('.overlayunit.p' + pc + '.i' + ps).each(function (i) {
                    $(this).attr('data-overlayunit', (i));
                });
                console.log('turning something into a xyz unit....');
            } else {
                console.log('move one xyz unit to become the xyz unit of something else....');
                $('.overlayunit.p' + cc + '.i' + cs).each(function (i) {
                    $(this).attr('data-overlayunit', (i));
                });
                gui.animateState(pc, (pl & 0x7f), ps, cc, (cl & 0x7f), cs, cp, pp, true);
                $('.overlayunit.p' + pc + '.OVERLAY.i' + ps).each(function (i) {
                    $(this).attr('data-overlayunit', (i));
                });


            }
        }
    };
    gui.ChangeCardPosition = function (code, cc, cl, cs, cp) {
        gui.animateState(cc, cl, cs, cc, cl, cs, cp);
        //var query = '.card.p' + cc + '.' + enums.locations[cl] + '.i' + cs;
        //gui.animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
    };

    gui.DrawCard = function (player, numberOfCards, cards) {
        var currenthand = $('.p' + player + '.HAND').length,
            topcard,
            query,
            i,
            pic;

        for (i = 0; i < numberOfCards; i++) {
            pic = (cards[i].code === 0) ? 'img/textures/cover' : 'ygopro/' + cards[i].code;
            topcard = $('.card.p' + player + '.DECK').length - 1;
            gui.animateState(player, 1, topcard, player, 2, currenthand + i, 'FaceUp');
            //gui.animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition){
            query = '.card.p' + player + '.HAND.i' + (currenthand + i);
            console.log(query + ' changed to ' + pic + '.jpg');
            $(query).attr('src', pic + '.jpg');
            console.log(cards[i]);

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
    gui.SwapGraveDeck = function () {
        $('.DECK').addClass('alpha').removeClass('DECK');
        $('.GRAVE').addClass('beta').removeClass('GRAVE');
        $('.alpha').addClass('GRAVE').removeClass('alpha');
        $('.beta').addClass('DECK').removeClass('beta');
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

    function cardmargin(player, deck) {
        var size = $('.card.' + player + '.' + deck).length;
        $('.card.p' + player + '.' + deck).each(function (i) {

            $(this).css('z-index', i).attr('style', '')
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
    gui.shuffle = shuffle;

    function complete(player, deck) {
        var started = Date.now(),

            // make it loop every 100 milliseconds

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




    gui.animateState = function animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition, overlayindex, isBecomingCard) {

        var isCard = (overlayindex === undefined) ? '.card' : '.card.overlayunit';
        isBecomingCard = (isBecomingCard) ? 'card overlayunit' : 'card';
        overlayindex = (overlayindex === undefined) ? '' : 0;
        var searchindex = (index === 'ignore') ? '' : ".i" + index;
        var searchplayer = (player === 'ignore') ? '' : ".p" + player;
        var origin = isCard + searchplayer + "." + enums.locations[clocation] + searchindex;
        var destination = isBecomingCard + " p" + moveplayer + " " + enums.locations[movelocation] + " i" + movezone;

        var card = $(origin).not('.cardselectionzone')
            //.each(function(i){
            /*$(this)*/
            .attr({
                'style': '',
                'data-position': enums.Positions[moveposition],
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
    };

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
}());

function resizeSystem(p) {
    // p = element to make resizable

    p.addEventListener('click', function init() {
        p.removeEventListener('click', init, false);
        p.className = p.className + ' resizable';
        var resizer = document.createElement('div');
        resizer.className = 'resizer';
        p.appendChild(resizer);
        resizer.addEventListener('mousedown', initDrag, false);
    }, false);

    var startX, startY, startWidth, startHeight;

    function initDrag(e) {
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(p).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(p).height, 10);
        document.documentElement.addEventListener('mousemove', doDrag, false);
        document.documentElement.addEventListener('mouseup', stopDrag, false);
    }

    function doDrag(e) {
        p.style.width = (startWidth + e.clientX - startX) + 'px';
        p.style.height = (startHeight + e.clientY - startY) + 'px';
    }

    function stopDrag(e) {
        document.documentElement.removeEventListener('mousemove', doDrag, false);
        document.documentElement.removeEventListener('mouseup', stopDrag, false);
    }
}