/*global $, console, cardmargin, layouthand, enums, chat*/
/*jslint plusplus:true, bitwise:true */

var gui = {};

var internalDB = [];
$.getJSON('http://ygopro.us/manifest/database_0-en-OCGTCG.json', function (data) {
    'use strict';
    var internalDB = data;
});

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
        if (e.which === 13) {
            chat($(e.currentTarget).val());
            $(e.currentTarget).val('');
            $('.ingamechatbox, #sidechat').scrollTop($('.ingamechatbox').prop("scrollHeight"));
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
            window.duel.player = {
                0: {
                    name: '',
                    ready: false
                },
                1: {
                    name: '',
                    ready: false
                },
                2: {
                    name: '',
                    ready: false
                },
                3: {
                    name: '',
                    ready: false
                }
            };
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
            //$('.cardDescription').html(makeDescription(id));
        });
    };


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
}());


function Card(movelocation, player, index, unique) {
    return {
        type: 'card',
        player: player,
        location: movelocation,
        id: 0,
        index: index,
        position: 'FaceDown',
        overlayindex: 0,
        uid: unique
    };
}


//various query filters for doing various things.
function filterIsCard(array) {
    return array.filter(function (item) {
        return item.type === 'card';
    });
}

function filterPlayer(array, player) {
    return array.filter(function (item) {
        return item.player === player;
    });
}

function filterlocation(array, location) {
    return array.filter(function (item) {
        return item.location === location;
    });
}

function filterIndex(array, index) {
    return array.filter(function (item) {
        return item.index === index;
    });
}

function filterOverlyIndex(array, overlayindex) {
    return array.filter(function (item) {
        return item.overlayindex === overlayindex;
    });
}

