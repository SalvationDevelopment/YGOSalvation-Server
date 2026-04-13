import React, { useEffect, useState } from 'react';
import { createSelectYesNoAnswer } from '../../services/duel-response.service';
import styles from './yesno.component.module.scss';

function createEmptyYesNoDialogState() {
    return {
        active: false,
        promptText: '',
        yesLabel: 'Yes',
        noLabel: 'No',
        onYes: undefined,
        onNo: undefined
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function triggerYesNoDialog(target, state = {}) {
    resolveDialogStore(target)?.emit?.({
        action: 'OPEN_YESNO_DIALOG',
        state: {
            ...createEmptyYesNoDialogState(),
            ...state,
            active: true
        }
    });
}

export function closeYesNoDialog(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_YESNO_DIALOG' });
}

export function clickYesNoDialog(store, state, closeDialog, option) {
    const onYes = state.onYes,
        onNo = state.onNo;

    closeDialog();

    if (option && typeof onYes === 'function') {
        onYes();
        return;
    }

    if (!option && typeof onNo === 'function') {
        onNo();
        return;
    }

    store?.emit?.({
        action: 'YESNO_CLICK',
        option: createSelectYesNoAnswer(option)
    });
}

export function disposeYesNoDialog(target) {
    closeYesNoDialog(target);
}

export function YesNoDialogView({ state, onSelect }) {
    if (!state?.active) {
        return null;
    }

    return (
        <div
            className={styles.yesNoRoot}
            style={{
                display: 'flex'
            }}
            id='yesnobox'
        >
            <p
                key='prompt'
                style={{
                    whiteSpace: 'pre-line'
                }}
            >
                {state.promptText || 'Use effect?'}
            </p>
            <div key='actions'>
                <button onClick={() => onSelect(true)} key='yes'>
                    {state.yesLabel || 'Yes'}
                </button>
                <button onClick={() => onSelect(false)} key='no'>
                    {state.noLabel || 'No'}
                </button>
            </div>
        </div>
    );
}

export function MountedYesNoDialog({ controller, store }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptyYesNoDialogState);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const closeDialog = () => {
                setState(createEmptyYesNoDialogState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_YESNO_DIALOG', (message) => {
                setState({
                    ...createEmptyYesNoDialogState(),
                    ...(message?.state || {}),
                    active: true
                });
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_YESNO_DIALOG', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    return (
        <YesNoDialogView
            state={state}
            onSelect={(option) => clickYesNoDialog(resolvedStore, state, () => setState(createEmptyYesNoDialogState()), option)}
        />
    );
}

export default function YesNoDialog(props) {
    return <MountedYesNoDialog {...props} />;
}
