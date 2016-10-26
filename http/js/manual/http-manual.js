/*jslint browser:true, plusplus:true, bitwise:true*/
/*global WebSocket, $, singlesitenav, console, enums, alert*/

var manualServer,
    broadcast,
    activegame,
    duelstarted = false,
    orientSlot = 0,
    manualActionReference;

function updateloby(state) {
    'use strict';
    $('#player1lobbyslot').val(state.player[0].name);
    $('#player2lobbyslot').val(state.player[1].name);
    //    $('#player3lobbyslot').val(state.player[2].name);
    //    $('#player4lobbyslot').val(state.player[3].name);
    $('#slot1 .lockindicator').attr('data-state', state.player[0].ready);
    $('#slot2 .lockindicator').attr('data-state', state.player[1].ready);
    //    $('#slot3 .lockindicator').attr('data-state', state.player[2].ready);
    //    $('#slot4 .lockindicator').attr('data-state', state.player[3].ready);
    $('#lobbytimelimit').text(state.timelimit + ' seconds');
    $('#lobbyflist').text(state.banlist);
    $('#lobbylp').text(state.startLP);
    $('#lobbycdpt').text(state.drawcount);
    $('#lobbyallowed').text($('#creategamecardpool option').eq(state.rule).text());
    $('#lobbygamemode').text($('#creategameduelmode option').eq(state.mode).text());
    if (state.ishost) {
        $('#lobbystart').css('display', 'inline-block');
    } else {
        $('#lobbystart').css('display', 'none');
    }

    if ($('#creategameduelmode option').eq(state.mode).text() === 'Tag') {
        $('.slot').eq(2).css('display', 'block');
        $('.slot').eq(3).css('display', 'block');
    } else {
        $('.slot').eq(2).css('display', 'none');
        $('.slot').eq(3).css('display', 'none');
    }

}

function makeGames() {
    'use strict';
    $('#manualgamelistitems').html('');
    Object.keys(broadcast).forEach(function (gameName) {
        var game = broadcast[gameName],
            player1 = game.player[0].name || '___',
            player2 = game.player[1].name || '___',
            players = player1 + ' vs ' + player2,
            string = '<div class="manualgame" onclick="manualJoin(\'' + gameName + '\')">' + players + '</div>';
        $('#manualgamelistitems').append(string);
    });
}

