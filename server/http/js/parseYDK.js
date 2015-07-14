function parseYDK(ydkFileContents) {
    var lineSplit = ydkFileContents.split("\r\n"),
        originalValues = {
            "main": {},
            "side": {},
            "extra": {},
            "mainLength": 0,
            "sideLength": 0,
            "extraLength": 0
        },
        current = "";
    lineSplit.forEach(function(value) {
        if (value === "") {
            return;
        }
        if (value[0] === "#" || value[0] === "!") {
            if (originalValues.hasOwnProperty(value.substr(1))) {
                current = value.substr(1);
            } else {
                return;
            }
        } else {
            originalValues[current + "Length"]++;
            if (originalValues[current].hasOwnProperty(value)) {
                originalValues[current][value] = originalValues[current][value] + 1;
            } else {
                originalValues[current][value] = 1;
            }
        }
    });
    return originalValues;
}

function ydkToList(deckObject, options) {
    var output = "",
        multipleEntries = options.multipleEntries,
        formatString = options.formatString || "%ix",
        cards = options.cards,
        decks = ["Main", "Extra", "Side"],
        temp;
    decks.forEach(function(deck) {
        output += deck + " Deck (" + deckObject[deck.toLowerCase() + "Length"] + "):\r\n";
        for (temp in deckObject[deck.toLowerCase()]) {
            if (multipleEntries) {
                output += formatString.replace("%i", deckObject[deck.toLowerCase()][temp]) + " ";
                cards.forEach(function(card) {
                    if (parseInt(temp, 10) === card.id) {
                        output += card.name;
                    }
                });
                output += "\r\n";
            } else {
                while (deckObject[deck.toLowerCase()][temp]--) {
                    cards.forEach(function(card) {
                        if (parseInt(temp, 10) === card.id) {
                            output += card.name + "\r\n";
                        }
                    });
                }
            }
        }
    });
    return output;
}

function getDecklists(callback) {
	try {
		var fs = fs || require("fs");
	} catch(e) {
		throw e;
	}
	fs.readdir('./ygopro/deck', function(err, files) {
		var ret = "";
		files.forEach(function(file) {
			if(!/\.ydk$/.test(file)) {
				return;
			}
			file = file.replace(/\.ydk$/, '');
			ret += '<option value="' + file + '">' + file + '</option>';
		});
		callback(ret);
	});
}

function fillSelect(str) {
	$('#ydkListSelect').html(str);
}