/*global React, ReactDOM*/
class SuperHeaderComponent extends React.Component {
    constructor(initialState) {
        super();
        this.state = initialState || {};
    }

    update(updatedState) {
        Object.assign(this.state, updatedState);
        return this.state;
    }

    render() {
        return React.createElement('header', { key: 'header', className: 'superfooter', id: 'superfooter' });
    }
}