function getdeck() {
    'use strict';
    var selection,
        processedDeck;

    function makeDeck(ydkFileContents) {
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

    selection = $('#lobbycurrentdeck .currentdeck option:selected').eq(0).attr('data-file');
    console.log(selection);
    processedDeck = makeDeck(selection);
    return processedDeck;
}

function loadField() {
    'use strict';
    $('#duelzone').css('display', 'block');
    console.log('Starting Duel!');
}

var manualDuel;

function linkStack(field) {
    'use strict';
    console.log('field:', field);

    function linkgui(zone) {
        zone.forEach(function (card) {
            var idIndex = manualDuel.uidLookup(card.uid),
                stackunit = manualDuel.stack[idIndex];
            Object.keys(stackunit).forEach(function (prop) {
                if (card[prop] !== undefined) {
                    stackunit[prop] = card[prop];
                }
            });
        });

    }

    Object.keys(field[0]).forEach(function (zone) {
        linkgui(field[0][zone]);
    });
    Object.keys(field[1]).forEach(function (zone) {
        linkgui(field[1][zone]);
    });
}


function Card(movelocation, player, index, unique) {
    'use strict';
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

function layouthand(player) {
    'use strict';
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

function guiCard(dataBinding) {
    'use strict';

    var field = $('#automationduelfield'),
        element,
        player;

    if (orientSlot) {
        player = (dataBinding.player === 1) ? 0 : 1;
    } else {
        player = dataBinding.player;
    }
    $(field).append('<img onclick="guicardclick(\'#uid' + dataBinding.uid + '\',' + dataBinding.uid + ')" id="uid' + dataBinding.uid + '" class="card p' + player + ' ' + dataBinding.location + ' i' + dataBinding.index + ' o" src="img/textures/cover.jpg" data-position="FaceDown" />');
    element = $('#uid' + dataBinding.uid);

    Object.observe(dataBinding, function (changes) {
        // [{name: 'ofproperitychaned', object: {complete new object}, type: 'of edit', oldValue: 'previousvalueofproperity'}]
        var ref = changes[0].object,
            fieldings;
        if (orientSlot) {
            player = (ref.player === 1) ? 0 : 1;
        } else {
            player = ref.player;
        }
        if (!ref.parent) {
            fieldings = 'card p' + player + ' ' + ref.location + ' i' + ref.index + ' o';
            element.attr({
                'class': fieldings,
                'data-position': ref.position,
                'src': (ref.id) ? 'ygopro/pics/' + ref.id + '.jpg' : 'img/textures/cover.jpg'
            });
        } else {
            ref = changes[0].object;
            fieldings = 'card p' + player + ' ' + ref.location + ' i' + ref.index + ' o';
            element.attr({
                'class': fieldings,
                'data-position': ref.position,
                'src': (ref.id) ? 'ygopro/pics/' + ref.id + '.jpg' : 'img/textures/cover.jpg'
            });
        }
        element.attr('style', 'z-index:' + ref.index);
        layouthand(player);


    });
}

function cardmargin(player, deck) {
    'use strict';
    var multi = (deck === 'GRAVE') ? -1 : 1;
    console.log('running cardmargin');
    $('.card.p' + player + '.' + deck).each(function (i) {
        $(this).attr('style', '').css({
            '-webkit-transform': 'translate3d(0,0,' + i + 'px)',
            'z-index': (i * multi)
        });
    });
}

function initGameState() {
    //the field is represented as a bunch of cards with metadata in an array, <div>card/card/card/card</div>
    //numberOfCards is used like a memory address. It must be increased by 1 when creating a new card.
    'use strict';
    var stack = [],
        numberOfCards = 0,
        playerLP = [];


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
    //exposed method to initialize the field;
    function startDuel(OneDeck, TwoDeck, OneExtra, TwoExtra) {
        var i;

        $('#automationduelfield').html();
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
        for (i = 0; numberOfCards > i; i++) {
            guiCard(stack[i]);
        }
        cardmargin('0', 'GRAVE');
        cardmargin('0', 'HAND');
        cardmargin('0', 'EXTRA');
        cardmargin('0', 'DECK');
        cardmargin('1', 'DECK');
        cardmargin('1', 'GRAVE');
        cardmargin('1', 'HAND');
        cardmargin('1', 'EXTRA');
        console.log('stack', stack, OneDeck, TwoDeck, OneExtra, TwoExtra);
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

        cardmargin(String(player), location);
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



    return {
        startDuel: startDuel,
        updateData: updateData,
        updateCard: updateCard,
        cardCollections: cardCollections,
        changeCardPosition: changeCardPosition,
        uidLookup: uidLookup,
        stack: stack
    };
}

function manualgamestart(message) {
    'use strict';
    var l1 = message.info.lifepoints[0],
        l2 = message.info.lifepoints[1],
        main1 = (Array.isArray(message.field[0].DECK)) ? message.field[0].DECK.length : message.field[0].DECK,
        main2 = (Array.isArray(message.field[1].DECK)) ? message.field[1].DECK.length : message.field[1].DECK,
        extra1 = (Array.isArray(message.field[0].EXTRA)) ? message.field[0].EXTRA.length : message.field[0].EXTRA,
        extra2 = (Array.isArray(message.field[1].EXTRA)) ? message.field[1].EXTRA.length : message.field[1].EXTRA;
    singlesitenav('duelscreen');
    if (!duelstarted) {
        loadField();
        duelstarted = true;
        manualDuel = initGameState();
        manualDuel.startDuel(main1, main2, extra1, extra2);
    }

}

function orient(player) {
    'use strict';
    if (orientSlot) {
        return (player === 1) ? 0 : 1;
    }
    return player;

}

function guishuffle(player, deck) {
    'use strict';
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
            spatical = Math.floor((Math.random() * 100) - 50);
        $(this).css(orientation.x, '-=' + spatical + 'px');
    });

}

function doGuiShuffle(player, deck) {
    'use strict';
    var action = setInterval(function () {
        guishuffle('p' + player, deck);
        setTimeout(function () {
            cardmargin(String() + player, deck);
        }, 50);
    }, 200);
    setTimeout(function () {
        clearInterval(action);
        cardmargin(String() + player, deck);
    }, 1000);
    guishuffle('p' + player, deck);
}

function automaticZonePicker(player, zone) {
    'use strict';
    if ($('.p' + player + '.' + zone + '.i2').length) {
        return 2;
    }
    if ($('.p' + player + '.' + zone + '.i1').length) {
        return 1;
    }
    if ($('.p' + player + '.' + zone + '.i3').length) {
        return 3;
    }
    if ($('.p' + player + '.' + zone + '.i0').length) {
        return 0;
    }
    if ($('.p' + player + '.' + zone + '.i4').length) {
        return 4;
    }
    throw new Error();

}

function reveal(cards, note) {
    'use strict';
    var html = '';
    $('#revealedclose').css('display', 'block');
    $('#revealed').css('display', 'flex');
    if (cards.length > 5) {
        html += "<div id='subreveal'>";
        $('#revealed').css('display', 'block');
    }
    cards.forEach(function (card, index) {
        html += '<img src="http://ygopro.us/ygopro/pics/' + card.id + '.jpg" />';
    });
    if (cards.length > 5) {
        html += "</div>";
    }
    $('#revealed').html(html);
    $('#subreveal').width(cards.length * 197);
}

function manualReciver(message) {
    'use strict';
    console.log(message);
    switch (message.action) {
    case "lobby":
        singlesitenav('lobby');
        activegame = message.game;
        updateloby(broadcast[activegame]);
        break;
    case "broadcast":
        broadcast = message.data;
        if (activegame) {
            updateloby(broadcast[activegame]);
        }
        makeGames();
        break;
    case "slot":
        orientSlot = message.slot;
        break;
    case "start":
        manualgamestart(message);
        //startDuel(player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra)
        break;
    case "shuffleDeck0":
        doGuiShuffle(orient(0), 'DECK');
        linkStack(message.field);
        break;
    case "shuffleDeck1":
        doGuiShuffle(orient(1), 'DECK');
        linkStack(message.field);
        break;
    case "duel":
        linkStack(message.field);
        cardmargin(0, 'GRAVE');
        cardmargin(0, 'EXTRA');
        cardmargin(0, 'DECK');
        cardmargin(1, 'GRAVE');
        cardmargin(1, 'EXTRA');
        cardmargin(1, 'DECK');
        break;
    case "reveal":
        reveal(message.reveal, message.call);
        break;
    default:
        break;
    }
}

function serverconnect() {
    'use strict';
    window.manualServer = new WebSocket("ws://" + location.hostname + ":8080");
    manualServer.onopen = function () {
        console.log('Connected to Manual');
    };
    manualServer.onmessage = function (message) {
        manualReciver(JSON.parse(message.data));
    };
    manualServer.onclose = function (message) {
        console.log('Manual Connection Died, reconnecting,...');
        setTimeout(serverconnect, 2000);
    };
}

function manualHost() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'host',
        name: localStorage.nickname
    }));
}

