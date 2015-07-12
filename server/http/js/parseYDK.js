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
        if (value[0] === "#" || value[0] === "!") {
            if (originalValues.hasOwnProperties(value.substr(1))) {
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
        for (temp in deckObject[deck]) {
            if (multipleEntries) {
                output += formatString.replace("%i", deckObject[deck][temp]) + " ";
                cards.forEach(function(card) {
                    if (temp === card.id) {
                        output += card.name;
                    }
                });
                output += "\r\n";
            } else {
                while (deckObject[deck][temp]--) {
                    cards.forEach(function(card) {
                        if (temp === card.id) {
                            output += card.name + "\r\n";
                        }
                    });
                }
            }
        }
    });
    return output;
}