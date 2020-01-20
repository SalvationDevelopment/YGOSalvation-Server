/*global React */

class ChoiceScreen extends React.Component {
    constructor(store, chat) {
        super();
        this.sidechat = chat;
        this.store = store;
    }

    goFirst(startplayer) {
        this.store.dispatch({ action: 'START_CHOICE', player: startplayer });
    }

    render() {
        return [React.createElement('div', { id: 'selectwhogoesfirst' }, [
            React.createElement('div', { id: 'gofirst', key: 'one', onClick: this.goFirst.bind(this, 0) }, 'Go First'),
            React.createElement('div', { id: 'gosecond', key: 'two', onClick: this.goFirst.bind(this, 1) }, 'Go Second')
        ]), React.createElement('div', { id: 'lobbychat', key: 'sidechat' }, this.sidechat.render())];
    }
}
