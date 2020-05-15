/*global React, ReactDOM, $*/
/*global store, SideChat, SuperFooterComponent, SuperHeaderComponent*/
/*global HostScreen, LoginScreen, DeckEditScreen, GamelistScreen, CreditsScreen, SettingsScreen*/
/*global RankingScreen, FAQsScreen*/
/*global ManualControls*/

class ApplicationComponent extends React.Component {
    constructor(store) {
        super();
        this.store = store;
        this.state = {
            admin: false,
            activeUsers: 0,
            globalMessage: '',
            screen: 'login',
            session: '',
            username: '',
            modalActive: false

        };
        this.host = new HostScreen(store, {});
        this.loginScreen = new LoginScreen(store, {});
        this.deckEditor = new DeckEditScreen(store, {});
        this.superHeader = new SuperHeaderComponent(store, {});
        this.superFooter = new SuperFooterComponent(store, {});
        this.gameList = new GamelistScreen(store, {});
        this.rankings = new RankingScreen(store);
        this.faqs = new FAQsScreen();
        this.news = new NewsScreen(store);
        this.credits = new CreditsScreen();
        this.settings = new SettingsScreen(store);
        this.downloads = new DownloadsPage();
        this.root = document.getElementById('application');

        window.addEventListener('unload', function (event) {
            if (localStorage.remember === 'true') {
                return;
            }
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('session');
        });


        store.register('NAVIGATE', (action) => {
            this.state.screen = action.screen;
            ReactDOM.render(this.render(), this.root);
            return this.state;
        });

        store.register('RENDER', (action) => {
            if (this.rendering) {
                return;
            }
            this.rendering = true;
            ReactDOM.render(this.render(), this.root);
            setTimeout(() => {
                this.rendering = false;
            }, 50);
        });


        store.register('LOGOUT_ACCOUNT', (action) => {
            this.state.loggedIn = false;
            window.localStorage.removeItem('remember');
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('session');
            ReactDOM.render(this.render(), this.root);

        });

        store.register('LOGIN_ACCOUNT', (action) => {
            const username = document.getElementById('ips_username').value,
                password = document.getElementById('ips_password').value;

            this.primus.write({
                action: 'register',
                username,
                password
            });
        });

        store.register('LOAD_SESSION', (action) => {
            const session = localStorage.session;
            this.primus.write({
                action: 'loadSession',
                username: localStorage.username,
                session: localStorage.session
            });
        });

        store.register('HOST', (action) => {
            this.primus.write({
                action: 'host',
                info: action.settings
            });
            this.alert('Requesting new game room...');
            setTimeout(() => {
                this.closeModal();
            }, 5000);
        });

        store.register('DUEL', (action) => {
            this.lobby(action.key, action.locked, action.port);
        });

        store.register('SAVE_DECK', (action) => {

            var message = {
                action: 'save',
                deck: action.deck,
                username: localStorage.nickname
            };
            this.primus.write(message);
        });

        store.register('DELETE_DECK', (action) => {

            var message = {
                action: 'delete',
                deck: action.deck,
                username: localStorage.nickname
            };
            this.primus.write(message);
        });


        this.connect();

        localStorage.imageURL = localStorage.imageURL || 'http://127.0.0.1:8887';
        ReactDOM.render(this.render(), this.root);
    }

    alert(message) {
        this.state.modalActive = true;
        this.state.modalMessage = message;
        ReactDOM.render(this.render(), this.root);
    }

    prompt(message) {
        // this.state.modalActive = true;
        // this.state.modalMessage = message;
        ReactDOM.render(this.render(), this.root);

    }

    closeModal() {
        this.state.modalActive = false;
        this.state.modalMessage = '';
        ReactDOM.render(this.render(), this.root);
    }

    ack() {
        if (!this.state.username) {
            return;
        }
        this.primus.write({
            action: 'ack',
            name: this.state.username
        });
    }

