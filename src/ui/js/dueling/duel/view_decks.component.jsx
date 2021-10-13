/*global React, ReactDOM*/

class DeckDialog extends React.Component {

    constructor(store) {
        super();
        this.store = store;
        this.state = {
            active: false,
            deck: []
        };

        this.store.register('OPEN_DECK', (message) => {
            this.state.deck = message.deck;
            this.state.active = true;
            this.store.dispatch({ action: 'RENDER' });
        });
    }

    click(card, event) {
        this.state.active = false; // create a real close button
        console.log({ action: 'DECK_CARD_CLICK', card, y: event.pageY, x: event.pageX });
        this.store.dispatch({ action: 'DECK_CARD_CLICK', card, y: event.pageY, x: event.pageX });
    }

    img(card, i) {
        const src = `${localStorage.imageURL}/${card.id}.jpg`,
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

    updateContents() {

    }

    close() {
        this.active = false;
    }
}