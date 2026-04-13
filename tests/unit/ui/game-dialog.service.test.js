import assert from 'node:assert/strict';
import test from 'node:test';
import { createGameDialogService } from '../../../server/ui/services/game-dialog.service.js';
import {
    createRockPaperScissorsAnswer,
    createSelectCardAnswer
} from '../../../server/ui/services/duel-response.service.js';

function createStore() {
    const listeners = new Map(),
        emitted = [];

    return {
        emitted,
        emit(message) {
            emitted.push(message);
            const handlers = listeners.get(message?.action) || [];
            handlers.slice().forEach((handler) => handler(message));
        },
        on(action, handler) {
            const nextHandlers = listeners.get(action) || [];
            nextHandlers.push(handler);
            listeners.set(action, nextHandlers);
            return () => {
                const currentHandlers = listeners.get(action) || [],
                    next = currentHandlers.filter((currentHandler) => currentHandler !== handler);

                if (next.length) {
                    listeners.set(action, next);
                    return;
                }

                listeners.delete(action);
            };
        },
        subscribe() {
            return () => {};
        }
    };
}

function createContext(overrides = {}) {
    const store = createStore(),
        context = {
            store,
            app: {
                manual: false,
                manualControls: null
            },
            databaseSystem: [{
                id: 1001,
                name: 'Scarm, Malebranche of the Burning Abyss'
            }],
            duelRuntime: null,
            questionState: {
                id: 'question-1',
                command: undefined,
                min: 0,
                max: 0,
                options: {},
                selection: [],
                counterAllocations: [],
                counterTarget: 0,
                prompt: '',
                promptTimer: null,
                signature: null,
                answerPending: false
            },
            uiRuntimeState: {
                choice: {
                    state: {}
                },
                orientation: 1,
                mode: 'lobby'
            }
        };

    return Object.assign(context, overrides, {
        store,
        app: Object.assign({}, context.app, overrides.app || {}),
        questionState: Object.assign({}, context.questionState, overrides.questionState || {}),
        uiRuntimeState: Object.assign({}, context.uiRuntimeState, overrides.uiRuntimeState || {})
    });
}

test('createGameDialogService setupQuestion delegates zone selection and RPS choice state through the duel runtime adapter', () => {
    const context = createContext(),
        runtimeCalls = [],
        service = createGameDialogService(
            Object.assign(context, {
                duelRuntime: {
                    hydrateField(field) {
                        runtimeCalls.push(['hydrateField', field]);
                    },
                    disableSelection() {
                        runtimeCalls.push(['disableSelection']);
                    },
                    idle(commands) {
                        runtimeCalls.push(['idle', commands]);
                    },
                    clearChainQuestion() {
                        runtimeCalls.push(['clearChainQuestion']);
                    },
                    select(query) {
                        runtimeCalls.push(['select', query]);
                    },
                    showChoicePrompt(modeName, options) {
                        runtimeCalls.push(['showChoicePrompt', modeName, options]);
                    }
                }
            }),
            {
                orient: (player) => (player ? 0 : 1)
            }
        );

    service.setupQuestion({
        uuid: 'question-zone',
        command: 'MSG_SELECT_PLACE',
        prompt_text: 'Choose a zone',
        field: [{ MONSTERZONE: [] }, { MONSTERZONE: [] }],
        options: {
            player: 1,
            zone_selection: {
                zones: [{ player: 1, location: 'MONSTERZONE', index: 2 }]
            }
        }
    });
    service.setupQuestion({
        uuid: 'question-rps',
        command: 'MSG_ROCK_PAPER_SCISSORS',
        prompt_text: 'Rock, paper, scissors',
        options: {}
    });

    assert.deepEqual(runtimeCalls, [
        ['hydrateField', [{ MONSTERZONE: [] }, { MONSTERZONE: [] }]],
        ['disableSelection'],
        ['idle', {}],
        ['clearChainQuestion'],
        ['select', {
            zones: [{ player: 1, location: 'MONSTERZONE', index: 2 }],
            command: 'MSG_SELECT_PLACE',
            player: 1
        }],
        ['disableSelection'],
        ['idle', {}],
        ['clearChainQuestion'],
        ['showChoicePrompt', 'rps', {
            protocol: 'ocgcore',
            runtimeMode: 'choice',
            slot: 1
        }]
    ]);
    assert.equal(context.questionState.command, 'MSG_ROCK_PAPER_SCISSORS');
});

