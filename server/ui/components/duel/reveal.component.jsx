import { getCardImageUrl } from '../../services/storage.service';
import React, { useEffect, useState } from 'react';
import AppImage from '../common/app-image';
import styles from './reveal.component.module.scss';

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

function createEmptyRevealerState() {
    return {
        active: false,
        cards: [],
        mode: 'select',
        dismissable: true
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function getRevealSelectionMarker(state, index) {
    if (state.mode === 'sort') {
        const order = Array.isArray(state.selectionOrder) ? state.selectionOrder.indexOf(index) : -1;
        return order >= 0 ? String(order + 1) : '';
    }

    if (state.mode === 'counter') {
        const allocation = Array.isArray(state.counterAllocations)
            ? Number(state.counterAllocations[index] || 0)
            : 0;
        return allocation > 0 ? String(allocation) : '';
    }

    return '';
}

export function getRevealCardClassName(state, card, index) {
    const classNames = ['reveal-card'];
    if (card?.selected) {
        classNames.push('selected');
    }
    if (state.mode === 'sort' && Array.isArray(state.selectionOrder) && state.selectionOrder.includes(index)) {
        classNames.push('ordered');
    }
    if (state.mode === 'counter' && Number(Array.isArray(state.counterAllocations) ? state.counterAllocations[index] : 0) > 0) {
        classNames.push('allocated');
    }
    return classNames.join(' ');
}

export function getRevealCoordinateLabel(card) {
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

export function clickRevealCard(store, state, selected, option, closeDialog, event) {
    event?.stopPropagation?.();

    if (state.mode === 'sort') {
        store?.emit?.({ action: 'REVEAL_SORT_CLICK', option, selected });
        store?.emit?.({ action: 'RENDER' });
        return;
    }

    if (state.mode === 'counter') {
        store?.emit?.({ action: 'REVEAL_COUNTER_CLICK', option, direction: 1 });
        store?.emit?.({ action: 'RENDER' });
        return;
    }

    closeDialog();
    store?.emit?.({ action: 'REVEAL_CARD_CLICK', option, selected });
    store?.emit?.({ action: 'RENDER' });
}

export function decrementRevealCounter(store, option, event) {
    event.preventDefault();
    event.stopPropagation();
    store?.emit?.({ action: 'REVEAL_COUNTER_CLICK', option, direction: -1 });
    store?.emit?.({ action: 'RENDER' });
}

export function confirmReveal(store, event) {
    event?.stopPropagation?.();
    store?.emit?.({ action: 'REVEAL_CONFIRM' });
}

export function resetReveal(store, event) {
    event?.stopPropagation?.();
    store?.emit?.({ action: 'REVEAL_RESET' });
    store?.emit?.({ action: 'RENDER' });
}

export function manualRevealClick(store, card, event) {
    event.stopPropagation();
    card.status = 'revealed';
    app.duel.controls.enable(card, { x: event.pageX, y: event.pageY });
    store?.emit?.({ action: 'RENDER' });
}

export function triggerRevealer(target, state) {
    resolveDialogStore(target)?.emit?.({
        action: 'OPEN_REVEALER',
        state: {
            ...createEmptyRevealerState(),
            ...state,
            dismissable: state?.dismissable !== undefined ? Boolean(state.dismissable) : true,
            active: true
        }
    });
}

export function closeRevealer(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_REVEALER' });
}

export function disposeRevealer(target) {
    closeRevealer(target);
}

function RevealCard({ card, index, state, store, closeDialog }) {
    const src = getCardImageUrl(card.id || card.code),
        onClick = app.manual
            ? (event) => manualRevealClick(store, card, event)
            : (event) => clickRevealCard(store, state, card.selected, index, closeDialog, event),
        marker = getRevealSelectionMarker(state, index),
        available = Number(card?.count || 0),
        allocated = Array.isArray(state.counterAllocations) ? Number(state.counterAllocations[index] || 0) : 0,
        coordinateLabel = getRevealCoordinateLabel(card);

    return (
        <div
            key={card.uid || card.id || index}
            className={getRevealCardClassName(state, card, index)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem'
            }}
        >
            <div
                className="reveal-card-frame"
                onClick={onClick}
                onContextMenu={state.mode === 'counter' ? (event) => decrementRevealCounter(store, index, event) : undefined}
            >
                {coordinateLabel
                    ? (
                        <div className="reveal-card-coordinate">
                            {coordinateLabel}
                        </div>
                    )
                    : null}
                <AppImage
                    className={card.selected ? 'selected' : ''}
                    src={src}
                    fallbackSrc='img/textures/unknown.jpg'
                    width={177}
                    height={254}
                    sizes='(max-width: 768px) 40vw, 177px'
                />
            </div>
            {marker
                ? (
                    <span className="reveal-marker">
                        {marker}
                    </span>
                )
                : null}
            {state.mode === 'counter'
                ? (
                    <span className="reveal-counter">
                        {`${allocated} / ${available}`}
                    </span>
                )
                : null}
        </div>
    );
}

function RevealControls({ state, store }) {
    if (state.mode !== 'sort' && state.mode !== 'counter') {
        return null;
    }

    const sortReady = state.mode === 'sort'
        && Array.isArray(state.selectionOrder)
        && state.selectionOrder.length === (Array.isArray(state.cards) ? state.cards.length : 0);
    const counterReady = state.mode === 'counter' && Number(state.remaining || 0) === 0;
    const canConfirm = sortReady || counterReady;
    const summary = state.mode === 'counter'
        ? `Remaining counters: ${Number(state.remaining || 0)}`
        : `Selected order: ${Array.isArray(state.selectionOrder) ? state.selectionOrder.length : 0} / ${Array.isArray(state.cards) ? state.cards.length : 0}`;

    return (
        <div
            id="revealcontrols"
            style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
            }}
        >
            <span>{summary}</span>
            <button
                id="revealerreset"
                onClick={(event) => resetReveal(store, event)}
            >
                Reset
            </button>
            <button
                id="revealerconfirm"
                disabled={!canConfirm}
                onClick={(event) => confirmReveal(store, event)}
            >
                Confirm
            </button>
        </div>
    );
}

export function RevealerView({ state, store, closeDialog }) {
    if (!state?.active) {
        return null;
    }

    return (
        <div
            onClick={(state.mode === 'select' && state.dismissable) ? closeDialog : undefined}
            className={styles.revealRoot}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}
            id="revealed"
            data-dismissable={state.dismissable ? 'true' : 'false'}
        >
            <div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                }}
            >
                {state.cards.map((card, index) => (
                    <RevealCard
                        card={card}
                        state={state}
                        store={store}
                        closeDialog={closeDialog}
                        index={index}
                        key={card.uid || card.id || index}
                    />
                ))}
            </div>
            <RevealControls state={state} store={store} />
        </div>
    );
}

export function MountedRevealer({ controller, store }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptyRevealerState);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const closeDialog = () => {
                setState(createEmptyRevealerState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_REVEALER', (message) => {
                setState({
                    ...createEmptyRevealerState(),
                    ...(message?.state || {}),
                    active: true
                });
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_REVEALER', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    return (
        <RevealerView
            state={state}
            store={resolvedStore}
            closeDialog={() => setState(createEmptyRevealerState())}
        />
    );
}

export default function Revealer(props) {
    return <MountedRevealer {...props} />;
}