    lobby(identifier, locked, port) {
        if (locked && this.state.admin !== false) {
            let guess = '';
            guess = window.prompt('Password?', guess);
            if (identifier !== guess) {
                this.alert('Wrong Password!');
                return;
            }
        }
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            this.alert('Firefox isnt supported at this time, please use Google Chrome.');
            return;
        }
        window.open('/ygopro.html?room=' + port);
    }

    login(data) {
        if (this.state.loggedIn) {
            return;
        }

        if (data.error) {
            this.alert(data.info.message);
            return;
        }
        const info = data.info || data.result;

        if (info.session && info.blocked) {
            return;
        }

        this.state.session = info.session;
        this.state.admin = info.admin;
        this.state.loggedIn = true;
        this.primus.write({
            username: this.state.username,
            action: 'load'
        });
        localStorage.session = info.session;
        localStorage.username = info.username;
        console.log(info);
        this.store.dispatch({ action: 'LOAD_DECKS', decks: info.decks });
        this.store.dispatch({ action: 'LOGGEDIN' });

    }

    registrationRequest() {
        if (this.state.username && this.state.password) {
            this.primus.write({
                action: 'register',
                username: this.state.username,
                password: this.state.password
            });
        }
    }

    onData(data) {
        switch (data.clientEvent) {
            case 'ack':
                this.ack();
                break;
            case 'ackresult':
                this.state.userlist = data.userlist;
                this.state.activeUsers = data.ackresult;
                break;
            case 'gamelist':
                this.state.activeUsers = data.ackresult;
                this.state.userlist = data.userlist;
                this.gameList.update(data);
                break;
            case 'global':
                this.superFooter.update({ global: data.message });
                break;
            case 'lobby':
                this.lobby(data.roompass, data.password, data.port);
                break;
            case 'login':
                this.login(data);
                break;
            case 'registrationRequest':
                this.registrationRequest();
                break;
            case 'savedDeck':
                app.alert('Saved Deck');
                setTimeout(() => {
                    this.closeModal();
                }, 1000);
                console.log(data);
                break;
            case 'deletedDeck':
                app.alert('Deleted Deck');
                setTimeout(() => {
                    this.closeModal();
                }, 1000);
                console.log(data);
                break;
            default:
                console.log('Error: Unknown Data', data);
                return;
        }
        ReactDOM.render(this.render(), this.root);
        return;
    }

    connect() {
        const primusprotocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
        this.primus = window.Primus.connect(primusprotocol + location.host);
        this.primus.on('open', () => {
            console.log('Connected to YGOSalvation Server');
        });
        this.primus.on('close', () => {
            console.log('Disconnected from YGOSalvation Server');
        });

        this.primus.on('data', this.onData.bind(this));

        setInterval(function () {
            if (!this.state.session) {
                return;
            }
            this.primus.write({
                action: 'sessionUpdate',
                session: this.state.session
            });
        }.bind(this), 10000);
    }

    screen() {
        switch (this.state.screen) {
            case 'login':
                return React.createElement('section', { id: 'login', key: 'login' }, this.loginScreen.render());
            case 'deckedit':
                return React.createElement('section', { id: 'deckedit', key: 'deckedit' }, this.deckEditor.render());
            case 'host':
                return React.createElement('section', { id: 'host', key: 'host' }, this.host.render());
            case 'gamelist':
                return React.createElement('section', { id: 'gamelist', key: 'gamelist' }, this.gameList.render());
            case 'settings':
                return React.createElement('section', { id: 'settings', key: 'settings' }, this.settings.render());
            case 'rankings':
                return React.createElement('section', { id: 'rankings', key: 'rankings' }, this.rankings.render());
            case 'faqs':
                return React.createElement('section', { id: 'faqs', key: 'raqs' }, this.faqs.render());
            case 'news':
                return React.createElement('section', { id: 'news', key: 'raqs' }, this.news.render());
            case 'downloads':
                return React.createElement('section', { id: 'downloads', key: 'downloads' }, this.downloads.render());
            case 'credits':
                return React.createElement('section', { id: 'credits', key: 'credits' }, this.credits.render());
            default:
                return React.createElement('section', { id: 'error', key: 'error' }, '');
        }
    }

    modalRender() {
        if (!this.state.modalActive) {
            return '';
        }
        return React.createElement('div', { id: 'lightbox', key: 'lightbox' }, [
            React.createElement('p', { id: 'error' }, [
                this.state.modalMessage,
                React.createElement('button', { id: 'modal-ok', onClick: this.closeModal.bind(this) }, 'OK')
            ])
        ]);
    }

    translate(lang) {
        this.state.language = lang;
        ReactDOM.render(this.render(), this.root);
    }
    language() {
        return React.createElement('div', { id: 'languagesetter', key: 'languagesetter' }, [
            React.createElement('span', { key: 'en', onClick: this.translate.bind(this, 'en') }, 'English'),
            React.createElement('span', { key: 'es', onClick: this.translate.bind(this, 'es') }, 'Español'),
            React.createElement('span', { key: 'de', onClick: this.translate.bind(this, 'de') }, 'Deutsch'),
            React.createElement('span', { key: 'fr', onClick: this.translate.bind(this, 'fr') }, 'Français(France)'),
            React.createElement('span', { key: 'frca', onClick: this.translate.bind(this, 'fr-ca') }, 'Français(Québec)'),
            React.createElement('span', { key: 'it', onClick: this.translate.bind(this, 'it') }, 'Italiano'),
            React.createElement('span', { key: 'pt', onClick: this.translate.bind(this, 'pt') }, 'Português'),
            React.createElement('span', { key: 'nl', onClick: this.translate.bind(this, 'nl') }, 'Nederlands'),
            React.createElement('span', { key: 'jp', onClick: this.translate.bind(this, 'jp') }, '日本語'),
            React.createElement('span', { key: 'tr', onClick: this.translate.bind(this, 'tr') }, 'Türkçe'),
            React.createElement('span', { key: 'el', onClick: this.translate.bind(this, 'el') }, 'Ελληνικά'),
            React.createElement('span', { key: 'fa', onClick: this.translate.bind(this, 'fa') }, 'فارسی'),
            React.createElement('span', { key: 'ar', onClick: this.translate.bind(this, 'ar') }, 'لغةعربي'),
            React.createElement('span', { key: 'zh', onClick: this.translate.bind(this, 'zh') }, '中文(简体)'),
            React.createElement('span', { key: 'he', onClick: this.translate.bind(this, 'he') }, 'עברית')
        ]);
    }

    render() {
        return React.createElement('div', { key: 'top' }, [
            this.superHeader.render(this.state.loggedIn),
            this.screen(),
            this.language(),
            this.superFooter.render(),
            this.modalRender()
        ]);
    }

}

const app = new ApplicationComponent(store);