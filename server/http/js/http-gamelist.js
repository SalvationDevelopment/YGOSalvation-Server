/*jslint plusplus: true, browser:true, node:true*/
/*jslint nomen: true*/
/*global localStorage, $, Primus, prompt, console, writeDeckList, makeDeck, confirm, launcher, alert, singlesitenav, startgame, _gaq, internalLocal, loggedIn, processServerCall*/
/*exported connectToCheckmateServer, leaveGamelist, hostGame, connectgamelist, setHostSettings, setfilter, */


var localstorageIter = 0;

function applySettings() {
    'use strict';
    $('[data-localhost]').each(function () {
        var property = $(this).attr('data-localhost'),
            value = ('1' === localStorage[property]) ? true : false;
        $(this).prop('checked', value);
    });
    $('#skinlist').append('<option selected value="' + localStorage.skin_index + '">' + localStorage.skin_text + '</option>');
    $('.currentdeck').append('<option selected value="' + localStorage.lastdeck + '">' + localStorage.lastdeck + '</option>');
    $('#fontlist').append('<option selected value="' + localStorage.textfont + '">' + localStorage.textfont + '</option>');
    $('#dblistlist').append('<option selected value="' + localStorage.database + '">' + localStorage.database + '</option>');
    $('#sound_volume').val(Number(localStorage.sound_volume));
    $('#music_volume').val(Number(localStorage.music_volume));
    $('#fontsize').val(Number(localStorage.textfontsize));
    $('#dblist').val(Number(localStorage.dblist));
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
    localStorage.dblist = $('#dblist').val();
    localStorage.dbtext = $('#dblist option:selected').text();
}
var mode = "production",
    gamelistcache,
    screenMessage = $('#servermessages');

function ygopro(parameter) {
    'use strict';
    
    localStorage.serverport = '8911';
    localStorage.lastport = '8911';
    saveSettings();
    if (localStorage.roompass[0] === '4') {
        //if battleback
        localStorage.battleback = writeDeckList(makeDeck(9));

    }
    if (!launcher) {
        singlesitenav('duelscreen');
        alert('You need to be in the launcher to do join games.');
        startgame(localStorage.roompass);
        return;
    }
    
    $.post('http://127.0.0.1:9468/' + parameter, localStorage);
    _gaq.push(['_trackEvent', 'Launcher', 'YGOPro', parameter]);
    _gaq.push(['_trackEvent', 'Site', 'Navigation Movement', internalLocal + ' - ' + 'YGOPro']);
    internalLocal = 'YGOPro';
    
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
    _gaq.push(['_trackEvent', 'Launcher', 'YGOPro', 'Checkmate']);
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
    if (loggedIn) {
        primus.write({
            action: 'privateServer',
            username : localStorage.nickname
        });
    
    }
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
    primus.write({
        action: 'register',
        nickname: localStorage.nickname
    });
}

function enterGame(string, pass) {
    'use strict';
    var guess = '';
    console.log('checking for pass');
    if (pass) {
        guess = prompt('Password?', guess);
        if (string.substring(26, 19) !== guess) {
            alert('Wrong Password!');
            return;
        }
    }
    console.log('entering duel');
    localStorage.lastdeck = $('.currentdeck').val();
    localStorage.roompass = string;
    localStorage.lastip = "192.99.11.19";
    ygopro('-j');
    _gaq.push(['_trackEvent', 'Launcher', 'YGOPro', 'Join Duel']);
}

