import React, { useEffect, useRef, useState } from 'react';
import styles from './phase.banner.component.module.scss';

function createEmptyPhaseBannerState() {
    return {
        active: false,
        text: '',
        token: 0
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function triggerPhaseBanner(target, state = {}) {
    const resolvedStore = resolveDialogStore(target);

    if (!resolvedStore) {
        return;
    }

    resolvedStore.emit({
        action: 'OPEN_PHASE_BANNER',
        state: {
            active: true,
            text: state.text || '',
            token: Date.now(),
            duration: Math.max(2400, Number(state.duration || 2400))
        }
    });
}

export function disposePhaseBanner(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_PHASE_BANNER' });
}

export function PhaseBannerView({ active, text, token }) {
    if (!active || !text) {
        return null;
    }

    return (
        <div
            className={`phaseindicatorslide animated ${styles.root}`}
            data-token={token}
            key={`phase-banner-${token}`}
        >
            <div
                className='phaseindicatorslidecopy'
                key={`phase-banner-copy-${token}`}
            >
                {text}
            </div>
        </div>
    );
}

export function MountedPhaseBanner({ controller, store }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptyPhaseBannerState),
        closeTimerRef = useRef(null);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const clearCloseTimer = () => {
                if (closeTimerRef.current) {
                    clearTimeout(closeTimerRef.current);
                    closeTimerRef.current = null;
                }
            },
            closeDialog = () => {
                clearCloseTimer();
                setState(createEmptyPhaseBannerState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_PHASE_BANNER', (message) => {
                const nextState = message?.state || createEmptyPhaseBannerState();

                clearCloseTimer();
                setState(nextState);
                closeTimerRef.current = setTimeout(() => {
                    closeTimerRef.current = null;
                    setState((current) => ({
                        ...current,
                        active: false
                    }));
                }, Math.max(2400, Number(nextState.duration || 2400)));
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_PHASE_BANNER', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    return (
        <PhaseBannerView
            active={state.active}
            text={state.text}
            token={state.token}
        />
    );
}

export default function PhaseBanner(props) {
    return <MountedPhaseBanner {...props} />;
}
