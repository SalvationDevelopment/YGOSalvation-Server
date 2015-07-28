/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
/*global $, sitelocationdir, prompt, runYGOPro, win, Primus, uniqueID*/

var manifest = '',
    downloadList = [],
    completeList = [],
    fs = require('fs'),
    url = require('url'),
    http = require('https'),
    gui = require('nw.gui') || {},
    mode = "production",
    currentNick = localStorage.nickname,
    screenMessage = $('.servermessage'),
    siteLocation = 'https://ygopro.us',
    randomErrors = ['<span style="color:red">Warning : Stay calm while dueling!</span>',
                   '<span style="color:red">Warning : Do not insult people or else!</span>',
                   '<span style="color:red">Warning : Be careful what tone you use. Use emoticons to be clear!</span>',
                   '<span style="color:red">Warning : Respect others or else!</span>',
                   '<span style="color:green">Hint : Ask questions.</span>',
                   '<span style="color:red">Warning : Negative attitudes will not be tolerated!</span>',
                   '<span style="color:red">Warning : Everything you say here is being recorded!</span>'];

process.on('uncaughtException', function (err) {
    'use strict';
    console.log(err);
    screenMessage.html(randomErrors[Math.floor(Math.random() * (7))], err);
    /* http://nodejsreactions.tumblr.com/post/52064099868/process-on-uncaughtexception-function */
});

var updateNeeded = true;

function download() {
    'use strict';
    if (downloadList.length === 0) {
        screenMessage.html('<span style="color:white; font-weight:bold">Update Complete! System Messages will appear here.</span>');
        return;
    }
    var target = downloadList[0],
        file = fs.createWriteStream(target.path),
        options = {
            host: url.parse(siteLocation + '/' + target.path).host,
            path: url.parse(siteLocation + '/' + target.path).pathname
        };
    if (target.path.indexOf('Thumbs.db') > -1) {
        downloadList.shift();
        download();
        return;
    }
    screenMessage.html('<span style="color:white; font-weight:bold">Updating...' + target.path + ' and ' + downloadList.length + ' other files</span>');
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
    screenMessage.html('<span style="color:white; font-weight:bold">Processing manifest</span>');
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
        //console.log(completeList);
        hashcheck();
    }
}

function createmanifest() {
    'use strict';
    screenMessage.toggle();
    download();
    screenMessage.html('<span style="color:white; font-weight:bold">Downloading Manifest</span');
    $.getJSON('https://ygopro.us/manifest/ygopro.json', function (data) {
        manifest = data;
        //console.log(manifest);
        updateCheckFile(manifest, true);
    }).fail(function () {
        screenMessage.html('<span style="color:white; font-weight:bold">Failed to get mainfest, .... re-trying</span>');
        setTimeout(function () {
            createmanifest();
        }, 10000);
    });
}
var list = {
    databases: '',
    currentdeck: '',
    skinlist: '',
    fonts: ''
};


var decks = {};


function getDeck(file) {
    'use strict';

    fs.readFile('./ygopro/deck/' + file, function (badfile, deck) {
        if (file.indexOf('.ydk') !== -1) {
            decks[file] = deck;
        }
    });
}

//Load all decks
function getDecks() {
    'use strict';
    var i = 0;

    fs.readdir('./ygopro/deck', function (errors, folder) {
        if (!folder) {
            console.log(errors);
        } else {
            for (i; folder.length > i; i++) {
                getDeck(folder[i]);
            }
        }
    });
}

function populatealllist() {
    'use strict';
    updateNeeded = true;
    var dfiles = 0,
        sfiles = 0,
        dbfiles = 0,
        fontfiles = 0;
    fs.readdir('./ygopro/deck', function (error, deckfilenames) {
        list.currentdeck = '';
        for (dfiles; deckfilenames.length > dfiles; dfiles++) {
            var deck = deckfilenames[dfiles].replace('.ydk', '');
            list.currentdeck = list.currentdeck + '<option value="' + deck + '">' + deck + '</option>';
        }
        process.list = list;
    });
    fs.readdir('./ygopro/skins', function (error, skinfilenames) {
        list.skinlist = '';
        for (sfiles; skinfilenames.length > sfiles; sfiles++) {
            list.skinlist = list.skinlist + '<option value="' + sfiles + '">' + skinfilenames[sfiles] + '</option>';
        }
        process.list = list;
    });
    fs.readdir('./ygopro/databases', function (error, database) {
        list.databases = '';
        for (dbfiles; database.length > dbfiles; dbfiles++) {
            list.databases = list.databases + '<option value="' + dbfiles + '">' + database[dbfiles] + '</option>';
        }
        process.list = list;
    });
    fs.readdir('./ygopro/fonts', function (error, fonts) {
        list.fonts = '';
        for (fontfiles; fonts.length > fontfiles; fontfiles++) {
            list.fonts = list.fonts + '<option value="' + fonts[fontfiles] + '">' + fonts[fontfiles] + '</option>';
        }
        process.list = list;
    });
    getDecks();
    list.files = decks;

}

