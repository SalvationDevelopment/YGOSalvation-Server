
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

    disableSelection() {
        this.state.selectors.disableSelection();
        ReactDOM.render(this.render(), this.root);
    }

    select(query) {
        this.state.selectors.select(query);
        ReactDOM.render(this.render(), this.root);
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

    flash(card) {
        this.flasher.trigger(card);
    }

    reveal(cards) {
        this.revealer.trigger({ active: true, cards });
    }

    closeRevealer() {
        this.revealer.trigger({ active: false });
    }

    constructor(state, store) {
        this.root = document.getElementById('automationduelfield');
        this.flasher = new Flasher({});
        this.revealer = new Revealer(store);
        this.state = {
            cards: [],
            lp: new LifepointDisplay(state.info),
            phase: new PhaseIndicator({ phase: state.info.phase }),
            selectors: new FieldSelector(store)
        };

        this.cast(state.field, (card) => {
            this.state.cards[card.uid] = new CardImage(card, store);
        });
        this.state.lp.update();
        ReactDOM.render(this.render(), this.root);
    }
}