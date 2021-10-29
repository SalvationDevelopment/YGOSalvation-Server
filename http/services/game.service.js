import React from 'react';
import { hey, listen, watchOut } from './listener.service';
/*global Store, ChoiceScreen, DuelScreen, SideChat, LobbyScreen, SideDeckEditScreen, databaseSystem*/


let orientation = 0;

function orient(player) {
    return (orientation) ? (player ? 0 : 1) : player;
}

export default function Game () {
    
    

    async function setup(store) {
        const databaseResponse = await fetch('/manifest/manifest_0-en-OCGTCG.json'),
            serverStatusResponse = await fetch('/status.json'),
            serverStatus = await serverStatusResponse.json(),
            databaseSystem = await databaseResponse.json();

        connect(serverStatus.PROXY_PORT);
        document.body.style.backgroundImage = `url(${localStorage.theme})`;

    }

    function side(deck) {
        mode = 'siding';
        if (deck) {
            siding.loadDeck(deck);
        }
        ReactDOM.render(render(), document.getElementById('main'));
    }

    function  connect(PROXY_PORT) {
        const urlParams = new URLSearchParams(window.location.search),
            primusprotocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';

        primus = window.Primus.connect(primusprotocol + location.host + ':' + PROXY_PORT);
        console.log(primusprotocol + location.host + ':' + PROXY_PORT);
        lobby = new LobbyScreen( chat, primus);
        manualControls = new ManualControls( primus);
        chat.manualControls = manualControls;
        primus.on('data', (data) => {
            duel.lifepoints.waiting = false;
            if (data.action) {
                action(data);
            }
            ReactDOM.render(render(), document.getElementById('main'));
            layouthand(0);
            layouthand(1);
            const list = document.getElementById('sidechattext');
            list.scrollTop = list.scrollHeight;
        });

        primus.on('open', () => {
            console.log('connected, registering');
            primus.write({
                room: Number(urlParams.get('room'))
            });
        });

        primus.on('error', (error) => {
            console.log('error', error);
        });

        listen('CHAT_ENTRY', (message, state) => {
            primus.write({
                action: 'chat',
                message: message.message
            });
            return state;
        });

        listen('START_CHOICE', (message, state) => {
            primus.write({
                action: 'start',
                turn_player: message.player,
                verification: window.verification
            });
            return state;
        });

        listen('CONTROL_CLICK', (message, state) => {
            primus.write({
                action: 'question',
                answer: message.card,
                uuid: question
            });
            return state;
        });

        listen('PHASE_CLICK', (message, state) => {
            primus.write({
                action: 'question',
                answer: message.phase,
                uuid: question
            });
            return state;
        });

        listen('RPS', (message, state) => {
            primus.write({
                action: 'choice',
                answer: message.answer
            });
            return state;
        });

        listen('ZONE_CLICK', (message, state) => {
            if (app.manual) {
                debugger;
                app.manualControls.selectionzoneonclick(message.manual.choice, message.manual.location);
                return;
            }
            primus.write({
                action: 'question',
                answer: message.automatic,
                uuid: question
            });
            return state;
        });

        listen('POSITION_CARD_CLICK', (message, state) => {
            primus.write({
                action: 'question',
                answer: message.position,
                uuid: question
            });
            return state;
        });


        listen('YESNO_CLICK', (message, state) => {
            primus.write({
                action: 'question',
                answer: message.option,
                uuid: question
            });
            return state;
        });

        listen('EMPTY_SPACE', (message, state) => {
            console.log('empty space clicked');
            duel.closeRevealer();
            hey({ action: 'RENDER' });
            return;
        });

        listen('REVEAL_CARD_CLICK', (message, state) => {
            if (message.selected) {
                console.log('removing a selection');
                const remove = question_selection.indexOf(message.option);
                question_selection.splice(remove, 1);
                question_options.select_options[message.option].selected = false;
                duel.reveal(question_options.select_options);
                hey({ action: 'RENDER' });
                return;
            }
            question_selection.push(message.option);
            if (question_selection.length === question_max) {
                primus.write({
                    action: 'question',
                    answer: {
                        type: 'list',
                        i: question_selection
                    },
                    uuid: question
                });
                return state;
            }
            if (question_selection.length > question_min) {
                const keepGoing = window.confirm('Select Additional Targets?');
                if (!keepGoing) {
                    primus.write({
                        action: 'question',
                        answer: {
                            type: 'list',
                            i: question_selection
                        },
                        uuid: question
                    });
                }

            }


            question_options.select_options[message.option].selected = true;
            setTimeout(() => {
                duel.reveal(question_options.select_options);
                hey({ action: 'RENDER' });
            }, 300);



            return state;
        });

        listen('CHAIN_CARD_CLICK', (message, state) => {

            primus.write({
                action: 'question',
                answer: {
                    type: 'number',
                    i: message.option
                },
                uuid: question
            });
            return state;

        });

        listen('REVEALER_CLOSE', (message, state) => {
            if (question_selection.length > question_min) {
                primus.write({
                    action: 'question',
                    answer: {
                        type: 'list',
                        i: question_selection
                    },
                    uuid: question
                });
            }
            return state;
        });


        listen('SIDE_DECKING', (message, state) => {

            primus.write({
                action: 'side',
                deck: message.deck
            });
            return state;
        });


        listen('RENDER', (message, state) => {
            ReactDOM.render(render(), document.getElementById('main'));
            return state;
        });
    }

    function  chain(message) {
        if (!message.select_trigger
            && !message.forced
            && (!message.count || !message.specount)
            && !message.count) {
            primus.write({
                action: 'question',
                answer: {
                    type: 'number',
                    i: -1
                },
                uuid: question
            });
            return;
        }
        if (message.forced) {
            primus.write({
                action: 'question',
                answer: {
                    type: 'number',
                    i: 0
                },
                uuid: question
            });
            return;
        }
        console.log('solve', message);
        //question_max = message.count;
        question_min = (message.forced) ? 1 : 1;
        duel.chain(message.select_options);
    }

    function   duelAction(message) {
        duel.disableSelection();
        switch (message.duelAction) {
            case 'start':
                duel.clear();

                mode = 'duel';
                duel.update(message.info);
                duel.updateField(message.field[0]);
                duel.updateField(message.field[1]);
                break;
            case 'duel':
                duel.update(message.info);
                duel.updateField(message.field[0]);
                duel.updateField(message.field[1]);
                break;
            case 'question':
                setupQuestion(message);
                break;
            case 'announcement':
                announcement(message.message);
                break;
            case 'reveal':
                duel.reveal(message.reveal);
                break;
            case 'effect':
                duel.flash(message);
                break;
            case 'chat':
                chat.add(message);
                break;
            case 'give':
                manualControls.manualTake(message);
                break;
            default:
                break;
        }
    }

    function  setupQuestion(message) {
        console.log('???', message.options.command, message);
        question = message.uuid;
        question_min = message.options.select_min;
        question_max = message.options.select_max;
        question_options = message.options;
        question_selection = [];
        duel.lifepoints.waiting = true;
        duel.idle({});
        switch (message.options.command) {
            case 'MSG_SELECT_IDLECMD':
                duel.idle(message.options);
                break;
            case 'MSG_SELECT_BATTLECMD':
                duel.idle(message.options);
                break;
            case 'MSG_SELECT_PLACE':
                duel.select(message.options);
                break;
            case 'MSG_SELECT_DISFIELD':
                duel.select(message.options);
                break;
            case 'MSG_SELECT_CARD':
                duel.reveal(message.options.select_options);
                break;
            case 'MSG_SELECT_UNSELECT_CARD':
                question_min = 1;
                question_max = 1;
                duel.reveal(message.options.cards1, message.options.cards2);
                break;
            case 'MSG_SELECT_SUM':
                question_max = 1;
                question_selection.push(message.options.must_select_count);
                duel.reveal(message.options.must_select.concat(message.options.can_select));
                break;
            case 'MSG_COUNTER':
                question_max = 1;
                question_selection.push(message.options.must_select_count);
                duel.reveal(message.options.must_select.concat(message.options.can_select));
                break;
            case 'MSG_ADD_COUNTER':
                debugger;
                duel.select(message.options.select_options);
                break;
            case 'MSG_SELECT_TRIBUTE':
                duel.reveal(message.options.selectable_targets);
                break;
            case 'MSG_CONFIRM_CARDS':
                debugger;
                duel.reveal(message.options.select_options);
                break;
            case 'MSG_SELECT_POSITION':
                duel.positionDialog.trigger(message.options);
                break;
            case 'MSG_SELECT_EFFECTYN':
                debugger;
                duel.yesnoDialog.active = true;
                break;
            case 'MSG_SELECT_YESNO':
                debugger;
                duel.yesnoDialog.active = true;
                break;
            case 'MSG_SELECT_CHAIN':
                question_min = 1;
                question_max = 1;
                chain(message.options);
                break;
            case 'MSG_ANNOUNCE_ATTRIB':
                duel.pickAttribute.state = {};
                duel.pickAttribute.text = 'Attribute';
                duel.pickAttribute.active = true;
                duel.pickAttribute.options = message.options.options;
                break;
            case 'MSG_ANNOUNCE_RACE':
                duel.pickAttribute.state = {};
                duel.pickAttribute.text = 'Race';
                duel.pickAttribute.active = true;
                duel.pickAttribute.options = message.options.options;
                break;
            case 'MSG_ANNOUNCE_NUMBER':
                duel.pickAttribute.state = {};
                duel.pickAttribute.text = 'Number';
                duel.pickAttribute.active = true;
                duel.pickAttribute.options = message.options.values;
                break;
            default:
                throw ('Unknown message');
        }
    }

    function announcement(message) {
        console.log('!!!', message.command, message);
        switch (message.command) {
            case 'MSG_ORIENTATION':
                window.orientation = message.slot;
                break;
            case ('MSG_WAITING'):
                duel.lifepoints.waiting = true;
                break;
            case ('MSG_SUMMONING'):
                duel.flash({ id: message.id });
                break;
            case ('MSG_SPSUMMONING'):
                duel.flash({ id: message.id });
                break;
            case ('MSG_FLIPSUMMONING'):
                duel.flash({ id: message.id });
                break;
            case ('MSG_CHAINING'):
                duel.flash({ id: message.id });
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

    function   action(message) {
        console.log(message);
        switch (message.action) {
            case 'proxy':
                if (message.status !== 'up') {
                    break;
                }
                primus.write({
                    action: 'register',
                    username: localStorage.username,
                    session: localStorage.session
                });
                break;
            case 'error':
                console.log(message.msg);
                break;
            case 'lobby':
                lobby.update(message.game);
                siding.update(message.game);
                break;
            case 'registered':
                primus.write({
                    action: 'join'
                });
                break;
            case 'decks':
                lobby.update({ decks: message.decks });
                window.decks = message.decks;
                break;
            case 'chat':
                chat.add(message);
                break;
            case 'start':
                mode = 'duel';
                break;
            case 'slot':
                lobby.update({ slot: message.slot });
                break;
            case 'turn_player':
                mode = 'choice';
                choice.mode = 'turn_player';
                window.verification = message.verification;
                break;
            case 'side':
                duel.clear();
                side(message.deck);
                break;
            case 'clear':
                duel.clear();
                lobby.start();
                break;
            case 'choice':
                mode = 'choice';
                choice.mode = message.type;
                choice.result = message.result;
                choice.slot = message.slot;
                choice.winner = message.winner;
                break;
            case 'ygopro':
                duelAction(message.message);
                break;
            default:
                return;
        }
        console.log(Object.keys(app.duel.field.cards).length);
    }




    function  refreshUI() {
        hey({ action: 'RENDER' });
    }


    function   surrender() {
        primus.write({
            action: 'surrender',
            slot: window.orientation
        });
    }


    setup();

    return {

    }
}

const     app = new Game();
