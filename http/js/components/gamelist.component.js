/*global React, ReactDOM*/
class GamelistScreen extends React.Component {
    constructor(store, initialState) {
        super();
        this.state = {
            activeduels: 0,
            userlist: [],
            gamelist: {}
        };
        this.store = store;
    }

    nav() {
        this.store.dispatch({ action: 'NAVIGATE', screen: 'gamelist' });
    }

    update(data) {
        this.state.userlist = data.userlist;
        this.state.gamelist = data.gamelist;
    }

    enter(port) {
        this.store.dispatch({ action: 'DUEL', port });
    }

    renderGamelist() {
        return Object.keys(this.state.gamelist).map((key) => {
            const room = this.state.gamelist[key],
                info = Object.keys(room).reduce((data, hash) => {
                    hash['data-' + data] = room[data];
                }, {})
            return React.createElement('div', Object.assign({
                onClick: this.enter.bind(this, key)
            }, info));
        });
    }

    render() {
        return React.createElement('div', { id: 'gamelistitems' }, [].concat(this.renderGamelist()).concat([
            React.createElement('div', { id: 'gamelistcenter' },
                `Active Duels : ${this.activeduels} | Duelist : ${this.duelist} | Connected : ${this.userlist.length}`)
        ]));
    }
}