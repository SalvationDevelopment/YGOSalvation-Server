import assert from 'node:assert/strict';
import test from 'node:test';
import { createDuelFieldStateService } from '../../../server/ui/services/duel-field-state.service.js';

function createController(overrides = {}) {
    const emitted = [],
        state = {
            cards: {},
            fadeCards: {},
            pileSnapshots: {},
            ...overrides.state
        },
        controller = {
            databaseSystem: overrides.databaseSystem || [],
            state,
            store: {
                emit(message) {
                    emitted.push(message);
                }
            },
            viewport: overrides.viewport || {
                getCardGhostStyle() {
                    return {
                        position: 'fixed',
                        left: '1px',
                        top: '2px'
                    };
                }
            },
            fieldPrimed: Boolean(overrides.fieldPrimed),
            fadeCleanupTimers: new Set(),
            hoveredRelationSource: overrides.hoveredRelationSource || null,
            appliedRelationHighlights: [],
            setCardImageState(cardImage, patch) {
                cardImage.state = {
                    ...cardImage.state,
                    ...patch
                };
            },
            applyRelationHighlights(query) {
                this.appliedRelationHighlights.push(query);
            },
            getPileSnapshotKey(player, location) {
                return `${Number(player)}:${location}`;
            },
            findPrimaryCardImages(query) {
                return Object.values(this.state.cards).filter((cardImage) =>
                    Number(cardImage?.state?.player) === Number(query?.player)
                    && cardImage?.state?.location === query?.location
                    && Number(cardImage?.state?.index) === Number(query?.index)
                    && Number(cardImage?.state?.overlayindex || 0) === 0
                );
            }
        };

    return {
        controller,
        emitted
    };
}

test('createDuelFieldStateService merges hydrated pile metadata and clears snapshots on live updates', () => {
    const service = createDuelFieldStateService(),
        { controller, emitted } = createController({
            databaseSystem: [
                { id: 2001, name: 'Alpha' },
                { id: 2002, name: 'Beta' },
                { id: 2003, name: 'Gamma' }
            ]
        });

    service.replaceField(controller, [{
        DECK: [{
            uid: 'alpha',
            id: 2001,
            player: 0,
            location: 'DECK',
            index: 0,
            overlayindex: 0
        }]
    }]);

    assert.equal(controller.fieldPrimed, true);
    assert.equal(controller.state.cards.alpha.state.name, 'Alpha');

    service.hydrateField(controller, [{
        DECK: [{
            id: 2002,
            player: 0,
            location: 'DECK',
            index: 0,
            status: 'peeked'
        }]
    }]);

    assert.equal(controller.state.cards.alpha.state.id, 2002);
    assert.equal(controller.state.cards.alpha.state.name, 'Beta');
    assert.deepEqual(service.getDeck(controller, 0, 'DECK'), [{
        id: 2002,
        uid: 'alpha',
        player: 0,
        location: 'DECK',
        index: 0,
        type: undefined,
        setcode: undefined,
        position: undefined,
        status: 'peeked',
        name: 'Alpha',
        overlayindex: 0
    }]);

    service.updateField(controller, [{
        DECK: [{
            uid: 'alpha',
            id: 2003,
            player: 0,
            location: 'DECK',
            index: 0,
            overlayindex: 0
        }]
    }]);

    assert.deepEqual(controller.state.pileSnapshots, {});
    assert.deepEqual(service.getDeck(controller, 0, 'DECK'), [{
        id: 2003,
        uid: 'alpha',
        player: 0,
        location: 'DECK',
        index: 0,
        type: undefined,
        setcode: undefined,
        position: undefined,
        status: 'revealed',
        name: 'Gamma'
    }]);
    assert.deepEqual(emitted, [{ action: 'RENDER' }]);
});

test('createDuelFieldStateService schedules enter and exit fade cleanup during replaceField transitions', () => {
    const timeouts = [],
        service = createDuelFieldStateService({
            setTimeout(callback, delay) {
                const token = { callback, delay };
                timeouts.push(token);
                return token;
            },
            clearTimeout() {},
            now: () => 77,
            random: () => 0.5
        }),
        { controller, emitted } = createController({
            databaseSystem: [{ id: 3001, name: 'Card' }],
            hoveredRelationSource: {
                player: 0,
                location: 'HAND',
                index: 0
            }
        });

    service.replaceField(controller, [{
        HAND: [{
            uid: 'alpha',
            id: 3001,
            player: 0,
            location: 'HAND',
            index: 0,
            overlayindex: 0
        }]
    }]);

    service.replaceField(controller, [{
        HAND: [{
            uid: 'beta',
            id: 3001,
            player: 0,
            location: 'HAND',
            index: 0,
            overlayindex: 0
        }]
    }]);

    assert.equal(controller.state.cards.beta.state.enterFade, true);
    assert.equal(Object.keys(controller.state.fadeCards).length, 1);
    assert.equal(controller.state.fadeCards['alpha-ghost-77-8'].state.exitFade, true);
    assert.equal(controller.state.cards.beta.state.handLocation, 1);
    assert.deepEqual(controller.appliedRelationHighlights, [
        {
            player: 0,
            location: 'HAND',
            index: 0
        },
        {
            player: 0,
            location: 'HAND',
            index: 0
        }
    ]);
    assert.deepEqual(timeouts.map((entry) => entry.delay), [240, 220]);

    timeouts[1].callback();
    timeouts[0].callback();

    assert.deepEqual(controller.state.fadeCards, {});
    assert.equal(controller.state.cards.beta.state.enterFade, undefined);
    assert.deepEqual(emitted, [
        { action: 'RENDER' },
        { action: 'RENDER' }
    ]);
});
