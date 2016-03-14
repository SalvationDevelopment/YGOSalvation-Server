function saveADeck(deck) {
    try {
        if (deck.name.length < 1) {
            var suggested = $('.decknameInput').val();
            if (suggested.trim().length === 0) {
                alert('Name the Deck!');
                return;
            }
            if (confirm('Deck needs a name! is ' + $('.decknameInput').val() + ' ok?')) {
                deck.name = suggested;
            } else {
                return;
            }
        }
    } catch (errorCode) {
        var suggested = $('.decknameInput').val();
        if (confirm('Deck needs a name! is ' + $('.decknameInput').val() + ' ok?')) {
            deck.name = suggested;
        } else {
            return;
        }
    }
    if (deck.name.length < 1) {
        var suggested = $('.decknameInput').val();
        if (confirm('Deck needs a name! is ' + $('.decknameInput').val() + ' ok?')) {
            deck.name = suggested;
        } else {
            return;
        }
    }
    primus.write({
        action: 'deck',
        command: 'save',
        deck: deck,
        uniqueID: uniqueID
    });
    console.log({
        action: 'deck',
        command: 'save',
        deck: deck,
        uniqueID: uniqueID
    });
}

function deleteADeck(deck) {
    primus.write({
        action: 'deck',
        command: 'delete',
        deck: deck,
        uniqueID: uniqueID
    });
}

function getAllDecks() {
    primus.write({
        action: 'deck',
        command: 'get',
        deck: true,
        uniqueID: uniqueID
    });
}