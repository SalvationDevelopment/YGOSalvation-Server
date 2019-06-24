/*global React, ReactDOM, $*/
class SettingsScreen extends React.Component {
    constructor(store) {
        super();
        this.state = {

        };
        this.settings = {
            theme: localStorage.theme,
            all_banlist: localStorage.all_banlist,
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


    }
}