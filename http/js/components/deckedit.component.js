/*global React, ReactDOM, SearchFilter*/
class DeckEditScreen extends React.Component {
    constructor(store) {
        super();
        this.searchFilter = new SearchFilter([]);
        this.info = new CardInfo([]);
        this.state = {
            search: [],
            setcodes: [],
            banlist: [],
            decks: [],
            activeDeck: {
                main: [],
                extra: [],
                side: []
            }
        };
        this.settings = {
            cardname: undefined,
            description: undefined,
            type: undefined,
            attribute: undefined,
            race: undefined,
            setcode: undefined,
            atk: undefined,
            level: undefined,
            scale: undefined
        };
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
            }
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
            this.info = new CardInfo(this.state.search);
            this.store.dispatch({ action: 'HOVER', id: this.state.search[0].id });
            this.store.dispatch({ action: 'RENDER' });
        });

        store.register('LOAD_SETCODES', (action) => {
            this.state.setcodes = action.data;
            this.store.dispatch({ action: 'RENDER' });
        });
    }

    save() { }
    saveAs() { }
    delete() { }
    rename() { }
    clear() {
        this.state.activeDeck.main = [];
        this.state.activeDeck.extra = [];
        this.state.activeDeck.side = [];
    }
    sort() { }
    export() { }
    import() { }

    onChange() {
        const id = event.target.id;
        this.settings[id] = event.target.value;
        if (event.target.value === 'on') {
            this.settings[id] = event.target.checked;
        }
    }

    renderCardCollection(input) {
        const element = React.createElement;
        let output = input.map((card, i) => {
            card.uid = i;
            return element('div', {}, new CardImage(card, this.store).render());
        });
        return output;
    }

    render() {
        const element = React.createElement;
        return [
            element('div', { id: 'decksetup' }, [
                element('h2', {}, 'Setup'),
                element('br'),
                element('div', { id: 'searchfilter' }, [
                    element('h3', {}, 'Filter'),
                    element('controls', {}, [
                        element('div', { className: 'filtercol' }, [
                            element('select', { id: 'cardtype' }, [
                                element('option', {}, 'Monster/Spell/Trap'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Spell'),
                                element('option', {}, 'Trap')
                            ]),
                            element('select', { id: 'subtype' }, []),
                            element('select', { id: 'racegroup' }, [
                                element('option', {}, 'Type'),
                                element('option', {}, 'Aqua'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster'),
                                element('option', {}, 'Monster')
                            ]),
                            element('select', { id: 'archetype' }, [
                                element('option', {}, 'Archetype')
                            ].concat(this.state.setcodes.map((list, i) => {
                                return React.createElement('option', { value: list.name }, list.name);
                            }))),
                            element('select', { id: 'release' }, [
                                element('option', {}, 'Release Set')
                            ]),
                            element('select', { id: 'limit' }, [
                                element('option', {}, 'Limit'),
                                element('option', {}, 'Unlimited'),
                                element('option', {}, 'Semi-Limited'),
                                element('option', {}, 'Limited')
                            ]),
                            element('input', { id: 'cardname', type: 'text', placeholder: 'Name' }),
                            element('input', { id: 'description', type: 'text', placeholder: 'Card Text' }),
                            element('div', { className: 'filterrow' }, [
                                element('input', { id: 'attack', placeholder: 'Attack', type: 'number' }),
                                element('select', { id: 'attackfilter' }, [
                                    element('option', {}, '<'),
                                    element('option', {}, '=<'),
                                    element('option', {}, '='),
                                    element('option', {}, '>'),
                                    element('option', {}, '=>')
                                ])
                            ]),
                            element('div', { className: 'filterrow' }, [
                                element('input', { id: 'defense', placeholder: 'Defense', type: 'number' }),
                                element('select', { id: 'defensefilter' }, [
                                    element('option', {}, '<'),
                                    element('option', {}, '=<'),
                                    element('option', {}, '='),
                                    element('option', {}, '>'),
                                    element('option', {}, '=>')
                                ])
                            ]),
                            element('div', { className: 'filterrow' }, [
                                element('input', { id: 'level', placeholder: 'Level/Rank/Rating', type: 'number' }),
                                element('select', { id: 'levelfilter' }, [
                                    element('option', {}, '<'),
                                    element('option', {}, '=<'),
                                    element('option', {}, '='),
                                    element('option', {}, '>'),
                                    element('option', {}, '=>')
                                ])
                            ]),
                            element('div', { className: 'filterrow' }, [
                                element('input', { id: 'scale', placeholder: 'Scale', type: 'number' }),
                                element('select', { id: 'scalefilter' }, [
                                    element('option', {}, '<'),
                                    element('option', {}, '=<'),
                                    element('option', {}, '='),
                                    element('option', {}, '>'),
                                    element('option', {}, '=>')
                                ])
                            ]),
                            element('button', {}, 'Reset'),
                            element('button', {}, 'Search')
                        ]),
                        element('div', { className: 'filtercol' }, [

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
                        ])
                    ]),
                    element('controls', {}, [
                        element('div', { className: 'filtercol' }, [
                            element('h3', {}, 'Deck'),
                            element('h3', {}, 'Banlist')
                        ]),

                        element('div', { className: 'filtercol' }, [
                            React.createElement('select', { id: 'banlist', onChange: this.onChange.bind(this) }, this.state.banlist.map((list, i) => {
                                return React.createElement('option', { value: list.name, selected: list.primary }, list.name);
                            })),
                            element('select', { id: 'decklist' }, this.state.decks.map((list, i) => {
                                return React.createElement('option', { value: list.name, selected: list.primary }, list.name);
                            }))
                        ]),
                        element('div', { className: 'deckcontrols' }, [
                            element('h3', { style: { width: 'auto' } }, 'Upload YDK File'),
                            element('input', { type: 'file', placeholder: 'Choose File' })]),
                        element('div', { className: 'deckcontrols' }, [
                            element('button', {}, 'New'),
                            element('button', {}, 'Save'),
                            element('button', {}, 'Delete'),
                            element('button', {}, 'Rename'),
                            element('button', {}, 'Clear'),

                            element('button', {}, 'Sort'),
                            element('button', {}, 'Export'),
                            element('button', {}, 'Save As')
                        ])

                    ])
                ]),
                element('div', { id: 'decktextlist' })
            ]),
            element('button', { id: 'prev' }, '<'),
            element('div', { id: 'decksearch' }, [

                element('div', { id: 'decksearchtitles' }, [
                    element('h2', {}, 'Search Results'),
                    element('h2', {}, 'Card Information')
                ]),

                element('div', { id: 'decksearchresults' }, this.renderCardCollection(this.state.search)),
                element('div', { id: 'decksearchresultsofx' }),
                element('button', { id: 'next' }, '>'),
                element('div', { id: 'cardinformation' }, this.info.render())
            ]),
            element('div', { id: 'deckarea' }, [
                element('div', { id: 'deckareamain' }, [
                    element('h2', {}, 'Main Deck'),
                    element('div', { className: 'deckmetainfo' }, this.renderCardCollection(this.state.search).concat(this.renderCardCollection(this.state.search))),
                    element('div', { id: 'main' })
                ]),
                element('div', { id: 'deckareaextra' }, [
                    element('h2', {}, 'Extra Deck'),
                    element('div', { className: 'deckmetainfo' }, this.renderCardCollection(this.state.search)),
                    element('div', { id: 'main' })
                ]),
                element('div', { id: 'deckareaside' }, [
                    element('h2', {}, 'Side Deck'),
                    element('div', { className: 'deckmetainfo' }, this.renderCardCollection(this.state.search)),
                    element('div', { id: 'main' })
                ])
            ])
        ];
    }
}