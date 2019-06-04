/*global React, ReactDOM*/
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
            username: ''

        };
        this.loginScreen = new LoginScreen(store, {});
        this.deckeditor = new DeckEditScreen(store, {});
        this.superheader = new SuperHeaderComponent(store, {});
        this.superfooter = new SuperFooterComponent(store, {});
        this.gamelist = {};
        this.root = document.getElementById('application');

        store.register('NAVIGATE', (action) => {
            this.state.screen = action.screen;
            ReactDOM.render(this.render(), this.root);
            return this.state;
        });

        store.register('LOGIN', (action) => {
            const username = document.getElementById('ips_username').value,
                password = document.getElementById('ips_password').value;

            this.primus.write({
                action: 'register',
                username,
                password
            });
        });

        this.connect();
        ReactDOM.render(this.render(), this.root);
    }

    alert(message) {

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
        window.open('/react_test.html?room=' + port);
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
                this.gamelist.update(data.gamelist);
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

    render() {
        return [
            this.superheader.render(),
            this.screen(),
            this.superfooter.render()
        ];
    }
}


const store = new Store(),
    app = new ApplicationComponent(store);