/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
process.title = 'Update Detection System';
setInterval(function(){
var fs = require('fs');
var path = require('path');
var startTime = new Date();

//console.log(startTime);

function dirTree(filename) {
    'use strict';
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
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
var ygopro = dirTree('ygopro'),
    plugins = dirTree('plugins'),
    license = dirTree('license'),
    installation = {
        "path": "/",
        "name": "/",
        "type": "folder",
        "subfolder": [ygopro, plugins, license]
    };

fs.writeFile('manifest/ygopro.json', JSON.stringify(installation, null, 4), function () {
    'use strict';
});
console.log((new Date()).getTime() - startTime.getTime(), 'ms');
},1200000);