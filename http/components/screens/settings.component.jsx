import React, { useEffect, useState } from 'react';
import { hey } from '../../services/listener.service';
import { getStorage, persist } from '../../services/storage.service';

export default function SettingsScreen() {

    const settings = getStorage(),
        [backgrounds, setBackgrounds] = useState([]),
        [covers, setCovers] = useState([]);

    useEffect(() => {
        fetch('/backgrounds')
            .then(response => response.json())
            .then(data => {
                backgrounds = setBackgrounds(Array.isArray(data) ? data : []);
            });

        fetch('/covers')
            .then((response) => response.json())
            .then(data => {
                setCovers(Array.isArray(data) ? data : []);
            });
    }, []);


    function onChange(event) {
        console.log('eep');
        const id = event.target.id;
        settings[id] = event.target.value;

        if (event.target.value === 'on') {
            settings[id] = event.target.checked;
        }

        persist('theme', settings.theme);
        persist('all_banlist', settings.all_banlist);
        persist('language', settings.language);
        persist('imageURL', settings.imageURL);

        document.body.style.backgroundImage = `url(${settings.theme})`;
    }

    function Background() {
        return backgrounds.map((background, i) => {
            return <option value={background.image.url} key={`key-${i}`}>{background.name}</option>;
        });
    }

    function Covers() {
        return covers.map((cover, i) => {
            return <option value={cover.image.url} key={`key-${i}`}> {cover.name}</option>;
        });
    }



    return <section id='hostSettings' key='hostSettings'>
        <h2>Settings</h2>
        <label>Theme</label>
        <select

            id='theme'
            onChange={onChange}>
            <Background />
        </select>
        <label>Cover</label>
        <select
            id='theme'
            onChange={onChange}>
            <Covers />
        </select>
        <img src={getStorage().cover} style={{ width: '100%' }} />
        <label>Image URL</label>
        <input
            id='imageURL'
            defaultValue={settings.imageURL}
            placeholder='http://localhost=8887'
            onBlur={onChange}
        />
        <label>   Hide Old Banlist</label>
        <input id='oldbanlist' type='checkbox' />
        <label>   Play Assistance</label>
        <input id='playassist' type='checkbox' />
        <label>   Automatically Bluff</label>
        <input id='bluff' type='checkbox' />
    </section>;

}

// '../public/img/magimagipinkshadow.jpg'
// '../public/img/magimagipinkshadow2.jpg'
// '../public/img/magimagipink.jpg'
// '../public/img/magimagiblack.jpg'