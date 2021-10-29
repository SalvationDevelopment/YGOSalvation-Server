import React, { useState, useEffect } from 'react';
import { hey, listen, watchOut } from '../../services/listener.service';

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
            minelo: '',
            maxelo: ''
        });

        function filter(list) {
            const games = Object.keys(gamelist).map((key) => {
                return gamelist[key];
            });
            return games.filter((game) => {
                return Object.keys(settings).every((setting) => {
                    if (!settings[setting]) {
                        return true;
                    }
                    if (setting === 'username') {
                        return game.player.some((player) => {
                            return player.username.indexOf(settings[setting]) > -1;
                        });
                    }
                    if (setting === 'minelo') {
                        return game.player.some((player) => {
                            return player.ranking.elo >= Number(settings[setting]);
                        });
                    }
                    if (setting === 'maxlo') {
                        return game.player.some((player) => {
                            return player.ranking.elo <= Number(settings[setting]);
                        });
                    }
                    return settings[setting] === game[setting];
    
                });
            });
        }

    useEffect(() => {
        watchOut('BANLIST', (action) => {
            //setPrimary(action.primary);
            setBanlist(action.banlist);
        });

        watchOut('GAME_LIST', (action) => {
            //setPrimary(action.primary);
            setBanlist(action.banlist);
            setActiveDuelCount(Object.keys(action.gamelist).length);

        const duelistCountReduction = Object.keys(action.gamelist).reduce((list, gameroomid) => {
            action.gamelist[gameroomid].player.forEach((player) => {
                list.add(player.username);
            });
            return list;
        }, new Set()).size;

        setActiveDuelistCount(duelistCountReduction);

        setFilteredList(filter(userlist));
        });
    }, []);



    function onChange(event) {
        const id = event.target.id;
        settings[id] = event.target.value;
        if (event.target.value === 'on') {
            settings[id] = event.target.checked;
        }
        filteredList = filter(userlist);
    }

    function enter(room) {
        hey(Object.assign({ action: 'DUEL' }, room));
    }

    function reset() {
        updateSettings({
            automatic: '',
            locked: '',
            mode: '',
            ranked: '',
            banlist: '',
            minelo: '',
            maxelo: ''
        });

    }

    function names(room) {
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

    function isLegal(room) {
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
                {names(room)}
                <span>{room.banlist}</span>
            </div>;
        });
    }

    return <>
        <div id='gamelistitems'>
            <Gamelist />
        </div>
        <div id='gamelistfilter'>
            <h2>Filter</h2>
            <controls >
                <div key='col-1' className='filtercol'>
                    <select key='banlist' id='banlist' onChange={onChange}>
                        {[<option key='empty' value='' selected={true} >Banlist</option>
                        ].concat(banlist.map((list, i) => {
                            return <option value={list.name} key={list.name}>  {list.name}</option>;
                        }))}
                    </select>
                    <select key='mode' id='mode' onChange={onChange} value={settings.mode}>
                        <option key='sm' value='' >Single/Match</option>
                        <option key='s' value='Single'>Single</option>
                        <option key='m' value='Match'>Match</option>
                    </select>
                    <select key='automatic' id='automatic' onChange={onChange}>
                        <option key='am' value=''>Automatic/Manual</option>
                        <option key='a' value='Automatic'>Automatic</option>
                        <option key='m' value='Manual'>Manual</option>
                    </select>
                    <div key='ranked' id='ranked' onChange={onChange}>
                        <option key='re' value=''>Ranked/Exhibition</option>
                        <option key='r' value='Ranked'>Ranked</option>
                        <option key='e' value='Exhibition'>Exhibition</option>
                    </div>
                    <input key='username' id='username' type='text' placeholder='Username' onBlur={onChange} />
                    <br />
                    <input key='minelo' id='minelo' type='number' placeholder='Minimum Elo' onBlur={onChange} />
                    <input key='maxelo' id='maxelo' type='number' placeholder='Maximum Elo' onBlur={onChange} />
                    <br />
                    <button key='reset' onClick={reset}>Reset</button>
                </div>
            </controls>
        </div>
        <div className='gamelistcenter' >
            {`Active Duels =${activeDuelCount} | Duelist =${activeDuelistCount} | Connected =${userlist.length}`}
        </div>
    </>;
}