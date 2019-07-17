/*global React, ReactDOM, $*/
class SettingsScreen extends React.Component {
    constructor(store) {
        super();
        this.state = {

        };
        this.settings = {
            theme: localStorage.theme || 0,
            hide_banlist: localStorage.all_banlist,
            default_deck: localStorage.default_deck || 0,
            language: localStorage.language || 'en'

        };
        this.store = store;

    }


    onChange(event) {
        const id = event.target.id;
        this.settings[id] = event.target.value;
        if (event.target.value === 'on') {
            this.settings[id] = event.target.checked;
        }

    }


    render() {
        const element = React.createElement;
        return React.createElement('section', { id: 'hostSettings' }, [
            React.createElement('h2', {}, 'Settings'),
            React.createElement('label', {}, 'Theme'),
            React.createElement('select', { id: 'theme', onChange: this.onChange.bind(this) }, [
                React.createElement('option', { value: 0, selected: true }, 'Original Magi Magi'),
                React.createElement('option', { value: 1 }, 'Shadow Magi Magi'),
                React.createElement('option', { value: 2 }, 'Second Age')
            ]),
            React.createElement('label', {}, 'Image URL'),
            React.createElement('input', { id: 'imageurl', placeholder: 'http://localhost:8887' }),
            React.createElement('label', {}, 'Hide Old Banlist'),
            React.createElement('input', { id: 'oldbanlist', type: 'checkbox' }),
            React.createElement('label', {}, 'Play Assistance'),
            React.createElement('input', { id: 'playassist', type: 'checkbox' }),
            React.createElement('label', {}, 'Automatically Bluff'),
            React.createElement('input', { id: 'bluff', type: 'checkbox' })
        ]);
    }
}