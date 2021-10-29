import React, { useEffect, useState } from 'react';
import SearchFilter from '../../services/cardsearch.service';
import CardInfo from '../duel/cardinfo.component';
import { cardStackSort, cardEvaluate, deepShuffle, isExtra } from '../../util/cardManipulation';
import { hey, listen, watchOut } from '../../services/listener.service';
import { CardImage } from '../common/card.component';


let searchFilter = new SearchFilter([]),
    fullDatabse = [],
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
    overIndex;

function listReduce(deck) {
    const hashMap = deck.reduce((list, card) => {
        if (!list[card.name]) {
            list[card.name] = 1;
            return list;
        }
        list[card.name] = list[card.name] + 1;
        return list;
    }, {}),
        text = Object.keys(hashMap).map((name, i) => {
            const listText = `${hashMap[name]}x ${name}`;
            return (<div key={`x${i}${name}`}>{listText}</div>);
        });

    return function Deck() {
        return <>{text}</>;
    };

}

function CardList(activeDeck) {
    const Main = listReduce(activeDeck.main),
        Side = listReduce(activeDeck.side),
        Extra = listReduce(activeDeck.extra);
    return <div id='decktextlist' key='deckedit-decktextlist-div'>
        <h4>{`Main Deck - ${activeDeck.main.length}x`}</h4>
        <Main />
        <h4>{`Side Deck - ${activeDeck.side.length}x`}</h4>
        <Side />
        <h4>{`Extra Deck - ${activeDeck.extra.length}x`}</h4>
        <Extra />
    </div>;
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


function VisualizedList(list = []) {

    const [deck, setDeck] = useState(list);

    function add(card) {
        setDeck(deck.concat(card));
    }

    function remove(index) {
        const newDeck = [...deck];
        newDeck.splice(index, 1);
        setDeck(newDeck);
    }

    function move(start, finish) {
        const newDeck = [...deck];
        var card = newDeck[start];
        newDeck.splice(start, 1);
        newDeck.splice(finish, 0, card);
        setDeck(newDeck);

    }

    deck.add = add;
    deck.remove = remove;
    deck.move = move;
    return deck;
}

function VisualizedDeck(initialDeck) {

    const [name, setName] = useState(initialDeck?.name),
        main = new VisualizedList(initialDeck?.main),
        extra = new VisualizedList(initialDeck?.extra),
        side = new VisualizedList(initialDeck?.side);

    function rename(newName) {
        setName(newName);
    }


    return {
        name,
        rename,
        main,
        extra,
        side
    };
}

export default function DeckEditScreen() {

    const [search, setSearch] = useState([]),
        [setcodes, setSetcodes] = useState([]),
        [releases, setReleases] = useState([]),
        [banlist, setBanlist] = useState([]),
        [decks, setDecks] = useState([]),
        [last, setLast] = useState([]),
        [loadedDatabase, loadDatabase] = useState(fullDatabse),
        filterKeys = Object.keys(settings),
        [activeDeck, setActiveDeck] = useState(new VisualizedDeck()),
        info = new CardInfo(fullDatabse);

    function findcard(card) {
        return loadedDatabase.find((item) => card.id === item.id);
    }

    function applyBanlist() {
        if (!banlist.length) {
            return;
        }

        const activeBanlist = banlist.find((list) => (list.name === settings.banlist)) || banlist[1],
            region = activeBanlist.region,
            map = {};

        let result = [],
            filteredCards = [];

        loadedDatabase.forEach(function (card) {
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
        console.log(filteredCards);
        searchFilter = new SearchFilter(filteredCards.sort(cardStackSort));
        searchFilter.preformSearch();
        setSearch(searchFilter.renderSearch());
    }

    function save() {
        decks[settings.decklist] = activeDeck;
        hey({ action: 'SAVE_DECK', deck: activeDeck });
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
        setActiveDeck(new VisualizedDeck(decks[settings.decklist]));
        save();

        setTimeout(() => {
            var element = document.getElementById('decklist');
            element.value = settings.decklist;
        }, 200);

    }


    useEffect(() => {
        watchOut('BANLIST', (action) => {
            settings.banlist = action.primary;
            setBanlist(action.banlist);
            console.log(action);
        });


        listen('LOAD_DECKS', (action) => {
            settings.decklist = '0';
            if (!action.decks) {
                return;
            }
            setSearch([]);
            decks = action.decks.map((deckIds) => {
                const deck = Object.assign({}, deckIds);
                deck.main = deck.main.map(findcard);
                deck.extra = deck.extra.map(findcard);
                deck.side = deck.side.map(findcard);

                return deck;
            });
            setActiveDeck(new VisualizedDeck(decks[settings.decklist]));

        });

        listen('LOAD_DATABASE', (action) => {
            loadDatabase(action.data);
            fullDatabse = action.data;
            info.databaseSystem = fullDatabse;
        });

        listen('LOAD_SETCODES', (action) => {
            setSetcodes(action.data);

        });

        listen('LOAD_RELEASES', (action) => {
            setReleases(action.sets);

        });

        listen('IMPORT', (action) => {
            importDeck(action.file, action.name);
        });
    }, []);

    useEffect(() => {
        applyBanlist();
    }, [banlist, loadedDatabase]);

    function searchDB() {
        Object.assign(searchFilter.currentFilter, settings);
        searchFilter.preformSearch();
        setSearch(searchFilter.renderSearch());
    }

    function clearSearch() {
        const searchBox = document.querySelector('#cardname'),
            description = document.querySelector('#description'),
            cardtype = document.querySelector('#cardtype');

        searchBox.value = '';
        description.value = '';
        cardtype.value = 5;

        searchFilter.clearFilter();
        setSearch(searchFilter.renderSearch());
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
        setActiveDeck(new VisualizedDeck(decks[settings.decklist])
        );
        save();

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
        deck.rename(name);
        deck.creationDate = new Date();
        decks.push(deck);
        settings.decklist = decks.length - 1;
        setActiveDeck(new VisualizedDeck(decks[settings.decklist])
        );
        save();

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

        decks.splice(settings.decklist, 1);
        settings.decklist = decks.length - 1;
        setActiveDeck(new VisualizedDeck(decks[settings.decklist])
        );
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
        setActiveDeck({
            name: 'New Deck',
            main: [],
            extra: [],
            side: []
        });
    }

    function sort() {
        activeDeck.main.sort(cardEvaluate);
        activeDeck.extra.sort(cardEvaluate);
        activeDeck.side.sort(cardEvaluate);
    }

    function shuffle() {
        deepShuffle(activeDeck.main);

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



    function prev() {
        searchFilter.pageBack();
        setSearch(searchFilter.renderSearch());
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
        setSearch(searchFilter.renderSearch());
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
            setSearch(searchFilter.renderSearch());
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
            setActiveDeck(new VisualizedDeck(decks[settings[id]]));
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
        console.log(id);
        let value = (isNaN(Number(event.target.value))) ? undefined : Number(event.target.value);
        if (!filterKeys.includes(id)) {
            return;
        }
        if (event.target.value === undefined) {
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
                settings.cardtype = value;
                console.log(settings);
                break;
            case 'release':
                settings[id] = (event.target.value === undefined) ? undefined : event.target.value;
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

    function onDropExitZone(event, source, index) {
        // if (source === 'search') {
        //     return;
        // }


        // console.log('ondropexitzone', event, source, index);
        // activeDeck[source].remove(index);

        // event.preventDefault();
    }

    function onDragEnd(source, i, event) {
        event.target.style.opacity = '1';
        onDropExitZone(event, source, i);
        event.stopPropagation();
        event.preventDefault();
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
                activeDeck.extra.add(card);

                return;
            }
            activeDeck.main.add(card);


            return;
        }

        activeDeck[source].remove(index);


    }

    function CardCollection(source, deck) {
        return deck.map((card, i) => {
            card.uid = i;

            return <div
                key={`${card.uid}-${card.name}`}
                draggable={true}
                data-limit={card.limit}
                onDragOver={setIndex.bind(this, source, i)}
                onDragStart={onDragStart.bind(this, source, i)}
                onDragEnd={onDragEnd.bind(this, source, i)}
                onDoubleClick={onCardDoubleClick.bind(this, source, i)}
                onContextMenu={onCardDoubleClick.bind(this, source, i)}
            ><CardImage state={card} />
            </div>;
        });
    }


    function CardTypes() {
        switch (settings.cardtype) {
            case 1:
                return <>
                    <select id='type1' onChange={onSearchChange}>
                        <option value={undefined}>Frame</option>,
                        <option value={0x40}>Fusion</option>
                        <option value={0x80}>Ritual</option>
                        <option value={0x2000}>Synchro</option>
                        <option value={0x800000}>Xyz</option>
                        <option value={0x1000000}>Pendulum</option>
                        <option value={0x4000000}>Link</option>
                    </select>
                    <select id='type2' onChange={onSearchChange}>
                        <option value={undefined}>Sub Card Type</option>
                        <option value={0x10}>Normal</option>
                        <option value={0x20}>Effect</option>
                        <option value={0x200}>Spirit</option>
                        <option value={0x400}>Union</option>
                        <option value={0x1000}>Tuner</option>
                        <option value={0x800}>Gemini</option>
                        <option value={0x400000}>Toon</option></select>
                    <select id='attribute' onChange={onSearchChange}>
                        <option value={undefined}>Attribute</option>
                        <option value={1}>EARTH</option>
                        <option value={2}>WATER</option>
                        <option value={4}>FIRE</option>
                        <option value={8}>WIND</option>
                        <option value={16}>LIGHT</option>
                        <option value={32}>DARK</option>
                        <option value={64}>DIVINE</option></select>
                    <select id='race' onChange={onSearchChange}>
                        <option value={undefined}>Type</option>
                        <option value={1}>Warrior</option>
                        <option value={2}>Spellcaster</option>
                        <option value={4}>Fairy</option>
                        <option value={8}>Fiend</option>
                        <option value={16}>Zombie</option>
                        <option value={32}>Machine</option>
                        <option value={64}>Aqua</option>
                        <option value={128}>Pyro</option>
                        <option value={256}>Rock</option>
                        <option value={512}>Winged-Beast</option>
                        <option value={1024}>Plant</option>
                        <option value={2048}>Insect</option>
                        <option value={4096}>Thunder</option>
                        <option value={8192}>Dragon</option>
                        <option value={16384}>Beast</option>
                        <option value={32768}>Beast-Warrior</option>
                        <option value={65536}>Dinosaur</option>
                        <option value={131072}>Fish</option>
                        <option value={262144}>Sea Serpent</option>
                        <option value={524288}>Reptile</option>
                        <option value={1048576}>Psychic</option>
                        <option value={2097152}>Divine-Beast</option>
                        <option value={4194304}>Creator God</option>
                        <option value={8388608}>Wyrm</option>
                        <option value={16777216}>Cyberse</option>
                    </select>
                </>;
            case 2: // Spells
                return <select id='exacttype' onChange={onSearchChange}>
                    <option value={undefined}>Icon</option>
                    <option value={2}>Normal</option>
                    <option value={65538}>Quick-Play</option>
                    <option value={131074}>Continous</option>
                    <option value={130}>Ritual</option>
                    <option value={262146}>Field</option>
                    <option value={524290}>Equip</option></select>;
            case 4: //Traps
                return <select id='exacttype' onChange={onSearchChange}>
                    <option value={undefined}>Icon</option>
                    <option value={4}>Normal</option>
                    <option value={131076}>Continous</option>
                    <option value={1048580}>Counter</option></select>;
            default:
                return <></>;
        }
    }

    function LinkArrows() {

        if (settings.cardtype !== 1) {
            return <br />;
        }
        return <div className='filtercol'>
            <control id='linkmarkers'>
                <input id='link1' type='checkbox' onChange={onLinkChange.bind(this, 0)} />
                <input id='link2' type='checkbox' onChange={onLinkChange.bind(this, 1)} />
                <input id='link3' type='checkbox' onChange={onLinkChange.bind(this, 2)} />
                <br />
                <input id='link4' type='checkbox' onChange={onLinkChange.bind(this, 3)} />
                <input
                    type='checkbox' style={{
                        visibility: 'hidden'
                    }
                    }
                />
                <input id='link5' type='checkbox' onChange={onLinkChange.bind(this, 4)} />
                <br />
                <input id='link6' type='checkbox' onChange={onLinkChange.bind(this, 5)} />
                <input id='link7' type='checkbox' onChange={onLinkChange.bind(this, 6)} />
                <input id='link8' type='checkbox' onChange={onLinkChange.bind(this, 7)} />
            </control>
        </div>;
    }

    function Stats() {

        if (settings.cardtype !== 1) {
            return <br />;
        }
        return <>
            <div className='filterrow'>
                <input id='atk' placeholder='Attack' type='number' onChange={onSearchChange} />
                <select id='atkop' onChange={onSearchChange}>
                    <option value={0}>=</option>
                    <option value={-2}>{'<'}</option>
                    <option value={-1}>{'<='}</option>
                    <option value={1}>{'>='}</option>
                    <option value={2}>{'>'}</option>
                </select>
            </div>
            <div className='filterrow'>
                <input id='def' placeholder='Defense' type='number' onChange={onSearchChange} />
                <select id='defop' onChange={onSearchChange}>
                    <option value={0}>=</option>
                    <option value={-2}>{'<'}</option>
                    <option value={-1}>{'<='}</option>
                    <option value={1}>{'>='}</option>
                    <option value={2}>{'>'}</option>
                </select>
            </div>
            <div className='filterrow'>
                <input id='level' placeholder='Level/Rank/Rating' type='number' onChange={onSearchChange} />
                <select id='levelop' onChange={onSearchChange}>
                    <option value={0}>=</option>
                    <option value={-2}>{'<'}</option>
                    <option value={-1}>{'<='}</option>
                    <option value={1}>{'>='}</option>
                    <option value={2}>{'>'}</option>
                </select>
            </div>
            <div className='filterrow'>
                <input id='scale' placeholder='Scale' type='number' onChange={onSearchChange} />
                <select id='scaleop' onChange={onSearchChange} max='13' min='0'>
                    <option value={0}>=</option>
                    <option value={-2}>{'<'}</option>
                    <option value={-1}>{'<='}</option>
                    <option value={1}>{'>='}</option>
                    <option value={2}>{'>'}</option>
                </select>
            </div>
        </>;
    }

    function onDragOver(event, x) {
        event.stopPropagation();
        event.preventDefault();
    }

    function onDropDeckZone(zone, event) {

        const index = event.dataTransfer.getData('index'),
            source = event.dataTransfer.getData('source'),
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

            activeDeck[zone].add(card);

        } else {
            if (source === zone) {
                activeDeck[zone].move(index, overIndex.index, card);
            } else {
                activeDeck[source].remove(index);
                activeDeck[zone].add(card);
            }
        }


        event.preventDefault();
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            onSearchChange(event);
        }
    }

    function Releases() {
        const list = releases.map((set, i) => {
            return <option key={`set-${i}`} value={set}>{set}</option>;
        });
        return [<option value={undefined} key={'set-u}'}>Release Set</option>].concat(list);
    }



    function SearchControls() {
        return <controls key='deckedit-card-controls' >
            <div key='deckedit-col-1' className='filtercol'>
                <select key='deckedit-cardtype' id='cardtype' onChange={onSearchChange} >
                    <option key='deckedit-cardtype-1' value={5} >Monster/Spell/Trap</option>
                    <option key='deckedit-cardtype-2' value={1} >Monster</option>
                    <option key='deckedit-cardtype-3' value={2} >Spell</option>
                    <option key='deckedit-cardtype-4' value={4}> Trap</option>
                </select>
                <div className='filtercol' key='deckedit-filtercol-2'><CardTypes /></div>

                <select key='deckedit-setcode' id='setcode' onChange={onSearchChange} >
                    {[<option key={'u'} value={undefined}>Archetype</option>
                    ].concat(setcodes.map((list, i) => {
                        return <option key={`setcode-${i}`} value={parseInt(list.num)}>list.name</option>;
                    }))}
                </select>
                <select key='deckedit-release' id='release' onChange={onSearchChange}>
                    <Releases />
                </select>
                <select key='deckedit-limit' id='limit' onChange={onSearchChange} >
                    <option value='null' key='deckedit-limit-null'>Limit</option>
                    <option value={3} key='deckedit-limit-0'>Unlimited</option>
                    <option value={2} key='deckedit-limit-1'>Semi-Limited</option>
                    <option value={1} key='deckedit-limit-2'>Limited</option>
                    <option value={0} key='deckedit-limit-3'>Forbidden</option>
                </select>
                <input
                    key='deckedit-cardname-input'
                    id='cardname' type='text' placeholder='Name'
                    onKeyPress={handleKeyPress}
                    onBlur={onSearchChange}
                />
                <input
                    key='deckedit-description-input'
                    id='description' type='text' placeholder='Card Text'
                    onKeyPress={handleKeyPress}
                    onBlur={onSearchChange}
                />
                <Stats />
                <button
                    key='deckedit-clearsearch'
                    onClick={clearSearch}
                >Reset</button>
            </div>
            <LinkArrows />
        </controls>;
    }

    function DeckSearch() {
        return <div id='decksearch'
            onDragOver={function (event, x) {
                event.stopPropagation();
                event.preventDefault();
            }}
            onDrop={onDropExitZone}
        >

            <div id='decksearchtitles' >
                <h2  >Search Results</h2>
                <h2  >Card Information</h2>
            </div>

            <div id='decksearchresults' onScroll={searchScroll} > {CardCollection('search', search)}</div>
            <div id='decksearchresultsofx'>`${searchFilter.currentSearch.length} cards found`)</div>
            <div id='cardinformation'>{info.render()}</div>
        </div>;
    }

    function BanlistDeckListSelect() {
        return <controls key='deck-banlist-controls' >
            <div className='filtercol' >
                <h3 key='deck-controls-label' >Deck</h3>
                <h3 key='banlist-controls-label'>Banlist</h3>
            </div>

            <div className='filtercol' >
                <select id='decklist' key='deckedit-decklist-select' onChange={onChange}>
                    {decks.map((list, i) => {
                        return <option key={i} value={i}>{list.name}</option>;
                    })}
                </select>
                <select id='banlist' key='deckedit-ban;list-select' onChange={onSearchChange}>
                    {banlist.map((list, i) => {
                        return <option value={list.name} key={i} selected={list.primary}>{list.name}</option>;
                    })}
                </select>

            </div>
            <div className='deckcontrols' key='deckedit-deckcontrols-div1' >
                <h3 style={{ width: 'auto' }}>Upload YDK File</h3>
                <input type='file' accept='.ydk' placeholder='Choose File' onChange={upload} />
                <div className='deckcontrols' key='deckedit-deckcontrols-div2' >
                    <button key='deckedit-decklist-0' onClick={newDeck}>New</button>
                    <button key='deckedit-decklist-1' onClick={save}>Save</button>
                    <button key='deckedit-decklist-2' onClick={deleteDeck}>Delete</button>
                    <button key='deckedit-decklist-3' onClick={rename}>Rename</button>
                    <button key='deckedit-decklist-4' onClick={clear}>Clear</button>

                    <button key='deckedit-decklist-5' onClick={sort} >Sort</button>
                    <button key='deckedit-decklist-6' onClick={shuffle} >Shuffle</button>
                    <button key='deckedit-decklist-7' onClick={exportDeck} >Export</button>
                    <button key='deckedit-decklist-8' onClick={saveAs} >Save As</button>
                </div>

            </div>
        </controls>;
    }

    function DeckArea() {
        return <div id='deckarea' >
            <div id='deckareamain' >
                <h2 >Main Deck</h2>
                <div
                    className={`deckmetainfo ${marginClass(activeDeck.main)}`}
                    onDragOver={onDragOver}
                    onDrop={onDropDeckZone.bind(this, 'main')}>
                    <CardCollection source='main' deck={activeDeck.main} />
                </div>
                <div id='main'>
                </div>
                <div id='deckareaextra' >
                    <h2 >Extra Deck</h2>
                    <div
                        className='deckmetainfo'
                        onDragOver={onDragOver}
                        onDrop={onDropDeckZone.bind(this, 'extra')}>
                        <CardCollection source='extra' deck={activeDeck.extra} />
                        </div>
                    <div id='main'></div>
                </div>
                <div id='deckareaside' >
                    <h2 >Side Deck</h2>
                    <div
                        className='deckmetainfo'
                        onDragOver={onDragOver}
                        onDrop={onDropDeckZone.bind(this, 'side')}></div>
                   <CardCollection source='side' deck={activeDeck.side} />
                   </div>
                <div id='main'></div>
            </div>
        </div>;
    }

    return <>
        <div id='decksetup' onDragOver={onDragOver} onDrop={onDropExitZone} >

            <div id='searchfilter' >
                <h2>Setup</h2>
                <br />
                <h3 >Filter</h3>
                <SearchControls />
                <BanlistDeckListSelect decks={decks} banlist={banlist} />
                <CardList {...activeDeck} />
                <DeckSearch />
                <DeckArea />
            </div>
        </div>
    </>;
}