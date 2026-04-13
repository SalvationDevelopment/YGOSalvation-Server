import assert from 'node:assert/strict';
import test from 'node:test';
import { createDuelScreenController } from '../../../server/ui/services/duel-screen-controller.service.js';

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
            const next = listeners.get(action) || [];
            next.push(handler);
            listeners.set(action, next);

            return () => {
                const current = listeners.get(action) || [],
                    filtered = current.filter((entry) => entry !== handler);

                if (filtered.length) {
                    listeners.set(action, filtered);
                    return;
                }

                listeners.delete(action);
            };
        }
    };
}

function createFieldStub(calls) {
    return {
        getOverlayViewerDeck(card) {
            calls.push(['getOverlayViewerDeck', card]);
            return ['overlay'];
        },
        getStackHost(card) {
            calls.push(['getStackHost', card]);
            return { id: 'host-card' };
        },
        getDeck(player, location) {
            calls.push(['getDeck', player, location]);
            return ['grave-card'];
        },
        clearRelationHighlights() {
            calls.push(['clearRelationHighlights']);
        },
        applyRelationHighlights(card) {
            calls.push(['applyRelationHighlights', card]);
        },
        phase(phase) {
            calls.push(['phase', phase]);
        },
        setPileCommandHints(hints) {
            calls.push(['setPileCommandHints', hints]);
        },
        setActionSpinners(spinners) {
            calls.push(['setActionSpinners', spinners]);
        },
        updateField() {},
        hydrateField() {},
        replaceField() {},
        setDisabledZones() {},
        updateChainOverlay() {},
        clearChainOverlays() {},
        pulseBattleOverlay() {},
        pulseAnnouncementCards() {},
        pulseSelectionCards() {},
        pulseTargetCards() {},
        disableSelection() {},
        select() {},
        dispose() {}
    };
}

test('createDuelScreenController routes hover, pile clicks, updates, and idle state through injected helpers', () => {
    const store = createStore(),
        calls = [],
        field = createFieldStub(calls),
        controls = { id: 'controls' },
        info = { id: 'info' },
        lifepoints = { id: 'lifepoints' },
        noop = () => {},
        controller = createDuelScreenController(store, {}, [], {
            createFieldState: () => field,
            createCardInfo: () => info,
            createChainerState: () => ({ id: 'chainer' }),
            createControlButtonsState: () => controls,
            createLifepointState: () => lifepoints,
            disposeCardInfo: noop,
            disposeChainer: noop,
            disposeAttackAnimation: noop,
            disposePhaseBanner: noop,
            disposeFieldReveal: noop,
            disposeFlasher: noop,
            disposeLifepointState: noop,
            disposeRevealer: noop,
            disposeIdleExtraDeckViewer: noop,
            closeSelectPositionDialog: noop,
            closeSelectAttributesDialog: noop,
            closeAnnounceCardDialog: noop,
            closeYesNoDialog: noop,
            closeSelectOptionDialog: noop,
            updateCardInfo(target, payload) {
                calls.push(['updateCardInfo', target, payload]);
                return 'Card description';
            },
            updateLifepointState(target, payload) {
                calls.push(['updateLifepointState', target, payload]);
            },
            updateControlButtons(target, payload) {
                calls.push(['updateControlButtons', target, payload]);
            },
            enableControlButtons(target, card, point) {
                calls.push(['enableControlButtons', target, card, point]);
            },
            getActionableDeckForControls(target, deck) {
                calls.push(['getActionableDeckForControls', target, deck]);
                return { deck: 'resolved' };
            },
            getIdleCommandPileHintsForControls(target) {
                calls.push(['getIdleCommandPileHintsForControls', target]);
                return ['pile hint'];
            },
            getIdleCommandPileActionCoversForControls(target) {
                calls.push(['getIdleCommandPileActionCoversForControls', target]);
                return ['pile cover'];
            },
            getIdleCommandFieldActionCoversForControls(target) {
                calls.push(['getIdleCommandFieldActionCoversForControls', target]);
                return ['field cover'];
            },
            isManualMode: () => false
        });

    store.emit({
        action: 'CARD_HOVER',
        id: 3001,
        card: { id: 3001, player: 0 }
    });
    store.emit({
        action: 'CARD_CLICK',
        card: { id: 4001, location: 'GRAVE', player: 1, overlayindex: 0 },
        x: 10,
        y: 20
    });
    controller.onCardClick({
        card: { id: 5001, location: 'MONSTERZONE', player: 0, overlayindex: 2 },
        x: 14,
        y: 24
    });
    controller.update({
        lifepoints: [6000, 7500],
        turn: 2,
        names: ['Alice', 'Bob'],
        playerHints: {
            0: ['main'],
            1: ['battle']
        },
        phase: 'BATTLE'
    });
    controller.idle({ battle: true });
    store.emit({ action: 'CARD_HOVER', clear: true });

    assert.deepEqual(calls, [
        ['applyRelationHighlights', { id: 3001, player: 0 }],
        ['updateCardInfo', info, { id: 3001 }],
        ['getOverlayViewerDeck', { id: 4001, location: 'GRAVE', player: 1, overlayindex: 0 }],
        ['getDeck', 1, 'GRAVE'],
        ['getActionableDeckForControls', controls, ['grave-card']],
        ['enableControlButtons', controls, {
            id: 4001,
            location: 'GRAVE',
            player: 1,
            overlayindex: 0,
            pile: true,
            deck: { deck: 'resolved' }
        }, { x: 10, y: 20 }],
        ['getOverlayViewerDeck', { id: 5001, location: 'MONSTERZONE', player: 0, overlayindex: 2 }],
        ['getStackHost', { id: 5001, location: 'MONSTERZONE', player: 0, overlayindex: 2 }],
        ['enableControlButtons', controls, {
            id: 'host-card',
            overlayMaterials: ['overlay']
        }, { x: 14, y: 24 }],
        ['updateLifepointState', lifepoints, {
            lifepoints: [6000, 7500],
            turn: 2,
            names: ['Alice', 'Bob'],
            playerHints: {
                0: ['main'],
                1: ['battle']
            }
        }],
        ['phase', 'BATTLE'],
        ['updateControlButtons', controls, { battle: true }],
        ['getIdleCommandPileHintsForControls', controls],
        ['setPileCommandHints', ['pile hint']],
        ['getIdleCommandPileActionCoversForControls', controls],
        ['getIdleCommandFieldActionCoversForControls', controls],
        ['setActionSpinners', ['pile cover', 'field cover']],
        ['clearRelationHighlights']
    ]);

    assert.deepEqual(
        store.emitted.filter((message) => message?.action === 'RENDER'),
        [
            { action: 'RENDER' },
            { action: 'RENDER' },
            { action: 'RENDER' },
            { action: 'RENDER' }
        ]
    );
});

