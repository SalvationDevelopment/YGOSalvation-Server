// choose-deck.js
var fs = require('fs');

function chooseDeck(SELECTED_DECK) {
    fs.readdir('/decks', function(err, files) {
        if (err !== null) { // we got a serious problem, officer!
            // writeErrorLog(err);
        } else {
            var decks = {},
                deckName, randomDeck;
            if (SELECTED_DECK !== null) {
                files.forEach(function(fileName) {
                    deckName = fileName.split('.')[0];
                    decks[deckName] = {
                        fileName: fileName,
                        deckName: deckName
                    }
                });
                if (decks.hasOwnProperty(SELECTED_DECK) && decks.propertyIsEnumerable(SELECTED_DECK)) {
                    // passToAI(decks[SELECTED_DECK]);
                } else {
                    // deck was selected but not in the library, just log it
                    console.log("Selected deck is not in the deck library.");
                }
            } else {
                // no deck was selected, so we just return a random deck
                randomDeck = files[Math.floor(Math.random() * files.length)];
                /* passToAI({
                    fileName: randomDeck,
                    deckName: randomDeck.split('.')[0]
                }); */
            }
        }
    });
}