function manualJoin(game) {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'join',
        game: game,
        name: localStorage.nickname
    }));
}

function manualLeave(game) {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'leave',
        game: activegame
    }));
}

function manualLock() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'lock',
        deck: getdeck()
    }));
}

function manualStart() {
    'use strict';
    if (activegame) {
        if (broadcast[activegame].player[0].ready && broadcast[activegame].player[1].ready) {
            manualServer.send(JSON.stringify({
                action: 'start'
            }));
            return;
        }
    }
    alert('Duelist not ready yet. Please Lock in decks');
}

function manualChat(message) {
    'use strict';
    manualServer.send(JSON.stringify({}));
}

function manualNextPhase() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'nextPhase'
    }));
}

function manualNextTurn() {
    'use strict';
    manualServer.send({
        action: 'nextTurn'
    });
}

function manualChangeLifepoints(amount) {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'changeLifepoints',
        amount: amount
    }));
}

function manualMoveCard(movement) {
    'use strict';
    manualServer.send(JSON.stringify(movement));
}

function manualShuffleHand() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'shuffleHand'
    }));
}



function manualDraw() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'draw'
    }));
}

function manualShuffleDeck() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'shuffleDeck'
    }));
}

function manualRevealTop() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'revealTop'
    }));
}

function manualRevealBottom() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'revealBottom'
    }));
}

