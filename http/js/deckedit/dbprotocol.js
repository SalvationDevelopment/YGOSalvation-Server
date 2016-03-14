/*jslint browser:true, plusplus:true, nomen: true*/
/*global $, confirm, primus, uniqueID, console, alert*/


function getAllDecks() {
    'use strict';
    primus.write({
        action: 'deck',
        command: 'get',
        deck: true,
        uniqueID: uniqueID
    });
}

function saveDeckAs(deck) {
    'use strict';
    var suggested = $('.decknameInput').val();
    if (suggested.trim().length > 1) {
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
    setTimeout(getAllDecks, 500);
}

function saveDeck(deck, index) {
    'use strict';
    deck._id = deckfiles[index]._id;
    deck.name = deckfiles[index].name;
    console.log('I UNDERSTAND THE ID AS:', deck._id);
    if (!deck._id || !deck.name) {

        console.log('looks like its not a good deck, doing save as..');
        saveDeckAs(deck);
        return;
    }
    primus.write({
        action: 'deck',
        command: 'save',
        deck: deck,
        uniqueID: uniqueID
    });
    console.log('attempting to save', deck, index);
    setTimeout(getAllDecks, 500);
    window.activeDeckSelect = index;
}

function deleteADeck(deck) {
    'use strict';
    primus.write({
        action: 'deck',
        command: 'delete',
        deck: deck,
        uniqueID: uniqueID
    });
    setTimeout(getAllDecks, 500);
}