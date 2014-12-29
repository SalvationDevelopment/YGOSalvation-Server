/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
/*global ygopro, $, isChecked, alert, Primus, console, process, applySettings, prompt, sitelocationdir */
/*exported joinGamelist, leaveGamelist, hostGame, connectgamelist, enterGame, setHostSettings, gui, setfilter, closeAllScreens*/

var mode = "production",
    gamelistcache,
    screenMessage = $('#servermessages');

var primus = Primus.connect('http://salvationdevelopment.com:24555');
$('#servermessages').text('Loading interface from server...');

function joinGamelist() {
    'use strict';
    primus.write({
        action: 'join'
    });
}

function leaveGamelist() {
    'use strict';
    primus.write({
        action: 'leave'
    });
}

function hostGame(parameters) {
    'use strict';
    primus.write({
        serverEvent: 'hostgame',
        format: parameters
    });
}

function connectgamelist() {
    'use strict';
    primus.write({
        action: 'join'
    });
}

function enterGame(string) {
    'use strict';
    localStorage.lastdeck = $('#currentdeck').val();
    localStorage.roompass = string;
    ygopro('-j');
}



function closeAllScreens() {
    'use strict';
    $('#salvationdevelopment').css('display', 'block');
    $('#staticbar section').css('display', 'none');

}

