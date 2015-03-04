var battlePack3 = {
    commons : [],
    rares : [],
    shatterfoils : []
},
    xyzs = [];

function pick(list) {
    'use strict';
    return list[Math.floor(Math.random() * (list.length))];
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

function makeDeck(ofXpacks) {
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
    psudeoDeck = cardpool.filter(function (i) {
	    return (xyzs.indexOf(i) > -1);
    });
    extraDeck = cardpool.filter(function (i) {
	    return (xyzs.indexOf(i) < -1);
    });
    mainDeck = psudeoDeck.splice(0, 39);
    sideDeck = psudeoDeck.splice(39);
    
    return {
        main : mainDeck,
        extra : extraDeck,
        side : sideDeck
    };
}