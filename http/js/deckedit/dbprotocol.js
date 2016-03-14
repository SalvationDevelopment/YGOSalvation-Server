/*jslint browser:true, plusplus:true, nomen: true*/
/*global $, confirm, primus, uniqueID, console, alert*/



function saveDeckAs(deck) {
    'use strict';
    var suggested = $('.decknameInput').val();
    if (suggested.trim().length < 1) {
        if (confirm('Deck needs a name! is ' + $('.decknameInput').val() + ' ok?')) {
            deck.name = suggested;
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
        } else {
            alert('Name the Deck!');
            return;
        }
    }
}

function saveDeck(deck) {
    'use strict';
    if (!deck._id || !deck.name) {
        saveDeckAs(deck);
        return;
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
    'use strict';
    primus.write({
        action: 'deck',
        command: 'delete',
        deck: deck,
        uniqueID: uniqueID
    });
}

function getAllDecks() {
    'use strict';
    primus.write({
        action: 'deck',
        command: 'get',
        deck: true,
        uniqueID: uniqueID
    });
}