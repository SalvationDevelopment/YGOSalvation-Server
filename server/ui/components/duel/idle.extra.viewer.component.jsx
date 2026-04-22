import { getCardImageUrl } from '../../services/storage.service';
import React, { useEffect, useState } from 'react';
import AppImage from '../common/app-image';
import styles from './idle.extra.viewer.component.module.scss';

const REVEAL_LOCATION_LABELS = Object.freeze({
    BANISHED: 'Banished',
    DECK: 'Deck',
    EXTRA: 'Extra Deck',
    EXCAVATED: 'Excavated',
    FZONE: 'Field Zone',
    GRAVE: 'Graveyard',
    HAND: 'Hand',
    MONSTERZONE: 'Monster Zone',
    ONFIELD: 'Field',
    OVERLAY: 'Overlay Unit',
    PZONE: 'Pendulum Zone',
    SPELLZONE: 'Spell & Trap Zone'
});

const VIEWER_MODE_LABELS = Object.freeze({
    activate: 'Activate',
    spsummon: 'Special Summon',
    view: 'View'
});

function resolveViewerMode(mode) {
    return ['activate', 'spsummon', 'view'].includes(mode) ? mode : 'view';
}

function createEmptyIdleExtraDeckViewerState() {
    return {
        active: false,
        mode: 'view',
        deck: []
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function getIdleExtraDeckViewerCoordinateLabel(card) {
    if (!card || typeof card !== 'object') {
        return '';
    }

    const location = typeof card.location === 'string'
            ? REVEAL_LOCATION_LABELS[card.location] || card.location
            : null,
        index = Number(card.index),
        owner = Number(card.player);

    if (!location || !Number.isInteger(index)) {
        return '';
    }

    const prefix = owner === 0
        ? 'Your'
        : owner === 1
            ? 'Opponent\'s'
            : '';

    return `${prefix ? `${prefix} ` : ''}${location} ${index + 1}`;
}

export function closeIdleExtraDeckViewer(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_IDLE_EXTRA_VIEWER' });
}

export function disposeIdleExtraDeckViewer(target) {
    closeIdleExtraDeckViewer(target);
}

export function clickIdleExtraDeckViewerCard(store, state, closeDialog, card, event) {
    event?.stopPropagation?.();
    if (state.mode === 'view') {
        return;
    }

    const answerCard = card?.viewerAnswer || card;
    store?.emit?.({ action: 'CONTROL_CLICK', card: answerCard });
    closeDialog();
}

function IdleExtraDeckViewerCard({ card, index, state, store, closeDialog }) {
    const key = `idle-extra-${card.uid || card.id || card.code || 'card'}-${card.player ?? 'x'}-${card.location || 'unknown'}-${card.index ?? index}-${index}`,
        src = getCardImageUrl(card.id || card.code),
        coordinateLabel = getIdleExtraDeckViewerCoordinateLabel(card);

    return (
        <div
            key={key}
            className="reveal-card"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem'
            }}
        >
            <div
                className="reveal-card-frame"
                onClick={(event) => clickIdleExtraDeckViewerCard(store, state, closeDialog, card, event)}
            >
                {coordinateLabel
                    ? (
                        <div className="reveal-card-coordinate">
                            {coordinateLabel}
                        </div>
                    )
                    : null}
                <AppImage
                    className={card.actionable ? 'actionable' : ''}
                    data-actionable={card.actionable ? 'true' : 'false'}
                    src={src}
                    fallbackSrc='img/textures/unknown.jpg'
                    width={177}
                    height={254}
                    sizes='(max-width: 768px) 40vw, 177px'
                />
            </div>
        </div>
    );
}

export function IdleExtraDeckViewerView({ state, store, closeDialog }) {
    if (!state?.active || !state.deck.length) {
        return null;
    }

    return (
        <div
            className={styles.root}
            id="revealed"
            data-mode={state.mode}
            onClick={closeDialog}
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                gap: '0.75rem'
            }}
        >
            <div className="reveal-header">
                <div className="reveal-mode-label">
                    {VIEWER_MODE_LABELS[state.mode] || VIEWER_MODE_LABELS.view}
                </div>
                <button
                    type="button"
                    className="reveal-close"
                    aria-label="Close viewer"
                    title="Close"
                >
                    X
                </button>
            </div>
            <div
                onClick={(event) => event.stopPropagation()}
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start'
                }}
            >
                {state.deck.map((card, index) => (
                    <IdleExtraDeckViewerCard
                        card={card}
                        state={state}
                        store={store}
                        closeDialog={closeDialog}
                        index={index}
                        key={`idle-extra-${card.uid || card.id || card.code || 'card'}-${card.player ?? 'x'}-${card.location || 'unknown'}-${card.index ?? index}-${index}`}
                    />
                ))}
            </div>
        </div>
    );
}

export function MountedIdleExtraDeckViewer({ controller, store }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptyIdleExtraDeckViewerState);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const closeDialog = () => {
                setState(createEmptyIdleExtraDeckViewerState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_IDLE_EXTRA_VIEWER', (message) => {
                setState({
                    active: true,
                    deck: Array.isArray(message.deck) ? message.deck : [],
                    mode: resolveViewerMode(message.mode)
                });
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_IDLE_EXTRA_VIEWER', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    return (
        <IdleExtraDeckViewerView
            state={state}
            store={resolvedStore}
            closeDialog={() => setState(createEmptyIdleExtraDeckViewerState())}
        />
    );
}

export default function IdleExtraDeckViewer(props) {
    return <MountedIdleExtraDeckViewer {...props} />;
}