setTimeout(function () {
    'use strict';
    screenMessage.html('Interface loaded, querying user for critical information,...');
    localStorage.lastip = '192.99.11.19';
    localStorage.serverport = '8911';
    localStorage.lastport = '8911';
    if (mode === 'development') {
        try {
            gui.Window.get().showDevTools();
        } catch (error) {}
    }
    createmanifest();
    populatealllist();
    fs.watch('./ygopro/deck', populatealllist);
}, 30000);


function copyFile(source, target, cb) {
    'use strict';
    var cbCalled = false,
        read = fs.createReadStream(source),
        wr = fs.createWriteStream(target);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
    read.on("error", function (err) {
        console.log('read', err);
        done(err);
    });
    wr.on("error", function (err) {
        console.log('writte', err);
        done(err);
    });
    wr.on("close", function (ex) {
        done();
    });
    read.pipe(wr);
}

win.on('new-win-policy', function (frame, url, policy) {
    'use strict';
    policy.ignore();
    gui.Shell.openItem(url);
});

function processServerRequest(parameter) {
    'use strict';
    console.log('got server request for ', parameter);
    var letter = parameter[1];

    if (letter === 'a') {
        gui.Shell.openItem('http://forum.ygopro.us');
        return;
    }

    if (letter === 'c') {
        gui.Shell.openItem('ygopro');
        letter = '';
        return;
    }
    if (letter === 'k') {
        require('nw.gui').Window.get().close();
        return;
    }
    if (letter === 'b') {
        gui.Shell.openItem(localStorage.site);
        return;
    }

    console.log('./ygopro/databases/' + localStorage.dbtext);
    if (localStorage.dbtext.length > 0) {
        if ((localStorage.roompass[0] === '0' || localStorage.roompass[0] === '1' || localStorage.roompass[0] === '2') && letter === 'j') {
            localStorage.dbtext = '0-en-OCGTCG.cdb';
        }
        if ((localStorage.roompass[0] === '4' || localStorage.roompass[0] === '5') && letter === 'j') {
            localStorage.dbtext = '2-MonsterLeague.cdb';
        }
        if ((localStorage.roompass.substring(11, 13) === '22') && letter === 'j') {
            localStorage.dbtext = '3-Goats.cdb';
        }
        if ((localStorage.roompass.substring(11, 13) === '23') && letter === 'j') {
            localStorage.dbtext = '4-Newgioh.cdb';
        }
        if (localStorage.roompass[0] === '3' && letter === 'j') {
            localStorage.dbtext = 'Z-CWA.cdb';
        }

        copyFile('./ygopro/databases/' + localStorage.dbtext, './ygopro/cards.cdb', function (cdberror) {
            if (cdberror) {
                throw 'Failed to copy database';
            }
            if (localStorage.roompass[0] === '4' && letter === 'j') {
                localStorage.lastdeck = 'battlepack';
                fs.writeFile('./ygopro/deck/battlepack.ydk', localStorage.battleback, function () {
                    runYGOPro('-f', function () {
                        //console.log('!', parameter.path);
                    });
                });
            } else {
                runYGOPro('-' + letter, function () {
                    //console.log('!', parameter.path);
                });
            }
        });

    } else {
        runYGOPro('-' + letter, function () {
            //console.log('!', parameter.path);
        });
    }

}



var privateServer = Primus.connect('wss://ygopro.us:24555');
privateServer.on('data', function (data) {
    'use strict';
    var join = false,
        storage;
    //console.log(data);
    if (data.clientEvent === 'update') {
        createmanifest();
    }
    if (data.clientEvent !== 'privateServerRequest') {
        return;
    }
    console.log('Internal Server', data);
    for (storage in data.local) {
        if (data.local.hasOwnProperty(storage) && data.local[storage]) {
            localStorage[storage] = data.local[storage];
        }
    }


    processServerRequest(data.parameter);
});
privateServer.write({
    action: 'privateServer',
    username: localStorage.nickname,
    uniqueID: uniqueID
});

setInterval(function () {
    'use strict';
    privateServer.write({
        action: 'privateUpdate',
        serverUpdate: list,
        room: localStorage.nickname,
        clientEvent: 'privateServer',
        uniqueID: uniqueID
    });
    updateNeeded = false;
}, 15000);

getDecks();