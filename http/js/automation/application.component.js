/*global React, Store, DuelScreen, SideChat, LobbyScreen, databaseSystem*/
class ApplicationComponent extends React.Component {
    constructor(store) {
        super();
        this.store = store;
        this.chat = new SideChat(this.store);
        this.duel = new DuelScreen(this.store, this.chat, databaseSystem);
        this.lobby = new LobbyScreen(this.store, this.chat);
        this.state = {
            mode: 'lobby'
        };
        this.connect();
    }

    connect() {
        const urlParams = new URLSearchParams(window.location.search),
            primusprotocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';

        this.primus = window.Primus.connect(primusprotocol + location.host + ':' + urlParams.get('room'));

        this.primus.on('data', (data) => {
            if (data.action) {
                this.action(data);
            }
        });

        this.primus.on('open', () => {
            this.primus.write({
                action: 'register',
                usernamename: localStorage.nickname,
                session: localStorage.session
            });
        });

        this.primus.on('error', (error) => {
            console.log('error', error);
        });
    }

    action(message) {
        switch (message.action) {
            case 'lobby':
                this.lobby.update(message.game);
                break;
            case 'registered':
                this.primus.write({
                    action: 'join'
                });
                break;
            case 'decks':
                message.decks.forEach(function (deck, index) {
                    $('.currentdeck').append('<option value="' + index + '">' + deck.name + '</option>');
                });
                window.decks = message.decks;
                break;
            case 'chat':
                this.store.dispatch('CHAT_ENTRY', {
                    message: `[${new Date(message.date).toLocaleTimeString()}] '${message.username}: ${message.message}`
                });
                break;
            case 'start':
                $('#lobby').toggle();
                $('#duelscreen').toggle();
                break;

            case 'turn_player':
                window.verification = message.verification;
                $('#selectwhogoesfirst').css('display', 'block');
                break;
            case 'ygopro':
                manualReciver(message.message);
                break;
            default:
                return;
        }
    }

    render() {
        switch (this.state.mode) {
            case 'lobby':
                return React.createElement('section', { id: 'lobby' }, this.lobby.render());
            case 'duel':
                return React.createElement('section', { id: 'duel' }, this.duel.render());
            case 'siding':
                return React.createElement('section', { id: 'siding' }, this.siding.render());
            default:
                return React.createElement('section', { id: 'error' }, this.error.render());
        }
    }
}

const store = new Store(),
    app = new ApplicationComponent(store);

document.addEventListener('DOMContentLoaded', function (event) {
    ReactDOM.render(app.render(), document.getElementById('main'));
});

