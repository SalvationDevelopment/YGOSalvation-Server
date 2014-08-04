/* jshint browser : true */
/* jshint jquery : true */
/* globals alert, console */
/* globals isChecked, randomString, shuffle,  layouthand, animateState, cardplace, animateDrawCard, enumPhase, animateChaining, animateRemoveChaining*/

//Define all the globals you are going to use. Avoid using to many globals. All Globals should be databases of sorts.
var saftey = false;
var Unityconsole = false;

var playerStart = [0, 0];
var cardIndex = {};
var cardData;
var deckData;
var decklistData;
var decklist = [];
var currenterror;
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



/* create Unity object */


//The following jquery events define user interactions; When they click, answer questions, the creation and movement of screens.
$(document).ready(function () {

    $('.downloadbutton, header').on('click', function () {


        $('#intro').toggle();
        $('.login').toggle();
        $('header').toggle();


    });



    $('#creategameok').on('click', function () {
        var string, prio, checkd, shuf, rp, stnds, pass, compl;
        string = "" + $('#creategamecardpool').val() + $('#creategameduelmode').val() + $('#creategametimelimit').val();
        prio = isChecked('#enableprio') ? ("F") : ("O");
        checkd = isChecked('#discheckdeck') ? ("F") : ("O");
        shuf = isChecked('#disshuffledeck') ? ("F") : ("O");
        rp = ($('#creategamepassword').val().length > 0) ? ("L") : ("");
        stnds = "," + $('#creategamebanlist').val() + ',5,1,' + $('input:radio[name=ranked]:checked').val() + rp + ',';
        pass = $('#creategamepassword').val() || randomString(5);
        compl = string + prio + checkd + shuf + $('#creategamelp').val() + stnds + pass;
        // console.log(compl);


        if ($('#creategamecardpool').val() == 2 && $('input:radio[name=ranked]:checked').val() == 'R') {
            MessagePopUp('OCG/TCG is not a valid mode for ranked, please select a different mode for ranked play');
            return false;
        }
        if (prio + checkd + shuf !== "OOO" && $('input:radio[name=ranked]:checked').val() == 'R') {
            MessagePopUp('You may not cheet on DevPro');
            return false;
        }



        $('#creategame').toggle();
        $('.game').toggle();
        $('#lobbyforbidden').html($('#creategamebanlist option:selected').text());
        $('#lobbycardpool').html($('#creategamecardpool option:selected').text());
        $('#lobbymode').html($('#creategameduelmode option:selected').text());
        $('#lobbytime').html($('#creategametimelimit option:selected').text());
        $('#lobbystartlp').html($('#creategamelp').val() + "/Player");


    });
    $('.rps').on("click", function () {
        $('#rps').toggle();


    });
    $('#igofirst').on("click", function () {
        $('#selectduelist').toggle();


    });
    $('#opponentfirst').on("click", function () {
        $('#selectduelist').toggle();


    });

});




//Functions used by the websocket object



function MessagePopUp(message) {
    alert(message);
}



function PosUpdate(pos) { // Used in the lobby to notify the viewer of who is in the lobby.
    console.log('PosUpdate: ' + pos);
}

function PlayerEnter(username, pos) { // Used in the lobby to notify the viewer of who is in the lobby.
    console.log('PlayerEnter: ' + username + ", " + pos);
    $('#lobbyplayer' + pos).html(username);
}

function PlayerLeave(pos) { // Used in the lobby to notify the viewer of who is in the lobby.
    $('#lobbyplayer' + pos).html("");
    $('#lobbystart').attr('class', 'button ready0');
}

function UpdatePlayer(pos, newpos) { // Used in the lobby to notify the viewer of who is in the lobby.
    var UpdatePlayerposscache = $('#lobbyplayer' + pos).html();
    $('#lobbyplayer' + pos).html("");
    $('#lobbyplayer' + newpos).html(UpdatePlayerposscache);
}

