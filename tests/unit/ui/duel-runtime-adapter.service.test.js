import assert from 'node:assert/strict';
import test from 'node:test';
import {
    createDuelRuntimeAdapter,
    createLegacySocketTransport
} from '../../../server/ui/services/duel-runtime-adapter.service.js';

function createTestContext() {
    return {
        store: {
            emit() {},
            on() {
                return () => {};
            }
        },
        app: {
            duel: null,
            lobby: null,
            manualControls: null
        },
        root: null,
        ws: null,
        databaseSystem: [{ id: 1001, name: 'Scarm, Malebranche of the Burning Abyss' }],
        uiRuntimeState: {
            duel: null,
            chat: null,
            lobby: null,
            choice: null,
            manualControls: null,
            mode: 'lobby',
            orientation: 0
        },
        questionState: {
            prompt: 'pending',
            promptTimer: null
        },
        uiFlowState: {
            choiceOverlay: {
                timer: null,
                token: 0
            },
            incomingActions: {
                delayUntil: 50,
                timer: null,
                buffered: [{ action: 'chat' }]
            }
        },
        choiceApi: {
            updates: [],
            updateChoiceState(_choice, update) {
                this.updates.push(update);
            },
            setChoiceOverlayActive() {}
        },
        lifepointApi: {
            calls: [],
            setLifepointWaiting(target, waiting) {
                this.calls.push([target, waiting]);
            }
        }
    };
}

function createTestServices(promptCalls, duelMessages) {
    return {
        dialogService: {
            setQuestionPrompt(text) {
                promptCalls.push(text);
            }
        },
        passiveService: {
            handleDuelAction(message) {
                duelMessages.push(message);
            }
        }
    };
}

function createFakeTransport(url) {
    const handlers = {};

    return {
        url,
        writes: [],
        proxyReady: false,
        closed: false,
        on(event, handler) {
            handlers[event] = handler;
        },
        write(payload) {
            this.writes.push(payload);
        },
        close() {
            this.closed = true;
        },
        emit(event, payload) {
            handlers[event]?.(payload);
        }
    };
}

function withGlobals(overrides, callback) {
    const previous = {};

    Object.keys(overrides).forEach((key) => {
        previous[key] = globalThis[key];
        globalThis[key] = overrides[key];
    });

    try {
        return callback();
    } finally {
        Object.keys(overrides).forEach((key) => {
            globalThis[key] = previous[key];
        });
    }
}

test('createLegacySocketTransport wraps application packets once proxy mode is active', () => {
    class FakeWebSocket {
        static OPEN = 1;

        constructor(url) {
            this.url = url;
            this.readyState = FakeWebSocket.OPEN;
            this.sent = [];
        }

        addEventListener() {}

        send(payload) {
            this.sent.push(JSON.parse(payload));
        }

        close() {
            this.readyState = 3;
        }
    }

    const transport = createLegacySocketTransport('ws://localhost:31337', {
        WebSocketImpl: FakeWebSocket,
        logger: { log() {} }
    });

    transport.write({ action: 'proxy_connect', port: 12345 });
    transport.proxyReady = true;
    transport.write({ action: 'join' });

    assert.deepEqual(transport.raw.sent, [
        { action: 'proxy_connect', port: 12345 },
        {
            action: 'proxy_message',
            payload: { action: 'join' }
        }
    ]);
});

test('createDuelRuntimeAdapter hydrates the duel runtime controllers and seeds the lobby snapshot', () => {
    const context = createTestContext(),
        promptCalls = [],
        duelMessages = [],
        lobbyUpdates = [],
        chat = { messages: [] },
        choice = { state: { selectedAnswer: 'paper' } },
        duel = {
            lifepoints: {},
            dispose() {},
            clear() {},
            resetChainState() {}
        },
        adapter = createDuelRuntimeAdapter(
            context,
            createTestServices(promptCalls, duelMessages),
            {
                createChat: () => chat,
                createChoice: (_store, receivedChat) => {
                    assert.equal(receivedChat, chat);
                    return choice;
                },
                createLobby: (_store, receivedChat) => {
                    assert.equal(receivedChat, chat);
                    return {
                        update(payload) {
                            lobbyUpdates.push(payload);
                        }
                    };
                },
                createDuel: (_store, receivedChat, databaseSystem) => {
                    assert.equal(receivedChat, chat);
                    assert.equal(databaseSystem, context.databaseSystem);
                    return duel;
                },
                logger: { log() {} }
            }
        );

    adapter.hydrateRuntime();

    assert.equal(context.uiRuntimeState.chat, chat);
    assert.equal(context.uiRuntimeState.choice, choice);
    assert.equal(context.uiRuntimeState.duel, duel);
    assert.equal(context.app.duel, duel);
    assert.equal(context.app.lobby, context.uiRuntimeState.lobby);
    assert.deepEqual(lobbyUpdates, [{
        player: [{}, {}],
        decks: [],
        automatic: 'Automatic',
        ranked: 'Casual',
        banlist: 'Loading...',
        allowedCardsLabel: 'OCG / TCG',
        mode: 'Single',
        startingLP: 8000
    }]);
    assert.deepEqual(promptCalls, ['']);
    assert.deepEqual(duelMessages, []);
});

