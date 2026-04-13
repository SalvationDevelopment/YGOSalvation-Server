const fs = require('fs'),
    path = require('path'),
    files = fs.readdirSync(path.resolve(__dirname, '../../http/public/banlist')),
    banlist = {};

files.forEach(function (filename) {
    const location = path.resolve(__dirname, '../../http/public/banlist', filename);
    const ex = path.extname(filename),
        base = path.basename(filename, ex);

    if (ex === '.js') {
        banlist[base] = require(location);
    }
});

fs.writeFile(path.resolve(__dirname, '../../http/public/manifest/banlist.json'), JSON.stringify(banlist, null, 4), console.log);