function PlayerReady(pos, ready) { // Used in the lobby to notify the viewer of who is in the lobby.
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

function KickPlayer(pos) {
    pos = (pos) ? pos : 1;
}

function PlayerMessage(player, message) { //YGOPro messages.
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



function DeckError(card) { //When you have an illegal card in your deck.
    MessagePopUp(cardIndex('c' + card).name + " is not legal for this game format");
}

function SelectRPS(value) { // Toggle RPS Screen. Screen will diengage when used.
    $('#rps').toggle();

}

function SelectFirstPlayer(value) { // Select the player that goes first.
    $('#selectduelist').toggle();

}

function StartDuel(data) { // Interface signalled the game has started
    var duelData = JSON.parse(data);
    console.log(duelData);
    player1StartLP = duelData.LifePoints[0];
    player2StartLP = duelData.LifePoints[1];

    $('#player1lp').html("div class='width' style='width:" + (duelData.LifePoints[0] / player1StartLP) + "'></div>" + duelData.LifePoints[0] + "</div>");
    $('#player2lp').html("div class='width' style='width:" + (duelData.LifePoints[1] / player2StartLP) + "'></div>" + duelData.LifePoints[1] + "</div>");

    DOMWriter(duelData.PlayerOneDeckSize, 'Deck', 'p0');
    DOMWriter(duelData.PlayerTwoDeckSize, 'Deck', 'p1');
    DOMWriter(duelData.PlayerOneExtraSize, 'Extra', 'p0');
    DOMWriter(duelData.PlayerTwoExtraSize, 'Extra', 'p1');
    shuffle('p0', 'Deck');
    shuffle('p1', 'Deck');
    shuffle('p0', 'Extra');
    shuffle('p1', 'Extra');
    layouthand('p0');
    layouthand('p1');
}

function DOMWriter(size, movelocation, player) {
    for (var i = 0; i < size; i++) {
        animateState('none', 'unknown', 0, player, movelocation, i, 1);
        //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition){
    }

}

function UpdateCards(player, clocation, data) { //YGOPro is constantly sending data about game state, this function stores and records that information to allow access to a properly understood gamestate for reference. 
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

function UpdateCard(player, clocation, index, data) {
    var update = JSON.parse(data);
    player = 'p' + player;
    console.log("Updating Single Card Position", update, player + " ", "Card : " + index, cardplace[clocation]);
    if (duel[player][cardplace[clocation]][index] != update) {
        $('.card.' + player + '.' + [cardplace[clocation]] + '.i' + index + ' .front').css('background',
            "yellow url(http://ygopro.de/img/cardpics/" + update.Id + '.jpg) no-repeat auto 0 0 cover');
    }

    duel[player][cardplace[clocation]][index] = update;

}

function DrawCard(player, numberOfCards) {
    console.log("p" + player + " drew " + numberOfCards + " card(s)");
    animateDrawCard("p" + player, numberOfCards);
    layouthand('p' + player);
}

function NewPhase(phase) {
    console.log(enumPhase[phase]);
}

function NewTurn(turn) {
    console.log("It is now p" + turn + "'s turn.");
}

function MoveCard(player, clocation, index, moveplayer, movelocation, movezone, moveposition) {
    console.log('p' + player + "'s' ", cardplace[clocation], index, "Moved to p" + moveplayer + "s", cardplace[movelocation], movezone, moveposition);
    animateState('p' + player, cardplace[clocation], index, 'p' + moveplayer, cardplace[movelocation], movezone, moveposition);
    //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition);
    layouthand('p' + moveplayer);
}

function OnWin(result) {
    console.log("Function OnWin: " + result);
}

function SelectCards(cards, min, max, cancelable) {
    var debugObject = {
        cards: cards,
        min: min,
        max: max,
        cancelable: cancelable
    };
    console.log('Function SelectCards:' + JSON.stringify(debugObject));
}

function DuelEnd() {
    console.log('Duel has ended.');
}

function SelectYn(description) {
    console.log("Function SelectYn :" + description);
}

function IdleCommands(main) {
    var update = JSON.parse(main);
    console.log('IdleCommands', update);
}

function SelectPosition(positions) {
    var debugObject = JSON.Strigify(positions);
    console.log(debugObject);
}

function SelectOption(options) {
    var debugObject = JSON.Strigify(options);
    console.log(debugObject);
}

function AnnounceCard() {
    //Select a card from all known cards.
    console.log('AnnounceCard');
}

function OnChaining(cards, desc, forced) {
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

function ShuffleDeck(player) {
    console.log(player);
    shuffle('p' + player, 'Deck');
}

function debugField() {
    $('.field').toggle();
    DOMWriter(40, 'Deck', 'p0');
    DOMWriter(40, 'Deck', 'p1');
    DOMWriter(15, 'Extra', 'p0');
    DOMWriter(15, 'Extra', 'p1');
    DrawCard('p0', 5);
    DrawCard('p1', 5);
    layouthand('p0');
    layouthand('p1');


}