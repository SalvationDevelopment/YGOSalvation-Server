/*global React, ReactDOM, SearchFilter, store, cardIs*/

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



class SideDeckEditScreen extends React.Component {


    constructor(store) {
        super();
        this.searchFilter = new SearchFilter([]);
        this.info = new CardInfo([]);
        this.state = {
            search: [],
            setcodes: [],
            releases: [],
            banlist: [],
            decks: [],
            last: '',
            activeDeck: {
                name: 'New Deck',
                main: [],
                extra: [],
                side: []
            }
        };

        this.filterKeys = Object.keys(this.settings);
        this.store = store;
        this.debounce = false;
        this.store.register('CARD_HOVER', (event, state) => {
            if (!event.id) {
                return;
            }
            const description = this.info.update({
                id: event.id
            });
            this.store.dispatch({ action: 'RENDER' });
            return {
                id: event.id,
                description
            };
        });




        store.register('LOAD_DECK', (action) => {
            this.settings.decklist = '0';
            if (!action.decks) {
                return;
            }
            this.state.search = [];
            this.state.decks = action.decks.map((deckIds) => {
                const deck = Object.assign({}, deckIds);
                deck.main = deck.main.map(this.findcard.bind(this));
                deck.extra = deck.extra.map(this.findcard.bind(this));
                deck.side = deck.side.map(this.findcard.bind(this));

                return deck;
            });
            this.state.activeDeck = this.state.decks[this.settings.decklist] || this.state.activeDeck;
            this.store.dispatch({ action: 'RENDER' });
        });

        store.register('LOAD_DATABASE', (action) => {
            this.fullDatabase = action.data;
            this.info = new CardInfo(action.data);
        });
    }

    applyBanlist() {
        const banlist = this.state.banlist.find((list) => (list.name === this.settings.banlist)),
            database = this.fullDatabase;
        let map = {},
            result = [],
            filteredCards = [],
            region = banlist.region;
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
        this.state.search = this.searchFilter.renderSearch();
    }

    findcard(card) {
        return this.fullDatabase.find((item) => card.id === item.id);
    }


    sort() {
        this.state.activeDeck.main.sort(cardEvaluate);
        this.state.activeDeck.extra.sort(cardEvaluate);
        this.state.activeDeck.side.sort(cardEvaluate);
    }

    shuffle() {
        deepShuffle(this.state.activeDeck.main);
        this.store.dispatch({ action: 'RENDER' });
    }


    marginClass(deck) {
        if (deck.length <= 40) {
            return '';
        }
        if (deck.length >= 40 && deck.length <= 48) {
            return 'c48';
        }
        return 'c60';
    }

    onChange(event) {
        const id = event.target.id;
        if (!id) {
            return;
        }

        this.settings[id] = event.target.value;
        if (event.target.value === 'on') {
            this.settings[id] = event.target.checked;
        }
        if (id === 'decklist') {
            this.state.activeDeck = this.state.decks[this.settings[id]];
        }
        this.search();
    }

    onLinkChange(pointer, event) {
        this.settings.links[pointer] = (event.target.checked) ? pointer : null;
        this.search();
    }


    setIndex(source, index) {
        this.state.overIndex = { source, index };
    }

    onDragStart(source, i, event) {
        var c = event.target.childNodes;
        event.dataTransfer.setData('index', i);
        event.dataTransfer.setData('source', source);
        event.target.style.opacity = '0';
    }

    onDragEnd(event) {
        event.target.style.opacity = '1';
    }

    renderCardCollection(source, input) {
        const element = React.createElement;
        return input.map((card, i) => {
            card.uid = i;

            return element('div', {
                key: `${card.uid}-${card.name}`,
                draggable: true,
                'data-limit': card.limit,
                onDragOver: this.setIndex.bind(this, source, i),
                onDragStart: this.onDragStart.bind(this, source, i),
                onDragEnd: this.onDragEnd.bind(this),
                onDoubleClick: this.onCardDoubleClick.bind(this, source, i),
                onContextMenu: this.onCardDoubleClick.bind(this, source, i)
            }, new CardImage(card, this.store).render());
        });
    }

    listReduce(deck) {
        const element = React.createElement,
            hashMap = deck.reduce((list, card) => {
                if (!list[card.name]) {
                    list[card.name] = 1;
                    return list;
                }
                list[card.name]++;
                return list;
            }, {});
        return Object.keys(hashMap).map((name, i) => {
            return element('div', { key: `x${i}${name}` }, `${hashMap[name]}x ${name}`);
        });

    }

