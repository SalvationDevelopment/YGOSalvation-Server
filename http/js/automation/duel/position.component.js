/*global React, ReactDOM*/

class SelectPosition extends React.Component {

    constructor(store) {
        super();
        this.store = store;
        this.state = {
            active: false
        };
    }

    click(position) {
        this.store.dispatch({ action: 'POSITION_CARD_CLICK', position });
        this.close();
    }

    img(card, i) {
        const src = `http://127.0.0.1:8887/${card.id}.jpg`,
            onClick = this.click.bind(this, i);

        return React.createElement('img', { className: card.position, src, onClick });
    }
    render() {
        if (this.state.active) {
            return React.createElement('div', {
                style: {
                    display: 'flex'
                }, id: 'revealed'
            }, this.state.cards.map((card, i) => this.img({
                type: card.position
            })));
        }
        return '';
    }

    trigger(state) {
        this.state.active = true;
        this.state.card = state.map((position) => {

        });
    }

    close() {
        this.state.cards = [];
        this.active = false;
    }
}