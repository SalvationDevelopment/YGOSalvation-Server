/*global React, ReactDOM, SearchFilter*/
class DeckEditScreen extends React.Component {
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
                main: [],
                extra: [],
                side: []
            }
        };
        this.settings = {
            cardtype: undefined,
            cardname: undefined,
            description: undefined,
            type: undefined,
            type1: undefined,
            type2: undefined,
            attribute: undefined,
            race: undefined,
            setcode: undefined,
            atk: undefined,
            level: undefined,
            scale: undefined,
            limit: undefined
        };
        this.filterKeys = Object.keys(this.settings);
        this.store = store;
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

        store.register('HOST_BANLIST', (action) => {
            this.settings.banlist = action.primary;
            this.state.banlist = action.banlist;
            this.store.dispatch({ action: 'RENDER' });
        });

        store.register('LOAD_DECKS', (action) => {
            this.state.decks = action.decks;
            this.store.dispatch({ action: 'RENDER' });
        });

        store.register('LOAD_DATABASE', (action) => {
            this.searchFilter = new SearchFilter(action.data);
            this.searchFilter.preformSearch();
            this.state.search = this.searchFilter.renderSearch();
            this.info = new CardInfo(action.data);
            this.store.dispatch({ action: 'HOVER', id: this.state.search[0].id });
            this.store.dispatch({ action: 'RENDER' });
        });

        store.register('LOAD_SETCODES', (action) => {
            this.state.setcodes = action.data;
            this.store.dispatch({ action: 'RENDER' });
        });
        store.register('LOAD_RELEASES', (action) => {
            this.state.releases = action.sets;
            this.store.dispatch({ action: 'RENDER' });
        });
    }

    search() {
        Object.assign(this.searchFilter.currentFilter, this.settings);
        this.searchFilter.preformSearch();
        this.state.search = this.searchFilter.renderSearch();
        this.store.dispatch({ action: 'RENDER' });
    }
    clearSearch() {
        this.searchFilter.clearFilter();
        this.state.search = this.searchFilter.renderSearch();
        this.store.dispatch({ action: 'RENDER' });
    }

    save() {

    }

    newDeck() {
        this.save();
    }

    saveAs() {
        this.save();
    }
    delete() {
        this.save();
    }
    rename() {
        this.save();
    }
    clear() {
        this.state.activeDeck.main = [];
        this.state.activeDeck.extra = [];
        this.state.activeDeck.side = [];
    }
    sort() {
        this.state.activeDeck.main.sort(cardEvaluate);
        this.state.activeDeck.extra.sort(cardEvaluate);
        this.state.activeDeck.side.sort(cardEvaluate);
    }
    export() { }
    import() {
        this.save();
    }

    prev() {
        this.searchFilter.pageBack();
        this.state.search = this.searchFilter.renderSearch();
        this.store.dispatch({ action: 'RENDER' });
    }
    next() {
        this.searchFilter.pageForward();
        this.state.search = this.searchFilter.renderSearch();
        this.store.dispatch({ action: 'RENDER' });
    }

    onChange() {
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

    onSearchChange() {

        const id = event.target.id,
            value = (isNaN(Number(event.target.value))) ? undefined : Number(event.target.value);
        if (!this.filterKeys.includes(id)) {
            return;
        }
        if (this.settings[id] === value) {
            return;
        }

        switch (id) {
            case 'cardtype':
                this.settings[id] = value;
                this.settings.type = Number(event.target.value);
                this.settings.exacttype = undefined;
                this.settings.type1 = undefined;
                this.settings.type2 = undefined;
                break;
            case 'release':
                this.settings[id] = value;
                this.settings[id] = event.target.value;
                if (event.target.value === 'Release Set') {
                    this.settings[id] = undefined;
                }
                break;
            case 'name':
                this.settings[id] = value;
                this.settings[id] = event.target.value;
                if (event.target.value === '') {
                    this.settings[id] = undefined;
                }
                break;
            case 'description':
                this.settings[id] = value;
                this.settings[id] = event.target.value;
                if (event.target.value === '') {
                    this.settings[id] = undefined;
                }
                break;
            default:
                this.settings[id] = value;
        }

        if (isNaN(this.settings[id])) {
            this.settings[id] = undefined;
        }
        this.state.last = event.target.id;
        this.search();
    }

    renderCardCollection(source, input) {
        const element = React.createElement;
        return input.map((card, i) => {
            card.uid = i;
            return element('div', {
                draggable: true,
                onDragStart: function (event, x) {
                    console.log('drag start', card.name, event, card, i);
                    event.dataTransfer.setData('index', i);
                    event.dataTransfer.setData('source', source);
                }
            }, new CardImage(card, this.store).render());
        });

    }

    cardTypes() {
        const element = React.createElement;
        switch (this.settings.cardtype) {
            case 1:
                return [element('select', { id: 'type1', onChange: this.onSearchChange.bind(this) }, [
                    element('option', { value: 1 }, 'Frame'),
                    element('option', { value: 64 }, 'Fusion'),
                    element('option', { value: 128 }, 'Ritual'),
                    element('option', { value: 8192 }, 'Synchro'),
                    element('option', { value: 8388608 }, 'Xyz'),
                    element('option', { value: 16777216 }, 'Pendulum'),
                    element('option', { value: 33554432 }, 'Link')
                ]),
                element('select', { id: 'type2', onChange: this.onSearchChange.bind(this) }, [
                    element('option', { value: 1 }, 'Sub Card Type'),
                    element('option', { value: 16 }, 'Normal'),
                    element('option', { value: 32 }, 'Effect'),
                    element('option', { value: 512 }, 'Spirit'),
                    element('option', { value: 1024 }, 'Union'),
                    element('option', { value: 4096 }, 'Tuner'),
                    element('option', { value: 2048 }, 'Gemini'),
                    element('option', { value: 4194304 }, 'Toon')]),
                element('select', { id: 'attribute', onChange: this.onSearchChange.bind(this) }, [
                    element('option', {}, 'Attribute'),
                    element('option', { value: 1 }, 'EARTH'),
                    element('option', { value: 2 }, 'WATER'),
                    element('option', { value: 4 }, 'FIRE'),
                    element('option', { value: 8 }, 'WIND'),
                    element('option', { value: 16 }, 'LIGHT'),
                    element('option', { value: 32 }, 'DARK'),
                    element('option', { value: 64 }, 'DIVINE')]),
                element('select', { id: 'race', onChange: this.onSearchChange.bind(this) }, [
                    element('option', {}, 'Type'),
                    element('option', { value: 1 }, 'Warrior'),
                    element('option', { value: 2 }, 'Spellcaster'),
                    element('option', { value: 4 }, 'Fairy'),
                    element('option', { value: 8 }, 'Fiend'),
                    element('option', { value: 16 }, 'Zombie'),
                    element('option', { value: 32 }, 'Machine'),
                    element('option', { value: 64 }, 'Aqua'),
                    element('option', { value: 128 }, 'Pyro'),
                    element('option', { value: 256 }, 'Rock'),
                    element('option', { value: 512 }, 'Winged-Beast'),
                    element('option', { value: 1024 }, 'Plant'),
                    element('option', { value: 2048 }, 'Insect'),
                    element('option', { value: 4096 }, 'Thunder'),
                    element('option', { value: 8192 }, 'Dragon'),
                    element('option', { value: 16384 }, 'Beast'),
                    element('option', { value: 32768 }, 'Beast-Warrior'),
                    element('option', { value: 65536 }, 'Dinosaur'),
                    element('option', { value: 131072 }, 'Fish'),
                    element('option', { value: 262144 }, 'Sea Serpent'),
                    element('option', { value: 524288 }, 'Reptile'),
                    element('option', { value: 1048576 }, 'Psychic'),
                    element('option', { value: 2097152 }, 'Divine-Beast'),
                    element('option', { value: 4194304 }, 'Creator God'),
                    element('option', { value: 8388608 }, 'Wyrm'),
                    element('option', { value: 16777216 }, 'Cyberse')
                ])];
            case 2: // Spells
                return element('select', { id: 'exacttype', onChange: this.onSearchChange.bind(this) }, [
                    element('option', {}, 'Icon'),
                    element('option', { value: 2 }, 'Normal'),
                    element('option', { value: 65538 }, 'Quick-Play'),
                    element('option', { value: 131074 }, 'Continous'),
                    element('option', { value: 130 }, 'Ritual'),
                    element('option', { value: 262146 }, 'Field'),
                    element('option', { value: 524290 }, 'Equip')
                ]);
            case 4: //Traps
                return element('select', { id: 'exacttype', onChange: this.onSearchChange.bind(this) }, [
                    element('option', {}, 'Icon'),
                    element('option', { value: 4 }, 'Normal'),
                    element('option', { value: 131076 }, 'Continous'),
                    element('option', { value: 1048580 }, 'Counter')
                ]);

            default:
        }
    }

    renderLinks() {
        const element = React.createElement;
        if (this.settings.cardtype !== 1) {
            return element('br', {});
        }
        return element('div', { className: 'filtercol' }, [
            element('control', { id: 'linkmarkers' }, [
                element('input', { id: 'link1', type: 'checkbox' }),
                element('input', { id: 'link2', type: 'checkbox' }),
                element('input', { id: 'link3', type: 'checkbox' }),
                element('br'),
                element('input', { id: 'link4', type: 'checkbox' }),
                element('input', {
                    type: 'checkbox', style: {
                        visibility: 'hidden'
                    }
                }),
                element('input', { id: 'link5', type: 'checkbox' }),
                element('br'),
                element('input', { id: 'link6', type: 'checkbox' }),
                element('input', { id: 'link7', type: 'checkbox' }),
                element('input', { id: 'link8', type: 'checkbox' })
            ])
        ]);
    }
    renderStats() {
        const element = React.createElement;
        if (this.settings.cardtype !== 1) {
            return element('br', {});
        }
        return [element('div', { className: 'filterrow' }, [
            element('input', { id: 'attack', placeholder: 'Attack', type: 'number', onChange: this.onSearchChange(this) }),
            element('select', { id: 'atkop' }, [
                element('option', {}, '<'),
                element('option', {}, '=<'),
                element('option', {}, '='),
                element('option', {}, '>'),
                element('option', {}, '=>')
            ])
        ]),
        element('div', { className: 'filterrow' }, [
            element('input', { id: 'defense', placeholder: 'Defense', type: 'number' }),
            element('select', { id: 'defop' }, [
                element('option', {}, '<'),
                element('option', {}, '=<'),
                element('option', {}, '='),
                element('option', {}, '>'),
                element('option', {}, '=>')
            ])
        ]),
        element('div', { className: 'filterrow' }, [
            element('input', { id: 'level', placeholder: 'Level/Rank/Rating', type: 'number' }),
            element('select', { id: 'levelop' }, [
                element('option', {}, '<'),
                element('option', {}, '=<'),
                element('option', {}, '='),
                element('option', {}, '>'),
                element('option', {}, '=>')
            ])
        ]),
        element('div', { className: 'filterrow' }, [
            element('input', { id: 'scale', placeholder: 'Scale', type: 'number', onChange: this.onSearchChange(this) }),
            element('select', { id: 'scaleop' }, [
                element('option', {}, '<'),
                element('option', {}, '=<'),
                element('option', {}, '='),
                element('option', {}, '>'),
                element('option', {}, '=>')
            ])
        ])];
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
            list = (source === 'search') ? this.state.search : this.state.activeDeck[source],
            card = list[index];
        if (!card) {
            return;
        }
        if (source === 'search') {
            this.state.activeDeck[zone].push(card);
        } else {
            this.state.activeDeck[source].splice(index, 1);
            this.state.activeDeck[zone].push(card);
        }

        this.store.dispatch({ action: 'RENDER' });
        event.preventDefault();
    }

    renderReleases() {
        const element = React.createElement,
            list = this.state.releases.map((set) => {
                return element('option', { value: set }, set);
            });
        return [element('option', {}, 'Release Set')].concat(list);
    }
    render() {
        const element = React.createElement;
        return [
            element('div', {
                id: 'decksetup',
                onDragOver: function (event, x) {
                    event.preventDefault();
                },
                onDrop: this.onDropExitZone.bind(this)
            }, [
                    element('h2', {}, 'Setup'),
                    element('br'),
                    element('div', { id: 'searchfilter' }, [
                        element('h3', {}, 'Filter'),
                        element('controls', {}, [
                            element('div', { className: 'filtercol' }, [
                                element('select', { id: 'cardtype', onChange: this.onSearchChange.bind(this) }, [
                                    element('option', { value: 5 }, 'Monster/Spell/Trap'),
                                    element('option', { value: 1 }, 'Monster'),
                                    element('option', { value: 2 }, 'Spell'),
                                    element('option', { value: 4 }, 'Trap')
                                ]),
                                element('div', { className: 'filtercol' }, this.cardTypes()),

                                element('select', { id: 'setcode', onChange: this.onSearchChange.bind(this) }, [
                                    element('option', {}, 'Archetype')
                                ].concat(this.state.setcodes.map((list, i) => {
                                    return React.createElement('option', { value: parseInt(list.num) }, list.name);
                                }))),
                                element('select', { key: 'release', id: 'release', onChange: this.onSearchChange.bind(this) }, this.renderReleases()),
                                element('select', { id: 'limit' }, [
                                    element('option', {}, 'Limit'),
                                    element('option', {}, 'Unlimited'),
                                    element('option', {}, 'Semi-Limited'),
                                    element('option', {}, 'Limited')
                                ]),
                                element('input', { id: 'cardname', type: 'text', placeholder: 'Name', onBlur: this.onSearchChange(this) }),
                                element('input', { id: 'description', type: 'text', placeholder: 'Card Text', onBlur: this.onSearchChange(this) }),
                                this.renderStats(),
                                element('button', { onClick: this.clearSearch.bind(this) }, 'Reset'),
                                element('button', { onClick: this.search.bind(this) }, 'Search')
                            ]),
                            this.renderLinks()
                        ]),
                        element('controls', {}, [
                            element('div', { className: 'filtercol' }, [
                                element('h3', {}, 'Deck'),
                                element('h3', {}, 'Banlist')
                            ]),

                            element('div', { className: 'filtercol' }, [
                                element('select', { id: 'decklist', onChange: this.onChange.bind(this) }, this.state.decks.map((list, i) => {
                                    return React.createElement('option', { value: i }, list.name);
                                })),
                                React.createElement('select', { id: 'banlist', onChange: this.onChange.bind(this) }, this.state.banlist.map((list, i) => {
                                    return React.createElement('option', { value: list.name, selected: list.primary }, list.name);
                                }))

                            ]),
                            element('div', { className: 'deckcontrols' }, [
                                element('h3', { style: { width: 'auto' } }, 'Upload YDK File'),
                                element('input', { type: 'file', placeholder: 'Choose File' })]),
                            element('div', { className: 'deckcontrols' }, [
                                element('button', { onClick: this.newDeck.bind(this) }, 'New'),
                                element('button', { onClick: this.save.bind(this) }, 'Save'),
                                element('button', { onClick: this.delete.bind(this) }, 'Delete'),
                                element('button', { onClick: this.rename.bind(this) }, 'Rename'),
                                element('button', { onClick: this.clear.bind(this) }, 'Clear'),

                                element('button', { onClick: this.sort.bind(this) }, 'Sort'),
                                element('button', { onClick: this.export.bind(this) }, 'Export'),
                                element('button', { onClick: this.saveAs.bind(this) }, 'Save As')
                            ])

                        ])
                    ]),
                    element('div', { id: 'decktextlist' })
                ]),
            element('button', { id: 'prev', onClick: this.prev.bind(this) }, '<'),
            element('div', {
                id: 'decksearch',
                onDragOver: function (event, x) {
                    event.preventDefault();
                },
                onDrop: this.onDropExitZone.bind(this)
            }, [

                    element('div', { id: 'decksearchtitles' }, [
                        element('h2', {}, 'Search Results'),
                        element('h2', {}, 'Card Information')
                    ]),

                    element('div', { id: 'decksearchresults' }, this.renderCardCollection('search', this.state.search)),
                    element('div', { id: 'decksearchresultsofx' }),
                    element('button', { id: 'next', onClick: this.next.bind(this) }, '>'),
                    element('div', { id: 'cardinformation' }, this.info.render())
                ]),
            element('div', { id: 'deckarea' }, [
                element('div', { id: 'deckareamain' }, [
                    element('h2', {}, 'Main Deck'),
                    element('div', {
                        className: 'deckmetainfo',
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
            ])
        ];
    }
}