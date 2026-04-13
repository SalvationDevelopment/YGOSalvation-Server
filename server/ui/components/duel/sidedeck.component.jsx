import React from 'react';
import styles from './sidedeck.component.module.scss';
import SearchFilter from '../../services/cardsearch.service';
import CardInfo, { disposeCardInfo, MountedCardInfo, updateCardInfo } from './cardinfo.component';
import { CardImageState, MountedCardImage } from '../common/card.component';
import { MountedSideChat } from './sidechat.component';
import { cardIs } from '../../util/cardManipulation';
/*global ReactDOM, store */

const ButtonTag = 'Button';
const ResetTag = 'Reset';



function cardEvaluate(card) {
    'use strict';
    var value = 0;

    if (cardIs('monster', card)) {
        value -= 100;
    }
    if (card.type === 17) { // normal monster
        value -= 100;
    }
    if (cardIs('ritual', card)) {
        value += 300;
    }
    if (cardIs('fusion', card)) {
        value += 400;
    }
    if (cardIs('synchro', card)) {
        value += 500;
    }
    if (cardIs('xyz', card)) {
        value += 600;
    }
    if (cardIs('link', card)) {
        value += 700;
    }
    if (cardIs('spell', card)) {
        value += 10000;
    }
    if (cardIs('trap', card)) {
        value += 100000;
    }
    return value;

}

function getLevel(card) {
    'use strict';
    return card.level & 0xff;
}

function cardStackSort(a, b) {
    'use strict';
    if (cardEvaluate(a) > cardEvaluate(b)) {
        return 1;
    }
    if (cardEvaluate(a) < cardEvaluate(b)) {
        return -1;
    }
    if (getLevel(a) > getLevel(b)) {
        return -1;
    }
    if ((getLevel(a) < getLevel(b))) {
        return 1;
    }
    if (a.atk > b.atk) {
        return -1;
    }
    if (a.atk < b.atk) {
        return 1;
    }
    if (a.def < b.def) {
        return 1;
    }
    if (a.def > b.def) {
        return -1;
    }

    if (a.type > b.type) {
        return 1;
    }
    if (a.type < b.type) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    if (a.id > b.id) {
        return 1;
    }
    if (a.id < b.id) {
        return -1;
    }
    return 0;
}

/**
 * Shuffles an array in place, multiple times.
 * @param {Array} array to shuffle
 * @returns {void}
 */
function deepShuffle(array) {
    for (var i = 0; i < array.length; i++) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)),
                temp = array[i];

            array[i] = array[j];
            array[j] = temp;
        }
    }
}

function checkLegality(card, zone, deck, banlist) {
    function checkCard(reference) {
        var id = card.alias || card.id;
        if (reference.id === id || reference.alias === id) {
            return true;
        }
        return false;
    }
    var masterRule = banlist.masterRule,
        mainCount = deck.main.filter(checkCard).length,
        extraCount = deck.extra.filter(checkCard).length,
        sideCount = deck.side.filter(checkCard).length;

    if (mainCount + extraCount + sideCount >= card.limit) {
        return false;
    }
    if (zone === 'main' && deck[zone].length >= 60) {
        return false;
    }
    if (zone === 'side' && deck[zone].length >= 15) {
        return false;
    }
    if (zone === 'extra' && deck[zone].length >= 15) {
        return false;
    }
    return true;
}

function condenseDeck(card) {
    return {
        id: card.id
    };
}

function isExtra(card) {
    'use strict';
    return (cardIs('fusion', card) || cardIs('synchro', card) || cardIs('xyz', card) || cardIs('link', card));
}

function condenseDecks(decks) {
    return decks.map(function (deck) {
        return {
            main: deck.main.map(condenseDeck),
            extra: deck.extra.map(condenseDeck),
            side: deck.side.map(condenseDeck),
            name: deck.name,
            owner: deck.owner,
            creationDate: deck.creationDate,
            id: deck.id,
            _id: deck._id
        };
    });
}

function getActiveBanlist(controller) {
    return controller?.state?.banlist?.find((list) => list.name === controller?.settings?.banlist) || null;
}

function parseDeckSnapshot(deckSnapshot) {
    if (!deckSnapshot) {
        return null;
    }

    if (typeof deckSnapshot === 'string') {
        try {
            return JSON.parse(deckSnapshot);
        } catch (error) {
            return null;
        }
    }

    return Object.assign({}, deckSnapshot);
}

function cloneActiveDeck(activeDeck) {
    return {
        ...activeDeck,
        main: Array.isArray(activeDeck?.main) ? [...activeDeck.main] : [],
        extra: Array.isArray(activeDeck?.extra) ? [...activeDeck.extra] : [],
        side: Array.isArray(activeDeck?.side) ? [...activeDeck.side] : []
    };
}

