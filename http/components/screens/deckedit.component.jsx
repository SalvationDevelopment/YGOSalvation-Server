import React, { useEffect, useState } from 'react';
import SearchFilter from '../../services/cardsearch.service';
import CardInfo from '../duel/cardinfo.component';
import { cardStackSort, cardEvaluate } from '../../services/util/cardManipulation';
import { hey, listen, watchOut } from '../../services/store';

/*global React, ReactDOM, SearchFilter, store, cardIs*/

/**
 * Shuffles an array in place, multiple times.
 * @param {Array} array to shuffle
 * @returns {void}
 */
function deepShuffle(array) {
    // eslint-disable-next-line no-plusplus
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
            // eslint-disable-next-line no-underscore-dangle
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


export default function DeckEditScreen() {


    let searchFilter = new SearchFilter([]),
        info = new CardInfo([]),

        settings = {
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
        },

        fullDatabase = [];

    const [search] = useState([]),
        [setcodes] = useState([]),
        [releases] = useState([]),
        [banlist] = useState([]),
        [decks] = useState([]),
        [last] = useState([]),
        [activeDeck] = useState({
            name: 'New Deck',
            main: [],
            extra: [],
            side: []
        }),
        filterKeys = Object.keys(settings);


    useEffect(() => {
        listen('CARD_HOVER', (event, state) => {
            if (!event.id) {
                return;
            }
            const description = info.update({
                id: event.id
            });
            hey({ action: 'RENDER' });
            return {
                id: event.id,
                description
            };
        });

        watchOut('BANLIST', (action) => {
            settings.banlist = action.primary;
            banlist = action.banlist;
            console.log(action);
            applyBanlist();
            hey({ action: 'RENDER' });
        });


        listen('LOAD_DECKS', (action) => {
            settings.decklist = '0';
            if (!action.decks) {
                return;
            }
            search = [];
            decks = action.decks.map((deckIds) => {
                const deck = Object.assign({}, deckIds);
                deck.main = deck.main.map(findcard);
                deck.extra = deck.extra.map(findcard);
                deck.side = deck.side.map(findcard);

                return deck;
            });
            activeDeck = decks[settings.decklist] || activeDeck;
            hey({ action: 'RENDER' });
        });

        listen('LOAD_DATABASE', (action) => {
            fullDatabase = action.data;
            info = new CardInfo(action.data);
        });

        listen('LOAD_SETCODES', (action) => {
            setcodes = action.data;
            hey({ action: 'RENDER' });
        });
        listen('LOAD_RELEASES', (action) => {
            releases = action.sets;
            hey({ action: 'RENDER' });
        });

        listen('IMPORT', (action) => {
            importDeck(action.file, action.name);
        });
    });

    function applyBanlist() {
        const activeBanlist = banlist.find((list) => (list.name === settings.banlist)),
            database = fullDatabase;
        let map = {},
            result = [],
            filteredCards = [],
            region = activeBanlist.region;
        database.forEach(function (card) {
            map[card.id] = card;
        });

        if (!activeBanlist) {
            return;
        }

        result = Object.keys(map).map(function (id) {
            map[id].limit = (activeBanlist.bannedCards[id] !== undefined)
                ? parseInt(activeBanlist.bannedCards[id], 10)
                : 3;
            return map[id];
        });

        filteredCards = result.filter(function (card) {
            if (!(region && activeBanlist.endDate)) {
                return true;
            }
            if (!card[region]) {
                return false;
            }

            if (card[region].date) {
                return new Date(activeBanlist.endDate).getTime() > new Date(card[region].date).getTime();
            }
            return false;

        });

        searchFilter = new SearchFilter(filteredCards.sort(cardStackSort));
        searchFilter.preformSearch();
        search = searchFilter.renderSearch();
    }

    function findcard(card) {
        return fullDatabase.find((item) => card.id === item.id);
    }

    function searchDB() {
        Object.assign(searchFilter.currentFilter, settings);
        searchFilter.preformSearch();
        search = searchFilter.renderSearch();
        hey({ action: 'RENDER' });
    }
    function clearSearch() {
        const searchBox = document.querySelector('#cardname'),
            description = document.querySelector('#description'),
            cardtype = document.querySelector('#cardtype');

        searchBox.value = '';
        description.value = '';
        cardtype.value = 5;

        searchFilter.clearFilter();
        search = searchFilter.renderSearch();
        settings = {
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

        hey({ action: 'RENDER' });
    }

    function save() {
        decks[settings.decklist] = activeDeck;
        hey({ action: 'SAVE_DECK', deck: activeDeck });
    }

    function newDeck() {
        const oldDeck = (decks[settings.decklist]) ? decks[settings.decklist] : { name: 'New Deck' },
            deck = {
                main: [],
                extra: [],
                side: []
            }, name = window.prompt('New Deck Name?', oldDeck.name);

        if (!name) {
            return;
        }
        if (decks.some((unit) => name === unit.name)) {
            return;
        }
        deck.name = name;
        deck.creationDate = new Date();
        decks.push(deck);
        settings.decklist = decks.length - 1;
        activeDeck = decks[settings.decklist];
        save();
        hey({ action: 'RENDER' });
        setTimeout(() => {
            var element = document.getElementById('decklist');
            element.value = settings.decklist;
        }, 200);


    }

    function saveAs() {
        const deck = {},
            name = prompt('Save As?', decks[settings.decklist].name);
        if (!name) {
            return;
        }
        if (name === decks[settings.decklist].name) {
            return;
        }
        Object.assign(deck, JSON.parse(JSON.stringify(activeDeck)));
        deck.name = name;
        deck.creationDate = new Date();
        decks.push(deck);
        settings.decklist = decks.length - 1;
        activeDeck = decks[settings.decklist];
        save();
        hey({ action: 'RENDER' });
        setTimeout(() => {
            var element = document.getElementById('decklist');
            element.value = settings.decklist;
        }, 200);
    }
    function deleteDeck() {
        const ok = confirm(`Delete ${decks[settings.decklist].name}?`);
        if (!ok) {
            return;
        }


        hey({ action: 'DELETE_DECK', deck: activeDeck });
        hey({ action: 'RENDER' });
        decks.splice(settings.decklist, 1);
        settings.decklist = decks.length - 1;
        activeDeck = decks[settings.decklist];
        setTimeout(() => {
            var element = document.getElementById('decklist');
            element.value = settings.decklist;
        }, 200);
    }
    function rename() {
        const name = prompt('Deck Name?', decks[settings.decklist].name);
        if (!name) {
            return;
        }
        decks[settings.decklist].name = name;
        save();
    }
    function clear() {
        activeDeck = {
            name: 'New Deck',
            main: [],
            extra: [],
            side: []
        };
    }

    function sort() {
        activeDeck.main.sort(cardEvaluate);
        activeDeck.extra.sort(cardEvaluate);
        activeDeck.side.sort(cardEvaluate);
    }

    function shuffle() {
        deepShuffle(activeDeck.main);
        hey({ action: 'RENDER' });
    }

    function exportDeck() {
        let file = '#Created by ' + activeDeck.owner + ' on ' + activeDeck.creationDate + '\r\n#main';

        function printCard(card) {
            file += card.id + '\r\n';
        }
        activeDeck.main.forEach(printCard);
        file += '#extra\r\n';
        activeDeck.extra.forEach(printCard);
        file += '!side\r\n';
        activeDeck.side.forEach(printCard);

        const url = 'data:application/octet-stream;charset=utf-16le;base64,' + btoa(file),
            element = document.createElement('a');
        element.setAttribute('href', url);
        element.setAttribute('download', activeDeck.name + '.ydk');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    function upload(event) {
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
                hey({
                    action: 'IMPORT',
                    file,
                    name: name.substring(0, name.lastIndexOf('.'))
                });
            }
        });
        r.readAsText(f);
    }

    function importDeck(file, name) {


        var deck = makeDeckfromydk(file);
        deck.name = name;
        deck.owner = localStorage.nickname;
        deck.creationDate = new Date();
        deck.main = deck.main.map((cardid) => {
            return findcard({
                id: parseInt(cardid, 10)
            });
        }).filter((card) => card);
        deck.side = deck.side.map((cardid) => {
            return findcard({
                id: parseInt(cardid, 10)
            });
        }).filter((card) => card);
        deck.extra = deck.extra.map((cardid) => {
            return findcard({
                id: parseInt(cardid, 10)
            });
        }).filter((card) => card);
        decks.push(deck);
        settings.decklist = decks.length - 1;
        activeDeck = decks[settings.decklist];
        save();
        hey({ action: 'RENDER' });
        setTimeout(() => {
            var element = document.getElementById('decklist');
            element.value = settings.decklist;
        }, 200);

    }

    function prev() {
        searchFilter.pageBack();
        search = searchFilter.renderSearch();
        hey({ action: 'RENDER' });
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
    function next() {

        searchFilter.pageForward();
        search = searchFilter.renderSearch();
        hey({ action: 'RENDER' });
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

    function searchScroll(event) {
        var searchBox = document.querySelector('#decksearchresults');
        if (searchBox.scrollTop >= (searchBox.scrollHeight - searchBox.offsetHeight)) {
            searchFilter.currentSearchPageSize += 30;
            search = searchFilter.renderSearch();
            hey({ action: 'RENDER' });
        }
    }

    function marginClass(deck) {
        if (deck.length <= 40) {
            return '';
        }
        if (deck.length >= 40 && deck.length <= 48) {
            return 'c48';
        }
        return 'c60';
    }

    function onChange(event) {
        const id = event.target.id;
        if (!id) {
            return;
        }

        settings[id] = event.target.value;
        if (event.target.value === 'on') {
            settings[id] = event.target.checked;
        }
        if (id === 'decklist') {
            activeDeck = decks[settings[id]];
        }
        searchDB();
    }

    function onLinkChange(pointer, event) {
        settings.links[pointer] = (event.target.checked) ? pointer : null;
        searchDB();
    }

    function onSearchChange(event) {
        if (!event.target.id) {
            return;
        }

        const id = event.target.id;
        let value = (isNaN(Number(event.target.value))) ? undefined : Number(event.target.value);
        if (!filterKeys.includes(id)) {
            return;
        }
        if (event.target.value === 'undefined') {
            value = undefined;
        }
        if (settings[id] === value && value) {
            return;
        }

        switch (id) {
            case 'cardtype':
                settings[id] = value;
                settings.type = Number(event.target.value);
                settings.exacttype = undefined;
                settings.type1 = undefined;
                settings.type2 = undefined;
                break;
            case 'release':
                settings[id] = (event.target.value === 'undefined') ? undefined : event.target.value;
                break;
            case 'cardname':
                settings[id] = (event.target.value) ? event.target.value : undefined;
                break;
            case 'description':
                settings[id] = (event.target.value) ? event.target.value : undefined;
                break;
            case 'banlist':
                settings[id] = (event.target.value) ? event.target.value : undefined;
                applyBanlist();
                break;
            case 'level':
                settings[id] = (value === 0) ? undefined : value;
                break;
            default:
                settings[id] = value;
        }
        searchDB();
    }

    function setIndex(source, index) {
        overIndex = { source, index };
    }

    function onDragStart(source, i, event) {
        var c = event.target.childNodes;
        event.dataTransfer.setData('index', i);
        event.dataTransfer.setData('source', source);
        event.target.style.opacity = '0';
    }

    function onDragEnd(event) {
        event.target.style.opacity = '1';
    }

    function renderCardCollection(source, input) {
        const element = React.createElement;
        return input.map((card, i) => {
            card.uid = i;

            return element('div', {
                key: `${card.uid}-${card.name}`,
                draggable: true,
                'data-limit': card.limit,
                onDragOver: setIndex.bind(this, source, i),
                onDragStart: onDragStart.bind(this, source, i),
                onDragEnd: onDragEnd,
                onDoubleClick: onCardDoubleClick.bind(this, source, i),
                onContextMenu: onCardDoubleClick.bind(this, source, i)
            }, new CardImage(card, store).render());
        });
    }

    function listReduce(deck) {
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

    function renderCardList() {
        const element = React.createElement,
            main = listReduce(activeDeck.main),
            side = listReduce(activeDeck.side),
            extra = listReduce(activeDeck.extra);
        return [
            element('h4', {}, `Main Deck - ${activeDeck.main.length}x`),
            main,
            element('h4', {}, `Side Deck - ${activeDeck.side.length}x`),
            side,
            element('h4', {}, `Extra Deck - ${activeDeck.extra.length}x`),
            extra];
    }

    function cardTypes() {
        const element = React.createElement;
        switch (settings.cardtype) {
            case 1:
                return [element('select', { id: 'type1', onChange: onSearchChange }, [
                    element('option', { value: 'undefined' }, 'Frame'),
                    element('option', { value: 0x40 }, 'Fusion'),
                    element('option', { value: 0x80 }, 'Ritual'),
                    element('option', { value: 0x2000 }, 'Synchro'),
                    element('option', { value: 0x800000 }, 'Xyz'),
                    element('option', { value: 0x1000000 }, 'Pendulum'),
                    element('option', { value: 0x4000000 }, 'Link')
                ]),
                element('select', { id: 'type2', onChange: onSearchChange }, [
                    element('option', { value: 'undefined' }, 'Sub Card Type'),
                    element('option', { value: 0x10 }, 'Normal'),
                    element('option', { value: 0x20 }, 'Effect'),
                    element('option', { value: 0x200 }, 'Spirit'),
                    element('option', { value: 0x400 }, 'Union'),
                    element('option', { value: 0x1000 }, 'Tuner'),
                    element('option', { value: 0x800 }, 'Gemini'),
                    element('option', { value: 0x400000 }, 'Toon')]),
                element('select', { id: 'attribute', onChange: onSearchChange }, [
                    element('option', { value: 'undefined' }, 'Attribute'),
                    element('option', { value: 1 }, 'EARTH'),
                    element('option', { value: 2 }, 'WATER'),
                    element('option', { value: 4 }, 'FIRE'),
                    element('option', { value: 8 }, 'WIND'),
                    element('option', { value: 16 }, 'LIGHT'),
                    element('option', { value: 32 }, 'DARK'),
                    element('option', { value: 64 }, 'DIVINE')]),
                element('select', { id: 'race', onChange: onSearchChange }, [
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
                return element('select', { id: 'exacttype', onChange: onSearchChange }, [
                    element('option', { value: 'undefined' }, 'Icon'),
                    element('option', { value: 2 }, 'Normal'),
                    element('option', { value: 65538 }, 'Quick-Play'),
                    element('option', { value: 131074 }, 'Continous'),
                    element('option', { value: 130 }, 'Ritual'),
                    element('option', { value: 262146 }, 'Field'),
                    element('option', { value: 524290 }, 'Equip')
                ]);
            case 4: //Traps
                return element('select', { id: 'exacttype', onChange: onSearchChange }, [
                    element('option', { value: 'undefined' }, 'Icon'),
                    element('option', { value: 4 }, 'Normal'),
                    element('option', { value: 131076 }, 'Continous'),
                    element('option', { value: 1048580 }, 'Counter')
                ]);

            default:
        }
    }

    function renderLinks() {
        const element = React.createElement;
        if (settings.cardtype !== 1) {
            return element('br', { key: 'linkbr1' });
        }
        return element('div', { key: 'deckedit-link-col', className: 'filtercol' }, [
            element('control', { id: 'linkmarkers', key: 'deckedit-link-col-coltrol' }, [
                element('input', { id: 'link1', key: 'link0', type: 'checkbox', onChange: onLinkChange.bind(this, 0) }),
                element('input', { id: 'link2', key: 'link1', type: 'checkbox', onChange: onLinkChange.bind(this, 1) }),
                element('input', { id: 'link3', key: 'link2', type: 'checkbox', onChange: onLinkChange.bind(this, 2) }),
                element('br', { key: 'link' }),
                element('input', { id: 'link4', key: 'link3', type: 'checkbox', onChange: onLinkChange.bind(this, 3) }),
                element('input', {
                    type: 'checkbox', key: 'linkx', style: {
                        visibility: 'hidden'
                    }
                }),
                element('input', { id: 'link5', key: 'link4', type: 'checkbox', onChange: onLinkChange.bind(this, 4) }),
                element('br', { key: 'linkbr2' }),
                element('input', { id: 'link6', key: 'link5', type: 'checkbox', onChange: onLinkChange.bind(this, 5) }),
                element('input', { id: 'link7', key: 'link6', type: 'checkbox', onChange: onLinkChange.bind(this, 6) }),
                element('input', { id: 'link8', key: 'link7', type: 'checkbox', onChange: onLinkChange.bind(this, 7) })
            ])
        ]);
    }
    function renderStats() {
        const element = React.createElement;
        if (settings.cardtype !== 1) {
            return element('br', { key: 'blank-stats' });
        }
        return [element('div', { className: 'filterrow', key: 'div-render-stats' }, [
            element('input', { key: 'atk', id: 'atk', placeholder: 'Attack', type: 'number', onChange: onSearchChange }),
            element('select', { key: 'atkop', id: 'atkop', onChange: onSearchChange }, [
                element('option', { value: 0 }, '='),
                element('option', { value: -2 }, '<'),
                element('option', { value: -1 }, '<='),
                element('option', { value: 1 }, '>='),
                element('option', { value: 2 }, '>')
            ])
        ]),
        element('div', { className: 'filterrow' }, [
            element('input', { id: 'def', placeholder: 'Defense', type: 'number', onChange: onSearchChange }),
            element('select', { id: 'defop', onChange: onSearchChange }, [
                element('option', { value: 0 }, '='),
                element('option', { value: -2 }, '<'),
                element('option', { value: -1 }, '<='),
                element('option', { value: 1 }, '>='),
                element('option', { value: 2 }, '>')
            ])
        ]),
        element('div', { className: 'filterrow' }, [
            element('input', { id: 'level', placeholder: 'Level/Rank/Rating', type: 'number', onChange: onSearchChange }),
            element('select', { id: 'levelop', onChange: onSearchChange }, [
                element('option', { value: 0 }, '='),
                element('option', { value: -2 }, '<'),
                element('option', { value: -1 }, '<='),
                element('option', { value: 1 }, '>='),
                element('option', { value: 2 }, '>')
            ])
        ]),
        element('div', { className: 'filterrow' }, [
            element('input', { id: 'scale', placeholder: 'Scale', type: 'number', onChange: onSearchChange }),
            element('select', { id: 'scaleop', onChange: onSearchChange, max: 13, min: 0 }, [
                element('option', { value: 0 }, '='),
                element('option', { value: -2 }, '<'),
                element('option', { value: -1 }, '<='),
                element('option', { value: 1 }, '>='),
                element('option', { value: 2 }, '>')
            ])
        ])];
    }

    function onCardDoubleClick(source, index, event) {
        event.preventDefault();
        if (source === 'search') {
            const card = search[index];
            let legal = checkLegality(card, 'main', activeDeck, banlist);
            if (!legal) {
                return;
            }
            if (isExtra(card)) {
                legal = checkLegality(card, 'extra', activeDeck, banlist);
                activeDeck.extra.push(card);
                hey({ action: 'RENDER' });
                return;
            }
            activeDeck.main.push(card);
            hey({ action: 'RENDER' });
            return;
        }

        activeDeck[source].splice(index, 1);
        hey({ action: 'RENDER' });

    }

    function onDropExitZone(event) {
        const index = event.dataTransfer.getData('index'),
            source = event.dataTransfer.getData('source');

        if (source === 'search') {
            return;
        }

        activeDeck[source].splice(index, 1);
        hey({ action: 'RENDER' });
        event.preventDefault();
    }

    function onDropDeckZone(zone, event) {

        const index = event.dataTransfer.getData('index'),
            source = event.dataTransfer.getData('source'),
            insert = overIndex,
            list = (source === 'search') ? search : activeDeck[source],
            card = list[index];

        if (!card) {
            return;
        }
        if (zone === 'extra' && !isExtra(card)) {
            return;
        }
        if (zone === 'main' && isExtra(card)) {
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

        hey({ action: 'RENDER' });
        event.preventDefault();
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            onSearchChange(event);
        }
    }

    function renderReleases() {
        const element = React.createElement,
            list = releases.map((set, i) => {
                return element('option', { key: `release-${i}`, value: set }, set);
            });
        return [element('option', { value: 'undefined', key: 'releaseset' }, 'Release Set')].concat(list);
    }

    return (function render() {
        const element = React.createElement;
        return [
            element('div', {
                id: 'decksetup',
                onDragOver: function (event, x) {
                    event.preventDefault();
                },
                onDrop: onDropExitZone
            }, [

                element('div', { id: 'searchfilter' }, [
                    element('h2', { key: 'deckedit-h2-1' }, 'Setup'),
                    element('br', { key: 'deckedit-br-1' }),
                    element('h3', {}, 'Filter'),
                    element('controls', { key: 'deckedit-card-controls' }, [
                        element('div', { key: 'deckedit-col-1', className: 'filtercol', key: 'deckedit-filtercol-1' }, [
                            element('select', { key: 'deckedit-cardtype', id: 'cardtype', onChange: onSearchChange }, [
                                element('option', { key: 'deckedit-cardtype-1', value: 5 }, 'Monster/Spell/Trap'),
                                element('option', { key: 'deckedit-cardtype-2', value: 1 }, 'Monster'),
                                element('option', { key: 'deckedit-cardtype-3', value: 2 }, 'Spell'),
                                element('option', { key: 'deckedit-cardtype-4', value: 4 }, 'Trap')
                            ]),
                            element('div', { className: 'filtercol', key: 'deckedit-filtercol-2' }, cardTypes()),

                            element('select', { key: 'deckedit-setcode', id: 'setcode', onChange: onSearchChange }, [
                                element('option', { value: 'undefined', key: 'deckedit-setcode-undefined' }, 'Archetype')
                            ].concat(setcodes.map((list, i) => {
                                return React.createElement('option', { key: `setcode-${i}`, value: parseInt(list.num) }, list.name);
                            }))),
                            element('select', { key: 'deckedit-release', id: 'release', onChange: onSearchChange }, renderReleases()),
                            element('select', { key: 'deckedit-limit', id: 'limit', onChange: onSearchChange }, [
                                element('option', { value: 'null', key: 'deckedit-limit-null' }, 'Limit'),
                                element('option', { value: 3, key: 'deckedit-limit-0' }, 'Unlimited'),
                                element('option', { value: 2, key: 'deckedit-limit-1' }, 'Semi-Limited'),
                                element('option', { value: 1, key: 'deckedit-limit-2' }, 'Limited'),
                                element('option', { value: 0, key: 'deckedit-limit-3' }, 'Forbidden')
                            ]),
                            element('input', {
                                key: 'deckedit-cardname-input',
                                id: 'cardname', type: 'text', placeholder: 'Name',
                                onKeyPress: handleKeyPress,
                                onBlur: onSearchChange
                            }),
                            element('input', {
                                key: 'deckedit-description-input',
                                id: 'description', type: 'text', placeholder: 'Card Text',
                                onKeyPress: handleKeyPress,
                                onBlur: onSearchChange
                            }),
                            renderStats(),
                            element('button', {
                                key: 'deckedit-clearsearch',
                                onClick: clearSearch
                            }, 'Reset')
                        ]),
                        renderLinks()
                    ]),
                    element('controls', { key: 'deck-banlist-controls' }, [
                        element('div', { className: 'filtercol' }, [
                            element('h3', { key: 'deck-controls-label' }, 'Deck'),
                            element('h3', { key: 'banlist-controls-label' }, 'Banlist')
                        ]),

                        element('div', { className: 'filtercol' }, [
                            element('select', { id: 'decklist', key: 'deckedit-decklist-select', onChange: onChange }, decks.map((list, i) => {
                                return React.createElement('option', { value: i }, list.name);
                            })),
                            React.createElement('select', { id: 'banlist', key: 'deckedit-ban;list-select', onChange: onSearchChange }, banlist.map((list, i) => {
                                return React.createElement('option', { value: list.name, selected: list.primary }, list.name);
                            }))

                        ]),
                        element('div', { className: 'deckcontrols', key: 'deckedit-deckcontrols-div1' }, [
                            element('h3', { style: { width: 'auto' } }, 'Upload YDK File'),
                            element('input', { type: 'file', accept: '.ydk', placeholder: 'Choose File', onChange: upload })]),
                        element('div', { className: 'deckcontrols', key: 'deckedit-deckcontrols-div2' }, [
                            element('button', { key: 'deckedit-decklist-0', onClick: newDeck }, 'New'),
                            element('button', { key: 'deckedit-decklist-1', onClick: save }, 'Save'),
                            element('button', { key: 'deckedit-decklist-2', onClick: deleteDeck }, 'Delete'),
                            element('button', { key: 'deckedit-decklist-3', onClick: rename }, 'Rename'),
                            element('button', { key: 'deckedit-decklist-4', onClick: clear }, 'Clear'),

                            element('button', { key: 'deckedit-decklist-5', onClick: sort }, 'Sort'),
                            element('button', { key: 'deckedit-decklist-6', onClick: shuffle }, 'Shuffle'),
                            element('button', { key: 'deckedit-decklist-7', onClick: exportDeck }, 'Export'),
                            element('button', { key: 'deckedit-decklist-8', onClick: saveAs }, 'Save As')
                        ])

                    ])
                ]),
                element('div', { id: 'decktextlist', key: 'deckedit-decktextlist-div' }, renderCardList())
            ]),

            element('div', {
                id: 'decksearch',
                onDragOver: function (event, x) {
                    event.preventDefault();
                },
                onDrop: onDropExitZone
            }, [

                element('div', { id: 'decksearchtitles' }, [
                    element('h2', {}, 'Search Results'),
                    element('h2', {}, 'Card Information')
                ]),

                element('div', { id: 'decksearchresults', onScroll: searchScroll }, renderCardCollection('search', search)),
                element('div', { id: 'decksearchresultsofx' }, `${searchFilter.currentSearch.length} cards found`),
                element('div', { id: 'cardinformation' }, info.render())
            ]),
            element('div', { id: 'deckarea' }, [
                element('div', { id: 'deckareamain' }, [
                    element('h2', {}, 'Main Deck'),
                    element('div', {
                        className: `deckmetainfo ${marginClass(activeDeck.main)}`,
                        onDragOver: function (event, x) {
                            event.preventDefault();
                        },
                        onDrop: onDropDeckZone.bind(this, 'main')
                    }, renderCardCollection('main', activeDeck.main)),
                    element('div', { id: 'main' })
                ]),
                element('div', { id: 'deckareaextra' }, [
                    element('h2', {}, 'Extra Deck'),
                    element('div', {
                        className: 'deckmetainfo',
                        onDragOver: function (event, x) {
                            event.preventDefault();
                        },
                        onDrop: onDropDeckZone.bind(this, 'extra')
                    }, renderCardCollection('extra', activeDeck.extra)),
                    element('div', { id: 'main' })
                ]),
                element('div', { id: 'deckareaside' }, [
                    element('h2', {}, 'Side Deck'),
                    element('div', {
                        className: 'deckmetainfo',
                        onDragOver: function (event, x) {
                            event.preventDefault();
                        },
                        onDrop: onDropDeckZone.bind(this, 'side')
                    }, renderCardCollection('side', activeDeck.side)),
                    element('div', { id: 'main' })
                ])
            ])
        ];
    }());
}