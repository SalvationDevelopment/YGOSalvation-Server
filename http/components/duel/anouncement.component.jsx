import React from 'react';

export default class Flasher extends React.Component {

    constructor(store) {
        super();
        this.state = {
            active: false
        };
        this.store = store;
    }

    render() {
        if (this.state.active) {
            const src = `${localStorage.imageURL}/${this.state.id}.jpg`;
            return React.createElement('div', {
                style: {
                    display: 'block'
                }, id: 'effectflasher'
            },
                React.createElement('img', { className: 'mainimage', src }));
        }
        return '';
    }

    trigger(state) {
        Object.assign(this.state, state);
        this.state.active = true;
        console.log('Flash active');
        setTimeout(() => {
            this.state.active = false;
            console.log('closing flash');
            this.store.hey({ action: 'RENDER' });
        }, 500);
    }
}