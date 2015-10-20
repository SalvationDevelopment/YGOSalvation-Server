/*jslint node: true, plusplus : true*/
/*global $, runYGOPro, win, Primus, uniqueID, manifest*/


var downloadList = [], // Download list during recursive processing, when its empty stop downloading things. "update complete".
    completeList = [], //Hash processing list during recursive processesin, when its empty stop processing
    fs = require('fs'), //Usage of file system, take us out of sandbox, can read/write to file
    url = require('url'), // internal URL parser
    http = require('http'), // HTTP Server
    gui = require('nw.gui') || {}, // nwjs controls. Things like controlling the launcher itself.
    mode = "production", // This code is pulled down from the server, so this is production code.
    privateServer, // (to be defined) Server-client connection pipeline.
    screenMessage = $('.servermessage'), // Cache where to output user output about 'stuff', its that black box in the top corner.
    siteLocation = 'https://ygopro.us', // where you got the code from so you can download updates
    updateNeeded = true, //prevents the client from being to noisy to the server, a mutex.
    internalDecklist, // structure for decklist.
    decks = {}, //used with the deck scanner.
    domain = require('domain'), // yay error handling!
    list = {
        databases: '',
        currentdeck: '',
        skinlist: '',
        fonts: ''
    };// structure filled out and sent to the server then back down to the other half of the interface. Provides access to the filesystem.

localStorage.lastip = '192.99.11.19';
localStorage.serverport = '8911';
localStorage.lastport = '8911';

process.on('uncaughtException', function (err) {
    'use strict';
    console.log(err);
    $('.servermessage').html('<span style="color:blue">Fatal Error : Launcher wants to Restart! </span>');
    /* http://nodejsreactions.tumblr.com/post/52064099868/process-on-uncaughtexception-function */
    //Do catches in reverse order.
    //if downloadList, finish downloading
    //if hashcheck, finish hash checking (then download)
    //if 
});


/*When the user tries to click a link, open that link in
a new browser window*/
win.on('new-win-policy', function (frame, url, policy) {
    'use strict';
    policy.ignore();
    gui.Shell.openItem(url);
});

function updateCardId(deck, oldcard, newcard) {
    'use strict';
    return deck.replace(oldcard, newcard);
}

function internalDeckRead() {
    'use strict';
    if (internalDecklist.length === 0) {
        
        return;
    }
    if (internalDecklist[0].indexOf('.ydk') !== -1) {
        internalDecklist.shift();
        internalDeckRead();
        return;
    }

    fs.readFile('./ygopro/deck/' + internalDecklist[0], {
        encoding: "utf-8"
    }, function (badfile, deck) {
        //got deck, do something with it.
        console.log(deck);
        internalDecklist.shift();
        internalDeckRead();
        return;
    });
    return;
}

function doDeckScan() {
    'use strict';
//    screenMessage.html('<span style="color:white; font-weight:bold">Scanning Decks</span>');
//    fs.readdir('./ygopro/deck', function (errors, folder) {
//
//        if (!folder) {
//            screenMessage.html('<span style="color:red; font-weight:bold">Error Reading Deck Folder</span>');
//            console.log(errors);
//        } else {
//            internalDecklist = folder;
//            
//        }
//
//    });
}

/* after getting a list of everything to download `downloadList`, download them one at a time.
notice this isnt a normal for'Loop but a recursive function. It uses nodejs's downloader over
the browser one because its faster and more stable.'*/
function download() {
    'use strict';
    if (downloadList.length === 0) {
        screenMessage.html('<span style="color:white; font-weight:bold">Update Complete! System Messages will appear here.</span>');
        //doDeckScan();
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
            }, 40); //There needs to be a pause here so the launcher doesnt lock up, the longer it is the slower the updater.
            //The faster it is the more unresponsive the updater.
        });
    });
}

/* once we have a one by one complete list of all the files that the server
is trying to manage `completeList`, read each file in that list on the users
file system and compare its 'size' to the recorded size on the launcher. 
Comparison by size isnt ideal but that was the only way of doing this quickly!*/
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