function joinTournament() {
    'use strict';
    primus.write({
        action: 'joinTournament'
    });
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
function setpass() {
    'use strict';
    var pass = randomString(5);
    do {
        if (pass.length !== 5) {
            pass = randomString(5);
        }
        pass = prompt('Password (5 char):', pass);
        pass.replace(/[^a-zA-Z0-9]/g, "");
    } while (pass.length !== 5);
    prompt('Give this Password to your Opponent(s)!', pass);
    return pass;
}

function getDuelRequest() {
    'use strict';
    var pretypecheck = '',
        out,
        stnds = isChecked('#usepass') ? ',5,1,L,' : ',5,1,U,',
        randneed = ($('#creategamebanlist').val() > 9) ? 4 : 5;
    out = {
        string: pretypecheck + $('#creategamecardpool').val() + $('#creategameduelmode').val() + $('#creategametimelimit').val(),
        prio: isChecked('#enableprio') ? ("T") : ("O"),
        checkd: isChecked('#discheckdeck') ? ("T") : ("O"),
        shuf: isChecked('#disshuffledeck') ? ("T") : ("O"),
        stnds: "," + $('#creategamebanlist').val() + stnds,
        pass: isChecked('#usepass') ? setpass() : randomString(randneed)
        
    };

    out.prio = ($('#creategamebanlist').val() === "21") ? "T" : out.prio;
    out.prio = ($('#creategamebanlist').val() === "22") ? "T" : out.prio;
    
    return out;
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
        (duelRequest.string + duelRequest.prio +
            duelRequest.checkd + duelRequest.shuf +
            $('#creategamelp').val() + duelRequest.stnds +
            duelRequest.pass).substring(0, 24);

    localStorage.lastip = '192.99.11.19';
    localStorage.serverport = '8911';
    localStorage.lastport = '8911';
    //PER CHIBI
    console.log(localStorage.roompas, 'affter calculation');
    if (!secure(duelRequest.prio, duelRequest.checkd, duelRequest.shuf)) {
        return;
    }
    localStorage.lastdeck = $('#hostSettings .currentdeck').val();
    ygopro('-j');
    _gaq.push(['_trackEvent', 'Launcher', 'YGOPro', 'Host']);
    _gaq.push(['_trackEvent', 'Launcher', 'YGOPro Host', duelRequest.string + duelRequest.prio +
            duelRequest.checkd + duelRequest.shuf +
            $('#creategamelp').val() + duelRequest.stnds]);
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

            //Choose whether duel is locked
            isLocked: (duelOptionsParts[4] === 'U') ? false : true,

            //Copy password
            password: duelOptionsParts[5]
        };



    //Determine allowed cards
    if (duelOptionsParts[0][0] === '0') {
        settings.allowedCards = 'OCG';
    }
    if (duelOptionsParts[0][0] === '1') {
        settings.allowedCards = 'TCG';
    }
    if (duelOptionsParts[0][0] === '2') {
        settings.allowedCards = 'TCG/OCG';
    }
    if (duelOptionsParts[0][0] === '3') {
        settings.allowedCards = 'Anime';
    }
    if (duelOptionsParts[0][0] === '4') {
        settings.allowedCards = 'Sealed BP3';
    }
    if (duelOptionsParts[0][0] === '5') {
        settings.allowedCards = 'Constructed BP3';
    }

    //Determine game mode
    if (duelOptionsParts[0][1] === '0') {
        settings.gameMode = 'Single';
    }
    if (duelOptionsParts[0][1] === '1') {
        settings.gameMode = 'Match';
    }
    if (duelOptionsParts[0][1] === '2') {
        settings.gameMode = 'Tag';
    }

    //    if (settings.gameMode === 'single' || settings.gameMode === 'match') {
    //
    //    }
    settings.poolFormat = $('#creategamebanlist [value="' + duelOptionsParts[1] + '"]').html();
    return settings;

}

function sortMe(a, b) {
    return a.className < b.className;
}

