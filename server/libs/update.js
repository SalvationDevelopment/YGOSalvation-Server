/* jslint node: true */

var fs = require('fs');
var path = require('path');
var updatelocation = __filename.replace('update.js', '');

function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename),

        };

    if (stats.isDirectory()) {
        info.type = "folder";
        info.subfolder = fs.readdirSync(filename).map(function (child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
        info.size = stats.size;
    }

    return info;
}
var ygopro = dirTree(updatelocation + '../http/ygopro');
var plugins = dirTree(updatelocation + '../http/plugins');
var license = dirTree(updatelocation + '../http/license');
var installation = {
    "path": "/",
    "name": "/",
    "type": "folder",
    "subfolder": [ygopro, plugins, license]
};
if (!fs.existsSync(updatelocation + '../http/manifest')) {
    fs.mkdir(updatelocation + '../http/manifest');
}
fs.writeFile(updatelocation + '../http/manifest/ygopro.json', JSON.stringify(installation, null, 4), function () {});