test('createDuelRuntimeAdapter connects transport events through the runtime boundary', () => {
    const context = createTestContext(),
        promptCalls = [],
        duelMessages = [],
        transport = createFakeTransport('ws://localhost:31337'),
        duel = {
            lifepoints: { waiting: true },
            dispose() {},
            clear() {},
            resetChainState() {}
        },
        adapter = createDuelRuntimeAdapter(
            context,
            createTestServices(promptCalls, duelMessages),
            {
                createChat: () => ({}),
                createChoice: () => ({ state: {} }),
                createLobby: () => ({
                    update() {}
                }),
                createDuel: () => duel,
                createManualControls: (_store, ws) => ({ ws, kind: 'manual' }),
                createSocketTransport: (url) => {
                    transport.url = url;
                    return transport;
                },
                logger: { log() {} }
            }
        );

    adapter.hydrateRuntime();

    withGlobals({
        document: {
            getElementById() {
                return null;
            }
        },
        localStorage: {
            username: 'alice',
            session: 'test-session'
        },
        window: {
            location: {
                protocol: 'http:',
                hostname: 'localhost'
            },
            orientation: 0
        }
    }, () => {
        adapter.connect(31337, 12345);
        transport.emit('open');
        transport.emit('data', { action: 'proxy', status: 'up' });
        transport.emit('data', { action: 'registered' });
        transport.emit('data', { action: 'slot', slot: 1 });
        transport.emit('data', { action: 'turn_player', slot: 0, verification: 'verify-1' });
    });

    assert.equal(context.app.manualControls.kind, 'manual');
    assert.equal(context.uiRuntimeState.chat.manualControls.kind, 'manual');
    assert.equal(context.uiRuntimeState.orientation, 1);
    assert.equal(transport.proxyReady, true);
    assert.equal(context.uiRuntimeState.mode, 'choice');
    assert.deepEqual(transport.writes, [
        { action: 'proxy_connect', port: 12345 },
        { action: 'register', username: 'alice', session: 'test-session' },
        { action: 'join' }
    ]);
    assert.deepEqual(context.choiceApi.updates, [{
        mode: 'turn_player',
        protocol: 'legacy',
        result: undefined,
        slot: 0,
        selectedAnswer: undefined
    }]);
    assert.deepEqual(context.lifepointApi.calls, [
        [duel.lifepoints, false],
        [duel.lifepoints, false],
        [duel.lifepoints, false],
        [duel.lifepoints, false]
    ]);
    assert.deepEqual(promptCalls, ['', '']);
    assert.deepEqual(duelMessages, []);
});

