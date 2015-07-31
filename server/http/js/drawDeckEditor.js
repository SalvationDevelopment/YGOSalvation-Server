function drawDeckEditor(ydk) {
    var ydkCopy = JSON.parse(JSON.stringify(ydk)),
        card,
        cardObject,
        container,
        decks = [
            "main",
            "extra",
            "side"
        ];
    decks.forEach(function(deck) {
        container = $('.' + deck + 'Deck');
        if (container.find('img').length > 0) {
            $('img', container).remove();
            deckStorage.reset(deck);
        }
        for (card in ydkCopy[deck]) {
            if (ydkCopy[deck].hasOwnProperty(card) && ydkCopy[deck].propertyIsEnumerable(card)) {
                while (--ydkCopy[deck][card] >= 0) {
                    cardObject = getCardObject(parseInt(card, 10));
                    container.append(createCardImage(cardObject));
                    deckStorage.addCard(deck, card);
                }
            }
        }
        $('img', container).each(function(index) {
            $(this).addClass(deck + '_card_' + index);
            $(this).data('cardData', 'deckCard');
        });
        attachDnDEvent($('img', container));
        adjustDeckClass(deckStorage.getDeck(deck), container);
    });
}

function drawDeck(target) {
    var targetDeck = deckStorage.getDeck(target),
        container = $('.' + target + 'Deck'),
        cardObject;
    if (container.find('img').length > 0) {
        $('img', container).remove();
        deckStorage.reset(target);
    }
    targetDeck.forEach(function(card) {
        cardObject = getCardObject(parseInt(card, 10));
        container.append(createCardImage(cardObject));
        deckStorage.addCard(target, card);
    });
    $('img', container).each(function(index) {
        $(this).addClass(target + '_card_' + index);
        $(this).data('cardData', 'deckCard');
    });
    attachDnDEvent($('img', container));
    adjustDeckClass(deckStorage.getDeck(target), container);
}