function applySideDeckState(controller, nextState, callback) {
    const resolvedState = typeof nextState === 'function'
        ? nextState(controller.state)
        : nextState;

    if (resolvedState && typeof resolvedState === 'object') {
        controller.state = {
            ...controller.state,
            ...resolvedState
        };
    }

    callback?.();
    controller.store.emit({ action: 'RENDER' });
}

function getSideDeckMarginClass(deck) {
    if (deck.length <= 40) {
        return '';
    }

    if (deck.length >= 40 && deck.length <= 48) {
        return 'c48';
    }

    return 'c60';
}

function renderSideDeckLobbyStatus(lobby) {
    const p1 = lobby?.player?.[0]?.ready,
        p2 = lobby?.player?.[1]?.ready;

    return [
        <div key='sidedeck-lock-p1' className='lockindicator' data-state={p1} />,
        <div key='sidedeck-lock-p2' className='lockindicator' data-state={p2} />
    ];
}

function renderSideDeckList(deck) {
    const hashMap = deck.reduce((list, card) => {
        if (!list[card.name]) {
            list[card.name] = 1;
            return list;
        }
        list[card.name]++;
        return list;
    }, {});

    return Object.keys(hashMap).map((name, i) => {
        return <div key={`x${i}${name}`}>{`${hashMap[name]}x ${name}`}</div>;
    });
}

function renderSideDeckCardCollection(controller, source, input) {
    return input.map((card, i) => {
        const cardView = {
            ...card,
            uid: i
        };

        return (
            <div
                key={`${cardView.uid}-${cardView.name}`}
                draggable={true}
                data-limit={cardView.limit}
                onDragOver={() => controller.setIndex(source, i)}
                onDragStart={(event) => controller.onDragStart(source, i, event)}
                onDragEnd={(event) => controller.onDragEnd(event)}
                onClick={(event) => controller.onCardDoubleClick(source, i, event)}
                onContextMenu={(event) => controller.onCardDoubleClick(source, i, event)}
            >
                <MountedCardImage controller={CardImageState(cardView)} />
            </div>
        );
    });
}

function buildSideDeckViewModel(controller) {
    return {
        info: controller.info,
        sidechat: controller.sidechat,
        lobby: controller.state.lobby,
        activeDeck: controller.state.activeDeck,
        marginClass: getSideDeckMarginClass,
        renderCardCollection: (source, input) => renderSideDeckCardCollection(controller, source, input),
        lobbyStatus: () => renderSideDeckLobbyStatus(controller.state.lobby),
        completeSideDeck: () => controller.completeSideDeck(),
        resetDeck: () => controller.resetDeck(),
        onDropDeckZone: (zone, event) => controller.onDropDeckZone(zone, event)
    };
}


export function SideDeckEditScreenView({
    info,
    sidechat,
    activeDeck,
    marginClass,
    renderCardCollection,
    completeSideDeck,
    resetDeck,
    lobbyStatus,
    onDropDeckZone
}) {
    if (!activeDeck) {
        return null;
    }

    return (
        <div className={styles.root}>
            <div id='deckarea' key='sidedeck-deckarea'>
                <div id='cardinformation'><MountedCardInfo controller={info} /></div>
                <ButtonTag
                    id='sidedeckcomplete'
                    variant='primary'
                    onClick={completeSideDeck}
                >
                    Done
                </ButtonTag>
                <ResetTag
                    id='sidereset'
                    onClick={resetDeck}
                >
                    Reset
                </ResetTag>
                <div
                    id='lobby'
                    onClick={resetDeck}
                >
                    {lobbyStatus()}
                </div>
                <div id='deckareamain'>
                    <h2>Main Deck</h2>
                    <div
                        className={`deckmetainfo ${marginClass(activeDeck.main)}`}
                        onDragOver={(event) => {
                            event.preventDefault();
                        }}
                        onDrop={(event) => onDropDeckZone('main', event)}
                    >
                        {renderCardCollection('main', activeDeck.main)}
                    </div>
                    <div id='main' />
                </div>
                <div id='deckareaextra'>
                    <h2>Extra Deck</h2>
                    <div
                        className='deckmetainfo'
                        onDragOver={(event) => {
                            event.preventDefault();
                        }}
                        onDrop={(event) => onDropDeckZone('extra', event)}
                    >
                        {renderCardCollection('extra', activeDeck.extra)}
                    </div>
                    <div id='main' />
                </div>
                <div id='deckareaside'>
                    <h2>Side Deck</h2>
                    <div
                        className='deckmetainfo'
                        onDragOver={(event) => {
                            event.preventDefault();
                        }}
                        onDrop={(event) => onDropDeckZone('side', event)}
                    >
                        {renderCardCollection('side', activeDeck.side)}
                    </div>
                    <div id='main' />
                </div>
            </div>
            <MountedSideChat controller={sidechat} key="sidedeck-sidechat" />
        </div>
    );
}

