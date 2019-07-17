/*global React, ReactDOM*/

class Flasher extends React.Component {

    constructor(store) {
        super();
        this.state = {
            active: false
        };
        this.store = store;
    }

    render() {
        if (this.state.active) {
            const src = `http://127.0.0.1:8887/${this.state.id}.jpg`;
            return React.createElement('div', {
                style: {
                    display: 'block'
                }, id: 'effectflasher'
            },
                React.createElement('img', { className: 'mainimage', src }));
        }
        return '';
    }

    trigger(state) {
        Object.assign(this.state, state);
        this.state.active = true;
        console.log('Flash active');
        setTimeout(() => {
            this.state.active = false;
            console.log('closing flash');
            this.store.dispatch({ action: 'RENDER' });
        }, 500);
    }
}