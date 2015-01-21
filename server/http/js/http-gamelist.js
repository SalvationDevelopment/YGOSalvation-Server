/*jslint plusplus: true*/
/*global localStorage, $, Primus, prompt, console*/
var settings = ['use_d3d',
                'antialias',
                'errorlog',
                'nickname',
                'roompass',
                'lastdeck',
                'textfont',
                'numfont',
                'fullscreen',
                'enable_sound',
                'sound_volume',
                'enable_music',
                'music_volume',
                'skin_index',
                'auto_card_placing',
                'random_card_placing',
                'auto_chain_order',
                'no_delay_for_chain',
                'enable_sleeve_loading',
                'serverport',
                'lastip',
                'textfontsize',
                'lastport'],
    localstorageIter = 0;

function applySettings() {
    'use strict';
    $('[data-localhost]').each(function () {
        var property = $(this).attr('data-localhost'),
            value = ('1' === localStorage[property]) ? true : false;
        $(this).prop('checked', value);
    });
    $('#skinlist').append('<option selected value="' + localStorage.skin_index + '">' + localStorage.skin_text + '</option>');
    $('#fontlist').append('<option selected value="' + localStorage.textfont + '">' + localStorage.textfont + '</option>');
    $('#dblistlist').append('<option selected value="' + localStorage.database + '">' + localStorage.database + '</option>');
    $('#sound_volume').val(Number(localStorage.sound_volume));
    $('#music_volume').val(Number(localStorage.music_volume));
    $('#music_volume').val(Number(localStorage.textfontsize));
}

applySettings();

function saveSettings() {
    'use strict';
    $('[data-localhost]').each(function () {
        var property = $(this).attr('data-localhost');
        localStorage[property] = Number($(this).prop('checked'));
    });
    localStorage.skin_index = $('#skinlist').val();
    localStorage.skin_text = $('#skinlist option:selected').text();
    localStorage.font_text = $('#cfontlist option:selected').text();
    localStorage.database = $('#dblist option:selected').text();
    localStorage.textfont = $('#fontlist').val();
    localStorage.sound_volume = $('#sound_volume').val();
    localStorage.music_volume = $('#music_volume').val();
    localStorage.textfontsize = $('#fontsize').val();
}
var mode = "production",
    gamelistcache,
    screenMessage = $('#servermessages');

function ygopro(parameter) {
    'use strict';
    localStorage.serverport = '8911';
    localStorage.lastport = '8911';
    saveSettings();
    $.post('http://127.0.0.1:9468/' + parameter, localStorage);
}

function clearCacheRequest() {
    'use strict';
    $.ajax({
        url: 'http://127.0.0.1:9468/',
        type: 'DELETE',
        success: function (result) {
            // Do something with the result
        }
    });
}

function connectToCheckmateServer() {
    'use strict';
    var pass,
        nickname,
        chkusername = prompt("Please enter your name Checkmate Server Username", localStorage.chknickname);
    while (!chkusername) {
        chkusername = prompt("Please enter your name Checkmate Server Username", localStorage.chknickname);
    }
    pass = prompt("Please enter your name Checkmate Server Password", '');
    nickname = chkusername + '$' + pass;
    if (nickname.length > 19 && chkusername.length > 0) {
        $('#servermessages').text('Username and Password combined must be less than 19 charaters');
        return;
    }
    localStorage.chknickname = chkusername;
    localStorage.lastip = '173.224.211.158';
    localStorage.lastport = '21001';
    ygopro('-j');
}

function isChecked(id) {
    'use strict';
    return ($(id).is(':checked'));
}


var primus = Primus.connect(window.location.origin + ':24555');

$('#servermessages').text('Loading interface from server...');

function joinGamelist() {
    'use strict';
    primus.write({
        action: 'join'
    });
}
joinGamelist();

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
    localStorage.lastip = "192.99.11.19";
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
        $('#servermessages').text('You may not cheat here.');
        return false;
    }
    if ($('#creategamecardpool').val() === 2 && $('input:radio[name=ranked]:checked').val() === 'R') {
        $('#servermessages').text('OCG/TCG is not a valid mode for ranked, please select a different mode for ranked play');
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
        userName: $('#filterusername').val()
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

function preformfilter(translated, players, rooms, started) {
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
    OK = true; //disabling filter for now.
    if (OK) {
        duelist = (translated.gameMode === 'single' || translated.gameMode === 'match') ? players[0] + ' vs ' + players[1] : players[0] + '&amp' + players[1] + ' vs ' + players[2] + '&amp' + players[3];
        //console.log(translated);
        content = '<div class="game ' + rooms + ' ' + started + '" onclick=enterGame("' + rooms + '")>' + duelist +
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
        content,
        started;

    $('#gamelistitems').html('');
    for (rooms in JSONdata) {
        if (JSONdata.hasOwnProperty(rooms)) {
            player1 = JSONdata[rooms].players[0] || '___';
            player2 = JSONdata[rooms].players[1] || '___';
            player3 = JSONdata[rooms].players[2] || '___';
            player4 = JSONdata[rooms].players[3] || '___';
            started = (JSONdata[rooms].started) ? 'started' : 'avaliable';
            translated = parseDuelOptions(rooms);
            players = [player1, player2, player3, player4];
            content = preformfilter(translated, players, rooms, started);
            $('#gamelistitems').prepend(content);
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
primus.on('connect', function () {
    'use strict';
    console.log('!!!!!! connect');
});
primus.on('close', function () {
    'use strict';
    console.log('!!!!!! close');
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