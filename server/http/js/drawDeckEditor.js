function drawDeckEditor(ydk) {
    var card,
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
        for (card in ydk[deck]) {
            if (ydk[deck].hasOwnProperty(card) && ydk[deck].propertyIsEnumerable(card)) {
                while (--ydk[deck][card] >= 0) {
                    container.append('<img src="' + imgDir + card + '.jpg" data-card-id="' + card + '" />');
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
        container = $('.' + target + 'Deck');
    if (container.find('img').length > 0) {
        $('img', container).remove();
        deckStorage.reset(target);
    }
    targetDeck.forEach(function(card) {
        container.append('<img src="' + imgDir + card + '.jpg" data-card-id="' + card + '" />');
        deckStorage.addCard(target, card);
    });
    $('img', container).each(function(index) {
        $(this).addClass(target + '_card_' + index);
        $(this).data('cardData', 'deckCard');
    });
    attachDnDEvent($('img', container));
    adjustDeckClass(deckStorage.getDeck(target), container);
}