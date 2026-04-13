import { getCardImageUrl } from '../../services/storage.service';
import React, { useEffect, useState } from 'react';
import AppImage from '../common/app-image';
import { createSelectPositionAnswer } from '../../services/duel-response.service';
import styles from './position.component.module.scss';

const POSITION_OPTIONS = [
    { bit: 0x1, name: 'FaceUpAttack' },
    { bit: 0x2, name: 'FaceDownAttack' },
    { bit: 0x4, name: 'FaceUpDefence' },
    { bit: 0x8, name: 'FaceDownDefence' }
];

function createEmptySelectPositionState() {
    return {
        active: false,
        cards: []
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function resolveSelectablePositions(positions) {
    if (Array.isArray(positions)) {
        return positions.filter(Boolean);
    }

    if (typeof positions === 'string') {
        return [positions];
    }

    const mask = Number(positions);

    if (!Number.isFinite(mask) || mask <= 0) {
        return [];
    }

    return POSITION_OPTIONS
        .filter((entry) => (mask & entry.bit) === entry.bit)
        .map((entry) => entry.name);
}

export function triggerSelectPositionDialog(target, state) {
    const positions = resolveSelectablePositions(state?.positions),
        cards = positions.map((position) => {
            return {
                id: state?.id || state?.code,
                position,
                type: position
            };
        });

    resolveDialogStore(target)?.emit?.({
        action: 'OPEN_SELECT_POSITION_DIALOG',
        state: {
            active: cards.length > 0,
            cards
        }
    });
}

export function closeSelectPositionDialog(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_SELECT_POSITION_DIALOG' });
}

export function clickSelectPosition(store, closeDialog, position) {
    closeDialog();
    store?.emit?.({
        action: 'POSITION_CARD_CLICK',
        position: createSelectPositionAnswer(position.position || position.type)
    });
}

export function disposeSelectPositionDialog(target) {
    closeSelectPositionDialog(target);
}

function PositionOptionCard({ card, onClick }) {
    const src = getCardImageUrl(card.id);

    return <AppImage className={`card ${card.position}`} src={src} onClick={onClick} alt='' fallbackSrc='img/textures/unknown.jpg' width={177} height={254} sizes='(max-width: 768px) 40vw, 177px' />;
}

export function SelectPositionView({ state, onSelect }) {
    if (!state?.active) {
        return null;
    }

    return (
        <div
            className={styles.root}
            style={{
                display: 'flex'
            }}
            id='revealed'
        >
            {state.cards.map((card) => (
                <PositionOptionCard
                    key={`${card.id}-${card.position}`}
                    card={card}
                    onClick={() => onSelect(card)}
                />
            ))}
        </div>
    );
}

export function MountedSelectPosition({ controller, store }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptySelectPositionState);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const closeDialog = () => {
                setState(createEmptySelectPositionState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_SELECT_POSITION_DIALOG', (message) => {
                setState({
                    ...createEmptySelectPositionState(),
                    ...(message?.state || {})
                });
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_SELECT_POSITION_DIALOG', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    return (
        <SelectPositionView
            state={state}
            onSelect={(card) => clickSelectPosition(resolvedStore, () => setState(createEmptySelectPositionState()), card)}
        />
    );
}

export default function SelectPosition(props) {
    return <MountedSelectPosition {...props} />;
}
