let speed = 2000;
class Field {
    cast(field, callback) {
        Object.keys(field).forEach((zone) => {
            field[zone].forEach(callback);
            field[zone].forEach(callback);
        });
    }

    render() {
        const cards = Object.keys(this.state.cards)
            .map((card) => {
                return this.state.cards[card].render();
            });

        return [this.state.phase.render()].concat(cards);

    }

    updateField(update) {
        this.cast(update.field, (card) => {
            Object.assign(this.state.cards[card.uid].state, card);
        });
        const count = {
            0: 0,
            1: 0
        };
        this.cast(update.field, (card) => {
            if (card.location === 'HAND') {
                count[this.state.cards[card.uid].state.player]++;
            }
        });
        this.cast(update.field, (card) => {
            if (card.location === 'HAND') {
                Object.assign(this.state.cards[card.uid].state, {
                    handLocation: count[this.state.cards[card.uid].state.player]
                });
            }
        });
        this.state.phase.update(update.info.phase);
        ReactDOM.render(this.render(), this.root);
    }

    constructor(state) {
        this.root = document.getElementById('automationduelfield');
        this.state = {
            cards: [],
            lp: state.info.lifepoints,
            phase: new PhaseIndicator({ phase: state.info.phase })
        };

        this.cast(state.field, (card) => {
            this.state.cards[card.uid] = new CardImage(card);
        });
        ReactDOM.render(this.render(), this.root);
    }
}

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

function generateField() {

    return {
        info: {
            phase: 0
        },
        field: {
            DECK: (new Array(40).fill(newCard('DECK'))).map(scramble).map(setup),
            HAND: (new Array(7).fill(newCard('HAND'))).map(scramble).map(setup).map(setupHand),
            GRAVE: (new Array(40).fill(newCard('GRAVE'))).map(scramble).map(setup),
            EXTRA: (new Array(40).fill(newCard('EXTRA'))).map(scramble).map(setup),
            REMOVED: (new Array(0).fill(newCard('REMOVED'))).map(scramble).map(setup),
            SPELLZONE: (new Array(7).fill(newCard('SPELLZONE'))).map(scramble).map(setup),
            MONSTERZONE: (new Array(7).fill(newCard('MONSTERZONE'))).map(scramble).map(setup),
            EXCAVATED: (new Array(0).fill(newCard('EXCAVATED'))).map(scramble).map(setup)

        }
    };
}


const r = generateField(),
    c = new Field(r);

setInterval(() => {
    c.updateField({
        info: {
            phase: random(0, 7)
        },
        field: {
            DECK: r.field.DECK.map(scramble),
            HAND: r.field.HAND.map(scramble).map(setupHand),
            GRAVE: r.field.GRAVE.map(scramble),
            EXTRA: r.field.EXTRA.map(scramble),
            REMOVED: r.field.REMOVED.map(scramble),
            SPELLZONE: r.field.SPELLZONE.map(scramble),
            MONSTERZONE: r.field.MONSTERZONE.map(scramble),
            EXCAVATED: r.field.EXCAVATED.map(scramble),
        }
    });
    guishuffle(0, 'DECK');
}, (speed));