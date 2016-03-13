/* jslint node: true */

var http = require("http"),
    sqlite3 = require("sqlite3").verbose(),
    filepath = "../../http/ygopro/cards.cdb",
    wikiaQuery = "/api.php?action=query&format=json&redirects&prop=revisions&rvprop=content&titles=",
    events = require("events"),
    phases = new events.EventEmitter(),
    log = console.log; // works (nodeJS) because the method was created using Function.prototype.bind

function logIteration (iteration) {
    var s = iteration.statistics,
        m = [iteration.name, ' (', s.progress, '/', s.total, '): ',
             'success: ', s.success, ', fail: ', s.fail].join('');
    log(m);
}

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
        
        if (error) {
            queryError = error;
            return;
        }
        
        cards.push(row);
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
            statement.run({ $id: id, $desc:  changes[id].lore });
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

// had to do it manually, couldn't rely on regex for this job
function getCardDataFromWikiaRevision (input) {
	var i = 0, 
        len = input.length,
		stack = [], 
        sections = [],
		from = 0,
        until = 0,
		openToken = '{',
        closeToken = '}',
		cardTableSection = '{{CardTable2';
		
	for (; i < len; i += 1) {
		if ( input.charAt(i) === openToken && input.charAt(i + 1) === openToken ) {
			stack.push(i);
		} else if ( input.charAt(i) === closeToken && input.charAt(i + 1) === closeToken ) {
			from = stack.pop();
			until = i + 2;
			sections.push(input.substring(from, until));
		}
	}
	
	i = 0;
	len = sections.length;
	for (; i < len; i += 1) {
		if ( sections[i].indexOf(cardTableSection) === 0 ) {
			break;
		}
	}
	
	if ( typeof sections[i] === 'string' ) {
		return sections[i].substring(cardTableSection.length, sections[i].length - 2);
	}
	
	return null;
}

function parseWikiaPage (page) {
    var content = "",
        body = null,
        cardData = null,
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
        cardData = getCardDataFromWikiaRevision(content);
        
        if ( cardData ) {
            parts = cardData.split(/\|(\w+)\s*=/);

            body = {};
            
            for (i = 1, len = parts.length - 1; i < len; i += 2) {
                body[ parts[i] ] = parts[i + 1].trim();
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

function update (cards, iteration, callback) {
    var titles = [],
        map = {};
    
    cards.forEach(function (card) {
        var title = iteration.query(card),
			values = map[ title ] || [];
			
		values.push(card);
		map[ title ] = values;
		
        titles.push(title);
    });
    
    getWikiaPayload(titles, function (json) {
       var results = parseWikiaPayload(json),
           changes = {},
           success = 0,
           fail = 0;
        
        results.successCollection.forEach(function (parsed) {
            var values = map[ parsed.queryTitle ];
			
            success += values.length;
			values.forEach(function (card) {
				changes[ card.id ] = parsed.body;
			});
        });
        
        results.failCollection.forEach(function (parsed) {
			var values = map[ parsed.queryTitle ];
            
            fail += values.length;
			iteration.failQueue = iteration.failQueue.concat(values); 
        });
        
        iteration.statistics.success += success;
        iteration.statistics.fail += fail;
        iteration.statistics.progress += cards.length;
        
        logIteration(iteration);

        updateDatabase(changes, callback);
    });
}

function processCards (iterator, iteration, completionEventName) {
    var cards = iterator.getNextBatch();
    
    if ( cards.length ) {
        update(cards, iteration, function () {
            processCards(iterator, iteration, completionEventName);
        });
    } else {
        process.nextTick(function () {
            phases.emit(completionEventName);
        });
    }
}

function createBatchIterator (list, start, length) {
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

function getId (card) {
    return normalize(card.id);
}

function getAlias (card) {
    return normalize(card.alias);
}

function getName (card) {
    return card.name;
}

function startIteration (cards, options, callback) {
    var step = 5, // cards per request
        iterator = createBatchIterator(cards, 0, step),
        completionEventName = "iterationCompleted",
        iteration = {};

    iteration.name = options.name;
    iteration.query = options.query;
    iteration.statistics = { success: 0, fail: 0, progress: 0, total: cards.length };
    iteration.failQueue = [];
    
    log(iteration.name + " started");
        
    processCards(iterator, iteration, completionEventName);
    
    phases.once(completionEventName, function () {
        log(iteration.name + " ended");
        callback(iteration);
    });
}

getDatabaseCards (function (dbCards) {
    var trials = [], current = 0;
    
    trials.push({ name: 'initial iteration', query: getId });
    trials.push({ name: 'failed cards iteration #1', query: getAlias });
    trials.push({ name: 'failed cards iteration #2', query: getName });
    
    function handleIterationCompleted (iteration) {
        current += 1;
        if ( current < trials.length ) {
            startIteration(iteration.failQueue, trials[current], handleIterationCompleted);
        }
    }

    startIteration(dbCards, trials[0], handleIterationCompleted);
});