//initiation of a single independent state intance... I guess this is a class of sorts.
function initGameState() {
    //the field is represented as a bunch of cards with metadata in an array, <div>card/card/card/card</div>
    //numberOfCards is used like a memory address. It must be increased by 1 when creating a new card.
    var stack = [],
        numberOfCards = 0;

    //exposed method to initialize the field;
    function startDuel(player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra) {
        var i;
        for (i = 0; OneExtra > i; i++) {
            stack.push(new Card('EXTRA', 0, i, numberOfCards));
            numberOfCards++;
        }
        for (i = 0; TwoExtra > i; i++) {
            stack.push(new Card('EXTRA', 1, i, numberOfCards));
            numberOfCards++;
        }
        for (i = 0; OneDeck > i; i++) {
            stack.push(new Card('DECK', 0, i, numberOfCards));
            numberOfCards++;
        }
        for (i = 0; TwoDeck > i; i++) {
            stack.push(new Card('DECK', 1, i, numberOfCards));
            numberOfCards++;
        }

    }

    //the way the stack of cards is setup it requires a pointer to edit it.
    function uidLookup(uid) {
        var i;
        for (i = 0; stack.length > i; i++) {
            if (stack[i].uid === uid) {
                return i;
            }
        }
    }

    //returns info on a card.
    function queryCard(player, clocation, index, overlayindex) {
        return filterOverlyIndex(filterIndex(filterlocation(filterPlayer(stack, player), clocation), index), overlayindex);
    }

    /*The YGOPro messages have a design flaw in them where they dont tell the number of cards
    that you have to itterate over in order to get a proper message, this function resolves that problem,
    this flaw has caused me all types of grief.*/
    function cardCollections(player) {
        return {
            DECK: filterlocation(filterPlayer(stack, player), 'DECK').length,
            HAND: filterlocation(filterPlayer(stack, player), 'HAND').length,
            EXTRA: filterOverlyIndex(filterlocation(filterPlayer(stack, player), 'EXTA')).length,
            GRAVE: filterlocation(filterPlayer(stack, player), 'GRAVE').length,
            REMOVED: filterlocation(filterPlayer(stack, player), 'REMOVED').length,
            SPELLZONE: 8,
            MONSTERZONE: 5
        };
    }

    function reIndex(player, location) {
        //again YGOPro doesnt manage data properly... and doesnt send the index update for the movement command.
        //that or Im somehow missing it in moveCard().
        var zone = filterlocation(filterPlayer(stack, player), location),
            pointer,
            i;
        for (i = 0; zone.length > i; i++) {
            pointer = uidLookup(zone[i].uid);
            stack[pointer].index = i;
        }
    }
    //finds a card, then moves it elsewhere.
    function setState(player, clocation, index, moveplayer, movelocation, moveindex, moveposition, overlayindex, isBecomingCard) {
        console.log('set:', player, clocation, index, moveplayer, movelocation, moveindex, moveposition, overlayindex, isBecomingCard);
        var target = queryCard(player, clocation, index, 0),
            pointer = uidLookup(target[0].uid),
            zone,
            i;

        stack[pointer].player = moveplayer;
        stack[pointer].location = movelocation;
        stack[pointer].index = moveindex;
        stack[pointer].position = moveposition;
        stack[pointer].overlayindex = overlayindex;
        reIndex(player, 'GRAVE');
        reIndex(player, 'HAND');
        reIndex(player, 'EXTRA');




    }

    //update state of A GROUP OF CARDS based on info from YGOPro
    function updateData(player, clocation, arrayOfCards) {
        var target,
            pointer,
            i;

        for (i = 0; arrayOfCards.length > i; i++) {
            if (arrayOfCards[i].Code !== 'nocard') {
                target = queryCard(player, enums.locations[clocation], i, 0);
                pointer = uidLookup(target[0].uid);
                stack[pointer].position = arrayOfCards[i].Position;
                stack[pointer].id = arrayOfCards[i].Code;
            }
        }
        //fs.writeFileSync('output.json', JSON.stringify(stack, null, 4));
    }

    //update state of A SINGLE CARD based on info from YGOPro
    function updateCard(player, clocation, index, card) {
        var target,
            pointer;

        target = queryCard(player, enums.locations[clocation], index, 0);
        pointer = uidLookup(target[0].uid);
        stack[pointer].position = card.Position;
        stack[pointer].id = card.Code;

    }

    //Flip summon, change to attack mode, change to defense mode, and similar movements.
    function changeCardPosition(code, cc, cl, cs, cp) {
        var target = queryCard(cc, cl, cs, 0),
            pointer = uidLookup(target[0].uid);

        stack[pointer].id = code;
        setState(cc, cl, cs, cc, cl, cs, cp, 0, false);
    }

    function moveCard(code, pc, pl, ps, pp, cc, cl, cs, cp) {
        //this is ugly, needs labling.
        var target,
            pointer,
            zone,
            i;
        if (pl === 0) {
            stack.push(new Card(enums.locations[cl], cc, cs, numberOfCards));
            numberOfCards++;
            return;
        } else if (cl === 0) {
            target = queryCard(pc, enums.locations[pl], ps, 0);
            pointer = uidLookup(target[0].uid);
            delete stack[pointer];
            numberOfCards--;
            return;
        } else {
            if (!(pl & 0x80) && !(cl & 0x80)) { //duelclient line 1885
                setState(pc, enums.locations[pl], ps, cc, enums.locations[cl], cs, cp, 0, false);
            } else if (!(pl & 0x80)) {
                //targeting a card to become a xyz unit....
                setState(pc, enums.locations[pl], ps, cc, enums.locations[(cl & 0x7f)], cs, cp, 0, true);


            } else if (!(cl & 0x80)) {
                //turning an xyz unit into a normal card....
                setState(pc, enums.locations[(pl & 0x7f)], ps, cc, enums.locations[cl], cs, cp, pp);
            } else {
                //move one xyz unit to become the xyz unit of something else....');
                //                $('.overlayunit.p' + cc + '.i' + cs).each(function (i) {
                //                    $(this).attr('data-overlayunit', (i));
                //                });
                setState(pc, enums.locations[(pl & 0x7f)], ps, cc, enums.locations[(cl & 0x7f)], cs, cp, pp, true);
                zone = filterIndex(filterlocation(filterPlayer(stack, cc), enums.locations[(cl & 0x7f)]), cs);
                for (i = 1; zone.length > i; i++) {
                    pointer = uidLookup(zone[i].uid);
                    stack[pointer].overlayindex = i;
                }

            }
        }
    }

    function drawCard(player, numberOfCards, cards) {
        var currenthand = filterlocation(filterPlayer(stack, player), 'HAND').length,
            topcard,
            target,
            i,
            pointer;

        for (i = 0; i < numberOfCards; i++) {
            topcard = filterlocation(filterPlayer(stack, player), 'DECK').length - 1;
            setState(player, 'DECK', topcard, player, 'HAND', currenthand + i, 'FaceUp', 0, false);
            target = queryCard(player, 'HAND', (currenthand + i), 0);
            pointer = uidLookup(target[0].uid);
            stack[pointer].id = cards[i].Code;
        }

    }

    return {
        startDuel: startDuel,
        updateData: updateData,
        updateCard: updateCard,
        cardCollections: cardCollections,
        changeCardPosition: changeCardPosition,
        moveCard: moveCard,
        drawCard: drawCard
    };
}

