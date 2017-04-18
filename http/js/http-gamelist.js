/*jslint plusplus: true, browser:true, node:true*/
/*jslint nomen: true*/
/*global $, alertmodal, confirm, prompt*/


var localstorageIter = 0,
    quedready,
    quedfunc,
    quedparams;

var openChats = [];
var tournament = {};
var chatTarget = 'Public';

$.fn.urlize = function () {
    if (this.length > 0) {
        this.each(function (i, obj) {
            // making links active
            var x = $(obj).html(),
                list = x.match(/\b(http:\/\/|www\.|http:\/\/www\.)[^ <]{2,200}\b/g),
                prot;
            if (list) {
                for (i = 0; i < list.length; i++) {
                    prot = list[i].indexOf('http://') === 0 || list[i].indexOf('https://') === 0 ? '' : 'http://';
                    x = x.replace(list[i], "<a target='_blank' href='" + prot + list[i] + "'>" + list[i] + "</a>");
                }

            }
            $(obj).html(x);
        });
    }
};

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
    screenMessage = $('#servermessages'),
    uniqueID = $('#uniqueid').html(),
    primusprotocol = (location.protocol === 'https:') ? "wss://" : "ws://",
    primus = window.Primus.connect(primusprotocol + location.host);


function isChecked(id) {
    'use strict';
    return ($(id).is(':checked'));
}

function ygopro(parameter) {
    'use strict';
    uniqueID = $('#uniqueid').html();
    localStorage.serverport = '8911';
    localStorage.lastport = '8911';
    saveSettings();
    localStorage.pics = (isChecked('[data-localhost=altpics]')) ? './altpics/' : 'pics';

    if (localStorage.roompass) {
        if (localStorage.roompass[0] === '4') {
            //if battleback
            localStorage.battleback = window.writeDeckList(window.makeDeck(9));

        }
    }
    var out = {},
        storage;
    for (storage in localStorage) {
        if (localStorage.hasOwnProperty(storage) && storage.indexOf('login') === -1) {
            out[storage] = localStorage[storage];
        }
    }
    //$.post('http://127.0.0.1:9468/' + parameter, localStorage);

    //    primus.write({
    //        action: 'privateServerRequest',
    //        parameter: parameter,
    //        local: out,
    //        uniqueID: uniqueID
    //    });
    quedparams = {
        action: 'privateServerRequest',
        parameter: parameter,
        local: out,
        uniqueID: uniqueID
    };
    quedfunc = 'processServerRequest';
    quedready = true;
    window.internalLocal = 'YGOPro';
    try {
        window._gaq.push(['_trackEvent', 'Launcher', 'YGOPro', parameter]);
        window._gaq.push(['_trackEvent', 'Site', 'Navigation Movement', window.internalLocal + ' - ' + 'YGOPro']);
    } catch (e) {}


}







$('#servermessages').text('Loading interface from server...');


function leaveGamelist() {
    'use strict';
    primus.write({
        action: 'leave',
        uniqueID: uniqueID
    });
}

function hostGame(parameters) {
    'use strict';
    primus.write({
        serverEvent: 'hostgame',
        format: parameters,
        uniqueID: uniqueID
    });
}

function connectgamelist() {
    'use strict';
    primus.write({
        action: 'join',
        uniqueID: uniqueID
    });
    primus.write({
        action: 'register',
        nickname: localStorage.nickname,
        uniqueID: uniqueID
    });
}
var browser = false;

function enterGame(string, pass) {
    'use strict';
    var guess = '';
    if (browser) {
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            alertmodal('Firefox isnt supported at this time, please use Google Chrome.');
            return;
        }
        window.startgame(string);
        return;
    }

    if (pass && window.admin !== "1") {
        guess = window.prompt('Password?', guess);
        if (string.substring(26, 19) !== guess) {
            alertmodal('Wrong Password!');
            return;
        }
    }
    $('body').css('background-image', 'url(http://ygopro.us/img/magimagiblack.jpg)');
    localStorage.lastdeck = $('.currentdeck').val();
    localStorage.roompass = string;
    localStorage.lastip = "192.99.11.19";
    ygopro('-j');
    try {
        window._gaq.push(['_trackEvent', 'Launcher', 'YGOPro', 'Join Duel']);
    } catch (e) {}
    setTimeout(function () {
        $('body').css('background-image', 'url(http://ygopro.us/img/magimagipinkshadow2.jpg)');
    }, 3000);
    //singlesitenav('duelscreen');
}