/*Unbundle the JSON object representing the server structure,
while additionally creating any folders, that will be needed
so that the system does not error out.*/
function updateCheckFile(file, initial) {
    'use strict';
    var i = 0;

    function updateCheckFileIterate(c) {

    }
    screenMessage.html('<span style="color:white; font-weight:bold">Processing manifest. DONT TOUCH STUFF!</span>');
    console.log(file);
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

/* Trigger function for the update system*/
function createmanifest() {
    'use strict';
    updateCheckFile(manifest, true);
}






function getDeck(file) {
    'use strict';

    fs.readFile('./ygopro/deck/' + file, {
        encoding: "utf-8"
    }, function (badfile, deck) {
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

/* Asynchronously goes and gets the files the 
browser side part of the UI needs to inform the user
of the decks, skins, and databases they have access to.*/
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

/* Apply language and DB changes by overwriting key files
this covers up a failure in the way YGOPro is written.
(its not configurable enough)*/
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


/*Process the server telling the client to do something
YGOPro or Launcher related.*/
function processServerRequest(parameter) {
    'use strict';
    console.log('got server request for ', parameter);
    var letter = parameter[1],
        stringConf = './strings/' + localStorage.language + '.conf',
        ygoproStringConf = './ygopro/strings.conf';



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

    console.log(localStorage);

    if (!fs.existsSync(stringConf)) {
        stringConf = './strings/en.conf';
    }

    if (localStorage.dbtext.length > 0) {
        if ((localStorage.roompass[0] === '0' || localStorage.roompass[0] === '1' || localStorage.roompass[0] === '2') && letter === 'j') {
            localStorage.dbtext = '0-en-OCGTCG.cdb';
        }
        if ((localStorage.roompass[0] === '4' || localStorage.roompass[0] === '5') && letter === 'j') {
            localStorage.dbtext = '2-MonsterLeague.cdb';
        }
        if ((localStorage.roompass.indexOf(",5,5,1") > -1) && letter === 'j') {
            localStorage.dbtext = '3-Goats.cdb';
        }
        if ((localStorage.roompass.indexOf(",4,5,1") > -1) && letter === 'j') {
            localStorage.dbtext = '4-Newgioh.cdb';
        }
        if (localStorage.roompass[0] === '3' && letter === 'j') {
            localStorage.dbtext = 'Z-CWA.cdb';
        }
        console.log(localStorage.dbtext);
        copyFile(stringConf, ygoproStringConf, function (stringError) {
            if (stringError) {
                $('#servermessages').text('Failed to copy strings.conf');
            }
            copyFile('./ygopro/databases/' + localStorage.dbtext, './ygopro/cards.cdb', function (cdberror) {
                if (cdberror) {
                    $('#servermessages').text('Failed to copy database');
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
        });

    } else {
        runYGOPro('-' + letter, function () {
            //console.log('!', parameter.path);
        });
    }

}

/* Set up the pipeline to the server*/
function initPrimus() {
    'use strict';
    privateServer = Primus.connect('ws://ygopro.us:24555');
    privateServer.on('open', function open() {

        screenMessage.html('<span style="color:white;">Launcher Connected</span>');
        privateServer.write({
            action: 'privateUpdate',
            serverUpdate: list,
            room: localStorage.nickname,
            clientEvent: 'privateServer',
            uniqueID: uniqueID
        });
        privateServer.write({
            action: 'privateServer',
            username: localStorage.nickname,
            uniqueID: uniqueID
        });

    });
    privateServer.on('error', function open() {

        screenMessage.html('<span style="color:gold;">ERROR! Disconnected from the Server</span>');
    });
    privateServer.on('close', function open() {

        screenMessage.html('<span style="color:red;">ERROR! Disconnected from the Server</span>');
    });
    privateServer.on('data', function (data) {

        var join = false,
            storage;
        //console.log(data);
        if (data.clientEvent === 'update') {
            createmanifest();
        }
        if (data.clientEvent === 'saveDeck') {
            fs.writeFile('./ygopro/deck/' + data.deckName, data.deckList, function (err) {
                if (err) {
                    screenMessage.html('<span style="color:red;">Error occurred while saving deck. Please try again.</span>');
                } else {
                    screenMessage.html('<span style="color:green;">Deck saved successfully.</span>');
                }
            });
        }
        if (data.clientEvent === 'unlinkDeck') {
            fs.unlink('./ygopro/deck/' + data.deckName, function (err) {
                if (err) {
                    screenMessage.html('<span style="color:red;">Error occurred while deleting deck. Please try again.</span>');
                } else {
                    screenMessage.html('<span style="color:green;">Deck deleted successfully.</span>');
                }
            });
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

    setInterval(function () {

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

    setTimeout(function () {
        createmanifest();
    }, 10000);
}


/*Boot command*/
setTimeout(function () {
    'use strict';

    

    fs.watch('./ygopro/deck', populatealllist);
    initPrimus();
}, 2500);

screenMessage.html('Manifest Loaded');
populatealllist();
