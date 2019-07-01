/*global React, ReactDOM*/
/*global Store, ChoiceScreen, DuelScreen, SideChat, LobbyScreen, databaseSystem*/

let orientation = 0;
function orient(player) {
    return
}

class ApplicationComponent extends React.Component {
    constructor(store) {
        super();

        $.getJSON('/manifest/manifest_0-en-OCGTCG.json', (databaseSystem) => {
            this.store = store;
            this.chat = new SideChat(this.store);
            this.duel = new DuelScreen(this.store, this.chat, databaseSystem);
            this.choice = new ChoiceScreen(this.store, this.chat);
            this.state = {
                mode: 'lobby',
                tick: 0
            };
            this.connect();
        });
    }

    connect() {
        const urlParams = new URLSearchParams(window.location.search),
            primusprotocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';

        this.primus = window.Primus.connect(primusprotocol + location.host + ':' + urlParams.get('room'));
        this.lobby = new LobbyScreen(this.store, this.chat, this.primus);
        this.primus.on('data', (data) => {
            this.duel.lifepoints.state.waiting = false;
            if (data.action) {
                this.action(data);
            }
            ReactDOM.render(this.render(), document.getElementById('main'));
            layouthand(0);
            layouthand(1);
            const list = document.getElementById('sidechattext');
            list.scrollTop = list.scrollHeight;
        });

        this.primus.on('open', () => {
            console.log('connected, registering');
            this.primus.write({
                action: 'register',
                username: localStorage.username,
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

        this.store.register('CONTROL_CLICK', (message, state) => {
            this.primus.write({
                action: 'question',
                answer: message.card,
                uuid: this.state.question
            });
            return state;
        });

        this.store.register('PHASE_CLICK', (message, state) => {
            this.primus.write({
                action: 'question',
                answer: message.phase,
                uuid: this.state.question
            });
            return state;
        });

        this.store.register('ZONE_CLICK', (message, state) => {
            this.primus.write({
                action: 'question',
                answer: message.zone,
                uuid: this.state.question
            });
            return state;
        });

        this.store.register('POSITION_CARD_CLICK', (message, state) => {
            this.primus.write({
                action: 'question',
                answer: message.position,
                uuid: this.state.question
            });
            return state;
        });


        this.store.register('YESNO_CLICK', (message, state) => {
            this.primus.write({
                action: 'question',
                answer: message.yesno,
                uuid: this.state.question
            });
            return state;
        });

        this.store.register('REVEAL_CARD_CLICK', (message, state) => {
            if (message.selected) {
                const remove = this.state.question_selection.indexOf(message.option);
                this.state.question_selection.splice(remove, 1);
                this.state.question_options.select_options[message.option].selected = false;
                this.duel.reveal(this.state.question_options.select_options);
                this.store.dispatch({ action: 'RENDER' });
                return;
            }
            this.state.question_selection.push(message.option);
            if (this.state.question_selection.length === this.state.question_max) {
                this.primus.write({
                    action: 'question',
                    answer: {
                        type: 'list',
                        i: this.state.question_selection
                    },
                    uuid: this.state.question
                });
                return state;
            }
            console.log(this.state.question_options, message);
            this.state.question_options.select_options[message.option].selected = true;
            this.duel.reveal(this.state.question_options.select_options);
            return state;
        });

        this.store.register('REVEALER_CLOSE', (message, state) => {
            if (this.state.question_selection.length > this.state.question_min) {
                this.primus.write({
                    action: 'question',
                    answer: {
                        type: 'list',
                        i: this.state.question_selection
                    },
                    uuid: this.state.question
                });
            }
            return state;
        });


        this.store.register('RENDER', (message, state) => {
            ReactDOM.render(this.render(), document.getElementById('main'));
            return state;
        });
    }

    duelAction(message) {
        this.duel.disableSelection();
        switch (message.duelAction) {
            case 'start':
                this.state.mode = 'duel';
                this.duel.update(message.info);
                this.duel.updateField(message.field[0]);
                this.duel.updateField(message.field[1]);
                break;
            case 'duel':
                this.duel.update(message.info);
                this.duel.updateField(message.field[0]);
                this.duel.updateField(message.field[1]);
                break;
            case 'question':
                this.setupQuestion(message);
                break;
            case 'announcement':
                this.announcement(message.message);
                break;
            default:
                break;
        }
    }

    setupQuestion(message) {
        console.log('???', message.options.command, message);
        this.state.question = message.uuid;
        this.state.question_min = message.options.select_min;
        this.state.question_max = message.options.select_max;
        this.state.question_options = message.options;
        this.state.question_selection = [];
        this.duel.lifepoints.state.waiting = true;
        this.duel.idle({});
        switch (message.options.command) {
            case 'MSG_SELECT_IDLECMD':
                this.duel.idle(message.options);
                break;
            case 'MSG_SELECT_BATTLECMD':
                this.duel.idle(message.options);
                break;
            case 'MSG_SELECT_PLACE':
                this.duel.select(message.options);
                break;
            case 'MSG_SELECT_CARD':
                this.duel.reveal(message.options.select_options);
                break;
            case 'MSG_CONFIRM_CARDS':
                debugger;
                this.duel.reveal(message.options.select_options);
                break;
            case 'MSG_SELECT_POSITION':
                this.duel.positionDialog.trigger(message.options);
                break;
            case 'MSG_SELECT_EFFECTYN':
                this.duel.yesnoDialog(message.options);
            default:
                throw ('Unknown message');
        }
    }

    announcement(message) {
        console.log('!!!', message.command, message);
        switch (message.command) {
            case ('MSG_WAITING'):
                this.duel.lifepoints.state.waiting = true;
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
                break;
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
            case 'slot':
                this.lobby.update({ slot: message.slot });
                break;
            case 'turn_player':
                this.state.mode = 'choice';
                window.verification = message.verification;
                break;
            case 'ygopro':
                this.duelAction(message.message);
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