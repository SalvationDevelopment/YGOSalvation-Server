/*global React */

class ChoiceScreen extends React.Component {
    constructor(store, chat) {
        super();
        this.sidechat = chat;
        this.store = store;
        this.result = null;
        this.state = {
            mode: 'coin',
            result: undefined
        };
    }

    goFirst(startplayer) {
        this.store.dispatch({ action: 'START_CHOICE', player: startplayer });
    }

    turnPlayer() {
        return [React.createElement('div', { id: 'selectwhogoesfirst' }, [
            React.createElement('div', { id: 'gofirst', key: 'one', onClick: this.goFirst.bind(this, 0) }, 'Go First'),
            React.createElement('div', { id: 'gosecond', key: 'two', onClick: this.goFirst.bind(this, 1) }, 'Go Second')
        ]), React.createElement('div', { id: 'lobbychat', key: 'sidechat' }, this.sidechat.render())];
    }

    rps() {
        return [React.createElement('div', { id: 'selectwhogoesfirst' }, [

        ]), React.createElement('div', { id: 'lobbychat', key: 'sidechat' }, this.sidechat.render())];
    }

    coin() {
        return [React.createElement('div', { id: 'selectwhogoesfirst' }, [

        ]), React.createElement('div', { id: 'lobbychat', key: 'sidechat' }, this.sidechat.render())];
    }

    die() {
        return [React.createElement('div', { id: 'selectwhogoesfirst' }, [

        ]), React.createElement('div', { id: 'lobbychat', key: 'sidechat' }, this.sidechat.render())];
    }

    rpsResult() {
        return [React.createElement('div', { id: 'selectwhogoesfirst' }, [

        ]), React.createElement('div', { id: 'lobbychat', key: 'sidechat' }, this.sidechat.render())];
    }

    coinResult() {
        const result = (this.result) ? 'tails' : 'heads';
        return [React.createElement('div', { id: 'selectwhogoesfirst' }, [
            React.createElement('div', { id: 'flipped', key: 'flipped' }, `Flipped ${result}.`)
        ]), React.createElement('div', { id: 'lobbychat', key: 'sidechat' }, this.sidechat.render())];
    }

    dieResult() {
        return [React.createElement('div', { id: 'selectwhogoesfirst' }, [
            React.createElement('div', { id: 'p1rolled', key: 'p1rolled' }, 'Player 1 fliped a '),
            React.createElement('div', { id: 'p2rolled', key: 'p2rolled' }, 'Go Second')
        ]), React.createElement('div', { id: 'lobbychat', key: 'sidechat' }, this.sidechat.render())];
    }


    render() {
        if (this.result) {
            switch (this.state.result) {
                case 'turn_player':
                    return React.createElement('section', { id: 'lobby', key: 'lobby' }, this.turnPlayer());
                case 'rps':
                    return React.createElement('section', { id: 'choice', key: 'choice' }, this.rpsResult());
                case 'coin':
                    return React.createElement('section', { id: 'duel', key: 'duel' }, this.coinResult());
                case 'die':
                    return React.createElement('section', { id: 'siding', key: 'siding' }, this.dieResult());
                default:
                    return React.createElement('section', { id: 'error', key: 'error' }, this.error.render());
            }
        }
        switch (this.state.mode) {
            case 'turn_player':
                return React.createElement('section', { id: 'lobby', key: 'lobby' }, this.turnPlayer());
            case 'rps':
                return React.createElement('section', { id: 'choice', key: 'choice' }, this.rps());
            case 'coin':
                return React.createElement('section', { id: 'duel', key: 'duel' }, this.coin());
            case 'die':
                return React.createElement('section', { id: 'siding', key: 'siding' }, this.die());
            default:
                return React.createElement('section', { id: 'error', key: 'error' }, this.error.render());
        }
    }
}
