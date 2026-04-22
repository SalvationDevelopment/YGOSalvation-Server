import React, { useEffect, useState } from 'react';
import { createSelectOptionAnswer } from '../../services/duel-response.service';
import styles from './select.option.component.module.scss';

function createEmptySelectOptionDialogState() {
    return {
        active: false,
        options: [],
        selectedIndex: 0
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function triggerSelectOptionDialog(target, state) {
    const options = Array.isArray(state?.options) ? state.options : [];

    resolveDialogStore(target)?.emit?.({
        action: 'OPEN_SELECT_OPTION_DIALOG',
        state: {
            ...createEmptySelectOptionDialogState(),
            ...state,
            options,
            selectedIndex: options.length ? Number(state?.selectedIndex ?? options[0]?.i ?? 0) : 0,
            active: true
        }
    });
}

export function closeSelectOptionDialog(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_SELECT_OPTION_DIALOG' });
}

export function submitSelectOptionDialog(store, state, closeDialog) {
    closeDialog();
    store?.emit?.({
        action: 'SELECT_OPTION_CLICK',
        answer: createSelectOptionAnswer(state.selectedIndex)
    });
}

export function disposeSelectOptionDialog(target) {
    closeSelectOptionDialog(target);
}

export function SelectOptionDialogView({ state, onChange, onSubmit }) {
    if (!state?.active) {
        return null;
    }

    return (
        <div
            className={styles.root}
            id="selectoptionbox"
            style={{
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <label htmlFor="duelselectoption">Select an option</label>
            <select
                id="duelselectoption"
                value={String(state.selectedIndex)}
                onChange={onChange}
            >
                {state.options.map((option, index) => (
                    <option
                        key={option?.key || option?.i || index}
                        value={String(option?.i ?? index)}
                    >
                        {option?.label || `Option ${index + 1}`}
                    </option>
                ))}
            </select>
            <button
                id="duelselectoptionconfirm"
                onClick={onSubmit}
            >
                Confirm
            </button>
        </div>
    );
}

export function MountedSelectOptionDialog({ controller, store }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptySelectOptionDialogState);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const closeDialog = () => {
                setState(createEmptySelectOptionDialogState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_SELECT_OPTION_DIALOG', (message) => {
                setState({
                    ...createEmptySelectOptionDialogState(),
                    ...(message?.state || {}),
                    active: true
                });
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_SELECT_OPTION_DIALOG', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    return (
        <SelectOptionDialogView
            state={state}
            onChange={(event) => {
                setState((current) => ({
                    ...current,
                    selectedIndex: Number(event?.target?.value || 0)
                }));
            }}
            onSubmit={() => submitSelectOptionDialog(resolvedStore, state, () => setState(createEmptySelectOptionDialogState()))}
        />
    );
}

export default function SelectOptionDialog(props) {
    return <MountedSelectOptionDialog {...props} />;
}
