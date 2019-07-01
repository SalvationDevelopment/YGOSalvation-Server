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
        this.state.active = false;
        this.store.dispatch({ action: 'RENDER' });
        this.store.dispatch({ action: 'POSITION_CARD_CLICK', position });
        this.state.cards = [];


    }

    img(card) {
        const src = `http://127.0.0.1:8887/${card.id}.jpg`,
            onClick = this.click.bind(this, card);

        return React.createElement('img', { className: card.position, src, onClick });
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
        this.state.active = true;
        this.state.cards = state.positions.map((position) => {
            return {
                id: state.id,
                position,
                type: position
            };
        });
        console.log(this.state.cards);
    }
}