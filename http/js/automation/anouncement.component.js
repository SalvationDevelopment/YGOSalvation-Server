/*global React, ReactDOM*/

class Flasher extends React.Component {

    constructor() {
        super();
        this.root = document.getElementById('announcer');
        this.state = {
            active: false
        };
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
        ReactDOM.render(this.render(), this.root);
        setTimeout(() => {
            this.state.active = false;
            ReactDOM.render(this.render(), this.root);
        }, 500);

    }
}