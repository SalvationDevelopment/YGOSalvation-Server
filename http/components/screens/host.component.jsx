import React, { useState, useEffect } from 'react';
import { hey,  watchOut } from '../../services/listener.service';

export default function HostScreen() {

    const [banlist, setBanlist ] = useState([]),
     [settings, updateSettings ] = useState({
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
        
        updateSettings({...settings, [id] :event.target.value});

        if (event.target.value === 'on') {
            updateSettings({...settings, [id] :event.target.checked});
        }

        if (id === 'mode') {
            switch (event.target.value) {
                case 'Single':
                    updateSettings({...settings, LIFE_POINTS :8000});
                    break;
                case 'Match':
                    updateSettings({...settings, LIFE_POINTS :8000});
                    break;
                case 'Tag':
                    updateSettings({...settings, LIFE_POINTS :16000});
                    break;
            }
        }
        if (id === 'banlist') {
            setBanlist(banlist.find((list) => {
                return list.name === event.target.value;
            }));
            updateSettings({...settings, MASTER_RULE : banlist.masterRule});
        }
    }

    function host() {
        hey({ action: 'HOST', settings: settings });
    }


    return React.createElement('section', { id: 'hostSettings' }, [
        React.createElement('h2', {}, 'Settings'),
        React.createElement('br', {}),
        React.createElement('label', {}, 'Cardpool'),
        React.createElement('select', { id: 'CARD_POOL', onChange: onChange.bind(this) }, [
            React.createElement('option', { key: 'OCG', value: 'OCG' }, 'OCG'),
            React.createElement('option', { key: 'TCG', value: 'TCG' }, 'TCG'),
            React.createElement('option', { key: 'OCG/TCG', value: 'OCG/TCG', selected: true }, 'OCG/TCG')
        ]),
        React.createElement('br', {}),
        React.createElement('label', {}, 'Ban list'),
        React.createElement('select', {
            id: 'BANLIST',
            onChange: onChange.bind(this)
        }, [banlist.map((list, i) => {
            return React.createElement('option', { value: list.name, selected: list.primary }, list.name);
        })]),
        React.createElement('br', {}),
        React.createElement('label', {}, 'Duel Mode'),
        React.createElement('select', { id: 'MODE', onChange: onChange.bind(this) }, [
            React.createElement('option', { key: 'single', value: 'Single' }, 'Single'),
            React.createElement('option', { key: 'match', value: 'Match', selected: true }, 'Match'),
            React.createElement('option', { key: 'tag', value: 'Tag', disabled: true }, 'Tag')
        ]),
        React.createElement('br', { key: 'brstartgame' }),
        React.createElement('label', {}, 'Pre Game'),
        React.createElement('select', { id: 'START_GAME', onChange: onChange.bind(this) }, [
            React.createElement('option', { key: 'rps', value: 'rps', selected: true }, 'Rock/Paper/Scissors'),
            React.createElement('option', { key: 'fac', value: 'coin' }, 'Flip a Coin'),
            React.createElement('option', { key: 'rd', value: 'dice' }, 'Roll Dice')
        ]),
        React.createElement('br', {}),
        React.createElement('label', {}, 'Time Limit'),
        React.createElement('select', { id: 'TIME_LIMIT', onChange: onChange.bind(this) }, [
            React.createElement('option', { key: '3m', value: 180000 }, '3 Minutes'),
            React.createElement('option', { key: '6m', value: 360000, selected: true }, '6 Minutes'),
            React.createElement('option', { key: '9m', value: 540000 }, '9 Minutes'),
            React.createElement('option', { key: '12m', value: 720000 }, '12 Minutes'),
            React.createElement('option', { key: '15m', value: 900000 }, '15 Minutes')
        ]),
        React.createElement('br', { key: 'k1' }),
        React.createElement('br', { key: 'k2' }),
        React.createElement('h2', { key: 'k3' }, 'Additional Options'),
        React.createElement('br', { key: 'k4' }),
        //React.createElement('label', {}, 'Use AI'),
        //React.createElement('input', { type: 'checkbox', id: 'useai', disabled: true, onChange: onChange.bind(this) }),
        //React.createElement('select', { id: 'aidecks', disabled: true, onChange: onChange.bind(this) }, []),
        React.createElement('label', {}, 'Automatic Mode (In Development'),
        React.createElement('input', {
            type: 'checkbox',
            id: 'AUTOMATIC',
            checked: settings.AUTOMATIC,
            onChange: onChange.bind(this)
        }),
        React.createElement('label', {}, 'Validate Deck'),
        React.createElement('input', {
            type: 'checkbox',
            id: 'DECK_CHECK',
            checked: settings.DECK_CHECK,
            onChange: onChange.bind(this)
        }),
        React.createElement('label', {}, 'Shuffle Deck'),
        React.createElement('input', {
            type: 'checkbox',
            id: 'SHUFFLE',
            checked: settings.SHUFFLE,
            onChange: onChange.bind(this)
        }),
        React.createElement('label', {}, 'Ranked'),
        React.createElement('input', { type: 'checkbox', id: 'RANKED', onChange: onChange.bind(this) }),
        React.createElement('label', {}, 'Use Password'),
        React.createElement('input', { type: 'checkbox', id: 'LOCKED', onChange: onChange.bind(this) }),
        //React.createElement('label', {}, 'Lifepoints'),
        //React.createElement('input', { type: 'number', id: 'LIFE_POINTS', onChange: onChange.bind(this), value: 8000 }),
        React.createElement('br', {}),
        React.createElement('div', { className: 'button', id: 'creategameok', onClick: host.bind(this) }, 'Host')
    ]);


}