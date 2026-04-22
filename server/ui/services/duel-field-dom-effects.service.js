import { createDuelFieldViewport } from './duel-field-viewport.service';

function normalizePlayerSlot(player) {
    const token = String(player ?? '');

    return token.startsWith('p')
        ? token.slice(1)
        : token;
}

function getPlayerClass(player) {
    return `p${normalizePlayerSlot(player)}`;
}

function toPixelString(value) {
    return `${value}px`;
}

export function createDuelFieldDomEffectsService(dependencies = {}) {
    const viewport = dependencies.viewport || createDuelFieldViewport(),
        setTimeoutImpl = dependencies.setTimeout || globalThis.setTimeout?.bind(globalThis) || setTimeout,
        setIntervalImpl = dependencies.setInterval || globalThis.setInterval?.bind(globalThis) || setInterval,
        clearIntervalImpl = dependencies.clearInterval || globalThis.clearInterval?.bind(globalThis) || clearInterval,
        random = dependencies.random || Math.random;

    function getElements(selector) {
        return viewport.queryElements(selector);
    }

    function getNumericStyle(element, property) {
        return viewport.getNumericStyle(element, property);
    }

    function layoutHand(player) {
        const slot = normalizePlayerSlot(player),
            cards = getElements(`.p${slot}.HAND`),
            count = cards.length,
            factor = 75 / 0.8;

        for (let sequence = 0; sequence < count; sequence += 1) {
            const xCoord = count < 6
                ? (5.5 * factor - 0.8 * factor * count) / 2 + 1.55 * factor + sequence * 0.8 * factor
                : 1.9 * factor + (sequence * 4.0 * factor) / (count - 1);

            getElements(`.p${slot}.HAND.i${sequence}`).forEach((card) => {
                card.style.left = toPixelString(xCoord);
            });
        }
    }

    function resetDeckStackMargins(player, deck) {
        getElements(`.card.${getPlayerClass(player)}.${deck}`).forEach((element) => {
            const index = Number(element.getAttribute('data-index') || 0);

            if (typeof element.setAttribute === 'function') {
                element.setAttribute('style', '');
            }

            Object.assign(element.style, {
                webkitTransform: `translate3d(0,0,${index}px)`,
                zIndex: String(index)
            });
        });
    }

    function applyDeckShuffle(player, deck) {
        const playerClass = getPlayerClass(player),
            axis = playerClass === 'p0' ? 'left' : 'right';

        resetDeckStackMargins(player, deck);
        getElements(`.card.${playerClass}.${deck}`)
            .reverse()
            .forEach((element) => {
                const cachedPosition = getNumericStyle(element, axis),
                    randomOffset = Math.floor(random() * 100 - 50);

                element.style[axis] = toPixelString(cachedPosition - randomOffset);
            });
    }

    function shuffleDeck(player, deck) {
        const slot = normalizePlayerSlot(player),
            action = setIntervalImpl(() => {
                applyDeckShuffle(slot, deck);
                setTimeoutImpl(() => {
                    resetDeckStackMargins(slot, deck);
                }, 50);
            }, 200);

        setTimeoutImpl(() => {
            clearIntervalImpl(action);
            resetDeckStackMargins(slot, deck);
            setTimeoutImpl(() => {
                layoutHand(slot);
            }, 500);
        }, 1000);

        applyDeckShuffle(slot, deck);
    }

    function shuffleZone(player, location) {
        const cards = getElements(`.card.${getPlayerClass(player)}.${location}`).filter(
            (element) => Number(element.getAttribute('data-overlayindex') || 0) === 0
        );

        cards.forEach((element) => {
            const previousTransform = element.style.transform || '',
                offsetX = Math.floor(random() * 36 - 18),
                offsetY = Math.floor(random() * 18 - 9);

            element.dataset.shuffleTransform = previousTransform;
            element.style.transform = `${previousTransform} translate(${offsetX}px, ${offsetY}px)`.trim();
        });

        setTimeoutImpl(() => {
            cards.forEach((element) => {
                element.style.transform = element.dataset.shuffleTransform || '';
                delete element.dataset.shuffleTransform;
            });
        }, 350);
    }

    function shuffleTagSwap(player, zones = ['DECK', 'HAND', 'EXTRA']) {
        zones.forEach((zone) => {
            shuffleDeck(player, zone);
        });
    }

    return {
        layoutHand,
        shuffleDeck,
        shuffleTagSwap,
        shuffleZone
    };
}

export const defaultDuelFieldDomEffectsService = createDuelFieldDomEffectsService();
