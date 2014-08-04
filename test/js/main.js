/* jshint browser : true */
/* jshint jquery : true */
/* globals alert, console */
/* globals isChecked, randomString */

//Define all the globals you are going to use. Avoid using to many globals. All Globals should be databases of sorts.

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

game = {}

function MessagePopUp(message) {
    alert(message);
}



game.PosUpdate = function (pos) { // Used in the lobby to notify the viewer of who is in the lobby.
    console.log('PosUpdate: ' + pos);
}

game.PlayerEnter = function (username, pos) { // Used in the lobby to notify the viewer of who is in the lobby.
    console.log('PlayerEnter: ' + username + ", " + pos);
    $('#lobbyplayer' + pos).html(username);
}

game.PlayerLeave = function (pos) { // Used in the lobby to notify the viewer of who is in the lobby.
    $('#lobbyplayer' + pos).html("");
    $('#lobbystart').attr('class', 'button ready0');
}

game.UpdatePlayer = function (pos, newpos) { // Used in the lobby to notify the viewer of who is in the lobby.
    var UpdatePlayerposscache = $('#lobbyplayer' + pos).html();
    $('#lobbyplayer' + pos).html("");
    $('#lobbyplayer' + newpos).html(UpdatePlayerposscache);
}

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


}

game.KickPlayer = function (pos) {
    pos = (pos) ? pos : 1;
}

PlayerMessage = function (player, message) { //YGOPro messages.
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
}



game.DeckError = function (card) { //When you have an illegal card in your deck.
    MessagePopUp(cardIndex('c' + card).name + " is not legal for this game format");
}

game.SelectRPS = function (value) { // Toggle RPS Screen. Screen will diengage when used.
    $('#rps').toggle();

}

game.SelectFirstPlayer = function (value) { // Select the player that goes first.
    $('#selectduelist').toggle();

}

game.StartDuel = function (data) { // Interface signalled the game has started
    var duelData = JSON.parse(data);
    console.log(duelData);
    player1StartLP = duelData.LifePoints[0];
    player2StartLP = duelData.LifePoints[1];

    $('#player1lp').html("div class='width' style='width:" + (duelData.LifePoints[0] / player1StartLP) + "'></div>" + duelData.LifePoints[0] + "</div>");
    $('#player2lp').html("div class='width' style='width:" + (duelData.LifePoints[1] / player2StartLP) + "'></div>" + duelData.LifePoints[1] + "</div>");

    game.DOMWriter(duelData.PlayerOneDeckSize, 'Deck', 'p0');
    game.DOMWriter(duelData.PlayerTwoDeckSize, 'Deck', 'p1');
    game.DOMWriter(duelData.PlayerOneExtraSize, 'Extra', 'p0');
    game.DOMWriter(duelData.PlayerTwoExtraSize, 'Extra', 'p1');
    shuffle('p0', 'Deck');
    shuffle('p1', 'Deck');
    shuffle('p0', 'Extra');
    shuffle('p1', 'Extra');
    layouthand('p0');
    layouthand('p1');
}

game.DOMWriter = function (size, movelocation, player) {
    for (var i = 0; i < size; i++) {
        animateState('none', 'unknown', 0, player, movelocation, i, 1);
        //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition){
    }

}

game.UpdateCards = function (player, clocation, data) { //YGOPro is constantly sending data about game state, this function stores and records that information to allow access to a properly understood gamestate for reference. 
    var update = JSON.parse(data);
    player = 'p' + player;
    var place = cardplace[clocation];
    console.log("Updating Multiple Card Positions for", player + "'s", place);
    try {
        if (update != duel[player][place]) {
            // console.log(update);     
        }
        duel[player][place] = update;
        //console.log(duel);
    } catch (error) {
        console.log(error);
        console.log(duel, player, place, update);
    }



}

game.UpdateCard = function (player, clocation, index, data) {
    var update = JSON.parse(data);
    player = 'p' + player;
    console.log("Updating Single Card Position", update, player + " ", "Card : " + index, cardplace[clocation]);
    if (duel[player][cardplace[clocation]][index] != update) {
        $('.card.' + player + '.' + [cardplace[clocation]] + '.i' + index + ' .front').css('background',
            "yellow url(http://ygopro.de/img/cardpics/" + update.Id + '.jpg) no-repeat auto 0 0 cover');
    }

    duel[player][cardplace[clocation]][index] = update;

}

game.DrawCard = function (player, numberOfCards) {
    console.log("p" + player + " drew " + numberOfCards + " card(s)");
    animateDrawCard("p" + player, numberOfCards);
    layouthand('p' + player);
}

game.NewPhase = function (phase) {
    console.log(enumPhase[phase]);
}

game.NewTurn = function (turn) {
    console.log("It is now p" + turn + "'s turn.");
}

game.MoveCard(player, clocation, index, moveplayer, movelocation, movezone, moveposition) {
    console.log('p' + player + "'s' ", cardplace[clocation], index, "Moved to p" + moveplayer + "s", cardplace[movelocation], movezone, moveposition);
    animateState('p' + player, cardplace[clocation], index, 'p' + moveplayer, cardplace[movelocation], movezone, moveposition);
    //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition);
    layouthand('p' + moveplayer);
}

game.OnWin = function (result) {
    console.log("Function OnWin: " + result);
}

game.SelectCards = function (cards, min, max, cancelable) {
    var debugObject = {
        cards: cards,
        min: min,
        max: max,
        cancelable: cancelable
    };
    console.log('Function SelectCards:' + JSON.stringify(debugObject));
}

game.DuelEnd = function () {
    console.log('Duel has ended.');
}

game.SelectYn = function (description) {
    console.log("Function SelectYn :" + description);
}

game.IdleCommands = function (main) {
    var update = JSON.parse(main);
    console.log('IdleCommands', update);
}

game.SelectPosition = function (positions) {
    var debugObject = JSON.Strigify(positions);
    console.log(debugObject);
}

game.SelectOption = function (options) {
    var debugObject = JSON.Strigify(options);
    console.log(debugObject);
}

game.AnnounceCard = function () {
    //Select a card from all known cards.
    console.log('AnnounceCard');
}

game.OnChaining = function (cards, desc, forced) {
    var cardIDs = JSON.parse(cards);

    for (var i = 0; i < cardIDs.length; i++) {
        animateChaining(('p' + cardIDs[i].Player), cardplace[cardIDs[i].location], cardIDs[i].Index);
    }

    //auto say no
    if (forced) {

        animateRemoveChaining();
    } else {

        animateRemoveChaining();
    }
    console.log('chaining', cardIDs, desc);

}

game.ShuffleDeck = function (player) {
    console.log(player);
    shuffle('p' + player, 'Deck');
}

debugField() {
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
    $(query).slice(0, count).attr('class', "card " + moveplayer + " " + movelocation + " i" + movezone + " " + cardPositions[moveposition])
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