/*jslint node: true, plusplus: true, unparam: false, nomen: true, bitwise:true*/
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
    request = require('request'),
    crypto = require('crypto'),
    SQL = require('sql.js'),
    jsonfile = require('jsonfile'),
    newDB = [],
    htmlOutput = '',
    attributeMap = {
        1: "EARTH",
        2: "WATER",
        4: "FIRE",
        8: "WIND",
        16: "LIGHT",
        32: "DARK",
        64: "DIVINE"
    },
    stMap = {
        2: '',
        4: '',
        130: " / Ritual",
        65538: " / Quick-Play",
        131074: " / Continuous",
        131076: " / Continuous",
        262146: " / Equip",
        1048580: " / Counter"
    },
    fieldspell = {
        524290: " / Field"
    },
    monsterMap = {
        17: "Normal",
        33: "Effect",
        65: "Fusion",
        97: "Fusion / Effect",
        129: "Ritual",
        161: "Ritual / Effect",
        545: "Spirit",
        1057: "Union",
        2081: "Gemini / Effect",
        4113: "Tuner",
        4129: "Tuner / Effect",
        8193: "Synchro",
        8225: "Synchro / Effect",
        12321: "Synchro / Tuner / Effect",
        2097185: "Flip / Effect",
        4194337: "Toon / Effect",
        8388609: "Xyz",
        8388641: "Xyz / Effect",
        16777233: "Pendulum",
        16777249: "Pendulum / Effect",
        16781345: "Pendulum / Tuner / Effect",
        25165857: "Xyz / Pendulum / Effect"
    },
    pendulumMap = {
        16777233: "Pendulum",
        16777249: "Pendulum / Effect",
        16781345: "Pendulum / Tuner / Effect",
        25165857: "Xyz / Pendulum / Effect"
    },
    raceMap = {
        1: "Warrior",
        2: "Spellcaster",
        4: "Fairy",
        8: "Fiend",
        16: "Zombie",
        32: "Machine",
        64: "Aqua",
        128: "Pyro",
        256: "Rock",
        512: "Winged-Beast",
        1024: "Plant",
        2048: "Insect",
        4096: "Thunder",
        8192: "Dragon",
        16384: "Beast",
        32768: "Beast-Warrior",
        65536: "Dinosaur",
        131072: "Fish",
        262144: "Sea-Serpent",
        524288: "Reptile",
        1048576: "Psychic",
        2097152: "Divine-Beast",
        4194304: "Creator God",
        8388608: "Wyrm"
    };


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
        if (info.path.indexOf('.ig') > -1) {
            info.path = 'ygopro/pics/marker.badfile';
        }
        if (info.path.endsWith('.cdb')) {
            info.md5 = crypto.createHash('md5').update(fs.readFileSync(info.path)).digest("hex");
        }
        if (info.path.endsWith('.dll')) {
            info.md5 = crypto.createHash('md5').update(fs.readFileSync(info.path)).digest("hex");
        }
        if (info.path.endsWith('.exe')) {
            info.md5 = crypto.createHash('md5').update(fs.readFileSync(info.path)).digest("hex");
        }
        if (info.path.endsWith('lflist.conf')) {
            info.md5 = crypto.createHash('md5').update(fs.readFileSync(info.path)).digest("hex");
        }
        if (info.path.endsWith('strings.conf')) {
            info.md5 = crypto.createHash('md5').update(fs.readFileSync(info.path)).digest("hex");
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

var fs = require('fs');

function getcards(file) {
    var filebuffer = fs.readFileSync('../http/ygopro/databases/' + file),
        db = new SQL.Database(filebuffer),
        string = "SELECT * FROM datas, texts WHERE datas.id = texts.id;",
        texts = db.prepare(string),
        asObject = {
            texts: texts.getAsObject({
                'id': 1
            })
        },
        output = [],
        row;

    // Bind new values
    texts.bind({
        name: 1,
        id: 2
    });
    while (texts.step()) { //
        row = texts.getAsObject();
        output.push(row);
    }
    db.close();

    return output;
}

function getCardObject(id) {
    var result = {};
    newDB.some(function (card, index) {
        if (id === card.id) {
            result = card;
            return true;
        } else {
            return false;
        }
    });

    return result;
}

function inversionID(db) {
    var hastable = {};
    db.forEach(function (card) {
        hastable[card.id] = card;
    });

    return hastable;
}

function getCardObject(id) {
    var result = {};
    newDB.some(function (card, index) {
        if (id === card.id) {
            result = card;
            return true;
        } else {
            return false;
        }
    });

    return result;
}


function cardIs(cat, obj) {
    if (cat === "monster" && (obj.race !== 0 || obj.level !== 0 || obj.attribute !== 0)) {
        return true;
    }
    if (cat === "spell") {
        return (obj.type & 2) === 2;
    }
    if (cat === "trap") {
        return (obj.type & 4) === 4;
    }
    if (cat === "fusion") {
        return (obj.type & 64) === 64;
    }
    if (cat === "synchro") {
        return (obj.type & 8192) === 8192;
    }
    if (cat === "xyz") {
        return (obj.type & 8388608) === 8388608;
    }
}

function parseLevelScales(card) {
    var output = "",
        leftScale,
        rightScale,
        pendulumLevel,
        level = card.level,
        ranklevel = (cardIs('xyz', card)) ? '☆' : '★';
    if (level > 0 && level <= 12) {
        output += '<span class="levels">' + ranklevel + level;

    } else {
        level = level.toString(16); // format: [0-9A-F]0[0-9A-F][0-9A-F]{4}
        leftScale = parseInt(level.charAt(0), 16); // first digit: left scale in hex (0-16)
        rightScale = parseInt(level.charAt(2), 16); // third digit: right scale in hex (0-16)
        pendulumLevel = parseInt(level.charAt(6), 16); // seventh digit: level of the monster in hex (technically, all 4 digits are levels, but here we only need the last char)
        output += '<span class="levels">' + ranklevel + pendulumLevel + '</span> <span class="scales"><< ' + leftScale + ' | ' + rightScale + ' >>';
    }
    return output + '</span>';
}

function parseAtkDef(atk, def) {
    return ((atk < 0) ? "?" : atk) + " / " + ((def < 0) ? "?" : def);
}

function makeDescription(id) {
    var targetCard = getCardObject(parseInt(id, 10)),
        output = "";
    if (!targetCard) {
        //        return '<span class="searchError">An error occurred while looking up the card in our database.<br />Please report this issue <a href="' + forumLink + '" target="_blank">at our forums</a> and be sure to include following details:<br /><br />Subject: Deck Editor Error<br />Function Call: makeDescription(' + id + ')<br />User Agent: ' + navigator.userAgent + '</span>';
        return '';
    }
    output += '<div class="descContainer"><span class="cardName">' + targetCard.name + ' [' + id + ']</span><br />';
    if (cardIs("monster", targetCard)) {
        output += "<span class='monsterDesc'>[ Monster / " + monsterMap[targetCard.type] + " ]<br />" + raceMap[targetCard.race] + " / " + attributeMap[targetCard.attribute] + "<br />";
        output += "[ " + parseLevelScales(targetCard) + " ]<br />" + parseAtkDef(targetCard.atk, targetCard.def) + "</span>";
    } else if (cardIs("spell", targetCard)) {
        output += "<span class='spellDesc'>[ Spell" + (stMap[targetCard.type] || "") + " ]</span>";
    } else if (cardIs("trap", targetCard)) {
        output += "<span class='trapDesc'>[ Trap" + (stMap[targetCard.type] || "") + " ]</span>";
    }
    return output + "<br /><pre class='description'>" + targetCard.desc + "</pre>";
}

function generate() {
    htmlOutput = '';
    fs.readdir('../http/ygopro/databases/', function (err, files) {
        var i,
            oldDB,
            newCards = [];
        for (i = 0; files.length > i; i++) {
            try {
                fs.writeFileSync('../http/manifest/manifest_' + files[i].slice(0, -4) + '.json', JSON.stringify(getcards(files[i])));
            } catch (e) {

            }
        }
        try {
            oldDB = inversionID(jsonfile.readFileSync('../http/manifest/manifest_old.json'));
            newDB = inversionID(jsonfile.readFileSync('../http/manifest/0-en-OCGTCG.json'));

            Object.keys(newDB).forEach(function (id) {
                if (oldDB[id] !== undefined) {
                    return;
                } else {
                    newCards.push(newDB[id]);
                }
            });
            Object.keys(newCards).forEach(function (id) {
                htmlOutput += '<img src="http://ygopro.us/ygopro/pics/' + id + '.jpg" />';
                htmlOutput += makeDescription(id);
            });



        } catch (e2) {}
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
            "subfolder": [stringsfolder, ygopro, plugins, license, interfacefolder]
        };

    fileContent = 'var manifest = ' + JSON.stringify(installation, null, 4);
    fs.writeFile('manifest/manifest-ygopro.js', fileContent, function (error) {
        //'use strict';
        if (error) {
            return;
        }
    });
    generate();
    return 'Update Detection System[' + ((new Date()).getTime() - startTime.getTime()) + 'ms]';

}

function update(cb) {
    var gitUpdater = domain.create();
    gitUpdater.on('error', function (err) {
        console.log('        [Update System] ' + 'Git Failed'.grey, err);
    });
    gitUpdater.run(function () {
        var n = 0;
        setTimeout(function () {
            if (cb) {
                cb();
            }
        });
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
        spawn('git', ['pull'], {
            cwd: '../ygopro-tcg-scripts'
        }, function () {
            n++;
        });
        spawn('git', ['pull'], {
            cwd: '../ygopro-goat-scripts'
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
        response.end(rate + htmlOutput);
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






fs.watch('../http/ygopro/databases/', generate);
generate();

require('fs').watch(__filename, process.exit);