/*global React, ReactDOM*/

class DeckDialog extends React.Component {

    constructor(store) {
        super();
        this.store = store;
        this.state = {
            active: false,
            deck: []
        };

        this.store.register('VIEW_DECK', (message) => {
            this.trigger(message);
        });
    }

    click(card, event) {
        this.state.active = false;
        console.log({ action: 'DECK_CARD_CLICK', card, y: event.pageY, x: event.pageX });
        this.store.dispatch({ action: 'DECK_CARD_CLICK', card, y: event.pageY, x: event.pageX });
    }

    img(card, i) {
        const src = `http://127.0.0.1:8887/${card.id}.jpg`,
            onClick = this.click.bind(this, card);

        return React.createElement('img', { className: (card.selected) ? 'selected' : '', src, onClick });
    }
    render() {
        if (this.state.active || this.state.deck.legnth) {
            return React.createElement('div', {
                style: {
                    display: 'block'
                }, id: 'revealed'
            }, this.state.deck.map((card, i) => this.img(card, i)));
        }
        return '';
    }

    trigger(state) {
        Object.assign(this.state, state);
        this.state.active = true;
    }

    updateContents() {

    }

    close() {
        this.active = false;
    }
}