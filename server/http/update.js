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
        git = spawn('git', ['pull']);

    fs.writeFile('manifest/ygopro.json', JSON.stringify(installation, null, 4), function () {
        //'use strict';
    });
    process.title = 'Update Detection System[' + ((new Date()).getTime() - startTime.getTime()) + 'ms]';
}
setInterval(update, 60000);
update();