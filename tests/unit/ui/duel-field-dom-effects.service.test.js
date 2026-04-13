import assert from 'node:assert/strict';
import test from 'node:test';
import { createDuelFieldDomEffectsService } from '../../../server/ui/services/duel-field-dom-effects.service.js';

function createFakeElement(attributes = {}, style = {}) {
    return {
        attributes: {
            ...attributes
        },
        dataset: {},
        style: {
            ...style
        },
        getAttribute(name) {
            return this.attributes[name];
        },
        setAttribute(name, value) {
            this.attributes[name] = value;
            if (name === 'style') {
                this.style = {};
            }
        }
    };
}

test('createDuelFieldDomEffectsService lays out hand cards through the injected viewport', () => {
    const firstCard = createFakeElement(),
        secondCard = createFakeElement(),
        thirdCard = createFakeElement(),
        service = createDuelFieldDomEffectsService({
            viewport: {
                queryElements(selector) {
                    switch (selector) {
                        case '.p0.HAND':
                            return [firstCard, secondCard, thirdCard];
                        case '.p0.HAND.i0':
                            return [firstCard];
                        case '.p0.HAND.i1':
                            return [secondCard];
                        case '.p0.HAND.i2':
                            return [thirdCard];
                        default:
                            return [];
                    }
                },
                getNumericStyle() {
                    return 0;
                }
            }
        });

    service.layoutHand(0);

    assert.equal(firstCard.style.left, '290.625px');
    assert.equal(secondCard.style.left, '365.625px');
    assert.equal(thirdCard.style.left, '440.625px');
});

test('createDuelFieldDomEffectsService shuffles deck stacks and restores hand layout on completion', () => {
    const deckCard = createFakeElement({ 'data-index': '3' }, { left: '0px' }),
        handCard = createFakeElement(),
        timeouts = [],
        intervals = [],
        clearedIntervals = [],
        service = createDuelFieldDomEffectsService({
            viewport: {
                queryElements(selector) {
                    switch (selector) {
                        case '.card.p0.DECK':
                            return [deckCard];
                        case '.p0.HAND':
                            return [handCard];
                        case '.p0.HAND.i0':
                            return [handCard];
                        default:
                            return [];
                    }
                },
                getNumericStyle(_element, property) {
                    return property === 'left' ? 100 : 0;
                }
            },
            random: () => 0.75,
            setInterval(callback, delay) {
                const token = { callback, delay };
                intervals.push(token);
                return token;
            },
            clearInterval(token) {
                clearedIntervals.push(token);
            },
            setTimeout(callback, delay) {
                const token = { callback, delay };
                timeouts.push(token);
                return token;
            }
        });

    service.shuffleDeck(0, 'DECK');

    assert.equal(deckCard.style.webkitTransform, 'translate3d(0,0,3px)');
    assert.equal(deckCard.style.zIndex, '3');
    assert.equal(deckCard.style.left, '75px');
    assert.deepEqual(intervals.map((entry) => entry.delay), [200]);
    assert.deepEqual(timeouts.map((entry) => entry.delay), [1000]);

    timeouts[0].callback();

    assert.deepEqual(clearedIntervals, [intervals[0]]);
    assert.equal(deckCard.style.webkitTransform, 'translate3d(0,0,3px)');
    assert.equal(deckCard.style.zIndex, '3');
    assert.deepEqual(timeouts.map((entry) => entry.delay), [1000, 500]);

    timeouts[1].callback();

    assert.equal(handCard.style.left, '365.625px');
});

test('createDuelFieldDomEffectsService shuffles visible zone cards and restores prior transforms', () => {
    const baseCard = createFakeElement({ 'data-overlayindex': '0' }, { transform: 'rotate(5deg)' }),
        overlayCard = createFakeElement({ 'data-overlayindex': '1' }, { transform: 'rotate(10deg)' }),
        timeouts = [],
        service = createDuelFieldDomEffectsService({
            viewport: {
                queryElements(selector) {
                    if (selector === '.card.p1.HAND') {
                        return [baseCard, overlayCard];
                    }

                    return [];
                },
                getNumericStyle() {
                    return 0;
                }
            },
            random: () => 0.75,
            setTimeout(callback, delay) {
                const token = { callback, delay };
                timeouts.push(token);
                return token;
            }
        });

    service.shuffleZone(1, 'HAND');

    assert.equal(baseCard.dataset.shuffleTransform, 'rotate(5deg)');
    assert.equal(baseCard.style.transform, 'rotate(5deg) translate(9px, 4px)');
    assert.equal(overlayCard.style.transform, 'rotate(10deg)');
    assert.deepEqual(timeouts.map((entry) => entry.delay), [350]);

    timeouts[0].callback();

    assert.equal(baseCard.style.transform, 'rotate(5deg)');
    assert.equal(baseCard.dataset.shuffleTransform, undefined);
});
