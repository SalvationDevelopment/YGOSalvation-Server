/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
'use strict';
var time = 0;
var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    Socket = require('primus').createSocket({
        iknowclusterwillbreakconnections: true
    }),
    client = new Socket('127.0.0.1:24555'), //Internal server communications.
    oktorestart = false;

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

function update() {

    //    if (!process.env.YGOPROLOGINENABLED) {
    //        return true;
    //    }
    var fileContent,
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
        },
        servergit = spawn('git', ['pull']),
        scriptgit = spawn('git', ['pull'], {
            cwd: './ygopro/script'
        }),
        picsgit = spawn('git', ['pull'], {
            cwd: './ygopro/pics'
        });
    //    ,
    //        ocggit = spawn('git', ['pull'], {
    //            cwd: '../../../ygopro'
    //        });
    fileContent = 'var manifest = ' + JSON.stringify(installation, null, 4);
    fs.writeFile('manifest/manifest-ygopro.js', fileContent, function () {
        //'use strict';
        fs.createReadStream('ygopro/databases/0-en-OCGTCG.cdb').pipe(fs.createWriteStream('ygopro/cards.cdb'));
    });
    if (oktorestart) {
        return 'Update Detection System[' + ((new Date()).getTime() - startTime.getTime()) + 'ms] Restarting Server in 10 mins.';
    } else {
        return 'Update Detection System[' + ((new Date()).getTime() - startTime.getTime()) + 'ms]';
    }

}


update();
// Load the http module to create an http server.
var http = require('http');

var server = http.createServer(function (request, response) {
    response.writeHead(200, {
        "Content-Type": "text/plain"
    });
    var rate = update();
    response.end(rate);
    console.log('Update processed:', rate);
    if (oktorestart) {
        setTimeout(function () {
            client.write({
                action: 'internalRestart',
                password: process.env.OPERPASS

            });
            oktorestart = true;
        }, 600000);
    }

});

// Listen on port 12000, IP defaults to 127.0.0.1
server.listen(12000);

function internalUpdate(data) {

}

function onConnectGamelist() {
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

    client.on('data', internalUpdate);
    client.on('open', onConnectGamelist);
    client.on('close', onCloseGamelist);
}, 600000);

setInterval(function () {
    oktorestart = true;
}, 1200000);