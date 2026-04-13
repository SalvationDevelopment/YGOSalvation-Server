import { CardImageState } from '../components/common/card.component';

function removeFieldMapEntry(map, key) {
    const nextMap = { ...map };
    delete nextMap[key];
    return nextMap;
}

function castField(field, callback) {
    Object.keys(field).forEach((zone) => {
        field[zone].forEach(callback);
        field[zone].forEach(callback);
    });
}

export function createDuelFieldStateService(dependencies = {}) {
    const setTimeoutImpl = dependencies.setTimeout || globalThis.setTimeout?.bind(globalThis) || setTimeout,
        clearTimeoutImpl = dependencies.clearTimeout || globalThis.clearTimeout?.bind(globalThis) || clearTimeout,
        now = dependencies.now || Date.now,
        random = dependencies.random || Math.random;

    function getCardMetadata(controller, cardId) {
        if (!Array.isArray(controller.databaseSystem) || !cardId) {
            return {};
        }

        return controller.databaseSystem.find((entry) => entry.id === cardId) || {};
    }

    function collectCards(field) {
        const cards = [];

        if (Array.isArray(field)) {
            field.forEach((view) => {
                if (view && typeof view === 'object') {
                    castField(view, (card) => cards.push(card));
                }
            });
            return cards;
        }

        if (field && typeof field === 'object') {
            castField(field, (card) => cards.push(card));
        }

        return cards;
    }

    function rememberHydratedPiles(controller, update) {
        const views = Array.isArray(update) ? update : [update];

        views.forEach((view, fallbackPlayer) => {
            if (!view || typeof view !== 'object') {
                return;
            }

            Object.keys(view).forEach((location) => {
                const cards = Array.isArray(view[location]) ? view[location] : [];

                if (!cards.length) {
                    return;
                }

                const snapshot = cards.map((card, fallbackIndex) => {
                    const player = Number.isInteger(Number(card?.player))
                            ? Number(card.player)
                            : Number(fallbackPlayer),
                        index = Number.isInteger(Number(card?.index))
                            ? Number(card.index)
                            : Number(fallbackIndex),
                        [cardImage] = controller.findPrimaryCardImages({
                            player,
                            location,
                            index
                        }),
                        existingState = cardImage?.state || {};

                    return {
                        ...existingState,
                        ...card,
                        player,
                        location,
                        index,
                        status: card?.status || existingState.status || 'revealed'
                    };
                });

                if (snapshot.length) {
                    controller.state.pileSnapshots[controller.getPileSnapshotKey(snapshot[0].player, location)] = snapshot;
                }
            });
        });
    }

    function clearHydratedPiles(controller, update) {
        const views = Array.isArray(update) ? update : [update];

        views.forEach((view, fallbackPlayer) => {
            if (!view || typeof view !== 'object') {
                return;
            }

            Object.keys(view).forEach((location) => {
                const cards = Array.isArray(view[location]) ? view[location] : [];

                if (!cards.length) {
                    return;
                }

                const firstCard = cards[0] || {},
                    player = Number.isInteger(Number(firstCard?.player))
                        ? Number(firstCard.player)
                        : Number(fallbackPlayer);

                delete controller.state.pileSnapshots[controller.getPileSnapshotKey(player, location)];
            });
        });
    }

    function scheduleEnterFade(controller, cardImage, duration = 240) {
        if (!cardImage) {
            return;
        }

        if (cardImage.__enterFadeTimer) {
            clearTimeoutImpl(cardImage.__enterFadeTimer);
        }

        controller.setCardImageState(cardImage, { enterFade: true });
        cardImage.__enterFadeTimer = setTimeoutImpl(() => {
            controller.setCardImageState(cardImage, { enterFade: undefined });
            cardImage.__enterFadeTimer = null;
            controller.store.emit({ action: 'RENDER' });
        }, duration);
    }

    function queueExitFade(controller, cardImage, duration = 220) {
        if (!cardImage?.state?.uid) {
            return;
        }

        const ghostStyle = controller.viewport.getCardGhostStyle(cardImage.state.uid),
            ghostKey = `${cardImage.state.uid}-ghost-${now()}-${random().toString(16).slice(2)}`,
            ghost = CardImageState({
                state: Object.assign({}, cardImage.state, {
                    uid: ghostKey,
                    ghostOverlay: true,
                    ghostStyle,
                    exitFade: true
                })
            });

        controller.state = {
            ...controller.state,
            fadeCards: {
                ...controller.state.fadeCards,
                [ghostKey]: ghost
            }
        };

        const cleanupTimer = setTimeoutImpl(() => {
            controller.state = {
                ...controller.state,
                fadeCards: removeFieldMapEntry(controller.state.fadeCards, ghostKey)
            };
            controller.fadeCleanupTimers.delete(cleanupTimer);
            controller.store.emit({ action: 'RENDER' });
        }, duration);
        controller.fadeCleanupTimers.add(cleanupTimer);
    }

    function syncField(controller, field, replace = false) {
        const cards = collectCards(field).filter((card) => card && card.location !== 'INMATERIAL'),
            previousCards = controller.state.cards,
            nextCards = replace ? {} : controller.state.cards,
            seenUids = new Set();

        cards.forEach((card) => {
            let dbEntry = {};

            seenUids.add(card.uid);

            if (replace && previousCards[card.uid] && !nextCards[card.uid]) {
                nextCards[card.uid] = previousCards[card.uid];
            }

            if (!nextCards[card.uid]) {
                dbEntry = getCardMetadata(controller, card.id);
                nextCards[card.uid] = CardImageState({
                    state: Object.assign({}, dbEntry, card)
                });

                if (replace && controller.fieldPrimed) {
                    scheduleEnterFade(controller, nextCards[card.uid]);
                }
            }

            if (nextCards[card.uid].state.id !== card.id) {
                dbEntry = getCardMetadata(controller, card.id);
            }

            nextCards[card.uid].state = {
                ...nextCards[card.uid].state,
                ...dbEntry,
                ...card
            };
        });

        if (replace && controller.fieldPrimed) {
            Object.keys(previousCards).forEach((uid) => {
                if (!seenUids.has(uid)) {
                    queueExitFade(controller, previousCards[uid]);
                }
            });
        }

        if (replace) {
            controller.state = {
                ...controller.state,
                cards: nextCards
            };
            controller.fieldPrimed = true;
        }

        const count = { 0: 0, 1: 0 };

        Object.keys(controller.state.cards).forEach((uid) => {
            const cardImage = controller.state.cards[uid];
            if (cardImage?.state?.location === 'HAND') {
                count[cardImage.state.player] += 1;
            }
        });

        Object.keys(controller.state.cards).forEach((uid) => {
            const cardImage = controller.state.cards[uid];
            if (cardImage?.state?.location === 'HAND') {
                controller.setCardImageState(cardImage, {
                    handLocation: count[cardImage.state.player]
                });
            }
        });

        if (controller.hoveredRelationSource) {
            controller.applyRelationHighlights(controller.hoveredRelationSource);
        }
    }

    function updateField(controller, update) {
        clearHydratedPiles(controller, update);
        syncField(controller, update, false);
    }

    function hydrateField(controller, update) {
        const views = Array.isArray(update) ? update : [update];
        let changed = false;

        rememberHydratedPiles(controller, update);

        views.forEach((view, fallbackPlayer) => {
            if (!view || typeof view !== 'object') {
                return;
            }

            Object.keys(view).forEach((location) => {
                const cards = Array.isArray(view[location]) ? view[location] : [];

                cards.forEach((card, fallbackIndex) => {
                    const player = Number.isInteger(Number(card?.player))
                            ? Number(card.player)
                            : Number(fallbackPlayer),
                        index = Number.isInteger(Number(card?.index))
                            ? Number(card.index)
                            : Number(fallbackIndex),
                        [cardImage] = controller.findPrimaryCardImages({
                            player,
                            location,
                            index
                        });

                    if (!cardImage?.state) {
                        return;
                    }

                    const dbEntry = getCardMetadata(controller, card.id);
                    controller.setCardImageState(cardImage, {
                        ...dbEntry,
                        ...card
                    });
                    changed = true;
                });
            });
        });

        if (changed) {
            controller.store.emit({ action: 'RENDER' });
        }
    }

    function replaceField(controller, update) {
        controller.state = {
            ...controller.state,
            pileSnapshots: {}
        };
        syncField(controller, update, true);
    }

    function getDeck(controller, player, location) {
        const deck = Object.keys(controller.state.cards)
            .filter((guid) => {
                const cardImage = controller.state.cards[guid];
                return cardImage.state.location === location && cardImage.state.player === player;
            })
            .map((guid) => {
                const cardImage = controller.state.cards[guid];
                return {
                    id: cardImage.state.id,
                    uid: cardImage.state.uid,
                    player: cardImage.state.player,
                    location: cardImage.state.location,
                    index: cardImage.state.index,
                    type: cardImage.state.type,
                    setcode: cardImage.state.setcode,
                    position: cardImage.state.position,
                    status: 'revealed',
                    name: cardImage.state.name
                };
            })
            .sort((first, second) => Number(first.index || 0) - Number(second.index || 0));

        const snapshot = controller.state.pileSnapshots[controller.getPileSnapshotKey(player, location)];

        if (!Array.isArray(snapshot) || !snapshot.length) {
            return deck;
        }

        const merged = new Map();

        deck.forEach((card) => {
            merged.set(Number(card.index || 0), card);
        });

        snapshot.forEach((card) => {
            merged.set(Number(card.index || 0), {
                ...(merged.get(Number(card.index || 0)) || {}),
                ...card,
                player: Number.isInteger(Number(card?.player)) ? Number(card.player) : player,
                location: card?.location || location,
                index: Number.isInteger(Number(card?.index)) ? Number(card.index) : Number(merged.size),
                status: card?.status || 'revealed'
            });
        });

        return Array.from(merged.values()).sort(
            (first, second) => Number(first.index || 0) - Number(second.index || 0)
        );
    }

    return {
        clearHydratedPiles,
        getCardMetadata,
        getDeck,
        hydrateField,
        queueExitFade,
        rememberHydratedPiles,
        replaceField,
        scheduleEnterFade,
        syncField,
        updateField
    };
}

export const defaultDuelFieldStateService = createDuelFieldStateService();
