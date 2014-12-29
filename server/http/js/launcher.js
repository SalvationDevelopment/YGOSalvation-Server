/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
/*global ygopro, $, isChecked, alert, Primus, console, process, applySettings, prompt, sitelocationdir */
/*exported joinGamelist, leaveGamelist, hostGame, connectgamelist, enterGame, setHostSettings, gui, setfilter, closeAllScreens*/

applySettings();
/* jslint node : true */



var http = require('http'),
    fs = require('fs'),
    gui = require('nw.gui'),
    downloadList = [],
    url = require('url'),
    completeList = [],
    mode = "production",
    gamelistcache,
    screenMessage = $('#servermessages'),
    siteLocation = sitelocationdir[mode];

if (mode === 'development') {
    try {
        require('nw.gui').Window.get().showDevTools();
    } catch (error) {}
}

function download() {
    'use strict';
    if (downloadList.length === 0) {
        screenMessage.text('Update Complete! System Messages will appear here.');
        return;
    }
    var target = downloadList[0],
        file = fs.createWriteStream(target.path),
        options = {
            host: url.parse(siteLocation + '/' + target.path).host,
            port: 80,
            path: url.parse(siteLocation + '/' + target.path).pathname
        };
    screenMessage.text('Updating...' + target.path + ' and ' + downloadList.length + ' other files');
    http.get(options, function (res) {
        res.on('data', function (data) {
            file.write(data);
        }).on('end', function () {
            file.end();
            downloadList.shift();
            setTimeout(function () {
                download();
            }, 200);

        });
    });
}

function hashcheck() {
    'use strict';
    if (completeList.length === 0) {
        download();
    }
    var target = completeList[0];
    if (target) {
        if (target.path) {
            fs.stat(target.path, function (err, stats) {
                if (err) {
                    //bad file keep going and add it.
                    downloadList.push(target);
                    completeList.shift();
                    hashcheck();
                    return;
                }
                //screenMessage.text('Analysing...' + target.path);

                if (stats.size !== target.size) {
                    //console.log(stats.size, target.checksum, target.path);
                    downloadList.push(target);
                }
                completeList.shift();
                hashcheck();
            });
        }
    }
}

function updateCheckFile(file, initial) {
    'use strict';
    var i = 0;
    screenMessage.text('Processing manifest');
    if (file.type !== 'folder') {

        completeList.push(file);
    } else if (file.type === 'folder') {
        for (i = 0; file.subfolder.length > i; i++) {
            try {
                fs.mkdirSync(file.path);
            } catch (e) {}
            updateCheckFile(file.subfolder[i], false);
        }

    }
    if (initial) {
        console.log(completeList);
        hashcheck();
    }
}



//var unzip = require('unzip');

var randomErrors = ['Error: My face is up here buddy!',
                   'Error: My boobies hurt!',
                   'Error: I want icecream!',
                   'Error: The cards stole my heart.',
                   'Error: Are you cheating on me with another Sim?',
                   'Error: You never listen to me!'];

var manifest = '';

function createmanifest() {
    'use strict';
    screenMessage.text('Downloading Manifest');
    $.getJSON('http://ygopro.us/manifest/ygopro.json', function (data) {
        manifest = data;
        console.log(manifest);
        updateCheckFile(manifest, true);
    }).fail(function () {
        screenMessage.text('Failed to get mainfest');
    });
}

function locallogin(init) {
    'use strict';
    localStorage.nickname = localStorage.nickname || '';
    if (localStorage.nickname.length < 1 || init === true) {
        var username = prompt('Username: ', localStorage.nickname);
        while (!username) {
            username = prompt('Username: ', localStorage.nickname);
        }
        localStorage.nickname = username;
    }
}

function populatealllist() {
    'use strict';
    var dfiles = 0,
        sfiles = 0;
    fs.readdir('./ygopro/deck', function (error, deckfilenames) {
        $('#currentdeck').html('');
        for (dfiles; deckfilenames.length > dfiles; dfiles++) {
            var deck = deckfilenames[dfiles].replace('.ydk', '');
            $('#currentdeck').append('<option value="' + deck + '">' + deck + '</option>');
        }
    });
    fs.readdir('./ygopro/skins', function (error, skinfilenames) {
        $('#skinlist').html('');
        for (sfiles; skinfilenames.length > sfiles; sfiles++) {
            $('#skinlist').append('<option value="' + skinfilenames[sfiles] + '">' + skinfilenames[sfiles] + '</option>');
        }
    });
}
setTimeout(function () {
    'use strict';
    $('#servermessages').text('Interface loaded, querying user for critical information,...');
    localStorage.lastip = '192.99.11.19';
    localStorage.serverport = '8911';
    localStorage.lastport = '8911';
    locallogin(true);
    populatealllist();
    createmanifest();
}, 10000);

