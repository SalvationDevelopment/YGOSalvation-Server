/*global React, ReactDOM*/

class SelectAttributes extends React.Component {

    constructor(store) {
        super();
        this.root = document.getElementById('attributes');
        this.store = store;
        this.state = {
            active: false
        };
    }


    change(event) {
        this.state.value = event.target.value;
    }

    render() {

        if (this.state.active) {
            const boxes = [];
            for (const option in this.state.options) {
                boxes.push(React.createElement('div', { className: 'selectCheck', key: option }, [
                    React.createElement('label', { key: `${option}-label` }, option),
                    React.createElement('input', {
                        name: 'announcevalue',
                        type: 'checkbox',
                        key: `${option}-input`,
                        onChange: this.change.bind(this)
                    })
                ]));
            }
            return React.createElement('div', {}, [
                React.createElement('div', { key: `text` }, `Select ${this.state.text}`),
                React.createElement('div', { key: `options` }, boxes),
                React.createElement('button', { key: `button`, onClick: this.reply.bind(this) }, 'Select')
            ]);
        }
    }

    reply() {
        if (this.state.value !== undefined) {
            this.state.active = false;
            this.store.dispatch({ action: 'CHAIN_CARD_CLICK', option: this.state.value });

        }
    }
}