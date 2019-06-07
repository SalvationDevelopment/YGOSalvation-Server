/*global React, ReactDOM, $*/
class HostScreen extends React.Component {
    constructor(store, initialState) {
        super();
        this.state = {
            banlist: [],
            hash: {}
        };
        this.settings = {
            automatic: true,
            banlist: 'No Banlist',
            cardpool: 0,
            deckcheck: true,
            draw_count: 1,
            legacyfield: false,
            locked: false,
            masterRule: 4,
            mode: 'Match',
            ot: 2,
            priority: false,
            prerelease: true,
            shuffleDeck: true,
            startLP: 8000,
            start_hand_count: 5,
            time: 180000
        };
        this.store = store;

        $.getJSON('/manifest/banlist.json', (data) => {
            Object.keys(data).forEach((list) => {
                this.state.banlist.push(data[list]);
                if (data[list].primary) {
                    this.settings.banlist = data[list].name;
                }
            });
        });
    }

    nav() {
        this.store.dispatch({ action: 'NAVIGATE', screen: 'gamelist' });
    }

    onBlur(event) {
        const id = event.target.id;
        this.settings[id] = event.target.value;
        if (event.target.value === 'on') {
            this.settings[id] = event.target.checked;
        }
        if (id === 'mode') {
            switch (event.target.value) {
                case 'Single':
                    this.settings.startLP = 8000;
                    break;
                case 'Match':
                    this.settings.startLP = 8000;
                    break;
                case 'Tag':
                    this.settings.startLP = 16000;
                    break;
            }
        }
    }

    host() {
        this.store.dispatch({ action: 'HOST', settings: this.settings });
    }

    render() {
        return React.createElement('section', { id: 'hostSettings' }, [
            React.createElement('h2', {}, 'Settings'),
            React.createElement('label', {}, 'Cardpool'),
            React.createElement('select', { id: 'creategamecardpool', onChange: this.onBlur.bind(this) }, [
                React.createElement('option', { value: 0 }, 'OCG'),
                React.createElement('option', { value: 1 }, 'TCG'),
                React.createElement('option', { value: 2, selected: true }, 'OCG/TCG')
            ]),
            React.createElement('br', {}),
            React.createElement('label', {}, 'Ban list'),
            React.createElement('select', { id: 'banlist', onChange: this.onBlur.bind(this) }, [this.state.banlist.map((list, i) => {
                return React.createElement('option', { value: list.name, selected: list.primary }, list.name);
            })]),
            React.createElement('br', {}),
            React.createElement('label', {}, 'Duel Mode'),
            React.createElement('select', { id: 'mode', onChange: this.onBlur.bind(this) }, [
                React.createElement('option', { value: 'Single' }, 'Single'),
                React.createElement('option', { value: 'Match', selected: true }, 'Match'),
                React.createElement('option', { value: 'Tag' }, 'Tag')
            ]),
            React.createElement('br', {}),
            React.createElement('label', {}, 'Time Limit'),
            React.createElement('select', { id: 'time', onChange: this.onBlur.bind(this) }, [
                React.createElement('option', { value: 180000 }, '3 Minutes'),
                React.createElement('option', { value: 360000, selected: true }, '6 Minutes'),
                React.createElement('option', { value: 540000 }, '9 Minutes'),
                React.createElement('option', { value: 720000 }, '12 Minutes'),
                React.createElement('option', { value: 900000 }, '15 Minutes')
            ]),
            React.createElement('br', {}),
            React.createElement('h2', {}, 'Additional Options'),
            React.createElement('label', {}, 'Use AI'),
            React.createElement('input', { type: 'checkbox', id: 'useai', disabled: true, onChange: this.onBlur.bind(this) }),
            React.createElement('select', { id: 'aidecks', disabled: true, onChange: this.onBlur.bind(this) }, []),
            React.createElement('label', {}, 'Automatic Mode (In Development'),
            React.createElement('input', { type: 'checkbox', id: 'useautomatic', checked: true, disabled: true, onChange: this.onBlur.bind(this) }),
            React.createElement('label', {}, 'Validate Deck'),
            React.createElement('input', { type: 'checkbox', id: 'deckcheck', checked: true, onChange: this.onBlur.bind(this) }),
            React.createElement('label', {}, 'Shuffle Deck'),
            React.createElement('input', { type: 'checkbox', id: 'shuffleDeck', checked: true, onChange: this.onBlur.bind(this) }),
            React.createElement('label', {}, 'Use Password'),
            React.createElement('input', { type: 'checkbox', id: 'locked', onChange: this.onBlur.bind(this) }),
            React.createElement('label', {}, 'Lifepoints'),
            React.createElement('input', { type: 'number', id: 'startLP', value: 8000 }),
            React.createElement('br', {}),
            React.createElement('div', { className: 'button', id: 'creategameok', onClick: this.host.bind(this) }, 'Host')
        ]);

    }
}