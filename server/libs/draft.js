var currentDeck = [];
var currentDraftCards = [];

function newDeck() {
    'use strict';
    currentDeck = [];
    return currentDeck;
}

function loadDraftCards(cardlist) {
    'use strict';
    currentDraftCards = cardlist;
    return currentDraftCards;
}

function chooseDraftCard(cardIndex) {
    'use strict';
    if (cardIndex >= 0 && cardIndex < currentDraftCards.length) {
        currentDeck = currentDeck.concat(currentDraftCards.splice(cardIndex, 1));
        var tempDraftCards = currentDraftCards;
        currentDraftCards = [];
        return tempDraftCards;
    }
}

function sortDeck(maxPerDeck, extraDeckCards) {
    'use strict';
    var psudeoDeck, extraDeck, mainDeck, sideDeck;
    
    psudeoDeck = currentDeck.filter(function (i) {
        return (extraDeckCards.indexOf(i) === -1);
    });
    console.log(psudeoDeck);
    extraDeck = currentDeck.filter(function (i) {
        return (extraDeckCards.indexOf(i) !== -1);
    });
    mainDeck = psudeoDeck.splice(0, maxPerDeck);
    sideDeck = psudeoDeck.splice(0, 15);
    return {
        main: mainDeck,
        extra: extraDeck,
        side: sideDeck
    };
}
    