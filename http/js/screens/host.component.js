/*global React, ReactDOM, $*/
class HostScreen extends React.Component {
    constructor(store, initialState) {
        super();
        this.state = {
            banlist: [],
            hash: {}
        };
        this.settings = {
            AUTOMATIC: true,
            BANLIST: 'No Banlist',
            CARD_POOL: 0,
            DECK_CHECK: true,
            DRAW_COUNT: 1,
            LOCKED: false,
            MASTER_RULE: 4,
            MODE: 'Match',
            OT: 2,
            SHUFFLE: true,
            LIFE_POINTS: 8000,
            TIME_LIMIT: 180000,
            RANKED: false
        };
        this.store = store;

        store.register('HOST_BANLIST', (action) => {
            this.settings.BANLIST = action.primary;
            this.state.banlist = action.banlist;
        });

    }

    nav() {
        this.store.dispatch({ action: 'NAVIGATE', screen: 'gamelist' });
    }

    onChange(event) {
        const id = event.target.id;
        this.settings[id] = event.target.value;
        if (event.target.value === 'on') {
            this.settings[id] = event.target.checked;
        }
        if (id === 'mode') {
            switch (event.target.value) {
                case 'Single':
                    this.settings.LIFE_POINTS = 8000;
                    break;
                case 'Match':
                    this.settings.LIFE_POINTS = 8000;
                    break;
                case 'Tag':
                    this.settings.LIFE_POINTS = 16000;
                    break;
            }
        }
        if (id === 'banlist') {
            const banlist = this.state.banlist.find((list) => {
                return list.name === event.target.value;
            });
            this.settings.MASTER_RULE = banlist.masterRule;
        }
        this.store.dispatch({ action: 'RENDER' });
    }

    host() {
        this.store.dispatch({ action: 'HOST', settings: this.settings });
    }

    render() {
        return React.createElement('section', { id: 'hostSettings' }, [
            React.createElement('h2', {}, 'Settings'),
            React.createElement('br', {}),
            React.createElement('label', {}, 'Cardpool'),
            React.createElement('select', { id: 'CARD_POOL', onChange: this.onChange.bind(this) }, [
                React.createElement('option', { key: 'OCG', value: 'OCG' }, 'OCG'),
                React.createElement('option', { key: 'TCG', value: 'TCG' }, 'TCG'),
                React.createElement('option', { key: 'OCG/TCG', value: 'OCG/TCG', selected: true }, 'OCG/TCG')
            ]),
            React.createElement('br', {}),
            React.createElement('label', {}, 'Ban list'),
            React.createElement('select', { id: 'BANLIST', onChange: this.onChange.bind(this) }, [this.state.banlist.map((list, i) => {
                return React.createElement('option', { value: list.name, selected: list.primary }, list.name);
            })]),
            React.createElement('br', {}),
            React.createElement('label', {}, 'Duel Mode'),
            React.createElement('select', { id: 'MODE', onChange: this.onChange.bind(this) }, [
                React.createElement('option', { key: 'single', value: 'Single' }, 'Single'),
                React.createElement('option', { key: 'match', value: 'Match', selected: true }, 'Match'),
                React.createElement('option', { key: 'tag', value: 'Tag', disabled: true }, 'Tag')
            ]),
            React.createElement('br', {}),
            React.createElement('label', {}, 'Time Limit'),
            React.createElement('select', { id: 'TIME_LIMIT', onChange: this.onChange.bind(this) }, [
                React.createElement('option', { key: '', value: 180000 }, '3 Minutes'),
                React.createElement('option', { key: '', value: 360000, selected: true }, '6 Minutes'),
                React.createElement('option', { key: '', value: 540000 }, '9 Minutes'),
                React.createElement('option', { key: '', value: 720000 }, '12 Minutes'),
                React.createElement('option', { key: '', value: 900000 }, '15 Minutes')
            ]),
            React.createElement('br', { key: '', }),
            React.createElement('br', { key: '', }),
            React.createElement('h2', { key: '', }, 'Additional Options'),
            React.createElement('br', { key: '', }),
            //React.createElement('label', {}, 'Use AI'),
            //React.createElement('input', { type: 'checkbox', id: 'useai', disabled: true, onChange: this.onChange.bind(this) }),
            //React.createElement('select', { id: 'aidecks', disabled: true, onChange: this.onChange.bind(this) }, []),
            React.createElement('label', {}, 'Automatic Mode (In Development'),
            React.createElement('input', { type: 'checkbox', id: 'AUTOMATIC', checked: this.settings.AUTOMATIC, onChange: this.onChange.bind(this) }),
            React.createElement('label', {}, 'Validate Deck'),
            React.createElement('input', { type: 'checkbox', id: 'DECK_CHECK', checked: this.settings.DECK_CHECK, onChange: this.onChange.bind(this) }),
            React.createElement('label', {}, 'Shuffle Deck'),
            React.createElement('input', { type: 'checkbox', id: 'SHUFFLE', checked: this.settings.SHUFFLE, onChange: this.onChange.bind(this) }),
            React.createElement('label', {}, 'Ranked'),
            React.createElement('input', { type: 'checkbox', id: 'RANKED', onChange: this.onChange.bind(this) }),
            React.createElement('label', {}, 'Use Password'),
            React.createElement('input', { type: 'checkbox', id: 'LOCKED', onChange: this.onChange.bind(this) }),
            //React.createElement('label', {}, 'Lifepoints'),
            //React.createElement('input', { type: 'number', id: 'LIFE_POINTS', onChange: this.onChange.bind(this), value: 8000 }),
            React.createElement('br', {}),
            React.createElement('div', { className: 'button', id: 'creategameok', onClick: this.host.bind(this) }, 'Host')
        ]);

    }
}