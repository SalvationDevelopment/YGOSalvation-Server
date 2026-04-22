const summonModes = new Set(['summon', 'special_summon', 'flip_summon']);

function normalizePlacementNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}

function resolveRevealDuration(duration) {
    return normalizePlacementNumber(duration, 1400);
}

export function buildStackedRevealPlacements(anchor, count) {
    if (!anchor || !Number.isFinite(Number(anchor.x)) || !Number.isFinite(Number(anchor.y)) || count <= 0) {
        return [];
    }

    return Array.from({ length: count }, (_value, index) => ({
        x: anchor.x,
        y: anchor.y,
        offsetX: (index * 22) - (((count - 1) * 22) / 2),
        offsetY: index * -6,
        rotation: (index - ((count - 1) / 2)) * 4
    }));
}

function resolveAttackTargetAnchor(field, source, target) {
    const resolvedTarget = target || field.getDirectAttackViewportCenter(source?.player || 0);

    if (Array.isArray(resolvedTarget)) {
        return field.getViewportCenter(resolvedTarget[0]);
    }

    if (resolvedTarget?.x !== undefined) {
        return resolvedTarget;
    }

    return field.getViewportCenter(resolvedTarget);
}

export function createDuelPresentationLayoutService() {
    function resolveAnnouncementPresentation(field, card) {
        const mode = typeof card?.mode === 'string' ? card.mode : 'legacy_preview',
            usesFullscreenFlasher = summonModes.has(mode) || !card?.source;

        if (!usesFullscreenFlasher) {
            return {
                type: 'pulse',
                cards: [card.source],
                duration: 1000
            };
        }

        return {
            type: 'flasher',
            payload: Object.assign({}, card, {
                duration: Math.max(120, Number(card?.duration || 500)),
                sourceAnchor: card?.source ? field.getViewportCenter(card.source) : null
            })
        };
    }

    function resolveRevealPresentation(field, cards = [], options = {}) {
        if (!Array.isArray(cards) || !cards.length) {
            return null;
        }

        const call = options.call || 'panel',
            player = normalizePlacementNumber(options.player, 0),
            duration = resolveRevealDuration(options.duration);

        if (call === 'confirm_decktop' || call === 'deck_top') {
            const anchor = field.getPileViewportCenter(player, 'DECK'),
                placements = buildStackedRevealPlacements(anchor, cards.length);

            if (!placements.length) {
                return null;
            }

            return {
                cards,
                placements,
                duration,
                mode: call
            };
        }

        if (call === 'confirm_extratop') {
            const anchor = field.getPileViewportCenter(player, 'EXTRA'),
                placements = buildStackedRevealPlacements(anchor, cards.length);

            if (!placements.length) {
                return null;
            }

            return {
                cards,
                placements,
                duration,
                mode: call
            };
        }

        if (call === 'confirm_cards') {
            const placements = cards.map((card) => {
                const center = field.getViewportCenter(card);

                if (!center) {
                    return null;
                }

                return {
                    x: center.x,
                    y: center.y,
                    offsetX: 0,
                    offsetY: 0,
                    rotation: 0
                };
            });

            if (!placements.every(Boolean)) {
                return null;
            }

            return {
                cards,
                placements,
                duration,
                mode: call
            };
        }

        return null;
    }

    function resolveAttackAnimation(field, source, target, duration = 720) {
        const from = field.getViewportCenter(source),
            to = resolveAttackTargetAnchor(field, source, target);

        if (!from || !to) {
            return null;
        }

        return {
            from,
            to,
            duration
        };
    }

    return {
        resolveAnnouncementPresentation,
        resolveAttackAnimation,
        resolveRevealPresentation
    };
}
