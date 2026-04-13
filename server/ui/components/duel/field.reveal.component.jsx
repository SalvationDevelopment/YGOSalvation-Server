import React, { useEffect, useRef, useState } from 'react';
import { getCardImageUrl } from '../../services/storage.service';
import AppImage from '../common/app-image';
import styles from './field.reveal.component.module.scss';

function FieldRevealCard({ card, index, mode, style }) {
    return (
        <div
            className={`field-reveal-card ${mode}`}
            key={card.uid || card.id || index}
            style={style}
        >
            <AppImage
                alt={card.name || 'Revealed card'}
                src={getCardImageUrl(card.id)}
                fallbackSrc='img/textures/unknown.jpg'
                width={177}
                height={254}
                sizes='(max-width: 768px) 40vw, 177px'
            />
        </div>
    );
}

function createEmptyFieldRevealState() {
    return {
        active: false,
        cards: [],
        placements: [],
        mode: 'panel',
        stage: 'idle'
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function triggerFieldReveal(target, state = {}) {
    const resolvedStore = resolveDialogStore(target);

    if (!resolvedStore) {
        return;
    }

    resolvedStore.emit({
        action: 'OPEN_FIELD_REVEAL',
        state: {
            active: true,
            cards: Array.isArray(state.cards) ? state.cards.slice() : [],
            placements: Array.isArray(state.placements) ? state.placements.slice() : [],
            mode: state.mode || 'panel',
            stage: 'priming',
            duration: Math.max(700, Number(state.duration || 1400))
        }
    });
}

export function disposeFieldReveal(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_FIELD_REVEAL' });
}

export function FieldRevealOverlayView({ state }) {
    if (!state?.active || !state.cards.length) {
        return null;
    }

    return (
        <div
            id="fieldrevealoverlay"
            className={styles.fieldRevealOverlay}
            key="field-reveal-overlay"
        >
            {state.cards.map((card, index) => {
                const placement = state.placements[index] || {},
                    priming = state.stage !== 'open',
                    style = {
                        left: `${Number(placement.x || 0)}px`,
                        top: `${Number(placement.y || 0)}px`,
                        transform: priming
                            ? 'translate(-50%, -50%) scale(0.72)'
                            : `translate(-50%, -50%) translate(${Number(placement.offsetX || 0)}px, ${Number(placement.offsetY || 0)}px) rotate(${Number(placement.rotation || 0)}deg) scale(1)`,
                        zIndex: 20 + index
                    };

                return (
                    <FieldRevealCard
                        card={card}
                        index={index}
                        key={card.uid || card.id || index}
                        mode={state.mode}
                        style={style}
                    />
                );
            })}
        </div>
    );
}

export function MountedFieldRevealOverlay({ controller, store }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptyFieldRevealState),
        openTimerRef = useRef(null),
        closeTimerRef = useRef(null);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const clearTimers = () => {
                if (openTimerRef.current) {
                    clearTimeout(openTimerRef.current);
                    openTimerRef.current = null;
                }
                if (closeTimerRef.current) {
                    clearTimeout(closeTimerRef.current);
                    closeTimerRef.current = null;
                }
            },
            closeDialog = () => {
                clearTimers();
                setState(createEmptyFieldRevealState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_FIELD_REVEAL', (message) => {
                const nextState = message?.state || createEmptyFieldRevealState();

                clearTimers();
                setState(nextState);

                openTimerRef.current = setTimeout(() => {
                    openTimerRef.current = null;
                    setState((current) => ({
                        ...current,
                        stage: 'open'
                    }));
                }, 20);

                closeTimerRef.current = setTimeout(() => {
                    closeTimerRef.current = null;
                    setState(createEmptyFieldRevealState());
                }, Math.max(700, Number(nextState.duration || 1400)));
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_FIELD_REVEAL', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    return <FieldRevealOverlayView state={state} />;
}

export default function FieldRevealOverlay(props) {
    return <MountedFieldRevealOverlay {...props} />;
}
