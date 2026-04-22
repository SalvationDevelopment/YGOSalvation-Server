import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildStackedRevealPlacements,
    createDuelPresentationLayoutService
} from '../../../server/ui/services/duel-presentation-layout.service.js';

test('buildStackedRevealPlacements fans cards from a shared anchor', () => {
    assert.deepEqual(buildStackedRevealPlacements({ x: 100, y: 200 }, 3), [
        {
            x: 100,
            y: 200,
            offsetX: -22,
            offsetY: -0,
            rotation: -4
        },
        {
            x: 100,
            y: 200,
            offsetX: 0,
            offsetY: -6,
            rotation: 0
        },
        {
            x: 100,
            y: 200,
            offsetX: 22,
            offsetY: -12,
            rotation: 4
        }
    ]);
});

test('createDuelPresentationLayoutService resolves reveal placements for deck and field previews', () => {
    const service = createDuelPresentationLayoutService(),
        field = {
            getPileViewportCenter(player, location) {
                return location === 'DECK'
                    ? { x: 50 + player, y: 80 }
                    : { x: 120 + player, y: 140 };
            },
            getViewportCenter(card) {
                if (card?.id === 1001) {
                    return { x: 20, y: 30 };
                }

                if (card?.id === 1002) {
                    return { x: 40, y: 60 };
                }

                return null;
            }
        };

    assert.deepEqual(
        service.resolveRevealPresentation(field, [{ id: 1 }, { id: 2 }], {
            call: 'deck_top',
            player: 1,
            duration: 900
        }),
        {
            cards: [{ id: 1 }, { id: 2 }],
            placements: [
                { x: 51, y: 80, offsetX: -11, offsetY: -0, rotation: -2 },
                { x: 51, y: 80, offsetX: 11, offsetY: -6, rotation: 2 }
            ],
            duration: 900,
            mode: 'deck_top'
        }
    );

    assert.deepEqual(
        service.resolveRevealPresentation(field, [{ id: 1001 }, { id: 1002 }], {
            call: 'confirm_cards',
            duration: 1500
        }),
        {
            cards: [{ id: 1001 }, { id: 1002 }],
            placements: [
                { x: 20, y: 30, offsetX: 0, offsetY: 0, rotation: 0 },
                { x: 40, y: 60, offsetX: 0, offsetY: 0, rotation: 0 }
            ],
            duration: 1500,
            mode: 'confirm_cards'
        }
    );
});

test('createDuelPresentationLayoutService returns null when reveal anchors are unavailable', () => {
    const service = createDuelPresentationLayoutService(),
        field = {
            getPileViewportCenter() {
                return null;
            },
            getViewportCenter() {
                return null;
            }
        };

    assert.equal(service.resolveRevealPresentation(field, [{ id: 1 }], {
        call: 'confirm_extratop',
        player: 0
    }), null);

    assert.equal(service.resolveRevealPresentation(field, [{ id: 1001 }], {
        call: 'confirm_cards'
    }), null);
});

test('createDuelPresentationLayoutService resolves announcement and attack presentation payloads', () => {
    const service = createDuelPresentationLayoutService(),
        field = {
            getViewportCenter(query) {
                if (query?.id === 'source') {
                    return { x: 10, y: 20 };
                }

                if (query?.id === 'target') {
                    return { x: 40, y: 60 };
                }

                return null;
            },
            getDirectAttackViewportCenter(player) {
                return { x: 80 + player, y: 120 };
            }
        };

    assert.deepEqual(
        service.resolveAnnouncementPresentation(field, {
            id: 2001,
            mode: 'legacy_preview',
            source: { id: 'source' }
        }),
        {
            type: 'pulse',
            cards: [{ id: 'source' }],
            duration: 1000
        }
    );

    assert.deepEqual(
        service.resolveAnnouncementPresentation(field, {
            id: 3001,
            mode: 'summon',
            source: { id: 'source' },
            duration: 700
        }),
        {
            type: 'flasher',
            payload: {
                id: 3001,
                mode: 'summon',
                source: { id: 'source' },
                duration: 700,
                sourceAnchor: { x: 10, y: 20 }
            }
        }
    );

    assert.deepEqual(
        service.resolveAttackAnimation(field, { id: 'source', player: 1 }, { id: 'target' }, 640),
        {
            from: { x: 10, y: 20 },
            to: { x: 40, y: 60 },
            duration: 640
        }
    );

    assert.deepEqual(
        service.resolveAttackAnimation(field, { id: 'source', player: 1 }, null, 640),
        {
            from: { x: 10, y: 20 },
            to: { x: 81, y: 120 },
            duration: 640
        }
    );
});
