import { getCardImageUrl } from '../../services/storage.service';
import React, { useEffect, useState } from 'react';
import AppImage from '../common/app-image';
import styles from './view_decks.component.module.scss';

function createEmptyDeckDialogState() {
    return {
        active: false,
        deck: []
    };
}

function resolveDialogStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

export function clickDeckDialogCard(store, closeDialog, card, event) {
    closeDialog();
    store?.emit?.({ action: 'DECK_CARD_CLICK', card, y: event.pageY, x: event.pageX });
}

export function closeDeckDialog(target) {
    resolveDialogStore(target)?.emit?.({ action: 'CLOSE_DECK_DIALOG' });
}

export function disposeDeckDialog(target) {
    closeDeckDialog(target);
}

function DeckDialogCard({ card, index, onClick }) {
    const src = getCardImageUrl(card.id || card.code);

    return (
        <AppImage
            key={`deck-dialog-${card.uid || card.id || card.code || 'card'}-${card.player ?? 'x'}-${card.location || 'unknown'}-${card.index ?? index}-${index}`}
            className={[
                card.selected ? 'selected' : '',
                card.actionable ? 'actionable' : ''
            ].filter(Boolean).join(' ')}
            data-actionable={card.actionable ? 'true' : 'false'}
            src={src}
            onClick={onClick}
            fallbackSrc='img/textures/unknown.jpg'
            width={177}
            height={254}
            sizes='(max-width: 768px) 40vw, 177px'
        />
    );
}

export function DeckDialogView({ state, onCardClick }) {
    if (!state?.active || !state.deck.length) {
        return null;
    }

    return (
        <div
            id="revealed"
            className={styles.deckDialogRoot}
            style={{
                display: 'block'
            }}
        >
            {state.deck.map((card, index) => (
                <DeckDialogCard
                    card={card}
                    index={index}
                    key={`deck-dialog-${card.uid || card.id || card.code || 'card'}-${card.player ?? 'x'}-${card.location || 'unknown'}-${card.index ?? index}-${index}`}
                    onClick={(event) => onCardClick(card, event)}
                />
            ))}
        </div>
    );
}

export function MountedDeckDialog({ controller, store }) {
    const resolvedStore = resolveDialogStore(store || controller),
        [state, setState] = useState(createEmptyDeckDialogState);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const closeDialog = () => {
                setState(createEmptyDeckDialogState());
            },
            unsubscribeOpen = resolvedStore.on('OPEN_DECK', (message) => {
                setState({
                    active: true,
                    deck: Array.isArray(message.deck) ? message.deck : []
                });
            }),
            unsubscribeClose = resolvedStore.on('CLOSE_DECK_DIALOG', () => {
                closeDialog();
            });

        return () => {
            unsubscribeOpen?.();
            unsubscribeClose?.();
            closeDialog();
        };
    }, [resolvedStore]);

    return (
        <DeckDialogView
            state={state}
            onCardClick={(card, event) => clickDeckDialogCard(resolvedStore, () => setState(createEmptyDeckDialogState()), card, event)}
        />
    );
}

export default function DeckDialog(props) {
    return <MountedDeckDialog {...props} />;
}
