import React from 'react';
/*global  PhaseIndicator, FieldSelector, CardImage, $*/


function layouthand(player) {
    'use strict';
    var count = $('.p' + player + '.HAND').length,
        f = 75 / 0.8,
        xCoord,
        sequence;
    //    console.log(count,f,xCoord);
    for (sequence = 0; sequence < count; sequence += 1) {
        xCoord = (count < 6)
            ? (5.5 * f - 0.8 * f * count) / 2 + 1.55 * f + sequence * 0.8 * f
            : xCoord = 1.9 * f + sequence * 4.0 * f / (count - 1);

        $('.p' + player + '.HAND.i' + sequence).css('left', String() + xCoord + 'px');
    }
}


function cardmargin(player, deck) {
    'use strict';
    var multi = 1;
    $('.card.p' + player + '.' + deck).each(function (i) {
        var n = $(this).attr('data-index');
        $(this).attr('style', '').css({
            '-webkit-transform': 'translate3d(0,0,' + n + 'px)',
            'z-index': (n * multi)
        });
    });

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
    cardmargin(player, deck);
    $($('.card.' + player + '.' + deck).get().reverse()).each(function (i) {
        var cache = $(this).css(orientation.x),
            spatical = Math.floor((Math.random() * 100) - 50);
        $(this).css(orientation.x, '-=' + spatical + 'px');
    });

}

function doGuiShuffle(player, deck) {
    'use strict';
    var action = setInterval(function () {
        guishuffle('p' + player, deck);
        setTimeout(function () {
            cardmargin(String() + player, deck);
        }, 50);
    }, 200);
    setTimeout(function () {
        clearInterval(action);
        cardmargin(String() + player, deck);
        setTimeout(function () {
            layouthand(player);
        }, 500);

    }, 1000);
    guishuffle('p' + player, deck);
}

export default class Field {
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

        return [].concat(
            cards,
            this.state.phase.render(),
            this.state.selectors.render()
        );
    }

    updateField(update) {
        this.cast(update, (card) => {
            let dbEntry = {};
            if (!this.state.cards[card.uid]) {
                this.state.cards[card.uid] = new CardImage(card, this.store);
            }
            if (this.state.cards[card.uid].state.id !== card.id) {
                dbEntry = app.duel.info.databaseSystem.find((entry) => entry.id === card.id) || {};
            }
            Object.assign(this.state.cards[card.uid].state, dbEntry, card);
        });
        const count = {
            0: 0,
            1: 0
        };
        this.cast(update, (card) => {
            if (card.location === 'HAND') {
                count[this.state.cards[card.uid].state.player]++;
            }
        });
        this.cast(update, (card) => {
            if (card.position === 'MONSTERZONE') {
                console.log(card, new Error());
            }
            if (card.location === 'HAND') {
                Object.assign(this.state.cards[card.uid].state, {
                    handLocation: count[this.state.cards[card.uid].state.player]
                });
            }
        });
    }

    disableSelection() {
        this.state.selectors.disableSelection();
    }

    select(query) {
        this.state.selectors.select(query);
    }

    phase(value) {
        this.state.phase.update(value);
    }

    getDeck(player, location) {

        const deck = Object.keys(this.state.cards).filter((guid) => {
            var cardImage = this.state.cards[guid];
            return (cardImage.state.location === location) && (cardImage.state.player === player);
        }).map((guid) => {
            var cardImage = this.state.cards[guid];
            return {
                id: cardImage.state.id,
                location: cardImage.state.location,
                index: cardImage.state.index
            };
        });
        return deck;
    }

    constructor(state, store) {
        this.store = store;
        this.state = {
            cards: {},
            phase: new PhaseIndicator(store, { phase: state.info.phase }),
            selectors: new FieldSelector(store)
        };

        this.cast(state.field, (card) => {
            card.orientSlot = window.orientation;
            this.state.cards[card.uid] = new CardImage(card, store);
        });
    }
}