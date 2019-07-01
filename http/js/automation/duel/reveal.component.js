/*global React, ReactDOM*/

class Revealer extends React.Component {

    constructor(store) {
        super();
        this.root = document.getElementById('revealer');
        this.store = store;
        this.state = {
            active: false
        };
    }

    click(selected, option) {
        this.state.active = false;
        this.store.dispatch({ action: 'REVEAL_CARD_CLICK', option, selected });
        this.store.dispatch({ action: 'RENDER' });

    }

    img(card, i) {
        const src = `http://127.0.0.1:8887/${card.id}.jpg`,
            onClick = this.click.bind(this, card.selected, i);

        return React.createElement('img', { className: (card.selected) ? 'selected' : '', src, onClick });
    }
    render() {
        if (this.state.active) {
            return React.createElement('div', {
                style: {
                    display: 'flex'
                }, id: 'revealed'
            }, this.state.cards.map((card, i) => this.img(card, i)));
        }
        return '';
    }

    trigger(state) {
        Object.assign(this.state, state);
        this.state.active = true;
    }

    close() {
        this.state.cards = [];
        this.active = false;
    }
}