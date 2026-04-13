import React from 'react';
import AppImage from '../common/app-image';
import styles from './lobby.component.module.scss';

const LAST_SELECTED_DECK_KEY = 'ygopro:lastSelectedDeckIndex';

function getStoredSelectedDeckIndex() {
    if (typeof window === 'undefined') {
        return 0;
    }

    const rawValue = window.localStorage.getItem(LAST_SELECTED_DECK_KEY),
        parsedValue = Number(rawValue);

    return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
}

function storeSelectedDeckIndex(index) {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(LAST_SELECTED_DECK_KEY, String(index));
}

function getDeckValue(lobby) {
    const deck = lobby.state.decks[lobby.state.selectedDeck];
    if (!deck) {
        return null;
    }

    function toCardId(card) {
        if (typeof card === 'number' && Number.isFinite(card)) {
            return card;
        }

        if (typeof card === 'string' && card.trim()) {
            const parsed = Number(card);
            return Number.isFinite(parsed) ? parsed : null;
        }

        if (card && typeof card === 'object') {
            const parsed = Number(card.id);
            return Number.isFinite(parsed) ? parsed : null;
        }

        return null;
    }

    function mapDeckZone(cards) {
        if (!Array.isArray(cards)) {
            return [];
        }

        return cards
            .map(toCardId)
            .filter((cardId) => Number.isFinite(cardId) && cardId > 0);
    }

    return {
        main: mapDeckZone(deck.main),
        side: mapDeckZone(deck.side),
        extra: mapDeckZone(deck.extra)
    };
}

function slotElement(lobby, player) {
    if (lobby.state.mode !== 'Tag' && player > 2) {
        return '';
    }

    const p = lobby.state.player[player - 1],
        username = typeof p?.username === 'string' ? p.username : '',
        avatar = (p && p.avatar) ? p.avatar : '',
        points = Number.isFinite(Number(p?.points)) ? Number(p.points) : 0,
        elo = Number.isFinite(Number(p?.elo)) ? Number(p.elo) : 1200,
        rating = (p && p.username) ? `Points: ${points} | Rating: ${elo}` : 'Open slot',
        lock = (p) ? p.ready : false;

    return (
        <div id={`slot${player}`} className='slot' key={`slot-${player}`}>
            {avatar ? (
                <AppImage className='avatar' src={avatar} alt={username || `Open slot ${player}`} fallbackSrc='../img/textures/cover.jpg' width={56} height={56} style={{ width: '3.5rem', height: '5.5vh', objectFit: 'cover' }} />
            ) : (
                <div className='avatar placeholder' data-slot={player}>
                    {username ? username.charAt(0).toUpperCase() : ''}
                </div>
            )}
            <div className='lobbyrating'>{rating}</div>
            <div className='kickbutton' onClick={() => lobby.kickDuelist(player)}>X</div>
            <input id={`player${player}lobbyslot`} placeholder='empty slot' value={username} readOnly />
            <div className='lockindicator' onClick={() => lobby.lock(player)} data-state={lock} />
        </div>
    );
}

function currentDeckElement(lobby) {
    if (!lobby.state.decks.length) {
        return (
            <div id='lobbycurrentdeck'>
                Select Deck :
                <select className='currentdeck' disabled>
                    <option value=''>Loading decks...</option>
                </select>
            </div>
        );
    }

    return (
        <div id='lobbycurrentdeck'>
            Select Deck :
            <select
                className='currentdeck'
                value={String(lobby.state.selectedDeck)}
                onChange={lobby.deckSelect}
            >
                {lobby.state.decks.map((deck, index) => (
                    <option key={index} value={index}>{deck.name}</option>
                ))}
            </select>
        </div>
    );
}

function aiMetadataElement(lobby) {
    const aiName = typeof lobby.state.aiName === 'string' && lobby.state.aiName.trim()
        ? lobby.state.aiName.trim()
        : (typeof lobby.state.opponentName === 'string' && lobby.state.opponentName.trim()
            ? lobby.state.opponentName.trim()
            : '');

    if (!aiName) {
        return '';
    }

    return [
        <br key='lobby-ai-break' />,
        <span id='translateaiopponent' key='translateaiopponent'>AI Opponent</span>,
        <span id='lobbyainame' key='lobbyainame'>{aiName}</span>
    ];
}