test('createDuelRuntimeAdapter routes duel packets and tears down runtime state', () => {
    const context = createTestContext(),
        promptCalls = [],
        duelMessages = [],
        duelCalls = [],
        closedSocket = {
            closed: false,
            close() {
                this.closed = true;
            }
        },
        root = {
            unmounted: false,
            unmount() {
                this.unmounted = true;
            }
        },
        duel = {
            lifepoints: {},
            dispose() {
                duelCalls.push('dispose');
            },
            clear() {
                duelCalls.push('clear');
            },
            resetChainState() {
                duelCalls.push('reset');
            }
        },
        adapter = createDuelRuntimeAdapter(
            context,
            createTestServices(promptCalls, duelMessages),
            {
                createChat: () => ({}),
                createChoice: () => ({ state: {} }),
                createLobby: () => ({
                    update() {}
                }),
                createDuel: () => duel,
                logger: { log() {} }
            }
        );

    adapter.hydrateRuntime();

    const promptTimer = setTimeout(() => {}, 1000),
        choiceOverlayTimer = setTimeout(() => {}, 1000),
        incomingTimer = setTimeout(() => {}, 1000);

    context.questionState.promptTimer = promptTimer;
    context.uiFlowState.choiceOverlay.timer = choiceOverlayTimer;
    context.uiFlowState.incomingActions.timer = incomingTimer;
    context.root = root;
    context.ws = closedSocket;

    withGlobals({
        window: {
            orientation: 1
        }
    }, () => {
        adapter.handleIncomingAction({ action: 'ygopro', message: { duelAction: 'announcement' } });
        adapter.handleIncomingAction({ action: 'clear' });
        adapter.dispose();
    });

    assert.deepEqual(duelMessages, [{ duelAction: 'announcement' }]);
    assert.deepEqual(duelCalls, ['reset', 'clear', 'dispose']);
    assert.equal(closedSocket.closed, true);
    assert.equal(root.unmounted, true);
    assert.equal(context.ws, null);
    assert.equal(context.root, null);
    assert.equal(context.uiRuntimeState.duel, null);
    assert.equal(context.uiRuntimeState.chat, null);
    assert.equal(context.uiRuntimeState.lobby, null);
    assert.equal(context.uiRuntimeState.choice, null);
    assert.equal(context.app.duel, null);
    assert.equal(context.app.lobby, null);
    assert.equal(context.uiFlowState.incomingActions.delayUntil, 0);
    assert.deepEqual(context.uiFlowState.incomingActions.buffered, []);
    assert.equal(context.questionState.promptTimer, null);
    assert.equal(context.uiFlowState.choiceOverlay.timer, null);
    assert.equal(context.uiFlowState.incomingActions.timer, null);
    assert.deepEqual(promptCalls, ['', '', '']);
});

test('createDuelRuntimeAdapter applies passive announcement contracts through explicit duel commands', () => {
    const context = createTestContext(),
        promptCalls = [],
        duelMessages = [],
        lobbyUpdates = [],
        storeEvents = [],
        duelCalls = [],
        duel = {
            lifepoints: {},
            flash(contract) {
                duelCalls.push(['flash', contract]);
            },
            showPhaseBanner(text, duration) {
                duelCalls.push(['phase', text, duration]);
            },
            pulseLifepoints(player, value, tone, duration) {
                duelCalls.push(['lifepoints', player, value, tone, duration]);
            },
            updateChainOverlay(contract) {
                duelCalls.push(['chain:update', contract]);
            },
            clearChainOverlays() {
                duelCalls.push(['chain:clear']);
            },
            previewReveal(cards, options) {
                duelCalls.push(['preview', cards, options]);
                return false;
            }
        };

    context.store.emit = (payload) => {
        storeEvents.push(payload);
    };

    const adapter = createDuelRuntimeAdapter(
        context,
        createTestServices(promptCalls, duelMessages),
        {
            createChat: () => ({}),
            createChoice: () => ({ state: {} }),
            createLobby: () => ({
                update(payload) {
                    lobbyUpdates.push(payload);
                }
            }),
            createDuel: () => duel,
            logger: { log() {} }
        }
    );

    adapter.hydrateRuntime();

    withGlobals({
        window: {
            orientation: 0
        }
    }, () => {
        adapter.applyAnnouncementContract({ kind: 'orientation', slot: 1 });
        adapter.applyAnnouncementContract({ kind: 'opponent_turn', active: true });
        adapter.applyAnnouncementContract({ kind: 'waiting' });
        adapter.applyAnnouncementContract({ kind: 'phase_banner', text: 'Battle Phase', duration: 1400 });
        adapter.applyAnnouncementContract({ kind: 'lp_delta', player: 0, value: -500, tone: 'damage', duration: 1200 });
        adapter.applyAnnouncementContract({ kind: 'chain', phase: 'start', id: 2001, chainIndex: 1 });
        adapter.applyAnnouncementContract({ kind: 'chain', phase: 'end' });
        adapter.applyAnnouncementContract({
            kind: 'pile_reveal',
            call: 'deck_top',
            player: 0,
            cards: [{ id: 1001 }],
            duration: 900
        });
    });

    assert.equal(context.uiRuntimeState.orientation, 1);
    assert.deepEqual(lobbyUpdates, [
        {
            player: [{}, {}],
            decks: [],
            automatic: 'Automatic',
            ranked: 'Casual',
            banlist: 'Loading...',
            allowedCardsLabel: 'OCG / TCG',
            mode: 'Single',
            startingLP: 8000
        },
        { slot: 1 }
    ]);
    assert.deepEqual(storeEvents, [{
        action: 'OPPONENT_TURN',
        active: true
    }]);
    assert.deepEqual(context.lifepointApi.calls, [[duel.lifepoints, true]]);
    assert.deepEqual(duelCalls, [
        ['phase', 'Battle Phase', 1400],
        ['lifepoints', 0, -500, 'damage', 1200],
        ['flash', { kind: 'chain', phase: 'start', id: 2001, chainIndex: 1 }],
        ['chain:clear'],
        ['preview', [{ id: 1001 }], { call: 'deck_top', player: 0, duration: 900 }],
        ['flash', { id: 1001 }]
    ]);
    assert.deepEqual(promptCalls, ['']);
    assert.deepEqual(duelMessages, []);
});