function preformfilter(translated, players, rooms, started, pid) {
    'use strict';
    var OK = true,
        content = '',
        duelist = '',
        filterm = parseFilters(),
        game = (translated.poolFormat !== 'Goat Format') ? 'game' : 'nostalgia',
        pass = '';
    game = (translated.poolFormat !== 'Newgioh') ? game : 'newgioh';
    game = (translated.poolFormat !== 'Unlimited') ? game : 'bad';
    game = (translated.poolFormat !== 'Traditional') ? game : 'bad';
    game = (translated.poolFormat !== 'Mega-Banned') ? game : 'bad';
    
    if (translated.isLocked) {
        pass = translated.password;
    }

    //OK = (translated.gameMode !== filterm.gameMode && filterm.gameMode !== 'all') ? false : OK;
    //OK = (translated.allowedCards !== filterm.allowedCards && filterm.allowedCards !== 'all') ? false : OK;
    //OK = (translated.timeLimit !== filterm.timeLimit && filterm.timeLimit !== 'all') ? false : OK;
    //OK = (translated.banList !== filterm.banList && filterm.banList !== '20') ? false : OK;
    //OK = (players.searchFor(filterm.userName) === -1) ? false : OK;
    //OK = true; //disabling filter for now.
    
    if (OK) {
        duelist = (translated.gameMode === 'Single' || translated.gameMode === 'Match') ? players[0] + ' vs ' + players[1] : players[0] + ' &amp ' + players[1] + ' vs ' + players[2] + ' &amp ' + players[3];
        //console.log(translated);
        content = '<div class="game ' + rooms + ' ' + started + ' ' +  translated.isLocked + '" onclick=enterGame("' + rooms + '",' + translated.isLocked + ') data-' + game + '="' + rooms + '">' + duelist + '<span class="subtext" style="font-size:.5em"><br>' + translated.gameMode +
            ' ' + $('#creategamebanlist option[value=' + translated.banlist + ']').text() + ' ' + translated.poolFormat + ' ' + pid + '</span> </div>';
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
        started,
        elem;

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
            content = preformfilter(translated, players, rooms, started, JSONdata[rooms].pid);
            $('#gamelistitems').prepend(content);
            
            
        }
    }
    elem = $('#gamelistitems').find('div:not(.avaliable)').sort(sortMe);
    $('#gamelistitems').append(elem);
    $('.avaliable').first().before('<br style="clear:both"><span class="gamelabel">Join<span><br style="clear:both">');
    $('.started').first().before('<br style="clear:both"><span class="gamelabel">Spectate<span><br style="clear:both">');
}

function setfilter() {
    'use strict';
    renderList(gamelistcache);

}

primus.on('data', function (data) {
    'use strict';
    var join = false;
    //console.log(data);
    if (!data.clientEvent) {
        gamelistcache = JSON.parse(data);
        renderList(gamelistcache);
    } else {
        console.log(data);
        if (data.clientEvent === 'global') {
            $('footer').html(data.message).addClass('loud');
        }
        if (data.clientEvent === 'kill' && (data.target === localStorage.nickname || data.target === 'ALL')) {
            $.post('http://127.0.0.1:9468/' + 'k');
        }
        if (data.clientEvent === 'duelrequest' && data.target === localStorage.nickname && confirm('Accept Duel Request from ' + data.from + '?')) {
            enterGame(data.roompass);
        }
        if (data.clientEvent === 'tournamentrequest' && confirm('Join Tournament?')) {
            joinTournament();
        }
        if (data.clientEvent === 'passwordQuery' && data.target === localStorage.nickname) {
            primus.write({
                action : 'passwordQuery',
                username : $('#ips_username').val(),
                password : $('#ips_password').val()
            });
        }
        if (data.clientEvent === 'privateServer') {
            processServerCall(data.serverUpdate);
            console.log('updating with', data.serverUpdate);
        }
    }
});
primus.on('connect', function () {
    'use strict';
    console.log('!!!!!! connect');
    _gaq.push(['_trackEvent', 'Launcher', 'Primus', 'Init']);
});
primus.on('close', function () {
    'use strict';
    console.log('!!!!!! close');
    _gaq.push(['_trackEvent', 'Launcher', 'Primus', 'Failure']);
});
//Array.prototype.searchFor = function (candid) {
//    'use strict';
//    var i = 0;
//    for (i; i < this.length; i++) {
//        if (this[i].toLowerCase().indexOf(candid.toLowerCase()) === '0') {
//            return i;
//        }
//        return -1;
//    }
//};
