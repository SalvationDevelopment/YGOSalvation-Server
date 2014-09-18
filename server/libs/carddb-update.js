/* jslint node: true */

var http = require("http"),
    sqlite3 = require("sqlite3").verbose(),
    path = "../../http/ygopro/cards.cdb",
    database = null,
    wikiaQueryString = "action=query&format=json&redirects&prop=revisions&rvprop=content",
    cards = [],
    stats = { success: 0, fail: 0 },
    log = console.log; // works (nodeJS) because the method was created using Function.prototype.bind

function getUrlEncoding (match) {
    switch (match) {
        case "'": return "%27";
        case ".": return "%2E";
        case "!": return "%21";
        case "-": return "%2D";
        case "_": return "%5F";
        case "~": return "%7E";
        case "*": return "%2A";
        case "(": return "%28";
        case ")": return "%29";
    }
}

function encode (value) {
    return encodeURIComponent(value).replace(/[-_.!~*'()]/, getUrlEncoding);	
}

// adds a padding of 0's to the left if necessary
function normalize (id) {
    var stringId = id.toString(),
        normalLength = 8,
        actualLength = stringId.length,
        padding = [];
    
    padding.length = normalLength - actualLength + 1;
    return padding.join("0").concat(stringId);
}

function getWikiaPayload (id, name, callback) {
    var titles = normalize(id), //.concat("|", name),
        path = "/api.php?".concat(wikiaQueryString, "&titles=", encode(titles)),
        options = { host: "yugioh.wikia.com", path: path };
    
    function triggerCallback (json) {
        setTimeout(function () {
            callback(json);
        }, 0);
    }
    
    function handleResponse (response) {
        var payload = [];
        
        response.on("data", function (chunk) {
            payload.push(chunk);
        });
        
        response.on("end", function () {
            var json = JSON.parse(payload.join(""));

            triggerCallback(json);
        });
    }
    
    function handleRequestError (e) {
        log("the request for ", titles, " resulted in error: ", e.message);
    }
    
    http.get(options, handleResponse).on('error', handleRequestError);
}

var failures = [];

function getLoreReplacement (match, capture) {
    var indexOfPipe = capture.indexOf("|");
    
    return indexOfPipe >= 0 ? capture.substr(indexOfPipe + 1) : capture;
}

function parseWikiaPayload (payload) {
    var pages = payload && payload.query && payload.query.pages || {}, 
        key = "",
        toBeParsed = "",
        matches = null,
        parts = null,
        parsed = null,
        i = 0,
        len = 0;
    
    for ( key in pages ) {
        if ( key !== "-1" && pages[key] ) {
            toBeParsed = pages[key].revisions || [];
            toBeParsed = toBeParsed[0] || {};
            toBeParsed = toBeParsed["*"];
            break;
        }
    }
    
    if ( toBeParsed ) {
        matches = /\{\{CardTable2([\s\S]+)\}\}/.exec(toBeParsed);
        
        if ( matches ) {
            parts = matches[1].split(/\|(\w+)\s*=/);
            parsed = {};
            
            for (i = 1, len = parts.length - 1; i < len; i += 2) {
                parsed[parts[i]] = parts[i + 1].trim();
            }
            
            if ( !parsed.lore ) {
                return null;
            }
            
            // e.g. [[Monster Card|monster]] -> monster
            parsed.lore = parsed.lore.replace(/\[\[([\s\S]+?)\]\]/g, getLoreReplacement);
            // e.g. <br /> -> (empty)
            parsed.lore = parsed.lore.replace(/<[\s\S]+?>/g, "");
            // ''Something goes here'' -> Something goes here
            parsed.lore = parsed.lore.replace(/^''|''$/g, "");
        }
    }
    
    return parsed;
}

function update (card, callback) {
    var id = card.alias || card.id,
        name = card.name;
    
    getWikiaPayload(id, name, function (json) {
       var parsed = parseWikiaPayload(json);
        
        if ( parsed ) {
            stats.success += 1;
            log( parsed.lore );
           //log(parsed);
        } else { 
            stats.fail += 1;
            failures.push("#".concat(card.id, " ", card.name));
        }
        
        callback();
    });
}

function processCards (index) {
    if ( index < cards.length ) {
        log("updating ", cards[index], " (", (index + 1), "/", cards.length, ")");
        
        update(cards[index], function () {
            log("success: ", stats.success, ", fail: ", stats.fail);
            log("failures: ", failures);
            
            processCards(index + 1);
        });
    }
}

function handleDatabaseOpen () {
    log("database was opened successfully");
}

function handleDatabaseClose () {
    log("database was closed successfully");
}

database = new sqlite3.Database(path, sqlite3.OPEN_READWRITE);

database.on("open", handleDatabaseOpen);
database.on("close", handleDatabaseClose);

function handleQueryRow (error, row) {
    if ( error ) {
        throw error;
    }
    
    cards.push(row);
}

function handleQueryCompleted (error, count) {
    if ( error ) {
        throw error;
    }
    
    if ( count > 0 ) {
        processCards(0);
    }
}

// TODO: don't get cards with aliases, (when update the db) update card where id OR alias instead

var query = "SELECT `datas`.`id` AS id, `datas`.`alias` as alias, `texts`.`name` as name FROM `datas`, `texts` WHERE `datas`.`id` = `texts`.`id` AND `datas`.`type` <> 16401 AND `datas`.`alias` = 0";

database.each(query, {}, handleQueryRow, handleQueryCompleted);

// waits until all queries have completed
database.close();