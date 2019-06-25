const fs = require('fs'),
    path = require('path'),
    files = fs.readdirSync(path.resolve(__dirname, '../../http/banlist')),
    banlist = {};

files.forEach(function (filename) {
    const location = path.resolve(__dirname, '../../http/banlist', filename);
    const ex = path.extname(filename),
        base = path.basename(filename, ex);
    console.log(location, ex);

    if (ex === '.js') {
        banlist[base] = require(location);
    }
});

fs.writeFile(path.resolve(__dirname, '../../http/manifest/banlist.json'), JSON.stringify(banlist, null, 4), console.log);