export function MountedSideDeckEditScreen({ controller }) {
    if (!controller) {
        return null;
    }

    const viewModel = buildSideDeckViewModel(controller);

    return <SideDeckEditScreenView {...viewModel} />;
}

const sideDeckEditScreenMethods = {
    setState(nextState, callback) {
        applySideDeckState(this, nextState, callback);
    },

    dispose() {
        (this.cleanup || []).forEach((unsubscribe) => {
            unsubscribe?.();
        });
        this.cleanup = [];
        disposeCardInfo(this.info);
    },

    update(update) {
        this.state.lobby = {
            ...this.state.lobby,
            ...update
        };
    },

    loadDeck(deckRecord) {
        const newDeck = Object.assign({}, deckRecord);
        newDeck.main = newDeck.main.map(this.findcard.bind(this));
        newDeck.extra = newDeck.extra.map(this.findcard.bind(this));
        newDeck.side = newDeck.side.map(this.findcard.bind(this));
        const deckSnapshot = JSON.stringify(newDeck);
        applySideDeckState(this, {
            activeDeck: newDeck,
            deck: deckSnapshot
        });
    },

    resetDeck() {
        const activeDeck = parseDeckSnapshot(this.state.deck);

        if (!activeDeck) {
            return;
        }

        applySideDeckState(this, { activeDeck });
    },

    applyBanlist() {
        const banlist = getActiveBanlist(this),
            database = this.fullDatabase;
        let map = {},
            result = [],
            filteredCards = [],
            region = banlist?.region;
        database.forEach(function (card) {
            map[card.id] = card;
        });

        if (!banlist) {
            return;
        }

        result = Object.keys(map).map(function (id) {
            map[id].limit = (banlist.bannedCards[id] !== undefined)
                ? parseInt(banlist.bannedCards[id], 10)
                : 3;
            return map[id];
        });

        filteredCards = result.filter(function (card) {
            if (!(region && banlist.endDate)) {
                return true;
            }
            if (!card[region]) {
                return false;
            }

            if (card[region].date) {
                return new Date(banlist.endDate).getTime() > new Date(card[region].date).getTime();
            }
            return false;

        });

        this.searchFilter = new SearchFilter(filteredCards.sort(cardStackSort));
        this.searchFilter.preformSearch();
        applySideDeckState(this, { search: this.searchFilter.renderSearch() });
    },

    findcard(card) {
        return this.fullDatabase.find((item) => { return card === item.id; });
    },


    sort() {
        const activeDeck = cloneActiveDeck(this.state.activeDeck);
        activeDeck.main.sort(cardEvaluate);
        activeDeck.extra.sort(cardEvaluate);
        activeDeck.side.sort(cardEvaluate);
        applySideDeckState(this, { activeDeck });
    },

    shuffle() {
        const activeDeck = cloneActiveDeck(this.state.activeDeck);
        deepShuffle(activeDeck.main);
        applySideDeckState(this, { activeDeck });
    },


    marginClass(deck) {
        return getSideDeckMarginClass(deck);
    },

    onChange(event) {
        const id = event.target.id;
        if (!id) {
            return;
        }

        const nextValue = event.target.value === 'on' ? event.target.checked : event.target.value;
        this.settings = {
            ...this.settings,
            [id]: nextValue
        };
        if (id === 'decklist') {
            this.setState({ activeDeck: this.state.decks[this.settings[id]] });
        }
        this.search();
    },

    onLinkChange(pointer, event) {
        const links = Array.isArray(this.settings.links) ? [...this.settings.links] : [];
        links[pointer] = event.target.checked ? pointer : null;
        this.settings = {
            ...this.settings,
            links
        };
        this.search();
    },


    setIndex(source, index) {
        applySideDeckState(this, { overIndex: { source, index } });
    },

    onDragStart(source, i, event) {
        event.dataTransfer.setData('index', i);
        event.dataTransfer.setData('source', source);
        event.target.style.opacity = '0';
    },

    onDragEnd(event) {
        event.target.style.opacity = '1';
    },

    renderCardCollection(source, input) {
        return renderSideDeckCardCollection(this, source, input);
    },

    listReduce(deck) {
        return renderSideDeckList(deck);

    },

    renderCardList() {
        const main = this.listReduce(this.state.activeDeck.main),
            side = this.listReduce(this.state.activeDeck.side),
            extra = this.listReduce(this.state.activeDeck.extra);
        return [
            <h4 key='sidedeck-main-heading'>{`Main Deck - ${this.state.activeDeck.main.length}x`}</h4>,
            main,
            <h4 key='sidedeck-side-heading'>{`Side Deck - ${this.state.activeDeck.side.length}x`}</h4>,
            side,
            <h4 key='sidedeck-extra-heading'>{`Extra Deck - ${this.state.activeDeck.extra.length}x`}</h4>,
            extra];
    },

    onCardDoubleClick(source, index, event) {
        event.preventDefault();
        const activeDeck = cloneActiveDeck(this.state.activeDeck),
            searchResults = Array.isArray(this.state.search) ? [...this.state.search] : [],
            banlist = getActiveBanlist(this) || { masterRule: 0, bannedCards: {} };

        if (source === 'search') {
            const card = searchResults[index];
            let legal = checkLegality(card, 'main', activeDeck, banlist);
            if (!legal) {
                return;
            }
            if (isExtra(card)) {
                legal = checkLegality(card, 'extra', activeDeck, banlist);
                activeDeck.extra.push(card);
                applySideDeckState(this, { activeDeck });
                return;
            }
            activeDeck.main.push(card);
            applySideDeckState(this, { activeDeck });
            return;
        }

        activeDeck[source].splice(index, 1);
        applySideDeckState(this, { activeDeck });

    },

    onDropExitZone(event) {
        const index = event.dataTransfer.getData('index'),
            source = event.dataTransfer.getData('source');

        if (source === 'search') {
            return;
        }

        const activeDeck = cloneActiveDeck(this.state.activeDeck);
        activeDeck[source].splice(index, 1);
        applySideDeckState(this, { activeDeck });
        event.preventDefault();
    },

    onDropDeckZone(zone, event) {

        const index = event.dataTransfer.getData('index'),
            source = event.dataTransfer.getData('source'),
            insert = this.state.overIndex,
            list = (source === 'search') ? this.state.search : this.state.activeDeck[source],
            card = list[index],
            activeDeck = cloneActiveDeck(this.state.activeDeck),
            banlist = getActiveBanlist(this) || { masterRule: 0, bannedCards: {} };

        if (!card) {
            return;
        }
        if (zone === 'extra' && !isExtra(card)) {
            return;
        }
        if (source === 'search') {

            const legal = (checkLegality(card, activeDeck[zone], activeDeck, banlist));
            if (!legal) {
                return;
            }
            if (insert.source === zone) {
                activeDeck[zone].splice(insert.index, 0, card);
            } else {
                activeDeck[zone].push(card);
            }
        } else {
            if (insert.source === zone) {
                activeDeck[source].splice(index, 1);
                activeDeck[zone].splice(insert.index, 0, card);
            } else {
                activeDeck[source].splice(index, 1);
                activeDeck[zone].push(card);
            }
        }

        applySideDeckState(this, { activeDeck });
        event.preventDefault();
    },


    renderReleases() {
        const list = this.state.releases.map((set, i) => {
            return <option key={`release-${i}`} value={set}>{set}</option>;
        });
        return [<option key='release-default' value='undefined'>Release Set</option>].concat(list);
    },

    completeSideDeck() {
        const deck = cloneActiveDeck(this.state.activeDeck);
        deck.main = deck.main.map((card) => card.id);
        deck.extra = deck.extra.map((card) => card.id);
        deck.side = deck.side.map((card) => card.id);

        this.store.emit({ action: 'SIDE_DECKING', deck });
    },

    lobbyStatus() {
        return renderSideDeckLobbyStatus(this.state.lobby);
    }
};

