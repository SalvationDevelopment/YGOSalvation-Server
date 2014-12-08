/* jslint node: true */
var fs = require('fs');
var path = require('path');
var startTime = new Date();

var normal = fs.existsSync('ygopro');
if (!normal){
    fs.mkdirSync('ygopro');
}

console.log(startTime);
function dirTree(filename) {
    var data;
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
var ygopro= dirTree('ygopro');
var plugins = dirTree('plugins');
var license = dirTree('license');
var installation = {
    "path": "/",
    "name": "/",
    "type": "folder",
    "subfolder": [ygopro,plugins, license]
};

fs.writeFile('manifest/ygopro.json', JSON.stringify(installation, null, 4),function(){});
console.log((new Date()).getTime() - startTime.getTime(), 'ms'  );