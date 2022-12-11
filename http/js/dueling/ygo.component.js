/*global React, ReactDOM*/
/*global Store, ChoiceScreen, DuelScreen, SideChat, LobbyScreen, SideDeckEditScreen, databaseSystem*/

const player = window.parent.__isPlayer1 ? 'player2' : 'player1';

const create = (enabled, prefix) =>
  Object.create(
    {},
    {
      log: {
        get: () => {
            return console.log.bind(console, prefix);
        },
      },
    }
  );

const { log } = create(true, `[${player}]`);

window.orientation = 0;
function orient(player) {
    return (window.orientation) ? (player ? 0 : 1) : player;
}

class ApplicationComponent extends React.Component {
    constructor(store) {
        super();
        this.store = store;
        this.chat = new SideChat(this.store);
        this.choice = new ChoiceScreen(this.store, this.chat);
        this.siding = new SideDeckEditScreen(this.store, this.chat);
        this.state = {
            mode: 'lobby',
            tick: 0
        };

        this.setup(store);
    }

    async setup(store) {
        const databaseResponse = await fetch('/manifest/manifest_0-en-OCGTCG.json'),
            serverStatusResponse = await fetch('/status.json'),
            serverStatus = await serverStatusResponse.json(),
            databaseSystem = await databaseResponse.json();

        this.duel = new DuelScreen(this.store, this.chat, databaseSystem);




        this.connect(serverStatus.PROXY_PORT);
        document.body.style.backgroundImage = `url(${localStorage.theme})`;

    }

    side(deck) {
        this.state.mode = 'siding';
        if (deck) {
            this.siding.loadDeck(deck);
        }
        ReactDOM.render(this.render(), document.getElementById('main'));
    }

