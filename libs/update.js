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
    newCards = [],
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
        673: "Ritual / Spirit / Effect",
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


function getBanlist() {
    var banlist = {},
        files = fs.readdirSync('../http/banlist/');
    files.forEach(function (filename) {
        if (filename.indexOf('.js') > -1) {
            var listname = filename.slice(0, -3);
            banlist[listname] = require('../http/banlist/' + '/' + filename);
        }
    });
    return banlist;
}

var banlistfiles = getBanlist();


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

function getotString(ot) {
    switch (ot) {
    case 1:
        return 'OCG';
    case 2:
        return 'TCG';
    case 3:
        return 'OCG/TCG';
    case 4:
        return 'Anime';
    case 5:
        return 'OCG Prerelease';
    case 6:
        return 'TCG Prerelease';
    default:
        return '';
    }
}

function getdates(file) {
    var filebuffer = fs.readFileSync('../http/ygopro/databases/pack/' + file),
        db = new SQL.Database(filebuffer),
        string = "SELECT * FROM pack;",
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
        row,
        i,
        linkMarkers = jsonfile.readFileSync("../http/linkmarkersmap.json"),
        ocg_packs = jsonfile.readFileSync("../http/manifest/manifest_ja-pack.json"),
        tcg_packs = jsonfile.readFileSync("../http/manifest/manifest_en-pack.json"),
        packs = {};

    function getCardObject(id, db) {

        var result = {};
        db.some(function (card, index) {
            if (id === card.id) {
                result = card;
                result.date = new Date(result.date).getTime();
                return true;
            } else {
                return false;
            }
        });

        return result;
    }


    // Bind new values
    texts.bind({
        id: 2
    });
    while (texts.step()) { //
        row = texts.getAsObject();
        row.links = linkMarkers[row.id] || [];
        row.cardpool = getotString(row.ot);
        row.ocg = getCardObject(row.id, ocg_packs);
        row.tcg = getCardObject(row.id, tcg_packs);
        output.push(row);
    }
    db.close();
    return output;
}

function getpacks(file) {
    var filebuffer = fs.readFileSync('../http/ygopro/databases/pack/' + file),
        db = new SQL.Database(filebuffer),
        string = "SELECT * FROM pack;",
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
    newCards.some(function (card, index) {
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
    newCards.some(function (card, index) {
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
        level = String(level); // format: [0-9A-F]0[0-9A-F][0-9A-F]{4}
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
    return output + "<br /><pre class='description'>" + targetCard.desc + "</pre></div>";
}

function generate(callback) {
    fs.writeFileSync('../http/manifest/banlist.json', JSON.stringify(banlistfiles, null, 1));

    fs.readdir('../http/ygopro/databases/pack', function (err, packs) {
        packs.forEach(function (pack) {
            try {
                fs.writeFileSync('../http/manifest/manifest_' + pack.slice(0, -3) + '.json', JSON.stringify(getdates(pack)));
                console.log('    Generated ../http/manifest/manifest_' + pack.slice(0, -3) + '.json');
            } catch (e) {
                console.log(e);
            }
        });
        fs.readdir('../http/ygopro/databases/', function (err, files) {
            var i,
                oldDB,
                newDB;

            for (i = 0; files.length > i; i++) {
                try {
                    fs.writeFileSync('../http/manifest/manifest_' + files[i].slice(0, -4) + '.json', JSON.stringify(getcards(files[i])));
                    console.log('    Generated ../http/manifest/manifest_' + files[i].slice(0, -4) + '.json');
                } catch (e) {

                }
            }
            try {
                oldDB = inversionID(jsonfile.readFileSync('../http/manifest/manifest_old.json'));
                newDB = inversionID(jsonfile.readFileSync('../http/manifest/manifest_0-en-OCGTCG.json'));
                newCards = [];
                Object.keys(newDB).forEach(function (id) {
                    if (oldDB[id] !== undefined) {
                        return;
                    } else {
                        newCards.push(newDB[id]);
                    }
                });
                htmlOutput = '<html><body><head><style>.descContainer {width: 50%;}pre.description {width: 50%;white-space: pre-wrap;}</style>';
                newCards.forEach(function (card) {
                    htmlOutput += '<img src="https://rawgit.com/SalvationDevelopment/YGOPro-Images/master/' + card.id + '.jpg" />';
                });
                newCards.forEach(function (card) {
                    htmlOutput += makeDescription(card.id);
                    htmlOutput += "<br/><hr/>";
                });
                htmlOutput += '</body></html>';
                if (callback) {
                    callback();
                }

            } catch (e2) {
                console.log(e2);
            }
        });
    });
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
    });
}



//update(function () {});
// Load the http module to create an http server.
var http = require('http');

var server = http.createServer(function (request, response) {
    response.writeHead(200, {
        "Content-Type": "text/html"
    });
    update(function (error) {
        response.end(htmlOutput);
        console.log('[Update System Triggered]');
        generate();
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
