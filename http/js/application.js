/*global React, ReactDOM, $*/
/*global Store, SideChat, SuperFooterComponent, SuperHeaderComponent*/

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
        this.deckeditor = new DeckEditScreen(store, {});
        this.superheader = new SuperHeaderComponent(store, {});
        this.superfooter = new SuperFooterComponent(store, {});
        this.gamelist = new GamelistScreen(store, {});
        this.root = document.getElementById('application');

        store.register('NAVIGATE', (action) => {
            this.state.screen = action.screen;
            ReactDOM.render(this.render(), this.root);
            return this.state;
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

        store.register('HOST', (action) => {
            this.primus.write({
                action: 'host',
                info: action.settings
            });
        });


        this.connect();
        ReactDOM.render(this.render(), this.root);
    }

    alert(message) {
        this.state.modalActive = true;
        this.state.modalMessage = message;
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

    lobby(identifier, password, port) {
        if (password && this.state.admin !== false) {
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
            this.alert(data.error.message);
            return;
        }
        const info = data.info;

        if (info.session && info.bans.length) {
            return;
        }

        this.state.session = info.session;
        this.state.admin = info.admin;
        this.state.loggedIn = true;
        this.primus.write({
            username: this.state.username,
            action: 'load'
        });
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
        console.log(data.clientEvent, data);
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
                this.gamelist.update(data);
                break;
            case 'global':
                this.superfooter.update({ global: data.message });
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

        this.primus.on('data', this.onData.bind(this));
        this.primus.on('connect', () => {
            console.log('Connected to YGOSalvation Server');
        });
        this.primus.on('close', () => {
            console.log('Disconnected from YGOSalvation Server');
        });

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
                return React.createElement('section', { id: 'login' }, this.loginScreen.render());
            case 'deckedit':
                return React.createElement('section', { id: 'deckedit' }, this.deckedit.render());
            case 'host':
                return React.createElement('section', { id: 'host' }, this.host.render());
            case 'gamelist':
                return React.createElement('section', { id: 'gamelist' }, this.gamelist.render());
            default:
                return React.createElement('section', { id: 'error' }, '');
        }
    }

    modalRender() {
        if (!this.state.modalActive) {
            return '';
        }
        return React.createElement('div', { id: 'lightbox' }, [
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
        return [
            this.superheader.render(this.loggedIn),
            this.screen(),
            this.language(),
            this.superfooter.render(),
            this.modalRender()
        ];
    }
}

const store = new Store(),
    app = new ApplicationComponent(store);