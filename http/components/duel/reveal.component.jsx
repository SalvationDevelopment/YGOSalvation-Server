import React from 'react';

export default class Revealer extends React.Component {

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
        this.store.hey({ action: 'REVEAL_CARD_CLICK', option, selected });
        this.store.hey({ action: 'RENDER' });
    }

    manualClick(card, event) {
        event.stopPropagation();
        card.status = 'revealed';
        app.duel.controls.enable(card, { x: event.pageX, y: event.pageY });
        this.store.hey({ action: 'RENDER' });
        return;

    }

    img(card, i) {
        const src = `${localStorage.imageURL}/${card.id}.jpg`,
            onClick = (app.manual) ? this.manualClick.bind(this, card) : this.click.bind(this, card.selected, i);

        return React.createElement('img', { className: (card.selected) ? 'selected' : '', src, onClick });
    }
    render() {

        if (this.state.active) {
            return React.createElement('div', {
                onClick: this.close.bind(this),
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
        this.state.active = false;
        this.store.hey({ action: 'RENDER' });
    }
}