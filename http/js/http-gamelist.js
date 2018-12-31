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

$.fn.urlize = function() {
    if (this.length > 0) {
        this.each(function(i, obj) {
            // making links active
            var x = $(obj).html(),
                list = x.match(/\b(http:\/\/|www\.|http:\/\/www\.)[^ <]{2,200}\b/g),
                prot;
            if (list) {
                for (i = 0; i < list.length; i++) {
                    prot = list[i].indexOf('http://') === 0 || list[i].indexOf('https://') === 0 ? '' : 'http://';
                    x = x.replace(list[i], '<a target=\'_blank\' href=\'' + prot + list[i] + '\'>' + list[i] + '</a>');
                }

            }
            $(obj).html(x);
        });
    }
};

function applySettings() {

    $('[data-localhost]').each(function() {
        var property = $(this).attr('data-localhost'),
            value = (localStorage[property] === '1') ? true : false;
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
    $('#sitebgoption').val(localStorage.bg);
}

applySettings();

function saveSettings() {

    $('[data-localhost]').each(function() {
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
    localStorage.bg = $('#sitebgoption').val();
    localStorage.dbtext = $('#dblist option:selected').text();
}
var mode = 'production',
    gamelistcache,
    screenMessage = $('#servermessages'),
    uniqueID = $('#uniqueid').html(),
    primusprotocol = (location.protocol === 'https:') ? 'wss://' : 'ws://',
    primus = window.Primus.connect(primusprotocol + location.host);


function isChecked(id) {

    return ($(id).is(':checked'));
}

function ygopro(parameter) {

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

    primus.write({
        action: 'leave',
        uniqueID: uniqueID
    });
}

function hostGame(parameters) {

    primus.write({
        serverEvent: 'hostgame',
        format: parameters,
        uniqueID: uniqueID
    });
}

function connectgamelist() {

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

function enterGame(string, pass, port) {

    var guess = '';
    if (pass && window.admin !== '1') {
        guess = window.prompt('Password?', guess);
        if (string !== guess) {
            alertmodal('Wrong Password!');
            return;
        }
    }
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        alertmodal('Firefox isnt supported at this time, please use Google Chrome.');
        return;
    }
    window.open('/ygopro.html?room=' + port);
}

function joinTournament() {

    primus.write({
        action: 'joinTournament',
        uniqueID: uniqueID
    });
}

function randomString(len, charSet) {

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

    var pass = randomString(5);
    do {
        if (pass.length !== 5) {
            pass = randomString(5);
        }
        pass = prompt('Password (5 char):', pass);
        pass.replace(/[^a-zA-Z0-9]/g, '');
    } while (pass.length !== 5);
    window.prompt('Give this Password to your Opponent(s)!', pass);
    return pass;
}

function getDuelRequest() {

    var pretypecheck = '',
        out,
        stnds = isChecked('#usepass') ? ',5,1,L,' : ',5,1,U,',
        randneed = ($('#creategamebanlist').val() > 9) ? 4 : 5;
    out = {
        OT: Number($('#creategamecardpool').val()),
        MODE: Number($('#creategamecardpool').val()),
        DECK_CHECK: !isChecked('#discheckdeck'),
        SHUFFLE: !isChecked('#disshuffledeck'),
        BANLIST: $('#creategamebanlist').val(),
        PASSWORD: isChecked('#usepass') ? setpass() : ''
    };


    if ($('#creategamebanlist').val() === '3') {
        out.string[0] = '1';
    }

    return out;
}

function getManualDuelRequest() {

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
        automatic: isChecked('#useautomatic'),
        checkd: isChecked('#discheckdeck'),
        shuf: isChecked('#disshuffledeck'),
        pass: isChecked('#usepass') ? setpass() : randomString(randneed)

    };


    return out;
}



function setHostSettings() {


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
        if ($('#creategameduelmode').val() !== '0') {
            alertmodal('SnarkyChild: I have commitment issues, lets stay single.');
            return;
        }
        if ($('#creategamebanlist').val() === '2') {
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

    return {
        banList: parseInt($('#filterbanlist option:selected').val(), 10),
        timeLimit: $('#filtertimelimit option:selected').text().toLocaleLowerCase(),
        allowedCards: $('#filercardpool option:selected').text().toLocaleLowerCase(),
        gameMode: $('#filterroundtype option:selected').text().toLocaleLowerCase(),
        userName: $('#filterusername').val()
    };

}

function parseDuelOptions(duelOptions) {

    var settings = { //Determine time limit
        timeLimit: duelOptions.time ? '3 minutes' : '5 minutes',
        //Use classic TCG rules?
        isTCGRuled: duelOptions.cardpool ? 'OCG rules' : 'TCG Rules',
        ot: duelOptions.ot,
        //Check Deck for Illegal cards?
        isDeckChecked: duelOptions.deckcheck ? 'Check' : 'Dont Check',

        legality: (!duelOptions.deckcheck || !duelOptions.shuffleDeck) ? 'OOO' : 'TTT',

        //Shuffle deck at start?
        isShuffled: duelOptions.shuffleDeck ? 'Shuffle' : 'Dont Shuffle',

        //Choose Starting Life Points
        lifePoints: duelOptions.startLP,

        //Determine Banlist
        banList: duelOptions.banlist,

        //Select how many cards to draw on first hand
        openDraws: duelOptions.start_hand_count,

        //Select how many cards to draw each turn
        turnDraws: duelOptions.draw_count,

        //Choose whether duel is locked
        isLocked: Boolean(duelOptions.locked),

        //Copy password
        password: duelOptions.roompass,

        port: duelOptions.port
    };


    settings.cardpool = duelOptions.cardpool;
    //Determine allowed cards
    if (duelOptions.cardpool === 0) {
        settings.allowedCards = 'OCG';
    }
    if (duelOptions.cardpool === 1) {
        settings.allowedCards = 'TCG';
    }
    if (duelOptions.cardpool === 2) {
        settings.allowedCards = 'TCG/OCG';
    }
    if (duelOptions.cardpool === 3) {
        settings.allowedCards = 'Anime';
    }
    if (duelOptions.cardpool === 4) {
        settings.allowedCards = 'Sealed BP3';
    }
    if (duelOptions.cardpool === 5) {
        settings.allowedCards = 'Constructed BP3';
    }

    settings.gameMode = duelOptions.mode;
    settings.poolFormat = duelOptions.banlist;
    return settings;

}

function sortMe(a, b) {

    return a.className < b.className;
}

function preformfilter(translated, players, rooms, started, pid, watchers) {

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
        content += '"onclick=enterGame("' + rooms + '",' + translated.isLocked + ',' + translated.port + ')';
        content += ' data-roomid="' + rooms + '" data-' + game + '="' + translated.ot + translated.legality + '"data-killpoint="' + pid + '">' + duelist + spectators;
        content += '<span class="subtext" style="font-size:.5em"><br>' + translated.gameMode;
        content += ' ' + $('#creategamebanlist option[value=' + translated.banlist + ']').text() + ' ' + translated.poolFormat + '</div>';
    }
    return content;
}

function renderList(JSONdata) {

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
            player1 = (JSONdata[rooms].player[0]) ? '<label class="playername">' + JSONdata[rooms].player[0].username + '</label>' : '___';
            player2 = (JSONdata[rooms].player[1]) ? '<label class="playername">' + JSONdata[rooms].player[1].username + '</label>' : '___';
            player3 = (JSONdata[rooms].player[2]) ? '<label class="playername">' + JSONdata[rooms].player[2].username + '</label>' : '___';
            player4 = (JSONdata[rooms].player[3]) ? '<label class="playername">' + JSONdata[rooms].player[3].username + '</label>' : '___';
            started = (JSONdata[rooms].started) ? 'started' : 'avaliable';
            translated = parseDuelOptions(JSONdata[rooms]);
            players = [player1, player2, player3, player4];
            content = preformfilter(translated, players, rooms, started, JSONdata[rooms].pid, JSONdata[rooms].spectators);
            spectators = spectators + (JSONdata[rooms].spectators || 0);
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
    var pzzs = $('.playername').length + spectators - $('.playername:contains(SnarkyChild)').length;
    console.log(pzzs, spectators);
    $('#activeduelist').html(pzzs, spectators);

}


function ackback() {

    primus.write({
        action: 'ack',
        name: localStorage.nickname
    });
}

function setfilter() {

    renderList(gamelistcache);

}
var stats24 = 0,
    statsShut = 0,
    connected = 0,
    storedUserlist = [];



function renderPrivateChat() {

    var chatlist = ['Public'],
        target = '';
    $('#onlineprivatechat').html('');

    openChats.forEach(function(message) {
        $('#onlineprivatechat').append('<li data-person="' + message.from + '"><strong>[' + new Date(message.date).toLocaleTimeString() + '] ' + message.name + ':</strong> ' + message.msg + '</li>');
        $('[data-chatuid="' + message.uid + '"').urlize();
        if (chatlist.indexOf(message.from) <= 0) {
            chatlist.push(message.from);
        }
    });
    $('#onlineprivatechat li').css('display', 'none');
    $('[data-person="' + chatTarget + '"]').css('display', 'block');

    $('#chatpmlist').html('');
    chatlist.forEach(function(person) {
        $('#chatpmlist').append('<div data-name="' + person + '" onclick="privateMessage(\'' + person + '\')">' + person + '<span onclick="closeprivatechat(\'' + person + '\')">X</span></div>');
    });

    target = $('#onlineprivatechat li').last().attr('data-person');
    $('#chatpmlist [data-name="' + target + '"]').addClass('active');


}

var personOfIntrest = '';

function privateMessage(person) {

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

    openChats = openChats.filter(function(message) {
        return (message.from === person);
    });
    renderPrivateChat();
    privateMessage('Public');
}

function pondata(data) {

    var join = false,
        time,
        player,
        userlist = '',
        jsco,
        friends;

    //console.log(data);
    if (data.duelAction) {
        manualReciver(data);
    } else {
        if (data.admin) {
            window.admin = '1';
            $('#Tournamentacp').addClass('isadmin');
        }
        if (data.clientEvent !== 'ackresult' && data.clientEvent !== 'ack') {
            console.log(data);
        }

        if (data.clientEvent === 'gamelist') {
            renderList(data.gamelist);
            $('#onlineconnectted').html(data.ackresult);

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
                    data.chatbox.forEach(function(message) {
                        $('#onlinepublicchat').append('<li data-chatuid="' + message.uid + '"><strong>[' + new Date(message.date).toLocaleTimeString() + '] ' + message.from + ':</strong> ' + message.msg + '<span class="admincensor" onclick="censor(' + message.uid + ')" ></span></li>');
                        $('[data-chatuid="' + message.uid + '"').urlize();
                    });
                }
            }
            $('#onlinepublicchat').scrollTop($('#onlinepublicchat').prop('scrollHeight'));
            requestglobal();
            //window.deckEditor.loadDecks(data.info.decks);
            if (data.info.friends.length) {
                // window.deckEditor.loadFriends(data.info.friends);
            } else {
                // window.deckEditor.loadFriends([]);
            }
        }

        if (data.clientEvent === 'deckSaved') {
            alertmodal('Saved');
        }
        if (data.clientEvent === 'lobby') {
            enterGame(data.roompass, data.password, data.port);
        }
        if (data.clientEvent === 'chatline') {
            $('#onlinepublicchat').append('<li  data-chatuid="' + data.uid + '"><strong>[' + new Date(data.date).toLocaleTimeString() + ']' + data.from + ':</strong> ' + data.msg + '<span class="admincensor" onclick="censor(' + data.uid + ')"></span></li>');
            if ($('#onlinepublicchat').scrollTop() + $('#onlinepublicchat').innerHeight() >= $('#onlinepublicchat')[0].scrollHeight) {
                $('#onlinepublicchat').scrollTop($('#onlinepublicchat').prop('scrollHeight'));
            }
            $('[data-chatuid="' + data.uid + '"').urlize();
            $('.chatlinker').addClass('boxshine');
            setTimeout(function() {
                $('.chatlinker').removeClass('boxshine');
            }, 6000);
        }
        if (data.clientEvent === 'privateMessage') {
            openChats.push(data);
            renderPrivateChat();
            $('.chatlinker').addClass('boxshine');
            setTimeout(function() {
                $('.chatlinker').removeClass('boxshine');
            }, 6000);
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
                setTimeout(function() {
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
            data.userlist = data.userlist.sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
            data.userlist.forEach(function(name) {

                jsco = 'userlistonclick(\'' + name.trim() + '\');';
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
primus.on('connect', function() {

    console.log('!!!!!! connect');
    try {
        _gaq.push(['_trackEvent', 'Launcher', 'Primus', 'Init']);
    } catch (e) {}
});
primus.on('close', function() {

    console.log('!!!!!! close');
});

function killgame(target) {

    primus.write({
        action: 'killgame',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        killTarget: target,
        uniqueID: uniqueID
    });
}

///function joinTournament(target) {
///    
///    primus.write({
///        action: 'joinTournament',
///        username: $('#ips_username').val(),
///        password: $('#ips_password').val(),
///        target: target
///        uniqueID: uniqueID
///    });
///}

function sendglobal(message) {

    primus.write({
        action: 'global',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        message: message,
        uniqueID: uniqueID
    });
}

function requestglobal() {

    primus.write({
        action: 'globalrequest',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        uniqueID: uniqueID
    });
}




function censor(messageID) {

    primus.write({
        action: 'censor',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        messageID: messageID
    });
}

function murder() {

    primus.write({
        action: 'murder',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        target: personOfIntrest
    });
}

function mindcrush(username) {

    primus.write({
        action: 'mindcrush',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        target: personOfIntrest
    });
}

function revive(username) {

    primus.write({
        action: 'revive',
        username: $('#ips_username').val(),
        password: $('#ips_password').val(),
        target: personOfIntrest
    });
}

function aiRestart() {

    primus.write({
        action: 'airestart',
        username: $('#ips_username').val(),
        password: $('#ips_password').val()
    });
}

$('body').on('mousedown', '.game', function(ev) {

    if (window.admin === '1' && ev.which === 3) {
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
$('body').on('mousedown', '.game', function(ev) {

    $('#manualcontrols button').css({
        'display': 'none'
    });
});


$('body').on('mousedown', 'footer', function(ev) {

    ev.preventDefault();
    if (admin === '1' && ev.which === 3) {
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


    $('#manualgamelistitems').css({
        'display': 'block'
    });
    $('#gamelistitems').css({
        'display': 'none'
    });

}
manualModeGamelistSwitch();

function mautomaticModeGamelistSwitch() {


}



function openusers() {

    $('#onlinelistwrapper').toggleClass('onlineopen');
    $('#onlinelistwrapper ul').attr('style', '');
    $('#onlineprivatechat').css({
        'display': 'none'
    });
}



function chatline(text) {

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





$('#publicchat').keypress(function(e) {


    if (e.which === 13) {
        if ($(e.currentTarget).val().length === 0) {
            return;
        }
        chatline($(e.currentTarget).val(), 'text');
        $(e.currentTarget).val('');
        $('#onlinepublicchat').scrollTop($('#onlinepublicchat').prop('scrollHeight'));
        return false;
    }
});



function userlistonclick(person) {

    personOfIntrest = person;
    if (admin === '1') {
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


    //    setHostSettings();
    //    primus.write({
    //        clientEvent: 'duelrequest',
    //        target: personOfIntrest,
    //        from: localStorage.nickname,
    //        roompass: localStorage.roompass,
    //        launcher: launcher
    //    });
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}


function startNewUser() {
    var username = $('#newusername').val(),
        email = $('#newemail').val(),
        password = $('#newpassword').val(),
        repeatedPassword = $('#restatenewpassword').val();

    if (password.length < 7) {
        alert('Stronger Password Required');
        return false;
    }

    if (repeatedPassword !== password) {
        alert('Passwords do not match');
        return false;
    }

    if (!validateEmail(email)) {
        alert('Invalid Email address');
        return false;
    }

    $.post('/register', { email: email, username: username, password: password }, function(result, networkStatus) {
        if (result.error) {
            alert(result.error);
        } else {
            singlesitenav('home');
            alert('Account Created. Please check your email.');
            processLogin(result.info);
        }

    });

}

function recoverAccount() {
    var email = $('#oldemailforgot').val();
    $.post('/recover', { email: email }, function(result, networkStatus) {
        if (result.error) {
            alert(result.error);
        } else {
            alert('Please check your email for recovery Pass.');
        }

    });
}

function recoverAccountWithKey() {
    var email = $('#oldemailforgot').val(),
        key = $('#forgotkey').val(),
        newpass = $('#newemailforgot').val(),
        confirmednewpass = $('#confirmednewpass').val();
    if (newpass !== confirmednewpass) {
        alert('passwords do not match');
        return;
    }
    $.post('/recover', { email: email }, function(result, networkStatus) {
        if (result.error) {
            alert(result.error);
        } else {
            alert('Please check your email for recovery Pass.');
        }

    });
}