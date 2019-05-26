/*global React, ReactDOM*/
/*global Store, DuelScreen, SideChat, LobbyScreen, databaseSystem*/
class ApplicationComponent extends React.Component {
    constructor(store) {
        super();
        this.store = store;
        this.chat = new SideChat(this.store);
        this.duel = new DuelScreen(this.store, this.chat, databaseSystem);
        this.choice = new ChoiceScreen(this.store, this.chat);
        this.state = {
            mode: 'lobby',
            tick: 0
        };
        this.connect();
    }

    connect() {
        const urlParams = new URLSearchParams(window.location.search),
            primusprotocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';

        this.primus = window.Primus.connect(primusprotocol + location.host + ':' + urlParams.get('room'));
        this.lobby = new LobbyScreen(this.store, this.chat, this.primus);
        this.primus.on('data', (data) => {
            if (data.action) {
                this.action(data);
            }
            ReactDOM.render(this.render(), document.getElementById('main'));
            const list = document.getElementById('sidechattext');
            list.scrollTop = list.scrollHeight;
        });

        this.primus.on('open', () => {
            console.log('connected, registering');
            this.primus.write({
                action: 'register',
                usernamename: localStorage.nickname,
                session: localStorage.session
            });
        });

        this.primus.on('error', (error) => {
            console.log('error', error);
        });

        this.store.register('CHAT_ENTRY', (message, state) => {
            this.primus.write({
                action: 'chat',
                message: message.message
            });
            return state;
        });

        this.store.register('START_CHOICE', (message, state) => {
            this.primus.write({
                action: 'start',
                turn_player: message.player,
                verification: window.verification
            });
            return state;
        });
    }

    process(message) {
        if (message.command.indexOf('SELECT') > -1) {
            this.duel.lifepoints.state.waiting = true;
        }
        switch (message.command) {
            case ('MSG_WAITING' || 'STOC_TIME_LIMIT' || 'STOC_WAITING_SIDE'):
                this.duel.lifepoints.state.waiting = true;
                break;
            case ('STOC_TIME_LIMIT'):
                this.duel.lifepoints.time({ player: message.player, time: message.time });
                break;
            case ('MSG_SUMMONING'):
                this.duel.flash({ id: message.id });
                break;
            case ('MSG_SPSUMMONING'):
                this.duel.flash({ id: message.id });
                break;
            case ('MSG_FLIPSUMMONING'):
                this.duel.flash({ id: message.id });
                break;
            case ('MSG_CHAINING'):
                this.duel.flash({ id: message.id });
            case ('MSG_SHUFFLE_DECK'):
                doGuiShuffle(orient(message.player), 'DECK');
                break;
            case ('MSG_SHUFFLE_HAND'):
                doGuiShuffle(orient(message.player), 'DECK');
                break;
            default:
                break;
        }
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
                this.lobby.update({ decks: message.decks });
                window.decks = message.decks;
                break;
            case 'chat':
                this.chat.add(`[${new Date(message.date).toLocaleTimeString()}] ${message.username}: ${message.message}`);
                break;
            case 'start':
                this.state.mode = 'duel';
                break;
            case 'turn_player':
                this.state.mode = 'choice';
                window.verification = message.verification;
                break;
            case 'ygopro':
                this.process(message.message);
                break;
            default:
                return;
        }
    }

    render() {
        switch (this.state.mode) {
            case 'lobby':
                return React.createElement('section', { id: 'lobby' }, this.lobby.render());
            case 'choice':
                return React.createElement('section', { id: 'choice' }, this.choice.render());
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