
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
        this.state.lp.update(update.info);
        this.state.phase.update(update.info.phase);
        ReactDOM.render(this.render(), this.root);
    }

    constructor(state, store) {
        this.root = document.getElementById('automationduelfield');
        this.state = {
            cards: [],
            lp: new LifepointDisplay(state.info),
            phase: new PhaseIndicator({ phase: state.info.phase })
        };

        this.cast(state.field, (card) => {
            this.state.cards[card.uid] = new CardImage(card, store);
        });
        this.state.lp.update();
        ReactDOM.render(this.render(), this.root);
    }
}