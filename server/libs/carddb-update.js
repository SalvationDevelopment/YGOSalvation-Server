/* jslint node: true */

var http = require("http"),
    sqlite3 = require("sqlite3").verbose(),
    filepath = "../../http/ygopro/cards.cdb",
    wikiaQuery = "/api.php?action=query&format=json&redirects&prop=revisions&rvprop=content&titles=",
    events = require("events"),
    phases = new events.EventEmitter(),
    aliases = {},
    statistics = [],
    failQueue = [],
    log = console.log; // works (nodeJS) because the method was created using Function.prototype.bind

function getDatabaseCards (callback) {
    var database = new sqlite3.Database(filepath, sqlite3.OPEN_READONLY),
        query = ["SELECT d.`id` AS id, d.`alias` AS alias, t.`name` AS name ",
                 "FROM `datas` AS d INNER JOIN `texts` AS t ON d.`id` = t.`id` ",
                 "WHERE d.`type` <> 16401;"].join(""),
        cards = [],
        queryError = null;
    
    // we get all the cards, except for tokens
    database.each(query, function (error, row) {
        var ids = null;
        
        if ( error ) {
            queryError = error;
            return;
        }
        
        if ( row.alias ) {
            ids = aliases[row.alias] || [];
            ids.push(row.id);
            aliases[row.alias] = ids;
        } else {
            cards.push(row);
        }
    });
    
    database.close();
    
    database.on("close", function () {
        // throw error after db connection was closed
        if ( queryError ) {
            throw queryError;
        }
        
        callback(cards);  
    });
}

function updateDatabase (changes, callback)  {
    var database = new sqlite3.Database(filepath, sqlite3.OPEN_READWRITE),
        updateError = null;
    
    database.serialize(function () {
        var query = "UPDATE `texts` SET `desc` = $desc WHERE `id` = $id",
            statement = database.prepare(query);
        
        statement.on("error", function (error) {
            updateError = error;
        });
        
        Object.keys(changes).forEach(function (id) {
            var desc = changes[id].lore;
            
            log("updating #", id);
            statement.run({ $id: id, $desc:  desc });
            
            // wish I could use a join, but the sqlite syntax for UPDATE doesn't allow it
            // http://sqlite.org/lang_update.html
            (aliases[id] || []).forEach(function (alias) {
                log("updating #", alias, " (alias for #", id, ")");
                statement.run({ $id: alias, $desc: desc });
            });
        });
        
        statement.finalize();
    });
    
    database.close();
    
    database.on("close", function () { 
        // throw error after db connection was closed
        if ( updateError ) {
            throw updateError;
        }
        
        callback();
    });
}