test('createDuelRuntimeAdapter exposes explicit choice and snapshot commands', () => {
    const context = createTestContext(),
        promptCalls = [],
        duelMessages = [],
        duelCalls = [],
        duel = {
            lifepoints: {},
            disableSelection() {
                duelCalls.push(['disableSelection']);
            },
            resetChainState() {
                duelCalls.push(['resetChainState']);
            },
            clear() {
                duelCalls.push(['clear']);
            },
            update(payload) {
                duelCalls.push(['update', payload]);
            },
            replaceField(field) {
                duelCalls.push(['replaceField', field]);
            }
        },
        adapter = createDuelRuntimeAdapter(
            context,
            createTestServices(promptCalls, duelMessages),
            {
                createChat: () => ({}),
                createChoice: () => ({ state: {} }),
                createLobby: () => ({
                    update() {}
                }),
                createDuel: () => duel,
                logger: { log() {} }
            }
        );

    adapter.hydrateRuntime();
    adapter.showChoiceResult('rps', { results: ['rock', 'paper'] }, {
        clearPrompt: true,
        overlayActive: false,
        runtimeMode: 'choice'
    });
    adapter.applyDuelSnapshot({
        info: { phase: 'DRAW', lifepoints: [8000, 7500] },
        names: ['alice', 'bob'],
        field: [{ MONSTERZONE: [] }, { MONSTERZONE: [] }]
    }, {
        clearField: true,
        clearPrompt: true,
        disableSelection: true,
        mode: 'duel',
        resetChainState: true
    });

    assert.equal(context.uiRuntimeState.mode, 'duel');
    assert.deepEqual(context.choiceApi.updates, [{
        mode: 'rps',
        protocol: 'ocgcore',
        result: ['rock', 'paper'],
        slot: 0,
        selectedAnswer: undefined,
        overlayActive: false
    }]);
    assert.deepEqual(duelCalls, [
        ['disableSelection'],
        ['resetChainState'],
        ['clear'],
        ['update', { phase: 'DRAW', lifepoints: [8000, 7500], names: ['alice', 'bob'] }],
        ['replaceField', [{ MONSTERZONE: [] }, { MONSTERZONE: [] }]]
    ]);
    assert.deepEqual(promptCalls, ['', '', '']);
    assert.deepEqual(duelMessages, []);
});

