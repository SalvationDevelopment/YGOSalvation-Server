import React from 'react';

export default class SelectAttributes extends React.Component {

    constructor(store) {
        super();
        this.root = document.getElementById('attributes');
        this.store = store;
        this.state = {
            active: false
        };
    }


    change(option, event) {
        this.state.value = option;
    }

    render() {

        if (this.state.active) {
            const boxes = [];
            console.log(this.state.options);
            for (const option in this.state.options) {
                console.log(option);
                boxes.push(React.createElement('div', { className: 'selectCheck', key: option }, [
                    React.createElement('label', { key: `${option}-label` }, option),
                    React.createElement('input', {
                        name: 'announcevalue',
                        type: 'checkbox',
                        key: `${option}-input`,
                        onChange: this.change.bind(this, option)
                    })
                ]));
            }
            console.log(this.state.options);
            return React.createElement('div', {}, [
                React.createElement('div', { key: 'text' }, `Select ${this.state.text}`),
                React.createElement('div', { key: 'options' }, boxes),
                React.createElement('button', { key: 'button', onClick: this.reply.bind(this) }, 'Select')
            ]);
        }
    }

    reply() {
        if (this.state.value !== undefined) {
            this.state.active = false;
            this.store.hey({ action: 'CHAIN_CARD_CLICK', option: this.state.value });

        }
    }
}