function getUrlEncoding (character) {
    switch (character) {
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

function getWikiaPayload (titles, callback) {
    var titlesComponent = titles.join("|"),
        path = wikiaQuery + encode(titlesComponent),
        options = { host: "yugioh.wikia.com", path: path };
    
    function handleResponse (response) {
        var payload = [];
        
        response.on("data", function (chunk) {
            payload.push(chunk);
        });
        
        response.on("end", function () {
            var json = JSON.parse(payload.join(""));

            // there's no need to call this in a timeout since
            // the event is emitted within a process.nextTick callback
            callback(json);
        });
    }
    
    function handleRequestError (e) {
        log("the request for ", titles, " resulted in error: ", e.message);
    }
    
    http.get(options, handleResponse).on('error', handleRequestError);
    log("request for ", titlesComponent ," was sent to wikia");
}

function getLoreReplacement (match, capture) {
    var indexOfPipe = capture.indexOf("|");
    
    return indexOfPipe >= 0 ? capture.substring(indexOfPipe + 1) : capture;
}

function sanitize (data) {
    var lore = data.lore;
    
    // e.g. [[Monster Card|monster]] -> monster
    lore = lore.replace(/\[\[([\s\S]+?)\]\]/g, getLoreReplacement);
    // e.g. <br /> -> (empty)
    lore = lore.replace(/<[\s\S]+?>/g, "");
    // ''Something goes here'' -> Something goes here
    lore = lore.replace(/^''|''$/g, "");
    
    data.lore = lore;
    
    // add more clean-up code here, if needed
    
    return data;
}

function parseWikiaPage (page) {
    var content = "",
        body = null,
        matches = null,
        parts = null,
        parsed = null,
        i = 0,
        len = 0;
    
    parsed = {
        title: page.title,
        body: null
    };
    
    content = page.revisions || [];
    content = content[0] || {};
    content = content["*"];
    
    if ( content ) {
        matches =  /\{\{CardTable2([\s\S]+)\}\}/.exec(content);
        
        if ( matches ) {
            parts = matches[1].split(/\|(\w+)\s*=/);

            body = {};
            
            for (i = 1, len = parts.length - 1; i < len; i += 2) {
                if ( !body[ parts[i] ] ) {
                    body[ parts[i] ] = parts[i + 1].trim();
                }
            }

            // all cards should have a 'lore' section
            if ( !body.lore ) { 
                body = null;
            }
            
            if ( body ) {
                sanitize(body);
            }
            
            parsed.body = body;
        }
    }
    
    return parsed;
}

function parseWikiaPayload (payload) {
    var query = payload && payload.query || {},
        pages = query.pages || {},
        redirects = query.redirects || [],
        links = {},
        successCollection = [],
        failCollection = [];
    
    redirects.forEach(function (redirect) {
        links[redirect.to] = redirect.from;
    });
    
    function getQueryTitle (title) {
        while ( links[title] ) {
            title = links[title];
        }
        return title;
    }
    
    Object.keys(pages).forEach(function (key) {
        var page = pages[key],
            parsed = parseWikiaPage(page),
            body = parsed.body;
        
            parsed.queryTitle = getQueryTitle(parsed.title);
        
        (body ? successCollection : failCollection).push(parsed);
    });
    
    return { 
        successCollection: successCollection, 
        failCollection: failCollection
    };
}

function update (cards, queryComponentSelector, callback) {
    var titles = [],
        map = {};
    
    cards.forEach(function (card) {
        var title = queryComponentSelector(card);
        
        map[title] = card;
        titles.push(title);
    });
    
    getWikiaPayload(titles, function (json) {
       var results = parseWikiaPayload(json),
           successCollection = results.successCollection,
           failCollection = results.failCollection,
           stats = statistics[statistics.length - 1],
           changes = {};
        
        successCollection.forEach(function (parsed) {
            var id = map[parsed.queryTitle].id;
            changes[id] = parsed.body;
        });
        
        failCollection.forEach(function (parsed) {
           failQueue.push(map[parsed.queryTitle]); 
        });
        
        stats.success += successCollection.length;
        stats.fail += failCollection.length;
        
        log(stats);
        log("failQueue: ", failQueue);
         
        updateDatabase(changes, callback);
    });
}

function processCards (iterator, queryComponentSelector, completionEventName) {
    var cards = iterator.getNextBatch();
    
    if ( cards.length ) {
        update(cards, queryComponentSelector, function () {
            processCards(iterator, queryComponentSelector, completionEventName);
        });
    } else {
        process.nextTick(function () {
            phases.emit(completionEventName);
        });
    }
}

function createBatchIterator(list, start, length) {
    var from = start;
    
    function getNextBatch () {
        var end = from + length,
            batch = list.slice(from, end);
            
        from = end;
            
        return batch;
    }
    
    function reset () {
        from = start;
    }
    
    return {
        getNextBatch: getNextBatch,
        reset: reset
    };
}

// adds a padding of 0's to the left if necessary
function normalize (id) {
    var stringId = id.toString(),
        normalLength = 8,
        actualLength = stringId.length,
        padding = [];
    
    padding.length = normalLength - actualLength + 1;
    return padding.join("0") + stringId;
}

function queryUsingId (card) {
    return normalize(card.id);
}

function queryUsingName (card) {
    return card.name;
}

function processDbCards (dbCards, callback) {
    var dbCardsIterator = createBatchIterator(dbCards, 0, 5);
    
    log("db cards processing started");
    statistics.push({ name: "initial iteration", success: 0, fail: 0 });

    processCards(dbCardsIterator, queryUsingId, "dbCardsProcessingCompleted");
        
    phases.on("dbCardsProcessingCompleted", function () {
        log("db cards processing ended");
        callback();
    });
}

function processFailedCards () {
    var failedCards = failQueue.slice(0),
        failedCardsIterator = createBatchIterator(failedCards, 0, 5);
    
    failQueue.length = 0;
        
    log("failed cards processing started");
    statistics.push({ name: "failed cards iteration", success: 0, fail: 0 });
        
    processCards(failedCardsIterator, queryUsingName, "failedCardsProcessingCompleted");
    
    phases.on("failedCardsProcessingCompleted", function () {
        log("failed cards processing ended");
    });
}

getDatabaseCards(function (dbCards) {
    processDbCards(dbCards, processFailedCards);
});