function resizeSystem(p) {
    // p = element to make resizable
    'use strict';





    function initDrag(e) {
        var startX = e.clientX,
            startY = e.clientY,
            startWidth = parseInt(document.defaultView.getComputedStyle(p).width, 10),
            startHeight = parseInt(document.defaultView.getComputedStyle(p).height, 10);

        function doDrag(e) {
            p.style.width = (startWidth + e.clientX - startX) + 'px';
            p.style.height = (startHeight + e.clientY - startY) + 'px';
        }

        function stopDrag(e) {
            document.documentElement.removeEventListener('mousemove', doDrag, false);
            document.documentElement.removeEventListener('mouseup', stopDrag, false);
        }




        document.documentElement.addEventListener('mousemove', doDrag, false);
        document.documentElement.addEventListener('mouseup', stopDrag, false);
    }

    p.addEventListener('click', function init() {
        p.removeEventListener('click', init, false);
        p.className = p.className + ' resizable';
        var resizer = document.createElement('div');
        resizer.className = 'resizer';
        p.appendChild(resizer);
        resizer.addEventListener('mousedown', initDrag, false);
    }, false);

    var startX, startY, startWidth, startHeight;
}

function guiCard(dataBinding) {
    'use strict';

    var field = $('#automationduelfield'),
        element;


    $(field).append('<img id="uid' + dataBinding.uid + '" class="card p' + dataBinding.player + ' ' + dataBinding.movelocation + ' i' + dataBinding.index + ' o" src="img/textures/cover.jpg" data-position="FaceDown" />');
    element = $('#uid' + dataBinding.uid);

    dataBinding.observe(dataBinding, function (changes) {
        //// [{name: 'ofproperitychaned', object: {complete new object}, type: 'of edit', oldValue: 'previousvalueofproperity'}]
        var ref = changes[0].object,
            fieldings;
        if (!ref.parent) {
            fieldings = 'card p' + ref.player + ' ' + ref.movelocation + ' i' + ref.index + ' o';
            element.attr({
                'class': fieldings,
                'data-position': ref.position,
                'src': (ref.id) ? 'ygopro/pics/' + ref.id + '.jpg' : 'img/textures/cover.jpg'
            });
        } else {
            ref = changes[0].object;
            fieldings = 'card p' + ref.player + ' ' + ref.movelocation + ' i' + ref.index + ' o';
            element.attr({
                'class': fieldings,
                'data-position': ref.position,
                'src': (ref.id) ? 'ygopro/pics/' + ref.id + '.jpg' : 'img/textures/cover.jpg'
            });
        }


    });
}