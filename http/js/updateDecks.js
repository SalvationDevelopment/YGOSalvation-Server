// updateDecks.js
$.getJSON('http://ygopro.us/manifest/idHashMap.json', function (data) {
    fs.readdir(gui.App.dataPath + '/ygopro/deck', function (err, files) {
        if (!err) {
            files.forEach(function(file) {
                updateFile(file, data);
            });
        } else {
            throw err;
        }
    });
});

function updateFile(path, data) {
    var stats = fs.statSync(path);
    if ((new Date(stats.mtime)).getTime() < (new Date(data.lastModified)).getTime()) {
        fs.readFile(path, { encoding: 'utf8' }, function (err, file) {
            if (!err) {
                for (var id in data.ids) {
                    file = file.replace(data.ids[id].old, data.ids[id].new);
                }
                fs.writeFile(path, file, { encoding: 'utf8' });
            } else {
                throw err;
            }
        });
    }
}
