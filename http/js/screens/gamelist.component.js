/*global React, ReactDOM*/
class GamelistScreen extends React.Component {
    constructor(store, initialState) {
        super();
        this.state = {
            duelist: 0,
            activeduels: 0,
            userlist: [],
            gamelist: {},
            filteredList: []
        };
        this.settings = {
            automatic: '',
            locked: '',
            mode: '',
            ranked: '',
            banlist: ''
        };
        this.store = store;
        this.store.register('GAMELIST_BANLIST', (action) => {
            this.state.primary = action.primary;
            this.state.banlist = action.banlist;
        });
    }

    onChange(event) {
        const id = event.target.id;
        this.settings[id] = event.target.value;
        if (event.target.value === 'on') {
            this.settings[id] = event.target.checked;
        }
        this.filteredList = this.filter(this.state.userlist);
        this.store.dispatch({ action: 'RENDER' });
    }

    filter(list) {
        console.log(this.settings);
        const games = Object.keys(this.state.gamelist).map((key) => {
            return this.state.gamelist[key];
        });
        return games.filter((game) => {
            return Object.keys(this.settings).every((setting) => {
                if (!this.settings[setting]) {
                    return true;
                }
                if (setting !== 'username') {
                    return this.settings[setting] === game[setting];
                }
                return game.player.some((player) => {
                    return player.username.indexOf(this.settings[setting]) > -1;
                });
            });
        });
    }

    nav() {
        this.store.dispatch({ action: 'NAVIGATE', screen: 'gamelist' });
    }

    update(data) {
        this.state.userlist = data.userlist;
        this.state.gamelist = data.gamelist;
        this.state.activeduels = Object.keys(data.gamelist).length;
        this.state.duelist = Object.keys(data.gamelist).reduce((list, gameroomid) => {
            data.gamelist[gameroomid].player.forEach((player) => {
                list.add(player.username);
            });
            return list;
        }, new Set()).size;
        this.filteredList = this.filter(this.state.userlist);
    }

    enter(room) {
        this.store.dispatch(Object.assign({ action: 'DUEL' }, room));
    }

    reset() {
        this.settings = {
            automatic: '',
            locked: '',
            mode: '',
            ranked: '',
            banlist: ''
        };
        this.store.dispatch({ action: 'RENDER' });
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
        return this.filteredList.map((room) => {
            const status = (room.started) ? 'started' : 'avaliable',
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
            element('div', { id: 'gamelistitems' }, this.renderGamelist()),
            element('div', { id: 'gamelistfilter', key: 'gamelistfilter' }, [
                element('h2', {key : 'h2-1'}, 'Filter'),
                element('controls', {key : 'control-1'}, [
                    element('div', {key : 'col-1', className: 'filtercol' }, [
                        element('select', { key : 'banlist', id: 'banlist', onChange: this.onChange.bind(this) }, [
                            element('option', { value: '', selected: true }, 'Banlist')
                        ].concat(this.state.banlist.map((list, i) => {
                            return element('option', { value: list.name }, list.name);
                        }))),
                        element('select', { key : 'mode', id: 'mode', onChange: this.onChange.bind(this), value: this.settings.mode }, [
                            element('option', { value: '' }, 'Single/Match'),
                            element('option', { value: 'Single' }, 'Single'),
                            element('option', { value: 'Match' }, 'Match')
                        ]),
                        element('select', {key : 'automatic',  id: 'automatic', onChange: this.onChange.bind(this), }, [
                            element('option', { value: '' }, 'Automatic/Manual'),
                            element('option', { value: 'Automatic' }, 'Automatic'),
                            element('option', { value: 'Manual' }, 'Manual')
                        ]),
                        element('select', { key : 'ranked', id: 'ranked', onChange: this.onChange.bind(this) }, [
                            element('option', { value: '' }, 'Ranked/Exhibition'),
                            element('option', { value: 'Ranked' }, 'Ranked'),
                            element('option', { value: 'Exhibition' }, 'Exhibition')
                        ]),
                        element('input', { key : 'username', id: 'username', type: 'text', placeholder: 'Username', onBlur: this.onChange.bind(this) }),
                        element('br', {key : 'br-1' }),
                        element('button', { key : 'reset', onClick: this.reset.bind(this) }, 'Reset')
                    ])
                ])
            ]),
            React.createElement('div', { className: 'gamelistcenter' },
                `Active Duels : ${this.state.activeduels} | Duelist : ${this.state.duelist} | Connected : ${this.state.userlist.length}`)
        ];
    }
}