test('createGameDialogService delegates dialog overlays and reveal rendering through the duel runtime adapter', () => {
    const context = createContext(),
        runtimeCalls = [],
        service = createGameDialogService(
            Object.assign(context, {
                duelRuntime: {
                    disableSelection() {
                        runtimeCalls.push(['disableSelection']);
                    },
                    idle(commands) {
                        runtimeCalls.push(['idle', commands]);
                    },
                    clearChainQuestion() {
                        runtimeCalls.push(['clearChainQuestion']);
                    },
                    openSelectOptionDialog(state) {
                        runtimeCalls.push(['openSelectOptionDialog', state]);
                    },
                    openSelectPositionDialog(state) {
                        runtimeCalls.push(['openSelectPositionDialog', state]);
                    },
                    openSelectAttributesDialog(state) {
                        runtimeCalls.push(['openSelectAttributesDialog', state]);
                    },
                    openAnnounceCardDialog(state) {
                        runtimeCalls.push(['openAnnounceCardDialog', state]);
                    },
                    openReveal(cards, state) {
                        runtimeCalls.push(['openReveal', cards, state]);
                    }
                }
            }),
            {
                orient: (player) => (player ? 0 : 1)
            }
        );

    service.setupQuestion({
        uuid: 'question-option',
        command: 'MSG_SELECT_OPTION',
        prompt_text: 'Select an option',
        options: {
            option_rows: [{ i: 0, label: 'Option 1' }]
        }
    });
    service.setupQuestion({
        uuid: 'question-position',
        command: 'MSG_SELECT_POSITION',
        prompt_text: 'Select a position',
        options: {
            id: 1001,
            positions: 0x5
        }
    });
    service.setupQuestion({
        uuid: 'question-number',
        command: 'MSG_ANNOUNCE_NUMBER',
        prompt_text: 'Declare a number',
        options: {
            announcement_values: [1, 3, 5]
        }
    });
    service.setupQuestion({
        uuid: 'question-card',
        command: 'MSG_ANNOUNCE_CARD',
        prompt_text: 'Declare a card',
        options: {
            opcodes: [1, 2, 3]
        }
    });
    service.setupQuestion({
        uuid: 'question-reveal',
        command: 'MSG_SELECT_CARD',
        prompt_text: 'Select a card',
        options: {
            reveal_cards: [{ id: 1001, player: 0 }]
        }
    });

    assert.deepEqual(
        runtimeCalls.filter(([name]) => !['disableSelection', 'idle', 'clearChainQuestion'].includes(name)),
        [
            ['openSelectOptionDialog', {
                active: true,
                options: [{ i: 0, label: 'Option 1' }],
                selectedIndex: 0
            }],
            ['openSelectPositionDialog', {
                id: 1001,
                positions: 0x5
            }],
            ['openSelectAttributesDialog', {
                active: true,
                options: [1, 3, 5],
                text: 'Number',
                responseType: 'MSG_ANNOUNCE_NUMBER'
            }],
            ['openAnnounceCardDialog', {
                opcodes: [1, 2, 3]
            }],
            ['openReveal', [{
                id: 1001,
                name: 'Scarm, Malebranche of the Burning Abyss',
                player: 0
            }], {
                dismissable: false,
                cards2: []
            }]
        ]
    );
});

test('createGameDialogService registerListeners routes answers, previews, and hover state through the duel runtime adapter', () => {
    const context = createContext({
            uiRuntimeState: {
                choice: {
                    state: {
                        mode: 'rps',
                        protocol: 'ocgcore'
                    }
                },
                mode: 'choice'
            }
        }),
        runtimeCalls = [],
        service = createGameDialogService(
            Object.assign(context, {
                duelRuntime: {
                    sendQuestionAnswer(answer, uuid) {
                        runtimeCalls.push(['sendQuestionAnswer', answer, uuid]);
                    },
                    sendLegacyChoiceAnswer(answer) {
                        runtimeCalls.push(['sendLegacyChoiceAnswer', answer]);
                    },
                    closeRevealer() {
                        runtimeCalls.push(['closeRevealer']);
                    },
                    previewCard(id) {
                        runtimeCalls.push(['previewCard', id]);
                    },
                    hoverFieldCard(query) {
                        runtimeCalls.push(['hoverFieldCard', query]);
                    }
                }
            }),
            {
                orient: (player) => (player ? 0 : 1)
            }
        );

    service.registerListeners();

    context.questionState.command = 'MSG_ROCK_PAPER_SCISSORS';
    context.questionState.answerPending = false;
    context.store.emit({
        action: 'RPS',
        answer: 'paper'
    });

    context.questionState.answerPending = false;
    context.questionState.command = 'MSG_SELECT_CARD';
    context.questionState.min = 1;
    context.questionState.selection = [4, 7];
    context.store.emit({ action: 'REVEALER_CLOSE' });
    context.store.emit({ action: 'EMPTY_SPACE' });
    context.store.emit({
        action: 'ANNOUNCE_CARD_PREVIEW',
        id: 3001
    });
    context.store.emit({
        action: 'ZONE_HOVER',
        player: 1,
        location: 'MONSTERZONE',
        index: 2
    });

    context.questionState.answerPending = false;
    context.questionState.command = 'MSG_SELECT_IDLECMD';
    context.uiRuntimeState.mode = 'lobby';
    context.store.emit({
        action: 'RPS',
        answer: 'scissors'
    });

    assert.equal(context.questionState.answerPending, false);
    assert.deepEqual(runtimeCalls, [
        ['sendQuestionAnswer', createRockPaperScissorsAnswer(3), 'question-1'],
        ['sendQuestionAnswer', createSelectCardAnswer([4, 7]), 'question-1'],
        ['closeRevealer'],
        ['previewCard', 3001],
        ['hoverFieldCard', {
            player: 1,
            location: 'MONSTERZONE',
            index: 2
        }],
        ['sendLegacyChoiceAnswer', 2]
    ]);
    assert.equal(context.store.emitted.some((message) => message?.action === 'RENDER'), true);
});
