/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
'use strict';
var time = 0;
var zlib = require('zlib'),
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    Socket = require('primus').createSocket({
        iknowclusterwillbreakconnections: true
    }),
    client,
    colors = require('colors'),
    domain = require('domain'),
    request = require('request');

function dirTree(filename) {

    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };

    if (stats.isDirectory()) {
        info.type = "folder";
        if (filename.indexOf('.git') < 0) {
            info.subfolder = fs.readdirSync(filename).map(function (child) {
                return dirTree(filename + '/' + child);
            });
        } else {
            info.type = "file";
            info.size = 0;
        }

    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
        info.size = stats.size;
        if (info.path.indexOf('Thumbs.db') > -1) {
            info.path = 'ygopro/pics/marker.badfile';
        }
    }

    return info;
}

function gitError(error) {
    console.log('Issue with git', error);
}

function filestreamer() {
    var filestreamers = domain.create(),
        dbreplacer;
    filestreamers.on('error', function (err) {
        console.log('[Update System]', 'Unable to stream manifest');
    });
    filestreamers.run(function () {
        var gzip = zlib.createGzip(),
            input = fs.createReadStream('manifest/manifest-ygopro.js'),
            out = fs.createWriteStream('manifest/manifest-ygopro.js.gz');
        input.pipe(gzip).pipe(out);

    });
    dbreplacer = domain.create();
    dbreplacer.on('error', function (err) {
        console.log('[Update System]', 'Unable to stream default DB.');
    });
    dbreplacer.run(function () {
        fs.createReadStream('ygopro/databases/0-en-OCGTCG.cdb').pipe(fs.createWriteStream('ygopro/cards.cdb'));
    });
}

function fileupdate() {
    var fileContent,
        dbreplacer,
        startTime = new Date(),
        ygopro = dirTree('ygopro'),
        plugins = dirTree('plugins'),
        license = dirTree('license'),
        interfacefolder = dirTree('interface'),
        stringsfolder = dirTree('strings'),
        installation = {
            "path": "/",
            "name": "/",
            "type": "folder",
            "subfolder": [ygopro, plugins, license, interfacefolder, stringsfolder]
        };

    fileContent = 'var manifest = ' + JSON.stringify(installation, null, 4);
    fs.writeFile('manifest/manifest-ygopro.js', fileContent, function (error) {
        //'use strict';
        if (error) {
            return;
        }
    });

    return 'Update Detection System[' + ((new Date()).getTime() - startTime.getTime()) + 'ms]';

}

function update(cb) {
    var gitUpdater = domain.create();
    gitUpdater.on('error', function (err) {
        console.log('        [Update System] ' + 'Git Failed'.grey);
    });
    gitUpdater.run(function () {
        var n = 0;
        setTimeout(function () {
            if (cb) {
                cb();
            }
        });
        return;
        spawn('git', ['pull'], {}, function () {
            n++;
        });
        spawn('git', ['pull'], {
            cwd: './ygopro/script'
        }, function () {
            n++;
        });
        spawn('git', ['pull'], {
            cwd: './ygopro/pics'
        }, function () {
            n++;
        });
    });
}



//update(function () {});
// Load the http module to create an http server.
var http = require('http');

var server = http.createServer(function (request, response) {
    response.writeHead(200, {
        "Content-Type": "text/plain"
    });
    update(function (error) {
        var rate = fileupdate();
        if (error) {
            rate = rate + error;
        }
        response.end(rate);
        console.log('[Update System]', rate, new Date(), ((error) || ''));
    });
});

// Listen on port 12000, IP defaults to 127.0.0.1
server.listen(12000);

function internalUpdate(data) {

}

function onConnectGamelist() {
    console.log('    Updater connected to internals');
    client.write({
        action: 'internalServerLogin',
        password: process.env.OPERPASS,
        gamelist: false,
        registry: false
    });
}


function onCloseGamelist() {

}

setTimeout(function () {
    client = new Socket('ws://127.0.0.1:24555'); //Internal server communications.
    client.on('data', internalUpdate);
    client.on('open', onConnectGamelist);
    client.on('close', onCloseGamelist);
}, 5000);

setInterval(function () {
    request('http://forum.ygopro.us/fetchTopics.php', function (error, response, body) {});
}, 600000);

require('fs').watch(__filename, process.exit);