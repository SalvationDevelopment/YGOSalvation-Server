import React, { useEffect, useRef, useState } from 'react';
import AppImage from '../common/app-image';
import styles from './attack.animation.component.module.scss';

function createEmptyAttackAnimationState() {
    return {
        active: false,
        from: undefined,
        to: undefined,
        stage: 'idle'
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function triggerAttackAnimation(target, state = {}) {
    const resolvedStore = resolveDialogStore(target);

    if (!resolvedStore) {
        return;
    }

    resolvedStore.emit({
        action: 'OPEN_ATTACK_ANIMATION',
        state: {
            active: true,
            from: state.from ?? undefined,
            to: state.to ?? undefined,
            stage: 'priming',
            duration: Math.max(300, Number(state.duration || 720))
        }
    });
}

export function disposeAttackAnimation(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_ATTACK_ANIMATION' });
}

export function AttackAnimationLayerView({ state }) {
    if (!state) {
        return null;
    }

    const from = state.from,
        to = state.to;

    if (!state.active || !from || !to) {
        return null;
    }

    const deltaX = Number(to.x || 0) - Number(from.x || 0),
        deltaY = Number(to.y || 0) - Number(from.y || 0),
        distance = Math.max(48, Math.hypot(deltaX, deltaY)),
        angle = Math.atan2(deltaY, deltaX),
        style = {
            left: `${Number(from.x || 0)}px`,
            top: `${Number(from.y || 0)}px`,
            width: state.stage === 'travel' ? `${distance}px` : '0px',
            opacity: state.stage === 'travel' ? 1 : 0.15,
            position: 'fixed',
            pointerEvents: 'none',
            transform: `translateY(-50%) rotate(${angle}rad)`,
            transformOrigin: '0 50%'
        };

    return (
        <div
            id='attackanimation'
            key='attackanimation'
            className={styles.attackAnimationLayer}
            style={style}
        >
            <AppImage
                alt=''
                aria-hidden='true'
                src='/img/textures/attack.png'
                width={256}
                height={24}
                style={{
                    width: '100%',
                    height: '24px',
                    objectFit: 'fill',
                    display: 'block'
                }}
            />
        </div>
    );
}

export function MountedAttackAnimationLayer({ controller, store }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptyAttackAnimationState),
        stageTimerRef = useRef(null),
        closeTimerRef = useRef(null);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const clearTimers = () => {
                if (stageTimerRef.current) {
                    clearTimeout(stageTimerRef.current);
                    stageTimerRef.current = null;
                }
                if (closeTimerRef.current) {
                    clearTimeout(closeTimerRef.current);
                    closeTimerRef.current = null;
                }
            },
            closeDialog = () => {
                clearTimers();
                setState(createEmptyAttackAnimationState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_ATTACK_ANIMATION', (message) => {
                const nextState = message?.state || createEmptyAttackAnimationState();

                clearTimers();
                setState(nextState);

                stageTimerRef.current = setTimeout(() => {
                    stageTimerRef.current = null;
                    setState((current) => ({
                        ...current,
                        stage: 'travel'
                    }));
                }, 20);

                closeTimerRef.current = setTimeout(() => {
                    closeTimerRef.current = null;
                    setState(createEmptyAttackAnimationState());
                }, Math.max(300, Number(nextState.duration || 720)));
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_ATTACK_ANIMATION', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    return <AttackAnimationLayerView state={state} />;
}

export default function AttackAnimationLayer(props) {
    return <MountedAttackAnimationLayer {...props} />;
}