var primus = Primus.connect('http://salvationdevelopment.com:24555');

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



function connectgamelist() {
    'use strict';
    primus.write({
        action: 'join'
    });
}

function parseFilters() {
    'use strict';
    var settings = {
        //timeLimit: ($('#filtertimelimit option:selected').val() == 3) ? '3 minutes' : '5 minutes',

        //Determine Banlist
        banList: parseInt($('#filterbanlist option:selected').val(), 10)

        //Choose whether duel is ranked
        //isRanked: (duelOptionsParts[4] === 'U') ? 'Unranked' : 'Ranked',

    };

    //Determine time limit
    if ($('#filtertimelimit option:selected').val() === '0') {
        settings.timeLimit = 'All';
    }
    if ($('#filtertimelimit option:selected').val() === '3') {
        settings.timeLimit = '3 minutes';
    }
    if ($('#filtertimelimitoption:selected').val() === '5') {
        settings.timeLimit = '5 minutes';

    }

    //Determine allowed cards
    if ($('#filercardpool option:selected').val() === '0') {
        settings.allowedCards = 'tcg';
    }
    if ($('#filercardpool option:selected').val() === '1') {
        settings.allowedCards = 'ocg';
    }
    if ($('#filercardpool option:selected').val() === '2') {
        settings.allowedCards = 'tcg/ocg';

    }
    if ($('#filercardpool option:selected').val() === '3') {
        settings.allowedCards = 'anime';
    }
    if ($('#filercardpool option:selected').val() === '4') {
        settings.allowedCards = 'All';
    }

    //Determine game mode
    if ($('#filterroundtype option:selected').val() === '0') {
        settings.gameMode = 'single';
    }
    if ($('#filterroundtype option:selected').val() === '1') {
        settings.gameMode = 'match';
    }
    if ($('#filterroundtype option:selected').val() === '2') {
        settings.gameMode = 'tag';
    }
    if ($('#filterroundtype option:selected').val() === '3') {
        settings.gameMode = 'All';
    }
    settings.userName = $('#filterusername').val();


    return settings;

}

function parseDuelOptions(duelOptions) {
    'use strict';
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

    OK = (translated.gameMode !== filterm.gameMode && filterm.gameMode !== 'All') ? false : OK;
    OK = (translated.allowedCards !== filterm.allowedCards && filterm.allowedCards !== 'All') ? false : OK;
    OK = (translated.timeLimit !== filterm.timeLimit && filterm.timeLimit !== 'All') ? false : OK;
    OK = (translated.banList !== filterm.banList && filterm.banList !== '20') ? false : OK;
    OK = (players.searchFor(filterm.userName) === -1) ? false : OK;

    if (OK) {
        duelist = (translated.gameMode === 'single' || translated.gameMode === 'match') ? true : false;
        duelist = (duelist) ? players[0] + ' vs ' + players[1] : players[0] + '&amp' + players[1] + ' vs ' + players[2] + '&amp' + players[3];
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

function enterGame(string) {
    'use strict';
    localStorage.lastdeck = $('#currentdeck').val();
    localStorage.roompass = string;
    ygopro('-j');
}
primus.on('data', function (data) {
    'use strict';
    console.log(data);
    if (!data.clientEvent) {
        gamelistcache = JSON.parse(data);
        renderList(gamelistcache);

    }
    switch (data.clientEvent) {
    case ('serverMessage'):

        $('#servermessages').text(data.serverMessage);

        break;

    case ('duelRequest'):

        var accept = prompt('Take duel?');
        if (accept) {
            enterGame(data.clientEvent.room);
        }

        break;

    case ('die'):

        alert(data.clientEvent.message);
        $('body').html('');

        break;

    }
});




//$('#filercardpool option:selected').val()




function setfilter() {
    'use strict';
    renderList(gamelistcache);

}

function closeAllScreens() {
    'use strict';
    $('#salvationdevelopment').css('display', 'block');
    $('#staticbar section').css('display', 'none');

}

//{"200OOO8000,0,5,1,U,PaS5w":{"port":8000,"players":[],"started":false}}

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



$('#servermessages').text('Loading interface from server...');
process.on('uncaughtException', function (err) {
    'use strict';
    console.log(err);
    screenMessage.text(randomErrors[Math.floor(Math.random() * (6))]);
});