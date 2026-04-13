import assert from 'node:assert/strict';
import test from 'node:test';
import { DuelScreenState } from '../../../server/ui/components/duel/duel.component.jsx';

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

test('DuelScreenState routes flash, reveal, and attack presentation through the injected layout service', () => {
    const store = createStore(),
        layoutCalls = [],
        controller = DuelScreenState(store, {}, [], {
            presentationLayoutService: {
                resolveAnnouncementPresentation(field, card) {
                    layoutCalls.push(['announcement', field, card]);
                    return {
                        type: 'flasher',
                        payload: {
                            id: card.id,
                            duration: 900,
                            sourceAnchor: { x: 10, y: 20 }
                        }
                    };
                },
                resolveRevealPresentation(field, cards, options) {
                    layoutCalls.push(['reveal', field, cards, options]);
                    return {
                        cards,
                        placements: [{ x: 20, y: 30, offsetX: 0, offsetY: 0, rotation: 0 }],
                        duration: 1400,
                        mode: options.call || 'panel'
                    };
                },
                resolveAttackAnimation(field, source, target, duration) {
                    layoutCalls.push(['attack', field, source, target, duration]);
                    return {
                        from: { x: 30, y: 40 },
                        to: { x: 50, y: 60 },
                        duration
                    };
                }
            }
        });

    controller.flash({ id: 2001, source: { id: 'source' } });
    assert.equal(controller.previewReveal([{ id: 3001 }], { call: 'deck_top', player: 0 }), true);
    controller.animateAttack({ id: 'source' }, { id: 'target' }, 640);

    assert.equal(layoutCalls.length, 3);
    assert.equal(layoutCalls[0][0], 'announcement');
    assert.equal(layoutCalls[0][1], controller.field);
    assert.deepEqual(layoutCalls[0][2], { id: 2001, source: { id: 'source' } });
    assert.equal(layoutCalls[1][0], 'reveal');
    assert.equal(layoutCalls[1][1], controller.field);
    assert.deepEqual(layoutCalls[1][2], [{ id: 3001 }]);
    assert.deepEqual(layoutCalls[1][3], { call: 'deck_top', player: 0 });
    assert.equal(layoutCalls[2][0], 'attack');
    assert.equal(layoutCalls[2][1], controller.field);
    assert.deepEqual(layoutCalls[2][2], { id: 'source' });
    assert.deepEqual(layoutCalls[2][3], { id: 'target' });
    assert.equal(layoutCalls[2][4], 640);

    assert.deepEqual(
        store.emitted
            .filter((message) => ['OPEN_FLASHER', 'OPEN_FIELD_REVEAL', 'OPEN_ATTACK_ANIMATION'].includes(message?.action)),
        [
            {
                action: 'OPEN_FLASHER',
                state: {
                    id: 2001,
                    active: true,
                    duration: 900,
                    sourceAnchor: { x: 10, y: 20 }
                }
            },
            {
                action: 'OPEN_FIELD_REVEAL',
                state: {
                    active: true,
                    cards: [{ id: 3001 }],
                    placements: [{ x: 20, y: 30, offsetX: 0, offsetY: 0, rotation: 0 }],
                    mode: 'deck_top',
                    stage: 'priming',
                    duration: 1400
                }
            },
            {
                action: 'OPEN_ATTACK_ANIMATION',
                state: {
                    active: true,
                    from: { x: 30, y: 40 },
                    to: { x: 50, y: 60 },
                    stage: 'priming',
                    duration: 640
                }
            }
        ]
    );

    controller.dispose();
});
