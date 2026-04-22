import assert from 'node:assert/strict';
import test from 'node:test';
import { createPassiveGameStateService } from '../../../server/ui/services/game-passive-state.service.js';

function createContext() {
    return {
        duelRuntime: null,
        setIncomingActionDelayCalls: [],
        setIncomingActionDelay(duration) {
            this.setIncomingActionDelayCalls.push(duration);
        },
        renderCurrentView() {},
        store: {
            emit() {}
        },
        uiRuntimeState: {
            orientation: 0
        },
        uiFlowState: {
            choiceOverlay: {
                timer: null,
                token: 0
            }
        }
    };
}

function createDialogService() {
    return {
        clearQuestionTrackingCalls: 0,
        promptCalls: [],
        revealHydrationCalls: [],
        transientPrompts: [],
        clearQuestionTracking() {
            this.clearQuestionTrackingCalls += 1;
        },
        hasActiveZoneSelectorQuestion() {
            return false;
        },
        hasActiveAnnounceNumberQuestion() {
            return false;
        },
        hydrateRevealCardList(cards) {
            this.revealHydrationCalls.push(cards);
            return cards;
        },
        setQuestionPrompt(text) {
            this.promptCalls.push(text);
        },
        setupQuestion(message) {
            this.setupQuestionCall = message;
        },
        showTransientPrompt(text, duration) {
            this.transientPrompts.push([text, duration]);
        }
    };
}

test('createPassiveGameStateService delegates announcement UI work through the duel runtime adapter', () => {
    const context = createContext(),
        dialogService = createDialogService(),
        runtimeCalls = [],
        service = createPassiveGameStateService(
            Object.assign(context, {
                duelRuntime: {
                    showChoiceResult(modeName, contract, options) {
                        runtimeCalls.push(['showChoiceResult', modeName, contract, options]);
                    },
                    applyAnnouncementContract(contract) {
                        runtimeCalls.push(['applyAnnouncementContract', contract]);
                        return true;
                    }
                }
            }),
            dialogService
        );

    service.handleAnnouncement({
        ui: {
            kind: 'rps_result',
            results: ['rock', 'paper'],
            duration: 900
        }
    });
    service.handleAnnouncement({
        ui: {
            kind: 'selection_event',
            cards: [{ player: 0, location: 'MONSTERZONE', index: 0 }],
            duration: 500,
            text: 'Select a card'
        }
    });
    service.handleAnnouncement({
        ui: {
            kind: 'notice',
            text: 'A duel notice',
            duration: 300
        }
    });
    service.handleAnnouncement({
        ui: {
            kind: 'hint',
            text: 'Wait for the opponent'
        }
    });

    assert.deepEqual(runtimeCalls, [
        [
            'showChoiceResult',
            'rps',
            {
                kind: 'rps_result',
                results: ['rock', 'paper'],
                duration: 900
            },
            {
                clearPrompt: true,
                overlayActive: false,
                runtimeMode: 'choice'
            }
        ],
        [
            'applyAnnouncementContract',
            {
                kind: 'selection_event',
                cards: [{ player: 0, location: 'MONSTERZONE', index: 0 }],
                duration: 500,
                text: 'Select a card'
            }
        ]
    ]);
    assert.deepEqual(context.setIncomingActionDelayCalls, [900]);
    assert.deepEqual(dialogService.transientPrompts, [
        ['Select a card', 500],
        ['A duel notice', 300]
    ]);
    assert.deepEqual(dialogService.promptCalls, ['Wait for the opponent']);
});

test('createPassiveGameStateService delegates duel action snapshots and reveal/effect commands through the adapter', () => {
    const context = createContext(),
        dialogService = createDialogService(),
        runtimeCalls = [],
        service = createPassiveGameStateService(
            Object.assign(context, {
                uiRuntimeState: {
                    orientation: 1
                },
                duelRuntime: {
                    applyDuelSnapshot(message, options) {
                        runtimeCalls.push(['applyDuelSnapshot', message, options]);
                    },
                    disableSelection() {
                        runtimeCalls.push(['disableSelection']);
                    },
                    previewReveal(cards, options) {
                        runtimeCalls.push(['previewReveal', cards, options]);
                        return false;
                    },
                    openReveal(cards) {
                        runtimeCalls.push(['openReveal', cards]);
                    },
                    flashDuel(contract) {
                        runtimeCalls.push(['flashDuel', contract]);
                    },
                    appendChatMessage(message) {
                        runtimeCalls.push(['appendChatMessage', message]);
                    },
                    manualTake(message) {
                        runtimeCalls.push(['manualTake', message]);
                    }
                }
            }),
            dialogService
        );

    service.handleDuelAction({
        duelAction: 'start',
        info: { phase: 'DRAW' },
        names: ['alice', 'bob'],
        field: [{ MONSTERZONE: [] }, { MONSTERZONE: [] }]
    });
    service.handleDuelAction({
        duelAction: 'duel',
        info: { phase: 'BATTLE' },
        names: ['alice', 'bob'],
        field: [{ MONSTERZONE: [] }, { MONSTERZONE: [] }]
    });
    service.handleDuelAction({
        duelAction: 'reveal',
        reveal: [{ id: 1001, player: 0 }],
        call: 'deck_top',
        player: 0,
        duration: 1200
    });
    service.handleDuelAction({
        duelAction: 'effect',
        id: 2001,
        player: 0,
        location: 'MONSTERZONE',
        index: 2
    });
    service.handleDuelAction({
        duelAction: 'chat',
        message: 'hello'
    });
    service.handleDuelAction({
        duelAction: 'give',
        id: 3001
    });

    assert.equal(dialogService.clearQuestionTrackingCalls, 4);
    assert.deepEqual(dialogService.revealHydrationCalls, [
        [{ id: 1001, player: 1 }]
    ]);
    assert.deepEqual(runtimeCalls, [
        [
            'applyDuelSnapshot',
            {
                duelAction: 'start',
                info: { phase: 'DRAW' },
                names: ['alice', 'bob'],
                field: [{ MONSTERZONE: [] }, { MONSTERZONE: [] }]
            },
            {
                clearField: true,
                clearPrompt: true,
                disableSelection: true,
                mode: 'duel',
                resetChainState: true
            }
        ],
        [
            'applyDuelSnapshot',
            {
                duelAction: 'duel',
                info: { phase: 'BATTLE' },
                names: ['alice', 'bob'],
                field: [{ MONSTERZONE: [] }, { MONSTERZONE: [] }]
            },
            {
                disableSelection: true,
                mode: 'duel'
            }
        ],
        ['disableSelection'],
        [
            'previewReveal',
            [{ id: 1001, player: 1 }],
            { call: 'deck_top', player: 1, duration: 1200 }
        ],
        ['openReveal', [{ id: 1001, player: 1 }]],
        ['disableSelection'],
        [
            'flashDuel',
            {
                duelAction: 'effect',
                id: 2001,
                player: 0,
                location: 'MONSTERZONE',
                index: 2,
                mode: 'legacy_preview',
                phase: 'start',
                source: {
                    player: 1,
                    location: 'MONSTERZONE',
                    index: 2
                }
            }
        ],
        ['appendChatMessage', { duelAction: 'chat', message: 'hello' }],
        ['manualTake', { duelAction: 'give', id: 3001 }]
    ]);
});
