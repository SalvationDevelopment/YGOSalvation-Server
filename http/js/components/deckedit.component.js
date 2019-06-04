/*global React, ReactDOM*/
class DeckEditScreen extends React.Component {
    constructor(store, initialState) {
        super();
        this.state = initialState || {};
        this.store = store;
    }
}