import React, { useEffect, useRef, useState } from 'react';
import SearchFilter from '../../services/cardsearch.service';
import CardInfo, { disposeCardInfo, MountedCardInfo, updateCardInfo } from '../duel/cardinfo.component';
import AppImage from '../common/app-image';
import { cardStackSort, cardEvaluate, deepShuffle, isExtra } from '../../util/cardManipulation';
import { emit } from '../../services/listener.service';
import { on, subscribe } from '../../hooks/use-listener';
import { getCardImageUrl } from '../../services/storage.service';
import styles from './deckedit.component.module.scss';

function createDeckEditorSettings() {
    return {
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

function createFilterValues() {
    return {
        cardtype: '5',
        cardname: '',
        description: '',
        banlist: '',
        exacttype: '',
        type1: '',
        type2: '',
        attribute: '',
        race: '',
        release: '',
        setcode: '',
        atk: '',
        atkop: '0',
        def: '',
        defop: '0',
        level: '',
        levelop: '0',
        scale: '',
        scaleop: '0',
        limit: '',
        links: [false, false, false, false, false, false, false, false]
    };
}

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

    return text;
}

function CardList(activeDeck) {
    const main = listReduce(activeDeck.main),
        side = listReduce(activeDeck.side),
        extra = listReduce(activeDeck.extra);
    return <div id='decktextlist' key='deckedit-decktextlist-div'>
        <h4>{`Main Deck - ${activeDeck.main.length}x`}</h4>
        {main}
        <h4>{`Side Deck - ${activeDeck.side.length}x`}</h4>
        {side}
        <h4>{`Extra Deck - ${activeDeck.extra.length}x`}</h4>
        {extra}
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

function resolveDeckCardId(card) {
    if (typeof card === 'number') {
        return card;
    }

    if (typeof card === 'string') {
        return Number(card);
    }

    if (card && typeof card === 'object') {
        return Number(card.id);
    }

    return NaN;
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


function VisualizedDeck(initialDeck) {
    const safeDeck = initialDeck || {};

    return {
        name: safeDeck.name || 'New Deck',
        owner: safeDeck.owner,
        creationDate: safeDeck.creationDate,
        id: safeDeck.id,
         
        _id: safeDeck._id,
        main: Array.isArray(safeDeck.main) ? [...safeDeck.main] : [],
        extra: Array.isArray(safeDeck.extra) ? [...safeDeck.extra] : [],
        side: Array.isArray(safeDeck.side) ? [...safeDeck.side] : []
    };
}

function deckDisplayName(deck, index) {
    if (deck && typeof deck.name === 'string' && deck.name.trim()) {
        return deck.name.trim();
    }

    if (deck && typeof deck.title === 'string' && deck.title.trim()) {
        return deck.title.trim();
    }

    return `Deck ${index + 1}`;
}

export default function DeckEditScreen() {

    const [search, setSearch] = useState([]),
        [setcodes, setSetcodes] = useState([]),
        [releases, setReleases] = useState([]),
        [banlist, setBanlist] = useState([]),
        [systemLoaded, setSystemLoaded] = useState(false),
        [manifestLoaded, setManifestLoaded] = useState(false),
        [decksLoaded, setDecksLoaded] = useState(false),
        [decks, setDecks] = useState([]),
        [pendingDeckRecords, setPendingDeckRecords] = useState([]),
        [last, setLast] = useState([]),
        [loadedDatabase, loadDatabase] = useState([]),
        [saveAsOpen, setSaveAsOpen] = useState(false),
        [saveAsName, setSaveAsName] = useState(''),
        [saveAsError, setSaveAsError] = useState(''),
        [deckMenuOpen, setDeckMenuOpen] = useState(false),
        [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false),
        [filterValues, setFilterValues] = useState(createFilterValues()),
        filterKeys = Object.keys(createDeckEditorSettings()),
        [settings, setSettings] = useState(createDeckEditorSettings()),
        [activeDeck, setActiveDeck] = useState(new VisualizedDeck()),
        [hoveredCardId, setHoveredCardId] = useState(undefined),
        [selectedDeckIndex, setSelectedDeckIndex] = useState(0),
        [searchCount, setSearchCount] = useState(0),
        [searchPageSize, setSearchPageSize] = useState(60),
        searchFilterRef = useRef(new SearchFilter([])),
        databaseRef = useRef([]),
        settingsRef = useRef(createDeckEditorSettings()),
        overIndexRef = useRef(null),
        deckMenuRef = useRef(null),
        searchResultsRef = useRef(null),
        pendingSearchScrollTopRef = useRef(null),
        [cardInfo] = useState(() => CardInfo(databaseRef.current));

    function replaceSettings(nextSettings) {
        settingsRef.current = nextSettings;
        setSettings(nextSettings);
        return nextSettings;
    }

    function updateSettings(update) {
        const resolvedUpdate = typeof update === 'function'
            ? update(settingsRef.current)
            : update;

        return replaceSettings({
            ...settingsRef.current,
            ...(resolvedUpdate || {})
        });
    }

    function setDeckSelection(nextDeckIndex) {
        updateSettings({
            decklist: String(nextDeckIndex)
        });
        setSelectedDeckIndex(nextDeckIndex);
    }

    function replaceActiveDeck(nextDeck) {
        const visualDeck = new VisualizedDeck(nextDeck);
        setActiveDeck(visualDeck);
        return visualDeck;
    }

    const selectedDeck = decks[selectedDeckIndex] || {};

    function syncSearchResults(nextSearch = null, pageSize = searchPageSize) {
        searchFilterRef.current.currentSearchPageSize = pageSize;
        const resolvedSearch = nextSearch ?? searchFilterRef.current.renderSearch();
        setSearch(resolvedSearch);
        setSearchCount(Array.isArray(searchFilterRef.current.currentSearch) ? searchFilterRef.current.currentSearch.length : 0);
        return resolvedSearch;
    }

    useEffect(() => {
        return () => {
            disposeCardInfo(cardInfo);
        };
    }, [cardInfo]);

    function loadDecksForLoggedInUser() {
        if (typeof window === 'undefined') {
            return Promise.resolve();
        }

        const session = localStorage.session,
            username = localStorage.username;

        if (!session || !username) {
            setDecksLoaded(true);
            return Promise.resolve();
        }

        return fetch(`/api/session/${session}`, {
            cache: 'no-store'
        }).then((response) => response.json())
            .then((payload) => {
                if (!payload?.success) {
                    console.warn('Failed to load decks for deck editor', payload?.error || 'Unknown session error');
                    setDecksLoaded(true);

                    if (payload?.error === 'Invalid session') {
                        emit({ action: 'LOGOUT_ACCOUNT' });
                        return;
                    }

                    emit({ action: 'LOAD_SESSION' });
                    return;
                }

                const deckOwner = payload.user?.username || username,
                    decksForUser = Array.isArray(payload.user?.decks)
                        ? payload.user.decks.filter((deck) => !deck?.owner || deck.owner === deckOwner)
                        : [];

                console.log('LOAD_DECKS fired', decksForUser);
                emit({ action: 'LOAD_DECKS', decks: decksForUser });
            })
            .catch((error) => {
                console.warn('Failed to load decks for deck editor', error);
                setDecksLoaded(true);
                emit({ action: 'LOAD_SESSION' });
            });
    }

    function hydrateDeckRecords(deckRecords, database = loadedDatabase) {
        setDecksLoaded(true);
        const currentActiveDeck = activeDeck;

        if (!Array.isArray(deckRecords)) {
            setDecks([]);
            setActiveDeck(new VisualizedDeck());
            return;
        }

        const visualDecks = deckRecords.map((deck) => new VisualizedDeck(deck)),
            preferredDeckKey = currentActiveDeck?.id || currentActiveDeck?._id || currentActiveDeck?.name,
            selectedIndex = visualDecks.findIndex((deck) => {
                return (deck.id || deck._id || deck.name) === preferredDeckKey;
            }),
            nextDeckIndex = selectedIndex >= 0 ? selectedIndex : 0;

        setDeckSelection(nextDeckIndex);
        setDecks(visualDecks);
        replaceActiveDeck(visualDecks[nextDeckIndex]);

        if (!database.length) {
            setPendingDeckRecords(deckRecords);
            return;
        }

        const mappedDecks = deckRecords.map((deckIds) => {
            const deck = Object.assign({}, deckIds);
            deck.main = (deck.main || []).map((card) => {
                const cardId = resolveDeckCardId(card);
                return database.find((item) => Number(item.id) === cardId);
            });
            deck.extra = (deck.extra || []).map((card) => {
                const cardId = resolveDeckCardId(card);
                return database.find((item) => Number(item.id) === cardId);
            });
            deck.side = (deck.side || []).map((card) => {
                const cardId = resolveDeckCardId(card);
                return database.find((item) => Number(item.id) === cardId);
            });
            deck.main = deck.main.filter(Boolean);
            deck.extra = deck.extra.filter(Boolean);
            deck.side = deck.side.filter(Boolean);
            return deck;
        });

        setPendingDeckRecords([]);
        setDecks(mappedDecks);
        console.log('Loaded deck', mappedDecks[nextDeckIndex]);
        replaceActiveDeck(mappedDecks[nextDeckIndex]);
    }

    function updateActiveDeck(mutator) {
        setActiveDeck((currentDeck) => {
            const nextDeck = VisualizedDeck(currentDeck);
            mutator(nextDeck);
            return nextDeck;
        });
    }

    function renderSearchResults(options = {}) {
        const { preserveScrollTop = false, pageSize = searchPageSize } = options;

        if (preserveScrollTop && searchResultsRef.current) {
            pendingSearchScrollTopRef.current = searchResultsRef.current.scrollTop;
        } else {
            pendingSearchScrollTopRef.current = null;
        }

        syncSearchResults(null, pageSize);

        if (preserveScrollTop) {
            requestAnimationFrame(() => {
                if (!searchResultsRef.current || pendingSearchScrollTopRef.current === null) {
                    return;
                }

                searchResultsRef.current.scrollTop = pendingSearchScrollTopRef.current;
                pendingSearchScrollTopRef.current = null;
            });
        }
    }

    function preserveSearchScroll(callback) {
        const currentScrollTop = searchResultsRef.current ? searchResultsRef.current.scrollTop : null;
        callback();

        if (currentScrollTop === null) {
            return;
        }

        requestAnimationFrame(() => {
            if (!searchResultsRef.current) {
                return;
            }

            searchResultsRef.current.scrollTop = currentScrollTop;
        });
    }

    function findcard(card) {
        return loadedDatabase.find((item) => card.id === item.id);
    }

    function resolveDeckCard(card) {
        if (card && typeof card === 'object') {
            return card;
        }

        const cardId = resolveDeckCardId(card);
        return loadedDatabase.find((item) => Number(item.id) === cardId);
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
        searchFilterRef.current = new SearchFilter(filteredCards.sort(cardStackSort));
        searchFilterRef.current.preformSearch();
        setSearchPageSize(60);
        syncSearchResults(null, 60);
    }

    function save(deckToSave = activeDeck, deckList = decks, deckIndexOverride = selectedDeckIndex) {
        const deckIndex = Math.max(0, Math.min(deckIndexOverride, Math.max(deckList.length - 1, 0))),
            selectedDeckRecord = deckList[deckIndex] || {},
            normalizedDeck = {
                ...selectedDeckRecord,
                ...deckToSave,
                id: deckToSave?.id || selectedDeckRecord.id,
                _id: deckToSave?._id || selectedDeckRecord._id,
                owner: deckToSave?.owner || selectedDeckRecord.owner || localStorage.username
            };

        const nextDecks = [...deckList];
        nextDecks[deckIndex] = normalizedDeck;
        setDecks(nextDecks);
        replaceActiveDeck(normalizedDeck);
        emit({ action: 'SAVE_DECK', deck: normalizedDeck });
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
        const nextDecks = [...decks, deck],
            nextDeckIndex = nextDecks.length - 1;
        setDeckSelection(nextDeckIndex);
        save(deck, nextDecks, nextDeckIndex);

    }


    subscribe('BANLIST', (action) => {
        updateSettings({
            banlist: action.primary
        });
        setBanlist(action.banlist);
        console.log(action);
    });

    subscribe('SYSTEM_LOADED', () => {
        setSystemLoaded(true);
    });

    on('LOAD_DECKS', (action) => {
        console.log('LOAD_DECKS received', action);
        hydrateDeckRecords(action.decks || []);
    });

    on('LOAD_DATABASE', (action) => {
        loadDatabase(action.data);
        databaseRef.current = action.data;
        cardInfo.databaseSystem = databaseRef.current;
        setManifestLoaded(Array.isArray(action.data) && action.data.length > 0);
    });

    on('CARD_HOVER', (action) => {
        setHoveredCardId(action.id);
    });

    on('LOAD_SETCODES', (action) => {
        setSetcodes(action.data);
    });

    on('LOAD_RELEASES', (action) => {
        setReleases(action.sets);
    });

    on('IMPORT', (action) => {
        importDeck(action.file, action.name);
    });

    useEffect(() => {
        if (!loadedDatabase.length || !pendingDeckRecords.length) {
            return;
        }

        hydrateDeckRecords(pendingDeckRecords, loadedDatabase);
        // `hydrateDeckRecords` is intentionally treated as an implementation detail here; the effect keys on its data inputs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadedDatabase, pendingDeckRecords]);

    useEffect(() => {
        loadDecksForLoggedInUser();
    }, []);

    on('LOGGEDIN', () => {
        loadDecksForLoggedInUser();
    });

    useEffect(() => {
        if (!manifestLoaded && loadedDatabase.length) {
            setManifestLoaded(true);
        }
    }, [loadedDatabase, manifestLoaded]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (!localStorage.session || !localStorage.username) {
            setDecksLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!systemLoaded) {
            return;
        }
        applyBanlist();
        // `applyBanlist` reads current component state; this effect is keyed on the state that changes its output.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [banlist, loadedDatabase, systemLoaded]);

    useEffect(() => {
        if (!cardInfo || !hoveredCardId) {
            return;
        }

        updateCardInfo(cardInfo, { id: hoveredCardId });
    }, [cardInfo, hoveredCardId]);

    useEffect(() => {
        if (!deckMenuOpen) {
            return undefined;
        }

        function handlePointerDown(event) {
            if (deckMenuRef.current && !deckMenuRef.current.contains(event.target)) {
                setDeckMenuOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setDeckMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [deckMenuOpen]);

    function searchDB(nextSettings = settings, pageSize = 60) {
        searchFilterRef.current.currentFilter = {
            ...searchFilterRef.current.currentFilter,
            ...nextSettings
        };
        searchFilterRef.current.preformSearch();
        setSearchPageSize(pageSize);
        syncSearchResults(null, pageSize);
    }

    function clearSearch() {
        searchFilterRef.current.clearFilter();
        setSearchPageSize(60);
        syncSearchResults(null, 60);
        setFilterValues(createFilterValues());
        replaceSettings(createDeckEditorSettings());
        setSelectedDeckIndex(0);
    }



    function newDeck() {
        const oldDeck = selectedDeck.name ? selectedDeck : { name: 'New Deck' },
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
        const nextDecks = [...decks, deck],
            nextDeckIndex = nextDecks.length - 1;
        setDeckSelection(nextDeckIndex);
        save(deck, nextDecks, nextDeckIndex);


    }

    function openSaveAsModal() {
        setSaveAsName(selectedDeck.name || activeDeck.name || 'New Deck');
        setSaveAsError('');
        setSaveAsOpen(true);
    }

    function closeSaveAsModal() {
        setSaveAsOpen(false);
        setSaveAsError('');
    }

    function saveAs() {
        const deck = {},
            name = saveAsName.trim();
        if (!name) {
            setSaveAsError('Deck name is required.');
            return;
        }
        if (decks.some((unit) => unit.name === name)) {
            setSaveAsError('A deck with that name already exists.');
            return;
        }
        Object.assign(deck, JSON.parse(JSON.stringify(activeDeck)));
        delete deck.id;
        delete deck._id;
        deck.name = name;
        deck.creationDate = new Date();
        const nextDecks = [...decks, deck],
            nextDeckIndex = nextDecks.length - 1;
        setDeckSelection(nextDeckIndex);
        save(deck, nextDecks, nextDeckIndex);
        closeSaveAsModal();
    }
    function deleteDeck() {
        const ok = confirm(`Delete ${selectedDeck.name}?`);
        if (!ok) {
            return;
        }


        emit({ action: 'DELETE_DECK', deck: activeDeck });

        const deckIndex = selectedDeckIndex,
            nextDecks = decks.filter((_, index) => index !== deckIndex),
            nextDeckIndex = nextDecks.length ? Math.min(deckIndex, nextDecks.length - 1) : 0;

        setDecks(nextDecks);
        setDeckSelection(nextDeckIndex);
        replaceActiveDeck(nextDecks[nextDeckIndex]);
    }
    function rename() {
        const name = prompt('Deck Name?', selectedDeck.name);
        if (!name) {
            return;
        }
        const renamedDeck = {
            ...activeDeck,
            ...selectedDeck,
            name
        };
        replaceActiveDeck(renamedDeck);
        save(renamedDeck);
    }
    function clear() {
        replaceActiveDeck({
            name: 'New Deck',
            main: [],
            extra: [],
            side: []
        });
    }

    function sort() {
        updateActiveDeck((deck) => {
            deck.main.sort(cardEvaluate);
            deck.extra.sort(cardEvaluate);
            deck.side.sort(cardEvaluate);
        });
    }

    function shuffle() {
        updateActiveDeck((deck) => {
            deepShuffle(deck.main);
        });
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
                emit({
                    action: 'IMPORT',
                    file,
                    name: name.substring(0, name.lastIndexOf('.'))
                });
            }
            setDeckMenuOpen(false);
            event.target.value = '';
        });
        r.readAsText(f);
    }

    function runDeckMenuAction(action) {
        action();
        setDeckMenuOpen(false);
    }

    function animateSearchResultsPageTransition() {
        const searchResults = searchResultsRef.current;
        if (!searchResults) {
            return;
        }

        Array.from(searchResults.children || []).forEach((child) => {
            child.className = 'transitioning';
        });

        setTimeout(() => {
            Array.from(searchResults.children || []).forEach((child) => {
                child.className = '';
            });
        }, 1000);
    }



    function prev() {
        searchFilterRef.current.pageBack();
        syncSearchResults();
        animateSearchResultsPageTransition();
    }

    function next() {

        searchFilterRef.current.pageForward();
        syncSearchResults();
        animateSearchResultsPageTransition();

    }

    function searchScroll() {
        const searchBox = searchResultsRef.current;
        if (!searchBox) {
            return;
        }

        if (searchBox.scrollTop >= (searchBox.scrollHeight - searchBox.offsetHeight)) {
            const nextPageSize = searchPageSize + 30;
            setSearchPageSize(nextPageSize);
            renderSearchResults({ preserveScrollTop: true, pageSize: nextPageSize });
        }
    }

    function marginClass(deck) {
        if (deck.length <= 40) {
            return '';
        }
        if (deck.length <= 44) {
            return 'c44';
        }
        if (deck.length <= 48) {
            return 'c48';
        }
        if (deck.length <= 52) {
            return 'c52';
        }
        if (deck.length <= 56) {
            return 'c56';
        }
        return 'c60';
    }

    function onChange(event) {
        const id = event.target.id;
        if (!id) {
            return;
        }

        if (id === 'decklist') {
            const nextDeckIndex = Number(event.target.value || 0);
            setDeckSelection(nextDeckIndex);
            replaceActiveDeck(decks[nextDeckIndex]);
            searchDB(settings, searchPageSize);
            return;
        }

        const nextValue = event.target.value === 'on'
            ? event.target.checked
            : event.target.value;

        const nextSettings = updateSettings({
            [id]: nextValue
        });
        searchDB(nextSettings, searchPageSize);
    }

    function onLinkChange(pointer, event) {
        setFilterValues((current) => {
            const nextLinks = [...current.links];
            nextLinks[pointer] = event.target.checked;
            return {
                ...current,
                links: nextLinks
            };
        });
        const nextSettings = updateSettings((current) => {
            const links = [...(current.links || [])];
            links[pointer] = event.target.checked ? pointer : null;
            return { links };
        });
        searchDB(nextSettings, searchPageSize);
    }

    function onSearchChange(event) {
        if (!event.target.id) {
            return;
        }

        const id = event.target.id;
        const rawValue = event.target.value;
        setFilterValues((current) => ({
            ...current,
            [id]: rawValue
        }));
        console.log(id);
        let value = (isNaN(Number(rawValue)) || rawValue === '') ? undefined : Number(rawValue);
        if (!filterKeys.includes(id)) {
            return;
        }
        if (rawValue === undefined) {
            value = undefined;
        }
        if (settings[id] === value && value) {
            return;
        }

        let nextSettings = settings;

        switch (id) {
            case 'cardtype':
                nextSettings = updateSettings({
                    [id]: value,
                    type: Number(rawValue),
                    exacttype: undefined,
                    type1: undefined,
                    type2: undefined,
                    cardtype: value
                });
                setFilterValues((current) => ({
                    ...current,
                    exacttype: '',
                    type1: '',
                    type2: '',
                    attribute: '',
                    race: ''
                }));
                break;
            case 'release':
                nextSettings = updateSettings({
                    [id]: (rawValue === undefined || rawValue === '') ? undefined : rawValue
                });
                break;
            case 'cardname':
                nextSettings = updateSettings({
                    [id]: rawValue ? rawValue : undefined
                });
                break;
            case 'description':
                nextSettings = updateSettings({
                    [id]: rawValue ? rawValue : undefined
                });
                break;
            case 'banlist':
                nextSettings = updateSettings({
                    [id]: rawValue ? rawValue : undefined
                });
                applyBanlist();
                break;
            case 'level':
                nextSettings = updateSettings({
                    [id]: (value === 0) ? undefined : value
                });
                break;
            default:
                nextSettings = updateSettings({
                    [id]: value
                });
        }
        searchDB(nextSettings, searchPageSize);
    }

    function setIndex(source, index) {
        overIndexRef.current = { source, index };

    }

    function onDragStart(source, i, event) {
        const payload = JSON.stringify({ source, index: i });
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', payload);
        event.dataTransfer.setData('index', String(i));
        event.dataTransfer.setData('source', source);
        event.currentTarget.style.opacity = '0';
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
        event.currentTarget.style.opacity = '1';
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
                preserveSearchScroll(() => {
                    updateActiveDeck((deck) => {
                        deck.extra.push(card);
                    });
                });

                return;
            }
            preserveSearchScroll(() => {
                updateActiveDeck((deck) => {
                    deck.main.push(card);
                });
            });


            return;
        }

        updateActiveDeck((deck) => {
            deck[source].splice(index, 1);
        });


    }

    function CardCollection({ source, deck }) {
        const cards = Array.isArray(deck) ? deck : [];

        return cards.map((card, i) => {
            const renderedCard = (card && typeof card === 'object')
                ? card
                : loadedDatabase.find((item) => Number(item.id) === resolveDeckCardId(card));

            if (!renderedCard) {
                return null;
            }

            const cardUid = renderedCard.uid ?? i,
                src = getCardImageUrl(renderedCard.id) || 'img/textures/cover.jpg';

            return <div
                key={`${cardUid}-${renderedCard.name}`}
                draggable={true}
                data-limit={renderedCard.limit}
                onDragOver={setIndex.bind(this, source, i)}
                onDragStart={onDragStart.bind(this, source, i)}
                onDragEnd={onDragEnd.bind(this, source, i)}
                onClick={onCardDoubleClick.bind(this, source, i)}
                onContextMenu={onCardDoubleClick.bind(this, source, i)}
                onMouseEnter={() => emit({ action: 'CARD_HOVER', id: renderedCard.id })}
            >
                <AppImage
                    className='deckedit-card-image'
                    src={src}
                    alt={renderedCard.name || `Card ${renderedCard.id}`}
                    draggable={false}
                    fallbackSrc='img/textures/unknown.jpg'
                    width={177}
                    height={254}
                    sizes='(max-width: 768px) 33vw, 180px'
                    style={{ width: 'auto', height: '100%' }}
                />
            </div>;
        });
    }


    function CardTypes() {
        switch (settings.cardtype) {
            case 1:
                return <>
                    <select id='type1' onChange={onSearchChange} value={filterValues.type1}>
                        <option value=''>Frame</option>
                        <option value={0x40}>Fusion</option>
                        <option value={0x80}>Ritual</option>
                        <option value={0x2000}>Synchro</option>
                        <option value={0x800000}>Xyz</option>
                        <option value={0x1000000}>Pendulum</option>
                        <option value={0x4000000}>Link</option>
                    </select>
                    <select id='type2' onChange={onSearchChange} value={filterValues.type2}>
                        <option value=''>Sub Card Type</option>
                        <option value={0x10}>Normal</option>
                        <option value={0x20}>Effect</option>
                        <option value={0x200}>Spirit</option>
                        <option value={0x400}>Union</option>
                        <option value={0x1000}>Tuner</option>
                        <option value={0x800}>Gemini</option>
                        <option value={0x400000}>Toon</option></select>
                    <select id='attribute' onChange={onSearchChange} value={filterValues.attribute}>
                        <option value=''>Attribute</option>
                        <option value={1}>EARTH</option>
                        <option value={2}>WATER</option>
                        <option value={4}>FIRE</option>
                        <option value={8}>WIND</option>
                        <option value={16}>LIGHT</option>
                        <option value={32}>DARK</option>
                        <option value={64}>DIVINE</option></select>
                    <select id='race' onChange={onSearchChange} value={filterValues.race}>
                        <option value=''>Type</option>
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
                return <select id='exacttype' onChange={onSearchChange} value={filterValues.exacttype || ''}>
                    <option value=''>Icon</option>
                    <option value={2}>Normal</option>
                    <option value={65538}>Quick-Play</option>
                    <option value={131074}>Continous</option>
                    <option value={130}>Ritual</option>
                    <option value={262146}>Field</option>
                    <option value={524290}>Equip</option></select>;
            case 4: //Traps
                return <select id='exacttype' onChange={onSearchChange} value={filterValues.exacttype || ''}>
                    <option value=''>Icon</option>
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
            <div id='linkmarkers'>
                <input id='link1' type='checkbox' checked={filterValues.links[0]} onChange={onLinkChange.bind(this, 0)} />
                <input id='link2' type='checkbox' checked={filterValues.links[1]} onChange={onLinkChange.bind(this, 1)} />
                <input id='link3' type='checkbox' checked={filterValues.links[2]} onChange={onLinkChange.bind(this, 2)} />
                <br />
                <input id='link4' type='checkbox' checked={filterValues.links[3]} onChange={onLinkChange.bind(this, 3)} />
                <input
                    type='checkbox' style={{
                        visibility: 'hidden'
                    }
                    }
                />
                <input id='link5' type='checkbox' checked={filterValues.links[4]} onChange={onLinkChange.bind(this, 4)} />
                <br />
                <input id='link6' type='checkbox' checked={filterValues.links[5]} onChange={onLinkChange.bind(this, 5)} />
                <input id='link7' type='checkbox' checked={filterValues.links[6]} onChange={onLinkChange.bind(this, 6)} />
                <input id='link8' type='checkbox' checked={filterValues.links[7]} onChange={onLinkChange.bind(this, 7)} />
            </div>
        </div>;
    }

    function Stats() {

        if (settings.cardtype !== 1) {
            return <br />;
        }
            return <>
            <div className='filterrow'>
                <input id='atk' placeholder='Attack' type='number' value={filterValues.atk} onChange={onSearchChange} />
                <select id='atkop' onChange={onSearchChange} value={filterValues.atkop}>
                    <option value={0}>=</option>
                    <option value={-2}>{'<'}</option>
                    <option value={-1}>{'<='}</option>
                    <option value={1}>{'>='}</option>
                    <option value={2}>{'>'}</option>
                </select>
            </div>
            <div className='filterrow'>
                <input id='def' placeholder='Defense' type='number' value={filterValues.def} onChange={onSearchChange} />
                <select id='defop' onChange={onSearchChange} value={filterValues.defop}>
                    <option value={0}>=</option>
                    <option value={-2}>{'<'}</option>
                    <option value={-1}>{'<='}</option>
                    <option value={1}>{'>='}</option>
                    <option value={2}>{'>'}</option>
                </select>
            </div>
            <div className='filterrow'>
                <input id='level' placeholder='Level/Rank/Rating' type='number' value={filterValues.level} onChange={onSearchChange} />
                <select id='levelop' onChange={onSearchChange} value={filterValues.levelop}>
                    <option value={0}>=</option>
                    <option value={-2}>{'<'}</option>
                    <option value={-1}>{'<='}</option>
                    <option value={1}>{'>='}</option>
                    <option value={2}>{'>'}</option>
                </select>
            </div>
            <div className='filterrow'>
                <input id='scale' placeholder='Scale' type='number' value={filterValues.scale} onChange={onSearchChange} />
                <select id='scaleop' onChange={onSearchChange} max='13' min='0' value={filterValues.scaleop}>
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
        event.dataTransfer.dropEffect = 'move';
        event.stopPropagation();
        event.preventDefault();
    }

    function readDragPayload(event) {
        const raw = event.dataTransfer.getData('text/plain');

        if (raw) {
            try {
                const payload = JSON.parse(raw);
                return {
                    source: payload.source,
                    index: Number(payload.index)
                };
            } catch (error) {
                console.warn('Invalid drag payload', error);
            }
        }

        return {
            source: event.dataTransfer.getData('source'),
            index: Number(event.dataTransfer.getData('index'))
        };
    }

    function onDropDeckZone(zone, event) {

        const { index, source } = readDragPayload(event),
            list = (source === 'search') ? search : activeDeck[source],
            card = resolveDeckCard(list[index]);

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

            const legal = (checkLegality(card, zone, activeDeck, banlist));
            if (!legal) {
                return;
            }

            updateActiveDeck((deck) => {
                deck[zone].push(card);
            });

        } else {
            if (source === zone) {
                updateActiveDeck((deck) => {
                    const reorderedCard = deck[zone][index];
                    deck[zone].splice(index, 1);
                    deck[zone].splice(overIndexRef.current.index, 0, reorderedCard);
                });
            } else {
                updateActiveDeck((deck) => {
                    deck[source].splice(index, 1);
                    deck[zone].push(card);
                });
            }
        }


        event.preventDefault();
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            onSearchChange(event);
        }
    }

    function onSaveAsKeyDown(event) {
        if (event.key === 'Enter') {
            saveAs();
        }
        if (event.key === 'Escape') {
            closeSaveAsModal();
        }
    }

    function Releases() {
        const list = releases.map((set, i) => {
            return <option key={`set-${i}`} value={set}>{set}</option>;
        });
        return [<option value='' key={'set-u}'}>Release Set</option>].concat(list);
    }



    function SearchControls() {
        return <div key='deckedit-card-controls' className='deckedit-controls'>
            <div key='deckedit-col-1' className='filtercol'>
                <select key='deckedit-cardtype' id='cardtype' onChange={onSearchChange} value={filterValues.cardtype} >
                    <option key='deckedit-cardtype-1' value={5} >Monster/Spell/Trap</option>
                    <option key='deckedit-cardtype-2' value={1} >Monster</option>
                    <option key='deckedit-cardtype-3' value={2} >Spell</option>
                    <option key='deckedit-cardtype-4' value={4}> Trap</option>
                </select>
                <div className='filtercol' key='deckedit-filtercol-2'>{CardTypes()}</div>

                <select key='deckedit-setcode' id='setcode' onChange={onSearchChange} value={filterValues.setcode} >
                    {[<option key={'u'} value=''>Archetype</option>
                    ].concat(setcodes.map((list, i) => {
                        return <option key={`setcode-${i}`} value={parseInt(list.num)}>{list.name || 'Unknown'}</option>;
                    }))}
                </select>
                <select key='deckedit-release' id='release' onChange={onSearchChange} value={filterValues.release}>
                    {Releases()}
                </select>
                <select key='deckedit-limit' id='limit' onChange={onSearchChange} value={filterValues.limit} >
                    <option value='' key='deckedit-limit-null'>Limit</option>
                    <option value={3} key='deckedit-limit-0'>Unlimited</option>
                    <option value={2} key='deckedit-limit-1'>Semi-Limited</option>
                    <option value={1} key='deckedit-limit-2'>Limited</option>
                    <option value={0} key='deckedit-limit-3'>Forbidden</option>
                </select>
                <input
                    key='deckedit-cardname-input'
                    id='cardname' type='text' placeholder='Name'
                    value={filterValues.cardname}
                    onChange={onSearchChange}
                    onKeyPress={handleKeyPress}
                />
                <input
                    key='deckedit-description-input'
                    id='description' type='text' placeholder='Card Text'
                    value={filterValues.description}
                    onChange={onSearchChange}
                    onKeyPress={handleKeyPress}
                />
                {Stats()}
                <button
                    key='deckedit-clearsearch'
                    type='button'
                    onClick={clearSearch}
                >Reset</button>
            </div>
            {LinkArrows()}
        </div>;
    }

    function SearchBar() {
        return <div className='deckedit-searchbar'>
            <input
                id='cardname'
                type='text'
                placeholder='Search by card name'
                value={filterValues.cardname}
                onChange={onSearchChange}
                onKeyPress={handleKeyPress}
            />
            <button type='button' onClick={() => setAdvancedFiltersOpen(true)}>Advanced Options</button>
            <button type='button' onClick={clearSearch}>Reset</button>
        </div>;
    }

    function AdvancedFilterModal() {
        if (!advancedFiltersOpen) {
            return null;
        }

        return <div id='modal' className='deckedit-modal' style={{ display: 'flex' }}>
            <div className='deckedit-modal-content deckedit-filter-modal-content'>
                <h2>Advanced Options</h2>
                {SearchControls()}
                <div className='deckedit-modal-actions'>
                    <button type='button' onClick={clearSearch}>Reset Filters</button>
                    <button type='button' onClick={() => setAdvancedFiltersOpen(false)}>Close</button>
                </div>
            </div>
        </div>;
    }

    function DeckSearch() {
        return <div id='decksearch'
            onDragOver={function (event, x) {
                event.stopPropagation();
                event.preventDefault();
            }}
            onDrop={onDropExitZone}
        >
            <h2>Search Results</h2>
            <div id='decksearchresults' ref={searchResultsRef} onScroll={searchScroll} >
                <CardCollection source='search' deck={search} />
            </div>
            <div id='decksearchresultsofx'>{`${searchCount} cards found`}</div>
        </div>;
    }

    function CardInfoPanel() {
        const info = cardInfo;
        return <div id='cardinfopanel'>
            <h2>Card Information</h2>
            <div id='cardinformation'><MountedCardInfo controller={info} /></div>
        </div>;
    }

    function BanlistDeckListSelect() {
        const availableDecks = decks.length ? decks : pendingDeckRecords;

        return <div key='deck-banlist-controls' className='deckedit-controls'>
            <div className='filtercol' >
                <h3 key='deck-controls-label' >Deck</h3>
                <h3 key='banlist-controls-label'>Banlist</h3>
            </div>

            <div className='filtercol' >
                <select id='decklist' key='deckedit-decklist-select' onChange={onChange} value={availableDecks.length ? String(selectedDeckIndex) : ''}>
                    {availableDecks.map((list, i) => {
                        const label = deckDisplayName(list, i),
                            key = list?.id || list?._id || `deck-option-${i}-${label}`;

                        return <option key={key} value={i}>{label}</option>;
                    })}
                </select>
                <select id='banlist' key='deckedit-ban;list-select' onChange={onSearchChange} value={filterValues.banlist}>
                    {banlist.map((list, i) => {
                        return <option value={list.name} key={i}>{list.name}</option>;
                    })}
                </select>
                </div>

            <div className='deckedit-menu-anchor' ref={deckMenuRef}>
                <button
                    type='button'
                    className='deckedit-hamburger'
                    aria-expanded={deckMenuOpen}
                    aria-controls='deckedit-deck-menu'
                    aria-label='Open deck menu'
                    onClick={() => setDeckMenuOpen((current) => !current)}
                >
                    <span />
                    <span />
                    <span />
                </button>
                {deckMenuOpen ? <div id='deckedit-deck-menu' className='deckedit-popout-menu'>
                    <h3>Deck Menu</h3>
                    <label className='deckedit-menu-upload'>
                        <span>Upload YDK</span>
                        <input type='file' accept='.ydk' onChange={upload} />
                    </label>
                    <button type='button' onClick={() => runDeckMenuAction(newDeck)}>New Deck</button>
                    <button type='button' onClick={() => runDeckMenuAction(save)}>Save Deck</button>
                    <button type='button' onClick={() => runDeckMenuAction(openSaveAsModal)}>Save As</button>
                    <button type='button' onClick={() => runDeckMenuAction(rename)}>Rename</button>
                    <button type='button' onClick={() => runDeckMenuAction(deleteDeck)}>Delete</button>
                    <button type='button' onClick={() => runDeckMenuAction(clear)}>Clear</button>
                    <button type='button' onClick={() => runDeckMenuAction(sort)}>Sort</button>
                    <button type='button' onClick={() => runDeckMenuAction(shuffle)}>Shuffle</button>
                    <button type='button' onClick={() => runDeckMenuAction(exportDeck)}>Export YDK</button>
                </div> : null}
            </div>
        </div>;
    }

    function DeckArea() {
        return <div id='deckarea' >
            <div id='deckareamain' className='deck-zone deck-zone-main'>
                
                <div
                    className={`deckmetainfo ${marginClass(activeDeck.main)}`}
                    onDragOver={onDragOver}
                    onDrop={onDropDeckZone.bind(this, 'main')}>
                    <CardCollection source='main' deck={activeDeck.main} />
                </div>
            </div>
            <div id='deckareaextra' className='deck-zone deck-zone-extra'>
                
                <div
                    className='deckmetainfo'
                    onDragOver={onDragOver}
                    onDrop={onDropDeckZone.bind(this, 'extra')}>
                    <CardCollection source='extra' deck={activeDeck.extra} />
                </div>
            </div>
            <div id='deckareaside' className='deck-zone deck-zone-side'>
                <h2 >Side Deck</h2>
                <div
                    className='deckmetainfo'
                    onDragOver={onDragOver}
                    onDrop={onDropDeckZone.bind(this, 'side')}>
                    <CardCollection source='side' deck={activeDeck.side} />
                </div>
            </div>
        </div>;
    }

    function SaveAsModal() {
        if (!saveAsOpen) {
            return null;
        }

        return <div id='modal' className='deckedit-modal' style={{ display: 'flex' }}>
            <div className='deckedit-modal-content'>
                <h2>Save Deck As</h2>
                <input
                    id='deckedit-saveas-name'
                    type='text'
                    value={saveAsName}
                    onChange={(event) => {
                        setSaveAsName(event.target.value);
                        if (saveAsError) {
                            setSaveAsError('');
                        }
                    }}
                    onKeyDown={onSaveAsKeyDown}
                    placeholder='Deck Name'
                    autoFocus
                />
                {saveAsError ? <p className='deckedit-modal-error'>{saveAsError}</p> : null}
                <div className='deckedit-modal-actions'>
                    <button type='button' onClick={saveAs}>Save</button>
                    <button type='button' onClick={closeSaveAsModal}>Cancel</button>
                </div>
            </div>
        </div>;
    }

    if (!manifestLoaded || !decksLoaded) {
        return <div id='deckedit-loading' className={`${styles.root} fullscreenloading`}>Loading</div>;
    }

    return <>
        {AdvancedFilterModal()}
        {SaveAsModal()}
        <div id='decksetup' className={styles.root} onDragOver={onDragOver} onDrop={onDropExitZone} >
            <div id='searchfilter' className='deckedit-column deckedit-column-left'>
                <h2>Filter</h2>
                <br />
                {!deckMenuOpen ? <>
                    {SearchBar()}
                </> : null}
                
                {BanlistDeckListSelect()}
                <CardList {...activeDeck} />
            </div>
            <div className='deckedit-column deckedit-column-center'>
                {DeckSearch()}
                {DeckArea()}
            </div>
            <div className='deckedit-column deckedit-column-right'>
                {CardInfoPanel()}
            </div>
        </div>
    </>;
}
