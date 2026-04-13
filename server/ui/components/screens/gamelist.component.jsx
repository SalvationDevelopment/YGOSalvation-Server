import React, { useState, useEffect } from 'react';
import { emit } from '../../services/listener.service';
import { subscribe } from '../../hooks/use-listener';
import styles from './gamelist.component.module.scss';

function filterGames(activeSettings, sourceGamelist) {
    const games = Object.keys(sourceGamelist || {}).map((key) => {
        return sourceGamelist[key];
    });
    return games.filter((game) => {
        return Object.keys(activeSettings).every((setting) => {
            if (!activeSettings[setting]) {
                return true;
            }
            if (setting === 'username') {
                return game.player.some((player) => {
                    return player.username.indexOf(activeSettings[setting]) > -1;
                });
            }
            if (setting === 'minelo') {
                return game.player.some((player) => {
                    return player.ranking.elo >= Number(activeSettings[setting]);
                });
            }
            if (setting === 'maxelo') {
                return game.player.some((player) => {
                    return player.ranking.elo <= Number(activeSettings[setting]);
                });
            }
            return activeSettings[setting] === game[setting];

        });
    });
}

export default function GamelistScreen() {

    const [activeDuelistCount, setActiveDuelistCount] = useState(0),
        [activeDuelCount, setActiveDuelCount] = useState(0),
        [userlist, setUserlist] = useState([]),
        [gamelist, setGamelist] = useState({}),
        [filteredList, setFilteredList] = useState([]),
        [banlist, setBanlist] = useState([]),
        [settings, updateSettings] = useState({
            automatic: '',
            locked: '',
            mode: '',
            ranked: '',
            banlist: '',
            username: '',
            minelo: '',
            maxelo: ''
        });

    subscribe('BANLIST', (action) => {
        setBanlist(Array.isArray(action.banlist) ? action.banlist : []);
    });

    subscribe('GAME_LIST', (action) => {
        const nextGamelist = action.gamelist || {};
        setGamelist(nextGamelist);
        setActiveDuelCount(Object.keys(nextGamelist).length);
        setUserlist(action.userlist || []);

        const duelistCountReduction = Object.keys(nextGamelist).reduce((list, gameroomid) => {
            nextGamelist[gameroomid].player.forEach((player) => {
                list.add(player.username);
            });
            return list;
        }, new Set()).size;

        setActiveDuelistCount(duelistCountReduction);
    });

    useEffect(() => {
        emit({ action: 'REQUEST_GAME_LIST' });
    }, []);

    useEffect(() => {
        setFilteredList(filterGames(settings, gamelist));
    }, [gamelist, settings]);



    function onChange(event) {
        const id = event.target.id;
        const value = event.target.value === 'on' ? event.target.checked : event.target.value;
        const nextSettings = {
            ...settings,
            [id]: value
        };
        updateSettings(nextSettings);
    }

    function enter(room) {
        emit(Object.assign({ action: 'DUEL' }, room));
    }

    function reset() {
        const nextSettings = {
            automatic: '',
            locked: '',
            mode: '',
            ranked: '',
            banlist: '',
            username: '',
            minelo: '',
            maxelo: ''
        };

        updateSettings(nextSettings);

    }

    function names(room) {
        const players = room.player,
            player1 = (players[0]) ? players[0].username : '_____',
            player2 = (players[1]) ? players[1].username : '_____',
            player3 = (players[2]) ? players[2].username : '_____',
            player4 = (players[3]) ? players[3].username : '_____';
        if (room.mode === 'Tag') {
            return `${player1} & ${player2} vs ${player3} & ${player4} `;
        }
        return `${player1} vs ${player2}`;
    }

    function isLegal(room) {
        if (!room.shuffle) {
            return false;
        }
        if (room.banlist === 'No Banlist') {
            return false;
        }
        if (Number(room.drawCountPerTurn) !== 1) {
            return false;
        }
        if (Number(room.startingDrawCount) !== 5) {
            return false;
        }
        return true;

    }

    function Gamelist() {
        return filteredList.map((room, i) => {
            const status = (room.started) ? 'started' : 'avaliable',
                info = Object.keys(room).reduce((hash, data) => {
                    hash['data-' + data] = room[data];
                    return hash;
                }, {}),
                illegal = isLegal(room) ? '' : 'illegal',
                attributes = Object.assign({
                    onClick: enter.bind(this, room),
                    className: `game ${room.mode} ${status} ${illegal}`
                }, info);


            return <div {...attributes} key={i}>
                <span key={`room-name-${i}`}>{names(room)}</span>
                <span key={`room-banlist-${i}`}>{room.banlist}</span>
            </div>;
        });
    }

    return <div className={styles.gamelistScreen}>

        <div id='gamelistfilter'>
            <h2>Filter</h2>
            <div className='filtercontrols'>
                <div key='col-1' className='filtercol'>
                    <select key='banlist' id='banlist' onChange={onChange} value={settings.banlist}>
                        {[<option key='empty' value=''>Banlist</option>
                        ].concat((Array.isArray(banlist) ? banlist : []).map((list, i) => {
                            return <option value={list.name} key={list.name}>  {list.name}</option>;
                        }))}
                    </select>
                    <select key='mode' id='mode' onChange={onChange} value={settings.mode}>
                        <option key='sm' value='' >Single/Match</option>
                        <option key='s' value='Single'>Single</option>
                        <option key='m' value='Match'>Match</option>
                    </select>
                    <select key='automatic' id='automatic' onChange={onChange} value={settings.automatic}>
                        <option key='am' value=''>Automatic/Manual</option>
                        <option key='a' value='Automatic'>Automatic</option>
                        <option key='m' value='Manual'>Manual</option>
                    </select>
                    <select key='ranked' id='ranked' onChange={onChange} value={settings.ranked}>
                        <option key='re' value=''>Ranked/Exhibition</option>
                        <option key='r' value='Ranked'>Ranked</option>
                        <option key='e' value='Exhibition'>Exhibition</option>
                    </select>
                    <input key='username' id='username' type='text' placeholder='Username' value={settings.username} onChange={onChange} />
                    <br />
                    <input key='minelo' id='minelo' type='number' placeholder='Minimum Elo' value={settings.minelo} onChange={onChange} />
                    <input key='maxelo' id='maxelo' type='number' placeholder='Maximum Elo' value={settings.maxelo} onChange={onChange} />
                    <br />
                    <button key='reset' onClick={reset}>Reset</button>
                </div>
            </div>
        </div>
                <div id='gamelistitems'>
            <Gamelist />
        </div>
        <div className='gamelistcenter' >
            {`Active Duels =${activeDuelCount} | Duelist =${activeDuelistCount} | Connected =${userlist.length}`}
        </div>
    </div>;
}
