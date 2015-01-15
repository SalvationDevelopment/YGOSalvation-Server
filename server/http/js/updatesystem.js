/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
/*global $, sitelocationdir, prompt, runYGOPro*/

var manifest = '',
    downloadList = [],
    completeList = [],
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    fs = require('fs'),
    gui = require('nw.gui'),
    mode = "production",
    screenMessage = $('.servermessage'),
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
    screenMessage.text(randomErrors[Math.floor(Math.random() * (6))], err);
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
    if (target.path.indexOf('Thumbs.db') > -1) {
        downloadList.shift();
        download();
        return;
    }
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
    screenMessage.toggle();
    screenMessage.text('Downloading Manifest');
    $.getJSON('http://ygopro.us/manifest/ygopro.json', function (data) {
        manifest = data;
        console.log(manifest);
        updateCheckFile(manifest, true);
    }).fail(function () {
        screenMessage.text('Failed to get mainfest');
    });
}
var list = {
    databases : '',
    currentdeck : '',
    skinlist : ''
};
function populatealllist() {
    'use strict';
    var dfiles = 0,
        sfiles = 0,
        dbfiles = 0;
    fs.readdir('./ygopro/deck', function (error, deckfilenames) {
        list.currentdeck = '';
        for (dfiles; deckfilenames.length > dfiles; dfiles++) {
            var deck = deckfilenames[dfiles].replace('.ydk', '');
            list.currentdeck = list.currentdeck + '<option value="' + deck + '">' + deck + '</option>';
        }
    });
    fs.readdir('./ygopro/skins', function (error, skinfilenames) {
        list.skinlist = '';
        for (sfiles; skinfilenames.length > sfiles; sfiles++) {
            list.skinlist = list.skinlist + '<option value="' + sfiles + '">' + skinfilenames[sfiles] + '</option>';
        }
    });
    fs.readdir('./ygopro/databases', function (error, database) {
        list.databases = '';
        for (dbfiles; database.length > dbfiles; dbfiles++) {
            list.databases = list.databases + '<option value="' + dbfiles + '">' + database[dbfiles] + '</option>';
        }
    });
}


setTimeout(function () {
    'use strict';
    $('#servermessages').text('Interface loaded, querying user for critical information,...');
    localStorage.lastip = '192.99.11.19';
    localStorage.serverport = '8911';
    localStorage.lastport = '8911';
    if (mode === 'development') {
        try {
            gui.Window.get().showDevTools();
        } catch (error) {}
    }
    populatealllist();
    createmanifest();
}, 10000);

var http = require('http');
var querystring = require('querystring');

function processPost(request, response, callback) {
    "use strict";
    var queryData = "";
    if (typeof callback !== 'function') {
        return null;
    }
    if (request.method === 'POST') {
        request.on('data', function (data) {
            queryData += data;
            if (queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {
                    'Content-Type': 'text/plain'
                }).end();
                request.connection.destroy();
            }
        });

        request.on('end', function () {
            request.post = querystring.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        response.end(JSON.stringify(list));
    }
}


http.createServer(function (request, response) {
    'use strict';
    response.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    response.setHeader('Access-Control-Allow-Credentials', true);

    if (request.method === 'POST') {
        processPost(request, response, function () {
            console.log(request.post);
            var storage,
                parameter = url.parse(request.url),
                letter = parameter.path.slice(-1);
            for (storage in request.post) {
                if (request.post.hasOwnProperty(storage)) {
                    localStorage[storage] = request.post[storage];
                }
            }
            
             
            runYGOPro('-' + letter, function () {
                console.log('!', parameter.path);
            });
            // Use request.post here

            response.writeHead(200, "OK", {
                'Content-Type': 'text/plain'
            });
            response.end();
        });
    } else {
        response.writeHead(200, "OK", {
            'Content-Type': 'text/plain'
        });
        
        response.end(JSON.stringify(list));
    }

}).listen(9468);