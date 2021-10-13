/*global React, ReactDOM */

export default class ExtraControls extends React.Component {

    render() {
        if (!app.manual) {
            return [
                React.createElement('button', {
                    id: 'control-surrender', key: 'control-surrender', onClick: function () {
                        app.surrender();
                    }
                }, 'Surrender')
            ];
        }
        return [
            React.createElement('button', {
                id: 'control-surrender', key: 'control-surrender', onClick: function () {
                    app.surrender();
                }
            }, 'Surrender'),
            React.createElement('button', { id: 'control-filter-adv', key: 'filter-advanced-controls', onClick: this.toggle.bind(this) }, 'Toggle Controls'),
            React.createElement('button', {
                id: 'control-flip-coin', key: 'control-flip-coin', onClick: function () {
                    app.manualControls.manualFlip();
                }
            }, 'Flip Coin'),
            React.createElement('button', {
                id: 'control-roll-die', key: 'control-roll-die', onClick: function () {
                    app.manualControls.manualRoll();
                }
            }, 'Roll Die'),
            React.createElement('button', {
                id: 'control-token', key: 'control-token', onClick: function () {
                    app.manualControls.startSpecialSummon('token')
                }
            }, 'Make Token'),
            React.createElement('select', { id: 'tokendropdown' }, this.tokens.map((card, i) => {
                return React.createElement('option', { key: 'selectn' + i, value: card.id }, sanitize(card.name));
            })),
            React.createElement('button', {
                id: 'control-surrender', key: 'control-surrender', onClick: function () {
                    app.surrender();
                }
            }, 'Surrender')
        ];
    }

    toggle() {
        this.controls.state.filter = !this.controls.state.filter;
    }

    constructor(store, controls, databaseSystem) {
        super();
        this.store = store;
        this.controls = controls;
        this.tokens = databaseSystem
            .filter((card) => {
                return cardIs('token', card);
            })

    }
}