/*global React, ReactDOM*/
class HostScreen extends React.Component {
    constructor(store, initialState) {
        super();
        this.state = {
            mode: 'start'
        };
        this.store = store;
    }

    nav() {
        this.store.dispatch({ action: 'NAVIGATE', screen: 'gamelist' });
    }

    host() {

    }

    render() {
        return React.createElement('section', { id: 'hostSettings' }, [
            React.createElement('h2', {}, 'Settings'),
            React.createElement('label', {}, 'Cardpool'),
            React.createElement('select', { id: 'creategamecardpool' }, [
                React.createElement('option', { value: 0 }, 'OCG'),
                React.createElement('option', { value: 1 }, 'TCG'),
                React.createElement('option', { value: 2, selected: true }, 'OCG/TCG')
            ]),
            React.createElement('br', {}),
            React.createElement('label', {}, 'Ban list'),
            React.createElement('select', { id: 'creategamebanlist' }, []),
            React.createElement('br', {}),
            React.createElement('label', {}, 'Duel Mode'),
            React.createElement('select', { id: 'creategameduelmode' }, [
                React.createElement('option', { value: 0 }, 'Single'),
                React.createElement('option', { value: 1, selected: true }, 'Match'),
                React.createElement('option', { value: 2 }, 'Tag')
            ]),
            React.createElement('br', {}),
            React.createElement('label', {}, 'Time Limit'),
            React.createElement('select', { id: 'creategametimelimit' }, [
                React.createElement('option', { value: 0 }, '3 Minutes'),
                React.createElement('option', { value: 1, selected: true }, '6 Minutes'),
                React.createElement('option', { value: 2 }, '9 Minutes'),
                React.createElement('option', { value: 3 }, '12 Minutes'),
                React.createElement('option', { value: 4 }, '15 Minutes')
            ]),
            React.createElement('br', {}),
            React.createElement('h2', {}, 'Additional Options'),
            React.createElement('label', {}, 'Use AI'),
            React.createElement('input', { type: 'checkbox', id: 'useai', disabled: true }),
            React.createElement('select', { id: 'aidecks', disabled: true }, []),
            React.createElement('label', {}, 'Automatic Mode (In Development'),
            React.createElement('input', { type: 'checkbox', id: 'useautomatic', checked: true, disabled: true }),
            React.createElement('label', {}, 'Validate Deck'),
            React.createElement('input', { type: 'checkbox', id: 'useautomatic', checked: true }),
            React.createElement('label', {}, 'Shuffle Deck'),
            React.createElement('input', { type: 'checkbox', id: 'useautomatic', checked: true }),
            React.createElement('label', {}, 'Use Password'),
            React.createElement('input', { type: 'checkbox', id: 'useautomatic' }),
            React.createElement('label', {}, 'Lifepoints'),
            React.createElement('input', { type: 'number', id: 'useautomatic', value: 8000 }),
            React.createElement('br', {}),
            React.createElement('div', { className: 'button', id: 'creategameok', onClick: this.host.bind(this) }, 'Host'),
        ]);

    }
}