export function LobbyScreen({ lobby }) {
    console.log('lobby render', lobby.state.banlist);

    return (
        <div className={styles.root} id='lobbymenu'>
            <div id='duelspectate'>
                <span id='lobbygotoduel' onClick={lobby.start}>Duel</span>
                <span id='lobbygotospectate' onClick={lobby.spectate}>Spectate</span>
                {slotElement(lobby, 1)}
                {slotElement(lobby, 2)}
                {slotElement(lobby, 3)}
                {slotElement(lobby, 4)}
            </div>
            <div id='lobbygameinfo'>
                <span id='judgetxt'>Judge</span>
                <span id='lobbyauto'>{lobby.state.automatic}</span>
                <br />
                <span id='competitiontxt'>Competition</span>
                <span id='lobbyranked'>{lobby.state.ranked}</span>
                <br />
                <span id='translatefl'>Forbidden List</span>
                <span id='lobbyflist'>{lobby.state.banlist}</span>
                <br />
                <span id='translateacp'>Allowed Card Pool</span>
                <span id='lobbyallowed'>{lobby.state.allowedCardsLabel}</span>
                <br />
                <span id='translategamemode'>Game Mode</span>
                <span id='lobbygamemode'>{lobby.state.mode}</span>
                <br />
                <span id='translatestartinglifepoints'>Starting Lifepoints</span>
                <span id='lobbylp'>{lobby.state.startingLP}</span>
                {aiMetadataElement(lobby)}
            </div>
            {currentDeckElement(lobby)}
        </div>
    );
}

export function createLobbyScreen(store, chat, ws) {
    const lobby = {
        ws,
        store,
        sidechat: chat,
        state: {
            decks: [],
            selectedDeck: getStoredSelectedDeckIndex()
        },
        start: () => {
            

            if (!lobby.deck) {
                return;
            }

            const slotIndex = Number.isInteger(lobby.state.slot) ? lobby.state.slot : 0,
                player = lobby.state.player?.[slotIndex],
                alreadyReady = Boolean(player?.ready);

            if (!alreadyReady) {
                lobby.ws.write({
                    action: 'lock',
                    deck: lobby.deck
                });
            }

            lobby.ws.write({
                action: 'determine'
            });
        },
        spectate: () => {
            lobby.ws.write({
                action: 'spectate'
            });
        },
        kickDuelist: (player) => {
            lobby.ws.write({
                action: 'kick',
                slot: player
            });
        },
        leave: () => {
            lobby.ws.write({
                action: 'leave'
            });
        },
        lock: () => {
            if (!lobby.deck) {
                return;
            }

            lobby.ws.write({
                action: 'lock',
                deck: lobby.deck
            });
        },
        deckSelect: (event) => {
            lobby.state.selectedDeck = Number(event.currentTarget.value) || 0;
            storeSelectedDeckIndex(lobby.state.selectedDeck);
            lobby.store?.emit?.({
                action: 'RENDER'
            });
        },
        update: (update) => {
            Object.assign(lobby.state, update);
            if (!lobby.state.decks.length) {
                lobby.state.selectedDeck = 0;
            } else if (!Number.isInteger(lobby.state.selectedDeck) || lobby.state.selectedDeck >= lobby.state.decks.length) {
                lobby.state.selectedDeck = getStoredSelectedDeckIndex();
                if (lobby.state.selectedDeck >= lobby.state.decks.length) {
                    lobby.state.selectedDeck = 0;
                }
            }
            storeSelectedDeckIndex(lobby.state.selectedDeck);
            app.manual = Boolean(lobby.state.automatic !== 'Automatic');
            console.log('lobby', lobby.state);
        }
    };

    Object.defineProperty(lobby, 'deck', {
        get() {
            return getDeckValue(lobby);
        }
    });

    return lobby;
}
