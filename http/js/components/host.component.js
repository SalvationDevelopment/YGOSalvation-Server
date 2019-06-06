/*global React, ReactDOM*/
class GamelistScreen extends React.Component {
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

    render() {
        return '';
    }
}