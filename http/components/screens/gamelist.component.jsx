import React from 'react';
import { hey, listen, watchOut } from '../../services/listener.service';

export default class GamelistScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            duelist: 0,
            activeduels: 0,
            userlist: [],
            gamelist: {},
            filteredList: [],
            banlist: []
        };
        this.settings = {
            automatic: '',
            locked: '',
            mode: '',
            ranked: '',
            banlist: '',
            minelo: '',
            maxelo: ''
        };
        
        watchOut('BANLIST', (action) => {
            this.state.primary = action.primary;
            this.state.banlist = action.banlist;
        });
        this.filteredList = [];
        
    }

    onChange(event) {
        const id = event.target.id;
        this.settings[id] = event.target.value;
        if (event.target.value === 'on') {
            this.settings[id] = event.target.checked;
        }
        this.filteredList = this.filter(this.state.userlist);
        hey({ action: 'RENDER' });
    }

    filter(list) {
        const games = Object.keys(this.state.gamelist).map((key) => {
            return this.state.gamelist[key];
        });
        return games.filter((game) => {
            return Object.keys(this.settings).every((setting) => {
                if (!this.settings[setting]) {
                    return true;
                }
                if (setting === 'username') {
                    return game.player.some((player) => {
                        return player.username.indexOf(this.settings[setting]) > -1;
                    });
                }
                if (setting === 'minelo') {
                    return game.player.some((player) => {
                        return player.ranking.elo >= Number(this.settings[setting]);
                    });
                }
                if (setting === 'maxlo') {
                    return game.player.some((player) => {
                        return player.ranking.elo <= Number(this.settings[setting]);
                    });
                }
                return this.settings[setting] === game[setting];

            });
        });
    }

    nav() {
        hey({ action: 'NAVIGATE', screen: 'gamelist' });
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
        hey(Object.assign({ action: 'DUEL' }, room));
    }

    reset() {
        this.settings = {
            automatic: '',
            locked: '',
            mode: '',
            ranked: '',
            banlist: '',
            minelo: '',
            maxelo: ''
        };
        hey({ action: 'RENDER' });
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
                }, {}),
                illegal = this.isLegal(room) ? '' : 'illegal';
            return React.createElement('div', Object.assign({
                onClick: this.enter.bind(this, room),
                className: `game ${room.mode} ${status} ${illegal}`
            }, info), [this.names(room), React.createElement('span', {}, room.banlist)]);
        });
    }

    isLegal(room) {
        if (!room.shuffle) {
            return false;
        }
        if (room.banlist === 'No Banlist') {
            return false;
        }
        if (Number(room.draw_count) !== 1) {
            return false;
        }
        if (room.start_hand_count !== 5) {
            return false;
        }
        return true;

    }

    render() {
        const element = React.createElement;
        return [
            element('div', { id: 'gamelistitems' }, this.renderGamelist()),
            element('div', { id: 'gamelistfilter', key: 'gamelistfilter' }, [
                element('h2', { key: 'h2-1' }, 'Filter'),
                element('controls', { key: 'control-1' }, [
                    element('div', { key: 'col-1', className: 'filtercol' }, [
                        element('select', { key: 'banlist', id: 'banlist', onChange: this.onChange.bind(this) }, [
                            element('option', { key: 'empty', value: '', selected: true }, 'Banlist')
                        ].concat(this.state.banlist.map((list, i) => {
                            return element('option', { value: list.name, key: list.name }, list.name);
                        }))),
                        element('select', { key: 'mode', id: 'mode', onChange: this.onChange.bind(this), value: this.settings.mode }, [
                            element('option', { key: 'sm', value: '' }, 'Single/Match'),
                            element('option', { key: 's', value: 'Single' }, 'Single'),
                            element('option', { key: 'm', value: 'Match' }, 'Match')
                        ]),
                        element('select', { key: 'automatic', id: 'automatic', onChange: this.onChange.bind(this), }, [
                            element('option', { key: 'am', value: '' }, 'Automatic/Manual'),
                            element('option', { key: 'a', value: 'Automatic' }, 'Automatic'),
                            element('option', { key: 'm', value: 'Manual' }, 'Manual')
                        ]),
                        element('select', { key: 'ranked', id: 'ranked', onChange: this.onChange.bind(this) }, [
                            element('option', { key: 're', value: '' }, 'Ranked/Exhibition'),
                            element('option', { key: 'r', value: 'Ranked' }, 'Ranked'),
                            element('option', { key: 'e', value: 'Exhibition' }, 'Exhibition')
                        ]),
                        element('input', { key: 'username', id: 'username', type: 'text', placeholder: 'Username', onBlur: this.onChange.bind(this) }),
                        element('br', { key: 'br-1' }),
                        element('input', { key: 'minelo', id: 'minelo', type: 'number', placeholder: 'Minimum Elo', onBlur: this.onChange.bind(this) }),
                        element('input', { key: 'maxelo', id: 'maxelo', type: 'number', placeholder: 'Maximum Elo', onBlur: this.onChange.bind(this) }),
                        element('br', { key: 'br-2' }),
                        element('button', { key: 'reset', onClick: this.reset.bind(this) }, 'Reset')
                    ])
                ])
            ]),
            React.createElement('div', { className: 'gamelistcenter' },
                `Active Duels : ${this.state.activeduels} | Duelist : ${this.state.duelist} | Connected : ${this.state.userlist.length}`)
        ];
    }
}