function randomString(len, charSet) {
    'use strict';
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomPoz,
        i = 0,
        randomstring = '';
    for (i; i < len; i++) {
        randomPoz = Math.floor(Math.random() * charSet.length);
        randomstring += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomstring;
}

function getDuelRequest() {
    'use strict';
    var pretypecheck = '';
    return {
        string: pretypecheck + $('#creategamecardpool').val() + $('#creategameduelmode').val() + $('#creategametimelimit').val(),
        prio: isChecked('#enableprio') ? ("F") : ("O"),
        checkd: isChecked('#discheckdeck') ? ("F") : ("O"),
        shuf: isChecked('#disshuffledeck') ? ("F") : ("O"),
        stnds: "," + $('#creategamebanlist').val() + ',5,1,U,',
        pass: randomString(5)
    };
}

function secure(prio, checkd, shuf) {
    'use strict';
    if (prio + checkd + shuf !== "OOO" && $('input:radio[name=ranked]:checked').val() === 'R') {
        alert('You may not cheat here.');
        return false;
    }
    if ($('#creategamecardpool').val() === 2 && $('input:radio[name=ranked]:checked').val() === 'R') {
        alert('OCG/TCG is not a valid mode for ranked, please select a different mode for ranked play');
        return false;
    }
    return true;
}

function setHostSettings() {
    'use strict';
    var duelRequest = getDuelRequest();
    localStorage.roompass =
        duelRequest.string + duelRequest.prio +
        duelRequest.checkd + duelRequest.shuf +
        $('#creategamelp').val() + duelRequest.stnds +
        duelRequest.pass;

    localStorage.lastip = '192.99.11.19';
    localStorage.serverport = '8911';
    localStorage.lastport = '8911';

    if (!secure(duelRequest.prio, duelRequest.checkd, duelRequest.shuf)) {
        return;
    }
    localStorage.lastdeck = $('#currentdeck').val();
    ygopro('-j');
}


function parseFilters() {
    'use strict';
    return {
        banList: parseInt($('#filterbanlist option:selected').val(), 10),
        timeLimit: $('#filtertimelimit option:selected').text().toLocaleLowerCase(),
        allowedCards: $('#filercardpool option:selected').text().toLocaleLowerCase(),
        gameMode: $('#filterroundtype option:selected').text().toLocaleLowerCase(),
        userName : $('#filterusername').val()
    };

}

function parseDuelOptions(duelOptions) {
    'use strict';
    //{"200OOO8000,0,5,1,U,PaS5w":{"port":8000,"players":[],"started":false}}
    var duelOptionsParts = duelOptions.split(','),
        settings = { //Determine time limit
            timeLimit: (duelOptionsParts[0][2] === '0') ? '3 minutes' : '5 minutes',
            //Use classic TCG rules?
            isTCGRuled: (duelOptionsParts[0][3] === 'O') ? 'OCG rules' : 'TCG Rules',

            //Check Deck for Illegal cards?
            isDeckChecked: (duelOptionsParts[0][4] === 'O') ? 'Check' : 'Dont Check',

            //Shuffle deck at start?
            isShuffled: (duelOptionsParts[0][5] === 'O') ? 'Shuffle' : 'Dont Shuffle',

            //Choose Starting Life Points
            lifePoints: duelOptionsParts[0].substring(6),

            //Determine Banlist
            banList: parseInt(duelOptionsParts[1], 10),

            //Select how many cards to draw on first hand
            openDraws: duelOptionsParts[2],

            //Select how many cards to draw each turn
            turnDraws: duelOptionsParts[3],

            //Choose whether duel is ranked
            isRanked: (duelOptionsParts[4] === 'U') ? 'Unranked' : 'Ranked',

            //Copy password
            password: duelOptionsParts[5]
        };



    //Determine allowed cards
    if (duelOptionsParts[0][0] === '0') {
        settings.allowedCards = 'tcg';
    }
    if (duelOptionsParts[0][0] === '1') {
        settings.allowedCards = 'ocg';
    }
    if (duelOptionsParts[0][0] === '2') {
        settings.allowedCards = 'tcg/ocg';
    }

    //Determine game mode
    if (duelOptionsParts[0][1] === '0') {
        settings.gameMode = 'single';
    }
    if (duelOptionsParts[0][1] === '1') {
        settings.gameMode = 'match';
    }
    if (duelOptionsParts[0][1] === '2') {
        settings.gameMode = 'tag';
    }

    //    if (settings.gameMode === 'single' || settings.gameMode === 'match') {
    //
    //    }
    return settings;

}

function preformfilter(translated, players, rooms) {
    'use strict';
    var OK = true,
        content = '',
        duelist = '',
        filterm = parseFilters();

    OK = (translated.gameMode !== filterm.gameMode && filterm.gameMode !== 'all') ? false : OK;
    OK = (translated.allowedCards !== filterm.allowedCards && filterm.allowedCards !== 'all') ? false : OK;
    OK = (translated.timeLimit !== filterm.timeLimit && filterm.timeLimit !== 'all') ? false : OK;
    OK = (translated.banList !== filterm.banList && filterm.banList !== '20') ? false : OK;
    OK = (players.searchFor(filterm.userName) === -1) ? false : OK;

    if (OK) {
        duelist = (translated.gameMode === 'single' || translated.gameMode === 'match') ? players[0] + ' vs ' + players[1] : players[0] + '&amp' + players[1] + ' vs ' + players[2] + '&amp' + players[3];
        //console.log(translated);
        content = '<div class="game" onclick=enterGame("' + rooms + '")>' + duelist +
            '<span class="subtext" style="font-size:.5em"><br>' + translated.allowedCards + '  ' + translated.gameMode +
            ' ' + $('#creategamebanlist option[value=' + translated.banlist + ']').text() + '</span></div>';
    }
    return content;
}

function renderList(JSONdata) {
    'use strict';
    var player1,
        player2,
        player3,
        player4,
        translated,
        players,
        rooms,
        content;

    $('#gamelist').html('');
    for (rooms in JSONdata) {
        if (JSONdata.hasOwnProperty(rooms)) {
            player1 = JSONdata[rooms].players[0] || '___';
            player2 = JSONdata[rooms].players[2] || '___';
            player3 = JSONdata[rooms].players[3] || '___';
            player4 = JSONdata[rooms].players[4] || '___';
            translated = parseDuelOptions(rooms);
            players = [player1, player2, player3, player4];
            content = preformfilter(translated, players, rooms);
            $('#gamelist').append(content);
        }
    }
}

function setfilter() {
    'use strict';
    renderList(gamelistcache);

}

primus.on('data', function (data) {
    'use strict';
    console.log(data);
    if (!data.clientEvent) {
        gamelistcache = JSON.parse(data);
        renderList(gamelistcache);
    }
});

Array.prototype.searchFor = function (candid) {
    'use strict';
    var i = 0;
    for (i; i < this.length; i++) {
        if (this[i].toLowerCase().indexOf(candid.toLowerCase()) === '0') {
            return i;
        }
        return -1;
    }
};