function manualRevealDeck() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'revealDeck'
    }));
}

function manualRevealExtra() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'revealExtra'
    }));
}

function manualMill() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'mill'
    }));
}


function manualMillRemovedCard() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'millRemovedCard'
    }));
}

function manualMillRemovedCardFaceDown() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'millRemovedCardFaceDown'
    }));
}

function manualViewDeck() {
    'use strict';
    manualServer.send(JSON.stringify({
        action: 'viewDeck'
    }));
}

function manualModeGamelistSwitch() {
    'use strict';
    $('#manualgamelistitems').css({
        'display': 'block'
    });
    $('#gamelistitems').css({
        'display': 'none'
    });
}

function mautomaticModeGamelistSwitch() {
    'use strict';
    $('#manualgamelistitems').css({
        'display': 'none'
    });
    $('#gamelistitems').css({
        'display': 'block'
    });
}
var gui = {};

var internalDB = [];
$.getJSON('http://ygopro.us/manifest/database_0-en-OCGTCG.json', function (data) {
    'use strict';
    var internalDB = data;
});

function makeMonster(card, index) {
    'use strict';
    return {
        player: card.player,
        location: 'MONSTERZONE',
        index: index,
        position: 'FaceUpAttack',
        overlayindex: 0,
        isBecomingCard: false
    };
}

function makeSpell(card, index) {
    'use strict';
    return {
        player: card.player,
        location: 'SPELLZONE',
        index: index,
        position: 'FaceUp',
        overlayindex: 0,
        isBecomingCard: false
    };
}


function setMonster(card, index) {
    'use strict';
    var end = makeMonster(card, index);
    end.position = 'FaceDownDefense';
    return end;
}

function setSpell(card, index) {
    'use strict';
    var end = makeSpell(card, index);
    end.position = 'FaceDown';
    return end;
}

function makeField(card) {
    'use strict';
    return makeSpell(card, 5);
}

function makeFieldFacedown(card) {
    'use strict';
    var end = setSpell(card, 5);
    return end;
}

function makePendulumZoneL(card) {
    'use strict';
    return makeSpell(card, 6);
}

function makePendulumZoneR(card) {
    'use strict';
    return makeSpell(card, 7);
}

function makeCardMovement(start, end) {
    'use strict';
    if (end.position === undefined) {
        end.position = start.position;
    }
    if (end.overlayindex === undefined) {
        end.overlayindex = 0;
    }
    if (end.isBecomingCard === undefined) {
        end.isBecomingCard = false;
    }
    return {
        code: start.code,
        player: start.player,
        clocation: start.location,
        index: start.index,
        moveplayer: end.player,
        movelocation: end.location,
        moveindex: end.index,
        moveposition: end.position,
        overlayindex: end.overlayindex,
        isBecomingCard: end.isBecomingCard
    };
}


function manualNormalSummon() {
    'use strict';

    var index = automaticZonePicker(manualActionReference.player, 'MONSTERZONE'),
        end = makeMonster(manualActionReference, index),
        message = makeCardMovement(manualActionReference, end);

    message.action = 'moveCard';
    manualServer.send(JSON.stringify(message));
}

