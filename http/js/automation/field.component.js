/*global React, ReactDOM,  */
/*global  PhaseIndicator, FieldSelector, CardImage*/
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

        return [].concat(
            cards,
            this.state.phase.render(),
            this.state.selectors.render()
        );
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
    }

    disableSelection() {
        this.state.selectors.disableSelection();
    }

    select(query) {
        this.state.selectors.select(query);
    }

    constructor(state, store) {

        this.state = {
            cards: [],
            phase: new PhaseIndicator({ phase: state.info.phase }),
            selectors: new FieldSelector(store)
        };

        this.cast(state.field, (card) => {
            this.state.cards[card.uid] = new CardImage(card, store);
        });
    }
}