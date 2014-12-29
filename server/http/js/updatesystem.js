/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
/*global $, sitelocationdir, prompt */

var manifest = '',
    downloadList = [],
    completeList = [],
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    fs = require('fs'),
    gui = require('nw.gui'),
    mode = "production",
    screenMessage = $('#servermessages'),
    siteLocation = sitelocationdir[mode],
    randomErrors = ['Error: My face is up here buddy!',
                   'Error: My boobies hurt!',
                   'Error: I want icecream!',
                   'Error: The cards stole my heart.',
                   'Error: Are you cheating on me with another Sim?',
                   'Error: You never listen to me!'];

process.on('uncaughtException', function (err) {
    'use strict';
    console.log(err);
    screenMessage.text(randomErrors[Math.floor(Math.random() * (6))]);
});

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
setTimeout(function () {
    'use strict';
    $('#servermessages').text('Interface loaded, querying user for critical information,...');
    localStorage.lastip = '192.99.11.19';
    localStorage.serverport = '8911';
    localStorage.lastport = '8911';
    locallogin(true);
    if (mode === 'development') {
        try {
            gui.Window.get().showDevTools();
        } catch (error) {}
    }
    populatealllist();
    createmanifest();
}, 10000);