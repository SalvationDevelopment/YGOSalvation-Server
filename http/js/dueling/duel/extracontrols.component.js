/*global React, ReactDOM */

class ExtraControls extends React.Component {

    render() {
        return [
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
            }))
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