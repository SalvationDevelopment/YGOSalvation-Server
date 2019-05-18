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

    click(card) {
        this.store.dispatch({ action: 'REVEAL_CARD_CLICK', card: this.state });
    }

    img(card) {
        const src = `http://127.0.0.1:8887/${card.id}.jpg`,
            onClick = this.click.bind(this, card);

        return React.createElement('img', { className: '', src, onClick });
    }
    render() {
        if (this.state.active) {
            return React.createElement('div', {
                style: {
                    display: 'flex'
                }, id: 'revealed'
            }, this.state.cards.map((card) => this.img(card)));
        }
        return '';
    }

    trigger(state) {
        Object.assign(this.state, state);
        this.state.active = true;
    }
}