function manualActivate() {
    'use strict';

    var index = automaticZonePicker(manualActionReference.player, 'SPELLZONE'),
        end = makeMonster(manualActionReference, index),
        message = makeCardMovement(manualActionReference, end);

    message.action = 'moveCard';
    manualServer.send(JSON.stringify(message));
}


var currentMousePos = {
    x: -1,
    y: -1
};



function reorientmenu() {
    'use strict';
    var height = $('#manualcontrols').height(),
        width = $('#manualcontrols').width() / 2;

    $('#manualcontrols').css({
        'top': currentMousePos.y - height,
        'left': currentMousePos.x - width,
        'display': 'block'
    });
}

function guicardclick(id, uid) {
    'use strict';

    manualActionReference = null;
    $('#manualcontrols button').css({
        'display': 'none'
    });
    var idIndex = manualDuel.uidLookup(uid),
        stackunit = manualDuel.stack[idIndex];

    console.log(stackunit);
    manualActionReference = stackunit;

    if (stackunit.player !== orientSlot) {
        return;
    }
    $('#manualcontrols').css({
        'top': currentMousePos.y,
        'left': currentMousePos.x,
        'display': 'block'
    });
    console.log({
        'top': currentMousePos.y,
        'left': currentMousePos.x,
        'display': 'block'
    });
    if (stackunit.location === 'DECK') {
        $('.manualDraw, .manualShuffle, .manualMill, .manualRevealTop, .manualRevealBottom, .manualRevealDeck, .manualDeckBanish, .manualDeckBanishFaceDown, .manualViewDeck').css({
            'display': 'block'
        });
        reorientmenu();
        return;
    }
    if (stackunit.location === 'HAND') {
        $('.manualRevealHand, .manualShuffleHand, .manualToBottom, .manualToTop, .manualToSetTrapSpell, .manualBanish, .manualBanishFaceDown, .manualSpecialSummonDef, .manualSpecialSummonAtt, .manualSetMonster, .manualNormalSummon, .manualActivateFieldSpell, .manualToExtraFaceUp, .manualRemove, .manualToPZoneR, .manualToPZoneL, .manualToGrave, .manualToOpponentsHand, .manualToOpponentsGrave').css({
            'display': 'block'
        });
        reorientmenu();
        return;
    }
    if (stackunit.location === 'GRAVE') {
        $('.manualViewGrave').css({
            'display': 'block'
        });
        reorientmenu();
        return;
    }
    if (stackunit.location === 'EXTRA') {
        $('.manualViewExtra, .manualRevealExta').css({
            'display': 'block'
        });
        reorientmenu();
        return;
    }
    if (stackunit.location === 'MONSTERZONE') {
        $('.moveToHand, .manualToST, .manualToExtaFaceDown, .manualToExtraFaceUp, .moveChangeControl, .manualOverlay, .manualDetach, .manualFlipDown, .manualFlipUp, .manualToAtk, .manualToDef, .manualRemove, .manualToGrave, .manualToOpponentsHand, .manualToOpponentsGrave, .manualToOpponentsExtra').css({
            'display': 'block'
        });
        reorientmenu();
        return;
    }
    if (stackunit.location === 'SPELLZONE') {
        $('.moveToHand,  .manualToExtraFaceUp, .manualFlipDown, .manualFlipUp, .manualRemove, .manualToGrave, .manualToOpponentsHand, .manualToOpponentsGrave').css({
            'display': 'block'
        });
        reorientmenu();
        return;
    }
}


$(document).ready(function () {
    'use strict';
    serverconnect();
    $('.imgContainer').attr('src', 'img/textures/cover.jpg');
    $('body').on('mouseover', '.card', function (event) {
        console.log(event.currentTarget, event.currentTarget.id);
        var uid = event.currentTarget.id;

        $('.imgContainer').attr('src', $('#' + uid).attr('src'));
    });
    $('#manualcontrols button').click(function () {
        $('#manualcontrols button').css({
            'display': 'none'
        });
    });
});

$(document).mousemove(function (event) {
    'use strict';
    currentMousePos.x = event.pageX;
    currentMousePos.y = event.pageY;
});