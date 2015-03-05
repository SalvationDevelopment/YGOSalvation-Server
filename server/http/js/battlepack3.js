var battlePack3 = {
        commons: [],
        rares: [],
        shatterfoils: []
    },
    xyzs = [];

function pick(list) {
    'use strict';
    return list[Math.floor(Math.random() * (list.length + 1))];
}

function makePack() {
    'use strict';
    var pack = [];
    //ooh a pack of cards

    //ick commons;
    pack.push(pick(battlePack3.commons)).push(pick(battlePack3.commons)).push(pick(battlePack3.commons));

    //ooh a rare
    pack.push(pick(battlePack3.rares));

    //ooh shinny!
    pack.push(pick(battlePack3.shatterfoils));
    return pack;
}

function shuffle(array) {
    'use strict';
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function makeDeck(ofXpacks, asPileofCards) {
    'use strict';
    var cardpool = [],
        psudeoDeck = [],
        mainDeck = [],
        extraDeck = [],
        sideDeck = [],
        opening = 0;
    
    for (opening; ofXpacks > opening; opening++) {
        cardpool.concat(makePack);
    }
    if (asPileofCards) {
        return cardpool;
    }
    cardpool = shuffle(cardpool);
    psudeoDeck = cardpool.filter(function (i) {
        return (xyzs.indexOf(i) > -1);
    });
    extraDeck = cardpool.filter(function (i) {
        return (xyzs.indexOf(i) < -1);
    });
    mainDeck = psudeoDeck.splice(0, 39);
    sideDeck = psudeoDeck.splice(39);

    return {
        main: mainDeck,
        extra: extraDeck,
        side: sideDeck
    };
}

function writeDeckList(deck) {
    'use strict';
    var ydkfile = '',
        mainIter = 0,
        extraIter = 0,
        sideIter = 0;
    ydkfile = ydkfile + '#created by...\r\n';
    ydkfile = ydkfile + '#main\r\n';
    for (mainIter; deck.main.length > mainIter; mainIter++) {
        ydkfile = ydkfile + deck.main[mainIter] + '\r\n';
    }
    ydkfile = ydkfile + '#extra\r\n';
    for (extraIter; deck.extra.length > extraIter; extraIter++) {
        ydkfile = ydkfile + deck.extra[extraIter] + '\r\n';
    }
    ydkfile = ydkfile + '!side\r\n';
    for (sideIter; deck.side.length > sideIter; sideIter++) {
        ydkfile = ydkfile + deck.side[sideIter] + '\r\n';
    }
    return ydkfile;
}



