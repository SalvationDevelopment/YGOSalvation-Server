import { getCardImageUrl } from '../../services/storage.service';
import React, { useEffect, useRef, useState } from 'react';
import AppImage from '../common/app-image';
import styles from './anouncement.component.module.scss';

function createEmptyFlasherState() {
    return {
        active: false
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function triggerFlasher(target, state = {}) {
    const resolvedStore = resolveDialogStore(target);

    if (!resolvedStore) {
        return;
    }

    resolvedStore.emit({
        action: 'OPEN_FLASHER',
        state: {
            ...state,
            active: true,
            duration: Math.max(120, Number(state?.duration || 500))
        }
    });
}

export function disposeFlasher(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_FLASHER' });
}

export function FlasherView({ state }) {
    if (!state?.active) {
        return null;
    }

    const src = getCardImageUrl(state.id),
        children = [
            <AppImage className='mainimage' src={src} key='mainimage' alt='' width={421} height={614} sizes='70vh' style={{ width: 'auto', height: '70vh' }} />
        ];

    if (state.sourceAnchor && Number.isFinite(state.sourceAnchor.x) && Number.isFinite(state.sourceAnchor.y)) {
        children.push(
            <div
                className='effectflash-source-beacon'
                data-source-beacon='true'
                key='source-beacon'
                style={{
                    left: `${state.sourceAnchor.x}px`,
                    top: `${state.sourceAnchor.y}px`
                }}
            />
        );
    }

    return (
        <div
            className={`${state.mode ? `effectflasher mode-${state.mode}` : 'effectflasher'} ${styles.root}`}
            style={{
                display: 'block'
            }}
            data-mode={state.mode || 'legacy_preview'}
            id='effectflasher'
        >
            {children}
        </div>
    );
}

export function MountedFlasher({ controller, store }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptyFlasherState),
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
                setState(createEmptyFlasherState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_FLASHER', (message) => {
                clearCloseTimer();
                setState(message?.state || createEmptyFlasherState());
                closeTimerRef.current = setTimeout(() => {
                    closeTimerRef.current = null;
                    setState(createEmptyFlasherState());
                }, Math.max(120, Number(message?.state?.duration || 500)));
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_FLASHER', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    return <FlasherView state={state} />;
}

export default function Flasher(props) {
    return <MountedFlasher {...props} />;
}
