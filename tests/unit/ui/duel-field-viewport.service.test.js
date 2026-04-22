import assert from 'node:assert/strict';
import test from 'node:test';
import { createDuelFieldViewport } from '../../../server/ui/services/duel-field-viewport.service.js';

test('createDuelFieldViewport exposes query helpers and numeric style reads', () => {
    const handElements = [{ id: 'a' }, { id: 'b' }],
        document = {
            querySelectorAll(selector) {
                assert.equal(selector, '.p0.HAND');
                return handElements;
            }
        },
        window = {
            getComputedStyle() {
                return {
                    left: '14.5px'
                };
            }
        },
        viewport = createDuelFieldViewport({
            document,
            window
        });

    assert.deepEqual(viewport.queryElements('.p0.HAND'), handElements);
    assert.equal(viewport.getNumericStyle({}, 'left'), 14.5);
});

test('createDuelFieldViewport measures card, pile, and lifepoint anchors from DOM elements', () => {
    const cardElement = {
            getBoundingClientRect() {
                return {
                    left: 10,
                    top: 20,
                    width: 30,
                    height: 40
                };
            }
        },
        fieldRoot = {
            getBoundingClientRect() {
                return {
                    left: 100,
                    top: 200,
                    width: 120,
                    height: 120
                };
            }
        },
        lifepointSlot = {
            getBoundingClientRect() {
                return {
                    left: 40,
                    top: 60,
                    width: 30,
                    height: 30
                };
            }
        },
        document = {
            querySelector(selector) {
                if (selector === '.card[data-uid="alpha"]') {
                    return cardElement;
                }

                if (selector === '.lp-slot.p1') {
                    return lifepointSlot;
                }

                return null;
            },
            getElementById(id) {
                if (id === 'automationduelfield') {
                    return fieldRoot;
                }

                return null;
            }
        },
        window = {
            getComputedStyle(element) {
                if (element === cardElement) {
                    return {
                        transform: 'translate(4px, 6px)'
                    };
                }

                return {
                    transform: 'none'
                };
            }
        },
        viewport = createDuelFieldViewport({
            document,
            window
        });

    assert.deepEqual(viewport.getCardCenterByUid('alpha'), {
        x: 25,
        y: 40
    });
    assert.deepEqual(viewport.getFieldRootCenter(), {
        x: 160,
        y: 260
    });
    assert.deepEqual(viewport.getLpSlotCenter(1), {
        x: 55,
        y: 75
    });
    assert.deepEqual(viewport.getCardGhostStyle('alpha'), {
        position: 'fixed',
        left: '10px',
        top: '20px',
        width: '30px',
        height: '40px',
        transform: 'translate(4px, 6px)',
        zIndex: 40
    });
});
