/*jslint node: true, plusplus: true, unparam: false, nomen: true, bitwise:true*/
'use strict';
var time = 0;
var zlib = require('zlib'),
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    domain = require('domain'),
    colors = require('colors'),
    SQL = require('sql.js'),
    jsonfile = require('jsonfile');

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

function getdates(file, callback) {
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

function getcards(file, callback) {
    fs.readFile('../http/ygopro/databases/' + file, function (error, filebuffer) {
        if (error) {
            console.log(error);
        }
        var db = new SQL.Database(filebuffer),
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
        callback(output);
        return output;
    });



    // Bind new values

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



function inversionID(db) {
    var hastable = {};
    db.forEach(function (card) {
        hastable[card.id] = card;
    });

    return hastable;
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


function generate(callback) {
    fs.writeFile('../http/manifest/banlist.json', JSON.stringify(banlistfiles, null, 1), function () {});

    fs.readdir('../http/ygopro/databases/pack', function (err, packs) {
        packs.forEach(function (pack) {
            try {
                fs.writeFileSync('../http/manifest/manifest_' + pack.slice(0, -3) + '.json', JSON.stringify(getdates(pack)));
                console.log('    Generated ../http/manifest/manifest_' + pack.slice(0, -3) + '.json');
            } catch (e) {
                console.log(e);
            }
        });
        getcards('0-en-OCGTCG.cdb', function (output) {
            fs.writeFile('../http/manifest/manifest_0-en-OCGTCG.json', JSON.stringify(output), function () {
                console.log('    Generated ../http/manifest/manifest_0-en-OCGTCG.json');
            });
        });


    });
}




generate();

module.exports = generate;