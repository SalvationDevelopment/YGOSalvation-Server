/*jslint node: true, plusplus : true, regexp: true*/
/*global $, runYGOPro, win, Primus, uniqueID, manifest, screenMessage, sitelocationdir*/

localStorage.dbtext = "0-en-OCGTCG.cdb";

var downloadList = [], // Download list during recursive processing, when its empty stop downloading things. "update complete".
    completeList = [], //Hash processing list during recursive processesin, when its empty stop processing
    fs = require('fs'), //Usage of file system, take us out of sandbox, can read/write to file
    url = require('url'), // internal URL parser
    http = require('http'), // HTTP Server
    gui = require('nw.gui') || {}, // nwjs controls. Things like controlling the launcher itself.
    EventEmitter = require('events').EventEmitter, //event emitter system (helps with domains);
    mode = "production", // This code is pulled down from the server, so this is production code.
    privateServer, // (to be defined) Server-client connection pipeline.
    reconnectioncount = -1,
    n = 0,
    siteLocation = 'https://ygopro.us', // where you got the code from so you can download updates
    updateNeeded = true, //prevents the client from being to noisy to the server, a mutex.
    updaterstarted = false,
    internalDecklist, // structure for decklist.
    decks = {}, //used with the deck scanner.
    domain = require('domain'), // yay error handling!
    nodecrypto = require('crypto'),
    path = require("path"),
    list = {
        databases: '',
        currentdeck: '',
        skinlist: '',
        fonts: ''
    }; // structure filled out and sent to the server then back down to the other half of the interface. Provides access to the filesystem.

localStorage.lastip = '192.99.11.19';
localStorage.serverport = '8911';
localStorage.lastport = '8911';


