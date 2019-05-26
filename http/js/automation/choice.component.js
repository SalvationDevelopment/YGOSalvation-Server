/*global React */

class ChoiceScreen extends React.Component {
    constructor(store) {
        super();
        this.store = store;
    }

    goFirst(startplayer) {
        this.store.dispatch({ action: 'START_CHOICE', player: startplayer });
    }

    render() {
        return React.createElement('div', { id: 'selectwhogoesfirst' }, [
            React.createElement('div', { id: 'gofirst', key: 1, onClick: this.goFirst.bind(this, 0) }, 'Go First'),
            React.createElement('div', { id: 'gosecond', key: 2, onClick: this.goFirst.bind(this, 1) }, 'Go Second')
        ]);
    }
}
