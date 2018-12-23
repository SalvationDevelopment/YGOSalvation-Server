//$('.descInput, .nameInput').on('input', deckEditor.doNewSearch);


var databaseSystem = (function() {
    'use strict';
    var database = [],
        activeBanlist = '',
        banlist = {},
        dbs = {
            'OCGTCG': []
        },
        activedbs = '',
        setcodes,
        status = false,
        completedatabase = [];

    function getBanlist(prop) {
        if (!activeBanlist) {
            activeBanlist = Object.keys(banlist).find(function(list) {
                return list;
            });
        }
        return (prop) ? banlist[activeBanlist][prop] : banlist[activeBanlist].bannedCards;
    }

    /**
     * Filters duplicate, and unprinted cards out
     * @param   {Array[Object]} list of cards.
     * @returns {Array[Object]} filtered list
     */
    function filterCards(list) {
        var map = {},
            result = [],
            filteredCards = [],
            region = banlist[activeBanlist].region;
        list.forEach(function(card) {
            map[card.id] = card;
        });

        Object.keys(map).forEach(function(id) {
            if (banlist[activeBanlist].bannedCards[id] !== undefined) {
                map[id].limit = parseInt(banlist[activeBanlist].bannedCards[id], 10);
            } else {
                map[id].limit = 3;
            }
            result.push(map[id]);
        });

        filteredCards = result.filter(function(card) {
            if (region && banlist[activeBanlist].endDate) {
                if (card[region]) {
                    if (card[region].date) {
                        return new Date(banlist[activeBanlist].endDate).getTime() > new Date(card[region].date).getTime();
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return true;
        });
        return filteredCards;
    }

    /**
     * Exposes the current Database.
     * @returns {Array[Object]} array of cards.
     */
    function getDB() {

        return docardStackSort(database);
    }

    /**
     * Sets the current database based on DB names given.
     * @param   {Array[String]} set array of DB names
     * @returns {Array[Object]}    returns array of cards
     */
    function setDatabase(set) {
        var tokens = [],
            dbsets = set.map(function(dbname) {
                if (dbs[dbname]) {
                    return dbs[dbname];
                } else {
                    return [];
                }
            }),
            listOfCards = dbsets.reduce(function(a, b) {
                return a.concat(b);
            }, []),
            ocgpacks = listOfCards.map(function(card) {
                if (card.ocg) {
                    if (card.ocg.pack_id) {
                        var code = card.ocg.pack_id.split('-');
                        return code[0];
                    }
                    return '';
                }
                return '';
            }),
            tcgpacks = listOfCards.map(function(card) {
                if (card.tcg) {
                    if (card.tcg.pack_id) {
                        var code = card.tcg.pack_id.split('-');
                        return code[0];
                    }
                    return '';
                }
                return '';
            }),
            packs = uniqArrayOfStrings([].concat(tcgpacks, ocgpacks)).filter(function(pack) {
                return (pack && pack.length <= 5);
            }),
            tokenbox = $('#tokendropdown'),
            packsbox = $('.packSelect');
        //console.log(packs.length, tcgpacks, ocgpacks);
        activedbs = set;
        database = filterCards(listOfCards);

        tokens = database.filter(function(card) {
            return (card.type === 16401 || card.type === 16417) && (card.name !== 'DO NOT USE');
        });
        tokens.sort(function(current, next) {
            return current.name > next.name;
        });
        $('#tokendropdown').html('');
        tokens.forEach(function(card) {
            var defaulttext = (card.id === 73915052) ? ' selected ' : ''; // sheep token
            tokenbox.append('<option ' + defaulttext + 'value="' + card.id + '">' + card.name + '</option>');
        });

        packs.forEach(function(set) {
            packsbox.append('<option value="' + set + '">' + set + '</option>');
        });


    }

    function setBanlist(newlist) {
        activeBanlist = newlist;
        setDatabase(activedbs);
        return getBanlist();
    }





    $.getJSON('/manifest/manifest_3-Goats.json', function(data) {

        dbs.Goats = data;
    });
    //    $.getJSON('/manifest/manifest_Z-CWA.json', function (data) {
    //        dbs.CWA = data;
    //    });
    $.getJSON('/manifest/banlist.json', function(data) {
        banlist = data;
        $('.banlistSelect').html('');
        Object.keys(banlist).forEach(function(list) {
            var selected = (banlist[list].primary) ? 'selected' : '';
            if (selected) {
                activeBanlist = list;
            }
            $('.banlistSelect, #creategamebanlist').append('<option ' + selected + ' value="' + list + '">' + list + '</option>');
        });
        $.getJSON('/manifest/manifest_0-en-OCGTCG.json', function(data) {
            dbs.OCGTCG = data;
            completedatabase = dbs.OCGTCG;

            setDatabase(['OCGTCG']);
            $('#deckeditloading').remove();
            if (internalLocal === 'deckedit') {
                deckeditloader();
            }
            if (!window.loggedIn) {
                singlesitenav('home');
            }
            if (localStorage.session) {
                $.getJSON('api/session/' + localStorage.session, function(userInfo) {
                    console.log(userInfo);
                    if (userInfo.success) {
                        processLogin(userInfo.result);
                    }
                });
            }
        });
    });

    $.getJSON('./setcodes.json', 'utf-8', function(data) {
        var raw = data,
            setcodes = Object.keys(raw).map(function(arch) {
                return {
                    num: arch,
                    name: raw[arch]
                };
            }).sort(function(a, b) {
                return (a.name.localeCompare(b.name, undefined, {
                    numeric: true,
                    sensitivity: 'base'
                }));
            }),
            strings = '<option value="0" data-calc="0">Archetype</option>';

        setcodes.forEach(function(setcode) {
            strings = strings + '<option data-calc="' + setcode.num.slice(2) + '" value="' + parseInt(setcode.num, 16) + '">' + setcode.name + '</option>';
        });

        $('.setcodeSelect').html(strings);
    });


    function directLookup(id) {
        var result = {},
            dbuse = dbs.OCGTCG;

        dbuse.some(function(card, index) {
            if (id === card.id) {
                result = card;
                result.date = new Date(result.date).getTime();
                return true;
            } else {
                return false;
            }
        });

        return result;
    }

    return {
        setDatabase: setDatabase,
        dbs: dbs,
        getDB: getDB,
        getBanlist: getBanlist,
        setBanlist: setBanlist,
        directLookup: directLookup
    };
}());

$('.descInput, .nameInput').keypress('input', function(event) {
    'use strict';
    if (event.which === 13) {
        deckEditor.doNewSearch();
    }

});
$('.typeSelect, .monsterCardSelect, .monsterTypeSelect, .spellSelect, .trapSelect, .attributeSelect, .raceSelect, .setcodeSelect, .forbiddenLimitedSelect, .packSelect').on('change', deckEditor.doNewSearch);

$('.atkInput, .defInput, .levelInput, .scaleInput, .searchrange').on('change', deckEditor.doNewSearch);
$('.typeSelect').on('change', function() {
    'use strict';
    var target = $('.typeSelect option:selected').text();
    $('.monsterCardSelect, .monsterTypeSelect, .spellSelect, .trapSelect, .attributeSelect, .raceSelect').css('display', 'none');
    $('.attributeSelectl, .raceSelectl').css('display', 'none');
    switch (target) {
        case 'Monster':
            $('.monsterCardSelect, .monsterTypeSelect, .attributeSelect, .raceSelect').css('display', 'block');
            $('.attributeSelectl, .raceSelectl').css('display', 'block');
            break;
        case 'Spells':
            $('.spellSelect').css('display', 'block');
            break;
        case 'Traps':
            $('.trapSelect').css('display', 'block');
            break;
        default:
            break;
    }
});


$('.databaseSelect').on('change', function() {
    'use strict';
    var newDB = $('.databaseSelect').val();
    databaseSystem.setDatabase([newDB]);
    deckEditor.doNewSearch();
});

$('.banlistSelect').on('change', function() {
    'use strict';
    var newList = $('.banlistSelect').val();
    databaseSystem.setBanlist(newList);
    deckEditor.doNewSearch();
});

$('.deckSelect, #lobbycurrentdeck select').on('change', function() {
    'use strict';
    deckEditor.switchDecks(parseInt($('.deckSelect').val(), 10));
});


function readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    'use strict';
    var f = evt.target.files[0],
        r;

    if (f) {
        r = new FileReader();
        r.onload = function(e) {
            var contents = e.target.result,
                action = false;

            action = confirm('Upload Deck?');
            if (action) {
                deckEditor.upload(contents);
            }

        };
        r.readAsText(f);
    } else {
        alertmodal('Failed to load file');
    }
}

$('#deckupload').on('change', readSingleFile);


$('#deckedit .mainDeck,#deckedit .extraDeck,#deckedit .sideDeck').on('dragover dragleave', function(event) {
    'use strict';
    event.preventDefault();
    event.stopPropagation();
});

$('#deckedit .mainDeck,#deckedit .extraDeck,#deckedit .sideDeck').on('drop', function(event) {
    'use strict';
    event.preventDefault();
    event.stopPropagation();

    var from = deckEditorReference.zone,
        target = $(this).data('dragzone'),
        sameIndex = $(this).data('dropindex');

    if (from === 'search' && ((target === 'main' && !isExtra(deckEditorReference)) || (target === 'extra' && isExtra(deckEditorReference)))) {
        deckEditor.addCardFromSearch(target);

    } else if (target === from) {
        deckEditor.moveInSameZone(from, deckEditorReference.index, sameIndex);
    } else if (target === 'main' && isExtra(deckEditorReference)) {
        return;
    } else if (target === 'extra' && !isExtra(deckEditorReference)) {
        return;
    } else {
        deckEditor.deckEditorMoveTo(target);
    }

    deckEditor.doSearch();
});

deckEditor.loadDecks([deckEditor.makeNewDeck('New Deck')]);