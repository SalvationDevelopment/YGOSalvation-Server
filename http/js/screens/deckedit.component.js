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
            creator: deck.creator,
            creationDate: deck.creationDate,
            id: deck.id,
            _id: deck._id
        };
    });
}

function makeDeckfromydk(ydkFileContents) {
    var lineSplit = ydkFileContents.split('\n'),
        originalValues = {
            'main': [],
            'side': [],
            'extra': []
        },
        current = '';
    lineSplit = lineSplit.map(function (item) {
        return item.trim();
    });
    try {
        lineSplit.forEach(function (value) {
            if (value === '') {
                return;
            }
            if (!(value[0] === '#' || value[0] === '!')) {
                originalValues[current].push(value);
                return;
            }

            if (originalValues.hasOwnProperty(value.substr(1))) {
                current = value.substr(1);
            }
            return;

        });
    } catch (er) {
        console.log(er);
    }
    return originalValues;
}


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
                name: 'New Deck',
                main: [],
                extra: [],
                side: []
            }
        };
        this.settings = {
            cardtype: undefined,
            cardname: undefined,
            description: undefined,
            banlist: undefined,
            type: undefined,
            type1: undefined,
            type2: undefined,
            attribute: undefined,
            race: undefined,
            release: undefined,
            setcode: undefined,
            atk: undefined,
            atkop: 0,
            def: undefined,
            defop: 0,
            level: undefined,
            levelop: 0,
            scale: undefined,
            scaleop: 0,
            limit: undefined,
            links: [null, null, null, null, null, null, null, null]
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

        store.register('DECK_EDITOR_BANLIST', (action) => {
            this.settings.banlist = action.primary;
            this.state.banlist = action.banlist;
            this.applyBanlist();
            this.store.dispatch({ action: 'RENDER' });
        });


        store.register('LOAD_DECKS', (action) => {
            this.settings.decklist = '0';
            if (!action.decks) {
                return;
            }
            this.state.search = [];
            this.state.decks = action.decks.map((deckIds) => {
                const deck = Object.assign({}, deckIds);
                console.log(deck.id);
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

        store.register('LOAD_SETCODES', (action) => {
            this.state.setcodes = action.data;
            this.store.dispatch({ action: 'RENDER' });
        });
        store.register('LOAD_RELEASES', (action) => {
            this.state.releases = action.sets;
            this.store.dispatch({ action: 'RENDER' });
        });

        store.register('IMPORT', (action) => {
            this.importDeck(action.file, action.name);
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

    search() {
        Object.assign(this.searchFilter.currentFilter, this.settings);
        this.searchFilter.preformSearch();
        this.state.search = this.searchFilter.renderSearch();
        this.store.dispatch({ action: 'RENDER' });
    }
    clearSearch() {
        this.searchFilter.clearFilter();
        this.state.search = this.searchFilter.renderSearch();
        this.settings = {
            cardtype: undefined,
            cardname: undefined,
            description: undefined,
            banlist: undefined,
            type: undefined,
            type1: undefined,
            type2: undefined,
            attribute: undefined,
            race: undefined,
            release: undefined,
            setcode: undefined,
            atk: undefined,
            atkop: 0,
            def: undefined,
            defop: 0,
            level: undefined,
            levelop: 0,
            scale: undefined,
            scaleop: 0,
            limit: undefined,
            links: [null, null, null, null, null, null, null, null]
        };
        this.store.dispatch({ action: 'RENDER' });
    }

    saveToServer() {
        const decks = JSON.parse(JSON.stringify(condenseDecks(this.state.decks)));
        decks.sort((a, b) => {
            return a.name > b.name;
        });
        store.dispatch({ action: 'SAVE_DECKS', decks });
    }
    save() {
        this.state.decks[this.settings.decklist] = this.state.activeDeck;
        this.saveToServer();
    }

    newDeck() {
        const deck = {
            main: [],
            extra: [],
            side: []
        }, name = window.prompt('New Deck Name?', this.state.decks[this.settings.decklist].name);

        if (!name) {
            return;
        }
        if (this.state.decks.some((unit) => name === unit.name)) {
            return;
        }
        deck.name = name;
        deck.creationDate = new Date();
        this.state.decks.push(deck);
        this.settings.decklist = this.state.decks.length - 1;
        this.state.activeDeck = this.state.decks[this.settings.decklist];
        this.saveToServer();
        this.store.dispatch({ action: 'RENDER' });
        setTimeout(() => {
            var element = document.getElementById('decklist');
            element.value = this.settings.decklist;
        }, 200);


    }

    saveAs() {
        const deck = {},
            name = prompt('Save As?', this.state.decks[this.settings.decklist].name);
        if (!name) {
            return;
        }
        if (name === this.state.decks[this.settings.decklist].name) {
            return;
        }
        Object.assign(deck, JSON.parse(JSON.stringify(this.state.activeDeck)));
        deck.name = name;
        deck.creationDate = new Date();
        this.state.decks.push(deck);
        this.settings.decklist = this.state.decks.length - 1;
        this.state.activeDeck = this.state.decks[this.settings.decklist];
        this.saveToServer();
        this.store.dispatch({ action: 'RENDER' });
        setTimeout(() => {
            var element = document.getElementById('decklist');
            element.value = this.settings.decklist;
        }, 200);
    }
    delete() {
        const ok = confirm(`Delete ${this.state.decks[this.settings.decklist].name}?`);
        if (!ok) {
            return;
        }
        this.state.decks.splice(this.settings.decklist, 1);
        this.settings.decklist = this.state.decks.length - 1;
        this.state.activeDeck = this.state.decks[this.settings.decklist];
        this.saveToServer();
        this.store.dispatch({ action: 'RENDER' });
        setTimeout(() => {
            var element = document.getElementById('decklist');
            element.value = this.settings.decklist;
        }, 200);
    }
    rename() {
        const name = prompt('Deck Name?', this.state.decks[this.settings.decklist].name);
        if (!name) {
            return;
        }
        this.state.decks[this.settings.decklist].name = name;
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

    shuffle() {
        deepShuffle(this.state.activeDeck.main);
        this.store.dispatch({ action: 'RENDER' });
    }

    export() {
        let file = '#Created by ' + this.state.activeDeck.creator + ' on ' + this.state.activeDeck.creationDate + '\r\n#main';

        function printCard(card) {
            file += card.id + '\r\n';
        }
        this.state.activeDeck.main.forEach(printCard);
        file += '#extra\r\n';
        this.state.activeDeck.extra.forEach(printCard);
        file += '!side\r\n';
        this.state.activeDeck.side.forEach(printCard);

        const url = 'data:application/octet-stream;charset=utf-16le;base64,' + btoa(file),
            element = document.createElement('a');
        element.setAttribute('href', url);
        element.setAttribute('download', this.state.activeDeck.name + '.ydk');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    upload(event) {
        //Retrieve the first (and only!) File from the FileList object
        'use strict';
        var f = event.target.files[0],
            r;

        if (!f) {
            app.alert('Failed to load file');
            return;
        }

        r = new FileReader();
        r.onload = ((e) => {
            var file = e.target.result,
                name = f.name,
                action = confirm('Upload Deck?');
            if (action) {
                store.dispatch({
                    action: 'IMPORT',
                    file,
                    name: name.substring(0, name.lastIndexOf('.'))
                });
            }
        }).bind(this);
        r.readAsText(f);
    }

    importDeck(file, name) {


        var deck = makeDeckfromydk(file);
        deck.name = name;
        deck.creator = localStorage.nickname;
        deck.creationDate = new Date();
        deck.main = deck.main.map((cardid) => {
            return this.findcard({
                id: parseInt(cardid, 10)
            });
        }).filter((card) => card);
        deck.side = deck.side.map((cardid) => {
            return this.findcard({
                id: parseInt(cardid, 10)
            })
        }).filter((card) => card);
        deck.extra = deck.extra.map((cardid) => {
            return this.findcard({
                id: parseInt(cardid, 10)
            });
        }).filter((card) => card);
        this.state.decks.push(deck);
        this.settings.decklist = this.state.decks.length - 1;
        this.state.activeDeck = this.state.decks[this.settings.decklist];
        this.saveToServer();
        this.store.dispatch({ action: 'RENDER' });
        setTimeout(() => {
            var element = document.getElementById('decklist');
            element.value = this.settings.decklist;
        }, 200);

    }

    prev() {
        this.searchFilter.pageBack();
        this.state.search = this.searchFilter.renderSearch();
        this.store.dispatch({ action: 'RENDER' });
        const c = document.getElementById('decksearchresults');
        [].forEach.call(c.children, (k) => {
            k.classList = ['transitioning'];
        });
        setTimeout(() => {
            [].forEach.call(c.children, (k) => {
                k.classList = [''];
            });
        }, 1000);
    }
    next() {

        this.searchFilter.pageForward();
        this.state.search = this.searchFilter.renderSearch();
        this.store.dispatch({ action: 'RENDER' });
        const c = document.getElementById('decksearchresults');
        [].forEach.call(c.children, (k) => {
            k.classList = ['transitioning'];
        });
        setTimeout(() => {
            [].forEach.call(c.children, (k) => {
                k.classList = [''];
            });
        }, 1000);

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

    onSearchChange(event) {
        if (!event.target.id) {
            return;
        }

        const id = event.target.id;
        let value = (isNaN(Number(event.target.value))) ? undefined : Number(event.target.value);
        if (!this.filterKeys.includes(id)) {
            return;
        }
        if (event.target.value === 'undefined') {
            value = undefined;
        }
        if (this.settings[id] === value && value) {
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
                this.settings[id] = (event.target.value === 'undefined') ? undefined : event.target.value;
                break;
            case 'cardname':
                this.settings[id] = (event.target.value) ? event.target.value : undefined;
                break;
            case 'description':
                this.settings[id] = (event.target.value) ? event.target.value : undefined;
                break;
            case 'banlist':
                this.settings[id] = (event.target.value) ? event.target.value : undefined;
                this.applyBanlist();
                break;
            case 'level':
                this.settings[id] = (value === 0) ? undefined : value;
            default:
                this.settings[id] = value;
        }
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
            return element('div', { key: `x${i}${name}` }, `${hashMap[name]}x ${name}`)
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

    cardTypes() {
        const element = React.createElement;
        switch (this.settings.cardtype) {
            case 1:
                return [element('select', { id: 'type1', onChange: this.onSearchChange.bind(this) }, [
                    element('option', { value: 'undefined' }, 'Frame'),
                    element('option', { value: 0x40 }, 'Fusion'),
                    element('option', { value: 0x80 }, 'Ritual'),
                    element('option', { value: 0x2000 }, 'Synchro'),
                    element('option', { value: 0x800000 }, 'Xyz'),
                    element('option', { value: 0x1000000 }, 'Pendulum'),
                    element('option', { value: 0x4000000 }, 'Link')
                ]),
                element('select', { id: 'type2', onChange: this.onSearchChange.bind(this) }, [
                    element('option', { value: 'undefined' }, 'Sub Card Type'),
                    element('option', { value: 0x10 }, 'Normal'),
                    element('option', { value: 0x20 }, 'Effect'),
                    element('option', { value: 0x200 }, 'Spirit'),
                    element('option', { value: 0x400 }, 'Union'),
                    element('option', { value: 0x1000 }, 'Tuner'),
                    element('option', { value: 0x800 }, 'Gemini'),
                    element('option', { value: 0x400000 }, 'Toon')]),
                element('select', { id: 'attribute', onChange: this.onSearchChange.bind(this) }, [
                    element('option', { value: 'undefined' }, 'Attribute'),
                    element('option', { value: 1 }, 'EARTH'),
                    element('option', { value: 2 }, 'WATER'),
                    element('option', { value: 4 }, 'FIRE'),
                    element('option', { value: 8 }, 'WIND'),
                    element('option', { value: 16 }, 'LIGHT'),
                    element('option', { value: 32 }, 'DARK'),
                    element('option', { value: 64 }, 'DIVINE')]),
                element('select', { id: 'race', onChange: this.onSearchChange.bind(this) }, [
                    element('option', { value: 'undefined' }, 'Type'),
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
                    element('option', { value: 'undefined' }, 'Icon'),
                    element('option', { value: 2 }, 'Normal'),
                    element('option', { value: 65538 }, 'Quick-Play'),
                    element('option', { value: 131074 }, 'Continous'),
                    element('option', { value: 130 }, 'Ritual'),
                    element('option', { value: 262146 }, 'Field'),
                    element('option', { value: 524290 }, 'Equip')
                ]);
            case 4: //Traps
                return element('select', { id: 'exacttype', onChange: this.onSearchChange.bind(this) }, [
                    element('option', { value: 'undefined' }, 'Icon'),
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
        return element('div', { key: 'link-col', className: 'filtercol' }, [
            element('control', { id: 'linkmarkers' }, [
                element('input', { id: 'link1', type: 'checkbox', onChange: this.onLinkChange.bind(this, 0) }),
                element('input', { id: 'link2', type: 'checkbox', onChange: this.onLinkChange.bind(this, 1) }),
                element('input', { id: 'link3', type: 'checkbox', onChange: this.onLinkChange.bind(this, 2) }),
                element('br'),
                element('input', { id: 'link4', type: 'checkbox', onChange: this.onLinkChange.bind(this, 3) }),
                element('input', {
                    type: 'checkbox', style: {
                        visibility: 'hidden'
                    }
                }),
                element('input', { id: 'link5', type: 'checkbox', onChange: this.onLinkChange.bind(this, 4) }),
                element('br'),
                element('input', { id: 'link6', type: 'checkbox', onChange: this.onLinkChange.bind(this, 5) }),
                element('input', { id: 'link7', type: 'checkbox', onChange: this.onLinkChange.bind(this, 6) }),
                element('input', { id: 'link8', type: 'checkbox', onChange: this.onLinkChange.bind(this, 7) })
            ])
        ]);
    }
    renderStats() {
        const element = React.createElement;
        if (this.settings.cardtype !== 1) {
            return element('br', {});
        }
        return [element('div', { className: 'filterrow' }, [
            element('input', { id: 'atk', placeholder: 'Attack', type: 'number', onChange: this.onSearchChange.bind(this) }),
            element('select', { id: 'atkop', onChange: this.onSearchChange.bind(this) }, [
                element('option', { value: 0 }, '='),
                element('option', { value: -2 }, '<'),
                element('option', { value: -1 }, '<='),
                element('option', { value: 1 }, '>='),
                element('option', { value: 2 }, '>')
            ])
        ]),
        element('div', { className: 'filterrow' }, [
            element('input', { id: 'def', placeholder: 'Defense', type: 'number', onChange: this.onSearchChange.bind(this) }),
            element('select', { id: 'defop', onChange: this.onSearchChange.bind(this) }, [
                element('option', { value: 0 }, '='),
                element('option', { value: -2 }, '<'),
                element('option', { value: -1 }, '<='),
                element('option', { value: 1 }, '>='),
                element('option', { value: 2 }, '>')
            ])
        ]),
        element('div', { className: 'filterrow' }, [
            element('input', { id: 'level', placeholder: 'Level/Rank/Rating', type: 'number', onChange: this.onSearchChange.bind(this) }),
            element('select', { id: 'levelop', onChange: this.onSearchChange.bind(this) }, [
                element('option', { value: 0 }, '='),
                element('option', { value: -2 }, '<'),
                element('option', { value: -1 }, '<='),
                element('option', { value: 1 }, '>='),
                element('option', { value: 2 }, '>')
            ])
        ]),
        element('div', { className: 'filterrow' }, [
            element('input', { id: 'scale', placeholder: 'Scale', type: 'number', onChange: this.onSearchChange.bind(this) }),
            element('select', { id: 'scaleop', onChange: this.onSearchChange.bind(this), max: 13, min: 0 }, [
                element('option', { value: 0 }, '='),
                element('option', { value: -2 }, '<'),
                element('option', { value: -1 }, '<='),
                element('option', { value: 1 }, '>='),
                element('option', { value: 2 }, '>')
            ])
        ])];
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

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.onSearchChange(event);
        }
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
            element('div', {
                id: 'decksetup',
                onDragOver: function (event, x) {
                    event.preventDefault();
                },
                onDrop: this.onDropExitZone.bind(this)
            }, [

                element('div', { id: 'searchfilter' }, [
                    element('h2', {}, 'Setup'),
                    element('br'),
                    element('h3', {}, 'Filter'),
                    element('controls', {}, [
                        element('div', { key: 'col-1', className: 'filtercol' }, [
                            element('select', { id: 'cardtype', onChange: this.onSearchChange.bind(this) }, [
                                element('option', { key: 'cardtype-1', value: 5 }, 'Monster/Spell/Trap'),
                                element('option', { key: 'cardtype-2', value: 1 }, 'Monster'),
                                element('option', { key: 'cardtype-3', value: 2 }, 'Spell'),
                                element('option', { key: 'cardtype-4', value: 4 }, 'Trap')
                            ]),
                            element('div', { className: 'filtercol' }, this.cardTypes()),

                            element('select', { id: 'setcode', onChange: this.onSearchChange.bind(this) }, [
                                element('option', { value: 'undefined' }, 'Archetype')
                            ].concat(this.state.setcodes.map((list, i) => {
                                return React.createElement('option', { key: `setcode-${i}`, value: parseInt(list.num) }, list.name);
                            }))),
                            element('select', { key: 'release', id: 'release', onChange: this.onSearchChange.bind(this) }, this.renderReleases()),
                            element('select', { key: 'limit', id: 'limit', onChange: this.onSearchChange.bind(this) }, [
                                element('option', { value: 'null' }, 'Limit'),
                                element('option', { value: 3 }, 'Unlimited'),
                                element('option', { value: 2 }, 'Semi-Limited'),
                                element('option', { value: 1 }, 'Limited'),
                                element('option', { value: 0 }, 'Forbidden')
                            ]),
                            element('input', {
                                id: 'cardname', type: 'text', placeholder: 'Name',
                                onKeyPress: this.handleKeyPress.bind(this),
                                onBlur: this.onSearchChange.bind(this)
                            }),
                            element('input', {
                                id: 'description', type: 'text', placeholder: 'Card Text',
                                onKeyPress: this.handleKeyPress.bind(this),
                                onBlur: this.onSearchChange.bind(this)
                            }),
                            this.renderStats(),
                            element('button', { onClick: this.clearSearch.bind(this) }, 'Reset')
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
                            React.createElement('select', { id: 'banlist', onChange: this.onSearchChange.bind(this) }, this.state.banlist.map((list, i) => {
                                return React.createElement('option', { value: list.name, selected: list.primary }, list.name);
                            }))

                        ]),
                        element('div', { className: 'deckcontrols' }, [
                            element('h3', { style: { width: 'auto' } }, 'Upload YDK File'),
                            element('input', { type: 'file', accept: '.ydk', placeholder: 'Choose File', onChange: this.upload.bind() })]),
                        element('div', { className: 'deckcontrols' }, [
                            element('button', { onClick: this.newDeck.bind(this) }, 'New'),
                            element('button', { onClick: this.save.bind(this) }, 'Save'),
                            element('button', { onClick: this.delete.bind(this) }, 'Delete'),
                            element('button', { onClick: this.rename.bind(this) }, 'Rename'),
                            element('button', { onClick: this.clear.bind(this) }, 'Clear'),

                            element('button', { onClick: this.sort.bind(this) }, 'Sort'),
                            element('button', { onClick: this.shuffle.bind(this) }, 'Shuffle'),
                            element('button', { onClick: this.export.bind(this) }, 'Export'),
                            element('button', { onClick: this.saveAs.bind(this) }, 'Save As')
                        ])

                    ])
                ]),
                element('div', { id: 'decktextlist' }, this.renderCardList())
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
                element('div', { id: 'decksearchresultsofx' }, `${Math.ceil(this.searchFilter.currentSearchNumberOfPages)} of ${this.searchFilter.maxPages}`),
                element('button', { id: 'next', onClick: this.next.bind(this) }, '>'),
                element('div', { id: 'cardinformation' }, this.info.render())
            ]),
            element('div', { id: 'deckarea' }, [
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
            ])
        ];
    }
}