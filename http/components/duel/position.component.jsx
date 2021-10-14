import React from 'react';

export default class SelectPosition extends React.Component {

    constructor(store) {
        super();
        this.store = store;
        this.state = {
            active: false
        };
    }

    click(position) {
        this.state.active = false;
        this.store.hey({ action: 'RENDER' });
        this.store.hey({ action: 'POSITION_CARD_CLICK', position });
        this.state.cards = [];


    }

    img(card) {
        const src = `${localStorage.imageURL}/${card.id}.jpg`,
            onClick = this.click.bind(this, card);

        return React.createElement('img', { className: 'card ' + card.position, src, onClick });
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