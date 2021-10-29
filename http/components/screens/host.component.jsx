import React, { useState, useEffect } from 'react';
import { hey, watchOut } from '../../services/listener.service';

export default function HostScreen() {

    const [banlist, setBanlist] = useState([]),
        [settings, updateSettings] = useState({
            AUTOMATIC: true,
            BANLIST: 'No Banlist',
            CARD_POOL: 'OCG/TCG',
            DECK_CHECK: true,
            DRAW_COUNT: 1,
            LOCKED: false,
            MASTER_RULE: 4,
            MODE: 'Match',
            OT: 2,
            SHUFFLE: true,
            LIFE_POINTS: 8000,
            TIME_LIMIT: 180000,
            RANKED: false,
            START_GAME: 'rps'
        });

    useEffect(() => {
        watchOut('BANLIST', (action) => {
            //setPrimary(action.primary);
            setBanlist(action.banlist);
        });
    });

    function onChange(event) {
        const id = event.target.id;

        updateSettings({ ...settings, [id]: event.target.value });

        if (event.target.value === 'on') {
            updateSettings({ ...settings, [id]: event.target.checked });
        }

        if (id === 'mode') {
            switch (event.target.value) {
                case 'Single':
                    updateSettings({ ...settings, LIFE_POINTS: 8000 });
                    break;
                case 'Match':
                    updateSettings({ ...settings, LIFE_POINTS: 8000 });
                    break;
                case 'Tag':
                    updateSettings({ ...settings, LIFE_POINTS: 16000 });
                    break;
            }
        }
        if (id === 'banlist') {
            setBanlist(banlist.find((list) => {
                return list.name === event.target.value;
            }));
            updateSettings({ ...settings, MASTER_RULE: banlist.masterRule });
        }
    }

    function host() {
        hey({ action: 'HOST', settings: settings });
    }


    return <section id='hostSettings'>
        <h2>Settings</h2>
        <br />
        <label>Cardpool</label>
        <select id='CARD_POOL' onChange={onChange}>
            <option key='OCG' value='OCG'>OCG</option>
            <option key='TCG' value='TCG'>TCG</option>
            <option key='OCG/TCG' value='OCG/TCG' selected={true}>OCG/TCG</option>
        </select>
        <br />
        <label>Ban</label>
        <select
            id='BANLIST'
            onChange={onChange}>
            {banlist.map((list, i) => <option key={i} value={list.name} selected={list.primary} >{list.name}</option>)}
        </select>
        <br />
        <label>Duel </label>
        <select id='MODE' onChange={onChange}>
            <option key='single' value='Single'>Single</option>
            <option key='match' value='Match' selected={true}>Match</option>
            <option key='tag' value='Tag' disabled={true}>Tag</option>
        </select>
        <br />
        <label>Pre Game</label>
        <select id='START_GAME' onChange={onChange}>
            <option key='rps' value='rps' selected={true}>Rock/Paper/Scissors</option>
            <option key='fac' value='coin'>Flip a Coin</option>
            <option key='rd' value='dice'>Roll Dice</option>
        </select>
        <br />
        <label>Time Limit</label>
        <select id='TIME_LIMIT' onChange={onChange}>
            <option key='3m' value={180000}>3 Minutes</option>
            <option key='6m' value={360000} selected={true}>6 Minutes</option>
            <option key='9m' value={540000}>9 Minutes</option>
            <option key='12m' value={720000}>12 Minutes</option>
            <option key='15m' value={900000}>15 Minutes</option>
        </select>
        <br />
        <br />
        <h2>Additional Options</h2>
        <br />
        {/*
        <label>Use AI</label>
        <input type='checkbox' id='useai' disabled= {true} onChange={onChange} />
        <select id='aidecks' disabled={true} onChange={onChange}></select> 
        */}
        <label>Automatic Mode (In Development)</label>
        <input
            type='checkbox'
            id='AUTOMATIC'
            checked={settings.AUTOMATIC}
            onChange={onChange}
        />
        <label>Validate Deck</label>
        <input
            type='checkbox'
            id='DECK_CHECK'
            checked={settings.DECK_CHECK}
            onChange={onChange}
        />
        <label>Shuffle Deck</label>
        <input
            type='checkbox'
            id='SHUFFLE'
            checked={settings.SHUFFLE}
            onChange={onChange}
        />
        <label>Ranked</label>
        <input type='checkbox' id='RANKED' onChange={onChange} />
        <label>Use Password</label>
        <input type='checkbox' id='LOCKED' onChange={onChange} />
        {/*         
        <label>Lifepoints</label>
        <input type='number' id='LIFE_POINTS' onChange={onChange} value={8000} />
         */}
        <br />
        <div className='button' id='creategameok' onClick={host}>Host</div>
    </section >;
}