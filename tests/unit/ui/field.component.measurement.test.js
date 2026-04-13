import assert from 'node:assert/strict';
import test from 'node:test';
import { FieldState } from '../../../server/ui/components/duel/field.component.jsx';

function createStore() {
    return {
        emitted: [],
        emit(message) {
            this.emitted.push(message);
        }
    };
}

test('FieldState delegates viewport reads through the injected viewport service', () => {
    const calls = [],
        viewport = {
            getCardElementByUid(uid) {
                calls.push(['getCardElementByUid', uid]);
                return { uid };
            },
            getCardCenterByUid(uid) {
                calls.push(['getCardCenterByUid', uid]);
                return uid === 'beta'
                    ? { x: 30, y: 40 }
                    : { x: 10, y: 20 };
            },
            getFieldRootCenter(id) {
                calls.push(['getFieldRootCenter', id]);
                return { x: 90, y: 120 };
            },
            getLpSlotCenter(player) {
                calls.push(['getLpSlotCenter', player]);
                return { x: 70, y: 80 };
            },
            getCardGhostStyle(uid) {
                calls.push(['getCardGhostStyle', uid]);
                return {
                    position: 'fixed',
                    left: '1px',
                    top: '2px'
                };
            }
        },
        controller = FieldState({ field: {} }, createStore(), [], { viewport });

    controller.state = {
        ...controller.state,
        cards: {
            alpha: {
                state: {
                    uid: 'alpha',
                    id: 1001,
                    player: 0,
                    location: 'MONSTERZONE',
                    index: 2,
                    overlayindex: 0
                }
            },
            beta: {
                state: {
                    uid: 'beta',
                    id: 1002,
                    player: 1,
                    location: 'DECK',
                    index: 3,
                    overlayindex: 0
                }
            }
        }
    };

    assert.deepEqual(controller.getCardElement({
        player: 0,
        location: 'MONSTERZONE',
        index: 2
    }), {
        uid: 'alpha'
    });
    assert.deepEqual(controller.getViewportCenter({
        player: 0,
        location: 'MONSTERZONE',
        index: 2
    }), {
        x: 10,
        y: 20
    });
    assert.deepEqual(controller.getPileViewportCenter(1, 'DECK'), {
        x: 30,
        y: 40
    });
    assert.deepEqual(controller.getDirectAttackViewportCenter(0), {
        x: 70,
        y: 80
    });

    controller.queueExitFade(controller.state.cards.alpha, 500);

    const fadeCards = Object.values(controller.state.fadeCards);
    assert.equal(fadeCards.length, 1);
    assert.deepEqual(fadeCards[0].state.ghostStyle, {
        position: 'fixed',
        left: '1px',
        top: '2px'
    });
    assert.deepEqual(calls, [
        ['getCardElementByUid', 'alpha'],
        ['getCardCenterByUid', 'alpha'],
        ['getCardCenterByUid', 'beta'],
        ['getLpSlotCenter', 1],
        ['getCardGhostStyle', 'alpha']
    ]);

    controller.dispose();
});

test('FieldState falls back to the field root center when pile and lifepoint anchors are missing', () => {
    const calls = [],
        viewport = {
            getCardElementByUid() {
                return null;
            },
            getCardCenterByUid() {
                return null;
            },
            getFieldRootCenter(id) {
                calls.push(['getFieldRootCenter', id]);
                return { x: 50, y: 60 };
            },
            getLpSlotCenter(player) {
                calls.push(['getLpSlotCenter', player]);
                return null;
            },
            getCardGhostStyle() {
                return null;
            }
        },
        controller = FieldState({ field: {} }, createStore(), [], { viewport });

    controller.state = {
        ...controller.state,
        cards: {}
    };

    assert.deepEqual(controller.getPileViewportCenter(0, 'DECK'), {
        x: 50,
        y: 60
    });
    assert.deepEqual(controller.getDirectAttackViewportCenter(1), {
        x: 50,
        y: 60
    });
    assert.deepEqual(calls, [
        ['getFieldRootCenter', 'automationduelfield'],
        ['getLpSlotCenter', 0],
        ['getFieldRootCenter', 'automationduelfield']
    ]);
});