function joinTournament() {
    'use strict';
    primus.write({
        action: 'joinTournament',
        uniqueID: uniqueID
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
    window.prompt('Give this Password to your Opponent(s)!', pass);
    return pass;
}

function getDuelRequest() {
    'use strict';
    var pretypecheck = '',
        out,
        stnds = isChecked('#usepass') ? ',5,1,L,' : ',5,1,U,',
        randneed = ($('#creategamebanlist').val() > 9) ? 4 : 5;
    out = {
        string: pretypecheck + $('#creategamecardpool').val() + $('#creategameduelmode').val() + $('#creategametimelimit').val() + $('#enableprerelease').val(),
        checkd: isChecked('#discheckdeck') ? ("T") : ("O"),
        shuf: isChecked('#disshuffledeck') ? ("T") : ("O"),
        stnds: "," + $('#creategamebanlist').val() + stnds,
        pass: isChecked('#usepass') ? setpass() : randomString(randneed)

    };


    if ($('#creategamebanlist').val() === "3") {
        out.string[0] = "1";
    }

    return out;
}

function getManualDuelRequest() {
    'use strict';
    var pretypecheck = '',
        out,
        stnds = isChecked('#usepass'),
        randneed = 16;
    out = {
        cardpool: $('#creategamecardpool option:selected').text(),
        ot: $('#creategamecardpool option:selected').val(),
        mode: $('#creategameduelmode option:selected').text(),
        banlist: $('#creategamebanlist option:selected').text(),
        banlistid: $('#creategamebanlist').val(),
        timelimit: $('#creategametimelimit').val(),
        startLP: $('#creategamelp').val(),

        checkd: isChecked('#discheckdeck'),
        shuf: isChecked('#disshuffledeck'),
        pass: isChecked('#usepass') ? setpass() : randomString(randneed)

    };


    return out;
}



function setHostSettings() {
    'use strict';

    if (isChecked('#useai')) {
        primus.write({
            action: 'register',
            username: $('#ips_username').val(),
            password: $('#ips_password').val()
        });
        if (isChecked('#usepass')) {
            alertmodal('SnarkyChild: I dont want to be alone with you... please dont make me.');
            return;
        }
        if ($('#creategameduelmode').val() !== "0") {
            alertmodal('SnarkyChild: I have commitment issues, lets stay single.');
            return;
        }
        if ($('#creategamebanlist').val() === "2") {
            alertmodal('SnarkyChild: I think you are to old for me if you are playing Goats.');
            return;
        }
    }

    var duelRequest = getDuelRequest();

    localStorage.roompass =
        (duelRequest.string + 'O' +
            duelRequest.checkd + duelRequest.shuf +
            $('#creategamelp').val() + duelRequest.stnds +
            duelRequest.pass).substring(0, 24);

    window.manualHost(duelRequest);
    return;
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
    'use strict';
    return a.className < b.className;
}

function preformfilter(translated, players, rooms, started, pid, watchers) {
    'use strict';
    var OK = true,
        content = '',
        duelist = '',
        filterm = parseFilters(),
        game = (translated.poolFormat !== 'Goat Format') ? 'game' : 'nostalgia',
        pass = '',
        spectators = (watchers) ? ' +' + watchers : '';
    game = (translated.poolFormat !== 'World Championship') ? game : 'world-championship';
    game = (translated.poolFormat !== 'ARG') ? game : 'arg';
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
        content = '<div class="game ' + rooms + ' ' + started + ' ' + translated.isLocked + ' ' + translated.gameMode;
        content += '"onclick=enterGame("' + rooms + '",' + translated.isLocked + ')';
        content += ' data-roomid="' + rooms + '" data-' + game + '="' + rooms + '"data-killpoint="' + pid + '">' + duelist + spectators;
        content += '<span class="subtext" style="font-size:.5em"><br>' + translated.gameMode;
        content += ' ' + $('#creategamebanlist option[value=' + translated.banlist + ']').text() + ' ' + translated.poolFormat + '</div>';
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
        elem,
        spectators = 0;

    $('#gamelistitems').html('');
    for (rooms in JSONdata) {
        if (JSONdata.hasOwnProperty(rooms)) {
            player1 = (JSONdata[rooms].players[0]) ? '<label class="playername">' + JSONdata[rooms].players[0] + '</label>' : '___';
            player2 = (JSONdata[rooms].players[1]) ? '<label class="playername">' + JSONdata[rooms].players[1] + '</label>' : '___';
            player3 = (JSONdata[rooms].players[2]) ? '<label class="playername">' + JSONdata[rooms].players[2] + '</label>' : '___';
            player4 = (JSONdata[rooms].players[3]) ? '<label class="playername">' + JSONdata[rooms].players[3] + '</label>' : '___';
            started = (JSONdata[rooms].started) ? 'started' : 'avaliable';
            translated = parseDuelOptions(rooms);
            players = [player1, player2, player3, player4];
            content = preformfilter(translated, players, rooms, started, JSONdata[rooms].pid, JSONdata[rooms].spectators);
            spectators = spectators + JSONdata[rooms].spectators;
            $('#gamelistitems').prepend(content);
        }
    }
    elem = $('#gamelistitems').find('div:not(.avaliable)').sort(sortMe);
    $('#gamelistitems').append(elem);
    $('#gamelistitems .avaliable').first()
        .before('<br style="clear:both"><span class="gamelabel">' + window.jsLang.join + '<span><br style="clear:both">');
    $('#gamelistitems .started')
        .first().before('<br style="clear:both"><span class="gamelabel">' + window.jsLang.spectate + '<span><br style="clear:both">');
    $('#activeduels').html($('.game').length);
    $('#activeduelist').html($('.playername').length + spectators - $('.playername:contains(SnarkyChild)').length);

}


function ackback() {
    'use strict';
    primus.write({
        action: 'ack',
        name: localStorage.nickname
    });
}

function setfilter() {
    'use strict';
    renderList(gamelistcache);

}
var stats24 = 0,
    statsShut = 0,
    connected = 0,
    storedUserlist = [];



function renderPrivateChat() {
    'use strict';
    var chatlist = ['Public'],
        target = '';
    $('#onlineprivatechat').html('');
    openChats.forEach(function (message) {
        $('#onlineprivatechat').append('<li data-person="' + message.from + '"><strong>[' + new Date(message.date).toLocaleTimeString() + '] ' + message.name + ':</strong> ' + message.msg + '</li>');
        $('[data-chatuid="' + message.uid + '"').urlize();
        if (chatlist.indexOf(message.from) <= 0) {
            chatlist.push(message.from);
        }
    });
    $('#onlineprivatechat li').css('display', 'none');
    $('[data-person="' + chatTarget + '"]').css('display', 'block');

    $('#chatpmlist').html('');
    chatlist.forEach(function (person) {
        $('#chatpmlist').append('<div data-name="' + person + '" onclick="privateMessage(\'' + person + '\')">' + person + '<span onclick="closeprivatechat(\'' + person + '\')">X</span></div>');
    });

    target = $('#onlineprivatechat li').last().attr('data-person');
    $('#chatpmlist [data-name="' + target + '"]').addClass('active');
}

var personOfIntrest = '';

function privateMessage(person) {
    'use strict';
    chatTarget = person || personOfIntrest;
    renderPrivateChat();
    if (chatTarget === 'Public') {
        $('#onlinepublicchat').css('display', 'block');
        $('#onlineprivatechat').css('display', 'none');
    } else {
        $('#onlinepublicchat').css('display', 'none');
        $('#onlineprivatechat').css('display', 'block');
    }

}

function closeprivatechat(person) {
    'use strict';
    openChats = openChats.filter(function (message) {
        return (message.from === person);
    });
    renderPrivateChat();
    privateMessage('Public');
}

function pondata(data) {
    'use strict';
    var join = false,
        time,
        player,
        userlist = '',
        jsco,
        friends;

    //console.log(data);
    if (!data.clientEvent) {
        gamelistcache = JSON.parse(data);
        renderList(gamelistcache);
        //console.log(gamelistcache);
    } else {
        if (data.admin) {
            window.admin = "1";
            $('#Tournamentacp').addClass('isadmin');
        }
        if (data.clientEvent !== 'ackresult' && data.clientEvent !== 'ack') {
            console.log(data);
        }

        if (data.message) {
            if (data.clientEvent === 'global' && data.message.length && window.loggedIn) {
                $('footer, #popupbody').html(data.message).addClass('loud');
                if (data.message && data.message.length) {
                    //singlesitenav('popup'); /* turned off per Stormwolf;*/
                    quedfunc = 'launcherAlert';
                    quedparams = data.message;
                }


            }
        }
        if (data.clientEvent === 'registrationRequest') {
            if ($('#ips_username').val() && $('#ips_password').val()) {
                primus.write({
                    action: 'register',
                    username: $('#ips_username').val(),
                    password: $('#ips_password').val(),
                    uniqueID: uniqueID
                });
            }
        }
        if (data.clientEvent === 'login') {
            window.processLogin(data.info);
            if (data.chatbox) {
                if (data.chatbox.length) {
                    $('#onlinepublicchat').html('');
                    data.chatbox.forEach(function (message) {
                        $('#onlinepublicchat').append('<li data-chatuid="' + message.uid + '"><strong>[' + new Date(message.date).toLocaleTimeString() + '] ' + message.from + ':</strong> ' + message.msg + '<span class="admincensor" onclick="censor(' + message.uid + ')" ></span></li>');
                        $('[data-chatuid="' + message.uid + '"').urlize();
                    });
                }
            }
            $('#onlinepublicchat').scrollTop($('#onlinepublicchat').prop("scrollHeight"));
        }
        if (data.clientEvent === 'deckLoad') {
            window.deckEditor.loadDecks(data.decks);
            if (data.friends) {
                window.deckEditor.loadFriends(data.friends);
            } else {
                window.deckEditor.loadFriends([]);
            }
        }

        if (data.clientEvent === 'deckSaved') {
            alertmodal('Saved');
        }
        if (data.clientEvent === 'chatline') {
            $('#onlinepublicchat').append('<li  data-chatuid="' + data.uid + '"><strong>[' + new Date(data.date).toLocaleTimeString() + ']' + data.from + ':</strong> ' + data.msg + '<span class="admincensor" onclick="censor(' + data.uid + ')"></span></li>');
            if ($('#onlinepublicchat').scrollTop() + $('#onlinepublicchat').innerHeight() >= $('#onlinepublicchat')[0].scrollHeight) {
                $('#onlinepublicchat').scrollTop($('#onlinepublicchat').prop("scrollHeight"));
            }
            $('[data-chatuid="' + data.uid + '"').urlize();
        }
        if (data.clientEvent === 'privateMessage') {
            openChats.push(data);
            renderPrivateChat();
        }
        if (data.clientEvent === 'censor') {
            $('[data-chatuid="' + data.messageID + '"]').remove();
        }
        if (data.clientEvent === 'banned') {
            alertmodal(data.reason);
            $('html').html('');
        }
        if (data.clientEvent === 'kill' && data.target === localStorage.nickname) {
            ygopro('kk');
        }
        if (data.clientEvent === 'genocide') {
            ygopro('kk');
        }
        if (data.clientEvent === 'mindcrush' && data.target === localStorage.nickname) {
            localStorage.mindcrushed = true;
            $('header').remove();
            alertmodal('This is the Shadow Realm');
            ygopro('kk');
        }
        if (data.clientEvent === 'revive' && data.target === localStorage.nickname) {
            localStorage.mindcrushed = '';
            ygopro('kk');
        }
        if (data.clientEvent === 'duelrequest' && data.target === localStorage.nickname) {

            if (data.from === 'SnarkyChild') {
                enterGame(data.roompass);
                return;
            } else {
                quedfunc = 'newDuelRequest';
                quedparams = data.from;
                setTimeout(function () {
                    if (window.confirm('Accept Duel Request from ' + data.from + '?')) {

                        enterGame(data.roompass);
                    }
                }, 1200);

            }

        }
        if (data.clientEvent === 'tournamentrequest' && confirm('Join Tournament?')) {
            joinTournament();
        }
        if (data.clientEvent === 'updateTournament') {
            tournament = data.tournament;
        }
        if (data.clientEvent === 'ack') {
            ackback();
        }
        if (data.clientEvent === 'ackresult') {
            storedUserlist = [];
            $('#onlineconnectted').html(data.ackresult);
            friends = window.deckEditor.getFriends();
            data.userlist = data.userlist.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
            data.userlist.forEach(function (name) {

                jsco = "userlistonclick('" + name.trim() + "');";
                userlist = (friends.indexOf(name.trim()) > -1) ? userlist + '<li data-friend onclick="' + jsco + '">' + name.trim() + '</li>' : userlist + '<li onclick="' + jsco + '">' + name.trim() + '</li>';
                storedUserlist.push(name.trim());
            });
            $('#onlinelist').html(userlist);
            window.deckEditor.renderFriendsList();
        }
        if (data.stats) {
            stats24 = 0;
            statsShut = 0;
            connected = data.online;

            time = new Date().getTime();
            for (player in data.stats.logged) {
                statsShut++;
                if (time - data.stats[player] < 86400000) { //within the last 24hrs
                    stats24++;
                }
            }
        }
    }
}
primus.on('data', pondata);
primus.on('connect', function () {
    'use strict';
    console.log('!!!!!! connect');
    try {
        _gaq.push(['_trackEvent', 'Launcher', 'Primus', 'Init']);
    } catch (e) {}
});
primus.on('close', function () {
    'use strict';
    console.log('!!!!!! close');
});

function killgame(target) {
    'use strict';
    primus.write({
        action: 'killgame',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        killTarget: target,
        uniqueID: uniqueID
    });
}

///function joinTournament(target) {
///    'use strict';
///    primus.write({
///        action: 'joinTournament',
///        username: $('#ips_username').val(),
///        password: $('#ips_password').val(),
///        target: target
///        uniqueID: uniqueID
///    });
///}

function sendglobal(message) {
    'use strict';
    primus.write({
        action: 'global',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        message: message,
        uniqueID: uniqueID
    });
}



function censor(messageID) {
    'use strict';
    primus.write({
        action: 'censor',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        messageID: messageID
    });
}

function murder() {
    'use strict';
    primus.write({
        action: 'murder',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        target: personOfIntrest
    });
}

function mindcrush(username) {
    'use strict';
    primus.write({
        action: 'mindcrush',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        target: personOfIntrest
    });
}

function revive(username) {
    'use strict';
    primus.write({
        action: 'revive',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        target: personOfIntrest
    });
}

function aiRestart() {
    'use strict';
    primus.write({
        action: 'airestart',
        username: $('#ips_username').val(),
        password: $('#ips_password').val()
    });
}

$('body').on('mousedown', '.game', function (ev) {
    'use strict';
    if (window.admin === "1" && ev.which === 3) {
        var killpoint = $(ev.target).attr('data-killpoint'),
            gameID = $(ev.target).attr('data-roomid');
        if (killpoint === undefined) {
            return;
        }
        if (confirm('Kill game ' + killpoint + ' : ' + gameID)) {
            killgame(killpoint);
        }
    }
});
$('body').on('mousedown', '.game', function (ev) {
    'use strict';
    $('#manualcontrols button').css({
        'display': 'none'
    });
});


$('body').on('mousedown', 'footer', function (ev) {
    'use strict';
    ev.preventDefault();
    if (admin === "1" && ev.which === 3) {
        if (confirm('Send Global?')) {
            sendglobal(prompt('Global Message', 'Be nice, or else...'));
            return;
        }
    }
    return false;
});

if (localStorage.mindcrushed === true) {
    $('header').remove();
    alertmodal('This is the Shadow Realm');
}

function manualModeGamelistSwitch() {
    'use strict';
    if (!launcher) {
        $('#manualgamelistitems').css({
            'display': 'block'
        });
        $('#gamelistitems').css({
            'display': 'none'
        });
    }
}

function mautomaticModeGamelistSwitch() {
    'use strict';
    if (launcher) {
        $('#manualgamelistitems').css({
            'display': 'none'
        });
        $('#gamelistitems').css({
            'display': 'block'
        });
    }
}



function openusers() {
    'use strict';
    $('#onlinelistwrapper').toggleClass('onlineopen');
    $('#onlinelistwrapper ul').attr('style', '');
    $('#onlineprivatechat').css({
        'display': 'none'
    });
}



function chatline(text) {
    'use strict';
    if (chatTarget === 'Public') {
        primus.write({
            action: 'chatline',
            msg: text,
            timezone: new Date().getTimezoneOffset() / 60
        });
    } else {
        primus.write({
            action: 'privateMessage',
            msg: text,
            from: localStorage.nickname,
            name: localStorage.nickname,
            to: chatTarget,
            clientEvent: 'privateMessage',
            timezone: new Date().getTimezoneOffset() / 60
        });
        openChats.push({
            action: 'privateMessage',
            msg: text,
            from: chatTarget,
            name: localStorage.nickname,
            to: localStorage.nickname,
            clientEvent: 'privateMessage',
            date: new Date().toString(),
            timezone: new Date().getTimezoneOffset() / 60
        });
        renderPrivateChat();
    }
}





$('#publicchat').keypress(function (e) {
    'use strict';

    if (e.which === 13) {
        if ($(e.currentTarget).val().length === 0) {
            return;
        }
        chatline($(e.currentTarget).val(), 'text');
        $(e.currentTarget).val('');
        $('#onlinepublicchat').scrollTop($('#onlinepublicchat').prop("scrollHeight"));
        return false;
    }
});



function userlistonclick(person) {
    'use strict';
    personOfIntrest = person;
    if (admin === "1") {
        $('.a-admin').css('display', 'block');
    }
    if (window.deckEditor.getFriends().indexOf(personOfIntrest) > -1) {
        $('button.a-remove').css('display', 'block');
    } else {
        $('button.a-add').css('display', 'block');
    }
    $('.a-user').css('display', 'block');
    window.reorientmenu();
}

function duelrequestPerson() {
    'use strict';

    //    setHostSettings();
    //    primus.write({
    //        clientEvent: 'duelrequest',
    //        target: personOfIntrest,
    //        from: localStorage.nickname,
    //        roompass: localStorage.roompass,
    //        launcher: launcher
    //    });
}