    connect(PROXY_PORT) {
        const urlParams = new URLSearchParams(window.location.search),
            primusprotocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';

        this.primus = window.Primus.connect(primusprotocol + location.host + ':' + PROXY_PORT);
        console.log(primusprotocol + location.host + ':' + PROXY_PORT);
        this.lobby = new LobbyScreen(this.store, this.chat, this.primus);
        this.manualControls = new ManualControls(this.store, this.primus);
        this.chat.manualControls = this.manualControls;
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
            log('connected, registering');
            this.primus.write({
                room: Number(urlParams.get('room'))
            });
        });

        this.primus.on('error', (error) => {
            log('error', error);
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

        this.store.register('RPS', (message, state) => {
            this.primus.write({
                action: 'choice',
                answer: message.answer
            });
            return state;
        });

        this.store.register('ZONE_CLICK', (message, state) => {
            if (app.manual) {
                debugger;
                app.manualControls.selectionzoneonclick(message.manual.choice, message.manual.location);
                return;
            }
            this.primus.write({
                action: 'question',
                answer: message.automatic,
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
                answer: message.option,
                uuid: this.state.question
            });
            return state;
        });

        this.store.register('EMPTY_SPACE', (message, state) => {
            log('empty space clicked');
            this.duel.closeRevealer();
            this.store.dispatch({ action: 'RENDER' });
            return;
        });

        this.store.register('REVEAL_CARD_CLICK', (message, state) => {
            if (message.selected) {
                log('removing a selection');
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
            if (this.state.question_selection.length > this.state.question_min) {
                const keepGoing = window.confirm('Select Additional Targets?');
                if (!keepGoing) {
                    this.primus.write({
                        action: 'question',
                        answer: {
                            type: 'list',
                            i: this.state.question_selection
                        },
                        uuid: this.state.question
                    });
                }

            }


            this.state.question_options.select_options[message.option].selected = true;
            setTimeout(() => {
                this.duel.reveal(this.state.question_options.select_options);
                this.store.dispatch({ action: 'RENDER' });
            }, 300);



            return state;
        });

        this.store.register('CHAIN_CARD_CLICK', (message, state) => {

            this.primus.write({
                action: 'question',
                answer: {
                    type: 'number',
                    i: message.option
                },
                uuid: this.state.question
            });
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


        this.store.register('SIDE_DECKING', (message, state) => {

            this.primus.write({
                action: 'side',
                deck: message.deck
            });
            return state;
        });


        this.store.register('RENDER', (message, state) => {
            ReactDOM.render(this.render(), document.getElementById('main'));
            return state;
        });
    }

    chain(message) {
        log('[CHAIN]', message);
        if (!message.select_trigger
            && !message.forced
            && (!message.count || !message.specount)
            && !message.count) {
            this.primus.write({
                action: 'question',
                answer: {
                    type: 'number',
                    i: -1
                },
                uuid: this.state.question
            });
            return;
        }
        if (message.forced) {
            this.primus.write({
                action: 'question',
                answer: {
                    type: 'number',
                    i: 0
                },
                uuid: this.state.question
            });
            return;
        }
        log('[solve]', message);
        //this.state.question_max = message.count;
        this.state.question_min = (message.forced) ? 1 : 1;
        this.duel.chain(message.select_options);
    }

    duelAction(message) {
        this.duel.disableSelection();
        switch (message.duelAction) {
            case 'start':
                this.duel.clear();

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
            case 'reveal':
                this.duel.reveal(message.reveal);
                break;
            case 'effect':
                this.duel.flash(message);
                break;
            case 'chat':
                this.chat.add(message);
                break;
            case 'give':
                this.manualControls.manualTake(message);
                break;
            default:
                break;
        }
    }

    setupQuestion(message) {
        log('[SETUP_QUESTION]', message.options.command, message);
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
            case 'MSG_SELECT_DISFIELD':
                this.duel.select(message.options);
                break;
            case 'MSG_SELECT_CARD':
                this.duel.reveal(message.options.select_options);
                break;
            case 'MSG_SELECT_UNSELECT_CARD':
                this.state.question_min = 1;
                this.state.question_max = 1;
                this.duel.reveal(message.options.cards1, message.options.cards2);
                break;
            case 'MSG_SELECT_SUM':
                this.state.question_max = 1;
                this.state.question_selection.push(message.options.must_select_count);
                this.duel.reveal(message.options.must_select.concat(message.options.can_select));
                break;
            case 'MSG_COUNTER':
                this.state.question_max = 1;
                this.state.question_selection.push(message.options.must_select_count);
                this.duel.reveal(message.options.must_select.concat(message.options.can_select));
                break;
            case 'MSG_ADD_COUNTER':
                debugger;
                this.duel.select(message.options.select_options);
                break;
            case 'MSG_SELECT_TRIBUTE':
                this.duel.reveal(message.options.selectable_targets);
                break;
            case 'MSG_CONFIRM_CARDS':
                debugger;
                this.duel.reveal(message.options.select_options);
                break;
            case 'MSG_SELECT_POSITION':
                this.duel.positionDialog.trigger(message.options);
                break;
            case 'MSG_SELECT_EFFECTYN':
                log('[DEBUG_YES_NO]', this.duel.yesnoDialog.state)
                // debugger;
                this.duel.yesnoDialog.state.active = true;
                break;
            case 'MSG_SELECT_YESNO':
                debugger;
                this.duel.yesnoDialog.state.active = true;
                break;
            case 'MSG_SELECT_CHAIN':
                this.state.question_min = 1;
                this.state.question_max = 1;
                this.chain(message.options);
                break;
            case 'MSG_ANNOUNCE_ATTRIB':
                this.duel.pickAttribute.state = {};
                this.duel.pickAttribute.state.text = 'Attribute';
                this.duel.pickAttribute.state.active = true;
                this.duel.pickAttribute.state.options = message.options.options;
                break;
            case 'MSG_ANNOUNCE_RACE':
                this.duel.pickAttribute.state = {};
                this.duel.pickAttribute.state.text = 'Race';
                this.duel.pickAttribute.state.active = true;
                this.duel.pickAttribute.state.options = message.options.options;
                break;
            case 'MSG_ANNOUNCE_NUMBER':
                this.duel.pickAttribute.state = {};
                this.duel.pickAttribute.state.text = 'Number';
                this.duel.pickAttribute.state.active = true;
                this.duel.pickAttribute.state.options = message.options.values;
                break;
            default:
                throw ('Unknown message');
        }
    }

    announcement(message) {
        log(`[MESSAGE_${message.command}]`, message);
        switch (message.command) {
            case 'MSG_ORIENTATION':
                window.orientation = message.slot;
                break;
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
                doGuiShuffle(orient(message.player), 'HAND');
                break;
            case ('MSG_SHUFFLE_EXTRA'):
                doGuiShuffle(orient(message.player), 'EXTRA');
                break;
            default:
                break;
        }
    }

    action(message) {
        // log(`[ACTION_MESSAGE] ${message.action}`, message.message);
        switch (message.action) {
            case 'proxy':
                if (message.status !== 'up') {
                    break;
                }
                this.primus.write({
                    action: 'register',
                    username: localStorage.username,
                    session: localStorage.session
                });
                break;
            case 'error':
                log('[ERROR]', message.msg);
                break;
            case 'lobby':
                this.lobby.update(message.game);
                this.siding.update(message.game);
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
                this.chat.add(message);
                break;
            case 'start':
                this.state.mode = 'duel';
                break;
            case 'slot':
                this.lobby.update({ slot: message.slot });
                break;
            case 'turn_player':
                this.state.mode = 'choice';
                this.choice.state.mode = 'turn_player';
                window.verification = message.verification;
                break;
            case 'side':
                this.duel.clear();
                this.side(message.deck);
                break;
            case 'clear':
                this.duel.clear();
                this.lobby.start();
                break;
            case 'choice':
                this.state.mode = 'choice';
                this.choice.state.mode = message.type;
                this.choice.state.result = message.result;
                this.choice.state.slot = message.slot;
                this.choice.state.winner = message.winner;
                break;
            case 'ygopro':
                this.duelAction(message.message);
                break;
            default:
                return;
        }
        // log(Object.keys(app.duel.field.state.cards).length);
    }

    render() {
        switch (this.state.mode) {
            case 'lobby':
                return React.createElement('section', { id: 'lobby', key: 'lobby' }, this.lobby.render());
            case 'choice':
                return React.createElement('section', { id: 'choice', key: 'choice' }, this.choice.render());
            case 'duel':
                return React.createElement('section', { id: 'duel', key: 'duel' }, this.duel.render());
            case 'siding':
                return React.createElement('section', { id: 'siding', key: 'siding' }, this.siding.render());
            default:
                return React.createElement('section', { id: 'error', key: 'error' }, this.error.render());
        }
    }


    refreshUI() {
        this.store.dispatch({ action: 'RENDER' });
    }


    surrender() {
        this.primus.write({
            action: 'surrender',
            slot: window.orientation
        });
    }

}

const store = new Store(),
    app = new ApplicationComponent(store);


var toolTipData = '';


function updateTooltip(event) {
    const tooltip = document.querySelector('#tooltip');
    tooltip.style.left = event.pageX + 'px';
    tooltip.style.top = event.pageY + 'px';

    tooltip.style.display = (toolTipData) ? 'block' : 'none';
    tooltip.innerHTML = toolTipData;
}


document.addEventListener('mousemove', updateTooltip, false);