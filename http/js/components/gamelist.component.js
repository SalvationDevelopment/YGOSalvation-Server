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
        this.settings = {
            automatic: true,
            locked: false,
            mode: 'Match',
            ranked: false
        };
        this.store = store;
    }

    filter(list) {
        return list.filer((game) => {

        });
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

    enter(room) {
        this.store.dispatch(Object.assign({ action: 'DUEL' }, room));
    }

    names(room) {
        const players = room.player,
            player1 = (players[0]) ? players[0].username : '_____',
            player2 = (players[1]) ? players[1].username : '_____',
            player3 = (players[0]) ? players[0].username : '_____',
            player4 = (players[0]) ? players[0].username : '_____';
        if (room.mode === 'Tag') {
            return `${player1} & ${player2} vs ${player3} & ${player4} `;
        }
        return `${player1} vs ${player2}`;
    }

    renderGamelist() {
        return Object.keys(this.state.gamelist).map((key) => {
            const room = this.state.gamelist[key],
                status = (room.started) ? 'started' : 'avaliable',
                info = Object.keys(room).reduce((hash, data) => {
                    hash['data-' + data] = room[data];
                    return hash;
                }, {});
            return React.createElement('div', Object.assign({
                onClick: this.enter.bind(this, room),
                className: `game ${room.mode} ${status}`
            }, info), [this.names(room), React.createElement('span', {}, room.banlist)]);
        });
    }

    render() {
        const element = React.createElement;
        return [
            React.createElement('div', { id: 'gamelistitems' }, this.renderGamelist()),
            React.createElement('div', { id: 'gamelistfilter', key: 'gamelistfilter' }, [
                element('h2', {}, 'Filter'),
                element('controls', {}, [
                    element('div', { className: 'filtercol' }, [
                        element('select', { id: 'rounds' }, [
                            element('option', { value: 0 }, 'Single/Match'),
                            element('option', { value: 1 }, 'Single'),
                            element('option', { value: 2 }, 'Match')
                        ]),
                        element('select', { id: 'autofilter' }, [
                            element('option', { value: 0 }, 'Automatic/Manual'),
                            element('option', { value: 1 }, 'Automatic'),
                            element('option', { value: 2 }, 'Manual')
                        ]),
                        element('select', { id: 'autofilter' }, [
                            element('option', { value: 0 }, 'Ranked/Exhibition'),
                            element('option', { value: 1 }, 'Ranked'),
                            element('option', { value: 2 }, 'Exhibition')
                        ]),
                        element('input', { id: 'cardname', type: 'text', placeholder: 'Username' }),
                        element('br'),
                        element('button', {}, 'Reset')
                    ])
                ])
            ]),
            React.createElement('div', { className: 'gamelistcenter' },
                `Active Duels : ${this.state.activeduels} | Duelist : ${this.state.duelist} | Connected : ${this.state.userlist.length}`)
        ];
    }
}