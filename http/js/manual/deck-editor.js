/*global currentMousePos, getCardObject, reorientmenu, cardIs, $*/



var deckEditor = (function () {
    'use strict';
    var usersDecks = [],
        activeIndex = 0;

    function makeBlankDeck(name, username, date) {
        return {
            main: [],
            extra: [],
            side: [],
            name: [],
            creator: username,
            creationDate: date
        };
    }

    function makeNewDeck(name) {
        usersDecks.push(makeBlankDeck(name, localStorage.nickname, new Date()));
        return usersDecks[usersDecks.length - 1];
    }

    function updateDeckSelect() {
        var text = '';
        usersDecks.forEach(function (deck, index) {
            text += '<option data-index=' + index + '>' + deck.name + '</option>';
        });
        return text;
    }

    function makeCard(cards, zone) {
        var html = '';
        cards.forEach(function (card, index) {
            var hardcard = JSON.stringify(card),
                src = 'ygopro/pics/' + card + '.jpg';
            html += '<img class="deckeditcard" src="http://ygopro.us/' + src + '" data-"' + card + '" onclick = "deckeditonclick(' + index + ', \'' + zone + '\')" / > ';
        });

        $('.deckeditzone .' + zone).html(html);
        //$('#subreveal').width(cards.length * 197);
    }

    function deckeditonclick(index, zone) {


        $('#manualcontrols button').css({
            'display': 'none'
        });

        $('#manualcontrols').css({
            'top': currentMousePos.y,
            'left': currentMousePos.x,
            'display': 'block'
        });
        var sideReference = {
                id: usersDecks[activeIndex][zone][index],
                zone: zone,
                index: index
            },
            dbEntry = getCardObject(parseInt(sideReference.id, 10));
        if (sideReference.zone === 'main') {
            $('.s-toside').css({
                'display': 'block'
            });

        }
        if (sideReference.zone === 'extra') {
            $('.s-toside').css({
                'display': 'block'
            });
        }
        if (sideReference.zone === 'side') {
            if (cardIs('xyz', dbEntry) || cardIs('fusion', dbEntry) || cardIs('synchro', dbEntry)) {
                $('.s-toextra').css({
                    'display': 'block'
                });
            } else {
                $('.s-tomain').css({
                    'display': 'block'
                });
            }
        }
        reorientmenu();
        return;
    }


    return {
        updateDeckSelect: updateDeckSelect
    };
}());