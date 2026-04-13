import React, { useEffect, useMemo, useState } from 'react';
import {
    buildAnnounceCardChoices
} from '../../services/announce-card.service';
import {
    createAnnounceCardAnswer
} from '../../services/duel-response.service';
import styles from './announce.card.component.module.scss';

function createEmptyAnnounceCardDialogState() {
    return {
        active: false,
        query: '',
        opcodes: [],
        selectedCode: undefined
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function triggerAnnounceCardDialog(target, state) {
    resolveDialogStore(target)?.emit?.({
        action: 'OPEN_ANNOUNCE_CARD_DIALOG',
        state: {
            ...createEmptyAnnounceCardDialogState(),
            opcodes: Array.isArray(state?.opcodes) ? state.opcodes.slice() : [],
            active: true
        }
    });
}

export function closeAnnounceCardDialog(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_ANNOUNCE_CARD_DIALOG' });
}

export function submitAnnounceCardDialog(store, state, closeDialog) {
    if (!Number.isInteger(state.selectedCode)) {
        return;
    }

    const answer = createAnnounceCardAnswer(state.selectedCode);
    closeDialog();
    store?.emit?.({
        action: 'ANNOUNCE_SELECTION_CLICK',
        answer
    });
}

export function disposeAnnounceCardDialog(target) {
    closeAnnounceCardDialog(target);
}

export function AnnounceCardDialogView({ state, options, onQueryChange, onSelectOption, onSubmit }) {
    if (!state?.active) {
        return null;
    }

    return (
        <div
            id="announcecardbox"
            className={styles.root}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}
        >
            <label htmlFor="announcecardinput">Declare a card</label>
            <input
                id="announcecardinput"
                type="text"
                value={state.query}
                placeholder="Type a card name or passcode"
                onChange={onQueryChange}
            />
            <div
                id="announcecardresults"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '16rem',
                    overflowY: 'auto'
                }}
            >
                {options.length
                    ? options.map((option) => (
                        <button
                            type="button"
                            key={option.code}
                            id={`announcecardresult-${option.code}`}
                            onClick={() => onSelectOption(option)}
                            style={{
                                fontWeight: option.code === state.selectedCode ? 'bold' : 'normal'
                            }}
                        >
                            {option.label}
                        </button>
                    ))
                    : (
                        <div id="announcecardempty">No declarable cards found.</div>
                    )}
            </div>
            <button
                id="announcecardconfirm"
                disabled={!Number.isInteger(state.selectedCode)}
                onClick={onSubmit}
            >
                Confirm
            </button>
        </div>
    );
}

export function AnnounceCardDialog({ controller, store, database }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptyAnnounceCardDialogState),
        options = useMemo(() => {
            const nextOptions = buildAnnounceCardChoices(
                Array.isArray(database) ? database : [],
                state.opcodes,
                state.query
            );

            return nextOptions;
        }, [database, state.opcodes, state.query]);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const closeDialog = () => {
                setState(createEmptyAnnounceCardDialogState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_ANNOUNCE_CARD_DIALOG', (message) => {
                setState({
                    ...createEmptyAnnounceCardDialogState(),
                    ...(message?.state || {}),
                    active: true
                });
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_ANNOUNCE_CARD_DIALOG', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    useEffect(() => {
        if (!state.active) {
            return;
        }

        if (!options.some((option) => option.code === state.selectedCode)) {
            setState((current) => ({
                ...current,
                selectedCode: options[0]?.code ?? undefined
            }));
        }
    }, [options, state.active, state.selectedCode]);

    return (
        <AnnounceCardDialogView
            state={state}
            options={options}
            onQueryChange={(event) => {
                setState((current) => ({
                    ...current,
                    query: event?.target?.value || ''
                }));
            }}
            onSelectOption={(option) => {
                setState((current) => ({
                    ...current,
                    selectedCode: option?.code ?? undefined
                }));
                if (Number.isInteger(option?.code)) {
                    resolvedStore?.emit?.({
                        action: 'ANNOUNCE_CARD_PREVIEW',
                        id: option.code
                    });
                }
            }}
            onSubmit={() => submitAnnounceCardDialog(resolvedStore, state, () => setState(createEmptyAnnounceCardDialogState()))}
        />
    );
}

export default function MountedAnnounceCardDialog(props) {
    return <AnnounceCardDialog {...props} />;
}