    renderCardList() {
        const element = React.createElement,
            main = this.listReduce(this.state.activeDeck.main),
            side = this.listReduce(this.state.activeDeck.side),
            extra = this.listReduce(this.state.activeDeck.extra);
        return [
            element('h4', {}, `Main Deck - ${this.state.activeDeck.main.length}x`),
            main,
            element('h4', {}, `Side Deck - ${this.state.activeDeck.side.length}x`),
            side,
            element('h4', {}, `Extra Deck - ${this.state.activeDeck.extra.length}x`),
            extra];
    }

    onCardDoubleClick(source, index, event) {
        event.preventDefault();
        if (source === 'search') {
            const card = this.state.search[index];
            let legal = checkLegality(card, 'main', this.state.activeDeck, banlist);
            if (!legal) {
                return;
            }
            if (isExtra(card)) {
                legal = checkLegality(card, 'extra', this.state.activeDeck, banlist);
                this.state.activeDeck.extra.push(card);
                this.store.dispatch({ action: 'RENDER' });
                return;
            }
            this.state.activeDeck.main.push(card);
            this.store.dispatch({ action: 'RENDER' });
            return;
        }

        this.state.activeDeck[source].splice(index, 1);
        this.store.dispatch({ action: 'RENDER' });

    }

    onDropExitZone(event) {
        const index = event.dataTransfer.getData('index'),
            source = event.dataTransfer.getData('source');

        if (source === 'search') {
            return;
        }

        this.state.activeDeck[source].splice(index, 1);
        this.store.dispatch({ action: 'RENDER' });
        event.preventDefault();
    }

    onDropDeckZone(zone, event) {

        const index = event.dataTransfer.getData('index'),
            source = event.dataTransfer.getData('source'),
            insert = this.state.overIndex,
            list = (source === 'search') ? this.state.search : this.state.activeDeck[source],
            card = list[index];

        if (!card) {
            return;
        }
        if (zone === 'extra' && !isExtra(card)) {
            return;
        }
        if (source === 'search') {

            const legal = (checkLegality(card, this.state.activeDeck[zone], this.state.activeDeck, banlist));
            if (!legal) {
                return;
            }
            if (insert.source === zone) {
                this.state.activeDeck[zone].splice(insert.index, 0, card);
            } else {
                this.state.activeDeck[zone].push(card);
            }
        } else {
            if (insert.source === zone) {
                this.state.activeDeck[source].splice(index, 1);
                this.state.activeDeck[zone].splice(insert.index, 0, card);
            } else {
                this.state.activeDeck[source].splice(index, 1);
                this.state.activeDeck[zone].push(card);
            }
        }

        this.store.dispatch({ action: 'RENDER' });
        event.preventDefault();
    }


    renderReleases() {
        const element = React.createElement,
            list = this.state.releases.map((set, i) => {
                return element('option', { key: `release-${i}`, value: set }, set);
            });
        return [element('option', { value: 'undefined' }, 'Release Set')].concat(list);
    }

    render() {
        const element = React.createElement;
        return [




            element('div', { id: 'deckarea' }, [
                element('div', { id: 'cardinformation' }, this.info.render()),
                element('div', { id: 'deckareamain' }, [
                    element('h2', {}, 'Main Deck'),
                    element('div', {
                        className: `deckmetainfo ${this.marginClass(this.state.activeDeck.main)}`,
                        onDragOver: function (event, x) {
                            event.preventDefault();
                        },
                        onDrop: this.onDropDeckZone.bind(this, 'main')
                    }, this.renderCardCollection('main', this.state.activeDeck.main)),
                    element('div', { id: 'main' })
                ]),
                element('div', { id: 'deckareaextra' }, [
                    element('h2', {}, 'Extra Deck'),
                    element('div', {
                        className: 'deckmetainfo',
                        onDragOver: function (event, x) {
                            event.preventDefault();
                        },
                        onDrop: this.onDropDeckZone.bind(this, 'extra')
                    }, this.renderCardCollection('extra', this.state.activeDeck.extra)),
                    element('div', { id: 'main' })
                ]),
                element('div', { id: 'deckareaside' }, [
                    element('h2', {}, 'Side Deck'),
                    element('div', {
                        className: 'deckmetainfo',
                        onDragOver: function (event, x) {
                            event.preventDefault();
                        },
                        onDrop: this.onDropDeckZone.bind(this, 'side')
                    }, this.renderCardCollection('side', this.state.activeDeck.side)),
                    element('div', { id: 'main' })
                ])
            ])];
    }
}