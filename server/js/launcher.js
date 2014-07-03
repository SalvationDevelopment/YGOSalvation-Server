/* jslint node : true */
/* jslint browser : true */
/* global ygopro, $, isChecked, alert, Primus, console, process, applySettings, prompt */
/* exported joinGamelist, leaveGamelist, hostGame, connectgamelist, enterGame, setHostSettings, gui*/

applySettings();
var siteLocation = 'http://salvationdevelopment.com/launcher/';


var http = require('http');
var fs = require('fs');
var walk = require('fs-walk');
var url = require('url');
var gui = require('nw.gui');

var manifest = '';
var options = {
    host: url.parse('http://salvationdevelopment.com/launcher/manifest/ygopro.json').host,
    port: 80,
    path: url.parse('http://salvationdevelopment.com/launcher/manifest/ygopro.json').pathname
};
http.get(options, function (res) {
    res.on('data', function (data) {
        manifest = manifest + data;
    }).on('end', function () {
        manifest = JSON.parse(manifest);
        updateCheckFile(manifest, true);
    });
});



process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});
var completeList = [];


function updateCheckFile(file, initial) {
    if (file.type !== 'folder') {

        completeList.push(file);
    } else if (file.type === 'folder') {
        for (var i = 0; file.subfolder.length > i; i++) {
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
var screenMessage = $('#servermessages');

var downloadList = [];

function hashcheck() {
    if (completeList.length === 0) {
        download();
        return;
    }
    var target = completeList[0];
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

function download() {
    if (downloadList.length === 0) {
        screenMessage.text('Update Complete! System Messages will appear here.');
        return;
    }
    var target = downloadList[0];

    screenMessage.text('Updating...' + target.path + ' and ' + downloadList.length + ' other files');

    var file = fs.createWriteStream(target.path);
    var options = {
        host: url.parse(siteLocation + target.path).host,
        port: 80,
        path: url.parse(siteLocation + target.path).pathname
    };
    http.get(options, function (res) {
        res.on('data', function (data) {
            file.write(data);
        }).on('end', function () {
            file.end();
            downloadList.shift();
            download();
        });
    });
}






$('#servermessages').text('Server Messages will spawn here.');


var primus = Primus.connect('http://salvationdevelopment.com:5000');
function joinGamelist() {
    primus.write({
        action: 'join'
    });
}

function leaveGamelist() {
    primus.write({
        action: 'leave'
    });
}

function hostGame(parameters) {
    primus.write({
        serverEvent: 'hostgame',
        format: parameters
    });
}

function setHostSettings() {

    function randomString(len, charSet) {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var randomstring = '';
        for (var i = 0; i < len; i++) {
            var randomPoz = Math.floor(Math.random() * charSet.length);
            randomstring += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomstring;
    }

    var string, prio, checkd, shuf, stnds, pass, compl;
    string = "" + $('#creategamecardpool').val() + $('#creategameduelmode').val() + $('#creategametimelimit').val();
    prio = isChecked('#enableprio') ? ("F") : ("O");
    checkd = isChecked('#discheckdeck') ? ("F") : ("O");
    shuf = isChecked('#disshuffledeck') ? ("F") : ("O");
    //    rp = ($('#creategamepassword').val().length > 0) ? ("L") : (""); room locking
    //    isrank =  $('input:radio[name=ranked]:checked').val(); ranking select
    stnds = "," + $('#creategamebanlist').val() + ',5,1,U,';
    pass = $('#creategamepassword').val() || randomString(5);
    compl = string + prio + checkd + shuf + $('#creategamelp').val() + stnds + pass;
    console.log(compl);
    localStorage.roompass = compl;
    localStorage.lastip = '192.99.11.19\r\n';
    localStorage.serverport = '8911\r\n';
    localStorage.lastport = '8911\r\n';

    if ($('#creategamecardpool').val() === 2 && $('input:radio[name=ranked]:checked').val() === 'R') {
        alert('OCG/TCG is not a valid mode for ranked, please select a different mode for ranked play');
        return false;
    }
    if (prio + checkd + shuf !== "OOO" && $('input:radio[name=ranked]:checked').val() === 'R') {
        alert('You may not cheat here.');
        return false;
    }
    locallogin();
    ygopro('-j');
}


function connectgamelist() {
    primus.write({
        action: 'join'
    });
}
primus.on('data', function (data) {
    console.log(data);
    renderList(JSON.parse(data));
    switch (data.clientEvent) {
    case ('serverMessage'):
        {
            $('#servermessages').text(data.serverMessage);
            break;
        }
    case ('duelRooms'):
        {

            break;
        }
    case ('duelRequest'):
        {

            break;
        }
    case ('die'):
        {

            break;
        }
    }
});



function parseDuelOptions(duelOptions) {
    var allowedCards;
    var gameMode;
    var timeLimit;
    var isTCGRuled;
    var isDeckChecked;
    var isShuffled;
    var lifePoints;
    var banList;
    var openDraws;
    var turnDraws;
    var isRanked;
    var password;
    var duelOptionsParts = duelOptions.split(',');



    //Determine allowed cards
    if (duelOptionsParts[0][0] === '0') {
        allowedCards = 'tcg';
    }
    if (duelOptionsParts[0][0] === '1') {
        allowedCards = 'ocg';
    }
    if (duelOptionsParts[0][0] === '2') {
        allowedCards = 'tcg/ocg';
    }

    //Determine game mode
    if (duelOptionsParts[0][1] === '0') {
        gameMode = 'single';
    }
    if (duelOptionsParts[0][1] === '1') {
        gameMode = 'match';
    }
    if (duelOptionsParts[0][1] === '2') {
        gameMode = 'tag';
    }

    //Determine time limit
    timeLimit = (duelOptionsParts[0][2] === '0') ? '3 minutes' : '5 minutes';

    //Use classic TCG rules?
    isTCGRuled = (duelOptionsParts[0][3] === 'O') ? 'OCG rules' : 'TCG Rules';

    //Check Deck for Illegal cards?
    isDeckChecked = (duelOptionsParts[0][4] === 'O') ? 'Check' : 'Dont Check';

    //Shuffle deck at start?
    isShuffled = (duelOptionsParts[0][5] === 'O') ? 'Shuffle' : 'Dont Shuffle';

    //Choose Starting Life Points
    lifePoints = duelOptionsParts[0].substring(6);

    //Determine Banlist
    banList = parseInt(duelOptionsParts[1], 10);

    //Select how many cards to draw on first hand
    openDraws = duelOptionsParts[2];

    //Select how many cards to draw each turn
    turnDraws = duelOptionsParts[3];

    //Choose whether duel is ranked
    isRanked = (duelOptionsParts[4] === 'U') ? 'Unranked' : 'Ranked';

    //Copy password
    password = duelOptionsParts[5];

    return {
        gameMode: gameMode,
        timeLimit: timeLimit,
        isRanked: isRanked,
        isDeckChecked: isDeckChecked,
        allowedCards: allowedCards,
        isTCGRuled: isTCGRuled,
        isShuffled: isShuffled,
        lifePoints: lifePoints,
        banList: banList,
        openDraws: openDraws,
        turnDraws: turnDraws,
        password: password
    };
}

//{"200OOO8000,0,5,1,U,AvE":{"port":8000,"players":[],"started":false}}

function enterGame(string) {
    localStorage.roompass = string;
    ygopro('-j');
}
//primus.write({
//    action: 'join'
//});

function renderList(JSONdata) {
    $('#gamelist').html('');
    for (var rooms in JSONdata) {
        if (JSONdata.hasOwnProperty(rooms)) {
            var translated = parseDuelOptions(rooms);
            var content = '<div class="game" onclick=enterGame("' + rooms + '")>' +
                JSONdata[rooms].players[0] + ' for ' + translated.isRanked + '  ' + translated.gameMode + '</div>';

            $('#gamelist').append(content);
        }
    }

}

function locallogin(init) {
    if (localStorage.nickname.indexOf('\u0000') < 1 || init === true) {
        var username = prompt('Username: ', localStorage.nickname);
        while (!username) {
            username = prompt('Username: ', localStorage.nickname);
        }
        localStorage.nickname = username + '\u0000\r\n';
    }
}
locallogin(true);