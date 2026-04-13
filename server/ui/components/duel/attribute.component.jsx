import React, { useEffect, useState } from 'react';
import styles from './attribute.component.module.scss';
import {
    createAnnounceAttributeAnswer,
    createAnnounceNumberAnswer,
    createAnnounceRaceAnswer
} from '../../services/duel-response.service';

function createEmptySelectAttributesState() {
    return {
        active: false,
        value: undefined,
        options: undefined,
        text: undefined,
        responseType: undefined
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function getSelectAttributeNumberChoices(state) {
    const values = state?.options;

    if (Array.isArray(values)) {
        return values.map((value, index) => {
            const normalizedValue = Number(value);

            return {
                key: `number-${index}-${normalizedValue}`,
                label: String(normalizedValue),
                value: normalizedValue
            };
        });
    }

    if (!values || typeof values !== 'object') {
        return [];
    }

    return Object.entries(values).map(([key, value], index) => {
        const numericValue = Number(value);

        return {
            key: `number-${index}-${key}`,
            label: String(Number.isFinite(numericValue) ? numericValue : key),
            value: Number.isFinite(numericValue) ? numericValue : Number(key)
        };
    }).filter((choice) => Number.isFinite(choice.value));
}

export function triggerSelectAttributesDialog(target, state) {
    resolveDialogStore(target)?.emit?.({
        action: 'OPEN_SELECT_ATTRIBUTES_DIALOG',
        state: {
            ...createEmptySelectAttributesState(),
            ...state,
            active: true
        }
    });
}

export function closeSelectAttributesDialog(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_SELECT_ATTRIBUTES_DIALOG' });
}

export function submitSelectAttributes(store, state, closeDialog) {
    if (state.value === undefined) {
        return;
    }

    const selectedValue = state.value,
        responseType = state.responseType;

    closeDialog();
    let answer;
    switch (responseType) {
        case 'MSG_ANNOUNCE_RACE':
            answer = createAnnounceRaceAnswer([selectedValue]);
            break;
        case 'MSG_ANNOUNCE_ATTRIB':
            answer = createAnnounceAttributeAnswer([selectedValue]);
            break;
        default:
            answer = createAnnounceNumberAnswer(selectedValue);
            break;
    }
    store?.emit?.({
        action: 'ANNOUNCE_SELECTION_CLICK',
        answer
    });
}

export function disposeSelectAttributes(target) {
    closeSelectAttributesDialog(target);
}

export function SelectAttributesView({ state, onChange, onSubmit }) {
    if (!state?.active) {
        return null;
    }

    if (state.responseType === 'MSG_ANNOUNCE_NUMBER') {
        const choices = getSelectAttributeNumberChoices(state);

        return (
            <div className={`announceSelectDialog ${styles.root}`}>
                <div>{`Select ${state.text}`}</div>
                <div className="announceNumberChoices">
                    {choices.map((choice) => (
                        <label
                            className="announceNumberChoice"
                            key={choice.key}
                        >
                            <input
                                checked={Number(state.value) === choice.value}
                                id={`announce-number-${choice.value}`}
                                name="announcevalue"
                                onChange={() => onChange(choice.value, choice.value)}
                                type="radio"
                                value={choice.value}
                            />
                            <span data-announcement-value={String(choice.value)}>
                                {choice.label}
                            </span>
                        </label>
                    ))}
                </div>
                <button
                    data-role="announce-confirm"
                    disabled={!Number.isFinite(Number(state.value))}
                    onClick={onSubmit}
                >
                    Select
                </button>
            </div>
        );
    }

    const boxes = [];
    for (const option in state.options) {
        boxes.push(
            <div className="selectCheck" key={option}>
                <label>{option}</label>
                <input
                    name="announcevalue"
                    type="checkbox"
                    onChange={() => onChange(option, state.options[option])}
                />
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div>{`Select ${state.text}`}</div>
            <div>{boxes}</div>
            <button onClick={onSubmit}>Select</button>
        </div>
    );
}

export function MountedSelectAttributes({ controller, store }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptySelectAttributesState);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const closeDialog = () => {
                setState(createEmptySelectAttributesState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_SELECT_ATTRIBUTES_DIALOG', (message) => {
                setState({
                    ...createEmptySelectAttributesState(),
                    ...(message?.state || {}),
                    active: true
                });
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_SELECT_ATTRIBUTES_DIALOG', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    return (
        <SelectAttributesView
            state={state}
            onChange={(option, value) => {
                setState((current) => ({
                    ...current,
                    value: value ?? option
                }));
            }}
            onSubmit={() => submitSelectAttributes(resolvedStore, state, () => setState(createEmptySelectAttributesState()))}
        />
    );
}

export default function SelectAttributes(props) {
    return <MountedSelectAttributes {...props} />;
}
