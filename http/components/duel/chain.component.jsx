import React from 'react';

export default class Chainer extends React.Component {

    constructor(store) {
        super();
        this.root = document.getElementById('revealer');
        this.store = store;
        this.state = {
            active: false
        };
    }

    click(selected, option, event) {
        this.state.active = false;
        this.store.hey({ action: 'CHAIN_CARD_CLICK', option, selected });
        this.store.hey({ action: 'RENDER' });
        event.preventDefault();
    }

    img(card, i) {
        const src = `${localStorage.imageURL}/${card.id}.jpg`,
            onClick = this.click.bind(this, card.selected, (i));

        return React.createElement('img', { className: (card.selected) ? 'selected' : '', src, onClick });
    }

    render() {
        if (this.state.active) {
            return React.createElement('div', {
                style: {
                    display: 'flex'
                }, id: 'revealed',
                onClick: this.click.bind(this, {}, (-1))
            }, this.state.cards.map((card, i) => this.img(card, i)))
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