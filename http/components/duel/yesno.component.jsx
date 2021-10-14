import React from 'react';

export default class YesNoDialog extends React.Component {

    constructor(store) {
        super();
        this.root = document.getElementById('revealer');
        this.store = store;
        this.state = {
            active: false
        };
    }

    click(option) {
        this.state.active = false;
        this.store.hey({
            action: 'YESNO_CLICK', option: {
                type: 'yesno',
                i: option
            }
        });
        this.store.hey({ action: 'RENDER' });

    }

    render() {
        if (this.state.active) {
            return React.createElement('div', {
                style: {
                    display: 'flex'
                }, id: 'yesnobox'
            }, [
                    React.createElement('p', {}, 'Use effect?'),
                    React.createElement('div', {}, [
                        React.createElement('button', { onClick: this.click.bind(this, true), key: 'yes' }, 'Yes'),
                        React.createElement('button', { onCLick: this.click.bind(this, false), key: 'no' }, 'No')
                    ])
                ]);
        }
        return '';
    }

    close() {
        this.active = false;
    }
}