process.on('uncaughtException', function (criticalError) {
    'use strict';
    console.log(criticalError);


    if (criticalError.syscall) {
        $('.servermessage').html('<span style="color:blue">' + criticalError.syscall + ' Error : Launcher wants to Restart! </span>');
        console.log('The error was caused by Node trying to do I/O of some form.');
        switch (criticalError.syscall) {
        case 'EPERM':
            console.log('An attempt was made to perform an operation that requires appropriate privileges.');
            break;
        case 'ENOENT':
            console.log('Commonly raised by fs operations; a component of the specified pathname does not exist -- no entity (file or directory) could be found by the given path.');
            break;
        case 'EACCES':
            console.log('An attempt was made to access a file in a way forbidden by its file access permissions.');
            break;
        case 'EEXIST':
            console.log('An existing file was the target of an operation that required that the target not exist.');
            break;
        case 'EPIPE':
            console.log('A write on a pipe, socket, or FIFO for which there is no process to read the data. Commonly encountered at the net and http layers, indicative that the remote side of the stream being written to has been closed.');
            break;
        case 'EADDRINUSE':
            console.log('An attempt to bind a server (net, http, or https) to a local address failed due to another server on the local system already occupying that address. (Means the port is in use)');
            break;
        case 'ECONNRESET':
            console.log('A connection was forcibly closed by a peer. This normally results from a loss of the connection on the remote socket due to a timeout or reboot. Commonly encountered via the http and net modules.');
            break;
        case 'ECONNREFUSED':
            console.log('No connection could be made because the target machine actively refused it. This usually results from trying to connect to a service that is inactive on the foreign host.');
            break;
        default:
            console.log('http://man7.org/linux/man-pages/man3/errno.3.html');
        }
    } else {
        $('.servermessage').html('<span style="color:blue">You should restart your launcher,.... no pressure...</span>');
    }
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
    screenMessage.html('<span style="color:white; font-weight:bold">Processing manifest(' +
        (n - completeList.length) + '/' + n + '). DONT TOUCH STUFF!</span>');
    var target = completeList[0],
        hashLocal;
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
                if (target.md5) {
                    hashLocal = nodecrypto.createHash('md5').update(fs.readFileSync(target.path)).digest("hex");
                    if (hashLocal !== target.md5) {
                        //console.log(stats.size, target.checksum, target.path);
                        downloadList.push(target);
                    }
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
    screenMessage.html('<span style="color:white; font-weight:bold">Processing manifest. DONT TOUCH STUFF!</span>');

    if (file.type !== 'folder') {

        completeList.push(file);
    } else if (file.type === 'folder') {
        for (i = 0; file.subfolder.length > i; i++) {
            try {
                fs.mkdirSync(file.path);
            } catch (e) {
                //unsure how to handle this error, but its a serious error....
            }
            updateCheckFile(file.subfolder[i], false);
        }
    }
    if (initial) {
        //console.log(completeList);
        n = completeList.length;
        hashcheck();
    }
}

/* Trigger function for the update system
Checks to see if the system has the manifest first,
if it doesnt have the file yet, wait 5 seconds and 
then try again. Next start the update system if it 
bugs out at anypoint try again.*/
function createmanifest() {
    'use strict';

    var updateWatcher = domain.create();
    updateWatcher.on('error', function (err) {
        var failed = '<span style="color:red;">Update Failed, retying...</span>',
            didntStart = '<span style="color:gold;">Manifest is taking a while to download, retying...</span>';

        console.log(err);
        if (updaterstarted) {
            screenMessage.html(failed);
        } else {
            screenMessage.html(didntStart);
        }

        //clean the state up.
        downloadList = [];
        completeList = [];

        //then try again.
        setTimeout(createmanifest, 5000);
    });
    updateWatcher.run(function () {
        var quickfail = (!manifest);
        updaterstarted = true;
        // If an un-handled error originates from here, updateWatcher will handle it!
        updateCheckFile(manifest, true); // sending in a copy of the manifest, not the manifest itself.
    });
}

var deleteFolderRecursive = function (path, init) {
    'use strict';
    if (fs.existsSync(path) && init) {
        if (!window.confirm('Your system has an expansion pack allow Salvation to remove it?')) {
            return;
        }
    }
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


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
function getDecks(callback) {
    'use strict';
    var i = 0;

    fs.readdir('./ygopro/deck', function (errors, folder) {
        if (!folder) {
            console.log(errors);
        } else {
            for (i; folder.length > i; i++) {
                getDeck(folder[i]);
            }
            if (callback) {
                callback();
                return;
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
        fs.readdir('./ygopro/skins', function (error, skinfilenames) {
            list.skinlist = '';
            for (sfiles; skinfilenames.length > sfiles; sfiles++) {
                list.skinlist = list.skinlist + '<option value="' + sfiles + '">' + skinfilenames[sfiles] + '</option>';
            }
            process.list = list;
            fs.readdir('./ygopro/databases', function (error, database) {
                list.databases = '';
                for (dbfiles; database.length > dbfiles; dbfiles++) {
                    list.databases = list.databases + '<option value="' + dbfiles + '">' + database[dbfiles] + '</option>';
                }
                process.list = list;
                fs.readdir('./ygopro/fonts', function (error, fonts) {
                    list.fonts = '';
                    for (fontfiles; fonts.length > fontfiles; fontfiles++) {
                        list.fonts = list.fonts + '<option value="' + fonts[fontfiles] + '">' + fonts[fontfiles] + '</option>';
                    }
                    process.list = list;
                    getDecks();
                    list.files = decks;
                    frames[0].processServerCall(list);

                });
            });
        });
    });
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
            return;
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

var busy = false;

function processServerRequest(data) {
    'use strict';
    var parameter = data.parameter,
        letter = parameter[1],
        stringConf = './strings/' + localStorage.language + '.conf',
        ygoproStringConf = './ygopro/strings.conf',
        storage;
    if (busy) {
        return;
    }
    for (storage in data.local) {
        if (data.local.hasOwnProperty(storage) && data.local[storage]) {
            localStorage[storage] = data.local[storage];
        }
    }
    stringConf = './strings/' + localStorage.language + '.conf';
    busy = true;
    setTimeout(function () {
        busy = false;
    }, 1000);


    if (letter === 'a') {
        gui.Shell.openItem('http://forum.ygopro.us');
        return;
    }

    if (letter === 'c') {
        gui.Shell.openItem('ygopro');
        letter = '';
        return;
    }
    if (letter === 'n') {
        gui.Shell.openItem('dn');
        letter = '';
        return;
    }
    if (letter === 'k') {
        gui.Window.get().close();
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
        if ((localStorage.roompass.indexOf(",2,5,1") > -1) && letter === 'j') {
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
                        return;
                    });
                } else {
                    runYGOPro('-' + letter, function () {
                        //console.log('!', parameter.path);
                    });
                    return;
                }
            });
        });

    } else {
        runYGOPro('-' + letter, function () {
            //console.log('!', parameter.path);
        });
        return;
    }

}



