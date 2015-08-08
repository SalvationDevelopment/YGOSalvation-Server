/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
var time = 0;
process.title = 'Update Detection System';
var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn;

function dirTree(filename) {
    'use strict';
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
    'use strict';
    var startTime = new Date(),
        ygopro = dirTree('ygopro'),
        plugins = dirTree('plugins'),
        license = dirTree('license'),
        interfacefolder = dirTree('interface'),
        packagejson = dirTree('package.json'),
        installation = {
            "path": "/",
            "name": "/",
            "type": "folder",
            "subfolder": [ygopro, plugins, license, packagejson, interfacefolder]
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

    fs.writeFile('manifest/ygopro.json', JSON.stringify(installation, null, 4), function () {
        //'use strict';
        fs.createReadStream('ygopro/databases/0-en-OCGTCG.cdb').pipe(fs.createWriteStream('ygopro/cards.cdb'));
    });

    process.title = 'Update Detection System[' + ((new Date()).getTime() - startTime.getTime()) + 'ms]';
}

//var sqlite3 = require("sqlite3").verbose(),
//    filepath = "./ygopro/databases/0-en-OCGTCG.cdb";
//
//function getDatabaseCards(callback) {
//    'use strict';
//    var database = new sqlite3.Database(filepath, sqlite3.OPEN_READONLY),
//        query = ["select datas.*, texts.* from datas, texts where texts.id=datas.id and type<> 16401;"].join(""),
//        cards = [],
//        queryError = null;
//
//    // we get all the cards, except for tokens
//    database.each(query, function (error, row) {
//        var ids = null;
//
//        if (error) {
//            queryError = error;
//            return;
//        }
//
//        cards.push(row);
//    });
//
//    database.close();
//
//    database.on("close", function () {
//        // throw error after db connection was closed
//        if (queryError) {
//            throw queryError;
//        }
//
//        callback(cards);
//    });
//}
//function saveDBOut() {
//    'use strict';
//    getDatabaseCards(function (cards) {
//        fs.writeFile('manifest/database.json', JSON.stringify(cards, null, 4), function () {
//            //'use strict';
//        });
//    });
//}
//saveDBOut();
//setInterval(saveDBOut, 600000);

update();
setInterval(update, 360000);