export function SideDeckEditScreenState(store, sidechat) {
    const controller = {
        sidechat,
        searchFilter: new SearchFilter([]),
        info: CardInfo([]),
        state: {
            lobby: {},
            search: [],
            setcodes: [],
            releases: [],
            banlist: [],
            decks: [],
            deck: '',
            overIndex: null,
            last: '',
            activeDeck: {
                name: 'No Deck Loaded',
                main: [],
                extra: [],
                side: []
            }
        },
        settings: {
            banlist: '',
            decklist: 0,
            links: []
        },
        store,
        debounce: false,
        cleanup: []
    };

    Object.assign(controller, sideDeckEditScreenMethods);

    $.getJSON('/manifest/manifest_0-language-merged.json', function (data) {
        data.sort(cardStackSort);
        store.emit({ action: 'LOAD_DATABASE', data });
    });

    controller.cleanup.push(controller.store.on('CARD_HOVER', (event, state) => {
        if (!event.id) {
            return;
        }
        const description = updateCardInfo(controller.info, {
            id: event.id
        });
        controller.store.emit({ action: 'RENDER' });
        return {
            id: event.id,
            description
        };
    }));

    controller.cleanup.push(store.on('LOAD_DATABASE', (action) => {
        controller.fullDatabase = action.data;
        disposeCardInfo(controller.info);
        controller.info = CardInfo(action.data);
    }));

    return controller;
}

export function SideDeckEditScreen(store, sidechat) {
    return SideDeckEditScreenState(store, sidechat);
}
