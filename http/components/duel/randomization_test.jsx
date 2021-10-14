
let speed = 2000;
function guishuffle(player, deck) {
    'use strict';
    var orientation = (player === 'p0') ? ({
        x: 'left',
        y: 'bottom',
        direction: 1
    }) : ({
        x: 'right',
        y: 'top',
        direction: -1
    });
}

function random(min, max) {
    return Math.floor(Math.random() * max) - min;
}

function scramble(source) {
    if (random(0, 10) > 5) {
        return source;
    }
    var states = ['FaceUp', 'FaceDown', 'FaceDownDefence', 'FaceUpDefence'];
    return {
        type: 'card',
        location: source.location,
        id: source.id,
        index: (source.location === 'DECK' || source.location === 'GRAVE' || source.location === 'EXTRA') ? random(0, 40) : random(0, 7),
        position: states[random(0, states.length + 1)],
        overlayindex: 0,
        uid: source.uid,
        originalcontroller: random(0, 2),
        counters: 0
    };
}

function newCard(zlocation) {

    return {
        location: zlocation
    };
}

function setup(source) {
    var cards = [46986415,
        70781052,
        28279543,
        90876561,
        39256679,
        11549357,
        25652259,
        5818798,
        99785935,
        41392891,
        13039848,
        75347539,
        72989439,
        78193831,
        38033122,
        95727991,
        64788463,
        71413901,
        52077741,
        65240384,
        80344569,
        31305911,
        40640057,
        57116034,
        2314238,
        19613556,
        24094653,
        25774450,
        43434803,
        66788016,
        72302403,
        72892473,
        83764718,
        87880531,
        99789342,
        5318639,
        67227834,
        83746708,
        44095762,
        44095762,
        60082869,
        62279055,
        83133491,
        18807108
    ];

    source.id = cards[random(0, cards.length + 1)];
    source.player = random(0, 2);
    source.uid = random(0, 1211111111111111111);
    return source;
}

function setupHand(source, i) {
    source.position = (random(0, 2)) ? 'FaceUp' : 'FaceDown';
    return source;
}

function shuffle(deck) {
    var j, x, index;
    for (index = deck.length; index; index -= 1) {
        j = Math.floor(Math.random() * index);
        x = deck[index - 1];
        deck[index - 1] = deck[j];
        deck[j] = x;
    }
}

function handShuffle(hand) {
    shuffle(hand);
    function finalize(card, index) {
        card.index = index; // finalize the shuffle
        return card;
    }
    const p0 = hand.filter((card) => !card.player).map(finalize),
        p1 = hand.filter((card) => card.player).map(finalize);

    return [].concat(p0, p1);
}

function generateField() {

    return {
        info: {
            phase: 0,
            lifepoints: [8000, 8000]
        },
        field: {
            DECK: (new Array(40).fill(newCard('DECK'))).map(scramble).map(setup),
            HAND: (new Array(7).fill(newCard('HAND'))).map(scramble).map(setup).map(setupHand),
            GRAVE: (new Array(40).fill(newCard('GRAVE'))).map(scramble).map(setup),
            EXTRA: (new Array(40).fill(newCard('EXTRA'))).map(scramble).map(setup),
            BANISHED: (new Array(0).fill(newCard('BANISHED'))).map(scramble).map(setup),
            SPELLZONE: (new Array(7).fill(newCard('SPELLZONE'))).map(scramble).map(setup),
            MONSTERZONE: (new Array(7).fill(newCard('MONSTERZONE'))).map(scramble).map(setup),
            EXCAVATED: (new Array(0).fill(newCard('EXCAVATED'))).map(scramble).map(setup)

        }
    };
}



store.listen('UPDATE_FIELD', (event, state) => {
    const newState = {
        info: {
            phase: random(0, 7),
            lifepoints: [random(0, 16000), random(0, 16000)]
        },
        field: {
            DECK: handShuffle(r.field.DECK.map(scramble)),
            HAND: handShuffle(r.field.HAND.map(scramble).map(setupHand)),
            GRAVE: handShuffle(r.field.GRAVE.map(scramble)),
            EXTRA: handShuffle(r.field.EXTRA.map(scramble)),
            BANISHED: handShuffle(r.field.BANISHED.map(scramble)),
            SPELLZONE: r.field.SPELLZONE.map(scramble),
            MONSTERZONE: r.field.MONSTERZONE.map(scramble),
            EXCAVATED: r.field.EXCAVATED.map(scramble)
        }
    };
    field.updateField(newState);
    guishuffle(0, 'DECK');
    return newState;
});

// setInterval(() => {
//     store.hey({ action: 'UPDATE_FIELD' });
// }, speed);


field.controls.update({
    summonable_cards: [],
    spsummonable_cards: [],
    repositionable_cards: [],
    msetable_cards: [],
    ssetable_cards: [
        { player: 0, location: 'SPELLZONE', index: 0 },
        { player: 0, location: 'SPELLZONE', index: 1 },
        { player: 0, location: 'SPELLZONE', index: 2 },
        { player: 0, location: 'SPELLZONE', index: 3 },
        { player: 0, location: 'SPELLZONE', index: 4 }
    ],
    activatable_cards: [],
    select_options: [],
    attackable_cards: []
});