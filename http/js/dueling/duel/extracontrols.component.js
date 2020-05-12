/*global React, ReactDOM */

class ExtraControls extends React.Component {

    render() {
        return [React.createElement('button', { id: 'filter', key: 'filter-button', onClick: this.toggle.bind(this) }, 'Toggle Controls')];
    }

    toggle() {
        this.controls.state.filter = !this.controls.state.filter;
    }

    constructor(store, controls) {
        super();
        this.store = store;
        this.controls = controls;
    }
}