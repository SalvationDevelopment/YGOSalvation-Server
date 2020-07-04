/*global React, ReactDOM, $*/
class SettingsScreen extends React.Component {
    constructor(store) {
        super();
        this.state = {

        };
        this.settings = {
            theme: localStorage.theme || '../img/magimagipinkshadow.jpg',
            cover: localStorage.cover || '../img/textures/cover.jpg',
            imageURL: localStorage.imageURL || 'http://127.0.0.1:8887',
            hide_banlist: Boolean(localStorage.all_banlist),
            language: localStorage.language || 'en'

        };
        this.store = store;
        this.backgrounds = [];
        this.cover = [];
        fetch('/backgrounds').then((response) => {
            response.json().then(data => {
                this.backgrounds = Array.isArray(data) ? data : [];
                this.store.dispatch({ action: 'RENDER' });
            });
        });

        fetch('/covers').then((response) => {
            response.json().then(data => {
                this.covers = data;
                this.store.dispatch({ action: 'RENDER' });
            });
        });

    }


    onChange(event) {
        console.log('eep');
        const id = event.target.id;
        this.settings[id] = event.target.value;
        if (event.target.value === 'on') {
            this.settings[id] = event.target.checked;
        }

        localStorage.theme = this.settings.theme;
        localStorage.all_banlist = this.settings.all_banlist;
        localStorage.language = this.settings.language;
        localStorage.imageURL = this.settings.imageURL;
        document.body.style.backgroundImage = `url(${this.settings.theme})`;
        this.store.dispatch({ action: 'RENDER' });

    }

    renderBackground() {
        const element = React.createElement;
        return this.backgrounds.map((background, i) => {
            return element('option', { value: background.image.url, key: `key-${i}` }, background.name);
        });
    }

    renderCover() {
        const element = React.createElement;
        return this.cover.map((cover, i) => {
            return element('option', { value: cover.image.url, key: `key-${i}` }, cover.name);
        });
    }


    render() {
        const element = React.createElement;
        return element('section', { id: 'hostSettings', key: 'hostSettings' }, [
            element('h2', { key: 'h2-settings' }, 'Settings'),
            element('label', { key: 'label-heme' }, 'Theme'),
            element('select', { key: 'select-theme', id: 'theme', value: this.settings.theme, onChange: this.onChange.bind(this) }, this.renderBackground()),
            element('label', { key: 'label-cover' }, 'Cover'),
            element('select', { key: 'select-cover', id: 'cover', value: this.settings.cover, onChange: this.onChange.bind(this) }, this.renderCover()),
            element('img', { key: 'imgtime', key: 'imgtheme', src: localStorage.cover, style: { width: '100%' } }),
            element('label', { key: 'label-image' }, 'Image URL'),
            element('input', { key: 'input-url', id: 'imageURL', defaultValue: this.settings.imageURL, placeholder: 'http://localhost:8887', onBlur: this.onChange.bind(this) }),
            element('label', { key: 'label-old' }, 'Hide Old Banlist'),
            element('input', { key: 'input-old', id: 'oldbanlist', type: 'checkbox' }),
            element('label', { key: 'label-play' }, 'Play Assistance'),
            element('input', { key: 'input-play', id: 'playassist', type: 'checkbox' }),
            element('label', { key: 'label-auto' }, 'Automatically Bluff'),
            element('input', { key: 'input-bluff', id: 'bluff', type: 'checkbox' })
        ]);
    }
}