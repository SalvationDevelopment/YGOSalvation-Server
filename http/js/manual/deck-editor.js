/*global currentMousePos, getCardObject, reorientmenu, cardIs, $, internalDB, primus*/
/*jslint bitwise: true, plusplus:true*/


var deckEditorReference = {};

var currentSearchFilter = (function () {
    'use strict';

    function getFilter() {
        return {
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
    }

    var currentSearch = [],
        currentSearchIndex = 0,
        currentSearchPageSize = 40,
        currentFilter = getFilter(),
        render = [];


    //-----------------------
    //FILTERS BEIGN HERE

    //Filters either attribute or race, depending on the value of AT.
    //at =1 is attribute, Else it's race.
    // Num is the value in the DB for a given attribute or race.
    function fAttrRace(obj, num, at) {

        var val = (at === 1) ? obj.Attribute : obj.Type;
        if (val === num) {
            return true;
        } else {
            return false;
        }
    }



    //Lv is the level sought. OP is operation.
    //OP =0 is LESS THAN OR EQUAL lv.
    //OP =1 Is EQUALS lv.
    // Else is HIGHER THAN OR EQUAL
    function fLevel(obj, lv, op) {

        var val = obj.level.toString(16);
        lv = parseInt(lv.toString(16), 10);
        if (op === 0) {
            if (parseInt(val.substr(val.length - 2), 10) <= lv) {
                return true;
            } else {
                return false;
            }
        } else if (op === 1) {
            if (parseInt(val.substr(val.length - 2), 10) === lv) {
                return true;
            } else {
                return false;
            }
        } else {
            if (parseInt(val.substr(val.length - 2), 10) >= lv) {
                return true;
            } else {
                return false;
            }
        }
    }

    // Same as Lv, but with SC as the Scale (Assumes Right=Left)
    function fScale(obj, sc, op) {

        var val = obj.level;
        sc = parseInt(sc.toString(16), 0);
        if (op === 0) {
            if (parseInt((val >> 24).toString(16), 0) <= sc) {
                return true;
            } else {
                return false;
            }
        } else if (op === 1) {
            if (parseInt((val >> 24).toString(16), 0) === sc) {
                return true;
            } else {
                return false;
            }
        } else {
            if (parseInt((val >> 24).toString(16), 0) >= sc) {
                return true;
            } else {
                return false;
            }
        }
    }


    // Uses the monsters full Type value from DB to determine.
    //works  either 1 by 1 or against the sum of Type filters.
    function fType(obj, ty) {

        var val = obj.type;
        if ((val & ty) > 0) {
            return true;
        } else {
            return false;
        }
    }

    //As Level, but for ATK/DEF
    //AD =1 is ATK, Else it's DEF being evaluated.
    // Num is the value to compare against.
    function fAtkDef(obj, num, ad, op) {

        var val = (ad === 1) ? obj.atk : obj.def;
        if (op === 0) {
            if (val <= num) {
                return true;
            } else {
                return false;
            }
        } else if (op === 1) {
            if (val === num) {
                return true;
            } else {
                return false;
            }
        } else {
            if (val >= num) {
                return true;
            } else {
                return false;
            }
        }
    }
    // ND=1 is Name, else Desc. Checks if the TXT string is contained.
    function fNameDesc(obj, txt, nd) {

        var val = (nd === 1) ? obj.name.toLowerCase() : obj.desc.toLowerCase();
        if (val.indexOf(txt.toLowerCase()) >= 0) {
            return true;
        } else {
            return false;
        }
    }

    // Filters cards that have 'txt' in their name.
    function filterName(cardsf, txt) {
        if (txt !== undefined) {

            var output = cardsf.filter(function (item) {
                return fNameDesc(item, txt, 1);
            });
            return output;
        }
        return cardsf;
    }

    //Filters effect or flavor texts for the txt string
    function filterDesc(cardsf, txt) {
        if (txt !== undefined) {

            var output = cardsf.filter(function (item) {
                return fNameDesc(item, txt, 0);
            });
            return output;
        }
        return cardsf;
    }

    // Returns all cards that have all the types input.
    function filterType(cardsf, type) {
        if (type !== undefined) {

            var output = cardsf.filter(function (item) {
                return fType(item, type);
            });
            return output;
        }
        return cardsf;
    }

    //Attribute must matcht he arg.
    function filterAttribute(cardsf, attribute) {
        if (attribute !== undefined) {

            var output = cardsf.filter(function (item) {
                return fAttrRace(item, attribute, 1);
            });
            return output;
        }
        return cardsf;
    }

    //Returns Cards whose race matches the arg.
    function filterRace(cardsf, race) {
        if (race !== undefined) {

            var output = cardsf.filter(function (item) {
                return fAttrRace(item, race, 0);
            });
            return output;
        }
        return cardsf;
    }

    //SC is setcode in decimal. This handles all possible combinations.
    function fSetcode(obj, sc) {

        var val = obj.setcode,
            hexA = val.toString(16),
            hexB = sc.toString(16);
        if (val === sc || parseInt(hexA.substr(hexA.length - 4), 16) === parseInt(hexB, 16) || parseInt(hexA.substr(hexA.length - 2), 16) === parseInt(hexB, 16) || (val >> 16).toString(16) === hexB) {
            return true;
        } else {
            return false;
        }
    }
    //All cards that share at least 1 setcode with the arg.
    function filteSetcode(cardsf, setcode) {
        if (setcode !== undefined) {

            var output = cardsf.filter(function (item) {
                return fSetcode(item, setcode);
            });
            return output;
        }
        return cardsf;
    }

    //OP here functions just as in the previous function.
    //OP=0 is LOWER THAN OR EQUAL to 
    //OP=1 is EQUALS to 
    //Else it's HIGHER THAN OR EQUAL
    function filterAtk(cardsf, atk, op) {
        if (atk !== undefined) {

            var output = cardsf.filter(function (item) {
                return fAtkDef(item, atk, 1, op);
            });
            return output;
        }
        return cardsf;
    }



    //As above, but DEF
    function filterDef(cardsf, def, op) {
        if (def !== undefined) {

            var output = cardsf.filter(function (item) {
                return fAtkDef(item, def, 0, op);
            });
            return output;
        }
        return cardsf;
    }
    //Just Level.. Zzz as Atk/Def
    function filterLevel(cardsf, level, op) {
        if (level !== undefined) {
            var output = cardsf.filter(function (item) {
                return fLevel(item, level, op);
            });
            return output;
        }
        return cardsf;
    }

    function filterSetcode(result, setcode) {
        return result.filter(function (item) {
            return fSetcode(item, setcode);
        });

    }

    function filterScale(result, scale, op) {
        return result.filter(function (item) {
            return fScale(item, scale, op);
        });
    }

    function filterAll(cards, filter) {
        var cardsf = cards;
        cardsf = filterName(cardsf, filter.cardname) || cardsf;
        cardsf = filterDesc(cardsf, filter.description) || cardsf;
        cardsf = filterType(cardsf, filter.type) || cardsf;
        cardsf = filterAttribute(cardsf, filter.attribute) || cardsf;
        cardsf = filterRace(cardsf, filter.race) || cardsf;
        cardsf = filterSetcode(cardsf, filter.setcode) || cardsf;
        cardsf = filterAtk(cardsf, filter.atk, 1) || cardsf;
        cardsf = filterDef(cardsf, filter.def, 1) || cardsf;
        cardsf = filterLevel(cardsf, filter.level, 1) || cardsf;
        cardsf = filterScale(cardsf, filter.scale, 1) || cardsf;
        return cardsf;
    }


    function preformSearch() {
        currentSearch = filterAll(internalDB, currentFilter);
        currentSearchIndex = 0;
    }

    function renderSearch() {
        render = currentSearch.slice(currentSearchIndex, currentSearchPageSize);
        return render;
    }

    function pageForward() {
        var attempted = currentSearchIndex + currentSearchPageSize;
        if (attempted > currentSearch.length) {
            currentSearchIndex = currentSearch.length - currentSearchPageSize;
            renderSearch();
            return;
        }
        currentSearchIndex = attempted;
        renderSearch();
    }

    function pageBack() {
        var attempted = currentSearchIndex - currentSearchPageSize;
        if (0 > attempted) {
            currentSearchIndex = 0;
            renderSearch();
            return;
        }
        currentSearchIndex = attempted;
        renderSearch();
    }

    function setFilter(prop, value) {
        if (!value && value !== 0) {
            return;
        }
        currentFilter[prop] = value;
        preformSearch();
    }

    function clearFilter() {
        currentFilter = getFilter();
        currentSearchIndex = 0;
        preformSearch();
    }

    return {
        render: render,
        setFilter: setFilter,
        clearFilter: clearFilter,
        pageForward: pageForward,
        pageBack: pageBack,
        currentSearchIndex: currentSearchIndex
    };
}());

var deckEditor = (function () {
    'use strict';
    var inmemoryDeck = {},
        usersDecks = [],
        activeIndex = 0;

    function makeBlankDeck(name, username, date) {
        return {
            main: [],
            extra: [],
            side: [],
            name: [],
            creator: username,
            creationDate: date
        };
    }

    function makeNewDeck(name) {
        usersDecks.push(makeBlankDeck(name, localStorage.nickname, new Date()));
        return usersDecks[usersDecks.length - 1];
    }

    function updateDeckSelect() {
        var text = '';
        usersDecks.forEach(function (deck, index) {
            text += '<option data-index=' + index + '>' + deck.name + '</option>';
        });
        return text;
    }

    function makeCard(cards, zone) {
        var html = '';
        cards.forEach(function (card, index) {
            var hardcard = JSON.stringify(card),
                src = 'ygopro/pics/' + card + '.jpg';
            html += '<img class="deckeditcard card" src="http://ygopro.us/' + src + '" data-"' + card + '" onclick = "deckeditonclick(' + index + ', \'' + zone + '\')" / > ';
        });

        $('#deckedit .cardspace .' + zone).html(html);
        //$('#subreveal').width(cards.length * 197);
    }

    function renderDeckZone(deck) {

        makeCard(deck.main, 'main');
        makeCard(deck.extra, 'extra');
        makeCard(deck.side, 'side');

        var floatMarkerMain = '',
            floatMarkerExtra = '',
            floatMarkerSide = '';

        if (deck.main.length > 40) {
            floatMarkerMain = 's50';
        }
        if (deck.main.length > 59) {
            floatMarkerMain = 's60';
        }
        if (deck.extra.length > 10) {
            floatMarkerExtra = 's60';
        }
        if (deck.side.length > 10) {
            floatMarkerSide = 's60';
        }

        $('#deckedit .cardspace .main').attr('floatmarker', floatMarkerMain);
        $('#deckedit .cardspace .extra').attr('floatmarker', floatMarkerExtra);
        $('#deckedit .cardspace .side').attr('floatmarker', floatMarkerSide);
    }


    function doSearch() {
        makeCard(currentSearchFilter.render, 'search');
    }



    function saveDeck() {
        usersDecks[activeIndex] = JSON.parse(JSON.stringify(inmemoryDeck));
        primus.write({
            action: 'saveDeck',
            decks: usersDecks
        });
    }

    function switchDecks(index) {
        activeIndex = index;
        renderDeckZone(usersDecks[activeIndex]);
        inmemoryDeck = JSON.parse(JSON.stringify(usersDecks[activeIndex]));
    }

    function loadDecks(decks) {
        usersDecks = decks || [makeNewDeck('New Deck')];
        switchDecks(activeIndex);
    }



    function clearCurrentDeck() {
        usersDecks[activeIndex] = makeNewDeck(usersDecks[activeIndex].name);
    }

    function deleteDeck() {
        primus.write({
            action: 'deleteDeck',
            decks: usersDecks[activeIndex]
        });
    }

    function moveInArray(array, old_index, new_index) {
        if (new_index >= array.length) {
            var k = new_index - array.length;
            while ((k--) + 1) {
                array.push(undefined);
            }
        }
        array.splice(new_index, 0, array.splice(old_index, 1)[0]);
        return array; // for testing purposes
    }

    function deckEditorMoveTo(deck) {
        moveInArray(inmemoryDeck[deckEditorReference.zone], deckEditorReference.index, 0);
        var card = inmemoryDeck[deckEditorReference.zone].shift();
        inmemoryDeck[deck].push(card);

        renderDeckZone(inmemoryDeck);

    }

    function addCardFromSearch(deck) {
        inmemoryDeck[deck].push(deckEditorReference);
        renderDeckZone(inmemoryDeck);

    }

    return {
        updateDeckSelect: updateDeckSelect
    };
}());


function deckeditonclick(index, zone) {

    'use strict';
    $('#manualcontrols button').css({
        'display': 'none'
    });

    $('#manualcontrols').css({
        'top': currentMousePos.y,
        'left': currentMousePos.x,
        'display': 'block'
    });
    deckEditorReference = {
        id: deckEditor.inmemoryDeck[zone][index],
        zone: zone,
        index: index
    };

    var dbEntry = getCardObject(parseInt(deckEditorReference.id, 10));
    if (deckEditorReference.zone === 'main') {
        $('.de-toside, .de-remove').css({
            'display': 'block'
        });

    }
    if (deckEditorReference.zone === 'extra') {
        $('.de-toside, .de-remove').css({
            'display': 'block'
        });
    }
    if (deckEditorReference.zone === 'side') {
        if (cardIs('xyz', dbEntry) || cardIs('fusion', dbEntry) || cardIs('synchro', dbEntry)) {
            $('.de-toextra, .de-remove').css({
                'display': 'block'
            });
        } else {
            $('.de-tomain, .de-remove').css({
                'display': 'block'
            });
        }
    }
    if (deckEditorReference.zone === 'search') {
        if (cardIs('xyz', dbEntry) || cardIs('fusion', dbEntry) || cardIs('synchro', dbEntry)) {
            $('.de-toextra').css({
                'display': 'block'
            });
        } else {
            $('.de-tomain').css({
                'display': 'block'
            });
        }
    }
    reorientmenu();
    return;
}