/*Boot command*/
setTimeout(function () {
    'use strict';
    deleteFolderRecursive('./ygopro/expansions', true);
    fs.watch('./ygopro/deck', function (occurance) {
        populatealllist();
    });
}, 2500);

screenMessage.html('Update System Loaded');

try {
    var combinedmap = {},
        dnmap = require('../dn/map.json'),
        ygopromap = require('../dn/ygopromap.json'),
        internalmap = {};

    function doMapping() {
        'use strict';
        var i,
            entries;
        for (i = 0; ygopromap.length > i; i++) {
            internalmap[ygopromap[i].name] = ygopromap[i].id;
        }
        for (entries in dnmap) {
            if (dnmap.hasOwnProperty(entries)) {
                combinedmap[entries] = internalmap[dnmap[entries]];
            }
        }
    }

    doMapping();
    http.createServer(function (request, response) {
        'use strict';
        var uri = url.parse(request.url).pathname,
            remap = 'dn/' + combinedmap[uri.split('dn/')[1]] + '.jpg',
            filename = path.join(process.cwd(), remap);
        console.log(filename);
        path.exists(filename, function (exists) {
            if (!exists) {
                response.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                response.write("404 Not Found\n");
                response.end();
                return;
            }

            if (fs.statSync(filename).isDirectory()) {
                filename += '/index.html';
            }

            fs.readFile(filename, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        "Content-Type": "text/plain"
                    });
                    response.write(err + "\n");
                    response.end();
                    return;
                }

                response.writeHead(200);
                response.write(file, "binary");
                response.end();
            });
        });
    }).listen(7591);
} catch (e) {
    console.log('failed to load DN server');
}
setInterval(function () {
    'use strict';
    if (frames[0].quedready) {
        frames[0].quedready = false;
        window[frames[0].quedfunc].call({}, frames[0].quedparams);
        frames[0].quedfunc = function () {};
        frames[0].quedparams = [];
    }
}, 300);

createmanifest();

function imagetobinary(string) {
    'use strict';
    var regex = /^data:.+\/(.+);base64,(.*)$/,

        matches = string.match(regex),
        ext = matches[1],
        data = matches[2];

    return new Buffer(data, 'base64');
}

function writefile(name, data) {
    fs.writeFile(name, data, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

function addcustom(data) {
    name = data.target;
    writefile(name, imagetobinary(target.code));
}

function readFiles(dirname, onFileContent) {
    'use strict';
    var filenames = fs.readdirSync(dirname);
    filenames.forEach(function (filename) {
        var content = fs.readFileSync(dirname + filename, 'base64');
        onFileContent(filename, content);
    });
}

function getCustoms(target) {
    'use strict';
    var images = [],
        i, string = '';
    readFiles(target, function (filename, content) {
        var type = filename.split('.')[1];
        images.push({
            filename: filename,
            url: 'data:image/' + type + ';' + content
        });
    });
    for (i = 0; images.length > i; i++) {
        string = string + '<div class="customize"><img src="' + images[i].url + '"><span>' + images[i].filename + '</span>';
    }
    frames[0].$('#displaybody').html(string);

}