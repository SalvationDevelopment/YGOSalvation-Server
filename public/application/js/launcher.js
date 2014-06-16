/* jslint node : true */
/* jslint browser : true */
/* global applySettings, ygopro, $, isChecked, alert, Primus */
applySettings();
var siteLocation = 'http://localhost/wordpress/launcher/';
var request = require('request');
var async = require('async');

var http = require('http');
var fs = require('fs');
var walk = require('fs-walk');
var url = require('url');


var manifest = '';
var options = {
    host: url.parse('http://localhost/wordpress/launcher/manifest/ygopro.json').host,
    port: 80,
    path: url.parse('http://localhost/wordpress/launcher/manifest/ygopro.json').pathname
};
http.get(options, function (res) {
    res.on('data', function (data) {
        manifest = manifest + data;
    }).on('end', function () {
        manifest = JSON.parse(manifest);
        updateCheckFile(manifest, true);
    });
});

function update(location, file) {
    var files = {};
    walk.walkSync(location, function (basedir, filename, stat, next) {
        files[filename] = stat.mtime.getTime() || 0;
    });
    return files;
}

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


var nodecrypto = require('crypto');

function checksum(str, algorithm, encoding) {
    return nodecrypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

function getCrc(s) {
    var result = 0;
    for (var i = 0; i < s.length; i++) {
        var c = s[i];
        result = (result << 1) ^ c;
    }
    return result;
}

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
var downloadList = [];

function download() {
    if (downloadList.length === 0) {
        screenMessage.text('Update Complete! System Messages will appear here.');
        return;
    }
    var target = downloadList[0];
    
    screenMessage.text('Updating...' + target.path+' and '+downloadList.length+' other files');

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





var child_process = require('child_process');
$('#servermessages').text('Server Messages will spawn here.');



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

    var string, prio, checkd, shuf, rp, stnds, pass, compl;
    string = "" + $('#creategamecardpool').val() + $('#creategameduelmode').val() + $('#creategametimelimit').val();
    prio = isChecked('#enableprio') ? ("F") : ("O");
    checkd = isChecked('#discheckdeck') ? ("F") : ("O");
    shuf = isChecked('#disshuffledeck') ? ("F") : ("O");
    rp = ($('#creategamepassword').val().length > 0) ? ("L") : ("");
    stnds = "," + $('#creategamebanlist').val() + ',5,1,' + $('input:radio[name=ranked]:checked').val() + rp + ',';
    pass = $('#creategamepassword').val() || randomString(5);
    compl = string + prio + checkd + shuf + $('#creategamelp').val() + stnds + pass;
    console.log(compl);
    localStorage.roompass = compl;

    if ($('#creategamecardpool').val() == 2 && $('input:radio[name=ranked]:checked').val() == 'R') {
        alert('OCG/TCG is not a valid mode for ranked, please select a different mode for ranked play');
        return false;
    }
    if (prio + checkd + shuf !== "OOO" && $('input:radio[name=ranked]:checked').val() == 'R') {
        alert('You may not cheat here.');
        return false;
    }
    ygopro('-j');
}
var primus = Primus.connect('http://localhost:5000');
primus.on('data', function (data) {
    console.log(JSON.parse(data));
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