test('createDuelRuntimeAdapter routes dialog triggers and question packets through explicit helpers', () => {
    const context = createTestContext(),
        promptCalls = [],
        duelMessages = [],
        dialogCalls = [],
        storeEvents = [],
        duelCalls = [],
        duel = {
            store: {},
            field: {
                state: {
                    cards: {
                        alpha: {
                            state: {
                                id: 3001,
                                player: 1,
                                location: 'MONSTERZONE',
                                index: 2
                            }
                        }
                    }
                }
            },
            disableSelection() {
                duelCalls.push(['disableSelection']);
            },
            flash(contract) {
                duelCalls.push(['flash', contract]);
            }
        },
        adapter = createDuelRuntimeAdapter(
            context,
            createTestServices(promptCalls, duelMessages),
            {
                createChat: () => ({}),
                createChoice: () => ({ state: {} }),
                createLobby: () => ({
                    update() {}
                }),
                createDuel: () => duel,
                openSelectOptionDialog: (target, state) => {
                    dialogCalls.push(['option', target, state]);
                },
                openYesNoDialog: (target, state) => {
                    dialogCalls.push(['yesno', target, state]);
                },
                openSelectPositionDialog: (target, state) => {
                    dialogCalls.push(['position', target, state]);
                },
                openSelectAttributesDialog: (target, state) => {
                    dialogCalls.push(['attributes', target, state]);
                },
                openAnnounceCardDialog: (target, state) => {
                    dialogCalls.push(['announce-card', target, state]);
                },
                logger: { log() {} }
            }
        );

    context.store.emit = (payload) => {
        storeEvents.push(payload);
    };

    adapter.hydrateRuntime();
    context.ws = {
        writes: [],
        write(payload) {
            this.writes.push(payload);
        }
    };

    adapter.showChoicePrompt('rps', {
        protocol: 'ocgcore',
        slot: 1
    });
    adapter.sendQuestionAnswer({ type: 'number', i: 3 }, 'question-1');
    adapter.openSelectOptionDialog({ options: [{ i: 0, label: 'Option 1' }] });
    adapter.openYesNoDialog({ promptText: 'Use effect?' });
    adapter.openSelectPositionDialog({ positions: ['FaceUpAttack'] });
    adapter.openSelectAttributesDialog({ text: 'Attribute', options: { LIGHT: 1 } });
    adapter.openAnnounceCardDialog({ opcodes: [1, 2, 3] });
    adapter.hoverFieldCard({
        player: 1,
        location: 'MONSTERZONE',
        index: 2
    });
    adapter.previewCard(3001);

    assert.equal(context.uiRuntimeState.mode, 'choice');
    assert.deepEqual(context.choiceApi.updates, [{
        mode: 'rps',
        protocol: 'ocgcore',
        result: undefined,
        slot: 1,
        selectedAnswer: undefined
    }]);
    assert.deepEqual(context.ws.writes, [{
        action: 'question',
        answer: { type: 'number', i: 3 },
        uuid: 'question-1'
    }]);
    assert.deepEqual(dialogCalls, [
        ['option', duel, { options: [{ i: 0, label: 'Option 1' }] }],
        ['yesno', duel, { promptText: 'Use effect?' }],
        ['position', duel, { positions: ['FaceUpAttack'] }],
        ['attributes', duel, { text: 'Attribute', options: { LIGHT: 1 } }],
        ['announce-card', duel, { opcodes: [1, 2, 3] }]
    ]);
    assert.deepEqual(storeEvents, [{
        action: 'CARD_HOVER',
        id: 3001
    }]);
    assert.deepEqual(duelCalls, [
        ['disableSelection'],
        ['flash', {
            id: 3001,
            mode: 'legacy_preview',
            phase: 'preview'
        }]
    ]);
    assert.deepEqual(promptCalls, ['', '', '']);
    assert.deepEqual(duelMessages, []);
});

test('createDuelRuntimeAdapter routes shuffle announcement contracts through injected field DOM effects', () => {
    const context = createTestContext(),
        promptCalls = [],
        duelMessages = [],
        fieldEffectCalls = [],
        adapter = createDuelRuntimeAdapter(
            context,
            createTestServices(promptCalls, duelMessages),
            {
                createChat: () => ({}),
                createChoice: () => ({ state: {} }),
                createLobby: () => ({
                    update() {}
                }),
                createDuel: () => ({
                    lifepoints: {}
                }),
                fieldDomEffectsService: {
                    shuffleDeck(player, zone) {
                        fieldEffectCalls.push(['shuffleDeck', player, zone]);
                    },
                    shuffleZone(player, zone) {
                        fieldEffectCalls.push(['shuffleZone', player, zone]);
                    },
                    shuffleTagSwap(player, zones) {
                        fieldEffectCalls.push(['shuffleTagSwap', player, zones]);
                    }
                },
                logger: { log() {} }
            }
        );

    adapter.hydrateRuntime();
    adapter.applyAnnouncementContract({ kind: 'shuffle', player: 0, zone: 'DECK' });
    adapter.applyAnnouncementContract({ kind: 'shuffle_set', players: [0, 1], zone: 'HAND' });
    adapter.applyAnnouncementContract({ kind: 'tag_swap', player: 1, zones: ['DECK', 'EXTRA'] });

    assert.deepEqual(fieldEffectCalls, [
        ['shuffleDeck', 0, 'DECK'],
        ['shuffleZone', 0, 'HAND'],
        ['shuffleZone', 1, 'HAND'],
        ['shuffleTagSwap', 1, ['DECK', 'EXTRA']]
    ]);
    assert.deepEqual(promptCalls, ['']);
    assert.deepEqual(duelMessages, []);
});