test('createDuelScreenController supports manual mode and disposes registered listeners and overlays', () => {
    const store = createStore(),
        calls = [],
        initialField = {
            ...createFieldStub(calls),
            dispose() {
                calls.push(['disposeField', 'initial']);
            }
        },
        replacementField = {
            ...createFieldStub(calls),
            dispose() {
                calls.push(['disposeField', 'replacement']);
            }
        },
        fields = [initialField, replacementField],
        info = { id: 'info' },
        chainer = { id: 'chainer' },
        controls = { id: 'controls' },
        lifepoints = { id: 'lifepoints' },
        createRecorder = (name) => (...args) => {
            calls.push([name, ...args]);
        },
        controller = createDuelScreenController(store, {}, [], {
            createFieldState: () => fields.shift(),
            createCardInfo: () => info,
            createChainerState: () => chainer,
            createControlButtonsState: () => controls,
            createLifepointState: () => lifepoints,
            enableControlButtons: createRecorder('enableControlButtons'),
            resetChainerDuelState: createRecorder('resetChainerDuelState'),
            disposeCardInfo: createRecorder('disposeCardInfo'),
            disposeChainer: createRecorder('disposeChainer'),
            disposeAttackAnimation: createRecorder('disposeAttackAnimation'),
            disposePhaseBanner: createRecorder('disposePhaseBanner'),
            disposeFieldReveal: createRecorder('disposeFieldReveal'),
            disposeFlasher: createRecorder('disposeFlasher'),
            disposeLifepointState: createRecorder('disposeLifepointState'),
            disposeRevealer: createRecorder('disposeRevealer'),
            disposeIdleExtraDeckViewer: createRecorder('disposeIdleExtraDeckViewer'),
            closeSelectPositionDialog: createRecorder('closeSelectPositionDialog'),
            closeSelectAttributesDialog: createRecorder('closeSelectAttributesDialog'),
            closeAnnounceCardDialog: createRecorder('closeAnnounceCardDialog'),
            closeYesNoDialog: createRecorder('closeYesNoDialog'),
            closeSelectOptionDialog: createRecorder('closeSelectOptionDialog'),
            isManualMode: () => true
        });

    controller.onCardClick({
        card: { id: 7001, location: 'MONSTERZONE', player: 0, overlayindex: 1 },
        x: 5,
        y: 6
    });
    controller.clear();

    assert.equal(controller.field, replacementField);

    controller.dispose();

    const callsAfterDispose = calls.length;
    store.emit({
        action: 'CARD_CLICK',
        card: { id: 8001, location: 'MONSTERZONE', player: 0, overlayindex: 0 },
        x: 1,
        y: 2
    });

    assert.equal(calls.length, callsAfterDispose);
    assert.deepEqual(calls, [
        ['getOverlayViewerDeck', { id: 7001, location: 'MONSTERZONE', player: 0, overlayindex: 1 }],
        ['getStackHost', { id: 7001, location: 'MONSTERZONE', player: 0, overlayindex: 1 }],
        ['enableControlButtons', controls, { id: 7001, location: 'MONSTERZONE', player: 0, overlayindex: 1 }, { x: 5, y: 6 }],
        ['resetChainerDuelState', chainer],
        ['disposeCardInfo', info],
        ['disposeChainer', chainer],
        ['disposeAttackAnimation', store],
        ['disposePhaseBanner', store],
        ['disposeFieldReveal', store],
        ['disposeFlasher', store],
        ['disposeLifepointState', lifepoints],
        ['disposeRevealer', store],
        ['disposeIdleExtraDeckViewer', store],
        ['closeSelectPositionDialog', store],
        ['closeSelectAttributesDialog', store],
        ['closeAnnounceCardDialog', store],
        ['closeYesNoDialog', store],
        ['closeSelectOptionDialog', store],
        ['disposeField', 'replacement']
    ]);

    assert.deepEqual(
        store.emitted.filter((message) => message?.action === 'RENDER'),
        [{ action: 'RENDER' }]
    );
});
