/*global React, ReactDOM*/
class GamelistScreen extends React.Component {
    constructor(store, initialState) {
        super();
        this.state = {
            duelist: 0,
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
        this.state.activeduels = Object.keys(data.gamelist).length;
        this.state.duelist = Object.keys(data.gamelist).reduce((key, usernames) => {
            data.gamelist[key].players.forEach((player) => {
                usernames.add(player.username);
            });
            return usernames;
        }, new Set()).size;
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
        return React.createElement('div', { id: 'gamelistitems' }, [].concat(this.renderGamelist()),
            React.createElement('div', { className: 'gamelistcenter' },
                `Active Duels : ${this.state.activeduels} | Duelist : ${this.state.duelist} | Connected : ${this.state.userlist.length}`)
        );
    }
}